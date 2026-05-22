# QA Manual: Payku Payment Gateway Integration

**Feature**: 007-payku-integration
**Date**: 2026-05-21

## Prerequisites

1. Backend running: `npm run start:api`
2. PostgreSQL and Redis running
3. Migrations applied: `npm run migration:run`
4. Valid JWT token (login + select condominium)
5. At least one PENDING payment exists (created via `POST /api/v1/units/:unitId/payments`)
6. Payku sandbox credentials configured in `.env`:
   ```
   PAYKU_PUBLIC_TOKEN=<sandbox-token>
   PAYKU_PRIVATE_TOKEN=<sandbox-token>
   PAYKU_SANDBOX=true
   PAYKU_RETURN_URL=http://localhost:4200/payments/result
   PAYKU_NOTIFY_URL=<ngrok-or-public-url>/api/v1/payments/webhook/payku
   ```

> **Note**: For webhook testing in local development, use a tunnel service (e.g., ngrok) to expose the local API to Payku's servers. Set `PAYKU_NOTIFY_URL` to the tunnel URL.

## Test Steps

### Step 1: Verify existing CRUD still works (regression)

```bash
# List payments for condominium — should return 200 with paginated data
curl -s -X GET "http://localhost:3000/api/v1/condominiums/<CONDO_ID>/payments?page=1&limit=10" \
  -H "Authorization: Bearer <TOKEN>" | python3 -m json.tool
```

**Expected**: 200, paginated response with existing payments. PASS / FAIL

---

### Step 2: Initiate payment — happy path (PENDING payment)

```bash
# Use a PENDING payment ID
curl -s -X POST "http://localhost:3000/api/v1/payments/<PENDING_PAYMENT_ID>/initiate" \
  -H "Authorization: Bearer <TOKEN>" | python3 -m json.tool
```

**Expected**: 200, response contains `paymentUrl` and `paykuTransactionId`. PASS / FAIL

---

### Step 3: Verify paykuTransactionId stored on payment

```bash
curl -s -X GET "http://localhost:3000/api/v1/payments/<PENDING_PAYMENT_ID>" \
  -H "Authorization: Bearer <TOKEN>" | python3 -m json.tool
```

**Expected**: 200, payment record now has `paykuTransactionId` populated. PASS / FAIL

---

### Step 4: Open payment URL in browser

Open the `paymentUrl` from Step 2 in a browser.

**Expected**: Payku sandbox payment page loads, showing the correct amount and payment methods. PASS / FAIL

---

### Step 5: Initiate payment — reject PAID payment

```bash
# Use a PAID payment ID (or mark one as PAID first via changeStatus)
curl -s -X POST "http://localhost:3000/api/v1/payments/<PAID_PAYMENT_ID>/initiate" \
  -H "Authorization: Bearer <TOKEN>" | python3 -m json.tool
```

**Expected**: 400, error message indicates cannot initiate for a PAID payment. PASS / FAIL

---

### Step 6: Initiate payment — reject CANCELLED payment

```bash
curl -s -X POST "http://localhost:3000/api/v1/payments/<CANCELLED_PAYMENT_ID>/initiate" \
  -H "Authorization: Bearer <TOKEN>" | python3 -m json.tool
```

**Expected**: 400, error message indicates cannot initiate for a CANCELLED payment. PASS / FAIL

---

### Step 7: Initiate payment — OVERDUE payment allowed

```bash
# Use an OVERDUE payment ID (or change status to OVERDUE first)
curl -s -X POST "http://localhost:3000/api/v1/payments/<OVERDUE_PAYMENT_ID>/initiate" \
  -H "Authorization: Bearer <TOKEN>" | python3 -m json.tool
```

**Expected**: 200, payment URL returned (overdue payments can still be paid online). PASS / FAIL

---

### Step 8: Re-initiate payment (replace existing transaction)

```bash
# Call initiate again on the same PENDING payment from Step 2
curl -s -X POST "http://localhost:3000/api/v1/payments/<PENDING_PAYMENT_ID>/initiate" \
  -H "Authorization: Bearer <TOKEN>" | python3 -m json.tool
```

**Expected**: 200, new `paykuTransactionId` and `paymentUrl` returned (old transaction replaced). PASS / FAIL

---

### Step 9: Check Payku status — happy path

```bash
curl -s -X GET "http://localhost:3000/api/v1/payments/<PENDING_PAYMENT_ID>/payku-status" \
  -H "Authorization: Bearer <TOKEN>" | python3 -m json.tool
```

**Expected**: 200, Payku transaction details returned with current status from Payku API. PASS / FAIL

---

### Step 10: Check Payku status — no transaction

```bash
# Use a payment that was never initiated via Payku
curl -s -X GET "http://localhost:3000/api/v1/payments/<NON_PAYKU_PAYMENT_ID>/payku-status" \
  -H "Authorization: Bearer <TOKEN>" | python3 -m json.tool
```

**Expected**: 400, error message indicates no Payku transaction exists. PASS / FAIL

---

### Step 11: Check Payku status — payment not found (wrong condominium)

```bash
curl -s -X GET "http://localhost:3000/api/v1/payments/00000000-0000-0000-0000-000000000000/payku-status" \
  -H "Authorization: Bearer <TOKEN>" | python3 -m json.tool
```

**Expected**: 404, payment not found. PASS / FAIL

---

### Step 12: Webhook — simulate success (with ngrok or direct call)

```bash
# Simulate Payku webhook with the transaction from Step 2
curl -s -X POST "http://localhost:3000/api/v1/payments/webhook/payku" \
  -H "Content-Type: application/json" \
  -d '{
    "transaction_id": "<PAYKU_TXN_ID>",
    "payment_key": "test-key",
    "transaction_key": "test-key",
    "verification_key": "test-key",
    "order": "<PENDING_PAYMENT_ID>",
    "status": "success"
  }' | python3 -m json.tool
```

**Expected**: 200, `{ "received": true }`. The payment record should now be PAID. PASS / FAIL

> **Note**: This step requires Payku sandbox to return `success` when `getTransaction()` is called. If testing without real Payku, verify the webhook logic via unit tests instead.

---

### Step 13: Verify payment updated to PAID after webhook

```bash
curl -s -X GET "http://localhost:3000/api/v1/payments/<PENDING_PAYMENT_ID>" \
  -H "Authorization: Bearer <TOKEN>" | python3 -m json.tool
```

**Expected**: Payment status is PAID, paidDate is set, paymentMethod is ONLINE. PASS / FAIL

---

### Step 14: Webhook — idempotent (duplicate call)

```bash
# Send the same webhook again
curl -s -X POST "http://localhost:3000/api/v1/payments/webhook/payku" \
  -H "Content-Type: application/json" \
  -d '{
    "transaction_id": "<PAYKU_TXN_ID>",
    "payment_key": "test-key",
    "transaction_key": "test-key",
    "verification_key": "test-key",
    "order": "<PENDING_PAYMENT_ID>",
    "status": "success"
  }' | python3 -m json.tool
```

**Expected**: 200, `{ "received": true }`. Payment remains PAID (no duplicate changes). PASS / FAIL

---

### Step 15: Webhook — unknown order ID

```bash
curl -s -X POST "http://localhost:3000/api/v1/payments/webhook/payku" \
  -H "Content-Type: application/json" \
  -d '{
    "transaction_id": "fake-txn",
    "payment_key": "test-key",
    "transaction_key": "test-key",
    "verification_key": "test-key",
    "order": "00000000-0000-0000-0000-000000000000",
    "status": "success"
  }' | python3 -m json.tool
```

**Expected**: 200, `{ "received": true }`. No payment modified. Event logged. PASS / FAIL

---

### Step 16: Webhook — no JWT required

```bash
# Call without Authorization header
curl -s -X POST "http://localhost:3000/api/v1/payments/webhook/payku" \
  -H "Content-Type: application/json" \
  -d '{"transaction_id": "test", "order": "test", "status": "failed"}' \
  | python3 -m json.tool
```

**Expected**: 200 (not 401). Webhook endpoint is public. PASS / FAIL

---

### Step 17: Initiate payment — no auth (should fail)

```bash
curl -s -X POST "http://localhost:3000/api/v1/payments/<PAYMENT_ID>/initiate" \
  | python3 -m json.tool
```

**Expected**: 401, unauthorized. PASS / FAIL

---

### Step 18: Initiate payment — USER role (should fail)

```bash
# Login as a USER role account
curl -s -X POST "http://localhost:3000/api/v1/payments/<PAYMENT_ID>/initiate" \
  -H "Authorization: Bearer <USER_TOKEN>" | python3 -m json.tool
```

**Expected**: 403, forbidden (ADMIN+ required). PASS / FAIL

---

### Step 19: Multi-tenant isolation — initiate payment from wrong condominium

```bash
# Use a payment ID from a different condominium
curl -s -X POST "http://localhost:3000/api/v1/payments/<OTHER_CONDO_PAYMENT_ID>/initiate" \
  -H "Authorization: Bearer <TOKEN>" | python3 -m json.tool
```

**Expected**: 404, payment not found (scoped by JWT condominioId). PASS / FAIL

---

### Step 20: Graceful degradation — Payku not configured

Remove or empty `PAYKU_PUBLIC_TOKEN` and `PAYKU_PRIVATE_TOKEN` from `.env` and restart.

```bash
curl -s -X POST "http://localhost:3000/api/v1/payments/<PAYMENT_ID>/initiate" \
  -H "Authorization: Bearer <TOKEN>" | python3 -m json.tool
```

**Expected**: 503, service unavailable with message about payment gateway not configured. PASS / FAIL

---

## Results Summary

| Step | Description | Result |
|------|-------------|--------|
| 1    | CRUD regression | |
| 2    | Initiate PENDING | |
| 3    | paykuTransactionId stored | |
| 4    | Payment URL loads | |
| 5    | Reject PAID initiation | |
| 6    | Reject CANCELLED initiation | |
| 7    | Allow OVERDUE initiation | |
| 8    | Re-initiate replaces transaction | |
| 9    | Payku status check | |
| 10   | Status check no transaction | |
| 11   | Status check wrong condo | |
| 12   | Webhook success | |
| 13   | Payment updated to PAID | |
| 14   | Webhook idempotent | |
| 15   | Webhook unknown order | |
| 16   | Webhook no JWT required | |
| 17   | Initiate no auth | |
| 18   | Initiate USER role | |
| 19   | Multi-tenant isolation | |
| 20   | Graceful degradation | |
