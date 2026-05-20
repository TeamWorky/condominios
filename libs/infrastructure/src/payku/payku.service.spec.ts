import axios from 'axios';
import { PaykuService } from './payku.service';
import { PaykuSignatureService } from './payku-signature.service';
import { PaykuException } from './payku.exception';
import { PaykuConfig } from './interfaces/payku-config.interface';
import { HttpStatus } from '@nestjs/common';
import { PaykuPaymentMethod } from './interfaces/transaction.interface';

jest.mock('axios');
const mockedAxios = axios as jest.MockedFunction<typeof axios>;

describe('PaykuService', () => {
  let service: PaykuService;
  let signatureService: PaykuSignatureService;

  const mockConfig: PaykuConfig = {
    publicToken: 'test-public-token',
    privateToken: 'test-private-token',
    sandbox: true,
    baseUrl: 'https://des.payku.cl/api',
  };

  const emptyConfig: PaykuConfig = {
    publicToken: '',
    privateToken: '',
    sandbox: true,
    baseUrl: 'https://des.payku.cl/api',
  };

  const mockLogger = {
    log: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
    debug: jest.fn(),
    verbose: jest.fn(),
  };

  const mockSignatureService = {
    sign: jest.fn().mockReturnValue('mock-signature'),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    signatureService = mockSignatureService as unknown as PaykuSignatureService;
    service = new PaykuService(
      mockConfig,
      signatureService,
      mockLogger as any,
    );
  });

  describe('isOperational', () => {
    it('should return true when tokens are configured', () => {
      expect(service.isOperational()).toBe(true);
    });

    it('should return false when tokens are empty', () => {
      const disabledService = new PaykuService(
        emptyConfig,
        signatureService,
        mockLogger as any,
      );
      expect(disabledService.isOperational()).toBe(false);
    });

    it('should log warning when tokens are missing', () => {
      new PaykuService(emptyConfig, signatureService, mockLogger as any);
      expect(mockLogger.warn).toHaveBeenCalledWith(
        'Payku service disabled: tokens not configured',
        'PaykuService',
      );
    });
  });

  describe('graceful degradation (US3)', () => {
    let disabledService: PaykuService;

    beforeEach(() => {
      disabledService = new PaykuService(
        emptyConfig,
        signatureService,
        mockLogger as any,
      );
    });

    it('should throw PaykuException when createTransaction is called without credentials', async () => {
      await expect(
        disabledService.createTransaction({
          email: 'test@test.com',
          order: '123',
          subject: 'Test',
          amount: 1000,
          payment: PaykuPaymentMethod.WEBPAY,
          urlreturn: 'https://example.com/return',
          urlnotify: 'https://example.com/notify',
        }),
      ).rejects.toThrow(PaykuException);
    });

    it('should throw with SERVICE_UNAVAILABLE status', async () => {
      try {
        await disabledService.getTransaction('trx123');
      } catch (error) {
        expect(error).toBeInstanceOf(PaykuException);
        expect((error as PaykuException).getStatus()).toBe(
          HttpStatus.SERVICE_UNAVAILABLE,
        );
      }
    });
  });

  describe('createTransaction (US1)', () => {
    const createRequest = {
      email: 'johndoe@example.com',
      order: '12345',
      subject: 'Test payment',
      amount: 25000,
      currency: 'CLP',
      payment: PaykuPaymentMethod.WEBPAY,
      urlreturn: 'https://example.com/return',
      urlnotify: 'https://example.com/notify',
    };

    it('should create a transaction and return payment URL', async () => {
      mockedAxios.mockResolvedValueOnce({
        data: {
          status: 'pending',
          id: 'trx3b4d77b43acd9a720',
          url: 'https://des.payku.cl/pay/trx3b4d77b43acd9a720',
        },
      });

      const result = await service.createTransaction(createRequest);

      expect(result.status).toBe('pending');
      expect(result.id).toBe('trx3b4d77b43acd9a720');
      expect(result.url).toBeDefined();
      expect(mockedAxios).toHaveBeenCalledWith(
        expect.objectContaining({
          method: 'POST',
          url: 'https://des.payku.cl/api/transaction',
          headers: expect.objectContaining({
            Authorization: 'Bearer test-public-token',
          }),
          data: createRequest,
        }),
      );
    });

    it('should throw PaykuException on API error', async () => {
      const axiosError = {
        isAxiosError: true,
        response: { status: 400, data: { message: 'Bad Request' } },
        message: 'Request failed',
        stack: 'Error stack',
      };
      mockedAxios.mockRejectedValueOnce(axiosError);

      // Mock AxiosError check
      const { AxiosError: RealAxiosError } = jest.requireActual('axios');
      Object.setPrototypeOf(axiosError, RealAxiosError.prototype);

      await expect(service.createTransaction(createRequest)).rejects.toThrow(
        PaykuException,
      );
    });
  });

  describe('getTransaction (US1)', () => {
    it('should get a transaction by ID', async () => {
      const mockResponse = {
        status: 'success',
        id: 'trx123',
        created_at: '2024-01-01 10:00:00',
        order: '12345',
        email: 'test@test.com',
        subject: 'Test',
        amount: '25000',
        payment: {},
        gateway_response: { status: 'success', message: 'successful transaction' },
      };

      mockedAxios.mockResolvedValueOnce({ data: mockResponse });

      const result = await service.getTransaction('trx123');

      expect(result.status).toBe('success');
      expect(result.id).toBe('trx123');
      expect(mockedAxios).toHaveBeenCalledWith(
        expect.objectContaining({
          method: 'GET',
          url: 'https://des.payku.cl/api/transaction/trx123',
        }),
      );
    });
  });

  describe('listTransactions (US1)', () => {
    it('should list transactions with default params', async () => {
      mockedAxios.mockResolvedValueOnce({
        data: { transaction: [] },
      });

      const result = await service.listTransactions();

      expect(result.transaction).toEqual([]);
      expect(mockedAxios).toHaveBeenCalledWith(
        expect.objectContaining({
          method: 'GET',
          url: 'https://des.payku.cl/api/transaction',
        }),
      );
    });

    it('should pass query params for filtering', async () => {
      mockedAxios.mockResolvedValueOnce({
        data: { transaction: [] },
      });

      await service.listTransactions({
        page: 1,
        per_page: 50,
        date_init: '2024-01-01',
        date_end: '2024-12-31',
        success: true,
      });

      expect(mockedAxios).toHaveBeenCalledWith(
        expect.objectContaining({
          params: {
            page: 1,
            per_page: 50,
            date_init: '2024-01-01',
            date_end: '2024-12-31',
            success: true,
          },
        }),
      );
    });
  });

  describe('deleteTransaction (US1)', () => {
    it('should delete a pending transaction', async () => {
      mockedAxios.mockResolvedValueOnce({ data: {} });

      await service.deleteTransaction('trx123');

      expect(mockedAxios).toHaveBeenCalledWith(
        expect.objectContaining({
          method: 'DELETE',
          url: 'https://des.payku.cl/api/transaction/trx123',
        }),
      );
    });
  });

  describe('nullifyTransaction (US2)', () => {
    it('should nullify a transaction with signed request', async () => {
      mockedAxios.mockResolvedValueOnce({
        data: { status: 'pending', id: 'null123' },
      });

      const result = await service.nullifyTransaction({
        id: 'trx123',
        amount: 25000,
        subject: 'Refund test',
      });

      expect(result.status).toBe('pending');
      expect(mockedAxios).toHaveBeenCalledWith(
        expect.objectContaining({
          method: 'POST',
          url: 'https://des.payku.cl/api/nullification',
          headers: expect.objectContaining({
            Sign: 'mock-signature',
            Authorization: 'Bearer test-public-token',
          }),
        }),
      );
      expect(mockSignatureService.sign).toHaveBeenCalled();
    });
  });

  describe('getNullification (US2)', () => {
    it('should get nullification status by ID', async () => {
      mockedAxios.mockResolvedValueOnce({
        data: { status: 'complete', id: 'null123' },
      });

      const result = await service.getNullification('null123');

      expect(result.status).toBe('complete');
      expect(mockedAxios).toHaveBeenCalledWith(
        expect.objectContaining({
          method: 'GET',
          url: 'https://des.payku.cl/api/nullification/null123',
        }),
      );
    });
  });

  describe('sandbox toggle (US4)', () => {
    it('should use sandbox URL when sandbox=true', () => {
      const sandboxService = new PaykuService(
        { ...mockConfig, sandbox: true, baseUrl: 'https://des.payku.cl/api' },
        signatureService,
        mockLogger as any,
      );
      expect(sandboxService.isOperational()).toBe(true);
      // URL verified through axios calls in other tests
    });

    it('should use production URL when sandbox=false', async () => {
      const prodConfig: PaykuConfig = {
        ...mockConfig,
        sandbox: false,
        baseUrl: 'https://app.payku.cl/api',
      };
      const prodService = new PaykuService(
        prodConfig,
        signatureService,
        mockLogger as any,
      );

      mockedAxios.mockResolvedValueOnce({
        data: { status: 'success', id: 'trx123', created_at: '', order: '', email: '', subject: '', amount: '', payment: {}, gateway_response: {} },
      });

      await prodService.getTransaction('trx123');

      expect(mockedAxios).toHaveBeenCalledWith(
        expect.objectContaining({
          url: 'https://app.payku.cl/api/transaction/trx123',
        }),
      );
    });
  });

  describe('wallet methods (US5)', () => {
    it('should create payout with signed request', async () => {
      mockedAxios.mockResolvedValueOnce({ data: { status: 'pending', id: 'po123' } });
      await service.createPayout({ email: 'test@test.com', amount: 5000, bank_id: 'b1', account_number: '123', account_type: 'checking', rut: '12345678-9', name: 'User' } as any);
      expect(mockedAxios).toHaveBeenCalledWith(expect.objectContaining({ method: 'POST', url: 'https://des.payku.cl/api/wallet/payout', headers: expect.objectContaining({ Sign: 'mock-signature' }) }));
    });

    it('should create withdrawal with signed request', async () => {
      mockedAxios.mockResolvedValueOnce({ data: { status: 'pending', id: 'wd123' } });
      await service.createWithdrawal({ amount: 3000, bank_id: 'b1', account_number: '123', account_type: 'savings', rut: '12345678-9', name: 'User' } as any);
      expect(mockedAxios).toHaveBeenCalledWith(expect.objectContaining({ method: 'POST', url: 'https://des.payku.cl/api/wallet/withdraw', headers: expect.objectContaining({ Sign: 'mock-signature' }) }));
    });

    it('should get wallet balance', async () => {
      mockedAxios.mockResolvedValueOnce({ data: { balance: 50000 } });
      const result = await service.getWalletBalance();
      expect(result.balance).toBe(50000);
      expect(mockedAxios).toHaveBeenCalledWith(expect.objectContaining({ url: 'https://des.payku.cl/api/wallet/balance' }));
    });

    it('should list wallet transactions', async () => {
      mockedAxios.mockResolvedValueOnce({ data: { data: [] } });
      await service.listWalletTransactions();
      expect(mockedAxios).toHaveBeenCalledWith(expect.objectContaining({ url: 'https://des.payku.cl/api/wallet' }));
    });

    it('should get wallet transaction by ID', async () => {
      mockedAxios.mockResolvedValueOnce({ data: { id: 'wt123' } });
      await service.getWalletTransaction('wt123');
      expect(mockedAxios).toHaveBeenCalledWith(expect.objectContaining({ url: 'https://des.payku.cl/api/wallet/wt123' }));
    });

    it('should get payout status', async () => {
      mockedAxios.mockResolvedValueOnce({ data: { id: 'po123', status: 'completed' } });
      await service.getPayoutStatus('po123');
      expect(mockedAxios).toHaveBeenCalledWith(expect.objectContaining({ url: 'https://des.payku.cl/api/wallet/payout/po123' }));
    });
  });

  describe('subscription methods (US5)', () => {
    it('should create subscription client with signed request', async () => {
      mockedAxios.mockResolvedValueOnce({ data: { status: 'ok', id: 'sc123' } });
      await service.createSubscriptionClient({ email: 'sub@test.com', name: 'Sub User' } as any);
      expect(mockedAxios).toHaveBeenCalledWith(expect.objectContaining({ method: 'POST', url: 'https://des.payku.cl/api/suclient', headers: expect.objectContaining({ Sign: 'mock-signature' }) }));
    });

    it('should get subscription client', async () => {
      mockedAxios.mockResolvedValueOnce({ data: { id: 'sc123' } });
      await service.getSubscriptionClient('sc123');
      expect(mockedAxios).toHaveBeenCalledWith(expect.objectContaining({ url: 'https://des.payku.cl/api/suclient/sc123' }));
    });

    it('should list subscription clients', async () => {
      mockedAxios.mockResolvedValueOnce({ data: { data: [] } });
      await service.listSubscriptionClients();
      expect(mockedAxios).toHaveBeenCalledWith(expect.objectContaining({ url: 'https://des.payku.cl/api/suclient' }));
    });

    it('should create subscription with signed request', async () => {
      mockedAxios.mockResolvedValueOnce({ data: { status: 'active', id: 'sub123' } });
      await service.createSubscription({ suclient_id: 'sc123', suplan_id: 'sp123', start_date: '2024-01-01' } as any);
      expect(mockedAxios).toHaveBeenCalledWith(expect.objectContaining({ method: 'POST', url: 'https://des.payku.cl/api/subscription', headers: expect.objectContaining({ Sign: 'mock-signature' }) }));
    });

    it('should get subscription by ID', async () => {
      mockedAxios.mockResolvedValueOnce({ data: { id: 'sub123' } });
      await service.getSubscription('sub123');
      expect(mockedAxios).toHaveBeenCalledWith(expect.objectContaining({ url: 'https://des.payku.cl/api/subscription/sub123' }));
    });

    it('should create subscription transaction with signed request', async () => {
      mockedAxios.mockResolvedValueOnce({ data: { status: 'pending' } });
      await service.createSubscriptionTransaction({ subscription_id: 'sub123', amount: 15000 } as any);
      expect(mockedAxios).toHaveBeenCalledWith(expect.objectContaining({ method: 'POST', url: 'https://des.payku.cl/api/subscription/transaction', headers: expect.objectContaining({ Sign: 'mock-signature' }) }));
    });

    it('should create subscription plan with signed request', async () => {
      mockedAxios.mockResolvedValueOnce({ data: { id: 'sp123', name: 'Basic' } });
      await service.createSubscriptionPlan({ name: 'Basic', amount: 10000, currency: 'CLP', period: 'monthly' } as any);
      expect(mockedAxios).toHaveBeenCalledWith(expect.objectContaining({ method: 'POST', url: 'https://des.payku.cl/api/suplan', headers: expect.objectContaining({ Sign: 'mock-signature' }) }));
    });

    it('should get and list subscription plans', async () => {
      mockedAxios.mockResolvedValueOnce({ data: { id: 'sp123' } });
      await service.getSubscriptionPlan('sp123');
      expect(mockedAxios).toHaveBeenCalledWith(expect.objectContaining({ url: 'https://des.payku.cl/api/suplan/sp123' }));

      mockedAxios.mockResolvedValueOnce({ data: { data: [] } });
      await service.listSubscriptionPlans();
      expect(mockedAxios).toHaveBeenCalledWith(expect.objectContaining({ url: 'https://des.payku.cl/api/suplan' }));
    });
  });

  describe('marketplace methods (US5)', () => {
    it('should create marketplace client with signed request', async () => {
      mockedAxios.mockResolvedValueOnce({ data: { status: 'ok', id: 'mc123' } });
      await service.createMarketplaceClient({ email: 'market@test.com', name: 'Market User' });
      expect(mockedAxios).toHaveBeenCalledWith(expect.objectContaining({ method: 'POST', url: 'https://des.payku.cl/api/marketplace/client', headers: expect.objectContaining({ Sign: 'mock-signature' }) }));
    });

    it('should get marketplace client', async () => {
      mockedAxios.mockResolvedValueOnce({ data: { id: 'mc123' } });
      await service.getMarketplaceClient('mc123');
      expect(mockedAxios).toHaveBeenCalledWith(expect.objectContaining({ url: 'https://des.payku.cl/api/marketplace/client/mc123' }));
    });

    it('should create marketplace affiliation with signed request', async () => {
      mockedAxios.mockResolvedValueOnce({ data: { status: 'ok', id: 'aff123' } });
      await service.createMarketplaceAffiliation({ client_id: 'mc123', percentage: 15 });
      expect(mockedAxios).toHaveBeenCalledWith(expect.objectContaining({ method: 'POST', url: 'https://des.payku.cl/api/marketplace/affiliation', headers: expect.objectContaining({ Sign: 'mock-signature' }) }));
    });

    it('should get marketplace affiliation', async () => {
      mockedAxios.mockResolvedValueOnce({ data: { id: 'aff123' } });
      await service.getMarketplaceAffiliation('aff123');
      expect(mockedAxios).toHaveBeenCalledWith(expect.objectContaining({ url: 'https://des.payku.cl/api/marketplace/affiliation/aff123' }));
    });
  });

  describe('mall methods (US5)', () => {
    it('should create mall transaction with signed request', async () => {
      mockedAxios.mockResolvedValueOnce({ data: { status: 'pending', id: 'mall123', url: 'https://pay.url' } });
      await service.createMallTransaction({ email: 'mall@test.com', order: 'ord-123', subject: 'Mall', amount: 50000, payment: 1, urlreturn: 'https://r.com', urlnotify: 'https://n.com', stores: [{ store_id: 's1', amount: 25000, order: 'so1', subject: 'S1' }] });
      expect(mockedAxios).toHaveBeenCalledWith(expect.objectContaining({ method: 'POST', url: 'https://des.payku.cl/api/mall/transaction', headers: expect.objectContaining({ Sign: 'mock-signature' }) }));
    });

    it('should get mall transaction', async () => {
      mockedAxios.mockResolvedValueOnce({ data: { id: 'mall123' } });
      await service.getMallTransaction('mall123');
      expect(mockedAxios).toHaveBeenCalledWith(expect.objectContaining({ url: 'https://des.payku.cl/api/mall/transaction/mall123' }));
    });
  });

  describe('event methods (US5)', () => {
    it('should create event', async () => {
      mockedAxios.mockResolvedValueOnce({ data: { status: 'ok', id: 'ev123' } });
      await service.createEvent({ name: 'Test Event', amount: 10000, payment: 1, urlreturn: 'https://r.com', urlnotify: 'https://n.com' });
      expect(mockedAxios).toHaveBeenCalledWith(expect.objectContaining({ method: 'POST', url: 'https://des.payku.cl/api/event' }));
    });

    it('should get event', async () => {
      mockedAxios.mockResolvedValueOnce({ data: { id: 'ev123' } });
      await service.getEvent('ev123');
      expect(mockedAxios).toHaveBeenCalledWith(expect.objectContaining({ url: 'https://des.payku.cl/api/event/ev123' }));
    });
  });

  describe('conciliation methods (US5)', () => {
    it('should get conciliation data with params', async () => {
      mockedAxios.mockResolvedValueOnce({ data: { data: [] } });
      await service.getConciliation({ date_init: '2024-01-01', date_end: '2024-12-31' });
      expect(mockedAxios).toHaveBeenCalledWith(expect.objectContaining({ method: 'GET', url: 'https://des.payku.cl/api/conciliation', params: { date_init: '2024-01-01', date_end: '2024-12-31' } }));
    });
  });

  describe('utility methods (US5)', () => {
    it('should list banks', async () => {
      mockedAxios.mockResolvedValueOnce({ data: { data: [{ id: '1', name: 'BancoEstado' }] } });
      const result = await service.listBanks();
      expect(result.data).toHaveLength(1);
      expect(mockedAxios).toHaveBeenCalledWith(expect.objectContaining({ url: 'https://des.payku.cl/api/bank' }));
    });

    it('should list payment methods', async () => {
      mockedAxios.mockResolvedValueOnce({ data: { data: [{ id: 1, name: 'Webpay' }] } });
      const result = await service.listPaymentMethods();
      expect(result.data).toHaveLength(1);
      expect(mockedAxios).toHaveBeenCalledWith(expect.objectContaining({ url: 'https://des.payku.cl/api/payment-method' }));
    });
  });

  describe('error handling', () => {
    it('should handle network errors', async () => {
      mockedAxios.mockRejectedValueOnce(new Error('Network Error'));

      await expect(service.getTransaction('trx123')).rejects.toThrow(
        PaykuException,
      );
    });

    it('should handle timeout errors', async () => {
      const timeoutError = new Error('timeout of 30000ms exceeded');
      mockedAxios.mockRejectedValueOnce(timeoutError);

      await expect(service.getTransaction('trx123')).rejects.toThrow(
        PaykuException,
      );
    });
  });
});
