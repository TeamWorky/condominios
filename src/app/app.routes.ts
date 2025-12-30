import { Routes } from '@angular/router';
import { MainLayoutComponent } from './layout/main-layout/main-layout.component';
import { DashboardComponent } from './layout/dashboard/dashboard.component';

export const routes: Routes = [
  {
    path: '',
    component: MainLayoutComponent,
    children: [
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full'
      },
      {
        path: 'dashboard',
        component: DashboardComponent
      },
      {
        path: 'residentes',
        loadChildren: () => import('./features/residentes/residentes.routes').then(m => m.RESIDENTES_ROUTES)
      },
      {
        path: 'pagos',
        loadChildren: () => import('./features/pagos/pagos.routes').then(m => m.PAGOS_ROUTES)
      }
    ]
  },
  {
    path: '**',
    redirectTo: 'dashboard'
  }
];
