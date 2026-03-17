import { ResidentType, DocumentType } from '@condominios/shared';
export { ResidentType, DocumentType };

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
