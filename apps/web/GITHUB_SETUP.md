# Configuración del Repositorio en GitHub

Este documento contiene las instrucciones para conectar tu repositorio local con GitHub.

## Pasos para Subir el Proyecto a GitHub

### 1. Crear el Repositorio en GitHub

1. Ve a [GitHub](https://github.com) e inicia sesión
2. Haz clic en el botón **"+"** en la esquina superior derecha y selecciona **"New repository"**
3. Completa la información:
   - **Repository name**: `gestion-condominios`
   - **Description**: Sistema de Gestión de Condominios
   - **Visibility**: Elige entre Público o Privado
   - **NO marques** "Initialize this repository with a README" (ya tenemos uno)
   - **NO agregues** .gitignore ni licencia (ya están configurados)
4. Haz clic en **"Create repository"**

### 2. Conectar el Repositorio Local con GitHub

Ejecuta los siguientes comandos en la terminal desde la raíz del proyecto:

```bash
# Agregar todos los archivos al staging
git add .

# Hacer commit inicial
git commit -m "Initial commit: Sistema de Gestión de Condominios"

# Agregar el remote de GitHub (reemplaza USERNAME con tu usuario de GitHub)
git remote add origin https://github.com/USERNAME/gestion-condominios.git

# O si prefieres usar SSH:
# git remote add origin git@github.com:USERNAME/gestion-condominios.git

# Verificar que el remote se agregó correctamente
git remote -v

# Subir el código a GitHub
git push -u origin main
```

### 3. Verificar la Conexión

1. Ve a tu repositorio en GitHub: `https://github.com/USERNAME/gestion-condominios`
2. Verifica que todos los archivos estén presentes
3. Revisa que el README.md se muestre correctamente

## Estructura de Archivos de GitHub

Se han creado los siguientes archivos y carpetas para mejorar la experiencia en GitHub:

- **`.github/workflows/ci.yml`**: Workflow de CI/CD que ejecuta tests y build en cada push
- **`.github/PULL_REQUEST_TEMPLATE.md`**: Plantilla para Pull Requests
- **`.github/ISSUE_TEMPLATE/`**: Plantillas para reportes de bugs y solicitudes de funcionalidades
- **`.gitignore`**: Actualizado con exclusiones adicionales para Angular

## Comandos Útiles

```bash
# Ver el estado del repositorio
git status

# Ver los remotes configurados
git remote -v

# Cambiar la URL del remote (si es necesario)
git remote set-url origin https://github.com/USERNAME/gestion-condominios.git

# Subir cambios futuros
git add .
git commit -m "Descripción de los cambios"
git push

# Crear una nueva rama
git checkout -b nombre-de-la-rama
git push -u origin nombre-de-la-rama
```

## Notas Importantes

- El archivo `package-lock.json` está incluido en el repositorio (recomendado para proyectos Node.js)
- Los archivos de configuración de VS Code están incluidos (excepto algunos archivos temporales)
- El workflow de CI se ejecutará automáticamente en cada push a las ramas `main` y `develop`

## Solución de Problemas

### Error: "remote origin already exists"
Si ya existe un remote llamado `origin`, puedes:
- Eliminarlo: `git remote remove origin`
- O renombrarlo: `git remote rename origin old-origin`

### Error: "failed to push some refs"
Si GitHub tiene commits que tu repositorio local no tiene:
```bash
git pull origin main --allow-unrelated-histories
git push -u origin main
```

### Cambiar de HTTPS a SSH
```bash
git remote set-url origin git@github.com:USERNAME/gestion-condominios.git
```

