import { ResidentType, DocumentType } from '@condominios/shared';
export { ResidentType, DocumentType };

export interface IResident {
  id: string;
  firstName: string;
  lastName: string;
  documentType: DocumentType;
  documentNumber: string;
  dateOfBirth: string;
  phone?: string;
  email?: string;
  userId?: string;
  unitId: string;
  residentType: ResidentType;
  moveInDate?: string;
  moveOutDate?: string;
  isPrimary: boolean;
  relationship?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ICreateResidentDto {
  firstName: string;
  lastName: string;
  documentType: DocumentType;
  documentNumber: string;
  dateOfBirth: string;
  phone?: string;
  email?: string;
  unitId: string;
  residentType: ResidentType;
  moveInDate?: string;
  isPrimary?: boolean;
  relationship?: string;
}

export interface IUpdateResidentDto {
  firstName?: string;
  lastName?: string;
  dateOfBirth?: string;
  phone?: string;
  email?: string;
  residentType?: ResidentType;
  moveInDate?: string;
  moveOutDate?: string;
  isPrimary?: boolean;
  relationship?: string;
  isActive?: boolean;
}
