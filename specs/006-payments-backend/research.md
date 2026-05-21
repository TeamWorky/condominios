# Research: Payments Backend CRUD

**Feature**: `006-payments-backend`
**Date**: 2026-05-20

## Research Summary

No major unknowns — the codebase has well-established patterns from the residents module that directly apply to payments.

---

## Decision 1: CRUD Pattern

**Decision**: Follow the Residents module pattern (service + controller + DTOs + module).

**Rationale**: The Residents module is the most recently implemented and reviewed module. It follows all project conventions: TypeORM repository injection, cache via RedisCacheService, pagination via PaginationDto, response wrapping via ResponseUtil, Swagger decorators, versioned endpoints, and soft delete.

**Alternatives considered**:
- Repository pattern (separate repository class) — rejected per Constitution §VI (YAGNI). The service-with-injected-repository pattern is simpler and already proven.
- CQRS — rejected. Payment operations are straightforward CRUD with no complex read/write separation needs.

---

## Decision 2: Condominium Scoping Strategy

**Decision**: Use QueryBuilder joins through Unit → Building → Condominium to scope payments by condominiumId from JWT.

**Rationale**: Payment entity has `unitId` but no direct `condominiumId`. The chain is: Payment → Unit → Building → Condominium. This is the same pattern used in the residents module (Resident → Unit → Building → Condominium). Using QueryBuilder with inner joins ensures multi-tenant isolation.

**Alternatives considered**:
- Add condominiumId directly to Payment entity — rejected. Violates normalization and creates data duplication. The relationship chain already provides scoping.
- Database-level Row Level Security — rejected. Over-engineering for current scale. Application-level scoping via QueryBuilder is sufficient and testable.

---

## Decision 3: Status Transition Enforcement

**Decision**: Implement a static transition map in the service with a dedicated `changeStatus()` method. Define allowed transitions as a constant object.

**Rationale**: Simple, testable, and explicit. The transition rules are clearly defined in the spec with PAID and CANCELLED as terminal states. A map-based approach is easy to extend and modify.

**Implementation pattern**:
```typescript
const VALID_TRANSITIONS: Record<PaymentStatus, PaymentStatus[]> = {
  [PaymentStatus.PENDING]: [PaymentStatus.PAID, PaymentStatus.OVERDUE, PaymentStatus.PARTIAL, PaymentStatus.CANCELLED],
  [PaymentStatus.OVERDUE]: [PaymentStatus.PAID, PaymentStatus.PARTIAL, PaymentStatus.CANCELLED],
  [PaymentStatus.PARTIAL]: [PaymentStatus.PAID, PaymentStatus.CANCELLED],
  [PaymentStatus.PAID]: [],
  [PaymentStatus.CANCELLED]: [],
};
```

**Alternatives considered**:
- State machine library (xstate) — rejected per Constitution §VI (YAGNI). 5 states with simple transitions don't warrant an external dependency.
- Status changes via the general update endpoint — rejected. Spec requires a dedicated status endpoint (FR-011) for better audit control and business logic encapsulation.

---

## Decision 4: Caching Strategy

**Decision**: Follow the Residents module cache pattern with cache keys scoped by condominiumId and unitId.

**Rationale**: Consistent with existing codebase. Uses `RedisCacheService.getOrSet()` for reads and `invalidatePattern()` for writes. Cache TTL: SHORT (300s) for lists, MEDIUM (1800s) for single records.

**Cache keys**:
- `payments:condo:{condoId}:page:{page}:limit:{limit}` — list by condominium
- `payments:unit:{unitId}:page:{page}:limit:{limit}` — list by unit
- `payments:{id}` — single payment

---

## Decision 5: Paid Payment Protection

**Decision**: Prevent amount updates and soft deletion of PAID payments at the service level with clear error messages.

**Rationale**: Per spec FR-010 and FR-016. PAID payments represent completed financial transactions and should not have their monetary values altered or be removed from records.

**Alternatives considered**:
- Allow all updates with audit trail — rejected. Financial data integrity is more important than flexibility.
- Database-level triggers — rejected. Application-level validation is more testable and maintainable.
