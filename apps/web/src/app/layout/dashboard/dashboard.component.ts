import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatListModule } from '@angular/material/list';
import { MatDividerModule } from '@angular/material/divider';

interface DashboardCard {
  title: string;
  value: number | string;
  icon: string;
  color: string;
  change?: string;
  changeType?: 'increase' | 'decrease';
}

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
    MatDividerModule
  ],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent {
  cards: DashboardCard[] = [
    {
      title: 'Total Residentes',
      value: 124,
      icon: 'people',
      color: 'primary',
      change: '+5',
      changeType: 'increase'
    },
    {
      title: 'Pagos Pendientes',
      value: 12,
      icon: 'pending',
      color: 'warn',
      change: '-3',
      changeType: 'decrease'
    },
    {
      title: 'Pagos del Mes',
      value: '$2,450,000',
      icon: 'payments',
      color: 'accent',
      change: '+12%',
      changeType: 'increase'
    },
    {
      title: 'Unidades Ocupadas',
      value: '98%',
      icon: 'apartment',
      color: 'primary',
      change: '+2%',
      changeType: 'increase'
    }
  ];

  recentPayments = [
    { unit: '101', resident: 'Juan Pérez', amount: 150000, date: new Date(), status: 'paid' },
    { unit: '205', resident: 'María González', amount: 150000, date: new Date(), status: 'paid' },
    { unit: '312', resident: 'Carlos Silva', amount: 150000, date: new Date(), status: 'pending' },
  ];
}
