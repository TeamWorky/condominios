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

import { BuildingService } from '../../../../core/services/building.service';
import { AuthService } from '../../../../core/services/auth.service';
import { IBuilding } from '../../../../core/models/building.model';
import { ConfirmDialogComponent } from '../confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-building-list',
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
    MatDialogModule
  ],
  templateUrl: './building-list.component.html',
  styleUrls: ['./building-list.component.scss']
})
export class BuildingListComponent implements OnInit, OnDestroy {
  displayedColumns: string[] = ['name', 'code', 'floors', 'address', 'isActive', 'actions'];
  dataSource = new MatTableDataSource<IBuilding>([]);
  loading = true;
  error: string | null = null;
  total = 0;
  currentPage = 1;
  pageSize = 10;

  private destroy$ = new Subject<void>();

  constructor(
    private buildingService: BuildingService,
    private authService: AuthService,
    private cdr: ChangeDetectorRef,
    private snackBar: MatSnackBar,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.loadBuildings();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadBuildings(): void {
    this.loading = true;
    this.error = null;

    const selectedCondominio = this.authService.getSelectedCondominio();
    if (!selectedCondominio) {
      this.error = 'No hay condominio seleccionado';
      this.loading = false;
      this.cdr.detectChanges();
      return;
    }

    this.buildingService.getBuildingsByCondominium(
      selectedCondominio.id,
      this.currentPage,
      this.pageSize
    ).pipe(takeUntil(this.destroy$)).subscribe({
      next: (result) => {
        this.dataSource.data = result.data;
        this.total = result.total;
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.error = 'Error al cargar los edificios. Por favor, verifica la conexion con el servidor.';
        this.loading = false;
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

  onPageChange(event: PageEvent): void {
    this.currentPage = event.pageIndex + 1;
    this.pageSize = event.pageSize;
    this.loadBuildings();
  }

  getStatusClass(isActive: boolean): string {
    return isActive ? 'chip-active' : 'chip-inactive';
  }

  getStatusLabel(isActive: boolean): string {
    return isActive ? 'Activo' : 'Inactivo';
  }

  onToggleStatus(building: IBuilding): void {
    const action = building.isActive ? 'desactivar' : 'activar';
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: `${building.isActive ? 'Desactivar' : 'Activar'} edificio`,
        message: `¿Está seguro que desea ${action} el edificio "${building.name}"?`,
        confirmText: building.isActive ? 'Desactivar' : 'Activar',
        cancelText: 'Cancelar',
        isDestructive: building.isActive
      }
    });

    dialogRef.afterClosed().pipe(takeUntil(this.destroy$)).subscribe(confirmed => {
      if (confirmed) {
        this.executeToggle(building);
      }
    });
  }

  private executeToggle(building: IBuilding): void {
    const newStatus = !building.isActive;
    this.buildingService.toggleBuildingStatus(building.id, newStatus)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          const action = newStatus ? 'activado' : 'desactivado';
          this.snackBar.open(`Edificio ${action} exitosamente`, 'Cerrar', {
            duration: 3000,
            horizontalPosition: 'end',
            verticalPosition: 'top'
          });
          this.loadBuildings();
        },
        error: () => {
          this.snackBar.open('Error al cambiar el estado del edificio', 'Cerrar', {
            duration: 3000,
            horizontalPosition: 'end',
            verticalPosition: 'top',
            panelClass: ['error-snackbar']
          });
        }
      });
  }
}
