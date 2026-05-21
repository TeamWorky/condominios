# API Contract: Payments

**Base URL**: `/api/v1`
**Auth**: Bearer JWT (all endpoints)
**Guards**: JwtAuthGuard, MinRoleGuard

---

## POST /units/:unitId/payments

**Description**: Create a new payment for a unit.
**Role**: ADMIN+
**Version**: 1

### Request

**Path Parameters**:
| Param | Type | Required | Description |
|-------|------|----------|-------------|
| unitId | UUID | Yes | Unit to create payment for |

**Body** (`application/json`):
```json
{
  "amount": 150000.00,
  "period": "2026-01",
  "dueDate": "2026-01-31",
  "paymentMethod": "TRANSFER",
  "reference": "TRX-001",
  "notes": "Monthly maintenance fee",
  "residentId": "uuid-optional"
}
```

| Field | Type | Required | Validation |
|-------|------|----------|------------|
| amount | number | Yes | > 0, decimal(12,2) |
| period | string | Yes | YYYY-MM format |
| dueDate | string (date) | Yes | Valid ISO date |
| paymentMethod | PaymentMethod | No | Enum value |
| reference | string | No | Max 255 chars |
| notes | string | No | Free text |
| residentId | UUID | No | Valid resident ID |

### Responses

**201 Created**:
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "amount": 150000.00,
    "period": "2026-01",
    "dueDate": "2026-01-31",
    "paidDate": null,
    "status": "PENDING",
    "paymentMethod": "TRANSFER",
    "reference": "TRX-001",
    "notes": "Monthly maintenance fee",
    "unitId": "uuid",
    "residentId": "uuid",
    "createdAt": "2026-01-15T10:00:00Z",
    "updatedAt": "2026-01-15T10:00:00Z"
  },
  "message": "Payment created successfully"
}
```

**400 Bad Request**: Validation error (amount <= 0, invalid period format, etc.)
**404 Not Found**: Unit not found or belongs to different condominium

---

## GET /condominiums/:condoId/payments

**Description**: List all payments for a condominium (paginated).
**Role**: USER+
**Version**: 1

### Request

**Path Parameters**:
| Param | Type | Required | Description |
|-------|------|----------|-------------|
| condoId | UUID | Yes | Condominium ID |

**Query Parameters**:
| Param | Type | Default | Description |
|-------|------|---------|-------------|
| page | number | 1 | Page number |
| limit | number | 10 | Items per page (max 100) |

### Responses

**200 OK**:
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "amount": 150000.00,
      "period": "2026-01",
      "dueDate": "2026-01-31",
      "paidDate": null,
      "status": "PENDING",
      "paymentMethod": "TRANSFER",
      "reference": "TRX-001",
      "notes": null,
      "unitId": "uuid",
      "residentId": null,
      "createdAt": "2026-01-15T10:00:00Z",
      "updatedAt": "2026-01-15T10:00:00Z",
      "unit": {
        "id": "uuid",
        "number": "101",
        "building": {
          "id": "uuid",
          "name": "Torre A"
        }
      }
    }
  ],
  "meta": {
    "page": 1,
    "limit": 10,
    "total": 25,
    "totalPages": 3
  }
}
```

---

## GET /units/:unitId/payments

**Description**: List all payments for a specific unit (paginated).
**Role**: USER+
**Version**: 1

### Request

**Path Parameters**:
| Param | Type | Required | Description |
|-------|------|----------|-------------|
| unitId | UUID | Yes | Unit ID |

**Query Parameters**:
| Param | Type | Default | Description |
|-------|------|---------|-------------|
| page | number | 1 | Page number |
| limit | number | 10 | Items per page (max 100) |

### Responses

**200 OK**: Same structure as GET /condominiums/:condoId/payments
**404 Not Found**: Unit not found or belongs to different condominium

---

## GET /payments/:id

**Description**: Get payment details by ID.
**Role**: USER+
**Version**: 1

### Request

**Path Parameters**:
| Param | Type | Required | Description |
|-------|------|----------|-------------|
| id | UUID | Yes | Payment ID |

### Responses

**200 OK**:
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "amount": 150000.00,
    "period": "2026-01",
    "dueDate": "2026-01-31",
    "paidDate": "2026-01-20",
    "status": "PAID",
    "paymentMethod": "TRANSFER",
    "reference": "TRX-001",
    "notes": "Monthly maintenance fee",
    "unitId": "uuid",
    "residentId": "uuid",
    "createdAt": "2026-01-15T10:00:00Z",
    "updatedAt": "2026-01-20T10:00:00Z",
    "unit": {
      "id": "uuid",
      "number": "101",
      "building": {
        "id": "uuid",
        "name": "Torre A"
      }
    },
    "resident": {
      "id": "uuid",
      "firstName": "Juan",
      "lastName": "Perez"
    }
  },
  "message": "Payment retrieved successfully"
}
```

**404 Not Found**: Payment not found or belongs to different condominium

---

## PATCH /payments/:id

**Description**: Update payment information. Cannot change amount if status is PAID.
**Role**: ADMIN+
**Version**: 1

### Request

**Path Parameters**:
| Param | Type | Required | Description |
|-------|------|----------|-------------|
| id | UUID | Yes | Payment ID |

**Body** (`application/json`):
```json
{
  "amount": 160000.00,
  "dueDate": "2026-02-15",
  "paymentMethod": "CASH",
  "reference": "TRX-002",
  "notes": "Updated note"
}
```

All fields are optional (partial update).

### Responses

**200 OK**: Updated payment object (same structure as GET)
**400 Bad Request**: Validation error or attempt to change amount on PAID payment
**404 Not Found**: Payment not found or belongs to different condominium

---

## PATCH /payments/:id/status

**Description**: Change payment status. Enforces valid transition rules.
**Role**: ADMIN+
**Version**: 1

### Request

**Path Parameters**:
| Param | Type | Required | Description |
|-------|------|----------|-------------|
| id | UUID | Yes | Payment ID |

**Body** (`application/json`):
```json
{
  "status": "PAID",
  "paymentMethod": "TRANSFER",
  "reference": "TRX-001"
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| status | PaymentStatus | Yes | Target status |
| paymentMethod | PaymentMethod | No | Required when marking as PAID |
| reference | string | No | Payment reference/receipt |

### Responses

**200 OK**: Updated payment object with new status
**400 Bad Request**: Invalid status transition
**404 Not Found**: Payment not found or belongs to different condominium

---

## DELETE /payments/:id

**Description**: Soft delete a payment. Cannot delete PAID payments.
**Role**: ADMIN+
**Version**: 1

### Request

**Path Parameters**:
| Param | Type | Required | Description |
|-------|------|----------|-------------|
| id | UUID | Yes | Payment ID |

### Responses

**204 No Content**: Payment soft-deleted successfully
**400 Bad Request**: Cannot delete a PAID payment
**404 Not Found**: Payment not found or belongs to different condominium
