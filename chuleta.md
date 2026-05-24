# Chuleta despliegue rapido MetricGate

## Si cambias solo backend

1. Edita archivos en `backendApi/`
2. Si solo cambias logica PHP, normalmente no hace falta build
3. Si cambias configuracion:
   - `cd /var/www/proyectometricgate/backendApi`
   - `php artisan config:clear`
   - `php artisan config:cache`
4. Si cambias rutas:
   - `cd /var/www/proyectometricgate/backendApi`
   - `php artisan route:clear`
5. Si cambias migraciones o base de datos:
   - `cd /var/www/proyectometricgate/backendApi`
   - `php artisan migrate`
6. Si no refleja cambios o quieres asegurar recarga:
   - `sudo systemctl restart metricgate-backend`

## Si cambias solo frontend

1. Edita archivos en `frontend/src/`
2. Genera build:
   - `cd /var/www/proyectometricgate/frontend`
   - `npm run build`
3. Nginx ya servira automaticamente el contenido nuevo de `frontend/dist/`

## Si cambias backend y frontend

1. Haz los cambios del backend
2. Ejecuta los comandos `artisan` que hagan falta
3. Si hace falta, reinicia backend:
   - `sudo systemctl restart metricgate-backend`
4. Haz build del frontend:
   - `cd /var/www/proyectometricgate/frontend`
   - `npm run build`

## Comprobaciones utiles

- Ver estado backend:
  - `systemctl is-active metricgate-backend`
- Ver estado nginx:
  - `systemctl is-active nginx`
- Ver logs backend:
  - `journalctl -u metricgate-backend -n 50 --no-pager`
- Ver logs nginx:
  - `sudo tail -n 50 /var/log/nginx/metricgate_error.log`

## Importante

- No usas Docker en este entorno
- El frontend necesita `npm run build` para reflejar cambios en la web publica
- El backend normalmente no necesita build
- La web publica se sirve con Nginx
- El backend se expone por el servicio `metricgate-backend`
