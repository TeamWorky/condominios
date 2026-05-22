# Tasks: Payku Payment Gateway Integration

**Input**: Design documents from `/specs/007-payku-integration/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/payku-integration-api.md

**Tests**: Included per constitution requirement (Test-First Development, 70%+ coverage).

**Organization**: Tasks grouped by user story. US1 and US2 are both P1 but US2 depends on the entity/service changes from US1. US3 is independent of US2.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Register PaykuModule in the application and configure new environment variables

- [X] T001 [P] Import PaykuModule in `apps/api/src/app.module.ts` (add to imports array alongside RedisModule, EmailModule)
- [X] T002 [P] Add `PAYKU_RETURN_URL` and `PAYKU_NOTIFY_URL` optional env vars to `libs/infrastructure/src/config/env.validation.ts` (Joi string, optional, default empty)
- [X] T003 [P] Add `ONLINE` value to PaymentMethod enum in `libs/shared/src/enums/payment-method.enum.ts`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Entity changes and migration that ALL user stories depend on

**CRITICAL**: No user story work can begin until this phase is complete

- [X] T004 Add `paykuTransactionId` column (varchar 255, nullable) to Payment entity in `apps/api/src/payments/entities/payment.entity.ts`
- [X] T005 Create migration `libs/database/src/migrations/1706650000010-AddPaykuTransactionIdToPayments.ts` — add `paykuTransactionId` column to `payments` table (up: addColumn, down: dropColumn)
- [X] T006 Register PaykuWebhookController in `apps/api/src/payments/payments.module.ts` (add to controllers array)
- [X] T007 Verify existing tests still pass after entity change: run `npm test -- --testPathPattern=payments`

**Checkpoint**: Foundation ready — entity extended, PaykuModule available, env vars configured

---

## Phase 3: User Story 1 — Initiate Online Payment (Priority: P1) MVP

**Goal**: Admin can initiate an online payment for a PENDING/OVERDUE payment and receive a Payku payment URL

**Independent Test**: Create a pending payment, call `POST /payments/:id/initiate`, verify Payku transaction ID stored and payment URL returned

### Tests for User Story 1

> **NOTE: Write tests FIRST, ensure they FAIL before implementation**

- [X] T008 [P] [US1] Write unit tests for `initiatePayment()` method in `apps/api/src/payments/payments.service.spec.ts` — test cases: happy path PENDING, happy path OVERDUE, reject PAID, reject CANCELLED, reject PARTIAL, Payku not operational (503), re-initiate replaces old transaction ID, Payku API error propagation
- [X] T009 [P] [US1] Write unit tests for `initiate()` controller endpoint in `apps/api/src/payments/payments.controller.spec.ts` — test cases: success returns payment URL, propagates NotFoundException, propagates BusinessException

### Implementation for User Story 1

- [X] T010 [US1] Implement `initiatePayment(id: string, condominiumId: string, userEmail: string)` method in `apps/api/src/payments/payments.service.ts`:
  - Inject `PaykuService` (add to constructor)
  - Inject `ConfigService` (for PAYKU_RETURN_URL, PAYKU_NOTIFY_URL)
  - Call `findOne(id, condominiumId)` to get payment with tenant scoping
  - Validate status is PENDING or OVERDUE (throw BusinessException otherwise)
  - Check `PaykuService.isOperational()` (throw ServiceUnavailable if false)
  - Check PAYKU_RETURN_URL and PAYKU_NOTIFY_URL are configured
  - Build `CreateTransactionRequest`: email from user, order = payment.id, subject from period+unit, amount, currency CLP, payment = PaykuPaymentMethod.ALL, urlreturn, urlnotify
  - Call `PaykuService.createTransaction(request)`
  - Store `paykuTransactionId` on payment entity and save
  - Invalidate cache
  - Log initiation event
  - Return `{ paymentId, paykuTransactionId, paymentUrl }`
- [X] T011 [US1] Add `initiate()` endpoint to `apps/api/src/payments/payments.controller.ts`:
  - `POST payments/:id/initiate`, Version 1, MinRole(ADMIN)
  - Extract `user.condominioId` and `user.email` from `@CurrentUser()`
  - Call `paymentsService.initiatePayment(id, condominioId, email)`
  - Return `ResponseUtil.success(result, SUCCESS_MESSAGES.UPDATED)`
  - Swagger decorators: @ApiOperation, @ApiParam, @ApiResponse (200, 400, 404, 502, 503)
- [X] T012 [US1] Verify US1 tests pass: run `npm test -- --testPathPattern=payments`

**Checkpoint**: Initiate endpoint functional — admin can create Payku transactions and get payment URLs

---

## Phase 4: User Story 2 — Automatic Payment Confirmation via Webhook (Priority: P1)

**Goal**: Payku webhook automatically confirms payments — updates status to PAID with correct metadata

**Independent Test**: Simulate Payku webhook POST, verify payment record updated to PAID with paidDate and paymentMethod=ONLINE

### Tests for User Story 2

> **NOTE: Write tests FIRST, ensure they FAIL before implementation**

- [X] T013 [P] [US2] Write unit tests for `handleWebhook()` method in `apps/api/src/payments/payments.service.spec.ts` — test cases: success webhook updates to PAID, failed webhook logs and skips, idempotent (already PAID skips), unknown order ID logs and skips, amount mismatch rejects, Payku not operational logs warning, soft-deleted payment skips
- [X] T014 [P] [US2] Write unit tests for PaykuWebhookController in `apps/api/src/payments/payku-webhook.controller.spec.ts` — test cases: success returns `{ received: true }`, always returns 200 even on failure, controller is defined

### Implementation for User Story 2

- [X] T015 [US2] Implement `handleWebhook(payload: PaykuWebhookPayload)` method in `apps/api/src/payments/payments.service.ts`:
  - Find payment by `payload.order` (payment ID) — use `paymentRepository.findOne({ where: { id: payload.order } })` (no tenant scoping — webhook has no JWT context)
  - If payment not found: log warning, return without error
  - If payment already PAID: log info (idempotent), return without error
  - Check `PaykuService.isOperational()` — if false, log warning and return
  - Call `PaykuService.getTransaction(payload.transaction_id)` to verify
  - Compare `gateway_response.status === 'success'`
  - Compare amount from Payku response against `payment.amount` (log security event on mismatch, return)
  - Update payment: status=PAID, paidDate=new Date(), paymentMethod=ONLINE, reference=payload.transaction_id, paykuTransactionId=payload.transaction_id
  - Save and invalidate cache
  - Log success event with payment ID, transaction ID, amount
- [X] T016 [US2] Create `apps/api/src/payments/payku-webhook.controller.ts`:
  - `@Controller()`, `@ApiTags('Payments')`
  - `@UseGuards(JwtAuthGuard, MinRoleGuard)` at class level (inherited from route guards)
  - `@Post('payments/webhook/payku')`, `@Version('1')`, `@Public()`, `@HttpCode(200)`
  - Accept `@Body() payload: PaykuWebhookPayload` (use the interface from `@condominios/infrastructure`)
  - Call `paymentsService.handleWebhook(payload)`
  - Return `{ received: true }`
  - Swagger: @ApiOperation, @ApiResponse(200)
- [X] T017 [US2] Verify US2 tests pass: run `npm test -- --testPathPattern=payments`

**Checkpoint**: Full payment flow works — initiate → user pays on Payku → webhook confirms → payment marked PAID

---

## Phase 5: User Story 3 — Check Payku Transaction Status (Priority: P2)

**Goal**: Admin can check real-time Payku transaction status for troubleshooting without modifying payment records

**Independent Test**: Call `GET /payments/:id/payku-status` for a payment with a Payku transaction ID, verify Payku details returned

### Tests for User Story 3

> **NOTE: Write tests FIRST, ensure they FAIL before implementation**

- [X] T018 [P] [US3] Write unit tests for `getPaykuStatus()` method in `apps/api/src/payments/payments.service.spec.ts` — test cases: happy path returns Payku details, no Payku transaction ID throws BusinessException, Payku not operational throws, Payku API error propagates
- [X] T019 [P] [US3] Write unit tests for `getPaykuStatus()` controller endpoint in `apps/api/src/payments/payments.controller.spec.ts` — test cases: success, propagates BusinessException, propagates NotFoundException

### Implementation for User Story 3

- [X] T020 [US3] Implement `getPaykuStatus(id: string, condominiumId: string)` method in `apps/api/src/payments/payments.service.ts`:
  - Call `findOne(id, condominiumId)` for tenant-scoped lookup
  - If `!payment.paykuTransactionId`: throw BusinessException('No Payku transaction exists for this payment')
  - Check `PaykuService.isOperational()` (throw ServiceUnavailable if false)
  - Call `PaykuService.getTransaction(payment.paykuTransactionId)`
  - Return `{ paymentId, paykuTransactionId, paykuStatus: details.gateway_response.status, paykuDetails: details }`
  - NO writes to payment record — read-only
- [X] T021 [US3] Add `getPaykuStatus()` endpoint to `apps/api/src/payments/payments.controller.ts`:
  - `GET payments/:id/payku-status`, Version 1, MinRole(ADMIN)
  - Extract `user.condominioId` from `@CurrentUser()`
  - Call `paymentsService.getPaykuStatus(id, condominioId)`
  - Return `ResponseUtil.success(result)`
  - Swagger decorators: @ApiOperation, @ApiParam, @ApiResponse (200, 400, 404, 502, 503)
- [X] T022 [US3] Verify US3 tests pass: run `npm test -- --testPathPattern=payments`

**Checkpoint**: All 3 endpoints functional — initiate, webhook, status check

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Final validation, coverage, and documentation

- [X] T023 Run full test suite: `npm test` — verify zero regressions
- [X] T024 Run coverage check: `npm run test:cov` — verify 70%+ on payments module
- [X] T025 Run linter: `npm run lint` — verify no lint errors
- [X] T026 Update payments spec `payments.spec.md` in `.speckit/specs/` to reflect new Payku integration endpoints
- [X] T027 Update `CLAUDE.md` Module Status table: Payments status from "STUB" to implementation status reflecting Payku integration

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — can start immediately. All 3 tasks are parallel.
- **Foundational (Phase 2)**: Depends on Phase 1 completion — BLOCKS all user stories.
- **US1 (Phase 3)**: Depends on Phase 2. Core payment initiation flow.
- **US2 (Phase 4)**: Depends on Phase 2. Can run in parallel with US1 (different methods/controller), but logically builds on US1 (webhook processes transactions created by initiate).
- **US3 (Phase 5)**: Depends on Phase 2. Fully independent of US2. Can run in parallel with US1/US2.
- **Polish (Phase 6)**: Depends on all user stories complete.

### User Story Dependencies

- **US1 (P1)**: After Phase 2 — no dependencies on other stories
- **US2 (P1)**: After Phase 2 — logically pairs with US1 but independently testable (mock the Payku transaction ID)
- **US3 (P2)**: After Phase 2 — fully independent, only needs `paykuTransactionId` on entity (from Phase 2)

### Within Each User Story

- Tests MUST be written and FAIL before implementation
- Service methods before controller endpoints
- Verification run after each story

### Parallel Opportunities

- T001, T002, T003 can all run in parallel (Phase 1)
- T008+T009 can run in parallel (US1 tests)
- T013+T014 can run in parallel (US2 tests)
- T018+T019 can run in parallel (US3 tests)
- US1 and US3 can run in parallel after Phase 2
- US2 can run in parallel with US3

---

## Parallel Example: Phase 1

```bash
# All 3 setup tasks touch different files:
Task T001: "Import PaykuModule in apps/api/src/app.module.ts"
Task T002: "Add env vars to libs/infrastructure/src/config/env.validation.ts"
Task T003: "Add ONLINE to libs/shared/src/enums/payment-method.enum.ts"
```

## Parallel Example: User Story 1

```bash
# Tests can run in parallel (different test files):
Task T008: "Service tests in apps/api/src/payments/payments.service.spec.ts"
Task T009: "Controller tests in apps/api/src/payments/payments.controller.spec.ts"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (3 tasks, parallel)
2. Complete Phase 2: Foundational (4 tasks, sequential)
3. Complete Phase 3: User Story 1 (5 tasks)
4. **STOP and VALIDATE**: Test initiate endpoint independently
5. Admin can create Payku transactions and share payment URLs

### Incremental Delivery

1. Setup + Foundational → Foundation ready
2. Add US1 → Test independently → MVP: Online payment initiation
3. Add US2 → Test independently → Full flow: Automatic payment confirmation
4. Add US3 → Test independently → Admin troubleshooting capability
5. Polish → All tests pass, coverage met, docs updated

### Sequential Execution (Single Developer)

1. Phase 1: T001, T002, T003 (parallel, ~5 min)
2. Phase 2: T004 → T005 → T006 → T007 (~15 min)
3. Phase 3: T008+T009 → T010 → T011 → T012 (~45 min)
4. Phase 4: T013+T014 → T015 → T016 → T017 (~45 min)
5. Phase 5: T018+T019 → T020 → T021 → T022 (~30 min)
6. Phase 6: T023 → T024 → T025 → T026 → T027 (~15 min)

**Estimated total**: ~27 tasks, ~2.5 hours

---

## Notes

- PaykuService is already @Global — no per-module import needed after T001
- Webhook controller is separate from PaymentsController to isolate @Public() from JWT-protected endpoints
- All service methods mock PaykuService in tests — no real API calls during testing
- Constitution requires TDD: tests written first, must fail, then implement
- Webhook always returns 200 to Payku regardless of internal processing result
