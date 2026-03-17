import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { IUnit, ICreateUnitDto, IUpdateUnitDto, UnitStatus } from '../../../core/models/unit.model';
import { ApiResponse } from '../../../core/models/api.model';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class UnitService {
  private apiUrl = `${environment.apiUrl}/api/v1`;

  constructor(private http: HttpClient) {}

  getUnitsByCondominium(condoId: string, page: number = 1, limit: number = 10): Observable<{ data: IUnit[]; total: number }> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString());

    return this.http.get<ApiResponse<IUnit[]>>(
      `${this.apiUrl}/condominiums/${condoId}/units`,
      { params }
    ).pipe(
      map(response => ({
        data: response.data || [],
        total: response.meta?.total || 0
      }))
    );
  }

  getUnitsByBuilding(buildingId: string, page: number = 1, limit: number = 10): Observable<{ data: IUnit[]; total: number }> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString());

    return this.http.get<ApiResponse<IUnit[]>>(
      `${this.apiUrl}/buildings/${buildingId}/units`,
      { params }
    ).pipe(
      map(response => ({
        data: response.data || [],
        total: response.meta?.total || 0
      }))
    );
  }

  getUnitById(id: string): Observable<IUnit> {
    return this.http.get<ApiResponse<IUnit>>(`${this.apiUrl}/units/${id}`).pipe(
      map(response => response.data as IUnit)
    );
  }

  createUnit(buildingId: string, unit: ICreateUnitDto): Observable<IUnit> {
    return this.http.post<ApiResponse<IUnit>>(
      `${this.apiUrl}/buildings/${buildingId}/units`,
      unit
    ).pipe(
      map(response => response.data as IUnit)
    );
  }

  updateUnit(id: string, unit: IUpdateUnitDto): Observable<IUnit> {
    return this.http.patch<ApiResponse<IUnit>>(
      `${this.apiUrl}/units/${id}`,
      unit
    ).pipe(
      map(response => response.data as IUnit)
    );
  }

  deleteUnit(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/units/${id}`);
  }

  updateUnitStatus(id: string, status: UnitStatus): Observable<IUnit> {
    return this.updateUnit(id, { status, isOccupied: status === UnitStatus.OCCUPIED });
  }
}
