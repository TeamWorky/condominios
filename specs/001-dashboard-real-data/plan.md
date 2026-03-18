# Implementation Plan: Dashboard con Datos Reales

**Branch**: `001-dashboard-real-data` | **Date**: 2026-03-18 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/001-dashboard-real-data/spec.md`

## Summary

Conectar el dashboard del frontend Angular con los endpoints reales del backend NestJS, reemplazando los datos hardcodeados por llamadas HTTP autenticadas. Se creara un DashboardService que agregue datos de los endpoints existentes (buildings, units, residents) y muestre estados de carga, error y vacio. Los pagos se mostraran como "Proximamente" hasta que el backend implemente el controller correspondiente.

## Technical Context

**Language/Version**: TypeScript 5.9, Node.js 24.11.1
**Primary Dependencies**: Angular 21, Angular Material 21, NestJS 11 (backend existente)
**Storage**: PostgreSQL (backend, no se modifica), localStorage (tokens)
**Testing**: Vitest 4.x (frontend)
**Target Platform**: Web browser (SPA Angular)
**Project Type**: Frontend integration (consume API existente)
**Performance Goals**: Dashboard carga en <3 segundos, llamadas paralelas con forkJoin
**Constraints**: No crear nuevos endpoints backend, usar solo los existentes
**Scale/Scope**: Condominios con hasta ~50 unidades para conteo de residentes; mas de 50 muestra "N/A"

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principio | Estado | Notas |
|-----------|--------|-------|
| I. Modular Architecture | PASS | Se crea DashboardService como servicio independiente |
| II. Test-First Development | PASS | Se escribiran tests para DashboardService y componente |
| III. API-First Design | PASS | No se crean endpoints nuevos; se documentan los contratos consumidos |
| IV. Security by Default | PASS | Usa JWT existente, no expone datos sensibles |
| V. Observability & Logging | N/A | Feature de frontend, no aplica logging de backend |
| VI. Simplicity (YAGNI) | PASS | Usa endpoints existentes, no crea abstracciones innecesarias |
| SDD Workflow | PASS | Spec -> Plan -> Tasks -> Implement |
| Testing Backend 70% | N/A | No hay cambios en backend |
| OWASP Top 10 | PASS | No se introducen vulnerabilidades; tokens manejados via HttpInterceptor existente |
| Gitflow | PASS | Branch `001-dashboard-real-data` desde development |

## Project Structure

### Documentation (this feature)

```text
specs/001-dashboard-real-data/
├── spec.md              # Especificacion de la feature
├── plan.md              # Este archivo
├── research.md          # Investigacion de endpoints y decisiones
├── data-model.md        # Modelo de datos (interfaces frontend)
├── quickstart.md        # Guia rapida de setup
├── contracts/           # Contratos API consumidos
│   └── dashboard-api-usage.md
└── checklists/
    └── requirements.md  # Checklist de calidad del spec
```

### Source Code (repository root)

```text
apps/web/src/app/
├── core/services/
│   ├── dashboard.service.ts          # NUEVO: agrega datos de multiples endpoints
│   └── building.service.ts           # Existente, sin cambios
│
├── layout/dashboard/
│   ├── dashboard.component.ts        # MODIFICAR: reemplazar datos hardcodeados
│   ├── dashboard.component.html      # MODIFICAR: agregar estados loading/error/empty
│   └── dashboard.component.scss      # MODIFICAR: estilos para nuevos estados
│
├── features/residentes/services/
│   └── resident.service.ts           # MODIFICAR: corregir URLs del backend
│
└── features/unidades/services/
    └── unit.service.ts               # Existente, sin cambios
```

**Structure Decision**: No se crea un modulo nuevo. Se agrega un servicio (`DashboardService`) en `core/services/` y se modifican los archivos existentes del dashboard. El servicio de residentes se corrige para usar los endpoints correctos.

## Complexity Tracking

No hay violaciones de la constitucion. No se requiere justificacion de complejidad.
