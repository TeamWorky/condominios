# 004 - MVP Completion: QA Manual Quickstart

## Pre-requisites
```bash
# Start backend
npm run start:api

# Start frontend
npm run start:web

# Run pending migrations
npm run migration:run
```

## Validation Steps

### 1. Security Fixes
1. Stop the API
2. Remove JWT_SECRET from .env
3. Try `npm run start:api` → should FAIL with clear error message
4. Restore JWT_SECRET, restart API
5. **Result**: PASS / FAIL

### 2. Payments CRUD (Backend)
1. Login as ADMIN via POST /api/v1/auth/login
2. Create a payment: POST /api/v1/units/{unitId}/payments
3. List payments: GET /api/v1/condominiums/{condoId}/payments
4. Get payment: GET /api/v1/payments/{id}
5. Update payment: PATCH /api/v1/payments/{id}
6. Mark as paid: PATCH /api/v1/payments/{id}/status
7. Delete: DELETE /api/v1/payments/{id}
8. Verify as USER role: read OK, write 403
9. **Result**: PASS / FAIL

### 3. Common Spaces CRUD (Backend)
1. Create space: POST /api/v1/buildings/{buildingId}/common-spaces
2. List by building: GET /api/v1/buildings/{buildingId}/common-spaces
3. Get space: GET /api/v1/common-spaces/{id}
4. Update: PATCH /api/v1/common-spaces/{id}
5. Delete: DELETE /api/v1/common-spaces/{id}
6. **Result**: PASS / FAIL

### 4. Reservations CRUD (Backend)
1. Create reservation: POST /api/v1/common-spaces/{spaceId}/reservations
2. Try overlapping reservation → expect 409
3. Try exceeding capacity → expect 400
4. Check availability: GET /api/v1/common-spaces/{spaceId}/availability
5. Cancel: PATCH /api/v1/reservations/{id}/cancel
6. **Result**: PASS / FAIL

### 5. Payments Frontend
1. Navigate to /pagos
2. Verify payment list loads with real data
3. Click "Nuevo Pago" → fill form → submit
4. Click a payment → verify detail view
5. Click "Editar" → modify → save
6. Click "Marcar como Pagado" → verify status changes
7. **Result**: PASS / FAIL

### 6. Dashboard Payment Cards
1. Navigate to /dashboard
2. Verify "Pagos Pendientes" shows real count (not "Proximamente")
3. Verify "Pagos del Mes" shows real amount
4. **Result**: PASS / FAIL

### 7. Common Spaces Frontend
1. Navigate to /espacios-comunes
2. Verify spaces load grouped by building
3. Click a reservable space → reservation dialog opens
4. Verify current user info shown (not hardcoded "Juan Perez")
5. Fill reservation form → submit
6. Verify reservation appears in calendar
7. **Result**: PASS / FAIL

### 8. Auth Rate Limiting
1. Send 5 rapid login requests → all should succeed or fail normally
2. Send 6th request within 60s → expect 429 Too Many Requests
3. **Result**: PASS / FAIL

### 9. Token Blacklist
1. Login → get access token
2. Logout
3. Try using old access token → expect 401
4. **Result**: PASS / FAIL

### 10. Test Coverage
```bash
npm run test:cov
```
1. Verify global coverage ≥ 70%
2. Verify auth service coverage = 100%
3. **Result**: PASS / FAIL

---

## Summary

| Step | Description | Result |
|------|------------|--------|
| 1 | Security Fixes | |
| 2 | Payments Backend | |
| 3 | Common Spaces Backend | |
| 4 | Reservations Backend | |
| 5 | Payments Frontend | |
| 6 | Dashboard Cards | |
| 7 | Common Spaces Frontend | |
| 8 | Auth Rate Limiting | |
| 9 | Token Blacklist | |
| 10 | Test Coverage | |

**Overall**: PASS / FAIL
**Tested by**: _______________
**Date**: _______________
