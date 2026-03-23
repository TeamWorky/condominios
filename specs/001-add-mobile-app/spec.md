# Feature Specification: Mobile App - React Native

**Feature Branch**: `001-add-mobile-app`
**Created**: 2026-03-19
**Status**: Draft

---

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Developer starts all services with one command (Priority: P1)

A developer runs a single command from the project root and all services — backend API, worker, web frontend, and mobile app — start concurrently with labeled log output per service.

**Why this priority**: Without this, the mobile app is isolated from the rest of the dev workflow and introduces friction. It is the foundational integration requirement.

**Independent Test**: Run `npm run start:dev` and verify that a `[mobile]` prefix appears in the terminal alongside `[api]`, `[worker]`, and `[web]` prefixes.

**Acceptance Scenarios**:

1. **Given** the developer is in the project root, **When** they run `npm run start:dev`, **Then** all four services start and their logs appear prefixed with their respective service names.
2. **Given** all services are running, **When** the developer presses `Ctrl+C`, **Then** all four services stop cleanly with no orphan processes.
3. **Given** a service fails to start (e.g., port in use), **When** the orchestrator detects the exit, **Then** all other services are shut down and an informative message is displayed.

---

### User Story 2 - Developer runs only the mobile app (Priority: P1)

A developer can start just the mobile app independently using a dedicated command, without needing to start the backend or frontend.

**Why this priority**: Developers working exclusively on mobile UI need to iterate quickly without the overhead of starting all services.

**Independent Test**: Run `npm run start:mobile` and verify that the Expo/Metro bundler starts and offers options to open on iOS, Android, or web.

**Acceptance Scenarios**:

1. **Given** the developer has installed all dependencies, **When** they run `npm run start:mobile`, **Then** the Expo Metro bundler starts and offers options to open on iOS, Android, or web.
2. **Given** the bundler is running, **When** the developer selects iOS, **Then** the app opens in the iOS simulator.
3. **Given** the bundler is running, **When** the developer selects Android, **Then** the app opens in the Android emulator or connected device.

---

### User Story 3 - Mobile app shares types and enums with the monorepo (Priority: P2)

A developer imports types, enums, and interfaces from `@condominios/shared` directly into the mobile app without duplicating definitions.

**Why this priority**: Shared types prevent drift between mobile and backend contracts. Without this, the same enum can have different values across apps.

**Independent Test**: Import a shared enum (e.g., `UserRole`) in a mobile component and verify it compiles without errors.

**Acceptance Scenarios**:

1. **Given** `libs/shared` exports a type, **When** a developer imports it in `apps/mobile`, **Then** TypeScript resolves it correctly with no path alias errors.
2. **Given** a shared type changes in `libs/shared`, **When** the mobile app is built, **Then** TypeScript surfaces the breaking change in `apps/mobile` just as it does in `apps/web`.

---

### User Story 4 - Mobile app connects to the local NestJS backend (Priority: P2)

The mobile app communicates with the backend API running at `localhost:3000` in development, enabling end-to-end testing without a remote server.

**Why this priority**: Without backend connectivity the app cannot be used for integration testing during development.

**Independent Test**: Make a login request from the mobile app and verify a valid JWT is returned from the API running at `localhost:3000`.

**Acceptance Scenarios**:

1. **Given** the API is running, **When** the mobile app sends a login request, **Then** it receives a valid auth response.
2. **Given** the API is not running, **When** the mobile app sends a request, **Then** it displays a user-friendly connection error message.

---

### User Story 5 - README documents the mobile app setup and commands (Priority: P3)

Any developer who clones the repository can read the README and understand how to set up and run the mobile app, including prerequisites specific to mobile development.

**Why this priority**: Documentation is the entry point for new developers. Without it, setup is trial-and-error.

**Independent Test**: A developer with no prior context reads the README and successfully runs the mobile app by following only the documented steps.

**Acceptance Scenarios**:

1. **Given** the README is updated, **When** a developer reads the mobile section, **Then** they find the prerequisites (Node, Expo CLI, simulators) and all available commands.
2. **Given** the README lists iOS/Android/web commands, **When** a developer runs them, **Then** the app launches on the target platform.

---

### Edge Cases

- What happens when port 8081 (Metro) is already in use when `npm run start:dev` runs? → The orchestrator must clear port 8081 before starting, same as ports 3000 and 4200.
- What happens when a developer has no iOS simulator or Android emulator installed? → Metro still starts; the developer can scan the QR code with the Expo Go app on a physical device.
- What happens on Android where `localhost` does not resolve to the host machine? → The API base URL must be configurable via environment variable; Android emulators use `10.0.2.2`.
- What happens if `libs/shared` contains Node.js-specific code incompatible with React Native? → Only platform-agnostic code lives in `libs/shared` (already enforced); if violated, it must be refactored before the mobile app can import it.

---

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The monorepo MUST contain a new application at `apps/mobile` managed through Expo.
- **FR-002**: The mobile app MUST be launchable independently via `npm run start:mobile` from the project root.
- **FR-003**: The orchestrator (`start-all.js`) MUST include the mobile app as a fourth service so `npm run start:dev` starts all four services concurrently.
- **FR-004**: The orchestrator MUST clear port 8081 before starting, alongside the existing ports 3000 and 4200.
- **FR-005**: The mobile app MUST be able to import and use types, enums, and interfaces from `libs/shared` via the `@condominios/shared` path alias.
- **FR-006**: The mobile app MUST include a configurable API base URL, defaulting to `http://localhost:3000/api/v1` for local development.
- **FR-007**: The `README.md` MUST include a dedicated section for the mobile app covering prerequisites, available commands (start, iOS, Android, web), and environment configuration.
- **FR-008**: The `package.json` MUST include a `start:mobile` script that starts the Expo bundler for `apps/mobile`.
- **FR-009**: The `apps/mobile` dependency rules MUST allow imports only from `libs/shared`, mirroring the same constraint as `apps/web`.
- **FR-010**: The mobile app MUST follow existing naming conventions: kebab-case files, PascalCase components, camelCase methods, English comments.

### Key Entities

- **Mobile App** (`apps/mobile`): Expo-managed React Native project. Consumes `@condominios/shared` types. Connects to the NestJS API. Runs on iOS, Android, and web.
- **Shared Library** (`libs/shared`): Platform-agnostic types, enums, and interfaces already used by `apps/web` and `apps/api`. No changes to its public API; the mobile app simply becomes a new consumer.
- **Orchestrator** (`start-all.js`): Updated to include the mobile service and to clear port 8081 on startup.

---

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Running `npm run start:dev` produces log output for all four services (`[api]`, `[worker]`, `[web]`, `[mobile]`) within 60 seconds on a machine with dependencies installed.
- **SC-002**: Running `npm run start:mobile` has the Expo Metro bundler ready and accepting connections within 30 seconds.
- **SC-003**: Pressing `Ctrl+C` after `npm run start:dev` leaves zero orphan processes on ports 3000, 4200, and 8081 within 5 seconds.
- **SC-004**: A TypeScript import of any type from `@condominios/shared` inside `apps/mobile` compiles without errors.
- **SC-005**: A developer with no prior knowledge of the project can set up and run the mobile app by following only the README instructions.

---

## Assumptions

- Expo is the preferred toolchain (over bare React Native CLI) because it simplifies setup, provides a managed workflow, and supports web out of the box.
- The mobile app will use `npm` as package manager, consistent with the rest of the monorepo.
- The initial scaffold is a minimal shell (login screen + basic navigation). Feature parity with the web app is out of scope for this feature.
- `libs/shared` contains only platform-agnostic code with no Node.js built-ins or browser APIs, which is required for React Native compatibility.
- Android emulators require `10.0.2.2` instead of `localhost` to reach the host machine; the API base URL will be environment-configurable to handle this.
