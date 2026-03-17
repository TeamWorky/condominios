import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './login/login';
import { SelectCondominioComponent } from './select-condominio/select-condominio';

const routes: Routes = [
  {
    path: 'login',
    component: LoginComponent
  },
  {
    path: 'select-condominio',
    component: SelectCondominioComponent
  },
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full'
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AuthRoutingModule { }
