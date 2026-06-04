import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Version,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { PaymentsService } from './payments.service';
import { PaykuWebhookDto } from './dto/payku-webhook.dto';

@ApiTags('Payments')
@Controller()
export class PaykuWebhookController {
  constructor(private readonly paymentsService: PaymentsService) {}

  // Stricter rate limit than the global default (100/min): this endpoint is
  // public and reachable by anyone on the internet (CHK035).
  @Throttle({ default: { limit: 10, ttl: 60000 } })
  @Post('payments/webhook/payku')
  @Version('1')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Receive Payku payment webhook notification (public)' })
  @ApiResponse({ status: 200, description: 'Webhook received' })
  async handleWebhook(
    @Body() payload: PaykuWebhookDto,
  ): Promise<{ received: boolean }> {
    await this.paymentsService.handleWebhook(payload);
    return { received: true };
  }
}
