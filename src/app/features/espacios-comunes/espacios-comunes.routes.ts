import { Routes } from '@angular/router';

export const ESPACIOS_COMUNES_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./components/space-list/space-list.component').then(m => m.SpaceListComponent)
  },
  {
    path: 'calendario',
    loadComponent: () => import('./components/reservation-calendar/reservation-calendar.component').then(m => m.ReservationCalendarComponent)
  },
  {
    path: ':id',
    loadComponent: () => import('./components/space-detail/space-detail.component').then(m => m.SpaceDetailComponent)
  }
];

