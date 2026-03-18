import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ResidentService } from '../../services/resident.service';
import { IResident } from '../../../../core/models/resident.model';
import { Subject } from 'rxjs';

@Component({
  selector: 'app-resident-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatTableModule,
    MatChipsModule,
    MatProgressSpinnerModule
  ],
  template: `
    <div class="page-container">
      <div class="page-header">
        <div>
          <h1 class="mat-headline-4">Residentes</h1>
          <p class="mat-body-1">Gestión de propietarios y arrendatarios</p>
        </div>
        <button mat-raised-button color="primary" routerLink="/residentes/nuevo">
          <mat-icon>add</mat-icon>
          Nuevo Residente
        </button>
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
            <table mat-table [dataSource]="dataSource" class="residents-table">

              <ng-container matColumnDef="unitNumber">
                <th mat-header-cell *matHeaderCellDef>Unidad</th>
                <td mat-cell *matCellDef="let resident">{{ resident.unitNumber }}</td>
              </ng-container>

              <ng-container matColumnDef="fullName">
                <th mat-header-cell *matHeaderCellDef>Nombre</th>
                <td mat-cell *matCellDef="let resident">
                  {{ resident.firstName }} {{ resident.lastName }}
                </td>
              </ng-container>

              <ng-container matColumnDef="email">
                <th mat-header-cell *matHeaderCellDef>Email</th>
                <td mat-cell *matCellDef="let resident">{{ resident.email }}</td>
              </ng-container>

              <ng-container matColumnDef="phone">
                <th mat-header-cell *matHeaderCellDef>Teléfono</th>
                <td mat-cell *matCellDef="let resident">{{ resident.phone }}</td>
              </ng-container>

              <ng-container matColumnDef="residentType">
                <th mat-header-cell *matHeaderCellDef>Tipo</th>
                <td mat-cell *matCellDef="let resident">
                  <mat-chip [class]="'chip-' + resident.residentType.toLowerCase()">
                    {{ resident.residentType === 'OWNER' ? 'Propietario' : 'Arrendatario' }}
                  </mat-chip>
                </td>
              </ng-container>

              <ng-container matColumnDef="status">
                <th mat-header-cell *matHeaderCellDef>Estado</th>
                <td mat-cell *matCellDef="let resident">
                  <mat-chip [class]="resident.isActive ? 'chip-active' : 'chip-inactive'">
                    {{ resident.isActive ? 'Activo' : 'Inactivo' }}
                  </mat-chip>
                </td>
              </ng-container>

              <ng-container matColumnDef="actions">
                <th mat-header-cell *matHeaderCellDef>Acciones</th>
                <td mat-cell *matCellDef="let resident">
                  <button mat-icon-button [routerLink]="['/residentes', resident.id]">
                    <mat-icon>visibility</mat-icon>
                  </button>
                  <button mat-icon-button [routerLink]="['/residentes', resident.id, 'editar']">
                    <mat-icon>edit</mat-icon>
                  </button>
                  <button mat-icon-button color="warn" (click)="onDelete(resident.id)">
                    <mat-icon>delete</mat-icon>
                  </button>
                </td>
              </ng-container>

              <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
              <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
            </table>
          }
        </mat-card-content>
      </mat-card>
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
    }

    .residents-table {
      width: 100%;
    }

    .loading-container, .error-container {
      display: flex;
      justify-content: center;
      align-items: center;
      padding: 48px;
      gap: 16px;
    }

    .chip-owner {
      background-color: #e3f2fd;
      color: #1976d2;
    }

    .chip-tenant {
      background-color: #f3e5f5;
      color: #7b1fa2;
    }

    .chip-active {
      background-color: #e8f5e9;
      color: #2e7d32;
    }

    .chip-inactive {
      background-color: #ffebee;
      color: #c62828;
    }
  `]
})
export class ResidentListComponent implements OnInit, OnDestroy {
  dataSource = new MatTableDataSource<IResident>([]);
  displayedColumns: string[] = ['unitNumber', 'fullName', 'email', 'phone', 'residentType', 'status', 'actions'];
  loading = true;
  error: string | null = null;
  private destroy$ = new Subject<void>();

  constructor(
    private residentService: ResidentService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    // Cargar datos al inicializar el componente
    this.loadResidents();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadResidents(): void {
    // TODO: Refactor to load residents by unit - the backend requires /units/:unitId/residents
    // For now, show empty state until the resident list feature is properly connected
    this.loading = false;
    this.error = 'La lista de residentes requiere seleccionar una unidad. Esta funcionalidad sera actualizada proximamente.';
    this.cdr.detectChanges();
  }

  onDelete(id: string): void {
    if (confirm('¿Está seguro de eliminar este residente?')) {
      this.residentService.deleteResident(id).subscribe({
        next: () => {
          this.loadResidents();
        },
        error: (err) => {
          console.error('Error deleting resident:', err);
          alert('Error al eliminar el residente');
        }
      });
    }
  }
}
