# Quickstart: Dashboard con Datos Reales

**Branch**: `001-dashboard-real-data` | **Date**: 2026-03-18

## Prerequisitos

1. Backend API corriendo en `http://localhost:3000`
2. PostgreSQL y Redis corriendo (via docker-compose)
3. Al menos un condominio con edificios, unidades y residentes en la BD
4. Un usuario ADMIN con acceso al condominio

## Setup

```bash
# 1. Cambiar a la branch de la feature
git checkout 001-dashboard-real-data

# 2. Instalar dependencias (si hay nuevas)
npm install

# 3. Iniciar servicios Docker
docker-compose up -d

# 4. Ejecutar migraciones
npm run migration:run

# 5. Iniciar backend
npm run start:api

# 6. Iniciar frontend (en otra terminal)
npm run start:web
```

## Verificacion

1. Ir a `http://localhost:4200`
2. Iniciar sesion con credenciales de admin
3. Seleccionar un condominio
4. El dashboard debe mostrar:
   - Total de edificios (numero real)
   - Total de unidades y porcentaje de ocupacion (numeros reales)
   - Total de residentes (numero real, o "N/A" si hay muchas unidades)
   - Pagos: "Proximamente" (modulo no implementado aun)
5. Verificar estados de carga (spinners al cargar)
6. Verificar estado vacio (condominio sin datos)
7. Verificar estado de error (apagar el backend y recargar)

## Archivos Clave a Modificar

| Archivo | Cambio |
|---------|--------|
| `apps/web/src/app/layout/dashboard/dashboard.component.ts` | Reemplazar datos hardcodeados por llamadas a servicios |
| `apps/web/src/app/layout/dashboard/dashboard.component.html` | Agregar estados loading/error/empty/coming-soon |
| `apps/web/src/app/core/services/dashboard.service.ts` | **NUEVO** - Servicio que agrega datos de multiples endpoints |
| `apps/web/src/app/features/residentes/services/resident.service.ts` | Corregir URLs para usar endpoints correctos del backend |

## Notas

- NO se modifica el backend en esta feature
- Los pagos quedan como "Proximamente" hasta que se implemente el controller de payments
- El ResidentService se corrige para usar `/api/v1/units/:unitId/residents` en vez de `/residents`
