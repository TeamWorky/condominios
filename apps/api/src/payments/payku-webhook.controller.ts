import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  ValidationPipe,
  Version,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { Public } from '@condominios/common';
import { PaymentsService } from './payments.service';
import { PaykuWebhookDto } from './dto/payku-webhook.dto';

/**
 * Local pipe for the Payku webhook: Payku's real `urlnotify` payload may carry
 * fields beyond the ones we declare. The global pipe sets
 * `forbidNonWhitelisted: true`, which would reject those legitimate
 * notifications with 400. Here we still whitelist (extra fields are stripped)
 * but do NOT forbid them, so confirmation never fails on an unexpected field.
 */
const webhookValidationPipe = new ValidationPipe({
  whitelist: true,
  forbidNonWhitelisted: false,
  transform: true,
});

@ApiTags('Payments')
@Controller()
export class PaykuWebhookController {
  constructor(private readonly paymentsService: PaymentsService) {}

  // Public by design (R5): Payku calls this without a JWT. Declared explicitly
  // so a future global JWT guard (APP_GUARD) won't silently break confirmation.
  @Public()
  // Stricter rate limit than the global default (100/min): this endpoint is
  // public and reachable by anyone on the internet (CHK035).
  @Throttle({ default: { limit: 10, ttl: 60000 } })
  @Post('payments/webhook/payku')
  @Version('1')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Receive Payku payment webhook notification (public)' })
  @ApiResponse({ status: 200, description: 'Webhook received' })
  async handleWebhook(
    @Body(webhookValidationPipe) payload: PaykuWebhookDto,
  ): Promise<{ received: boolean }> {
    await this.paymentsService.handleWebhook(payload);
    return { received: true };
  }
}
