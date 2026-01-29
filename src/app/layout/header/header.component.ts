import { Component, EventEmitter, Output, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatBadgeModule } from '@angular/material/badge';
import { MatMenuModule } from '@angular/material/menu';
import { MatDividerModule } from '@angular/material/divider';
import { AuthService } from '../../core/services/auth.service';
import { User, Condominio, AuthState } from '../../core/models/auth.model';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [
    CommonModule,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatBadgeModule,
    MatMenuModule,
    MatDividerModule
  ],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit, OnDestroy {
  @Output() toggleSidebar = new EventEmitter<void>();

  userName = 'Usuario';
  currentUser: User | null = null;
  selectedCondominio: Condominio | null = null;
  condominios: Condominio[] = [];
  hasMultipleCondominios = false;
  private destroy$ = new Subject<void>();

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Obtener estado de autenticación
    this.authService.getAuthState()
      .pipe(takeUntil(this.destroy$))
      .subscribe((state: AuthState) => {
        if (state.user) {
          this.currentUser = state.user;
          this.userName = `${state.user.firstName} ${state.user.lastName}`;
        }
        
        this.selectedCondominio = state.selectedCondominio;
        this.condominios = state.condominios || [];
        this.hasMultipleCondominios = this.condominios.length > 1;
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onToggleSidebar(): void {
    this.toggleSidebar.emit();
  }

  onChangeCondominio(): void {
    // Redirigir a la pantalla de selección de condominio
    this.router.navigate(['/auth/select-condominio']);
  }

  onLogout(): void {
    this.authService.logout();
    this.router.navigate(['/auth/login']);
  }
}
