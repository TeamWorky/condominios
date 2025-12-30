import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-payment-form',
  standalone: true,
  imports: [CommonModule, RouterLink, MatCardModule, MatButtonModule],
  template: `
    <div class="page-container">
      <div class="page-header">
        <h1 class="mat-headline-4">Registrar Pago</h1>
        <p class="mat-body-1">Registra un nuevo pago de gastos comunes</p>
      </div>

      <mat-card>
        <mat-card-content>
          <p class="mat-body-1">Formulario de pago - En construcción</p>
          <div class="button-group">
            <button mat-button routerLink="/pagos">Cancelar</button>
            <button mat-raised-button color="primary">Guardar</button>
          </div>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .page-container {
      max-width: 800px;
      margin: 0 auto;
    }

    .page-header {
      margin-bottom: 24px;

      h1 {
        margin: 0 0 8px 0;
      }

      p {
        margin: 0;
        color: var(--mat-sys-on-surface-variant);
      }
    }

    .button-group {
      display: flex;
      gap: 12px;
      margin-top: 24px;
    }
  `]
})
export class PaymentFormComponent {}
