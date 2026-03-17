# Users Module Specification

## Overview
Manages system users (administrators, not residents). Supports CRUD with soft deletes, role hierarchy enforcement, and Redis caching.

## Entities

### User (apps/api/src/users/entities/user.entity.ts)
| Field | Type | Constraints |
|-------|------|-------------|
| id | UUID | PK (from BaseEntity) |
| email | varchar(255) | unique, not null |
| password | varchar(255) | hashed bcrypt (8 rounds), not null |
| firstName | varchar(255) | not null |
| lastName | varchar(255) | not null |
| role | Role enum | default USER (SUPER_ADMIN, ADMIN, USER, GUEST) |
| isActive | boolean | default true |
| refreshToken | varchar(255) | nullable |
| condominios | Condominium[] | ManyToMany (join table: user_condominios, cascade) |
| createdAt | timestamp | auto |
| updatedAt | timestamp | auto |
| deletedAt | timestamp | nullable, soft delete |

## API Endpoints

### POST /api/v1/users
- **Auth**: JWT + ADMIN+
- **Body**: `{ email, password, firstName, lastName, role? }`
- **Validation**: IsEmail, IsStrongPassword (min 8, upper+lower+number+special), IsNotEmpty
- **Response**: 201, user without password/refreshToken
- **Errors**: 409 duplicate email (including soft-deleted)

### GET /api/v1/users
- **Auth**: JWT + ADMIN+
- **Query**: `{ page, limit, includeDeleted? }`
- **Response**: `{ data: User[], total: number }`
- **Cache**: USERS_LIST, 1 min TTL

### GET /api/v1/users/:id
- **Auth**: JWT + USER+ (can see self, admins see anyone)
- **Response**: User with relations
- **Cache**: USER_{id}, 5 min TTL

### PATCH /api/v1/users/:id
- **Auth**: JWT + USER+ + CanModifyUserGuard
- **Body**: Partial `{ email, password, firstName, lastName, role, isActive }`
- **Rules**: Cannot update own role, cannot modify higher-role users
- **Response**: Updated user

### DELETE /api/v1/users/:id
- **Auth**: JWT + ADMIN+ + CanModifyUserGuard
- **Response**: 204 (soft delete)
- **Rules**: Cannot delete equal/higher role users

### PATCH /api/v1/users/:id/restore
- **Auth**: JWT + ADMIN+
- **Response**: Restored user

### DELETE /api/v1/users/:id/permanent
- **Auth**: JWT + SUPER_ADMIN only
- **Response**: 204 (hard delete)

### GET /api/v1/users/deleted/list
- **Auth**: JWT + ADMIN+
- **Query**: `{ page, limit }`
- **Response**: Paginated soft-deleted users

## Business Rules
1. Email must be unique across all users (including soft-deleted)
2. If creating user with email of soft-deleted user, restore instead
3. Password hashed with bcrypt (8 rounds) via @BeforeInsert/@BeforeUpdate
4. Role hierarchy: SUPER_ADMIN > ADMIN > USER > GUEST
5. Users cannot promote themselves or modify users of equal/higher role
6. SUPER_ADMIN can modify anyone
7. Soft-deleted users can be restored or permanently deleted
8. All mutations invalidate Redis cache

## Security (OWASP)
- A01: MinRoleGuard + CanModifyUserGuard enforce role hierarchy
- A02: Passwords hashed, refreshToken hashed
- A04: Pagination limits prevent data dumping

## Test Requirements (100% coverage)
- Create: success, duplicate email, restore soft-deleted, weak password
- Read: list paginated, get by ID, self-access, admin access
- Update: success, role hierarchy violation, self-role update blocked
- Delete: soft delete, hard delete (SUPER_ADMIN only), cannot delete higher role
- Restore: success, not found
- Cache: invalidation on mutations
