<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\CompanyController;
use App\Http\Controllers\Api\UserController;

/*
|--------------------------------------------------------------------------
| AUTH (login público)
|--------------------------------------------------------------------------
*/

Route::post('/login', [AuthController::class, 'login']);

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
        Route::post('/company/users', [UserController::class, 'storeByCompany']);
        Route::put('/company/users/{id}', [UserController::class, 'updateByCompany']);
        Route::delete('/company/users/{id}', [UserController::class, 'destroyByCompany']);

        // ejemplo futuro
        Route::get('/clients', function () {
            return 'clientes de la empresa';
        });

        Route::get('/products', function () {
            return 'productos de la empresa';
        });
    });
});
