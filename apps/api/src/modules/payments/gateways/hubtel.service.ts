import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

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
  private readonly clientId: string;
  private readonly clientSecret: string;
  private readonly merchantAccountNumber: string;
  private readonly baseUrl = 'https://payproxyapi.hubtel.com/items/initiate';

  constructor(private readonly config: ConfigService) {
    this.clientId = this.config.get<string>('HUBTEL_CLIENT_ID', '');
    this.clientSecret = this.config.get<string>('HUBTEL_CLIENT_SECRET', '');
    this.merchantAccountNumber = this.config.get<string>('HUBTEL_MERCHANT_ACCOUNT', '');
  }

  get isConfigured(): boolean {
    return !!this.clientId && !!this.clientSecret && !!this.merchantAccountNumber;
  }

  private getAuthHeader(): string {
    const credentials = Buffer.from(`${this.clientId}:${this.clientSecret}`).toString('base64');
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
    if (!this.isConfigured) {
      throw new BadRequestException('Hubtel is not configured');
    }

    const body = {
      totalAmount: params.amount,
      description: params.description,
      callbackUrl: params.callbackUrl,
      returnUrl: params.returnUrl,
      cancellationUrl: params.cancellationUrl,
      merchantAccountNumber: this.merchantAccountNumber,
      clientReference: params.clientReference,
      customerName: params.customerName || '',
      customerEmail: params.customerEmail || '',
      customerMsisdn: params.customerMsisdn || '',
    };

    const response = await fetch(this.baseUrl, {
      method: 'POST',
      headers: {
        Authorization: this.getAuthHeader(),
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
    if (!this.isConfigured) {
      throw new BadRequestException('Hubtel is not configured');
    }

    const response = await fetch(
      `https://payproxyapi.hubtel.com/items/${clientReference}/status`,
      {
        headers: {
          Authorization: this.getAuthHeader(),
        },
      },
    );

    return response.json();
  }
}
