import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Payment } from './entities/payment.entity';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { UpdatePaymentDto } from './dto/update-payment.dto';
import { ChangeStatusDto } from './dto/change-status.dto';
import { PaginationDto } from '@condominios/common/dto/pagination.dto';
import {
  NotFoundException,
  BusinessException,
} from '@condominios/common/exceptions/business.exception';
import { LoggerService } from '@condominios/infrastructure/logger/logger.service';
import { RedisCacheService } from '@condominios/infrastructure/redis/redis-cache.service';
import { UnitsService } from '../units/units.service';
import { PaymentStatus } from '@condominios/shared/enums/payment-status.enum';

const VALID_TRANSITIONS: Record<PaymentStatus, PaymentStatus[]> = {
  [PaymentStatus.PENDING]: [
    PaymentStatus.PAID,
    PaymentStatus.OVERDUE,
    PaymentStatus.PARTIAL,
    PaymentStatus.CANCELLED,
  ],
  [PaymentStatus.OVERDUE]: [
    PaymentStatus.PAID,
    PaymentStatus.PARTIAL,
    PaymentStatus.CANCELLED,
  ],
  [PaymentStatus.PARTIAL]: [PaymentStatus.PAID, PaymentStatus.CANCELLED],
  [PaymentStatus.PAID]: [],
  [PaymentStatus.CANCELLED]: [],
};

const CACHE_TTL = {
  PAYMENT: 1800,
  PAYMENT_LIST: 300,
};

const CACHE_KEYS = {
  payment: (id: string) => `payment:${id}`,
  paymentsByCondo: (condoId: string, page: number, limit: number) =>
    `payments:condo:${condoId}:${page}:${limit}`,
  paymentsByUnit: (unitId: string, page: number, limit: number) =>
    `payments:unit:${unitId}:${page}:${limit}`,
  paymentListPatternByCondo: (condoId: string) => `payments:condo:${condoId}:*`,
  paymentListPatternByUnit: (unitId: string) => `payments:unit:${unitId}:*`,
};

@Injectable()
export class PaymentsService {
  constructor(
    @InjectRepository(Payment)
    private readonly paymentRepository: Repository<Payment>,
    private readonly unitsService: UnitsService,
    private readonly logger: LoggerService,
    private readonly cache: RedisCacheService,
  ) {}

  async create(
    createPaymentDto: CreatePaymentDto,
    condominiumId: string,
  ): Promise<Payment> {
    // Verify unit exists and belongs to the condominium
    await this.validateUnitBelongsToCondominium(
      createPaymentDto.unitId!,
      condominiumId,
    );

    const payment = this.paymentRepository.create(createPaymentDto);
    const savedPayment = await this.paymentRepository.save(payment);

    await this.invalidatePaymentCache(savedPayment.id, condominiumId);

    this.logger.log(
      `Payment created: ${savedPayment.id}`,
      PaymentsService.name,
      {
        paymentId: savedPayment.id,
        unitId: createPaymentDto.unitId,
        amount: createPaymentDto.amount,
        period: createPaymentDto.period,
      },
    );

    return savedPayment;
  }

  async findAllByCondominium(
    condominiumId: string,
    pagination: PaginationDto,
  ): Promise<{ data: Payment[]; total: number }> {
    const { page = 1, limit = 10 } = pagination;
    const cacheKey = CACHE_KEYS.paymentsByCondo(condominiumId, page, limit);

    return this.cache.getOrSet(
      cacheKey,
      async () => {
        const queryBuilder = this.paymentRepository
          .createQueryBuilder('payment')
          .innerJoinAndSelect('payment.unit', 'unit')
          .innerJoin('unit.building', 'building')
          .addSelect(['building.id', 'building.name'])
          .innerJoin('building.condominium', 'condominium')
          .where('condominium.id = :condominiumId', { condominiumId })
          .orderBy('payment.dueDate', 'DESC')
          .addOrderBy('payment.createdAt', 'DESC')
          .skip((page - 1) * limit)
          .take(limit);

        const [data, total] = await queryBuilder.getManyAndCount();
        return { data, total };
      },
      CACHE_TTL.PAYMENT_LIST,
    );
  }

  async findAllByUnit(
    unitId: string,
    condominiumId: string,
    pagination: PaginationDto,
  ): Promise<{ data: Payment[]; total: number }> {
    // Verify unit exists and belongs to the condominium
    await this.validateUnitBelongsToCondominium(unitId, condominiumId);

    const { page = 1, limit = 10 } = pagination;
    const cacheKey = CACHE_KEYS.paymentsByUnit(unitId, page, limit);

    return this.cache.getOrSet(
      cacheKey,
      async () => {
        const queryBuilder = this.paymentRepository
          .createQueryBuilder('payment')
          .innerJoinAndSelect('payment.unit', 'unit')
          .innerJoin('unit.building', 'building')
          .addSelect(['building.id', 'building.name'])
          .where('payment.unitId = :unitId', { unitId })
          .orderBy('payment.dueDate', 'DESC')
          .addOrderBy('payment.createdAt', 'DESC')
          .skip((page - 1) * limit)
          .take(limit);

        const [data, total] = await queryBuilder.getManyAndCount();
        return { data, total };
      },
      CACHE_TTL.PAYMENT_LIST,
    );
  }

  async findOne(id: string, condominiumId: string): Promise<Payment> {
    const queryBuilder = this.paymentRepository
      .createQueryBuilder('payment')
      .innerJoinAndSelect('payment.unit', 'unit')
      .innerJoin('unit.building', 'building')
      .addSelect(['building.id', 'building.name'])
      .innerJoin('building.condominium', 'condominium')
      .leftJoinAndSelect('payment.resident', 'resident')
      .where('payment.id = :id', { id })
      .andWhere('condominium.id = :condominiumId', { condominiumId });

    const payment = await queryBuilder.getOne();

    if (!payment) {
      throw new NotFoundException('Payment');
    }

    return payment;
  }

  async update(
    id: string,
    updatePaymentDto: UpdatePaymentDto,
    condominiumId: string,
  ): Promise<Payment> {
    const payment = await this.findOne(id, condominiumId);

    // Prevent updating amount on PAID payments
    if (
      payment.status === PaymentStatus.PAID &&
      updatePaymentDto.amount !== undefined
    ) {
      throw new BusinessException(
        'Cannot update amount of a paid payment',
      );
    }

    Object.assign(payment, updatePaymentDto);
    const updatedPayment = await this.paymentRepository.save(payment);

    await this.invalidatePaymentCache(updatedPayment.id, condominiumId);

    this.logger.log(
      `Payment updated: ${id}`,
      PaymentsService.name,
      { paymentId: id },
    );

    return updatedPayment;
  }

  async changeStatus(
    id: string,
    changeStatusDto: ChangeStatusDto,
    condominiumId: string,
  ): Promise<Payment> {
    const payment = await this.findOne(id, condominiumId);

    const allowedTransitions = VALID_TRANSITIONS[payment.status];
    if (!allowedTransitions.includes(changeStatusDto.status)) {
      throw new BusinessException(
        `Invalid status transition from ${payment.status} to ${changeStatusDto.status}`,
      );
    }

    // Capture original status before mutation for logging
    const previousStatus = payment.status;

    payment.status = changeStatusDto.status;

    // Auto-set paidDate when marking as PAID (allow custom date via DTO)
    if (changeStatusDto.status === PaymentStatus.PAID) {
      payment.paidDate = changeStatusDto.paidDate
        ? new Date(changeStatusDto.paidDate)
        : new Date();
    }

    // Update payment method and reference if provided
    if (changeStatusDto.paymentMethod) {
      payment.paymentMethod = changeStatusDto.paymentMethod;
    }
    if (changeStatusDto.reference) {
      payment.reference = changeStatusDto.reference;
    }

    const updatedPayment = await this.paymentRepository.save(payment);

    await this.invalidatePaymentCache(updatedPayment.id, condominiumId);

    this.logger.log(
      `Payment status changed: ${id} → ${changeStatusDto.status}`,
      PaymentsService.name,
      {
        paymentId: id,
        from: previousStatus,
        to: changeStatusDto.status,
      },
    );

    return updatedPayment;
  }

  async remove(id: string, condominiumId: string): Promise<void> {
    const payment = await this.findOne(id, condominiumId);

    if (payment.status === PaymentStatus.PAID) {
      throw new BusinessException('Cannot delete a paid payment');
    }

    await this.paymentRepository.softDelete(id);

    await this.invalidatePaymentCache(id, condominiumId);

    this.logger.log(
      `Payment soft deleted: ${id}`,
      PaymentsService.name,
      { paymentId: id },
    );
  }

  private async validateUnitBelongsToCondominium(
    unitId: string,
    condominiumId: string,
  ): Promise<void> {
    const unit = await this.unitsService.findOne(unitId);
    if (unit.building && unit.building.condominiumId !== condominiumId) {
      throw new NotFoundException('Unit');
    }
  }

  private async invalidatePaymentCache(
    id: string,
    condominiumId?: string,
  ): Promise<void> {
    const invalidations: Promise<void>[] = [
      this.cache.invalidate(CACHE_KEYS.payment(id)),
    ];

    if (condominiumId) {
      invalidations.push(
        this.cache.invalidatePattern(
          CACHE_KEYS.paymentListPatternByCondo(condominiumId),
        ),
      );
    }

    // Also invalidate unit-level caches (we don't always know the unitId here)
    invalidations.push(
      this.cache.invalidatePattern('payments:unit:*'),
    );

    await Promise.all(invalidations);
  }
}
