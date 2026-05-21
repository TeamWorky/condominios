# QA Manual: Payments Backend CRUD

**Feature**: `006-payments-backend`
**Prerequisites**: Backend running (`npm run start:api`), PostgreSQL + Redis running, migrations applied

## Setup

1. Start backend: `npm run start:api`
2. Ensure a test user exists and can authenticate
3. Ensure at least one condominium with buildings and units exists
4. Get JWT token by logging in and selecting a condominium

## Test Steps

### Step 1: Create Payment (POST /api/v1/units/:unitId/payments)

**Action**: Send POST request with valid payment data.

```bash
curl -X POST http://localhost:3000/api/v1/units/{unitId}/payments \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 150000,
    "period": "2026-01",
    "dueDate": "2026-01-31"
  }'
```

**Expected**: 201 Created with payment object, status = "PENDING", paidDate = null.

**Result**: [ ] PASS / [ ] FAIL

---

### Step 2: Create Payment — Validation Error

**Action**: Send POST with amount = 0.

```bash
curl -X POST http://localhost:3000/api/v1/units/{unitId}/payments \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 0,
    "period": "2026-01",
    "dueDate": "2026-01-31"
  }'
```

**Expected**: 400 Bad Request with validation error about amount.

**Result**: [ ] PASS / [ ] FAIL

---

### Step 3: Create Payment — Invalid Period

**Action**: Send POST with invalid period format.

```bash
curl -X POST http://localhost:3000/api/v1/units/{unitId}/payments \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 150000,
    "period": "January",
    "dueDate": "2026-01-31"
  }'
```

**Expected**: 400 Bad Request with validation error about period format.

**Result**: [ ] PASS / [ ] FAIL

---

### Step 4: List Payments by Condominium (GET /api/v1/condominiums/:condoId/payments)

**Action**: Get paginated payment list for the condominium.

```bash
curl http://localhost:3000/api/v1/condominiums/{condoId}/payments?page=1&limit=10 \
  -H "Authorization: Bearer {token}"
```

**Expected**: 200 OK with paginated list. The payment created in Step 1 should appear. Meta includes page, limit, total, totalPages.

**Result**: [ ] PASS / [ ] FAIL

---

### Step 5: List Payments by Unit (GET /api/v1/units/:unitId/payments)

**Action**: Get payments for the specific unit.

```bash
curl http://localhost:3000/api/v1/units/{unitId}/payments?page=1&limit=10 \
  -H "Authorization: Bearer {token}"
```

**Expected**: 200 OK with payments only for that unit.

**Result**: [ ] PASS / [ ] FAIL

---

### Step 6: Get Payment Details (GET /api/v1/payments/:id)

**Action**: Get details of the payment created in Step 1.

```bash
curl http://localhost:3000/api/v1/payments/{paymentId} \
  -H "Authorization: Bearer {token}"
```

**Expected**: 200 OK with full payment details including unit info.

**Result**: [ ] PASS / [ ] FAIL

---

### Step 7: Update Payment (PATCH /api/v1/payments/:id)

**Action**: Update payment amount and notes.

```bash
curl -X PATCH http://localhost:3000/api/v1/payments/{paymentId} \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 160000,
    "notes": "Adjusted amount"
  }'
```

**Expected**: 200 OK with updated payment (amount = 160000, notes = "Adjusted amount").

**Result**: [ ] PASS / [ ] FAIL

---

### Step 8: Change Status to PAID (PATCH /api/v1/payments/:id/status)

**Action**: Mark the payment as paid.

```bash
curl -X PATCH http://localhost:3000/api/v1/payments/{paymentId}/status \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "PAID",
    "paymentMethod": "TRANSFER",
    "reference": "TRX-001"
  }'
```

**Expected**: 200 OK with status = "PAID" and paidDate set to today's date.

**Result**: [ ] PASS / [ ] FAIL

---

### Step 9: Invalid Status Transition

**Action**: Try to change a PAID payment back to PENDING.

```bash
curl -X PATCH http://localhost:3000/api/v1/payments/{paymentId}/status \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "PENDING"
  }'
```

**Expected**: 400 Bad Request with error about invalid status transition.

**Result**: [ ] PASS / [ ] FAIL

---

### Step 10: Cannot Update Amount of PAID Payment

**Action**: Try to update the amount of the PAID payment.

```bash
curl -X PATCH http://localhost:3000/api/v1/payments/{paymentId} \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 200000
  }'
```

**Expected**: 400 Bad Request with error about not being able to update paid payment amount.

**Result**: [ ] PASS / [ ] FAIL

---

### Step 11: Cannot Delete PAID Payment

**Action**: Try to delete the PAID payment.

```bash
curl -X DELETE http://localhost:3000/api/v1/payments/{paymentId} \
  -H "Authorization: Bearer {token}"
```

**Expected**: 400 Bad Request with error about not being able to delete paid payment.

**Result**: [ ] PASS / [ ] FAIL

---

### Step 12: Soft Delete a PENDING Payment

**Action**: Create a new PENDING payment and then delete it.

```bash
# Create new payment
curl -X POST http://localhost:3000/api/v1/units/{unitId}/payments \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 50000,
    "period": "2026-02",
    "dueDate": "2026-02-28"
  }'

# Delete it (use the ID from above)
curl -X DELETE http://localhost:3000/api/v1/payments/{newPaymentId} \
  -H "Authorization: Bearer {token}"
```

**Expected**: 204 No Content. The payment should no longer appear in list queries.

**Result**: [ ] PASS / [ ] FAIL

---

### Step 13: Multi-tenant Isolation

**Action**: Try to access a payment from a different condominium (use a payment ID from another condo).

```bash
curl http://localhost:3000/api/v1/payments/{otherCondoPaymentId} \
  -H "Authorization: Bearer {token}"
```

**Expected**: 404 Not Found (payment not visible to other condominiums).

**Result**: [ ] PASS / [ ] FAIL

---

## Summary

| Step | Test | Result |
|------|------|--------|
| 1 | Create payment | [ ] |
| 2 | Create — validation error | [ ] |
| 3 | Create — invalid period | [ ] |
| 4 | List by condominium | [ ] |
| 5 | List by unit | [ ] |
| 6 | Get details | [ ] |
| 7 | Update payment | [ ] |
| 8 | Mark as paid | [ ] |
| 9 | Invalid status transition | [ ] |
| 10 | Cannot update paid amount | [ ] |
| 11 | Cannot delete paid | [ ] |
| 12 | Soft delete pending | [ ] |
| 13 | Multi-tenant isolation | [ ] |

**All steps must pass before creating the PR.**
