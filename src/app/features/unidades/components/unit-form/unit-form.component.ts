import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { UnitService } from '../../services/unit.service';
import { BuildingService } from '../../../../core/services/building.service';
import { ICreateUnitDto, UnitStatus } from '../../../../core/models/unit.model';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-unit-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
    MatCardModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatSnackBarModule
  ],
  template: `
    <div class="page-container">
      <div class="page-header">
        <h1 class="mat-headline-4">{{ isEditMode ? 'Editar Unidad' : 'Nueva Unidad' }}</h1>
        <p class="mat-body-1">{{ isEditMode ? 'Modifica los datos de la unidad' : 'Registra una nueva unidad en el condominio' }}</p>
      </div>

      <mat-card>
        <mat-card-content>
          <form [formGroup]="unitForm" (ngSubmit)="onSubmit()">
            <div class="form-grid">
              <mat-form-field appearance="outline">
                <mat-label>Edificio</mat-label>
                <mat-select formControlName="building" [disabled]="loadingBuildings">
                  @if (loadingBuildings) {
                    <mat-option disabled>Cargando edificios...</mat-option>
                  } @else {
                    @for (building of buildings; track building) {
                      <mat-option [value]="building">{{ building }}</mat-option>
                    }
                  }
                </mat-select>
                <mat-icon matPrefix>apartment</mat-icon>
                @if (unitForm.get('building')?.hasError('required') && unitForm.get('building')?.touched) {
                  <mat-error>El edificio es requerido</mat-error>
                }
              </mat-form-field>

              <mat-form-field appearance="outline">
                <mat-label>Número de Departamento</mat-label>
                <input matInput formControlName="unitNumber" placeholder="Ej: 101, 205">
                <mat-icon matPrefix>tag</mat-icon>
                @if (unitForm.get('unitNumber')?.hasError('required') && unitForm.get('unitNumber')?.touched) {
                  <mat-error>El número de departamento es requerido</mat-error>
                }
              </mat-form-field>

              <mat-form-field appearance="outline">
                <mat-label>Piso</mat-label>
                <input matInput type="number" formControlName="floor" placeholder="Ej: 1, 2, 3">
                <mat-icon matPrefix>layers</mat-icon>
                @if (unitForm.get('floor')?.hasError('required') && unitForm.get('floor')?.touched) {
                  <mat-error>El piso es requerido</mat-error>
                }
                @if (unitForm.get('floor')?.hasError('min') && unitForm.get('floor')?.touched) {
                  <mat-error>El piso debe ser mayor a 0</mat-error>
                }
              </mat-form-field>

              <mat-form-field appearance="outline">
                <mat-label>Bloque (Opcional)</mat-label>
                <input matInput formControlName="block" placeholder="Ej: A, B, Norte">
                <mat-icon matPrefix>view_module</mat-icon>
              </mat-form-field>

              <mat-form-field appearance="outline">
                <mat-label>Área (m²)</mat-label>
                <input matInput type="number" formControlName="area" placeholder="Ej: 75.5">
                <mat-icon matPrefix>square_foot</mat-icon>
                @if (unitForm.get('area')?.hasError('required') && unitForm.get('area')?.touched) {
                  <mat-error>El área es requerida</mat-error>
                }
                @if (unitForm.get('area')?.hasError('min') && unitForm.get('area')?.touched) {
                  <mat-error>El área debe ser mayor a 0</mat-error>
                }
              </mat-form-field>

              <mat-form-field appearance="outline">
                <mat-label>Dormitorios</mat-label>
                <input matInput type="number" formControlName="bedrooms" placeholder="Ej: 2, 3">
                <mat-icon matPrefix>bed</mat-icon>
                @if (unitForm.get('bedrooms')?.hasError('required') && unitForm.get('bedrooms')?.touched) {
                  <mat-error>El número de dormitorios es requerido</mat-error>
                }
                @if (unitForm.get('bedrooms')?.hasError('min') && unitForm.get('bedrooms')?.touched) {
                  <mat-error>Debe tener al menos 1 dormitorio</mat-error>
                }
              </mat-form-field>

              <mat-form-field appearance="outline">
                <mat-label>Baños</mat-label>
                <input matInput type="number" formControlName="bathrooms" placeholder="Ej: 1, 2">
                <mat-icon matPrefix>bathtub</mat-icon>
                @if (unitForm.get('bathrooms')?.hasError('required') && unitForm.get('bathrooms')?.touched) {
                  <mat-error>El número de baños es requerido</mat-error>
                }
                @if (unitForm.get('bathrooms')?.hasError('min') && unitForm.get('bathrooms')?.touched) {
                  <mat-error>Debe tener al menos 1 baño</mat-error>
                }
              </mat-form-field>

              <mat-form-field appearance="outline">
                <mat-label>Estacionamientos</mat-label>
                <input matInput type="number" formControlName="parkingSpots" placeholder="Ej: 1, 2">
                <mat-icon matPrefix>directions_car</mat-icon>
                @if (unitForm.get('parkingSpots')?.hasError('required') && unitForm.get('parkingSpots')?.touched) {
                  <mat-error>El número de estacionamientos es requerido</mat-error>
                }
                @if (unitForm.get('parkingSpots')?.hasError('min') && unitForm.get('parkingSpots')?.touched) {
                  <mat-error>Debe ser 0 o mayor</mat-error>
                }
              </mat-form-field>

              <mat-form-field appearance="outline">
                <mat-label>Bodegas</mat-label>
                <input matInput type="number" formControlName="storageUnits" placeholder="Ej: 0, 1">
                <mat-icon matPrefix>inventory_2</mat-icon>
                @if (unitForm.get('storageUnits')?.hasError('required') && unitForm.get('storageUnits')?.touched) {
                  <mat-error>El número de bodegas es requerido</mat-error>
                }
                @if (unitForm.get('storageUnits')?.hasError('min') && unitForm.get('storageUnits')?.touched) {
                  <mat-error>Debe ser 0 o mayor</mat-error>
                }
              </mat-form-field>

              @if (isEditMode) {
                <mat-form-field appearance="outline">
                  <mat-label>Estado</mat-label>
                  <mat-select formControlName="status">
                    @for (status of unitStatuses; track status.value) {
                      <mat-option [value]="status.value">{{ status.label }}</mat-option>
                    }
                  </mat-select>
                  <mat-icon matPrefix>info</mat-icon>
                  @if (unitForm.get('status')?.hasError('required') && unitForm.get('status')?.touched) {
                    <mat-error>El estado es requerido</mat-error>
                  }
                </mat-form-field>
              }
            </div>

            <div class="button-group">
              <button mat-button type="button" routerLink="/unidades" [disabled]="loading">
                Cancelar
              </button>
              <button mat-raised-button color="primary" type="submit" [disabled]="unitForm.invalid || loading">
                @if (loading) {
                  <mat-spinner diameter="20"></mat-spinner>
                } @else {
                  <ng-container>
                    <mat-icon>save</mat-icon>
                    {{ isEditMode ? 'Actualizar' : 'Guardar' }}
                  </ng-container>
                }
              </button>
            </div>
          </form>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .page-container {
      max-width: 1000px;
      margin: 0 auto;
    }

    .page-header {
      margin-bottom: 24px;

      h1 {
        margin: 0 0 8px 0;
      }

      p {
        margin: 0;
        color: var(--mat-sys-on-surface-variant);
      }
    }

    .form-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 16px;
      margin-bottom: 24px;
    }

    mat-form-field {
      width: 100%;
    }

    .button-group {
      display: flex;
      gap: 12px;
      justify-content: flex-end;
      margin-top: 24px;
    }

    mat-spinner {
      display: inline-block;
      margin-right: 8px;
    }
  `]
})
export class UnitFormComponent implements OnInit, OnDestroy {
  unitForm: FormGroup;
  isEditMode = false;
  loading = false;
  buildings: string[] = [];
  loadingBuildings = false;
  UnitStatus = UnitStatus;
  unitStatuses = [
    { value: UnitStatus.DISPONIBLE, label: 'Disponible' },
    { value: UnitStatus.OCUPADA, label: 'Ocupada' },
    { value: UnitStatus.EN_MANTENIMIENTO, label: 'En Mantenimiento' },
    { value: UnitStatus.RESERVADA, label: 'Reservada' },
    { value: UnitStatus.FUERA_SERVICIO, label: 'Fuera de Servicio' }
  ];
  private destroy$ = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    private unitService: UnitService,
    private buildingService: BuildingService,
    private router: Router,
    private route: ActivatedRoute,
    private cdr: ChangeDetectorRef,
    private snackBar: MatSnackBar
  ) {
    this.unitForm = this.fb.group({
      building: ['', [Validators.required]],
      unitNumber: ['', [Validators.required]],
      floor: [1, [Validators.required, Validators.min(1)]],
      block: [''],
      area: [0, [Validators.required, Validators.min(0.1)]],
      bedrooms: [1, [Validators.required, Validators.min(1)]],
      bathrooms: [1, [Validators.required, Validators.min(1)]],
      parkingSpots: [0, [Validators.required, Validators.min(0)]],
      storageUnits: [0, [Validators.required, Validators.min(0)]],
      status: [UnitStatus.DISPONIBLE] // Solo se usa en modo edición
    });
  }

  ngOnInit(): void {
    this.loadBuildings();
    const id = this.route.snapshot.paramMap.get('id');
    if (id && id !== 'nuevo') {
      this.isEditMode = true;
      this.loadUnit(id);
    }
  }

  loadBuildings(): void {
    this.loadingBuildings = true;
    this.buildingService.getBuildingNames().pipe(takeUntil(this.destroy$)).subscribe({
      next: (buildingNames) => {
        this.buildings = buildingNames;
        this.loadingBuildings = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error loading buildings:', err);
        // Fallback a lista estática si falla el servicio
        this.buildings = ['Torre A', 'Torre B', 'Torre C', 'Edificio 1', 'Edificio 2', 'Edificio 3'];
        this.loadingBuildings = false;
        this.cdr.detectChanges();
      }
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadUnit(id: string): void {
    this.loading = true;
    this.cdr.detectChanges();
    
    this.unitService.getUnitById(id).pipe(takeUntil(this.destroy$)).subscribe({
      next: (unit) => {
        this.unitForm.patchValue({
          building: unit.building,
          unitNumber: unit.unitNumber,
          floor: unit.floor,
          block: unit.block || '',
          area: unit.area,
          bedrooms: unit.bedrooms,
          bathrooms: unit.bathrooms,
          parkingSpots: unit.parkingSpots,
          storageUnits: unit.storageUnits,
          status: unit.status || (unit.isOccupied ? UnitStatus.OCUPADA : UnitStatus.DISPONIBLE)
        });
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error loading unit:', err);
        this.loading = false;
        this.cdr.detectChanges();
        this.snackBar.open('Error al cargar la unidad', 'Cerrar', {
          duration: 3000,
          horizontalPosition: 'end',
          verticalPosition: 'top'
        });
        setTimeout(() => {
          this.router.navigate(['/unidades']);
        }, 2000);
      }
    });
  }

  onSubmit(): void {
    if (this.unitForm.valid) {
      this.loading = true;
      this.cdr.detectChanges();
      
      const formValue = this.unitForm.value;
      
      if (this.isEditMode) {
        // En modo edición, incluir el estado
        const updateData = {
          ...formValue,
          status: formValue.status || UnitStatus.DISPONIBLE,
          isOccupied: formValue.status === UnitStatus.OCUPADA
        };
        const operation = this.unitService.updateUnit(this.route.snapshot.paramMap.get('id')!, updateData);
        
        operation.pipe(takeUntil(this.destroy$)).subscribe({
          next: () => {
            this.snackBar.open(
              'Unidad actualizada exitosamente',
              'Cerrar',
              {
                duration: 3000,
                horizontalPosition: 'end',
                verticalPosition: 'top',
                panelClass: ['success-snackbar']
              }
            );
            this.router.navigate(['/unidades']);
          },
          error: (err) => {
            console.error('Error saving unit:', err);
            this.loading = false;
            this.cdr.detectChanges();
            this.snackBar.open(
              'Error al guardar la unidad. Por favor, verifica que el servidor mock esté ejecutándose.',
              'Cerrar',
              {
                duration: 5000,
                horizontalPosition: 'end',
                verticalPosition: 'top',
                panelClass: ['error-snackbar']
              }
            );
          }
        });
      } else {
        // En modo creación, no incluir estado (se asigna por defecto)
        const unitData: ICreateUnitDto = {
          building: formValue.building,
          unitNumber: formValue.unitNumber,
          floor: formValue.floor,
          block: formValue.block,
          area: formValue.area,
          bedrooms: formValue.bedrooms,
          bathrooms: formValue.bathrooms,
          parkingSpots: formValue.parkingSpots,
          storageUnits: formValue.storageUnits
        };
        const operation = this.unitService.createUnit(unitData);
        
        operation.pipe(takeUntil(this.destroy$)).subscribe({
          next: () => {
            this.snackBar.open(
              'Unidad creada exitosamente',
              'Cerrar',
              {
                duration: 3000,
                horizontalPosition: 'end',
                verticalPosition: 'top',
                panelClass: ['success-snackbar']
              }
            );
            this.router.navigate(['/unidades']);
          },
          error: (err) => {
            console.error('Error saving unit:', err);
            this.loading = false;
            this.cdr.detectChanges();
            this.snackBar.open(
              'Error al guardar la unidad. Por favor, verifica que el servidor mock esté ejecutándose.',
              'Cerrar',
              {
                duration: 5000,
                horizontalPosition: 'end',
                verticalPosition: 'top',
                panelClass: ['error-snackbar']
              }
            );
          }
        });
      }
    } else {
      // Marcar todos los campos como touched para mostrar errores
      Object.keys(this.unitForm.controls).forEach(key => {
        this.unitForm.get(key)?.markAsTouched();
      });
      this.snackBar.open('Por favor, completa todos los campos requeridos', 'Cerrar', {
        duration: 3000,
        horizontalPosition: 'end',
        verticalPosition: 'top'
      });
    }
  }
}

