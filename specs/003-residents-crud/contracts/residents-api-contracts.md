# API Contracts: Residents (updated)

## Base URL: `/api/v1`

## Endpoints (5 existing, updated DTOs)

### POST /units/:unitId/residents
**Auth**: JWT + ADMIN+
**Request Body**:
```json
{
  "firstName": "string (required, max 100)",
  "lastName": "string (required, max 100)",
  "documentType": "RUT | PASSPORT | DNI | OTHER (required)",
  "documentNumber": "string (required, max 50)",
  "dateOfBirth": "date string (required, e.g. 2000-01-15)",
  "phone": "string (optional, max 20)",
  "email": "string (optional, email format, max 255)",
  "userId": "UUID (optional)",
  "residentType": "OWNER | TENANT | FAMILY_MEMBER | GUEST (optional, default TENANT)",
  "moveInDate": "date string (optional)",
  "isPrimary": "boolean (optional, default false)",
  "relationship": "string (optional, max 100)"
}
```
**Response 201**:
```json
{
  "success": true,
  "message": "Created successfully",
  "data": { /* Resident object */ }
}
```
**Error 404**: Unit not found
**Error 409**: Document number already assigned to active resident in another unit

---

### GET /units/:unitId/residents
**Auth**: JWT + USER+
**Query Params**: `page=1&limit=10`
**Response 200**:
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "firstName": "Juan",
      "lastName": "Perez",
      "documentType": "RUT",
      "documentNumber": "12345678-9",
      "dateOfBirth": "1990-05-15",
      "phone": "+56912345678",
      "email": "juan@example.com",
      "userId": null,
      "unitId": "uuid",
      "residentType": "OWNER",
      "moveInDate": "2024-01-15",
      "moveOutDate": null,
      "isPrimary": true,
      "relationship": null,
      "isActive": true,
      "user": null,
      "createdAt": "2024-01-15T00:00:00.000Z",
      "updatedAt": "2024-01-15T00:00:00.000Z"
    }
  ],
  "meta": {
    "page": 1,
    "limit": 10,
    "total": 1,
    "totalPages": 1
  }
}
```

---

### GET /residents/:id
**Auth**: JWT + USER+
**Response 200**:
```json
{
  "success": true,
  "data": { /* Resident object with user relation (left join) */ }
}
```
**Error 404**: Resident not found

---

### PATCH /residents/:id
**Auth**: JWT + ADMIN+
**Request Body** (all optional, unitId and documentNumber excluded):
```json
{
  "firstName": "string (max 100)",
  "lastName": "string (max 100)",
  "dateOfBirth": "date string",
  "phone": "string (max 20)",
  "email": "string (email format, max 255)",
  "residentType": "OWNER | TENANT | FAMILY_MEMBER | GUEST",
  "moveInDate": "date string",
  "moveOutDate": "date string",
  "isPrimary": "boolean",
  "relationship": "string (max 100)",
  "isActive": "boolean"
}
```
**Response 200**: Updated resident
**Error 404**: Resident not found

---

### DELETE /residents/:id
**Auth**: JWT + ADMIN+
**Response 204**: No content (soft delete)
**Error 404**: Resident not found
