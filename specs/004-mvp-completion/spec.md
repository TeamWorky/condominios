# 004 - MVP Completion: Condominios SaaS Platform

## Overview

Plan maestro para completar la version funcional (MVP) de la plataforma Condominios. Consolida todo el trabajo pendiente identificado por analisis multi-agente (Backend Architect, Frontend Developer, Security Engineer, DevOps Automator, Database Optimizer, Code Reviewer).

**Fecha de analisis**: 2026-05-20
**Branch base**: `development` (post-merge de 003-residents-crud)

---

## Current State Summary

### Modules Implemented (6/9)

| Module | Backend | Frontend | Tests | Status |
|--------|---------|----------|-------|--------|
| Auth | COMPLETE | COMPLETE | COMPLETE (100%) | PRODUCTION |
| Users | COMPLETE | COMPLETE | COMPLETE | PRODUCTION |
| Condominiums | COMPLETE | COMPLETE | MISSING | PARTIAL |
| Buildings | COMPLETE | COMPLETE | MISSING | PARTIAL |
| Units | COMPLETE | COMPLETE | MISSING | PARTIAL |
| Residents | COMPLETE | COMPLETE | BASIC | PARTIAL |

### Modules Pending (3/9)

| Module | Backend | Frontend | Tests | Status |
|--------|---------|----------|-------|--------|
| Payments | Entity only | Stubs | NONE | NOT STARTED |
| Common Spaces | Entity only | Partial UI | NONE | NOT STARTED |
| Reservations | Entity only | Partial UI | NONE | NOT STARTED |

### Infrastructure Score: 4.4/10

---

## Work Packages

### WP1: Backend - Missing Module Implementation

#### WP1.1: Payments Module (CRITICAL - P0)
- **Impact**: Blocks dashboard, blocks revenue features
- **Entity**: `payment.entity.ts` exists
- **Missing**: Service, Controller, DTOs, Tests, Migration
- **Endpoints needed**:
  - `POST /api/v1/units/:unitId/payments` - Create payment
  - `GET /api/v1/condominiums/:condoId/payments` - List by condominium (paginated)
  - `GET /api/v1/units/:unitId/payments` - List by unit (paginated)
  - `GET /api/v1/payments/:id` - Get by ID
  - `PATCH /api/v1/payments/:id` - Update payment
  - `PATCH /api/v1/payments/:id/status` - Update status (mark as paid)
  - `DELETE /api/v1/payments/:id` - Soft delete
- **Agent**: Backend Architect
- **Effort**: 8h

#### WP1.2: Common Spaces Module (HIGH - P1)
- **Impact**: Blocks reservations module
- **Entity**: `common-space.entity.ts` exists
- **Missing**: Service, Controller, DTOs, Tests
- **Endpoints needed**:
  - `POST /api/v1/buildings/:buildingId/common-spaces` - Create
  - `GET /api/v1/buildings/:buildingId/common-spaces` - List by building (paginated)
  - `GET /api/v1/condominiums/:condoId/common-spaces` - List by condominium
  - `GET /api/v1/common-spaces/:id` - Get by ID
  - `PATCH /api/v1/common-spaces/:id` - Update
  - `DELETE /api/v1/common-spaces/:id` - Soft delete
- **Agent**: Backend Architect
- **Effort**: 6h

#### WP1.3: Reservations Module (HIGH - P2)
- **Impact**: Depends on Common Spaces
- **Entity**: `reservation.entity.ts` exists
- **Missing**: Service (with conflict detection), Controller, DTOs, Tests
- **Endpoints needed**:
  - `POST /api/v1/common-spaces/:spaceId/reservations` - Create
  - `GET /api/v1/common-spaces/:spaceId/reservations` - List by space
  - `GET /api/v1/residents/:residentId/reservations` - List by resident
  - `GET /api/v1/reservations/:id` - Get by ID
  - `PATCH /api/v1/reservations/:id` - Update
  - `PATCH /api/v1/reservations/:id/cancel` - Cancel reservation
  - `DELETE /api/v1/reservations/:id` - Soft delete
  - `GET /api/v1/common-spaces/:spaceId/availability` - Check availability
- **Business logic**: Time slot conflict detection, capacity validation
- **Agent**: Backend Architect
- **Effort**: 10h

---

### WP2: Backend - Missing Tests (70% Coverage Target)

#### WP2.1: Condominiums Tests
- **Files needed**: `condominiums.service.spec.ts`, `condominiums.controller.spec.ts`
- **Methods to cover**: create, findAll, findOne, update, remove, restore (6 methods)
- **Agent**: API Tester
- **Effort**: 3h

#### WP2.2: Buildings Tests
- **Files needed**: `buildings.service.spec.ts`, `buildings.controller.spec.ts`
- **Methods to cover**: create, findAll, findOne, update, remove (5 methods)
- **Agent**: API Tester
- **Effort**: 3h

#### WP2.3: Units Tests
- **Files needed**: `units.service.spec.ts`, `units.controller.spec.ts`
- **Methods to cover**: create, findAll, findByBuilding, findOne, update, remove, updateStatus (7 methods)
- **Agent**: API Tester
- **Effort**: 3h

#### WP2.4: Guard & Interceptor Tests
- **Files needed**: `min-role.guard.spec.ts`, `jwt-auth.guard.spec.ts`, `logging.interceptor.spec.ts`
- **Agent**: API Tester
- **Effort**: 2h

---

### WP3: Frontend - Payments Module Completion

#### WP3.1: PaymentService Fix
- **Issue**: Uses hardcoded mock path `/payments` instead of `/api/v1/...`
- **Fix**: Align with versioned API pattern
- **Add**: Pagination support, proper error handling
- **Agent**: Frontend Developer
- **Effort**: 2h

#### WP3.2: PaymentFormComponent
- **Current**: Stub "En construccion"
- **Need**: Full reactive form with fields: amount, period, dueDate, paymentMethod, reference, notes
- **Validations**: Required amount > 0, valid period format, future due date
- **Agent**: Frontend Developer
- **Effort**: 4h

#### WP3.3: PaymentDetailComponent
- **Current**: Stub "En construccion"
- **Need**: Full detail view with payment info, status history, unit/resident context
- **Agent**: Frontend Developer
- **Effort**: 2h

#### WP3.4: Dashboard Payment Integration
- **Current**: Shows "Proximamente" for payment cards
- **Need**: Real data from PaymentService (pending count, monthly total)
- **Agent**: Frontend Developer
- **Effort**: 2h

---

### WP4: Frontend - Common Spaces & Reservations Fix

#### WP4.1: CommonSpaceService Fix
- **Issue**: Uses hardcoded mock path `/commonSpaces`
- **Fix**: Align with `/api/v1/buildings/:buildingId/common-spaces`
- **Add**: Pagination, proper condominium scoping
- **Agent**: Frontend Developer
- **Effort**: 2h

#### WP4.2: ReservationService Fix
- **Issue**: Hardcoded resident data ('Juan Perez Garcia', unit '101')
- **Fix**: Integrate with AuthService to get logged-in resident
- **Agent**: Frontend Developer
- **Effort**: 2h

#### WP4.3: Frontend Tests for Spaces & Reservations
- **Missing**: All component and service spec files
- **Need**: SpaceListComponent, SpaceDetailComponent, ReservationDialog, ReservationCalendar tests
- **Agent**: Frontend Developer + API Tester
- **Effort**: 4h

---

### WP5: Security Hardening (OWASP Top 10)

#### WP5.1: JWT Secret Handling (CRITICAL)
- **Issue**: Fallback default secrets in auth.service.ts
  ```typescript
  JWT_SECRET || 'default-secret-change-me'
  JWT_REFRESH_SECRET || 'default-refresh-secret-change-me'
  ```
- **Fix**: Throw error if secrets not provided
- **Agent**: Security Engineer
- **Effort**: 1h

#### WP5.2: Refresh Token Validation
- **Issue**: Uses `jwtService.decode()` instead of `verify()` in controller
- **Fix**: Use verify to validate signature before processing
- **Agent**: Security Engineer
- **Effort**: 1h

#### WP5.3: Bcrypt Rounds
- **Issue**: Users entity uses `genSalt(10)`, CLAUDE.md requires 12
- **Fix**: Increase to 12 rounds
- **Agent**: Security Engineer
- **Effort**: 30min

#### WP5.4: Auth Rate Limiting
- **Issue**: Global 100 req/min too permissive for auth endpoints
- **Fix**: Add `@Throttle(5, 60)` on login/register endpoints
- **Agent**: Security Engineer
- **Effort**: 1h

#### WP5.5: Token Blacklist on Logout
- **Issue**: JWT access token valid until expiry after logout
- **Fix**: Implement Redis-based blacklist, check in JwtStrategy
- **Agent**: Security Engineer
- **Effort**: 3h

#### WP5.6: Auth Event Logging
- **Issue**: No login/logout/failure events logged
- **Fix**: Add Winston logging for: successful login, failed login, logout, token refresh, lockout
- **Agent**: Security Engineer
- **Effort**: 2h

#### WP5.7: Swagger Production Guard
- **Issue**: Swagger exposed at `/api-docs` regardless of environment
- **Fix**: Disable in production via `NODE_ENV` check
- **Agent**: Security Engineer
- **Effort**: 30min

#### WP5.8: CORS Production Restriction
- **Issue**: Default `CORS_ORIGIN=*`
- **Fix**: Set restrictive default, document required production value
- **Agent**: Security Engineer
- **Effort**: 30min

---

### WP6: Database & Migrations

#### WP6.1: Verify Payments Migration
- **Check**: Confirm payment table migration exists or generate it
- **Need**: Indexes on (unitId, period), (status), (dueDate)
- **Agent**: Database Optimizer
- **Effort**: 1h

#### WP6.2: Verify CommonSpaces Migration
- **Check**: Confirm common_spaces table migration exists or generate it
- **Agent**: Database Optimizer
- **Effort**: 1h

#### WP6.3: Verify Reservations Migration
- **Check**: Confirm reservations table migration exists or generate it
- **Need**: Compound index on (commonSpaceId, date, startTime, endTime) for conflict detection
- **Agent**: Database Optimizer
- **Effort**: 1h

#### WP6.4: Partial Unique Index for Residents
- **Issue**: documentNumber index is non-partial, allows duplicates across soft-deleted
- **Fix**: Migration to add partial unique index excluding deletedAt IS NOT NULL
- **Note**: May already be addressed in migration 1706650000009
- **Agent**: Database Optimizer
- **Effort**: 1h

---

### WP7: Infrastructure & DevOps

#### WP7.1: CI/CD Pipeline (GitHub Actions)
- **Current**: Only web app CI with outdated Node 18/20
- **Need**: Full pipeline: API tests, Web tests, coverage check, Docker build
- **Workflows**:
  - `api-ci.yml`: lint → test → coverage (70% gate) → build
  - `web-ci.yml`: lint → test → build
  - `docker-ci.yml`: build images → push to registry
- **Agent**: DevOps Automator
- **Effort**: 6h

#### WP7.2: Update Existing Web CI
- **Fix**: Update Node version to 24.x
- **Fix**: Add coverage threshold enforcement
- **Agent**: DevOps Automator
- **Effort**: 1h

#### WP7.3: Database Backup Script
- **Need**: pg_dump cron script with retention policy
- **Agent**: DevOps Automator + SRE
- **Effort**: 2h

#### WP7.4: Production .env Template
- **Need**: `.env.production.example` with all required vars, no defaults
- **Agent**: DevOps Automator
- **Effort**: 1h

---

### WP8: Frontend Quality & UX

#### WP8.1: AuthService Migration to Signals
- **Issue**: Uses BehaviorSubject, CLAUDE.md prefers Angular Signals
- **Fix**: Migrate to signal()/computed() pattern
- **Agent**: Frontend Developer
- **Effort**: 3h

#### WP8.2: Centralize UI Constants
- **Issue**: Labels/options repeated in multiple components
- **Fix**: Create `core/constants/labels.ts` with all enum-to-label mappings
- **Agent**: Frontend Developer
- **Effort**: 2h

#### WP8.3: Accessibility Audit
- **Need**: Run axe/pa11y, add ARIA labels, keyboard navigation
- **Agent**: Accessibility Auditor
- **Effort**: 4h

---

### WP9: Documentation

#### WP9.1: Update Swagger/OpenAPI
- **Need**: Document all new endpoints (Payments, CommonSpaces, Reservations)
- **Agent**: Technical Writer
- **Effort**: 2h

#### WP9.2: Update README
- **Need**: Reflect current module status, new agents directory
- **Agent**: Technical Writer
- **Effort**: 1h

#### WP9.3: Create Deployment Guide
- **Need**: Production deployment steps with docker-compose.prod.yml
- **Agent**: Technical Writer + DevOps Automator
- **Effort**: 2h

---

## Priority Matrix

| Priority | Work Package | Effort | Dependency |
|----------|-------------|--------|------------|
| **P0** | WP1.1 Payments Backend | 8h | None |
| **P0** | WP5.1 JWT Secrets | 1h | None |
| **P0** | WP5.2 Refresh Token Fix | 1h | None |
| **P1** | WP1.2 Common Spaces Backend | 6h | None |
| **P1** | WP2.1-2.4 Missing Backend Tests | 11h | None |
| **P1** | WP3.1-3.4 Payments Frontend | 10h | WP1.1 |
| **P1** | WP5.3-5.8 Security Hardening | 7.5h | None |
| **P2** | WP1.3 Reservations Backend | 10h | WP1.2 |
| **P2** | WP4.1-4.3 Spaces Frontend Fix | 8h | WP1.2 |
| **P2** | WP6.1-6.4 Database Migrations | 4h | WP1.1-1.3 |
| **P3** | WP7.1-7.4 CI/CD & DevOps | 10h | None |
| **P3** | WP8.1-8.3 Frontend Quality | 9h | None |
| **P4** | WP9.1-9.3 Documentation | 5h | WP1.1-1.3 |

---

## Total Effort Estimate

| Category | Hours |
|----------|-------|
| Backend New Modules (WP1) | 24h |
| Backend Tests (WP2) | 11h |
| Frontend Payments (WP3) | 10h |
| Frontend Spaces Fix (WP4) | 8h |
| Security Hardening (WP5) | 9.5h |
| Database Migrations (WP6) | 4h |
| CI/CD & DevOps (WP7) | 10h |
| Frontend Quality (WP8) | 9h |
| Documentation (WP9) | 5h |
| **TOTAL** | **90.5h** |

---

## Suggested Sprint Plan

### Sprint 1 (Week 1-2): Core Modules + Security
- WP1.1: Payments Backend (8h)
- WP1.2: Common Spaces Backend (6h)
- WP5.1-5.2: Critical Security Fixes (2h)
- WP5.3-5.8: Security Hardening (7.5h)
- **Subtotal**: 23.5h

### Sprint 2 (Week 3-4): Frontend + Reservations
- WP1.3: Reservations Backend (10h)
- WP3.1-3.4: Payments Frontend (10h)
- WP4.1-4.3: Spaces Frontend Fix (8h)
- **Subtotal**: 28h

### Sprint 3 (Week 5-6): Tests + Infrastructure
- WP2.1-2.4: All Missing Backend Tests (11h)
- WP6.1-6.4: Database Migrations (4h)
- WP7.1-7.4: CI/CD Pipeline (10h)
- **Subtotal**: 25h

### Sprint 4 (Week 7): Quality + Documentation
- WP8.1-8.3: Frontend Quality (9h)
- WP9.1-9.3: Documentation (5h)
- **Subtotal**: 14h

---

## Agent Assignment

| Agent | Work Packages | Total Hours |
|-------|--------------|-------------|
| Backend Architect | WP1.1, WP1.2, WP1.3 | 24h |
| API Tester | WP2.1, WP2.2, WP2.3, WP2.4 | 11h |
| Frontend Developer | WP3.1-3.4, WP4.1-4.3, WP8.1-8.2 | 21h |
| Security Engineer | WP5.1-5.8 | 9.5h |
| Database Optimizer | WP6.1-6.4 | 4h |
| DevOps Automator | WP7.1-7.4 | 10h |
| Accessibility Auditor | WP8.3 | 4h |
| Technical Writer | WP9.1-9.3 | 5h |
| Code Reviewer | All WPs (review) | Cross-cutting |
| Reality Checker | Final QA | Cross-cutting |
