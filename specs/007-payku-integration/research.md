# Research: Payku Payment Gateway Integration

**Feature**: 007-payku-integration
**Date**: 2026-05-21

## R1: PaykuModule Availability in Application

**Decision**: Import `PaykuModule` in `AppModule` to make it available globally.

**Rationale**: `PaykuModule` is decorated with `@Global()`, but it's not currently imported anywhere in the application module tree. A `@Global()` NestJS module still needs to be imported by at least one module to be registered in the DI container. Adding it to `AppModule.imports` makes `PaykuService` injectable in any module without per-module imports.

**Alternatives considered**:
- Import in `PaymentsModule` only: Works but loses the `@Global()` benefit. If future modules need Payku access (e.g., notifications, reports), each would need its own import.
- Import in `AppModule` (chosen): One import, globally available. Matches the pattern used by `RedisModule`, `EmailModule`, `QueueModule`.

## R2: PaymentMethod Enum Extension

**Decision**: Add `ONLINE` to the existing `PaymentMethod` enum in `@condominios/shared`.

**Rationale**: Current values (TRANSFER, CASH, CHECK, CREDIT_CARD, DEBIT_CARD) represent manual payment methods. Payku payments are a distinct category — online gateway payments. A single `ONLINE` value suffices because the specific Payku payment method (webpay, etpay, mach, etc.) is tracked by Payku and can be queried via the transaction detail endpoint. Storing the granular Payku method in our enum would create tight coupling with Payku's method catalog.

**Alternatives considered**:
- Add individual values (WEBPAY, ETPAY, MACH, etc.): Too tightly coupled to Payku. If we switch gateways or Payku adds methods, our enum breaks.
- Use `PAYKU` as the value: Too gateway-specific. `ONLINE` is gateway-agnostic and works if we add other online payment providers later.

## R3: Webhook Security & Verification

**Decision**: Double verification — verify transaction by calling `PaykuService.getTransaction(transactionId)` and compare the returned amount against the payment amount.

**Rationale**: Payku webhooks deliver a payload with `transaction_id`, `order` (our payment ID), and `status`. However, anyone who discovers the webhook URL could send fake payloads. Calling Payku's API to verify the transaction status is the standard approach for payment gateway integrations. Comparing amounts prevents a scenario where an attacker creates a low-value transaction and replays the webhook for a high-value payment.

**Alternatives considered**:
- Trust the webhook payload directly: Insecure. Any HTTP client can POST to the endpoint.
- HMAC signature verification: Payku's webhook doesn't include an HMAC signature in the standard payload. The `verification_key` in the payload can be used as an additional check against the transaction detail response.

## R4: Order ID Mapping Strategy

**Decision**: Use Payment UUID as the Payku `order` field.

**Rationale**: The `order` field in Payku's `CreateTransactionRequest` is a string that identifies the transaction on the merchant's side. Using the Payment UUID provides a direct, unique mapping. When the webhook arrives with `order`, we can directly query our database by Payment ID. No separate mapping table needed.

**Alternatives considered**:
- Sequential order number: Would require a separate counter/sequence. UUIDs are already unique and available.
- Composite ID (condoId + paymentId): Unnecessary complexity. Payment IDs are globally unique (UUIDs).

## R5: Webhook Endpoint Design

**Decision**: Single dedicated webhook controller at `POST /api/v1/payments/webhook/payku` decorated with `@Public()`.

**Rationale**: The webhook endpoint must be publicly accessible (Payku's servers call it, no JWT). Using `@Public()` decorator bypasses JwtAuthGuard. Placing it under the payments path keeps routing logically grouped. A separate controller class (`PaykuWebhookController`) keeps webhook handling isolated from the main CRUD controller.

**Alternatives considered**:
- Add to existing `PaymentsController`: Mixes public and protected endpoints in the same controller. Less clear, harder to reason about security.
- Separate top-level `/webhooks/payku` path: Works but disconnects it from the payments context in documentation and routing.

## R6: Environment Variables for URLs

**Decision**: Add `PAYKU_RETURN_URL` and `PAYKU_NOTIFY_URL` as optional env vars with empty defaults.

**Rationale**: `urlreturn` is where Payku redirects the user after payment (frontend page). `urlnotify` is the webhook URL Payku calls. Both are deployment-specific. Making them optional with empty defaults means the app starts without them — `isOperational()` already handles the graceful degradation. At runtime, the initiate endpoint validates these are configured before creating a transaction.

**Alternatives considered**:
- Derive from request host: Fragile in reverse-proxy setups, doesn't work for `urlreturn` (different frontend domain).
- Hardcode defaults: Environment-specific URLs should never be hardcoded.

## R7: Idempotency Strategy for Webhooks

**Decision**: Check payment status before updating. If already PAID, skip the update and return 200.

**Rationale**: Payku may send duplicate webhooks (network retries, manual re-sends). The simplest idempotency approach is to check the current state: if the payment is already PAID, the webhook is a no-op. This avoids needing idempotency keys, deduplication tables, or distributed locks. The webhook always returns HTTP 200 to Payku regardless of whether an update occurred (returning errors causes Payku to retry).

**Alternatives considered**:
- Idempotency key table: Over-engineered for this use case. Status check is sufficient.
- Distributed lock (Redis): Only needed if we expect high concurrency on the same payment, which is unlikely.

## R8: PaykuModule Import Location

**Decision**: Import `PaykuModule` in `AppModule` alongside other infrastructure modules.

**Rationale**: The existing pattern in `AppModule` imports `RedisModule`, `QueueModule`, `EmailModule`, and `HealthModule` — all `@Global()` infrastructure modules. `PaykuModule` follows the same pattern and should be imported at the same level for consistency.
