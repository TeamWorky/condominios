export interface IBuilding {
  id: string;
  condominiumId: string;
  name: string;
  code: string;
  floors: number;
  undergroundFloors: number;
  hasElevator: boolean;
  address?: string;
  isActive: boolean;
  units?: IBuildingUnit[];
  createdAt: Date;
  updatedAt: Date;
}

export interface IBuildingUnit {
  id: string;
  number: string;
  floor?: number;
  status?: string;
}

export interface ICreateBuildingDto {
  name: string;
  code: string;
  floors?: number;
  undergroundFloors?: number;
  hasElevator?: boolean;
  address?: string;
}

export type IUpdateBuildingDto = Partial<ICreateBuildingDto>;
