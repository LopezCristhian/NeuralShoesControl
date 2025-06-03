# 🧠 NeuralShoesControl - Guía de Ejecución

Sistema de control y gestión de inventario de calzado con autenticación mediante Keycloak.

## Descripción

NeuralShoesControl es una aplicación web completa que combina un backend desarrollado en Django con un frontend en Angular, implementando autenticación y autorización a través de Keycloak para la gestión segura de inventarios de calzado.

## Arquitectura del Sistema

- **Backend**: Django REST API
- **Frontend**: Angular
- **Autenticación**: Keycloak
- **Contenedores**: Docker y Docker Compose

## Requisitos Previos

### Requisitos Mínimos (Obligatorios)
- [Docker Desktop](https://www.docker.com/get-started) (incluye Docker Compose)
- [Git](https://git-scm.com/) (para clonar repositorios)

### Requisitos Opcionales (Solo para desarrollo local)
Si planeas desarrollar **fuera** de Docker, también necesitarás:
- [Python 3.8+](https://www.python.org/downloads/)
- [Node.js 16+](https://nodejs.org/)
- [Angular CLI](https://angular.io/cli) (`npm install -g @angular/cli`)
- Editor de código (recomendado: [Visual Studio Code](https://code.visualstudio.com/))

### Verificar instalación mínima

```bash
docker --version
docker-compose --version
git --version
```

> **Nota**: Docker conteneriza todo el entorno (Python, Node.js, Angular, etc.), por lo que NO necesitas instalar estas tecnologías localmente si solo vas a ejecutar la aplicación.

## Instalación y Configuración

### 1. Configuración del Backend

#### Clonar el repositorio del backend
```bash
git clone https://github.com/LopezCristhian/NeuralShoes.git
cd NeuralShoes
```

#### Ejecutar contenedores Docker
```bash
docker-compose up -d --build
```

> **Nota**: Si en Docker existen otros contenedores que estan ejecutandose en el mismo puerto, puedes usar el parámetro `--remove-orphans` para eliminarlos o detenerlos, un ejemplo de contenedor ejecutandose por el puerto 8000 es portainer, en ese caso es necesario detenerlo con el comando `docker stop portainer`.


Este comando iniciará los siguientes servicios:
- Base de datos
- Keycloak (puerto 8080)
- Backend Django

### 2. Configuración de Keycloak

#### Acceder a la consola de administración
1. Abrir navegador y navegar a: `http://localhost:8080`
2. Iniciar sesión con las credenciales por defecto:
   - **Usuario**: `admin`
   - **Contraseña**: `123`

#### Importar configuración del realm
1. En la consola de Keycloak, buscar la opción "Import"
2. Seleccionar el archivo `export-realm.json` incluido en el proyecto backend
3. Completar la importación

#### Configurar usuarios
1. Navegar al realm **"NeuralShoes"**
2. Ir a **Users** > **Add user**
3. Para cada usuario, completar:
   - **Username**: nombre único del usuario
   - **Email**: correo electrónico válido
   - **First Name**: nombre
   - **Last Name**: apellido
4. En la pestaña **Credentials**:
   - Establecer una contraseña
   - **Desactivar** la opción "Temporary"
5. En la pestaña **Role Mappings**:
   - Asignar rol `administrator` o `client` según sea necesario

#### Configurar cliente Django API
1. Ir a **Clients** > **django_api**
2. En la pestaña **Credentials**:
   - Generar un nuevo **Client Secret**
   - Copiar el valor generado
3. En el proyecto backend, editar `NeuralShoes/settings.py`:
   ```python
   KEYCLOAK_CONFIG = {
       # ... otras configuraciones
       'CLIENT_SECRET': 'tu_client_secret_aqui',
       # ... 
   }
   ```

#### Obtener clave pública RSA
1. Ir a **Realm Settings** > **Keys**
2. Buscar la clave **"RS256 RSA"**
3. Copiar la **clave pública**
4. En `NeuralShoes/settings.py`, actualizar:
   ```python
   KEYCLOAK_CONFIG = {
       # ... otras configuraciones
       'KEYCLOAK_PUBLIC_KEY': 'tu_clave_publica_aqui',
       # ...
   }
   ```

### 3. Configuración del Frontend

#### Clonar el repositorio del frontend
```bash
git clone https://github.com/LopezCristhian/NeuralShoesControl.git
cd NeuralShoesControl
```

#### Ejecutar contenedores Docker
```bash
docker-compose up -d --build
```

### 4. Acceso a la Aplicación

1. Abrir navegador y navegar a: `http://localhost:4200`
2. Iniciar sesión con uno de los usuarios creados en el paso 2
3. Explorar las funcionalidades según el rol asignado

## Estructura de Roles

- **Administrator**: Acceso completo a todas las funcionalidades
- **Client**: Acceso limitado a funcionalidades específicas de cliente

## Puertos Utilizados

| Servicio | Puerto | URL |
|----------|--------|-----|
| Frontend (Angular) | 4200 | http://localhost:4200 |
| Keycloak | 8080 | http://localhost:8080 |
| Backend (Django) | 8000 | http://localhost:8000 |

## Solución de Problemas

### Problemas comunes

**Error de conexión a Keycloak**
- Verificar que los contenedores estén ejecutándose: `docker ps`
- Reiniciar contenedores: `docker-compose restart`

**Problemas de autenticación**
- Verificar que el client secret esté correctamente configurado
- Confirmar que la clave pública RSA sea la correcta
- Revisar que los usuarios tengan roles asignados

**Puerto ocupado**
- Verificar puertos en uso: `netstat -tulpn | grep :PUERTO`
- Detener servicios que usen los puertos requeridos

### Logs de depuración

```bash
# Ver logs de todos los contenedores
docker-compose logs

# Ver logs de un servicio específico
docker-compose logs [nombre_servicio]

# Seguir logs en tiempo real
docker-compose logs -f
```

## Desarrollo

### Detener servicios
```bash
docker-compose down
```

### Limpiar contenedores y volúmenes
```bash
docker-compose down -v --remove-orphans
docker system prune -a
```

## Contribución

1. Fork el proyecto
2. Crear una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abrir un Pull Request

## Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo `LICENSE` para más detalles.

## Contacto

**Cristhian López** - [GitHub](https://github.com/LopezCristhian)

**Enlaces del proyecto:**
- Backend: https://github.com/LopezCristhian/NeuralShoes
- Frontend: https://github.com/LopezCristhian/NeuralShoesControl

# NeuralShoesControl

This project was generated using [Angular CLI](https://github.com/angular/angular-cli) version 19.2.9.

## Development server

To start a local development server, run:

```bash
ng serve
```

Once the server is running, open your browser and navigate to `http://localhost:4200/`. The application will automatically reload whenever you modify any of the source files.

## Code scaffolding

Angular CLI includes powerful code scaffolding tools. To generate a new component, run:

```bash
ng generate component component-name
```

For a complete list of available schematics (such as `components`, `directives`, or `pipes`), run:

```bash
ng generate --help
```

## Building

To build the project run:

```bash
ng build
```

This will compile your project and store the build artifacts in the `dist/` directory. By default, the production build optimizes your application for performance and speed.

## Running unit tests

To execute unit tests with the [Karma](https://karma-runner.github.io) test runner, use the following command:

```bash
ng test
```

## Running end-to-end tests

For end-to-end (e2e) testing, run:

```bash
ng e2e
```

Angular CLI does not come with an end-to-end testing framework by default. You can choose one that suits your needs.

## Additional Resources

For more information on using the Angular CLI, including detailed command references, visit the [Angular CLI Overview and Command Reference](https://angular.dev/tools/cli) page.
