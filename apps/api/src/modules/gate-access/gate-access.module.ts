import { Module } from '@nestjs/common';
import { GateAccessController } from './gate-access.controller';
import { GateAccessService } from './gate-access.service';

@Module({
  controllers: [GateAccessController],
  providers: [GateAccessService],
  exports: [GateAccessService],
})
export class GateAccessModule {}
