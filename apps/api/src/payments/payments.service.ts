import { HttpStatus, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
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
import { PaykuService } from '@condominios/infrastructure/payku/payku.service';
import { PaykuWebhookPayload } from '@condominios/infrastructure/payku/interfaces/webhook.interface';
import { UnitsService } from '../units/units.service';
import { PaymentStatus } from '@condominios/shared/enums/payment-status.enum';
import { PaymentMethod } from '@condominios/shared/enums/payment-method.enum';
import { PaykuPaymentMethod } from '@condominios/shared/enums/payku-payment-method.enum';

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
    private readonly paykuService: PaykuService,
    private readonly configService: ConfigService,
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

  async initiatePayment(
    id: string,
    condominiumId: string,
    userEmail: string,
  ): Promise<{ paymentId: string; paykuTransactionId: string; paymentUrl: string }> {
    const payment = await this.findOne(id, condominiumId);

    if (
      payment.status !== PaymentStatus.PENDING &&
      payment.status !== PaymentStatus.OVERDUE
    ) {
      throw new BusinessException(
        `Cannot initiate payment for a payment with status ${payment.status}`,
      );
    }

    if (!this.paykuService.isOperational()) {
      throw new BusinessException(
        'Payment gateway is not available',
        HttpStatus.SERVICE_UNAVAILABLE,
      );
    }

    const returnUrl = this.configService.get<string>('PAYKU_RETURN_URL', '');
    const notifyUrl = this.configService.get<string>('PAYKU_NOTIFY_URL', '');

    if (!returnUrl || !notifyUrl) {
      throw new BusinessException(
        'Payment gateway URLs are not configured',
        HttpStatus.SERVICE_UNAVAILABLE,
      );
    }

    const unitName = payment.unit?.number || payment.unitId;
    const subject = `Common expenses - Unit ${unitName} - ${payment.period}`;

    const response = await this.paykuService.createTransaction({
      email: userEmail,
      order: payment.id,
      subject,
      amount: Number(payment.amount),
      currency: 'CLP',
      payment: PaykuPaymentMethod.ALL,
      urlreturn: returnUrl,
      urlnotify: notifyUrl,
    });

    payment.paykuTransactionId = response.id;
    await this.paymentRepository.save(payment);

    await this.invalidatePaymentCache(payment.id, condominiumId);

    this.logger.log(
      `Payment initiated via Payku: ${payment.id}`,
      PaymentsService.name,
      {
        paymentId: payment.id,
        paykuTransactionId: response.id,
        amount: payment.amount,
      },
    );

    return {
      paymentId: payment.id,
      paykuTransactionId: response.id,
      paymentUrl: response.url,
    };
  }

  async handleWebhook(payload: PaykuWebhookPayload): Promise<void> {
    this.logger.log(
      `Webhook received: order=${payload.order} status=${payload.status}`,
      PaymentsService.name,
      { transactionId: payload.transaction_id, order: payload.order },
    );

    let payment: Payment | null;
    try {
      payment = await this.paymentRepository.findOne({
        where: { id: payload.order },
      });
    } catch {
      this.logger.warn(
        `Webhook: invalid order ID ${payload.order}`,
        PaymentsService.name,
      );
      return;
    }

    if (!payment) {
      this.logger.warn(
        `Webhook: payment not found for order ${payload.order}`,
        PaymentsService.name,
      );
      return;
    }

    if (payment.status === PaymentStatus.PAID) {
      this.logger.log(
        `Webhook: payment ${payment.id} already PAID, skipping`,
        PaymentsService.name,
      );
      return;
    }

    if (!this.paykuService.isOperational()) {
      this.logger.warn(
        'Webhook: Payku service not configured, cannot verify transaction',
        PaymentsService.name,
      );
      return;
    }

    const transaction = await this.paykuService.getTransaction(
      payload.transaction_id,
    );

    if (transaction.gateway_response?.status !== 'success') {
      this.logger.warn(
        `Webhook: transaction ${payload.transaction_id} not successful (${transaction.gateway_response?.status})`,
        PaymentsService.name,
        { paymentId: payment.id, paykuStatus: transaction.gateway_response?.status },
      );
      return;
    }

    const paykuAmount = Number(transaction.amount);
    const paymentAmount = Number(payment.amount);
    if (paykuAmount !== paymentAmount) {
      this.logger.error(
        `Webhook: amount mismatch for payment ${payment.id} — expected ${paymentAmount}, got ${paykuAmount}`,
        undefined,
        PaymentsService.name,
      );
      return;
    }

    payment.status = PaymentStatus.PAID;
    payment.paidDate = new Date();
    payment.paymentMethod = PaymentMethod.ONLINE;
    payment.reference = payload.transaction_id;
    payment.paykuTransactionId = payload.transaction_id;
    await this.paymentRepository.save(payment);

    await this.invalidatePaymentCache(payment.id);

    this.logger.log(
      `Webhook: payment ${payment.id} confirmed as PAID`,
      PaymentsService.name,
      {
        paymentId: payment.id,
        transactionId: payload.transaction_id,
        amount: paymentAmount,
      },
    );
  }

  async getPaykuStatus(
    id: string,
    condominiumId: string,
  ): Promise<{
    paymentId: string;
    paykuTransactionId: string;
    paykuStatus: string;
    paykuDetails: unknown;
  }> {
    const payment = await this.findOne(id, condominiumId);

    if (!payment.paykuTransactionId) {
      throw new BusinessException(
        'No Payku transaction exists for this payment',
      );
    }

    if (!this.paykuService.isOperational()) {
      throw new BusinessException(
        'Payment gateway is not available',
        HttpStatus.SERVICE_UNAVAILABLE,
      );
    }

    const details = await this.paykuService.getTransaction(
      payment.paykuTransactionId,
    );

    return {
      paymentId: payment.id,
      paykuTransactionId: payment.paykuTransactionId,
      paykuStatus: details.gateway_response?.status || details.status,
      paykuDetails: details,
    };
  }

  private async validateUnitBelongsToCondominium(
    unitId: string,
    condominiumId: string,
  ): Promise<void> {
    const unit = await this.unitsService.findOne(unitId);
    if (!unit.building || unit.building.condominiumId !== condominiumId) {
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
