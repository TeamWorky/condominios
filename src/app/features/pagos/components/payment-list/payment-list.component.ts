import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-payment-list',
  standalone: true,
  imports: [CommonModule, RouterLink, MatCardModule, MatButtonModule, MatIconModule],
  template: `
    <div class="page-container">
      <div class="page-header">
        <div>
          <h1 class="mat-headline-4">Pagos y Gastos Comunes</h1>
          <p class="mat-body-1">Gestión de pagos y estados de cuenta</p>
        </div>
        <button mat-raised-button color="primary" routerLink="/pagos/nuevo">
          <mat-icon>add</mat-icon>
          Registrar Pago
        </button>
      </div>

      <mat-card>
        <mat-card-content>
          <p class="mat-body-1">Lista de pagos - En construcción</p>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .page-container {
      max-width: 1200px;
      margin: 0 auto;
    }

    .page-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 24px;

      h1 {
        margin: 0 0 8px 0;
      }

      p {
        margin: 0;
        color: var(--mat-sys-on-surface-variant);
      }
    }
  `]
})
export class PaymentListComponent {}
