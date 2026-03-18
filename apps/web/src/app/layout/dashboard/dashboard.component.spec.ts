import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { of, throwError } from 'rxjs';
import { DashboardComponent } from './dashboard.component';
import { DashboardService } from '../../core/services/dashboard.service';
import { AuthService } from '../../core/services/auth.service';
import { DashboardStats } from '../../core/models/dashboard.models';

describe('DashboardComponent', () => {
  let component: DashboardComponent;
  let fixture: ComponentFixture<DashboardComponent>;
  let dashboardService: { loadStats: ReturnType<typeof vi.fn> };
  let authService: { getSelectedCondominio: ReturnType<typeof vi.fn> };

  const mockStats: DashboardStats = {
    totalBuildings: 3,
    totalUnits: 20,
    occupiedUnits: 15,
    occupancyRate: 75,
    totalResidents: 42,
    residentsAvailable: true
  };

  beforeEach(async () => {
    dashboardService = {
      loadStats: vi.fn().mockReturnValue(of(mockStats))
    };
    authService = {
      getSelectedCondominio: vi.fn().mockReturnValue({ id: 'condo-123', name: 'Test Condo' })
    };

    await TestBed.configureTestingModule({
      imports: [DashboardComponent, NoopAnimationsModule],
      providers: [
        provideRouter([]),
        { provide: DashboardService, useValue: dashboardService },
        { provide: AuthService, useValue: authService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(DashboardComponent);
    component = fixture.componentInstance;
  });

  it('deberia crearse el componente', () => {
    expect(component).toBeTruthy();
  });

  describe('estado de carga', () => {
    it('deberia iniciar en estado loading', () => {
      expect(component.loading()).toBe(true);
    });

    it('deberia mostrar loading=false despues de cargar datos', () => {
      fixture.detectChanges();
      expect(component.loading()).toBe(false);
    });
  });

  describe('estado con datos', () => {
    beforeEach(() => {
      fixture.detectChanges();
    });

    it('deberia cargar stats del servicio', () => {
      expect(component.stats()).toEqual(mockStats);
    });

    it('deberia generar cards con valores reales', () => {
      const cards = component.cards();
      expect(cards.length).toBeGreaterThan(0);

      const buildingsCard = cards.find(c => c.title === 'Total Edificios');
      expect(buildingsCard?.value).toBe(3);

      const residentsCard = cards.find(c => c.title === 'Total Residentes');
      expect(residentsCard?.value).toBe(42);
    });

    it('deberia mostrar occupancyRate como porcentaje', () => {
      const cards = component.cards();
      const occupancyCard = cards.find(c => c.title === 'Unidades Ocupadas');
      expect(occupancyCard?.value).toBe('75%');
    });
  });

  describe('estado vacio', () => {
    it('deberia mostrar ceros cuando stats son cero', () => {
      const emptyStats: DashboardStats = {
        totalBuildings: 0, totalUnits: 0, occupiedUnits: 0,
        occupancyRate: 0, totalResidents: 0, residentsAvailable: true
      };
      dashboardService.loadStats.mockReturnValue(of(emptyStats));
      fixture.detectChanges();

      const cards = component.cards();
      const buildingsCard = cards.find(c => c.title === 'Total Edificios');
      expect(buildingsCard?.value).toBe(0);
    });
  });

  describe('estado de error', () => {
    it('deberia setear error cuando el servicio falla', () => {
      dashboardService.loadStats.mockReturnValue(
        throwError(() => new Error('Server error'))
      );
      fixture.detectChanges();

      expect(component.error()).toBeTruthy();
      expect(component.loading()).toBe(false);
    });
  });

  describe('sin condominio seleccionado', () => {
    it('deberia mostrar error cuando no hay condominio', () => {
      authService.getSelectedCondominio.mockReturnValue(null);
      fixture.detectChanges();

      expect(component.error()).toBeTruthy();
    });
  });

  describe('residentsAvailable=false', () => {
    it('deberia mostrar N/A para residentes cuando no estan disponibles', () => {
      const statsNoResidents: DashboardStats = {
        ...mockStats,
        totalResidents: 0,
        residentsAvailable: false
      };
      dashboardService.loadStats.mockReturnValue(of(statsNoResidents));
      fixture.detectChanges();

      const cards = component.cards();
      const residentsCard = cards.find(c => c.title === 'Total Residentes');
      expect(residentsCard?.value).toBe('N/A');
    });
  });

  describe('reload', () => {
    it('deberia recargar datos al llamar loadData', () => {
      fixture.detectChanges();
      dashboardService.loadStats.mockClear();
      dashboardService.loadStats.mockReturnValue(of(mockStats));

      component.loadData();
      expect(dashboardService.loadStats).toHaveBeenCalled();
    });
  });
});
