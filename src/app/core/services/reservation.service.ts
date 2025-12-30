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
    const dateStr = date.toISOString().split('T')[0];
    return this.http.get<IReservation[]>(`${this.apiUrl}?date=${dateStr}`);
  }

  getReservationsBySpaceAndDate(spaceId: string, date: Date): Observable<IReservation[]> {
    const dateStr = date.toISOString().split('T')[0];
    return this.http.get<IReservation[]>(`${this.apiUrl}?commonSpaceId=${spaceId}&date=${dateStr}`);
  }

  checkAvailability(spaceId: string, date: Date, startTime: string, endTime: string): Observable<boolean> {
    // Este método verifica si hay conflictos de horario
    return this.getReservationsBySpaceAndDate(spaceId, date).pipe(
      map(reservations => {
        // Filtrar solo reservas confirmadas
        const activeReservations = reservations.filter(r => r.status === 'CONFIRMED');
        
        // Verificar si hay conflictos de horario
        return !activeReservations.some(reservation => {
          const resStart = this.parseTime(reservation.startTime);
          const resEnd = this.parseTime(reservation.endTime);
          const reqStart = this.parseTime(startTime);
          const reqEnd = this.parseTime(endTime);
          
          // Verificar solapamiento de horarios
          return (reqStart < resEnd && reqEnd > resStart);
        });
      })
    );
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

