export enum UnitStatus {
  AVAILABLE = 'AVAILABLE',
  OCCUPIED = 'OCCUPIED',
  MAINTENANCE = 'MAINTENANCE',
  RESERVED = 'RESERVED',
  OUT_OF_SERVICE = 'OUT_OF_SERVICE'
}

export enum UnitType {
  APARTMENT = 'APARTMENT',
  HOUSE = 'HOUSE',
  OFFICE = 'OFFICE',
  COMMERCIAL = 'COMMERCIAL',
  PARKING = 'PARKING',
  STORAGE = 'STORAGE'
}

export interface IUnit {
  id: string;
  buildingId: string;
  building?: {
    id: string;
    name: string;
    code: string;
  };
  number: string; // Número de unidad (ej: "101")
  floor?: number;
  block?: string;
  unitType?: UnitType;
  areaM2?: number; // Área en metros cuadrados
  aliquot?: number; // Porcentaje de alícuota (0-1)
  bedrooms?: number;
  bathrooms?: number;
  parkingSpots?: number;
  storageUnits?: number;
  status: UnitStatus;
  isOccupied: boolean;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date | null;
}

export interface ICreateUnitDto {
  buildingId: string;
  number: string;
  floor?: number;
  block?: string;
  unitType?: UnitType;
  areaM2?: number;
  aliquot?: number;
  bedrooms?: number;
  bathrooms?: number;
  parkingSpots?: number;
  storageUnits?: number;
  status?: UnitStatus;
  isOccupied?: boolean;
}

export interface IUpdateUnitDto extends Partial<ICreateUnitDto> {}

// Mapeo de estados para mostrar en español
export const UnitStatusLabels: { [key in UnitStatus]: string } = {
  [UnitStatus.AVAILABLE]: 'Disponible',
  [UnitStatus.OCCUPIED]: 'Ocupada',
  [UnitStatus.MAINTENANCE]: 'En Mantenimiento',
  [UnitStatus.RESERVED]: 'Reservada',
  [UnitStatus.OUT_OF_SERVICE]: 'Fuera de Servicio'
};

export const UnitTypeLabels: { [key in UnitType]: string } = {
  [UnitType.APARTMENT]: 'Departamento',
  [UnitType.HOUSE]: 'Casa',
  [UnitType.OFFICE]: 'Oficina',
  [UnitType.COMMERCIAL]: 'Comercial',
  [UnitType.PARKING]: 'Estacionamiento',
  [UnitType.STORAGE]: 'Bodega'
};
