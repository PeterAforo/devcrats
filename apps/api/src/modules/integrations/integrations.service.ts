import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export interface IntegrationConfig {
  provider: string;
  apiKey?: string;
  secretKey?: string;
  isActive: boolean;
  config?: Record<string, any>;
}

@Injectable()
export class IntegrationsService {
  private integrations: Map<string, IntegrationConfig> = new Map();

  constructor(private readonly configService: ConfigService) {
    // Load from env / DB in production
    this.integrations.set('hubtel', {
      provider: 'hubtel',
      apiKey: this.configService.get('HUBTEL_API_KEY', ''),
      secretKey: this.configService.get('HUBTEL_SECRET_KEY', ''),
      isActive: false,
    });
    this.integrations.set('paystack', {
      provider: 'paystack',
      apiKey: this.configService.get('PAYSTACK_SECRET_KEY', ''),
      isActive: false,
    });
    this.integrations.set('mnotify', {
      provider: 'mnotify',
      apiKey: this.configService.get('MNOTIFY_API_KEY', ''),
      isActive: false,
    });
    this.integrations.set('google_maps', {
      provider: 'google_maps',
      apiKey: this.configService.get('GOOGLE_MAPS_API_KEY', ''),
      isActive: false,
    });
  }

  getAll(): IntegrationConfig[] {
    return Array.from(this.integrations.values()).map((i) => ({
      ...i,
      apiKey: i.apiKey ? `${i.apiKey.slice(0, 6)}...` : undefined,
      secretKey: undefined,
    }));
  }

  get(provider: string): IntegrationConfig | undefined {
    return this.integrations.get(provider);
  }

  update(provider: string, config: Partial<IntegrationConfig>) {
    const existing = this.integrations.get(provider);
    if (!existing) return null;
    const updated = { ...existing, ...config };
    this.integrations.set(provider, updated);
    return { ...updated, apiKey: updated.apiKey ? `${updated.apiKey.slice(0, 6)}...` : undefined, secretKey: undefined };
  }

  toggle(provider: string, isActive: boolean) {
    const existing = this.integrations.get(provider);
    if (!existing) return null;
    existing.isActive = isActive;
    this.integrations.set(provider, existing);
    return { provider, isActive };
  }
}
