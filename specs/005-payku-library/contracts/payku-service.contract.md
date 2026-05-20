# PaykuService Contract

This library is an HTTP client wrapper — no REST controllers exposed. The "contract" is the public API of PaykuService.

## PaykuService Public Methods

### Health Check

| Method | Params | Returns | Auth |
|--------|--------|---------|------|
| `isOperational()` | none | `boolean` | N/A |

### Transactions (Bearer only)

| Method | Params | Returns | Auth | Payku Endpoint |
|--------|--------|---------|------|----------------|
| `createTransaction(data)` | `CreateTransactionRequest` | `TransactionCreateResponse` | Bearer | `POST /api/transaction` |
| `getTransaction(id)` | `string` | `TransactionDetailResponse` | Bearer | `GET /api/transaction/{id}` |
| `listTransactions(params?)` | `TransactionListParams?` | `TransactionListResponse` | Bearer | `GET /api/transaction` |
| `deleteTransaction(id)` | `string` | `void` | Bearer | `DELETE /api/transaction/{id}` |

### Nullification (Bearer + Sign)

| Method | Params | Returns | Auth | Payku Endpoint |
|--------|--------|---------|------|----------------|
| `nullifyTransaction(data)` | `CreateNullificationRequest` | `NullificationResponse` | Bearer + HMAC | `POST /api/nullification` |
| `getNullification(id)` | `string` | `NullificationResponse` | Bearer | `GET /api/nullification/{id}` |

### Wallet (Bearer + Sign)

| Method | Params | Returns | Auth | Payku Endpoint |
|--------|--------|---------|------|----------------|
| `createPayout(data)` | `WalletPayoutRequest` | `WalletPayoutResponse` | Bearer + HMAC | `POST /api/wallet/payout` |
| `createWithdrawal(data)` | `WalletWithdrawRequest` | `WalletWithdrawResponse` | Bearer + HMAC | `POST /api/wallet/withdraw` |
| `getWalletBalance()` | none | `WalletBalanceResponse` | Bearer | `GET /api/wallet` |
| `listWalletTransactions()` | none | `WalletListResponse` | Bearer | `GET /api/wallet/list` |
| `getWalletTransaction(id)` | `string` | `WalletDetailResponse` | Bearer | `GET /api/wallet/{id}` |
| `getPayoutStatus(id)` | `string` | `PayoutDetailResponse` | Bearer | `GET /api/payout/{id}` |

### Subscriptions (Bearer + Sign for mutations)

| Method | Params | Returns | Auth | Payku Endpoint |
|--------|--------|---------|------|----------------|
| `createSubscriptionClient(data)` | `CreateSubscriptionClientRequest` | `SubscriptionClientResponse` | Bearer + HMAC | `POST /api/suclient` |
| `getSubscriptionClient(id)` | `string` | `SubscriptionClientResponse` | Bearer | `GET /api/suclient/{id}` |
| `listSubscriptionClients()` | none | `SubscriptionClientListResponse` | Bearer | `GET /api/suclient/customers` |
| `createSubscription(data)` | `CreateSubscriptionRequest` | `SubscriptionResponse` | Bearer + HMAC | `POST /api/sususcription` |
| `getSubscription(id)` | `string` | `SubscriptionResponse` | Bearer | `GET /api/sususcription/{id}` |
| `createSubscriptionTransaction(data)` | `CreateSubscriptionTransactionRequest` | `SubscriptionTransactionResponse` | Bearer + HMAC | `POST /api/sutransaction` |
| `createSubscriptionPlan(data)` | `CreateSubscriptionPlanRequest` | `SubscriptionPlanResponse` | Bearer + HMAC | `POST /api/suplan/` |
| `getSubscriptionPlan(id)` | `string` | `SubscriptionPlanResponse` | Bearer | `GET /api/suplan/{id}` |
| `listSubscriptionPlans()` | none | `SubscriptionPlanListResponse` | Bearer | `GET /api/suplan/plans` |

### Marketplace (Bearer + Sign)

| Method | Params | Returns | Auth | Payku Endpoint |
|--------|--------|---------|------|----------------|
| `createMarketplaceClient(data)` | `CreateMarketplaceClientRequest` | `MarketplaceClientResponse` | Bearer + HMAC | `POST /api/maclient` |
| `getMarketplaceClient(id)` | `string` | `MarketplaceClientResponse` | Bearer | `GET /api/maclient/{id}` |
| `createMarketplaceAffiliation(data)` | `CreateMarketplaceAffiliationRequest` | `MarketplaceAffiliationResponse` | Bearer + HMAC | `POST /api/maaffiliation` |
| `getMarketplaceAffiliation(id)` | `string` | `MarketplaceAffiliationResponse` | Bearer | `GET /api/maaffiliation/{id}` |

### Mall (Bearer + Sign)

| Method | Params | Returns | Auth | Payku Endpoint |
|--------|--------|---------|------|----------------|
| `createMallTransaction(data)` | `CreateMallTransactionRequest` | `MallTransactionResponse` | Bearer + HMAC | `POST /api/transaction/` (mall) |
| `getMallTransaction(id)` | `string` | `MallTransactionResponse` | Bearer | `GET /api/mall/{id}` |

### Events (Bearer only)

| Method | Params | Returns | Auth | Payku Endpoint |
|--------|--------|---------|------|----------------|
| `createEvent(data)` | `CreateEventRequest` | `EventResponse` | Bearer | `POST /api/event` |
| `getEvent(id)` | `string` | `EventResponse` | Bearer | `GET /api/event/{id}` |

### Conciliation (Bearer only)

| Method | Params | Returns | Auth | Payku Endpoint |
|--------|--------|---------|------|----------------|
| `getConciliation(params?)` | `ConciliationParams?` | `ConciliationResponse` | Bearer | `GET /api/conciliation` |

### Utilities (Bearer only)

| Method | Params | Returns | Auth | Payku Endpoint |
|--------|--------|---------|------|----------------|
| `listBanks(currency?)` | `string?` | `BankListResponse` | Bearer | `GET /api/banks` |
| `listPaymentMethods(currency?)` | `string?` | `PaymentMethodListResponse` | Bearer | `GET /api/paymentmethods` |

## PaykuSignatureService Public Methods

| Method | Params | Returns | Description |
|--------|--------|---------|-------------|
| `sign(requestPath, body)` | `string, Record<string, any>` | `string` | Generate HMAC-SHA256 signature for the given path and body |

## Error Handling

All methods throw `PaykuException` on API errors. The exception contains:
- `message`: Human-readable error description
- `paykuStatusCode`: Original HTTP status from Payku (400, 401, 404, etc.)
- `paykuMessage`: Original error message from Payku response
- `getStatus()`: Returns `HttpStatus.BAD_GATEWAY` (502) by default
