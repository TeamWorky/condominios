# TeamWorky Condominios - Project Constitution

## Project Overview
Sistema de Gestión de Condominios - a multi-tenant condominium management platform built as an Nx monorepo with Angular 21 frontend and NestJS 11 backend.

## Architecture Principles

1. **Monorepo-first**: All code lives in one Nx workspace (`TeamWorky/condominios`). Shared code in `libs/`.
2. **Type safety**: Shared enums and interfaces are the single source of truth in `@condominios/shared`. No duplicate type definitions across frontend and backend.
3. **Separation of concerns**: Backend libs (`common`, `database`, `infrastructure`) are NOT importable by frontend. Only `@condominios/shared` crosses the boundary.
4. **Multi-tenant by design**: All data is scoped by `condominiumId`. JWT tokens carry `condominiumId` after condominium selection.
5. **Residents != Users**: Residents are building inhabitants (may not have system access). Users are system administrators. These are independent entities.

## Security Constraints (OWASP Top 10)

1. All endpoints require JWT authentication unless decorated with `@Public()`.
2. RBAC enforced via `RolesGuard` / `MinRoleGuard` at controller level. Hierarchy: SUPER_ADMIN > ADMIN > USER > GUEST.
3. All input validated via `class-validator` (backend) and Angular Reactive Forms (frontend).
4. Rate limiting on all endpoints via `ThrottlerModule`. Stricter limits on auth endpoints.
5. No sensitive data in JWT payload beyond `userId`, `email`, `role`, `condominiumId`.
6. Password hashing with bcrypt (12 rounds minimum).
7. Helmet middleware with CSP enabled in production.
8. CORS restricted to allowed origins in production.
9. Swagger/API docs disabled in production.
10. Security events (failed logins, auth failures) logged via Winston.

## Testing Requirements

- **Backend**: Jest, minimum 70% coverage (branches, functions, lines, statements).
- **Frontend**: Vitest (Angular 21 default), targeting 60% coverage initially.
- **Auth service**: 100% line/function coverage required.
- **All new modules**: Must have spec files before implementation begins.

## Code Style

- **Backend**: NestJS conventions, TypeORM entities, class-validator DTOs.
- **Frontend**: Angular 21 standalone components, signals preferred over subjects/BehaviorSubjects.
- **Styling**: SCSS, Angular Material 21 for UI components.
- **Language**: Spanish for user-facing labels, English for code identifiers and comments.
- **Enums**: Always defined in `@condominios/shared`, never locally.

## Tech Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| Frontend | Angular | 21 |
| UI Library | Angular Material | 21 |
| Frontend Testing | Vitest | 4.x |
| Backend | NestJS | 11 |
| Database | PostgreSQL + TypeORM | 0.3.x |
| Cache/Queue | Redis + BullMQ | - |
| Backend Testing | Jest | 30 |
| Monorepo | Nx | 22.x |
| Language | TypeScript | 5.9 |
| Container | Docker (multi-stage) | - |

## Project Structure

```
apps/
  api/          # NestJS HTTP API (port 3000)
  worker/       # NestJS BullMQ worker (no HTTP)
  web/          # Angular frontend (port 4200)
libs/
  shared/       # Enums, interfaces (frontend + backend)
  common/       # Guards, filters, interceptors, DTOs, entities, utils (backend only)
  database/     # TypeORM data-source, migrations, seeders (backend only)
  infrastructure/ # Logger, email, redis, queue, health, config (backend only)
```

## Module Dependency Rules

- `apps/web` -> `libs/shared` only
- `apps/api` -> `libs/shared`, `libs/common`, `libs/database`, `libs/infrastructure`
- `apps/worker` -> `libs/shared`, `libs/common`, `libs/infrastructure`
- `libs/shared` -> no dependencies
- `libs/common` -> `libs/shared`
- `libs/infrastructure` -> `libs/shared`, `libs/common`
- `libs/database` -> `libs/shared`, `libs/common`
