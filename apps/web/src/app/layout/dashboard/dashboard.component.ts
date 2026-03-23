import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatListModule } from '@angular/material/list';
import { MatDividerModule } from '@angular/material/divider';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { DashboardService } from '../../core/services/dashboard.service';
import { AuthService } from '../../core/services/auth.service';
import { DashboardStats, DashboardCard } from '../../core/models/dashboard.models';

@Component({
  selector: 'app-dashboard',
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
    MatProgressBarModule,
    MatTooltipModule
  ],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  loading = signal(true);
  error = signal<string | null>(null);
  stats = signal<DashboardStats | null>(null);

  cards = computed<DashboardCard[]>(() => {
    const s = this.stats();
    const isLoading = this.loading();

    if (isLoading) {
      return [
        { title: 'Total Residentes', value: '...', icon: 'people', color: 'primary', loading: true },
        { title: 'Total Edificios', value: '...', icon: 'apartment', color: 'primary', loading: true },
        { title: 'Unidades Ocupadas', value: '...', icon: 'door_front', color: 'accent', loading: true },
        { title: 'Pagos Pendientes', value: 'Proximamente', icon: 'pending', color: 'warn', comingSoon: true },
        { title: 'Pagos del Mes', value: 'Proximamente', icon: 'payments', color: 'accent', comingSoon: true }
      ];
    }

    if (!s) {
      return [];
    }

    return [
      {
        title: 'Total Residentes',
        value: s.residentsAvailable ? s.totalResidents : 'N/A',
        icon: 'people',
        color: 'primary',
        routerLink: '/residentes'
      },
      {
        title: 'Total Edificios',
        value: s.totalBuildings,
        icon: 'apartment',
        color: 'primary',
        routerLink: '/edificios'
      },
      {
        title: 'Unidades Ocupadas',
        value: `${s.occupancyRate}%`,
        icon: 'door_front',
        color: 'accent',
        routerLink: '/unidades'
      },
      {
        title: 'Pagos Pendientes',
        value: 'Proximamente',
        icon: 'pending',
        color: 'warn',
        comingSoon: true
      },
      {
        title: 'Pagos del Mes',
        value: 'Proximamente',
        icon: 'payments',
        color: 'accent',
        comingSoon: true
      }
    ];
  });

  constructor(
    private dashboardService: DashboardService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    const condominio = this.authService.getSelectedCondominio();

    if (!condominio) {
      this.loading.set(false);
      this.error.set('No hay condominio seleccionado. Por favor seleccione un condominio.');
      return;
    }

    this.loading.set(true);
    this.error.set(null);

    this.dashboardService.loadStats(condominio.id).subscribe({
      next: (stats) => {
        this.stats.set(stats);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set('Error al cargar los datos del dashboard. Por favor intente nuevamente.');
        this.loading.set(false);
      }
    });
  }
}
