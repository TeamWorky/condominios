# Feature Specification: Payku Payment Gateway Library

**Feature Branch**: `005-payku-library`
**Created**: 2026-05-20
**Status**: Draft
**Input**: User description: "Create a Payku payment gateway TypeScript library in libs/infrastructure/src/payku/ for the Condominios SaaS platform. HTTP client wrapper around the Payku REST API (Chilean payment platform) with no official Node.js SDK."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Process a One-Time Payment Transaction (Priority: P1)

A condominium administrator initiates a payment for a resident's common expenses. The system creates a payment transaction through Payku, receives a payment URL, and redirects the resident to complete payment. After payment, the system receives a webhook notification confirming the transaction status.

**Why this priority**: Core payment processing is the primary reason for the library. Without transaction creation and status tracking, no payment functionality exists.

**Independent Test**: Can be fully tested by creating a transaction in sandbox mode, receiving a payment URL, and verifying status retrieval. Delivers the fundamental payment capability.

**Acceptance Scenarios**:

1. **Given** valid Payku credentials are configured, **When** the system creates a transaction with amount, email, and order reference, **Then** Payku returns a payment URL and transaction ID
2. **Given** a transaction has been created, **When** the system queries the transaction by ID, **Then** the current payment status is returned (pending, success, failed, nullified, expired)
3. **Given** a payment is completed by the end user, **When** Payku sends a webhook notification, **Then** the system receives the transaction ID and updated status
4. **Given** a pending transaction is no longer needed, **When** the system deletes the transaction, **Then** the transaction is removed from Payku

---

### User Story 2 - Refund a Completed Payment (Priority: P2)

An administrator needs to issue a refund for an incorrect or disputed payment. The system nullifies the original transaction through Payku, reversing the charge to the resident.

**Why this priority**: Refunds are essential for handling payment errors and disputes. Required for complete payment lifecycle management.

**Independent Test**: Can be tested by first completing a transaction in sandbox, then nullifying it and verifying the refund status.

**Acceptance Scenarios**:

1. **Given** a completed transaction exists, **When** the system requests nullification with the transaction reference, **Then** Payku processes the refund and returns confirmation
2. **Given** an invalid transaction reference, **When** the system requests nullification, **Then** a clear error is returned explaining the failure

---

### User Story 3 - Graceful Operation Without Credentials (Priority: P2)

The application starts in a development or testing environment where Payku credentials are not configured. The system continues to operate normally, with the payment library reporting its non-operational status without crashing or blocking other features.

**Why this priority**: Critical for developer experience and environment flexibility. Prevents the payment library from breaking non-payment functionality.

**Independent Test**: Can be tested by starting the application without PAYKU_PUBLIC_TOKEN and PAYKU_PRIVATE_TOKEN, verifying the app starts successfully and payment operations return appropriate "not configured" responses.

**Acceptance Scenarios**:

1. **Given** no Payku tokens are configured, **When** the application starts, **Then** the payment library initializes without errors and logs a warning
2. **Given** the payment library is not operational, **When** any payment operation is attempted, **Then** a clear error indicates the service is not configured (does not crash)
3. **Given** the payment library is configured, **When** the system checks operational status, **Then** it reports as operational and ready to process payments

---

### User Story 4 - Sandbox vs Production Environment Toggle (Priority: P3)

The development team switches between sandbox (testing) and production environments using a configuration flag. Sandbox mode routes all API calls to Payku's test environment with test credentials, while production mode routes to the live API.

**Why this priority**: Important for safe development and testing, but lower priority than core payment operations.

**Independent Test**: Can be tested by configuring sandbox mode and verifying all API calls target the test URL, then switching to production mode and verifying the production URL is used.

**Acceptance Scenarios**:

1. **Given** sandbox mode is enabled (default), **When** a transaction is created, **Then** the request is sent to Payku's sandbox environment
2. **Given** sandbox mode is disabled, **When** a transaction is created, **Then** the request is sent to Payku's production environment

---

### User Story 5 - Signed Requests for Sensitive Operations (Priority: P3)

Certain Payku operations (wallet transfers, subscriptions, mall transactions) require cryptographic request signing. The system automatically signs these requests using HMAC-SHA256 with the private token, ensuring request integrity and authentication.

**Why this priority**: Required for wallet, subscription, and mall endpoints, but these are secondary to basic transaction processing.

**Independent Test**: Can be tested by creating a signed request and verifying the HMAC-SHA256 signature matches the expected output for a known input/key combination.

**Acceptance Scenarios**:

1. **Given** a wallet transfer request, **When** the system sends the request, **Then** the request includes a valid HMAC-SHA256 signature generated from the request body and private token
2. **Given** a known request body and private token, **When** the signature is generated, **Then** the output is deterministic and matches the expected hash

---

### Edge Cases

- What happens when Payku's API returns an unexpected HTTP status code (e.g., 500, 503)?
- How does the system handle network timeouts when communicating with Payku?
- What happens when the webhook notification arrives before the transaction creation response?
- How does the system handle duplicate webhook notifications for the same transaction?
- What happens when Payku returns malformed or unexpected JSON responses?
- How does the system behave when the HMAC signature algorithm produces an empty or invalid result?

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST create payment transactions through Payku with email, order reference, amount, currency, payment method, return URL, and notification URL
- **FR-002**: System MUST retrieve individual transaction status by transaction ID
- **FR-003**: System MUST list all transactions associated with the account
- **FR-004**: System MUST delete pending transactions that are no longer needed
- **FR-005**: System MUST nullify (refund) completed transactions
- **FR-006**: System MUST check and report wallet balance
- **FR-007**: System MUST create wallet transfers (payouts) to bank accounts
- **FR-008**: System MUST list wallet transfer history
- **FR-009**: System MUST create recurring payment subscriptions
- **FR-010**: System MUST retrieve subscription details by ID
- **FR-011**: System MUST cancel active subscriptions
- **FR-012**: System MUST create marketplace split transactions
- **FR-013**: System MUST create mall multi-merchant transactions
- **FR-014**: System MUST list payment events/webhook history
- **FR-015**: System MUST retrieve conciliation reports
- **FR-016**: System MUST authenticate all API requests using Bearer token (public token)
- **FR-017**: System MUST sign sensitive operations (wallet, subscription, mall) using HMAC-SHA256 with the private token
- **FR-018**: System MUST support sandbox and production environments via configuration toggle (sandbox by default)
- **FR-019**: System MUST operate gracefully when credentials are not configured — start without errors and report non-operational status
- **FR-020**: System MUST wrap all Payku API errors in typed exceptions with upstream error code and message preserved
- **FR-021**: System MUST support all Payku payment methods: Webpay, Etpay, Mach, Fintoc, Tenpo, Floid
- **FR-022**: System MUST provide typed interfaces for all request and response payloads
- **FR-023**: System MUST log all API interactions (requests and errors) for debugging and audit purposes

### Key Entities

- **Transaction**: A payment operation with amount, order reference, email, payment method, currency, status, and payment URL. Central entity for all payment processing.
- **Nullification**: A refund operation linked to an original transaction, reversing a completed payment.
- **Wallet**: Account balance and transfer capability for payouts to external bank accounts.
- **Subscription**: A recurring payment agreement with frequency, amount, and lifecycle management (create, retrieve, cancel).
- **Marketplace Transaction**: A split payment distributed across multiple merchants/recipients.
- **Mall Transaction**: A multi-merchant payment processed as a single customer transaction.
- **Payment Event**: A recorded webhook or system event related to a transaction status change.
- **Conciliation Report**: A financial reconciliation record matching transactions to settlements.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: All 15 Payku API operations (transaction CRUD, nullification, wallet operations, subscriptions, marketplace, mall, events, conciliation) are callable through typed service methods
- **SC-002**: The library achieves 70% or higher test coverage across all service methods
- **SC-003**: The application starts successfully with and without Payku credentials configured — zero crashes from missing payment configuration
- **SC-004**: Sandbox and production environments are correctly routed based on a single configuration flag
- **SC-005**: All API errors from Payku are caught, wrapped in typed exceptions, and include the original error code and message for debugging
- **SC-006**: HMAC-SHA256 signatures for signed endpoints produce deterministic, verifiable output matching known test vectors
- **SC-007**: All request and response payloads have corresponding TypeScript interfaces — zero `any` types in the public API surface

## Assumptions

- Payku's sandbox environment (`des.payku.cl`) behaves identically to production for API contract purposes
- CLP (Chilean Peso) is the only currency needed for this condominium platform
- The library is consumed exclusively by the NestJS backend — no browser/frontend usage
- Webhook handling (receiving POST notifications) will be implemented in the payments module, not in this infrastructure library. The library only provides the typed interface for webhook payloads.
- Axios is already available as a project dependency and is the preferred HTTP client
- The HMAC-SHA256 signing algorithm follows Payku's specification: sort request body keys alphabetically, join values with `&`, sign with SHA256 using the private token
