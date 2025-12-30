# Arquitectura del Sistema

Este documento describe la arquitectura técnica del Sistema de Gestión de Condominios.

## Visión General

El sistema está construido con Angular 18 utilizando una arquitectura modular basada en standalone components, siguiendo los principios de:

- **Separación de responsabilidades**
- **Reutilización de código**
- **Escalabilidad**
- **Mantenibilidad**
- **Testing**

## Stack Tecnológico

### Frontend
- **Framework**: Angular 18
- **UI Library**: Tailwind CSS 3
- **Lenguaje**: TypeScript 5.5+
- **Estilos**: SCSS + Tailwind CSS
- **Testing**: Vitest
- **Build Tool**: Angular CLI 21

### Herramientas de Desarrollo
- **Linting**: ESLint
- **Formatting**: Prettier (opcional)
- **Git**: Control de versiones
- **VS Code**: IDE recomendado

## Estructura de Carpetas

```
gestion-condominios/
├── src/
│   ├── app/
│   │   ├── core/                    # Módulo core (singleton services)
│   │   │   ├── services/           # Servicios de negocio
│   │   │   │   ├── api.service.ts
│   │   │   │   ├── auth.service.ts
│   │   │   │   └── storage.service.ts
│   │   │   ├── guards/             # Route guards
│   │   │   │   ├── auth.guard.ts
│   │   │   │   └── role.guard.ts
│   │   │   ├── interceptors/       # HTTP interceptors
│   │   │   │   ├── auth.interceptor.ts
│   │   │   │   └── error.interceptor.ts
│   │   │   ├── models/             # Interfaces y tipos
│   │   │   │   ├── user.model.ts
│   │   │   │   └── api-response.model.ts
│   │   │   └── constants/          # Constantes globales
│   │   │       └── app.constants.ts
│   │   │
│   │   ├── shared/                  # Módulo compartido
│   │   │   ├── components/         # Componentes reutilizables
│   │   │   │   ├── confirm-dialog/
│   │   │   │   ├── data-table/
│   │   │   │   └── loading-spinner/
│   │   │   ├── directives/         # Directivas compartidas
│   │   │   │   └── highlight.directive.ts
│   │   │   ├── pipes/              # Pipes personalizados
│   │   │   │   ├── currency-clp.pipe.ts
│   │   │   │   └── rut.pipe.ts
│   │   │   └── utils/              # Funciones utilitarias
│   │   │       ├── validators.ts
│   │   │       └── formatters.ts
│   │   │
│   │   ├── features/                # Módulos de características
│   │   │   ├── residentes/
│   │   │   │   ├── components/
│   │   │   │   │   ├── resident-list/
│   │   │   │   │   ├── resident-detail/
│   │   │   │   │   └── resident-form/
│   │   │   │   ├── services/
│   │   │   │   │   └── resident.service.ts
│   │   │   │   ├── models/
│   │   │   │   │   └── resident.model.ts
│   │   │   │   └── residentes.routes.ts
│   │   │   │
│   │   │   └── pagos/
│   │   │       ├── components/
│   │   │       │   ├── payment-list/
│   │   │       │   ├── payment-detail/
│   │   │       │   └── payment-form/
│   │   │       ├── services/
│   │   │       │   └── payment.service.ts
│   │   │       ├── models/
│   │   │       │   └── payment.model.ts
│   │   │       └── pagos.routes.ts
│   │   │
│   │   ├── layout/                  # Componentes de layout
│   │   │   ├── header/
│   │   │   │   ├── header.component.ts
│   │   │   │   ├── header.component.html
│   │   │   │   └── header.component.scss
│   │   │   ├── sidebar/
│   │   │   │   ├── sidebar.component.ts
│   │   │   │   ├── sidebar.component.html
│   │   │   │   └── sidebar.component.scss
│   │   │   └── main-layout/
│   │   │       ├── main-layout.component.ts
│   │   │       ├── main-layout.component.html
│   │   │       └── main-layout.component.scss
│   │   │
│   │   ├── app.ts                   # Root component
│   │   ├── app.html
│   │   ├── app.scss
│   │   ├── app.config.ts            # Configuración de la app
│   │   └── app.routes.ts            # Rutas principales
│   │
│   ├── assets/                      # Recursos estáticos
│   │   ├── images/
│   │   ├── icons/
│   │   └── i18n/
│   │
│   ├── environments/                # Configuraciones de entorno
│   │   ├── environment.ts
│   │   └── environment.prod.ts
│   │
│   ├── styles/                      # Estilos globales
│   │   ├── _variables.scss
│   │   ├── _mixins.scss
│   │   ├── _theme.scss
│   │   └── styles.scss
│   │
│   ├── index.html
│   └── main.ts
│
├── public/                          # Archivos públicos
│   └── favicon.ico
│
├── docs/                            # Documentación adicional
├── .vscode/                         # Configuración VS Code
├── angular.json
├── package.json
├── tsconfig.json
└── README.md
```

## Capas de la Aplicación

### 1. Core Layer

**Propósito**: Servicios singleton y funcionalidad central de la aplicación.

**Características**:
- Se carga una sola vez al iniciar la aplicación
- Contiene servicios globales (autenticación, API, storage)
- Guards para protección de rutas
- Interceptors HTTP
- Modelos de datos compartidos

**Principios**:
- Nunca debe ser importado por feature modules
- Solo debe ser importado en `app.config.ts`
- Servicios marcados con `providedIn: 'root'`

### 2. Shared Layer

**Propósito**: Componentes, directivas y pipes reutilizables.

**Características**:
- Componentes UI sin lógica de negocio
- Pipes de transformación
- Directivas de comportamiento
- Utilidades comunes

**Principios**:
- Puede ser importado por cualquier feature module
- No debe tener dependencias de feature modules
- Componentes tontos (dumb/presentational)

### 3. Features Layer

**Propósito**: Módulos de funcionalidades específicas del negocio.

**Características**:
- Auto-contenidos y lazy-loaded
- Cada feature tiene sus propios componentes, servicios y modelos
- Rutas definidas por feature

**Principios**:
- Mínima dependencia entre features
- Comunicación a través de servicios del core
- Pueden importar shared module

### 4. Layout Layer

**Propósito**: Estructura visual de la aplicación.

**Características**:
- Header, sidebar, footer
- Navegación principal
- Estructura responsive

## Patrones de Diseño

### 1. Standalone Components

Todos los componentes son standalone (no requieren NgModule):

```typescript
@Component({
  selector: 'app-resident-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './resident-list.component.html',
  styleUrls: ['./resident-list.component.scss']
})
export class ResidentListComponent {}
```

### 2. Service Pattern

Servicios para lógica de negocio y comunicación con API:

```typescript
@Injectable({
  providedIn: 'root'
})
export class ResidentService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getResidents(): Observable<IResident[]> {
    return this.http.get<IResident[]>(`${this.apiUrl}/residents`);
  }
}
```

### 3. Reactive Forms

Uso de formularios reactivos para validación compleja:

```typescript
form = this.fb.group({
  firstName: ['', [Validators.required, Validators.minLength(2)]],
  lastName: ['', Validators.required],
  email: ['', [Validators.required, Validators.email]]
});
```

### 4. Smart & Dumb Components

- **Smart Components**: Contienen lógica de negocio, se comunican con servicios
- **Dumb Components**: Solo presentación, reciben datos via `@Input()` y emiten eventos via `@Output()`

```typescript
// Smart Component
@Component({...})
export class ResidentListComponent {
  residents$ = this.residentService.getResidents();

  constructor(private residentService: ResidentService) {}
}

// Dumb Component
@Component({...})
export class ResidentCardComponent {
  @Input() resident!: IResident;
  @Output() edit = new EventEmitter<string>();
  @Output() delete = new EventEmitter<string>();
}
```

### 5. Observable Streams

Uso de RxJS para manejo de estado y eventos asíncronos:

```typescript
residents$ = this.residentService.getResidents().pipe(
  map(residents => residents.filter(r => r.active)),
  catchError(error => {
    this.handleError(error);
    return of([]);
  })
);
```

## Flujo de Datos

```
User Interaction
       ↓
Smart Component
       ↓
Service Layer
       ↓
HTTP Interceptor
       ↓
API Backend
       ↓
HTTP Response
       ↓
Service Layer (transform)
       ↓
Smart Component (subscribe)
       ↓
Template Update
```

## Estado de la Aplicación

### Enfoque Actual: Services with BehaviorSubject

```typescript
@Injectable({
  providedIn: 'root'
})
export class ResidentStateService {
  private residentsSubject = new BehaviorSubject<IResident[]>([]);
  residents$ = this.residentsSubject.asObservable();

  updateResidents(residents: IResident[]): void {
    this.residentsSubject.next(residents);
  }
}
```

### Futuro: NgRx (si crece la complejidad)

Para aplicaciones más grandes, considerar NgRx para:
- Estado global centralizado
- Acciones predecibles
- DevTools para debugging
- Time-travel debugging

## Routing

### Lazy Loading

Todas las features se cargan de forma lazy:

```typescript
export const routes: Routes = [
  {
    path: '',
    component: MainLayoutComponent,
    children: [
      {
        path: 'residentes',
        loadChildren: () => import('./features/residentes/residentes.routes')
      },
      {
        path: 'pagos',
        loadChildren: () => import('./features/pagos/pagos.routes')
      }
    ]
  }
];
```

### Guards

Protección de rutas con guards:

```typescript
{
  path: 'admin',
  canActivate: [AuthGuard, RoleGuard],
  loadChildren: () => import('./features/admin/admin.routes')
}
```

## Manejo de Errores

### HTTP Interceptor

```typescript
@Injectable()
export class ErrorInterceptor implements HttpInterceptor {
  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return next.handle(req).pipe(
      catchError((error: HttpErrorResponse) => {
        // Logging
        console.error('Error occurred:', error);

        // User notification
        this.notificationService.showError(error.message);

        return throwError(() => error);
      })
    );
  }
}
```

## Testing Strategy

### Unit Tests
- Servicios: 100% cobertura
- Componentes smart: Lógica de negocio
- Pipes y directivas

### Integration Tests
- Flujos completos de features
- Interacción entre componentes

### E2E Tests
- Casos de uso críticos
- User journeys principales

## Performance

### Estrategias

1. **OnPush Change Detection**
```typescript
@Component({
  changeDetection: ChangeDetectionStrategy.OnPush
})
```

2. **TrackBy en *ngFor**
```typescript
trackByResidentId(index: number, resident: IResident): string {
  return resident.id;
}
```

3. **Lazy Loading de Módulos**

4. **Optimización de Imágenes**
- Formato WebP
- Lazy loading de imágenes
- Responsive images

5. **Bundle Optimization**
- Code splitting
- Tree shaking
- Minificación

## Seguridad

### Consideraciones

1. **XSS Protection**: Angular sanitiza automáticamente
2. **CSRF Tokens**: Implementar en interceptor
3. **JWT**: Storage seguro de tokens
4. **HTTPS**: Obligatorio en producción
5. **Content Security Policy**: Configurar headers

## Escalabilidad

### Preparado para:

1. **Micro-frontends**: Arquitectura modular facilita división
2. **Múltiples temas**: Sistema de theming con Tailwind CSS
3. **Multi-tenant**: Servicios diseñados para soportar múltiples condominios
4. **Internacionalización**: Estructura lista para i18n

## Mejores Prácticas

1. **DRY (Don't Repeat Yourself)**
2. **SOLID Principles**
3. **Clean Code**
4. **Conventional Commits**
5. **Code Reviews**
6. **Automated Testing**
7. **Continuous Integration**

## Referencias

- [Angular Style Guide](https://angular.dev/style-guide)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [RxJS Best Practices](https://rxjs.dev/guide/overview)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)

---

**Última actualización**: 2024
**Versión**: 1.0
