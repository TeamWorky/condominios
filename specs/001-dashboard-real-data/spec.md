# Feature Specification: Dashboard con Datos Reales

**Feature Branch**: `001-dashboard-real-data`
**Created**: 2026-03-18
**Status**: Draft
**Input**: User description: "Conectar el dashboard del frontend Angular con datos reales del backend API, reemplazando los datos mock/estaticos por llamadas a los endpoints existentes del backend NestJS. El dashboard debe mostrar estadisticas reales de condominios, edificios, unidades, residentes y pagos."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Ver resumen general del condominio (Priority: P1)

Como administrador de un condominio, quiero ver en el dashboard un resumen con datos reales de mi condominio (total de residentes, unidades ocupadas, edificios) para tener visibilidad inmediata del estado de mi comunidad al iniciar sesion.

**Why this priority**: Es la funcionalidad central del dashboard. Sin datos reales, el dashboard no tiene valor. Los endpoints de residentes, unidades y edificios ya existen en el backend.

**Independent Test**: Puede probarse iniciando sesion como administrador y verificando que los numeros del dashboard coinciden con los datos reales en la base de datos.

**Acceptance Scenarios**:

1. **Given** un administrador autenticado con un condominio seleccionado, **When** accede al dashboard, **Then** ve el total real de residentes activos de su condominio
2. **Given** un administrador autenticado, **When** accede al dashboard, **Then** ve el porcentaje real de unidades ocupadas respecto al total
3. **Given** un administrador autenticado, **When** accede al dashboard, **Then** ve el total de edificios de su condominio
4. **Given** un condominio sin datos (recien creado), **When** el administrador accede al dashboard, **Then** ve los contadores en cero con un mensaje indicando que no hay datos aun
5. **Given** un administrador autenticado, **When** los datos estan cargando, **Then** ve indicadores de carga (skeleton/spinner) en lugar de datos vacios o erroneos

---

### User Story 2 - Ver actividad reciente de pagos (Priority: P2)

Como administrador, quiero ver los pagos mas recientes en el dashboard para monitorear rapidamente la actividad financiera sin navegar a la seccion de pagos.

**Why this priority**: Los pagos son criticos para la operacion del condominio, pero el backend de pagos aun no esta implementado. Esta historia depende de que exista al menos un endpoint de listado de pagos.

**Independent Test**: Puede probarse verificando que los pagos mostrados en el dashboard corresponden a los ultimos pagos registrados en el sistema.

**Acceptance Scenarios**:

1. **Given** un condominio con pagos registrados, **When** el administrador accede al dashboard, **Then** ve los 5 pagos mas recientes con nombre del residente, unidad, monto y estado
2. **Given** un condominio sin pagos, **When** el administrador accede al dashboard, **Then** ve un mensaje indicando que no hay pagos registrados
3. **Given** pagos con diferentes estados (pagado, pendiente, vencido), **When** se muestran en el dashboard, **Then** cada estado tiene un indicador visual distinto (color o icono)

---

### User Story 3 - Navegacion rapida desde el dashboard (Priority: P3)

Como administrador, quiero que las acciones rapidas del dashboard me lleven a las secciones correctas con datos reales para poder gestionar mi condominio eficientemente.

**Why this priority**: Mejora la experiencia del usuario pero no agrega datos nuevos. Las rutas ya existen en el frontend.

**Independent Test**: Puede probarse haciendo clic en cada accion rapida y verificando que navega a la seccion correcta.

**Acceptance Scenarios**:

1. **Given** un administrador en el dashboard, **When** hace clic en "Ver residentes", **Then** navega a la lista de residentes con datos reales del condominio seleccionado
2. **Given** un administrador en el dashboard, **When** hace clic en una tarjeta de resumen (ej: "Total Residentes"), **Then** navega a la seccion correspondiente

---

### Edge Cases

- Que pasa si el usuario no tiene un condominio seleccionado al acceder al dashboard? El sistema debe redirigir a la seleccion de condominio.
- Que pasa si el backend no responde o hay un error de red? El dashboard debe mostrar un estado de error con opcion de reintentar.
- Que pasa si el token JWT expira mientras el usuario esta en el dashboard? El sistema debe refrescar el token automaticamente o redirigir al login.
- Que pasa si el condominio tiene miles de residentes/unidades? Los contadores deben funcionar correctamente sin desbordar el layout.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: El dashboard DEBE obtener y mostrar el conteo real de residentes activos del condominio seleccionado
- **FR-002**: El dashboard DEBE obtener y mostrar el porcentaje real de unidades ocupadas del condominio seleccionado
- **FR-003**: El dashboard DEBE obtener y mostrar el conteo real de edificios del condominio seleccionado
- **FR-004**: El dashboard DEBE mostrar indicadores de carga mientras se obtienen los datos del backend
- **FR-005**: El dashboard DEBE mostrar un estado vacio apropiado cuando no hay datos disponibles
- **FR-006**: El dashboard DEBE mostrar un estado de error con opcion de reintentar cuando falla la comunicacion con el backend
- **FR-007**: El dashboard DEBE actualizar los datos automaticamente cada vez que el usuario navega de vuelta a la pantalla
- **FR-008**: Los servicios del frontend DEBEN conectarse a los endpoints reales del backend usando el prefijo `/api/v1` y autenticacion JWT
- **FR-009**: El dashboard DEBE funcionar exclusivamente con datos del backend, eliminando toda dependencia de datos mock o estaticos
- **FR-010**: Los pagos recientes DEBEN mostrarse cuando el endpoint de pagos este disponible, o mostrar un mensaje de "proximamente" si el modulo de pagos no esta implementado aun

### Key Entities

- **Condominium**: Contexto principal del dashboard. Todos los datos se filtran por el condominio seleccionado en el JWT.
- **Building**: Unidad organizativa dentro del condominio. Se muestra el conteo total.
- **Unit**: Unidad habitacional dentro de un edificio. Se muestra porcentaje de ocupacion (ocupadas vs total).
- **Resident**: Habitante de una unidad. Se muestra el conteo total de residentes activos.
- **Payment**: Transaccion financiera asociada a una unidad. Se muestran los pagos mas recientes.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: El dashboard muestra datos reales dentro de los 3 segundos posteriores a la carga de la pagina
- **SC-002**: El 100% de los datos visibles en el dashboard provienen del backend (cero datos hardcodeados o mock)
- **SC-003**: El dashboard maneja correctamente escenarios sin datos, mostrando estados vacios apropiados
- **SC-004**: El dashboard muestra estados de error comprensibles cuando el backend no esta disponible, con opcion de reintentar
- **SC-005**: Los administradores pueden ver el estado real de su condominio sin necesidad de navegar a secciones individuales

## Assumptions

- Los endpoints de condominios, edificios, unidades y residentes ya estan implementados y funcionales en el backend
- El flujo de autenticacion (login + seleccion de condominio) ya funciona y el JWT contiene el `condominiumId`
- El modulo de pagos puede no estar completamente implementado en el backend; el dashboard debe manejar esta ausencia de forma elegante
- Los datos se obtendran usando los endpoints de listado existentes; si en el futuro se agregan endpoints de estadisticas/resumen dedicados, el dashboard podra migrar a ellos
- El dashboard esta destinado a usuarios con rol ADMIN o superior que ya tienen un condominio seleccionado

## Scope Boundaries

### In Scope
- Reemplazar datos hardcodeados por llamadas a endpoints reales
- Actualizar servicios del frontend para usar las URLs correctas del backend (`/api/v1/...`)
- Agregar estados de carga, error y vacio al dashboard
- Mostrar resumen de residentes, unidades y edificios

### Out of Scope
- Implementacion de nuevos endpoints en el backend (se usan los existentes)
- Graficos o visualizaciones avanzadas de estadisticas
- Datos en tiempo real (WebSockets)
- Implementacion del CRUD de pagos en el backend
- Dashboard personalizable por el usuario
