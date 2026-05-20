# Data Model: 003-residents-crud

## Entity: Resident (updated)

**Table**: `residents`
**Extends**: BaseEntity (id, createdAt, updatedAt, deletedAt)

### Fields

| Field | DB Column | Type | Constraints | Notes |
|-------|-----------|------|-------------|-------|
| id | id | UUID | PK, auto-generated | From BaseEntity |
| firstName | first_name | varchar(100) | NOT NULL | New field |
| lastName | last_name | varchar(100) | NOT NULL | New field |
| documentType | document_type | DocumentType enum | NOT NULL | New field (RUT, PASSPORT, DNI, OTHER) |
| documentNumber | document_number | varchar(50) | NOT NULL, unique among active | New field |
| dateOfBirth | date_of_birth | date | NOT NULL | New field |
| phone | phone | varchar(20) | nullable | New field |
| email | email | varchar(255) | nullable | New field |
| userId | user_id | UUID | nullable, FK → users.id | Existing (optional, for login) |
| unitId | unit_id | UUID | NOT NULL, FK → units.id | Existing |
| residentType | resident_type | ResidentType enum | NOT NULL, default TENANT | Existing |
| moveInDate | move_in_date | date | nullable | Existing |
| moveOutDate | move_out_date | date | nullable | Existing |
| isPrimary | is_primary | boolean | default false | Existing |
| relationship | relationship | varchar(100) | nullable | Existing |
| isActive | is_active | boolean | default true | Existing |
| createdAt | created_at | timestamp | auto | From BaseEntity |
| updatedAt | updated_at | timestamp | auto | From BaseEntity |
| deletedAt | deleted_at | timestamp | nullable | From BaseEntity (soft delete) |

### Relationships

| Relation | Type | Target | On Delete | Notes |
|----------|------|--------|-----------|-------|
| user | ManyToOne | User | SET NULL | Optional, for system login |
| unit | ManyToOne | Unit | CASCADE | Required, resident belongs to unit |
| reservations | OneToMany | Reservation | - | Future feature |

### Indexes (new)

| Index | Columns | Type | Notes |
|-------|---------|------|-------|
| IDX_residents_document_number | document_number | BTREE | For lookup by document |
| UQ_residents_active_document | document_number | UNIQUE PARTIAL | WHERE deleted_at IS NULL AND is_active = true |

### State Transitions

```
Created (isActive=true) → Deactivated (isActive=false, moveOutDate set)
Deactivated → Reactivated (isActive=true, moveOutDate cleared)
Any state → Soft Deleted (deletedAt set)
```

## Enums (existing, no changes)

### ResidentType
- OWNER
- TENANT
- FAMILY_MEMBER
- GUEST

### DocumentType
- RUT
- PASSPORT
- DNI
- OTHER

## Migration: AddPersonalFieldsToResidents

New columns to add:
1. `first_name` varchar(100) NOT NULL DEFAULT ''
2. `last_name` varchar(100) NOT NULL DEFAULT ''
3. `document_type` document_type_enum NOT NULL DEFAULT 'RUT'
4. `document_number` varchar(50) NOT NULL DEFAULT ''
5. `date_of_birth` date NOT NULL DEFAULT '1900-01-01'
6. `phone` varchar(20) nullable
7. `email` varchar(255) nullable

After adding columns, create partial unique index on document_number.

Note: DEFAULT values are for existing rows only. The DTOs will enforce proper validation for new records.
