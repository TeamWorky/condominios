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
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { CommonSpaceService } from '../../../../core/services/common-space.service';
import { BuildingService } from '../../../../core/services/building.service';
import { AuthService } from '../../../../core/services/auth.service';
import { ICommonSpace, CommonSpaceType } from '../../../../core/models/common-space.model';
import { IBuilding } from '../../../../core/models/building.model';
import { ReservationDialogComponent, ReservationDialogData } from '../reservation-dialog/reservation-dialog.component';
import { Subject, takeUntil } from 'rxjs';

interface GroupedSpaces {
  building: IBuilding;
  spaces: ICommonSpace[];
}

@Component({
  selector: 'app-space-list',
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
    MatExpansionModule,
    MatDialogModule,
    MatSnackBarModule
  ],
  template: `
    <div class="page-container">
      <div class="page-header">
        <div>
          <h1 class="mat-headline-4">Espacios Comunes</h1>
          <p class="mat-body-1">Gestión de espacios comunes por torre</p>
        </div>
        <div class="header-actions">
          <button mat-raised-button color="primary" routerLink="/espacios-comunes/calendario">
            <mat-icon>calendar_view_week</mat-icon>
            Ver Calendario
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
      } @else if (groupedSpaces.length > 0) {
        <mat-tab-group>
          @for (group of groupedSpaces; track group.building.id) {
            <mat-tab [label]="group.building.name">
              <div class="building-container">
                @if (group.spaces.length === 0) {
                  <mat-card>
                    <mat-card-content>
                      <p class="mat-body-1">No hay espacios comunes registrados para este edificio.</p>
                    </mat-card-content>
                  </mat-card>
                } @else {
                  <div class="spaces-grid">
                    @for (space of group.spaces; track space.id) {
                      <mat-card class="space-card">
                        <mat-card-header>
                          <mat-card-title>
                            <mat-icon>{{ getTypeIcon(space.type) }}</mat-icon>
                            {{ space.name }}
                          </mat-card-title>
                          <mat-card-subtitle>
                            <mat-chip>{{ getTypeLabel(space.type) }}</mat-chip>
                            @if (space.location) {
                              <span class="location">📍 {{ space.location }}</span>
                            }
                          </mat-card-subtitle>
                        </mat-card-header>
                        <mat-card-content>
                          @if (space.description) {
                            <p class="description">{{ space.description }}</p>
                          }
                          
                          <div class="space-info">
                            @if (space.capacity) {
                              <div class="info-item">
                                <mat-icon>people</mat-icon>
                                <span>Capacidad: {{ space.capacity }} personas</span>
                              </div>
                            }
                            @if (space.area) {
                              <div class="info-item">
                                <mat-icon>square_foot</mat-icon>
                                <span>Área: {{ space.area }} m²</span>
                              </div>
                            }
                            @if (space.isReservable) {
                              <div class="info-item">
                                <mat-icon>schedule</mat-icon>
                                <span>
                                  Reservable: {{ space.reservationStartTime }} - {{ space.reservationEndTime }}
                                </span>
                              </div>
                              <div class="info-item">
                                <mat-icon>{{ space.isExclusive ? 'lock' : 'group' }}</mat-icon>
                                <span>
                                  {{ space.isExclusive ? 'Uso Exclusivo' : 'Uso Compartido' }}
                                </span>
                              </div>
                            } @else {
                              <div class="info-item">
                                <mat-icon>block</mat-icon>
                                <span>No reservable</span>
                              </div>
                            }
                          </div>

                          @if (space.amenities && space.amenities.length > 0) {
                            <div class="amenities">
                              <strong>Amenidades:</strong>
                              <div class="amenities-list">
                                @for (amenity of space.amenities; track amenity) {
                                  <mat-chip class="amenity-chip">{{ amenity }}</mat-chip>
                                }
                              </div>
                            </div>
                          }
                        </mat-card-content>
                        <mat-card-actions>
                          <button mat-button [routerLink]="['/espacios-comunes', space.id]">
                            <mat-icon>visibility</mat-icon>
                            Ver Detalles
                          </button>
                          @if (space.isReservable) {
                            <button mat-raised-button color="primary" (click)="openReservationDialog(space)">
                              <mat-icon>event</mat-icon>
                              Reservar
                            </button>
                          }
                        </mat-card-actions>
                      </mat-card>
                    }
                  </div>
                }
              </div>
            </mat-tab>
          }
        </mat-tab-group>
      } @else {
        <mat-card>
          <mat-card-content>
            <p class="mat-body-1">No hay espacios comunes registrados.</p>
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

    .spaces-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
      gap: 24px;
    }

    .space-card {
      transition: transform 0.2s, box-shadow 0.2s;
      height: 100%;
      display: flex;
      flex-direction: column;

      &:hover {
        transform: translateY(-4px);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      }
    }

    mat-card-title {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    mat-card-subtitle {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-top: 8px;

      .location {
        color: var(--mat-sys-on-surface-variant);
        font-size: 0.875rem;
      }
    }

    .description {
      color: var(--mat-sys-on-surface-variant);
      margin: 16px 0;
    }

    .space-info {
      display: flex;
      flex-direction: column;
      gap: 12px;
      margin: 16px 0;
    }

    .info-item {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 0.875rem;
      color: var(--mat-sys-on-surface);

      mat-icon {
        font-size: 18px;
        width: 18px;
        height: 18px;
        color: var(--mat-sys-primary);
      }
    }

    .amenities {
      margin-top: 16px;
      padding-top: 16px;
      border-top: 1px solid rgba(0, 0, 0, 0.12);

      strong {
        display: block;
        margin-bottom: 8px;
        font-size: 0.875rem;
        color: var(--mat-sys-on-surface-variant);
      }
    }

    .amenities-list {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
    }

    .amenity-chip {
      font-size: 0.75rem;
      height: 24px;
    }

    mat-card-actions {
      margin-top: auto;
      padding: 8px 16px 16px;
    }
  `]
})
export class SpaceListComponent implements OnInit, OnDestroy {
  spaces: ICommonSpace[] = [];
  buildings: IBuilding[] = [];
  groupedSpaces: GroupedSpaces[] = [];
  loading = true;
  error: string | null = null;
  private destroy$ = new Subject<void>();

  constructor(
    private commonSpaceService: CommonSpaceService,
    private buildingService: BuildingService,
    private authService: AuthService,
    private cdr: ChangeDetectorRef,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.loadData();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadData(): void {
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

    // Cargar edificios y espacios en paralelo
    const buildings$ = this.buildingService.getActiveBuildings(selectedCondominio.id);
    const spaces$ = this.commonSpaceService.getCommonSpaces();

    buildings$.pipe(takeUntil(this.destroy$)).subscribe({
      next: (buildings) => {
        this.buildings = buildings;
        this.groupSpaces();
      },
      error: (err) => {
        console.error('Error loading buildings:', err);
        this.error = 'Error al cargar los edificios.';
        this.loading = false;
        this.cdr.detectChanges();
      }
    });

    spaces$.pipe(takeUntil(this.destroy$)).subscribe({
      next: (spaces) => {
        this.spaces = spaces;
        this.groupSpaces();
      },
      error: (err) => {
        console.error('Error loading spaces:', err);
        this.error = 'Error al cargar los espacios comunes. Por favor, verifica que el servidor mock esté ejecutándose.';
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  groupSpaces(): void {
    if (this.buildings.length === 0 || this.spaces.length === 0) {
      if (this.buildings.length > 0 && this.spaces.length === 0) {
        this.loading = false;
        this.cdr.detectChanges();
      }
      return;
    }

    // Agrupar espacios por edificio
    this.groupedSpaces = this.buildings.map(building => ({
      building,
      spaces: this.spaces
        .filter(space => space.buildingId === building.id && space.isActive)
        .sort((a, b) => a.name.localeCompare(b.name))
    })).filter(group => group.spaces.length > 0);

    this.loading = false;
    this.cdr.detectChanges();
  }

  getTypeLabel(type: CommonSpaceType): string {
    const labels: { [key in CommonSpaceType]: string } = {
      [CommonSpaceType.SALON_EVENTOS]: 'Salón de Eventos',
      [CommonSpaceType.GIMNASIO]: 'Gimnasio',
      [CommonSpaceType.PISCINA]: 'Piscina',
      [CommonSpaceType.QUINCHO]: 'Quincho',
      [CommonSpaceType.SALA_MULTIUSO]: 'Sala Multiuso',
      [CommonSpaceType.CANCHA_DEPORTIVA]: 'Cancha Deportiva',
      [CommonSpaceType.JARDIN]: 'Jardín',
      [CommonSpaceType.PLAYGROUND]: 'Playground',
      [CommonSpaceType.BIBLIOTECA]: 'Biblioteca',
      [CommonSpaceType.SALA_DE_JUEGOS]: 'Sala de Juegos',
      [CommonSpaceType.OTRO]: 'Otro'
    };
    return labels[type] || type;
  }

  getTypeIcon(type: CommonSpaceType): string {
    const icons: { [key in CommonSpaceType]: string } = {
      [CommonSpaceType.SALON_EVENTOS]: 'event',
      [CommonSpaceType.GIMNASIO]: 'fitness_center',
      [CommonSpaceType.PISCINA]: 'pool',
      [CommonSpaceType.QUINCHO]: 'outdoor_grill',
      [CommonSpaceType.SALA_MULTIUSO]: 'meeting_room',
      [CommonSpaceType.CANCHA_DEPORTIVA]: 'sports_soccer',
      [CommonSpaceType.JARDIN]: 'park',
      [CommonSpaceType.PLAYGROUND]: 'child_care',
      [CommonSpaceType.BIBLIOTECA]: 'menu_book',
      [CommonSpaceType.SALA_DE_JUEGOS]: 'sports_esports',
      [CommonSpaceType.OTRO]: 'place'
    };
    return icons[type] || 'place';
  }

  openReservationDialog(space: ICommonSpace): void {
    // TODO: Obtener datos del residente actual desde el servicio de autenticación
    // Por ahora usamos datos de ejemplo
    const dialogData: ReservationDialogData = {
      space,
      residentId: '1', // Esto debería venir del servicio de autenticación
      residentName: 'Juan Pérez García', // Esto debería venir del servicio de autenticación
      unitNumber: '101' // Esto debería venir del servicio de autenticación
    };

    const dialogRef = this.dialog.open(ReservationDialogComponent, {
      width: '600px',
      data: dialogData
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        // Recargar espacios si se creó una reserva
        this.loadData();
      }
    });
  }
}

