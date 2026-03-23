# API Contract: Auth (Mobile Consumer)

**Feature**: 001-add-mobile-app
**Note**: These endpoints already exist in the backend. This document describes how the mobile app consumes them.

---

## POST `/api/v1/auth/login`

**Used by**: Login screen

**Request**:
```json
{
  "email": "admin@admin.com",
  "password": "admin123"
}
```

**Response 200**:
```json
{
  "data": {
    "accessToken": "<jwt>",
    "refreshToken": "<jwt>",
    "user": {
      "id": "uuid",
      "email": "admin@admin.com",
      "role": "ADMIN"
    }
  }
}
```

**Response 401**: Invalid credentials — display error to user.

---

## POST `/api/v1/auth/refresh`

**Used by**: Axios interceptor (silent token refresh)

**Request**:
```json
{ "refreshToken": "<jwt>" }
```

**Response 200**: New `accessToken` + `refreshToken`.
**Response 401**: Refresh expired — redirect to login screen.

---

## POST `/api/v1/auth/logout`

**Used by**: Logout action

**Request**: `Authorization: Bearer <accessToken>` header + `{ "refreshToken": "<jwt>" }` body.
**Response 204**: Clear AsyncStorage and redirect to login.
