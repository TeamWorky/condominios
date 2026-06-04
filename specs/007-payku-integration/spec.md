# Feature Specification: Payku Payment Gateway Integration

**Feature Branch**: `007-payku-integration`  
**Created**: 2026-05-21  
**Status**: Draft  
**Input**: Integrate the existing Payku payment gateway library with the Payments module to enable online payment processing via Payku (webpay, etpay, mach, fintoc, tenpo, floid).

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Initiate Online Payment (Priority: P1)

An administrator selects a pending payment and initiates an online payment through the Payku gateway. The system creates a transaction with Payku, stores the transaction reference, and returns a payment URL. The administrator shares this URL with the resident (or the resident accesses it from their dashboard in a future frontend feature), who completes the payment through Payku's hosted payment page.

**Why this priority**: This is the core value proposition — enabling online payments through the gateway. Without this, the Payku integration has no purpose.

**Independent Test**: Can be fully tested by creating a pending payment, calling the initiate endpoint, and verifying a Payku transaction is created with a valid payment URL returned.

**Acceptance Scenarios**:

1. **Given** a payment exists with status PENDING, **When** an admin calls the initiate endpoint for that payment, **Then** a Payku transaction is created and a payment URL is returned.
2. **Given** a payment exists with status OVERDUE, **When** an admin calls the initiate endpoint, **Then** a Payku transaction is created (overdue payments can still be paid).
3. **Given** a payment exists with status PAID, **When** an admin calls the initiate endpoint, **Then** the request is rejected with a business error indicating the payment is already completed.
4. **Given** a payment exists with status CANCELLED, **When** an admin calls the initiate endpoint, **Then** the request is rejected with a business error.
5. **Given** the Payku service is not configured (no tokens), **When** an admin calls the initiate endpoint, **Then** the system returns a service unavailable error with a clear message.
6. **Given** a payment already has an active Payku transaction, **When** an admin calls the initiate endpoint again, **Then** the system creates a new transaction and replaces the stored reference.

---

### User Story 2 - Automatic Payment Confirmation via Webhook (Priority: P1)

When a resident completes a payment through Payku's hosted page, Payku sends a notification to the system's webhook endpoint. The system verifies the transaction status with Payku, and if successful, automatically updates the payment record to PAID with the payment date, method, and transaction reference.

**Why this priority**: Without automatic confirmation, the payment flow is incomplete — admins would need to manually check and update every payment. This is equally critical as US1.

**Independent Test**: Can be tested by simulating a Payku webhook call with a valid transaction ID and verifying the payment record is updated to PAID with correct metadata.

**Acceptance Scenarios**:

1. **Given** a payment has an active Payku transaction, **When** Payku sends a success webhook notification, **Then** the payment status is updated to PAID, paidDate is set, and the Payku transaction reference is stored.
2. **Given** a payment has an active Payku transaction, **When** Payku sends a failed webhook notification, **Then** the payment status remains unchanged and the failure is logged.
3. **Given** the same webhook is received twice (duplicate), **When** the system processes the second call, **Then** no duplicate changes occur (idempotent behavior).
4. **Given** a webhook arrives with a transaction ID that doesn't match any payment, **When** the system processes it, **Then** the event is logged and no changes are made.
5. **Given** a webhook arrives but the Payku service is not configured, **When** the system processes it, **Then** the event is logged as a warning and no changes are made.

---

### User Story 3 - Check Payku Transaction Status (Priority: P2)

An administrator needs to troubleshoot a payment that was initiated but hasn't been confirmed. They check the real-time status of the Payku transaction to understand whether the resident completed the payment, if it's still pending, or if it failed.

**Why this priority**: Important for operations and troubleshooting, but not required for the core payment flow to work. Admins can also check the Payku dashboard directly.

**Independent Test**: Can be tested by calling the status check endpoint for a payment with a Payku transaction ID and verifying the Payku API response is returned.

**Acceptance Scenarios**:

1. **Given** a payment has a Payku transaction ID, **When** an admin calls the status check endpoint, **Then** the current Payku transaction details are returned without modifying the payment record.
2. **Given** a payment has no Payku transaction ID, **When** an admin calls the status check endpoint, **Then** a clear error message indicates no Payku transaction exists for this payment.
3. **Given** the Payku service is not configured, **When** an admin calls the status check endpoint, **Then** a service unavailable error is returned.

---

### Edge Cases

- What happens when a payment is deleted (soft) between initiation and webhook callback? The webhook finds no matching payment and logs the event without changes.
- How does the system handle Payku API timeouts during transaction creation? The initiation fails with a gateway error; no Payku transaction ID is stored on the payment.
- What happens if the Payku transaction amount doesn't match the payment amount during webhook verification? The payment update is rejected and the mismatch is logged as a security event.
- How does the system behave when Payku sends a webhook for a transaction that was already manually marked as PAID? The system detects the payment is already PAID and skips the update (idempotent).

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST allow administrators to initiate an online payment for an existing PENDING or OVERDUE payment via the Payku gateway.
- **FR-002**: System MUST store the Payku transaction identifier on the payment record after successful initiation.
- **FR-003**: System MUST return a Payku-hosted payment URL upon successful initiation for user redirection.
- **FR-004**: System MUST reject payment initiation for payments with status PAID, PARTIAL, or CANCELLED.
- **FR-005**: System MUST expose a public webhook endpoint (no authentication required) that receives payment notifications from Payku.
- **FR-006**: System MUST verify each webhook notification by querying Payku's transaction status before updating any payment records.
- **FR-007**: System MUST update payment status to PAID, set paidDate, store payment method, and store transaction reference when Payku confirms a successful payment.
- **FR-008**: System MUST handle duplicate webhook notifications without creating duplicate state changes (idempotent processing).
- **FR-009**: System MUST log all webhook events (success and failure) for audit purposes.
- **FR-010**: System MUST allow administrators to check the real-time Payku transaction status for any payment that has a Payku transaction ID.
- **FR-011**: System MUST return a service unavailable response when the Payku service is not configured (no tokens) and a Payku-dependent operation is requested.
- **FR-012**: System MUST scope all payment operations by the user's condominium (multi-tenant isolation), except for the public webhook endpoint which uses the Payku transaction reference to locate the correct payment.
- **FR-013**: System MUST verify that the webhook transaction amount matches the payment amount before confirming the payment.
- **FR-014**: System MUST NOT modify any payment record from the status check endpoint — it is read-only against Payku.

### Key Entities

- **Payment** (existing): Extended with a Payku transaction identifier field. Represents a unit's payment obligation for a specific period. Central entity linking the internal payment lifecycle with the external Payku transaction.
- **Payku Transaction** (external): The transaction created at Payku's gateway. Identified by a unique ID, has its own lifecycle (register → pending → success/rejected). Not stored as a separate entity — referenced by ID from the Payment record.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Administrators can initiate an online payment and receive a payment URL in under 5 seconds.
- **SC-002**: Webhook notifications are processed and payment records updated within 3 seconds of receipt.
- **SC-003**: Duplicate webhook notifications do not cause data inconsistencies — payment remains in correct state after any number of duplicate calls.
- **SC-004**: All existing payment CRUD operations continue to function identically when Payku is not configured (zero regression).
- **SC-005**: 100% of webhook events (success and failure) are recorded in system logs with sufficient detail for audit.
- **SC-006**: Administrators can check real-time Payku transaction status for troubleshooting without affecting payment records.
- **SC-007**: The system gracefully handles Payku API unavailability with clear error messages — no unhandled errors or data corruption.

## Assumptions

- The Payku payment URL is a hosted page managed by Payku — the system only needs to redirect/share the URL, not render a payment form.
- The `order` field sent to Payku will use the Payment entity's UUID, enabling lookup during webhook processing.
- The `email` field required by Payku will be sourced from the authenticated user initiating the payment (from JWT context) or from a resident's email if available.
- The `subject` field will be auto-generated from the payment period and unit information (e.g., "Common expenses - Unit 101 - 2026-01").
- Currency is always CLP (Chilean Pesos) since this is a Chilean condominium system.
- The `urlreturn` (user redirect after payment) and `urlnotify` (webhook URL) will be configured via environment variables.
- When a payment is re-initiated (already has a Payku transaction ID), the old reference is replaced with the new one. The old Payku transaction will expire naturally on Payku's side.
- The webhook endpoint does not require CSRF protection since it receives POST requests from an external service, not from browsers.

## Scope Boundaries

### In Scope
- Initiate payment endpoint
- Webhook receiver endpoint
- Payku status check endpoint
- Payment entity extension (Payku transaction ID field)
- Database migration for new field
- Enum extension for online payment method
- Environment variable configuration for return/notify URLs
- Unit and integration tests

### Out of Scope
- Frontend payment flow UI (separate feature)
- Subscription/recurring payment processing
- Refunds/nullification via Payku
- Payku wallet, marketplace, and mall features
- Payment receipt generation or email notifications
- Overdue payment cron job (already defined in payments spec, separate concern)
