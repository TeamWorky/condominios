import { Test, TestingModule } from '@nestjs/testing';
import { PaykuWebhookController } from './payku-webhook.controller';
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
});
