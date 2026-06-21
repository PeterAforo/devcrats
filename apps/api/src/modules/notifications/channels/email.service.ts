import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

interface EmailOptions {
  to: string | string[];
  subject: string;
  html: string;
  from?: string;
  replyTo?: string;
}

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private readonly apiKey: string;
  private readonly fromEmail: string;
  private readonly fromName: string;
  private readonly baseUrl = 'https://api.resend.com';

  constructor(private readonly config: ConfigService) {
    this.apiKey = this.config.get<string>('RESEND_API_KEY', '');
    this.fromEmail = this.config.get<string>('EMAIL_FROM', 'noreply@estateiq.app');
    this.fromName = this.config.get<string>('EMAIL_FROM_NAME', 'EstateIQ');
  }

  get isConfigured(): boolean {
    return !!this.apiKey && this.apiKey.startsWith('re_');
  }

  async send(options: EmailOptions): Promise<{ id: string } | null> {
    if (!this.isConfigured) {
      this.logger.warn('Email service not configured — skipping send');
      this.logger.debug(`Would send email to ${options.to}: ${options.subject}`);
      return null;
    }

    try {
      const response = await fetch(`${this.baseUrl}/emails`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: options.from || `${this.fromName} <${this.fromEmail}>`,
          to: Array.isArray(options.to) ? options.to : [options.to],
          subject: options.subject,
          html: options.html,
          reply_to: options.replyTo,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        this.logger.error('Email send failed', data);
        return null;
      }

      this.logger.log(`Email sent to ${options.to}: ${options.subject} (ID: ${data.id})`);
      return data;
    } catch (error) {
      this.logger.error('Email send error', error);
      return null;
    }
  }

  // ─── TEMPLATES ───────────────────────────────────────────

  async sendPasswordReset(email: string, resetToken: string, firstName: string): Promise<void> {
    const frontendUrl = this.config.get('FRONTEND_URL', 'https://devcrats-api.vercel.app');
    const resetLink = `${frontendUrl}/reset-password?token=${resetToken}`;

    await this.send({
      to: email,
      subject: 'Reset your EstateIQ password',
      html: `
        <div style="font-family:sans-serif;max-width:500px;margin:0 auto;padding:32px;">
          <div style="text-align:center;margin-bottom:24px;">
            <div style="display:inline-block;background:#C5A55A;border-radius:8px;padding:8px 16px;">
              <span style="color:#1a2332;font-weight:bold;font-size:18px;">EQ</span>
            </div>
          </div>
          <h2 style="color:#1a2332;margin-bottom:8px;">Reset your password</h2>
          <p style="color:#555;">Hi ${firstName},</p>
          <p style="color:#555;">You requested a password reset for your EstateIQ account. Click the button below to set a new password:</p>
          <div style="text-align:center;margin:24px 0;">
            <a href="${resetLink}" style="display:inline-block;background:#C5A55A;color:#1a2332;padding:12px 32px;border-radius:6px;text-decoration:none;font-weight:bold;">
              Reset Password
            </a>
          </div>
          <p style="color:#888;font-size:13px;">This link expires in 1 hour. If you didn't request this, you can safely ignore this email.</p>
          <hr style="border:none;border-top:1px solid #eee;margin:24px 0;">
          <p style="color:#aaa;font-size:12px;text-align:center;">EstateIQ — Smart Estate Management</p>
        </div>
      `,
    });
  }

  async sendPaymentReceipt(email: string, data: {
    firstName: string;
    receiptNumber: string;
    amount: number;
    method: string;
    description: string;
    date: string;
    unit: string;
  }): Promise<void> {
    await this.send({
      to: email,
      subject: `Payment Receipt — ${data.receiptNumber}`,
      html: `
        <div style="font-family:sans-serif;max-width:500px;margin:0 auto;padding:32px;">
          <div style="text-align:center;margin-bottom:24px;">
            <div style="display:inline-block;background:#C5A55A;border-radius:8px;padding:8px 16px;">
              <span style="color:#1a2332;font-weight:bold;font-size:18px;">EQ</span>
            </div>
          </div>
          <h2 style="color:#1a2332;margin-bottom:8px;">Payment Received</h2>
          <p style="color:#555;">Hi ${data.firstName},</p>
          <p style="color:#555;">Your payment has been confirmed. Here's your receipt:</p>
          <div style="background:#f9f9f9;border:1px solid #eee;border-radius:8px;padding:16px;margin:16px 0;">
            <table style="width:100%;font-size:14px;color:#333;">
              <tr><td style="padding:4px 0;color:#888;">Receipt No.</td><td style="text-align:right;font-weight:bold;">${data.receiptNumber}</td></tr>
              <tr><td style="padding:4px 0;color:#888;">Amount</td><td style="text-align:right;font-weight:bold;color:#16a34a;">GH₵ ${data.amount.toLocaleString()}</td></tr>
              <tr><td style="padding:4px 0;color:#888;">Description</td><td style="text-align:right;">${data.description}</td></tr>
              <tr><td style="padding:4px 0;color:#888;">Method</td><td style="text-align:right;">${data.method}</td></tr>
              <tr><td style="padding:4px 0;color:#888;">Unit</td><td style="text-align:right;">${data.unit}</td></tr>
              <tr><td style="padding:4px 0;color:#888;">Date</td><td style="text-align:right;">${data.date}</td></tr>
            </table>
          </div>
          <p style="color:#555;font-size:13px;">You can view your full receipt on your dashboard.</p>
          <hr style="border:none;border-top:1px solid #eee;margin:24px 0;">
          <p style="color:#aaa;font-size:12px;text-align:center;">EstateIQ — Smart Estate Management</p>
        </div>
      `,
    });
  }

  async sendWelcome(email: string, firstName: string, tempPassword?: string): Promise<void> {
    const frontendUrl = this.config.get('FRONTEND_URL', 'https://devcrats-api.vercel.app');

    await this.send({
      to: email,
      subject: 'Welcome to EstateIQ',
      html: `
        <div style="font-family:sans-serif;max-width:500px;margin:0 auto;padding:32px;">
          <div style="text-align:center;margin-bottom:24px;">
            <div style="display:inline-block;background:#C5A55A;border-radius:8px;padding:8px 16px;">
              <span style="color:#1a2332;font-weight:bold;font-size:18px;">EQ</span>
            </div>
          </div>
          <h2 style="color:#1a2332;">Welcome to EstateIQ, ${firstName}!</h2>
          <p style="color:#555;">Your account has been created. You can now access your estate dashboard.</p>
          ${tempPassword ? `<div style="background:#fff3cd;border:1px solid #ffc107;border-radius:6px;padding:12px;margin:16px 0;"><p style="margin:0;font-size:13px;">Your temporary password: <strong>${tempPassword}</strong><br>Please change it after logging in.</p></div>` : ''}
          <div style="text-align:center;margin:24px 0;">
            <a href="${frontendUrl}/login" style="display:inline-block;background:#C5A55A;color:#1a2332;padding:12px 32px;border-radius:6px;text-decoration:none;font-weight:bold;">
              Login to Dashboard
            </a>
          </div>
          <hr style="border:none;border-top:1px solid #eee;margin:24px 0;">
          <p style="color:#aaa;font-size:12px;text-align:center;">EstateIQ — Smart Estate Management</p>
        </div>
      `,
    });
  }
}
