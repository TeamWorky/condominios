import { ReservationStatus, ReservationType } from '@condominios/shared';
export { ReservationStatus, ReservationType };

export interface IReservation {
  id: string;
  commonSpaceId: string;
  residentId: string;
  residentName: string;
  unitNumber: string;
  date: Date | string; // Fecha de la reserva (puede ser Date o string desde API)
  startTime: string; // Hora de inicio (formato HH:mm)
  endTime: string; // Hora de término (formato HH:mm)
  status: ReservationStatus;
  type?: ReservationType; // Tipo de reserva para colores
  numberOfGuests?: number;
  purpose?: string; // Propósito de la reserva
  notes?: string;
  createdAt: Date | string; // Puede ser Date o string desde API
  updatedAt: Date | string; // Puede ser Date o string desde API
}

export interface ICreateReservationDto {
  commonSpaceId: string;
  residentId: string;
  date: Date;
  startTime: string;
  endTime: string;
  type?: ReservationType;
  numberOfGuests?: number;
  purpose?: string;
  notes?: string;
}

