# Tasks: Payku Payment Gateway Library

**Input**: Design documents from `/specs/005-payku-library/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/

**Tests**: Tests are REQUIRED per constitution (II. Test-First Development) and spec (SC-002: 70%+ coverage).

**Organization**: Tasks grouped by user story for independent implementation and testing.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

**Infrastructure Library Structure:**
- Source code: `libs/infrastructure/src/payku/`
- Interfaces: `libs/infrastructure/src/payku/interfaces/`
- Tests: `libs/infrastructure/src/payku/*.spec.ts` (co-located)
- Barrel exports: `libs/infrastructure/src/payku/index.ts` and `libs/infrastructure/src/index.ts`
- Env validation: `libs/infrastructure/src/config/env.validation.ts`

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Create directory structure, config interfaces, and shared types

- [x] T001 Create directory structure `libs/infrastructure/src/payku/` and `libs/infrastructure/src/payku/interfaces/`
- [x] T002 [P] Create PaykuConfig interface in `libs/infrastructure/src/payku/interfaces/payku-config.interface.ts` (publicToken, privateToken, sandbox, baseUrl)
- [x] T003 [P] Create PaykuException class extending HttpException with paykuStatusCode and paykuMessage in `libs/infrastructure/src/payku/payku.exception.ts`
- [x] T004 [P] Add PAYKU_PUBLIC_TOKEN, PAYKU_PRIVATE_TOKEN, PAYKU_SANDBOX to Joi schema in `libs/infrastructure/src/config/env.validation.ts` (all optional with safe defaults)

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core services that ALL user stories depend on — PaykuSignatureService and PaykuModule

**CRITICAL**: No user story work can begin until this phase is complete

- [x] T005 Create PaykuSignatureService with `sign(requestPath, body)` method implementing HMAC-SHA256 algorithm (sort keys, exclude objects/arrays, URL-encode path, join with `&`, sign with private token) in `libs/infrastructure/src/payku/payku-signature.service.ts`
- [x] T006 Write unit tests for PaykuSignatureService in `libs/infrastructure/src/payku/payku-signature.service.spec.ts` — test with Payku documented test vector (path: `/api/suclient/`, token: `fe551abcef62fcf002dc598922e68f0a`, expected: `d891663698d31aa8b68babe96ac6497f5a0d874024368102998d5b79a4d12c36`), test key sorting, test object/array exclusion, test empty body
- [x] T007 Create PaykuModule as `@Global()` with `PAYKU_CONFIG` useFactory provider (ConfigService → PaykuConfig), import ConfigModule and LoggerModule, export PaykuService and PaykuSignatureService in `libs/infrastructure/src/payku/payku.module.ts`
- [x] T008 Create PaykuService skeleton with constructor injection of `PAYKU_CONFIG`, `PaykuSignatureService`, `LoggerService`; private `request()` helper for axios calls with Bearer headers; `isOperational()` method in `libs/infrastructure/src/payku/payku.service.ts`
- [x] T009 [P] Create webhook payload interface in `libs/infrastructure/src/payku/interfaces/webhook.interface.ts` (transaction_id, payment_key, transaction_key, verification_key, order, status)

**Checkpoint**: Foundation ready — PaykuModule injectable, signature service working, base HTTP client ready

---

## Phase 3: User Story 1 - Process a One-Time Payment Transaction (Priority: P1) MVP

**Goal**: Create, retrieve, list, and delete transactions through Payku. Provide webhook payload typing.

**Independent Test**: Create transaction in sandbox → receive payment URL → verify status retrieval by ID

### Tests for User Story 1

> **NOTE: Write tests FIRST, ensure they FAIL before implementation**

- [x] T010 [US1] Write unit tests for transaction methods (createTransaction, getTransaction, listTransactions, deleteTransaction) in `libs/infrastructure/src/payku/payku.service.spec.ts` — mock axios, test correct URL/headers/body, test success responses, test PaykuException on API errors, test isOperational() guard

### Implementation for User Story 1

- [x] T011 [P] [US1] Create transaction interfaces (CreateTransactionRequest, TransactionCreateResponse, TransactionDetailResponse, TransactionListResponse, TransactionListParams, PaymentDetail, GatewayResponse) in `libs/infrastructure/src/payku/interfaces/transaction.interface.ts` — include PaykuPaymentMethod enum (1=WEBPAY, 4=ETPAY, 9=MACH, 19=FINTOC, 23=TENPO, 26=FLOID, etc.) and PaykuTransactionStatus type
- [x] T012 [US1] Implement `createTransaction(data)` method in `libs/infrastructure/src/payku/payku.service.ts` — POST `/api/transaction` with Bearer auth, return TransactionCreateResponse with payment URL
- [x] T013 [US1] Implement `getTransaction(id)` method in `libs/infrastructure/src/payku/payku.service.ts` — GET `/api/transaction/{id}` with Bearer auth
- [x] T014 [US1] Implement `listTransactions(params?)` method in `libs/infrastructure/src/payku/payku.service.ts` — GET `/api/transaction` with query params (page, per_page, date_init, date_end, status filters)
- [x] T015 [US1] Implement `deleteTransaction(id)` method in `libs/infrastructure/src/payku/payku.service.ts` — DELETE `/api/transaction/{id}` with Bearer auth
- [x] T016 [US1] Run US1 tests to verify all pass: `npm test -- --testPathPatterns="payku"`

**Checkpoint**: Transaction CRUD fully functional and independently testable

---

## Phase 4: User Story 2 - Refund a Completed Payment (Priority: P2)

**Goal**: Nullify (refund) completed transactions through Payku with signed requests.

**Independent Test**: Nullify a completed sandbox transaction → verify refund status returned

### Tests for User Story 2

- [ ] T017 [US2] Write unit tests for nullification methods (nullifyTransaction, getNullification) in `libs/infrastructure/src/payku/payku.service.spec.ts` — verify Sign header is included, test PaykuException on invalid transaction

### Implementation for User Story 2

- [ ] T018 [P] [US2] Create nullification interfaces (CreateNullificationRequest, NullificationResponse, PaykuNullificationStatus) in `libs/infrastructure/src/payku/interfaces/nullification.interface.ts`
- [ ] T019 [US2] Implement `nullifyTransaction(data)` method in `libs/infrastructure/src/payku/payku.service.ts` — POST `/api/nullification` with Bearer + Sign headers (uses PaykuSignatureService)
- [ ] T020 [US2] Implement `getNullification(id)` method in `libs/infrastructure/src/payku/payku.service.ts` — GET `/api/nullification/{id}` with Bearer auth
- [ ] T021 [US2] Run US2 tests to verify all pass: `npm test -- --testPathPatterns="payku"`

**Checkpoint**: Refund lifecycle functional — create and query nullifications

---

## Phase 5: User Story 3 - Graceful Operation Without Credentials (Priority: P2)

**Goal**: Application starts without crashing when Payku credentials are missing. Service reports non-operational status.

**Independent Test**: Start app with empty PAYKU_PUBLIC_TOKEN/PAYKU_PRIVATE_TOKEN → no crash → `isOperational()` returns false → payment methods throw PaykuException explaining "not configured"

### Tests for User Story 3

- [ ] T022 [US3] Write unit tests for graceful degradation in `libs/infrastructure/src/payku/payku.service.spec.ts` — test isOperational() returns false when tokens empty, test all methods throw PaykuException with "not configured" message when not operational, test constructor logs warning when tokens missing

### Implementation for User Story 3

- [ ] T023 [US3] Add operational check guard to all public methods in `libs/infrastructure/src/payku/payku.service.ts` — if `!isOperational()` throw PaykuException with "Payku service is not configured" message and HttpStatus.SERVICE_UNAVAILABLE
- [ ] T024 [US3] Add constructor warning log via LoggerService when tokens are empty in `libs/infrastructure/src/payku/payku.service.ts`
- [ ] T025 [US3] Run US3 tests to verify all pass: `npm test -- --testPathPatterns="payku"`

**Checkpoint**: App starts safely without Payku credentials in any environment

---

## Phase 6: User Story 4 - Sandbox vs Production Environment Toggle (Priority: P3)

**Goal**: PAYKU_SANDBOX env var toggles between sandbox and production base URLs.

**Independent Test**: Set PAYKU_SANDBOX=true → verify requests go to `des.payku.cl`; set PAYKU_SANDBOX=false → verify requests go to `app.payku.cl`

### Tests for User Story 4

- [ ] T026 [US4] Write unit tests for environment toggle in `libs/infrastructure/src/payku/payku.service.spec.ts` — test baseUrl is `https://des.payku.cl/api` when sandbox=true, test baseUrl is `https://app.payku.cl/api` when sandbox=false, verify default is sandbox=true

### Implementation for User Story 4

- [ ] T027 [US4] Verify PAYKU_CONFIG useFactory correctly derives baseUrl from sandbox flag in `libs/infrastructure/src/payku/payku.module.ts` — sandbox=true → `https://des.payku.cl/api`, sandbox=false → `https://app.payku.cl/api`, default=true
- [ ] T028 [US4] Run US4 tests to verify all pass: `npm test -- --testPathPatterns="payku"`

**Checkpoint**: Environment toggle working — sandbox by default, production opt-in

---

## Phase 7: User Story 5 - Signed Requests for Sensitive Operations (Priority: P3)

**Goal**: Wallet, subscription, marketplace, and mall endpoints include HMAC-SHA256 signature in Sign header.

**Independent Test**: Create signed request → verify HMAC matches known test vector; verify wallet/subscription/mall methods include Sign header

### Tests for User Story 5

- [ ] T029 [US5] Write unit tests for signed endpoint methods (wallet, subscription, marketplace, mall) in `libs/infrastructure/src/payku/payku.service.spec.ts` — verify signatureService.sign() is called, verify Sign header is present in request, test with mock signature

### Implementation for User Story 5

- [ ] T030 [P] [US5] Create wallet interfaces (WalletPayoutRequest, WalletWithdrawRequest, WalletBalanceResponse, WalletPayoutResponse, WalletListResponse, WalletDetailResponse, PayoutDetailResponse) in `libs/infrastructure/src/payku/interfaces/wallet.interface.ts`
- [ ] T031 [P] [US5] Create subscription interfaces (CreateSubscriptionClientRequest, SubscriptionClientResponse, CreateSubscriptionRequest, SubscriptionResponse, CreateSubscriptionPlanRequest, SubscriptionPlanResponse, CreateSubscriptionTransactionRequest, SubscriptionTransactionResponse, list responses) in `libs/infrastructure/src/payku/interfaces/subscription.interface.ts`
- [ ] T032 [P] [US5] Create marketplace interfaces (CreateMarketplaceClientRequest, MarketplaceClientResponse, CreateMarketplaceAffiliationRequest, MarketplaceAffiliationResponse) in `libs/infrastructure/src/payku/interfaces/marketplace.interface.ts`
- [ ] T033 [P] [US5] Create mall interfaces (CreateMallTransactionRequest, MallTransactionResponse) in `libs/infrastructure/src/payku/interfaces/mall.interface.ts`
- [ ] T034 [P] [US5] Create event interfaces (CreateEventRequest, EventResponse) in `libs/infrastructure/src/payku/interfaces/event.interface.ts`
- [ ] T035 [P] [US5] Create conciliation interfaces (ConciliationParams, ConciliationResponse) in `libs/infrastructure/src/payku/interfaces/conciliation.interface.ts`
- [ ] T036 [US5] Implement wallet methods (createPayout, createWithdrawal, getWalletBalance, listWalletTransactions, getWalletTransaction, getPayoutStatus) in `libs/infrastructure/src/payku/payku.service.ts` — payout/withdraw use Bearer + Sign, others use Bearer only
- [ ] T037 [US5] Implement subscription methods (createSubscriptionClient, getSubscriptionClient, listSubscriptionClients, createSubscription, getSubscription, createSubscriptionTransaction, createSubscriptionPlan, getSubscriptionPlan, listSubscriptionPlans) in `libs/infrastructure/src/payku/payku.service.ts` — mutations use Bearer + Sign
- [ ] T038 [US5] Implement marketplace methods (createMarketplaceClient, getMarketplaceClient, createMarketplaceAffiliation, getMarketplaceAffiliation) in `libs/infrastructure/src/payku/payku.service.ts` — mutations use Bearer + Sign
- [ ] T039 [US5] Implement mall methods (createMallTransaction, getMallTransaction) in `libs/infrastructure/src/payku/payku.service.ts` — createMallTransaction uses Bearer + Sign
- [ ] T040 [US5] Implement event methods (createEvent, getEvent) in `libs/infrastructure/src/payku/payku.service.ts` — Bearer only
- [ ] T041 [US5] Implement conciliation method (getConciliation) in `libs/infrastructure/src/payku/payku.service.ts` — Bearer only
- [ ] T042 [US5] Implement utility methods (listBanks, listPaymentMethods) in `libs/infrastructure/src/payku/payku.service.ts` — Bearer only
- [ ] T043 [US5] Run US5 tests to verify all pass: `npm test -- --testPathPatterns="payku"`

**Checkpoint**: All Payku API operations available — wallet, subscriptions, marketplace, mall, events, conciliation, utilities

---

## Phase 8: Polish & Cross-Cutting Concerns

**Purpose**: Barrel exports, integration, documentation, final validation

- [ ] T044 [P] Create interfaces barrel export in `libs/infrastructure/src/payku/interfaces/index.ts` — export all interface files
- [ ] T045 [P] Create payku barrel export in `libs/infrastructure/src/payku/index.ts` — export PaykuModule, PaykuService, PaykuSignatureService, PaykuException, all interfaces
- [ ] T046 Add Payku exports to infrastructure barrel in `libs/infrastructure/src/index.ts` — PaykuModule, PaykuService, PaykuSignatureService, PaykuException, interfaces
- [ ] T047 Run full test suite to verify no regressions: `npm test`
- [ ] T048 Run coverage check: `npm run test:cov` — verify payku files >= 70%
- [ ] T049 Run linter: `npm run lint` — verify no import errors
- [ ] T050 Update CLAUDE.md: add PaykuService to Frontend Services section (or Infrastructure Services), update Recent Changes with 005-payku-library

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — can start immediately
- **Foundational (Phase 2)**: Depends on Phase 1 (T001-T004) — BLOCKS all user stories
- **US1 (Phase 3)**: Depends on Phase 2 — core transaction operations
- **US2 (Phase 4)**: Depends on Phase 2 — can run in parallel with US1 (different methods, but same file)
- **US3 (Phase 5)**: Depends on Phase 2 + at least one service method existing (US1 recommended first)
- **US4 (Phase 6)**: Depends on Phase 2 — can run in parallel with US1
- **US5 (Phase 7)**: Depends on Phase 2 (signature service) — can run in parallel with US1
- **Polish (Phase 8)**: Depends on ALL user stories being complete

### Recommended Execution Order (Sequential)

```
Phase 1 (Setup) → Phase 2 (Foundation) → Phase 3 (US1/MVP) → Phase 4 (US2) → Phase 5 (US3) → Phase 6 (US4) → Phase 7 (US5) → Phase 8 (Polish)
```

### Within Each User Story

- Tests written FIRST and must FAIL
- Interfaces before service methods
- Service implementation after interfaces
- Run tests to verify PASS

### Parallel Opportunities

- T002, T003, T004 (Phase 1 — different files)
- T011, T018 (interfaces — different files)
- T030, T031, T032, T033, T034, T035 (Phase 7 interfaces — all different files)
- T044, T045 (barrel exports — different files)

---

## Parallel Example: User Story 1

```bash
# Launch interface creation (parallel):
Task T011: "Create transaction interfaces in libs/infrastructure/src/payku/interfaces/transaction.interface.ts"

# Then sequential implementation:
Task T012: "Implement createTransaction in payku.service.ts"
Task T013: "Implement getTransaction in payku.service.ts"
Task T014: "Implement listTransactions in payku.service.ts"
Task T015: "Implement deleteTransaction in payku.service.ts"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (T001-T004)
2. Complete Phase 2: Foundational (T005-T009)
3. Complete Phase 3: User Story 1 (T010-T016)
4. **STOP and VALIDATE**: Run `npm test -- --testPathPatterns="payku"` — all pass
5. Transaction CRUD is fully functional — MVP delivered

### Incremental Delivery

1. Setup + Foundational → Foundation ready
2. Add US1 (transactions) → Test → MVP!
3. Add US2 (refunds) → Test → Payment lifecycle complete
4. Add US3 (graceful degradation) → Test → Dev experience
5. Add US4 (sandbox toggle) → Test → Environment safety
6. Add US5 (signed endpoints) → Test → Full API coverage
7. Polish → All exports, coverage, lint → Feature complete

---

## Notes

- This is an infrastructure library (HTTP client wrapper) — no database entities, no controllers
- All code in `libs/infrastructure/src/payku/` — follows RedisModule/EmailModule patterns
- Tests mock axios at module level — no actual HTTP calls in tests
- PaykuSignatureService has a known test vector from Payku docs for validation
- Webhook payload interface is typed but webhook handling (controller) is in the payments module (separate feature)
- Total: 50 tasks across 8 phases
