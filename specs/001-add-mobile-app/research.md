# Research: Mobile App - React Native

**Feature**: 001-add-mobile-app
**Date**: 2026-03-19

---

## Decision 1: Nx Plugin — `@nx/expo` vs `@nx/react-native` vs no plugin

**Decision**: Use `@nx/expo@22.5.4` (matches the installed `nx` version exactly).

**Rationale**:
- `@nx/react-native` targets the bare CLI workflow, which requires native Xcode/Android Studio CI infrastructure. Starting from scratch, this adds significant setup overhead with no benefit.
- A bare `apps/mobile` directory with no `project.json` would make Nx unaware of the project, losing `nx affected`, caching, and task orchestration.
- `@nx/expo` provides inferred targets (`start`, `run-ios`, `run-android`, `export`, `build`) and a generator that scaffolds `project.json`, `app.json`, `metro.config.js`, and `tsconfig.json` correctly.

**Alternatives considered**:
- Bare Expo (no Nx plugin): rejected — loses Nx graph, caching, and `affected` checks.
- `@nx/react-native`: rejected — requires native build toolchain from day one.

---

## Decision 2: Expo SDK Version

**Decision**: Expo SDK 53 with React Native 0.79.

**Rationale**: SDK 53 is the latest stable release (March 2026) and includes the best Metro 0.81+ improvements for monorepo support. The `@nx/expo` generator scaffolds an older SDK version by default — this must be manually bumped in `apps/mobile/package.json` after generation.

**Known issue**: Expo SDK 53 enables Metro ES Module resolution (`package.json` `exports` field) by default via React Native 0.79. If third-party libraries that lack a proper `exports` map cause `Unable to resolve module` errors, set `config.resolver.unstable_enablePackageExports = false` in `metro.config.js` as a targeted escape hatch.

---

## Decision 3: `tsconfig.json` in `apps/mobile` — isolated, NOT extending root

**Decision**: `apps/mobile/tsconfig.json` extends `expo/tsconfig.base`, NOT `../../tsconfig.base.json`.

**Rationale**: The root `tsconfig.base.json` sets `"module": "nodenext"` and `"moduleResolution": "nodenext"`, which is correct for NestJS but breaks Expo. Metro does not use TypeScript's module resolver and expects `"moduleResolution": "bundler"`. Extending the root tsconfig causes known compilation errors (expo/expo#35923, expo/expo#36892). The Angular app (`apps/web`) follows the same isolation pattern — it does not extend the root either.

Path aliases are added directly in `apps/mobile/tsconfig.json` with `baseUrl: "../.."` pointing at the monorepo root, so paths like `libs/shared/src` resolve correctly.

**Configuration**:
```jsonc
{
  "extends": "expo/tsconfig.base",
  "compilerOptions": {
    "strict": true,
    "moduleResolution": "bundler",
    "noEmit": true,
    "jsx": "react-native",
    "baseUrl": "../..",
    "paths": {
      "@condominios/shared": ["libs/shared/src"],
      "@condominios/shared/*": ["libs/shared/src/*"]
    }
  },
  "include": ["**/*.ts", "**/*.tsx", ".expo/types/**/*.d.ts", "expo-env.d.ts"]
}
```

---

## Decision 4: Metro Configuration for Path Aliases

**Decision**: Use `watchFolders` + `extraNodeModules` + `nodeModulesPaths` in `metro.config.js`.

**Rationale**: Metro does not read `tsconfig.json` paths. Without `watchFolders`, Metro will not detect changes to files outside `apps/mobile`. Without `extraNodeModules`, the `@condominios/shared` alias will not resolve.

**Configuration**:
```js
// apps/mobile/metro.config.js
const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const projectRoot = __dirname;
const monorepoRoot = path.resolve(projectRoot, '../..');

const config = getDefaultConfig(projectRoot);

config.watchFolders = [monorepoRoot];
config.resolver.extraNodeModules = {
  '@condominios/shared': path.resolve(monorepoRoot, 'libs/shared/src'),
};
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, 'node_modules'),
  path.resolve(monorepoRoot, 'node_modules'),
];

module.exports = config;
```

**Alternatives considered**:
- Symlinks: rejected — npm deletes them on `npm install`, non-portable on Windows.
- Custom `resolver.resolveRequest`: more powerful but overkill for a single alias. Switch to this pattern if `@condominios/common` or other libs are added later.

---

## Decision 5: Babel Configuration

**Decision**: Use `babel-preset-expo` + `babel-plugin-module-resolver` in `babel.config.js`.

**Rationale**: Metro uses Babel for transpilation. Without a Babel-level alias, `@condominios/shared` imports remain as-is in the transpiled output and fail at runtime even if Metro resolved the file correctly at the module level.

**Configuration**:
```js
// apps/mobile/babel.config.js
module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      ['module-resolver', {
        root: ['./'],
        extensions: ['.ios.js', '.android.js', '.js', '.jsx', '.ts', '.tsx', '.json'],
        alias: {
          '@condominios/shared': '../../libs/shared/src',
        },
      }],
    ],
  };
};
```

---

## Decision 6: Root `package.json` Scripts

**Decision**: Delegate to `nx` targets, not `cd apps/mobile && npx expo start` chains.

**Scripts to add**:
```json
{
  "start:mobile": "nx start mobile",
  "start:mobile:ios": "nx run-ios mobile",
  "start:mobile:android": "nx run-android mobile"
}
```

**Rationale**: Using `nx` targets keeps Nx caching, `nx affected`, and task graph working. Direct `npx expo start` remains valid for EAS/CI pipelines but is not needed for local dev.

---

## Decision 7: Orchestrator — Port 8081

**Decision**: Add 8081 to `PORTS_TO_CLEAR` in `start-all.js` and add mobile as the fourth service.

**Rationale**: Metro's default port is 8081. If a previous session left an orphan Metro process, the new session will fail with `EADDRINUSE`. The existing port-clearing logic already handles 3000 and 4200; extending it to 8081 is consistent.

---

## Decision 8: API Base URL Configuration

**Decision**: Use a simple `config.ts` file inside `apps/mobile/src/config/` that reads from Expo Constants (environment variables baked at build time via `app.config.ts`).

**Rationale**: Expo Constants is the standard mechanism for injecting environment-specific values into React Native apps. Android emulators require `10.0.2.2` instead of `localhost`; making the base URL configurable handles this without hardcoding.

**Default**: `http://localhost:3000/api/v1` for iOS simulator and physical devices via Expo Go. `http://10.0.2.2:3000/api/v1` for Android emulators — documented in README.

---

## Summary of All NEEDS CLARIFICATION Items

None — all decisions are resolved above.
