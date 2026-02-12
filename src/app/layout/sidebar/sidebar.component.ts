import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatBadgeModule } from '@angular/material/badge';
import { MatDividerModule } from '@angular/material/divider';

interface MenuItem {
  label: string;
  icon: string;
  route: string;
  badge?: number;
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    RouterLinkActive,
    MatListModule,
    MatIconModule,
    MatBadgeModule,
    MatDividerModule
  ],
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss']
})
export class SidebarComponent {
  @Input() isOpen = true;
  @Output() toggle = new EventEmitter<void>();

  menuItems: MenuItem[] = [
    { label: 'Dashboard', icon: 'dashboard', route: '/dashboard' },
    { label: 'Residentes', icon: 'people', route: '/residentes' },
    { label: 'Pagos', icon: 'payments', route: '/pagos', badge: 3 },
    { label: 'Unidades', icon: 'apartment', route: '/unidades' },
    { label: 'Espacios Comunes', icon: 'meeting_room', route: '/espacios-comunes' },
  ];

  onToggle(): void {
    this.toggle.emit();
  }
}
