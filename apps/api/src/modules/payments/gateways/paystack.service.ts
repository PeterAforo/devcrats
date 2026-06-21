import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { IntegrationsService } from '../../integrations/integrations.service';
import * as crypto from 'crypto';

export interface PaystackInitResponse {
  status: boolean;
  message: string;
  data: {
    authorization_url: string;
    access_code: string;
    reference: string;
  };
}

export interface PaystackVerifyResponse {
  status: boolean;
  message: string;
  data: {
    id: number;
    status: string;
    reference: string;
    amount: number;
    currency: string;
    channel: string;
    paid_at: string;
    customer: { email: string; first_name: string; last_name: string };
    metadata: Record<string, any>;
  };
}

@Injectable()
export class PaystackService {
  private readonly logger = new Logger(PaystackService.name);
  private readonly baseUrl = 'https://api.paystack.co';

  constructor(
    private readonly config: ConfigService,
    private readonly integrationsService: IntegrationsService,
  ) {}

  private async getKeys() {
    const dbCreds = await this.integrationsService.getCredentials('paystack');
    return {
      secretKey: dbCreds.secretKey || this.config.get<string>('PAYSTACK_SECRET_KEY', ''),
      publicKey: dbCreds.publicKey || this.config.get<string>('PAYSTACK_PUBLIC_KEY', ''),
    };
  }

  async isConfigured(): Promise<boolean> {
    const { secretKey } = await this.getKeys();
    return !!secretKey && secretKey.startsWith('sk_');
  }

  async initializeTransaction(params: {
    email: string;
    amount: number; // in pesewas (GHS * 100)
    reference: string;
    callbackUrl?: string;
    metadata?: Record<string, any>;
    channels?: string[];
  }): Promise<PaystackInitResponse> {
    const { secretKey } = await this.getKeys();
    if (!secretKey) {
      throw new BadRequestException('Paystack is not configured');
    }

    const dbConf = await this.integrationsService.getConfig('paystack');
    const body = {
      email: params.email,
      amount: params.amount,
      reference: params.reference,
      callback_url: params.callbackUrl || dbConf.callbackUrl || this.config.get('PAYSTACK_CALLBACK_URL'),
      metadata: params.metadata || {},
      channels: params.channels || ['card', 'bank', 'mobile_money'],
      currency: 'GHS',
    };

    const response = await fetch(`${this.baseUrl}/transaction/initialize`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${secretKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();
    if (!data.status) {
      this.logger.error('Paystack init failed', data);
      throw new BadRequestException(data.message || 'Payment initialization failed');
    }

    return data;
  }

  async verifyTransaction(reference: string): Promise<PaystackVerifyResponse> {
    const { secretKey } = await this.getKeys();
    if (!secretKey) {
      throw new BadRequestException('Paystack is not configured');
    }

    const response = await fetch(`${this.baseUrl}/transaction/verify/${reference}`, {
      headers: {
        Authorization: `Bearer ${secretKey}`,
      },
    });

    const data = await response.json();
    return data;
  }

  async validateWebhookSignature(body: string, signature: string): Promise<boolean> {
    const { secretKey } = await this.getKeys();
    if (!secretKey) return false;
    const hash = crypto
      .createHmac('sha512', secretKey)
      .update(body)
      .digest('hex');
    return hash === signature;
  }
}
