# Sprint Plan — MVP Completion

## Overview

| Sprint | Semanas | Martin (Backend/Infra) | Carlos (Frontend) | Horas Total |
|--------|---------|------------------------|-------------------|-------------|
| S1 | 1-2 | 006, 007, 008 | 016, 014 (UI) | ~38.5h |
| S2 | 3-4 | 009, 010, 011 | 014 (integr), 015 | ~43h |
| S3 | 5-6 | 012, 013 | 017, 018 | ~21h |
| **Total** | | **~61.5h** | **~31h** | **~92.5h** |

---

## Sprint 1 (Semanas 1-2): Core Modules + Security + Frontend Quality

### Martin — 23.5h

| Orden | Feature | Horas | Prioridad | Notas |
|-------|---------|-------|-----------|-------|
| 1 | `006-payments-backend` | 8h | P0 | Critico — desbloquea frontend pagos y dashboard |
| 2 | `007-common-spaces-backend` | 6h | P1 | Desbloquea reservations y frontend spaces |
| 3 | `008-security-hardening` | 9.5h | P0/P1 | OWASP fixes — puede hacerse en paralelo con 006/007 |

**Workflow sugerido**:
```
Dia 1-2: /speckit.specify + /speckit.plan para 006-payments-backend
Dia 2-4: /speckit.implement 006-payments-backend → PR → merge
Dia 4-5: /speckit.specify + /speckit.implement 007-common-spaces-backend → PR → merge
Dia 5-7: /speckit.specify + /speckit.implement 008-security-hardening → PR → merge
```

### Carlos — 15h

| Orden | Feature | Horas | Prioridad | Notas |
|-------|---------|-------|-----------|-------|
| 1 | `016-frontend-quality` | 5h | P3 | Sin dependencias — empezar inmediato |
| 2 | `014-payments-frontend` (UI) | 10h | P1 | Preparar forms y components. Integracion espera `006` |

**Workflow sugerido**:
```
Dia 1-3: /speckit.specify + /speckit.implement 016-frontend-quality (Signals migration)
Dia 3-7: /speckit.specify + /speckit.implement 014-payments-frontend
         → Construir PaymentFormComponent y PaymentDetailComponent
         → Cuando Martin mergee 006: conectar PaymentService a endpoints reales
         → Integrar dashboard con datos reales
```

**Punto de sincronizacion**: Cuando Martin mergea `006`, Carlos hace pull y finaliza integracion de `014`.

---

## Sprint 2 (Semanas 3-4): Reservations + Tests + Frontend Integration

### Martin — 25h

| Orden | Feature | Horas | Prioridad | Notas |
|-------|---------|-------|-----------|-------|
| 1 | `009-reservations-backend` | 10h | P2 | Depende de 007 (ya mergeado en S1) |
| 2 | `010-missing-backend-tests` | 11h | P1 | Independiente — puede ser paralelo |
| 3 | `011-database-migrations` | 4h | P2 | Verificar/crear migraciones post-modules |

**Workflow sugerido**:
```
Dia 1-4: /speckit.implement 009-reservations-backend → PR → merge
Dia 4-7: /speckit.implement 010-missing-backend-tests → PR → merge
Dia 7-8: /speckit.implement 011-database-migrations → PR → merge
```

### Carlos — 18h

| Orden | Feature | Horas | Prioridad | Notas |
|-------|---------|-------|-----------|-------|
| 1 | `014-payments-frontend` (final) | — | P1 | Finalizar integracion si quedo pendiente de S1 |
| 2 | `015-spaces-frontend-fix` | 8h | P2 | Espera `007` + `009` mergeados |

**Workflow sugerido**:
```
Dia 1-2: Finalizar 014-payments-frontend si quedo pendiente
Dia 2-3: Esperar merge de 009-reservations-backend
Dia 3-7: /speckit.implement 015-spaces-frontend-fix → PR → merge
```

**Punto de sincronizacion**: Cuando Martin mergea `009`, Carlos empieza `015` completo.

---

## Sprint 3 (Semanas 5-6): CI/CD + Polish

### Martin — 13h

| Orden | Feature | Horas | Prioridad | Notas |
|-------|---------|-------|-----------|-------|
| 1 | `012-cicd-pipeline` | 10h | P3 | GitHub Actions para API, Web, Docker |
| 2 | `013-documentation` | 3h | P4 | Swagger, README, deploy guide |

### Carlos — 8h

| Orden | Feature | Horas | Prioridad | Notas |
|-------|---------|-------|-----------|-------|
| 1 | `017-accessibility` | 4h | P3 | Audit axe/pa11y + fixes |
| 2 | `018-frontend-tests` | 4h | P3 | Vitest specs para components/services |

---

## Checklist de cierre por sprint

### Sprint 1 Checklist
- [ ] `006-payments-backend` mergeado en development
- [ ] `007-common-spaces-backend` mergeado en development
- [ ] `008-security-hardening` mergeado en development
- [ ] `016-frontend-quality` mergeado en development
- [ ] `014-payments-frontend` PR creado (puede estar en review)
- [ ] `npm test` pasa en development (0 regressions)
- [ ] Coverage >= 70%

### Sprint 2 Checklist
- [ ] `009-reservations-backend` mergeado en development
- [ ] `010-missing-backend-tests` mergeado en development
- [ ] `011-database-migrations` mergeado en development
- [ ] `014-payments-frontend` mergeado en development
- [ ] `015-spaces-frontend-fix` mergeado en development
- [ ] `npm test` pasa en development
- [ ] Dashboard muestra datos reales de pagos
- [ ] Espacios comunes y reservas funcionan end-to-end

### Sprint 3 Checklist
- [ ] `012-cicd-pipeline` mergeado — CI corre en PRs
- [ ] `013-documentation` mergeado — Swagger completo
- [ ] `017-accessibility` mergeado — WCAG 2.1 AA compliance
- [ ] `018-frontend-tests` mergeado — Frontend coverage >= 70%
- [ ] **MVP Feature Complete** — Todos los modulos funcionales
- [ ] Release candidate: crear branch `release/v1.0.0` desde development

---

## Metricas de exito MVP

| Metrica | Target | Actual |
|---------|--------|--------|
| Modulos backend completos | 9/9 | 6/9 |
| Modulos frontend completos | 6/6 | 4/6 (pagos stub, spaces sin backend) |
| Cobertura tests backend | >= 70% | ~45% estimado |
| Cobertura tests frontend | >= 70% | ~0% |
| Security score OWASP | 10/10 | 6/10 |
| CI/CD pipeline | Funcionando | No existe |
| Documentacion | Completa | Parcial |
