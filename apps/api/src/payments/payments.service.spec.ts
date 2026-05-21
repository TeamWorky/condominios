import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PaymentsService } from './payments.service';
import { Payment } from './entities/payment.entity';
import { LoggerService } from '@condominios/infrastructure/logger/logger.service';
import { RedisCacheService } from '@condominios/infrastructure/redis/redis-cache.service';
import {
  NotFoundException,
  BusinessException,
} from '@condominios/common/exceptions/business.exception';
import { UnitsService } from '../units/units.service';
import { PaymentStatus } from '@condominios/shared/enums/payment-status.enum';
import { PaymentMethod } from '@condominios/shared/enums/payment-method.enum';

describe('PaymentsService', () => {
  let service: PaymentsService;
  let repository: jest.Mocked<Repository<Payment>>;
  let cache: jest.Mocked<RedisCacheService>;
  let unitsService: jest.Mocked<UnitsService>;

  const mockQueryBuilder = {
    where: jest.fn().mockReturnThis(),
    andWhere: jest.fn().mockReturnThis(),
    innerJoin: jest.fn().mockReturnThis(),
    innerJoinAndSelect: jest.fn().mockReturnThis(),
    leftJoin: jest.fn().mockReturnThis(),
    leftJoinAndSelect: jest.fn().mockReturnThis(),
    addSelect: jest.fn().mockReturnThis(),
    orderBy: jest.fn().mockReturnThis(),
    addOrderBy: jest.fn().mockReturnThis(),
    skip: jest.fn().mockReturnThis(),
    take: jest.fn().mockReturnThis(),
    getOne: jest.fn(),
    getManyAndCount: jest.fn(),
  };

  const mockRepository = {
    create: jest.fn(),
    save: jest.fn(),
    softDelete: jest.fn(),
    createQueryBuilder: jest.fn(() => mockQueryBuilder),
  };

  const mockCache = {
    get: jest.fn(),
    set: jest.fn(),
    invalidate: jest.fn(),
    invalidatePattern: jest.fn(),
    getOrSet: jest.fn(async (_key, fn) => fn()),
  };

  const mockLogger = {
    log: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
    debug: jest.fn(),
    verbose: jest.fn(),
  };

  const mockUnitsService = {
    findOne: jest.fn().mockResolvedValue({
      id: 'unit-1',
      number: '101',
      building: { id: 'building-1', condominiumId: 'condo-1' },
    }),
  };

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

  beforeEach(async () => {
    jest.clearAllMocks();
    mockUnitsService.findOne.mockResolvedValue({
      id: 'unit-1',
      number: '101',
      building: { id: 'building-1', condominiumId: 'condo-1' },
    });

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PaymentsService,
        { provide: getRepositoryToken(Payment), useValue: mockRepository },
        { provide: RedisCacheService, useValue: mockCache },
        { provide: LoggerService, useValue: mockLogger },
        { provide: UnitsService, useValue: mockUnitsService },
      ],
    }).compile();

    service = module.get<PaymentsService>(PaymentsService);
    repository = module.get(getRepositoryToken(Payment));
    cache = module.get(RedisCacheService);
    unitsService = module.get(UnitsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    const createDto = {
      amount: 150000,
      period: '2026-01',
      dueDate: '2026-01-31',
      unitId: 'unit-1',
    };

    it('should create a payment successfully with PENDING status', async () => {
      const mockPayment = createMockPayment();
      mockRepository.create.mockReturnValue(mockPayment);
      mockRepository.save.mockResolvedValue(mockPayment);

      const result = await service.create(createDto as any, 'condo-1');

      expect(unitsService.findOne).toHaveBeenCalledWith('unit-1');
      expect(mockRepository.create).toHaveBeenCalledWith(createDto);
      expect(mockRepository.save).toHaveBeenCalled();
      expect(result).toEqual(mockPayment);
      expect(result.status).toBe(PaymentStatus.PENDING);
      expect(cache.invalidatePattern).toHaveBeenCalled();
    });

    it('should throw NotFoundException when unit does not exist', async () => {
      mockUnitsService.findOne.mockRejectedValue(new NotFoundException('Unit'));

      await expect(service.create(createDto as any, 'condo-1')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should log payment creation', async () => {
      const mockPayment = createMockPayment();
      mockRepository.create.mockReturnValue(mockPayment);
      mockRepository.save.mockResolvedValue(mockPayment);

      await service.create(createDto as any, 'condo-1');

      expect(mockLogger.log).toHaveBeenCalledWith(
        expect.stringContaining('Payment created'),
        'PaymentsService',
        expect.objectContaining({ paymentId: mockPayment.id }),
      );
    });
  });

  describe('findAllByCondominium', () => {
    it('should return paginated payments', async () => {
      const mockPayments = [createMockPayment()];
      mockQueryBuilder.getManyAndCount.mockResolvedValue([mockPayments, 1]);

      const result = await service.findAllByCondominium('condo-1', {
        page: 1,
        limit: 10,
      });

      expect(result).toEqual({ data: mockPayments, total: 1 });
    });

    it('should return empty list when no payments exist', async () => {
      mockQueryBuilder.getManyAndCount.mockResolvedValue([[], 0]);

      const result = await service.findAllByCondominium('condo-1', {
        page: 1,
        limit: 10,
      });

      expect(result).toEqual({ data: [], total: 0 });
    });

    it('should use cache', async () => {
      const mockPayments = [createMockPayment()];
      mockQueryBuilder.getManyAndCount.mockResolvedValue([mockPayments, 1]);

      await service.findAllByCondominium('condo-1', { page: 1, limit: 10 });

      expect(mockCache.getOrSet).toHaveBeenCalledWith(
        expect.stringContaining('payments:condo:condo-1'),
        expect.any(Function),
        expect.any(Number),
      );
    });
  });

  describe('findAllByUnit', () => {
    it('should return paginated payments for a unit', async () => {
      const mockPayments = [createMockPayment()];
      mockQueryBuilder.getManyAndCount.mockResolvedValue([mockPayments, 1]);

      const result = await service.findAllByUnit('unit-1', 'condo-1', {
        page: 1,
        limit: 10,
      });

      expect(result).toEqual({ data: mockPayments, total: 1 });
    });

    it('should validate unit belongs to condominium', async () => {
      mockUnitsService.findOne.mockResolvedValue({
        id: 'unit-1',
        number: '101',
        building: { id: 'building-1', condominiumId: 'other-condo' },
      });

      await expect(
        service.findAllByUnit('unit-1', 'condo-1', { page: 1, limit: 10 }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('findOne', () => {
    it('should return a payment by id', async () => {
      const mockPayment = createMockPayment();
      mockQueryBuilder.getOne.mockResolvedValue(mockPayment);

      const result = await service.findOne('payment-1', 'condo-1');

      expect(result).toEqual(mockPayment);
    });

    it('should throw NotFoundException when payment not found', async () => {
      mockQueryBuilder.getOne.mockResolvedValue(null);

      await expect(service.findOne('invalid', 'condo-1')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should scope by condominium', async () => {
      const mockPayment = createMockPayment();
      mockQueryBuilder.getOne.mockResolvedValue(mockPayment);

      await service.findOne('payment-1', 'condo-1');

      expect(mockQueryBuilder.innerJoin).toHaveBeenCalledWith(
        'building.condominium',
        'condominium',
      );
      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        'condominium.id = :condominiumId',
        { condominiumId: 'condo-1' },
      );
    });

    it('should return 404 when payment belongs to different condominium', async () => {
      mockQueryBuilder.getOne.mockResolvedValue(null);

      await expect(
        service.findOne('payment-1', 'other-condo'),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update a payment successfully', async () => {
      const mockPayment = createMockPayment();
      const updatedPayment = { ...mockPayment, notes: 'Updated' };
      mockQueryBuilder.getOne.mockResolvedValue(mockPayment);
      mockRepository.save.mockResolvedValue(updatedPayment);

      const result = await service.update(
        'payment-1',
        { notes: 'Updated' },
        'condo-1',
      );

      expect(result.notes).toBe('Updated');
      expect(cache.invalidate).toHaveBeenCalled();
      expect(cache.invalidatePattern).toHaveBeenCalled();
    });

    it('should reject amount update on PAID payment', async () => {
      const paidPayment = createMockPayment({ status: PaymentStatus.PAID });
      mockQueryBuilder.getOne.mockResolvedValue(paidPayment);

      await expect(
        service.update('payment-1', { amount: 200000 }, 'condo-1'),
      ).rejects.toThrow(BusinessException);
    });

    it('should allow non-amount updates on PAID payment', async () => {
      const paidPayment = createMockPayment({ status: PaymentStatus.PAID });
      const updatedPayment = { ...paidPayment, notes: 'Note update' };
      mockQueryBuilder.getOne.mockResolvedValue(paidPayment);
      mockRepository.save.mockResolvedValue(updatedPayment);

      const result = await service.update(
        'payment-1',
        { notes: 'Note update' },
        'condo-1',
      );

      expect(result.notes).toBe('Note update');
    });

    it('should throw NotFoundException when payment not found', async () => {
      mockQueryBuilder.getOne.mockResolvedValue(null);

      await expect(
        service.update('invalid', { notes: 'test' }, 'condo-1'),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('changeStatus', () => {
    it('should change PENDING to PAID and set paidDate', async () => {
      const mockPayment = createMockPayment({ status: PaymentStatus.PENDING });
      const updatedPayment = {
        ...mockPayment,
        status: PaymentStatus.PAID,
        paidDate: new Date(),
      };
      mockQueryBuilder.getOne.mockResolvedValue(mockPayment);
      mockRepository.save.mockResolvedValue(updatedPayment);

      const result = await service.changeStatus(
        'payment-1',
        {
          status: PaymentStatus.PAID,
          paymentMethod: PaymentMethod.TRANSFER,
          reference: 'TRX-001',
        },
        'condo-1',
      );

      expect(mockRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({
          status: PaymentStatus.PAID,
          paidDate: expect.any(Date),
          paymentMethod: PaymentMethod.TRANSFER,
          reference: 'TRX-001',
        }),
      );
    });

    it('should change OVERDUE to PAID', async () => {
      const mockPayment = createMockPayment({ status: PaymentStatus.OVERDUE });
      mockQueryBuilder.getOne.mockResolvedValue(mockPayment);
      mockRepository.save.mockResolvedValue({
        ...mockPayment,
        status: PaymentStatus.PAID,
      });

      await service.changeStatus(
        'payment-1',
        { status: PaymentStatus.PAID },
        'condo-1',
      );

      expect(mockRepository.save).toHaveBeenCalled();
    });

    it('should change PENDING to OVERDUE', async () => {
      const mockPayment = createMockPayment({ status: PaymentStatus.PENDING });
      mockQueryBuilder.getOne.mockResolvedValue(mockPayment);
      mockRepository.save.mockResolvedValue({
        ...mockPayment,
        status: PaymentStatus.OVERDUE,
      });

      await service.changeStatus(
        'payment-1',
        { status: PaymentStatus.OVERDUE },
        'condo-1',
      );

      expect(mockRepository.save).toHaveBeenCalled();
    });

    it('should change PENDING to CANCELLED', async () => {
      const mockPayment = createMockPayment({ status: PaymentStatus.PENDING });
      mockQueryBuilder.getOne.mockResolvedValue(mockPayment);
      mockRepository.save.mockResolvedValue({
        ...mockPayment,
        status: PaymentStatus.CANCELLED,
      });

      await service.changeStatus(
        'payment-1',
        { status: PaymentStatus.CANCELLED },
        'condo-1',
      );

      expect(mockRepository.save).toHaveBeenCalled();
    });

    it('should change PARTIAL to PAID', async () => {
      const mockPayment = createMockPayment({ status: PaymentStatus.PARTIAL });
      mockQueryBuilder.getOne.mockResolvedValue(mockPayment);
      mockRepository.save.mockResolvedValue({
        ...mockPayment,
        status: PaymentStatus.PAID,
      });

      await service.changeStatus(
        'payment-1',
        { status: PaymentStatus.PAID },
        'condo-1',
      );

      expect(mockRepository.save).toHaveBeenCalled();
    });

    it('should reject PAID to PENDING transition', async () => {
      const paidPayment = createMockPayment({ status: PaymentStatus.PAID });
      mockQueryBuilder.getOne.mockResolvedValue(paidPayment);

      await expect(
        service.changeStatus(
          'payment-1',
          { status: PaymentStatus.PENDING },
          'condo-1',
        ),
      ).rejects.toThrow(BusinessException);
    });

    it('should reject CANCELLED to any transition', async () => {
      const cancelledPayment = createMockPayment({
        status: PaymentStatus.CANCELLED,
      });
      mockQueryBuilder.getOne.mockResolvedValue(cancelledPayment);

      await expect(
        service.changeStatus(
          'payment-1',
          { status: PaymentStatus.PAID },
          'condo-1',
        ),
      ).rejects.toThrow(BusinessException);
    });

    it('should reject PAID to CANCELLED transition', async () => {
      const paidPayment = createMockPayment({ status: PaymentStatus.PAID });
      mockQueryBuilder.getOne.mockResolvedValue(paidPayment);

      await expect(
        service.changeStatus(
          'payment-1',
          { status: PaymentStatus.CANCELLED },
          'condo-1',
        ),
      ).rejects.toThrow(BusinessException);
    });
  });

  describe('remove', () => {
    it('should soft delete a PENDING payment', async () => {
      const mockPayment = createMockPayment({ status: PaymentStatus.PENDING });
      mockQueryBuilder.getOne.mockResolvedValue(mockPayment);
      mockRepository.softDelete.mockResolvedValue({ affected: 1 } as any);

      await service.remove('payment-1', 'condo-1');

      expect(mockRepository.softDelete).toHaveBeenCalledWith('payment-1');
      expect(cache.invalidate).toHaveBeenCalled();
      expect(cache.invalidatePattern).toHaveBeenCalled();
    });

    it('should reject deletion of PAID payment', async () => {
      const paidPayment = createMockPayment({ status: PaymentStatus.PAID });
      mockQueryBuilder.getOne.mockResolvedValue(paidPayment);

      await expect(
        service.remove('payment-1', 'condo-1'),
      ).rejects.toThrow(BusinessException);

      expect(mockRepository.softDelete).not.toHaveBeenCalled();
    });

    it('should throw NotFoundException when payment not found', async () => {
      mockQueryBuilder.getOne.mockResolvedValue(null);

      await expect(
        service.remove('invalid', 'condo-1'),
      ).rejects.toThrow(NotFoundException);
    });

    it('should soft delete an OVERDUE payment', async () => {
      const overduePayment = createMockPayment({
        status: PaymentStatus.OVERDUE,
      });
      mockQueryBuilder.getOne.mockResolvedValue(overduePayment);
      mockRepository.softDelete.mockResolvedValue({ affected: 1 } as any);

      await service.remove('payment-1', 'condo-1');

      expect(mockRepository.softDelete).toHaveBeenCalledWith('payment-1');
    });
  });
});
