# Plan de Martin — Backend, Infra, Security, DevOps

## Resumen

| # | Feature ID | Descripcion | WP | Esfuerzo | Sprint | Dependencia |
|---|-----------|-------------|-----|----------|--------|-------------|
| 1 | `006-payments-backend` | Payments CRUD backend completo | WP1.1 | 8h | S1 | Ninguna |
| 2 | `007-common-spaces-backend` | Common Spaces CRUD backend | WP1.2 | 6h | S1 | Ninguna |
| 3 | `008-security-hardening` | Fixes OWASP Top 10 | WP5.1-5.8 | 9.5h | S1 | Ninguna |
| 4 | `009-reservations-backend` | Reservations CRUD + conflict detection | WP1.3 | 10h | S2 | `007` |
| 5 | `010-missing-backend-tests` | Tests para Condominiums, Buildings, Units, Guards | WP2.1-2.4 | 11h | S2 | Ninguna |
| 6 | `011-database-migrations` | Migraciones para Payments, Spaces, Reservations | WP6.1-6.4 | 4h | S2 | `006`,`007`,`009` |
| 7 | `012-cicd-pipeline` | GitHub Actions CI/CD completo | WP7.1-7.4 | 10h | S3 | Ninguna |
| 8 | `013-documentation` | Swagger, README, Deployment Guide | WP9.1-9.3 | 3h | S3 | Todo |

**Total estimado**: ~61.5h

---

## Feature 1: `006-payments-backend` (Sprint 1 — P0)

### Contexto
- Entity `payment.entity.ts` ya existe en `apps/api/src/payments/entities/`
- Entity `common-expense.entity.ts` tambien existe
- Module `payments.module.ts` es un stub
- PaykuService ya esta disponible en `@condominios/infrastructure`
- Shared enums: `PaymentStatus`, `PaymentMethod` ya existen

### Que crear
- `payments.service.ts` — CRUD + filtros por condominium/unit/status/period
- `payments.controller.ts` — Endpoints REST versionados
- `create-payment.dto.ts`, `update-payment.dto.ts`
- `payments.service.spec.ts`, `payments.controller.spec.ts`
- Migracion si la tabla no existe

### Endpoints
```
POST   /api/v1/units/:unitId/payments          — Crear pago
GET    /api/v1/condominiums/:condoId/payments   — Listar por condominio (paginado)
GET    /api/v1/units/:unitId/payments           — Listar por unidad (paginado)
GET    /api/v1/payments/:id                     — Obtener por ID
PATCH  /api/v1/payments/:id                     — Actualizar pago
PATCH  /api/v1/payments/:id/status              — Cambiar estado (marcar pagado)
DELETE /api/v1/payments/:id                     — Soft delete
```

### Speckit commands
```bash
/speckit.specify Payments backend CRUD module for condominiums platform. Service, controller, DTOs, tests. Endpoints for create, list by condominium/unit, get by ID, update, change status, soft delete. Entity already exists. Integrates with PaykuService for payment processing. Scoped by condominiumId.
```

### Bloquea a
- Carlos: `014-payments-frontend` (no puede conectar frontend sin estos endpoints)
- Martin: `011-database-migrations` (necesita verificar tabla payments)

---

## Feature 2: `007-common-spaces-backend` (Sprint 1 — P1)

### Contexto
- Entity `common-space.entity.ts` existe en `apps/api/src/common-spaces/entities/`
- Shared enums: `CommonSpaceType` ya existe
- Frontend UI ya esta completa (Carlos solo necesita conectar service)

### Que crear
- `common-spaces.service.ts` — CRUD con scoping por building/condominium
- `common-spaces.controller.ts` — Endpoints REST
- `create-common-space.dto.ts`, `update-common-space.dto.ts`
- `common-spaces.service.spec.ts`, `common-spaces.controller.spec.ts`

### Endpoints
```
POST   /api/v1/buildings/:buildingId/common-spaces   — Crear
GET    /api/v1/buildings/:buildingId/common-spaces    — Listar por edificio (paginado)
GET    /api/v1/condominiums/:condoId/common-spaces    — Listar por condominio
GET    /api/v1/common-spaces/:id                      — Obtener por ID
PATCH  /api/v1/common-spaces/:id                      — Actualizar
DELETE /api/v1/common-spaces/:id                      — Soft delete
```

### Speckit commands
```bash
/speckit.specify Common Spaces backend CRUD module. Service, controller, DTOs, tests. Entity already exists. Spaces belong to buildings. Endpoints for create, list by building/condominium, get, update, soft delete. Includes capacity, type (CommonSpaceType enum), schedule, amenities.
```

### Bloquea a
- Martin: `009-reservations-backend` (reservations depende de common spaces)
- Carlos: `015-spaces-frontend-fix` (conectar frontend existente al backend)

---

## Feature 3: `008-security-hardening` (Sprint 1 — P0/P1)

### Contexto — Lo que ya esta bien
- ✅ JWT secrets sin defaults hardcodeados, validacion 32+ chars
- ✅ Refresh token usa `verify()` + bcrypt comparison
- ✅ Bcrypt 12 rounds
- ✅ GlobalValidationPipe con whitelist
- ✅ Helmet habilitado

### Lo que falta corregir

| # | Issue | Archivo | Fix |
|---|-------|---------|-----|
| 1 | Rate limiting auth | `apps/api/src/auth/auth.controller.ts` | Agregar `@Throttle(5, 60)` en login/register |
| 2 | Token blacklist | `apps/api/src/auth/auth.service.ts` | Redis blacklist, check en JwtStrategy |
| 3 | Auth event logging | `apps/api/src/auth/auth.service.ts` | Winston logs para login/logout/failure/lockout |
| 4 | Swagger guard | `apps/api/src/main.ts` | Deshabilitar en NODE_ENV=production |
| 5 | CORS restriction | `apps/api/src/main.ts` | Default restrictivo, documentar valor prod |
| 6 | CSP habilitado | `apps/api/src/main.ts` | Activar contentSecurityPolicy |
| 7 | Account lockout | `apps/api/src/auth/auth.service.ts` | Contador de intentos fallidos en Redis |
| 8 | Global JWT guard | `apps/api/src/app.module.ts` | APP_GUARD provider para no olvidar guards |

### Speckit commands
```bash
/speckit.specify Security hardening for OWASP Top 10 compliance. Fix: auth rate limiting (5 req/min on login), Redis token blacklist on logout, auth event logging (Winston), Swagger disabled in production, CORS restricted in production, CSP enabled, account lockout after 5 failures, global JWT guard via APP_GUARD. All fixes in existing files, no new modules.
```

---

## Feature 4: `009-reservations-backend` (Sprint 2 — P2)

### Contexto
- Entity `reservation.entity.ts` existe
- Shared enums: `ReservationStatus`, `ReservationType` ya existen
- Frontend UI completa (calendario, dialog de reserva)
- **Depende de**: `007-common-spaces-backend` (debe existir primero)

### Que crear
- `reservations.service.ts` — CRUD + **conflict detection** + availability check
- `reservations.controller.ts` — Endpoints REST
- `create-reservation.dto.ts`, `update-reservation.dto.ts`
- `reservations.service.spec.ts`, `reservations.controller.spec.ts`

### Endpoints
```
POST   /api/v1/common-spaces/:spaceId/reservations    — Crear
GET    /api/v1/common-spaces/:spaceId/reservations     — Listar por espacio
GET    /api/v1/residents/:residentId/reservations       — Listar por residente
GET    /api/v1/reservations/:id                         — Obtener por ID
PATCH  /api/v1/reservations/:id                         — Actualizar
PATCH  /api/v1/reservations/:id/cancel                  — Cancelar
DELETE /api/v1/reservations/:id                         — Soft delete
GET    /api/v1/common-spaces/:spaceId/availability      — Consultar disponibilidad
```

### Logica de negocio critica
- **Time slot conflict detection**: No permitir reservas superpuestas en el mismo espacio
- **Capacity validation**: Espacios compartidos vs exclusivos
- **Status transitions**: pending -> confirmed -> cancelled/completed

### Speckit commands
```bash
/speckit.specify Reservations backend CRUD module with time slot conflict detection. Service, controller, DTOs, tests. Entity already exists. Reservations belong to common spaces. Business logic: prevent overlapping reservations, capacity validation for shared vs exclusive spaces, availability endpoint, status transitions (pending/confirmed/cancelled/completed). Scoped by condominiumId.
```

---

## Feature 5: `010-missing-backend-tests` (Sprint 2 — P1)

### Archivos a crear
```
apps/api/src/condominiums/condominiums.service.spec.ts
apps/api/src/condominiums/condominiums.controller.spec.ts
apps/api/src/buildings/buildings.service.spec.ts
apps/api/src/buildings/buildings.controller.spec.ts
apps/api/src/units/units.service.spec.ts
apps/api/src/units/units.controller.spec.ts
libs/common/src/guards/min-role.guard.spec.ts
libs/common/src/guards/jwt-auth.guard.spec.ts
libs/common/src/interceptors/logging.interceptor.spec.ts
```

### Cobertura objetivo: 70% minimo (branches, functions, lines, statements)

### Speckit commands
```bash
/speckit.specify Add missing unit tests for Condominiums, Buildings, Units modules (service + controller specs each), plus MinRoleGuard, JwtAuthGuard, and LoggingInterceptor. Target 70% coverage. Follow existing test patterns from auth and residents modules. Mock TypeORM repositories, test happy paths, error cases, edge cases, and validations.
```

---

## Feature 6: `011-database-migrations` (Sprint 2 — P2)

### Migraciones a verificar/crear
1. **Payments table** — Indexes: (unitId, period), (status), (dueDate)
2. **Common Spaces table** — Relacion con buildings
3. **Reservations table** — Compound index: (commonSpaceId, date, startTime, endTime)

### Speckit commands
```bash
/speckit.specify Verify and create missing database migrations for Payments, Common Spaces, and Reservations tables. Add performance indexes. Verify existing entity definitions match migration schemas. Generate TypeORM migrations using npm run migration:generate.
```

---

## Feature 7: `012-cicd-pipeline` (Sprint 3 — P3)

### Workflows a crear
```
.github/workflows/api-ci.yml    — lint -> test -> coverage (70% gate) -> build
.github/workflows/web-ci.yml    — lint -> test -> build
.github/workflows/docker-ci.yml — build images -> push to registry
```

### Speckit commands
```bash
/speckit.specify Create GitHub Actions CI/CD pipeline. Three workflows: api-ci (lint, test, coverage 70% gate, build), web-ci (lint, test, build), docker-ci (build images, push to registry). Node.js 24.x, PostgreSQL service for API tests, Redis service. Coverage enforcement at 70%. Triggers on PR to development and main.
```

---

## Feature 8: `013-documentation` (Sprint 3 — P4)

### Entregables
- Swagger/OpenAPI actualizado con todos los endpoints nuevos
- README.md actualizado con estado de modulos
- `.env.production.example` con todas las variables requeridas
- Deployment guide con docker-compose.prod.yml

### Speckit commands
```bash
/speckit.specify Update project documentation: Swagger decorators for all new endpoints (Payments, Common Spaces, Reservations), update README with current module status, create .env.production.example with all required vars, create deployment guide for docker-compose.prod.yml.
```
