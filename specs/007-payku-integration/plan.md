# Implementation Plan: Payku Payment Gateway Integration

**Branch**: `007-payku-integration` | **Date**: 2026-05-21 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `/specs/007-payku-integration/spec.md`

## Summary

Integrate the existing PaykuModule infrastructure library with the Payments module to enable online payment processing. Three new endpoints: initiate payment (creates Payku transaction, returns payment URL), webhook receiver (processes Payku notifications, auto-updates payment status), and Payku status check (real-time transaction query for admin troubleshooting). Extends Payment entity with `paykuTransactionId` column and adds `ONLINE` to PaymentMethod enum.

## Technical Context

**Language/Version**: TypeScript 5.9, Node.js 24.11.1  
**Primary Dependencies**: NestJS 11.0.1, TypeORM 0.3.28, PostgreSQL, Redis, axios (via PaykuService)  
**Storage**: PostgreSQL (TypeORM), Redis (cache)  
**Testing**: Jest 30.0.0, ts-jest 29.2.5  
**Target Platform**: Linux server (Node.js runtime)  
**Project Type**: Backend API (RESTful)  
**Performance Goals**: Initiate < 5s (includes Payku API call), webhook processing < 3s  
**Constraints**: Multi-tenant by condominiumId (JWT), Payku API timeout 30s, rate limiting 100 req/min  
**Scale/Scope**: Low volume — condominium payments are monthly per unit, ~100-1000 payments/month

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Gate | Status | Notes |
|------|--------|-------|
| I. Modular Architecture | PASS | Changes confined to PaymentsModule + shared enum. No new module created — extends existing. |
| II. Test-First Development | PASS | Tests required for all new service methods and controller endpoints. 70%+ coverage. |
| III. API-First Design | PASS | Contracts defined in `contracts/payku-integration-api.md`. Swagger docs for all endpoints. |
| IV. Security by Default | PASS | JWT + ADMIN+ for initiate/status. Webhook is @Public() but verifies via Payku API callback. Multi-tenant scoping. |
| V. Observability & Logging | PASS | All webhook events logged. Payku API calls logged by PaykuService. |
| VI. Simplicity (YAGNI) | PASS | Minimal changes: 1 new column, 1 enum value, 3 endpoints. No new tables, no new modules, no new patterns. |
| Database Standards | PASS | Migration for schema change. UUID PK (existing). Soft delete (existing). |
| API Standards | PASS | ResponseUtil for responses. Custom exceptions for errors. |

**Post-Design Re-check**: All gates pass. No violations to justify.

## Project Structure

### Documentation (this feature)

```text
specs/007-payku-integration/
├── spec.md              # Feature specification
├── plan.md              # This file
├── research.md          # Research decisions
├── data-model.md        # Entity and enum changes
├── quickstart.md        # QA manual (20 steps)
├── contracts/
│   └── payku-integration-api.md  # API contracts (3 endpoints)
├── checklists/
│   └── requirements.md  # Spec quality checklist
└── tasks.md             # Task breakdown (next: /speckit.tasks)
```

### Source Code (repository root)

```text
apps/api/src/
├── payments/
│   ├── dto/
│   │   ├── create-payment.dto.ts        # existing
│   │   ├── update-payment.dto.ts        # existing
│   │   └── change-status.dto.ts         # existing
│   ├── entities/
│   │   └── payment.entity.ts            # MODIFY: add paykuTransactionId
│   ├── payments.controller.ts           # MODIFY: add initiate + payku-status endpoints
│   ├── payments.controller.spec.ts      # MODIFY: add tests for new endpoints
│   ├── payments.service.ts              # MODIFY: add initiatePayment, handleWebhook, getPaykuStatus
│   ├── payments.service.spec.ts         # MODIFY: add tests for new methods
│   ├── payku-webhook.controller.ts      # NEW: public webhook endpoint
│   ├── payku-webhook.controller.spec.ts # NEW: webhook controller tests
│   └── payments.module.ts              # MODIFY: register PaykuWebhookController
│
├── app.module.ts                        # MODIFY: import PaykuModule

libs/shared/src/
├── enums/
│   └── payment-method.enum.ts           # MODIFY: add ONLINE value

libs/infrastructure/src/
├── config/
│   └── env.validation.ts                # MODIFY: add PAYKU_RETURN_URL, PAYKU_NOTIFY_URL

libs/database/src/
├── migrations/
│   └── 1706650000010-AddPaykuTransactionIdToPayments.ts  # NEW
```

**Structure Decision**: No new module — extend existing PaymentsModule. Webhook gets its own controller (`PaykuWebhookController`) to cleanly separate the public endpoint from the JWT-protected CRUD endpoints. PaykuService is already globally available via `@Global()` PaykuModule (needs import in AppModule).

## Files to Modify

| File | Change | Risk |
|------|--------|------|
| `libs/shared/src/enums/payment-method.enum.ts` | Add `ONLINE` value | Low — additive enum change |
| `libs/infrastructure/src/config/env.validation.ts` | Add `PAYKU_RETURN_URL`, `PAYKU_NOTIFY_URL` | Low — optional env vars |
| `apps/api/src/app.module.ts` | Import `PaykuModule` | Low — @Global module import |
| `apps/api/src/payments/entities/payment.entity.ts` | Add `paykuTransactionId` column | Low — nullable column |
| `apps/api/src/payments/payments.module.ts` | Register `PaykuWebhookController` | Low |
| `apps/api/src/payments/payments.service.ts` | Add 3 new methods | Medium — Payku API integration |
| `apps/api/src/payments/payments.controller.ts` | Add 2 new endpoints | Low |
| `apps/api/src/payments/payments.service.spec.ts` | Add tests for new methods | Low |
| `apps/api/src/payments/payments.controller.spec.ts` | Add tests for new endpoints | Low |

## Files to Create

| File | Purpose |
|------|---------|
| `libs/database/src/migrations/1706650000010-AddPaykuTransactionIdToPayments.ts` | Migration for new column |
| `apps/api/src/payments/payku-webhook.controller.ts` | Public webhook endpoint |
| `apps/api/src/payments/payku-webhook.controller.spec.ts` | Webhook controller tests |

## Complexity Tracking

> No constitution violations. No complexity justifications needed.
