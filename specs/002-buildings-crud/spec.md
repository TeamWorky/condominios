# Feature Specification: CRUD de Edificios en Frontend

**Feature Branch**: `002-buildings-crud`
**Created**: 2026-03-18
**Status**: Draft
**Input**: User description: "CRUD completo de edificios en el frontend Angular. Actualmente los edificios solo se gestionan via API/seeders. Se necesita poder agregar edificios y asociarlos a unidades del condominio."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Listar edificios del condominio (Priority: P1)

El administrador accede a la seccion "Edificios" desde el menu lateral y ve una tabla paginada con todos los edificios del condominio seleccionado. La tabla muestra nombre, codigo, pisos, direccion y estado activo/inactivo.

**Why this priority**: Sin la lista, no hay punto de entrada para gestionar edificios. Es el MVP minimo.

**Independent Test**: Login como admin, seleccionar condominio, navegar a /edificios y verificar que la tabla muestra los edificios existentes con paginacion.

**Acceptance Scenarios**:

1. **Given** un admin logueado con condominio seleccionado, **When** navega a /edificios, **Then** ve una tabla con los edificios del condominio, paginada
2. **Given** un condominio sin edificios, **When** el admin navega a /edificios, **Then** ve un mensaje "No hay edificios registrados" con boton para crear uno
3. **Given** la tabla de edificios, **When** el admin cambia de pagina, **Then** la tabla muestra los edificios correspondientes a esa pagina

---

### User Story 2 - Crear nuevo edificio (Priority: P1)

El administrador puede crear un nuevo edificio completando un formulario con los campos: nombre, codigo, pisos, subsuelos, tiene ascensor, direccion. El edificio se asocia automaticamente al condominio seleccionado.

**Why this priority**: Es la funcionalidad principal solicitada — poder agregar edificios desde el frontend.

**Independent Test**: Desde la lista de edificios, click en "Nuevo Edificio", completar formulario, guardar y verificar que aparece en la lista.

**Acceptance Scenarios**:

1. **Given** el admin en la lista de edificios, **When** hace click en "Nuevo Edificio", **Then** se muestra un formulario con los campos requeridos
2. **Given** el formulario de edificio, **When** completa todos los campos obligatorios y guarda, **Then** el edificio se crea y se redirige a la lista con mensaje de exito
3. **Given** el formulario, **When** intenta guardar sin campos obligatorios, **Then** se muestran errores de validacion en los campos correspondientes
4. **Given** el formulario, **When** ingresa un codigo duplicado, **Then** se muestra error "Ya existe un edificio con ese codigo en este condominio"

---

### User Story 3 - Editar edificio existente (Priority: P2)

El administrador puede editar los datos de un edificio existente desde la lista o desde el detalle.

**Why this priority**: Complementa la creacion, pero no es critico para el MVP inicial.

**Independent Test**: Desde la lista, click en editar un edificio, modificar un campo, guardar y verificar que los cambios se reflejan.

**Acceptance Scenarios**:

1. **Given** la lista de edificios, **When** el admin hace click en editar un edificio, **Then** se muestra el formulario pre-cargado con los datos actuales
2. **Given** el formulario de edicion, **When** modifica campos y guarda, **Then** los cambios se persisten y se redirige a la lista con mensaje de exito
3. **Given** el formulario de edicion, **When** cambia el codigo a uno ya existente, **Then** se muestra error de duplicado

---

### User Story 4 - Ver detalle de edificio con unidades (Priority: P2)

El administrador puede ver el detalle de un edificio, incluyendo la lista de unidades asociadas a ese edificio.

**Why this priority**: Agrega valor al permitir ver la relacion edificio-unidades, pero no bloquea la gestion basica.

**Independent Test**: Desde la lista, click en un edificio, verificar que se muestran los datos completos y las unidades asociadas.

**Acceptance Scenarios**:

1. **Given** la lista de edificios, **When** el admin hace click en el nombre de un edificio, **Then** se muestra la vista de detalle con todos los campos
2. **Given** el detalle de un edificio, **Then** se muestra una lista de unidades asociadas al edificio
3. **Given** un edificio sin unidades, **Then** se muestra mensaje "Este edificio no tiene unidades registradas"

---

### User Story 5 - Desactivar/Activar edificio (Priority: P3)

El administrador puede desactivar un edificio (marcarlo como inactivo) o reactivarlo. No se permite eliminar edificios ya que fisicamente no se puede eliminar un edificio.

**Why this priority**: Menos frecuente que crear/editar. La desactivacion es suficiente para "retirar" un edificio.

**Independent Test**: Desde la lista, click en desactivar un edificio, confirmar y verificar que cambia su estado a inactivo.

**Acceptance Scenarios**:

1. **Given** la lista de edificios con un edificio activo, **When** el admin hace click en desactivar, **Then** se muestra un dialogo de confirmacion
2. **Given** el dialogo de confirmacion, **When** confirma, **Then** el edificio cambia a inactivo y se refleja en la tabla
3. **Given** un edificio inactivo, **When** el admin hace click en activar, **Then** el edificio vuelve a estado activo

---

### Edge Cases

- Que pasa si el backend devuelve error 409 (codigo duplicado) al crear/editar?
- Que pasa si el condominio seleccionado cambia mientras se esta editando un edificio?
- Que pasa si se pierde la conexion durante una operacion CRUD?

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: El sistema DEBE mostrar un enlace "Edificios" en el menu lateral de navegacion con icono apropiado
- **FR-002**: El sistema DEBE registrar la ruta /edificios en el router con lazy loading
- **FR-003**: El sistema DEBE mostrar una tabla paginada de edificios del condominio seleccionado con columnas: nombre, codigo, pisos, direccion, estado
- **FR-004**: El sistema DEBE permitir crear un edificio con campos: nombre (obligatorio), codigo (obligatorio), pisos (default 1), subsuelos (default 0), ascensor (default no), direccion (opcional)
- **FR-005**: El sistema DEBE validar que el codigo sea unico por condominio, mostrando error claro si hay duplicado
- **FR-006**: El sistema DEBE permitir editar todos los campos de un edificio excepto el condominio al que pertenece
- **FR-007**: El sistema DEBE mostrar una vista de detalle del edificio con sus unidades asociadas
- **FR-008**: El sistema DEBE permitir desactivar/activar un edificio con dialogo de confirmacion previo (no se permite eliminar edificios)
- **FR-009**: El sistema DEBE mostrar mensajes de exito/error despues de cada operacion (snackbar)
- **FR-010**: El sistema DEBE corregir el modelo IBuilding del frontend para que coincida con la entidad del backend (code, floors, undergroundFloors, hasElevator, condominiumId)
- **FR-011**: El sistema DEBE corregir la URL del metodo createBuilding en BuildingService para usar /condominiums/:condoId/buildings
- **FR-012**: El formulario DEBE usar Angular Reactive Forms con validaciones sincronas

### Key Entities

- **Building**: Edificio dentro de un condominio. Atributos: id, name, code (unico por condominio), floors, undergroundFloors, hasElevator, address, isActive, condominiumId. Relacion 1:N con Unit.
- **Unit**: Unidad habitacional dentro de un edificio. Se muestra como lista en el detalle del edificio (solo lectura, no se gestiona desde este modulo).

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: El administrador puede crear un edificio completando el formulario en menos de 1 minuto
- **SC-002**: La tabla de edificios carga y muestra datos en menos de 2 segundos
- **SC-003**: El 100% de las operaciones CRUD funcionan correctamente contra la API existente
- **SC-004**: Las validaciones de formulario previenen el 100% de envios con datos invalidos
- **SC-005**: Todos los tests unitarios del modulo pasan (componentes y servicio)

## Assumptions

- El backend ya tiene los 5 endpoints CRUD completamente funcionales (buildings controller)
- El administrador tiene rol ADMIN o SUPER_ADMIN (requerido por el backend para crear/editar/eliminar)
- La eliminacion es soft delete (el backend ya maneja esto)
- No se requiere gestion de unidades desde este modulo (solo visualizacion en detalle)
- Se reutiliza el patron de componentes existente en el proyecto (standalone components, Angular Material, signals)

## Out of Scope

- Crear/editar/eliminar unidades desde la vista de edificios
- Exportar lista de edificios a CSV/Excel
- Busqueda y filtros avanzados en la tabla (se puede agregar como mejora futura)
- Gestion de espacios comunes asociados al edificio
