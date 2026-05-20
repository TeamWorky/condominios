import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, ActivatedRoute } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { of, throwError } from 'rxjs';

import { ResidentDetailComponent } from './resident-detail.component';
import { ResidentService } from '../../services/resident.service';
import { IResident, ResidentType, DocumentType } from '../../../../core/models/resident.model';

describe('ResidentDetailComponent', () => {
  let component: ResidentDetailComponent;
  let fixture: ComponentFixture<ResidentDetailComponent>;
  let residentService: any;

  const mockResident: IResident = {
    id: 'r1',
    firstName: 'Juan',
    lastName: 'Perez',
    documentType: DocumentType.RUT,
    documentNumber: '12345678-9',
    dateOfBirth: '1990-01-01',
    phone: '+56912345678',
    email: 'juan@email.com',
    unitId: 'u1',
    residentType: ResidentType.OWNER,
    moveInDate: '2024-01-01',
    isPrimary: true,
    relationship: 'Propietario',
    isActive: true,
    createdAt: '2024-01-01',
    updatedAt: '2024-01-01',
  };

  beforeEach(async () => {
    const residentServiceMock = {
      getResidentById: vi.fn().mockReturnValue(of(mockResident)),
    };

    await TestBed.configureTestingModule({
      imports: [ResidentDetailComponent, NoopAnimationsModule],
      providers: [
        provideRouter([{ path: 'residentes', children: [] }, { path: '**', redirectTo: '' }]),
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: ResidentService, useValue: residentServiceMock },
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              paramMap: { get: (key: string) => (key === 'id' ? 'r1' : null) },
            },
          },
        },
      ],
    }).compileComponents();

    residentService = TestBed.inject(ResidentService);
    fixture = TestBed.createComponent(ResidentDetailComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load resident on init', () => {
    fixture.detectChanges();
    expect(residentService.getResidentById).toHaveBeenCalledWith('r1');
    expect(component.resident).toEqual(mockResident);
    expect(component.loading).toBe(false);
  });

  it('should handle load error', () => {
    residentService.getResidentById.mockReturnValue(throwError(() => new Error('fail')));
    fixture.detectChanges();
    expect(component.error).toBe('Error al cargar el residente');
    expect(component.loading).toBe(false);
  });

  it('should return correct resident type label', () => {
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

  it('should navigate to list when no id', async () => {
    await TestBed.resetTestingModule().configureTestingModule({
      imports: [ResidentDetailComponent, NoopAnimationsModule],
      providers: [
        provideRouter([{ path: 'residentes', children: [] }, { path: '**', redirectTo: '' }]),
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: ResidentService, useValue: { getResidentById: vi.fn() } },
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              paramMap: { get: () => null },
            },
          },
        },
      ],
    }).compileComponents();

    const f = TestBed.createComponent(ResidentDetailComponent);
    const c = f.componentInstance;
    const routerSpy = vi.spyOn((c as any).router, 'navigate');
    f.detectChanges();
    expect(routerSpy).toHaveBeenCalledWith(['/residentes']);
  });
});
