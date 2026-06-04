import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Payment } from './entities/payment.entity';
import { PaymentsController } from './payments.controller';
import { PaykuWebhookController } from './payku-webhook.controller';
import { PaymentsService } from './payments.service';
import { UnitsModule } from '../units/units.module';

@Module({
  imports: [TypeOrmModule.forFeature([Payment]), UnitsModule],
  controllers: [PaymentsController, PaykuWebhookController],
  providers: [PaymentsService],
  exports: [PaymentsService],
})
export class PaymentsModule {}
