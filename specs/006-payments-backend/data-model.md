# Data Model: Payments Backend CRUD

**Feature**: `006-payments-backend`
**Date**: 2026-05-20

## Entities

### Payment (existing — no changes needed)

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | UUID | PK, auto-generated | Unique identifier |
| amount | decimal(12,2) | NOT NULL | Payment amount in CLP |
| period | varchar(10) | NOT NULL | Billing period (YYYY-MM format) |
| dueDate | date | NOT NULL | Payment due date |
| paidDate | date | NULLABLE | Date payment was received |
| status | enum(PaymentStatus) | NOT NULL, default PENDING | Current payment status |
| paymentMethod | enum(PaymentMethod) | NULLABLE | Method of payment |
| reference | varchar(255) | NULLABLE | Payment reference/receipt number |
| notes | text | NULLABLE | Additional notes |
| unitId | UUID | FK → Unit.id, NOT NULL, CASCADE | Associated unit |
| residentId | UUID | FK → Resident.id, NULLABLE, SET NULL | Associated resident (optional) |
| createdAt | timestamp | auto | Creation timestamp |
| updatedAt | timestamp | auto | Last update timestamp |
| deletedAt | timestamp | NULLABLE | Soft delete timestamp |

### CommonExpense (existing — not modified by this feature)

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | UUID | PK, auto-generated | Unique identifier |
| period | varchar(10) | NOT NULL | Billing period (YYYY-MM format) |
| basicAmount | decimal(12,2) | NOT NULL, default 0 | Basic maintenance fee |
| waterAmount | decimal(12,2) | NOT NULL, default 0 | Water charges |
| gasAmount | decimal(12,2) | NOT NULL, default 0 | Gas charges |
| parkingAmount | decimal(12,2) | NOT NULL, default 0 | Parking charges |
| otherCharges | decimal(12,2) | NOT NULL, default 0 | Miscellaneous charges |
| totalAmount | decimal(12,2) | NOT NULL | Total amount |
| description | text | NULLABLE | Description of charges |
| condominioId | UUID | FK → Condominium.id, CASCADE | Associated condominium |
| createdAt | timestamp | auto | Creation timestamp |
| updatedAt | timestamp | auto | Last update timestamp |
| deletedAt | timestamp | NULLABLE | Soft delete timestamp |

## Relationships

```
Condominium (1) ──→ (N) Building (1) ──→ (N) Unit (1) ──→ (N) Payment
                                                  │
Condominium (1) ──→ (N) CommonExpense              │
                                                  ▼
                                          Resident (0..1) ←── Payment
```

- **Unit → Payment**: One-to-Many. A unit can have multiple payments. Payment is cascade-deleted when unit is deleted.
- **Resident → Payment**: Optional Many-to-One. A payment may be associated with a resident. If resident is deleted, residentId is set to NULL.
- **Condominium → CommonExpense**: One-to-Many. A condominium has expense records per period.
- **Condominium scoping**: Payment is scoped to condominium through `Payment.unit.building.condominium`.

## State Machine: PaymentStatus

```
          ┌──────────────────────────────────┐
          │                                  │
          ▼                                  │
     ┌─────────┐     ┌─────────┐     ┌───────────┐
     │ PENDING │────→│ OVERDUE │────→│ CANCELLED │
     └────┬────┘     └────┬────┘     └───────────┘
          │               │                ▲
          │               │                │
          ▼               ▼                │
     ┌─────────┐     ┌─────────┐          │
     │  PAID   │     │ PARTIAL │──────────┘
     └─────────┘     └────┬────┘
          ▲               │
          │               │
          └───────────────┘
```

**Terminal states**: PAID, CANCELLED (no further transitions allowed)

## Validation Rules

| Field | Rule | Error |
|-------|------|-------|
| amount | Must be > 0 | "Amount must be a positive number" |
| period | Must match YYYY-MM format | "Period must be in YYYY-MM format" |
| dueDate | Must be a valid date | "Due date must be a valid date" |
| unitId | Must reference an existing unit in the user's condominium | "Unit not found" |
| residentId | If provided, must reference an existing resident | "Resident not found" |
| paymentMethod | If provided, must be a valid PaymentMethod enum value | "Invalid payment method" |
| status (on change) | Must follow valid transition rules | "Invalid status transition from {from} to {to}" |
| amount (on update) | Cannot change if status is PAID | "Cannot update amount of a paid payment" |
| delete | Cannot delete if status is PAID | "Cannot delete a paid payment" |

## Indexes (already defined in entity)

- Primary key: `id` (UUID)
- Foreign key: `unitId` → `unit.id`
- Foreign key: `residentId` → `resident.id`

## Recommended Indexes (for migration — separate feature 011)

- Composite: `(unitId, period)` — fast lookup by unit and billing period
- Single: `(status)` — filter payments by status
- Single: `(dueDate)` — sort/filter by due date
