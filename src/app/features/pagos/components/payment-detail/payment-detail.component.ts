import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-payment-detail',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="space-y-6">
      <div>
        <h1 class="text-3xl font-bold text-gray-900">Detalle del Pago</h1>
        <p class="text-gray-600 mt-1">Información completa del pago</p>
      </div>

      <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <p class="text-gray-600">Detalle del pago - En construcción</p>
        <div class="mt-4">
          <a
            routerLink="/pagos"
            class="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors inline-block"
          >
            Volver
          </a>
        </div>
      </div>
    </div>
  `
})
export class PaymentDetailComponent {}
