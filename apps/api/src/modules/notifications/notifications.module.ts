import { Global, Module } from '@nestjs/common';
import { NotificationsController } from './notifications.controller';
import { NotificationsService } from './notifications.service';
import { NotificationsGateway } from './notifications.gateway';
import { EmailService } from './channels/email.service';
import { SmsService } from './channels/sms.service';
import { IntegrationsModule } from '../integrations/integrations.module';

@Global()
@Module({
  imports: [IntegrationsModule],
  controllers: [NotificationsController],
  providers: [NotificationsService, NotificationsGateway, EmailService, SmsService],
  exports: [NotificationsService, NotificationsGateway, EmailService, SmsService],
})
export class NotificationsModule {}
