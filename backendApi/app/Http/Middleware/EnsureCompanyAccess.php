<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;
use Illuminate\Support\Facades\Auth;

class EnsureCompanyAccess
{
    /**
     * Handle an incoming request.
     *
     * @param  Closure(Request): (Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
         $user = Auth::user();

        // 🔐 si no hay usuario autenticado
        if (!$user) {
            return response()->json(['error' => 'No autenticado'], 401);
        }

        // 👑 super admin: acceso total
        if ($user->role === 'super_admin') {
            return $next($request);
        }

        // 🏢 usuarios empresa deben tener company_id
        if (!$user->company_id) {
            return response()->json(['error' => 'Sin empresa asignada'], 403);
        }

        // 📦 guardamos contexto de empresa (MUY ÚTIL)
        $request->merge([
            'company_id' => $user->company_id
        ]);

        return $next($request);
    }
}
