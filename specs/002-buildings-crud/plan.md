# Implementation Plan: CRUD de Edificios en Frontend

**Branch**: `002-buildings-crud` | **Date**: 2026-03-18 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/002-buildings-crud/spec.md`

## Summary

Implementar el modulo completo de edificios en el frontend Angular, incluyendo listado paginado, creacion, edicion, detalle con unidades y eliminacion. Requiere corregir el modelo IBuilding y la URL de createBuilding que no coinciden con el backend. Se seguira el mismo patron de componentes standalone con lazy loading usado en el modulo de unidades.

## Technical Context

**Language/Version**: TypeScript 5.9, Node.js 24.11.1
**Primary Dependencies**: Angular 21, Angular Material 21, RxJS
**Storage**: Backend API REST existente (NestJS 11 + PostgreSQL)
**Testing**: Vitest 4.x (frontend)
**Target Platform**: Web browser (SPA Angular)
**Project Type**: Frontend module (consume API existente)
**Performance Goals**: Tabla de edificios carga en <2 segundos
**Constraints**: Solo consume endpoints existentes del backend, no crea nuevos
**Scale/Scope**: Condominios con hasta ~50 edificios tipicamente

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principio | Estado | Notas |
|-----------|--------|-------|
| I. Modular Architecture | PASS | Nuevo modulo `features/edificios/` independiente, lazy loaded |
| II. Test-First Development | PASS | Se escribiran tests Vitest para servicio y componentes |
| III. API-First Design | PASS | Consume endpoints backend existentes, se documentan contratos |
| IV. Multi-tenant | PASS | condominiumId del JWT via AuthService |
| V. Separation of Concerns | PASS | Solo usa `@condominios/shared` y servicios core |
| VI. Gitflow | PASS | Branch `002-buildings-crud` desde development |
| VII. Documentation | PASS | Se actualizara README, CLAUDE.md y spec |

## Project Structure

### Documentation (this feature)

```text
specs/002-buildings-crud/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output
│   └── buildings-api-contracts.md
├── checklists/
│   └── requirements.md  # Spec quality checklist
└── tasks.md             # Phase 2 output (/speckit.tasks)
```

### Source Code (repository root)

```text
apps/web/src/app/
├── core/
│   ├── models/
│   │   └── building.model.ts          # FIX: Corregir IBuilding, ICreateBuildingDto
│   └── services/
│       └── building.service.ts        # FIX: Corregir createBuilding URL
│
├── features/
│   └── edificios/                     # NUEVO modulo completo
│       ├── edificios.routes.ts        # Lazy-loaded routes
│       ├── components/
│       │   ├── building-list/
│       │   │   └── building-list.component.ts|html|scss|spec.ts
│       │   ├── building-form/
│       │   │   └── building-form.component.ts|html|scss|spec.ts
│       │   └── building-detail/
│       │       └── building-detail.component.ts|html|scss|spec.ts
│       └── services/                  # (no service propio, usa core/services/building.service.ts)
│
├── layout/
│   └── sidebar/
│       └── sidebar.component.ts       # ADD: menu item "Edificios"
│
└── app.routes.ts                      # ADD: ruta /edificios lazy-loaded
```

**Structure Decision**: Se sigue el mismo patron que `features/unidades/` — componentes standalone con lazy loading via `loadComponent()`. El BuildingService ya existe en `core/services/` y se reutiliza (corrigiendo bugs). No se crea un servicio nuevo en el feature module.

## Complexity Tracking

No hay violaciones a la constitucion. No se requiere justificacion de complejidad adicional.
