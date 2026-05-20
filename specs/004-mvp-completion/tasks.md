# 004 - MVP Completion: Tasks

## Dependency Graph

```
WP5.1 (JWT fix) ──┐
WP5.2 (Refresh) ──┼── WP1.1 (Payments BE) ──→ WP3 (Payments FE) ──→ WP3.4 (Dashboard)
WP5.3 (Bcrypt) ───┘        │
                            ├── WP6.1 (Payments Migration)
WP1.2 (Spaces BE) ─────────┼── WP4.1 (Spaces FE Fix)
        │                   │
        └── WP1.3 (Reservations BE) ──→ WP4.2 (Reservations FE Fix)
                    │
                    └── WP6.3 (Reservations Migration)

WP2 (Tests) ──────── Independent (parallel)
WP5.4-5.8 (Security) ── Independent (parallel)
WP7 (CI/CD) ──────── After WP1-3 complete
WP8 (FE Quality) ──── Independent (parallel)
WP9 (Docs) ──────── After WP1-3 complete
```

---

## Sprint 1: Security + Payments + Common Spaces

### [ ] Task 1: [security] Fix JWT Secret Fallback Defaults
**Agent**: Security Engineer
**Priority**: P0
**Files**:
- `apps/api/src/auth/auth.service.ts`
- `apps/api/src/auth/auth.module.ts`
**Acceptance Criteria**:
- JWT_SECRET and JWT_REFRESH_SECRET throw ConfigError if missing
- No fallback default values remain
- App refuses to start without proper secrets
- Existing tests updated
**Effort**: 1h

### [ ] Task 2: [security] Fix Refresh Token Decode → Verify
**Agent**: Security Engineer
**Priority**: P0
**Files**:
- `apps/api/src/auth/auth.controller.ts`
**Acceptance Criteria**:
- Replace `jwtService.decode()` with `jwtService.verify()` for refresh tokens
- Tampered tokens rejected with 401
- Auth controller tests updated
**Effort**: 1h

### [ ] Task 3: [security] Increase Bcrypt Rounds to 12
**Agent**: Security Engineer
**Priority**: P0
**Files**:
- `apps/api/src/users/entities/user.entity.ts`
- `apps/api/src/auth/auth.service.ts` (if bcrypt used here too)
**Acceptance Criteria**:
- `genSalt(12)` used everywhere
- Existing users still authenticate (bcrypt auto-detects rounds)
**Effort**: 30min

### [ ] Task 4: [backend] Create Payments DTOs
**Agent**: Backend Architect
**Priority**: P0
**Files**:
- `apps/api/src/payments/dto/create-payment.dto.ts` (new)
- `apps/api/src/payments/dto/update-payment.dto.ts` (new)
**Acceptance Criteria**:
- CreatePaymentDto: amount (decimal, required, > 0), period (string, required), dueDate (date, required), paymentMethod (enum, optional), reference (string, optional), notes (string, optional)
- UpdatePaymentDto: PartialType(CreatePaymentDto) + status (PaymentStatus enum)
- All fields have class-validator decorators
- Enums imported from @condominios/shared
**Effort**: 1h

### [ ] Task 5: [backend] Implement Payments Service
**Agent**: Backend Architect
**Priority**: P0
**Depends on**: Task 4
**Files**:
- `apps/api/src/payments/payments.service.ts` (new)
**Acceptance Criteria**:
- CRUD: create, findAll (paginated), findByUnit, findOne, update, updateStatus, softDelete
- Scoped by unitId on create
- Filterable by status, period, dueDate range
- Redis cache integration (TTL 300s/60s)
- Proper error handling (NotFoundException, BadRequestException)
**Effort**: 3h

### [ ] Task 6: [backend] Implement Payments Controller
**Agent**: Backend Architect
**Priority**: P0
**Depends on**: Task 5
**Files**:
- `apps/api/src/payments/payments.controller.ts` (new)
- `apps/api/src/payments/payments.module.ts` (modify)
**Acceptance Criteria**:
- 7 endpoints: POST (create), GET (list by condo), GET (list by unit), GET (by id), PATCH (update), PATCH (status), DELETE (soft)
- Guards: MinRole(ADMIN) for write, MinRole(USER) for read
- Swagger decorators on all endpoints
- API versioning: /api/v1/
**Effort**: 2h

### [ ] Task 7: [test] Payments Backend Tests
**Agent**: API Tester
**Priority**: P0
**Depends on**: Task 6
**Files**:
- `apps/api/src/payments/payments.service.spec.ts` (new)
- `apps/api/src/payments/payments.controller.spec.ts` (new)
**Acceptance Criteria**:
- Service: all CRUD methods, error cases, cache invalidation
- Controller: all endpoints, guards, validation, pagination
- 70%+ coverage for payments module
**Effort**: 3h

### [ ] Task 8: [database] Verify/Create Payments Migration
**Agent**: Database Optimizer
**Priority**: P0
**Depends on**: Task 4
**Files**:
- `libs/database/src/migrations/` (verify or create)
**Acceptance Criteria**:
- payments table matches entity definition
- Indexes on: (unitId, period), (status), (dueDate)
- Foreign keys: unitId → units(id), residentId → residents(id)
- Soft delete column (deletedAt)
**Effort**: 1h

### [ ] Task 9: [backend] Create Common Spaces DTOs
**Agent**: Backend Architect
**Priority**: P1
**Files**:
- `apps/api/src/common-spaces/dto/create-common-space.dto.ts` (new)
- `apps/api/src/common-spaces/dto/update-common-space.dto.ts` (new)
**Acceptance Criteria**:
- CreateCommonSpaceDto: name, type (enum), description, location, capacity, area, amenities (array), isReservable, reservationStartTime, reservationEndTime, isExclusive
- class-validator decorators on all fields
- Enums from @condominios/shared
**Effort**: 1h

### [ ] Task 10: [backend] Implement Common Spaces Service
**Agent**: Backend Architect
**Priority**: P1
**Depends on**: Task 9
**Files**:
- `apps/api/src/common-spaces/common-spaces.service.ts` (new)
**Acceptance Criteria**:
- CRUD: create, findAll (paginated), findByBuilding, findOne, update, softDelete
- Scoped by buildingId on create
- Filterable by type, isReservable, isActive
- Redis cache
**Effort**: 2h

### [ ] Task 11: [backend] Implement Common Spaces Controller
**Agent**: Backend Architect
**Priority**: P1
**Depends on**: Task 10
**Files**:
- `apps/api/src/common-spaces/common-spaces.controller.ts` (new)
- `apps/api/src/common-spaces/common-spaces.module.ts` (modify)
**Acceptance Criteria**:
- 6 endpoints: POST, GET (by building), GET (by condo), GET (by id), PATCH, DELETE
- Guards: MinRole(ADMIN) for write, MinRole(USER) for read
- Swagger decorators
**Effort**: 2h

### [ ] Task 12: [test] Common Spaces Backend Tests
**Agent**: API Tester
**Priority**: P1
**Depends on**: Task 11
**Files**:
- `apps/api/src/common-spaces/common-spaces.service.spec.ts` (new)
- `apps/api/src/common-spaces/common-spaces.controller.spec.ts` (new)
**Acceptance Criteria**:
- All CRUD methods tested
- 70%+ coverage
**Effort**: 2h

### [ ] Task 13: [security] Add Auth Rate Limiting
**Agent**: Security Engineer
**Priority**: P1
**Files**:
- `apps/api/src/auth/auth.controller.ts`
**Acceptance Criteria**:
- @Throttle({ default: { limit: 5, ttl: 60000 } }) on login and register
- Test that 6th request in 60s returns 429
**Effort**: 1h

### [ ] Task 14: [security] Implement Token Blacklist
**Agent**: Security Engineer
**Priority**: P1
**Files**:
- `apps/api/src/auth/token-blacklist.service.ts` (new)
- `apps/api/src/auth/auth.service.ts` (modify)
- `apps/api/src/auth/strategies/jwt.strategy.ts` (modify)
- `apps/api/src/auth/auth.module.ts` (modify)
**Acceptance Criteria**:
- On logout: add access token JTI to Redis blacklist
- On every request: JwtStrategy checks blacklist before allowing
- TTL matches token expiry (no memory leak)
- Tests cover: blacklisted token rejected, valid token accepted, expired blacklist cleaned
**Effort**: 3h

### [ ] Task 15: [security] Add Auth Event Logging
**Agent**: Security Engineer
**Priority**: P1
**Files**:
- `apps/api/src/auth/auth.service.ts`
**Acceptance Criteria**:
- Log events: LOGIN_SUCCESS, LOGIN_FAILURE, LOGOUT, TOKEN_REFRESH, INVALID_TOKEN
- Structured format: { event, userId, email, ip, timestamp, details }
- Uses existing LoggerService
**Effort**: 2h

### [ ] Task 16: [security] Swagger & CORS Production Guards
**Agent**: Security Engineer
**Priority**: P1
**Files**:
- `apps/api/src/main.ts`
**Acceptance Criteria**:
- Swagger only enabled when NODE_ENV !== 'production'
- CORS_ORIGIN defaults to empty array (not *) in production
- Warning logged if CORS_ORIGIN is * in production
**Effort**: 1h

---

## Sprint 2: Reservations + Payments Frontend

### [ ] Task 17: [backend] Create Reservations DTOs
**Agent**: Backend Architect
**Priority**: P2
**Files**:
- `apps/api/src/reservations/dto/create-reservation.dto.ts` (new)
- `apps/api/src/reservations/dto/update-reservation.dto.ts` (new)
**Acceptance Criteria**:
- CreateReservationDto: date, startTime, endTime, type (enum), numberOfGuests, purpose, notes
- Time validation: endTime > startTime
- Enums from @condominios/shared
**Effort**: 1h

### [ ] Task 18: [backend] Implement Reservations Service
**Agent**: Backend Architect
**Priority**: P2
**Depends on**: Task 11, Task 17
**Files**:
- `apps/api/src/reservations/reservations.service.ts` (new)
**Acceptance Criteria**:
- CRUD: create, findAll, findBySpace, findByResident, findOne, update, cancel, softDelete
- **Conflict detection**: No overlapping reservations for same space/time
- **Capacity validation**: numberOfGuests <= commonSpace.capacity
- **Exclusive handling**: Exclusive spaces block all other reservations for time slot
- Auto-expire past reservations
- Scoped by commonSpaceId on create
**Effort**: 4h

### [ ] Task 19: [backend] Implement Reservations Controller
**Agent**: Backend Architect
**Priority**: P2
**Depends on**: Task 18
**Files**:
- `apps/api/src/reservations/reservations.controller.ts` (new)
- `apps/api/src/reservations/reservations.module.ts` (modify)
**Acceptance Criteria**:
- 8 endpoints: POST, GET (by space), GET (by resident), GET (by id), PATCH, PATCH (cancel), DELETE, GET (availability)
- Guards: Residents can only manage their own reservations; ADMIN manages all
- Swagger decorators
**Effort**: 3h

### [ ] Task 20: [test] Reservations Backend Tests
**Agent**: API Tester
**Priority**: P2
**Depends on**: Task 19
**Files**:
- `apps/api/src/reservations/reservations.service.spec.ts` (new)
- `apps/api/src/reservations/reservations.controller.spec.ts` (new)
**Acceptance Criteria**:
- All CRUD methods + conflict detection + capacity validation
- Edge cases: overlapping times, exclusive spaces, past dates
- 70%+ coverage
**Effort**: 3h

### [ ] Task 21: [database] Verify/Create CommonSpaces & Reservations Migrations
**Agent**: Database Optimizer
**Priority**: P2
**Depends on**: Task 11, Task 19
**Files**:
- `libs/database/src/migrations/` (verify or create)
**Acceptance Criteria**:
- common_spaces table matches entity
- reservations table matches entity
- Compound index on reservations: (commonSpaceId, date, startTime, endTime)
- Index on reservations: (residentId, status)
**Effort**: 2h

### [ ] Task 22: [frontend] Fix PaymentService API URLs
**Agent**: Frontend Developer
**Priority**: P1
**Depends on**: Task 6
**Files**:
- `apps/web/src/app/features/pagos/services/payment.service.ts`
**Acceptance Criteria**:
- Base URL uses `/api/v1/` prefix
- Pagination parameters (page, limit) supported
- Condominium and unit scoping via URL params
- Error handling with proper types
**Effort**: 1h

### [ ] Task 23: [frontend] Implement PaymentFormComponent
**Agent**: Frontend Developer
**Priority**: P1
**Depends on**: Task 22
**Files**:
- `apps/web/src/app/features/pagos/components/payment-form/payment-form.component.ts`
- `apps/web/src/app/features/pagos/components/payment-form/payment-form.component.html`
- `apps/web/src/app/features/pagos/components/payment-form/payment-form.component.scss`
**Acceptance Criteria**:
- Reactive form: amount, period, dueDate, paymentMethod (select), reference, notes
- Create and Edit modes (route param detection)
- Validations: amount > 0, period format (YYYY-MM), due date required
- Material components: form fields, date picker, select
- Snackbar success/error messages (Spanish)
- Angular Signals for state
**Effort**: 4h

### [ ] Task 24: [frontend] Implement PaymentDetailComponent
**Agent**: Frontend Developer
**Priority**: P1
**Depends on**: Task 22
**Files**:
- `apps/web/src/app/features/pagos/components/payment-detail/payment-detail.component.ts`
- `apps/web/src/app/features/pagos/components/payment-detail/payment-detail.component.html`
- `apps/web/src/app/features/pagos/components/payment-detail/payment-detail.component.scss`
**Acceptance Criteria**:
- Load payment by ID from route param
- Display all fields with proper formatting (currency, dates)
- Status chip with color coding
- Action buttons: Edit, Mark as Paid (status update)
- Back to list navigation
**Effort**: 2h

### [ ] Task 25: [frontend] Dashboard Payment Cards Integration
**Agent**: Frontend Developer
**Priority**: P1
**Depends on**: Task 22
**Files**:
- `apps/web/src/app/core/services/dashboard.service.ts`
- `apps/web/src/app/layout/dashboard/dashboard.component.ts`
**Acceptance Criteria**:
- Replace "Proximamente" with real payment data
- Card 4: "Pagos Pendientes" shows count of PENDING status
- Card 5: "Pagos del Mes" shows sum of current month payments
- Graceful degradation if payment API fails
**Effort**: 2h

### [ ] Task 26: [frontend] Fix CommonSpaceService API URLs
**Agent**: Frontend Developer
**Priority**: P2
**Depends on**: Task 11
**Files**:
- `apps/web/src/app/core/services/common-space.service.ts`
**Acceptance Criteria**:
- Base URL uses `/api/v1/buildings/:buildingId/common-spaces`
- Pagination supported
- Condominium-scoped listing via separate endpoint
**Effort**: 1h

### [ ] Task 27: [frontend] Fix Reservation Hardcoded Resident Data
**Agent**: Frontend Developer
**Priority**: P2
**Depends on**: Task 19
**Files**:
- `apps/web/src/app/features/espacios-comunes/components/space-list/space-list.component.ts`
- `apps/web/src/app/features/espacios-comunes/components/reservation-calendar/reservation-calendar.component.ts`
**Acceptance Criteria**:
- Get current resident from AuthService instead of hardcoded 'Juan Perez Garcia'
- Handle case where logged-in user has no resident profile
- Fix reservation service URL to `/api/v1/common-spaces/:spaceId/reservations`
**Effort**: 2h

---

## Sprint 3: Tests + CI/CD

### [ ] Task 28: [test] Condominiums Service & Controller Tests
**Agent**: API Tester
**Priority**: P1
**Files**:
- `apps/api/src/condominiums/condominiums.service.spec.ts` (new)
- `apps/api/src/condominiums/condominiums.controller.spec.ts` (new)
**Acceptance Criteria**:
- Cover: create, findAll, findOne, update, remove, restore
- Error cases: not found, duplicate name, unauthorized
- Cache invalidation tested
**Effort**: 3h

### [ ] Task 29: [test] Buildings Service & Controller Tests
**Agent**: API Tester
**Priority**: P1
**Files**:
- `apps/api/src/buildings/buildings.service.spec.ts` (new)
- `apps/api/src/buildings/buildings.controller.spec.ts` (new)
**Acceptance Criteria**:
- Cover: create, findAll, findByCondominium, findOne, update, remove
- Error cases: duplicate code, condominium not found
- Cache invalidation tested
**Effort**: 3h

### [ ] Task 30: [test] Units Service & Controller Tests
**Agent**: API Tester
**Priority**: P1
**Files**:
- `apps/api/src/units/units.service.spec.ts` (new)
- `apps/api/src/units/units.controller.spec.ts` (new)
**Acceptance Criteria**:
- Cover: create, findAll, findByBuilding, findOne, update, remove, updateStatus
- Error cases: duplicate number per building, building not found
- Cache invalidation tested
**Effort**: 3h

### [ ] Task 31: [test] Guard & Interceptor Tests
**Agent**: API Tester
**Priority**: P1
**Files**:
- `libs/common/src/guards/min-role.guard.spec.ts` (new)
- `libs/common/src/guards/jwt-auth.guard.spec.ts` (new)
- `libs/common/src/interceptors/logging.interceptor.spec.ts` (new)
**Acceptance Criteria**:
- MinRoleGuard: allows higher roles, blocks lower roles, handles missing user
- JwtAuthGuard: passes valid token, rejects invalid, handles missing token
- LoggingInterceptor: logs request/response, handles errors
**Effort**: 2h

### [ ] Task 32: [test] Frontend Tests for Payments Module
**Agent**: Frontend Developer
**Priority**: P2
**Depends on**: Tasks 22-25
**Files**:
- `apps/web/src/app/features/pagos/services/payment.service.spec.ts` (new)
- `apps/web/src/app/features/pagos/components/payment-list/payment-list.component.spec.ts` (new)
- `apps/web/src/app/features/pagos/components/payment-form/payment-form.component.spec.ts` (new)
- `apps/web/src/app/features/pagos/components/payment-detail/payment-detail.component.spec.ts` (new)
**Acceptance Criteria**:
- Service: CRUD method calls, error handling
- Components: rendering, form validation, navigation
**Effort**: 3h

### [ ] Task 33: [test] Frontend Tests for Spaces & Reservations
**Agent**: Frontend Developer
**Priority**: P2
**Files**:
- `apps/web/src/app/core/services/common-space.service.spec.ts` (new)
- `apps/web/src/app/features/espacios-comunes/components/space-list/space-list.component.spec.ts` (new)
- `apps/web/src/app/features/espacios-comunes/components/reservation-dialog/reservation-dialog.component.spec.ts` (new)
**Acceptance Criteria**:
- Service: API calls, pagination
- SpaceList: rendering, tab navigation, reservation trigger
- ReservationDialog: form validation, availability check, submit
**Effort**: 3h

### [ ] Task 34: [devops] Create API CI/CD Workflow
**Agent**: DevOps Automator
**Priority**: P3
**Files**:
- `.github/workflows/api-ci.yml` (new)
**Acceptance Criteria**:
- Triggers on PR to development and main
- Steps: checkout → setup Node 24.x → install deps → lint → test → coverage (70% gate) → build
- Uses Nx affected for efficiency
- PostgreSQL and Redis services for integration tests
**Effort**: 3h

### [ ] Task 35: [devops] Create Web CI/CD Workflow
**Agent**: DevOps Automator
**Priority**: P3
**Files**:
- `.github/workflows/web-ci.yml` (new)
**Acceptance Criteria**:
- Triggers on PR to development and main
- Steps: checkout → setup Node 24.x → install deps → lint → test → build
- Remove old apps/web/.github/workflows/ci.yml
**Effort**: 2h

### [ ] Task 36: [devops] Create Docker CI Workflow
**Agent**: DevOps Automator
**Priority**: P3
**Files**:
- `.github/workflows/docker-ci.yml` (new)
**Acceptance Criteria**:
- Build API and Worker images
- Tag with commit SHA + branch name
- Only runs on pushes to development/main
**Effort**: 2h

### [ ] Task 37: [devops] Production Environment Template
**Agent**: DevOps Automator
**Priority**: P3
**Files**:
- `.env.production.example` (new)
- `scripts/backup-db.sh` (new)
**Acceptance Criteria**:
- All required vars listed with descriptions
- No default values for secrets
- Backup script: pg_dump with timestamp, 7-day retention
**Effort**: 2h

---

## Sprint 4: Quality + Documentation

### [ ] Task 38: [frontend] Migrate AuthService to Angular Signals
**Agent**: Frontend Developer
**Priority**: P3
**Files**:
- `apps/web/src/app/core/services/auth.service.ts`
- All components consuming auth state
**Acceptance Criteria**:
- Replace BehaviorSubject with signal()
- Replace Observable subscriptions with computed()
- All auth-dependent components work correctly
- Existing tests pass
**Effort**: 3h

### [ ] Task 39: [frontend] Centralize UI Label Constants
**Agent**: Frontend Developer
**Priority**: P3
**Files**:
- `apps/web/src/app/core/constants/labels.ts` (new)
- Components with duplicated labels (resident-list, resident-form, unit-form, etc.)
**Acceptance Criteria**:
- Single source of truth for all enum-to-label mappings
- Components import from constants file
- No duplicated label objects
**Effort**: 2h

### [ ] Task 40: [frontend] Accessibility Audit & Fixes
**Agent**: Accessibility Auditor
**Priority**: P3
**Files**:
- All component templates (.html)
**Acceptance Criteria**:
- ARIA labels on interactive elements
- Keyboard navigation for dialogs
- Color-only indicators supplemented with text/icons
- Focus management in modals
**Effort**: 4h

### [ ] Task 41: [docs] Update Swagger Documentation
**Agent**: Technical Writer
**Priority**: P4
**Depends on**: Tasks 6, 11, 19
**Files**:
- Controller files (Swagger decorators)
**Acceptance Criteria**:
- All Payments, CommonSpaces, Reservations endpoints documented
- Request/response examples included
- Auth requirements noted
**Effort**: 2h

### [ ] Task 42: [docs] Update README & CLAUDE.md
**Agent**: Technical Writer
**Priority**: P4
**Files**:
- `README.md`
- `CLAUDE.md`
**Acceptance Criteria**:
- Module status table updated (all 9 modules)
- Agents directory documented
- Setup instructions current
- Frontend services section updated
**Effort**: 1h

### [ ] Task 43: [docs] Create Deployment Guide
**Agent**: Technical Writer
**Priority**: P4
**Files**:
- `docs/DEPLOYMENT.md` (new or update)
**Acceptance Criteria**:
- Step-by-step production deployment
- docker-compose.prod.yml usage
- Environment variable reference
- Database migration procedure
- Backup/restore procedure
**Effort**: 2h

---

## Summary

| Sprint | Tasks | Total Hours | Focus |
|--------|-------|-------------|-------|
| Sprint 1 | 1-16 | 28.5h | Security + Payments + Common Spaces Backend |
| Sprint 2 | 17-27 | 26h | Reservations + All Frontend |
| Sprint 3 | 28-37 | 26h | Test Backfill + CI/CD |
| Sprint 4 | 38-43 | 14h | Quality + Documentation |
| **Total** | **43 tasks** | **94.5h** | |
