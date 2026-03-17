# Common Spaces Module Specification

## Overview
Manages common areas within buildings (pools, gyms, event rooms, etc.). Supports reservation configuration. **Status**: Entity defined, controller/service NOT yet implemented.

## Entities

### CommonSpace (apps/api/src/common-spaces/entities/common-space.entity.ts)
| Field | Type | Constraints |
|-------|------|-------------|
| id | UUID | PK |
| buildingId | UUID | FK → Building, not null, CASCADE on delete |
| name | varchar(255) | not null |
| type | CommonSpaceType enum | not null |
| description | text | nullable |
| location | varchar(255) | nullable (e.g., "Piso 1", "Terraza") |
| capacity | int | nullable |
| area | decimal(10,2) | nullable (m²) |
| amenities | json | nullable (string array, e.g., ["WiFi", "AC"]) |
| isReservable | boolean | default true |
| reservationStartTime | time | nullable (HH:mm format) |
| reservationEndTime | time | nullable (HH:mm format) |
| isExclusive | boolean | default false |
| isActive | boolean | default true |
| reservations | Reservation[] | OneToMany |
| createdAt | timestamp | auto |
| updatedAt | timestamp | auto |
| deletedAt | timestamp | nullable, soft delete |

**Enum - CommonSpaceType**: SALON_EVENTOS, GIMNASIO, PISCINA, QUINCHO, SALA_MULTIUSO, CANCHA_DEPORTIVA, JARDIN, PLAYGROUND, BIBLIOTECA, SALA_DE_JUEGOS, OTRO

## API Endpoints (TO IMPLEMENT)

### POST /api/v1/buildings/:buildingId/common-spaces
- **Auth**: JWT + ADMIN+
- **Body**: `{ buildingId, name, type, description?, location?, capacity?, area?, amenities?, isReservable, reservationStartTime?, reservationEndTime?, isExclusive }`
- **Response**: 201
- **Errors**: 404 building not found

### GET /api/v1/buildings/:buildingId/common-spaces
- **Auth**: JWT + USER+
- **Query**: `{ page, limit, type? }`
- **Response**: Paginated common spaces

### GET /api/v1/common-spaces/:id
- **Auth**: JWT + USER+
- **Response**: Common space with reservations

### PATCH /api/v1/common-spaces/:id
- **Auth**: JWT + ADMIN+
- **Body**: Partial (excluding buildingId)
- **Response**: Updated common space

### DELETE /api/v1/common-spaces/:id
- **Auth**: JWT + ADMIN+
- **Response**: 204 (soft delete)

## Business Rules
1. Building must exist to create a common space
2. If isReservable=true, reservationStartTime and reservationEndTime should be set
3. isExclusive=true: only one reservation at a time; false: multiple simultaneous reservations allowed
4. Deactivating a space should cancel future PENDING reservations
5. amenities stored as JSON string array

## Security (OWASP)
- A01: ADMIN+ for mutations, USER+ for reads
- A03: JSON amenities validated as string array

## Test Requirements
- Create: success, building not found, with/without reservation config
- Read: list by building, filter by type, get by ID
- Update: change reservable settings, update amenities
- Delete: soft delete, impact on reservations
