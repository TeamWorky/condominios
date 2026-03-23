# Tasks: Mobile App - React Native

**Input**: Design documents from `/specs/001-add-mobile-app/`
**Prerequisites**: plan.md ✅ | spec.md ✅ | research.md ✅ | data-model.md ✅ | contracts/ ✅

**Organization**: Tasks grouped by user story for independent implementation and testing.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1–US5)

---

## Phase 1: Setup — Nx + Expo Scaffold

**Purpose**: Initialize `apps/mobile` with Expo SDK 53 inside the Nx monorepo.

- [x] T001 Install `@nx/expo@22.5.4` as dev dependency in root: `npm install --save-dev @nx/expo@22.5.4`
- [x] T002 Generate mobile app: `npx nx g @nx/expo:app mobile --directory=apps/mobile --e2eTestRunner=none`
- [x] T003 Bump Expo SDK to `~53.0.0` and React Native to `0.79.x` in `apps/mobile/package.json`
- [x] T004 Run `npm install` from monorepo root to install all dependencies
- [x] T005 Register `@nx/expo/plugin` in `nx.json` with targets: `start`, `run-ios`, `run-android`, `export`
- [x] T006 [P] Create `apps/mobile/.env.example` documenting `EXPO_PUBLIC_API_URL` for iOS, Android emulator, and physical device

---

## Phase 2: Foundational — Path Alias & Metro Configuration

**Purpose**: Configure Metro, Babel, and TypeScript so `@condominios/shared` resolves correctly inside `apps/mobile`. This phase MUST be complete before any user story work begins.

**⚠️ CRITICAL**: No user story work can begin until this phase is complete.

- [x] T007 Replace generated `apps/mobile/metro.config.js` with monorepo-aware config: set `watchFolders = [monorepoRoot]`, `resolver.extraNodeModules = { '@condominios/shared': path.resolve(monorepoRoot, 'libs/shared/src') }`, and `resolver.nodeModulesPaths`
- [x] T008 Install `babel-plugin-module-resolver` as devDependency in `apps/mobile/package.json`
- [x] T009 Create `apps/mobile/babel.config.js` with `babel-preset-expo` + `module-resolver` plugin aliasing `@condominios/shared` → `../../libs/shared/src`
- [x] T010 Replace generated `apps/mobile/tsconfig.json`: extend `expo/tsconfig.base` (NOT root tsconfig), set `moduleResolution: bundler`, `baseUrl: ../..`, and add `paths` block for `@condominios/shared`
- [x] T011 Add a temporary import of a shared type in `apps/mobile/src/app/index.tsx` to validate alias resolution
- [x] T012 Run `npx tsc --noEmit` from `apps/mobile` and confirm zero TypeScript errors
- [x] T013 Run `npx expo start --clear` from `apps/mobile` and confirm Metro starts without alias errors, then remove the temporary import from T011

**Checkpoint**: Foundation ready — path alias works, TypeScript compiles, Metro resolves `@condominios/shared`.

---

## Phase 3: User Story 2 — Mobile Runs Standalone (Priority: P1) 🎯 MVP

**Goal**: `npm run start:mobile` starts the Expo Metro bundler independently from the monorepo root.

**Independent Test**: Run `npm run start:mobile` and verify Metro bundler starts and shows options for iOS, Android, and web.

- [x] T014 [US2] Add `"start:mobile": "nx start mobile"` script to root `package.json`
- [x] T015 [P] [US2] Add `"start:mobile:ios": "nx run-ios mobile"` script to root `package.json`
- [x] T016 [P] [US2] Add `"start:mobile:android": "nx run-android mobile"` script to root `package.json`
- [ ] T017 [US2] Run `npm run start:mobile` from monorepo root and verify Metro bundler starts successfully
- [ ] T018 [US2] Verify Metro offers iOS (`i`), Android (`a`), and web (`w`) options in the terminal

**Checkpoint**: User Story 2 complete — `npm run start:mobile` works independently.

---

## Phase 4: User Story 1 — All Services Start Together (Priority: P1)

**Goal**: `npm run start:dev` starts API, Worker, Web, and Mobile concurrently with labeled log output.

**Independent Test**: Run `npm run start:dev` and verify `[mobile]` prefix appears alongside `[api]`, `[worker]`, `[web]`.

- [x] T019 [US1] Add `8081` to the `PORTS_TO_CLEAR` array in `start-all.js` (line 4)
- [x] T020 [US1] Add mobile task to the `tasks` array in `start-all.js`: `{ name: 'mobile', cmd: 'npm', args: ['run', 'start:mobile'] }`
- [ ] T021 [US1] Run `npm run start:dev` and verify all four `[api]`, `[worker]`, `[web]`, `[mobile]` prefixes appear in log output within 60 seconds
- [ ] T022 [US1] Press `Ctrl+C` and verify zero orphan processes remain on ports 3000, 4200, and 8081 (use `lsof -i:3000,4200,8081`)

**Checkpoint**: User Story 1 complete — all four services start and stop cleanly with one command.

---

## Phase 5: User Story 3 — Shared Types Compile (Priority: P2)

**Goal**: Types and enums from `libs/shared` can be imported in `apps/mobile` without TypeScript errors.

**Independent Test**: Import `UserRole` from `@condominios/shared` in a mobile component and run `npx tsc --noEmit` with zero errors.

- [ ] T023 [US3] Import `UserRole` (or any available enum) from `@condominios/shared` in `apps/mobile/src/app/index.tsx`
- [ ] T024 [US3] Run `npx tsc --noEmit` from `apps/mobile` and confirm zero errors
- [ ] T025 [US3] Run `npx expo start --clear` and confirm Metro resolves the import without runtime errors at startup

**Checkpoint**: User Story 3 complete — `@condominios/shared` types are fully accessible from mobile.

---

## Phase 6: User Story 4 — Backend Connectivity + Login Shell (Priority: P2)

**Goal**: The mobile app can authenticate against the NestJS API running on `localhost:3000`.

**Independent Test**: With the API running, complete the login flow from the mobile app and verify a JWT is received and stored.

- [x] T026 [P] [US4] Create `apps/mobile/src/config/api.config.ts` exporting `API_BASE_URL` from `process.env.EXPO_PUBLIC_API_URL` with default `http://localhost:3000/api/v1`
- [x] T027 [P] [US4] Create `apps/mobile/src/services/http.client.ts` — Axios instance with `baseURL` from `api.config.ts` and Authorization header interceptor (attaches `accessToken` from AsyncStorage)
- [x] T028 [US4] Create `apps/mobile/src/services/auth.service.ts` implementing `login(email, password)`, `logout()`, and `refresh()` calling the existing API endpoints per `contracts/auth.contract.md`
- [x] T029 [US4] Create `apps/mobile/src/app/_layout.tsx` — root navigation layout using Expo Router (Stack navigator, redirect based on auth state)
- [x] T030 [US4] Create `apps/mobile/src/app/(auth)/_layout.tsx` — auth stack layout
- [x] T031 [US4] Create `apps/mobile/src/app/(auth)/login.tsx` — login screen UI with email/password inputs and submit button wired to `auth.service.ts`
- [x] T032 [US4] Create `apps/mobile/src/app/(app)/index.tsx` — home placeholder screen displayed after successful login
- [x] T033 [US4] Wire login screen: on success store `accessToken` and `refreshToken` in `AsyncStorage` and navigate to home screen; on failure display error message
- [ ] T034 [US4] Test end-to-end with API running: login with `admin@admin.com` credentials and verify JWT is received and home screen is shown

**Checkpoint**: User Story 4 complete — login flow works against the local API.

---

## Phase 7: User Story 5 — README Documentation (Priority: P3)

**Goal**: README contains a complete Mobile App section allowing any developer to set up and run the app from scratch.

**Independent Test**: Follow only the README instructions (no other documentation) and successfully run the mobile app.

- [x] T035 [US5] Add **Mobile App** section to `README.md` with prerequisites: Node.js 24+, Expo CLI, iOS Simulator (Xcode 15+), Android Studio / AVD, Expo Go app for physical devices
- [x] T036 [P] [US5] Add commands table to `README.md` mobile section: `start:mobile`, `start:mobile:ios`, `start:mobile:android`, and `start:dev` (all four services)
- [x] T037 [P] [US5] Add environment variable section to `README.md` documenting `EXPO_PUBLIC_API_URL` with examples for iOS simulator, Android emulator (`10.0.2.2`), and physical device (local IP)

**Checkpoint**: User Story 5 complete — a developer can onboard to mobile development using only the README.

---

## Phase 8: Polish & Cross-Cutting Concerns

**Purpose**: Final validation and cleanup across all user stories.

- [ ] T038 [P] Run `npm run start:dev` cold (after killing all processes) and verify all four services start cleanly with correct prefixes
- [ ] T039 [P] Run `npm test` from monorepo root and verify no existing backend/shared tests are broken by the new `apps/mobile` addition
- [ ] T040 [P] Verify `apps/mobile` only imports from `libs/shared` — audit `import` statements for any `libs/common`, `libs/database`, or `libs/infrastructure` imports and remove them
- [ ] T041 [P] Review `specs/001-add-mobile-app/quickstart.md` against actual setup and update any steps that differ from the final implementation

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — start immediately
- **Foundational (Phase 2)**: Requires Phase 1 complete — **BLOCKS all user stories**
- **US2 (Phase 3, P1)**: Requires Phase 2 — no dependencies on other user stories
- **US1 (Phase 4, P1)**: Requires Phase 3 (US2) — mobile must run standalone before adding to orchestrator
- **US3 (Phase 5, P2)**: Requires Phase 2 — can run in parallel with US1/US2 once foundation is ready
- **US4 (Phase 6, P2)**: Requires Phase 2 and Phase 5 (US3) — login uses shared types
- **US5 (Phase 7, P3)**: Requires Phase 3 complete (commands must exist before documenting them); can run in parallel with US3/US4
- **Polish (Phase 8)**: Requires all desired user stories complete

### User Story Dependencies

```
Phase 1 (Setup)
    └── Phase 2 (Foundational) ← BLOCKS ALL
            ├── Phase 3 (US2 P1) ← must complete before US1
            │       └── Phase 4 (US1 P1)
            ├── Phase 5 (US3 P2) ← can run parallel with US2/US1
            │       └── Phase 6 (US4 P2)
            └── Phase 7 (US5 P3) ← can start after Phase 3
```

### Parallel Opportunities

- T015, T016 (root scripts) can run in parallel with T014
- T026, T027 (config + http client) can run in parallel — different files
- T030, T035, T036, T037 can run in parallel — different files
- All T038–T041 (polish) can run in parallel

---

## Parallel Example: Phase 6 (US4)

```bash
# Launch in parallel (different files, no dependencies):
Task T026: Create apps/mobile/src/config/api.config.ts
Task T027: Create apps/mobile/src/services/http.client.ts

# Then sequentially (T028 depends on T026+T027):
Task T028: Create apps/mobile/src/services/auth.service.ts
Task T029: Create apps/mobile/src/app/_layout.tsx
Task T030: Create apps/mobile/src/app/(auth)/_layout.tsx

# Then (T031 depends on T028+T030):
Task T031: Create apps/mobile/src/app/(auth)/login.tsx
Task T032: Create apps/mobile/src/app/(app)/index.tsx
```

---

## Implementation Strategy

### MVP First (User Stories 1 + 2 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (**CRITICAL — blocks everything**)
3. Complete Phase 3: US2 — mobile runs standalone
4. Complete Phase 4: US1 — all four services together
5. **STOP and VALIDATE**: `npm run start:dev` works, `Ctrl+C` cleans up
6. Demo-able: full dev environment with mobile

### Incremental Delivery

1. Setup + Foundational → foundation ready (T001–T013)
2. US2 + US1 → orchestrator works (T014–T022) → **deploy/demo**
3. US3 + US4 → login shell against API (T023–T034) → **deploy/demo**
4. US5 → documentation complete (T035–T037) → **deploy/demo**
5. Polish → final validation (T038–T041)

---

## Task Summary

| Phase | Tasks | Count | Parallel |
|-------|-------|-------|---------|
| Setup | T001–T006 | 6 | T006 |
| Foundational | T007–T013 | 7 | none (sequential) |
| US2 (P1) | T014–T018 | 5 | T015, T016 |
| US1 (P1) | T019–T022 | 4 | none |
| US3 (P2) | T023–T025 | 3 | none |
| US4 (P2) | T026–T034 | 9 | T026, T027 |
| US5 (P3) | T035–T037 | 3 | T036, T037 |
| Polish | T038–T041 | 4 | all |
| **Total** | | **41** | |

**MVP scope**: T001–T022 (Phases 1–4) deliver a fully working dev environment with mobile.
