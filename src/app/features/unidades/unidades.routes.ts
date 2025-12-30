import { Routes } from '@angular/router';

export const UNIDADES_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./components/unit-grid/unit-grid.component').then(m => m.UnitGridComponent)
  },
  {
    path: 'lista',
    loadComponent: () => import('./components/unit-list/unit-list.component').then(m => m.UnitListComponent)
  },
  {
    path: 'nuevo',
    loadComponent: () => import('./components/unit-form/unit-form.component').then(m => m.UnitFormComponent)
  },
  {
    path: 'editar/:id',
    loadComponent: () => import('./components/unit-form/unit-form.component').then(m => m.UnitFormComponent)
  },
  {
    path: ':id',
    loadComponent: () => import('./components/unit-detail/unit-detail.component').then(m => m.UnitDetailComponent)
  }
];

