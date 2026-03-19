# Data Model: CRUD de Edificios en Frontend

## Entities

### Building (frontend model — corrected)

| Field | Type | Required | Default | Notes |
|-------|------|----------|---------|-------|
| id | string (UUID) | yes | auto | Primary key |
| condominiumId | string (UUID) | yes | - | FK to Condominium |
| name | string | yes | - | Max 255 chars |
| code | string | yes | - | Max 50, unique per condominium |
| floors | number | yes | 1 | Min 1 |
| undergroundFloors | number | yes | 0 | Min 0 |
| hasElevator | boolean | yes | false | - |
| address | string | no | null | Max 500 chars |
| isActive | boolean | yes | true | - |
| createdAt | Date | yes | auto | - |
| updatedAt | Date | yes | auto | - |

### CreateBuildingDto (frontend)

| Field | Type | Required | Default | Validation |
|-------|------|----------|---------|------------|
| name | string | yes | - | Not empty, max 255 |
| code | string | yes | - | Not empty, max 50 |
| floors | number | no | 1 | Integer, min 1 |
| undergroundFloors | number | no | 0 | Integer, min 0 |
| hasElevator | boolean | no | false | - |
| address | string | no | - | Max 500 |

Note: `condominiumId` is NOT included in the DTO — it's injected from the URL parameter by the backend.

### UpdateBuildingDto (frontend)

All fields from CreateBuildingDto but all optional (Partial).

## Relationships

```
Condominium 1 ──── N Building
Building    1 ──── N Unit
Building    1 ──── N CommonSpace
```

## Form Validations (Angular Reactive Forms)

| Field | Validators |
|-------|-----------|
| name | required, maxLength(255) |
| code | required, maxLength(50) |
| floors | required, min(1), pattern(integer) |
| undergroundFloors | min(0), pattern(integer) |
| hasElevator | - (checkbox, no validation needed) |
| address | maxLength(500) |
