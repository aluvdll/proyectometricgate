<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    // Este provider se carga al arrancar NO LO UTILIZO CON SUS FUNCIONES la aplicacion.
    // Aqui suelo registrar bindings globales del contenedor IoC.
    /**
     * Register any application services.
     */
    public function register(): void
    {
        // Aqui iria el registro de servicios del contenedor IoC.
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        // Aqui iria la inicializacion global de la aplicacion.
    }
}
