# Tasks: CRUD de Edificios en Frontend

**Input**: Design documents from `/specs/002-buildings-crud/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/buildings-api-contracts.md, quickstart.md

**Tests**: Included per project constitution (mandatory frontend testing with Vitest).

**Organization**: Tasks grouped by user story. US1+US2 are P1 (MVP), US3+US4 are P2, US5 is P3.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2)
- Include exact file paths in descriptions

---

## Phase 1: Setup (Fix Existing Code)

**Purpose**: Fix the IBuilding model and BuildingService bugs identified in research.md (R1, R2)

- [x] T001 Rewrite IBuilding interface and add ICreateBuildingDto, IUpdateBuildingDto in `apps/web/src/app/core/models/building.model.ts` to match backend entity (research R1)
- [x] T002 Fix `createBuilding()` URL in `apps/web/src/app/core/services/building.service.ts` to POST to `/api/v1/condominiums/${condominiumId}/buildings` and add `toggleBuildingStatus()` method (research R2)

---

## Phase 2: Foundational (Routing & Navigation)

**Purpose**: Add route and sidebar entry so the edificios module is accessible

**CRITICAL**: No user story components can be navigated to until this phase is complete

- [x] T003 [P] Create edificios routes file `apps/web/src/app/features/edificios/edificios.routes.ts` with lazy-loaded child routes for list, create, edit, detail
- [x] T004 [P] Add `/edificios` lazy-loaded route in `apps/web/src/app/app.routes.ts` pointing to edificios.routes.ts
- [x] T005 Add "Edificios" menu item with building icon in `apps/web/src/app/layout/sidebar/sidebar.component.ts`

**Checkpoint**: Navigation to /edificios works (shows empty component or 404 until US1 is implemented)

---

## Phase 3: User Story 1 - Listar edificios del condominio (Priority: P1) MVP

**Goal**: Admin sees a paginated table of buildings for the selected condominium at /edificios

**Independent Test**: Login as admin, select condominium, navigate to /edificios, verify table shows buildings with pagination

### Tests for User Story 1

- [x] T006 [P] [US1] Write unit tests for BuildingListComponent in `apps/web/src/app/features/edificios/components/building-list/building-list.component.spec.ts`

### Implementation for User Story 1

- [x] T007 [US1] Create BuildingListComponent with paginated Material table (name, code, floors, address, isActive columns) in `apps/web/src/app/features/edificios/components/building-list/building-list.component.ts|html|scss`
- [x] T008 [US1] Add empty state "No hay edificios registrados" with button to create in BuildingListComponent
- [x] T009 [US1] Add action buttons column (edit, detail, deactivate/activate) in BuildingListComponent table

**Checkpoint**: US1 complete — table displays buildings with pagination and empty state

---

## Phase 4: User Story 2 - Crear nuevo edificio (Priority: P1) MVP

**Goal**: Admin creates a building via a reactive form with validations

**Independent Test**: From building list, click "Nuevo Edificio", fill form, save, verify it appears in list

### Tests for User Story 2

- [x] T010 [P] [US2] Write unit tests for BuildingFormComponent in `apps/web/src/app/features/edificios/components/building-form/building-form.component.spec.ts`

### Implementation for User Story 2

- [x] T011 [US2] Create BuildingFormComponent with Angular Reactive Form (name, code, floors, undergroundFloors, hasElevator, address) in `apps/web/src/app/features/edificios/components/building-form/building-form.component.ts|html|scss`
- [x] T012 [US2] Add form validations: name (required, maxLength 255), code (required, maxLength 50), floors (required, min 1, integer), undergroundFloors (min 0, integer), address (maxLength 500)
- [x] T013 [US2] Implement create flow: call BuildingService.createBuilding(), show success snackbar, navigate to list. Handle 409 duplicate code error on code field

**Checkpoint**: US1+US2 complete — MVP delivered (list + create)

---

## Phase 5: User Story 3 - Editar edificio existente (Priority: P2)

**Goal**: Admin edits an existing building using the same form component in edit mode

**Independent Test**: From list, click edit on a building, modify a field, save, verify changes reflected

### Implementation for User Story 3

- [x] T014 [US3] Add edit mode to BuildingFormComponent: load building by ID, pre-populate form, call updateBuilding() on save
- [x] T015 [US3] Handle edit-specific errors: 404 navigate to list, 409 duplicate code on code field

**Checkpoint**: US3 complete — edit building works with form reuse

---

## Phase 6: User Story 4 - Ver detalle de edificio con unidades (Priority: P2)

**Goal**: Admin views building details including associated units list

**Independent Test**: From list, click building name, verify detail view shows all fields and units

### Tests for User Story 4

- [x] T016 [P] [US4] Write unit tests for BuildingDetailComponent in `apps/web/src/app/features/edificios/components/building-detail/building-detail.component.spec.ts`

### Implementation for User Story 4

- [x] T017 [US4] Create BuildingDetailComponent showing all building fields and units list in `apps/web/src/app/features/edificios/components/building-detail/building-detail.component.ts|html|scss`
- [x] T018 [US4] Add empty units message "Este edificio no tiene unidades registradas" and action buttons (edit, back to list)

**Checkpoint**: US4 complete — detail view with units works

---

## Phase 7: User Story 5 - Desactivar/Activar edificio (Priority: P3)

**Goal**: Admin can deactivate or reactivate a building with confirmation dialog

**Independent Test**: From list, click deactivate on active building, confirm, verify status changes to inactive

### Implementation for User Story 5

- [x] T019 [US5] Add confirmation dialog for deactivate/activate actions in BuildingListComponent using Material Dialog
- [x] T020 [US5] Implement toggle logic: call BuildingService.toggleBuildingStatus(), refresh list, show success snackbar

**Checkpoint**: US5 complete — all 5 user stories functional

---

## Phase 8: Polish & Cross-Cutting Concerns

**Purpose**: Testing, documentation, and final validation

- [x] T021 Update dashboard "Total Edificios" card routerLink from `/unidades` to `/edificios` in `apps/web/src/app/features/dashboard/dashboard.component.ts`
- [x] T022 Run all frontend tests: `cd apps/web && npx ng test --no-watch`
- [x] T023 Run quickstart.md validation (8 manual QA steps)
- [x] T024 Update README.md and CLAUDE.md with buildings module documentation
- [ ] T025 Commit all changes with conventional commit message
- [ ] T026 Create PR to development branch

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - fix model and service first
- **Foundational (Phase 2)**: Depends on Phase 1 (model must be correct for routes)
- **US1 (Phase 3)**: Depends on Phase 2 (needs routes to navigate)
- **US2 (Phase 4)**: Depends on Phase 2 (needs routes) + can start after US1
- **US3 (Phase 5)**: Depends on US2 (reuses BuildingFormComponent)
- **US4 (Phase 6)**: Depends on Phase 2 only (independent component)
- **US5 (Phase 7)**: Depends on US1 (actions in list component)
- **Polish (Phase 8)**: Depends on all user stories complete

### User Story Dependencies

- **US1 (List)**: After Phase 2 — no story dependencies
- **US2 (Create)**: After Phase 2 — independent but logically follows US1
- **US3 (Edit)**: After US2 — reuses BuildingFormComponent
- **US4 (Detail)**: After Phase 2 — independent component
- **US5 (Deactivate/Activate)**: After US1 — adds actions to list

### Within Each User Story

- Tests written first (if included), must fail before implementation
- Component creation before integration logic
- Core UI before error handling

### Parallel Opportunities

- T001 and T002 can run in parallel (different files)
- T003 and T004 can run in parallel (different files)
- T006 and T010 can run in parallel (different test files)
- US4 can run in parallel with US3 (independent components)

---

## Parallel Example: Setup Phase

```bash
# Fix model and service in parallel:
Task T001: "Rewrite IBuilding in apps/web/src/app/core/models/building.model.ts"
Task T002: "Fix BuildingService in apps/web/src/app/core/services/building.service.ts"
```

## Parallel Example: Foundational Phase

```bash
# Create routes and app route in parallel:
Task T003: "Create edificios.routes.ts"
Task T004: "Add /edificios route in app.routes.ts"
# Then sidebar (depends on route existing):
Task T005: "Add Edificios menu item in sidebar"
```

---

## Implementation Strategy

### MVP First (US1 + US2)

1. Complete Phase 1: Fix model + service
2. Complete Phase 2: Routes + sidebar
3. Complete Phase 3: US1 - List buildings
4. Complete Phase 4: US2 - Create building
5. **STOP and VALIDATE**: Test list + create independently
6. This delivers the core requirement: "poder agregar edificios desde el frontend"

### Incremental Delivery

1. Setup + Foundational → Foundation ready
2. US1 (List) → Table with buildings visible
3. US2 (Create) → Can add new buildings (MVP!)
4. US3 (Edit) → Can modify existing buildings
5. US4 (Detail) → Can view building with units
6. US5 (Deactivate) → Can toggle building status
7. Polish → Tests pass, docs updated, PR created

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story
- No DELETE endpoint used — buildings deactivated via PATCH with isActive: false
- Reuse BuildingFormComponent for both create (US2) and edit (US3)
- Follow `features/unidades/` component pattern (standalone, lazy-loaded)
- Tests mandatory per project constitution
