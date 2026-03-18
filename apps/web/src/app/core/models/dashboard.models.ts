export interface DashboardStats {
  totalResidents: number;
  totalBuildings: number;
  totalUnits: number;
  occupiedUnits: number;
  occupancyRate: number;
  residentsAvailable: boolean;
}

export interface DashboardCard {
  title: string;
  value: number | string;
  icon: string;
  color: string;
  loading?: boolean;
  error?: boolean;
  comingSoon?: boolean;
  routerLink?: string;
}
