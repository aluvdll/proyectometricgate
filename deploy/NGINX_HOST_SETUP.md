# MetricGate en Nginx sin Docker

Esta guia asume:

- El frontend compilado vive en `/var/www/proyectometricgate/frontend/dist`
- El backend Laravel vive en `/var/www/proyectometricgate/backendApi`
- El dominio publico es `www.metricgate.es`
- La red interna puede ser REDNAT, pero el servidor Nginx debe resolver el nombre hacia si mismo o hacia su IP publica/privada correcta

## 1) Instalar servicios

Asegura que en la maquina estan activos:

- `nginx`
- `php8.5-fpm` o la version de PHP-FPM que uses
- `mysql` si la base de datos corre localmente

## 2) Copiar la configuracion de Nginx

En este host los certificados actuales estan en `/etc/nginx/ssl/metricgate.crt` y `/etc/nginx/ssl/metricgate.key`.

Copia [deploy/nginx/metricgate.conf](deploy/nginx/metricgate.conf) a:

- `/etc/nginx/sites-available/metricgate.conf`

Y enlazala:

- `sudo ln -s /etc/nginx/sites-available/metricgate.conf /etc/nginx/sites-enabled/metricgate.conf`

Si tienes el sitio por defecto activo, desactivalo si interfiere.

## 3) Ajustar el socket de PHP-FPM

En esta instalacion el backend se expone por `php artisan serve` en `127.0.0.1:8000`, y Nginx lo consume por proxy.

Si quieres cambiar a PHP-FPM directo, ajusta la configuracion de Nginx aparte.

## 4) Compilar el frontend

Desde `frontend`:

- `npm ci`
- `npm run build`

## 5) Preparar Laravel

Desde `backendApi`:

- `composer install`
- `php artisan config:clear`
- `php artisan config:cache`
- `php artisan migrate --force` si aplica

## 6) Reiniciar servicios

- `sudo systemctl reload nginx`
- `sudo systemctl restart metricgate-backend`

## 7) REDNAT

Si estas dentro de una red NAT o detras de un router:

- El DNS de `metricgate.es` y `www.metricgate.es` debe apuntar a la IP visible por Nginx
- Si pruebas desde la red local, el router debe tener hairpin NAT o un DNS interno que resuelva al servidor correcto
- Si el navegador sigue mostrando errores de origen, limpia solo los datos del sitio de `metricgate.es` en Firefox; eso no toca el servidor

## 8) Punto de restauracion

Antes de modificar nada mas, el estado funcional actual estaba basado en:

- CORS en `backendApi/config/cors.php`
- API del frontend resolviendo al mismo origen en produccion
- Build del frontend validada

