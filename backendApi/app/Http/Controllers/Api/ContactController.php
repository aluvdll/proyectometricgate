<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;

class ContactController extends Controller
{
    public function sendEmail(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:120',
            'email' => 'required|email|max:180',
            'message' => 'required|string|max:3000',
        ]);

        $to = env('CONTACT_FORM_RECEIVER', config('mail.from.address'));

        if (!$to) {
            return response()->json([
                'error' => 'No hay destinatario configurado para el formulario de contacto.'
            ], 500);
        }

        try {
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

            return response()->json([
                'message' => 'Mensaje enviado correctamente.'
            ], 200);
        } catch (\Throwable $e) {
            return response()->json([
                'error' => 'No se pudo enviar el mensaje en este momento.'
            ], 500);
        }
    }
}
