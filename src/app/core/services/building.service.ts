import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { IBuilding, ICreateBuildingDto, ApiResponse } from '../models/building.model';
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
    
    const url = `${this.apiUrl}/condominiums/${condoId}/buildings`;
    console.log('🔍 [BuildingService] getBuildingsByCondominium URL:', url);
    console.log('🔍 [BuildingService] getBuildingsByCondominium params:', { condoId, page, limit });
    
    return this.http.get<any>(
      url,
      { params }
    ).pipe(
      map(response => {
        console.log('🔍 [BuildingService] Raw response:', response);
        // El backend devuelve { success: true, data: { success: true, data: [...], meta: {...} } }
        // Necesitamos acceder a response.data.data para obtener el array
        const buildingsData = response.data?.data || response.data || [];
        const total = response.data?.meta?.total || response.meta?.total || 0;
        
        console.log('🔍 [BuildingService] buildingsData:', buildingsData);
        console.log('🔍 [BuildingService] Is buildingsData array?', Array.isArray(buildingsData));
        
        const finalData = Array.isArray(buildingsData) ? buildingsData : [];
        console.log('🔍 [BuildingService] Final data:', finalData);
        
        return {
          data: finalData,
          total: total
        };
      })
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
      map(result => {
        console.log('🔍 [BuildingService] getActiveBuildings result:', result);
        console.log('🔍 [BuildingService] result.data:', result.data);
        console.log('🔍 [BuildingService] Is result.data array?', Array.isArray(result.data));
        // Asegurar que siempre devolvemos un array
        const buildings = Array.isArray(result.data) ? result.data : [];
        console.log('🔍 [BuildingService] Final buildings array:', buildings);
        return buildings;
      })
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

