# Research: 003-residents-crud

**Date**: 2026-03-23

## R1: Personal Data Storage Location

**Decision**: Store personal data (firstName, lastName, documentType, documentNumber, dateOfBirth, phone, email) directly on the Resident entity.

**Rationale**: Residents are the primary entity — they exist independently of system Users. A User is only created when a resident needs login access. This avoids forcing every resident to have a system account.

**Alternatives considered**:
- Store on User entity (rejected — forces User creation for every resident)
- Store on both (rejected — data duplication, sync issues)

## R2: Document Number Uniqueness

**Decision**: Validate that no active resident has the same documentNumber assigned to a different unit. Same documentNumber can exist if previous resident was deactivated.

**Rationale**: A person (identified by document) can only live in one unit at a time. Deactivated records are historical and should not block new assignments.

**Implementation**: Backend unique constraint with partial index on `(document_number) WHERE deleted_at IS NULL AND is_active = true`. Frontend shows error on 409 conflict.

## R3: Backend Migration Strategy

**Decision**: Create a new TypeORM migration to add 7 columns to the `residents` table: first_name, last_name, document_type, document_number, date_of_birth, phone, email.

**Rationale**: The existing migration creates the table. A new migration adds columns non-destructively. Existing records will have NULL values for new columns (acceptable since no production data exists yet).

**Migration naming**: Follow existing pattern: `TIMESTAMP-AddPersonalFieldsToResidents.ts`

## R4: Frontend Unit Selection Pattern

**Decision**: Cascading selects on the resident list page: Building dropdown → Unit dropdown → Residents table. Both dropdowns at the top of the page.

**Rationale**: The API requires `unitId` to list residents. Buildings are the natural grouping. This matches the data hierarchy: Condominium → Building → Unit → Resident.

**Implementation**: Use BuildingService.getActiveBuildings(condoId) for first select, UnitService.getUnitsByBuilding(buildingId) for second select. Store selections in component signals.

## R5: Frontend Model Alignment

**Decision**: Rewrite IResident interface to match the updated backend entity with personal fields. Remove User-dependent fields.

**Rationale**: Current frontend model has fields (firstName, lastName, etc.) that don't exist on backend yet. After backend migration, these fields will exist directly on Resident.

## R6: Reusable ConfirmDialog

**Decision**: Reuse the existing ConfirmDialogComponent from the edificios module. Import it directly since it's a standalone component.

**Rationale**: Same pattern needed for deactivate/activate confirmation. No need to duplicate.

**Note**: Consider moving to a shared location in a future refactor, but for now importing from edificios is acceptable to avoid scope creep.
