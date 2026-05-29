<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;
use Illuminate\Support\Facades\Auth;

class EnsureSuperAdmin
{
    /**
     * Handle an incoming request.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    // Aqui valido que solo entre un super_admin; si no cumple, devuelvo 401 o 403.
    // Closure $next es la funcion callback que pasa la request al siguiente middleware o al controlador.
    public function handle(Request $request, Closure $next): Response
    {
        $user = Auth::user();

        // Si no hay usuario logueado, corto aqui y devuelvo 401.
        if (!$user) {
            return response()->json([
                'error' => 'No autenticado'
            ], 401);
        }

        // Este middleware deja pasar solo a super_admin; el resto recibe 403.
        if ($user->role !== 'super_admin') {
            return response()->json([
                'error' => 'No autorizado. Solo super admin'
            ], 403);
        }

        return $next($request);
    }
}
