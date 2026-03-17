import { Routes } from '@angular/router';

export const PAGOS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./components/payment-list/payment-list.component').then(m => m.PaymentListComponent)
  },
  {
    path: 'nuevo',
    loadComponent: () => import('./components/payment-form/payment-form.component').then(m => m.PaymentFormComponent)
  },
  {
    path: ':id',
    loadComponent: () => import('./components/payment-detail/payment-detail.component').then(m => m.PaymentDetailComponent)
  }
];
