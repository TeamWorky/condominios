import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

import { BuildingService } from '../../../../core/services/building.service';
import { AuthService } from '../../../../core/services/auth.service';
import { ICreateBuildingDto } from '../../../../core/models/building.model';

@Component({
  selector: 'app-building-form',
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
    MatCheckboxModule,
    MatProgressSpinnerModule,
    MatSnackBarModule
  ],
  templateUrl: './building-form.component.html',
  styleUrls: ['./building-form.component.scss']
})
export class BuildingFormComponent implements OnInit, OnDestroy {
  buildingForm: FormGroup;
  isEditMode = false;
  loading = false;
  loadingData = false;
  buildingId: string | null = null;

  private destroy$ = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    private buildingService: BuildingService,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute,
    private cdr: ChangeDetectorRef,
    private snackBar: MatSnackBar
  ) {
    this.buildingForm = this.fb.group({
      name: ['', [Validators.required, Validators.maxLength(255)]],
      code: ['', [Validators.required, Validators.maxLength(50)]],
      floors: [1, [Validators.required, Validators.min(1), Validators.pattern(/^\d+$/)]],
      undergroundFloors: [0, [Validators.min(0), Validators.pattern(/^\d+$/)]],
      hasElevator: [false],
      address: ['', [Validators.maxLength(500)]]
    });
  }

  ngOnInit(): void {
    this.buildingId = this.route.snapshot.paramMap.get('id');
    if (this.buildingId) {
      this.isEditMode = true;
      this.loadBuilding(this.buildingId);
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadBuilding(id: string): void {
    this.loadingData = true;
    this.buildingService.getBuildingById(id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (building) => {
          this.buildingForm.patchValue({
            name: building.name,
            code: building.code,
            floors: building.floors,
            undergroundFloors: building.undergroundFloors,
            hasElevator: building.hasElevator,
            address: building.address || ''
          });
          this.loadingData = false;
          this.cdr.detectChanges();
        },
        error: (err: HttpErrorResponse) => {
          this.loadingData = false;
          if (err.status === 404) {
            this.snackBar.open('Edificio no encontrado', 'Cerrar', {
              duration: 3000,
              horizontalPosition: 'end',
              verticalPosition: 'top',
              panelClass: ['error-snackbar']
            });
            this.router.navigate(['/edificios']);
          }
          this.cdr.detectChanges();
        }
      });
  }

  onSubmit(): void {
    if (this.buildingForm.invalid) {
      this.buildingForm.markAllAsTouched();
      return;
    }

    this.loading = true;
    const formValue = this.buildingForm.value;

    const dto: ICreateBuildingDto = {
      name: formValue.name.trim(),
      code: formValue.code.trim(),
      floors: parseInt(String(formValue.floors), 10),
      undergroundFloors: parseInt(String(formValue.undergroundFloors), 10),
      hasElevator: formValue.hasElevator,
      address: formValue.address?.trim() || undefined
    };

    if (this.isEditMode && this.buildingId) {
      this.buildingService.updateBuilding(this.buildingId, dto)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            this.snackBar.open('Edificio actualizado exitosamente', 'Cerrar', {
              duration: 3000,
              horizontalPosition: 'end',
              verticalPosition: 'top'
            });
            this.router.navigate(['/edificios']);
          },
          error: (err: HttpErrorResponse) => this.handleSubmitError(err)
        });
    } else {
      const selectedCondominio = this.authService.getSelectedCondominio();
      if (!selectedCondominio) {
        this.snackBar.open('No hay condominio seleccionado', 'Cerrar', {
          duration: 3000,
          horizontalPosition: 'end',
          verticalPosition: 'top',
          panelClass: ['error-snackbar']
        });
        this.loading = false;
        return;
      }

      this.buildingService.createBuilding(selectedCondominio.id, dto)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            this.snackBar.open('Edificio creado exitosamente', 'Cerrar', {
              duration: 3000,
              horizontalPosition: 'end',
              verticalPosition: 'top'
            });
            this.router.navigate(['/edificios']);
          },
          error: (err: HttpErrorResponse) => this.handleSubmitError(err)
        });
    }
  }

  private handleSubmitError(err: HttpErrorResponse): void {
    this.loading = false;

    if (err.status === 409) {
      this.buildingForm.get('code')?.setErrors({ duplicate: true });
      this.cdr.detectChanges();
      return;
    }

    if (err.status === 404) {
      this.snackBar.open('Edificio no encontrado', 'Cerrar', {
        duration: 3000,
        horizontalPosition: 'end',
        verticalPosition: 'top',
        panelClass: ['error-snackbar']
      });
      this.router.navigate(['/edificios']);
      return;
    }

    this.snackBar.open('Error al guardar el edificio', 'Cerrar', {
      duration: 3000,
      horizontalPosition: 'end',
      verticalPosition: 'top',
      panelClass: ['error-snackbar']
    });
    this.cdr.detectChanges();
  }

  getErrorMessage(field: string): string {
    const control = this.buildingForm.get(field);
    if (!control) return '';

    if (control.hasError('required')) return 'Este campo es requerido';
    if (control.hasError('maxlength')) {
      const max = control.getError('maxlength').requiredLength;
      return `Maximo ${max} caracteres`;
    }
    if (control.hasError('min')) {
      const min = control.getError('min').min;
      return `El valor minimo es ${min}`;
    }
    if (control.hasError('pattern')) return 'Debe ser un numero entero';
    if (control.hasError('duplicate')) return 'Ya existe un edificio con ese codigo en este condominio';

    return '';
  }
}
