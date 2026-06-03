# Proyecto Final DAW - MetricGatesApp

## Autor
- Vicente Devesa Llorens
- Proyecto final de Diseño de Aplicaciones Web (DAW)
- IES Pere Maria Orts

## Descripción
Este proyecto es una aplicación web para la gestión de presupuestos, pedidos, clientes, usuarios y artículos de una empresa.

La aplicación tiene dos partes:
- Backend API en Laravel (PHP)
- Frontend en React + Vite

## Tecnologías que se utilizan
- PHP 8.3
- Laravel 13
- Composer
- MySQL
- Node.js y npm
- React 19
- Vite
- Axios
- Tailwind CSS

## Estructura del proyecto
- `backendApi/`: API REST, autenticación, base de datos y lógica de negocio
- `frontend/`: interfaz web para usuarios

## Requisitos previos
Antes de empezar, necesitas tener instalado:
- PHP 8.3 o superior
- Composer
- Node.js 20 o superior y npm
- MySQL
- Git

## Cómo poner en marcha el proyecto (fácil)

### 1) Clonar el repositorio
```bash
git clone <URL_DEL_REPOSITORIO>
cd proyectometricgate
```

### 2) Configurar y arrancar el backend
```bash
cd backendApi
composer install
cp .env.example .env
php artisan key:generate
```

Ahora configura la base de datos en el archivo `.env` (nombre BD, usuario y contraseña):
- `DB_HOST`
- `DB_PORT`
- `DB_DATABASE`
- `DB_USERNAME`
- `DB_PASSWORD`

Después ejecuta migraciones:
```bash
php artisan migrate
```

Arranca el backend:
```bash
php artisan serve
```

Por defecto quedará en:
- `http://127.0.0.1:8000`

### 3) Configurar y arrancar el frontend
En otra terminal:
```bash
cd frontend
npm install
npm run dev
```

Por defecto quedará en:
- `http://127.0.0.1:5173`

## Comandos útiles

### Backend
```bash
cd backendApi
php artisan serve
php artisan migrate
php artisan test
```

### Frontend
```bash
cd frontend
npm run dev
npm run build
npm run preview
```

## Problemas típicos y solución rápida
- Error de conexión con base de datos:
  - Revisa los datos de `DB_*` en `backendApi/.env`.
  - Comprueba que MySQL está arrancado.

- El frontend no conecta con backend:
  - Verifica que el backend está corriendo en `http://127.0.0.1:8000`.
  - Si usas otra URL, revisa la variable `VITE_API_URL` del frontend.

- Faltan dependencias:
  - Ejecuta de nuevo `composer install` en backend y `npm install` en frontend.

## Estado del proyecto
Proyecto funcional como trabajo final de DAW, preparado para demostración y evaluación académica.


