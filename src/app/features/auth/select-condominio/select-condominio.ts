import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { Condominio } from '../../../core/models/auth.model';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-select-condominio',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './select-condominio.html',
  styleUrls: ['./select-condominio.scss']
})
export class SelectCondominioComponent implements OnInit {
  condominios: Condominio[] = [];
  loading = false;
  errorMessage = '';

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.authService.getAuthState().subscribe(state => {
      if (state.condominios && state.condominios.length > 0) {
        this.condominios = state.condominios;
      } else {
        // Si no hay condominios, redirigir al login
        this.router.navigate(['/login']);
      }
    });
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
}
