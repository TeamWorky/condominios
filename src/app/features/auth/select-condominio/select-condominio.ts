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
    console.log('🔍 [SelectCondominio] Component initialized - reading ONLY from auth state (NO localStorage)');

    // Suscribirse al estado de autenticación - NO usar localStorage
    this.authService.getAuthState()
      .pipe(takeUntil(this.destroy$))
      .subscribe(state => {
        console.log('🔍 [SelectCondominio] Auth state received:', {
          isAuthenticated: state.isAuthenticated,
          condominiosCount: state.condominios?.length || 0,
          condominios: state.condominios,
          condominiosNames: state.condominios?.map(c => c.name)
        });

        if (!state.isAuthenticated) {
          // Si no está autenticado, redirigir al login
          this.router.navigate(['/auth/login']);
          return;
        }

        // Usar SOLO los datos del estado (NO localStorage)
        if (state.condominios && Array.isArray(state.condominios) && state.condominios.length > 0) {
          // Filtrar solo condominios válidos
          this.condominios = state.condominios.filter(c => c && c.id && c.name);
          console.log('🔍 [SelectCondominio] Setting condominios from auth state:', {
            count: this.condominios.length,
            names: this.condominios.map(c => c.name),
            fullData: this.condominios
          });
          
          // Si solo hay un condominio, seleccionarlo automáticamente
          if (this.condominios.length === 1 && !state.selectedCondominio) {
            this.selectCondominio(this.condominios[0]);
          }
        } else {
          // Si no hay condominios, redirigir al login
          console.warn('🔍 [SelectCondominio] No condominios found in auth state, redirecting to login');
          console.warn('🔍 [SelectCondominio] State condominios:', state.condominios);
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
      error: (error) => {
        this.loading = false;
        this.errorMessage = 'Error al seleccionar condominio';
        console.error('Error selecting condominio:', error);
      }
    });
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  // Método de debug temporal
  debugInfo(): void {
    console.log('=== DEBUG INFO (NO localStorage mode) ===');
    console.log('1. Component condominios:', this.condominios);
    console.log('2. Component condominios count:', this.condominios.length);
    console.log('3. Component condominios names:', this.condominios.map(c => c.name));
    console.log('4. Component condominios IDs:', this.condominios.map(c => c.id));
    
    this.authService.getAuthState().subscribe(state => {
      console.log('5. Auth state condominios:', state.condominios);
      console.log('6. Auth state condominios count:', state.condominios?.length);
      console.log('7. Auth state condominios names:', state.condominios?.map(c => c.name));
      console.log('8. Auth state isAuthenticated:', state.isAuthenticated);
    });
    
    // Verificar localStorage (aunque no lo usemos)
    const stored = localStorage.getItem('condominios_data');
    console.log('9. localStorage condominios_data (NOT USED):', stored ? 'Present but ignored' : 'Not present');
    
    console.log('=== END DEBUG ===');
  }
}
