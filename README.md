# TeamWorky Condominios - Sistema de Gestion de Condominios

> Plataforma multi-tenant para la gestion integral de condominios y conjuntos residenciales, construida como un monorepo Nx con Angular 21, NestJS 11 y React Native (Expo).

---

## Tabla de Contenidos

- [Arquitectura](#arquitectura)
- [Stack Tecnologico](#stack-tecnologico)
- [Estructura del Proyecto](#estructura-del-proyecto)
- [Inicio Rapido](#inicio-rapido)
- [Scripts Disponibles](#scripts-disponibles)
- [App Movil](#app-movil)
- [Modelo de Dominio](#modelo-de-dominio)
- [Docker](#docker)
- [Testing](#testing)
- [Speckit - Desarrollo Dirigido por Especificaciones](#speckit---desarrollo-dirigido-por-especificaciones)
- [Gitflow](#gitflow)
- [Licencia](#licencia)

---

## Arquitectura

El proyecto es un **monorepo Nx** con 4 aplicaciones y 4 librerias compartidas:

### Aplicaciones

| App | Tecnologia | Descripcion |
|-----|-----------|-------------|
| `apps/api` | NestJS 11 | API REST principal (puerto 3000). Modulos de dominio: auth, buildings, common-spaces, condominiums, payments, reservations, residents, units, users |
| `apps/worker` | NestJS 11 + BullMQ | Worker para tareas en background (emails, jobs asincronos) |
| `apps/web` | Angular 21 | Frontend SPA con Angular Material. Dashboard con datos reales del backend |
| `apps/mobile` | React Native + Expo | App movil para iOS, Android y web |

### Librerias Compartidas

| Libreria | Alias | Descripcion | Consumida por |
|----------|-------|-------------|---------------|
| `libs/shared` | `@condominios/shared` | Enums, interfaces, DTOs compartidos | api, worker, web, **mobile** |
| `libs/common` | `@condominios/common` | Guards, filters, interceptors, entidad base | api, worker |
| `libs/database` | `@condominios/database` | TypeORM data-source, migraciones, seeders | api |
| `libs/infrastructure` | `@condominios/infrastructure` | Logger (Winston), email, redis, queue, health | api, worker |

### Reglas de Dependencia

```
apps/web       -> libs/shared (unicamente)
apps/mobile    -> libs/shared (unicamente)
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
| Frontend Web | Angular + Angular Material | 21 |
| App Movil | React Native + Expo | SDK 53 |
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
│   ├── web/                    # Frontend Angular 21
│   └── mobile/                 # App movil React Native (Expo)
│       └── src/
│           ├── app/            # Screens y layouts (Expo Router)
│           ├── config/         # Configuracion (API base URL)
│           └── services/       # HTTP client y auth service
├── libs/
│   ├── shared/                 # Enums, interfaces (frontend + backend + mobile)
│   ├── common/                 # Guards, filters, entidad base (backend)
│   ├── database/               # TypeORM, migraciones, seeders (backend)
│   └── infrastructure/         # Logger, email, redis, queue (backend)
├── .speckit/                   # Framework de especificaciones
├── .specify/                   # Scripts y templates operacionales
├── start-all.js                # Orquestador de desarrollo (API + worker + web + mobile)
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
npm install

# 2. Configurar variables de entorno
cp .env.example .env

# 3. Iniciar servicios Docker (PostgreSQL + Redis)
docker-compose up -d

# 4. Ejecutar migraciones
npm run migration:run

# 5. Iniciar en desarrollo (API + worker + web + mobile)
npm run start:dev
```

### Accesos

| Servicio | URL |
|----------|-----|
| **API** | http://localhost:3000/api |
| **Documentacion** | http://localhost:3000/api-docs |
| **Health Check** | http://localhost:3000/api/health |
| **Frontend (Web)** | http://localhost:4200/ |
| **Mobile (Metro)** | http://localhost:8081/ |

### Credenciales por Defecto

```
Email:    admin@admin.com
Password: <valor de ADMIN_PASSWORD en .env> (minimo 8 caracteres)
Role:     SUPER_ADMIN
```

> **IMPORTANTE**: Cambia estas credenciales en produccion.

---

## Scripts Disponibles

### Desarrollo

| Comando | Descripcion |
|---------|-------------|
| `npm run start:dev` | Iniciar API + Worker + Web + Mobile (todos juntos) |
| `npm run start:api` | Iniciar API con hot reload |
| `npm run start:worker` | Iniciar Worker con hot reload |
| `npm run start:web` | Iniciar frontend Angular |
| `npm run start:mobile` | Iniciar app movil (Metro bundler) |
| `npm run start:mobile:ios` | Abrir app movil en iOS simulator |
| `npm run start:mobile:android` | Abrir app movil en Android emulator |
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

## App Movil

La app movil esta construida con **React Native + Expo** y vive en `apps/mobile`. Comparte tipos y enums con el backend y el frontend web a traves de `libs/shared`.

### Prerequisitos adicionales

- **iOS**: Xcode 15+ con iOS Simulator (macOS unicamente)
- **Android**: Android Studio con un AVD (Android Virtual Device) configurado
- **Dispositivo fisico**: App [Expo Go](https://expo.dev/go) instalada en el dispositivo

### Levantar la app movil

```bash
# Opcion A: Todos los servicios juntos (recomendado)
npm run start:dev
# Los logs apareceran con prefijos: [api] [worker] [web] [mobile]

# Opcion B: Solo la app movil
npm run start:mobile
# En el Metro bundler: presiona 'i' para iOS, 'a' para Android, 'w' para web

# Opcion C: Plataforma especifica
npm run start:mobile:ios       # iOS simulator
npm run start:mobile:android   # Android emulator
```

### Configuracion de entorno

Crea el archivo `apps/mobile/.env` basado en el ejemplo:

```bash
cp apps/mobile/.env.example apps/mobile/.env
```

Contenido de `apps/mobile/.env`:

```env
# iOS Simulator y Expo Go en la misma red que el host
EXPO_PUBLIC_API_URL=http://localhost:3000/api/v1

# Android Emulator (localhost apunta al emulador, no al host)
# EXPO_PUBLIC_API_URL=http://10.0.2.2:3000/api/v1

# Dispositivo fisico en la misma red local
# EXPO_PUBLIC_API_URL=http://192.168.1.x:3000/api/v1
```

Despues de cambiar `.env`, limpia el cache de Metro:

```bash
cd apps/mobile && npx expo start --clear
```

### Solucion de problemas comunes

| Problema | Solucion |
|---------|---------|
| `EADDRINUSE: port 8081` | `lsof -ti:8081 \| xargs kill -9` |
| `Unable to resolve @condominios/shared` | `cd apps/mobile && npx expo start --clear` |
| Android no puede conectar a la API | Usar `EXPO_PUBLIC_API_URL=http://10.0.2.2:3000/api/v1` |

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
| 1. Especificar | `/speckit.specify` | Genera un `spec.md` con user stories, requisitos funcionales y criterios de aceptacion | Al inicio, cuando tienes una idea de feature |
| 2. Clarificar | `/speckit.clarify` | Hace hasta 5 preguntas para resolver ambiguedades en la spec | Si hay puntos vagos o dudas en la spec |
| 3. Planificar | `/speckit.plan` | Genera plan tecnico: modelo de datos, contratos API, research y quickstart | Despues de tener la spec aprobada |
| 4. Tareas | `/speckit.tasks` | Crea `tasks.md` con tareas numeradas, ordenadas por dependencia | Despues de tener el plan |
| 5. Checklist | `/speckit.checklist` | Genera checklist de validacion de calidad basado en los requisitos | Para QA y seguimiento |
| 6. Implementar | `/speckit.implement` | Ejecuta las tareas paso a paso | Cuando empiezas a codificar |
| 7. Analizar | `/speckit.analyze` | Revisa consistencia entre spec, plan y tasks | Para verificar que todo esta alineado |
| 8. Issues | `/speckit.taskstoissues` | Convierte las tareas en GitHub Issues | Para tracking en GitHub |
| 9. Constitucion | `/speckit.constitution` | Crea o actualiza las reglas fundamentales del proyecto | Para definir/modificar principios |

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
