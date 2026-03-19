import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { of, throwError } from 'rxjs';
import { DashboardService } from './dashboard.service';
import { BuildingService } from './building.service';
import { UnitService } from '../../features/unidades/services/unit.service';
import { ResidentService } from '../../features/residentes/services/resident.service';
import { IUnit, UnitStatus } from '../models/unit.model';
import { IBuilding } from '../models/building.model';

describe('DashboardService', () => {
  let service: DashboardService;
  let buildingService: { getBuildingsByCondominium: ReturnType<typeof vi.fn> };
  let unitService: { getUnitsByCondominium: ReturnType<typeof vi.fn> };
  let residentService: { getResidentCountByUnit: ReturnType<typeof vi.fn> };

  const condoId = 'condo-123';

  const mockBuildings: IBuilding[] = [
    { id: 'b1', condominiumId: 'condo-123', name: 'Torre A', code: 'A', floors: 10, undergroundFloors: 1, hasElevator: true, isActive: true, createdAt: new Date(), updatedAt: new Date() }
  ];

  const mockUnits: IUnit[] = [
    { id: 'u1', buildingId: 'b1', number: '101', status: UnitStatus.OCCUPIED, isOccupied: true, createdAt: new Date(), updatedAt: new Date() },
    { id: 'u2', buildingId: 'b1', number: '102', status: UnitStatus.AVAILABLE, isOccupied: false, createdAt: new Date(), updatedAt: new Date() },
    { id: 'u3', buildingId: 'b1', number: '103', status: UnitStatus.OCCUPIED, isOccupied: true, createdAt: new Date(), updatedAt: new Date() }
  ];

  beforeEach(() => {
    buildingService = { getBuildingsByCondominium: vi.fn() };
    unitService = { getUnitsByCondominium: vi.fn() };
    residentService = { getResidentCountByUnit: vi.fn() };

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        DashboardService,
        { provide: BuildingService, useValue: buildingService },
        { provide: UnitService, useValue: unitService },
        { provide: ResidentService, useValue: residentService }
      ]
    });

    service = TestBed.inject(DashboardService);
  });

  it('deberia crearse el servicio', () => {
    expect(service).toBeTruthy();
  });

  describe('loadStats', () => {
    it('deberia retornar totales correctos de edificios y unidades', async () => {
      buildingService.getBuildingsByCondominium.mockReturnValue(of({ data: mockBuildings, total: 3 }));
      unitService.getUnitsByCondominium.mockReturnValue(of({ data: mockUnits, total: 3 }));
      residentService.getResidentCountByUnit.mockReturnValue(of(2));

      const stats = await new Promise<any>(resolve => {
        service.loadStats(condoId).subscribe(resolve);
      });

      expect(stats.totalBuildings).toBe(3);
      expect(stats.totalUnits).toBe(3);
      expect(stats.occupiedUnits).toBe(2);
    });

    it('deberia calcular occupancyRate correctamente', async () => {
      buildingService.getBuildingsByCondominium.mockReturnValue(of({ data: mockBuildings, total: 1 }));
      unitService.getUnitsByCondominium.mockReturnValue(of({ data: mockUnits, total: 3 }));
      residentService.getResidentCountByUnit.mockReturnValue(of(1));

      const stats = await new Promise<any>(resolve => {
        service.loadStats(condoId).subscribe(resolve);
      });

      expect(stats.occupancyRate).toBe(67);
    });

    it('deberia sumar residentes de todas las unidades', async () => {
      buildingService.getBuildingsByCondominium.mockReturnValue(of({ data: mockBuildings, total: 1 }));
      unitService.getUnitsByCondominium.mockReturnValue(of({ data: mockUnits, total: 3 }));
      residentService.getResidentCountByUnit
        .mockReturnValueOnce(of(2))
        .mockReturnValueOnce(of(0))
        .mockReturnValueOnce(of(3));

      const stats = await new Promise<any>(resolve => {
        service.loadStats(condoId).subscribe(resolve);
      });

      expect(stats.totalResidents).toBe(5);
      expect(stats.residentsAvailable).toBe(true);
    });

    it('deberia setear residentsAvailable=false cuando hay mas de 50 unidades', async () => {
      buildingService.getBuildingsByCondominium.mockReturnValue(of({ data: mockBuildings, total: 1 }));

      const manyUnits = Array.from({ length: 51 }, (_, i) => ({
        ...mockUnits[0],
        id: `u${i}`,
        number: `${i}`
      }));

      unitService.getUnitsByCondominium.mockReturnValue(of({ data: manyUnits, total: 51 }));

      const stats = await new Promise<any>(resolve => {
        service.loadStats(condoId).subscribe(resolve);
      });

      expect(stats.residentsAvailable).toBe(false);
      expect(stats.totalResidents).toBe(0);
    });

    it('deberia retornar stats parciales cuando building API falla', async () => {
      buildingService.getBuildingsByCondominium.mockReturnValue(throwError(() => new Error('Network error')));
      unitService.getUnitsByCondominium.mockReturnValue(of({ data: mockUnits, total: 3 }));
      residentService.getResidentCountByUnit.mockReturnValue(of(1));

      const stats = await new Promise<any>(resolve => {
        service.loadStats(condoId).subscribe(resolve);
      });

      expect(stats.totalBuildings).toBe(0);
      expect(stats.totalUnits).toBe(3);
    });

    it('deberia retornar stats parciales cuando unit API falla', async () => {
      buildingService.getBuildingsByCondominium.mockReturnValue(of({ data: mockBuildings, total: 5 }));
      unitService.getUnitsByCondominium.mockReturnValue(throwError(() => new Error('Network error')));

      const stats = await new Promise<any>(resolve => {
        service.loadStats(condoId).subscribe(resolve);
      });

      expect(stats.totalBuildings).toBe(5);
      expect(stats.totalUnits).toBe(0);
      expect(stats.occupancyRate).toBe(0);
    });

    it('deberia manejar occupancyRate=0 cuando no hay unidades', async () => {
      buildingService.getBuildingsByCondominium.mockReturnValue(of({ data: [], total: 0 }));
      unitService.getUnitsByCondominium.mockReturnValue(of({ data: [], total: 0 }));

      const stats = await new Promise<any>(resolve => {
        service.loadStats(condoId).subscribe(resolve);
      });

      expect(stats.occupancyRate).toBe(0);
      expect(stats.totalUnits).toBe(0);
    });
  });
});
