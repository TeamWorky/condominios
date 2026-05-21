import { Test, TestingModule } from '@nestjs/testing';
import { PaymentsController } from './payments.controller';
import { PaymentsService } from './payments.service';
import { Payment } from './entities/payment.entity';
import { PaymentStatus } from '@condominios/shared/enums/payment-status.enum';
import { PaymentMethod } from '@condominios/shared/enums/payment-method.enum';
import {
  NotFoundException,
  BusinessException,
} from '@condominios/common/exceptions/business.exception';

describe('PaymentsController', () => {
  let controller: PaymentsController;
  let service: jest.Mocked<PaymentsService>;

  const createMockPayment = (overrides?: Partial<Payment>): Payment => {
    const payment = new Payment();
    payment.id = overrides?.id || 'payment-1';
    payment.amount = overrides?.amount ?? 150000;
    payment.period = overrides?.period || '2026-01';
    payment.dueDate = overrides?.dueDate || new Date('2026-01-31');
    payment.paidDate = overrides?.paidDate || null;
    payment.status = overrides?.status || PaymentStatus.PENDING;
    payment.paymentMethod = overrides?.paymentMethod || null;
    payment.reference = overrides?.reference || null;
    payment.notes = overrides?.notes || null;
    payment.unitId = overrides?.unitId || 'unit-1';
    payment.residentId = overrides?.residentId || null;
    return payment;
  };

  const mockService = {
    create: jest.fn(),
    findAllByCondominium: jest.fn(),
    findAllByUnit: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    changeStatus: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [PaymentsController],
      providers: [
        { provide: PaymentsService, useValue: mockService },
      ],
    }).compile();

    controller = module.get<PaymentsController>(PaymentsController);
    service = module.get(PaymentsService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a payment and return 201', async () => {
      const mockPayment = createMockPayment();
      mockService.create.mockResolvedValue(mockPayment);

      const dto = {
        amount: 150000,
        period: '2026-01',
        dueDate: '2026-01-31',
      };

      const result = await controller.create(
        'unit-1',
        dto as any,
        { condominioId: 'condo-1' },
      );

      expect(mockService.create).toHaveBeenCalledWith(
        expect.objectContaining({ unitId: 'unit-1', amount: 150000 }),
        'condo-1',
      );
      expect(result).toHaveProperty('success', true);
      expect(result).toHaveProperty('data', mockPayment);
    });

    it('should propagate NotFoundException for invalid unit', async () => {
      mockService.create.mockRejectedValue(new NotFoundException('Unit'));

      await expect(
        controller.create('invalid', { amount: 100, period: '2026-01', dueDate: '2026-01-31' } as any, { condominioId: 'condo-1' }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('findAllByCondominium', () => {
    it('should return paginated payments', async () => {
      const mockPayments = [createMockPayment()];
      mockService.findAllByCondominium.mockResolvedValue({
        data: mockPayments,
        total: 1,
      });

      const result = await controller.findAllByCondominium(
        'condo-1',
        { condominioId: 'condo-1' },
        { page: 1, limit: 10 },
      );

      expect(mockService.findAllByCondominium).toHaveBeenCalledWith(
        'condo-1',
        { page: 1, limit: 10 },
      );
      expect(result).toHaveProperty('data', mockPayments);
      expect(result).toHaveProperty('meta');
      expect(result.meta).toHaveProperty('total', 1);
    });

    it('should return empty list when no payments', async () => {
      mockService.findAllByCondominium.mockResolvedValue({
        data: [],
        total: 0,
      });

      const result = await controller.findAllByCondominium(
        'condo-1',
        { condominioId: 'condo-1' },
        { page: 1, limit: 10 },
      );

      expect(result.data).toEqual([]);
      expect(result.meta.total).toBe(0);
    });
  });

  describe('findAllByUnit', () => {
    it('should return paginated payments for a unit', async () => {
      const mockPayments = [createMockPayment()];
      mockService.findAllByUnit.mockResolvedValue({
        data: mockPayments,
        total: 1,
      });

      const result = await controller.findAllByUnit(
        'unit-1',
        { condominioId: 'condo-1' },
        1,
        10,
      );

      expect(mockService.findAllByUnit).toHaveBeenCalledWith(
        'unit-1',
        'condo-1',
        { page: 1, limit: 10 },
      );
      expect(result).toHaveProperty('data', mockPayments);
    });
  });

  describe('findOne', () => {
    it('should return payment details', async () => {
      const mockPayment = createMockPayment();
      mockService.findOne.mockResolvedValue(mockPayment);

      const result = await controller.findOne('payment-1', { condominioId: 'condo-1' });

      expect(mockService.findOne).toHaveBeenCalledWith('payment-1', 'condo-1');
      expect(result).toHaveProperty('data', mockPayment);
    });

    it('should propagate NotFoundException', async () => {
      mockService.findOne.mockRejectedValue(new NotFoundException('Payment'));

      await expect(controller.findOne('invalid', { condominioId: 'condo-1' })).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('update', () => {
    it('should update payment successfully', async () => {
      const mockPayment = createMockPayment({ notes: 'Updated' });
      mockService.update.mockResolvedValue(mockPayment);

      const result = await controller.update(
        'payment-1',
        { notes: 'Updated' } as any,
        { condominioId: 'condo-1' },
      );

      expect(mockService.update).toHaveBeenCalledWith(
        'payment-1',
        { notes: 'Updated' },
        'condo-1',
      );
      expect(result).toHaveProperty('data', mockPayment);
    });

    it('should propagate BusinessException for paid amount change', async () => {
      mockService.update.mockRejectedValue(
        new BusinessException('Cannot update amount of a paid payment'),
      );

      await expect(
        controller.update('payment-1', { amount: 200000 } as any, { condominioId: 'condo-1' }),
      ).rejects.toThrow(BusinessException);
    });
  });

  describe('changeStatus', () => {
    it('should change status successfully', async () => {
      const mockPayment = createMockPayment({ status: PaymentStatus.PAID });
      mockService.changeStatus.mockResolvedValue(mockPayment);

      const result = await controller.changeStatus(
        'payment-1',
        {
          status: PaymentStatus.PAID,
          paymentMethod: PaymentMethod.TRANSFER,
          reference: 'TRX-001',
        },
        { condominioId: 'condo-1' },
      );

      expect(mockService.changeStatus).toHaveBeenCalledWith(
        'payment-1',
        expect.objectContaining({ status: PaymentStatus.PAID }),
        'condo-1',
      );
      expect(result).toHaveProperty('data', mockPayment);
    });

    it('should propagate BusinessException for invalid transition', async () => {
      mockService.changeStatus.mockRejectedValue(
        new BusinessException('Invalid status transition'),
      );

      await expect(
        controller.changeStatus(
          'payment-1',
          { status: PaymentStatus.PENDING },
          { condominioId: 'condo-1' },
        ),
      ).rejects.toThrow(BusinessException);
    });
  });

  describe('remove', () => {
    it('should soft delete a payment', async () => {
      mockService.remove.mockResolvedValue(undefined);

      await controller.remove('payment-1', { condominioId: 'condo-1' });

      expect(mockService.remove).toHaveBeenCalledWith('payment-1', 'condo-1');
    });

    it('should propagate BusinessException for paid payment deletion', async () => {
      mockService.remove.mockRejectedValue(
        new BusinessException('Cannot delete a paid payment'),
      );

      await expect(
        controller.remove('payment-1', { condominioId: 'condo-1' }),
      ).rejects.toThrow(BusinessException);
    });
  });
});
