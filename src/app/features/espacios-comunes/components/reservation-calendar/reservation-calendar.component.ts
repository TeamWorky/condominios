import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { CommonSpaceService } from '../../../../core/services/common-space.service';
import { ReservationService } from '../../../../core/services/reservation.service';
import { ICommonSpace } from '../../../../core/models/common-space.model';
import { IReservation, ReservationStatus, ReservationType } from '../../../../core/models/reservation.model';
import { ReservationDialogComponent, ReservationDialogData } from '../reservation-dialog/reservation-dialog.component';
import { Subject, takeUntil } from 'rxjs';

interface TimeSlot {
  time: string;
  hour: number;
  minute: number;
}

interface DayReservations {
  date: Date;
  dateStr: string;
  dayName: string;
  dayNumber: number;
  reservations: IReservation[];
}

interface ReservationBlock {
  reservation: IReservation;
  startMinutes: number;
  endMinutes: number;
  duration: number;
  top: number;
  height: number;
}

@Component({
  selector: 'app-reservation-calendar',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatSelectModule,
    MatFormFieldModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
    MatDialogModule,
    MatSnackBarModule
  ],
  template: `
    <div class="page-container">
      <div class="page-header">
        <div>
          <h1 class="mat-headline-4">Calendario de Reservas</h1>
          <p class="mat-body-1">Vista semanal de reservas por espacio común</p>
        </div>
        <div class="header-actions">
          <button mat-button routerLink="/espacios-comunes">
            <mat-icon>arrow_back</mat-icon>
            Volver
          </button>
        </div>
      </div>

      <mat-card class="controls-card">
        <mat-card-content>
          <div class="controls">
            <mat-form-field appearance="outline">
              <mat-label>Espacio Común</mat-label>
              <mat-select [(value)]="selectedSpaceId" (selectionChange)="onSpaceChange()">
                @for (space of reservableSpaces; track space.id) {
                  <mat-option [value]="space.id">{{ space.name }}</mat-option>
                }
              </mat-select>
            </mat-form-field>

            <div class="week-navigation">
              <button mat-icon-button (click)="previousWeek()">
                <mat-icon>chevron_left</mat-icon>
              </button>
              <span class="week-range">{{ getWeekRange() }}</span>
              <button mat-icon-button (click)="nextWeek()">
                <mat-icon>chevron_right</mat-icon>
              </button>
              <button mat-button (click)="goToToday()">
                <mat-icon>today</mat-icon>
                Hoy
              </button>
            </div>
          </div>
        </mat-card-content>
      </mat-card>

      @if (loading) {
        <div class="loading-container">
          <mat-spinner></mat-spinner>
        </div>
      } @else if (error) {
        <mat-card>
          <mat-card-content>
            <div class="error-container">
              <mat-icon color="warn">error</mat-icon>
              <p>{{ error }}</p>
            </div>
          </mat-card-content>
        </mat-card>
      } @else if (!selectedSpaceId) {
        <mat-card>
          <mat-card-content>
            <div class="empty-state">
              <mat-icon>event_busy</mat-icon>
              <p>Selecciona un espacio común para ver sus reservas</p>
            </div>
          </mat-card-content>
        </mat-card>
      } @else {
        <div class="calendar-container">
          <div class="time-column">
            <div class="time-header"></div>
            @for (slot of timeSlots; track slot.time) {
              <div class="time-slot">{{ slot.time }}</div>
            }
          </div>

          <div class="days-container">
            @for (day of weekDays; track day.dateStr) {
              <div class="day-column">
                <div class="day-header">
                  <div class="day-name">{{ day.dayName }}</div>
                  <div class="day-number">{{ day.dayNumber }}</div>
                </div>
                <div class="day-content">
                  @for (slot of timeSlots; track slot.time) {
                    <div class="time-cell" 
                         [class.reserved]="isTimeSlotReserved(day, slot)"
                         [class.outside-hours]="isOutsideReservationHours(slot)"
                         [class.selectable]="!isTimeSlotReserved(day, slot) && !isOutsideReservationHours(slot)"
                         [class.selected]="isSlotSelected(day, slot)"
                         (click)="onTimeSlotClick(day, slot)"
                         (mouseenter)="onTimeSlotHover(day, slot)"
                         (mouseleave)="onTimeSlotLeave()">
                      @for (block of getReservationBlocksForSlot(day, slot); track block.reservation.id) {
                        <div class="reservation-block" 
                             [class]="'reservation-type-' + getReservationTypeClass(block.reservation)"
                             [style.top.%]="block.top"
                             [style.height.%]="block.height"
                             [style.background-color]="getReservationColor(block.reservation)"
                             [matTooltip]="getReservationTooltip(block.reservation)"
                             matTooltipPosition="above">
                          <div class="reservation-info">
                            <strong>{{ block.reservation.residentName }}</strong>
                            <span>{{ block.reservation.startTime }} - {{ block.reservation.endTime }}</span>
                          </div>
                        </div>
                      }
                    </div>
                  }
                </div>
              </div>
            }
          </div>
        </div>

        <div class="legend">
          <div class="legend-item">
            <div class="legend-color available"></div>
            <span>Disponible</span>
          </div>
          <div class="legend-item">
            <div class="legend-color selected"></div>
            <span>Seleccionado</span>
          </div>
          <div class="legend-item">
            <div class="legend-color reserved"></div>
            <span>Reservado</span>
          </div>
          @for (type of reservationTypes; track type.value) {
            <div class="legend-item">
              <div class="legend-color" [style.background-color]="getTypeColor(type.value)"></div>
              <span>{{ type.label }}</span>
            </div>
          }
        </div>
      }
    </div>
  `,
  styles: [`
    .page-container {
      max-width: 1600px;
      margin: 0 auto;
      padding: 24px;
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

    .controls-card {
      margin-bottom: 24px;
    }

    .controls {
      display: flex;
      gap: 24px;
      align-items: center;
      flex-wrap: wrap;
    }

    mat-form-field {
      min-width: 250px;
    }

    .week-navigation {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .week-range {
      font-weight: 500;
      min-width: 200px;
      text-align: center;
    }

    .loading-container, .error-container, .empty-state {
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      padding: 48px;
      gap: 16px;

      mat-icon {
        font-size: 48px;
        width: 48px;
        height: 48px;
        color: var(--mat-sys-on-surface-variant);
      }
    }

    .calendar-container {
      display: flex;
      border: 1px solid rgba(0, 0, 0, 0.12);
      border-radius: 4px;
      overflow: hidden;
      background: white;
    }

    .time-column {
      width: 80px;
      border-right: 1px solid rgba(0, 0, 0, 0.12);
      background: var(--mat-sys-surface-container);
    }

    .time-header {
      height: 60px;
      border-bottom: 1px solid rgba(0, 0, 0, 0.12);
    }

    .time-slot {
      height: 60px;
      padding: 8px;
      font-size: 0.75rem;
      color: var(--mat-sys-on-surface-variant);
      border-bottom: 1px solid rgba(0, 0, 0, 0.08);
      display: flex;
      align-items: center;
    }

    .days-container {
      display: flex;
      flex: 1;
    }

    .day-column {
      flex: 1;
      border-right: 1px solid rgba(0, 0, 0, 0.12);

      &:last-child {
        border-right: none;
      }
    }

    .day-header {
      height: 60px;
      border-bottom: 1px solid rgba(0, 0, 0, 0.12);
      padding: 8px;
      text-align: center;
      background: var(--mat-sys-surface-container);
    }

    .day-name {
      font-size: 0.875rem;
      font-weight: 500;
      color: var(--mat-sys-on-surface-variant);
    }

    .day-number {
      font-size: 1.25rem;
      font-weight: 600;
      color: var(--mat-sys-on-surface);
    }

    .day-content {
      position: relative;
    }

    .time-cell {
      height: 60px;
      border-bottom: 1px solid rgba(0, 0, 0, 0.08);
      position: relative;
      background: white;
      transition: background-color 0.2s;

      &:hover {
        background: var(--mat-sys-surface-container-highest);
      }

      &.reserved {
        background: #ffebee;
        border-left: 3px solid #c62828;
      }

      &.outside-hours {
        background: #f5f5f5;
        opacity: 0.6;
        cursor: not-allowed;

        &:hover {
          background: #eeeeee;
        }
      }

      &.selectable {
        cursor: pointer;

        &:hover {
          background: #e3f2fd;
        }
      }

      &.selected {
        background: #bbdefb;
        border-left: 3px solid #2196f3;
      }
    }

    .reservation-block {
      position: absolute;
      left: 0;
      right: 0;
      background: #c62828;
      color: white;
      border-radius: 4px;
      padding: 4px 8px;
      font-size: 0.75rem;
      z-index: 1;
      cursor: pointer;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);

      &:hover {
        background: #b71c1c;
        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
      }
    }

    .reservation-info {
      display: flex;
      flex-direction: column;
      gap: 2px;

      strong {
        font-weight: 600;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      span {
        font-size: 0.7rem;
        opacity: 0.9;
      }
    }

    .legend {
      display: flex;
      gap: 24px;
      justify-content: center;
      margin-top: 24px;
      padding: 16px;
      background: var(--mat-sys-surface-container);
      border-radius: 4px;
    }

    .legend-item {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .legend-color {
      width: 20px;
      height: 20px;
      border-radius: 4px;
      border: 1px solid rgba(0, 0, 0, 0.12);

      &.available {
        background: white;
      }

      &.reserved {
        background: #ffebee;
        border-left: 3px solid #c62828;
      }

      &.selected {
        background: #bbdefb;
        border-left: 3px solid #2196f3;
      }
    }
  `]
})
export class ReservationCalendarComponent implements OnInit, OnDestroy {
  reservableSpaces: ICommonSpace[] = [];
  selectedSpaceId: string | null = null;
  selectedSpace: ICommonSpace | null = null;
  reservations: IReservation[] = [];
  weekDays: DayReservations[] = [];
  timeSlots: TimeSlot[] = [];
  currentWeekStart: Date = new Date();
  loading = true;
  error: string | null = null;
  selectedStart: { day: DayReservations; slot: TimeSlot } | null = null;
  selectedEnd: { day: DayReservations; slot: TimeSlot } | null = null;
  hoveredSlot: { day: DayReservations; slot: TimeSlot } | null = null;
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
    private commonSpaceService: CommonSpaceService,
    private reservationService: ReservationService,
    private cdr: ChangeDetectorRef,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {
    this.initializeWeek();
    this.generateTimeSlots();
  }

  ngOnInit(): void {
    this.loadReservableSpaces();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  initializeWeek(): void {
    const today = new Date();
    const dayOfWeek = today.getDay();
    const diff = today.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1); // Lunes
    this.currentWeekStart = new Date(today);
    this.currentWeekStart.setDate(diff);
    this.currentWeekStart.setHours(0, 0, 0, 0);
  }

  generateTimeSlots(): void {
    this.timeSlots = [];
    for (let hour = 0; hour < 24; hour++) {
      this.timeSlots.push({
        time: `${hour.toString().padStart(2, '0')}:00`,
        hour,
        minute: 0
      });
    }
  }

  loadReservableSpaces(): void {
    this.loading = true;
    this.error = null;
    this.cdr.detectChanges();

    this.commonSpaceService.getReservableSpaces().pipe(takeUntil(this.destroy$)).subscribe({
      next: (spaces) => {
        this.reservableSpaces = spaces;
        if (spaces.length > 0 && !this.selectedSpaceId) {
          this.selectedSpaceId = spaces[0].id;
          this.onSpaceChange();
        }
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error loading spaces:', err);
        this.error = 'Error al cargar los espacios comunes.';
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  onSpaceChange(): void {
    if (!this.selectedSpaceId) {
      this.reservations = [];
      this.updateWeekDays();
      return;
    }

    this.selectedSpace = this.reservableSpaces.find(s => s.id === this.selectedSpaceId) || null;
    this.loadReservations();
  }

  loadReservations(): void {
    if (!this.selectedSpaceId) return;

    this.reservationService.getReservationsBySpace(this.selectedSpaceId).pipe(takeUntil(this.destroy$)).subscribe({
      next: (reservations) => {
        // Filtrar solo reservas confirmadas
        this.reservations = reservations.filter(r => r.status === ReservationStatus.CONFIRMED);
        this.updateWeekDays();
      },
      error: (err) => {
        console.error('Error loading reservations:', err);
        this.error = 'Error al cargar las reservas.';
      }
    });
  }

  updateWeekDays(): void {
    this.weekDays = [];
    const dayNames = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
    
    for (let i = 0; i < 7; i++) {
      const date = new Date(this.currentWeekStart);
      date.setDate(this.currentWeekStart.getDate() + i);
      
      const dateStr = this.formatDate(date);
      const dayReservations = this.reservations.filter(r => {
        const reservationDate = new Date(r.date);
        const reservationDateStr = this.formatDate(reservationDate);
        return reservationDateStr === dateStr;
      });

      this.weekDays.push({
        date,
        dateStr,
        dayName: dayNames[date.getDay()],
        dayNumber: date.getDate(),
        reservations: dayReservations
      });
    }
    this.cdr.detectChanges();
  }

  formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  isTimeSlotReserved(day: DayReservations, slot: TimeSlot): boolean {
    return day.reservations.some(reservation => {
      const startMinutes = this.timeToMinutes(reservation.startTime);
      const endMinutes = this.timeToMinutes(reservation.endTime);
      const slotMinutes = this.timeToMinutes(slot.time);
      return slotMinutes >= startMinutes && slotMinutes < endMinutes;
    });
  }

  isOutsideReservationHours(slot: TimeSlot): boolean {
    if (!this.selectedSpace || !this.selectedSpace.isReservable) {
      return false;
    }

    if (!this.selectedSpace.reservationStartTime || !this.selectedSpace.reservationEndTime) {
      return false;
    }

    const slotMinutes = this.timeToMinutes(slot.time);
    const startMinutes = this.timeToMinutes(this.selectedSpace.reservationStartTime);
    const endMinutes = this.timeToMinutes(this.selectedSpace.reservationEndTime);

    return slotMinutes < startMinutes || slotMinutes >= endMinutes;
  }

  getReservationBlocksForSlot(day: DayReservations, slot: TimeSlot): ReservationBlock[] {
    const blocks: ReservationBlock[] = [];
    const slotMinutes = this.timeToMinutes(slot.time);
    const slotEndMinutes = slotMinutes + 60;

    day.reservations.forEach(reservation => {
      const startMinutes = this.timeToMinutes(reservation.startTime);
      const endMinutes = this.timeToMinutes(reservation.endTime);

      // Verificar si la reserva se superpone con este slot
      if (startMinutes < slotEndMinutes && endMinutes > slotMinutes) {
        // Calcular la posición y altura dentro del slot
        const blockStart = Math.max(startMinutes, slotMinutes);
        const blockEnd = Math.min(endMinutes, slotEndMinutes);
        
        const top = ((blockStart - slotMinutes) / 60) * 100;
        const height = ((blockEnd - blockStart) / 60) * 100;

        blocks.push({
          reservation,
          startMinutes: blockStart,
          endMinutes: blockEnd,
          duration: blockEnd - blockStart,
          top,
          height
        });
      }
    });

    return blocks;
  }

  getReservationTooltip(reservation: IReservation): string {
    return `${reservation.residentName} (Depto ${reservation.unitNumber})\n${reservation.startTime} - ${reservation.endTime}\n${reservation.purpose || 'Sin propósito especificado'}`;
  }

  timeToMinutes(timeStr: string): number {
    const [hour, minute] = timeStr.split(':').map(Number);
    return hour * 60 + minute;
  }

  previousWeek(): void {
    const newDate = new Date(this.currentWeekStart);
    newDate.setDate(newDate.getDate() - 7);
    this.currentWeekStart = newDate;
    this.updateWeekDays();
  }

  nextWeek(): void {
    const newDate = new Date(this.currentWeekStart);
    newDate.setDate(newDate.getDate() + 7);
    this.currentWeekStart = newDate;
    this.updateWeekDays();
  }

  goToToday(): void {
    this.initializeWeek();
    this.updateWeekDays();
  }

  getWeekRange(): string {
    const start = this.weekDays[0]?.date;
    const end = this.weekDays[6]?.date;
    if (!start || !end) return '';

    const startStr = `${start.getDate()}/${start.getMonth() + 1}`;
    const endStr = `${end.getDate()}/${end.getMonth() + 1}/${end.getFullYear()}`;
    return `${startStr} - ${endStr}`;
  }

  onTimeSlotClick(day: DayReservations, slot: TimeSlot): void {
    if (this.isTimeSlotReserved(day, slot) || this.isOutsideReservationHours(slot)) {
      return;
    }

    if (!this.selectedStart) {
      // Primera selección
      this.selectedStart = { day, slot };
      this.selectedEnd = null;
    } else if (this.selectedStart.day.dateStr === day.dateStr) {
      // Mismo día - seleccionar rango
      const startMinutes = this.timeToMinutes(this.selectedStart.slot.time);
      const slotMinutes = this.timeToMinutes(slot.time);

      if (slotMinutes < startMinutes) {
        // Selección antes del inicio - resetear
        this.selectedStart = { day, slot };
        this.selectedEnd = null;
      } else {
        // Selección después del inicio - establecer fin
        this.selectedEnd = { day, slot };
        this.openReservationDialog();
      }
    } else {
      // Día diferente - resetear y empezar nuevo
      this.selectedStart = { day, slot };
      this.selectedEnd = null;
    }
    this.cdr.detectChanges();
  }

  onTimeSlotHover(day: DayReservations, slot: TimeSlot): void {
    if (this.selectedStart && !this.isTimeSlotReserved(day, slot) && !this.isOutsideReservationHours(slot)) {
      this.hoveredSlot = { day, slot };
      this.cdr.detectChanges();
    }
  }

  onTimeSlotLeave(): void {
    this.hoveredSlot = null;
    this.cdr.detectChanges();
  }

  isSlotSelected(day: DayReservations, slot: TimeSlot): boolean {
    if (!this.selectedStart || this.selectedStart.day.dateStr !== day.dateStr) {
      return false;
    }

    const startMinutes = this.timeToMinutes(this.selectedStart.slot.time);
    const slotMinutes = this.timeToMinutes(slot.time);
    const endMinutes = this.selectedEnd ? this.timeToMinutes(this.selectedEnd.slot.time) : slotMinutes;

    return slotMinutes >= startMinutes && slotMinutes <= endMinutes;
  }

  openReservationDialog(): void {
    if (!this.selectedStart || !this.selectedEnd || !this.selectedSpace) {
      return;
    }

    const startTime = this.selectedStart.slot.time;
    const endTime = this.getNextTimeSlot(this.selectedEnd.slot.time);
    const selectedDate = this.selectedStart.day.date;

    const dialogData: ReservationDialogData = {
      space: this.selectedSpace,
      residentId: '1', // TODO: Obtener del servicio de autenticación
      residentName: 'Usuario Actual', // TODO: Obtener del servicio de autenticación
      unitNumber: '101', // TODO: Obtener del servicio de autenticación
      prefillDate: selectedDate,
      prefillStartTime: startTime,
      prefillEndTime: endTime
    };

    const dialogRef = this.dialog.open(ReservationDialogComponent, {
      width: '600px',
      data: dialogData
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.selectedStart = null;
        this.selectedEnd = null;
        this.loadReservations();
        this.snackBar.open('Reserva creada exitosamente', 'Cerrar', {
          duration: 3000,
          horizontalPosition: 'end',
          verticalPosition: 'top',
          panelClass: ['success-snackbar']
        });
      }
    });
  }

  getNextTimeSlot(time: string): string {
    const [hour, minute] = time.split(':').map(Number);
    const totalMinutes = hour * 60 + minute + 30;
    const newHour = Math.floor(totalMinutes / 60);
    const newMinute = totalMinutes % 60;
    return `${String(newHour).padStart(2, '0')}:${String(newMinute).padStart(2, '0')}`;
  }

  getReservationColor(reservation: IReservation): string {
    const type = reservation.type || this.inferReservationType(reservation.purpose);
    return this.getTypeColor(type);
  }

  getReservationTypeClass(reservation: IReservation): string {
    const type = reservation.type || this.inferReservationType(reservation.purpose);
    return type.toLowerCase();
  }

  inferReservationType(purpose?: string): ReservationType {
    if (!purpose) return ReservationType.OTRO;
    
    const purposeLower = purpose.toLowerCase();
    if (purposeLower.includes('cumpleaños') || purposeLower.includes('cumple')) {
      return ReservationType.CUMPLEANOS;
    }
    if (purposeLower.includes('familiar') || purposeLower.includes('familia')) {
      return ReservationType.REUNION_FAMILIAR;
    }
    if (purposeLower.includes('corporativo') || purposeLower.includes('empresa') || purposeLower.includes('trabajo')) {
      return ReservationType.EVENTO_CORPORATIVO;
    }
    if (purposeLower.includes('celebración') || purposeLower.includes('celebrar') || purposeLower.includes('aniversario')) {
      return ReservationType.CELEBRACION;
    }
    if (purposeLower.includes('deporte') || purposeLower.includes('ejercicio') || purposeLower.includes('gimnasio')) {
      return ReservationType.DEPORTE;
    }
    if (purposeLower.includes('reunión') || purposeLower.includes('reunion')) {
      return ReservationType.TRABAJO;
    }
    return ReservationType.OTRO;
  }

  getTypeColor(type: ReservationType): string {
    const colors: { [key in ReservationType]: string } = {
      [ReservationType.CUMPLEANOS]: '#e91e63', // Rosa
      [ReservationType.REUNION_FAMILIAR]: '#4caf50', // Verde
      [ReservationType.EVENTO_CORPORATIVO]: '#2196f3', // Azul
      [ReservationType.CELEBRACION]: '#ff9800', // Naranja
      [ReservationType.DEPORTE]: '#9c27b0', // Morado
      [ReservationType.TRABAJO]: '#00bcd4', // Cyan
      [ReservationType.OTRO]: '#c62828' // Rojo (default)
    };
    return colors[type] || colors[ReservationType.OTRO];
  }
}

