# Auth Module Specification

## Overview
Handles user authentication with JWT access/refresh tokens, RBAC, and multi-tenant condominium selection.

## Entities

### User (apps/api/src/users/entities/user.entity.ts)
| Field | Type | Constraints |
|-------|------|-------------|
| id | UUID | PK |
| email | string | unique, not null |
| password | string | hashed bcrypt, not null |
| firstName | string | not null |
| lastName | string | not null |
| role | Role enum | default USER |
| isActive | boolean | default true |
| refreshToken | string | nullable, hashed |
| condominiums | Condominium[] | ManyToMany |

## API Endpoints

### POST /api/v1/auth/register
- **Auth**: Public
- **Body**: `{ email, password, firstName, lastName }`
- **Validation**: email format, password strength (IsStrongPassword), firstName/lastName min 2 chars
- **Response**: `{ user, accessToken, refreshToken }`

### POST /api/v1/auth/login
- **Auth**: Public
- **Throttle**: 5 requests per 5 minutes (OWASP A04)
- **Body**: `{ email, password }`
- **Response**: `{ user, condominios, accessToken, refreshToken }`
- **On failure**: Increment failed login counter in Redis

### POST /api/v1/auth/refresh
- **Auth**: Public (uses refresh token in body, NOT `@CurrentUser()`)
- **Body**: `{ refreshToken }`
- **Response**: `{ accessToken, refreshToken }` (token rotation)
- **Implementation note**: El controller decodifica el refresh token directamente con `JwtService.decode()` para extraer el `sub` (userId), ya que el access token está expirado al momento de refrescar y `@CurrentUser()` no puede extraer el userId del request

### POST /api/v1/auth/logout
- **Auth**: JWT required
- **Action**: Clear refresh token, blacklist access token in Redis
- **Response**: 200

### POST /api/v1/auth/select-condominio
- **Auth**: JWT required
- **Body**: `{ condominioId }`
- **Validation**: User must be assigned to the condominium
- **Response**: New tokens with condominiumId claim

## Business Rules
1. Passwords hashed with bcrypt (12 rounds)
2. Access token expires in 15 minutes, refresh token in 7 days
3. Refresh token is hashed before storage (bcrypt)
4. On login, return list of user's assigned condominiums
5. After selectCondominio, JWT includes condominiumId for scoped access
6. Account lockout after 5 failed login attempts (15 min, stored in Redis)

## Security (OWASP)
- A01: Role-based access control (SUPER_ADMIN > ADMIN > USER > GUEST)
- A02: bcrypt hashing, no plaintext secrets, env validation
- A04: Rate limiting on login, account lockout
- A07: Token rotation on refresh, blacklisting on logout
- A09: Log all auth events (login, logout, failed attempts, lockouts)

## Frontend Implementation Notes
- **API Response Format**: El frontend consume respuestas directas (`LoginResponse`, `SelectCondominioResponse`, `AuthTokens`) sin wrapper `{ success, data }`. No se usa el operador `map()` de RxJS para extraer datos.
- **Login Form Validation**: El campo password solo requiere `Validators.required` (sin `minLength`). La validación de fortaleza de contraseña se hace exclusivamente en el backend (registro).
- **Auth Service**: Usa `BehaviorSubject<AuthState>` para estado, `localStorage` para persistencia de tokens.

## Test Requirements (100% coverage)
- Register: success, duplicate email, weak password, invalid input
- Login: success, wrong password, inactive user, lockout after 5 failures
- Refresh: success, invalid token, expired token, reuse detection
- Logout: success, token blacklisting
- SelectCondominio: success, unauthorized condominium, missing JWT
