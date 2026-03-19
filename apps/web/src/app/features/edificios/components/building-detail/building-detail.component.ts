import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatListModule } from '@angular/material/list';
import { MatDividerModule } from '@angular/material/divider';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';

import { BuildingService } from '../../../../core/services/building.service';
import { IBuilding } from '../../../../core/models/building.model';

@Component({
  selector: 'app-building-detail',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatListModule,
    MatDividerModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatTooltipModule
  ],
  templateUrl: './building-detail.component.html',
  styleUrls: ['./building-detail.component.scss']
})
export class BuildingDetailComponent implements OnInit, OnDestroy {
  building: IBuilding | null = null;
  loading = true;
  error: string | null = null;

  private destroy$ = new Subject<void>();

  constructor(
    private buildingService: BuildingService,
    private route: ActivatedRoute,
    private router: Router,
    private cdr: ChangeDetectorRef,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadBuilding(id);
    } else {
      this.router.navigate(['/edificios']);
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadBuilding(id: string): void {
    this.loading = true;
    this.buildingService.getBuildingById(id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (building) => {
          this.building = building;
          this.loading = false;
          this.cdr.detectChanges();
        },
        error: (err: HttpErrorResponse) => {
          this.loading = false;
          if (err.status === 404) {
            this.snackBar.open('Edificio no encontrado', 'Cerrar', {
              duration: 3000,
              horizontalPosition: 'end',
              verticalPosition: 'top',
              panelClass: ['error-snackbar']
            });
            this.router.navigate(['/edificios']);
          } else {
            this.error = 'Error al cargar el edificio';
          }
          this.cdr.detectChanges();
        }
      });
  }

  getStatusClass(isActive: boolean): string {
    return isActive ? 'chip-active' : 'chip-inactive';
  }

  getStatusLabel(isActive: boolean): string {
    return isActive ? 'Activo' : 'Inactivo';
  }
}
