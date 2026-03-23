import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, ActivatedRoute } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { of, throwError } from 'rxjs';

import { ResidentFormComponent } from './resident-form.component';
import { ResidentService } from '../../services/resident.service';
import { IResident, ResidentType, DocumentType } from '../../../../core/models/resident.model';

describe('ResidentFormComponent', () => {
  let component: ResidentFormComponent;
  let fixture: ComponentFixture<ResidentFormComponent>;
  let residentService: any;

  const mockResident: IResident = {
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
  };

  function createComponent(params: Record<string, string> = {}, queryParams: Record<string, string> = {}) {
    const residentServiceMock = {
      getResidentById: vi.fn().mockReturnValue(of(mockResident)),
      createResident: vi.fn().mockReturnValue(of(mockResident)),
      updateResident: vi.fn().mockReturnValue(of(mockResident)),
    };

    return TestBed.configureTestingModule({
      imports: [ResidentFormComponent, NoopAnimationsModule],
      providers: [
        provideRouter([{ path: 'residentes', children: [] }, { path: '**', redirectTo: '' }]),
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: ResidentService, useValue: residentServiceMock },
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              paramMap: { get: (key: string) => params[key] || null },
              queryParamMap: { get: (key: string) => queryParams[key] || null },
            },
          },
        },
      ],
    }).compileComponents().then(() => {
      residentService = TestBed.inject(ResidentService);
      fixture = TestBed.createComponent(ResidentFormComponent);
      component = fixture.componentInstance;
    });
  }

  describe('Create mode', () => {
    beforeEach(async () => {
      await createComponent({}, { unitId: 'u1' });
    });

    it('should create', () => {
      expect(component).toBeTruthy();
    });

    it('should be in create mode', () => {
      fixture.detectChanges();
      expect(component.isEditMode).toBe(false);
      expect(component.unitId).toBe('u1');
    });

    it('should have required validators on mandatory fields', () => {
      fixture.detectChanges();
      const form = component.residentForm;
      expect(form.get('firstName')?.hasError('required')).toBe(true);
      expect(form.get('lastName')?.hasError('required')).toBe(true);
      expect(form.get('documentNumber')?.hasError('required')).toBe(true);
      expect(form.get('dateOfBirth')?.hasError('required')).toBe(true);
    });

    it('should not require phone and email', () => {
      fixture.detectChanges();
      const form = component.residentForm;
      expect(form.get('phone')?.valid).toBe(true);
      expect(form.get('email')?.valid).toBe(true);
    });

    it('should validate email format', () => {
      fixture.detectChanges();
      component.residentForm.get('email')?.setValue('invalid');
      expect(component.residentForm.get('email')?.hasError('email')).toBe(true);
      component.residentForm.get('email')?.setValue('test@email.com');
      expect(component.residentForm.get('email')?.valid).toBe(true);
    });

    it('should validate maxLength', () => {
      fixture.detectChanges();
      component.residentForm.get('firstName')?.setValue('a'.repeat(101));
      expect(component.residentForm.get('firstName')?.hasError('maxlength')).toBe(true);
    });

    it('should not submit when form is invalid', () => {
      fixture.detectChanges();
      component.onSubmit();
      expect(residentService.createResident).not.toHaveBeenCalled();
    });

    it('should call createResident on valid submit', () => {
      fixture.detectChanges();
      component.residentForm.patchValue({
        firstName: 'Juan',
        lastName: 'Perez',
        documentType: DocumentType.RUT,
        documentNumber: '12345678-9',
        dateOfBirth: '1990-01-01',
        residentType: ResidentType.OWNER,
      });
      component.onSubmit();
      expect(residentService.createResident).toHaveBeenCalledWith(
        'u1',
        expect.objectContaining({
          firstName: 'Juan',
          lastName: 'Perez',
          documentNumber: '12345678-9',
        }),
      );
    });

    it('should show error when no unitId', () => {
      fixture.detectChanges();
      component.unitId = null;
      component.residentForm.patchValue({
        firstName: 'Juan',
        lastName: 'Perez',
        documentNumber: '12345678-9',
        dateOfBirth: '1990-01-01',
      });
      const snackSpy = vi.spyOn((component as any).snackBar, 'open');
      component.onSubmit();
      expect(snackSpy).toHaveBeenCalledWith(
        'No se ha seleccionado una unidad',
        'Cerrar',
        expect.any(Object),
      );
    });

    it('should handle 409 duplicate document error', () => {
      fixture.detectChanges();
      residentService.createResident.mockReturnValue(
        throwError(() => ({ status: 409 } as any)),
      );
      component.residentForm.patchValue({
        firstName: 'Juan',
        lastName: 'Perez',
        documentNumber: '12345678-9',
        dateOfBirth: '1990-01-01',
      });
      component.onSubmit();
      expect(component.residentForm.get('documentNumber')?.hasError('duplicate')).toBe(true);
    });

    it('should return correct error messages', () => {
      expect(component.getErrorMessage('firstName')).toBe('Este campo es requerido');

      component.residentForm.get('email')?.setValue('invalid');
      expect(component.getErrorMessage('email')).toBe('Ingrese un email valido');

      component.residentForm.get('firstName')?.setValue('a'.repeat(101));
      expect(component.getErrorMessage('firstName')).toBe('Maximo 100 caracteres');
    });
  });

  describe('Edit mode', () => {
    beforeEach(async () => {
      await createComponent({ id: 'r1' });
    });

    it('should be in edit mode', () => {
      fixture.detectChanges();
      expect(component.isEditMode).toBe(true);
      expect(component.residentId).toBe('r1');
    });

    it('should load resident data', () => {
      fixture.detectChanges();
      expect(residentService.getResidentById).toHaveBeenCalledWith('r1');
      expect(component.residentForm.get('firstName')?.value).toBe('Juan');
      expect(component.residentForm.get('lastName')?.value).toBe('Perez');
    });

    it('should disable document fields in edit mode', () => {
      fixture.detectChanges();
      expect(component.residentForm.get('documentType')?.disabled).toBe(true);
      expect(component.residentForm.get('documentNumber')?.disabled).toBe(true);
    });

    it('should call updateResident on submit', () => {
      fixture.detectChanges();
      component.onSubmit();
      expect(residentService.updateResident).toHaveBeenCalledWith(
        'r1',
        expect.objectContaining({
          firstName: 'Juan',
          lastName: 'Perez',
        }),
      );
    });

    it('should handle 404 on load', () => {
      residentService.getResidentById.mockReturnValue(
        throwError(() => ({ status: 404 } as any)),
      );
      const routerSpy = vi.spyOn((component as any).router, 'navigate');
      fixture.detectChanges();
      expect(routerSpy).toHaveBeenCalledWith(['/residentes']);
    });
  });
});
