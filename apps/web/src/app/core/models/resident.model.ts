export interface IResident {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  unitNumber: string;
  residentType: ResidentType;
  documentType: DocumentType;
  documentNumber: string;
  isActive: boolean;
  moveInDate: Date;
  moveOutDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export enum ResidentType {
  OWNER = 'OWNER',
  TENANT = 'TENANT'
}

export enum DocumentType {
  RUT = 'RUT',
  PASSPORT = 'PASSPORT',
  DNI = 'DNI'
}

export interface ICreateResidentDto {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  unitNumber: string;
  residentType: ResidentType;
  documentType: DocumentType;
  documentNumber: string;
  moveInDate: Date;
}

export interface IUpdateResidentDto extends Partial<ICreateResidentDto> {
  id: string;
}
