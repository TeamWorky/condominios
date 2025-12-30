export interface IUnit {
  id: string;
  unitNumber: string;
  floor: number;
  block?: string;
  area: number; // square meters
  bedrooms: number;
  bathrooms: number;
  parkingSpots: number;
  storageUnits: number;
  currentResidentId?: string;
  isOccupied: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ICreateUnitDto {
  unitNumber: string;
  floor: number;
  block?: string;
  area: number;
  bedrooms: number;
  bathrooms: number;
  parkingSpots: number;
  storageUnits: number;
}
