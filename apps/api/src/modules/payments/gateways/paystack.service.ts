import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
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
  private readonly secretKey: string;
  private readonly publicKey: string;
  private readonly baseUrl = 'https://api.paystack.co';

  constructor(private readonly config: ConfigService) {
    this.secretKey = this.config.get<string>('PAYSTACK_SECRET_KEY', '');
    this.publicKey = this.config.get<string>('PAYSTACK_PUBLIC_KEY', '');
  }

  get isConfigured(): boolean {
    return !!this.secretKey && this.secretKey.startsWith('sk_');
  }

  async initializeTransaction(params: {
    email: string;
    amount: number; // in pesewas (GHS * 100)
    reference: string;
    callbackUrl?: string;
    metadata?: Record<string, any>;
    channels?: string[];
  }): Promise<PaystackInitResponse> {
    if (!this.isConfigured) {
      throw new BadRequestException('Paystack is not configured');
    }

    const body = {
      email: params.email,
      amount: params.amount,
      reference: params.reference,
      callback_url: params.callbackUrl || this.config.get('PAYSTACK_CALLBACK_URL'),
      metadata: params.metadata || {},
      channels: params.channels || ['card', 'bank', 'mobile_money'],
      currency: 'GHS',
    };

    const response = await fetch(`${this.baseUrl}/transaction/initialize`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.secretKey}`,
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
    if (!this.isConfigured) {
      throw new BadRequestException('Paystack is not configured');
    }

    const response = await fetch(`${this.baseUrl}/transaction/verify/${reference}`, {
      headers: {
        Authorization: `Bearer ${this.secretKey}`,
      },
    });

    const data = await response.json();
    return data;
  }

  validateWebhookSignature(body: string, signature: string): boolean {
    const hash = crypto
      .createHmac('sha512', this.secretKey)
      .update(body)
      .digest('hex');
    return hash === signature;
  }
}
