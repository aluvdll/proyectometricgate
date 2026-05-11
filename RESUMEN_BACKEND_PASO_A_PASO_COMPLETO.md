# Resumen Final Backend Paso a Paso (Completo)

Este documento resume como montar el backend completo que ya tienes en el proyecto, en orden, con codigo final y comandos.

Base usada: estado actual de backend en Laravel.

## 1) Preparacion inicial

### 1.1 Crear proyecto y dependencias

```bash
composer create-project laravel/laravel backendApi
cd backendApi
composer require laravel/sanctum
php artisan vendor:publish --provider="Laravel\Sanctum\SanctumServiceProvider"
php artisan migrate
```

### 1.2 Configurar .env (DB y APP_URL)

```env
APP_URL=http://127.0.0.1:8000

DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=metricgates
DB_USERNAME=root
DB_PASSWORD=
```

### 1.3 Levantar servidor

```bash
php artisan serve
```

## 2) Modelos base y relaciones

## 2.1 Modelo Company

Archivo: backendApi/app/Models/Company.php

```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use App\Models\ArticleFamily;

class Company extends Model
{
    protected $fillable = [
        'fiscal_name',
        'commercial_name',
        'cif_nif',
        'email',
        'address',
        'phone',
        'phone2',
        'city',
        'province',
        'postal_code',
        'logo',
        'active',
        'max_users',
    ];

    public function users()
    {
        return $this->hasMany(User::class);
    }

    public function clients()
    {
        return $this->hasMany(Client::class);
    }

    public function standardArticles()
    {
        return $this->hasMany(StandardArticle::class);
    }

    public function articleFamilies()
    {
        return $this->hasMany(ArticleFamily::class);
    }

    public function budgets()
    {
        return $this->hasMany(Budget::class);
    }
}
```

## 2.2 Modelo Client

Archivo: backendApi/app/Models/Client.php

```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Client extends Model
{
    use HasFactory;

    protected $fillable = [
        'company_id',
        'client_number',
        'dni',
        'nombre',
        'direccion',
        'poblacion',
        'codigo_postal',
        'provincia',
        'telefono',
        'telefono2',
        'email',
        'active',
    ];

    public function company()
    {
        return $this->belongsTo(Company::class);
    }

    public function budgets()
    {
        return $this->hasMany(Budget::class);
    }
}
```

## 2.3 Modelo Budget

Archivo: backendApi/app/Models/Budget.php

```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Budget extends Model
{
    use HasFactory;

    protected $fillable = [
        'company_id',
        'client_id',
        'created_by_user_id',
        'budget_number',
        'budget_date',
        'status',
        'base_amount',
        'tax_amount',
        'total_amount',
        'notes',
    ];

    public function company()
    {
        return $this->belongsTo(Company::class);
    }

    public function client()
    {
        return $this->belongsTo(Client::class);
    }

    public function createdBy()
    {
        return $this->belongsTo(User::class, 'created_by_user_id');
    }

    public function lines()
    {
        return $this->hasMany(BudgetLine::class);
    }
}
```

## 2.4 Modelo BudgetLine

Archivo: backendApi/app/Models/BudgetLine.php

```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class BudgetLine extends Model
{
    use HasFactory;

    protected $fillable = [
        'budget_id',
        'article_type',
        'standard_article_id',
        'configurable_article_id',
        'name',
        'description',
        'quantity',
        'unit_price',
        'gross_subtotal',
        'discount_percentage',
        'discount_amount',
        'net_subtotal',
        'tax_percentage',
        'tax_amount',
        'total_amount',
        'position',
    ];

    public function budget()
    {
        return $this->belongsTo(Budget::class);
    }

    public function standardArticle()
    {
        return $this->belongsTo(StandardArticle::class);
    }

    public function configurableArticle()
    {
        return $this->belongsTo(ConfigurableArticle::class);
    }
}
```

## 3) Migraciones (orden recomendado)

## 3.1 clients

Archivo: backendApi/database/migrations/2026_05_10_000000_create_clients_table.php

```php
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('clients', function (Blueprint $table) {
            $table->id();

            $table->foreignId('company_id')
                ->constrained()
                ->onDelete('cascade');

            $table->string('client_number', 5)->default('00000');

            $table->string('dni')->nullable();
            $table->string('nombre');
            $table->string('direccion');
            $table->string('poblacion');
            $table->string('codigo_postal');
            $table->string('provincia');

            $table->string('telefono')->nullable();
            $table->string('telefono2')->nullable();
            $table->string('email')->nullable();

            $table->boolean('active')->default(true);
            $table->timestamps();

            $table->unique(['company_id', 'dni']);
            $table->unique(['company_id', 'client_number']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('clients');
    }
};
```

## 3.2 budgets

Archivo: backendApi/database/migrations/2026_05_10_200000_create_budgets_table.php

```php
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('budgets', function (Blueprint $table) {
            $table->id();

            $table->foreignId('company_id')
                ->constrained()
                ->onDelete('cascade');

            $table->foreignId('client_id')
                ->nullable()
                ->constrained()
                ->nullOnDelete();

            $table->foreignId('created_by_user_id')
                ->nullable()
                ->constrained('users')
                ->nullOnDelete();

            $table->string('budget_number', 12);
            $table->date('budget_date');

            $table->enum('status', ['draft', 'sent', 'accepted', 'rejected', 'invoiced'])
                ->default('draft');

            $table->decimal('base_amount', 15, 2)->default(0);
            $table->decimal('tax_amount', 15, 2)->default(0);
            $table->decimal('total_amount', 15, 2)->default(0);

            $table->longText('notes')->nullable();
            $table->timestamps();

            $table->unique(['company_id', 'budget_number']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('budgets');
    }
};
```

## 3.3 budget_lines

Archivo: backendApi/database/migrations/2026_05_10_300000_create_budget_lines_table.php

```php
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('budget_lines', function (Blueprint $table) {
            $table->id();

            $table->foreignId('budget_id')
                ->constrained()
                ->onDelete('cascade');

            $table->enum('article_type', ['standard', 'configurable', 'manual']);

            $table->foreignId('standard_article_id')
                ->nullable()
                ->constrained('standard_articles')
                ->nullOnDelete();

            $table->foreignId('configurable_article_id')
                ->nullable()
                ->constrained('configurable_articles')
                ->nullOnDelete();

            $table->string('name');
            $table->longText('description');

            $table->decimal('quantity', 15, 2)->default(1);
            $table->decimal('unit_price', 15, 2);
            $table->decimal('gross_subtotal', 15, 2);

            $table->decimal('discount_percentage', 5, 2)->default(0);
            $table->decimal('discount_amount', 15, 2)->default(0);

            $table->decimal('net_subtotal', 15, 2);
            $table->decimal('tax_percentage', 5, 2);
            $table->decimal('tax_amount', 15, 2);
            $table->decimal('total_amount', 15, 2);

            $table->integer('position')->default(0);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('budget_lines');
    }
};
```

### 3.4 Ejecutar migraciones

```bash
php artisan migrate
```

## 4) Controladores API

## 4.1 ClientController (admin/commercial por empresa)

Archivo: backendApi/app/Http/Controllers/Api/ClientController.php

Resumen funcional:

- index: lista solo clientes de la empresa logueada
- show: muestra solo cliente de esa empresa
- store: crea cliente con numero consecutivo (00001, 00002, ...), reservando 00000 para contado
- update: actualiza cliente y protege DNI del cliente contado (00000)

Codigo clave de creacion consecutiva:

```php
$maxNumber = (int) Client::where('company_id', $companyId)->max('client_number');
$nextNumber = $maxNumber + 1;

if ($nextNumber < 1) {
    $nextNumber = 1;
}

$nextNumberFormatted = str_pad((string) $nextNumber, 5, '0', STR_PAD_LEFT);
```

## 4.2 BudgetController (admin/commercial por empresa)

Archivo: backendApi/app/Http/Controllers/Api/BudgetController.php

Incluye:

- validaciones por empresa
- autorizacion por rol
- numero de presupuesto anual (YYYY-00001)
- calculo de importes por linea
- transaccion al crear
- index / show / store / update

Codigo clave de numero de presupuesto:

```php
private function generateBudgetNumber(int $companyId, string $budgetDate): string
{
    $year = date('Y', strtotime($budgetDate));

    $lastBudget = Budget::where('company_id', $companyId)
        ->where('budget_number', 'like', $year . '-%')
        ->orderByDesc('budget_number')
        ->first();

    if (!$lastBudget) {
        return $year . '-00001';
    }

    $lastSequence = (int) substr($lastBudget->budget_number, -5);
    $nextSequence = $lastSequence + 1;

    return $year . '-' . str_pad((string) $nextSequence, 5, '0', STR_PAD_LEFT);
}
```

## 4.3 PanelEmpresasController (superadmin)

Archivo: backendApi/app/Http/Controllers/Api/PanelEmpresasController.php

Actualmente incluye:

- listarEmpresas
- verEmpresa
- darDeAltaEmpresa
- actualizarEmpresa
- darDeBajaEmpresa
- reactivarEmpresa

Nota: en este estado no aparece el metodo eliminarEmpresa dentro de este controlador.

## 5) Rutas API finales

Archivo: backendApi/routes/api.php

### 5.1 Publicas

- POST /api/login
- POST /api/forgot-password
- POST /api/reset-password

### 5.2 Protegidas (auth:sanctum + company)

- GET /api/me
- POST /api/logout

### 5.3 Superadmin

- GET /api/panel/superadmin/empresas
- GET /api/panel/superadmin/empresas/{id}
- POST /api/panel/superadmin/empresas/alta
- PUT /api/panel/superadmin/empresas/{id}
- PATCH /api/panel/superadmin/empresas/{id}/baja
- PATCH /api/panel/superadmin/empresas/{id}/reactivar

### 5.4 Empresa (admin/commercial)

Clientes:

- GET /api/company/clients
- GET /api/company/clients/{id}
- POST /api/company/clients
- PUT /api/company/clients/{id}

Presupuestos:

- GET /api/company/budgets
- GET /api/company/budgets/{id}
- POST /api/company/budgets
- PUT /api/company/budgets/{id}

## 6) Factory y Seeder de clientes

## 6.1 ClientFactory

Archivo: backendApi/database/factories/ClientFactory.php

Incluye estado contado() para cliente 00000.

## 6.2 ClientSeeder

Archivo: backendApi/database/seeders/ClientSeeder.php

Logica final:

- por cada empresa crea:
  - 1 cliente contado (00000)
  - 9 clientes normales (00001 a 00009)

Codigo:

```php
Company::all()->each(function ($company) {
    Client::factory()
        ->contado()
        ->for($company)
        ->create();

    for ($i = 1; $i <= 9; $i++) {
        Client::factory()
            ->for($company)
            ->state([
                'client_number' => str_pad((string) $i, 5, '0', STR_PAD_LEFT),
            ])
            ->create();
    }
});
```

## 6.3 DatabaseSeeder

Archivo: backendApi/database/seeders/DatabaseSeeder.php

Debe llamar ClientSeeder:

```php
$this->call([
    Super_AdminSeeder::class,
    AdminSeeder::class,
    CompanyUsersSeeder::class,
    ClientSeeder::class,
    ArticleFamilySeeder::class,
    StandardArticleSeeder::class,
]);
```

### 6.4 Ejecutar seeders

```bash
php artisan db:seed
```

## 7) Middleware y permisos esperados

Reglas aplicadas en controladores:

- Solo admin o commercial para clientes y presupuestos.
- Todo filtrado por company_id del usuario logueado.
- No se puede ver ni editar datos de otra empresa.

## 8) Pruebas rapidas recomendadas

## 8.1 Cliente por empresa

1. Login con usuario Empresa A.
2. GET /api/company/clients.
3. Confirmar que no aparecen clientes de Empresa B.

## 8.2 Consecutivo de cliente

1. Crear cliente nuevo en Empresa A.
2. Revisar client_number generado.
3. Debe seguir secuencia despues de 00009.

## 8.3 Presupuesto por empresa

1. Crear presupuesto en Empresa A.
2. Confirmar que client_id pertenece a Empresa A.
3. Confirmar budget_number tipo YYYY-00001.

## 9) Comandos utiles de trabajo

```bash
# Crear migracion
php artisan make:migration create_clients_table

# Crear modelo con factory
php artisan make:model Client -f

# Crear controlador API
php artisan make:controller Api/ClientController
php artisan make:controller Api/BudgetController

# Rehacer base completa (dev)
php artisan migrate:fresh --seed
```

## 10) Checklist final backend

- [x] Tabla clients creada
- [x] Modelo Client con relaciones
- [x] ClientController con filtros por empresa
- [x] Tabla budgets creada
- [x] Tabla budget_lines creada
- [x] Modelo Budget y BudgetLine con relaciones
- [x] BudgetController con calculos y validaciones
- [x] Rutas company para clients y budgets
- [x] Factory + Seeder de clientes por empresa
- [x] Cliente contado numero 00000

---

Si quieres, el siguiente documento te lo puedo preparar igual de completo pero para frontend (servicios, paneles, formularios, modales y rutas) en el mismo formato paso a paso.
