# Research: CRUD de Edificios en Frontend

## R1: Frontend IBuilding Model vs Backend Entity Mismatch

**Decision**: Rewrite `building.model.ts` to match the backend `Building` entity exactly.

**Rationale**: The current frontend model has phantom fields (`description`, `totalUnits`) that don't exist in the backend, is missing real fields (`code`, `floors`, `undergroundFloors`, `hasElevator`, `condominiumId`), and uses wrong names (`totalFloors` vs `floors`).

**Backend entity fields** (ground truth from `apps/api/src/buildings/entities/building.entity.ts`):
- `id: string` (UUID, from BaseEntity)
- `condominiumId: string` (FK)
- `name: string` (max 255)
- `code: string` (max 50, unique per condominium)
- `floors: number` (default 1)
- `undergroundFloors: number` (default 0)
- `hasElevator: boolean` (default false)
- `address?: string` (max 500, nullable)
- `isActive: boolean` (default true)
- `createdAt: Date`, `updatedAt: Date`, `deletedAt?: Date` (from BaseEntity)

**Alternatives considered**: Adding the missing fields as optional — rejected because it creates confusing API where some fields work and others silently fail.

## R2: CreateBuilding Endpoint URL

**Decision**: Fix `BuildingService.createBuilding()` to POST to `/api/v1/condominiums/${condominiumId}/buildings`.

**Rationale**: The current URL `/api/v1/buildings` returns 404. The backend controller defines the create endpoint under the condominium context: `POST /api/v1/condominiums/:condoId/buildings`. The `condominiumId` is stripped from the body and taken from the URL param.

**Alternatives considered**: Creating a new endpoint `POST /buildings` — rejected because the backend already works and we don't modify backend in this feature.

## R3: Component Pattern

**Decision**: Follow the `features/unidades/` pattern — standalone components with lazy loading.

**Rationale**: Established project pattern. All feature modules use:
- `loadComponent()` in routes (not `loadChildren` with NgModule)
- Standalone components with `imports: [...]`
- Angular Material components
- Reactive Forms for forms
- Angular Signals for state (per constitution preference)

**Alternatives considered**: Creating an NgModule — rejected because the project uses standalone components exclusively.

## R4: Navigation and Routing

**Decision**: Add `/edificios` route in `app.routes.ts` and "Edificios" menu item in sidebar.

**Rationale**: Currently no route exists — clicking "Total Edificios" on dashboard navigates to `/unidades` as a workaround. With the buildings module, we can link properly.

**Post-implementation**: Update dashboard's "Total Edificios" card routerLink from `/unidades` to `/edificios`.

## R5: Building Detail — Showing Units

**Decision**: Use the existing `UnitService.getUnitsByCondominium()` filtered by buildingId, or call a units-by-building endpoint if available.

**Research finding**: The backend has `GET /api/v1/condominiums/:condoId/buildings/:buildingId` which returns the building with its units relation loaded. The frontend `getBuildingById(id)` fetches from `GET /api/v1/buildings/:id`. Need to verify if the backend returns units in the response.

**Fallback**: If units are not included in the building response, filter the units list client-side by `buildingId`.
