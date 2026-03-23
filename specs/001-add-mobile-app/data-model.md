# Data Model: Mobile App - React Native

**Feature**: 001-add-mobile-app
**Date**: 2026-03-19

---

## Overview

The mobile app is a consumer of existing data — it does not introduce new entities to the database. All data models are already defined in the backend (TypeORM entities) and their contracts are exposed via the existing NestJS REST API.

The mobile app interacts with two categories of data:

1. **Shared types** consumed from `libs/shared` (enums, interfaces — no network calls)
2. **API responses** consumed from `apps/api` (auth, condominiums, buildings, units, residents)

---

## Shared Types Consumed from `@condominios/shared`

These are imported directly — no API call required.

| Type | Kind | Location | Used For |
|------|------|----------|----------|
| `UserRole` | enum | `libs/shared/src/enums/` | Role-based UI conditionals |
| `UserStatus` | enum | `libs/shared/src/enums/` | Displaying user account state |

---

## API Contracts Consumed

The mobile app is a client of the existing API. No new endpoints are created by this feature. The app starts with the auth flow only (see Assumptions in spec.md).

### Auth — `/api/v1/auth`

| Endpoint | Method | Request | Response |
|----------|--------|---------|----------|
| `/auth/login` | POST | `{ email, password }` | `{ accessToken, refreshToken, user }` |
| `/auth/refresh` | POST | `{ refreshToken }` | `{ accessToken, refreshToken }` |
| `/auth/logout` | POST | `{ refreshToken }` | `204 No Content` |

---

## Mobile-Specific State

The mobile app manages local state that does not map to backend entities. This state lives in memory or in device storage (AsyncStorage).

| State | Storage | Description |
|-------|---------|-------------|
| `accessToken` | AsyncStorage (encrypted) | JWT used for authenticated requests |
| `refreshToken` | AsyncStorage (encrypted) | Used to obtain new access tokens |
| `currentUser` | In-memory (React context) | Decoded JWT payload: `userId`, `email`, `role`, `condominiumId` |
| `apiBaseUrl` | Expo Constants | Injected at build time from environment config |

---

## Configuration Entity

Not a database entity — a build-time configuration object.

```ts
// apps/mobile/src/config/api.config.ts
export const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:3000/api/v1';
```

Environment variable `EXPO_PUBLIC_API_URL` can be set in `.env` inside `apps/mobile`:
- iOS simulator / Expo Go: `http://localhost:3000/api/v1`
- Android emulator: `http://10.0.2.2:3000/api/v1`
- Physical device on same network: `http://<host-ip>:3000/api/v1`
