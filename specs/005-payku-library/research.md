# Research: Payku Payment Gateway Library

**Date**: 2026-05-20
**Branch**: `005-payku-library`

## R1: HMAC-SHA256 Signature Algorithm

**Decision**: Implement signature following Payku's documented algorithm exactly.

**Algorithm** (from OpenAPI spec):
1. URL-encode the request path: `encodeURIComponent('/api/endpoint')`
2. Sort request body keys alphabetically
3. Exclude keys whose values are objects or arrays
4. Format as URL params: `key=encodeURIComponent(value)` joined with `&`
5. Concatenate: `encodedPath + "&" + urlParams`
6. HMAC-SHA256 with private token as key
7. Send result in `Sign` header

**Test Vector** (from docs):
- Path: `/api/suclient/`
- Data: `{ email: "johndoe@example.com", name: "John Doe", phone: "923122312", address: "Moneda 101", country: "Chile", region: "Metropolitana", city: "Santiago", postal_code: "850000" }`
- Private token: `fe551abcef62fcf002dc598922e68f0a`
- Expected signature: `d891663698d31aa8b68babe96ac6497f5a0d874024368102998d5b79a4d12c36`

**Rationale**: The documented JS example uses `URLSearchParams` for encoding and `CryptoJS.HmacSHA256`. We'll use Node.js native `crypto.createHmac` and `URLSearchParams` instead.

**Alternatives considered**:
- CryptoJS library: Unnecessary, Node.js `crypto` module provides identical functionality natively
- Custom URL encoding: Error-prone, `URLSearchParams` handles encoding correctly

## R2: Endpoints Requiring Signature (Sign Header)

**Decision**: The following endpoints require the `Sign` header with HMAC-SHA256:
- `POST /api/nullification` — Refunds (confirmed from cURL examples showing `Sign` header)
- `POST /api/wallet/payout` — Payouts to third parties
- `POST /api/wallet/withdraw` — Withdrawals
- `POST /api/suclient/` — Subscription client creation (consumption)
- `POST /api/suplan/` — Subscription plan creation (consumption)
- `POST /api/sususcription/` — Subscription creation (consumption)
- `POST /api/sutransaction/` — Subscription transaction (consumption)
- `POST /api/mall/*` — Mall transactions

**Rationale**: The OpenAPI spec shows `Sign` header in cURL examples for these endpoints. Transaction creation (`POST /api/transaction`) does NOT require signing — only Bearer token.

## R3: HTTP Client Choice

**Decision**: Use `axios` directly (already in `package.json`).

**Rationale**: `axios` is already a project dependency. The project does NOT use `@nestjs/axios`. Following the EmailService pattern of wrapping external libraries directly.

**Alternatives considered**:
- `@nestjs/axios` (HttpModule): Would add a new dependency. Existing infrastructure modules don't use it.
- `node-fetch` / native `fetch`: Would require adding a dependency or targeting Node 18+.

## R4: Transaction Statuses

**Decision**: Use string literal union types matching Payku's actual status values.

**Statuses observed in API**:
- Transaction: `register`, `pending`, `success`, `rejected`
- Gateway response: `pending`, `success`, `rejected`, `refunded partial`, `refunded`
- Nullification: `pending`, `awaiting_funds`, `waiting_bank_details`, `complete`, `reverse_deleted`, `reverse_completed`
- Webhook: `success`, `failed`

**Rationale**: The API returns string values, not numeric codes. Using TypeScript string literal types provides compile-time safety.

## R5: Payment Method Identifiers

**Decision**: Payment methods are identified by numeric IDs, not strings.

| ID  | Method |
|-----|--------|
| 99  | All (let user choose) |
| 1   | Webpay |
| 4   | Etpay (Transferencia) |
| 6   | Pago46 |
| 9   | Mach |
| 19  | Fintoc (Transferencia) |
| 23  | Tenpo |
| 26  | Floid (Transferencia) |
| 100 | Webpay Plus (1-3 cuotas) |
| 101 | Webpay Plus (4-6 cuotas) |
| 102 | Webpay Plus (7-12 cuotas) |

**Rationale**: The API accepts `payment` as integer, not string. Our interfaces should use `number` type with a const enum for readability.

## R6: Webhook Payload Structure

**Decision**: Webhook POST body structure (from urlnotify documentation):

```typescript
{
  transaction_id: string;   // e.g., "9916587765599311"
  payment_key: string;      // e.g., "trx32cb779c0a777fc68"
  transaction_key: string;  // e.g., "9916581777599311"
  verification_key: string; // e.g., "8b3e2202fb086a7de93777ae34d5e18c"
  order: string;            // e.g., "199"
  status: string;           // "success" | "failed"
}
```

**Rationale**: Documented in the `urlnotify` field description of the transaction creation endpoint.

## R7: Module Pattern

**Decision**: `@Global()` module with `PAYKU_CONFIG` injection token, following `RedisModule` pattern.

**Pattern from RedisModule**:
```typescript
@Global()
@Module({
  imports: [ConfigModule, LoggerModule],
  providers: [
    { provide: 'PAYKU_CONFIG', useFactory: (cs: ConfigService) => {...}, inject: [ConfigService] },
    PaykuSignatureService,
    PaykuService,
  ],
  exports: [PaykuService, PaykuSignatureService],
})
```

**Rationale**: Payment processing needed across multiple modules (payments, webhooks). `@Global()` avoids importing PaykuModule everywhere. ConfigService provides environment-based configuration.

## R8: Error Handling

**Decision**: Custom `PaykuException` extending `HttpException` with `BAD_GATEWAY` (502) default status.

**Rationale**: Errors originate from an upstream API (Payku). HTTP 502 correctly signals "upstream failure" to callers. Preserving `paykuStatusCode` and `paykuMessage` allows consumers to make decisions based on the original error.

**Error codes from Payku**: 400, 401, 403, 404, 405, 406, 410, 422, 429, 500, 503.
