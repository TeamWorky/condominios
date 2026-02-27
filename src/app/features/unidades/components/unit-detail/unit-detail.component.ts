import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { UnitService } from '../../services/unit.service';
import { IUnit, UnitStatus, UnitStatusLabels, UnitType, UnitTypeLabels } from '../../../../core/models/unit.model';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-unit-detail',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatProgressSpinnerModule,
    MatSelectModule,
    MatFormFieldModule,
    MatSnackBarModule,
    MatTooltipModule
  ],
  template: `
    <div class="page-container">
      <div class="page-header">
        <div>
          <h1 class="mat-headline-4">Detalle de Unidad</h1>
          <p class="mat-body-1">Información completa de la unidad</p>
        </div>
        <div class="header-actions">
          <button mat-button routerLink="/unidades">
            <mat-icon>arrow_back</mat-icon>
            Volver
          </button>
          <button mat-raised-button color="primary" [routerLink]="['/unidades/editar', unit?.id]">
            <mat-icon>edit</mat-icon>
            Editar
          </button>
        </div>
      </div>

      @if (loading) {
        <mat-card>
          <mat-card-content>
            <div class="loading-container">
              <mat-spinner></mat-spinner>
            </div>
          </mat-card-content>
        </mat-card>
      } @else if (error) {
        <mat-card>
          <mat-card-content>
            <div class="error-container">
              <mat-icon color="warn">error</mat-icon>
              <p>{{ error }}</p>
            </div>
          </mat-card-content>
        </mat-card>
      } @else if (unit) {
        <div class="detail-grid">
          <mat-card>
            <mat-card-header>
              <mat-card-title>Información General</mat-card-title>
            </mat-card-header>
            <mat-card-content>
              <div class="detail-item">
                <span class="label">Edificio:</span>
                <span class="value">{{ unit.building?.name || '-' }}</span>
              </div>
              <div class="detail-item">
                <span class="label">Número de Departamento:</span>
                <span class="value">{{ unit.number }}</span>
              </div>
              @if (unit.unitType) {
                <div class="detail-item">
                  <span class="label">Tipo:</span>
                  <span class="value">{{ UnitTypeLabels[unit.unitType] || unit.unitType }}</span>
                </div>
              }
              <div class="detail-item">
                <span class="label">Piso:</span>
                <span class="value">{{ unit.floor }}</span>
              </div>
              @if (unit.block) {
                <div class="detail-item">
                  <span class="label">Bloque:</span>
                  <span class="value">{{ unit.block }}</span>
                </div>
              }
              <div class="detail-item">
                <span class="label">Estado:</span>
                <div class="status-control">
                  @if (!editingStatus) {
                    <mat-chip [class]="getStatusClass(unit.status || UnitStatus.AVAILABLE)">
                      {{ getStatusLabel(unit.status || UnitStatus.AVAILABLE) }}
                    </mat-chip>
                    <button mat-icon-button
                            (click)="editingStatus = true"
                            matTooltip="Cambiar estado"
                            matTooltipPosition="right"
                            class="edit-status-btn">
                      <mat-icon>edit</mat-icon>
                    </button>
                  } @else {
                    <mat-form-field appearance="outline" class="status-select">
                      <mat-select
                        [value]="unit.status || UnitStatus.AVAILABLE"
                        (selectionChange)="onStatusChange($event.value)">
                        @for (status of unitStatuses; track status.value) {
                          <mat-option [value]="status.value">{{ status.label }}</mat-option>
                        }
                      </mat-select>
                    </mat-form-field>
                    <button mat-icon-button
                            (click)="editingStatus = false"
                            matTooltip="Cancelar"
                            matTooltipPosition="right">
                      <mat-icon>close</mat-icon>
                    </button>
                  }
                </div>
              </div>
            </mat-card-content>
          </mat-card>

          <mat-card>
            <mat-card-header>
              <mat-card-title>Características</mat-card-title>
            </mat-card-header>
            <mat-card-content>
              <div class="detail-item">
                <mat-icon>square_foot</mat-icon>
                <span class="label">Área:</span>
                <span class="value">{{ unit.areaM2 || '-' }} m²</span>
              </div>
              <div class="detail-item">
                <mat-icon>bed</mat-icon>
                <span class="label">Dormitorios:</span>
                <span class="value">{{ unit.bedrooms }}</span>
              </div>
              <div class="detail-item">
                <mat-icon>bathtub</mat-icon>
                <span class="label">Baños:</span>
                <span class="value">{{ unit.bathrooms }}</span>
              </div>
              <div class="detail-item">
                <mat-icon>directions_car</mat-icon>
                <span class="label">Estacionamientos:</span>
                <span class="value">{{ unit.parkingSpots }}</span>
              </div>
              <div class="detail-item">
                <mat-icon>inventory_2</mat-icon>
                <span class="label">Bodegas:</span>
                <span class="value">{{ unit.storageUnits }}</span>
              </div>
            </mat-card-content>
          </mat-card>
        </div>
      }
    </div>
  `,
  styles: [`
    .page-container {
      max-width: 1200px;
      margin: 0 auto;
    }

    .page-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 24px;

      h1 {
        margin: 0 0 8px 0;
      }

      p {
        margin: 0;
        color: var(--mat-sys-on-surface-variant);
      }

      .header-actions {
        display: flex;
        gap: 12px;
      }
    }

    .loading-container, .error-container {
      display: flex;
      justify-content: center;
      align-items: center;
      padding: 48px;
      gap: 16px;
    }

    .detail-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 24px;
    }

    .detail-item {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 12px 0;
      border-bottom: 1px solid rgba(0, 0, 0, 0.12);

      &:last-child {
        border-bottom: none;
      }

      mat-icon {
        color: var(--mat-sys-primary);
      }

      .label {
        font-weight: 500;
        color: var(--mat-sys-on-surface-variant);
        min-width: 150px;
      }

      .value {
        color: var(--mat-sys-on-surface);
        flex: 1;
      }

      .status-control {
        display: flex;
        align-items: center;
        gap: 12px;
        flex: 1;
      }
    }

    .status-select {
      width: 180px;
      margin: 0;
    }

    .status-select ::ng-deep .mat-mdc-form-field-subscript-wrapper {
      display: none;
    }

    .edit-status-btn {
      opacity: 0.5;
      transition: opacity 0.2s;

      &:hover {
        opacity: 1;
      }
    }

    .chip-available {
      background-color: #e8f5e9;
      color: #2e7d32;
    }

    .chip-occupied {
      background-color: #ffebee;
      color: #c62828;
    }

    .chip-maintenance {
      background-color: #fff3e0;
      color: #e65100;
    }

    .chip-reserved {
      background-color: #e3f2fd;
      color: #1976d2;
    }

    .chip-out_of_service {
      background-color: #f5f5f5;
      color: #616161;
    }
  `]
})
export class UnitDetailComponent implements OnInit, OnDestroy {
  unit: IUnit | null = null;
  loading = true;
  error: string | null = null;
  editingStatus = false;
  UnitStatus = UnitStatus;
  UnitType = UnitType;
  UnitStatusLabels = UnitStatusLabels;
  UnitTypeLabels = UnitTypeLabels;
  unitStatuses = [
    { value: UnitStatus.AVAILABLE, label: UnitStatusLabels[UnitStatus.AVAILABLE] },
    { value: UnitStatus.OCCUPIED, label: UnitStatusLabels[UnitStatus.OCCUPIED] },
    { value: UnitStatus.MAINTENANCE, label: UnitStatusLabels[UnitStatus.MAINTENANCE] },
    { value: UnitStatus.RESERVED, label: UnitStatusLabels[UnitStatus.RESERVED] },
    { value: UnitStatus.OUT_OF_SERVICE, label: UnitStatusLabels[UnitStatus.OUT_OF_SERVICE] }
  ];
  private destroy$ = new Subject<void>();

  constructor(
    private unitService: UnitService,
    private route: ActivatedRoute,
    private router: Router,
    private cdr: ChangeDetectorRef,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadUnit(id);
    } else {
      this.router.navigate(['/unidades']);
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadUnit(id: string): void {
    this.loading = true;
    this.error = null;
    this.unit = null;
    this.editingStatus = false;
    this.cdr.detectChanges();

    this.unitService.getUnitById(id).pipe(takeUntil(this.destroy$)).subscribe({
      next: (unit: IUnit) => {
        this.unit = unit;
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.error = 'Error al cargar la unidad. Por favor, verifica la conexión con el servidor.';
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  getStatusLabel(status: UnitStatus): string {
    return UnitStatusLabels[status] || status;
  }

  getStatusClass(status: UnitStatus): string {
    const classMap: { [key in UnitStatus]: string } = {
      [UnitStatus.AVAILABLE]: 'chip-available',
      [UnitStatus.OCCUPIED]: 'chip-occupied',
      [UnitStatus.MAINTENANCE]: 'chip-maintenance',
      [UnitStatus.RESERVED]: 'chip-reserved',
      [UnitStatus.OUT_OF_SERVICE]: 'chip-out_of_service'
    };
    return classMap[status] || 'chip-available';
  }

  onStatusChange(newStatus: UnitStatus): void {
    if (!this.unit) return;

    this.unitService.updateUnitStatus(this.unit.id, newStatus).pipe(takeUntil(this.destroy$)).subscribe({
      next: (updatedUnit) => {
        this.unit = updatedUnit;
        this.editingStatus = false;
        this.cdr.detectChanges();
        this.snackBar.open(
          `Unidad marcada como ${this.getStatusLabel(newStatus)}`,
          'Cerrar',
          {
            duration: 3000,
            horizontalPosition: 'end',
            verticalPosition: 'top'
          }
        );
      },
      error: () => {
        this.snackBar.open('Error al actualizar el estado de la unidad', 'Cerrar', {
          duration: 3000,
          horizontalPosition: 'end',
          verticalPosition: 'top',
          panelClass: ['error-snackbar']
        });
        // Recargar para revertir el cambio visual
        if (this.unit) {
          this.loadUnit(this.unit.id);
        }
      }
    });
  }
}

