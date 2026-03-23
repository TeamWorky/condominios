# CLAUDE.md - Project Instructions

## Project Overview

Sistema de Gestion de Condominios - plataforma multi-tenant construida como monorepo Nx con Angular 21 (frontend) y NestJS 11 (backend).

## Mandatory Workflows

### Uso Obligatorio de Speckit

**TODA implementacion de codigo DEBE pasar por el flujo completo de Speckit. No se permite escribir codigo sin haber completado las fases previas.**

El flujo obligatorio es:

1. `/speckit.specify` - Crear la especificacion de la feature
2. `/speckit.clarify` - Resolver ambiguedades (si las hay)
3. `/speckit.plan` - Generar el plan tecnico de implementacion
4. `/speckit.tasks` - Generar las tareas ordenadas por dependencia
5. `/speckit.checklist` - Generar checklist de validacion
6. `/speckit.implement` - Ejecutar la implementacion tarea por tarea
7. **QA Manual** - Ejecutar validacion manual con quickstart.md ANTES del PR (ver seccion "QA Manual Obligatorio")
8. `/speckit.analyze` - Verificar consistencia entre artefactos (post-implementacion)

**Reglas:**
- No se acepta codigo nuevo sin un spec asociado en `.speckit/specs/[module].spec.md`
- Si el spec no existe, se crea primero usando `/speckit.specify`
- Si el usuario pide implementar algo directamente, primero preguntar si desea seguir el flujo Speckit
- Las specs existentes estan en `.speckit/specs/` y deben consultarse antes de modificar un modulo
- Todo cambio significativo a un modulo existente requiere actualizar su spec primero

### Testing Obligatorio

- Cada service: `[name].service.spec.ts` con cobertura de todos los metodos publicos
- Cada controller: `[name].controller.spec.ts` con cobertura de todos los endpoints
- Cada guard/interceptor/pipe custom: test correspondiente
- **Cobertura minima global**: 70% (branches, functions, lines, statements)
- **Auth service**: 100% cobertura obligatoria
- Los tests deben cubrir: happy path, error cases, edge cases, validaciones
- Ejecutar `npm test` antes de cada PR

### Seguridad OWASP Top 10

Cada modulo/feature debe pasar revision de seguridad:

- A01: Guards aplicados, roles verificados, `@Public()` solo donde corresponde
- A02: Sin secrets hardcodeados, bcrypt >= 12 rounds, env vars validadas
- A03: Sin SQL raw con interpolacion, ValidationPipe whitelist, sanitizacion
- A04: Rate limiting en endpoints sensibles, pagination con limites
- A05: CSP habilitado, CORS restringido en prod, Swagger oculto en prod
- A06: `npm audit` sin vulnerabilidades high/critical
- A07: Tokens rotados, lockout por intentos fallidos, blacklist en logout
- A09: Eventos de auth loggeados (login, logout, fallos, lockouts)

### Pruebas de Endpoints

Todo cambio que afecte endpoints DEBE incluir pruebas de los endpoints modificados. Verificar status codes, formato de respuesta, validaciones y auth/authz.

### QA Manual Obligatorio (Pre-PR)

**Todo feature DEBE pasar QA manual ANTES de crear el commit final y el PR. No se permite crear PRs sin haber validado manualmente la funcionalidad.**

**Proceso obligatorio:**
1. Levantar backend (`npm run start:api`) y frontend (`npm run start:web`)
2. Ejecutar TODOS los pasos de validacion definidos en `quickstart.md` del feature
3. Documentar el resultado de cada paso (PASS/FAIL)
4. Si algun paso falla: corregir, re-ejecutar tests automatizados, y repetir QA manual
5. Solo despues de que TODOS los pasos pasen, proceder con commit y PR

**Reglas:**
- Si el feature tiene `quickstart.md`, TODOS sus pasos deben ejecutarse y pasar
- Si no tiene `quickstart.md`, validar manualmente los flujos principales del feature
- El QA manual es responsabilidad del implementador, no del reviewer
- Marcar la tarea de QA manual como completada SOLO despues de ejecutar realmente los pasos
- **NUNCA** marcar QA como completado sin haberlo ejecutado — esto es una violacion grave del workflow

### Actualizacion de Documentacion (Obligatorio)

Ver reglas completas en `.speckit/constitution.md` seccion 7. En resumen: actualizar README, specs, Swagger y CLAUDE.md segun corresponda. No se aprueba PR con documentacion desactualizada.

### Gitflow (Obligatorio)

**TODO cambio de codigo DEBE seguir Gitflow estricto. No se permite push directo a `main` ni `development`.**

```
main          <- produccion estable (solo recibe merges de release/ y hotfix/)
development   <- rama de integracion (recibe merges de feature/)
feature/*     <- nuevas funcionalidades (branch desde development)
bugfix/*      <- correcciones no urgentes (branch desde development)
release/*     <- preparacion de release (branch desde development -> merge a main y development)
hotfix/*      <- correcciones urgentes en produccion (branch desde main -> merge a main y development)
```

**Reglas:**
- **NUNCA** hacer push directo a `main` ni `development`
- Todo cambio entra por Pull Request con al menos 1 aprobacion
- Antes de crear una feature, crear la branch desde `development`: `git checkout -b feature/[module]-[descripcion] development`
- Nombrar branches: `feature/[module]-[descripcion]`, `bugfix/[issue]-[descripcion]`, `hotfix/[issue]-[descripcion]`
- Commits siguen Conventional Commits: `feat:`, `fix:`, `docs:`, `test:`, `refactor:`, `chore:`
- Squash merge en PRs para mantener historial limpio
- Tags semanticos en releases: `v1.0.0`, `v1.1.0`, etc.
- Si el usuario pide hacer push a `main` o `development` directamente, advertir que viola Gitflow y sugerir crear un PR

## Architecture

### Monorepo Structure

```
apps/
  api/          # NestJS HTTP API (port 3000)
  worker/       # NestJS BullMQ worker (no HTTP)
  web/          # Angular frontend (port 4200)
libs/
  shared/       # Enums, interfaces (frontend + backend)
  common/       # Guards, filters, interceptors, base entity (backend only)
  database/     # TypeORM data-source, migrations, seeders (backend only)
  infrastructure/ # Logger, email, redis, queue, health (backend only)
```

### Module Dependency Rules

- `apps/web` -> `libs/shared` only
- `apps/api` -> `libs/shared`, `libs/common`, `libs/database`, `libs/infrastructure`
- `apps/worker` -> `libs/shared`, `libs/common`, `libs/infrastructure`
- `libs/shared` -> no dependencies
- `libs/common` -> `libs/shared`
- `libs/infrastructure` -> `libs/shared`, `libs/common`
- `libs/database` -> `libs/shared`, `libs/common`

### Architecture Principles

1. **Monorepo-first**: All code in one Nx workspace. Shared code in `libs/`.
2. **Type safety**: Shared enums and interfaces in `@condominios/shared`. No duplicate type definitions.
3. **Separation of concerns**: Backend libs (`common`, `database`, `infrastructure`) NOT importable by frontend. Only `@condominios/shared` crosses the boundary.
4. **Multi-tenant by design**: All data scoped by `condominiumId`. JWT carries `condominiumId` after selection.
5. **Residents != Users**: Residents are building inhabitants (may not have system access). Users are system administrators. Independent entities.

## Tech Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| Frontend | Angular + Angular Material | 21 |
| Backend | NestJS | 11 |
| Database | PostgreSQL + TypeORM | 0.3.x |
| Cache/Queue | Redis + BullMQ | - |
| Backend Testing | Jest | 30 |
| Frontend Testing | Vitest | 4.x |
| Monorepo | Nx | 22.x |
| Language | TypeScript | 5.9 |

## Code Style

- **Backend**: NestJS conventions, TypeORM entities, class-validator DTOs
- **Frontend**: Angular 21 standalone components, signals preferred over subjects/BehaviorSubjects
- **Styling**: SCSS, Angular Material 21
- **Language (MANDATORY)**: ALL code MUST be written in English — variable names, function names, class names, comments, file names, route paths, test descriptions. Spanish is ONLY allowed for user-facing labels (UI text, error messages, snackbar messages displayed to the end user). When in doubt, use English.
- **Enums**: Always defined in `@condominios/shared`, never locally
- **File naming**: kebab-case (`auth.service.ts`), PascalCase for classes, camelCase for methods
- **Suffixes**: `.dto.ts`, `.entity.ts`, `.spec.ts`, `.module.ts`, `.service.ts`, `.controller.ts`

## Security Constraints

1. All endpoints require JWT auth unless decorated with `@Public()`
2. RBAC via `RolesGuard` / `MinRoleGuard`. Hierarchy: SUPER_ADMIN > ADMIN > USER > GUEST
3. Input validated via `class-validator` (backend) and Angular Reactive Forms (frontend)
4. Rate limiting via `ThrottlerModule`. Stricter limits on auth endpoints
5. No sensitive data in JWT beyond `userId`, `email`, `role`, `condominiumId`
6. Password hashing: bcrypt, 12 rounds minimum
7. Helmet + CSP in production
8. CORS restricted in production
9. Swagger disabled in production
10. Security events logged via Winston

## Common Commands

```bash
# Development
npm run start:api          # API with hot reload
npm run start:worker       # Worker with hot reload
npm run start:web          # Frontend Angular

# Build
npm run build              # Build API + Worker

# Testing
npm test                   # Run all tests
npm run test:cov           # Tests with coverage

# Database
npm run migration:generate # Generate migration
npm run migration:run      # Run migrations
npm run migration:revert   # Revert last migration

# Quality
npm run lint               # Lint with auto-fix
npm run format             # Format with Prettier
```

## Speckit Commands

Use these slash commands for the SDD workflow:

| Command | Purpose |
|---------|---------|
| `/speckit.specify` | Create feature spec from natural language |
| `/speckit.clarify` | Resolve ambiguities in spec |
| `/speckit.plan` | Generate technical implementation plan |
| `/speckit.tasks` | Generate dependency-ordered tasks |
| `/speckit.checklist` | Generate QA validation checklist |
| `/speckit.implement` | Execute tasks step by step |
| `/speckit.analyze` | Check consistency across artifacts |
| `/speckit.taskstoissues` | Convert tasks to GitHub Issues |
| `/speckit.constitution` | Create/update project constitution |

## Frontend Services

- **DashboardService** (`apps/web/src/app/core/services/dashboard.service.ts`): Aggregates stats from BuildingService, UnitService, and ResidentService via forkJoin. Limits resident count to condominiums with ≤50 units.
- **DashboardComponent** uses Angular Signals (`signal()`, `computed()`) for reactive state. Payment cards show "Proximamente" until backend is ready.
- **BuildingService** (`apps/web/src/app/core/services/building.service.ts`): CRUD operations for buildings. `createBuilding(condominiumId, dto)` POSTs to `/condominiums/:condoId/buildings`. `toggleBuildingStatus(id, isActive)` PATCHes `/buildings/:id`.
- **Edificios Module** (`apps/web/src/app/features/edificios/`): Full CRUD for buildings — list (paginated table), create/edit (reactive form), detail (with units), deactivate/activate (with confirmation dialog). No delete — buildings are deactivated via PATCH `isActive: false`.
- **ResidentService** (`apps/web/src/app/features/residentes/services/resident.service.ts`): CRUD operations for residents scoped by unitId. `getResidentsByUnit(unitId, page, limit)` returns paginated residents. `toggleResidentStatus(id, isActive)` PATCHes via `updateResident`.
- **Residentes Module** (`apps/web/src/app/features/residentes/`): Full CRUD for residents — list (with cascading Building→Unit filters, paginated table), create/edit (reactive form with personal data + residence data sections), detail view, activate/deactivate (with confirmation dialog). Reuses ConfirmDialogComponent from edificios module. DocumentType/DocumentNumber read-only in edit mode.

## Active Technologies
- TypeScript 5.9, Node.js 24.x (001-add-mobile-app)
- TypeScript 5.9, Node.js 24.11.1 + Angular 21, Angular Material 21, RxJS (002-buildings-crud)
- Backend API REST existente (NestJS 11 + PostgreSQL) (002-buildings-crud)
- PostgreSQL (TypeORM), Redis (cache) (003-residents-crud)

## Recent Changes
- 001-add-mobile-app: Added TypeScript 5.9, Node.js 24.x
- 002-buildings-crud: Added TypeScript 5.9, Node.js 24.11.1 + Angular 21, Angular Material 21, RxJS
