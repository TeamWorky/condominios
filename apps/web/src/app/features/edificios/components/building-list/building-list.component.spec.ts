import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { of, throwError } from 'rxjs';

import { BuildingListComponent } from './building-list.component';
import { BuildingService } from '../../../../core/services/building.service';
import { AuthService } from '../../../../core/services/auth.service';
import { IBuilding } from '../../../../core/models/building.model';

describe('BuildingListComponent', () => {
  let component: BuildingListComponent;
  let fixture: ComponentFixture<BuildingListComponent>;
  let buildingService: any;
  let authService: any;

  const mockBuildings: IBuilding[] = [
    {
      id: '1',
      condominiumId: 'condo-1',
      name: 'Edificio A',
      code: 'A',
      floors: 10,
      undergroundFloors: 2,
      hasElevator: true,
      address: 'Calle 1 #100',
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: '2',
      condominiumId: 'condo-1',
      name: 'Edificio B',
      code: 'B',
      floors: 5,
      undergroundFloors: 0,
      hasElevator: false,
      isActive: false,
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ];

  const mockCondominio = { id: 'condo-1', name: 'Test Condo' };

  beforeEach(async () => {
    const buildingServiceMock = {
      getBuildingsByCondominium: vi.fn().mockReturnValue(of({ data: mockBuildings, total: 2 })),
      toggleBuildingStatus: vi.fn().mockReturnValue(of(mockBuildings[0]))
    };

    const authServiceMock = {
      getSelectedCondominio: vi.fn().mockReturnValue(mockCondominio)
    };

    await TestBed.configureTestingModule({
      imports: [BuildingListComponent, NoopAnimationsModule],
      providers: [
        provideRouter([{ path: 'edificios', children: [] }, { path: '**', redirectTo: '' }]),
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: BuildingService, useValue: buildingServiceMock },
        { provide: AuthService, useValue: authServiceMock }
      ]
    }).compileComponents();

    buildingService = TestBed.inject(BuildingService);
    authService = TestBed.inject(AuthService);
    fixture = TestBed.createComponent(BuildingListComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load buildings on init', () => {
    fixture.detectChanges();
    expect(buildingService.getBuildingsByCondominium).toHaveBeenCalledWith('condo-1', 1, 10);
    expect(component.dataSource.data.length).toBe(2);
    expect(component.total).toBe(2);
    expect(component.loading).toBe(false);
  });

  it('should show error when no condominium selected', () => {
    authService.getSelectedCondominio.mockReturnValue(null);
    fixture.detectChanges();
    expect(component.error).toBe('No hay condominio seleccionado');
    expect(component.loading).toBe(false);
  });

  it('should handle API error', () => {
    buildingService.getBuildingsByCondominium.mockReturnValue(throwError(() => new Error('API Error')));
    fixture.detectChanges();
    expect(component.error).toContain('Error al cargar los edificios');
    expect(component.loading).toBe(false);
  });

  it('should change page', () => {
    fixture.detectChanges();
    component.onPageChange({ pageIndex: 1, pageSize: 25, length: 50 });
    expect(component.currentPage).toBe(2);
    expect(component.pageSize).toBe(25);
    expect(buildingService.getBuildingsByCondominium).toHaveBeenCalledWith('condo-1', 2, 25);
  });

  it('should return correct status class', () => {
    expect(component.getStatusClass(true)).toBe('chip-active');
    expect(component.getStatusClass(false)).toBe('chip-inactive');
  });

  it('should return correct status label', () => {
    expect(component.getStatusLabel(true)).toBe('Activo');
    expect(component.getStatusLabel(false)).toBe('Inactivo');
  });

  it('should open confirmation dialog when toggling status', () => {
    fixture.detectChanges();
    const dialogSpy = vi.spyOn((component as any).dialog, 'open')
      .mockReturnValue({ afterClosed: () => of(false) });

    component.onToggleStatus(mockBuildings[0]);

    expect(dialogSpy).toHaveBeenCalledWith(expect.any(Function), expect.objectContaining({
      data: expect.objectContaining({
        title: expect.any(String),
        message: expect.any(String)
      })
    }));
  });

  it('should call toggleBuildingStatus when user confirms', () => {
    fixture.detectChanges();
    vi.spyOn((component as any).dialog, 'open')
      .mockReturnValue({ afterClosed: () => of(true) });

    component.onToggleStatus(mockBuildings[0]);

    expect(buildingService.toggleBuildingStatus).toHaveBeenCalledWith('1', false);
  });

  it('should not call toggleBuildingStatus when user cancels', () => {
    fixture.detectChanges();
    vi.spyOn((component as any).dialog, 'open')
      .mockReturnValue({ afterClosed: () => of(false) });

    component.onToggleStatus(mockBuildings[0]);

    expect(buildingService.toggleBuildingStatus).not.toHaveBeenCalled();
  });

  it('should reload buildings after successful toggle', () => {
    fixture.detectChanges();
    vi.spyOn((component as any).dialog, 'open')
      .mockReturnValue({ afterClosed: () => of(true) });
    const loadSpy = vi.spyOn(component, 'loadBuildings');

    component.onToggleStatus(mockBuildings[1]);

    expect(buildingService.toggleBuildingStatus).toHaveBeenCalledWith('2', true);
    expect(loadSpy).toHaveBeenCalled();
  });

  it('should show error snackbar when toggle fails', () => {
    fixture.detectChanges();
    vi.spyOn((component as any).dialog, 'open')
      .mockReturnValue({ afterClosed: () => of(true) });
    buildingService.toggleBuildingStatus.mockReturnValue(throwError(() => new Error('fail')));
    const snackSpy = vi.spyOn((component as any).snackBar, 'open');

    component.onToggleStatus(mockBuildings[0]);

    expect(snackSpy).toHaveBeenCalledWith('Error al cambiar el estado del edificio', 'Cerrar', expect.any(Object));
  });
});
