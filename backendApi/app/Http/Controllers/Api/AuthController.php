<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

class AuthController extends Controller
{
    public function login(Request $request)
    {
        // 🔎 validar
        $request->validate([
            'email' => 'required|email',
            'password' => 'required'
        ]);

        // 🔍 buscar usuario
        $user = User::where('email', $request->email)->first();

        // ❌ credenciales incorrectas
        if (!$user || !Hash::check($request->password, $user->password)) {
            return response()->json([
                'error' => 'Credenciales incorrectas'
            ], 401);
        }

        // ❌ usuario inactivo
        if (!$user->active) {
            return response()->json([
                'error' => 'Usuario inactivo'
            ], 403);
        }

        // 🔐 crear token
        $token = $user->createToken('api-token')->plainTextToken;

        return response()->json([
            'user' => $user,
            'token' => $token
        ]);
    }

    public function me(Request $request)
    {
        return response()->json($request->user());
    }

    public function logout(Request $request)
    {
        $request->user()->tokens()->delete();

        return response()->json([
            'message' => 'Logout correcto'
        ]);
    }
}
