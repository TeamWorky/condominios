import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDividerModule } from '@angular/material/divider';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatDividerModule
  ],
  templateUrl: './login.html',
  styleUrls: ['./login.scss']
})
export class LoginComponent implements OnInit {
  loginForm!: FormGroup;
  loading = false;
  errorMessage = '';
  hidePassword = true;

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

        // Todos los usuarios (incluyendo SUPER_ADMIN) siguen el mismo flujo basado en cantidad de condominios
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
        } 
        // Si no tiene condominios, mostrar error
        else {
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

  fillCredentials(email: string, password: string): void {
    this.loginForm.patchValue({ email, password });
    // Opcional: mostrar un mensaje de confirmación
    console.log(`Credenciales cargadas: ${email}`);
  }
}
