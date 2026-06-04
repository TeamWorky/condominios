import { ArgumentMetadata, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { PaykuWebhookController } from './payku-webhook.controller';
import { PaykuWebhookDto } from './dto/payku-webhook.dto';
import { PaymentsService } from './payments.service';

describe('PaykuWebhookController', () => {
  let controller: PaykuWebhookController;

  const mockService = {
    handleWebhook: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [PaykuWebhookController],
      providers: [
        { provide: PaymentsService, useValue: mockService },
      ],
    }).compile();

    controller = module.get<PaykuWebhookController>(PaykuWebhookController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('handleWebhook', () => {
    const payload = {
      transaction_id: 'payku-txn-123',
      payment_key: 'key',
      transaction_key: 'tkey',
      verification_key: 'vkey',
      order: 'payment-1',
      status: 'success' as const,
    };

    it('should process webhook and return received: true', async () => {
      mockService.handleWebhook.mockResolvedValue(undefined);

      const result = await controller.handleWebhook(payload);

      expect(mockService.handleWebhook).toHaveBeenCalledWith(payload);
      expect(result).toEqual({ received: true });
    });

    it('should return received: true even when payment not found', async () => {
      mockService.handleWebhook.mockResolvedValue(undefined);

      const result = await controller.handleWebhook({
        ...payload,
        order: 'non-existent',
      });

      expect(result).toEqual({ received: true });
    });

    it('should return received: true for duplicate webhook calls', async () => {
      mockService.handleWebhook.mockResolvedValue(undefined);

      const result1 = await controller.handleWebhook(payload);
      const result2 = await controller.handleWebhook(payload);

      expect(result1).toEqual({ received: true });
      expect(result2).toEqual({ received: true });
      expect(mockService.handleWebhook).toHaveBeenCalledTimes(2);
    });

    it('should propagate unexpected errors', async () => {
      mockService.handleWebhook.mockRejectedValue(new Error('Database error'));

      await expect(controller.handleWebhook(payload)).rejects.toThrow('Database error');
    });
  });

  // Payku's real urlnotify payload may carry fields beyond the declared six.
  // The webhook must tolerate them (strip, not reject) so a legitimate
  // notification is never rejected with 400 by the global pipe.
  describe('webhook payload validation (extra fields)', () => {
    const validUuid = '550e8400-e29b-41d4-a716-446655440000';
    const metadata: ArgumentMetadata = {
      type: 'body',
      metatype: PaykuWebhookDto,
    };
    const payloadWithExtraFields = {
      transaction_id: 'payku-txn-123',
      payment_key: 'key',
      transaction_key: 'tkey',
      verification_key: 'vkey',
      order: validUuid,
      status: 'success' as const,
      // Fields Payku may add that we do not declare:
      amount: '150000',
      currency: 'CLP',
      subject: 'Common expenses',
    };

    it('lenient webhook pipe accepts extra fields and strips them', async () => {
      const pipe = new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: false,
        transform: true,
      });

      const result = await pipe.transform(payloadWithExtraFields, metadata);

      expect(result.order).toBe(validUuid);
      expect(result.transaction_id).toBe('payku-txn-123');
      expect((result as Record<string, unknown>).amount).toBeUndefined();
      expect((result as Record<string, unknown>).currency).toBeUndefined();
    });

    it('strict global-style pipe would reject the same payload (regression guard)', async () => {
      const strictPipe = new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      });

      await expect(
        strictPipe.transform(payloadWithExtraFields, metadata),
      ).rejects.toThrow();
    });
  });
});
