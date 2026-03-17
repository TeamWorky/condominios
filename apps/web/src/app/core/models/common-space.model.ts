import { CommonSpaceType } from '@condominios/shared';
export { CommonSpaceType };

export interface ICommonSpace {
  id: string;
  buildingId: string; // Relación con el edificio
  name: string;
  type: CommonSpaceType;
  description?: string;
  location?: string; // Ubicación dentro del edificio (ej: "Piso 1", "Terraza", "Exterior")
  capacity?: number; // Capacidad de personas
  area?: number; // Área en m²
  amenities?: string[]; // Amenidades disponibles (ej: ["WiFi", "Aire acondicionado", "Cocina"])
  isReservable: boolean; // Si el espacio se puede reservar
  reservationStartTime?: string; // Hora de inicio para reservas (formato HH:mm, ej: "08:00")
  reservationEndTime?: string; // Hora de término para reservas (formato HH:mm, ej: "22:00")
  isExclusive: boolean; // Si es exclusivo (solo una reserva a la vez) o compartido (múltiples reservas simultáneas)
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ICreateCommonSpaceDto {
  buildingId: string;
  name: string;
  type: CommonSpaceType;
  description?: string;
  location?: string;
  capacity?: number;
  area?: number;
  amenities?: string[];
  isReservable: boolean;
  reservationStartTime?: string; // Hora de inicio para reservas (formato HH:mm)
  reservationEndTime?: string; // Hora de término para reservas (formato HH:mm)
  isExclusive: boolean; // Si es exclusivo (solo una reserva a la vez) o compartido
}

