import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './modules/auth/auth.module';
import { EstatesModule } from './modules/estates/estates.module';
import { PersonsModule } from './modules/persons/persons.module';
import { PaymentsModule } from './modules/payments/payments.module';
import { MaintenanceModule } from './modules/maintenance/maintenance.module';
import { ComplaintsModule } from './modules/complaints/complaints.module';
import { VisitorsModule } from './modules/visitors/visitors.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { IntegrationsModule } from './modules/integrations/integrations.module';
import { DashboardModule } from './modules/dashboard/dashboard.module';
import { UploadsModule } from './modules/uploads/uploads.module';
import { ReceiptsModule } from './modules/receipts/receipts.module';
import { EmfModule } from './modules/emf/emf.module';
import { StaffModule } from './modules/staff/staff.module';
import { GateAccessModule } from './modules/gate-access/gate-access.module';
import { JwtAuthGuard } from './common/guards/jwt-auth.guard';
import { RolesGuard } from './common/guards/roles.guard';
import { HealthController } from './health.controller';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ThrottlerModule.forRoot([{ ttl: 60000, limit: 100 }]),
    PrismaModule,
    AuthModule,
    EstatesModule,
    PersonsModule,
    PaymentsModule,
    MaintenanceModule,
    ComplaintsModule,
    VisitorsModule,
    NotificationsModule,
    IntegrationsModule,
    DashboardModule,
    UploadsModule,
    ReceiptsModule,
    EmfModule,
    StaffModule,
    GateAccessModule,
  ],
  controllers: [HealthController],
  providers: [
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    { provide: APP_GUARD, useClass: RolesGuard },
    { provide: APP_GUARD, useClass: ThrottlerGuard },
  ],
})
export class AppModule {}
