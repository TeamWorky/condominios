# API Contracts: Dashboard con Datos Reales

**Branch**: `001-dashboard-real-data` | **Date**: 2026-03-18

## Nota

Esta feature NO crea nuevos endpoints. Consume endpoints existentes del backend.
A continuacion se documentan los contratos de los endpoints que el dashboard consumira.

---

## GET /api/v1/condominiums/:condoId/buildings

**Uso en dashboard**: Obtener total de edificios.

**Request**:
```
GET /api/v1/condominiums/{condoId}/buildings?page=1&limit=1
Authorization: Bearer {accessToken}
```

**Response** (200):
```json
{
  "statusCode": 200,
  "message": "Buildings retrieved successfully",
  "data": [...],
  "meta": {
    "total": 5,
    "page": 1,
    "limit": 1,
    "totalPages": 5
  }
}
```

**Dashboard extrae**: `response.meta.total` → totalBuildings

---

## GET /api/v1/condominiums/:condoId/units

**Uso en dashboard**: Obtener total de unidades y calcular ocupacion.

**Request**:
```
GET /api/v1/condominiums/{condoId}/units?page=1&limit=999
Authorization: Bearer {accessToken}
```

**Response** (200):
```json
{
  "statusCode": 200,
  "message": "Units retrieved successfully",
  "data": [
    {
      "id": "uuid",
      "number": "101",
      "isOccupied": true,
      "status": "OCCUPIED",
      ...
    }
  ],
  "meta": {
    "total": 120,
    "page": 1,
    "limit": 999,
    "totalPages": 1
  }
}
```

**Dashboard extrae**:
- `response.meta.total` → totalUnits
- `response.data.filter(u => u.isOccupied).length` → occupiedUnits
- `(occupiedUnits / totalUnits) * 100` → occupancyRate

---

## GET /api/v1/units/:unitId/residents

**Uso en dashboard**: Obtener total de residentes por unidad (agregado).

**Request** (por cada unidad):
```
GET /api/v1/units/{unitId}/residents?page=1&limit=1
Authorization: Bearer {accessToken}
```

**Response** (200):
```json
{
  "statusCode": 200,
  "message": "Residents retrieved successfully",
  "data": [...],
  "meta": {
    "total": 3,
    "page": 1,
    "limit": 1,
    "totalPages": 3
  }
}
```

**Dashboard extrae**: `sum(response.meta.total)` de todas las unidades → totalResidents

**Limitacion**: Si hay mas de 50 unidades, no se hace el agregado (demasiadas llamadas HTTP). Se muestra "N/A" para residentes.

---

## Endpoints NO Disponibles (Coming Soon)

### Payments
- `GET /api/v1/payments` → **NO EXISTE** - Controller no implementado
- Dashboard mostrara "Proximamente" para pagos pendientes, pagos del mes y pagos recientes

---

## Manejo de Errores

Todos los endpoints pueden devolver:

| Status | Significado | Accion Dashboard |
|--------|-------------|-----------------|
| 401 | Token expirado | Intentar refresh, si falla redirigir a login |
| 403 | Sin permisos | Mostrar mensaje de acceso denegado |
| 404 | Recurso no encontrado | Mostrar estado vacio |
| 500 | Error interno | Mostrar estado de error con boton reintentar |
| Network Error | Sin conexion | Mostrar estado de error con boton reintentar |
