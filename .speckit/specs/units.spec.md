# Units Module Specification

## Overview
Manages units (apartments, houses, offices, etc.) within buildings. Nested resource with unique number constraint per building.

## Entities

### Unit (apps/api/src/units/entities/unit.entity.ts)
| Field | Type | Constraints |
|-------|------|-------------|
| id | UUID | PK (from BaseEntity) |
| buildingId | UUID | FK → Building, not null |
| number | varchar(50) | not null, unique per building |
| floor | int | nullable |
| block | varchar(50) | nullable |
| unitType | UnitType enum | default APARTMENT |
| areaM2 | decimal(10,2) | nullable, min 0 |
| aliquot | decimal(5,4) | nullable, 0-1 percentage |
| bedrooms | int | nullable, min 0 |
| bathrooms | int | nullable, min 0 |
| parkingSpots | int | default 0, min 0 |
| storageUnits | int | default 0, min 0 |
| status | UnitStatus enum | default AVAILABLE |
| isOccupied | boolean | default false |
| residents | Resident[] | OneToMany |
| payments | Payment[] | OneToMany |
| createdAt | timestamp | auto |
| updatedAt | timestamp | auto |
| deletedAt | timestamp | nullable, soft delete |

**Unique constraint**: [buildingId, number]

**Enums**:
- UnitType: APARTMENT, HOUSE, OFFICE, COMMERCIAL, PARKING, STORAGE
- UnitStatus: AVAILABLE, OCCUPIED, MAINTENANCE, RESERVED, OUT_OF_SERVICE

## API Endpoints

### POST /api/v1/buildings/:buildingId/units
- **Auth**: JWT + ADMIN+
- **Body**: `{ buildingId, number, floor?, block?, unitType?, areaM2?, aliquot?, bedrooms?, bathrooms?, parkingSpots?, storageUnits?, status?, isOccupied? }`
- **Response**: 201
- **Errors**: 404 building not found, 409 duplicate number in building

### GET /api/v1/condominiums/:condoId/units
- **Auth**: JWT + USER+
- **Query**: `{ page, limit }`
- **Response**: Paginated units across all buildings in condominium (ordered by building, floor, number)
- **Cache**: UNIT_LIST_{condoId}, 1 min TTL

### GET /api/v1/buildings/:buildingId/units
- **Auth**: JWT + USER+
- **Query**: `{ page, limit }`
- **Response**: Paginated units for building
- **Cache**: UNIT_LIST_{buildingId}, 1 min TTL

### GET /api/v1/units/:id
- **Auth**: JWT + USER+
- **Response**: Unit with relations
- **Cache**: UNIT_{id}, 5 min TTL

### PATCH /api/v1/units/:id
- **Auth**: JWT + ADMIN+
- **Body**: Partial (excluding buildingId)
- **Response**: Updated unit

### DELETE /api/v1/units/:id
- **Auth**: JWT + ADMIN+
- **Response**: 204 (soft delete)

## Business Rules
1. Unit number must be unique within a building (including soft-deleted)
2. Building must exist to create a unit
3. Cannot change buildingId after creation
4. Aliquot is a decimal between 0 and 1 representing ownership percentage
5. Status transitions: AVAILABLE → OCCUPIED/RESERVED, OCCUPIED → MAINTENANCE/AVAILABLE
6. isOccupied should be synced with resident assignments

## Security (OWASP)
- A01: ADMIN+ for mutations, USER+ for reads
- A03: UUID validation on buildingId prevents injection

## Test Requirements
- Create: success, duplicate number, building not found, invalid aliquot
- Read: list by condominium (cross-building), list by building, get by ID
- Update: success, number uniqueness
- Delete: soft delete
