import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { IReservation, ICreateReservationDto, ReservationStatus } from '../models/reservation.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ReservationService {
  private apiUrl = `${environment.apiUrl}/reservations`;

  constructor(private http: HttpClient) {}

  getReservations(): Observable<IReservation[]> {
    return this.http.get<IReservation[]>(this.apiUrl);
  }

  getReservationById(id: string): Observable<IReservation> {
    return this.http.get<IReservation>(`${this.apiUrl}/${id}`);
  }

  getReservationsBySpace(spaceId: string): Observable<IReservation[]> {
    return this.http.get<IReservation[]>(`${this.apiUrl}?commonSpaceId=${spaceId}`);
  }

  getReservationsByDate(date: Date): Observable<IReservation[]> {
    // Normalizar la fecha a UTC para evitar problemas de zona horaria
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const dateStr = `${year}-${month}-${day}`;
    
    return this.http.get<IReservation[]>(this.apiUrl).pipe(
      map(reservations => {
        return reservations.filter(reservation => {
          // Convertir la fecha de la reserva a string para comparar
          const reservationDate = new Date(reservation.date);
          const reservationDateStr = `${reservationDate.getFullYear()}-${String(reservationDate.getMonth() + 1).padStart(2, '0')}-${String(reservationDate.getDate()).padStart(2, '0')}`;
          return reservationDateStr === dateStr;
        });
      })
    );
  }

  getReservationsBySpaceAndDate(spaceId: string, date: Date): Observable<IReservation[]> {
    // Normalizar la fecha a UTC para evitar problemas de zona horaria
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const dateStr = `${year}-${month}-${day}`;
    
    return this.http.get<IReservation[]>(`${this.apiUrl}?commonSpaceId=${spaceId}`).pipe(
      map(reservations => {
        return reservations.filter(reservation => {
          // Convertir la fecha de la reserva a string para comparar
          const reservationDate = new Date(reservation.date);
          const reservationDateStr = `${reservationDate.getFullYear()}-${String(reservationDate.getMonth() + 1).padStart(2, '0')}-${String(reservationDate.getDate()).padStart(2, '0')}`;
          return reservationDateStr === dateStr;
        });
      })
    );
  }

  checkAvailability(spaceId: string, date: Date, startTime: string, endTime: string, isExclusive: boolean = true): Observable<boolean> {
    // Este método verifica si hay conflictos de horario
    return this.getReservationsBySpaceAndDate(spaceId, date).pipe(
      map(reservations => {
        // Filtrar solo reservas confirmadas
        const activeReservations = reservations.filter(r => r.status === ReservationStatus.CONFIRMED);
        
        // Si no hay reservas activas, está disponible
        if (activeReservations.length === 0) {
          return true;
        }
        
        // Convertir horarios a minutos para comparación precisa
        const reqStartMinutes = this.timeToMinutes(startTime);
        const reqEndMinutes = this.timeToMinutes(endTime);
        
        if (isExclusive) {
          // Para espacios exclusivos: no puede haber ninguna reserva que se solape
          return !activeReservations.some(reservation => {
            const resStartMinutes = this.timeToMinutes(reservation.startTime);
            const resEndMinutes = this.timeToMinutes(reservation.endTime);
            
            // Verificar solapamiento de horarios: hay conflicto si los rangos se superponen
            return (reqStartMinutes < resEndMinutes && reqEndMinutes > resStartMinutes);
          });
        } else {
          // Para espacios compartidos: permitir múltiples reservas simultáneas
          // Por ahora, también verificamos solapamiento para evitar conflictos
          // En el futuro, podríamos permitir múltiples reservas siempre que no excedan la capacidad
          return !activeReservations.some(reservation => {
            const resStartMinutes = this.timeToMinutes(reservation.startTime);
            const resEndMinutes = this.timeToMinutes(reservation.endTime);
            
            // Verificar solapamiento de horarios: hay conflicto si los rangos se superponen
            return (reqStartMinutes < resEndMinutes && reqEndMinutes > resStartMinutes);
          });
        }
      })
    );
  }

  private timeToMinutes(timeStr: string): number {
    const [hour, minute] = timeStr.split(':').map(Number);
    return hour * 60 + minute;
  }

  private parseTime(timeStr: string): { hour: number; minute: number } {
    const [hour, minute] = timeStr.split(':').map(Number);
    return { hour, minute };
  }

  createReservation(reservation: ICreateReservationDto): Observable<IReservation> {
    return this.http.post<IReservation>(this.apiUrl, {
      ...reservation,
      status: ReservationStatus.CONFIRMED,
      createdAt: new Date(),
      updatedAt: new Date()
    });
  }

  updateReservation(id: string, reservation: Partial<IReservation>): Observable<IReservation> {
    return this.http.patch<IReservation>(`${this.apiUrl}/${id}`, {
      ...reservation,
      updatedAt: new Date()
    });
  }

  cancelReservation(id: string): Observable<IReservation> {
    return this.http.patch<IReservation>(`${this.apiUrl}/${id}`, {
      status: ReservationStatus.CANCELLED,
      updatedAt: new Date()
    });
  }

  deleteReservation(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}

