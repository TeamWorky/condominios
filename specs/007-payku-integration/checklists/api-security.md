# Checklist: API & Security Requirements Quality — Payku Payment Gateway Integration

**Purpose**: Validate that requirements for the Payku integration are complete, clear, consistent, and measurable — focusing on API contracts, security boundaries, and external integration resilience.
**Created**: 2026-05-21
**Feature**: [spec.md](../spec.md)
**Depth**: Standard
**Audience**: PR Reviewer
**Focus**: API completeness, security boundaries, integration resilience

---

## Requirement Completeness

- [ ] CHK001 — Are requirements defined for all three endpoints (initiate, webhook, status check) with request/response formats? [Completeness, Spec §FR-001/005/010]
- [ ] CHK002 — Are error response requirements specified for every failure mode per endpoint (400, 404, 502, 503)? [Completeness, Contracts §1/2/3]
- [ ] CHK003 — Is the new `paykuTransactionId` field's purpose, type, and nullability documented in both spec and data model? [Completeness, Data Model §Payment]
- [ ] CHK004 — Are requirements for the `ONLINE` enum value documented including when it is set and by which flow? [Completeness, Data Model §PaymentMethod]
- [ ] CHK005 — Are migration requirements (up and down) specified for the new column? [Completeness, Data Model §Migration]
- [ ] CHK006 — Are all new environment variables (`PAYKU_RETURN_URL`, `PAYKU_NOTIFY_URL`) documented with type, default, and optionality? [Completeness, Contracts §Environment Variables]
- [ ] CHK007 — Are logging requirements specified for each event type (initiation success, webhook success, webhook failure, amount mismatch, unknown order)? [Completeness, Spec §FR-009]
- [ ] CHK008 — Is the `email` field source for Payku transaction creation explicitly defined (JWT user vs resident)? [Completeness, Spec §Assumptions]
- [ ] CHK009 — Is the `subject` field format for Payku transactions explicitly defined with a concrete example? [Completeness, Spec §Assumptions]

## Requirement Clarity

- [ ] CHK010 — Is "service unavailable" for unconfigured Payku quantified with a specific HTTP status code (503) in the spec, not just the contracts? [Clarity, Spec §FR-011]
- [ ] CHK011 — Is the re-initiation behavior (replace old transaction ID) unambiguously stated, including what happens to the old Payku transaction? [Clarity, Spec §US1 Scenario 6]
- [ ] CHK012 — Is "amount mismatch" during webhook verification defined with precision (exact match, tolerance, or currency-aware comparison)? [Clarity, Spec §FR-013]
- [ ] CHK013 — Are the statuses that allow initiation (PENDING, OVERDUE) and those that reject it (PAID, PARTIAL, CANCELLED) exhaustively listed in one place? [Clarity, Spec §FR-001/004]
- [ ] CHK014 — Is the webhook response format (`{ received: true }`) specified as the fixed response for all outcomes (success, failure, error)? [Clarity, Contracts §2]
- [ ] CHK015 — Is "audit purposes" in FR-009 defined with what constitutes sufficient detail (payment ID, transaction ID, timestamp, status, amount)? [Clarity, Spec §FR-009]

## Requirement Consistency

- [ ] CHK016 — Are the allowed statuses for initiation consistent between spec (FR-001: PENDING/OVERDUE) and acceptance scenarios (US1 scenarios 1-4)? [Consistency, Spec §FR-001 vs §US1]
- [ ] CHK017 — Is the `paymentMethod` value set by webhook (ONLINE) consistent with the enum extension documented in data-model.md? [Consistency, Spec §FR-007 vs Data Model §PaymentMethod]
- [ ] CHK018 — Are the error HTTP status codes consistent between spec requirements and API contracts for each failure mode? [Consistency, Spec §FR vs Contracts]
- [ ] CHK019 — Is multi-tenant scoping consistently required for initiate and status-check but explicitly excluded for webhook, across spec, contracts, and research? [Consistency, Spec §FR-012]
- [ ] CHK020 — Is the `paykuTransactionId` storage requirement consistent between FR-002 (initiate stores it) and FR-007 (webhook stores reference) — are these the same field? [Consistency, Spec §FR-002 vs §FR-007]

## Acceptance Criteria Quality

- [ ] CHK021 — Can SC-001 ("under 5 seconds") be measured without knowledge of network conditions or Payku API latency? [Measurability, Spec §SC-001]
- [ ] CHK022 — Can SC-003 ("any number of duplicate calls") be objectively verified with a finite test? [Measurability, Spec §SC-003]
- [ ] CHK023 — Is SC-005 ("100% of webhook events") measurable — does it define what counts as an "event" (including malformed payloads, connection drops)? [Measurability, Spec §SC-005]
- [ ] CHK024 — Are success criteria defined for the migration itself (up runs without error, down reverts cleanly)? [Gap]

## Scenario Coverage

- [ ] CHK025 — Are requirements defined for what happens when `PAYKU_RETURN_URL` or `PAYKU_NOTIFY_URL` are empty at initiation time? [Coverage, Spec §Assumptions]
- [ ] CHK026 — Are requirements defined for the webhook receiving a payload with missing or malformed fields (partial payload)? [Coverage, Gap]
- [ ] CHK027 — Are requirements defined for concurrent webhook calls for the same payment (race condition)? [Coverage, Gap]
- [ ] CHK028 — Are requirements defined for the case where `PaykuService.getTransaction()` returns a different `order` than the webhook's `order`? [Coverage, Gap]
- [ ] CHK029 — Are requirements defined for Payku API timeout during webhook verification (transaction created but verification fails)? [Coverage, Spec §Edge Cases]

## Edge Case Coverage

- [ ] CHK030 — Is the soft-deleted payment + webhook scenario explicitly specified with expected behavior (log and skip)? [Edge Case, Spec §Edge Cases]
- [ ] CHK031 — Is the manually-marked-PAID + webhook scenario explicitly specified (idempotent skip)? [Edge Case, Spec §Edge Cases]
- [ ] CHK032 — Are requirements defined for when a payment amount changes between initiation and webhook callback? [Edge Case, Gap]
- [ ] CHK033 — Are requirements defined for the webhook endpoint receiving non-Payku traffic (random POSTs, bots)? [Edge Case, Gap]

## Security Requirements

- [ ] CHK034 — Is the webhook verification strategy (call Payku API + compare amount) documented as a security requirement, not just an implementation decision? [Security, Research §R3]
- [ ] CHK035 — Are requirements specified for rate limiting on the public webhook endpoint to prevent abuse? [Security, Gap]
- [ ] CHK036 — Is the `@Public()` decorator requirement explicitly tied to a security analysis justifying bypassing JWT? [Security, Research §R5]
- [ ] CHK037 — Are requirements defined for logging amount mismatches as security events (not just operational logs)? [Security, Spec §FR-013]
- [ ] CHK038 — Is CSRF exemption for the webhook endpoint documented with justification? [Security, Spec §Assumptions]
- [ ] CHK039 — Are requirements defined for preventing information leakage in webhook error responses (always return same 200 response)? [Security, Contracts §2]

## Dependencies & Assumptions

- [ ] CHK040 — Is the assumption that Payment UUID is used as Payku `order` field validated against Payku's `order` field constraints (length, charset)? [Assumption, Research §R4]
- [ ] CHK041 — Is the assumption that currency is always CLP documented as a requirement or constraint? [Assumption, Spec §Assumptions]
- [ ] CHK042 — Is the dependency on PaykuModule being `@Global()` and imported in AppModule documented as a prerequisite? [Dependency, Research §R1/R8]
- [ ] CHK043 — Is the dependency on existing `findOne(id, condominiumId)` for tenant-scoped lookups documented? [Dependency, Plan §Files to Modify]

---

## Summary

| Dimension | Items | Key Gaps Found |
|-----------|-------|----------------|
| Completeness | CHK001-CHK009 | Email source, subject format could be more explicit |
| Clarity | CHK010-CHK015 | Amount comparison precision, audit detail |
| Consistency | CHK016-CHK020 | FR-002 vs FR-007 reference field overlap |
| Acceptance Criteria | CHK021-CHK024 | Migration success criteria missing |
| Scenario Coverage | CHK025-CHK029 | Malformed payload, concurrent webhook, verification timeout |
| Edge Cases | CHK030-CHK033 | Amount change between initiate/webhook, non-Payku traffic |
| Security | CHK034-CHK039 | Webhook rate limiting, CSRF justification |
| Dependencies | CHK040-CHK043 | Payku order field constraints |

**Total**: 43 items across 8 quality dimensions
