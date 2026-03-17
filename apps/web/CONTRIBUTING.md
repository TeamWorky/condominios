# Guía de Contribución

Gracias por tu interés en contribuir al Sistema de Gestión de Condominios. Este documento establece las pautas para contribuir al proyecto.

## Código de Conducta

Este proyecto se adhiere a un código de conducta profesional. Al participar, se espera que mantengas este código. Por favor reporta comportamientos inaceptables al equipo de desarrollo.

## ¿Cómo puedo contribuir?

### Reportar Bugs

Si encuentras un bug, por favor crea un issue con:

1. **Título descriptivo**: Resume el problema claramente
2. **Pasos para reproducir**: Lista detallada de pasos
3. **Comportamiento esperado**: Qué debería suceder
4. **Comportamiento actual**: Qué sucede actualmente
5. **Entorno**: Navegador, versión, SO
6. **Screenshots**: Si es aplicable
7. **Logs de consola**: Si hay errores JavaScript

### Sugerir Mejoras

Para sugerir nuevas funcionalidades:

1. Verifica que no exista ya un issue similar
2. Crea un nuevo issue con la etiqueta `enhancement`
3. Describe claramente:
   - El problema que resuelve
   - La solución propuesta
   - Alternativas consideradas
   - Impacto en usuarios

### Pull Requests

1. **Fork** el repositorio
2. **Crea una rama** desde `develop`:
   ```bash
   git checkout -b feature/nombre-funcionalidad
   ```

3. **Nomenclatura de ramas**:
   - `feature/`: nuevas funcionalidades
   - `fix/`: corrección de bugs
   - `docs/`: documentación
   - `refactor/`: refactorización
   - `test/`: tests

4. **Realiza tus cambios** siguiendo las guías de estilo

5. **Escribe tests** para tu código

6. **Commit** con mensajes descriptivos:
   ```bash
   git commit -m "feat: agregar filtro de búsqueda en residentes"
   ```

7. **Push** a tu fork:
   ```bash
   git push origin feature/nombre-funcionalidad
   ```

8. **Abre un Pull Request** a la rama `develop`

## Guías de Estilo

### Código TypeScript

- Usa TypeScript estricto
- Sigue las reglas de ESLint configuradas
- Nombres de variables en `camelCase`
- Nombres de clases en `PascalCase`
- Nombres de constantes en `UPPER_SNAKE_CASE`
- Interfaces prefijadas con `I`: `IResident`
- Tipos sin prefijo: `ResidentType`

```typescript
// Bueno
interface IResident {
  id: string;
  firstName: string;
  lastName: string;
}

const MAX_RESIDENTS = 100;

// Malo
interface resident {
  ID: string;
  first_name: string;
}
```

### Componentes Angular

- Un componente por archivo
- Nombres descriptivos: `resident-list.component.ts`
- Usar standalone components
- Implementar OnDestroy para limpiar suscripciones
- Preferir OnPush change detection cuando sea posible

```typescript
@Component({
  selector: 'app-resident-list',
  standalone: true,
  imports: [CommonModule, MatTableModule],
  templateUrl: './resident-list.component.html',
  styleUrls: ['./resident-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ResidentListComponent implements OnInit, OnDestroy {
  // ...
}
```

### Servicios

- Nombres terminados en `Service`: `ResidentService`
- Un servicio por archivo
- Usar `providedIn: 'root'` cuando sea posible
- Documentar métodos públicos

```typescript
@Injectable({
  providedIn: 'root'
})
export class ResidentService {
  /**
   * Obtiene la lista de residentes activos
   * @returns Observable con array de residentes
   */
  getActiveResidents(): Observable<IResident[]> {
    return this.http.get<IResident[]>('/api/residents/active');
  }
}
```

### Templates HTML

- Usar sintaxis de Angular moderna
- Preferir `@if` y `@for` sobre `*ngIf` y `*ngFor`
- Mantener lógica simple en templates
- Usar pipes para transformaciones

```html
<!-- Bueno -->
@if (residents.length > 0) {
  @for (resident of residents; track resident.id) {
    <app-resident-card [resident]="resident" />
  }
} @else {
  <p>No hay residentes registrados</p>
}

<!-- Evitar -->
<div *ngIf="residents && residents.length > 0">
  <div *ngFor="let resident of residents">
    ...
  </div>
</div>
```

### Estilos SCSS

- Usar variables para colores y espaciados
- Aprovechar temas de Angular Material
- Evitar estilos globales innecesarios
- BEM para nomenclatura de clases cuando sea apropiado

```scss
.resident-card {
  padding: var(--spacing-md);
  background: var(--surface-color);

  &__header {
    font-size: 1.2rem;
    font-weight: 500;
  }

  &__content {
    margin-top: var(--spacing-sm);
  }
}
```

### Commits

Seguir [Conventional Commits](https://www.conventionalcommits.org/):

- `feat:` nueva funcionalidad
- `fix:` corrección de bug
- `docs:` cambios en documentación
- `style:` formato, punto y coma faltante, etc
- `refactor:` refactorización de código
- `test:` agregar tests
- `chore:` cambios en build, configuración, etc

```bash
# Ejemplos
feat: agregar módulo de pagos
fix: corregir cálculo de gastos comunes
docs: actualizar README con instrucciones de instalación
refactor: simplificar lógica de validación de residentes
test: agregar tests para ResidentService
```

## Testing

### Requerimientos

- Cobertura mínima: 70%
- Tests unitarios para servicios
- Tests de componentes para lógica compleja
- Tests E2E para flujos críticos

### Ejecutar Tests

```bash
# Tests unitarios
ng test

# Tests con cobertura
ng test --coverage

# Tests E2E
ng e2e
```

### Ejemplo de Test

```typescript
describe('ResidentService', () => {
  let service: ResidentService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [ResidentService]
    });
    service = TestBed.inject(ResidentService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  it('should fetch residents', () => {
    const mockResidents: IResident[] = [
      { id: '1', firstName: 'Juan', lastName: 'Pérez' }
    ];

    service.getResidents().subscribe(residents => {
      expect(residents).toEqual(mockResidents);
    });

    const req = httpMock.expectOne('/api/residents');
    expect(req.request.method).toBe('GET');
    req.flush(mockResidents);
  });
});
```

## Proceso de Revisión

1. Un miembro del equipo revisará tu PR
2. Se pueden solicitar cambios
3. Una vez aprobado, se hará merge a `develop`
4. Los releases se hacen desde `develop` a `main`

## Estructura de Carpetas

Mantén esta estructura al agregar nuevos archivos:

```
src/app/
├── core/
│   ├── services/
│   ├── guards/
│   ├── interceptors/
│   └── models/
├── shared/
│   ├── components/
│   ├── directives/
│   ├── pipes/
│   └── utils/
├── features/
│   └── [feature-name]/
│       ├── components/
│       ├── services/
│       ├── models/
│       └── [feature-name].routes.ts
└── layout/
    ├── header/
    ├── sidebar/
    └── footer/
```

## Preguntas

Si tienes preguntas sobre cómo contribuir:

1. Revisa la documentación existente
2. Busca en issues cerrados
3. Abre un nuevo issue con la etiqueta `question`

## Licencia

Al contribuir, aceptas que tus contribuciones se licenciarán bajo la misma licencia del proyecto.

## Agradecimientos

Gracias por contribuir al proyecto y ayudar a mejorarlo para todos.
