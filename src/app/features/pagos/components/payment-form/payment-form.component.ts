import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-payment-form',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="space-y-6">
      <div>
        <h1 class="text-3xl font-bold text-gray-900">Registrar Pago</h1>
        <p class="text-gray-600 mt-1">Registra un nuevo pago de gastos comunes</p>
      </div>

      <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <p class="text-gray-600">Formulario de pago - En construcción</p>
        <div class="mt-4 flex space-x-3">
          <a
            routerLink="/pagos"
            class="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancelar
          </a>
        </div>
      </div>
    </div>
  `
})
export class PaymentFormComponent {}
