# API Mock - Documentación

Este proyecto incluye un servidor mock utilizando JSON Server para simular una API REST completa.

## Iniciar el Servidor Mock

Para iniciar el servidor mock de la API:

```bash
npm run mock-server
```

El servidor estará disponible en `http://localhost:3000`

### Iniciar Todo (Frontend + Backend Mock)

Para iniciar ambos servidores simultáneamente:

```bash
npm run dev
```

- Frontend (Angular): `http://localhost:4200`
- Backend Mock (JSON Server): `http://localhost:3000`

## Endpoints Disponibles

### Residentes

**Base URL**: `http://localhost:3000/residents`

#### GET /residents
Obtener todos los residentes

```bash
curl http://localhost:3000/residents
```

#### GET /residents/:id
Obtener un residente específico

```bash
curl http://localhost:3000/residents/1
```

#### POST /residents
Crear un nuevo residente

```bash
curl -X POST http://localhost:3000/residents \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Pedro",
    "lastName": "Sánchez",
    "email": "pedro.sanchez@email.com",
    "phone": "+56967890123",
    "unitNumber": "601",
    "residentType": "OWNER",
    "documentType": "RUT",
    "documentNumber": "67.890.123-4",
    "isActive": true,
    "moveInDate": "2024-12-01T00:00:00.000Z"
  }'
```

#### PUT /residents/:id
Actualizar un residente completo

```bash
curl -X PUT http://localhost:3000/residents/1 \
  -H "Content-Type: application/json" \
  -d '{
    "id": "1",
    "firstName": "Juan Carlos",
    "lastName": "Pérez García",
    "email": "juan.carlos.perez@email.com",
    "phone": "+56912345678",
    "unitNumber": "101",
    "residentType": "OWNER",
    "documentType": "RUT",
    "documentNumber": "12.345.678-9",
    "isActive": true,
    "moveInDate": "2023-01-15T00:00:00.000Z"
  }'
```

#### PATCH /residents/:id
Actualizar parcialmente un residente

```bash
curl -X PATCH http://localhost:3000/residents/1 \
  -H "Content-Type: application/json" \
  -d '{
    "phone": "+56999999999"
  }'
```

#### DELETE /residents/:id
Eliminar un residente

```bash
curl -X DELETE http://localhost:3000/residents/1
```

### Pagos

**Base URL**: `http://localhost:3000/payments`

#### GET /payments
Obtener todos los pagos

Filtros disponibles:
- `?status=PAID` - Filtrar por estado
- `?period=2024-12` - Filtrar por período
- `?unitNumber=101` - Filtrar por unidad
- `?residentId=1` - Filtrar por residente

```bash
# Todos los pagos
curl http://localhost:3000/payments

# Pagos pendientes
curl http://localhost:3000/payments?status=PENDING

# Pagos de diciembre 2024
curl http://localhost:3000/payments?period=2024-12
```

#### GET /payments/:id
Obtener un pago específico

```bash
curl http://localhost:3000/payments/1
```

#### POST /payments
Crear un nuevo pago

```bash
curl -X POST http://localhost:3000/payments \
  -H "Content-Type: application/json" \
  -d '{
    "unitNumber": "601",
    "residentId": "6",
    "residentName": "Pedro Sánchez",
    "amount": 150000,
    "period": "2024-12",
    "dueDate": "2024-12-05T00:00:00.000Z",
    "status": "PENDING"
  }'
```

#### PATCH /payments/:id
Registrar un pago (actualizar estado)

```bash
curl -X PATCH http://localhost:3000/payments/3 \
  -H "Content-Type: application/json" \
  -d '{
    "status": "PAID",
    "paidDate": "2024-12-29T00:00:00.000Z",
    "paymentMethod": "TRANSFER",
    "reference": "TR-20241229-003"
  }'
```

#### DELETE /payments/:id
Eliminar un pago

```bash
curl -X DELETE http://localhost:3000/payments/1
```

### Unidades

**Base URL**: `http://localhost:3000/units`

#### GET /units
Obtener todas las unidades

```bash
curl http://localhost:3000/units
```

#### GET /units?isOccupied=true
Filtrar unidades ocupadas

```bash
curl http://localhost:3000/units?isOccupied=true
```

### Gastos Comunes

**Base URL**: `http://localhost:3000/commonExpenses`

#### GET /commonExpenses
Obtener todos los gastos comunes

```bash
curl http://localhost:3000/commonExpenses
```

#### GET /commonExpenses?period=2024-12
Obtener gastos de un período específico

```bash
curl http://localhost:3000/commonExpenses?period=2024-12
```

## Características de JSON Server

### Paginación

```bash
# Obtener 10 residentes por página
curl http://localhost:3000/residents?_page=1&_limit=10
```

### Ordenamiento

```bash
# Ordenar por nombre ascendente
curl http://localhost:3000/residents?_sort=firstName&_order=asc

# Ordenar por fecha descendente
curl http://localhost:3000/payments?_sort=dueDate&_order=desc
```

### Búsqueda de texto completo

```bash
# Buscar en todos los campos
curl http://localhost:3000/residents?q=juan
```

### Operadores de filtro

```bash
# Mayor que
curl http://localhost:3000/payments?amount_gte=100000

# Menor que
curl http://localhost:3000/payments?amount_lte=200000

# No igual
curl http://localhost:3000/payments?status_ne=PAID

# Like (contiene)
curl http://localhost:3000/residents?lastName_like=Pérez
```

### Relaciones

```bash
# Incluir residente en el pago
curl http://localhost:3000/payments?_expand=resident
```

## Datos de Ejemplo

El archivo `db.json` contiene:

- **5 residentes** de ejemplo con diferentes tipos (propietarios y arrendatarios)
- **6 pagos** con diferentes estados (pagado, pendiente, atrasado)
- **5 unidades** con información detallada
- **2 períodos de gastos comunes**

## Estados de Pago

- `PENDING`: Pendiente de pago
- `PAID`: Pagado
- `OVERDUE`: Atrasado
- `PARTIAL`: Pago parcial
- `CANCELLED`: Cancelado

## Métodos de Pago

- `CASH`: Efectivo
- `TRANSFER`: Transferencia bancaria
- `CHECK`: Cheque
- `CREDIT_CARD`: Tarjeta de crédito
- `DEBIT_CARD`: Tarjeta de débito

## Tipos de Residente

- `OWNER`: Propietario
- `TENANT`: Arrendatario

## Tipos de Documento

- `RUT`: RUT chileno
- `PASSPORT`: Pasaporte
- `DNI`: DNI

## Notas

- Los datos se persisten en el archivo `db.json`
- Los cambios se guardan automáticamente
- El servidor se recarga automáticamente cuando cambias `db.json`
- Usa `Ctrl+C` para detener el servidor

## Integración con Angular

Para usar la API mock en tus servicios de Angular:

```typescript
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ResidentService {
  private apiUrl = 'http://localhost:3000/residents';

  constructor(private http: HttpClient) {}

  getResidents(): Observable<IResident[]> {
    return this.http.get<IResident[]>(this.apiUrl);
  }

  getResident(id: string): Observable<IResident> {
    return this.http.get<IResident>(`${this.apiUrl}/${id}`);
  }

  createResident(resident: ICreateResidentDto): Observable<IResident> {
    return this.http.post<IResident>(this.apiUrl, resident);
  }

  updateResident(id: string, resident: Partial<IResident>): Observable<IResident> {
    return this.http.patch<IResident>(`${this.apiUrl}/${id}`, resident);
  }

  deleteResident(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
```

## Recursos

- [JSON Server Documentación](https://github.com/typicode/json-server)
- [JSON Server NPM](https://www.npmjs.com/package/json-server)
