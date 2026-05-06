<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\CompanyController;

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
Route::middleware('auth:sanctum')->group(function () {

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
        Route::get('/companies', [CompanyController::class, 'index']);
        Route::get('/companies/{id}', [CompanyController::class, 'show']);
        Route::post('/companies', [CompanyController::class, 'store']);
        Route::put('/companies/{id}', [CompanyController::class, 'update']);
        Route::delete('/companies/{id}', [CompanyController::class, 'destroy']);
    });

    /*
    |--------------------------------------------------------------------------
    | 🏢 EMPRESAS (usuarios normales dentro de empresa)
    |--------------------------------------------------------------------------
    */
    Route::middleware('company')->group(function () {

        // ejemplo futuro
        Route::get('/clients', function () {
            return 'clientes de la empresa';
        });

        Route::get('/products', function () {
            return 'productos de la empresa';
        });
    });
});