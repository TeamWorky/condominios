# Payments Module Specification

## Overview
Manages unit payments (common expenses/fees) and common expense definitions per condominium. **Status**: Entities defined, controller/service NOT yet implemented.

## Entities

### Payment (apps/api/src/payments/entities/payment.entity.ts)
| Field | Type | Constraints |
|-------|------|-------------|
| id | UUID | PK |
| unitId | UUID | FK → Unit, not null, CASCADE on delete |
| residentId | UUID | FK → Resident, nullable, SET NULL on delete |
| amount | decimal(12,2) | not null |
| period | varchar(10) | not null (format: YYYY-MM) |
| dueDate | date | not null |
| paidDate | date | nullable |
| status | PaymentStatus enum | default PENDING |
| paymentMethod | PaymentMethod enum | nullable |
| reference | varchar(255) | nullable (payment reference/check number) |
| notes | text | nullable |
| createdAt | timestamp | auto |
| updatedAt | timestamp | auto |
| deletedAt | timestamp | nullable, soft delete |

### CommonExpense (apps/api/src/payments/entities/common-expense.entity.ts)
| Field | Type | Constraints |
|-------|------|-------------|
| id | UUID | PK |
| condominioId | UUID | FK → Condominium, not null, CASCADE on delete |
| period | varchar(10) | not null (format: YYYY-MM) |
| basicAmount | decimal(12,2) | default 0 |
| waterAmount | decimal(12,2) | default 0 |
| gasAmount | decimal(12,2) | default 0 |
| parkingAmount | decimal(12,2) | default 0 |
| otherCharges | decimal(12,2) | default 0 |
| totalAmount | decimal(12,2) | not null |
| description | text | nullable |
| createdAt | timestamp | auto |
| updatedAt | timestamp | auto |
| deletedAt | timestamp | nullable, soft delete |

**Enums**:
- PaymentStatus: PENDING, PAID, OVERDUE, PARTIAL, CANCELLED
- PaymentMethod: TRANSFER, CASH, CHECK, CREDIT_CARD, DEBIT_CARD

## API Endpoints (TO IMPLEMENT)

### POST /api/v1/units/:unitId/payments
- **Auth**: JWT + ADMIN+
- **Body**: `{ unitId, residentId?, amount, period, dueDate, notes? }`
- **Response**: 201

### GET /api/v1/units/:unitId/payments
- **Auth**: JWT + USER+
- **Query**: `{ page, limit, status?, period? }`
- **Response**: Paginated payments

### GET /api/v1/condominiums/:condoId/payments
- **Auth**: JWT + ADMIN+
- **Query**: `{ page, limit, status?, period? }`
- **Response**: Paginated payments across all units

### POST /api/v1/payments/:id/register
- **Auth**: JWT + ADMIN+
- **Body**: `{ paidDate, paymentMethod, reference? }`
- **Action**: Update status to PAID, set paidDate and paymentMethod
- **Response**: Updated payment

### POST /api/v1/condominiums/:condoId/common-expenses
- **Auth**: JWT + ADMIN+
- **Body**: `{ period, basicAmount, waterAmount?, gasAmount?, parkingAmount?, otherCharges?, description? }`
- **Action**: Calculate totalAmount, create CommonExpense
- **Response**: 201

### POST /api/v1/condominiums/:condoId/common-expenses/:id/generate-payments
- **Auth**: JWT + ADMIN+
- **Action**: Generate Payment records for all active units based on CommonExpense amounts and unit aliquots
- **Response**: Created payments count

## Business Rules
1. totalAmount in CommonExpense = sum of all amount fields
2. Payment generation uses unit aliquot to calculate individual amounts
3. Status transitions: PENDING → PAID/PARTIAL/CANCELLED, OVERDUE (cron job)
4. Period format: YYYY-MM (e.g., "2026-03")
5. Overdue detection: cron job marks PENDING payments past dueDate as OVERDUE
6. One payment per unit per period (unique constraint recommended)

## Security (OWASP)
- A01: ADMIN+ for mutations, USER+ for own unit payments
- A04: Amount validation (min 0, max reasonable limit)

## Test Requirements
- Create payment: success, unit not found, invalid period format
- Register payment: success, already paid, invalid method
- Common expense: create, calculate total, generate payments
- Status transitions: pending → paid, pending → overdue (cron)
- List: by unit, by condominium, filter by status/period
