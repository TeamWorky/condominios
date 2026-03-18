# Tasks: Dashboard con Datos Reales

**Input**: Design documents from `/specs/001-dashboard-real-data/`
**Prerequisites**: plan.md (required), spec.md (required), research.md, data-model.md, contracts/

**Tests**: Tests incluidos ya que la constitucion exige testing para frontend (Vitest).

**Organization**: Tasks grouped by user story for independent implementation and testing.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story (US1, US2, US3)
- Exact file paths included

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Crear interfaces compartidas y el DashboardService base

- [x] T001 [P] Create DashboardStats interface in `apps/web/src/app/core/models/dashboard.models.ts` with fields: totalResidents, totalBuildings, totalUnits, occupiedUnits, occupancyRate, residentsAvailable
- [x] T002 [P] Update DashboardCard interface in `apps/web/src/app/layout/dashboard/dashboard.component.ts` adding fields: loading, error, comingSoon, routerLink; removing: change, changeType
- [x] T003 Fix ResidentService URLs in `apps/web/src/app/features/residentes/services/resident.service.ts` to use `/api/v1/units/{unitId}/residents` instead of `/residents`. Update `getResidents()` to require `unitId` parameter. Add `getResidentCountByUnit(unitId)` method that calls with `limit=1` and returns `meta.total`

**Checkpoint**: Interfaces defined, ResidentService corrected

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: DashboardService que agrega datos de multiples endpoints

**CRITICAL**: El DashboardService debe estar completo antes de integrar con el componente

- [x] T004 Create DashboardService in `apps/web/src/app/core/services/dashboard.service.ts` with method `loadStats(condominiumId: string)` that uses `forkJoin` to call BuildingService.getBuildingsByCondominium and UnitService.getUnitsByCondominium in parallel. Extract totals from `meta.total` responses. Calculate occupancyRate from units data. Return Observable<DashboardStats>
- [x] T005 Add resident count aggregation to DashboardService in `apps/web/src/app/core/services/dashboard.service.ts`: after getting units, if totalUnits <= 50, use `forkJoin` to call ResidentService.getResidentCountByUnit for each unit and sum totals. If totalUnits > 50, set residentsAvailable=false and totalResidents=0
- [x] T006 Add error handling to DashboardService in `apps/web/src/app/core/services/dashboard.service.ts`: wrap API calls with `catchError`, return partial stats when some calls fail, include error state per metric

**Checkpoint**: DashboardService ready, can fetch and aggregate real data from backend

---

## Phase 3: User Story 1 - Ver resumen general del condominio (Priority: P1) MVP

**Goal**: Dashboard muestra datos reales de edificios, unidades y residentes del condominio seleccionado

**Independent Test**: Login como admin, seleccionar condominio, verificar que los numeros del dashboard coinciden con la BD

### Tests for User Story 1

- [x] T007 [P] [US1] Write unit tests for DashboardService in `apps/web/src/app/core/services/dashboard.service.spec.ts`: test loadStats returns correct totals, test occupancyRate calculation, test residentsAvailable=false when >50 units, test error handling returns partial stats
- [x] T008 [P] [US1] Write unit tests for DashboardComponent in `apps/web/src/app/layout/dashboard/dashboard.component.spec.ts`: test loading state shows spinners, test data state shows real values, test empty state shows zero message, test error state shows retry button

### Implementation for User Story 1

- [x] T009 [US1] Refactor DashboardComponent in `apps/web/src/app/layout/dashboard/dashboard.component.ts`: inject DashboardService and AuthService, replace hardcoded `cards` array with Angular Signals (`loading = signal(true)`, `error = signal<string|null>(null)`, `stats = signal<DashboardStats|null>(null)`). On init, get condominiumId from AuthService and call DashboardService.loadStats(). Build cards dynamically from stats
- [x] T010 [US1] Update dashboard template in `apps/web/src/app/layout/dashboard/dashboard.component.html`: replace hardcoded card values with signal-bound data. Add loading skeleton (mat-progress-bar or mat-spinner) inside each card when loading=true. Show "Sin datos" when stats values are zero. Show error message with "Reintentar" button when error is set. Show "N/A" for residents when residentsAvailable=false
- [x] T011 [US1] Update dashboard styles in `apps/web/src/app/layout/dashboard/dashboard.component.scss`: add styles for loading skeleton, empty state, error state, and "N/A" tooltip
- [x] T012 [US1] Add auto-refresh on navigation back in `apps/web/src/app/layout/dashboard/dashboard.component.ts`: implement `ngOnInit` to reload data every time component initializes (Angular router reuse strategy or explicit reload)

**Checkpoint**: Dashboard shows real building count, unit count, occupancy rate, and resident count from backend API

---

## Phase 4: User Story 2 - Ver actividad reciente de pagos (Priority: P2)

**Goal**: Dashboard muestra "Proximamente" para pagos ya que el backend no tiene controller implementado

**Independent Test**: Verificar que las tarjetas de pagos muestran "Proximamente" con icono apropiado, y la seccion de pagos recientes muestra mensaje de desarrollo

### Implementation for User Story 2

- [x] T013 [P] [US2] Update payment cards in `apps/web/src/app/layout/dashboard/dashboard.component.ts`: set "Pagos Pendientes" and "Pagos del Mes" cards with `comingSoon: true`, value "Proximamente", and a distinctive icon
- [x] T014 [US2] Update recent payments section in `apps/web/src/app/layout/dashboard/dashboard.component.html`: replace hardcoded `recentPayments` array with empty state. Show mat-card with message "El modulo de pagos esta en desarrollo" and an icon. Add TODO comment marking where to enable PaymentService calls when backend is ready
- [x] T015 [US2] Add "coming soon" visual style in `apps/web/src/app/layout/dashboard/dashboard.component.scss`: style for comingSoon cards (grayed out icon, italic text, subtle background)

**Checkpoint**: Payment cards show "Proximamente", recent payments show development message

---

## Phase 5: User Story 3 - Navegacion rapida desde el dashboard (Priority: P3)

**Goal**: Las tarjetas de resumen y acciones rapidas navegan a las secciones correctas

**Independent Test**: Clic en cada tarjeta y accion rapida navega a la seccion esperada

### Implementation for User Story 3

- [x] T016 [P] [US3] Add routerLink to stat cards in `apps/web/src/app/layout/dashboard/dashboard.component.ts`: "Total Residentes" → `/residentes`, "Unidades Ocupadas" → `/unidades`, "Total Edificios" → `/edificios`. Cards with comingSoon=true should not be clickable
- [x] T017 [US3] Update card template for clickability in `apps/web/src/app/layout/dashboard/dashboard.component.html`: wrap stat cards with `[routerLink]` directive. Add cursor:pointer style and hover effect for clickable cards. Disable click for comingSoon cards
- [x] T018 [US3] Verify quick actions links in `apps/web/src/app/layout/dashboard/dashboard.component.html`: ensure "Ver residentes", "Ver pagos", "Crear residente", "Registrar pago" buttons navigate to correct routes. Disable payment-related actions with tooltip "Proximamente"

**Checkpoint**: All cards and quick actions navigate correctly

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Cleanup, validation, and documentation

- [x] T019 [P] Remove all hardcoded mock data from `apps/web/src/app/layout/dashboard/dashboard.component.ts`: delete old `cards` array, `recentPayments` array, and any static data. Ensure zero references to mock values
- [x] T020 [P] Verify no db.json dependency in dashboard flow: ensure `apps/web/src/app/layout/dashboard/` does not import or reference `db.json` or json-server endpoints
- [x] T021 [P] Run all frontend tests: `npm run test:web` and verify all pass
- [x] T022 [P] Run quickstart.md validation: follow steps in `specs/001-dashboard-real-data/quickstart.md` end-to-end
- [ ] T023 Commit all changes following Conventional Commits: `feat: connect dashboard to real backend API data`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 (Setup)**: No dependencies - start immediately
- **Phase 2 (Foundational)**: Depends on T003 (ResidentService fix) from Phase 1
- **Phase 3 (US1)**: Depends on Phase 2 (DashboardService must exist)
- **Phase 4 (US2)**: Depends on Phase 3 (dashboard component must be refactored)
- **Phase 5 (US3)**: Depends on Phase 3 (dashboard component must be refactored)
- **Phase 6 (Polish)**: Depends on all phases complete

### User Story Dependencies

- **US1 (P1)**: Depends on Foundational → MVP deliverable
- **US2 (P2)**: Depends on US1 being refactored (same component file)
- **US3 (P3)**: Depends on US1 being refactored (same component file). Can run parallel with US2

### Parallel Opportunities

**Phase 1**:
```
T001 (DashboardStats interface) || T002 (DashboardCard interface) || T003 (ResidentService fix)
```

**Phase 3 (US1)**:
```
T007 (DashboardService tests) || T008 (DashboardComponent tests)
```

**Phase 4+5 after US1 complete**:
```
US2 (T013-T015) can partially overlap with US3 (T016-T018) since they touch different sections
```

**Phase 6**:
```
T019 || T020 || T021 || T022
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (T001-T003)
2. Complete Phase 2: Foundational (T004-T006)
3. Complete Phase 3: User Story 1 (T007-T012)
4. **STOP and VALIDATE**: Dashboard shows real data from backend
5. Deploy/demo if ready

### Incremental Delivery

1. Setup + Foundational → DashboardService ready
2. Add US1 → Real stats on dashboard → **MVP!**
3. Add US2 → Payment "coming soon" states → Clean UX
4. Add US3 → Navigation from cards → Full feature
5. Polish → Cleanup, tests, validation → PR ready

---

## Notes

- All file paths are relative to repository root
- This feature is frontend-only; no backend changes
- Payments are intentionally shown as "Proximamente" per FR-010
- ResidentService fix (T003) is prerequisite for dashboard to get resident counts
- Angular Signals used for state management per constitution preference
- Total tasks: 23
