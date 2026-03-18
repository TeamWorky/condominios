# TeamWorky Condominios - Project Constitution

## Project Overview
Sistema de Gestión de Condominios - a multi-tenant condominium management platform built as an Nx monorepo with Angular 21 frontend and NestJS 11 backend.

---

## Mandatory Workflows

### 1. Spec-Driven Development (SDD)
**Todo módulo o feature DEBE seguir el flujo SDD antes de escribir código:**

1. **Specify**: Crear/actualizar el spec en `.speckit/specs/[module].spec.md` usando el template
2. **Plan**: Diseñar la implementación basándose en el spec (entidades, endpoints, componentes)
3. **Implement**: Codificar siguiendo estrictamente lo definido en el spec
4. **Checklist**: Verificar que toda la funcionalidad del spec fue implementada y testeada

No se acepta código nuevo sin un spec asociado. Si el spec no existe, se crea primero.

### 2. Testing Unitario en Backend (Obligatorio)
**Todo código backend DEBE tener tests unitarios antes de merge:**

- Cada service: `[name].service.spec.ts` con cobertura de todos los métodos públicos
- Cada controller: `[name].controller.spec.ts` con cobertura de todos los endpoints
- Cada guard/interceptor/pipe custom: test correspondiente
- **Cobertura mínima global**: 70% (branches, functions, lines, statements)
- **Auth service**: 100% cobertura obligatoria
- Los tests deben cubrir: happy path, error cases, edge cases, validaciones
- Ejecutar `npm test` antes de cada PR. No se aprueba PR con tests fallando

### 3. Revisión OWASP Top 10 (Obligatoria)
**Cada módulo/feature DEBE pasar una revisión de seguridad contra OWASP Top 10 antes de merge:**

| # | Categoría | Checklist obligatorio |
|---|-----------|----------------------|
| A01 | Broken Access Control | Guards aplicados, roles verificados, @Public() solo donde corresponde |
| A02 | Cryptographic Failures | Sin secrets hardcodeados, bcrypt >= 12 rounds, env vars validadas |
| A03 | Injection | Sin SQL raw con interpolación, ValidationPipe whitelist, sanitización |
| A04 | Insecure Design | Rate limiting en endpoints sensibles, pagination con límites, body size limitado |
| A05 | Security Misconfiguration | CSP habilitado, CORS restringido en prod, Swagger oculto en prod |
| A06 | Vulnerable Components | `npm audit` sin vulnerabilidades high/critical |
| A07 | Auth Failures | Tokens rotados, lockout por intentos fallidos, blacklist en logout |
| A08 | Data Integrity | SRI en builds producción, `npm ci` en CI |
| A09 | Security Logging | Eventos de auth loggeados (login, logout, fallos, lockouts) |
| A10 | SSRF | No fetch de URLs del usuario sin validación de allowlist |

El spec de cada módulo debe incluir una sección `## Security (OWASP)` con las medidas aplicadas.

### 4. Pruebas de Endpoints (Obligatorio)
**Todo cambio en el backend que afecte endpoints DEBE incluir pruebas manuales o automatizadas de los endpoints modificados:**

- Antes de considerar completada una tarea que modifique controllers, services, guards, interceptors o DTOs, se DEBEN probar los endpoints afectados
- Probar con `curl`, Swagger (`/api-docs`), o herramientas como Postman/Insomnia
- Verificar: status codes correctos, formato de respuesta, validaciones, autenticación/autorización
- Documentar en el PR los endpoints probados y los resultados
- Para seeders y migraciones: verificar que los datos se crean correctamente consultando los endpoints correspondientes
- Si el cambio afecta el flujo de autenticación: probar login, select-condominio, refresh y logout end-to-end

### 5. Gitflow (Obligatorio)
**El proyecto sigue Gitflow estricto:**

```
main          ← producción estable, solo recibe merges de release/ y hotfix/
development   ← rama de integración, recibe merges de feature/
feature/*     ← nuevas funcionalidades (branch desde development)
bugfix/*      ← correcciones no urgentes (branch desde development)
release/*     ← preparación de release (branch desde development → merge a main y development)
hotfix/*      ← correcciones urgentes en producción (branch desde main → merge a main y development)
```

**Reglas:**
- No se hace push directo a `main` ni `development`
- Todo cambio entra por Pull Request con al menos 1 aprobación
- Nombrar branches: `feature/[module]-[descripción]`, `bugfix/[issue]-[descripción]`, `hotfix/[issue]-[descripción]`
- Commits siguen Conventional Commits: `feat:`, `fix:`, `docs:`, `test:`, `refactor:`, `chore:`
- Squash merge en PRs para mantener historial limpio
- Tags semánticos en releases: `v1.0.0`, `v1.1.0`, etc.

### 6. Gestión de Tareas en Trello (Obligatorio)
**El tablero de Trello (Teamworky) es la fuente de verdad del estado del proyecto:**

- **Toda tarea debe tener una tarjeta en Trello** antes de comenzar a trabajar
- **Flujo de columnas**: Pending → Planning → Build → QA Local → Finish → Publish
- **Al iniciar una tarea**: mover la tarjeta a "Build" y asignar miembro
- **Al completar una tarea**: mover a "QA Local" con checklist de verificación
- **Al hacer merge del PR**: mover a "Finish"
- **Al desplegar a producción**: mover a "Publish"
- **Cada tarjeta debe incluir**: descripción, criterios de aceptación, labels de módulo, y referencia al spec asociado
- **Nuevas tareas descubiertas durante desarrollo** se agregan como tarjetas en "Pending"
- No se cierra un sprint sin que todas las tarjetas reflejen el estado real del código

---

## Architecture Principles

1. **Monorepo-first**: All code lives in one Nx workspace (`TeamWorky/condominios`). Shared code in `libs/`.
2. **Type safety**: Shared enums and interfaces are the single source of truth in `@condominios/shared`. No duplicate type definitions across frontend and backend.
3. **Separation of concerns**: Backend libs (`common`, `database`, `infrastructure`) are NOT importable by frontend. Only `@condominios/shared` crosses the boundary.
4. **Multi-tenant by design**: All data is scoped by `condominiumId`. JWT tokens carry `condominiumId` after condominium selection.
5. **Residents != Users**: Residents are building inhabitants (may not have system access). Users are system administrators. These are independent entities.

## Security Constraints (OWASP Top 10)

1. All endpoints require JWT authentication unless decorated with `@Public()`.
2. RBAC enforced via `RolesGuard` / `MinRoleGuard` at controller level. Hierarchy: SUPER_ADMIN > ADMIN > USER > GUEST.
3. All input validated via `class-validator` (backend) and Angular Reactive Forms (frontend).
4. Rate limiting on all endpoints via `ThrottlerModule`. Stricter limits on auth endpoints.
5. No sensitive data in JWT payload beyond `userId`, `email`, `role`, `condominiumId`.
6. Password hashing with bcrypt (12 rounds minimum).
7. Helmet middleware with CSP enabled in production.
8. CORS restricted to allowed origins in production.
9. Swagger/API docs disabled in production.
10. Security events (failed logins, auth failures) logged via Winston.

## Testing Requirements

- **Backend**: Jest, minimum 70% coverage (branches, functions, lines, statements).
- **Frontend**: Vitest (Angular 21 default), targeting 60% coverage initially.
- **Auth service**: 100% line/function coverage required.
- **All new modules**: Must have spec files before implementation begins.

## Code Style

- **Backend**: NestJS conventions, TypeORM entities, class-validator DTOs.
- **Frontend**: Angular 21 standalone components, signals preferred over subjects/BehaviorSubjects.
- **Styling**: SCSS, Angular Material 21 for UI components.
- **Language**: Spanish for user-facing labels, English for code identifiers and comments.
- **Enums**: Always defined in `@condominios/shared`, never locally.

## Tech Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| Frontend | Angular | 21 |
| UI Library | Angular Material | 21 |
| Frontend Testing | Vitest | 4.x |
| Backend | NestJS | 11 |
| Database | PostgreSQL + TypeORM | 0.3.x |
| Cache/Queue | Redis + BullMQ | - |
| Backend Testing | Jest | 30 |
| Monorepo | Nx | 22.x |
| Language | TypeScript | 5.9 |
| Container | Docker (multi-stage) | - |

## Project Structure

```
apps/
  api/          # NestJS HTTP API (port 3000)
  worker/       # NestJS BullMQ worker (no HTTP)
  web/          # Angular frontend (port 4200)
libs/
  shared/       # Enums, interfaces (frontend + backend)
  common/       # Guards, filters, interceptors, DTOs, entities, utils (backend only)
  database/     # TypeORM data-source, migrations, seeders (backend only)
  infrastructure/ # Logger, email, redis, queue, health, config (backend only)
```

## Module Dependency Rules

- `apps/web` -> `libs/shared` only
- `apps/api` -> `libs/shared`, `libs/common`, `libs/database`, `libs/infrastructure`
- `apps/worker` -> `libs/shared`, `libs/common`, `libs/infrastructure`
- `libs/shared` -> no dependencies
- `libs/common` -> `libs/shared`
- `libs/infrastructure` -> `libs/shared`, `libs/common`
- `libs/database` -> `libs/shared`, `libs/common`
