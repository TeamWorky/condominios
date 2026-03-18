import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, ActivatedRoute } from '@angular/router';
import { UnitDetailComponent } from './unit-detail.component';
import { UnitService } from '../../services/unit.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { IUnit, UnitStatus, UnitType } from '../../../../core/models/unit.model';
import { of, throwError } from 'rxjs';

const mockUnit: IUnit = {
  id: '17ab22fa-2a9f-498a-a967-8d4e3e635305',
  buildingId: 'building-1',
  number: '001',
  floor: 1,
  block: 'A',
  unitType: UnitType.APARTMENT,
  areaM2: 100,
  bedrooms: 2,
  bathrooms: 1,
  parkingSpots: 2,
  storageUnits: 1,
  status: UnitStatus.AVAILABLE,
  isOccupied: false,
  createdAt: new Date(),
  updatedAt: new Date(),
  deletedAt: null,
  building: { id: 'building-1', name: 'Torre A', code: 'TA' }
};

describe('UnitDetailComponent', () => {
  let component: UnitDetailComponent;
  let fixture: ComponentFixture<UnitDetailComponent>;
  let unitService: { getUnitById: ReturnType<typeof vi.fn>; updateUnitStatus: ReturnType<typeof vi.fn> };

  beforeEach(async () => {
    const unitServiceSpy = { getUnitById: vi.fn(), updateUnitStatus: vi.fn() };

    await TestBed.configureTestingModule({
      imports: [UnitDetailComponent],
      providers: [
        provideRouter([]),
        { provide: UnitService, useValue: unitServiceSpy },
        { provide: MatSnackBar, useValue: { open: vi.fn() } },
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: { paramMap: { get: (key: string) => (key === 'id' ? mockUnit.id : null) } }
          }
        }
      ]
    }).compileComponents();

    unitService = TestBed.inject(UnitService) as unknown as typeof unitServiceSpy;
    unitService.getUnitById.mockReturnValue(of(mockUnit));

    fixture = TestBed.createComponent(UnitDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('debería crearse el componente', () => {
    expect(component).toBeTruthy();
  });

  it('debería cargar la unidad al iniciar con id en la ruta', () => {
    expect(unitService.getUnitById).toHaveBeenCalledWith(mockUnit.id);
    expect(component.unit).toEqual(mockUnit);
    expect(component.loading).toBe(false);
  });

  it('debería extraer data cuando se recarga el componente', () => {
    unitService.getUnitById.mockReturnValue(of(mockUnit));
    fixture = TestBed.createComponent(UnitDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    expect(component.unit).toBeDefined();
    expect(component.unit?.id).toBe(mockUnit.id);
    expect(component.unit?.number).toBe(mockUnit.number);
  });

  it('debería mostrar error cuando falla la carga', () => {
    unitService.getUnitById.mockReturnValue(throwError(() => new Error('Not found')));
    fixture = TestBed.createComponent(UnitDetailComponent);
    component = fixture.componentInstance;
    component.loadUnit(mockUnit.id);
    fixture.detectChanges();
    expect(component.error).toBeTruthy();
    expect(component.loading).toBe(false);
  });

  it('getStatusLabel debería devolver la etiqueta en español', () => {
    expect(component.getStatusLabel(UnitStatus.AVAILABLE)).toBe('Disponible');
    expect(component.getStatusLabel(UnitStatus.OCCUPIED)).toBe('Ocupada');
  });

  it('getStatusClass debería devolver clase CSS para cada estado', () => {
    expect(component.getStatusClass(UnitStatus.AVAILABLE)).toContain('chip-available');
    expect(component.getStatusClass(UnitStatus.OCCUPIED)).toContain('chip-occupied');
  });

  it('onStatusChange debería llamar a updateUnitStatus y actualizar la unidad', () => {
    const updatedUnit = { ...mockUnit, status: UnitStatus.OCCUPIED };
    unitService.updateUnitStatus.mockReturnValue(of(updatedUnit));
    component.unit = mockUnit;
    component.onStatusChange(UnitStatus.OCCUPIED);
    expect(unitService.updateUnitStatus).toHaveBeenCalledWith(mockUnit.id, UnitStatus.OCCUPIED);
  });

  it('onStatusChange no debería hacer nada si unit es null', () => {
    component.unit = null;
    component.onStatusChange(UnitStatus.OCCUPIED);
    expect(unitService.updateUnitStatus).not.toHaveBeenCalled();
  });
});
