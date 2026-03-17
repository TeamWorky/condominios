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

#### GET /units?building=Torre A
Filtrar unidades por edificio

```bash
curl http://localhost:3000/units?building=Torre%20A
```

#### GET /units?status=DISPONIBLE
Filtrar unidades por estado

```bash
curl http://localhost:3000/units?status=DISPONIBLE
```

#### POST /units
Crear una nueva unidad

```bash
curl -X POST http://localhost:3000/units \
  -H "Content-Type: application/json" \
  -d '{
    "building": "Torre A",
    "unitNumber": "501",
    "floor": 5,
    "area": 85,
    "bedrooms": 2,
    "bathrooms": 2,
    "parkingSpots": 1,
    "storageUnits": 1,
    "status": "DISPONIBLE"
  }'
```

#### PATCH /units/:id
Actualizar una unidad

```bash
curl -X PATCH http://localhost:3000/units/1 \
  -H "Content-Type: application/json" \
  -d '{
    "status": "OCUPADA"
  }'
```

### Edificios

**Base URL**: `http://localhost:3000/buildings`

#### GET /buildings
Obtener todos los edificios

```bash
curl http://localhost:3000/buildings
```

#### GET /buildings?isActive=true
Filtrar edificios activos

```bash
curl http://localhost:3000/buildings?isActive=true
```

#### GET /buildings/:id
Obtener un edificio específico

```bash
curl http://localhost:3000/buildings/1
```

#### POST /buildings
Crear un nuevo edificio

```bash
curl -X POST http://localhost:3000/buildings \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Torre D",
    "description": "Nueva torre del condominio",
    "address": "Av. Principal 123",
    "totalFloors": 10,
    "totalUnits": 40,
    "isActive": true
  }'
```

### Espacios Comunes

**Base URL**: `http://localhost:3000/commonSpaces`

#### GET /commonSpaces
Obtener todos los espacios comunes

```bash
curl http://localhost:3000/commonSpaces
```

#### GET /commonSpaces?buildingId=1
Filtrar espacios por edificio

```bash
curl http://localhost:3000/commonSpaces?buildingId=1
```

#### GET /commonSpaces?isReservable=true
Filtrar espacios reservables

```bash
curl http://localhost:3000/commonSpaces?isReservable=true
```

#### GET /commonSpaces?type=SALON_EVENTOS
Filtrar espacios por tipo

```bash
curl http://localhost:3000/commonSpaces?type=SALON_EVENTOS
```

#### GET /commonSpaces/:id
Obtener un espacio común específico

```bash
curl http://localhost:3000/commonSpaces/1
```

#### POST /commonSpaces
Crear un nuevo espacio común

```bash
curl -X POST http://localhost:3000/commonSpaces \
  -H "Content-Type: application/json" \
  -d '{
    "buildingId": "1",
    "name": "Sala de Juegos",
    "type": "SALA_DE_JUEGOS",
    "description": "Sala con mesas de billar y ping pong",
    "location": "Piso 3",
    "capacity": 20,
    "area": 80,
    "amenities": ["Mesas de billar", "Ping pong", "WiFi"],
    "isReservable": true,
    "reservationStartTime": "10:00",
    "reservationEndTime": "22:00",
    "isExclusive": false
  }'
```

#### PATCH /commonSpaces/:id
Actualizar un espacio común

```bash
curl -X PATCH http://localhost:3000/commonSpaces/1 \
  -H "Content-Type: application/json" \
  -d '{
    "capacity": 200
  }'
```

### Reservas

**Base URL**: `http://localhost:3000/reservations`

#### GET /reservations
Obtener todas las reservas

```bash
curl http://localhost:3000/reservations
```

#### GET /reservations?commonSpaceId=1
Filtrar reservas por espacio común

```bash
curl http://localhost:3000/reservations?commonSpaceId=1
```

#### GET /reservations?status=CONFIRMED
Filtrar reservas por estado

```bash
curl http://localhost:3000/reservations?status=CONFIRMED
```

#### GET /reservations/:id
Obtener una reserva específica

```bash
curl http://localhost:3000/reservations/1
```

#### POST /reservations
Crear una nueva reserva

```bash
curl -X POST http://localhost:3000/reservations \
  -H "Content-Type: application/json" \
  -d '{
    "commonSpaceId": "1",
    "residentId": "1",
    "date": "2026-01-10T00:00:00.000Z",
    "startTime": "14:00",
    "endTime": "18:00",
    "type": "CUMPLEANOS",
    "numberOfGuests": 50,
    "purpose": "Celebración de cumpleaños",
    "notes": "Se requiere sistema de sonido"
  }'
```

#### PATCH /reservations/:id
Actualizar una reserva

```bash
curl -X PATCH http://localhost:3000/reservations/1 \
  -H "Content-Type: application/json" \
  -d '{
    "status": "CANCELLED"
  }'
```

#### DELETE /reservations/:id
Eliminar una reserva

```bash
curl -X DELETE http://localhost:3000/reservations/1
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
- **Múltiples unidades** con información detallada y estados (DISPONIBLE, OCUPADA, EN_MANTENIMIENTO, etc.)
- **6 edificios** (Torres A, B, C y Edificios 1, 2, 3)
- **9 espacios comunes** distribuidos en diferentes edificios
- **22 reservas** de ejemplo con diferentes tipos y estados
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

## Estados de Unidad

- `DISPONIBLE`: Disponible para ocupar
- `OCUPADA`: Actualmente ocupada
- `EN_MANTENIMIENTO`: En mantenimiento
- `RESERVADA`: Reservada
- `FUERA_SERVICIO`: Fuera de servicio

## Tipos de Espacios Comunes

- `SALON_EVENTOS`: Salón de Eventos
- `GIMNASIO`: Gimnasio
- `PISCINA`: Piscina
- `QUINCHO`: Quincho
- `SALA_MULTIUSO`: Sala Multiuso
- `CANCHA_DEPORTIVA`: Cancha Deportiva
- `JARDIN`: Jardín
- `PLAYGROUND`: Playground
- `BIBLIOTECA`: Biblioteca
- `SALA_DE_JUEGOS`: Sala de Juegos
- `OTRO`: Otro

## Estados de Reserva

- `PENDING`: Pendiente
- `CONFIRMED`: Confirmada
- `CANCELLED`: Cancelada
- `COMPLETED`: Completada

## Tipos de Reserva

- `CUMPLEANOS`: Cumpleaños
- `REUNION_FAMILIAR`: Reunión Familiar
- `EVENTO_CORPORATIVO`: Evento Corporativo
- `CELEBRACION`: Celebración
- `DEPORTE`: Deporte
- `TRABAJO`: Trabajo
- `OTRO`: Otro

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
