import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-resident-detail',
  standalone: true,
  imports: [CommonModule, RouterLink, MatCardModule, MatButtonModule],
  template: `
    <div class="page-container">
      <div class="page-header">
        <h1 class="mat-headline-4">Detalle del Residente</h1>
        <p class="mat-body-1">Información completa del residente</p>
      </div>

      <mat-card>
        <mat-card-content>
          <p class="mat-body-1">Detalle del residente - En construcción</p>
          <div class="button-group">
            <button mat-button routerLink="/residentes">Volver</button>
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
      margin-top: 24px;
    }
  `]
})
export class ResidentDetailComponent {}
