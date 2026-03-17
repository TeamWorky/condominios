import { Routes } from '@angular/router';

export const RESIDENTES_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./components/resident-list/resident-list.component').then(m => m.ResidentListComponent)
  },
  {
    path: 'nuevo',
    loadComponent: () => import('./components/resident-form/resident-form.component').then(m => m.ResidentFormComponent)
  },
  {
    path: 'editar/:id',
    loadComponent: () => import('./components/resident-form/resident-form.component').then(m => m.ResidentFormComponent)
  },
  {
    path: ':id',
    loadComponent: () => import('./components/resident-detail/resident-detail.component').then(m => m.ResidentDetailComponent)
  }
];
