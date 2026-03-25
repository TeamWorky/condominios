import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';

import { ResidentService } from '../../services/resident.service';
import { BuildingService } from '../../../../core/services/building.service';
import { UnitService } from '../../../unidades/services/unit.service';
import { AuthService } from '../../../../core/services/auth.service';
import { IResident, ResidentType } from '../../../../core/models/resident.model';
import { IBuilding } from '../../../../core/models/building.model';
import { IUnit } from '../../../../core/models/unit.model';
import { ConfirmDialogComponent } from '../../../edificios/components/confirm-dialog/confirm-dialog.component';
import { RutFormatPipe } from '../../../../core/pipes/rut-format.pipe';

const RESIDENT_TYPE_LABELS: Record<string, string> = {
  [ResidentType.OWNER]: 'Propietario',
  [ResidentType.TENANT]: 'Arrendatario',
  [ResidentType.FAMILY_MEMBER]: 'Familiar',
  [ResidentType.GUEST]: 'Invitado',
};

@Component({
  selector: 'app-resident-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    MatTableModule,
    MatPaginatorModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatChipsModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatTooltipModule,
    MatDialogModule,
    MatSelectModule,
    MatFormFieldModule,
    RutFormatPipe,
  ],
  templateUrl: './resident-list.component.html',
  styleUrls: ['./resident-list.component.scss'],
})
export class ResidentListComponent implements OnInit, OnDestroy {
  displayedColumns: string[] = [
    'fullName',
    'document',
    'residentType',
    'isActive',
    'moveInDate',
    'actions',
  ];
  dataSource = new MatTableDataSource<IResident>([]);
  loading = false;
  error: string | null = null;
  total = 0;
  currentPage = 1;
  pageSize = 10;

  buildings: IBuilding[] = [];
  units: IUnit[] = [];
  selectedBuildingId: string | null = null;
  selectedUnitId: string | null = null;
  loadingBuildings = true;
  loadingUnits = false;

  private destroy$ = new Subject<void>();

  constructor(
    private residentService: ResidentService,
    private buildingService: BuildingService,
    private unitService: UnitService,
    private authService: AuthService,
    private cdr: ChangeDetectorRef,
    private snackBar: MatSnackBar,
    private dialog: MatDialog,
  ) {}

  ngOnInit(): void {
    this.loadBuildings();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadBuildings(): void {
    this.loadingBuildings = true;
    const selectedCondominio = this.authService.getSelectedCondominio();
    if (!selectedCondominio) {
      this.error = 'No hay condominio seleccionado';
      this.loadingBuildings = false;
      this.cdr.detectChanges();
      return;
    }

    this.buildingService
      .getBuildingsByCondominium(selectedCondominio.id, 1, 100)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (result) => {
          this.buildings = result.data.filter((b) => b.isActive);
          this.loadingBuildings = false;
          this.cdr.detectChanges();
        },
        error: () => {
          this.error = 'Error al cargar los edificios';
          this.loadingBuildings = false;
          this.cdr.detectChanges();
        },
      });
  }

  onBuildingChange(buildingId: string): void {
    this.selectedBuildingId = buildingId;
    this.selectedUnitId = null;
    this.units = [];
    this.dataSource.data = [];
    this.total = 0;
    this.loadUnits(buildingId);
  }

  loadUnits(buildingId: string): void {
    this.loadingUnits = true;
    this.unitService
      .getUnitsByBuilding(buildingId, 1, 100)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (result) => {
          this.units = result.data;
          this.loadingUnits = false;
          this.cdr.detectChanges();
        },
        error: () => {
          this.snackBar.open('Error al cargar las unidades', 'Cerrar', {
            duration: 3000,
            horizontalPosition: 'end',
            verticalPosition: 'top',
            panelClass: ['error-snackbar'],
          });
          this.loadingUnits = false;
          this.cdr.detectChanges();
        },
      });
  }

  onUnitChange(unitId: string): void {
    this.selectedUnitId = unitId;
    this.currentPage = 1;
    this.loadResidents();
  }

  loadResidents(): void {
    if (!this.selectedUnitId) return;

    this.loading = true;
    this.error = null;

    this.residentService
      .getResidentsByUnit(this.selectedUnitId, this.currentPage, this.pageSize)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (result) => {
          this.dataSource.data = result.data;
          this.total = result.total;
          this.loading = false;
          this.cdr.detectChanges();
        },
        error: () => {
          this.error = 'Error al cargar los residentes';
          this.loading = false;
          this.cdr.detectChanges();
          this.snackBar.open('Error al cargar los residentes', 'Cerrar', {
            duration: 3000,
            horizontalPosition: 'end',
            verticalPosition: 'top',
            panelClass: ['error-snackbar'],
          });
        },
      });
  }

  onPageChange(event: PageEvent): void {
    this.currentPage = event.pageIndex + 1;
    this.pageSize = event.pageSize;
    this.loadResidents();
  }

  getResidentTypeLabel(type: string): string {
    return RESIDENT_TYPE_LABELS[type] || type;
  }

  getStatusClass(isActive: boolean): string {
    return isActive ? 'chip-active' : 'chip-inactive';
  }

  getStatusLabel(isActive: boolean): string {
    return isActive ? 'Activo' : 'Inactivo';
  }

  onToggleStatus(resident: IResident): void {
    const action = resident.isActive ? 'desactivar' : 'activar';
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: `${resident.isActive ? 'Desactivar' : 'Activar'} residente`,
        message: `¿Está seguro que desea ${action} al residente "${resident.firstName} ${resident.lastName}"?`,
        confirmText: resident.isActive ? 'Desactivar' : 'Activar',
        cancelText: 'Cancelar',
        isDestructive: resident.isActive,
      },
    });

    dialogRef
      .afterClosed()
      .pipe(takeUntil(this.destroy$))
      .subscribe((confirmed) => {
        if (confirmed) {
          this.executeToggle(resident);
        }
      });
  }

  private executeToggle(resident: IResident): void {
    const newStatus = !resident.isActive;
    this.residentService
      .toggleResidentStatus(resident.id, newStatus)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          const action = newStatus ? 'activado' : 'desactivado';
          this.snackBar.open(
            `Residente ${action} exitosamente`,
            'Cerrar',
            {
              duration: 3000,
              horizontalPosition: 'end',
              verticalPosition: 'top',
            },
          );
          this.loadResidents();
        },
        error: () => {
          this.snackBar.open(
            'Error al cambiar el estado del residente',
            'Cerrar',
            {
              duration: 3000,
              horizontalPosition: 'end',
              verticalPosition: 'top',
              panelClass: ['error-snackbar'],
            },
          );
        },
      });
  }
}
