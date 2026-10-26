import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { IntegrationsService } from '../../integrations/integrations.service';

export interface TheTellerInitiateResponse {
  status: string;
  code: number | string;
  reason?: string;
  token?: string;
  checkout_url?: string;
}

@Injectable()
export class TheTellerService {
  private readonly logger = new Logger(TheTellerService.name);

  constructor(
    private readonly config: ConfigService,
    private readonly integrationsService: IntegrationsService,
  ) {}

  private async getKeys() {
    const dbCreds = await this.integrationsService.getCredentials('theteller');
    const dbConf = await this.integrationsService.getConfig('theteller');
    return {
      apiUser: dbCreds.clientId || this.config.get<string>('THETELLER_API_USER', ''),
      apiKey: dbCreds.clientSecret || this.config.get<string>('THETELLER_API_KEY', ''),
      merchantId: dbConf.merchantId || this.config.get<string>('THETELLER_MERCHANT_ID', ''),
    };
  }

  private isLive(): boolean {
    return (this.config.get<string>('THETELLER_ENV', 'test') || 'test').toLowerCase() === 'live';
  }

  private checkoutBase(): string {
    return (
      this.config.get<string>('THETELLER_CHECKOUT_URL') ||
      (this.isLive() ? 'https://checkout.theteller.net' : 'https://checkout-test.theteller.net')
    );
  }

  private apiBase(): string {
    return (
      this.config.get<string>('THETELLER_BASE_URL') ||
      (this.isLive() ? 'https://prod.theteller.net' : 'https://test.theteller.net')
    );
  }

  async isConfigured(): Promise<boolean> {
    const keys = await this.getKeys();
    return !!keys.apiUser && !!keys.apiKey && !!keys.merchantId;
  }

  private authHeader(apiUser: string, apiKey: string): string {
    return `Basic ${Buffer.from(`${apiUser}:${apiKey}`).toString('base64')}`;
  }

  /** theTeller requires a 12-digit transaction reference */
  generateTransactionId(): string {
    return Date.now().toString().slice(-12);
  }

  async initializePayment(params: {
    amount: number;
    description: string;
    transactionId: string;
    email: string;
    redirectUrl: string;
  }): Promise<TheTellerInitiateResponse> {
    const keys = await this.getKeys();
    if (!keys.apiUser || !keys.apiKey || !keys.merchantId) {
      throw new BadRequestException('theTeller is not configured');
    }

    const body = {
      merchant_id: keys.merchantId,
      transaction_id: params.transactionId,
      desc: params.description,
      // 12-digit zero-padded amount in minor units (pesewas)
      amount: Math.round(params.amount * 100).toString().padStart(12, '0'),
      redirect_url: params.redirectUrl,
      email: params.email,
    };

    const response = await fetch(`${this.checkoutBase()}/initiate`, {
      method: 'POST',
      headers: {
        Authorization: this.authHeader(keys.apiUser, keys.apiKey),
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache',
      },
      body: JSON.stringify(body),
    });

    const data: TheTellerInitiateResponse = await response.json();
    if (data.status !== 'success' || !data.checkout_url) {
      this.logger.error('theTeller initiate failed', data);
      throw new BadRequestException(data.reason || 'theTeller payment initialization failed');
    }

    return data;
  }

  /**
   * GET /v1.1/users/transactions/{transactionId}/status
   * Success shape: { code: '000', status: 'approved', reason, transaction_id, amount }
   */
  async checkPaymentStatus(transactionId: string): Promise<any> {
    const keys = await this.getKeys();
    if (!keys.merchantId) {
      throw new BadRequestException('theTeller is not configured');
    }

    const response = await fetch(
      `${this.apiBase()}/v1.1/users/transactions/${transactionId}/status`,
      {
        headers: {
          'Content-Type': 'application/json',
          'Merchant-Id': keys.merchantId,
          'Cache-Control': 'no-cache',
        },
      },
    );

    return response.json();
  }
}
