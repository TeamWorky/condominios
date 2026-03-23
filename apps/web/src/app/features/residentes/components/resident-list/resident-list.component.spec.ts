import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { of, throwError } from 'rxjs';

import { ResidentListComponent } from './resident-list.component';
import { ResidentService } from '../../services/resident.service';
import { BuildingService } from '../../../../core/services/building.service';
import { UnitService } from '../../../unidades/services/unit.service';
import { AuthService } from '../../../../core/services/auth.service';
import { IResident, ResidentType, DocumentType } from '../../../../core/models/resident.model';
import { IBuilding } from '../../../../core/models/building.model';

describe('ResidentListComponent', () => {
  let component: ResidentListComponent;
  let fixture: ComponentFixture<ResidentListComponent>;
  let residentService: any;
  let buildingService: any;
  let unitService: any;
  let authService: any;

  const mockBuildings: IBuilding[] = [
    {
      id: 'b1',
      condominiumId: 'condo-1',
      name: 'Edificio A',
      code: 'A',
      floors: 10,
      undergroundFloors: 0,
      hasElevator: true,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ];

  const mockUnits = [
    { id: 'u1', buildingId: 'b1', number: '101', status: 'OCCUPIED', isOccupied: true, createdAt: new Date(), updatedAt: new Date() },
    { id: 'u2', buildingId: 'b1', number: '102', status: 'AVAILABLE', isOccupied: false, createdAt: new Date(), updatedAt: new Date() },
  ];

  const mockResidents: IResident[] = [
    {
      id: 'r1',
      firstName: 'Juan',
      lastName: 'Perez',
      documentType: DocumentType.RUT,
      documentNumber: '12345678-9',
      dateOfBirth: '1990-01-01',
      unitId: 'u1',
      residentType: ResidentType.OWNER,
      isPrimary: true,
      isActive: true,
      createdAt: '2024-01-01',
      updatedAt: '2024-01-01',
    },
    {
      id: 'r2',
      firstName: 'Maria',
      lastName: 'Lopez',
      documentType: DocumentType.RUT,
      documentNumber: '98765432-1',
      dateOfBirth: '1985-05-15',
      unitId: 'u1',
      residentType: ResidentType.TENANT,
      isPrimary: false,
      isActive: false,
      createdAt: '2024-01-01',
      updatedAt: '2024-01-01',
    },
  ];

  const mockCondominio = { id: 'condo-1', name: 'Test Condo' };

  beforeEach(async () => {
    const residentServiceMock = {
      getResidentsByUnit: vi.fn().mockReturnValue(of({ data: mockResidents, total: 2 })),
      toggleResidentStatus: vi.fn().mockReturnValue(of(mockResidents[0])),
      deleteResident: vi.fn().mockReturnValue(of(undefined)),
    };

    const buildingServiceMock = {
      getBuildingsByCondominium: vi.fn().mockReturnValue(of({ data: mockBuildings, total: 1 })),
    };

    const unitServiceMock = {
      getUnitsByBuilding: vi.fn().mockReturnValue(of({ data: mockUnits, total: 2 })),
    };

    const authServiceMock = {
      getSelectedCondominio: vi.fn().mockReturnValue(mockCondominio),
    };

    await TestBed.configureTestingModule({
      imports: [ResidentListComponent, NoopAnimationsModule],
      providers: [
        provideRouter([{ path: 'residentes', children: [] }, { path: '**', redirectTo: '' }]),
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: ResidentService, useValue: residentServiceMock },
        { provide: BuildingService, useValue: buildingServiceMock },
        { provide: UnitService, useValue: unitServiceMock },
        { provide: AuthService, useValue: authServiceMock },
      ],
    }).compileComponents();

    residentService = TestBed.inject(ResidentService);
    buildingService = TestBed.inject(BuildingService);
    unitService = TestBed.inject(UnitService);
    authService = TestBed.inject(AuthService);
    fixture = TestBed.createComponent(ResidentListComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load buildings on init', () => {
    fixture.detectChanges();
    expect(buildingService.getBuildingsByCondominium).toHaveBeenCalledWith('condo-1', 1, 100);
    expect(component.buildings.length).toBe(1);
    expect(component.loadingBuildings).toBe(false);
  });

  it('should show error when no condominium selected', () => {
    authService.getSelectedCondominio.mockReturnValue(null);
    fixture.detectChanges();
    expect(component.error).toBe('No hay condominio seleccionado');
    expect(component.loadingBuildings).toBe(false);
  });

  it('should handle building load error', () => {
    buildingService.getBuildingsByCondominium.mockReturnValue(throwError(() => new Error('fail')));
    fixture.detectChanges();
    expect(component.error).toBe('Error al cargar los edificios');
  });

  it('should load units when building is selected', () => {
    fixture.detectChanges();
    component.onBuildingChange('b1');
    expect(unitService.getUnitsByBuilding).toHaveBeenCalledWith('b1', 1, 100);
    expect(component.units.length).toBe(2);
    expect(component.selectedBuildingId).toBe('b1');
  });

  it('should reset units and residents when building changes', () => {
    fixture.detectChanges();
    component.selectedUnitId = 'u1';
    component.dataSource.data = mockResidents;
    component.onBuildingChange('b1');
    expect(component.selectedUnitId).toBeNull();
    expect(component.dataSource.data.length).toBe(0);
  });

  it('should load residents when unit is selected', () => {
    fixture.detectChanges();
    component.onUnitChange('u1');
    expect(residentService.getResidentsByUnit).toHaveBeenCalledWith('u1', 1, 10);
    expect(component.dataSource.data.length).toBe(2);
    expect(component.total).toBe(2);
  });

  it('should handle resident load error', () => {
    residentService.getResidentsByUnit.mockReturnValue(throwError(() => new Error('fail')));
    fixture.detectChanges();
    component.onUnitChange('u1');
    expect(component.error).toBe('Error al cargar los residentes');
  });

  it('should change page', () => {
    fixture.detectChanges();
    component.selectedUnitId = 'u1';
    component.onPageChange({ pageIndex: 1, pageSize: 25, length: 50 });
    expect(component.currentPage).toBe(2);
    expect(component.pageSize).toBe(25);
    expect(residentService.getResidentsByUnit).toHaveBeenCalledWith('u1', 2, 25);
  });

  it('should return correct resident type labels', () => {
    expect(component.getResidentTypeLabel('OWNER')).toBe('Propietario');
    expect(component.getResidentTypeLabel('TENANT')).toBe('Arrendatario');
    expect(component.getResidentTypeLabel('FAMILY_MEMBER')).toBe('Familiar');
    expect(component.getResidentTypeLabel('GUEST')).toBe('Invitado');
  });

  it('should return correct status class and label', () => {
    expect(component.getStatusClass(true)).toBe('chip-active');
    expect(component.getStatusClass(false)).toBe('chip-inactive');
    expect(component.getStatusLabel(true)).toBe('Activo');
    expect(component.getStatusLabel(false)).toBe('Inactivo');
  });

  it('should open confirmation dialog when toggling status', () => {
    fixture.detectChanges();
    const dialogSpy = vi.spyOn((component as any).dialog, 'open')
      .mockReturnValue({ afterClosed: () => of(false) });

    component.onToggleStatus(mockResidents[0]);

    expect(dialogSpy).toHaveBeenCalledWith(expect.any(Function), expect.objectContaining({
      data: expect.objectContaining({
        title: expect.any(String),
        message: expect.stringContaining('Juan Perez'),
      }),
    }));
  });

  it('should call toggleResidentStatus when user confirms', () => {
    fixture.detectChanges();
    component.selectedUnitId = 'u1';
    vi.spyOn((component as any).dialog, 'open')
      .mockReturnValue({ afterClosed: () => of(true) });

    component.onToggleStatus(mockResidents[0]);

    expect(residentService.toggleResidentStatus).toHaveBeenCalledWith('r1', false);
  });

  it('should not call toggleResidentStatus when user cancels', () => {
    fixture.detectChanges();
    vi.spyOn((component as any).dialog, 'open')
      .mockReturnValue({ afterClosed: () => of(false) });

    component.onToggleStatus(mockResidents[0]);

    expect(residentService.toggleResidentStatus).not.toHaveBeenCalled();
  });

  it('should show error snackbar when toggle fails', () => {
    fixture.detectChanges();
    component.selectedUnitId = 'u1';
    vi.spyOn((component as any).dialog, 'open')
      .mockReturnValue({ afterClosed: () => of(true) });
    residentService.toggleResidentStatus.mockReturnValue(throwError(() => new Error('fail')));
    const snackSpy = vi.spyOn((component as any).snackBar, 'open');

    component.onToggleStatus(mockResidents[0]);

    expect(snackSpy).toHaveBeenCalledWith(
      'Error al cambiar el estado del residente',
      'Cerrar',
      expect.any(Object),
    );
  });

  it('should filter out inactive buildings', () => {
    const mixedBuildings = [
      ...mockBuildings,
      { ...mockBuildings[0], id: 'b2', name: 'Edificio B', isActive: false },
    ];
    buildingService.getBuildingsByCondominium.mockReturnValue(of({ data: mixedBuildings, total: 2 }));
    fixture.detectChanges();
    expect(component.buildings.length).toBe(1);
    expect(component.buildings[0].name).toBe('Edificio A');
  });
});
