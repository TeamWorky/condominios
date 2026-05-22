# Data Model: Payku Payment Gateway Integration

**Feature**: 007-payku-integration
**Date**: 2026-05-21

## Entity Changes

### Payment (existing — modified)

**Table**: `payments`

| Field               | Type         | Constraints       | Change    |
|---------------------|--------------|-------------------|-----------|
| id                  | UUID         | PK                | existing  |
| amount              | decimal(12,2)| not null          | existing  |
| period              | varchar(10)  | not null          | existing  |
| dueDate             | date         | not null          | existing  |
| paidDate            | date         | nullable          | existing  |
| status              | PaymentStatus| default PENDING   | existing  |
| paymentMethod       | PaymentMethod| nullable          | existing  |
| reference           | varchar(255) | nullable          | existing  |
| notes               | text         | nullable          | existing  |
| **paykuTransactionId** | **varchar(255)** | **nullable** | **NEW** |
| unitId              | UUID         | FK → Unit, CASCADE| existing  |
| residentId          | UUID         | FK → Resident, SET NULL | existing |
| createdAt           | timestamp    | auto              | existing  |
| updatedAt           | timestamp    | auto              | existing  |
| deletedAt           | timestamp    | nullable, soft delete | existing |

**New field details**:
- `paykuTransactionId`: Stores the Payku transaction ID returned by `PaykuService.createTransaction()`. Used to look up payment records when webhook arrives (via `order` field mapping) and to query real-time status from Payku API. Nullable because most payments may be paid via manual methods (TRANSFER, CASH, etc.) without going through Payku.

## Enum Changes

### PaymentMethod (existing — modified)

**Location**: `@condominios/shared/enums/payment-method.enum.ts`

| Value       | Change   |
|-------------|----------|
| TRANSFER    | existing |
| CASH        | existing |
| CHECK       | existing |
| CREDIT_CARD | existing |
| DEBIT_CARD  | existing |
| **ONLINE**  | **NEW**  |

**Rationale**: `ONLINE` is gateway-agnostic. The specific Payku payment method (webpay, etpay, mach, etc.) is tracked by Payku's transaction detail, not in our enum. This avoids coupling our domain enum to a third-party's method catalog.

## Migration

**File**: `libs/database/src/migrations/1706650000010-AddPaykuTransactionIdToPayments.ts`

**Changes**:
- Add column `paykuTransactionId` (varchar(255), nullable) to `payments` table
- No index needed — lookups by `paykuTransactionId` happen only during webhook processing (low frequency)

## State Transitions (unchanged)

The existing state machine is not modified. Payku integration uses the existing `PENDING → PAID` transition via the `changeStatus` flow internally. The only addition is that the transition can now be triggered automatically by a webhook instead of only manually.

```
PENDING  → PAID, OVERDUE, PARTIAL, CANCELLED
OVERDUE  → PAID, PARTIAL, CANCELLED
PARTIAL  → PAID, CANCELLED
PAID     → (terminal)
CANCELLED → (terminal)
```

## Payku Transaction Lifecycle (external)

```
register → pending → success | rejected
```

Mapping to our system:
- `register` / `pending` → Payment remains in its current status (PENDING or OVERDUE)
- `success` → Payment transitions to PAID via webhook
- `rejected` → Payment remains in current status, failure logged
