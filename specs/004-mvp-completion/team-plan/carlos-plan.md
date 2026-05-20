# Plan de Carlos (@Compuelec) — Frontend, UX, Accessibility

## Resumen

| # | Feature ID | Descripcion | WP | Esfuerzo | Sprint | Dependencia |
|---|-----------|-------------|-----|----------|--------|-------------|
| 1 | `014-payments-frontend` | Payments frontend completo | WP3.1-3.4 | 10h | S1-S2 | `006-payments-backend` (Martin) |
| 2 | `015-spaces-frontend-fix` | Conectar Spaces/Reservations al backend real | WP4.1-4.3 | 8h | S2 | `007-common-spaces-backend` (Martin) |
| 3 | `016-frontend-quality` | AuthService Signals + centralizar constantes | WP8.1-8.2 | 5h | S2 | Ninguna |
| 4 | `017-accessibility` | Audit a11y + ARIA labels + keyboard nav | WP8.3 | 4h | S3 | Ninguna |
| 5 | `018-frontend-tests` | Tests para components y services frontend | WP4.3 | 4h | S3 | Ninguna |

**Total estimado**: ~31h

---

## Feature 1: `014-payments-frontend` (Sprint 1-2 — P1)

### Contexto — Estado actual
- **PaymentListComponent** (`features/pagos/components/payment-list/`) — ✅ Implementado, tabla funcional
- **PaymentFormComponent** (`features/pagos/components/payment-form/`) — ❌ **STUB** ("En construccion")
- **PaymentDetailComponent** (`features/pagos/components/payment-detail/`) — ❌ **STUB** ("En construccion")
- **PaymentService** (`features/pagos/services/payment.service.ts`) — Existe pero usa endpoint hardcodeado `/payments`
- **Dashboard** — Cards de pagos muestran "Proximamente"

### BLOQUEADO POR: `006-payments-backend` (Martin)

Carlos puede preparar la UI sin el backend, pero la integracion final requiere que los endpoints esten listos.

### Que hacer

#### 1. Corregir PaymentService
- Cambiar URL de `/payments` a `/api/v1/...` (pattern versionado)
- Agregar soporte de paginacion
- Agregar manejo de errores consistente
- Agregar metodos faltantes: `updateStatus()`, filtros por condominium/unit

#### 2. Implementar PaymentFormComponent
- Reactive Form con campos: amount, period, dueDate, paymentMethod, reference, notes
- Validaciones: amount > 0, period formato valido, dueDate futuro
- Selector de unidad (cascading: Building -> Unit)
- Selector de metodo de pago (usar `PaymentMethod` enum de `@condominios/shared`)
- Modo crear y modo editar

#### 3. Implementar PaymentDetailComponent
- Vista detalle con info de pago, estado, historial
- Contexto: unidad, residente asociado
- Boton para cambiar estado (marcar como pagado)
- Boton para anular

#### 4. Integrar Dashboard
- Reemplazar cards "Proximamente" con datos reales de PaymentService
- Mostrar: pagos pendientes (count), total del mes
- Quick actions funcionales: "Registrar pago", "Ver pagos pendientes"

### Archivos a modificar/crear
```
apps/web/src/app/features/pagos/services/payment.service.ts          — FIX
apps/web/src/app/features/pagos/components/payment-form/*.ts          — REWRITE
apps/web/src/app/features/pagos/components/payment-detail/*.ts        — REWRITE
apps/web/src/app/layout/dashboard/dashboard.component.ts              — UPDATE
apps/web/src/app/layout/dashboard/dashboard.component.html            — UPDATE
apps/web/src/app/core/services/dashboard.service.ts                   — UPDATE
```

### Speckit commands
```bash
/speckit.specify Complete Payments frontend module for Angular 21. Fix PaymentService to use versioned API endpoints. Implement PaymentFormComponent with reactive form (amount, period, dueDate, paymentMethod, reference, notes) with validations. Implement PaymentDetailComponent with payment info, status history, unit/resident context. Integrate dashboard payment cards with real data from PaymentService. Use Angular Signals, Material 21, standalone components.
```

---

## Feature 2: `015-spaces-frontend-fix` (Sprint 2 — P2)

### Contexto — Estado actual
- **SpaceListComponent** — ✅ Completamente implementado
- **SpaceDetailComponent** — ✅ Completamente implementado
- **ReservationDialogComponent** — ✅ Completamente implementado
- **ReservationCalendarComponent** — ✅ Completamente implementado
- **CommonSpaceService** (`core/services/common-space.service.ts`) — ⚠️ Funcional pero usa mock paths
- **ReservationService** (`core/services/reservation.service.ts`) — ⚠️ Tiene datos hardcodeados (nombre residente, unidad)

### BLOQUEADO POR: `007-common-spaces-backend` + `009-reservations-backend` (Martin)

### Que hacer

#### 1. Corregir CommonSpaceService
- Cambiar URL de `/commonSpaces` a `/api/v1/buildings/:buildingId/common-spaces`
- Agregar paginacion
- Agregar scoping por condominium

#### 2. Corregir ReservationService
- Remover datos hardcodeados ('Juan Perez Garcia', unit '101')
- Integrar con AuthService para obtener residente logueado
- Conectar a endpoints reales de reservations

#### 3. Tests frontend para Spaces & Reservations
- `SpaceListComponent.spec.ts`
- `SpaceDetailComponent.spec.ts`
- `ReservationDialogComponent.spec.ts`
- `ReservationCalendarComponent.spec.ts`

### Speckit commands
```bash
/speckit.specify Fix Common Spaces and Reservations frontend services to use real backend API endpoints. Update CommonSpaceService URL to versioned API pattern with building scoping. Remove hardcoded resident data from ReservationService, integrate with AuthService for logged-in user context. Add Vitest specs for all 4 components.
```

---

## Feature 3: `016-frontend-quality` (Sprint 2 — P3)

### Contexto
- **AuthService** es el unico service que usa `BehaviorSubject` — todos los demas usan RxJS Observables
- CLAUDE.md dice: "Angular Signals preferred over BehaviorSubjects"
- Dashboard ya usa Signals correctamente — es el patron a seguir
- Labels/opciones repetidas en multiples componentes

### Que hacer

#### 1. Migrar AuthService a Signals
- Reemplazar `BehaviorSubject<AuthState>` por `signal<AuthState>`
- Usar `computed()` para derivados (isAuthenticated, currentUser, selectedCondominio)
- Mantener API publica compatible o migrar consumidores
- **Archivo**: `apps/web/src/app/core/services/auth.service.ts`

#### 2. Centralizar constantes UI
- Crear `apps/web/src/app/core/constants/labels.ts`
- Mover todos los enum-to-label mappings (DocumentType labels, UnitType labels, etc.)
- Reemplazar duplicados en componentes

### Speckit commands
```bash
/speckit.specify Frontend quality improvements. Migrate AuthService from BehaviorSubject to Angular Signals (signal/computed pattern). Create centralized labels.ts with all enum-to-label mappings to eliminate duplication across components. Follow DashboardComponent as reference for Signals pattern.
```

---

## Feature 4: `017-accessibility` (Sprint 3 — P3)

### Que hacer
- Ejecutar auditoria con axe/pa11y en todas las paginas
- Agregar ARIA labels a todos los elementos interactivos
- Verificar keyboard navigation en formularios y tablas
- Verificar contraste de colores
- Agregar `role` attributes donde falten
- Skip-to-content link

### Speckit commands
```bash
/speckit.specify Accessibility audit and fixes for Angular 21 frontend. Run axe/pa11y audit on all pages. Add ARIA labels to interactive elements, ensure keyboard navigation works on forms/tables/dialogs, verify color contrast ratios meet WCAG 2.1 AA, add skip-to-content link, add role attributes.
```

---

## Feature 5: `018-frontend-tests` (Sprint 3 — P3)

### Tests faltantes (Vitest)
```
apps/web/src/app/features/pagos/components/payment-list/payment-list.component.spec.ts
apps/web/src/app/features/pagos/components/payment-form/payment-form.component.spec.ts
apps/web/src/app/features/pagos/components/payment-detail/payment-detail.component.spec.ts
apps/web/src/app/features/pagos/services/payment.service.spec.ts
apps/web/src/app/core/services/auth.service.spec.ts
apps/web/src/app/core/services/dashboard.service.spec.ts
```

### Speckit commands
```bash
/speckit.specify Add Vitest unit tests for frontend services and components. Cover PaymentService, AuthService, DashboardService. Cover PaymentListComponent, PaymentFormComponent, PaymentDetailComponent. Use vi.fn() for mocks, test happy paths and error cases. Follow Angular 21 testing patterns with standalone components.
```

---

## Notas para Carlos

### Patrones a seguir
- **Signals**: Usar `signal()`, `computed()`, `effect()` — ver `dashboard.component.ts` como referencia
- **Standalone**: Todos los componentes son standalone (no modules)
- **Material 21**: Usar Angular Material 21 components
- **Services**: HttpClient con RxJS operators (map, catchError, etc.)
- **Tests**: Vitest con `vi.fn()` (NO `jest.fn()`)
- **Idioma**: Todo el codigo en ingles, solo labels de UI en espanol

### Que puede hacer sin esperar a Martin
- `016-frontend-quality` — No depende de nada backend
- `017-accessibility` — No depende de nada backend
- `018-frontend-tests` — Tests de componentes existentes
- `014-payments-frontend` — Puede preparar forms/UI, solo la integracion final necesita backend

### Comando para ejecutar tests frontend
```bash
npx ng test --no-watch
```
