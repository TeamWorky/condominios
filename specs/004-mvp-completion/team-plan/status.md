# Project Status — Condominios SaaS MVP

**Fecha**: 2026-05-20
**Branch base**: `development`

---

## Modulos Backend

| Modulo | Entity | Service | Controller | DTOs | Tests | Estado |
|--------|--------|---------|------------|------|-------|--------|
| Auth | N/A | ✅ | ✅ | 4 | ✅ 100% | **PRODUCTION** |
| Users | ✅ | ✅ | ✅ | 2 | ✅ | **PRODUCTION** |
| Condominiums | ✅ | ✅ | ✅ | 2 | ❌ | **SIN TESTS** |
| Buildings | ✅ | ✅ | ✅ | 2 | ❌ | **SIN TESTS** |
| Units | ✅ | ✅ | ✅ | 2 | ❌ | **SIN TESTS** |
| Residents | ✅ | ✅ | ✅ | 2 | ✅ | **PRODUCTION** |
| Payments | ✅ | ❌ | ❌ | ❌ | ❌ | **STUB** |
| Common Spaces | ✅ | ❌ | ❌ | ❌ | ❌ | **STUB** |
| Reservations | ✅ | ❌ | ❌ | ❌ | ❌ | **STUB** |

### Tests backend existentes (6 archivos)

- `apps/api/src/auth/auth.service.spec.ts` — ✅
- `apps/api/src/auth/auth.controller.spec.ts` — ✅
- `apps/api/src/users/users.service.spec.ts` — ✅
- `apps/api/src/users/users.controller.spec.ts` — ✅
- `apps/api/src/residents/residents.service.spec.ts` — ✅
- `apps/api/src/residents/residents.controller.spec.ts` — ✅

### Tests backend faltantes

- `condominiums.service.spec.ts` + `condominiums.controller.spec.ts`
- `buildings.service.spec.ts` + `buildings.controller.spec.ts`
- `units.service.spec.ts` + `units.controller.spec.ts`
- `min-role.guard.spec.ts`, `jwt-auth.guard.spec.ts`
- `logging.interceptor.spec.ts`

---

## Modulos Frontend

| Modulo | List | Create | Edit | Detail | Estado |
|--------|------|--------|------|--------|--------|
| Auth (login, select-condo) | N/A | N/A | N/A | N/A | ✅ **COMPLETO** |
| Dashboard | N/A | N/A | N/A | N/A | ✅ **COMPLETO** (pagos "Proximamente") |
| Edificios (Buildings) | ✅ | ✅ | ✅ | ✅ | ✅ **COMPLETO** |
| Unidades (Units) | ✅ | ✅ | ✅ | ✅ | ✅ **COMPLETO** |
| Residentes (Residents) | ✅ | ✅ | ✅ | ✅ | ✅ **COMPLETO** |
| Espacios Comunes | ✅ | N/A | N/A | ✅ | ✅ **COMPLETO** (UI lista, falta backend) |
| Reservas | ✅ calendar | ✅ dialog | N/A | ✅ | ✅ **COMPLETO** (UI lista, falta backend) |
| Pagos (Payments) | ✅ | ❌ stub | N/A | ❌ stub | ⚠️ **PARCIAL** |

### Frontend — Notas importantes

- **AuthService** usa `BehaviorSubject` — CLAUDE.md pide migrar a Angular Signals
- **DashboardComponent** ya usa Signals correctamente
- **PaymentService** (`features/pagos/services/`) existe pero apunta a endpoint inexistente
- **CommonSpaceService** y **ReservationService** en `core/services/` — implementados pero sin backend
- **PaymentFormComponent** y **PaymentDetailComponent** son stubs ("En construccion")

---

## Infraestructura (libs/)

| Lib | Modulo | Estado |
|-----|--------|--------|
| `@condominios/shared` | Enums (12), Interfaces, Validators | ✅ Completo |
| `@condominios/common` | Guards (3), Interceptors (3), Filters (1), Utils (7), BaseEntity | ✅ Completo |
| `@condominios/database` | DataSource, Migrations (7), Seeders | ✅ Completo |
| `@condominios/infrastructure` | Logger | ✅ Completo |
| | Redis | ✅ Completo |
| | Queue (BullMQ) | ✅ Completo |
| | Email | ✅ Completo |
| | Health | ✅ Completo |
| | Payku | ✅ Completo (PR #7 mergeado) |
| | Config (env validation) | ✅ Completo |

---

## Seguridad (Auditoria OWASP)

| Aspecto | Estado | Severidad | Detalle |
|---------|--------|-----------|---------|
| JWT secrets | ✅ OK | — | Sin defaults hardcodeados, validacion 32+ chars |
| Refresh token | ✅ OK | — | Usa `verify()` + bcrypt comparison |
| Bcrypt rounds | ✅ OK | — | 12 rounds (cumple CLAUDE.md) |
| Rate limiting auth | ⚠️ BASICO | Media | Global 100/min, sin limites especificos en auth |
| Token blacklist logout | ❌ FALTA | Media | Access token valido 15min post-logout |
| Auth event logging | ⚠️ PARCIAL | Baja | Logging generico, sin eventos especificos de auth |
| Swagger produccion | ❌ EXPUESTO | Media | Sin guard por NODE_ENV |
| CORS produccion | ⚠️ PERMISIVO | Media | Default `*`, sin restriccion en prod |
| CSP | ⚠️ DESHABILITADO | Media | `contentSecurityPolicy: false` |
| Account lockout | ❌ FALTA | Alta | Sin contador de intentos fallidos |
| Input validation | ✅ OK | — | GlobalValidationPipe + whitelist |
| Guards aplicacion | ⚠️ MANUAL | Baja | No global, hay que aplicar por endpoint |

---

## CI/CD

| Item | Estado |
|------|--------|
| GitHub Actions API CI | ❌ No existe |
| GitHub Actions Web CI | ❌ No existe (habia uno desactualizado) |
| Docker compose dev | ✅ Existe |
| Docker compose prod | ✅ Existe |
| Coverage gate (70%) | ❌ No configurado |

---

## Migraciones existentes

1. `1706650000001-CreateCondominiumsTable.ts`
2. `1706650000002-CreateBuildingsTable.ts`
3. `1706650000003-CreateUnitsTable.ts`
4. `1706650000004-CreateResidentsTable.ts`
5. `1706650000007-AddParkingAndStorageToUnits.ts`
6. `1706650000008-RemoveCondominiosTable.ts`
7. `1706650000009-AddPersonalFieldsToResidents.ts`

### Migraciones faltantes

- Payments table (indexes en unitId+period, status, dueDate)
- Common Spaces table
- Reservations table (exclusion constraint GIST para conflict detection de time slots)

---

## Specs existentes (.speckit/specs/)

- `auth.spec.md` ✅
- `buildings.spec.md` ✅
- `condominiums.spec.md` ✅
- `units.spec.md` ✅
- `residents.spec.md` ✅
- `users.spec.md` ✅
- `payments.spec.md` ✅
- `common-spaces.spec.md` ✅
- `reservations.spec.md` ✅
- `security.spec.md` ✅

## Specs de features (specs/)

- `001-add-mobile-app/` — Completado
- `001-dashboard-real-data/` — Completado
- `002-buildings-crud/` — Completado
- `003-residents-crud/` — Completado
- `004-mvp-completion/` — Plan maestro (este documento)
- `005-payku-library/` — Completado (PR #7 mergeado)
