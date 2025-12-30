import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { IUnit, ICreateUnitDto, UnitStatus } from '../../../core/models/unit.model';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class UnitService {
  private apiUrl = `${environment.apiUrl}/units`;

  constructor(private http: HttpClient) {}

  getUnits(): Observable<IUnit[]> {
    return this.http.get<IUnit[]>(this.apiUrl);
  }

  getUnitById(id: string): Observable<IUnit> {
    return this.http.get<IUnit>(`${this.apiUrl}/${id}`);
  }

  getUnitsByBuilding(building: string): Observable<IUnit[]> {
    return this.http.get<IUnit[]>(`${this.apiUrl}?building=${building}`);
  }

  createUnit(unit: ICreateUnitDto): Observable<IUnit> {
    return this.http.post<IUnit>(this.apiUrl, {
      ...unit,
      status: UnitStatus.DISPONIBLE,
      isOccupied: false, // Mantener por compatibilidad
      createdAt: new Date(),
      updatedAt: new Date()
    });
  }

  updateUnit(id: string, unit: Partial<IUnit>): Observable<IUnit> {
    return this.http.patch<IUnit>(`${this.apiUrl}/${id}`, {
      ...unit,
      updatedAt: new Date()
    });
  }

  deleteUnit(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  toggleUnitStatus(id: string, isOccupied: boolean): Observable<IUnit> {
    return this.http.patch<IUnit>(`${this.apiUrl}/${id}`, {
      isOccupied,
      status: isOccupied ? UnitStatus.OCUPADA : UnitStatus.DISPONIBLE,
      updatedAt: new Date()
    });
  }

  updateUnitStatus(id: string, status: UnitStatus): Observable<IUnit> {
    return this.http.patch<IUnit>(`${this.apiUrl}/${id}`, {
      status,
      isOccupied: status === UnitStatus.OCUPADA, // Mantener por compatibilidad
      updatedAt: new Date()
    });
  }
}

