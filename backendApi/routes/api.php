<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\ArticleFamilyController;
use App\Http\Controllers\Api\BudgetController;
use App\Http\Controllers\Api\CompanyController;
use App\Http\Controllers\Api\ClientController;
use App\Http\Controllers\Api\PanelEmpresasController;
use App\Http\Controllers\Api\StandardArticleController;
use App\Http\Controllers\Api\UserController;


/*
|--------------------------------------------------------------------------
| AUTH (login público)
|--------------------------------------------------------------------------
*/

Route::post('/login', [AuthController::class, 'login']);
Route::post('/forgot-password', [AuthController::class, 'forgotPassword']);
Route::post('/reset-password', [AuthController::class, 'resetPassword']);

/*
|--------------------------------------------------------------------------
| RUTAS PROTEGIDAS (usuario logueado)
|--------------------------------------------------------------------------
*/
Route::middleware(['auth:sanctum', 'company'])->group(function () {

    // 👤 usuario logueado
    Route::get('/me', [AuthController::class, 'me']);
    Route::post('/logout', [AuthController::class, 'logout']);

    /*
    |--------------------------------------------------------------------------
    | 👑 SOLO SUPER ADMIN
    |--------------------------------------------------------------------------
    */
    Route::middleware('superadmin')->group(function () {

        // 🧭 Panel de administración de empresas (solo super admin)
        Route::prefix('/panel/superadmin/empresas')->group(function () {
            Route::get('/', [PanelEmpresasController::class, 'listarEmpresas']);
            Route::get('/{id}', [PanelEmpresasController::class, 'verEmpresa']);
            Route::post('/alta', [PanelEmpresasController::class, 'darDeAltaEmpresa']);
            Route::put('/{id}', [PanelEmpresasController::class, 'actualizarEmpresa']);
            Route::patch('/{id}/baja', [PanelEmpresasController::class, 'darDeBajaEmpresa']);
            Route::patch('/{id}/reactivar', [PanelEmpresasController::class, 'reactivarEmpresa']);
        });

        // 🏢 CRUD empresas (solo super admin)
        // Ruta para obtener compñias (todas o por id)
        Route::get('/companies', [CompanyController::class, 'index']);
        Route::get('/companies/{id}', [CompanyController::class, 'show']);
        //Rutas para crear, actualizar y eliminar empresas. Para eliminar una empresa, primero se eliminan todos los usuarios asociados a esa empresa y luego se elimina la empresa. Esto se hace para evitar problemas de integridad referencial en la base de datos. Si intentamos eliminar una empresa que tiene usuarios asociados, la base de datos nos dará un error porque esos usuarios todavía están referenciando a la empresa que estamos intentando eliminar. Al eliminar primero los usuarios, nos aseguramos de que no haya referencias a la empresa antes de eliminarla.
        Route::post('/companies', [CompanyController::class, 'store']);
        Route::put('/companies/{id}', [CompanyController::class, 'update']);
        Route::delete('/companies/{id}', [CompanyController::class, 'destroy']);
        //Para crear usuarios dentro de la empresa, el super admin primero crea la empresa y luego el admin de esa empresa se encarga de crear los usuarios dentro de su empresa. Por eso no hay rutas de usuarios para el super admin, solo para el admin de la empresa.
        Route::post('/users', [UserController::class, 'store']);
        Route::get('/users', [UserController::class, 'index']);
        //Ruta para eliminar usuario de la empresa
        Route::delete('/users/{id}', [UserController::class, 'destroy']);
    });

    /*
    |--------------------------------------------------------------------------
    | 🏢 EMPRESAS (usuarios normales dentro de empresa)
    |--------------------------------------------------------------------------
    */
    Route::middleware('company')->group(function () {

        // Rutas para que el admin de la empresa pueda gestionar sus usuarios dentro de su empresa
        Route::get('/company/users', [UserController::class, 'companyUsers']);
        Route::get('/company/users/{id}', [UserController::class, 'showByCompany']);
        Route::post('/company/users', [UserController::class, 'storeByCompany']);
        Route::put('/company/users/{id}', [UserController::class, 'updateByCompany']);
        Route::delete('/company/users/{id}', [UserController::class, 'destroyByCompany']);

        // Rutas para clientes de la empresa (admin o commercial)
        Route::get('/company/clients', [ClientController::class, 'index']);
        Route::get('/company/clients/{id}', [ClientController::class, 'show']);
        Route::post('/company/clients', [ClientController::class, 'store']);
        Route::put('/company/clients/{id}', [ClientController::class, 'update']);

        // Rutas para presupuestos de la empresa (admin o commercial)
        Route::get('/company/budgets', [BudgetController::class, 'index']);
        Route::get('/company/budgets/{id}', [BudgetController::class, 'show']);
        Route::post('/company/budgets', [BudgetController::class, 'store']);
        Route::put('/company/budgets/{id}', [BudgetController::class, 'update']);

        // Rutas para artículos estándar de la empresa
        // Familias de artículos: ver (admin/commercial), crear/editar (solo admin)
        Route::get('/company/article-families', [ArticleFamilyController::class, 'index']);
        Route::get('/company/article-families/{id}', [ArticleFamilyController::class, 'show']);
        Route::post('/company/article-families', [ArticleFamilyController::class, 'store']);
        Route::put('/company/article-families/{id}', [ArticleFamilyController::class, 'update']);

        // Ver (admin/commercial)
        Route::get('/company/articles', [StandardArticleController::class, 'index']);
        Route::get('/company/articles/{id}', [StandardArticleController::class, 'show']);
        // Crear y editar (solo admin)
        Route::post('/company/articles', [StandardArticleController::class, 'store']);
        Route::put('/company/articles/{id}', [StandardArticleController::class, 'update']);

        Route::get('/products', function () {
            return 'productos de la empresa';
        });
    });
});
