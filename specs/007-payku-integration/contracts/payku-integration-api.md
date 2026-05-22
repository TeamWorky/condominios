# API Contract: Payku Payment Gateway Integration

**Feature**: 007-payku-integration
**Date**: 2026-05-21
**Base Path**: `/api/v1`

## Endpoints

### 1. POST /payments/:id/initiate

**Description**: Initiate an online payment via Payku for an existing payment.
**Auth**: JWT + ADMIN+
**Rate Limit**: Default (100 req/min)

**Path Parameters**:

| Param | Type   | Description |
|-------|--------|-------------|
| id    | string | Payment UUID |

**Request Body**: None (all data derived from the existing payment record and configuration)

**Success Response (200)**:
```json
{
  "success": true,
  "data": {
    "paymentId": "uuid-of-payment",
    "paykuTransactionId": "payku-txn-id",
    "paymentUrl": "https://des.payku.cl/gateway/payku-txn-id",
    "expiresAt": null
  },
  "message": "Resource updated successfully"
}
```

**Error Responses**:

| Status | Condition | Body |
|--------|-----------|------|
| 400    | Payment status is PAID, PARTIAL, or CANCELLED | `{ "success": false, "error": "Cannot initiate payment for a payment with status PAID" }` |
| 404    | Payment not found or doesn't belong to user's condominium | `{ "success": false, "error": "Payment not found" }` |
| 503    | Payku service not configured | `{ "success": false, "error": "Payment gateway is not available" }` |
| 502    | Payku API error | `{ "success": false, "error": "Payku API error: ..." }` |

---

### 2. POST /payments/webhook/payku

**Description**: Receive payment notification from Payku. Public endpoint (no JWT).
**Auth**: None (`@Public()`)
**Rate Limit**: Default (100 req/min)

**Request Body** (from Payku):
```json
{
  "transaction_id": "string",
  "payment_key": "string",
  "transaction_key": "string",
  "verification_key": "string",
  "order": "uuid-of-payment",
  "status": "success" | "failed"
}
```

**Success Response (200)**:
```json
{
  "received": true
}
```

**Notes**:
- Always returns 200 to prevent Payku from retrying
- Internally verifies by calling Payku API to get transaction details
- Compares amount from Payku response against payment amount
- Updates payment to PAID only if verification passes
- Idempotent: re-processing same webhook doesn't cause duplicate updates
- Logs all events (success, failure, mismatch) for audit

---

### 3. GET /payments/:id/payku-status

**Description**: Check real-time Payku transaction status for a payment. Read-only — does NOT modify the payment record.
**Auth**: JWT + ADMIN+

**Path Parameters**:

| Param | Type   | Description |
|-------|--------|-------------|
| id    | string | Payment UUID |

**Success Response (200)**:
```json
{
  "success": true,
  "data": {
    "paymentId": "uuid-of-payment",
    "paykuTransactionId": "payku-txn-id",
    "paykuStatus": "success",
    "paykuDetails": {
      "status": "success",
      "id": "payku-txn-id",
      "created_at": "2026-01-15T10:00:00Z",
      "order": "uuid-of-payment",
      "email": "resident@example.com",
      "subject": "Common expenses - Unit 101 - 2026-01",
      "amount": "150000",
      "payment": {
        "start": "...",
        "end": "...",
        "media": "Webpay",
        "transaction_id": 12345,
        "payment_key": "...",
        "verification_key": "..."
      },
      "gateway_response": {
        "status": "success",
        "message": "Pago exitoso"
      }
    }
  }
}
```

**Error Responses**:

| Status | Condition | Body |
|--------|-----------|------|
| 400    | Payment has no Payku transaction | `{ "success": false, "error": "No Payku transaction exists for this payment" }` |
| 404    | Payment not found or doesn't belong to user's condominium | `{ "success": false, "error": "Payment not found" }` |
| 503    | Payku service not configured | `{ "success": false, "error": "Payment gateway is not available" }` |
| 502    | Payku API error | `{ "success": false, "error": "Payku API error: ..." }` |

## Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| PAYKU_PUBLIC_TOKEN | No | `''` | Payku public token (existing) |
| PAYKU_PRIVATE_TOKEN | No | `''` | Payku private token (existing) |
| PAYKU_SANDBOX | No | `'true'` | Use sandbox API (existing) |
| PAYKU_RETURN_URL | No | `''` | Frontend URL for post-payment redirect (new) |
| PAYKU_NOTIFY_URL | No | `''` | Webhook URL for Payku notifications (new) |

## Swagger Documentation

All new endpoints must include:
- `@ApiTags('Payments')`
- `@ApiOperation` with summary
- `@ApiParam` for path parameters
- `@ApiResponse` for all status codes
- `@ApiBearerAuth('JWT-auth')` for protected endpoints (not for webhook)
