import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { IntegrationsService } from '../../integrations/integrations.service';

interface SmsOptions {
  to: string | string[];
  message: string;
  senderId?: string;
}

@Injectable()
export class SmsService {
  private readonly logger = new Logger(SmsService.name);
  private readonly baseUrl = 'https://apps.mnotify.net/smsapi';

  constructor(
    private readonly config: ConfigService,
    private readonly integrationsService: IntegrationsService,
  ) {}

  private async getKeys() {
    const dbCreds = await this.integrationsService.getCredentials('mnotify');
    const dbConf = await this.integrationsService.getConfig('mnotify');
    return {
      apiKey: dbCreds.apiKey || this.config.get<string>('MNOTIFY_API_KEY', ''),
      senderId: dbConf.senderId || this.config.get<string>('MNOTIFY_SENDER_ID', 'EstateIQ'),
    };
  }

  async isConfigured(): Promise<boolean> {
    const { apiKey } = await this.getKeys();
    return !!apiKey;
  }

  async send(options: SmsOptions): Promise<any> {
    const keys = await this.getKeys();
    if (!keys.apiKey) {
      this.logger.warn('SMS service not configured — skipping send');
      this.logger.debug(`Would send SMS to ${options.to}: ${options.message}`);
      return null;
    }

    const recipients = Array.isArray(options.to) ? options.to : [options.to];
    // Clean phone numbers (ensure Ghana format)
    const cleaned = recipients.map((phone) => {
      const digits = phone.replace(/\D/g, '');
      if (digits.startsWith('233')) return digits;
      if (digits.startsWith('0')) return `233${digits.slice(1)}`;
      return `233${digits}`;
    });

    try {
      const params = new URLSearchParams({
        key: keys.apiKey,
        to: cleaned.join(','),
        msg: options.message,
        sender_id: options.senderId || keys.senderId,
      });

      const response = await fetch(`${this.baseUrl}?${params.toString()}`);
      const data = await response.json();

      if (data.status === 'success' || data.code === '1000') {
        this.logger.log(`SMS sent to ${cleaned.join(', ')}`);
        return data;
      }

      this.logger.error('SMS send failed', data);
      return null;
    } catch (error) {
      this.logger.error('SMS send error', error);
      return null;
    }
  }

  // ─── TEMPLATES ───────────────────────────────────────────

  async sendPaymentConfirmation(phone: string, data: {
    name: string;
    amount: number;
    receiptNo: string;
  }): Promise<void> {
    await this.send({
      to: phone,
      message: `Hi ${data.name}, your payment of GHS ${data.amount.toFixed(2)} has been received. Receipt: ${data.receiptNo}. Thank you! — EstateIQ`,
    });
  }

  async sendVisitorArrival(phone: string, data: {
    visitorName: string;
    hostName: string;
  }): Promise<void> {
    await this.send({
      to: phone,
      message: `Hi ${data.hostName}, your visitor ${data.visitorName} has arrived at the gate. — EstateIQ`,
    });
  }

  async sendMaintenanceUpdate(phone: string, data: {
    name: string;
    requestId: string;
    status: string;
  }): Promise<void> {
    await this.send({
      to: phone,
      message: `Hi ${data.name}, your maintenance request #${data.requestId} has been updated to: ${data.status}. — EstateIQ`,
    });
  }

  async sendOtp(phone: string, otp: string): Promise<void> {
    await this.send({
      to: phone,
      message: `Your EstateIQ verification code is: ${otp}. Valid for 10 minutes. Do not share this code.`,
    });
  }
}
