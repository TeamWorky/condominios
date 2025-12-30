import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

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
  imports: [CommonModule, RouterLink],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent {
  cards: DashboardCard[] = [
    {
      title: 'Total Residentes',
      value: 124,
      icon: 'people',
      color: 'blue',
      change: '+5',
      changeType: 'increase'
    },
    {
      title: 'Pagos Pendientes',
      value: 12,
      icon: 'pending',
      color: 'yellow',
      change: '-3',
      changeType: 'decrease'
    },
    {
      title: 'Pagos del Mes',
      value: '$2,450,000',
      icon: 'payments',
      color: 'green',
      change: '+12%',
      changeType: 'increase'
    },
    {
      title: 'Unidades Ocupadas',
      value: '98%',
      icon: 'apartment',
      color: 'purple',
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
