import { Routes } from '@angular/router';
import { MainLayoutComponent } from './layout/main-layout/main-layout.component';
import { DashboardComponent } from './layout/dashboard/dashboard.component';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: 'auth',
    loadChildren: () => import('./features/auth/auth-routing.module').then(m => m.AuthRoutingModule)
  },
  {
    path: '',
    component: MainLayoutComponent,
    canActivate: [authGuard],
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
      },
      {
        path: 'edificios',
        loadChildren: () => import('./features/edificios/edificios.routes').then(m => m.EDIFICIOS_ROUTES)
      },
      {
        path: 'unidades',
        loadChildren: () => import('./features/unidades/unidades.routes').then(m => m.UNIDADES_ROUTES)
      },
      {
        path: 'espacios-comunes',
        loadChildren: () => import('./features/espacios-comunes/espacios-comunes.routes').then(m => m.ESPACIOS_COMUNES_ROUTES)
      }
    ]
  },
  {
    path: '**',
    redirectTo: 'auth/login'
  }
];
