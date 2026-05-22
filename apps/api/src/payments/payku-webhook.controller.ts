import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  UseGuards,
  Version,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { PaymentsService } from './payments.service';
import { PaykuWebhookDto } from './dto/payku-webhook.dto';
import { JwtAuthGuard } from '@condominios/common/guards/jwt-auth.guard';
import { MinRoleGuard } from '@condominios/common/guards/min-role.guard';
import { Public } from '@condominios/common/decorators/public.decorator';

@ApiTags('Payments')
@Controller()
@UseGuards(JwtAuthGuard, MinRoleGuard)
export class PaykuWebhookController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post('payments/webhook/payku')
  @Version('1')
  @Public()
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
