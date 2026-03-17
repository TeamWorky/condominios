# Security Specification (OWASP Top 10)

## Overview
Cross-cutting security concerns applied across all modules, aligned with OWASP Top 10 2021.

## A01: Broken Access Control

### Guards
- **JwtAuthGuard**: Applied globally, checks `@Public()` decorator to skip
- **MinRoleGuard**: Enforces role hierarchy via `@MinRole()` decorator
- **CanModifyUserGuard**: Prevents modifying users of equal/higher role

### Role Hierarchy
```
SUPER_ADMIN > ADMIN > USER > GUEST
```

### Public Endpoints (no auth required)
- POST /auth/register
- POST /auth/login
- POST /auth/refresh
- GET /health

### Access Matrix
| Resource | GUEST | USER | ADMIN | SUPER_ADMIN |
|----------|-------|------|-------|-------------|
| Users CRUD | - | Read self | Full (lower roles) | Full |
| Condominiums | - | Read | Read + Update | Full |
| Buildings | - | Read | Full | Full |
| Units | - | Read | Full | Full |
| Residents | - | Read | Full | Full |
| Payments | - | Read own | Full | Full |
| Common Spaces | - | Read | Full | Full |
| Reservations | - | Create + Read | Full | Full |

### TODO
- [ ] Implement CondominiumScopeGuard (extract condominioId from JWT, reject if missing)
- [ ] Audit all controllers for proper guard decorators

## A02: Cryptographic Failures

### Current
- Passwords: bcrypt (8 rounds)
- Refresh tokens: hashed before DB storage
- JWT secrets: from environment variables

### TODO
- [ ] Increase bcrypt rounds from 8 to 12
- [ ] Remove any hardcoded secret fallbacks in auth.service.ts
- [ ] Validate all env vars at startup (ConfigModule validation)
- [ ] Create crypto utility for PII encryption (email, phone, document numbers)

## A03: Injection

### Current
- TypeORM parameterized queries (no raw SQL with string interpolation)
- ValidationPipe with `whitelist: true` strips unknown fields
- Helmet middleware enabled

### TODO
- [ ] Add HTML sanitization for text fields via `@Transform()`
- [ ] Verify no raw SQL queries exist in codebase

## A04: Insecure Design

### Current
- Global ValidationPipe with transform and whitelist

### TODO
- [ ] Add `@Throttle({ limit: 5, ttl: 300000 })` on login endpoint
- [ ] Implement account lockout in Redis: 5 failed attempts → 15 min lock
- [ ] Add `express.json({ limit: '1mb' })` body size limit in main.ts
- [ ] Enforce max 100 items per page in PaginationDto

## A05: Security Misconfiguration

### Current
- Helmet enabled (default config)
- CORS enabled

### TODO
- [ ] Enable CSP in Helmet configuration
- [ ] Restrict CORS origins in production (no wildcard `*`)
- [ ] Hide Swagger in production: `if (NODE_ENV !== 'production')`
- [ ] Add security headers: X-Content-Type-Options, X-Frame-Options, HSTS

## A06: Vulnerable and Outdated Components

### TODO
- [ ] Add `npm audit --audit-level=high` to CI pipeline
- [ ] Create `.github/dependabot.yml` for automated dependency updates
- [ ] Run `npm audit fix` during migration

## A07: Identification and Authentication Failures

### Current
- JWT access + refresh token pair
- @IsStrongPassword custom validator (min 8, upper+lower+number+special)

### TODO
- [ ] Implement failed login counter in Redis
- [ ] Add token blacklisting on logout (Redis, TTL = token expiry)
- [ ] Add jti (JWT ID) claim for individual token tracking
- [ ] Implement token rotation (invalidate old refresh token on use)

## A08: Software and Data Integrity Failures

### TODO
- [ ] Add SRI (Subresource Integrity) hashes in Angular production build
- [ ] Use `npm ci` (not `npm install`) in CI/production (already in Dockerfile)
- [ ] CSP headers (from A05) prevent inline script injection

## A09: Security Logging and Monitoring Failures

### Current
- Winston logger with DB transport

### TODO
- [ ] Log all auth events: login success/failure, logout, token refresh, lockouts
- [ ] Include IP address and user-agent in auth event logs
- [ ] Log role changes and permission escalation attempts
- [ ] Structured log format for security events

## A10: Server-Side Request Forgery (SSRF)

### Status
- Low risk: no endpoints accept user-provided URLs for server-side requests
- No file upload endpoints that fetch remote URLs

### TODO
- [ ] Create URL validation utility for future use
- [ ] Document in architecture that any URL-fetching feature must validate against allowlist
