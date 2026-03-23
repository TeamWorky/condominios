# Quickstart: CRUD de Edificios en Frontend

## Prerequisites

1. Backend API running on `http://localhost:3000`
2. PostgreSQL + Redis running (via Docker Compose)
3. At least one condominium with buildings seeded
4. Admin user credentials: `admin@admin.com` / `admin`

## Validation Steps

### 1. Verify Navigation

1. Login as admin → select condominium
2. Verify "Edificios" appears in the sidebar menu
3. Click "Edificios" → should navigate to `/edificios`
4. Verify the table shows buildings from the selected condominium

### 2. Create Building

1. From `/edificios`, click "Nuevo Edificio"
2. Fill the form:
   - Nombre: "Edificio Test"
   - Codigo: "TEST"
   - Pisos: 5
   - Subsuelos: 1
   - Ascensor: Si
   - Direccion: "Calle Test #123"
3. Click "Guardar"
4. Verify redirect to list with success message
5. Verify new building appears in the table

### 3. Validate Duplicate Code

1. Click "Nuevo Edificio" again
2. Enter the same code "TEST"
3. Click "Guardar"
4. Verify error message about duplicate code

### 4. Edit Building

1. From the list, click edit on "Edificio Test"
2. Change nombre to "Edificio Test Editado"
3. Click "Guardar"
4. Verify changes reflected in the table

### 5. View Building Detail

1. From the list, click on the building name
2. Verify all fields are displayed
3. Verify units list is shown (or empty state message)

### 6. Deactivate Building

1. From the list, click deactivate on a building
2. Confirm in the dialog
3. Verify the building shows as inactive in the table

### 7. Reactivate Building

1. Click activate on the inactive building
2. Confirm in the dialog
3. Verify the building shows as active again

### 8. Dashboard Integration

1. Navigate to dashboard
2. Click on "Total Edificios" card
3. Verify it navigates to `/edificios` (not `/unidades`)
