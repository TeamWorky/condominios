import { Injectable } from '@angular/core';
import { Observable, forkJoin, of } from 'rxjs';
import { map, switchMap, catchError } from 'rxjs/operators';
import { BuildingService } from './building.service';
import { UnitService } from '../../features/unidades/services/unit.service';
import { ResidentService } from '../../features/residentes/services/resident.service';
import { DashboardStats } from '../models/dashboard.models';

const MAX_UNITS_FOR_RESIDENT_COUNT = 50;

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  constructor(
    private buildingService: BuildingService,
    private unitService: UnitService,
    private residentService: ResidentService
  ) {}

  loadStats(condominiumId: string): Observable<DashboardStats> {
    return forkJoin({
      buildings: this.buildingService.getBuildingsByCondominium(condominiumId, 1, 1).pipe(
        catchError(() => of({ data: [], total: 0 }))
      ),
      units: this.unitService.getUnitsByCondominium(condominiumId, 1, 999).pipe(
        catchError(() => of({ data: [], total: 0 }))
      )
    }).pipe(
      switchMap(({ buildings, units }) => {
        const totalBuildings = buildings.total;
        const totalUnits = units.total;
        const unitsData = Array.isArray(units.data) ? units.data : [];
        const occupiedUnits = unitsData.filter(u => u.isOccupied).length;
        const occupancyRate = totalUnits > 0 ? Math.round((occupiedUnits / totalUnits) * 100) : 0;

        if (totalUnits === 0 || totalUnits > MAX_UNITS_FOR_RESIDENT_COUNT) {
          return of<DashboardStats>({
            totalBuildings,
            totalUnits,
            occupiedUnits,
            occupancyRate,
            totalResidents: 0,
            residentsAvailable: totalUnits <= MAX_UNITS_FOR_RESIDENT_COUNT
          });
        }

        const residentCounts$ = unitsData.map(unit =>
          this.residentService.getResidentCountByUnit(unit.id).pipe(
            catchError(() => of(0))
          )
        );

        return forkJoin(residentCounts$).pipe(
          map(counts => ({
            totalBuildings,
            totalUnits,
            occupiedUnits,
            occupancyRate,
            totalResidents: counts.reduce((sum, count) => sum + count, 0),
            residentsAvailable: true
          })),
          catchError(() => of<DashboardStats>({
            totalBuildings,
            totalUnits,
            occupiedUnits,
            occupancyRate,
            totalResidents: 0,
            residentsAvailable: false
          }))
        );
      }),
      catchError(() => of<DashboardStats>({
        totalBuildings: 0,
        totalUnits: 0,
        occupiedUnits: 0,
        occupancyRate: 0,
        totalResidents: 0,
        residentsAvailable: false
      }))
    );
  }
}
