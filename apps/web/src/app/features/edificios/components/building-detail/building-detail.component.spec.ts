import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, ActivatedRoute } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { of, throwError } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';

import { BuildingDetailComponent } from './building-detail.component';
import { BuildingService } from '../../../../core/services/building.service';
import { IBuilding } from '../../../../core/models/building.model';

describe('BuildingDetailComponent', () => {
  let component: BuildingDetailComponent;
  let fixture: ComponentFixture<BuildingDetailComponent>;
  let buildingService: any;

  const mockBuilding: IBuilding = {
    id: '1',
    condominiumId: 'condo-1',
    name: 'Edificio A',
    code: 'A',
    floors: 10,
    undergroundFloors: 2,
    hasElevator: true,
    address: 'Calle 1 #100',
    isActive: true,
    units: [
      { id: 'u1', number: '101', floor: 1 },
      { id: 'u2', number: '102', floor: 1 }
    ],
    createdAt: new Date(),
    updatedAt: new Date()
  };

  function setup(routeId: string | null = '1') {
    TestBed.resetTestingModule();

    const buildingServiceMock = {
      getBuildingById: vi.fn().mockReturnValue(of(mockBuilding))
    };

    TestBed.configureTestingModule({
      imports: [BuildingDetailComponent, NoopAnimationsModule],
      providers: [
        provideRouter([{ path: 'edificios', children: [] }, { path: '**', redirectTo: '' }]),
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: BuildingService, useValue: buildingServiceMock },
        {
          provide: ActivatedRoute,
          useValue: { snapshot: { paramMap: { get: (key: string) => key === 'id' ? routeId : null } } }
        }
      ]
    });

    buildingService = TestBed.inject(BuildingService);
    fixture = TestBed.createComponent(BuildingDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }

  it('should create', () => {
    setup();
    expect(component).toBeTruthy();
  });

  it('should load building on init', () => {
    setup();
    expect(buildingService.getBuildingById).toHaveBeenCalledWith('1');
    expect(component.building).toEqual(mockBuilding);
    expect(component.loading).toBe(false);
  });

  it('should display units when available', () => {
    setup();
    expect(component.building?.units?.length).toBe(2);
  });

  it('should handle building not found', () => {
    TestBed.resetTestingModule();
    const buildingServiceMock = {
      getBuildingById: vi.fn().mockReturnValue(throwError(() => new HttpErrorResponse({ status: 404 })))
    };
    TestBed.configureTestingModule({
      imports: [BuildingDetailComponent, NoopAnimationsModule],
      providers: [
        provideRouter([{ path: 'edificios', children: [] }, { path: '**', redirectTo: '' }]),
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: BuildingService, useValue: buildingServiceMock },
        {
          provide: ActivatedRoute,
          useValue: { snapshot: { paramMap: { get: () => '1' } } }
        }
      ]
    });
    fixture = TestBed.createComponent(BuildingDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    expect(component.loading).toBe(false);
  });

  it('should handle API error', () => {
    TestBed.resetTestingModule();
    const buildingServiceMock = {
      getBuildingById: vi.fn().mockReturnValue(throwError(() => new HttpErrorResponse({ status: 500 })))
    };
    TestBed.configureTestingModule({
      imports: [BuildingDetailComponent, NoopAnimationsModule],
      providers: [
        provideRouter([{ path: 'edificios', children: [] }, { path: '**', redirectTo: '' }]),
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: BuildingService, useValue: buildingServiceMock },
        {
          provide: ActivatedRoute,
          useValue: { snapshot: { paramMap: { get: () => '1' } } }
        }
      ]
    });
    fixture = TestBed.createComponent(BuildingDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    expect(component.error).toBe('Error al cargar el edificio');
  });

  it('should return correct status class', () => {
    setup();
    expect(component.getStatusClass(true)).toBe('chip-active');
    expect(component.getStatusClass(false)).toBe('chip-inactive');
  });

  it('should return correct status label', () => {
    setup();
    expect(component.getStatusLabel(true)).toBe('Activo');
    expect(component.getStatusLabel(false)).toBe('Inactivo');
  });
});
