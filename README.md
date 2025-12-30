# Sistema de Gestión de Condominios

Sistema web moderno para la gestión integral de condominios, desarrollado con Angular 18 y Angular Material.

## Descripción

Esta aplicación permite administrar de manera eficiente las operaciones diarias de un condominio, incluyendo la gestión de residentes, control de pagos y gastos comunes, y comunicación entre administración y propietarios.

## Características Principales

- **Gestión de Residentes**: Registro y administración de propietarios y arrendatarios
- **Pagos y Gastos Comunes**: Control de cuotas, pagos y estados de cuenta
- **Dashboard Interactivo**: Visualización de métricas y estados importantes
- **Interfaz Moderna**: Diseño responsive con Angular Material y Material Design 3

## Tecnologías

- **Frontend**: Angular 18 (Standalone Components)
- **UI Framework**: Angular Material 21
- **Estilos**: SCSS + Material Design
- **Testing**: Vitest
- **Version Control**: Git

## Requisitos Previos

- Node.js (v18 o superior)
- npm (v9 o superior)
- Angular CLI v21+

## Instalación

1. Clonar el repositorio:
```bash
git clone <repository-url>
cd gestion-condominios
```

2. Instalar dependencias:
```bash
npm install
```

3. Iniciar servidor de desarrollo:
```bash
ng serve
```

4. Abrir navegador en `http://localhost:4200/`

## Estructura del Proyecto

```
src/
├── app/
│   ├── core/           # Servicios singleton, guards, interceptors
│   ├── shared/         # Componentes, directivas y pipes compartidos
│   ├── features/       # Módulos de características
│   │   ├── residentes/ # Gestión de residentes
│   │   └── pagos/      # Gestión de pagos
│   └── layout/         # Componentes de layout
├── assets/            # Recursos estáticos
└── environments/      # Configuraciones de entorno
```

## Scripts Disponibles

```bash
# Desarrollo
ng serve

# Build de producción
ng build

# Tests unitarios
ng test

# Linting
ng lint

# Generar componente
ng generate component component-name
```

## Contribución

Por favor lee [CONTRIBUTING.md](CONTRIBUTING.md) para detalles sobre el proceso de contribución.

## Roadmap

Consulta [ROADMAP.md](ROADMAP.md) para ver las funcionalidades planificadas y mejoras futuras.

## Arquitectura

Para más detalles sobre la arquitectura del proyecto, consulta [ARCHITECTURE.md](ARCHITECTURE.md).

## Licencia

Este proyecto es privado y está protegido por derechos de autor.

## Contacto

Para más información o soporte, contacta al equipo de desarrollo.
