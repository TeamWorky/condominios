# 004 - MVP Completion: Technical Implementation Plan

## Architecture Decisions

### AD1: Module Implementation Order
**Decision**: Payments → Common Spaces → Reservations (dependency chain)
**Rationale**: Payments blocks dashboard; Common Spaces blocks Reservations; this order minimizes frontend rework

### AD2: Security Fixes Before New Features
**Decision**: Fix JWT secrets and refresh token validation BEFORE implementing new modules
**Rationale**: New modules inherit security patterns — fixing the base first prevents propagation of vulnerabilities

### AD3: Tests Alongside Implementation
**Decision**: Write tests for new modules during implementation, but backfill existing module tests separately
**Rationale**: New module tests are part of their WP; backfill tests are independent and parallelizable

### AD4: CI/CD After Module Completion
**Decision**: Build CI/CD pipeline after all 3 modules are implemented
**Rationale**: Pipeline validates complete codebase; building early means constant updates as modules land

---

## Phase 1: Security Foundations (2h)

### 1.1 Fix JWT Secret Handling
```
File: apps/api/src/auth/auth.service.ts
Change: Replace fallback defaults with thrown errors
Pattern:
  const jwtSecret = this._configService.get<string>('JWT_SECRET');
  if (!jwtSecret) throw new Error('JWT_SECRET is required');
```

### 1.2 Fix Refresh Token Validation
```
File: apps/api/src/auth/auth.controller.ts
Change: Replace jwtService.decode() with jwtService.verify()
Impact: Prevents acceptance of tampered refresh tokens
```

### 1.3 Increase Bcrypt Rounds
```
File: apps/api/src/users/entities/user.entity.ts
Change: genSalt(10) → genSalt(12)
Impact: Stronger password hashing per CLAUDE.md requirement
```

---

## Phase 2: Payments Module (18h)

### 2.1 Backend (8h)
```
New files:
  apps/api/src/payments/dto/create-payment.dto.ts
  apps/api/src/payments/dto/update-payment.dto.ts
  apps/api/src/payments/payments.service.ts
  apps/api/src/payments/payments.controller.ts
  apps/api/src/payments/payments.service.spec.ts
  apps/api/src/payments/payments.controller.spec.ts

Modified:
  apps/api/src/payments/payments.module.ts (add service, controller, imports)

Pattern: Follow residents module structure (scoped by unitId, pagination, soft delete)
Guards: MinRole(ADMIN) for create/update/delete, MinRole(USER) for read
Cache: TTL 300s individual, 60s lists
```

### 2.2 Database Migration
```
Verify/Generate: CreatePaymentsTable migration
Indexes: (unitId, period), (status), (dueDate)
Confirm entity columns match migration
```

### 2.3 Frontend (10h)
```
Modified:
  apps/web/src/app/features/pagos/services/payment.service.ts
    - Fix API base URL to /api/v1/units/:unitId/payments
    - Add pagination
    - Add condoId-scoped listing

  apps/web/src/app/features/pagos/components/payment-form/
    - Full reactive form: amount, period, dueDate, paymentMethod, reference, notes
    - Validation: amount > 0, valid period, future due date
    - Create & Edit modes

  apps/web/src/app/features/pagos/components/payment-detail/
    - Full detail view: payment info + unit/resident context
    - Status chip with color coding
    - Action buttons (mark paid, edit)

  apps/web/src/app/layout/dashboard/dashboard.component.ts
    - Replace "Proximamente" with real payment data
    - Add PaymentService to DashboardService forkJoin
```

---

## Phase 3: Common Spaces Module (8h)

### 3.1 Backend (6h)
```
New files:
  apps/api/src/common-spaces/dto/create-common-space.dto.ts
  apps/api/src/common-spaces/dto/update-common-space.dto.ts
  apps/api/src/common-spaces/common-spaces.service.ts
  apps/api/src/common-spaces/common-spaces.controller.ts
  apps/api/src/common-spaces/common-spaces.service.spec.ts
  apps/api/src/common-spaces/common-spaces.controller.spec.ts

Modified:
  apps/api/src/common-spaces/common-spaces.module.ts

Pattern: Scoped by buildingId, filterable by type and isReservable
Guards: MinRole(ADMIN) for create/update/delete, MinRole(USER) for read
```

### 3.2 Frontend Fix (2h)
```
Modified:
  apps/web/src/app/core/services/common-space.service.ts
    - Fix API URL to /api/v1/buildings/:buildingId/common-spaces
    - Add pagination
    - Add condominium-scoped listing
```

---

## Phase 4: Reservations Module (12h)

### 4.1 Backend (10h)
```
New files:
  apps/api/src/reservations/dto/create-reservation.dto.ts
  apps/api/src/reservations/dto/update-reservation.dto.ts
  apps/api/src/reservations/reservations.service.ts
  apps/api/src/reservations/reservations.controller.ts
  apps/api/src/reservations/reservations.service.spec.ts
  apps/api/src/reservations/reservations.controller.spec.ts

Modified:
  apps/api/src/reservations/reservations.module.ts

Key business logic:
  - Time slot conflict detection (overlapping reservations)
  - Capacity validation (numberOfGuests <= space.capacity)
  - Exclusive vs shared space handling
  - Auto-expire past reservations (COMPLETED status)
Guards: Residents can only create/cancel their own reservations
```

### 4.2 Frontend Fix (2h)
```
Modified:
  apps/web/src/app/features/espacios-comunes/components/space-list/space-list.component.ts
    - Replace hardcoded resident data with AuthService current user

  apps/web/src/app/features/espacios-comunes/components/reservation-calendar/
    - Same fix: get resident from AuthService

  apps/web/src/app/core/services/reservation.service.ts
    - Fix API URL to /api/v1/common-spaces/:spaceId/reservations
```

---

## Phase 5: Test Backfill (11h)

### 5.1 Backend Module Tests
```
New files:
  apps/api/src/condominiums/condominiums.service.spec.ts
  apps/api/src/condominiums/condominiums.controller.spec.ts
  apps/api/src/buildings/buildings.service.spec.ts
  apps/api/src/buildings/buildings.controller.spec.ts
  apps/api/src/units/units.service.spec.ts
  apps/api/src/units/units.controller.spec.ts

Pattern: Follow auth/users test structure
Cover: CRUD operations, error cases, guards, pagination, cache invalidation
```

### 5.2 Guard & Interceptor Tests
```
New files:
  libs/common/src/guards/min-role.guard.spec.ts
  libs/common/src/guards/jwt-auth.guard.spec.ts
  libs/common/src/interceptors/logging.interceptor.spec.ts
```

---

## Phase 6: Security Hardening (7.5h)

### 6.1 Auth Rate Limiting
```
Modified: apps/api/src/auth/auth.controller.ts
  - Add @Throttle({ default: { limit: 5, ttl: 60000 } }) on login/register
```

### 6.2 Token Blacklist
```
New file: apps/api/src/auth/token-blacklist.service.ts
Modified:
  apps/api/src/auth/auth.service.ts (add blacklist on logout)
  apps/api/src/auth/strategies/jwt.strategy.ts (check blacklist)
Storage: Redis with TTL matching token expiry
```

### 6.3 Auth Event Logging
```
Modified: apps/api/src/auth/auth.service.ts
  - Log: successful login, failed login, logout, token refresh
  - Format: structured JSON with userId, action, timestamp, IP
```

### 6.4 Production Guards
```
Modified: apps/api/src/main.ts
  - Disable Swagger when NODE_ENV=production
  - Set CORS_ORIGIN to throw error if not configured in production
```

---

## Phase 7: CI/CD & Infrastructure (10h)

### 7.1 GitHub Actions Workflows
```
New files:
  .github/workflows/api-ci.yml (lint → test → coverage-check → build)
  .github/workflows/web-ci.yml (lint → test → build)
  .github/workflows/docker-ci.yml (build images)

Updated:
  apps/web/.github/workflows/ci.yml → move to root .github/
  Node version: 24.x
  Coverage: 70% gate for API
```

### 7.2 Production Environment
```
New: .env.production.example (all required vars, no defaults)
New: scripts/backup-db.sh (pg_dump with retention)
```

---

## Phase 8: Frontend Quality (9h)

### 8.1 AuthService Signals Migration
```
Modified: apps/web/src/app/core/services/auth.service.ts
  - Replace BehaviorSubject with signal()/computed()
  - Update all consumers to use signals
```

### 8.2 Constants Centralization
```
New: apps/web/src/app/core/constants/labels.ts
  - All enum-to-label mappings centralized
  - Remove duplicated label objects from components
```

### 8.3 Accessibility
```
All components: Add ARIA labels, keyboard navigation
Run axe audit, fix findings
```

---

## Phase 9: Documentation (5h)

### 9.1 Swagger Update
- Document all new Payments/CommonSpaces/Reservations endpoints
- Add request/response examples

### 9.2 README Update
- Current module status
- Agents directory documentation
- Updated setup instructions

### 9.3 Deployment Guide
- docker-compose.prod.yml usage
- Environment variable reference
- Backup procedures
