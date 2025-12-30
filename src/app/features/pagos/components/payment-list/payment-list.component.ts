import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { PaymentService } from '../../services/payment.service';
import { IPayment } from '../../../../core/models/payment.model';

@Component({
  selector: 'app-payment-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatTableModule,
    MatChipsModule,
    MatProgressSpinnerModule
  ],
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
          @if (loading) {
            <div class="loading-container">
              <mat-spinner></mat-spinner>
            </div>
          } @else if (error) {
            <div class="error-container">
              <mat-icon color="warn">error</mat-icon>
              <p>{{ error }}</p>
            </div>
          } @else {
            <table mat-table [dataSource]="dataSource" class="payments-table">

              <ng-container matColumnDef="unitNumber">
                <th mat-header-cell *matHeaderCellDef>Unidad</th>
                <td mat-cell *matCellDef="let payment">{{ payment.unitNumber }}</td>
              </ng-container>

              <ng-container matColumnDef="residentName">
                <th mat-header-cell *matHeaderCellDef>Residente</th>
                <td mat-cell *matCellDef="let payment">{{ payment.residentName }}</td>
              </ng-container>

              <ng-container matColumnDef="period">
                <th mat-header-cell *matHeaderCellDef>Período</th>
                <td mat-cell *matCellDef="let payment">{{ payment.period }}</td>
              </ng-container>

              <ng-container matColumnDef="amount">
                <th mat-header-cell *matHeaderCellDef>Monto</th>
                <td mat-cell *matCellDef="let payment">
                  {{ payment.amount | currency:'CLP':'symbol-narrow':'1.0-0' }}
                </td>
              </ng-container>

              <ng-container matColumnDef="dueDate">
                <th mat-header-cell *matHeaderCellDef>Vencimiento</th>
                <td mat-cell *matCellDef="let payment">
                  {{ payment.dueDate | date:'dd/MM/yyyy' }}
                </td>
              </ng-container>

              <ng-container matColumnDef="status">
                <th mat-header-cell *matHeaderCellDef>Estado</th>
                <td mat-cell *matCellDef="let payment">
                  <mat-chip [class]="'chip-' + payment.status.toLowerCase()">
                    {{ getStatusLabel(payment.status) }}
                  </mat-chip>
                </td>
              </ng-container>

              <ng-container matColumnDef="paidDate">
                <th mat-header-cell *matHeaderCellDef>Fecha Pago</th>
                <td mat-cell *matCellDef="let payment">
                  {{ payment.paidDate ? (payment.paidDate | date:'dd/MM/yyyy') : '-' }}
                </td>
              </ng-container>

              <ng-container matColumnDef="actions">
                <th mat-header-cell *matHeaderCellDef>Acciones</th>
                <td mat-cell *matCellDef="let payment">
                  <button mat-icon-button [routerLink]="['/pagos', payment.id]">
                    <mat-icon>visibility</mat-icon>
                  </button>
                  <button mat-icon-button [routerLink]="['/pagos', payment.id, 'editar']">
                    <mat-icon>edit</mat-icon>
                  </button>
                  <button mat-icon-button color="warn" (click)="onDelete(payment.id)">
                    <mat-icon>delete</mat-icon>
                  </button>
                </td>
              </ng-container>

              <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
              <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
            </table>
          }
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .page-container {
      max-width: 1400px;
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

    .payments-table {
      width: 100%;
    }

    .loading-container, .error-container {
      display: flex;
      justify-content: center;
      align-items: center;
      padding: 48px;
      gap: 16px;
    }

    .chip-pending {
      background-color: #fff3e0;
      color: #e65100;
    }

    .chip-paid {
      background-color: #e8f5e9;
      color: #2e7d32;
    }

    .chip-overdue {
      background-color: #ffebee;
      color: #c62828;
    }

    .chip-partial {
      background-color: #e3f2fd;
      color: #1976d2;
    }

    .chip-cancelled {
      background-color: #f5f5f5;
      color: #616161;
    }
  `]
})
export class PaymentListComponent implements OnInit {
  dataSource = new MatTableDataSource<IPayment>([]);
  displayedColumns: string[] = ['unitNumber', 'residentName', 'period', 'amount', 'dueDate', 'status', 'paidDate', 'actions'];
  loading = false;
  error: string | null = null;

  constructor(private paymentService: PaymentService) {}

  ngOnInit(): void {
    this.loadPayments();
  }

  loadPayments(): void {
    this.loading = true;
    this.error = null;

    this.paymentService.getPayments().subscribe({
      next: (payments) => {
        this.dataSource.data = payments;
        this.loading = false;
        console.log('Payments loaded:', payments);
      },
      error: (err) => {
        this.error = 'Error al cargar los pagos. Por favor, verifica que el servidor mock esté ejecutándose.';
        this.loading = false;
        console.error('Error loading payments:', err);
      }
    });
  }

  getStatusLabel(status: string): string {
    const labels: { [key: string]: string } = {
      'PENDING': 'Pendiente',
      'PAID': 'Pagado',
      'OVERDUE': 'Vencido',
      'PARTIAL': 'Parcial',
      'CANCELLED': 'Cancelado'
    };
    return labels[status] || status;
  }

  onDelete(id: string): void {
    if (confirm('¿Está seguro de eliminar este pago?')) {
      this.paymentService.deletePayment(id).subscribe({
        next: () => {
          this.loadPayments();
        },
        error: (err) => {
          console.error('Error deleting payment:', err);
          alert('Error al eliminar el pago');
        }
      });
    }
  }
}
