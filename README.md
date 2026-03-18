# TeamWorky Condominios - Sistema de Gestion de Condominios

> Plataforma multi-tenant para la gestion integral de condominios y conjuntos residenciales, construida como un monorepo Nx con Angular 21 y NestJS 11.

---

## Tabla de Contenidos

- [Arquitectura](#arquitectura)
- [Stack Tecnologico](#stack-tecnologico)
- [Estructura del Proyecto](#estructura-del-proyecto)
- [Inicio Rapido](#inicio-rapido)
- [Scripts Disponibles](#scripts-disponibles)
- [Modelo de Dominio](#modelo-de-dominio)
- [Docker](#docker)
- [Testing](#testing)
- [Speckit - Desarrollo Dirigido por Especificaciones](#speckit---desarrollo-dirigido-por-especificaciones)
- [Gitflow](#gitflow)
- [Licencia](#licencia)

---

## Arquitectura

El proyecto es un **monorepo Nx** con 3 aplicaciones y 4 librerias compartidas:

### Aplicaciones

| App | Tecnologia | Descripcion |
|-----|-----------|-------------|
| `apps/api` | NestJS 11 | API REST principal (puerto 3000). Modulos de dominio: auth, buildings, common-spaces, condominiums, payments, reservations, residents, units, users |
| `apps/worker` | NestJS 11 + BullMQ | Worker para tareas en background (emails, jobs asincronos) |
| `apps/web` | Angular 21 | Frontend SPA con Angular Material |

### Librerias Compartidas

| Libreria | Alias | Descripcion | Consumida por |
|----------|-------|-------------|---------------|
| `libs/shared` | `@condominios/shared` | Enums, interfaces, DTOs compartidos | api, worker, web |
| `libs/common` | `@condominios/common` | Guards, filters, interceptors, entidad base | api, worker |
| `libs/database` | `@condominios/database` | TypeORM data-source, migraciones, seeders | api |
| `libs/infrastructure` | `@condominios/infrastructure` | Logger (Winston), email, redis, queue, health | api, worker |

### Reglas de Dependencia

```
apps/web       -> libs/shared (unicamente)
apps/api       -> libs/shared, libs/common, libs/database, libs/infrastructure
apps/worker    -> libs/shared, libs/common, libs/infrastructure
libs/shared    -> sin dependencias
libs/common    -> libs/shared
libs/database  -> libs/shared, libs/common
libs/infrastructure -> libs/shared, libs/common
```

---

## Stack Tecnologico

| Capa | Tecnologia | Version |
|------|-----------|---------|
| Frontend | Angular + Angular Material | 21 |
| Backend API | NestJS | 11 |
| Worker | NestJS + BullMQ | 11 |
| Base de datos | PostgreSQL + TypeORM | 0.3.x |
| Cache/Colas | Redis + ioredis + BullMQ | - |
| Auth | Passport + JWT + bcrypt | - |
| Documentacion API | Swagger/OpenAPI + Scalar | - |
| Logs | Winston (nest-winston) | - |
| Seguridad | Helmet, Throttler, class-validator | - |
| Testing Backend | Jest | 30 |
| Testing Frontend | Vitest | 4.x |
| Monorepo | Nx | 22.x |
| Lenguaje | TypeScript | 5.9 |
| Container | Docker (multi-stage builds) | - |

---

## Estructura del Proyecto

```
condominios-nx/
├── apps/
│   ├── api/                    # API REST NestJS (puerto 3000)
│   │   └── src/
│   │       ├── auth/           # Autenticacion JWT + RBAC
│   │       ├── buildings/      # Gestion de edificios
│   │       ├── common-spaces/  # Espacios comunes
│   │       ├── condominiums/   # Condominios (multi-tenant)
│   │       ├── guards/         # Guards de autorizacion
│   │       ├── payments/       # Pagos y gastos comunes
│   │       ├── reservations/   # Reservas de espacios
│   │       ├── residents/      # Residentes
│   │       ├── units/          # Unidades habitacionales
│   │       └── users/          # Usuarios del sistema
│   ├── worker/                 # Worker BullMQ (emails, jobs)
│   └── web/                    # Frontend Angular 21
├── libs/
│   ├── shared/                 # Enums, interfaces (frontend + backend)
│   ├── common/                 # Guards, filters, entidad base (backend)
│   ├── database/               # TypeORM, migraciones, seeders (backend)
│   └── infrastructure/         # Logger, email, redis, queue (backend)
├── .speckit/                   # Framework de especificaciones
├── .specify/                   # Scripts y templates operacionales
├── Dockerfile                  # Multi-stage (dev, prod-api, prod-worker)
└── docker-compose.yml          # PostgreSQL + Redis
```

---

## Inicio Rapido

### Prerequisitos

- Node.js v24+
- Docker y Docker Compose (para PostgreSQL y Redis)

### Instalacion

```bash
# 1. Clonar e instalar
git clone <repository>
cd condominios-nx
npm install

# 2. Configurar variables de entorno
cp .env.example .env

# 3. Iniciar servicios Docker (PostgreSQL + Redis)
docker-compose up -d

# 4. Ejecutar migraciones
npm run migration:run

# 5. Iniciar en desarrollo
npm run start:api      # API en http://localhost:3000
npm run start:worker   # Worker de background
npm run start:web      # Frontend en http://localhost:4200
```

### Accesos

| Servicio | URL |
|----------|-----|
| API | http://localhost:3000/api |
| Documentacion API (Swagger/Scalar) | http://localhost:3000/api-docs |
| Health Check | http://localhost:3000/api/health |
| Frontend | http://localhost:4200 |

### Credenciales por Defecto

```
Email:    admin@admin.com
Password: admin
Role:     SUPER_ADMIN
```

> **IMPORTANTE**: Cambia estas credenciales en produccion.

---

## Scripts Disponibles

### Desarrollo

| Comando | Descripcion |
|---------|-------------|
| `npm run start:api` | Iniciar API con hot reload |
| `npm run start:worker` | Iniciar Worker con hot reload |
| `npm run start:web` | Iniciar frontend Angular |
| `npm run start:debug` | API en modo debug |

### Build

| Comando | Descripcion |
|---------|-------------|
| `npm run build` | Compilar API + Worker |
| `npm run build:api` | Compilar solo API |
| `npm run build:worker` | Compilar solo Worker |
| `npm run build:web` | Compilar frontend (produccion) |

### Base de Datos

| Comando | Descripcion |
|---------|-------------|
| `npm run migration:generate` | Generar nueva migracion |
| `npm run migration:run` | Ejecutar migraciones pendientes |
| `npm run migration:revert` | Revertir ultima migracion |

### Testing

| Comando | Descripcion |
|---------|-------------|
| `npm test` | Ejecutar todos los tests |
| `npm run test:watch` | Tests en modo watch |
| `npm run test:cov` | Tests con reporte de cobertura |
| `npm run test:cov:html` | Abrir reporte HTML de cobertura |
| `npm run test:e2e` | Tests end-to-end |
| `npm run test:web` | Tests del frontend |

### Calidad de Codigo

| Comando | Descripcion |
|---------|-------------|
| `npm run lint` | Linter con auto-fix |
| `npm run format` | Formatear con Prettier |

---

## Modelo de Dominio

```
Condominium (multi-tenant)
├── Building
│   └── Unit
│       └── Resident
├── CommonSpace
│   └── Reservation
├── Payment
│   └── CommonExpense
└── User (administradores del sistema)
```

### Principios de Dominio

- **Multi-tenant**: Todos los datos estan scoped por `condominiumId`. El JWT lleva el `condominiumId` despues de la seleccion.
- **Residents != Users**: Los residentes son habitantes del edificio (pueden no tener acceso al sistema). Los usuarios son administradores del sistema. Son entidades independientes.
- **RBAC**: Jerarquia de roles `SUPER_ADMIN > ADMIN > USER > GUEST`.

---

## Docker

El Dockerfile usa **multi-stage builds** con 5 stages:

| Stage | Proposito |
|-------|-----------|
| `dev` | Desarrollo con hot reload |
| `dev-deps` | Instalacion de dependencias |
| `builder` | Compilacion del proyecto |
| `prod-api` | Produccion API (puerto 3000, healthcheck, usuario no-root) |
| `prod-worker` | Produccion Worker (usuario no-root) |

```bash
# Build API produccion
docker build --target prod-api -t condominios-api .

# Build Worker produccion
docker build --target prod-worker -t condominios-worker .
```

---

## Testing

- **Backend**: Jest 30, cobertura minima global **70%** (branches, functions, lines, statements)
- **Auth service**: **100%** cobertura obligatoria
- **Frontend**: Vitest (Angular 21)

```bash
npm test                    # Ejecutar tests
npm run test:cov            # Ver cobertura
npm run test:cov:html       # Reporte visual
```

---

## Speckit - Desarrollo Dirigido por Especificaciones

**Speckit** es el framework de Spec-Driven Development (SDD) integrado en el proyecto. Garantiza que toda funcionalidad pase por un proceso estructurado desde la idea hasta la implementacion.

### Principio fundamental

> Nada se implementa sin una especificacion aprobada.

### Flujo de trabajo

El desarrollo de cualquier feature o modulo sigue estas fases en orden:

```
Specify -> Clarify -> Plan -> Tasks -> Checklist -> Implement -> Analyze
```

### Comandos disponibles

Todos los comandos se ejecutan desde el chat de **Claude Code** escribiendo el slash command:

| Fase | Comando | Que hace | Cuando usarlo |
|------|---------|----------|---------------|
| 1. Especificar | `/speckit.specify` | Genera un `spec.md` con user stories, requisitos funcionales y criterios de aceptacion a partir de una descripcion en lenguaje natural | Al inicio, cuando tienes una idea de feature |
| 2. Clarificar | `/speckit.clarify` | Hace hasta 5 preguntas para resolver ambiguedades en la spec y las codifica de vuelta | Si hay puntos vagos o dudas en la spec |
| 3. Planificar | `/speckit.plan` | Genera plan tecnico: modelo de datos, contratos API, research y quickstart | Despues de tener la spec aprobada |
| 4. Tareas | `/speckit.tasks` | Crea `tasks.md` con tareas numeradas, ordenadas por dependencia y con criterios de completitud | Despues de tener el plan |
| 5. Checklist | `/speckit.checklist` | Genera checklist de validacion de calidad basado en los requisitos | Para QA y seguimiento |
| 6. Implementar | `/speckit.implement` | Ejecuta las tareas paso a paso, guiando la implementacion | Cuando empiezas a codificar |
| 7. Analizar | `/speckit.analyze` | Revisa consistencia entre spec, plan y tasks | Para verificar que todo esta alineado |
| 8. Issues | `/speckit.taskstoissues` | Convierte las tareas en GitHub Issues ordenados por dependencia | Para tracking en GitHub |
| 9. Constitucion | `/speckit.constitution` | Crea o actualiza las reglas fundamentales del proyecto | Para definir/modificar principios |

### Ejemplo de uso completo

Para implementar un nuevo modulo (ej: "notificaciones push"):

```
# 1. Describir la feature
/speckit.specify sistema de notificaciones push y email para residentes

# 2. Si hay dudas, clarificar
/speckit.clarify

# 3. Generar plan tecnico
/speckit.plan

# 4. Generar tareas ordenadas
/speckit.tasks

# 5. Generar checklist de QA
/speckit.checklist

# 6. Implementar tarea por tarea
/speckit.implement

# 7. (Opcional) Verificar consistencia
/speckit.analyze

# 8. (Opcional) Crear issues en GitHub
/speckit.taskstoissues
```

### Estructura de archivos Speckit

```
.speckit/
├── constitution.md              # Reglas obligatorias del proyecto
├── specs/                       # Especificaciones de modulos
│   ├── auth.spec.md
│   ├── buildings.spec.md
│   ├── common-spaces.spec.md
│   ├── condominiums.spec.md
│   ├── payments.spec.md
│   ├── reservations.spec.md
│   ├── residents.spec.md
│   ├── security.spec.md
│   ├── units.spec.md
│   └── users.spec.md
├── agents/                      # Agentes AI especializados
│   ├── backend-developer.md
│   ├── frontend-developer.md
│   ├── product-strategy-analyst.md
│   └── devops.md
└── templates/
    └── module-spec.template.md

.specify/
├── README.md                    # Documentacion completa de Specify
├── scripts/bash/                # Scripts de automatizacion
└── templates/                   # Templates (plan, tasks, checklist, spec)
```

### Constitucion del Proyecto

La constitucion (`.speckit/constitution.md`) define 6 workflows obligatorios:

1. **Spec-Driven Development** - Todo modulo requiere spec antes de codificar
2. **Testing unitario** - Minimo 70% cobertura (100% en auth)
3. **Revision OWASP Top 10** - Seguridad obligatoria en cada modulo
4. **Pruebas de endpoints** - Todo endpoint debe probarse antes del merge
5. **Gitflow** - Branching strategy estricta
6. **Gestion en Trello** - Tareas deben estar en el tablero de Trello

### Modulos ya especificados

Hay 10 specs existentes en `.speckit/specs/`: auth, buildings, common-spaces, condominiums, payments, reservations, residents, security, units, users.

---

## Gitflow

El proyecto sigue Gitflow estricto:

```
main          <- produccion estable (solo recibe merges de release/ y hotfix/)
development   <- rama de integracion (recibe merges de feature/)
feature/*     <- nuevas funcionalidades (branch desde development)
bugfix/*      <- correcciones no urgentes (branch desde development)
release/*     <- preparacion de release (branch desde development)
hotfix/*      <- correcciones urgentes (branch desde main)
```

- No se hace push directo a `main` ni `development`
- Todo cambio entra por Pull Request
- Commits siguen Conventional Commits: `feat:`, `fix:`, `docs:`, `test:`, `refactor:`, `chore:`
- Squash merge en PRs

---

## Seguridad

- JWT authentication en todos los endpoints (salvo los marcados con `@Public()`)
- RBAC con `RolesGuard` / `MinRoleGuard`
- Rate limiting global (100 req/min) + restricciones en auth
- Helmet + CORS + CSP en produccion
- Validacion de input con `class-validator`
- Hash de passwords con bcrypt (12 rounds)
- Swagger deshabilitado en produccion

---

## Licencia

UNLICENSED - Proyecto privado de TeamWorky.
