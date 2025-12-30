export interface IBuilding {
  id: string;
  name: string;
  description?: string;
  address?: string;
  totalFloors?: number;
  totalUnits?: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ICreateBuildingDto {
  name: string;
  description?: string;
  address?: string;
  totalFloors?: number;
  totalUnits?: number;
}

