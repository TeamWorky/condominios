# Data Model: Dashboard con Datos Reales

**Branch**: `001-dashboard-real-data` | **Date**: 2026-03-18

## Entidades Existentes (no se modifican)

Esta feature NO crea nuevas entidades en el backend. Solo consume datos de entidades existentes.

### Condominium
- `id` (UUID, PK)
- `name` (string)
- `address` (string)
- `isActive` (boolean)
- Relacion: 1:N con Building

### Building
- `id` (UUID, PK)
- `condominiumId` (UUID, FK -> Condominium)
- `name` (string)
- `code` (string, unico dentro del condominio)
- `floors` (int)
- `isActive` (boolean)
- Relacion: N:1 con Condominium, 1:N con Unit

### Unit
- `id` (UUID, PK)
- `buildingId` (UUID, FK -> Building)
- `number` (string)
- `status` (enum: AVAILABLE, OCCUPIED, UNDER_MAINTENANCE, etc.)
- `isOccupied` (boolean)
- Relacion: N:1 con Building, 1:N con Resident

### Resident
- `id` (UUID, PK)
- `unitId` (UUID, FK -> Unit)
- `residentType` (enum: OWNER, TENANT, FAMILY_MEMBER)
- `isActive` (boolean)
- Relacion: N:1 con Unit

### Payment (entidad existente, sin controller)
- `id` (UUID, PK)
- `amount` (number)
- `status` (enum)
- `createdAt` (date)
- Nota: Entity existe pero no hay controller/service implementado

## Modelos Frontend (nuevos)

### DashboardStats (interface)
Modelo que agrupa todas las estadisticas del dashboard.

| Campo | Tipo | Descripcion |
|-------|------|-------------|
| totalResidents | number | Total de residentes activos del condominio |
| totalBuildings | number | Total de edificios del condominio |
| totalUnits | number | Total de unidades del condominio |
| occupiedUnits | number | Unidades con status OCCUPIED o isOccupied=true |
| occupancyRate | number | Porcentaje de ocupacion (occupiedUnits/totalUnits * 100) |
| residentsAvailable | boolean | Si fue posible obtener el conteo de residentes |

### DashboardCard (interface existente, se modifica)
Tarjeta visual del dashboard.

| Campo | Tipo | Descripcion |
|-------|------|-------------|
| title | string | Titulo de la tarjeta |
| value | string / number | Valor a mostrar |
| icon | string | Nombre del icono Material |
| color | string | Color del tema (primary, accent, warn) |
| change | string | Indicador de cambio (se elimina, no hay datos historicos aun) |
| changeType | string | Tipo de cambio (se elimina) |
| loading | boolean | Si la tarjeta esta cargando |
| error | boolean | Si hubo error obteniendo los datos |
| comingSoon | boolean | Si la funcionalidad no esta disponible aun |
| routerLink | string | Ruta de navegacion al hacer clic |

### RecentPayment (interface)
Pago reciente para la seccion del dashboard.

| Campo | Tipo | Descripcion |
|-------|------|-------------|
| id | string | UUID del pago |
| unit | string | Numero de unidad |
| resident | string | Nombre del residente |
| amount | number | Monto del pago |
| date | Date | Fecha del pago |
| status | string | Estado (paid, pending, overdue) |

## Flujo de Datos

```
AuthService (condominiumId del JWT)
    |
    v
DashboardService
    |
    ├── BuildingService.getBuildingsByCondominium(condoId, 1, 1)
    │       → meta.total = totalBuildings
    |
    ├── UnitService.getUnitsByCondominium(condoId, 1, 999)
    │       → meta.total = totalUnits
    │       → filter(isOccupied) = occupiedUnits
    |
    ├── Para cada unidad: ResidentService.getResidentsByUnit(unitId, 1, 1)
    │       → sum(meta.total) = totalResidents
    │       (solo si totalUnits <= 50, sino residentsAvailable = false)
    |
    └── PaymentService (DESHABILITADO hasta que exista el controller)
            → recentPayments = [] con mensaje "Proximamente"
```
