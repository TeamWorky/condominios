import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { IBuilding, ICreateBuildingDto } from '../models/building.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class BuildingService {
  private apiUrl = `${environment.apiUrl}/buildings`;

  constructor(private http: HttpClient) {}

  getBuildings(): Observable<IBuilding[]> {
    return this.http.get<IBuilding[]>(this.apiUrl);
  }

  getActiveBuildings(): Observable<IBuilding[]> {
    return this.http.get<IBuilding[]>(`${this.apiUrl}?isActive=true`);
  }

  getBuildingNames(): Observable<string[]> {
    return this.getActiveBuildings().pipe(
      map(buildings => buildings.map(b => b.name))
    );
  }

  getBuildingById(id: string): Observable<IBuilding> {
    return this.http.get<IBuilding>(`${this.apiUrl}/${id}`);
  }

  createBuilding(building: ICreateBuildingDto): Observable<IBuilding> {
    return this.http.post<IBuilding>(this.apiUrl, {
      ...building,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    });
  }

  updateBuilding(id: string, building: Partial<IBuilding>): Observable<IBuilding> {
    return this.http.patch<IBuilding>(`${this.apiUrl}/${id}`, {
      ...building,
      updatedAt: new Date()
    });
  }

  deleteBuilding(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}

