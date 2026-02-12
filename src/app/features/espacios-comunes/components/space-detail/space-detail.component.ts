import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { CommonSpaceService } from '../../../../core/services/common-space.service';
import { BuildingService } from '../../../../core/services/building.service';
import { ICommonSpace, CommonSpaceType } from '../../../../core/models/common-space.model';
import { IBuilding } from '../../../../core/models/building.model';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-space-detail',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatProgressSpinnerModule
  ],
  template: `
    <div class="page-container">
      <div class="page-header">
        <div>
          <h1 class="mat-headline-4">Detalle de Espacio Común</h1>
          <p class="mat-body-1">Información completa del espacio</p>
        </div>
        <div class="header-actions">
          <button mat-button routerLink="/espacios-comunes">
            <mat-icon>arrow_back</mat-icon>
            Volver
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
      } @else if (space && building) {
        <div class="detail-grid">
          <mat-card>
            <mat-card-header>
              <mat-card-title>
                <mat-icon>{{ getTypeIcon(space.type) }}</mat-icon>
                {{ space.name }}
              </mat-card-title>
              <mat-card-subtitle>
                <mat-chip>{{ getTypeLabel(space.type) }}</mat-chip>
              </mat-card-subtitle>
            </mat-card-header>
            <mat-card-content>
              <div class="detail-item">
                <mat-icon>apartment</mat-icon>
                <span class="label">Edificio:</span>
                <span class="value">{{ building.name }}</span>
              </div>
              @if (space.location) {
                <div class="detail-item">
                  <mat-icon>place</mat-icon>
                  <span class="label">Ubicación:</span>
                  <span class="value">{{ space.location }}</span>
                </div>
              }
              @if (space.description) {
                <div class="detail-item">
                  <span class="label">Descripción:</span>
                  <span class="value">{{ space.description }}</span>
                </div>
              }
              <div class="detail-item">
                <mat-icon>{{ space.isReservable ? 'check_circle' : 'block' }}</mat-icon>
                <span class="label">Estado de Reserva:</span>
                <span class="value">
                  {{ space.isReservable ? 'Reservable' : 'No Reservable' }}
                </span>
              </div>
              @if (space.isReservable && space.reservationStartTime && space.reservationEndTime) {
                <div class="detail-item">
                  <mat-icon>schedule</mat-icon>
                  <span class="label">Horario de Reserva:</span>
                  <span class="value">{{ space.reservationStartTime }} - {{ space.reservationEndTime }}</span>
                </div>
              }
            </mat-card-content>
          </mat-card>

          <mat-card>
            <mat-card-header>
              <mat-card-title>Características</mat-card-title>
            </mat-card-header>
            <mat-card-content>
              @if (space.capacity) {
                <div class="detail-item">
                  <mat-icon>people</mat-icon>
                  <span class="label">Capacidad:</span>
                  <span class="value">{{ space.capacity }} personas</span>
                </div>
              }
              @if (space.area) {
                <div class="detail-item">
                  <mat-icon>square_foot</mat-icon>
                  <span class="label">Área:</span>
                  <span class="value">{{ space.area }} m²</span>
                </div>
              }
              @if (space.amenities && space.amenities.length > 0) {
                <div class="detail-item">
                  <span class="label">Amenidades:</span>
                  <div class="amenities-list">
                    @for (amenity of space.amenities; track amenity) {
                      <mat-chip class="amenity-chip">{{ amenity }}</mat-chip>
                    }
                  </div>
                </div>
              }
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

    .detail-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 24px;
    }

    mat-card-title {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .detail-item {
      display: flex;
      align-items: flex-start;
      gap: 12px;
      padding: 12px 0;
      border-bottom: 1px solid rgba(0, 0, 0, 0.12);

      &:last-child {
        border-bottom: none;
      }

      mat-icon {
        color: var(--mat-sys-primary);
        margin-top: 2px;
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
    }

    .amenities-list {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      margin-top: 8px;
    }

    .amenity-chip {
      font-size: 0.875rem;
    }
  `]
})
export class SpaceDetailComponent implements OnInit, OnDestroy {
  space: ICommonSpace | null = null;
  building: IBuilding | null = null;
  loading = true;
  error: string | null = null;
  private destroy$ = new Subject<void>();

  constructor(
    private commonSpaceService: CommonSpaceService,
    private buildingService: BuildingService,
    private route: ActivatedRoute,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadSpace(id);
    } else {
      this.router.navigate(['/espacios-comunes']);
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadSpace(id: string): void {
    this.loading = true;
    this.error = null;
    this.space = null;
    this.building = null;
    this.cdr.detectChanges();

    this.commonSpaceService.getCommonSpaceById(id).pipe(takeUntil(this.destroy$)).subscribe({
      next: (space) => {
        this.space = space;
        this.loadBuilding(space.buildingId);
      },
      error: (err) => {
        console.error('Error loading space:', err);
        this.error = 'Error al cargar el espacio común. Por favor, verifica que el servidor mock esté ejecutándose.';
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  loadBuilding(buildingId: string): void {
    this.buildingService.getBuildingById(buildingId).pipe(takeUntil(this.destroy$)).subscribe({
      next: (building) => {
        this.building = building;
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error loading building:', err);
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
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
}

