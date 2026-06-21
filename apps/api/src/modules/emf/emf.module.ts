import { Module } from '@nestjs/common';
import { PrismaModule } from '../../prisma/prisma.module';
import { EmfController } from './emf.controller';
import { EmfService } from './emf.service';

@Module({
  imports: [PrismaModule],
  controllers: [EmfController],
  providers: [EmfService],
  exports: [EmfService],
})
export class EmfModule {}
