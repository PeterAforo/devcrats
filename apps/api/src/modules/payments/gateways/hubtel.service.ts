import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { IntegrationsService } from '../../integrations/integrations.service';

export interface HubtelPaymentResponse {
  ResponseCode: string;
  Status: string;
  Data: {
    CheckoutUrl: string;
    CheckoutId: string;
    ClientReference: string;
    CheckoutDirectUrl: string;
    Description: string;
  };
}

export interface HubtelCallbackPayload {
  ResponseCode: string;
  Status: string;
  Data: {
    CheckoutId: string;
    ClientReference: string;
    Amount: number;
    PaymentDetails: {
      MobileNumber?: string;
      PaymentType: string;
      Channel: string;
    };
    Description: string;
  };
}

@Injectable()
export class HubtelService {
  private readonly logger = new Logger(HubtelService.name);
  private readonly baseUrl = 'https://payproxyapi.hubtel.com/items/initiate';

  constructor(
    private readonly config: ConfigService,
    private readonly integrationsService: IntegrationsService,
  ) {}

  private async getKeys() {
    const dbCreds = await this.integrationsService.getCredentials('hubtel');
    const dbConf = await this.integrationsService.getConfig('hubtel');
    return {
      clientId: dbCreds.clientId || this.config.get<string>('HUBTEL_CLIENT_ID', ''),
      clientSecret: dbCreds.clientSecret || this.config.get<string>('HUBTEL_CLIENT_SECRET', ''),
      merchantAccount: dbConf.merchantAccount || this.config.get<string>('HUBTEL_MERCHANT_ACCOUNT', ''),
    };
  }

  async isConfigured(): Promise<boolean> {
    const keys = await this.getKeys();
    return !!keys.clientId && !!keys.clientSecret && !!keys.merchantAccount;
  }

  private getAuthHeader(clientId: string, clientSecret: string): string {
    const credentials = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');
    return `Basic ${credentials}`;
  }

  async initializePayment(params: {
    amount: number;
    description: string;
    clientReference: string;
    customerName?: string;
    customerEmail?: string;
    customerMsisdn?: string;
    callbackUrl: string;
    returnUrl: string;
    cancellationUrl: string;
  }): Promise<HubtelPaymentResponse> {
    const keys = await this.getKeys();
    if (!keys.clientId || !keys.clientSecret) {
      throw new BadRequestException('Hubtel is not configured');
    }

    const body = {
      totalAmount: params.amount,
      description: params.description,
      callbackUrl: params.callbackUrl,
      returnUrl: params.returnUrl,
      cancellationUrl: params.cancellationUrl,
      merchantAccountNumber: keys.merchantAccount,
      clientReference: params.clientReference,
      customerName: params.customerName || '',
      customerEmail: params.customerEmail || '',
      customerMsisdn: params.customerMsisdn || '',
    };

    const response = await fetch(this.baseUrl, {
      method: 'POST',
      headers: {
        Authorization: this.getAuthHeader(keys.clientId, keys.clientSecret),
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();
    if (data.ResponseCode !== '0000') {
      this.logger.error('Hubtel init failed', data);
      throw new BadRequestException(data.Data?.Description || 'Hubtel payment initialization failed');
    }

    return data;
  }

  async checkPaymentStatus(clientReference: string): Promise<any> {
    const keys = await this.getKeys();
    if (!keys.clientId || !keys.clientSecret) {
      throw new BadRequestException('Hubtel is not configured');
    }

    const response = await fetch(
      `https://payproxyapi.hubtel.com/items/${clientReference}/status`,
      {
        headers: {
          Authorization: this.getAuthHeader(keys.clientId, keys.clientSecret),
        },
      },
    );

    return response.json();
  }
}
