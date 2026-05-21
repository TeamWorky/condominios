# Feature Specification: Payments Backend CRUD

**Feature Branch**: `006-payments-backend`
**Created**: 2026-05-20
**Status**: Draft
**Input**: Payments backend CRUD module for condominiums platform. Service, controller, DTOs, tests.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Register a Payment (Priority: P1)

An administrator registers a new payment for a specific unit. They select the unit, enter the amount, period (e.g., "2026-01"), due date, and optionally a payment method, reference number, and notes. The system creates the payment record with status PENDING.

**Why this priority**: Core functionality — without payment registration, the entire payments module has no purpose. This is the foundation for all other payment operations.

**Independent Test**: Can be fully tested by sending a POST request with valid payment data and verifying the record is created with correct fields and PENDING status.

**Acceptance Scenarios**:

1. **Given** a valid unit exists in the condominium, **When** an administrator submits payment data with amount, period, and due date, **Then** the system creates a payment with status PENDING and returns the payment details.
2. **Given** an administrator submits payment data, **When** the amount is zero or negative, **Then** the system rejects the request with a validation error.
3. **Given** an administrator submits payment data, **When** the period format is invalid (not YYYY-MM), **Then** the system rejects the request with a validation error.
4. **Given** an administrator submits payment data, **When** the unit does not exist or belongs to a different condominium, **Then** the system rejects with a not found error.

---

### User Story 2 - List Payments by Condominium and Unit (Priority: P1)

An administrator views all payments for their condominium in a paginated list. They can also filter payments for a specific unit. The list shows amount, period, status, due date, and payment method.

**Why this priority**: Essential for administrators to have visibility into payment status across their condominium. Required for dashboard integration.

**Independent Test**: Can be tested by creating several payments and requesting the paginated list, verifying correct data, pagination metadata, and condominium scoping.

**Acceptance Scenarios**:

1. **Given** multiple payments exist for a condominium, **When** an administrator requests the payment list, **Then** the system returns a paginated list sorted by due date descending.
2. **Given** payments exist for multiple condominiums, **When** an administrator requests payments, **Then** only payments belonging to their condominium are returned.
3. **Given** a unit has payments, **When** an administrator requests payments for that specific unit, **Then** only payments for that unit are returned.
4. **Given** no payments exist, **When** an administrator requests the list, **Then** the system returns an empty list with pagination metadata.

---

### User Story 3 - View Payment Details (Priority: P2)

An administrator views the full details of a specific payment including amount, period, due date, paid date, status, payment method, reference, notes, and associated unit information.

**Why this priority**: Important for payment management but depends on payments existing first.

**Independent Test**: Can be tested by creating a payment and requesting its details by ID, verifying all fields are returned correctly.

**Acceptance Scenarios**:

1. **Given** a payment exists, **When** an administrator requests it by ID, **Then** the system returns all payment details including unit information.
2. **Given** a payment ID does not exist, **When** an administrator requests it, **Then** the system returns a 404 error.
3. **Given** a payment belongs to a different condominium, **When** an administrator requests it, **Then** the system returns a 404 error (condominium scoping).

---

### User Story 4 - Update Payment Information (Priority: P2)

An administrator updates payment details such as amount, due date, payment method, reference, or notes. Status cannot be changed via this operation (separate endpoint for status changes).

**Why this priority**: Needed for correcting payment data, but secondary to creating and viewing payments.

**Independent Test**: Can be tested by creating a payment, sending a PATCH with updated fields, and verifying the changes are persisted.

**Acceptance Scenarios**:

1. **Given** a payment exists with status PENDING, **When** an administrator updates the amount, **Then** the system saves the new amount.
2. **Given** a payment exists, **When** an administrator sends an update with no fields, **Then** no changes are made and the payment is returned as-is.
3. **Given** a payment exists with status PAID, **When** an administrator tries to update the amount, **Then** the system rejects the update (paid payments cannot have amount changed).

---

### User Story 5 - Mark Payment as Paid (Priority: P1)

An administrator marks a payment as paid by changing its status. The system records the payment date, payment method, and optional reference. Valid status transitions are enforced.

**Why this priority**: Core business operation — marking payments as received is the primary workflow for condominium administrators.

**Independent Test**: Can be tested by creating a PENDING payment and changing its status to PAID, verifying the status change, paid date recording, and rejection of invalid transitions.

**Acceptance Scenarios**:

1. **Given** a payment with status PENDING, **When** an administrator marks it as PAID with payment method and reference, **Then** the status changes to PAID and paidDate is set to current date.
2. **Given** a payment with status OVERDUE, **When** an administrator marks it as PAID, **Then** the status changes to PAID (valid transition).
3. **Given** a payment with status PAID, **When** an administrator tries to mark it as PENDING, **Then** the system rejects the transition as invalid.
4. **Given** a payment with status CANCELLED, **When** an administrator tries to change its status, **Then** the system rejects — CANCELLED is a terminal state.

**Valid Status Transitions**:

| From | Allowed To |
|------|-----------|
| PENDING | PAID, OVERDUE, PARTIAL, CANCELLED |
| OVERDUE | PAID, PARTIAL, CANCELLED |
| PARTIAL | PAID, CANCELLED |
| PAID | — (terminal) |
| CANCELLED | — (terminal) |

---

### User Story 6 - Soft Delete Payment (Priority: P3)

An administrator removes a payment record. The payment is not physically deleted but soft-deleted (marked with a deletion timestamp). Soft-deleted payments are excluded from normal queries.

**Why this priority**: Lower priority administrative function. Data integrity requires soft delete over hard delete.

**Independent Test**: Can be tested by creating a payment, sending a DELETE request, and verifying the payment no longer appears in list queries but still exists in the database.

**Acceptance Scenarios**:

1. **Given** a payment exists, **When** an administrator deletes it, **Then** the payment is soft-deleted and no longer appears in list queries.
2. **Given** a payment does not exist, **When** an administrator tries to delete it, **Then** the system returns a 404 error.
3. **Given** a payment with status PAID, **When** an administrator tries to delete it, **Then** the system rejects the deletion (paid payments should not be deleted).

---

### Edge Cases

- What happens when a duplicate payment is registered for the same unit and period? The system allows it — multiple charges per period are valid (e.g., regular fee + extraordinary charge).
- What happens when the unit is deactivated? Payments can still be registered for inactive units (historical data).
- What happens when the associated resident is deleted? The residentId is set to NULL (SET NULL on delete) — the payment record persists.
- How does the system handle concurrent status changes? Last-write-wins with optimistic approach; the entity's updatedAt timestamp helps detect conflicts at the application level.
- What happens with very large payment amounts? The amount field supports up to 10 integer digits and 2 decimal places (decimal 12,2).

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST allow creating a payment associated with a specific unit, requiring amount, period, and due date.
- **FR-002**: System MUST validate that amount is a positive number.
- **FR-003**: System MUST validate that period follows the format YYYY-MM.
- **FR-004**: System MUST set initial payment status to PENDING when creating a payment.
- **FR-005**: System MUST list payments by condominium with pagination support (page, limit parameters).
- **FR-006**: System MUST list payments by unit with pagination support.
- **FR-007**: System MUST scope all payment queries to the authenticated user's condominium (from JWT).
- **FR-008**: System MUST return payment details by ID, including associated unit information.
- **FR-009**: System MUST allow partial updates to payment fields (amount, dueDate, paymentMethod, reference, notes).
- **FR-010**: System MUST prevent updating the amount of payments with PAID status.
- **FR-011**: System MUST provide a dedicated endpoint for changing payment status.
- **FR-012**: System MUST enforce valid status transitions as defined in the transition table.
- **FR-013**: System MUST automatically set paidDate when status changes to PAID.
- **FR-014**: System MUST reject status changes from terminal states (PAID, CANCELLED).
- **FR-015**: System MUST support soft delete for payments.
- **FR-016**: System MUST prevent soft deletion of payments with PAID status.
- **FR-017**: System MUST exclude soft-deleted payments from all list and detail queries.
- **FR-018**: System MUST require authentication (JWT) for all payment endpoints.

### Key Entities

- **Payment**: Represents a financial obligation or charge for a unit. Key attributes: amount, period (YYYY-MM), due date, paid date, status (PENDING/PAID/OVERDUE/PARTIAL/CANCELLED), payment method, reference, notes. Belongs to a Unit. Optionally linked to a Resident.
- **CommonExpense**: Represents the breakdown of common expenses for a condominium period. Key attributes: period, basic amount, water, gas, parking, other charges, total amount. Belongs to a Condominium. (Exists but not directly modified by this feature.)

## Scope

### In Scope

- Payment CRUD operations (create, read, update, soft delete)
- Status management with transition validation
- Pagination for list endpoints
- Condominium scoping via JWT
- Unit tests for service and controller (70% minimum coverage)

### Out of Scope

- Payment gateway integration (Payku) — future feature
- Automated payment reminders or notifications
- Bulk payment operations
- Payment receipt generation
- Common expense calculation or distribution
- Frontend implementation

## Assumptions

- The Payment and CommonExpense entities already exist with the correct schema.
- PaymentStatus and PaymentMethod enums are defined in @condominios/shared.
- The JWT token contains condominiumId after condominium selection.
- Unit entity has a relationship to Building, which has a relationship to Condominium (for scoping).
- Pagination follows the existing pattern used by other modules (page/limit query params, returning items + metadata).

## Dependencies

- Existing Payment entity (`apps/api/src/payments/entities/payment.entity.ts`)
- Existing CommonExpense entity (`apps/api/src/payments/entities/common-expense.entity.ts`)
- Shared enums: PaymentStatus, PaymentMethod (`libs/shared/src/enums/`)
- JWT authentication guards (`libs/common/src/guards/`)
- Unit module for unit validation and relationship loading

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Administrators can register a payment for any unit in their condominium in under 30 seconds.
- **SC-002**: Payment lists load within 2 seconds for condominiums with up to 500 payments.
- **SC-003**: All invalid status transitions are rejected with clear error messages 100% of the time.
- **SC-004**: Payment data is correctly scoped — no administrator can see or modify payments from other condominiums.
- **SC-005**: Soft-deleted payments never appear in list or detail queries.
- **SC-006**: Backend test coverage for the payments module reaches 70% minimum (branches, functions, lines, statements).
- **SC-007**: All 7 REST endpoints respond with correct HTTP status codes (201, 200, 404, 400, 403) for their respective scenarios.
