# Tasks: Payments Backend CRUD

**Input**: Design documents from `/specs/006-payments-backend/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/

**Tests**: Included — spec requires 70% minimum test coverage.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

---

## Phase 1: Setup

**Purpose**: DTOs, module configuration, and shared constants needed by all user stories

- [X] T001 [P] Create CreatePaymentDto with class-validator decorators and Swagger annotations in `apps/api/src/payments/dto/create-payment.dto.ts`
- [X] T002 [P] Create UpdatePaymentDto using PartialType(OmitType(CreatePaymentDto, ['unitId'])) in `apps/api/src/payments/dto/update-payment.dto.ts`
- [X] T003 [P] Create ChangeStatusDto with status (required), paymentMethod (optional), reference (optional) in `apps/api/src/payments/dto/change-status.dto.ts`
- [X] T004 Update PaymentsModule to import UnitsModule, register controller and service in `apps/api/src/payments/payments.module.ts`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core service with CRUD methods and condominium scoping — MUST complete before user stories

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [X] T005 Implement PaymentsService with constructor injecting Repository<Payment>, UnitsService, LoggerService, RedisCacheService. Add VALID_TRANSITIONS constant map, CACHE_TTL and CACHE_KEYS constants. Implement private helper `validateCondominiumScope()` using QueryBuilder join chain (payment→unit→building→condominium). File: `apps/api/src/payments/payments.service.ts`
- [X] T006 Implement PaymentsController with @ApiTags('Payments'), @ApiBearerAuth('JWT-auth'), @UseGuards(JwtAuthGuard, MinRoleGuard). Declare all 7 endpoint method stubs (empty bodies calling service). File: `apps/api/src/payments/payments.controller.ts`

**Checkpoint**: Module compiles, controller routes registered, service injectable

---

## Phase 3: User Story 1 — Register a Payment (Priority: P1) 🎯 MVP

**Goal**: Administrators can create a payment for a unit with amount, period, dueDate and get a PENDING payment back

**Independent Test**: POST /api/v1/units/:unitId/payments returns 201 with status PENDING

### Implementation for User Story 1

- [X] T007 [US1] Implement `create(unitId, createPaymentDto, condominiumId)` method in PaymentsService: validate unit exists and belongs to condominium via UnitsService, validate residentId if provided, create payment with status PENDING, save, invalidate cache, log. File: `apps/api/src/payments/payments.service.ts`
- [X] T008 [US1] Implement POST endpoint `@Post('units/:unitId/payments')` with @Version('1'), @MinRole(Role.ADMIN), @HttpCode(201). Extract condominiumId from request user JWT. Wrap response with ResponseUtil.success(). File: `apps/api/src/payments/payments.controller.ts`

### Tests for User Story 1

- [X] T009 [P] [US1] Write unit tests for PaymentsService.create() — happy path, invalid unit, negative amount, invalid period format, unit from different condominium. File: `apps/api/src/payments/payments.service.spec.ts`
- [X] T010 [P] [US1] Write unit tests for PaymentsController POST endpoint — success 201, validation errors 400, unit not found 404. File: `apps/api/src/payments/payments.controller.spec.ts`

**Checkpoint**: Can create payments via POST, tests pass for create flow

---

## Phase 4: User Story 2 — List Payments (Priority: P1)

**Goal**: Administrators can view paginated payment lists scoped by condominium or unit

**Independent Test**: GET /condominiums/:condoId/payments and GET /units/:unitId/payments return paginated results

### Implementation for User Story 2

- [X] T011 [US2] Implement `findAllByCondominium(condominiumId, paginationDto)` method in PaymentsService: QueryBuilder with joins to unit.building.condominium, left join unit and building for response data, pagination with getManyAndCount(), cache with getOrSet(). File: `apps/api/src/payments/payments.service.ts`
- [X] T012 [US2] Implement `findAllByUnit(unitId, condominiumId, paginationDto)` method in PaymentsService: validate unit belongs to condominium, QueryBuilder filtered by unitId, pagination, cache. File: `apps/api/src/payments/payments.service.ts`
- [X] T013 [US2] Implement GET endpoints: `@Get('condominiums/:condoId/payments')` and `@Get('units/:unitId/payments')` with @Version('1'), @MinRole(Role.USER), @Query() PaginationDto. Wrap with ResponseUtil.paginated(). File: `apps/api/src/payments/payments.controller.ts`

### Tests for User Story 2

- [X] T014 [P] [US2] Write unit tests for findAllByCondominium() and findAllByUnit() — pagination, empty results, condominium scoping, cache usage. File: `apps/api/src/payments/payments.service.spec.ts`
- [X] T015 [P] [US2] Write unit tests for GET list endpoints — paginated response, query params, 404 for invalid unit. File: `apps/api/src/payments/payments.controller.spec.ts`

**Checkpoint**: Can list payments by condominium and by unit, paginated

---

## Phase 5: User Story 3 — View Payment Details (Priority: P2)

**Goal**: Administrators can view full payment details including unit and resident info

**Independent Test**: GET /api/v1/payments/:id returns payment with unit and resident relations

### Implementation for User Story 3

- [X] T016 [US3] Implement `findOne(id, condominiumId)` method in PaymentsService: QueryBuilder with joins to unit.building.condominium for scoping, left join resident for optional data, cache, throw NotFoundException if not found or wrong condominium. File: `apps/api/src/payments/payments.service.ts`
- [X] T017 [US3] Implement GET endpoint `@Get('payments/:id')` with @Version('1'), @MinRole(Role.USER). Wrap with ResponseUtil.success(). File: `apps/api/src/payments/payments.controller.ts`

### Tests for User Story 3

- [X] T018 [P] [US3] Write unit tests for findOne() — found, not found, wrong condominium returns 404, includes unit and resident data. File: `apps/api/src/payments/payments.service.spec.ts`
- [X] T019 [P] [US3] Write unit tests for GET detail endpoint — success 200, not found 404. File: `apps/api/src/payments/payments.controller.spec.ts`

**Checkpoint**: Can view payment details with full relation data

---

## Phase 6: User Story 4 — Update Payment (Priority: P2)

**Goal**: Administrators can update payment fields, but cannot change amount on PAID payments

**Independent Test**: PATCH /api/v1/payments/:id updates fields, rejects amount change on PAID

### Implementation for User Story 4

- [X] T020 [US4] Implement `update(id, updatePaymentDto, condominiumId)` method in PaymentsService: call findOne() for scoping, check if status is PAID and amount is being changed → throw BadRequestException, Object.assign + save, invalidate cache, log. File: `apps/api/src/payments/payments.service.ts`
- [X] T021 [US4] Implement PATCH endpoint `@Patch('payments/:id')` with @Version('1'), @MinRole(Role.ADMIN). Wrap with ResponseUtil.success(). File: `apps/api/src/payments/payments.controller.ts`

### Tests for User Story 4

- [X] T022 [P] [US4] Write unit tests for update() — happy path, amount change rejected on PAID, partial update, not found. File: `apps/api/src/payments/payments.service.spec.ts`
- [X] T023 [P] [US4] Write unit tests for PATCH endpoint — success 200, validation 400, not found 404. File: `apps/api/src/payments/payments.controller.spec.ts`

**Checkpoint**: Can update payments with PAID amount protection

---

## Phase 7: User Story 5 — Mark Payment as Paid / Change Status (Priority: P1)

**Goal**: Administrators can change payment status with transition validation, auto-set paidDate on PAID

**Independent Test**: PATCH /api/v1/payments/:id/status transitions correctly, rejects invalid transitions

### Implementation for User Story 5

- [X] T024 [US5] Implement `changeStatus(id, changeStatusDto, condominiumId)` method in PaymentsService: call findOne(), validate transition using VALID_TRANSITIONS map → throw BadRequestException if invalid, set paidDate to new Date() when transitioning to PAID, update paymentMethod and reference if provided, save, invalidate cache, log. File: `apps/api/src/payments/payments.service.ts`
- [X] T025 [US5] Implement PATCH endpoint `@Patch('payments/:id/status')` with @Version('1'), @MinRole(Role.ADMIN). Wrap with ResponseUtil.success(). File: `apps/api/src/payments/payments.controller.ts`

### Tests for User Story 5

- [X] T026 [P] [US5] Write unit tests for changeStatus() — PENDING→PAID (sets paidDate), OVERDUE→PAID, PAID→PENDING rejected, CANCELLED→any rejected, all valid transitions, all invalid transitions. File: `apps/api/src/payments/payments.service.spec.ts`
- [X] T027 [P] [US5] Write unit tests for PATCH status endpoint — success 200, invalid transition 400, not found 404. File: `apps/api/src/payments/payments.controller.spec.ts`

**Checkpoint**: Status transitions work correctly with PAID/CANCELLED as terminal states

---

## Phase 8: User Story 6 — Soft Delete Payment (Priority: P3)

**Goal**: Administrators can soft-delete payments, but cannot delete PAID payments

**Independent Test**: DELETE /api/v1/payments/:id returns 204, payment excluded from list queries

### Implementation for User Story 6

- [X] T028 [US6] Implement `remove(id, condominiumId)` method in PaymentsService: call findOne(), check if status is PAID → throw BadRequestException, use softDelete or SoftDeleteRepositoryHelper, invalidate cache, log. File: `apps/api/src/payments/payments.service.ts`
- [X] T029 [US6] Implement DELETE endpoint `@Delete('payments/:id')` with @Version('1'), @MinRole(Role.ADMIN), @HttpCode(204). File: `apps/api/src/payments/payments.controller.ts`

### Tests for User Story 6

- [X] T030 [P] [US6] Write unit tests for remove() — happy path (PENDING deleted), PAID rejection, not found, verify soft-deleted excluded from lists. File: `apps/api/src/payments/payments.service.spec.ts`
- [X] T031 [P] [US6] Write unit tests for DELETE endpoint — success 204, PAID rejection 400, not found 404. File: `apps/api/src/payments/payments.controller.spec.ts`

**Checkpoint**: Soft delete works with PAID protection

---

## Phase 9: Polish & Cross-Cutting Concerns

**Purpose**: Final validation and documentation

- [X] T032 Verify PaymentsModule is registered in AppModule at `apps/api/src/app.module.ts`
- [X] T033 Add Swagger decorators (@ApiOperation, @ApiResponse, @ApiParam) to all 7 controller endpoints in `apps/api/src/payments/payments.controller.ts`
- [X] T034 Run all tests and verify 70% coverage: `npm test` and `npm run test:cov`
- [X] T035 Run lint: `npm run lint`
- [X] T036 Execute QA manual validation following `specs/006-payments-backend/quickstart.md` (13 test steps)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — DTOs can be created immediately
- **Foundational (Phase 2)**: Depends on Phase 1 (DTOs) — BLOCKS all user stories
- **US1 Register (Phase 3)**: Depends on Phase 2 — first story to implement
- **US2 List (Phase 4)**: Depends on Phase 2 — can start after Phase 2 (parallel with US1 if staffed)
- **US3 Detail (Phase 5)**: Depends on Phase 2 — can start after Phase 2
- **US4 Update (Phase 6)**: Depends on US3 (uses findOne internally)
- **US5 Status (Phase 7)**: Depends on US3 (uses findOne internally)
- **US6 Delete (Phase 8)**: Depends on US3 (uses findOne internally)
- **Polish (Phase 9)**: Depends on all user stories complete

### User Story Dependencies

```
Phase 1 (Setup: DTOs)
  └──→ Phase 2 (Foundational: Service + Controller stubs)
         ├──→ US1 (Register) ──→ independent
         ├──→ US2 (List) ──→ independent
         └──→ US3 (Detail) ──→ US4 (Update)
                            ──→ US5 (Status)
                            ──→ US6 (Delete)
```

### Parallel Opportunities

- T001, T002, T003 can run in parallel (different DTO files)
- US1 and US2 can run in parallel after Phase 2 (different service methods)
- Tests within each story (T009/T010, T014/T015, etc.) can run in parallel
- US4, US5, US6 can run in parallel after US3 (different service methods, all depend on findOne)

---

## Implementation Strategy

### MVP First (US1 + US2 only)

1. Complete Phase 1: DTOs (T001-T004)
2. Complete Phase 2: Service + Controller stubs (T005-T006)
3. Complete US1: Register payment (T007-T010)
4. Complete US2: List payments (T011-T015)
5. **STOP and VALIDATE**: Can create and list payments

### Recommended Sequential Order (single developer)

1. Phase 1 → Phase 2 → US1 → US2 → US3 → US5 → US4 → US6 → Polish
2. Note: US5 (status change) before US4 (update) because status is higher priority (P1 vs P2)

---

## Notes

- Entity `payment.entity.ts` already exists — no entity creation needed
- All service methods need condominiumId parameter for scoping (from JWT)
- Cache invalidation on every write operation (create, update, status change, delete)
- Tests mock Repository, UnitsService, LoggerService, RedisCacheService
- Use QueryBuilder (not find/findOne) for condominium scoping via joins
