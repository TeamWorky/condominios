import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './login.html',
  styleUrls: ['./login.scss']
})
export class LoginComponent implements OnInit {
  loginForm!: FormGroup;
  loading = false;
  errorMessage = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  onSubmit(): void {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.loading = true;
    this.errorMessage = '';

    this.authService.login(this.loginForm.value).subscribe({
      next: (response) => {
        console.log('Login successful. User role:', response.user.role);
        console.log('Condominios count:', response.condominios.length);
        console.log('Response data:', response);

        // Si es SUPER_ADMIN, redirigir directamente al dashboard
        if (response.user.role === 'SUPER_ADMIN') {
          this.loading = false;
          console.log('SUPER_ADMIN detected, navigating to dashboard');
          this.router.navigate(['/dashboard']);
          return;
        }

        // Si tiene múltiples condominios, ir a selección
        if (response.condominios.length > 1) {
          this.loading = false;
          console.log('Multiple condominios, navigating to selection');
          this.router.navigate(['/auth/select-condominio']);
        }
        // Si solo tiene uno, seleccionarlo automáticamente
        else if (response.condominios.length === 1) {
          console.log('One condominio found, auto-selecting:', response.condominios[0]);
          this.authService.selectCondominio(response.condominios[0].id).subscribe({
            next: () => {
              this.loading = false;
              console.log('Condominio selected successfully, navigating to dashboard');
              this.router.navigate(['/dashboard']);
            },
            error: (error) => {
              this.loading = false;
              this.errorMessage = 'Error al seleccionar condominio';
              console.error('Error selecting condominio:', error);
            }
          });
        } else {
          this.loading = false;
          this.errorMessage = 'No tienes acceso a ningún condominio';
          console.error('No condominios assigned to user');
        }
      },
      error: (error) => {
        this.loading = false;
        this.errorMessage = error.error?.message || 'Credenciales inválidas';
        console.error('Login error:', error);
      }
    });
  }

  get email() {
    return this.loginForm.get('email');
  }

  get password() {
    return this.loginForm.get('password');
  }
}
