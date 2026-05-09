<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Company;
use Illuminate\Http\Request;
use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Mail;

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
            'role' => $user->role,
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

    /**
     * Enviar email de recuperación de contraseña
     * FORGOT PASSWORD = "Olvidé mi contraseña"
     */
    public function forgotPassword(Request $request)
    {
        // Validar email
        $request->validate([
            'email' => 'required|email|exists:users,email'
        ], [
            'email.exists' => 'No encontramos una cuenta con ese email'
        ]);

        $user = User::where('email', $request->email)->first();

        if (!$user) {
            return response()->json([
                'error' => 'Usuario no encontrado'
            ], 404);
        }

        // Generar token único
        $token = Str::random(60);

        // Guardar token en la tabla password_reset_tokens
        DB::table('password_reset_tokens')->updateOrInsert(
            ['email' => $request->email],
            [
                'token' => Hash::make($token),
                'created_at' => Carbon::now()
            ]
        );

        // Construir URL de reset

        // Construye la URL que recibirá el usuario para cambiar su contraseña.
        // Si existe FRONTEND_URL en el archivo .env la usamos,
        // y si no existe usamos http://localhost:5173 por defecto.
        // Al final añadimos el token generado para identificar
        // la solicitud de recuperación de contraseña.
        $resetUrl = env('FRONTEND_URL', 'http://localhost:5173') . '/reset-password?token=' . $token;

        // Enviar email
        try {
            Mail::send('emails.reset-password', ['url' => $resetUrl, 'user' => $user], function ($message) use ($user) {
                $message->to($user->email)
                    ->subject('Recupera tu contraseña - MetricGates');
            });

            return response()->json([
                'message' => 'Se ha enviado un correo con instrucciones para recuperar tu contraseña'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Error al enviar el email: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Cambiar contraseña con token
     */
    public function resetPassword(Request $request)
    {
        // Validar datos
        $request->validate([
            'token' => 'required|string',
            'email' => 'required|email|exists:users,email',
            'password' => 'required|string|min:6|confirmed'
        ], [
            'email.exists' => 'Usuario no encontrado',
            'password.min' => 'La contraseña debe tener al menos 6 caracteres',
            'password.confirmed' => 'Las contraseñas no coinciden'
        ]);

        $record = DB::table('password_reset_tokens')
            ->where('email', $request->email)
            ->first();

        // Verificar que el token existe
        if (!$record) {
            return response()->json([
                'error' => 'El token de recuperación es inválido o ha expirado'
            ], 400);
        }

        // Verificar que el token es válido
        if (!Hash::check($request->token, $record->token)) {
            return response()->json([
                'error' => 'El token de recuperación es inválido'
            ], 400);
        }

        // Verificar que el token no ha expirado (1 hora)
        if (Carbon::parse($record->created_at)->addHour()->isPast()) {
            DB::table('password_reset_tokens')->where('email', $request->email)->delete();

            return response()->json([
                'error' => 'El token de recuperación ha expirado'
            ], 400);
        }

        // Buscar usuario y actualizar contraseña
        $user = User::where('email', $record->email)->first();

        if (!$user) {
            return response()->json([
                'error' => 'Usuario no encontrado'
            ], 404);
        }

        // Actualizar contraseña
        $user->update([
            'password' => Hash::make($request->password)
        ]);

        // Eliminar token usado
        DB::table('password_reset_tokens')->where('email', $record->email)->delete();

        return response()->json([
            'message' => 'Contraseña actualizada correctamente'
        ]);
    }
}
