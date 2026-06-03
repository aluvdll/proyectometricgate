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
git clone https://github.com/aluvdll/proyectometricgate.git
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

Base de datos recomendada para este proyecto:
- `DB_DATABASE=backendapi`

Si aún no existe, créala en MySQL antes de migrar:
```sql
CREATE DATABASE backendapi CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

Después ejecuta migraciones:
```bash
php artisan migrate
```

Crear datos iniciales (incluye usuario superadmin):
```bash
php artisan db:seed
```

Acceso inicial de superadmin (entorno local):
- Email: `admin@admin.com`
- Contraseña: `12345678`

Importante:
- Cambia estas credenciales después del primer acceso.
- No uses estas credenciales por defecto en producción.

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

## Pasarela de pago (Stripe)
Este proyecto integra Stripe Checkout para la contratación de planes.

Flujo básico:
1. El usuario selecciona un plan.
2. El sistema crea una sesión de pago en Stripe.
3. El usuario realiza el pago en la página segura de Stripe.
4. Al confirmar el pago, el sistema permite continuar con el registro de la empresa.

Variables de entorno necesarias (ejemplo, sin claves reales):

### Backend (`backendApi/.env`)
- `STRIPE_SECRET_KEY=`
- `STRIPE_WEBHOOK_SECRET=` (solo si se valida webhook)
- `FRONTEND_URL=` (URL pública del frontend)

### Frontend (`frontend/.env`)
- `VITE_STRIPE_PUBLISHABLE_KEY=`

Importante:
- No subas claves reales a GitHub.
- Usa siempre variables de entorno.
- Para pruebas, utiliza las claves de modo test de Stripe.

## Envío de correos
Sí, este proyecto también necesita configuración de correo para funciones como:
- Formulario de contacto.
- Recuperación de contraseña.
- Envíos relacionados con el registro tras pago.

Variables de entorno principales en `backendApi/.env`:
- `MAIL_MAILER=`
- `MAIL_HOST=`
- `MAIL_PORT=`
- `MAIL_USERNAME=`
- `MAIL_PASSWORD=`
- `MAIL_ENCRYPTION=` (si aplica en tu proveedor)
- `MAIL_FROM_ADDRESS=`
- `MAIL_FROM_NAME=`
- `CONTACT_FORM_RECEIVER=`

Ejemplo rápido para desarrollo local (sin SMTP real):
- `MAIL_MAILER=log`

Con `MAIL_MAILER=log`, Laravel no envía correos reales: los deja en logs para pruebas.

### Cómo probar recuperar contraseña (rápido)
1. Arranca el backend (`php artisan serve`) y el frontend (`npm run dev`).
2. En la pantalla de login, pulsa en “¿Olvidaste tu contraseña?” (o equivalente).
3. Introduce un correo de usuario existente y envía la solicitud.
4. Si estás en local con `MAIL_MAILER=log`, revisa el log de Laravel para ver el enlace de recuperación:
  - Archivo: `backendApi/storage/logs/laravel.log`
5. Abre ese enlace, establece una nueva contraseña y confirma el cambio.
6. Vuelve al login e inicia sesión con la contraseña nueva.

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


