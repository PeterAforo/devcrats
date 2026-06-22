import { Controller, Get } from '@nestjs/common';
import { Public } from './common/decorators/public.decorator';

@Controller()
export class HealthController {
  @Public()
  @Get()
  health() {
    return {
      status: 'ok',
      service: 'EstateIQ API',
      version: '1.0.0',
      timestamp: new Date().toISOString(),
    };
  }
}
