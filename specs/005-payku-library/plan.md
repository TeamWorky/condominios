# Implementation Plan: Payku Payment Gateway Library

**Branch**: `005-payku-library` | **Date**: 2026-05-20 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `/specs/005-payku-library/spec.md`

## Summary

Create a typed HTTP client library wrapping the Payku REST API (Chilean payment gateway) as an infrastructure module in `libs/infrastructure/src/payku/`. The library provides a `@Global()` NestJS module with typed services for all Payku endpoints (transactions, refunds, wallet, subscriptions, marketplace, mall, events, conciliation), HMAC-SHA256 signature generation for sensitive operations, graceful degradation when credentials are missing, and sandbox/production toggle. Follows existing `RedisModule`/`EmailModule` patterns.

## Technical Context

**Language/Version**: TypeScript 5.9, Node.js 24.11.1
**Primary Dependencies**: NestJS 11, axios (HTTP client, already installed)
**Storage**: None (infrastructure library — no database entities)
**Testing**: Jest 30, ts-jest
**Target Platform**: Linux server (Node.js runtime)
**Project Type**: Infrastructure library (HTTP client wrapper)
**Performance Goals**: N/A — delegates to external Payku API; library adds <10ms overhead per call
**Constraints**: Payku API rate limits apply (external); HMAC-SHA256 signing required for wallet/subscription/mall endpoints
**Scale/Scope**: Single-tenant Payku account per deployment; CLP currency only

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Gate | Status | Notes |
|------|--------|-------|
| I. Modular Architecture | PASS | Standalone module in `libs/infrastructure/src/payku/`, independently testable |
| II. Test-First Development | PASS | Unit tests with mocked axios, 70%+ coverage target |
| III. API-First Design | N/A | This is an HTTP client library, not an API. No controllers. Contracts defined as TypeScript interfaces |
| IV. Security by Default | PASS | Bearer token auth, HMAC-SHA256 signing, no secrets in code, ConfigService for credentials |
| V. Observability & Logging | PASS | All API calls logged via LoggerService |
| VI. Simplicity (YAGNI) | PASS | Direct axios usage (no @nestjs/axios), minimal abstraction, follows existing patterns |
| Code Quality Standards | PASS | Zero `any` types in public API, strict TypeScript |
| No Repository Pattern | PASS | No database entities — pure HTTP client |

## Project Structure

### Documentation (this feature)

```text
specs/005-payku-library/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output (interfaces, not DB entities)
├── quickstart.md        # Phase 1 output (manual QA guide)
├── contracts/           # Phase 1 output (TypeScript interfaces)
└── tasks.md             # Phase 2 output (/speckit.tasks)
```

### Source Code (repository root)

```text
libs/infrastructure/src/payku/
├── index.ts                          # Barrel export
├── payku.module.ts                   # @Global() NestJS module with ConfigService
├── payku.service.ts                  # HTTP client (transactions, refunds, events, conciliation)
├── payku.service.spec.ts             # Unit tests
├── payku-signature.service.ts        # HMAC-SHA256 signing
├── payku-signature.service.spec.ts   # Unit tests
├── payku.exception.ts                # PaykuException extends HttpException
└── interfaces/
    ├── index.ts                      # Barrel
    ├── payku-config.interface.ts     # Module config shape
    ├── transaction.interface.ts      # Transaction types + payment method/status
    ├── nullification.interface.ts    # Refund types
    ├── wallet.interface.ts           # Balance, transfer types
    ├── subscription.interface.ts     # Subscription CRUD types
    ├── marketplace.interface.ts      # Split transaction types
    ├── mall.interface.ts             # Multi-merchant types
    ├── event.interface.ts            # Event list types
    ├── conciliation.interface.ts     # Conciliation report types
    └── webhook.interface.ts          # Incoming webhook payload type
```

### Files to Modify

| File | Change |
|------|--------|
| `libs/infrastructure/src/index.ts` | Add Payku barrel exports |
| `libs/infrastructure/src/config/env.validation.ts` | Add PAYKU_PUBLIC_TOKEN, PAYKU_PRIVATE_TOKEN, PAYKU_SANDBOX |

**Structure Decision**: Infrastructure library in `libs/infrastructure/src/payku/` following the `RedisModule` pattern (`@Global()`, `useFactory` with ConfigService, injection token `PAYKU_CONFIG`). No controllers — this is a backend-only HTTP client consumed by other modules.

## Complexity Tracking

No violations. All constitution gates pass.
