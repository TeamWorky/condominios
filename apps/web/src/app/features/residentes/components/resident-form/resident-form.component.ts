import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';

import { ResidentService } from '../../services/resident.service';
import {
  ICreateResidentDto,
  ResidentType,
  DocumentType,
} from '../../../../core/models/resident.model';
import { rutValidator } from '../../../../core/validators/rut.validator';
import { formatRut, cleanRut } from '@condominios/shared/validators/rut.validator';

const RESIDENT_TYPE_OPTIONS = [
  { value: ResidentType.OWNER, label: 'Propietario' },
  { value: ResidentType.TENANT, label: 'Arrendatario' },
  { value: ResidentType.FAMILY_MEMBER, label: 'Familiar' },
  { value: ResidentType.GUEST, label: 'Invitado' },
];

const DOCUMENT_TYPE_OPTIONS = [
  { value: DocumentType.RUT, label: 'RUT' },
  { value: DocumentType.PASSPORT, label: 'Pasaporte' },
  { value: DocumentType.DNI, label: 'DNI' },
  { value: DocumentType.OTHER, label: 'Otro' },
];

@Component({
  selector: 'app-resident-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatSelectModule,
    MatCheckboxModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatTooltipModule,
  ],
  templateUrl: './resident-form.component.html',
  styleUrls: ['./resident-form.component.scss'],
})
export class ResidentFormComponent implements OnInit, OnDestroy {
  residentForm: FormGroup;
  isEditMode = false;
  loading = false;
  loadingData = false;
  residentId: string | null = null;
  unitId: string | null = null;

  residentTypeOptions = RESIDENT_TYPE_OPTIONS;
  documentTypeOptions = DOCUMENT_TYPE_OPTIONS;

  private destroy$ = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    private residentService: ResidentService,
    private router: Router,
    private route: ActivatedRoute,
    private cdr: ChangeDetectorRef,
    private snackBar: MatSnackBar,
  ) {
    this.residentForm = this.fb.group({
      firstName: ['', [Validators.required, Validators.maxLength(100)]],
      lastName: ['', [Validators.required, Validators.maxLength(100)]],
      documentType: [DocumentType.RUT, [Validators.required]],
      documentNumber: ['', [Validators.required, Validators.maxLength(50), rutValidator]],
      dateOfBirth: ['', [Validators.required]],
      phone: ['', [Validators.maxLength(20)]],
      email: ['', [Validators.email]],
      residentType: [ResidentType.TENANT, [Validators.required]],
      moveInDate: [''],
      isPrimary: [false],
      relationship: ['', [Validators.maxLength(100)]],
    });

    // Toggle RUT validator when document type changes
    this.residentForm.get('documentType')?.valueChanges.subscribe((type) => {
      const docNumber = this.residentForm.get('documentNumber');
      if (!docNumber) return;
      if (type === DocumentType.RUT) {
        docNumber.setValidators([Validators.required, Validators.maxLength(50), rutValidator]);
      } else {
        docNumber.setValidators([Validators.required, Validators.maxLength(50)]);
      }
      docNumber.updateValueAndValidity();
    });
  }

  ngOnInit(): void {
    this.residentId = this.route.snapshot.paramMap.get('id');
    this.unitId =
      this.route.snapshot.queryParamMap.get('unitId') || null;

    if (this.residentId) {
      this.isEditMode = true;
      this.loadResident(this.residentId);
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadResident(id: string): void {
    this.loadingData = true;
    this.residentService
      .getResidentById(id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (resident) => {
          this.unitId = resident.unitId;
          this.residentForm.patchValue({
            firstName: resident.firstName,
            lastName: resident.lastName,
            documentType: resident.documentType,
            documentNumber: resident.documentNumber,
            dateOfBirth: resident.dateOfBirth,
            phone: resident.phone || '',
            email: resident.email || '',
            residentType: resident.residentType,
            moveInDate: resident.moveInDate || '',
            isPrimary: resident.isPrimary,
            relationship: resident.relationship || '',
          });
          // In edit mode, document fields are read-only
          this.residentForm.get('documentType')?.disable();
          this.residentForm.get('documentNumber')?.disable();
          this.loadingData = false;
          this.cdr.detectChanges();
        },
        error: (err: HttpErrorResponse) => {
          this.loadingData = false;
          if (err.status === 404) {
            this.snackBar.open('Residente no encontrado', 'Cerrar', {
              duration: 3000,
              horizontalPosition: 'end',
              verticalPosition: 'top',
              panelClass: ['error-snackbar'],
            });
            this.router.navigate(['/residentes']);
          }
          this.cdr.detectChanges();
        },
      });
  }

  onRutBlur(): void {
    const docType = this.residentForm.get('documentType')?.value;
    const docNumber = this.residentForm.get('documentNumber');
    if (docType === DocumentType.RUT && docNumber?.value) {
      const cleaned = cleanRut(docNumber.value);
      if (cleaned.length >= 8) {
        docNumber.setValue(formatRut(docNumber.value), { emitEvent: false });
      }
    }
  }

  onSubmit(): void {
    if (this.residentForm.invalid) {
      this.residentForm.markAllAsTouched();
      return;
    }

    this.loading = true;
    const formValue = this.residentForm.getRawValue();

    if (this.isEditMode && this.residentId) {
      const updateDto = {
        firstName: formValue.firstName.trim(),
        lastName: formValue.lastName.trim(),
        dateOfBirth: formValue.dateOfBirth,
        phone: formValue.phone?.trim() || undefined,
        email: formValue.email?.trim() || undefined,
        residentType: formValue.residentType,
        moveInDate: formValue.moveInDate || undefined,
        isPrimary: formValue.isPrimary,
        relationship: formValue.relationship?.trim() || undefined,
      };

      this.residentService
        .updateResident(this.residentId, updateDto)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            this.snackBar.open(
              'Residente actualizado exitosamente',
              'Cerrar',
              {
                duration: 3000,
                horizontalPosition: 'end',
                verticalPosition: 'top',
              },
            );
            this.router.navigate(['/residentes']);
          },
          error: (err: HttpErrorResponse) => this.handleSubmitError(err),
        });
    } else {
      if (!this.unitId) {
        this.snackBar.open(
          'No se ha seleccionado una unidad',
          'Cerrar',
          {
            duration: 3000,
            horizontalPosition: 'end',
            verticalPosition: 'top',
            panelClass: ['error-snackbar'],
          },
        );
        this.loading = false;
        return;
      }

      const createDto: ICreateResidentDto = {
        firstName: formValue.firstName.trim(),
        lastName: formValue.lastName.trim(),
        documentType: formValue.documentType,
        documentNumber: formValue.documentNumber.trim(),
        dateOfBirth: formValue.dateOfBirth,
        phone: formValue.phone?.trim() || undefined,
        email: formValue.email?.trim() || undefined,
        unitId: this.unitId,
        residentType: formValue.residentType,
        moveInDate: formValue.moveInDate || undefined,
        isPrimary: formValue.isPrimary,
        relationship: formValue.relationship?.trim() || undefined,
      };

      this.residentService
        .createResident(this.unitId, createDto)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            this.snackBar.open(
              'Residente creado exitosamente',
              'Cerrar',
              {
                duration: 3000,
                horizontalPosition: 'end',
                verticalPosition: 'top',
              },
            );
            this.router.navigate(['/residentes']);
          },
          error: (err: HttpErrorResponse) => this.handleSubmitError(err),
        });
    }
  }

  private handleSubmitError(err: HttpErrorResponse): void {
    this.loading = false;

    if (err.status === 409) {
      this.residentForm
        .get('documentNumber')
        ?.setErrors({ duplicate: true });
      this.cdr.detectChanges();
      return;
    }

    if (err.status === 404) {
      this.snackBar.open('Residente no encontrado', 'Cerrar', {
        duration: 3000,
        horizontalPosition: 'end',
        verticalPosition: 'top',
        panelClass: ['error-snackbar'],
      });
      this.router.navigate(['/residentes']);
      return;
    }

    this.snackBar.open('Error al guardar el residente', 'Cerrar', {
      duration: 3000,
      horizontalPosition: 'end',
      verticalPosition: 'top',
      panelClass: ['error-snackbar'],
    });
    this.cdr.detectChanges();
  }

  getErrorMessage(field: string): string {
    const control = this.residentForm.get(field);
    if (!control) return '';

    if (control.hasError('required')) return 'Este campo es requerido';
    if (control.hasError('maxlength')) {
      const max = control.getError('maxlength').requiredLength;
      return `Maximo ${max} caracteres`;
    }
    if (control.hasError('email')) return 'Ingrese un email valido';
    if (control.hasError('invalidRut'))
      return 'RUT invalido: el digito verificador no coincide';
    if (control.hasError('duplicate'))
      return 'Ya existe un residente activo con este numero de documento';

    return '';
  }
}
