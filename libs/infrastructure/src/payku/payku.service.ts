import { HttpStatus, Inject, Injectable } from '@nestjs/common';
import axios, { AxiosRequestConfig, AxiosError } from 'axios';
import type { PaykuConfig } from './interfaces/payku-config.interface';
import { PaykuSignatureService } from './payku-signature.service';
import { PaykuException } from './payku.exception';
import { LoggerService } from '../logger/logger.service';
import {
  CreateTransactionRequest,
  TransactionCreateResponse,
  TransactionDetailResponse,
  TransactionListParams,
  TransactionListResponse,
} from './interfaces/transaction.interface';
import {
  CreateNullificationRequest,
  NullificationResponse,
} from './interfaces/nullification.interface';
import {
  WalletPayoutRequest,
  WalletPayoutResponse,
  WalletWithdrawRequest,
  WalletWithdrawResponse,
  WalletBalanceResponse,
  WalletListResponse,
  WalletDetailResponse,
  PayoutDetailResponse,
} from './interfaces/wallet.interface';
import {
  CreateSubscriptionClientRequest,
  SubscriptionClientResponse,
  SubscriptionClientListResponse,
  CreateSubscriptionRequest,
  SubscriptionResponse,
  CreateSubscriptionTransactionRequest,
  SubscriptionTransactionResponse,
  CreateSubscriptionPlanRequest,
  SubscriptionPlanResponse,
  SubscriptionPlanListResponse,
} from './interfaces/subscription.interface';
import {
  CreateMarketplaceClientRequest,
  MarketplaceClientResponse,
  CreateMarketplaceAffiliationRequest,
  MarketplaceAffiliationResponse,
} from './interfaces/marketplace.interface';
import {
  CreateMallTransactionRequest,
  MallTransactionResponse,
} from './interfaces/mall.interface';
import {
  CreateEventRequest,
  EventResponse,
} from './interfaces/event.interface';
import {
  ConciliationParams,
  ConciliationResponse,
} from './interfaces/conciliation.interface';
import { BankListResponse, PaymentMethodListResponse } from './interfaces/utility.interface';

@Injectable()
export class PaykuService {
  private readonly baseUrl: string;
  private readonly enabled: boolean;

  constructor(
    @Inject('PAYKU_CONFIG') private readonly config: PaykuConfig,
    private readonly signatureService: PaykuSignatureService,
    private readonly logger: LoggerService,
  ) {
    this.baseUrl = config.baseUrl;
    this.enabled = !!config.publicToken && !!config.privateToken;

    if (!this.enabled) {
      this.logger.warn(
        'Payku service disabled: tokens not configured',
        PaykuService.name,
      );
    }
  }

  isOperational(): boolean {
    return this.enabled;
  }

  // ─── Transactions (US1) ───────────────────────────────────────────

  async createTransaction(
    data: CreateTransactionRequest,
  ): Promise<TransactionCreateResponse> {
    return this.request<TransactionCreateResponse>('POST', '/transaction', {
      data: data as unknown as Record<string, unknown>,
    });
  }

  async getTransaction(id: string): Promise<TransactionDetailResponse> {
    return this.request<TransactionDetailResponse>('GET', `/transaction/${id}`);
  }

  async listTransactions(
    params?: TransactionListParams,
  ): Promise<TransactionListResponse> {
    return this.request<TransactionListResponse>('GET', '/transaction', {
      params: params as unknown as Record<string, unknown>,
    });
  }

  async deleteTransaction(id: string): Promise<void> {
    return this.request<void>('DELETE', `/transaction/${id}`);
  }

  // ─── Nullification / Refunds (US2) ────────────────────────────────

  async nullifyTransaction(
    data: CreateNullificationRequest,
  ): Promise<NullificationResponse> {
    return this.request<NullificationResponse>('POST', '/nullification', {
      data: data as unknown as Record<string, unknown>,
      signed: true,
    });
  }

  async getNullification(id: string): Promise<NullificationResponse> {
    return this.request<NullificationResponse>('GET', `/nullification/${id}`);
  }

  // ─── Wallet (US5) ─────────────────────────────────────────────────

  async createPayout(
    data: WalletPayoutRequest,
  ): Promise<WalletPayoutResponse> {
    return this.request<WalletPayoutResponse>('POST', '/wallet/payout', {
      data: data as unknown as Record<string, unknown>,
      signed: true,
    });
  }

  async createWithdrawal(
    data: WalletWithdrawRequest,
  ): Promise<WalletWithdrawResponse> {
    return this.request<WalletWithdrawResponse>('POST', '/wallet/withdraw', {
      data: data as unknown as Record<string, unknown>,
      signed: true,
    });
  }

  async getWalletBalance(): Promise<WalletBalanceResponse> {
    return this.request<WalletBalanceResponse>('GET', '/wallet/balance');
  }

  async listWalletTransactions(): Promise<WalletListResponse> {
    return this.request<WalletListResponse>('GET', '/wallet');
  }

  async getWalletTransaction(id: string): Promise<WalletDetailResponse> {
    return this.request<WalletDetailResponse>('GET', `/wallet/${id}`);
  }

  async getPayoutStatus(id: string): Promise<PayoutDetailResponse> {
    return this.request<PayoutDetailResponse>('GET', `/wallet/payout/${id}`);
  }

  // ─── Subscriptions (US5) ──────────────────────────────────────────

  async createSubscriptionClient(
    data: CreateSubscriptionClientRequest,
  ): Promise<SubscriptionClientResponse> {
    return this.request<SubscriptionClientResponse>('POST', '/suclient', {
      data: data as unknown as Record<string, unknown>,
      signed: true,
    });
  }

  async getSubscriptionClient(id: string): Promise<SubscriptionClientResponse> {
    return this.request<SubscriptionClientResponse>('GET', `/suclient/${id}`);
  }

  async listSubscriptionClients(): Promise<SubscriptionClientListResponse> {
    return this.request<SubscriptionClientListResponse>('GET', '/suclient');
  }

  async createSubscription(
    data: CreateSubscriptionRequest,
  ): Promise<SubscriptionResponse> {
    return this.request<SubscriptionResponse>('POST', '/subscription', {
      data: data as unknown as Record<string, unknown>,
      signed: true,
    });
  }

  async getSubscription(id: string): Promise<SubscriptionResponse> {
    return this.request<SubscriptionResponse>('GET', `/subscription/${id}`);
  }

  async createSubscriptionTransaction(
    data: CreateSubscriptionTransactionRequest,
  ): Promise<SubscriptionTransactionResponse> {
    return this.request<SubscriptionTransactionResponse>(
      'POST',
      '/subscription/transaction',
      {
        data: data as unknown as Record<string, unknown>,
        signed: true,
      },
    );
  }

  async createSubscriptionPlan(
    data: CreateSubscriptionPlanRequest,
  ): Promise<SubscriptionPlanResponse> {
    return this.request<SubscriptionPlanResponse>('POST', '/suplan', {
      data: data as unknown as Record<string, unknown>,
      signed: true,
    });
  }

  async getSubscriptionPlan(id: string): Promise<SubscriptionPlanResponse> {
    return this.request<SubscriptionPlanResponse>('GET', `/suplan/${id}`);
  }

  async listSubscriptionPlans(): Promise<SubscriptionPlanListResponse> {
    return this.request<SubscriptionPlanListResponse>('GET', '/suplan');
  }

  // ─── Marketplace (US5) ────────────────────────────────────────────

  async createMarketplaceClient(
    data: CreateMarketplaceClientRequest,
  ): Promise<MarketplaceClientResponse> {
    return this.request<MarketplaceClientResponse>('POST', '/marketplace/client', {
      data: data as unknown as Record<string, unknown>,
      signed: true,
    });
  }

  async getMarketplaceClient(id: string): Promise<MarketplaceClientResponse> {
    return this.request<MarketplaceClientResponse>(
      'GET',
      `/marketplace/client/${id}`,
    );
  }

  async createMarketplaceAffiliation(
    data: CreateMarketplaceAffiliationRequest,
  ): Promise<MarketplaceAffiliationResponse> {
    return this.request<MarketplaceAffiliationResponse>(
      'POST',
      '/marketplace/affiliation',
      {
        data: data as unknown as Record<string, unknown>,
        signed: true,
      },
    );
  }

  async getMarketplaceAffiliation(
    id: string,
  ): Promise<MarketplaceAffiliationResponse> {
    return this.request<MarketplaceAffiliationResponse>(
      'GET',
      `/marketplace/affiliation/${id}`,
    );
  }

  // ─── Mall (US5) ───────────────────────────────────────────────────

  async createMallTransaction(
    data: CreateMallTransactionRequest,
  ): Promise<MallTransactionResponse> {
    return this.request<MallTransactionResponse>('POST', '/mall/transaction', {
      data: data as unknown as Record<string, unknown>,
      signed: true,
    });
  }

  async getMallTransaction(id: string): Promise<MallTransactionResponse> {
    return this.request<MallTransactionResponse>(
      'GET',
      `/mall/transaction/${id}`,
    );
  }

  // ─── Events (US5) ─────────────────────────────────────────────────

  async createEvent(data: CreateEventRequest): Promise<EventResponse> {
    return this.request<EventResponse>('POST', '/event', {
      data: data as unknown as Record<string, unknown>,
    });
  }

  async getEvent(id: string): Promise<EventResponse> {
    return this.request<EventResponse>('GET', `/event/${id}`);
  }

  // ─── Conciliation (US5) ───────────────────────────────────────────

  async getConciliation(
    params?: ConciliationParams,
  ): Promise<ConciliationResponse> {
    return this.request<ConciliationResponse>('GET', '/conciliation', {
      params: params as unknown as Record<string, unknown>,
    });
  }

  // ─── Utility (US5) ────────────────────────────────────────────────

  async listBanks(): Promise<BankListResponse> {
    return this.request<BankListResponse>('GET', '/bank');
  }

  async listPaymentMethods(): Promise<PaymentMethodListResponse> {
    return this.request<PaymentMethodListResponse>('GET', '/payment-method');
  }

  // ─── Private Helpers ──────────────────────────────────────────────

  private ensureOperational(): void {
    if (!this.enabled) {
      throw new PaykuException(
        'Payku service is not configured. Set PAYKU_PUBLIC_TOKEN and PAYKU_PRIVATE_TOKEN environment variables.',
        HttpStatus.SERVICE_UNAVAILABLE,
      );
    }
  }

  private getBearerHeaders(): Record<string, string> {
    return {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${this.config.publicToken}`,
    };
  }

  private getSignedHeaders(
    requestPath: string,
    body: Record<string, unknown>,
  ): Record<string, string> {
    const signature = this.signatureService.sign(requestPath, body);
    return {
      ...this.getBearerHeaders(),
      Sign: signature,
    };
  }

  private async request<T>(
    method: 'GET' | 'POST' | 'DELETE' | 'PUT' | 'PATCH',
    path: string,
    options?: {
      data?: Record<string, unknown>;
      params?: Record<string, unknown>;
      signed?: boolean;
    },
  ): Promise<T> {
    this.ensureOperational();

    const url = `${this.baseUrl}${path}`;
    const headers =
      options?.signed && options?.data
        ? this.getSignedHeaders(path, options.data)
        : this.getBearerHeaders();

    const axiosConfig: AxiosRequestConfig = {
      method,
      url,
      headers,
      data: options?.data,
      params: options?.params,
      timeout: 30000,
    };

    this.logger.debug(
      `Payku API ${method} ${path}`,
      PaykuService.name,
    );

    try {
      const response = await axios(axiosConfig);
      return response.data as T;
    } catch (error) {
      this.handleApiError(error, `${method} ${path}`);
    }
  }

  private handleApiError(error: unknown, context: string): never {
    if (error instanceof AxiosError) {
      const status = error.response?.status;
      const data = error.response?.data;
      const message =
        typeof data === 'object' && data !== null && 'message' in data
          ? String((data as Record<string, unknown>).message)
          : error.message;

      this.logger.error(
        `Payku API error on ${context}: ${status} - ${message}`,
        error.stack,
        PaykuService.name,
      );

      throw new PaykuException(
        `Payku API error: ${message}`,
        HttpStatus.BAD_GATEWAY,
        status,
        message,
      );
    }

    this.logger.error(
      `Payku unexpected error on ${context}`,
      error instanceof Error ? error.stack : String(error),
      PaykuService.name,
    );

    throw new PaykuException(
      'Payku API unexpected error',
      HttpStatus.BAD_GATEWAY,
    );
  }
}
