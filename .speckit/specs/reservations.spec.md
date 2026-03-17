# Reservations Module Specification

## Overview
Manages reservations for common spaces by residents. Handles scheduling, conflict detection, and status management. **Status**: Entity defined, controller/service NOT yet implemented.

## Entities

### Reservation (apps/api/src/reservations/entities/reservation.entity.ts)
| Field | Type | Constraints |
|-------|------|-------------|
| id | UUID | PK |
| commonSpaceId | UUID | FK → CommonSpace, not null, CASCADE on delete |
| residentId | UUID | FK → Resident, not null, CASCADE on delete |
| date | date | not null |
| startTime | time | not null |
| endTime | time | not null |
| status | ReservationStatus enum | default PENDING |
| type | ReservationType enum | nullable |
| numberOfGuests | int | nullable |
| purpose | varchar(255) | nullable |
| notes | text | nullable |
| createdAt | timestamp | auto |
| updatedAt | timestamp | auto |
| deletedAt | timestamp | nullable, soft delete |

**Enums**:
- ReservationStatus: PENDING, CONFIRMED, CANCELLED, COMPLETED
- ReservationType: TRABAJO, CELEBRACION, REUNION_FAMILIAR, CUMPLEANOS, EVENTO_CORPORATIVO, DEPORTE, OTRO

## API Endpoints (TO IMPLEMENT)

### POST /api/v1/common-spaces/:spaceId/reservations
- **Auth**: JWT + USER+
- **Body**: `{ commonSpaceId, residentId, date, startTime, endTime, type?, numberOfGuests?, purpose?, notes? }`
- **Validation**: Time within space's reservation hours, no conflicts for exclusive spaces
- **Response**: 201
- **Errors**: 404 space not found, 409 time conflict (exclusive), 400 space not reservable

### GET /api/v1/common-spaces/:spaceId/reservations
- **Auth**: JWT + USER+
- **Query**: `{ page, limit, date?, status? }`
- **Response**: Paginated reservations

### GET /api/v1/residents/:residentId/reservations
- **Auth**: JWT + USER+
- **Query**: `{ page, limit, status? }`
- **Response**: Resident's reservations

### GET /api/v1/reservations/:id
- **Auth**: JWT + USER+
- **Response**: Reservation with space and resident details

### PATCH /api/v1/reservations/:id
- **Auth**: JWT + ADMIN+ (or resident owner)
- **Body**: `{ date?, startTime?, endTime?, status?, numberOfGuests?, purpose?, notes? }`
- **Response**: Updated reservation

### DELETE /api/v1/reservations/:id
- **Auth**: JWT + ADMIN+ (or resident owner)
- **Action**: Set status to CANCELLED
- **Response**: 204

## Business Rules
1. Common space must be reservable (isReservable=true)
2. Reservation times must be within space's reservationStartTime-reservationEndTime
3. For exclusive spaces (isExclusive=true): no overlapping reservations at same date+time
4. For non-exclusive spaces: multiple reservations allowed, but respect capacity
5. numberOfGuests should not exceed space capacity
6. Status transitions: PENDING → CONFIRMED/CANCELLED, CONFIRMED → COMPLETED/CANCELLED
7. Past reservations auto-complete via cron job (CONFIRMED → COMPLETED)
8. Residents can only cancel their own reservations; ADMIN+ can cancel any

## Security (OWASP)
- A01: USER+ can create/read, ADMIN+ or owner can modify/cancel
- A04: Prevent double-booking for exclusive spaces

## Test Requirements
- Create: success, time conflict (exclusive), space not reservable, outside hours
- Read: list by space, list by resident, filter by date/status
- Update: reschedule, change status
- Cancel: by owner, by admin, already cancelled
- Conflict detection: overlapping times, capacity limits
