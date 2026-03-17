# Condominiums Module Specification

## Overview
Manages condominium entities (the top-level organizational unit). Supports CRUD with soft deletes, Redis caching, and role-based access.

## Entities

### Condominium (apps/api/src/condominiums/entities/condominium.entity.ts)
| Field | Type | Constraints |
|-------|------|-------------|
| id | UUID | PK (from BaseEntity) |
| name | varchar(255) | not null |
| legalName | varchar(255) | nullable |
| rut | varchar(20) | nullable (Chilean tax ID) |
| address | varchar(500) | not null |
| city | varchar(100) | not null |
| region | varchar(100) | not null |
| postalCode | varchar(20) | nullable |
| phone | varchar(20) | nullable |
| email | varchar(255) | nullable |
| logoUrl | varchar(500) | nullable |
| settings | jsonb | nullable, default {} |
| isActive | boolean | default true |
| buildings | Building[] | OneToMany |
| createdAt | timestamp | auto |
| updatedAt | timestamp | auto |
| deletedAt | timestamp | nullable, soft delete |

## API Endpoints

### POST /api/v1/condominiums
- **Auth**: JWT + SUPER_ADMIN
- **Body**: `{ name, legalName?, rut?, address, city, region, postalCode?, phone?, email?, logoUrl?, settings?, isActive? }`
- **Validation**: MaxLength constraints per field, IsEmail for email, IsObject for settings
- **Response**: 201, created condominium

### GET /api/v1/condominiums
- **Auth**: JWT + USER+
- **Query**: `{ page, limit, includeDeleted? }`
- **Response**: `{ data: Condominium[], total: number }`
- **Cache**: CONDOMINIUM_LIST, 1 min TTL

### GET /api/v1/condominiums/:id
- **Auth**: JWT + USER+
- **Response**: Condominium with relations
- **Cache**: CONDOMINIUM_{id}, 5 min TTL

### PATCH /api/v1/condominiums/:id
- **Auth**: JWT + ADMIN+
- **Body**: Partial CreateCondominiumDto
- **Response**: Updated condominium

### DELETE /api/v1/condominiums/:id
- **Auth**: JWT + SUPER_ADMIN
- **Response**: 204 (soft delete)

### PATCH /api/v1/condominiums/:id/restore
- **Auth**: JWT + SUPER_ADMIN
- **Response**: Restored condominium

## Business Rules
1. Only SUPER_ADMIN can create/delete condominiums
2. ADMIN+ can update condominiums
3. USER+ can read condominiums
4. Settings field stores arbitrary JSON configuration
5. Soft-deleted condominiums cascade to buildings (via DB constraints)
6. All mutations invalidate Redis cache

## Security (OWASP)
- A01: SUPER_ADMIN-only for create/delete, ADMIN+ for update
- A05: Settings field validated as object type

## Test Requirements
- Create: success, missing required fields, invalid email
- Read: list paginated, get by ID, cache hit
- Update: success, partial update, ADMIN+ access
- Delete: soft delete, SUPER_ADMIN only
- Restore: success
