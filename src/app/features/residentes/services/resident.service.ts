import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { IResident } from '../../../core/models/resident.model';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ResidentService {
  private apiUrl = `${environment.apiUrl}/residents`;

  constructor(private http: HttpClient) {}

  getResidents(): Observable<IResident[]> {
    return this.http.get<IResident[]>(this.apiUrl);
  }

  getResidentById(id: string): Observable<IResident> {
    return this.http.get<IResident>(`${this.apiUrl}/${id}`);
  }

  createResident(resident: Omit<IResident, 'id' | 'createdAt' | 'updatedAt'>): Observable<IResident> {
    return this.http.post<IResident>(this.apiUrl, {
      ...resident,
      createdAt: new Date(),
      updatedAt: new Date()
    });
  }

  updateResident(id: string, resident: Partial<IResident>): Observable<IResident> {
    return this.http.patch<IResident>(`${this.apiUrl}/${id}`, {
      ...resident,
      updatedAt: new Date()
    });
  }

  deleteResident(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
