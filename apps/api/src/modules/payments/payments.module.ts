import { Module } from '@nestjs/common';
import { PaymentsController } from './payments.controller';
import { PaymentsWebhookController } from './payments-webhook.controller';
import { PaymentsService } from './payments.service';
import { PaystackService } from './gateways/paystack.service';
import { HubtelService } from './gateways/hubtel.service';
import { IntegrationsModule } from '../integrations/integrations.module';

@Module({
  imports: [IntegrationsModule],
  controllers: [PaymentsController, PaymentsWebhookController],
  providers: [PaymentsService, PaystackService, HubtelService],
  exports: [PaymentsService, PaystackService, HubtelService],
})
export class PaymentsModule {}
