# Tasks: Residents CRUD

**Input**: Design documents from `/specs/003-residents-crud/`
**Prerequisites**: plan.md (required), spec.md (required), research.md, data-model.md, contracts/

**Tests**: Included — project constitution requires 70% minimum coverage.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

---

## Phase 1: Setup (Backend Entity & Migration)

**Purpose**: Add personal fields to Resident entity, update DTOs, create migration. This is the foundation — all frontend work depends on the backend having the correct data model.

- [ ] T001 [P] Add personal fields (firstName, lastName, documentType, documentNumber, dateOfBirth, phone, email) to Resident entity in `apps/api/src/residents/entities/resident.entity.ts`
- [ ] T002 [P] Update CreateResidentDto with personal field validations (class-validator) in `apps/api/src/residents/dto/create-resident.dto.ts`
- [ ] T003 Update UpdateResidentDto to exclude documentType and documentNumber from updates in `apps/api/src/residents/dto/update-resident.dto.ts`
- [X] T004 Generate TypeORM migration for new columns in `libs/database/src/migrations/` using `npm run migration:generate`
- [X] T005 Add document uniqueness validation in ResidentsService.create() — check no active resident with same documentNumber exists in another unit in `apps/api/src/residents/residents.service.ts`
- [X] T006 [P] Rewrite IResident, ICreateResidentDto, IUpdateResidentDto interfaces to match updated backend entity in `apps/web/src/app/core/models/resident.model.ts`

**Checkpoint**: Backend entity has personal fields, migration ready, DTOs validate correctly, frontend model aligned

---

## Phase 2: Foundational (Routes, Sidebar, Service)

**Purpose**: Ensure navigation works and frontend service is ready for all user stories

**CRITICAL**: No user story components can be navigated to until this phase is complete

- [X] T007 Verify "Residentes" menu item with people icon exists in `apps/web/src/app/layout/sidebar/sidebar.component.ts` (add if missing)
- [X] T008 Update ResidentService methods to use updated IResident model and add toggleResidentStatus method in `apps/web/src/app/features/residentes/services/resident.service.ts`
- [X] T009 Verify residentes routes are correctly configured in `apps/web/src/app/features/residentes/residentes.routes.ts`

**Checkpoint**: Navigation to /residentes works, service methods ready

---

## Phase 3: User Story 1 - Listar residentes con filtro por edificio y unidad (Priority: P1) MVP

**Goal**: Admin sees cascading selects (Building → Unit) and a paginated table of residents for the selected unit

**Independent Test**: Login as admin, select condominium, navigate to /residentes, select building and unit, verify table shows residents with pagination

### Tests for User Story 1

- [X] T010 [P] [US1] Write unit tests for ResidentListComponent in `apps/web/src/app/features/residentes/components/resident-list/resident-list.component.spec.ts`

### Implementation for User Story 1

- [X] T011 [US1] Rewrite ResidentListComponent with cascading building/unit selects, paginated Material table (name, document, type, status, moveInDate columns), empty states, and action buttons in `apps/web/src/app/features/residentes/components/resident-list/resident-list.component.ts|html|scss`
- [X] T012 [US1] Add empty state "Seleccione una unidad para ver sus residentes" before unit selection and "No hay residentes en esta unidad" with create button when unit has no residents in ResidentListComponent
- [X] T013 [US1] Add action buttons column (edit, detail, deactivate/activate) in ResidentListComponent table

**Checkpoint**: US1 complete — cascading filters work, table displays residents with pagination and empty states

---

## Phase 4: User Story 2 - Crear nuevo residente (Priority: P1) MVP

**Goal**: Admin creates a resident via a reactive form with personal data fields and validations

**Independent Test**: From resident list with unit selected, click "Nuevo Residente", fill form, save, verify it appears in list

### Tests for User Story 2

- [X] T014 [P] [US2] Write unit tests for ResidentFormComponent in `apps/web/src/app/features/residentes/components/resident-form/resident-form.component.spec.ts`

### Implementation for User Story 2

- [X] T015 [US2] Rewrite ResidentFormComponent with Angular Reactive Form (firstName, lastName, documentType, documentNumber, dateOfBirth, phone, email, residentType, moveInDate, isPrimary, relationship) in `apps/web/src/app/features/residentes/components/resident-form/resident-form.component.ts|html|scss`
- [X] T016 [US2] Add form validations: firstName (required, maxLength 100), lastName (required, maxLength 100), documentType (required), documentNumber (required, maxLength 50), dateOfBirth (required), phone (optional, maxLength 20), email (optional, email format)
- [X] T017 [US2] Implement create flow: receive unitId from query params or route state, call ResidentService.createResident(), show success snackbar, navigate to list. Handle 409 duplicate document error on documentNumber field

**Checkpoint**: US1+US2 complete — MVP delivered (list + create)

---

## Phase 5: User Story 3 - Editar residente existente (Priority: P2)

**Goal**: Admin edits an existing resident using the same form component in edit mode

**Independent Test**: From list, click edit on a resident, modify a field, save, verify changes reflected

### Implementation for User Story 3

- [X] T018 [US3] Add edit mode to ResidentFormComponent: load resident by ID, pre-populate form, call updateResident() on save. Fields unitId, documentType, documentNumber are read-only in edit mode in `apps/web/src/app/features/residentes/components/resident-form/resident-form.component.ts`
- [X] T019 [US3] Handle edit-specific errors: 404 navigate to list, show field-level errors on validation failures

**Checkpoint**: US3 complete — edit resident works with form reuse

---

## Phase 6: User Story 4 - Ver detalle de residente (Priority: P2)

**Goal**: Admin views resident details including personal data, residence info, and unit data

**Independent Test**: From list, click resident name, verify detail view shows all fields

### Tests for User Story 4

- [X] T020 [P] [US4] Write unit tests for ResidentDetailComponent in `apps/web/src/app/features/residentes/components/resident-detail/resident-detail.component.spec.ts`

### Implementation for User Story 4

- [X] T021 [US4] Rewrite ResidentDetailComponent showing personal data section (name, document, dateOfBirth, phone, email), residence data section (type, isPrimary, relationship, moveInDate, moveOutDate, status), and unit info section in `apps/web/src/app/features/residentes/components/resident-detail/resident-detail.component.ts|html|scss`
- [X] T022 [US4] Add action buttons (edit, back to list) and loading/error states in ResidentDetailComponent

**Checkpoint**: US4 complete — detail view with all data sections works

---

## Phase 7: User Story 5 - Desactivar/Activar residente (Priority: P3)

**Goal**: Admin can deactivate or reactivate a resident with confirmation dialog

**Independent Test**: From list, click deactivate on active resident, confirm, verify status changes to inactive

### Implementation for User Story 5

- [X] T023 [US5] Add confirmation dialog for deactivate/activate actions in ResidentListComponent using ConfirmDialogComponent (import from edificios module)
- [X] T024 [US5] Implement toggle logic: call ResidentService.toggleResidentStatus(), refresh list, show success snackbar. On deactivate, optionally set moveOutDate via dialog

**Checkpoint**: US5 complete — all 5 user stories functional

---

## Phase 8: Polish & Cross-Cutting Concerns

**Purpose**: Testing, documentation, backend tests, and final validation

- [X] T025 [P] Write unit tests for ResidentsService in `apps/api/src/residents/residents.service.spec.ts` covering create (with document uniqueness), findAllByUnit, findOne, update, remove
- [X] T026 [P] Write unit tests for ResidentsController in `apps/api/src/residents/residents.controller.spec.ts` covering all 5 endpoints
- [X] T027 Run all frontend tests: `cd apps/web && npx ng test --no-watch`
- [X] T028 Run all backend tests: `npm test -- --projects=api`
- [ ] T029 Run quickstart.md validation (8 manual QA steps)
- [X] T030 Update CLAUDE.md with residents module documentation (ResidentService, Residentes Module descriptions)
- [ ] T031 Commit all changes with conventional commit message
- [ ] T032 Create PR to development branch

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — fix entity and model first
- **Foundational (Phase 2)**: Depends on Phase 1 (model must be correct for service)
- **US1 (Phase 3)**: Depends on Phase 2 (needs service and routes)
- **US2 (Phase 4)**: Depends on Phase 2 (needs service) + can start after US1
- **US3 (Phase 5)**: Depends on US2 (reuses ResidentFormComponent)
- **US4 (Phase 6)**: Depends on Phase 2 only (independent component)
- **US5 (Phase 7)**: Depends on US1 (actions in list component)
- **Polish (Phase 8)**: Depends on all user stories complete

### User Story Dependencies

- **US1 (List)**: After Phase 2 — no story dependencies
- **US2 (Create)**: After Phase 2 — independent but logically follows US1
- **US3 (Edit)**: After US2 — reuses ResidentFormComponent
- **US4 (Detail)**: After Phase 2 — independent component
- **US5 (Deactivate/Activate)**: After US1 — adds actions to list

### Within Each User Story

- Tests written first (if included), must fail before implementation
- Component creation before integration logic
- Core UI before error handling

### Parallel Opportunities

- T001 and T002 can run in parallel (different files)
- T006 can run in parallel with T001/T002 (different app)
- T010 and T014 can run in parallel (different test files)
- US4 can run in parallel with US3 (independent components)
- T025 and T026 can run in parallel (different test files)

---

## Parallel Example: Setup Phase

```bash
# Fix backend entity and frontend model in parallel:
Task T001: "Add personal fields to Resident entity"
Task T002: "Update CreateResidentDto with validations"
Task T006: "Rewrite IResident frontend model"
```

## Parallel Example: Backend Tests

```bash
# Write backend tests in parallel:
Task T025: "Service tests in residents.service.spec.ts"
Task T026: "Controller tests in residents.controller.spec.ts"
```

---

## Implementation Strategy

### MVP First (US1 + US2)

1. Complete Phase 1: Entity + migration + DTOs + frontend model
2. Complete Phase 2: Sidebar + service + routes
3. Complete Phase 3: US1 - List with cascading filters
4. Complete Phase 4: US2 - Create resident
5. **STOP and VALIDATE**: Test list + create independently
6. This delivers the core requirement: "poder gestionar residentes desde el frontend"

### Incremental Delivery

1. Setup + Foundational → Foundation ready
2. US1 (List) → Table with cascading filters visible
3. US2 (Create) → Can add new residents (MVP!)
4. US3 (Edit) → Can modify existing residents
5. US4 (Detail) → Can view resident details
6. US5 (Deactivate) → Can toggle resident status
7. Polish → Tests pass, docs updated, PR created

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story
- No DELETE from UI — residents are deactivated via PATCH with isActive: false
- Reuse ResidentFormComponent for both create (US2) and edit (US3)
- Reuse ConfirmDialogComponent from edificios module for deactivate/activate
- Follow `features/edificios/` component pattern (standalone, lazy-loaded, Angular Material)
- Backend migration adds columns with defaults for existing rows
- Document uniqueness: partial unique index on documentNumber WHERE is_active=true AND deleted_at IS NULL
- Tests mandatory per project constitution (70% minimum coverage)
