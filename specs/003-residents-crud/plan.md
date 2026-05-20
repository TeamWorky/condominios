# Implementation Plan: Residents CRUD

**Branch**: `003-residents-crud` | **Date**: 2026-03-23 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `/specs/003-residents-crud/spec.md`

## Summary

CRUD completo de residentes gestionado por admin. Requiere modificar el backend (agregar campos personales a la entidad Resident + migration + DTOs + validacion de unicidad de documento) y reescribir completamente los 3 componentes frontend placeholder (list con filtros cascada, form con reactive forms, detail). Sigue el patron establecido por 002-buildings-crud.

## Technical Context

**Language/Version**: TypeScript 5.9, Node.js 24.11.1
**Primary Dependencies**:
- Backend: NestJS 11, TypeORM 0.3.x, PostgreSQL, Redis, class-validator
- Frontend: Angular 21, Angular Material 21, RxJS
**Storage**: PostgreSQL (TypeORM), Redis (cache)
**Testing**: Jest 30 (backend), Vitest 4.x (frontend)
**Target Platform**: Web application (monorepo Nx)
**Project Type**: Full-stack (backend API modifications + frontend CRUD)
**Performance Goals**: < 2s table load after unit selection
**Constraints**: JWT auth, RBAC (ADMIN+ mutations, USER+ reads), multi-tenant by condominiumId
**Scale/Scope**: Moderate — 7 new DB columns, 1 migration, updated DTOs/service, 3 frontend components rewritten

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Gate | Status | Notes |
|------|--------|-------|
| Modular Architecture | PASS | Residents module already exists, modifications stay within module boundary |
| Test-First Development | PASS | Tests planned for backend service/controller + frontend components |
| API-First Design | PASS | Contracts defined in contracts/residents-api-contracts.md |
| Security by Default | PASS | Existing JWT + MinRoleGuard preserved. ADMIN+ for mutations, USER+ for reads |
| Observability & Logging | PASS | Existing logger calls in service preserved |
| Simplicity (YAGNI) | PASS | Minimal changes — add fields, no new patterns or abstractions |
| Database Standards | PASS | Migration for schema change, UUIDs, soft delete, timestamps |
| Code Quality | PASS | ESLint + Prettier, strict TypeScript, class-validator DTOs |

## Project Structure

### Documentation (this feature)

```text
specs/003-residents-crud/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output
│   └── residents-api-contracts.md
└── tasks.md             # Phase 2 output (via /speckit.tasks)
```

### Source Code (modifications)

```text
# Backend modifications
apps/api/src/residents/
├── entities/
│   └── resident.entity.ts          # Add 7 personal fields
├── dto/
│   ├── create-resident.dto.ts      # Add personal field validations
│   └── update-resident.dto.ts      # Exclude documentType/documentNumber from updates
├── residents.service.ts            # Add document uniqueness validation
├── residents.service.spec.ts       # New: unit tests for service
├── residents.controller.spec.ts    # New: unit tests for controller
└── residents.module.ts             # No changes expected

libs/database/src/migrations/
└── TIMESTAMP-AddPersonalFieldsToResidents.ts  # New migration

# Frontend modifications
apps/web/src/app/core/models/
└── resident.model.ts               # Rewrite to match updated backend entity

apps/web/src/app/features/residentes/
├── services/
│   └── resident.service.ts         # Update DTOs, add toggle status method
├── components/
│   ├── resident-list/
│   │   ├── resident-list.component.ts    # Full rewrite with cascading filters
│   │   ├── resident-list.component.html  # New: extracted template
│   │   ├── resident-list.component.scss  # New: styles
│   │   └── resident-list.component.spec.ts  # New: tests
│   ├── resident-form/
│   │   ├── resident-form.component.ts    # Full rewrite with reactive form
│   │   ├── resident-form.component.html  # New: extracted template
│   │   ├── resident-form.component.scss  # New: styles
│   │   └── resident-form.component.spec.ts  # New: tests
│   └── resident-detail/
│       ├── resident-detail.component.ts  # Full rewrite
│       ├── resident-detail.component.html  # New: extracted template
│       ├── resident-detail.component.scss  # New: styles
│       └── resident-detail.component.spec.ts  # New: tests
└── residentes.routes.ts            # May need query param support

apps/web/src/app/layout/sidebar/
└── sidebar.component.ts            # Verify "Residentes" menu item exists

# Shared (no changes expected)
libs/shared/src/enums/
├── resident-type.enum.ts           # Existing: OWNER, TENANT, FAMILY_MEMBER, GUEST
└── document-type.enum.ts           # Existing: RUT, PASSPORT, DNI, OTHER
```

**Structure Decision**: All backend changes stay within the existing `residents` module. Frontend rewrites the 3 placeholder components in-place. No new modules, no new shared code. Migration added to existing migrations directory.

## Complexity Tracking

No constitution violations. No complexity justification needed.
