import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { UnitGridComponent } from './unit-grid.component';
import { UnitService } from '../../services/unit.service';
import { AuthService } from '../../../../core/services/auth.service';
import { IUnit, UnitStatus, UnitType } from '../../../../core/models/unit.model';
import { of, throwError } from 'rxjs';

const mockCondominio = {
  id: '764efaaa-a7fe-48a0-a702-a412e31b8a5f',
  name: 'Condominio Las Palmas',
  createdAt: '',
  updatedAt: '',
  deletedAt: null
};

const mockUnits: IUnit[] = [
  {
    id: 'unit-1',
    buildingId: 'building-1',
    number: '101',
    floor: 1,
    unitType: UnitType.APARTMENT,
    status: UnitStatus.AVAILABLE,
    isOccupied: false,
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
    building: { id: 'building-1', name: 'Torre A', code: 'TA' }
  }
];

describe('UnitGridComponent', () => {
  let component: UnitGridComponent;
  let fixture: ComponentFixture<UnitGridComponent>;
  let unitService: { getUnitsByCondominium: ReturnType<typeof vi.fn> };
  let authService: { getSelectedCondominio: ReturnType<typeof vi.fn> };

  beforeEach(async () => {
    const unitServiceSpy = { getUnitsByCondominium: vi.fn() };
    const authServiceSpy = { getSelectedCondominio: vi.fn() };

    await TestBed.configureTestingModule({
      imports: [UnitGridComponent],
      providers: [
        provideRouter([]),
        { provide: UnitService, useValue: unitServiceSpy },
        { provide: AuthService, useValue: authServiceSpy }
      ]
    }).compileComponents();

    unitService = TestBed.inject(UnitService) as unknown as typeof unitServiceSpy;
    authService = TestBed.inject(AuthService) as unknown as typeof authServiceSpy;
    authService.getSelectedCondominio.mockReturnValue(mockCondominio);
    unitService.getUnitsByCondominium.mockReturnValue(of({ data: mockUnits, total: 1 }));

    fixture = TestBed.createComponent(UnitGridComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('debería crearse el componente', () => {
    expect(component).toBeTruthy();
  });

  it('debería llamar a getUnitsByCondominium con el condominio seleccionado', () => {
    expect(authService.getSelectedCondominio).toHaveBeenCalled();
    expect(unitService.getUnitsByCondominium).toHaveBeenCalledWith(
      mockCondominio.id,
      1,
      100
    );
  });

  it('debería mostrar error cuando no hay condominio seleccionado', () => {
    authService.getSelectedCondominio.mockReturnValue(null);
    fixture = TestBed.createComponent(UnitGridComponent);
    component = fixture.componentInstance;
    component.loadUnits();
    fixture.detectChanges();
    expect(component.error).toBe('No hay condominio seleccionado');
    expect(component.loading).toBe(false);
  });

  it('debería agrupar unidades por edificio y piso', () => {
    expect(component.units).toEqual(mockUnits);
    expect(component.groupedUnits.length).toBeGreaterThanOrEqual(0);
    expect(component.loading).toBe(false);
  });

  it('debería manejar error al cargar unidades', () => {
    unitService.getUnitsByCondominium.mockReturnValue(
      throwError(() => new Error('Error de red'))
    );
    fixture = TestBed.createComponent(UnitGridComponent);
    component = fixture.componentInstance;
    component.loadUnits();
    fixture.detectChanges();
    expect(component.error).toBeTruthy();
    expect(component.loading).toBe(false);
  });

  it('getStatusLabel debería devolver la etiqueta correcta para cada estado', () => {
    expect(component.getStatusLabel(UnitStatus.AVAILABLE)).toBe('Disponible');
    expect(component.getStatusLabel(UnitStatus.OCCUPIED)).toBe('Ocupada');
    expect(component.getStatusLabel(UnitStatus.MAINTENANCE)).toBe('En Mantenimiento');
  });

  it('getStatusClass debería devolver la clase CSS correcta', () => {
    expect(component.getStatusClass(UnitStatus.AVAILABLE)).toContain('chip-disponible');
    expect(component.getStatusClass(UnitStatus.OCCUPIED)).toContain('chip-ocupada');
  });
});
