import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { UnitListComponent } from './unit-list.component';
import { UnitService } from '../../services/unit.service';
import { AuthService } from '../../../../core/services/auth.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { PageEvent } from '@angular/material/paginator';
import { IUnit, UnitStatus, UnitType } from '../../../../core/models/unit.model';
import { of, throwError } from 'rxjs';

const mockCondominio = { id: 'condo-1', name: 'Test Condo', createdAt: '', updatedAt: '', deletedAt: null };

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

describe('UnitListComponent', () => {
  let component: UnitListComponent;
  let fixture: ComponentFixture<UnitListComponent>;
  let unitService: { getUnitsByCondominium: ReturnType<typeof vi.fn>; deleteUnit: ReturnType<typeof vi.fn> };
  let authService: { getSelectedCondominio: ReturnType<typeof vi.fn> };

  beforeEach(async () => {
    const unitServiceSpy = { getUnitsByCondominium: vi.fn(), deleteUnit: vi.fn() };
    const authServiceSpy = { getSelectedCondominio: vi.fn() };

    await TestBed.configureTestingModule({
      imports: [UnitListComponent],
      providers: [
        provideRouter([]),
        { provide: UnitService, useValue: unitServiceSpy },
        { provide: AuthService, useValue: authServiceSpy },
        { provide: MatSnackBar, useValue: { open: vi.fn() } }
      ]
    }).compileComponents();

    unitService = TestBed.inject(UnitService) as unknown as typeof unitServiceSpy;
    authService = TestBed.inject(AuthService) as unknown as typeof authServiceSpy;

    authService.getSelectedCondominio.mockReturnValue(mockCondominio);
    unitService.getUnitsByCondominium.mockReturnValue(of({ data: mockUnits, total: 1 }));

    fixture = TestBed.createComponent(UnitListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('debería crearse el componente', () => {
    expect(component).toBeTruthy();
  });

  it('debería cargar unidades al iniciar cuando hay condominio seleccionado', () => {
    expect(authService.getSelectedCondominio).toHaveBeenCalled();
    expect(unitService.getUnitsByCondominium).toHaveBeenCalledWith(
      mockCondominio.id,
      component.currentPage,
      component.pageSize
    );
    expect(component.dataSource.data).toEqual(mockUnits);
    expect(component.total).toBe(1);
    expect(component.loading).toBe(false);
  });

  it('debería mostrar error cuando no hay condominio seleccionado', () => {
    authService.getSelectedCondominio.mockReturnValue(null);
    fixture = TestBed.createComponent(UnitListComponent);
    component = fixture.componentInstance;
    component.loadUnits();
    fixture.detectChanges();
    expect(component.error).toBe('No hay condominio seleccionado');
    expect(component.loading).toBe(false);
  });

  it('debería manejar error al cargar unidades', () => {
    unitService.getUnitsByCondominium.mockReturnValue(
      throwError(() => new Error('Error de red'))
    );
    fixture = TestBed.createComponent(UnitListComponent);
    component = fixture.componentInstance;
    component.loadUnits();
    fixture.detectChanges();
    expect(component.error).toBeTruthy();
    expect(component.loading).toBe(false);
  });

  it('onPageChange debería actualizar página y recargar unidades', () => {
    const event = { pageIndex: 1, pageSize: 10, length: 20 } as PageEvent;
    component.onPageChange(event);
    expect(component.currentPage).toBe(2);
    expect(component.pageSize).toBe(10);
    expect(unitService.getUnitsByCondominium).toHaveBeenCalledWith(
      mockCondominio.id,
      2,
      10
    );
  });

  it('getStatusLabel debería devolver la etiqueta en español', () => {
    expect(component.getStatusLabel(UnitStatus.AVAILABLE)).toBe('Disponible');
    expect(component.getStatusLabel(UnitStatus.OCCUPIED)).toBe('Ocupada');
  });

  it('getStatusClass debería devolver clase CSS para cada estado', () => {
    expect(component.getStatusClass(UnitStatus.AVAILABLE)).toContain('chip-available');
    expect(component.getStatusClass(UnitStatus.OCCUPIED)).toContain('chip-occupied');
  });

  it('onDelete debería llamar a deleteUnit y recargar la lista', () => {
    const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(true);
    unitService.deleteUnit.mockReturnValue(of(undefined));
    unitService.getUnitsByCondominium.mockReturnValue(of({ data: [], total: 0 }));
    component.onDelete('unit-1');
    expect(unitService.deleteUnit).toHaveBeenCalledWith('unit-1');
    confirmSpy.mockRestore();
  });
});
