# GUIA: CREACION BACKEND LARAVEL + BASE DE DATOS + MIGRACIONES

Esta guia explica:
1. Como crear y levantar el backend Laravel.
2. Si la base de datos debe existir antes.
3. Como funcionan migraciones, seeders y flujo de cambios.

## 1) Idea clave: Laravel NO crea el servidor de BD

Laravel gestiona esquema (tablas, columnas, indices), pero normalmente NO crea la base de datos principal en MySQL/PostgreSQL.

En la practica:
- MySQL/PostgreSQL: primero creas la base de datos vacia (por ejemplo, metricgate), luego Laravel crea tablas con migraciones.
- SQLite: si usas archivo SQLite, puedes crear el archivo y Laravel crea las tablas al migrar.

Resumen rapido:
- BD (contenedor) -> la creas tu/SGBD.
- Tablas y estructura -> las crea Laravel con migraciones.

## 2) Estructura en este proyecto

Tu backend esta en:
- [backendApi](backendApi)

Archivos importantes:
- [backendApi/.env](backendApi/.env)
- [backendApi/config/database.php](backendApi/config/database.php)
- [backendApi/database/migrations](backendApi/database/migrations)
- [backendApi/database/seeders](backendApi/database/seeders)

## 3) Pasos para crear backend Laravel desde cero (sin Docker)

### Paso 1: Crear proyecto

Ejemplo general:

```bash
composer create-project laravel/laravel backendApi
```

### Paso 2: Configurar conexion en .env

Ejemplo MySQL:

```env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=metricgate
DB_USERNAME=tu_usuario
DB_PASSWORD=tu_password
```

### Paso 3: Crear la base de datos vacia en MySQL/PostgreSQL

Ejemplo SQL:

```sql
CREATE DATABASE metricgate CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

Luego Laravel ya puede crear tablas dentro de esa BD.

### Paso 4: Ejecutar migraciones

Desde [backendApi](backendApi):

```bash
php artisan migrate
```

Esto ejecuta los archivos en [backendApi/database/migrations](backendApi/database/migrations) y crea tablas.

### Paso 5: Poblar datos iniciales (opcional)

```bash
php artisan db:seed
```

O migrar y sembrar en un paso:

```bash
php artisan migrate --seed
```

## 4) Que son las migraciones

Una migracion es versionado de base de datos en codigo PHP.

Cada migracion tiene dos metodos:
- up(): aplica cambio (crear/alterar tabla).
- down(): revierte cambio.

Ejemplo conceptual:

```php
public function up(): void
{
    Schema::create('users', function (Blueprint $table) {
        $table->id();
        $table->string('name');
        $table->string('email')->unique();
        $table->timestamps();
    });
}

public function down(): void
{
    Schema::dropIfExists('users');
}
```

## 5) Flujo correcto cuando cambias estructura

1. Crear migracion nueva (no editar historico ya aplicado en produccion).
2. Escribir cambios en up/down.
3. Ejecutar php artisan migrate.
4. Si necesitas datos base, actualizar seeders.

Crear migracion:

```bash
php artisan make:migration add_phone_to_users_table --table=users
```

## 6) Comandos de migracion que mas se usan

Aplicar pendientes:

```bash
php artisan migrate
```

Revertir ultimo bloque:

```bash
php artisan migrate:rollback
```

Revertir N bloques:

```bash
php artisan migrate:rollback --step=2
```

Reset completo (revierte todo):

```bash
php artisan migrate:reset
```

Borrar todas las tablas y recrear:

```bash
php artisan migrate:fresh
```

Borrar, recrear y sembrar:

```bash
php artisan migrate:fresh --seed
```

## 7) En que casos debes crear BD antes

Debes crear BD antes cuando:
- Usas MySQL.
- Usas PostgreSQL.
- Usas MariaDB.

No necesariamente antes cuando:
- Usas SQLite por archivo y ya tienes ruta/archivo preparados.

## 8) Como verificar que todo esta bien

1. Revisar que .env tenga conexion correcta.
2. Ejecutar php artisan migrate sin errores.
3. Revisar tabla migrations en BD.
4. Probar endpoint basico de la API.

Comando util:

```bash
php artisan migrate:status
```

## 9) Buenas practicas

- No tocar migraciones antiguas si ya se aplicaron en entornos compartidos.
- Crear siempre migraciones nuevas para cambios.
- Mantener seeders idempotentes cuando sea posible.
- Hacer backup antes de cambios grandes en produccion.
- Probar rollback en local antes de desplegar cambios sensibles.

## 10) Relacion con tu login actual

Tu login con Sanctum depende de que existan correctamente:
- tabla users,
- tabla personal_access_tokens,
- y resto de tablas de negocio.

Esas tablas salen de migraciones; por eso si las migraciones no se ejecutan bien, el login y auth fallan.

---

Si quieres, te preparo otra guia adicional solo de entorno local:
- instalacion PHP/Composer,
- permisos de carpetas storage/bootstrap,
- levantar backend con php artisan serve,
- y checklist de errores tipicos de arranque.
