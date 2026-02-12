import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ICommonSpace, ICreateCommonSpaceDto, CommonSpaceType } from '../models/common-space.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class CommonSpaceService {
  private apiUrl = `${environment.apiUrl}/commonSpaces`;

  constructor(private http: HttpClient) {}

  getCommonSpaces(): Observable<ICommonSpace[]> {
    return this.http.get<ICommonSpace[]>(this.apiUrl);
  }

  getCommonSpaceById(id: string): Observable<ICommonSpace> {
    return this.http.get<ICommonSpace>(`${this.apiUrl}/${id}`);
  }

  getCommonSpacesByBuilding(buildingId: string): Observable<ICommonSpace[]> {
    return this.http.get<ICommonSpace[]>(`${this.apiUrl}?buildingId=${buildingId}`);
  }

  getCommonSpacesByType(type: CommonSpaceType): Observable<ICommonSpace[]> {
    return this.http.get<ICommonSpace[]>(`${this.apiUrl}?type=${type}`);
  }

  createCommonSpace(space: ICreateCommonSpaceDto): Observable<ICommonSpace> {
    return this.http.post<ICommonSpace>(this.apiUrl, {
      ...space,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    });
  }

  getReservableSpaces(): Observable<ICommonSpace[]> {
    return this.http.get<ICommonSpace[]>(`${this.apiUrl}?isReservable=true`);
  }

  updateCommonSpace(id: string, space: Partial<ICommonSpace>): Observable<ICommonSpace> {
    return this.http.patch<ICommonSpace>(`${this.apiUrl}/${id}`, {
      ...space,
      updatedAt: new Date()
    });
  }

  deleteCommonSpace(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}

