# Dependency Graph — MVP Features

## Diagrama de dependencias

```
                    ┌─────────────────────┐
                    │   development       │
                    │   (base branch)     │
                    └─────────┬───────────┘
                              │
          ┌───────────────────┼───────────────────┐
          │                   │                   │
          ▼                   ▼                   ▼
  ┌───────────────┐  ┌───────────────┐   ┌───────────────┐
  │ 006-payments  │  │ 007-common    │   │ 008-security  │
  │ -backend      │  │ -spaces-back  │   │ -hardening    │
  │ (Martin)      │  │ (Martin)      │   │ (Martin)      │
  │ P0 - 8h       │  │ P1 - 6h       │   │ P0/P1 - 9.5h  │
  └───────┬───────┘  └───────┬───────┘   └───────────────┘
          │                   │
          │                   │
          ▼                   ▼
  ┌───────────────┐  ┌───────────────┐   ┌───────────────┐
  │ 014-payments  │  │ 009-reserva   │   │ 016-frontend  │
  │ -frontend     │  │ -tions-back   │   │ -quality      │
  │ (Carlos)      │  │ (Martin)      │   │ (Carlos)      │
  │ P1 - 10h      │  │ P2 - 10h      │   │ P3 - 5h       │
  └───────────────┘  └───────┬───────┘   └───────────────┘
                              │
                              ▼
                     ┌───────────────┐   ┌───────────────┐
                     │ 015-spaces    │   │ 010-missing   │
                     │ -frontend-fix │   │ -backend-tests│
                     │ (Carlos)      │   │ (Martin)      │
                     │ P2 - 8h       │   │ P1 - 11h      │
                     └───────────────┘   └───────────────┘

          ┌───────────────┐  ┌───────────────┐   ┌───────────────┐
          │ 011-database  │  │ 017-a11y      │   │ 018-frontend  │
          │ -migrations   │  │               │   │ -tests        │
          │ (Martin)      │  │ (Carlos)      │   │ (Carlos)      │
          │ P2 - 4h       │  │ P3 - 4h       │   │ P3 - 4h       │
          └───────────────┘  └───────────────┘   └───────────────┘

                     ┌───────────────┐  ┌───────────────┐
                     │ 012-cicd      │  │ 013-docs      │
                     │ -pipeline     │  │               │
                     │ (Martin)      │  │ (Martin)      │
                     │ P3 - 10h      │  │ P4 - 3h       │
                     └───────────────┘  └───────────────┘
```

## Tabla de dependencias

| Feature | Depende de | Bloquea a |
|---------|-----------|-----------|
| `006-payments-backend` | — | `014-payments-frontend`, `011-database-migrations` |
| `007-common-spaces-backend` | — | `009-reservations-backend`, `015-spaces-frontend-fix`, `011-database-migrations` |
| `008-security-hardening` | — | — |
| `009-reservations-backend` | `007` | `015-spaces-frontend-fix`, `011-database-migrations` |
| `010-missing-backend-tests` | — | — |
| `011-database-migrations` | `006`, `007`, `009` | — |
| `012-cicd-pipeline` | — | — |
| `013-documentation` | Todos (ultimo) | — |
| `014-payments-frontend` | `006` | — |
| `015-spaces-frontend-fix` | `007`, `009` | — |
| `016-frontend-quality` | — | — |
| `017-accessibility` | — | — |
| `018-frontend-tests` | — | — |

## Trabajo paralelo posible

### Sprint 1 — Maximo paralelismo
```
Martin: 006-payments-backend ──────────> 007-common-spaces-backend ──────────> 008-security-hardening
Carlos: 016-frontend-quality ──────────> 014-payments-frontend (UI sin backend) ──> (espera merge 006)
```

### Sprint 2 — Con dependencias
```
Martin: 009-reservations-backend ──────> 010-missing-backend-tests ──────> 011-database-migrations
Carlos: 014-payments-frontend (integr) > 015-spaces-frontend-fix ────────> (espera merge 007+009)
```

### Sprint 3 — Independiente
```
Martin: 012-cicd-pipeline ─────────────> 013-documentation
Carlos: 017-accessibility ─────────────> 018-frontend-tests
```

## Puntos de sincronizacion

| Momento | Evento | Accion |
|---------|--------|--------|
| Martin mergea `006` | Carlos desbloquea `014` integracion | Carlos hace `git pull origin development` y conecta PaymentService |
| Martin mergea `007` | Carlos puede empezar `015` parcialmente | Conectar CommonSpaceService |
| Martin mergea `009` | Carlos desbloquea `015` completamente | Conectar ReservationService |
| Ambos terminan S2 | Merge checkpoint | Verificar `npm test` y `npm run lint` en development |
