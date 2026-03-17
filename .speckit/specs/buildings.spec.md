# Buildings Module Specification

## Overview
Manages buildings within condominiums. Nested resource under condominiums with unique code constraint per condominium.

## Entities

### Building (apps/api/src/buildings/entities/building.entity.ts)
| Field | Type | Constraints |
|-------|------|-------------|
| id | UUID | PK (from BaseEntity) |
| condominiumId | UUID | FK → Condominium, not null |
| name | varchar(255) | not null |
| code | varchar(50) | not null, unique per condominium |
| floors | int | default 1 |
| undergroundFloors | int | default 0 |
| hasElevator | boolean | default false |
| address | varchar(500) | nullable |
| isActive | boolean | default true |
| units | Unit[] | OneToMany |
| commonSpaces | CommonSpace[] | OneToMany |
| createdAt | timestamp | auto |
| updatedAt | timestamp | auto |
| deletedAt | timestamp | nullable, soft delete |

**Unique constraint**: [condominiumId, code]

## API Endpoints

### POST /api/v1/condominiums/:condoId/buildings
- **Auth**: JWT + ADMIN+
- **Body**: `{ condominiumId, name, code, floors?, undergroundFloors?, hasElevator?, address?, isActive? }`
- **Validation**: IsUUID(condominiumId), MaxLength, Min(1) for floors, Min(0) for undergroundFloors
- **Response**: 201
- **Errors**: 404 condominium not found, 409 duplicate code in condominium

### GET /api/v1/condominiums/:condoId/buildings
- **Auth**: JWT + USER+
- **Query**: `{ page, limit }`
- **Response**: Paginated buildings for condominium
- **Cache**: BUILDING_LIST_{condoId}, 1 min TTL

### GET /api/v1/buildings/:id
- **Auth**: JWT + USER+
- **Response**: Building with relations
- **Cache**: BUILDING_{id}, 5 min TTL

### PATCH /api/v1/buildings/:id
- **Auth**: JWT + ADMIN+
- **Body**: Partial (excluding condominiumId)
- **Response**: Updated building

### DELETE /api/v1/buildings/:id
- **Auth**: JWT + ADMIN+
- **Response**: 204 (soft delete)

## Business Rules
1. Building code must be unique within a condominium (including soft-deleted)
2. Condominium must exist to create a building
3. Cannot change condominiumId after creation
4. Cascades: deleting a building cascades to units and common spaces (DB level)
5. All mutations invalidate Redis cache

## Security (OWASP)
- A01: ADMIN+ for mutations, USER+ for reads

## Test Requirements
- Create: success, duplicate code, condominium not found
- Read: list by condominium, get by ID
- Update: success, code uniqueness check
- Delete: soft delete, cascade verification
