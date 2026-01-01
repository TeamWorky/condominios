import { Component, OnInit, Inject, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatSelectModule } from '@angular/material/select';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { ReservationService } from '../../../../core/services/reservation.service';
import { ICommonSpace } from '../../../../core/models/common-space.model';
import { ICreateReservationDto, ReservationType } from '../../../../core/models/reservation.model';
import { Subject, takeUntil } from 'rxjs';

export interface ReservationDialogData {
  space: ICommonSpace;
  residentId: string;
  residentName: string;
  unitNumber: string;
  prefillDate?: Date;
  prefillStartTime?: string;
  prefillEndTime?: string;
}

@Component({
  selector: 'app-reservation-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatSelectModule,
    MatProgressSpinnerModule,
    MatSnackBarModule
  ],
  template: `
    <h2 mat-dialog-title>
      <mat-icon>event</mat-icon>
      Reservar: {{ data.space.name }}
    </h2>

    <mat-dialog-content>
      <form [formGroup]="reservationForm">
        <div class="form-grid">
          <mat-form-field appearance="outline">
            <mat-label>Fecha</mat-label>
            <input matInput [matDatepicker]="picker" formControlName="date" [min]="minDate">
            <mat-datepicker-toggle matIconSuffix [for]="picker"></mat-datepicker-toggle>
            <mat-datepicker #picker></mat-datepicker>
            <mat-icon matPrefix>calendar_today</mat-icon>
            @if (reservationForm.get('date')?.hasError('required') && reservationForm.get('date')?.touched) {
              <mat-error>La fecha es requerida</mat-error>
            }
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Hora de Inicio</mat-label>
            <mat-select formControlName="startTime">
              @for (time of availableStartTimes; track time) {
                <mat-option [value]="time">{{ time }}</mat-option>
              }
            </mat-select>
            <mat-icon matPrefix>schedule</mat-icon>
            @if (reservationForm.get('startTime')?.hasError('required') && reservationForm.get('startTime')?.touched) {
              <mat-error>La hora de inicio es requerida</mat-error>
            }
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Hora de Término</mat-label>
            <mat-select formControlName="endTime">
              @for (time of availableEndTimes; track time) {
                <mat-option [value]="time">{{ time }}</mat-option>
              }
            </mat-select>
            <mat-icon matPrefix>schedule</mat-icon>
            @if (reservationForm.get('endTime')?.hasError('required') && reservationForm.get('endTime')?.touched) {
              <mat-error>La hora de término es requerida</mat-error>
            }
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Tipo de Reserva</mat-label>
            <mat-select formControlName="type">
              @for (type of reservationTypes; track type.value) {
                <mat-option [value]="type.value">{{ type.label }}</mat-option>
              }
            </mat-select>
            <mat-icon matPrefix>category</mat-icon>
            @if (reservationForm.get('type')?.hasError('required') && reservationForm.get('type')?.touched) {
              <mat-error>El tipo de reserva es requerido</mat-error>
            }
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Número de Invitados (Opcional)</mat-label>
            <input matInput type="number" formControlName="numberOfGuests" [min]="1" [max]="data.space.capacity || null">
            <mat-icon matPrefix>people</mat-icon>
            @if (data.space.capacity) {
              <mat-hint>Capacidad máxima: {{ data.space.capacity }} personas</mat-hint>
            }
          </mat-form-field>

          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Propósito de la Reserva (Opcional)</mat-label>
            <textarea matInput formControlName="purpose" rows="3" placeholder="Ej: Cumpleaños, Reunión familiar, etc."></textarea>
            <mat-icon matPrefix>description</mat-icon>
          </mat-form-field>

          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Notas Adicionales (Opcional)</mat-label>
            <textarea matInput formControlName="notes" rows="2"></textarea>
            <mat-icon matPrefix>note</mat-icon>
          </mat-form-field>
        </div>

        @if (data.space.isExclusive) {
          <div class="info-box exclusive">
            <mat-icon>info</mat-icon>
            <span>Este espacio es de uso <strong>exclusivo</strong>. Solo se permite una reserva a la vez.</span>
          </div>
        } @else {
          <div class="info-box shared">
            <mat-icon>group</mat-icon>
            <span>Este espacio es de uso <strong>compartido</strong>. Múltiples reservas pueden coexistir.</span>
          </div>
        }
      </form>
    </mat-dialog-content>

    <mat-dialog-actions align="end">
      <button mat-button (click)="onCancel()" [disabled]="loading">Cancelar</button>
      <button mat-raised-button color="primary" (click)="onReserve()" [disabled]="reservationForm.invalid || loading">
        @if (loading) {
          <ng-container>
            <mat-spinner diameter="20"></mat-spinner>
          </ng-container>
        } @else {
          <ng-container>
            <mat-icon>check</mat-icon>
            Reservar
          </ng-container>
        }
      </button>
    </mat-dialog-actions>
  `,
  styles: [`
    h2[mat-dialog-title] {
      display: flex;
      align-items: center;
      gap: 8px;
      margin: 0;
    }

    mat-dialog-content {
      min-width: 500px;
      max-width: 600px;
      padding: 24px;
    }

    .form-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 16px;
      margin-bottom: 16px;
    }

    .full-width {
      grid-column: 1 / -1;
    }

    mat-form-field {
      width: 100%;
    }

    .info-box {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 12px;
      border-radius: 4px;
      margin-top: 16px;
      font-size: 0.875rem;

      mat-icon {
        flex-shrink: 0;
      }

      &.exclusive {
        background-color: #fff3e0;
        color: #e65100;
        border-left: 4px solid #e65100;
      }

      &.shared {
        background-color: #e3f2fd;
        color: #1976d2;
        border-left: 4px solid #1976d2;
      }
    }

    mat-dialog-actions {
      padding: 16px 24px;
      margin: 0;
    }

    mat-spinner {
      display: inline-block;
      margin-right: 8px;
    }
  `]
})
export class ReservationDialogComponent implements OnInit, OnDestroy {
  reservationForm: FormGroup;
  loading = false;
  minDate = new Date();
  availableStartTimes: string[] = [];
  availableEndTimes: string[] = [];
  reservationTypes = [
    { value: ReservationType.CUMPLEANOS, label: 'Cumpleaños' },
    { value: ReservationType.REUNION_FAMILIAR, label: 'Reunión Familiar' },
    { value: ReservationType.EVENTO_CORPORATIVO, label: 'Evento Corporativo' },
    { value: ReservationType.CELEBRACION, label: 'Celebración' },
    { value: ReservationType.DEPORTE, label: 'Deporte' },
    { value: ReservationType.TRABAJO, label: 'Trabajo' },
    { value: ReservationType.OTRO, label: 'Otro' }
  ];
  private destroy$ = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<ReservationDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: ReservationDialogData,
    private reservationService: ReservationService,
    private snackBar: MatSnackBar
  ) {
    this.reservationForm = this.fb.group({
      date: [data.prefillDate || new Date(), [Validators.required]],
      startTime: [data.prefillStartTime || '', [Validators.required]],
      endTime: [data.prefillEndTime || '', [Validators.required]],
      type: [ReservationType.OTRO, [Validators.required]],
      numberOfGuests: [null],
      purpose: [''],
      notes: ['']
    });
  }

  ngOnInit(): void {
    this.generateTimeSlots();
    
    // Validar que endTime sea mayor que startTime
    this.reservationForm.get('startTime')?.valueChanges.subscribe(() => {
      this.updateEndTimes();
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  generateTimeSlots(): void {
    const space = this.data.space;
    if (!space.isReservable || !space.reservationStartTime || !space.reservationEndTime) {
      return;
    }

    const start = this.parseTime(space.reservationStartTime);
    const end = this.parseTime(space.reservationEndTime);
    const slots: string[] = [];

    for (let hour = start.hour; hour <= end.hour; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        if (hour === start.hour && minute < start.minute) continue;
        if (hour === end.hour && minute > end.minute) break;
        
        const timeStr = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        slots.push(timeStr);
      }
    }

    this.availableStartTimes = slots.slice(0, -1); // Excluir la última hora como inicio
    this.updateEndTimes();
  }

  updateEndTimes(): void {
    const startTime = this.reservationForm.get('startTime')?.value;
    if (!startTime) {
      this.availableEndTimes = [];
      return;
    }

    const space = this.data.space;
    if (!space.reservationEndTime) {
      return;
    }

    const start = this.parseTime(startTime);
    const end = this.parseTime(space.reservationEndTime);
    const slots: string[] = [];

    for (let hour = start.hour; hour <= end.hour; hour++) {
      for (let minute = (hour === start.hour ? start.minute + 30 : 0); minute < 60; minute += 30) {
        if (hour === end.hour && minute > end.minute) break;
        
        const timeStr = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        slots.push(timeStr);
      }
    }

    this.availableEndTimes = slots;
    
    // Si el endTime actual es menor o igual al startTime, resetearlo
    const currentEndTime = this.reservationForm.get('endTime')?.value;
    if (currentEndTime) {
      const currentEndMinutes = this.timeToMinutes(currentEndTime);
      const startMinutes = this.timeToMinutes(startTime);
      if (currentEndMinutes <= startMinutes) {
        this.reservationForm.patchValue({ endTime: slots[0] || '' });
      }
    }
  }

  private timeToMinutes(timeStr: string): number {
    const [hour, minute] = timeStr.split(':').map(Number);
    return hour * 60 + minute;
  }

  private parseTime(timeStr: string): { hour: number; minute: number } {
    const [hour, minute] = timeStr.split(':').map(Number);
    return { hour, minute };
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  onReserve(): void {
    if (this.reservationForm.valid) {
      this.loading = true;
      const formValue = this.reservationForm.value;
      
      const reservationData: ICreateReservationDto = {
        commonSpaceId: this.data.space.id,
        residentId: this.data.residentId,
        date: formValue.date,
        startTime: formValue.startTime,
        endTime: formValue.endTime,
        type: formValue.type || ReservationType.OTRO,
        numberOfGuests: formValue.numberOfGuests || undefined,
        purpose: formValue.purpose || undefined,
        notes: formValue.notes || undefined
      };

      // Verificar disponibilidad antes de crear la reserva
      this.reservationService.checkAvailability(
        this.data.space.id,
        formValue.date,
        formValue.startTime,
        formValue.endTime,
        this.data.space.isExclusive
      ).pipe(takeUntil(this.destroy$)).subscribe({
        next: (isAvailable) => {
          if (!isAvailable) {
            this.loading = false;
            const message = this.data.space.isExclusive
              ? 'El espacio ya está reservado en este horario. Los espacios exclusivos solo permiten una reserva a la vez.'
              : 'El espacio ya tiene una reserva confirmada en este horario que genera conflicto.';
            this.snackBar.open(message, 'Cerrar', {
              duration: 6000,
              horizontalPosition: 'end',
              verticalPosition: 'top',
              panelClass: ['error-snackbar']
            });
            return;
          }

          // Si está disponible, crear la reserva
          this.reservationService.createReservation(reservationData).pipe(takeUntil(this.destroy$)).subscribe({
            next: () => {
              this.snackBar.open('Reserva creada exitosamente', 'Cerrar', {
                duration: 3000,
                horizontalPosition: 'end',
                verticalPosition: 'top',
                panelClass: ['success-snackbar']
              });
              this.dialogRef.close(true);
            },
            error: (err) => {
              console.error('Error creating reservation:', err);
              this.loading = false;
              this.snackBar.open('Error al crear la reserva. Por favor, intenta nuevamente.', 'Cerrar', {
                duration: 5000,
                horizontalPosition: 'end',
                verticalPosition: 'top',
                panelClass: ['error-snackbar']
              });
            }
          });
        },
        error: (err) => {
          console.error('Error checking availability:', err);
          this.loading = false;
          this.snackBar.open('Error al verificar disponibilidad. Por favor, intenta nuevamente.', 'Cerrar', {
            duration: 5000,
            horizontalPosition: 'end',
            verticalPosition: 'top',
            panelClass: ['error-snackbar']
          });
        }
      });
    }
  }
}

