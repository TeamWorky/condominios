import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDividerModule } from '@angular/material/divider';
import { MatTooltipModule } from '@angular/material/tooltip';

import { ResidentService } from '../../services/resident.service';
import { IResident, ResidentType } from '../../../../core/models/resident.model';
import { RutFormatPipe } from '../../../../core/pipes/rut-format.pipe';

const RESIDENT_TYPE_LABELS: Record<string, string> = {
  [ResidentType.OWNER]: 'Propietario',
  [ResidentType.TENANT]: 'Arrendatario',
  [ResidentType.FAMILY_MEMBER]: 'Familiar',
  [ResidentType.GUEST]: 'Invitado',
};

@Component({
  selector: 'app-resident-detail',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatDividerModule,
    MatTooltipModule,
    RutFormatPipe,
  ],
  templateUrl: './resident-detail.component.html',
  styleUrls: ['./resident-detail.component.scss'],
})
export class ResidentDetailComponent implements OnInit, OnDestroy {
  resident: IResident | null = null;
  loading = true;
  error: string | null = null;

  private destroy$ = new Subject<void>();

  constructor(
    private residentService: ResidentService,
    private route: ActivatedRoute,
    private router: Router,
    private cdr: ChangeDetectorRef,
    private snackBar: MatSnackBar,
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadResident(id);
    } else {
      this.router.navigate(['/residentes']);
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadResident(id: string): void {
    this.loading = true;
    this.residentService
      .getResidentById(id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (resident) => {
          this.resident = resident;
          this.loading = false;
          this.cdr.detectChanges();
        },
        error: () => {
          this.error = 'Error al cargar el residente';
          this.loading = false;
          this.snackBar.open('Residente no encontrado', 'Cerrar', {
            duration: 3000,
            horizontalPosition: 'end',
            verticalPosition: 'top',
            panelClass: ['error-snackbar'],
          });
          this.cdr.detectChanges();
        },
      });
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
}
