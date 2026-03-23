# QA Manual: 003-residents-crud

**Pre-requisitos**: Backend corriendo (`npm run start:api`), Frontend corriendo (`npm run start:web`), DB con migracion aplicada, al menos 1 condominio con edificios y unidades en la BD.

## Pasos de Validacion

### 1. Navegacion y Menu
- [ ] Login como admin
- [ ] Seleccionar condominio
- [ ] Verificar que "Residentes" aparece en el menu lateral con icono
- [ ] Click en "Residentes" → navega a `/residentes`

### 2. Filtros en Cascada
- [ ] La pagina muestra selector de edificio y selector de unidad
- [ ] Selector de unidad esta deshabilitado hasta seleccionar edificio
- [ ] Seleccionar un edificio → selector de unidad se habilita con las unidades del edificio
- [ ] Cambiar de edificio → selector de unidad se resetea y carga nuevas unidades
- [ ] Mensaje inicial indica "Seleccione una unidad para ver sus residentes"

### 3. Lista de Residentes (US1)
- [ ] Seleccionar una unidad con residentes → tabla muestra nombre, documento, tipo, estado, fecha ingreso
- [ ] Paginacion funciona correctamente
- [ ] Seleccionar una unidad sin residentes → mensaje "No hay residentes en esta unidad" con boton "Nuevo Residente"

### 4. Crear Residente (US2)
- [ ] Click en "Nuevo Residente" → navega al formulario
- [ ] Formulario tiene campos: nombre, apellido, tipo documento, numero documento, fecha nacimiento, telefono, email, tipo residente, fecha ingreso, primario, relacion
- [ ] Campos obligatorios marcados: nombre, apellido, tipo documento, numero documento, fecha nacimiento
- [ ] Campos opcionales: telefono, email
- [ ] Enviar sin campos obligatorios → errores de validacion visibles
- [ ] Completar formulario con datos validos → residente creado, snackbar exito, redirige a lista
- [ ] Verificar que el residente aparece en la tabla
- [ ] Intentar crear con documento duplicado (mismo documento en otra unidad activa) → error 409 mostrado correctamente

### 5. Editar Residente (US3)
- [ ] Desde la lista, click en editar un residente → formulario pre-cargado
- [ ] Campos de unidad, tipo documento y numero documento NO son editables
- [ ] Modificar nombre o telefono → guardar → cambios reflejados en la lista
- [ ] Snackbar de exito mostrado

### 6. Ver Detalle (US4)
- [ ] Desde la lista, click en el nombre de un residente → vista de detalle
- [ ] Se muestran: datos personales (nombre, apellido, documento, nacimiento, telefono, email)
- [ ] Se muestran: datos de residencia (tipo, primario, relacion, fechas)
- [ ] Se muestran: datos de la unidad
- [ ] Botones de editar y volver funcionan

### 7. Desactivar/Activar (US5)
- [ ] Desde la lista, click en desactivar un residente activo → dialogo de confirmacion
- [ ] Confirmar → residente cambia a inactivo, snackbar exito
- [ ] Desde la lista, click en activar un residente inactivo → confirmar → vuelve a activo

### 8. Tests Automatizados
- [ ] `cd apps/web && npx ng test --no-watch` → todos los tests pasan
- [ ] `npm test -- --projects=api` → tests backend pasan (residents service y controller)
