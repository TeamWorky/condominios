# API Contracts: Buildings Module (Frontend Consumption)

These are the existing backend endpoints that the frontend will consume. No new endpoints are created.

## Endpoints

### List Buildings

```
GET /api/v1/condominiums/:condoId/buildings?page=1&limit=10
Authorization: Bearer <JWT>
Role: USER+

Response 200:
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "condominiumId": "uuid",
      "name": "Edificio A",
      "code": "A",
      "floors": 10,
      "undergroundFloors": 2,
      "hasElevator": true,
      "address": "Calle 1 #100",
      "isActive": true,
      "createdAt": "2026-01-01T00:00:00.000Z",
      "updatedAt": "2026-01-01T00:00:00.000Z"
    }
  ],
  "meta": {
    "total": 5,
    "page": 1,
    "limit": 10,
    "totalPages": 1
  }
}
```

### Get Building by ID

```
GET /api/v1/buildings/:id
Authorization: Bearer <JWT>
Role: USER+

Response 200:
{
  "success": true,
  "data": {
    "id": "uuid",
    "condominiumId": "uuid",
    "name": "Edificio A",
    "code": "A",
    "floors": 10,
    "undergroundFloors": 2,
    "hasElevator": true,
    "address": "Calle 1 #100",
    "isActive": true,
    "units": [...],
    "createdAt": "...",
    "updatedAt": "..."
  }
}
```

### Create Building

```
POST /api/v1/condominiums/:condoId/buildings
Authorization: Bearer <JWT>
Role: ADMIN+

Body:
{
  "name": "Edificio B",
  "code": "B",
  "floors": 5,
  "undergroundFloors": 1,
  "hasElevator": false,
  "address": "Calle 2 #200"
}

Response 201: { "success": true, "data": { ...building } }
Response 409: { "message": "Building with code B already exists in this condominium" }
```

### Update Building (also used for activate/deactivate)

```
PATCH /api/v1/buildings/:id
Authorization: Bearer <JWT>
Role: ADMIN+

Body (all fields optional):
{
  "name": "Edificio B Renovado",
  "floors": 6
}

# For deactivation:
{ "isActive": false }

# For reactivation:
{ "isActive": true }

Response 200: { "success": true, "data": { ...building } }
Response 409: Duplicate code
Response 404: Building not found
```

**NOTE**: No DELETE endpoint is used. Buildings are deactivated via PATCH with `isActive: false`.

## Frontend Service Method Mapping

| Service Method | HTTP | Endpoint | Notes |
|---------------|------|----------|-------|
| `getBuildingsByCondominium(condoId, page, limit)` | GET | `/condominiums/:condoId/buildings` | Already exists, works correctly |
| `getBuildingById(id)` | GET | `/buildings/:id` | Already exists, works correctly |
| `createBuilding(condoId, dto)` | POST | `/condominiums/:condoId/buildings` | **FIX**: Change URL and add condoId param |
| `updateBuilding(id, dto)` | PATCH | `/buildings/:id` | Already exists, works correctly |
| `toggleBuildingStatus(id, isActive)` | PATCH | `/buildings/:id` | NEW: Convenience method using updateBuilding |

## Error Handling

| HTTP Status | Frontend Action |
|------------|----------------|
| 201 | Show success snackbar, navigate to list |
| 200 | Show success snackbar (for updates) |
| 400 | Show validation errors on form fields |
| 404 | Show "Edificio no encontrado" and navigate to list |
| 409 | Show "Ya existe un edificio con ese codigo" on code field |
| 500 | Show generic error snackbar |
