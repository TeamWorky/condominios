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
import { AuthService } from '../../../../core/services/auth.service';
import { ICreateUnitDto, UnitStatus, UnitStatusLabels, UnitType, UnitTypeLabels } from '../../../../core/models/unit.model';
import { IBuilding } from '../../../../core/models/building.model';
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
                <mat-select formControlName="buildingId" [disabled]="loadingBuildings">
                  @if (loadingBuildings) {
                    <mat-option disabled>Cargando edificios...</mat-option>
                  } @else {
                    @if (getBuildingsArray().length > 0) {
                      @for (building of getBuildingsArray(); track building.id) {
                        <mat-option [value]="building.id">{{ building.name }}</mat-option>
                      }
                    } @else {
                      <mat-option disabled>No hay edificios disponibles</mat-option>
                    }
                  }
                </mat-select>
                <mat-icon matPrefix>apartment</mat-icon>
                @if (unitForm.get('buildingId')?.hasError('required') && unitForm.get('buildingId')?.touched) {
                  <mat-error>El edificio es requerido</mat-error>
                }
              </mat-form-field>

              <mat-form-field appearance="outline">
                <mat-label>Número de Departamento</mat-label>
                <input matInput formControlName="number" placeholder="Ej: 101, 205">
                <mat-icon matPrefix>tag</mat-icon>
                @if (unitForm.get('number')?.hasError('required') && unitForm.get('number')?.touched) {
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
                <input matInput type="number" formControlName="areaM2" placeholder="Ej: 75.5">
                <mat-icon matPrefix>square_foot</mat-icon>
                @if (unitForm.get('areaM2')?.hasError('required') && unitForm.get('areaM2')?.touched) {
                  <mat-error>El área es requerida</mat-error>
                }
                @if (unitForm.get('areaM2')?.hasError('min') && unitForm.get('areaM2')?.touched) {
                  <mat-error>El área debe ser mayor a 0</mat-error>
                }
              </mat-form-field>

              <mat-form-field appearance="outline">
                <mat-label>Tipo de Unidad</mat-label>
                <mat-select formControlName="unitType">
                  @for (type of unitTypes; track type.value) {
                    <mat-option [value]="type.value">{{ type.label }}</mat-option>
                  }
                </mat-select>
                <mat-icon matPrefix>category</mat-icon>
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
  error: string | null = null;
  buildings: IBuilding[] = []; // Siempre inicializado como array vacío
  loadingBuildings = false;

  // Función helper para obtener edificios de forma segura
  getBuildingsArray(): IBuilding[] {
    return Array.isArray(this.buildings) ? this.buildings : [];
  }
  UnitStatus = UnitStatus;
  UnitType = UnitType;
  unitStatuses = [
    { value: UnitStatus.AVAILABLE, label: UnitStatusLabels[UnitStatus.AVAILABLE] },
    { value: UnitStatus.OCCUPIED, label: UnitStatusLabels[UnitStatus.OCCUPIED] },
    { value: UnitStatus.MAINTENANCE, label: UnitStatusLabels[UnitStatus.MAINTENANCE] },
    { value: UnitStatus.RESERVED, label: UnitStatusLabels[UnitStatus.RESERVED] },
    { value: UnitStatus.OUT_OF_SERVICE, label: UnitStatusLabels[UnitStatus.OUT_OF_SERVICE] }
  ];
  unitTypes = [
    { value: UnitType.APARTMENT, label: UnitTypeLabels[UnitType.APARTMENT] },
    { value: UnitType.HOUSE, label: UnitTypeLabels[UnitType.HOUSE] },
    { value: UnitType.OFFICE, label: UnitTypeLabels[UnitType.OFFICE] },
    { value: UnitType.COMMERCIAL, label: UnitTypeLabels[UnitType.COMMERCIAL] },
    { value: UnitType.PARKING, label: UnitTypeLabels[UnitType.PARKING] },
    { value: UnitType.STORAGE, label: UnitTypeLabels[UnitType.STORAGE] }
  ];
  private destroy$ = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    private unitService: UnitService,
    private buildingService: BuildingService,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute,
    private cdr: ChangeDetectorRef,
    private snackBar: MatSnackBar
  ) {
    this.unitForm = this.fb.group({
      buildingId: ['', [Validators.required]],
      number: ['', [Validators.required]],
      floor: [null],
      block: [''],
      unitType: [UnitType.APARTMENT],
      areaM2: [null],
      bedrooms: [null],
      bathrooms: [null],
      parkingSpots: [0],
      storageUnits: [0],
      status: [UnitStatus.AVAILABLE] // Solo se usa en modo edición
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
    const selectedCondominio = this.authService.getSelectedCondominio();
    if (!selectedCondominio) {
      this.error = 'No hay condominio seleccionado';
      this.loadingBuildings = false;
      this.cdr.detectChanges();
      return;
    }

    this.loadingBuildings = true;
    this.buildingService.getBuildingNames(selectedCondominio.id).pipe(takeUntil(this.destroy$)).subscribe({
      next: (buildings) => {
        this.buildings = Array.isArray(buildings) ? buildings : [];
        this.loadingBuildings = false;
        this.cdr.detectChanges();
      },
      error: () => {
        // Asegurar que siempre sea un array incluso en caso de error
        this.buildings = [];
        this.loadingBuildings = false;
        this.cdr.detectChanges();
        this.snackBar.open('Error al cargar los edificios', 'Cerrar', {
          duration: 3000,
          horizontalPosition: 'end',
          verticalPosition: 'top',
          panelClass: ['error-snackbar']
        });
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
          buildingId: unit.buildingId,
          number: unit.number,
          floor: unit.floor || null,
          block: unit.block || '',
          unitType: unit.unitType || UnitType.APARTMENT,
          areaM2: unit.areaM2 || null,
          bedrooms: unit.bedrooms || null,
          bathrooms: unit.bathrooms || null,
          parkingSpots: unit.parkingSpots || 0,
          storageUnits: unit.storageUnits || 0,
          status: unit.status || UnitStatus.AVAILABLE
        });
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: () => {
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
      const toInt = (v: any) => (v !== null && v !== '' && v !== undefined) ? parseInt(String(v), 10) : undefined;
      const toFloat = (v: any) => (v !== null && v !== '' && v !== undefined) ? parseFloat(String(v)) : undefined;

      if (this.isEditMode) {
        // En modo edición
        const updateData = {
          number: formValue.number,
          floor: toInt(formValue.floor),
          block: formValue.block || undefined,
          unitType: formValue.unitType,
          areaM2: toFloat(formValue.areaM2),
          bedrooms: toInt(formValue.bedrooms),
          bathrooms: toInt(formValue.bathrooms),
          parkingSpots: toInt(formValue.parkingSpots) ?? 0,
          storageUnits: toInt(formValue.storageUnits) ?? 0,
          status: formValue.status || UnitStatus.AVAILABLE,
          isOccupied: formValue.status === UnitStatus.OCCUPIED
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
          error: (err: any) => {
            this.loading = false;
            this.cdr.detectChanges();
            const msg = err?.error?.message
              ? (Array.isArray(err.error.message) ? err.error.message.join(', ') : err.error.message)
              : `Error ${err?.status || ''} al guardar la unidad`;
            this.snackBar.open(msg, 'Cerrar', {
              duration: 8000,
              horizontalPosition: 'end',
              verticalPosition: 'top',
              panelClass: ['error-snackbar']
            });
          }
        });
      } else {
        // En modo creación
        const unitData: ICreateUnitDto = {
          buildingId: formValue.buildingId,
          number: formValue.number,
          floor: toInt(formValue.floor),
          block: formValue.block || undefined,
          unitType: formValue.unitType,
          areaM2: toFloat(formValue.areaM2),
          bedrooms: toInt(formValue.bedrooms),
          bathrooms: toInt(formValue.bathrooms),
          parkingSpots: toInt(formValue.parkingSpots) ?? 0,
          storageUnits: toInt(formValue.storageUnits) ?? 0
        };
        const operation = this.unitService.createUnit(formValue.buildingId, unitData);
        
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
          error: () => {
            this.loading = false;
            this.cdr.detectChanges();
            this.snackBar.open(
              'Error al guardar la unidad',
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

