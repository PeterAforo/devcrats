import { Injectable, Logger, NotFoundException, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../prisma/prisma.service';

// Built-in integrations seeded on first run
const BUILT_IN_INTEGRATIONS = [
  { provider: 'paystack', category: 'payment', displayName: 'Paystack', description: 'Accept card, mobile money, and bank payments via Paystack', credentialKeys: ['publicKey', 'secretKey'], configKeys: ['callbackUrl'] },
  { provider: 'hubtel', category: 'payment', displayName: 'Hubtel Payment Gateway', description: 'Accept MTN, Vodafone, AirtelTigo mobile money and card payments', credentialKeys: ['clientId', 'clientSecret'], configKeys: ['merchantAccount', 'callbackUrl'] },
  { provider: 'resend', category: 'email', displayName: 'Resend (Email)', description: 'Transactional emails — receipts, password resets, notifications', credentialKeys: ['apiKey'], configKeys: ['fromEmail', 'fromName'] },
  { provider: 'mnotify', category: 'sms', displayName: 'mNotify SMS', description: 'Send SMS notifications to tenants and staff (Ghana)', credentialKeys: ['apiKey'], configKeys: ['senderId'] },
  { provider: 'google_maps', category: 'maps', displayName: 'Google Maps', description: 'Estate location mapping and address autocomplete', credentialKeys: ['apiKey'], configKeys: [] },
];

@Injectable()
export class IntegrationsService implements OnModuleInit {
  private readonly logger = new Logger(IntegrationsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
  ) {}

  async onModuleInit() {
    await this.seedBuiltIns();
  }

  /** Seed built-in integrations if they don't exist, load env-var defaults */
  private async seedBuiltIns() {
    for (const bi of BUILT_IN_INTEGRATIONS) {
      const existing = await this.prisma.integration.findUnique({ where: { provider: bi.provider } });
      if (existing) continue;

      // Pre-fill credentials from env vars if available
      const creds: Record<string, string> = {};
      const conf: Record<string, string> = {};

      if (bi.provider === 'paystack') {
        creds.publicKey = this.configService.get('PAYSTACK_PUBLIC_KEY', '');
        creds.secretKey = this.configService.get('PAYSTACK_SECRET_KEY', '');
        conf.callbackUrl = this.configService.get('PAYSTACK_CALLBACK_URL', '');
      } else if (bi.provider === 'hubtel') {
        creds.clientId = this.configService.get('HUBTEL_CLIENT_ID', '');
        creds.clientSecret = this.configService.get('HUBTEL_CLIENT_SECRET', '');
        conf.merchantAccount = this.configService.get('HUBTEL_MERCHANT_ACCOUNT', '');
      } else if (bi.provider === 'resend') {
        creds.apiKey = this.configService.get('RESEND_API_KEY', '');
        conf.fromEmail = this.configService.get('EMAIL_FROM', 'noreply@estateiq.app');
        conf.fromName = this.configService.get('EMAIL_FROM_NAME', 'EstateIQ');
      } else if (bi.provider === 'mnotify') {
        creds.apiKey = this.configService.get('MNOTIFY_API_KEY', '');
        conf.senderId = this.configService.get('MNOTIFY_SENDER_ID', 'EstateIQ');
      } else if (bi.provider === 'google_maps') {
        creds.apiKey = this.configService.get('GOOGLE_MAPS_API_KEY', '');
      }

      const hasAnyKey = Object.values(creds).some((v) => !!v);

      await this.prisma.integration.create({
        data: {
          provider: bi.provider,
          category: bi.category,
          displayName: bi.displayName,
          description: bi.description,
          isActive: hasAnyKey,
          isSandbox: true,
          isBuiltIn: true,
          credentials: creds,
          config: conf,
        },
      });
      this.logger.log(`Seeded integration: ${bi.provider}`);
    }
  }

  // ─── PUBLIC API ────────────────────────────────────────────

  async getAll() {
    const integrations = await this.prisma.integration.findMany({ orderBy: [{ category: 'asc' }, { displayName: 'asc' }] });
    return integrations.map((i: any) => this.maskCredentials(i));
  }

  async getByCategory(category: string) {
    const integrations = await this.prisma.integration.findMany({ where: { category }, orderBy: { displayName: 'asc' } });
    return integrations.map((i: any) => this.maskCredentials(i));
  }

  async get(provider: string) {
    const integration = await this.prisma.integration.findUnique({ where: { provider } });
    if (!integration) throw new NotFoundException(`Integration '${provider}' not found`);
    return this.maskCredentials(integration);
  }

  async update(provider: string, dto: { credentials?: Record<string, string>; config?: Record<string, string>; isActive?: boolean; isSandbox?: boolean }) {
    const existing = await this.prisma.integration.findUnique({ where: { provider } });
    if (!existing) throw new NotFoundException(`Integration '${provider}' not found`);

    // Merge credentials — only overwrite non-empty values (so UI doesn't clobber with masked strings)
    const currentCreds = (existing.credentials as Record<string, string>) || {};
    const newCreds = dto.credentials || {};
    const mergedCreds: Record<string, string> = { ...currentCreds };
    for (const [k, v] of Object.entries(newCreds)) {
      if (v && !v.includes('•')) mergedCreds[k] = v; // skip masked values
    }

    const currentConf = (existing.config as Record<string, string>) || {};
    const mergedConf = { ...currentConf, ...(dto.config || {}) };

    const updated = await this.prisma.integration.update({
      where: { provider },
      data: {
        credentials: mergedCreds,
        config: mergedConf,
        isActive: dto.isActive ?? existing.isActive,
        isSandbox: dto.isSandbox ?? existing.isSandbox,
      },
    });

    return this.maskCredentials(updated);
  }

  async toggle(provider: string, isActive: boolean) {
    const updated = await this.prisma.integration.update({
      where: { provider },
      data: { isActive },
    });
    return { provider: updated.provider, isActive: updated.isActive };
  }

  /** Create a custom (user-defined) integration */
  async create(dto: { provider: string; category: string; displayName: string; description?: string; credentials?: Record<string, string>; config?: Record<string, string> }) {
    const integration = await this.prisma.integration.create({
      data: {
        provider: dto.provider.toLowerCase().replace(/\s+/g, '_'),
        category: dto.category || 'custom',
        displayName: dto.displayName,
        description: dto.description || '',
        isBuiltIn: false,
        isActive: false,
        isSandbox: true,
        credentials: dto.credentials || {},
        config: dto.config || {},
      },
    });
    return this.maskCredentials(integration);
  }

  /** Delete a custom integration (built-ins cannot be deleted) */
  async remove(provider: string) {
    const existing = await this.prisma.integration.findUnique({ where: { provider } });
    if (!existing) throw new NotFoundException(`Integration '${provider}' not found`);
    if (existing.isBuiltIn) throw new NotFoundException('Built-in integrations cannot be deleted');
    await this.prisma.integration.delete({ where: { provider } });
    return { deleted: true };
  }

  // ─── INTERNAL: used by gateway services to get raw keys ────

  async getCredentials(provider: string): Promise<Record<string, string>> {
    const integration = await this.prisma.integration.findUnique({ where: { provider } });
    if (!integration || !integration.isActive) return {};
    return (integration.credentials as Record<string, string>) || {};
  }

  async getConfig(provider: string): Promise<Record<string, string>> {
    const integration = await this.prisma.integration.findUnique({ where: { provider } });
    if (!integration) return {};
    return (integration.config as Record<string, string>) || {};
  }

  async isActive(provider: string): Promise<boolean> {
    const integration = await this.prisma.integration.findUnique({ where: { provider } });
    return !!integration?.isActive;
  }

  // ─── HELPERS ───────────────────────────────────────────────

  private maskCredentials(integration: any) {
    const creds = (integration.credentials as Record<string, string>) || {};
    const masked: Record<string, string> = {};
    for (const [k, v] of Object.entries(creds)) {
      if (v && v.length > 6) {
        masked[k] = v.slice(0, 4) + '•'.repeat(Math.min(v.length - 4, 20));
      } else if (v) {
        masked[k] = '•'.repeat(v.length);
      } else {
        masked[k] = '';
      }
    }
    return { ...integration, credentials: masked };
  }
}
