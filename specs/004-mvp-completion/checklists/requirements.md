# 004 - MVP Completion: QA Checklist

## Backend Validation

### Payments Module
- [ ] POST /api/v1/units/:unitId/payments creates payment correctly
- [ ] GET /api/v1/condominiums/:condoId/payments returns paginated list
- [ ] GET /api/v1/units/:unitId/payments returns unit-scoped payments
- [ ] GET /api/v1/payments/:id returns payment details
- [ ] PATCH /api/v1/payments/:id updates payment fields
- [ ] PATCH /api/v1/payments/:id/status changes status (PENDING → PAID)
- [ ] DELETE /api/v1/payments/:id soft deletes
- [ ] Unauthorized users get 401
- [ ] Users with insufficient role get 403
- [ ] Invalid data returns 400 with validation errors
- [ ] Non-existent payment returns 404

### Common Spaces Module
- [ ] POST /api/v1/buildings/:buildingId/common-spaces creates space
- [ ] GET /api/v1/buildings/:buildingId/common-spaces returns list
- [ ] GET /api/v1/common-spaces/:id returns space details
- [ ] PATCH /api/v1/common-spaces/:id updates space
- [ ] DELETE /api/v1/common-spaces/:id soft deletes
- [ ] Unauthorized users get 401
- [ ] Validation errors return 400

### Reservations Module
- [ ] POST /api/v1/common-spaces/:spaceId/reservations creates reservation
- [ ] Overlapping reservations return 409 Conflict
- [ ] Exceeding capacity returns 400
- [ ] Exclusive space blocks all other reservations
- [ ] GET /api/v1/common-spaces/:spaceId/reservations returns list
- [ ] GET /api/v1/residents/:residentId/reservations returns resident's reservations
- [ ] PATCH /api/v1/reservations/:id/cancel cancels reservation
- [ ] GET /api/v1/common-spaces/:spaceId/availability returns available slots

### Security
- [ ] JWT_SECRET missing → app refuses to start
- [ ] Tampered refresh token → 401 Unauthorized
- [ ] Bcrypt rounds = 12 (verify with test)
- [ ] 6th login attempt in 60s → 429 Too Many Requests
- [ ] Logout → access token blacklisted → subsequent requests rejected
- [ ] Login success event logged
- [ ] Login failure event logged
- [ ] Swagger disabled in production (NODE_ENV=production)
- [ ] CORS_ORIGIN=* generates warning in production

### Test Coverage
- [ ] npm run test:cov shows ≥ 70% global coverage
- [ ] Auth service shows 100% coverage
- [ ] All new modules (payments, common-spaces, reservations) have service + controller specs
- [ ] Condominiums, Buildings, Units have service + controller specs
- [ ] Guards (MinRoleGuard, JwtAuthGuard) have specs

---

## Frontend Validation

### Payments Module
- [ ] Payment list loads with pagination
- [ ] Payment form creates new payment
- [ ] Payment form edits existing payment
- [ ] Amount validation: rejects 0 or negative
- [ ] Period format validation works
- [ ] Payment detail shows all fields with formatting
- [ ] "Mark as Paid" button updates status
- [ ] Status chips show correct colors
- [ ] Error handling: API failure shows snackbar

### Dashboard
- [ ] "Pagos Pendientes" card shows real count (not "Proximamente")
- [ ] "Pagos del Mes" card shows real sum (not "Proximamente")
- [ ] Cards degrade gracefully if payment API unavailable

### Common Spaces & Reservations
- [ ] Space list groups by building (tabs)
- [ ] Space detail shows all properties
- [ ] Reservation dialog uses current logged-in resident (not hardcoded)
- [ ] Reservation availability check works against real API
- [ ] Reservation calendar shows real data

### Cross-Cutting
- [ ] AuthService uses Angular Signals (not BehaviorSubject)
- [ ] Label constants centralized (no duplicates)
- [ ] All interactive elements have ARIA labels
- [ ] Dialogs have keyboard navigation
- [ ] All code in English (Spanish only in UI text)

---

## Infrastructure Validation

### CI/CD
- [ ] API CI workflow runs on PR to development
- [ ] Web CI workflow runs on PR to development
- [ ] Coverage gate (70%) enforced in API CI
- [ ] Docker images build successfully
- [ ] Old web CI workflow removed

### Production Readiness
- [ ] .env.production.example has all required vars
- [ ] No default secrets in any config
- [ ] Backup script works (pg_dump + retention)
- [ ] docker-compose.prod.yml starts all services
- [ ] Health check endpoint responds at /api/health

---

## Documentation Validation

- [ ] Swagger shows all 9 module endpoints
- [ ] README reflects current module status
- [ ] CLAUDE.md updated with new services/modules
- [ ] Deployment guide covers full production setup
- [ ] agents/README.md accurate
