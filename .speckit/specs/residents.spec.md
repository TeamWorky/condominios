# Residents Module Specification

## Overview
Manages residents (inhabitants of units). **Important**: Residents are NOT system users. They are people living in units and do not have system access. The `userId` field exists for historical compatibility but is not used as primary identifier.

## Entities

### Resident (apps/api/src/residents/entities/resident.entity.ts)
| Field | Type | Constraints |
|-------|------|-------------|
| id | UUID | PK (from BaseEntity) |
| userId | UUID | FK → User, nullable, SET NULL on delete (historical, not used) |
| unitId | UUID | FK → Unit, not null, CASCADE on delete |
| residentType | ResidentType enum | default TENANT |
| moveInDate | date | nullable |
| moveOutDate | date | nullable |
| isPrimary | boolean | default false |
| relationship | varchar(100) | nullable (e.g., "Spouse", "Parent") |
| isActive | boolean | default true |
| reservations | Reservation[] | OneToMany |
| createdAt | timestamp | auto |
| updatedAt | timestamp | auto |
| deletedAt | timestamp | nullable, soft delete |

**Enums**:
- ResidentType: OWNER, TENANT, FAMILY_MEMBER, GUEST

## API Endpoints

### POST /api/v1/units/:unitId/residents
- **Auth**: JWT + ADMIN+
- **Body**: `{ unitId, userId?, residentType?, moveInDate?, moveOutDate?, isPrimary?, relationship?, isActive? }`
- **Response**: 201
- **Errors**: 404 unit not found

### GET /api/v1/units/:unitId/residents
- **Auth**: JWT + USER+
- **Query**: `{ page, limit }`
- **Response**: Paginated residents (ordered by isPrimary DESC, createdAt)
- **Cache**: RESIDENT_LIST_{unitId}, 1 min TTL

### GET /api/v1/residents/:id
- **Auth**: JWT + USER+
- **Response**: Resident with user relation (left join)
- **Cache**: RESIDENT_{id}, 5 min TTL

### PATCH /api/v1/residents/:id
- **Auth**: JWT + ADMIN+
- **Body**: Partial (excluding unitId)
- **Response**: Updated resident

### DELETE /api/v1/residents/:id
- **Auth**: JWT + ADMIN+
- **Response**: 204 (soft delete)

## Business Rules
1. Unit must exist to assign a resident
2. Cannot change unitId after creation
3. isPrimary residents are listed first
4. moveOutDate should be set when a resident leaves (not deleted, deactivated)
5. Residents are NOT system users - they don't have login credentials
6. Multiple residents can be assigned to one unit (family members, roommates)

## Security (OWASP)
- A01: ADMIN+ for mutations, USER+ for reads

## Test Requirements
- Create: success, unit not found, with/without userId
- Read: list by unit (ordered by isPrimary), get by ID
- Update: success, change residentType
- Delete: soft delete
