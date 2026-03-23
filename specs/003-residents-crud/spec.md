# Feature Specification: CRUD de Residentes en Frontend

**Feature Branch**: `003-residents-crud`
**Created**: 2026-03-23
**Status**: Draft
**Input**: User description: "CRUD completo de residentes gestionado por admin. Los residentes son la entidad principal con datos personales propios (nombre, cedula, email, telefono). Opcionalmente pueden tener un User vinculado para acceso al sistema. El backend ya tiene 5 endpoints funcionando pero necesita modificarse para agregar campos de persona. El frontend tiene componentes placeholder que necesitan implementacion completa."

## Clarifications

### Session 2026-03-23

- Q: Un mismo usuario puede ser residente en multiples unidades? → A: No — un residente solo puede estar asignado a una unidad a la vez. El sistema debe validar unicidad por documentNumber.
- Q: Como se selecciona/busca un residente al crear? → A: Se busca por dato identificatorio (cedula de identidad/documento). El residente es la entidad principal; opcionalmente puede crearsele un User para login.
- Q: Donde se almacenan los datos personales del residente? → A: Directamente en la entidad Resident (firstName, lastName, documentType, documentNumber, email, phone). User es opcional, solo para acceso al sistema.
- Q: Que campos personales son obligatorios? → A: Obligatorios: firstName, lastName, documentType, documentNumber, dateOfBirth. Opcionales: phone, email.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Listar residentes con filtro por edificio y unidad (Priority: P1)

El administrador accede a la seccion "Residentes" desde el menu lateral. Ve selectores en cascada para filtrar: primero elige un edificio, luego una unidad de ese edificio. Al seleccionar una unidad, se muestra una tabla paginada con los residentes de esa unidad mostrando nombre completo, documento, tipo de residente, estado y fecha de ingreso.

**Why this priority**: Sin la lista no hay punto de entrada para gestionar residentes. El filtro por edificio/unidad es esencial porque la API requiere unitId.

**Independent Test**: Login como admin, seleccionar condominio, navegar a /residentes, seleccionar edificio y unidad, verificar que la tabla muestra los residentes de esa unidad con paginacion.

**Acceptance Scenarios**:

1. **Given** un admin logueado con condominio seleccionado, **When** navega a /residentes, **Then** ve selectores de edificio y unidad, y la tabla vacia con mensaje indicando que seleccione una unidad
2. **Given** la pagina de residentes, **When** selecciona un edificio, **Then** el selector de unidad se carga con las unidades de ese edificio
3. **Given** edificio y unidad seleccionados, **When** la unidad tiene residentes, **Then** la tabla muestra nombre completo, documento, tipo, estado y fecha de ingreso
4. **Given** una unidad sin residentes, **When** el admin la selecciona, **Then** ve mensaje "No hay residentes en esta unidad" con boton para agregar uno

---

### User Story 2 - Crear nuevo residente (Priority: P1)

El administrador puede crear un nuevo residente para la unidad seleccionada. El formulario solicita datos personales del residente (nombre, apellido, tipo y numero de documento, telefono, email), tipo de residente, fecha de ingreso, si es residente primario y relacion familiar. El sistema valida que no exista otro residente activo con el mismo numero de documento en otra unidad.

**Why this priority**: Es la funcionalidad principal — poder agregar residentes desde el frontend.

**Independent Test**: Desde la lista de residentes con unidad seleccionada, click en "Nuevo Residente", completar datos personales y de residencia, verificar que aparece en la lista.

**Acceptance Scenarios**:

1. **Given** la lista de residentes con unidad seleccionada, **When** hace click en "Nuevo Residente", **Then** se muestra un formulario con los campos: nombre, apellido, tipo documento, numero documento, fecha nacimiento, telefono (opcional), email (opcional), tipo residente, fecha ingreso, es primario, relacion
2. **Given** el formulario completo con datos validos, **When** guarda, **Then** el residente se crea y se redirige a la lista con mensaje de exito
3. **Given** el formulario, **When** intenta guardar sin campos obligatorios, **Then** se muestran errores de validacion en los campos correspondientes
4. **Given** el formulario, **When** ingresa un numero de documento que ya pertenece a un residente activo en otra unidad, **Then** se muestra error indicando que el residente ya esta asignado a otra unidad

---

### User Story 3 - Editar residente existente (Priority: P2)

El administrador puede editar los datos de un residente existente: datos personales (nombre, apellido, fecha nacimiento, telefono, email), tipo de residente, primario, relacion, fechas de ingreso/salida y estado activo. No se puede cambiar la unidad ni el tipo/numero de documento.

**Why this priority**: Complementa la creacion pero no es critico para el MVP.

**Independent Test**: Desde la lista, click en editar un residente, modificar telefono o tipo de residente, guardar y verificar cambios.

**Acceptance Scenarios**:

1. **Given** la lista de residentes, **When** el admin hace click en editar, **Then** se muestra el formulario pre-cargado con datos actuales
2. **Given** el formulario de edicion, **When** modifica campos y guarda, **Then** los cambios se persisten y se redirige a la lista con mensaje de exito
3. **Given** el formulario de edicion, **Then** los campos de unidad, tipo de documento y numero de documento NO son editables (se muestran como lectura)

---

### User Story 4 - Ver detalle de residente (Priority: P2)

El administrador puede ver el detalle completo de un residente: datos personales (nombre, apellido, documento, fecha nacimiento, telefono, email), datos de residencia (tipo, primario, relacion, fechas), y datos de la unidad donde reside.

**Why this priority**: Agrega valor al mostrar toda la informacion consolidada, pero no bloquea la gestion basica.

**Independent Test**: Desde la lista, click en un residente, verificar que se muestran todos los datos.

**Acceptance Scenarios**:

1. **Given** la lista de residentes, **When** hace click en el nombre de un residente, **Then** se muestra la vista de detalle con datos personales, datos de residencia y datos de la unidad
2. **Given** el detalle, **Then** se muestran botones de editar y volver a la lista

---

### User Story 5 - Desactivar/Activar residente (Priority: P3)

El administrador puede desactivar un residente (marcar como inactivo) o reactivarlo. La desactivacion es preferida sobre la eliminacion. Tambien se puede registrar la fecha de salida al desactivar.

**Why this priority**: Menos frecuente. La desactivacion con fecha de salida cubre el flujo de mudanza.

**Independent Test**: Desde la lista, click en desactivar un residente, confirmar, verificar que cambia su estado.

**Acceptance Scenarios**:

1. **Given** un residente activo en la lista, **When** el admin hace click en desactivar, **Then** se muestra dialogo de confirmacion con opcion de registrar fecha de salida
2. **Given** el dialogo de confirmacion, **When** confirma, **Then** el residente cambia a inactivo (y opcionalmente se registra moveOutDate)
3. **Given** un residente inactivo, **When** el admin hace click en activar, **Then** el residente vuelve a estado activo

---

### Edge Cases

- Un residente solo puede estar activo en una unidad a la vez. Si se intenta crear con un documentNumber ya asignado a otra unidad, el sistema bloquea la operacion con mensaje de error.
- Si se desactiva el ultimo residente primario de una unidad, el sistema muestra advertencia pero permite la accion.
- Si el admin cambia de condominio mientras esta editando un residente, se descarta el formulario y se redirige a la lista.
- Si la unidad seleccionada se desactiva mientras se estan viendo sus residentes, al recargar se muestra mensaje indicando que la unidad no esta activa.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: El sistema DEBE mostrar un enlace "Residentes" en el menu lateral de navegacion con icono apropiado
- **FR-002**: El sistema DEBE mostrar selectores en cascada: primero edificio, luego unidad del edificio seleccionado
- **FR-003**: El sistema DEBE mostrar una tabla paginada de residentes de la unidad seleccionada con columnas: nombre completo, documento, tipo, estado, fecha ingreso, acciones
- **FR-004**: Los datos personales (firstName, lastName, documentType, documentNumber, dateOfBirth, phone, email) DEBEN almacenarse directamente en la entidad Resident
- **FR-005**: El sistema DEBE permitir crear un residente ingresando sus datos personales y datos de residencia, asignandolo a la unidad seleccionada
- **FR-006**: Campos obligatorios al crear: firstName, lastName, documentType, documentNumber, dateOfBirth. Campos opcionales: phone, email
- **FR-007**: El sistema DEBE validar unicidad de documentNumber — un residente activo solo puede estar asignado a una unidad a la vez
- **FR-008**: El sistema DEBE permitir editar datos personales (excepto documento), tipo de residente, primario, relacion, fechas y estado activo (sin cambiar unidad)
- **FR-009**: El sistema DEBE mostrar una vista de detalle del residente con datos personales, datos de residencia y datos de la unidad
- **FR-010**: El sistema DEBE permitir desactivar/activar un residente con dialogo de confirmacion (no se permite eliminar residentes desde UI)
- **FR-011**: El sistema DEBE mostrar mensajes de exito/error despues de cada operacion (snackbar)
- **FR-012**: El modelo IResident del frontend DEBE alinearse con la entidad del backend incluyendo los nuevos campos personales
- **FR-013**: El formulario DEBE usar Angular Reactive Forms con validaciones
- **FR-014**: El backend DEBE modificarse para agregar campos personales (firstName, lastName, documentType, documentNumber, dateOfBirth, phone, email) a la entidad Resident y sus DTOs
- **FR-015**: El vinculo con User es opcional — solo se usa cuando el residente necesita acceso al sistema (login). No se gestiona en este feature.

### Key Entities

- **Resident**: Habitante de una unidad. Atributos: id, firstName (obligatorio), lastName (obligatorio), documentType (obligatorio), documentNumber (obligatorio, unico entre residentes activos), dateOfBirth (obligatorio), phone (opcional), email (opcional), userId (opcional, FK a User para login), unitId, residentType (OWNER/TENANT/FAMILY_MEMBER/GUEST), moveInDate, moveOutDate, isPrimary, relationship, isActive. Relacion N:1 con Unit, N:1 con User (opcional).
- **User**: Usuario del sistema para acceso (login). Solo se vincula al Resident cuando este necesita credenciales. No provee datos personales al Resident.
- **Unit**: Unidad habitacional. Se usa como contexto para filtrar residentes. Pertenece a un Building.
- **Building**: Edificio. Se usa como primer nivel de filtro para seleccionar unidades.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: El administrador puede agregar un residente a una unidad en menos de 2 minutos
- **SC-002**: La tabla de residentes carga y muestra datos en menos de 2 segundos despues de seleccionar unidad
- **SC-003**: El 100% de las operaciones CRUD funcionan correctamente contra la API
- **SC-004**: Las validaciones de formulario previenen el 100% de envios con datos invalidos
- **SC-005**: Todos los tests unitarios del modulo pasan con cobertura minima de 70%
- **SC-006**: Los filtros en cascada (edificio → unidad) funcionan correctamente mostrando solo opciones validas
- **SC-007**: El sistema rechaza la creacion de un residente con documentNumber duplicado en otra unidad activa

## Assumptions

- El backend tiene 5 endpoints CRUD funcionales pero necesita modificarse para agregar campos personales a la entidad Resident
- El administrador tiene rol ADMIN o SUPER_ADMIN
- No se permite eliminar residentes desde la UI — solo desactivar
- Se reutiliza el patron de componentes existente (standalone components, Angular Material, signals)
- Se sigue el mismo patron implementado en el modulo de edificios (002-buildings-crud)
- BuildingService y UnitService ya existen y funcionan para cargar los selectores en cascada
- DocumentType enum ya existe en @condominios/shared (RUT, PASSPORT, DNI, OTHER)
- La creacion de User para el residente (acceso al sistema) queda fuera de este feature

## Out of Scope

- Crear o vincular User desde el formulario de residentes (el vinculo User-Resident para login es un feature futuro)
- Self-service del residente (login propio, ver su unidad, reservas, pagos) — feature futuro
- Historial de mudanzas (registros historicos de todos los residentes que han vivido en una unidad)
- Notificaciones al residente cuando es asignado a una unidad
- Importacion masiva de residentes via CSV
- Busqueda global de residentes a nivel de condominio (solo filtro por unidad)
