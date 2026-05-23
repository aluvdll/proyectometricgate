# Docker setup para MetricGatesApp

Este entorno levanta:

- Frontend React en https://www.metricgate.es
- API Laravel en https://www.metricgate.es/api
- MySQL interno en el servicio mysql

Tambien aplica redireccion automatica:

- http://metricgate.es -> https://www.metricgate.es
- http://www.metricgate.es -> https://www.metricgate.es
- https://metricgate.es -> https://www.metricgate.es

## 1) Preparar archivos de entorno

En la raiz del proyecto:

1. Copia `.env.docker.example` a `.env`
2. Ajusta contrasenas de MySQL

En backendApi:

1. Copia `.env.docker.example` a `.env`
2. Deja `DB_HOST=mysql`
3. Si vas a usar email real, cambia los valores MAIL\_\*

## 2) DNS y certificados (obligatorio para dominio)

Antes de levantar en una VM publica:

1. Crea registros DNS A para `metricgate.es` y `www.metricgate.es` apuntando a tu IP publica.
2. Abre puertos 80 y 443 en firewall/security group.

### Opcion A: certificado autofirmado (pruebas)

Desde la raiz del repo:

`mkdir -p docker/certs`
`openssl req -x509 -nodes -days 365 -newkey rsa:2048 -keyout docker/certs/privkey.pem -out docker/certs/fullchain.pem -subj "/C=ES/ST=Alicante/L=Benidorm/O=MetricGate/CN=www.metricgate.es" -addext "subjectAltName=DNS:www.metricgate.es,DNS:metricgate.es"`

Nota: los navegadores mostraran advertencia de seguridad.

### Opcion B: Let's Encrypt (produccion)

1. Asegura DNS correcto y puertos 80/443 abiertos.
2. Genera certificados en Ubuntu (host):

`sudo apt-get update && sudo apt-get install -y certbot`
`sudo certbot certonly --standalone -d metricgate.es -d www.metricgate.es --agree-tos -m tu-email@dominio.com --non-interactive`

3. Copia certificados al directorio esperado por Docker:

`sudo cp /etc/letsencrypt/live/www.metricgate.es/fullchain.pem docker/certs/fullchain.pem`
`sudo cp /etc/letsencrypt/live/www.metricgate.es/privkey.pem docker/certs/privkey.pem`

4. Ajusta permisos de lectura para Docker:

`sudo chmod 644 docker/certs/fullchain.pem docker/certs/privkey.pem`

## 3) Levantar contenedores

Desde la raiz del repo:

`docker compose --env-file .env up -d --build`

## 4) Inicializar Laravel

Genera APP_KEY si falta:

`docker compose exec backend php artisan key:generate`

Ejecuta migraciones:

`docker compose exec backend php artisan migrate --force`

Cachea config en produccion:

`docker compose exec backend php artisan config:cache`

## 5) Verificar

- Frontend: https://www.metricgate.es
- API: https://www.metricgate.es/api/login (POST)

Logs:

`docker compose logs -f backend`
`docker compose logs -f api-nginx`
`docker compose logs -f frontend`
`docker compose logs -f edge-nginx`
`docker compose logs -f mysql`

## 6) Comandos utiles

Parar:

`docker compose down`

Parar y borrar volumen de DB:

`docker compose down -v`

Rebuild completo:

`docker compose --env-file .env build --no-cache`

## 7) Instalar Docker en Ubuntu (VM)

### Ubuntu 22.04/24.04

1. Eliminar paquetes viejos:

`for pkg in docker.io docker-doc docker-compose podman-docker containerd runc; do sudo apt-get remove -y $pkg; done`

2. Instalar prerequisitos:

`sudo apt-get update && sudo apt-get install -y ca-certificates curl gnupg`

3. Agregar clave y repo oficial:

`sudo install -m 0755 -d /etc/apt/keyrings`
`curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg`
`sudo chmod a+r /etc/apt/keyrings/docker.gpg`
`echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu $(. /etc/os-release && echo $VERSION_CODENAME) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null`

4. Instalar motor y compose plugin:

`sudo apt-get update`
`sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin`

5. Habilitar Docker:

`sudo systemctl enable --now docker`

6. Ejecutar Docker sin sudo (opcional):

`sudo usermod -aG docker $USER`

Cierra sesion y vuelve a entrar.

7. Validar:

`docker --version`
`docker compose version`
`docker run --rm hello-world`

## 8) Instalar Docker Desktop en Windows

1. Instala Docker Desktop (WSL2 habilitado)
2. Activa integracion con tu distro WSL
3. Valida en terminal:

`docker --version`
`docker compose version`

## 9) Despliegue en Ubuntu con este repo

1. Clonar repo en la VM
2. Crear `.env` raiz y `backendApi/.env`
3. Ejecutar:

`docker compose --env-file .env up -d --build`
`docker compose exec backend php artisan key:generate`
`docker compose exec backend php artisan migrate --force`

4. Abre puertos 80 y 443 en firewall/security group

## 10) Renovacion Let's Encrypt

Certificados de Let's Encrypt caducan cada 90 dias.

Renovar:

`sudo certbot renew --dry-run`

Si renueva correctamente, vuelve a copiar certificados a `docker/certs` y recarga Nginx:

`sudo cp /etc/letsencrypt/live/www.metricgate.es/fullchain.pem docker/certs/fullchain.pem`
`sudo cp /etc/letsencrypt/live/www.metricgate.es/privkey.pem docker/certs/privkey.pem`
`docker compose exec edge-nginx nginx -s reload`

## 11) Notas importantes para este repo

- El frontend ya usa `VITE_API_URL` para componer endpoints `/api/...`.
- En esta configuracion se compila con `VITE_API_URL=https://www.metricgate.es`.
- Si cambias dominio en produccion, rebuild del frontend para hornear la nueva URL.
- Si una migracion historica falla por llaves foraneas largas o migraciones duplicadas, ejecutar migraciones puntuales con `--path`.

## 12) DNS LAN con Docker (Bind9, opcional)

Este repo incluye un servicio DNS opcional llamado `dns` para resolver `metricgate.es` y `www.metricgate.es` desde varias maquinas de tu red local.

Archivos incluidos:

- `dns/bind/named.conf`
- `dns/bind/named.conf.options`
- `dns/bind/named.conf.local`
- `dns/bind/zones/db.metricgate.es`

### 12.1 Ajustes previos

1. Edita `dns/bind/zones/db.metricgate.es` y cambia `192.168.1.50` por la IP LAN real de tu servidor (donde corre `edge-nginx`).
2. Si tu red no es `192.168.1.0/24`, ajusta `allow-recursion` en `dns/bind/named.conf.options`.

### 12.2 Levantar DNS

`docker compose --profile lan-dns up -d dns`

Si quieres levantar todo junto (app + dns):

`docker compose --env-file .env --profile lan-dns up -d --build`

### 12.3 Configurar clientes LAN

Configura en router DHCP (recomendado) o manualmente en cada equipo el DNS primario apuntando a la IP LAN del servidor Docker.

### 12.4 Probar resolucion

Desde un cliente de la LAN:

`nslookup metricgate.es <IP_DNS_LAN>`
`nslookup www.metricgate.es <IP_DNS_LAN>`

### 12.5 Notas

- Si Ubuntu ya tiene un DNS local ocupando el puerto 53 en esa maquina, libera el puerto o ejecuta DNS en otro host.
- Si usas certificado autofirmado, cada cliente debe confiar ese certificado para evitar advertencias HTTPS.
