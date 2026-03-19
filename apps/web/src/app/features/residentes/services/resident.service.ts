import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { IResident } from '../../../core/models/resident.model';
import { ApiResponse } from '../../../core/models/api.model';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ResidentService {
  private apiUrl = `${environment.apiUrl}/api/v1`;

  constructor(private http: HttpClient) {}

  getResidentsByUnit(unitId: string, page: number = 1, limit: number = 10): Observable<{ data: IResident[]; total: number }> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString());

    return this.http.get<ApiResponse<IResident[]>>(
      `${this.apiUrl}/units/${unitId}/residents`,
      { params }
    ).pipe(
      map(response => ({
        data: Array.isArray(response.data) ? response.data : [],
        total: response.meta?.total || 0
      }))
    );
  }

  getResidentCountByUnit(unitId: string): Observable<number> {
    return this.getResidentsByUnit(unitId, 1, 1).pipe(
      map(result => result.total)
    );
  }

  getResidentById(id: string): Observable<IResident> {
    return this.http.get<ApiResponse<IResident>>(`${this.apiUrl}/residents/${id}`).pipe(
      map(response => response.data as IResident)
    );
  }

  createResident(unitId: string, resident: Omit<IResident, 'id' | 'createdAt' | 'updatedAt'>): Observable<IResident> {
    return this.http.post<ApiResponse<IResident>>(
      `${this.apiUrl}/units/${unitId}/residents`,
      resident
    ).pipe(
      map(response => response.data as IResident)
    );
  }

  updateResident(id: string, resident: Partial<IResident>): Observable<IResident> {
    return this.http.patch<ApiResponse<IResident>>(
      `${this.apiUrl}/residents/${id}`,
      resident
    ).pipe(
      map(response => response.data as IResident)
    );
  }

  deleteResident(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/residents/${id}`);
  }
}
