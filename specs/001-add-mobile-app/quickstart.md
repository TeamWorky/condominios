# Quickstart: Mobile App Development

**Feature**: 001-add-mobile-app

---

## Prerequisites

- Node.js 24+
- npm (same version as monorepo root — no separate package manager)
- Expo CLI: `npm install -g expo-cli` (or use `npx expo` directly)
- **iOS**: Xcode 15+ with iOS Simulator (macOS only)
- **Android**: Android Studio with an AVD (Android Virtual Device) configured
- **Physical device**: Expo Go app installed ([iOS](https://apps.apple.com/app/expo-go/id982107779) / [Android](https://play.google.com/store/apps/details?id=host.exp.exponent))

---

## First-time Setup

```bash
# 1. Install all dependencies from the monorepo root
npm install

# 2. Create the mobile environment file (optional — defaults to localhost:3000)
cp apps/mobile/.env.example apps/mobile/.env
```

---

## Running the App

### Option A — All services together (recommended)
```bash
npm run start:dev
```
Starts API, Worker, Web, and Mobile concurrently. Logs are prefixed with `[api]`, `[worker]`, `[web]`, `[mobile]`.

### Option B — Mobile only
```bash
npm run start:mobile
```
Opens the Expo Metro bundler. Press:
- `i` → open iOS simulator
- `a` → open Android emulator
- `w` → open in web browser
- Scan QR code → open in Expo Go on a physical device

### Option C — Target platform directly
```bash
npm run start:mobile:ios       # iOS simulator
npm run start:mobile:android   # Android emulator
```

---

## Environment Configuration

Create `apps/mobile/.env`:

```env
# Default (iOS simulator / Expo Go on same network as host)
EXPO_PUBLIC_API_URL=http://localhost:3000/api/v1

# Android emulator — localhost resolves to the emulator itself, not the host
# EXPO_PUBLIC_API_URL=http://10.0.2.2:3000/api/v1

# Physical device — replace with your machine's local IP
# EXPO_PUBLIC_API_URL=http://192.168.1.x:3000/api/v1
```

After changing `.env`, clear the Metro cache:
```bash
cd apps/mobile && npx expo start --clear
```

---

## Troubleshooting

| Problem | Fix |
|---------|-----|
| `EADDRINUSE: port 8081` | Run `lsof -ti:8081 \| xargs kill -9` then restart |
| `Unable to resolve @condominios/shared` | Run `npx expo start --clear` to clear Metro cache |
| Android cannot reach API | Change `EXPO_PUBLIC_API_URL` to `http://10.0.2.2:3000/api/v1` |
| TypeScript errors after tsconfig change | Run `npx tsc --noEmit` from `apps/mobile` to verify |
