# QA Manual: Payku Payment Gateway Library

**Feature**: 005-payku-library
**Date**: 2026-05-20

## Prerequisites

1. Backend running: `npm run start:api`
2. Environment variables set in `.env` (can be empty for graceful degradation tests):
   ```
   PAYKU_PUBLIC_TOKEN=
   PAYKU_PRIVATE_TOKEN=
   PAYKU_SANDBOX=true
   ```

## Test Steps

### Step 1: Application starts without Payku credentials
**Action**: Start the API server with empty PAYKU_PUBLIC_TOKEN and PAYKU_PRIVATE_TOKEN
```bash
npm run start:api
```
**Expected**: Application starts successfully. Console shows a warning about Payku service being disabled. No crash.
**Result**: [ ] PASS / [ ] FAIL

---

### Step 2: Application starts with Payku credentials
**Action**: Set valid sandbox credentials in `.env` and restart API
```
PAYKU_PUBLIC_TOKEN=<sandbox-public-token>
PAYKU_PRIVATE_TOKEN=<sandbox-private-token>
PAYKU_SANDBOX=true
```
```bash
npm run start:api
```
**Expected**: Application starts successfully. No warnings about Payku.
**Result**: [ ] PASS / [ ] FAIL

---

### Step 3: Unit tests pass
**Action**: Run Payku-related unit tests
```bash
npm test -- --testPathPatterns="payku"
```
**Expected**: All tests pass. Coverage >= 70%.
**Result**: [ ] PASS / [ ] FAIL

---

### Step 4: All existing tests still pass (no regressions)
**Action**: Run full test suite
```bash
npm test
```
**Expected**: All tests pass. No regressions.
**Result**: [ ] PASS / [ ] FAIL

---

### Step 5: HMAC signature produces correct test vector
**Action**: Verify in unit tests that the signature service produces the documented test vector:
- Path: `/api/suclient/`
- Data: `{ email: "johndoe@example.com", name: "John Doe", phone: "923122312", address: "Moneda 101", country: "Chile", region: "Metropolitana", city: "Santiago", postal_code: "850000" }`
- Token: `fe551abcef62fcf002dc598922e68f0a`
- Expected: `d891663698d31aa8b68babe96ac6497f5a0d874024368102998d5b79a4d12c36`

**Expected**: Signature matches exactly.
**Result**: [ ] PASS / [ ] FAIL

---

### Step 6: Barrel exports resolve correctly
**Action**: Verify imports work
```bash
npm run lint
```
**Expected**: No import errors. `@condominios/infrastructure` correctly exports PaykuModule, PaykuService, PaykuSignatureService, PaykuException, and all interfaces.
**Result**: [ ] PASS / [ ] FAIL

---

### Step 7: Environment validation accepts new variables
**Action**: Start API with PAYKU_SANDBOX set to an invalid value
```
PAYKU_SANDBOX=invalid
```
**Expected**: Joi validation rejects the value (only "true" or "false" accepted).
**Result**: [ ] PASS / [ ] FAIL

---

## Summary

| Step | Description | Result |
|------|-------------|--------|
| 1 | App starts without credentials | |
| 2 | App starts with credentials | |
| 3 | Unit tests pass | |
| 4 | No regressions | |
| 5 | HMAC test vector matches | |
| 6 | Barrel exports work | |
| 7 | Env validation works | |

**Overall**: [ ] ALL PASS / [ ] HAS FAILURES
