<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;

class ContactController extends Controller
{
    public function sendEmail(Request $request)
    {
        // Aqui valido el payload de entrada para asegurar formato y limites.
        // Si falla, Laravel responde automaticamente con 422 y detalle de errores.
        $validated = $request->validate([
            'name' => 'required|string|max:120',
            'email' => 'required|email|max:180',
            'message' => 'required|string|max:3000',
        ]);

        // Aqui resuelvo el destinatario final del formulario.
        // Primero intento CONTACT_FORM_RECEIVER y, si no existe, uso mail.from.address.
        $to = env('CONTACT_FORM_RECEIVER', config('mail.from.address'));

        // Si no hay destinatario configurado, corto con error de servidor.
        if (!$to) {
            return response()->json([
                'error' => 'No hay destinatario configurado para el formulario de contacto.'
            ], 500);
        }

        try {
            // Aqui envio un correo de texto plano con los datos validados del formulario.
            // replyTo apunta al email del usuario para poder responderle directamente.
            Mail::send([], [], function ($mail) use ($validated, $to) {
                $mail->to($to)
                    ->replyTo($validated['email'], $validated['name'])
                    ->subject('Nuevo mensaje de contacto - MetricGates')
                    ->text(
                        "Nombre: {$validated['name']}\n" .
                            "Email: {$validated['email']}\n\n" .
                            "Mensaje:\n{$validated['message']}"
                    );
            });

            // Si todo va bien, confirmo al frontend que el envio fue correcto.
            return response()->json([
                'message' => 'Mensaje enviado correctamente.'
            ], 200);
        } catch (\Throwable $e) {
            // Si falla el transporte de correo, devuelvo error generico controlado.
            return response()->json([
                'error' => 'No se pudo enviar el mensaje en este momento.'
            ], 500);
        }
    }
}
