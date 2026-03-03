import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { IBuilding, ICreateBuildingDto } from '../models/building.model';
import { ApiResponse } from '../models/api.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class BuildingService {
  private apiUrl = `${environment.apiUrl}/api/v1`;

  constructor(private http: HttpClient) {}

  /**
   * Obtener todos los edificios de un condominio
   */
  getBuildingsByCondominium(condoId: string, page: number = 1, limit: number = 100): Observable<{ data: IBuilding[]; total: number }> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString());
    
    return this.http.get<ApiResponse<IBuilding[]>>(
      `${this.apiUrl}/condominiums/${condoId}/buildings`,
      { params }
    ).pipe(
      map(response => ({
        data: Array.isArray(response.data) ? response.data : [],
        total: response.meta?.total || 0
      }))
    );
  }

  /**
   * Obtener todos los edificios (para compatibilidad)
   */
  getBuildings(): Observable<IBuilding[]> {
    return this.getBuildingsByCondominium('').pipe(
      map(result => result.data)
    );
  }

  /**
   * Obtener edificios activos
   */
  getActiveBuildings(condoId: string): Observable<IBuilding[]> {
    return this.getBuildingsByCondominium(condoId).pipe(
      map(result => result.data)
    );
  }

  /**
   * Obtener nombres de edificios
   */
  getBuildingNames(condoId: string): Observable<IBuilding[]> {
    return this.getActiveBuildings(condoId);
  }

  /**
   * Obtener un edificio por ID
   */
  getBuildingById(id: string): Observable<IBuilding> {
    return this.http.get<ApiResponse<IBuilding>>(`${this.apiUrl}/buildings/${id}`).pipe(
      map(response => response.data as IBuilding)
    );
  }

  /**
   * Crear un nuevo edificio
   */
  createBuilding(building: ICreateBuildingDto): Observable<IBuilding> {
    return this.http.post<ApiResponse<IBuilding>>(
      `${this.apiUrl}/buildings`,
      building
    ).pipe(
      map(response => response.data as IBuilding)
    );
  }

  /**
   * Actualizar un edificio
   */
  updateBuilding(id: string, building: Partial<IBuilding>): Observable<IBuilding> {
    return this.http.patch<ApiResponse<IBuilding>>(
      `${this.apiUrl}/buildings/${id}`,
      building
    ).pipe(
      map(response => response.data as IBuilding)
    );
  }

  /**
   * Eliminar un edificio
   */
  deleteBuilding(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/buildings/${id}`);
  }
}

