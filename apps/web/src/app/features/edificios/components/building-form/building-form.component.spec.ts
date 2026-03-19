import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, ActivatedRoute } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { of, throwError } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';

import { BuildingFormComponent } from './building-form.component';
import { BuildingService } from '../../../../core/services/building.service';
import { AuthService } from '../../../../core/services/auth.service';
import { IBuilding } from '../../../../core/models/building.model';

describe('BuildingFormComponent', () => {
  let component: BuildingFormComponent;
  let fixture: ComponentFixture<BuildingFormComponent>;
  let buildingService: any;
  let authService: any;

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
    createdAt: new Date(),
    updatedAt: new Date()
  };

  const mockCondominio = { id: 'condo-1', name: 'Test Condo' };

  function setup(routeId: string | null = null) {
    TestBed.resetTestingModule();

    const buildingServiceMock = {
      getBuildingById: vi.fn().mockReturnValue(of(mockBuilding)),
      createBuilding: vi.fn().mockReturnValue(of(mockBuilding)),
      updateBuilding: vi.fn().mockReturnValue(of(mockBuilding))
    };

    const authServiceMock = {
      getSelectedCondominio: vi.fn().mockReturnValue(mockCondominio)
    };

    TestBed.configureTestingModule({
      imports: [BuildingFormComponent, NoopAnimationsModule],
      providers: [
        provideRouter([{ path: 'edificios', children: [] }, { path: '**', redirectTo: '' }]),
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: BuildingService, useValue: buildingServiceMock },
        { provide: AuthService, useValue: authServiceMock },
        {
          provide: ActivatedRoute,
          useValue: { snapshot: { paramMap: { get: (key: string) => key === 'id' ? routeId : null } } }
        }
      ]
    });

    buildingService = TestBed.inject(BuildingService);
    authService = TestBed.inject(AuthService);
    fixture = TestBed.createComponent(BuildingFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }

  it('should create in create mode', () => {
    setup();
    expect(component).toBeTruthy();
    expect(component.isEditMode).toBe(false);
  });

  it('should initialize form with default values', () => {
    setup();
    expect(component.buildingForm.get('name')?.value).toBe('');
    expect(component.buildingForm.get('floors')?.value).toBe(1);
    expect(component.buildingForm.get('undergroundFloors')?.value).toBe(0);
    expect(component.buildingForm.get('hasElevator')?.value).toBe(false);
  });

  it('should load building in edit mode', () => {
    setup('1');
    expect(component.isEditMode).toBe(true);
    expect(buildingService.getBuildingById).toHaveBeenCalledWith('1');
    expect(component.buildingForm.get('name')?.value).toBe('Edificio A');
    expect(component.buildingForm.get('code')?.value).toBe('A');
  });

  it('should validate required fields', () => {
    setup();
    component.buildingForm.get('name')?.setValue('');
    component.buildingForm.get('code')?.setValue('');
    component.buildingForm.markAllAsTouched();

    expect(component.buildingForm.get('name')?.hasError('required')).toBe(true);
    expect(component.buildingForm.get('code')?.hasError('required')).toBe(true);
    expect(component.buildingForm.valid).toBe(false);
  });

  it('should validate floors minimum', () => {
    setup();
    component.buildingForm.get('floors')?.setValue(0);
    expect(component.buildingForm.get('floors')?.hasError('min')).toBe(true);
  });

  it('should validate maxlength', () => {
    setup();
    component.buildingForm.get('name')?.setValue('a'.repeat(256));
    expect(component.buildingForm.get('name')?.hasError('maxlength')).toBe(true);
  });

  it('should not submit invalid form', () => {
    setup();
    component.buildingForm.get('name')?.setValue('');
    component.onSubmit();
    expect(buildingService.createBuilding).not.toHaveBeenCalled();
  });

  it('should call createBuilding on valid submit', () => {
    setup();
    component.buildingForm.patchValue({ name: 'Test', code: 'T', floors: 5 });
    component.onSubmit();
    expect(buildingService.createBuilding).toHaveBeenCalledWith('condo-1', expect.objectContaining({
      name: 'Test',
      code: 'T',
      floors: 5
    }));
  });

  it('should call updateBuilding in edit mode', () => {
    setup('1');
    component.buildingForm.patchValue({ name: 'Updated' });
    component.onSubmit();
    expect(buildingService.updateBuilding).toHaveBeenCalledWith('1', expect.objectContaining({
      name: 'Updated'
    }));
  });

  it('should handle 409 duplicate code error', () => {
    setup();
    const httpError = new HttpErrorResponse({ status: 409 });
    buildingService.createBuilding.mockReturnValue(throwError(() => httpError));
    component.buildingForm.patchValue({ name: 'Test', code: 'A', floors: 5 });
    component.onSubmit();
    expect(component.buildingForm.get('code')?.hasError('duplicate')).toBe(true);
  });

  it('should return correct error messages', () => {
    setup();
    component.buildingForm.get('name')?.setValue('');
    component.buildingForm.get('name')?.markAsTouched();
    expect(component.getErrorMessage('name')).toBe('Este campo es requerido');
  });
});
