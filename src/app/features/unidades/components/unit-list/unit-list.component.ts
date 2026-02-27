import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { UnitService } from '../../services/unit.service';
import { IUnit, UnitStatus, UnitStatusLabels } from '../../../../core/models/unit.model';
import { AuthService } from '../../../../core/services/auth.service';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-unit-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatTableModule,
    MatChipsModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatPaginatorModule
  ],
  template: `
    <div class="page-container">
      <div class="page-header">
        <div>
          <h1 class="mat-headline-4">Unidades</h1>
          <p class="mat-body-1">Gestión de departamentos y unidades del condominio</p>
        </div>
        <div class="header-actions">
          <button mat-button routerLink="/unidades">
            <mat-icon>grid_view</mat-icon>
            Vista por Torre
          </button>
          <button mat-raised-button color="primary" routerLink="/unidades/nuevo">
            <mat-icon>add</mat-icon>
            Nueva Unidad
          </button>
        </div>
      </div>

      <mat-card>
        <mat-card-content>
          @if (loading) {
            <div class="loading-container">
              <mat-spinner></mat-spinner>
            </div>
          } @else if (error) {
            <div class="error-container">
              <mat-icon color="warn">error</mat-icon>
              <p>{{ error }}</p>
            </div>
          } @else {
            <table mat-table [dataSource]="dataSource" class="units-table">

              <ng-container matColumnDef="building">
                <th mat-header-cell *matHeaderCellDef>Edificio</th>
                <td mat-cell *matCellDef="let unit">{{ unit.building?.name || '-' }}</td>
              </ng-container>

              <ng-container matColumnDef="unitNumber">
                <th mat-header-cell *matHeaderCellDef>N° Depto</th>
                <td mat-cell *matCellDef="let unit">{{ unit.number }}</td>
              </ng-container>

              <ng-container matColumnDef="floor">
                <th mat-header-cell *matHeaderCellDef>Piso</th>
                <td mat-cell *matCellDef="let unit">{{ unit.floor }}</td>
              </ng-container>

              <ng-container matColumnDef="block">
                <th mat-header-cell *matHeaderCellDef>Bloque</th>
                <td mat-cell *matCellDef="let unit">{{ unit.block || '-' }}</td>
              </ng-container>

              <ng-container matColumnDef="area">
                <th mat-header-cell *matHeaderCellDef>Área (m²)</th>
                <td mat-cell *matCellDef="let unit">{{ unit.areaM2 || '-' }}</td>
              </ng-container>

              <ng-container matColumnDef="bedrooms">
                <th mat-header-cell *matHeaderCellDef>Dormitorios</th>
                <td mat-cell *matCellDef="let unit">{{ unit.bedrooms }}</td>
              </ng-container>

              <ng-container matColumnDef="status">
                <th mat-header-cell *matHeaderCellDef>Estado</th>
                <td mat-cell *matCellDef="let unit">
                  <mat-chip [class]="getStatusClass(unit.status || UnitStatus.AVAILABLE)">
                    {{ getStatusLabel(unit.status || UnitStatus.AVAILABLE) }}
                  </mat-chip>
                </td>
              </ng-container>

              <ng-container matColumnDef="actions">
                <th mat-header-cell *matHeaderCellDef>Acciones</th>
                <td mat-cell *matCellDef="let unit">
                  <button mat-icon-button [routerLink]="['/unidades', unit.id]">
                    <mat-icon>visibility</mat-icon>
                  </button>
                  <button mat-icon-button [routerLink]="['/unidades', unit.id, 'editar']">
                    <mat-icon>edit</mat-icon>
                  </button>
                  <button mat-icon-button color="warn" (click)="onDelete(unit.id)">
                    <mat-icon>delete</mat-icon>
                  </button>
                </td>
              </ng-container>

              <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
              <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
            </table>

            @if (total > 0) {
              <mat-paginator
                [length]="total"
                [pageSize]="pageSize"
                [pageSizeOptions]="[10, 25, 50, 100]"
                [pageIndex]="currentPage - 1"
                (page)="onPageChange($event)"
                showFirstLastButtons>
              </mat-paginator>
            }
          }
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .page-container {
      max-width: 1400px;
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
        align-items: center;
      }
    }

    .units-table {
      width: 100%;
    }

    .loading-container, .error-container {
      display: flex;
      justify-content: center;
      align-items: center;
      padding: 48px;
      gap: 16px;
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
export class UnitListComponent implements OnInit, OnDestroy {
  dataSource = new MatTableDataSource<IUnit>([]);
  displayedColumns: string[] = ['building', 'unitNumber', 'floor', 'block', 'area', 'bedrooms', 'status', 'actions'];
  loading = true;
  error: string | null = null;
  UnitStatus = UnitStatus;
  currentPage = 1;
  pageSize = 10;
  total = 0;
  private destroy$ = new Subject<void>();

  constructor(
    private unitService: UnitService,
    private authService: AuthService,
    private cdr: ChangeDetectorRef,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.loadUnits();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadUnits(): void {
    const selectedCondominio = this.authService.getSelectedCondominio();
    if (!selectedCondominio) {
      this.error = 'No hay condominio seleccionado';
      this.loading = false;
      this.cdr.detectChanges();
      return;
    }

    this.loading = true;
    this.error = null;
    this.cdr.detectChanges();

    this.unitService.getUnitsByCondominium(
      selectedCondominio.id,
      this.currentPage,
      this.pageSize
    ).pipe(takeUntil(this.destroy$)).subscribe({
      next: (result) => {
        this.dataSource.data = result.data;
        this.total = result.total;
        this.loading = false;
        this.cdr.detectChanges();
        console.log('Units loaded:', result);
      },
      error: (err) => {
        this.error = 'Error al cargar las unidades. Por favor, verifica la conexión con el servidor.';
        this.loading = false;
        this.cdr.detectChanges();
        console.error('Error loading units:', err);
        this.snackBar.open('Error al cargar las unidades', 'Cerrar', {
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
    this.loadUnits();
  }

  onDelete(id: string): void {
    if (confirm('¿Está seguro de eliminar esta unidad?')) {
      this.unitService.deleteUnit(id).subscribe({
        next: () => {
          this.snackBar.open('Unidad eliminada exitosamente', 'Cerrar', {
            duration: 3000,
            horizontalPosition: 'end',
            verticalPosition: 'top'
          });
          this.loadUnits();
        },
        error: (err) => {
          console.error('Error deleting unit:', err);
          this.snackBar.open('Error al eliminar la unidad', 'Cerrar', {
            duration: 3000,
            horizontalPosition: 'end',
            verticalPosition: 'top',
            panelClass: ['error-snackbar']
          });
        }
      });
    }
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

}

