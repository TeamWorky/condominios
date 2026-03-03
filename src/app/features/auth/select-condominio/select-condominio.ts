import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { Condominio } from '../../../core/models/auth.model';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDividerModule } from '@angular/material/divider';
import { MatChipsModule } from '@angular/material/chips';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-select-condominio',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatDividerModule,
    MatChipsModule
  ],
  templateUrl: './select-condominio.html',
  styleUrls: ['./select-condominio.scss']
})
export class SelectCondominioComponent implements OnInit, OnDestroy {
  condominios: Condominio[] = [];
  loading = false;
  errorMessage = '';
  private destroy$ = new Subject<void>();

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.authService.getAuthState()
      .pipe(takeUntil(this.destroy$))
      .subscribe(state => {
        if (!state.isAuthenticated) {
          this.router.navigate(['/auth/login']);
          return;
        }

        if (state.condominios && Array.isArray(state.condominios) && state.condominios.length > 0) {
          this.condominios = state.condominios.filter(c => c && c.id && c.name);

          if (this.condominios.length === 1 && !state.selectedCondominio) {
            this.selectCondominio(this.condominios[0]);
          }
        } else {
          this.errorMessage = 'No se encontraron condominios asignados';
          this.router.navigate(['/auth/login']);
        }
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  selectCondominio(condominio: Condominio): void {
    this.loading = true;
    this.errorMessage = '';

    this.authService.selectCondominio(condominio.id).subscribe({
      next: () => {
        this.loading = false;
        this.router.navigate(['/dashboard']);
      },
      error: () => {
        this.loading = false;
        this.errorMessage = 'Error al seleccionar condominio';
      }
    });
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
