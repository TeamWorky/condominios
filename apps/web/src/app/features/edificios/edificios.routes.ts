import { Routes } from '@angular/router';

export const EDIFICIOS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./components/building-list/building-list.component').then(m => m.BuildingListComponent)
  },
  {
    path: 'nuevo',
    loadComponent: () => import('./components/building-form/building-form.component').then(m => m.BuildingFormComponent)
  },
  {
    path: 'editar/:id',
    loadComponent: () => import('./components/building-form/building-form.component').then(m => m.BuildingFormComponent)
  },
  {
    path: ':id',
    loadComponent: () => import('./components/building-detail/building-detail.component').then(m => m.BuildingDetailComponent)
  }
];
