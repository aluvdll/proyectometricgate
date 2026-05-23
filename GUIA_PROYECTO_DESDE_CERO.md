# MetricGatesApp — Guía completa de construcción desde 0

> **Propósito:** Explicar al profesor, paso a paso, cómo se ha construido este proyecto, qué tecnologías se usan y por qué se ha tomado cada decisión de diseño.

---

## 0. ¿Qué es MetricGatesApp?

MetricGatesApp es una aplicación web **SaaS multi-empresa** para gestionar:

- **Presupuestos** de instalación de puertas/vallas (con líneas configurables)
- **Clientes** de cada empresa
- **Artículos** (estándar y configurables con opciones de precio)
- **Pedidos** generados a partir de presupuestos aceptados
- **Usuarios** con tres roles: `superadmin`, `admin`, `technician`
- **Alta de empresas** mediante pago con Stripe

La arquitectura es:

```
Navegador (React) ──► Nginx (edge) ──► Nginx (API) ──► Laravel (PHP-FPM) ──► MySQL
                  └──────────────────► Nginx (static frontend)
```

Todo corre dentro de **Docker Compose**.

---

## 1. Requisitos previos

| Herramienta    | Versión mínima | Para qué sirve                          |
| -------------- | -------------- | --------------------------------------- |
| Docker Desktop | 24+            | Contenedores                            |
| Node.js        | 20+            | Tooling frontend local                  |
| PHP            | 8.3            | Backend local (opcional si usas Docker) |
| Composer       | 2.x            | Gestor de paquetes PHP                  |
| Git            | cualquiera     | Control de versiones                    |

---

## 2. Estructura de carpetas del monorepo

```
metricgatesapp/
├── backendApi/          ← API REST en Laravel 13
├── frontend/            ← SPA en React 19 + TypeScript + Vite
├── docker/
│   ├── nginx/           ← Configuraciones Nginx para cada servicio
│   └── certs/           ← Certificados SSL (autofirmados para local)
├── dns/                 ← Servidor DNS BIND9 (opcional, perfil lan-dns)
└── docker-compose.yml   ← Orquestación de todos los servicios
```

La decisión de tener **un único repositorio** (monorepo) simplifica compartir variables de entorno, ejecutar `docker compose up` desde la raíz y gestionar el ciclo de vida completo del proyecto.

---

## 3. PASO 1 — Crear el backend Laravel

### 3.1 Instalar Laravel

```bash
composer create-project laravel/laravel backendApi
cd backendApi
```

Esto genera la estructura de carpetas de Laravel:

- `app/` → Lógica de la aplicación (Modelos, Controladores, Middleware, Services)
- `database/migrations/` → Esquema de la base de datos como código
- `routes/api.php` → Rutas de la API REST
- `config/` → Configuración de servicios (DB, mail, cache…)

### 3.2 Instalar Laravel Sanctum (autenticación por tokens)

```bash
composer require laravel/sanctum
php artisan vendor:publish --provider="Laravel\Sanctum\SanctumServiceProvider"
```

Sanctum emite **tokens de API** que el frontend almacena en `localStorage` y envía en cada petición mediante la cabecera `Authorization: Bearer <token>`.

### 3.3 Configurar el fichero `.env`

```dotenv
APP_NAME=MetricGatesApp
APP_ENV=local
APP_URL=http://localhost

DB_CONNECTION=mysql
DB_HOST=mysql          # nombre del servicio Docker
DB_PORT=3306
DB_DATABASE=metricgates
DB_USERNAME=metricgates
DB_PASSWORD=secret

MAIL_MAILER=smtp
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USERNAME=...
MAIL_PASSWORD=...
MAIL_ENCRYPTION=tls
MAIL_FROM_ADDRESS=no-reply@metricgates.com

STRIPE_SECRET=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

> **Regla de oro:** nunca subir `.env` al repositorio (está en `.gitignore`).  
> Se incluye `.env.example` con las claves vacías como plantilla.

---

## 4. PASO 2 — Diseñar la base de datos (Migraciones)

Las migraciones son ficheros PHP con fecha en el nombre que describen el esquema.  
Orden cronológico real del proyecto:

| Fichero                                        | Tabla creada                 | Descripción                          |
| ---------------------------------------------- | ---------------------------- | ------------------------------------ |
| `000_create_cache_table`                       | `cache`                      | Caché interna de Laravel             |
| `000_create_jobs_table`                        | `jobs`                       | Cola de trabajos asíncronos          |
| `2026_01_01_create_companies`                  | `companies`                  | Empresas registradas en el SaaS      |
| `2026_01_02_create_users`                      | `users`                      | Usuarios de cada empresa             |
| `2026_05_04_create_personal_access_tokens`     | `personal_access_tokens`     | Tokens Sanctum                       |
| `2026_05_09_create_password_reset_tokens`      | `password_reset_tokens`      | Reset de contraseña                  |
| `2026_05_10_create_clients`                    | `clients`                    | Clientes de cada empresa             |
| `2026_05_10_create_article_families`           | `article_families`           | Familias de artículos                |
| `2026_05_10_create_standard_articles`          | `standard_articles`          | Artículos simples con precio fijo    |
| `2026_05_10_create_configurable_articles`      | `configurable_articles`      | Artículos con opciones               |
| `2026_05_10_create_budgets`                    | `budgets`                    | Cabecera de presupuesto              |
| `2026_05_10_create_budget_lines`               | `budget_lines`               | Líneas de un presupuesto             |
| `2026_05_10_create_budget_line_configurations` | `budget_line_configurations` | Config de línea (medidas, opciones)  |
| `2026_05_14_create_orders`                     | `orders`                     | Pedidos generados desde presupuestos |

### Ejemplo: migración de `budgets`

```php
Schema::create('budgets', function (Blueprint $table) {
    $table->id();
    $table->foreignId('company_id')->constrained()->onDelete('cascade');
    $table->foreignId('client_id')->constrained()->onDelete('cascade');
    $table->foreignId('created_by_user_id')->constrained('users');
    $table->string('budget_number')->unique();
    $table->date('budget_date');
    $table->enum('status', ['draft','sent','accepted','rejected','expired'])->default('draft');
    $table->decimal('base_amount', 10, 2)->default(0);
    $table->decimal('tax_amount', 10, 2)->default(0);
    $table->decimal('total_amount', 10, 2)->default(0);
    $table->text('notes')->nullable();
    $table->timestamps();
});
```

**Conceptos clave:**

- `foreignId()->constrained()` crea la clave foránea y garantiza integridad referencial.
- `enum` restringe los valores posibles del estado del presupuesto.
- `onDelete('cascade')` elimina las líneas si se elimina el presupuesto padre.

Ejecutar todas las migraciones:

```bash
php artisan migrate
```

---

## 5. PASO 3 — Crear los Modelos Eloquent

Cada tabla tiene un modelo PHP en `app/Models/`. Eloquent es el ORM de Laravel.

### Ejemplo: `Budget.php`

```php
class Budget extends Model
{
    use HasFactory;

    protected $fillable = [           // Campos que se pueden asignar en masa
        'company_id', 'client_id', 'created_by_user_id',
        'budget_number', 'budget_date', 'status',
        'base_amount', 'tax_amount', 'total_amount', 'notes',
    ];

    // Relaciones
    public function company()    { return $this->belongsTo(Company::class); }
    public function client()     { return $this->belongsTo(Client::class); }
    public function createdBy()  { return $this->belongsTo(User::class, 'created_by_user_id'); }
    public function lines()      { return $this->hasMany(BudgetLine::class); }
}
```

**Por qué `$fillable`?**  
Protege contra ataques de _mass assignment_: si el cliente envía campos no esperados en el JSON, Eloquent los ignorará.

### Relaciones implementadas en el proyecto

```
Company  1──N  User
Company  1──N  Client
Company  1──N  Budget
Company  1──N  ArticleFamily
Budget   1──N  BudgetLine
BudgetLine 1──1  BudgetLineConfiguration
ConfigurableArticle 1──N  ConfigurableArticleOption
```

---

## 6. PASO 4 — Crear los Controladores API

Los controladores viven en `app/Http/Controllers/Api/` y siguen el patrón **REST**:

| Método HTTP | Ruta                | Acción              |
| ----------- | ------------------- | ------------------- |
| GET         | `/api/budgets`      | Listar presupuestos |
| POST        | `/api/budgets`      | Crear presupuesto   |
| GET         | `/api/budgets/{id}` | Ver presupuesto     |
| PUT         | `/api/budgets/{id}` | Actualizar          |
| DELETE      | `/api/budgets/{id}` | Eliminar            |

Controladores existentes:

- `AuthController` — login, logout, forgot/reset password, `/me`
- `BudgetController` — CRUD de presupuestos + generación PDF
- `ClientController` — CRUD de clientes
- `ArticleFamilyController` — familias de artículos
- `StandardArticleController` — artículos simples
- `ConfigurableArticleController` — artículos configurables con opciones
- `OrderController` — pedidos
- `UserController` — gestión de usuarios por el admin
- `CompanyController` — datos de la empresa
- `PanelEmpresasController` — panel superadmin (gestión de todas las empresas)
- `ContactController` — envío de email de contacto
- `StripeController` — flujo de pago y alta de empresa

### Ejemplo simplificado: `AuthController::login`

```php
public function login(Request $request)
{
    $request->validate([
        'email'    => 'required|email',
        'password' => 'required',
    ]);

    $user = User::where('email', $request->email)->first();

    if (!$user || !Hash::check($request->password, $user->password)) {
        return response()->json(['error' => 'Credenciales incorrectas'], 401);
    }

    if (!$user->active) {
        return response()->json(['error' => 'Usuario inactivo'], 403);
    }

    $token = $user->createToken('api-token')->plainTextToken;

    return response()->json([
        'token' => $token,
        'user'  => $user->load('company'),
        'role'  => $user->role,
    ]);
}
```

---

## 7. PASO 5 — Definir las rutas (`routes/api.php`)

Estructura de rutas organizada por niveles de seguridad:

```
/api
├── POST /login                        ← público
├── POST /forgot-password              ← público
├── POST /reset-password               ← público
├── POST /contact/send-email           ← público
├── POST /checkout                     ← Stripe (público)
│
└── middleware: auth:sanctum + company ← protegidas
    ├── GET  /me
    ├── POST /logout
    │
    └── middleware: superadmin ← solo superadmin
    │   └── /panel/superadmin/empresas (CRUD)
    │
    └── middleware: admin ← admin y superadmin
        ├── /users (CRUD)
        ├── /budgets (CRUD)
        ├── /clients (CRUD)
        ├── /articles/* (CRUD)
        └── /orders (CRUD)
```

---

## 8. PASO 6 — Middleware de autorización

Se crearon dos middleware personalizados:

### `EnsureCompanyAccess.php`

Verifica que el usuario autenticado pertenezca a una empresa activa.  
Se aplica a todas las rutas protegidas.

### `EnsureSuperAdmin.php`

Verifica que el rol del usuario sea `superadmin`.  
Se aplica al panel de administración de empresas.

Registro en `bootstrap/app.php`:

```php
->withMiddleware(function (Middleware $middleware) {
    $middleware->alias([
        'company'    => EnsureCompanyAccess::class,
        'superadmin' => EnsureSuperAdmin::class,
        'admin'      => EnsureAdminOrSuperAdmin::class,
    ]);
})
```

---

## 9. PASO 7 — Crear el frontend React

### 9.1 Crear el proyecto con Vite

```bash
npm create vite@latest frontend -- --template react-swc-ts
cd frontend
npm install
```

**¿Por qué Vite?**  
Es mucho más rápido que Create React App en desarrollo (Hot Module Replacement instantáneo).  
**¿Por qué TypeScript?**  
Añade tipado estático, reduciendo errores en runtime.

### 9.2 Instalar dependencias principales

```bash
npm install react-router-dom axios react-hook-form lucide-react
npm install tailwindcss @tailwindcss/vite
npm install @stripe/stripe-js
npm install swiper html2pdf.js react-floating-whatsapp
```

| Librería            | Propósito                                      |
| ------------------- | ---------------------------------------------- |
| `react-router-dom`  | Enrutamiento SPA (URL → componente)            |
| `axios`             | Peticiones HTTP al backend                     |
| `react-hook-form`   | Formularios con validación eficiente           |
| `lucide-react`      | Iconos SVG                                     |
| `tailwindcss`       | CSS utility-first (sin escribir CSS propio)    |
| `@stripe/stripe-js` | SDK de Stripe para el frontend                 |
| `swiper`            | Carousel de imágenes                           |
| `html2pdf.js`       | Exportar presupuestos a PDF desde el navegador |

### 9.3 Estructura del frontend

```
src/
├── main.tsx             ← Punto de entrada
├── App.tsx              ← Enrutador principal + rutas protegidas
├── context/
│   └── AuthContext.tsx  ← Estado global de sesión (usuario, token, rol)
├── services/
│   ├── axiosSetup.js    ← Interceptor: añade token Bearer a todas las peticiones
│   ├── auth.jsx         ← Llamadas a /api/login, /me, /logout
│   ├── presupuestos.js  ← Llamadas a /api/budgets
│   ├── clientes.js      ← Llamadas a /api/clients
│   ├── pedidos.js       ← Llamadas a /api/orders
│   └── ...              ← Un fichero por entidad
├── pages/
│   ├── public/          ← Home, Login, Contacto, Tarifas, Pago…
│   └── admin/           ← AdminPanel, UsersPanel…
├── components/
│   ├── layout/          ← Navbar, Footer, CookieBanner
│   ├── panels/          ← Dashboard, PresupuestosPanel, ClientesPanel…
│   ├── forms/           ← FormUsuario, FormPresupuesto, FormNuevoCliente…
│   ├── views/           ← VerEditarPresupuesto, VerEditarCliente…
│   ├── modals/          ← Ventanas modales reutilizables
│   └── shared/          ← Componentes genéricos (botones, tablas…)
└── types/
    └── Usuarios.ts      ← Interfaces TypeScript de los objetos del dominio
```

---

## 10. PASO 8 — Contexto de autenticación (`AuthContext.tsx`)

El contexto de React permite compartir el estado de sesión con cualquier componente sin pasar props manualmente.

```tsx
// Qué expone el contexto
interface AuthContextType {
  isLogged: boolean;
  user: Usuario | null;
  token: string | null;
  role: string | null;
  loading: boolean;
  login: (user, token, role) => void;
  logout: () => void;
  updateUser: (data) => void;
}
```

**Flujo de sesión:**

1. Al iniciar la app, se lee `localStorage` para restaurar la sesión.
2. `login()` guarda `usuario`, `token` y `role` en `localStorage` y en el estado React.
3. `logout()` limpia `localStorage` y redirige al login.
4. Si el usuario lleva más de 1 hora inactivo, se cierra la sesión automáticamente.

---

## 11. PASO 9 — Interceptor Axios (`axiosSetup.js`)

Para no añadir el token manualmente en cada petición:

```js
import axios from "axios";

axios.defaults.baseURL = import.meta.env.VITE_API_URL;

// Antes de cada petición, inyectar el token
axios.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Si el servidor devuelve 401, hacer logout automático
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.clear();
      window.location.href = "/login";
    }
    return Promise.reject(error);
  },
);
```

---

## 12. PASO 10 — Rutas protegidas en React

En `App.tsx` se definen componentes guardianes que redirigen si no se cumplen condiciones:

```tsx
// Solo para usuarios autenticados
const PrivateRoute = ({ children }: { children: ReactNode }) => {
  const { isLogged, loading } = useAuth();
  if (loading) return <div>Cargando...</div>;
  return isLogged ? children : <Navigate to="/login" />;
};

// Solo para admins y superadmin
const AdminRoute = ({ children }: { children: ReactNode }) => {
  const { role, isLogged } = useAuth();
  if (!isLogged) return <Navigate to="/login" />;
  if (role !== "admin" && role !== "superadmin")
    return <Navigate to="/dashboard" />;
  return children;
};
```

---

## 13. PASO 11 — Dockerizar el proyecto

### 13.1 `backendApi/Dockerfile`

```dockerfile
FROM php:8.3-fpm-alpine

# Instalar extensiones PHP necesarias
RUN docker-php-ext-install pdo pdo_mysql

# Instalar Composer
COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

WORKDIR /var/www/backendApi
COPY backendApi/ .

RUN composer install --no-dev --optimize-autoloader
RUN php artisan config:cache && php artisan route:cache

EXPOSE 9000
CMD ["php-fpm"]
```

### 13.2 `frontend/Dockerfile`

```dockerfile
# Etapa 1: Build
FROM node:20-alpine AS builder
WORKDIR /app
ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL
COPY frontend/package*.json ./
RUN npm ci
COPY frontend/ .
RUN npm run build

# Etapa 2: Servir archivos estáticos con Nginx
FROM nginx:1.27-alpine
COPY --from=builder /app/dist /usr/share/nginx/html
```

**Multistage build:** el primer stage compila el React, el segundo solo copia el HTML/CSS/JS resultante. La imagen final no contiene Node.js, reduciendo el tamaño.

### 13.3 `docker-compose.yml` — Servicios

```
mysql         ← Base de datos MySQL 8.4
backend       ← PHP-FPM con Laravel
api-nginx     ← Nginx que expone el backend como HTTP
frontend      ← Nginx con el build estático de React
edge-nginx    ← Nginx público (puertos 80/443), enruta hacia api-nginx o frontend
dns (opcional)← BIND9 para resolución DNS en red local
```

**Orden de arranque con `depends_on`:**

```
edge-nginx → frontend → api-nginx → backend → mysql (healthcheck)
```

MySQL tiene un `healthcheck` que ejecuta `mysqladmin ping` para que el backend no arranque hasta que la BD esté lista.

### 13.4 Arrancar el proyecto completo

```bash
# Copiar variables de entorno
cp backendApi/.env.example backendApi/.env
# Rellenar los valores en backendApi/.env

# Construir y arrancar
docker compose up --build -d

# Ejecutar migraciones dentro del contenedor
docker compose exec backend php artisan migrate --seed
```

---

## 14. PASO 12 — Nginx como proxy inverso

### `docker/nginx/edge.conf` (puerta de entrada pública)

```nginx
server {
    listen 80;
    listen 443 ssl;

    ssl_certificate     /etc/nginx/certs/cert.pem;
    ssl_certificate_key /etc/nginx/certs/key.pem;

    # Rutas /api/* van al backend
    location /api/ {
        proxy_pass http://api-nginx;
    }

    # Todo lo demás va al frontend
    location / {
        proxy_pass http://frontend;
    }
}
```

Este patrón permite que **frontend y API compartan el mismo dominio/puerto**, eliminando problemas de CORS en producción.

---

## 15. PASO 13 — Integración con Stripe

### Flujo de alta de empresa vía pago

```
1. Usuario elige plan en /tarifas
2. Frontend llama POST /api/checkout  →  Laravel crea PaymentIntent en Stripe
3. Frontend usa @stripe/stripe-js para mostrar el formulario de pago
4. Usuario paga → Stripe llama al webhook POST /api/stripe/webhook
5. Laravel verifica la firma del webhook y activa la empresa
6. Usuario es redirigido a /pago-aceptado con un enlace de registro
7. Usuario completa el registro → POST /api/checkout/registration/complete
8. Laravel crea la empresa + usuario admin + envía email de bienvenida
```

**Por qué usar webhooks?**  
El pago se confirma de forma asíncrona. Nunca hay que confiar solo en el redirect del frontend; el webhook es la fuente de verdad.

---

## 16. PASO 14 — Sistema de roles

| Rol          | Puede hacer                                                                |
| ------------ | -------------------------------------------------------------------------- |
| `superadmin` | Gestionar todas las empresas, dar de alta/baja, ver panel global           |
| `admin`      | Gestionar su empresa: usuarios, clientes, artículos, presupuestos, pedidos |
| `technician` | Ver y crear presupuestos/pedidos, sin acceso a configuración               |

Los roles se comprueban en dos lugares:

1. **Backend**: middleware `EnsureSuperAdmin`, `EnsureAdminOrSuperAdmin` en las rutas
2. **Frontend**: `AdminRoute`, `SuperAdminRoute` en `App.tsx` para ocultar páginas

---

## 17. PASO 15 — Tests con PestPHP

Pest es un framework de testing para PHP con sintaxis expresiva:

```php
// tests/Feature/AuthTest.php
it('permite login con credenciales correctas', function () {
    $user = User::factory()->create(['password' => bcrypt('secret')]);

    $response = $this->postJson('/api/login', [
        'email'    => $user->email,
        'password' => 'secret',
    ]);

    $response->assertStatus(200)->assertJsonStructure(['token', 'user']);
});

it('rechaza login con contraseña incorrecta', function () {
    $user = User::factory()->create();

    $this->postJson('/api/login', [
        'email'    => $user->email,
        'password' => 'wrong',
    ])->assertStatus(401);
});
```

Ejecutar tests:

```bash
php artisan test
# o con Pest directamente:
./vendor/bin/pest
```

---

## 18. Resumen del flujo completo de una petición

```
1. Usuario abre el navegador en https://metricgates.local/presupuestos
2. edge-nginx devuelve index.html del frontend React (SPA)
3. React renderiza la página, AuthContext restaura la sesión desde localStorage
4. El componente PresupuestosPanel llama a presupuestos.js → axios GET /api/budgets
5. axiosSetup.js añade la cabecera Authorization: Bearer <token>
6. edge-nginx reenvía /api/* a api-nginx
7. api-nginx pasa la petición a Laravel (PHP-FPM) por FastCGI
8. Laravel ejecuta: middleware auth:sanctum → middleware company → BudgetController::index
9. BudgetController consulta MySQL filtrando por company_id del usuario
10. Devuelve JSON con los presupuestos
11. React actualiza el estado y renderiza la tabla
```

---

## 19. Variables de entorno clave

| Variable                   | Donde            | Descripción                                                                     |
| -------------------------- | ---------------- | ------------------------------------------------------------------------------- |
| `DB_HOST`                  | backend `.env`   | Nombre del servicio MySQL en Docker                                             |
| `APP_KEY`                  | backend `.env`   | Clave de cifrado de Laravel (generada con `php artisan key:generate`)           |
| `SANCTUM_STATEFUL_DOMAINS` | backend `.env`   | Dominios que pueden usar Sanctum                                                |
| `STRIPE_SECRET`            | backend `.env`   | Clave privada de Stripe                                                         |
| `STRIPE_WEBHOOK_SECRET`    | backend `.env`   | Para verificar la firma de los webhooks                                         |
| `VITE_API_URL`             | frontend / build | URL base de la API (`/api` en producción, `http://localhost:8000/api` en local) |

---

## 20. Comandos útiles de referencia

```bash
# Arrancar todo
docker compose up -d

# Ver logs en tiempo real
docker compose logs -f backend

# Entrar al contenedor del backend
docker compose exec backend bash

# Ejecutar migraciones
docker compose exec backend php artisan migrate

# Crear una migración nueva
docker compose exec backend php artisan make:migration create_invoices_table

# Crear un modelo con migración y controlador
docker compose exec backend php artisan make:model Invoice -mc

# Limpiar caché de config/rutas
docker compose exec backend php artisan optimize:clear

# Instalar dependencias frontend
cd frontend && npm install

# Arrancar frontend en desarrollo
cd frontend && npm run dev

# Build de producción del frontend
cd frontend && npm run build
```

---

## 21. Decisiones de diseño destacadas

| Decisión                 | Alternativa descartada          | Razón                                                             |
| ------------------------ | ------------------------------- | ----------------------------------------------------------------- |
| Laravel Sanctum (tokens) | Laravel Passport (OAuth2)       | Sanctum es más simple para SPA; Passport es para APIs de terceros |
| Vite + React SWC         | Create React App                | Vite es 10-20x más rápido en HMR                                  |
| Tailwind CSS             | CSS modules / styled-components | Menos ficheros, consistencia de diseño, prototipado rápido        |
| Docker Compose monorepo  | Repos separados                 | Un solo `docker compose up` arranca todo el sistema               |
| Nginx como reverse proxy | Exponer Laravel directamente    | Separa SSL, enrutamiento y servicio de estáticos                  |
| Multi-stage Docker build | Build en CI externo             | Imagen de producción mínima sin Node.js                           |
| Stripe Webhooks          | Solo redirect                   | Los webhooks son la fuente de verdad del pago                     |
| PestPHP                  | PHPUnit puro                    | Sintaxis más legible y expresiva                                  |

---

_Documento generado el 18/05/2026. Refleja el estado actual del repositorio `metricgatesapp`._
