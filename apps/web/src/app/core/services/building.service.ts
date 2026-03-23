import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { IBuilding, ICreateBuildingDto, IUpdateBuildingDto } from '../models/building.model';
import { ApiResponse } from '../models/api.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class BuildingService {
  private apiUrl = `${environment.apiUrl}/api/v1`;

  constructor(private http: HttpClient) {}

  /**
   * Get all buildings for a condominium
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
   * Get all buildings (compatibility wrapper)
   */
  getBuildings(): Observable<IBuilding[]> {
    return this.getBuildingsByCondominium('').pipe(
      map(result => result.data)
    );
  }

  /**
   * Get active buildings
   */
  getActiveBuildings(condoId: string): Observable<IBuilding[]> {
    return this.getBuildingsByCondominium(condoId).pipe(
      map(result => result.data)
    );
  }

  /**
   * Get building names
   */
  getBuildingNames(condoId: string): Observable<IBuilding[]> {
    return this.getActiveBuildings(condoId);
  }

  /**
   * Get a building by ID
   */
  getBuildingById(id: string): Observable<IBuilding> {
    return this.http.get<ApiResponse<IBuilding>>(`${this.apiUrl}/buildings/${id}`).pipe(
      map(response => response.data as IBuilding)
    );
  }

  /**
   * Create a new building in a condominium
   */
  createBuilding(condominiumId: string, building: ICreateBuildingDto): Observable<IBuilding> {
    return this.http.post<ApiResponse<IBuilding>>(
      `${this.apiUrl}/condominiums/${condominiumId}/buildings`,
      building
    ).pipe(
      map(response => response.data as IBuilding)
    );
  }

  /**
   * Update a building
   */
  updateBuilding(id: string, building: IUpdateBuildingDto): Observable<IBuilding> {
    return this.http.patch<ApiResponse<IBuilding>>(
      `${this.apiUrl}/buildings/${id}`,
      building
    ).pipe(
      map(response => response.data as IBuilding)
    );
  }

  /**
   * Activate or deactivate a building
   */
  toggleBuildingStatus(id: string, isActive: boolean): Observable<IBuilding> {
    return this.http.patch<ApiResponse<IBuilding>>(
      `${this.apiUrl}/buildings/${id}`,
      { isActive }
    ).pipe(
      map(response => response.data as IBuilding)
    );
  }
}
