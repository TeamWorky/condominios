import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, ActivatedRoute } from '@angular/router';
import { UnitFormComponent } from './unit-form.component';
import { UnitService } from '../../services/unit.service';
import { BuildingService } from '../../../../core/services/building.service';
import { AuthService } from '../../../../core/services/auth.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { UnitType, UnitStatus } from '../../../../core/models/unit.model';
import { IBuilding } from '../../../../core/models/building.model';
import { of, throwError } from 'rxjs';

const mockCondominio = { id: 'condo-1', name: 'Test Condo', createdAt: '', updatedAt: '', deletedAt: null };
const mockBuildings: IBuilding[] = [
  { id: 'building-1', condominiumId: 'condo-1', name: 'Torre A', code: 'A', floors: 10, undergroundFloors: 0, hasElevator: false, isActive: true, createdAt: new Date(), updatedAt: new Date() }
];

describe('UnitFormComponent', () => {
  let component: UnitFormComponent;
  let fixture: ComponentFixture<UnitFormComponent>;
  let unitService: { getUnitById: ReturnType<typeof vi.fn>; createUnit: ReturnType<typeof vi.fn>; updateUnit: ReturnType<typeof vi.fn> };
  let buildingService: { getBuildingNames: ReturnType<typeof vi.fn> };
  let authService: { getSelectedCondominio: ReturnType<typeof vi.fn> };

  beforeEach(async () => {
    const unitServiceSpy = { getUnitById: vi.fn(), createUnit: vi.fn(), updateUnit: vi.fn() };
    const buildingServiceSpy = { getBuildingNames: vi.fn() };
    const authServiceSpy = { getSelectedCondominio: vi.fn() };

    await TestBed.configureTestingModule({
      imports: [UnitFormComponent],
      providers: [
        provideRouter([{ path: 'unidades', children: [] }]),
        { provide: UnitService, useValue: unitServiceSpy },
        { provide: BuildingService, useValue: buildingServiceSpy },
        { provide: AuthService, useValue: authServiceSpy },
        { provide: MatSnackBar, useValue: { open: vi.fn() } },
        {
          provide: ActivatedRoute,
          useValue: { snapshot: { paramMap: { get: (key: string) => (key === 'id' ? null : null) } } }
        }
      ]
    }).compileComponents();

    unitService = TestBed.inject(UnitService) as unknown as typeof unitServiceSpy;
    buildingService = TestBed.inject(BuildingService) as unknown as typeof buildingServiceSpy;
    authService = TestBed.inject(AuthService) as unknown as typeof authServiceSpy;

    authService.getSelectedCondominio.mockReturnValue(mockCondominio);
    buildingService.getBuildingNames.mockReturnValue(of(mockBuildings));

    fixture = TestBed.createComponent(UnitFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('debería crearse el componente', () => {
    expect(component).toBeTruthy();
  });

  it('debería cargar edificios al iniciar cuando hay condominio seleccionado', () => {
    expect(authService.getSelectedCondominio).toHaveBeenCalled();
    expect(buildingService.getBuildingNames).toHaveBeenCalledWith(mockCondominio.id);
    expect(component.buildings).toEqual(mockBuildings);
    expect(component.loadingBuildings).toBe(false);
  });

  it('getBuildingsArray debería devolver siempre un array', () => {
    expect(component.getBuildingsArray()).toEqual(mockBuildings);
    component.buildings = null as any;
    expect(Array.isArray(component.getBuildingsArray())).toBe(true);
    expect(component.getBuildingsArray().length).toBe(0);
  });

  it('debería tener formulario con campos requeridos', () => {
    expect(component.unitForm).toBeDefined();
    expect(component.unitForm.get('buildingId')).toBeTruthy();
    expect(component.unitForm.get('number')).toBeTruthy();
    expect(component.unitForm.get('buildingId')?.hasError('required')).toBe(true);
    expect(component.unitForm.get('number')?.hasError('required')).toBe(true);
  });

  it('debería estar en modo creación cuando no hay id en la ruta', () => {
    expect(component.isEditMode).toBe(false);
  });

  it('debería mostrar error cuando no hay condominio seleccionado', () => {
    authService.getSelectedCondominio.mockReturnValue(null);
    fixture = TestBed.createComponent(UnitFormComponent);
    component = fixture.componentInstance;
    component.loadBuildings();
    expect(component.error).toBe('No hay condominio seleccionado');
  });

  it('onSubmit no debería llamar al servicio si el formulario es inválido', () => {
    component.unitForm.patchValue({ buildingId: '', number: '' });
    component.onSubmit();
    expect(unitService.createUnit).not.toHaveBeenCalled();
    expect(unitService.updateUnit).not.toHaveBeenCalled();
  });

  it('onSubmit debería llamar createUnit en modo creación con formulario válido', () => {
    component.unitForm.patchValue({
      buildingId: 'building-1',
      number: '102',
      floor: 2,
      unitType: UnitType.APARTMENT,
      areaM2: 85,
      bedrooms: 2,
      bathrooms: 1,
      parkingSpots: 1,
      storageUnits: 0
    });
    unitService.createUnit.mockReturnValue(of({} as any));
    component.onSubmit();
    expect(unitService.createUnit).toHaveBeenCalled();
  });
});
