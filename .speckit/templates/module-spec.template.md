# [Module Name] Specification

## Overview
Brief description of the module's purpose and scope.

## Entities

### [EntityName]
| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | UUID | PK, auto-generated | |
| ... | ... | ... | ... |
| createdAt | DateTime | auto | |
| updatedAt | DateTime | auto | |
| deletedAt | DateTime | nullable, soft-delete | |

### Relationships
- [EntityName] belongs to [OtherEntity] (FK: otherEntityId)
- [EntityName] has many [OtherEntity]

## API Endpoints

### List
- **Method**: GET
- **Path**: `/api/v1/[resource]`
- **Auth**: JWT + MinRole(USER)
- **Query params**: page, limit, search, sortBy, sortOrder
- **Response**: `{ data: Entity[], meta: { total, page, limit, totalPages } }`

### Get by ID
- **Method**: GET
- **Path**: `/api/v1/[resource]/:id`
- **Auth**: JWT + MinRole(USER)
- **Response**: `{ data: Entity }`

### Create
- **Method**: POST
- **Path**: `/api/v1/[resource]`
- **Auth**: JWT + MinRole(ADMIN)
- **Body**: CreateDto
- **Response**: `{ data: Entity }` (201)

### Update
- **Method**: PATCH
- **Path**: `/api/v1/[resource]/:id`
- **Auth**: JWT + MinRole(ADMIN)
- **Body**: UpdateDto (partial)
- **Response**: `{ data: Entity }`

### Delete (soft)
- **Method**: DELETE
- **Path**: `/api/v1/[resource]/:id`
- **Auth**: JWT + MinRole(ADMIN)
- **Response**: 204

## Business Rules
1. [Rule description]
2. [Rule description]

## Frontend Components
- **ListComponent**: Material table with pagination, sorting, search
- **FormComponent**: Reactive form dialog for create/edit
- **DetailComponent**: Read-only detail view

## Test Requirements
- Service: unit tests for all CRUD operations + edge cases
- Controller: unit tests for all endpoints + auth/guard validation
- Frontend: component tests for list, form, detail

## Security (OWASP)
- All endpoints behind JwtAuthGuard
- Input validated with class-validator DTOs
- Scoped by condominiumId
