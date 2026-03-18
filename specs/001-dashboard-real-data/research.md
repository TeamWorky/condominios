# Research: Dashboard con Datos Reales

**Branch**: `001-dashboard-real-data` | **Date**: 2026-03-18

## R1: Endpoints Disponibles para el Dashboard

**Decision**: Usar los endpoints de listado existentes para calcular estadisticas en el frontend.

**Rationale**: Los endpoints ya devuelven datos paginados con total count. Podemos usar `limit=1` para obtener solo el total sin cargar datos innecesarios, o usar un limite alto si necesitamos los datos completos.

**Endpoints confirmados**:
- `GET /api/v1/condominiums/:condoId/buildings?page=1&limit=1` → total de edificios
- `GET /api/v1/condominiums/:condoId/units?page=1&limit=1` → total de unidades (con meta.total)
- `GET /api/v1/units/:unitId/residents?page=1&limit=1` → residentes por unidad

**Problema identificado**: No hay un endpoint para obtener TODOS los residentes de un condominio directamente. Los residentes estan anidados bajo unidades (`/units/:unitId/residents`). Para obtener el total de residentes habria que iterar por cada unidad.

**Alternativa recomendada**: Crear un servicio en el frontend (DashboardService) que haga llamadas paralelas a buildings y units, y calcule las estadisticas desde los meta.total de las respuestas paginadas. Para residentes, se necesitara una solucion diferente (ver R2).

**Alternatives considered**:
- Crear endpoints dedicados de estadisticas en el backend → Rechazado: fuera del scope de esta feature
- Obtener todos los datos completos → Rechazado: ineficiente para solo mostrar contadores

## R2: Conteo de Residentes sin Endpoint Directo

**Decision**: Obtener el conteo de residentes sumando los totales de cada unidad, o agregando un endpoint simplificado al backend si la cantidad de unidades es alta.

**Rationale**: El endpoint de residentes esta anidado bajo unidades (`/units/:unitId/residents`). No existe un endpoint `/condominiums/:condoId/residents`. Hay dos opciones viables:

1. **Opcion A (recomendada para MVP)**: Obtener todas las unidades del condominio, luego para cada unidad obtener el count de residentes con `limit=1`. Hacer las llamadas en paralelo con `forkJoin`.
2. **Opcion B (mejor a largo plazo)**: Agregar un endpoint `GET /api/v1/condominiums/:condoId/residents` al backend.

**Decision final**: Usar Opcion A para el MVP. La Opcion B se puede agregar como tarea de mejora posterior. Si el condominio tiene muchas unidades (>50), el dashboard mostrara "N/A" o "No disponible" para residentes con un tooltip explicando la limitacion.

**Alternatives considered**:
- Cargar todos los residentes en una sola llamada → No es posible con la API actual
- Hardcodear el conteo → Viola FR-009

## R3: Modulo de Pagos No Implementado

**Decision**: El dashboard mostrara un estado "Proximamente" para la seccion de pagos recientes hasta que el backend implemente el controller de payments.

**Rationale**: La spec define FR-010 que permite manejar la ausencia del modulo de pagos de forma elegante. El frontend ya tiene un PaymentService pero apunta a endpoints que no existen.

**Implementacion**:
- La tarjeta "Pagos Pendientes" mostrara un icono y texto "Proximamente"
- La tarjeta "Pagos del Mes" mostrara "Proximamente"
- La seccion "Pagos Recientes" mostrara un mensaje: "El modulo de pagos esta en desarrollo"
- Cuando el endpoint este disponible, solo sera necesario activar las llamadas en el DashboardService

## R4: Servicio de Residentes Desalineado

**Decision**: Corregir el ResidentService del frontend para que use los endpoints correctos del backend.

**Rationale**: El ResidentService actual apunta a `/residents` directamente, pero el backend espera `/api/v1/units/:unitId/residents`. Esto debe corregirse como parte de esta feature para que el dashboard funcione.

**Cambios necesarios**:
- Actualizar `getResidents()` para requerir `unitId` como parametro
- Actualizar la URL base a `/api/v1/units/{unitId}/residents`
- Agregar metodo `getResidentsByCondominium()` que haga el agregado via unidades

## R5: Patron de Estado en el Dashboard

**Decision**: Usar Angular Signals para el estado del dashboard (loading, error, data).

**Rationale**: El proyecto ya usa Angular 21 y la constitucion recomienda signals sobre BehaviorSubjects. Los signals permiten manejar estados reactivos de forma limpia:
- `loading = signal(true)`
- `error = signal<string | null>(null)`
- `stats = signal<DashboardStats | null>(null)`

**Alternatives considered**:
- BehaviorSubject/Observable → Funcional pero la constitucion prefiere signals
- NgRx Store → Sobre-ingenieria para el scope actual (viola YAGNI)
