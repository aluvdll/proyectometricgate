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
    public function handle(Request $request, Closure $next): Response
    {
        $user = Auth::user();

        // 🔐 no autenticado
        if (!$user) {
            return response()->json([
                'error' => 'No autenticado'
            ], 401);
        }

        // 👑 solo super admin
        if ($user->role !== 'super_admin') {
            return response()->json([
                'error' => 'No autorizado. Solo super admin'
            ], 403);
        }

        return $next($request);
    }
}