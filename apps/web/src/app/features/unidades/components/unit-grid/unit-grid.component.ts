import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTabsModule } from '@angular/material/tabs';
import { MatExpansionModule } from '@angular/material/expansion';
import { UnitService } from '../../services/unit.service';
import { IUnit, UnitStatus, UnitStatusLabels } from '../../../../core/models/unit.model';
import { AuthService } from '../../../../core/services/auth.service';
import { Subject, takeUntil } from 'rxjs';

interface GroupedUnits {
  building: string;
  floors: {
    floor: number;
    units: IUnit[];
  }[];
}

@Component({
  selector: 'app-unit-grid',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatProgressSpinnerModule,
    MatTabsModule,
    MatExpansionModule
  ],
  template: `
    <div class="page-container">
      <div class="page-header">
        <div>
          <h1 class="mat-headline-4">Vista por Torre y Piso</h1>
          <p class="mat-body-1">Visualización de unidades organizadas por edificio y piso</p>
        </div>
        <div class="header-actions">
          <button mat-button routerLink="/unidades/lista">
            <mat-icon>list</mat-icon>
            Vista de Lista
          </button>
          <button mat-raised-button color="primary" routerLink="/unidades/nuevo">
            <mat-icon>add</mat-icon>
            Nueva Unidad
          </button>
        </div>
      </div>

      @if (loading) {
        <div class="loading-container">
          <mat-spinner></mat-spinner>
        </div>
      } @else if (error) {
        <mat-card>
          <mat-card-content>
            <div class="error-container">
              <mat-icon color="warn">error</mat-icon>
              <p>{{ error }}</p>
            </div>
          </mat-card-content>
        </mat-card>
      } @else if (groupedUnits.length > 0) {
        <mat-tab-group>
          @for (buildingGroup of groupedUnits; track buildingGroup.building) {
            <mat-tab [label]="buildingGroup.building">
              <div class="building-container">
                @for (floorGroup of buildingGroup.floors; track floorGroup.floor) {
                  <mat-expansion-panel class="floor-panel">
                    <mat-expansion-panel-header>
                      <mat-panel-title>
                        <mat-icon>layers</mat-icon>
                        Piso {{ floorGroup.floor }}
                      </mat-panel-title>
                      <mat-panel-description>
                        {{ floorGroup.units.length }} {{ floorGroup.units.length === 1 ? 'unidad' : 'unidades' }}
                      </mat-panel-description>
                    </mat-expansion-panel-header>
                    
                    <div class="units-grid">
                      @for (unit of floorGroup.units; track unit.id) {
                        <mat-card class="unit-card" [class]="getStatusClass(unit.status || UnitStatus.AVAILABLE)">
                          <mat-card-header>
                            <mat-card-title>
                              <mat-icon>apartment</mat-icon>
                              {{ unit.number }}
                            </mat-card-title>
                            <mat-card-subtitle>
                              @if (unit.block) {
                                Bloque {{ unit.block }}
                              }
                            </mat-card-subtitle>
                          </mat-card-header>
                          <mat-card-content>
                            <div class="unit-info">
                              <div class="info-item">
                                <mat-icon>square_foot</mat-icon>
                                <span>{{ unit.areaM2 }} m²</span>
                              </div>
                              <div class="info-item">
                                <mat-icon>bed</mat-icon>
                                <span>{{ unit.bedrooms }} dorm.</span>
                              </div>
                              <div class="info-item">
                                <mat-icon>bathtub</mat-icon>
                                <span>{{ unit.bathrooms }} baños</span>
                              </div>
                              <div class="info-item">
                                <mat-icon>directions_car</mat-icon>
                                <span>{{ unit.parkingSpots || 0 }} estac.</span>
                              </div>
                            </div>
                            <div class="status-chip">
                              <mat-chip [class]="getStatusClass(unit.status || UnitStatus.AVAILABLE)">
                                {{ getStatusLabel(unit.status || UnitStatus.AVAILABLE) }}
                              </mat-chip>
                            </div>
                          </mat-card-content>
                          <mat-card-actions>
                            <button mat-button [routerLink]="['/unidades', unit.id]">
                              <mat-icon>visibility</mat-icon>
                              Ver
                            </button>
                            <button mat-button [routerLink]="['/unidades/editar', unit.id]">
                              <mat-icon>edit</mat-icon>
                              Editar
                            </button>
                          </mat-card-actions>
                        </mat-card>
                      }
                    </div>
                  </mat-expansion-panel>
                }
              </div>
            </mat-tab>
          }
        </mat-tab-group>
      } @else {
        <mat-card>
          <mat-card-content>
            <p class="mat-body-1">No hay unidades registradas</p>
          </mat-card-content>
        </mat-card>
      }
    </div>
  `,
  styles: [`
    .page-container {
      max-width: 1400px;
      margin: 0 auto;
      padding: 24px;
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

    .loading-container, .error-container {
      display: flex;
      justify-content: center;
      align-items: center;
      padding: 48px;
      gap: 16px;
    }

    .building-container {
      padding: 24px 0;
    }

    .floor-panel {
      margin-bottom: 16px;
    }

    .units-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
      gap: 16px;
      padding: 16px 0;
    }

    .unit-card {
      transition: transform 0.2s, box-shadow 0.2s;
      
      &:hover {
        transform: translateY(-4px);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      }

      &.status-disponible {
        border-left: 4px solid #2e7d32;
      }

      &.status-ocupada {
        border-left: 4px solid #c62828;
      }

      &.status-en-mantenimiento {
        border-left: 4px solid #e65100;
      }

      &.status-reservada {
        border-left: 4px solid #1976d2;
      }

      &.status-fuera-servicio {
        border-left: 4px solid #616161;
      }
    }

    .unit-info {
      display: flex;
      flex-wrap: wrap;
      gap: 16px;
      margin: 16px 0;
    }

    .info-item {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 0.875rem;
      color: var(--mat-sys-on-surface-variant);

      mat-icon {
        font-size: 18px;
        width: 18px;
        height: 18px;
        color: var(--mat-sys-primary);
      }
    }

    .status-chip {
      margin-top: 12px;
    }

    mat-card-title {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    mat-card-actions {
      display: flex;
      gap: 8px;
      padding: 8px 16px 16px;
    }

    .chip-disponible {
      background-color: #e8f5e9;
      color: #2e7d32;
    }

    .chip-ocupada {
      background-color: #ffebee;
      color: #c62828;
    }

    .chip-en-mantenimiento {
      background-color: #fff3e0;
      color: #e65100;
    }

    .chip-reservada {
      background-color: #e3f2fd;
      color: #1976d2;
    }

    .chip-fuera-servicio {
      background-color: #f5f5f5;
      color: #616161;
    }
  `]
})
export class UnitGridComponent implements OnInit, OnDestroy {
  units: IUnit[] = [];
  groupedUnits: GroupedUnits[] = [];
  loading = true;
  error: string | null = null;
  UnitStatus = UnitStatus;
  private readonly statusClassMap: { [key in UnitStatus]: string } = {
    [UnitStatus.AVAILABLE]: 'chip-disponible status-disponible',
    [UnitStatus.OCCUPIED]: 'chip-ocupada status-ocupada',
    [UnitStatus.MAINTENANCE]: 'chip-en-mantenimiento status-en-mantenimiento',
    [UnitStatus.RESERVED]: 'chip-reservada status-reservada',
    [UnitStatus.OUT_OF_SERVICE]: 'chip-fuera-servicio status-fuera-servicio'
  };
  private destroy$ = new Subject<void>();

  constructor(
    private unitService: UnitService,
    private authService: AuthService,
    private cdr: ChangeDetectorRef
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

    this.unitService.getUnitsByCondominium(selectedCondominio.id, 1, 100).pipe(takeUntil(this.destroy$)).subscribe({
      next: (result) => {
        this.units = result.data;
        this.groupUnits();
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.error = 'Error al cargar las unidades. Por favor, verifica la conexión con el servidor.';
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  groupUnits(): void {
    // Agrupar por edificio
    const byBuilding = new Map<string, IUnit[]>();
    
    this.units.forEach(unit => {
      const buildingName = unit.building?.name || 'Sin Edificio';
      if (!byBuilding.has(buildingName)) {
        byBuilding.set(buildingName, []);
      }
      byBuilding.get(buildingName)!.push(unit);
    });

    // Convertir a estructura agrupada
    this.groupedUnits = Array.from(byBuilding.entries()).map(([building, units]) => {
      // Agrupar por piso dentro de cada edificio
      const byFloor = new Map<number, IUnit[]>();
      
      units.forEach(unit => {
        const floor = unit.floor || 0;
        if (!byFloor.has(floor)) {
          byFloor.set(floor, []);
        }
        byFloor.get(floor)!.push(unit);
      });

      // Ordenar pisos de mayor a menor
      const floors = Array.from(byFloor.entries())
        .map(([floor, floorUnits]) => ({
          floor,
          units: floorUnits.sort((a, b) => (a.number || '').localeCompare(b.number || ''))
        }))
        .sort((a, b) => b.floor - a.floor); // Pisos más altos primero

      return {
        building,
        floors
      };
    }).sort((a, b) => a.building.localeCompare(b.building)); // Ordenar edificios alfabéticamente
  }

  getStatusLabel(status: UnitStatus): string {
    return UnitStatusLabels[status] || status;
  }

  getStatusClass(status: UnitStatus): string {
    return this.statusClassMap[status] || 'chip-disponible status-disponible';
  }
}

