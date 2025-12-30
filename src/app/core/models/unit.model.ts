export enum UnitStatus {
  DISPONIBLE = 'DISPONIBLE',
  OCUPADA = 'OCUPADA',
  EN_MANTENIMIENTO = 'EN_MANTENIMIENTO',
  RESERVADA = 'RESERVADA',
  FUERA_SERVICIO = 'FUERA_SERVICIO'
}

export interface IUnit {
  id: string;
  building: string; // Edificio
  unitNumber: string; // Número de departamento
  floor: number;
  block?: string;
  area: number; // square meters
  bedrooms: number;
  bathrooms: number;
  parkingSpots: number;
  storageUnits: number;
  currentResidentId?: string;
  status: UnitStatus;
  isOccupied: boolean; // Deprecated - mantener por compatibilidad
  createdAt: Date;
  updatedAt: Date;
}

export interface ICreateUnitDto {
  building: string; // Edificio
  unitNumber: string; // Número de departamento
  floor: number;
  block?: string;
  area: number;
  bedrooms: number;
  bathrooms: number;
  parkingSpots: number;
  storageUnits: number;
}
