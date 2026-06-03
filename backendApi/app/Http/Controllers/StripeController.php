<?php

namespace App\Http\Controllers;

use App\Models\Company;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Stripe\Stripe;
use Stripe\Checkout\Session;
use Stripe\Webhook;

class StripeController extends Controller
{
    // Yo recibo y valido el webhook de Stripe para confirmar eventos de pago de forma segura.
    public function webhook(Request $request)
    {
        $payload = $request->getContent();

        $sig_header = $request->server('HTTP_STRIPE_SIGNATURE');

        $endpoint_secret = config('services.stripe.webhook_secret');

        try {

            $event = Webhook::constructEvent(
                $payload,
                $sig_header,
                $endpoint_secret
            );
        } catch (\UnexpectedValueException $e) {

            return response()->json([
                'error' => 'Payload inválido'
            ], 400);
        } catch (\Stripe\Exception\SignatureVerificationException $e) {

            return response()->json([
                'error' => 'Firma inválida'
            ], 400);
        }

        // PAGO EXITOSO
        if ($event->type === 'checkout.session.completed') {

            $session = $event->data->object;

            // DEBUG
            Log::info('Pago completado Stripe', [
                'session_id' => $session->id,
                'email' => $session->customer_details->email ?? null,
                'amount' => $session->amount_total / 100
            ]);

        }

        return response()->json([
            'status' => 'ok'
        ]);
    }

    // Yo creo una sesion de Checkout en Stripe segun el plan seleccionado y devuelvo la URL de pago.
    public function checkout(Request $request)
    {
        // Cargo la clave secreta de Stripe para autenticar las llamadas al API desde el backend.
        Stripe::setApiKey(config('services.stripe.secret'));

        $plans = config('services.stripe.plans', []);
        $defaultPlan = array_key_first($plans) ?: 'basica';
        $requestedPlan = $request->input('plan', $defaultPlan);

        if (!array_key_exists($requestedPlan, $plans)) {
            return response()->json([
                'message' => 'Plan no válido.',
                'available_plans' => array_keys($plans),
            ], 422);
        }

        $producto = $plans[$requestedPlan];

        $successUrl = $this->appendSessionIdPlaceholder(config('services.stripe.success_url'));

        $session = Session::create([
            'line_items' => [[
                'price_data' => [
                    'currency' => 'eur',
                    'product_data' => [
                        'name' => $producto['name'],
                    ],
                    'unit_amount' => $producto['amount'],
                ],
                'quantity' => 1,
            ]],
            'mode' => 'payment',
            'success_url' => $successUrl,
            'cancel_url' => config('services.stripe.cancel_url'),
            'metadata' => [
                'plan_key' => $requestedPlan,
                'plan_name' => $producto['name'],
                'plan_amount' => (string) $producto['amount'],
            ],
        ]);

        return response()->json([
            'id' => $session->id,
            'url' => $session->url,
        ]);
    }

    // Yo verifico que la sesion pagada sea valida y envio el correo con el enlace de registro de empresa.
    public function confirmPaymentAndSendRegistrationEmail(Request $request)
    {
        // Valido que me llegue session_id y que tenga formato de texto antes de consultar Stripe.
        $validated = $request->validate([
            'session_id' => 'required|string',
        ]);

        Stripe::setApiKey(config('services.stripe.secret'));

        try {
            $session = Session::retrieve($validated['session_id']);
        } catch (\Throwable $e) {
            return response()->json([
                'message' => 'No se pudo verificar la sesión de pago.',
            ], 422);
        }

        if (($session->payment_status ?? null) !== 'paid') {
            return response()->json([
                'message' => 'El pago aún no aparece como completado.',
            ], 409);
        }

        $cacheKey = 'stripe_registration_email_sent_' . $session->id;
        if (Cache::has($cacheKey)) {
            return response()->json([
                'message' => 'Correo de registro ya enviado para esta sesión.',
                'already_sent' => true,
            ]);
        }

        $customerEmail = data_get($session, 'customer_details.email')
            ?? data_get($session, 'customer_email');

        if (!$customerEmail) {
            return response()->json([
                'message' => 'No se encontró un email del cliente en la sesión.',
            ], 422);
        }

        $planName = data_get($session, 'metadata.plan_name', 'Plan contratado');
        $amountCents = (int) data_get($session, 'amount_total', 0);
        $amountEuros = number_format($amountCents / 100, 2, ',', '.');
        $frontendUrl = rtrim(env('FRONTEND_URL', 'http://localhost:5173'), '/');

        $registrationToken = Str::random(64);
        $registrationTokenCacheKey = 'stripe_registration_token_' . $registrationToken;
        $registrationFormUrl = $frontendUrl . '/registro-empresa?token=' . $registrationToken;

        Cache::put($registrationTokenCacheKey, [
            'session_id' => $session->id,
            'customer_email' => $customerEmail,
            'plan_name' => $planName,
            'amount_cents' => $amountCents,
        ], now()->addDays(7));

        try {
            Mail::send('emails.company-registration', [
                'planName' => $planName,
                'amountEuros' => $amountEuros,
                'customerEmail' => $customerEmail,
                'registrationFormUrl' => $registrationFormUrl,
            ], function ($message) use ($customerEmail) {
                $message->to($customerEmail)
                    ->subject('MetricGates - Registro de empresa tras pago');
            });
        } catch (\Throwable $e) {
            Log::error('Error enviando email de registro tras pago', [
                'session_id' => $session->id,
                'error' => $e->getMessage(),
            ]);

            return response()->json([
                'message' => 'Pago verificado, pero falló el envío del correo.',
            ], 500);
        }

        Cache::put($cacheKey, true, now()->addDays(2));

        return response()->json([
            'message' => 'Pago verificado y correo de registro enviado.',
            'email' => $customerEmail,
        ]);
    }

    // Yo valido el token de registro y devuelvo los datos del pago para rellenar la pantalla de registro.
    public function registrationInfo(Request $request)
    {
        $validated = $request->validate([
            'token' => 'required|string',
        ]);

        $registration = Cache::get('stripe_registration_token_' . $validated['token']);

        if (!$registration) {
            return response()->json([
                'message' => 'El enlace de registro es inválido o ha expirado.',
            ], 404);
        }

        $completedCacheKey = 'stripe_registration_completed_' . $registration['session_id'];
        if (Cache::has($completedCacheKey)) {
            return response()->json([
                'message' => 'Este registro ya se completó anteriormente.',
                'already_completed' => true,
            ], 409);
        }

        return response()->json([
            'customer_email' => $registration['customer_email'],
            'plan_name' => $registration['plan_name'],
            'amount_euros' => number_format(((int) $registration['amount_cents']) / 100, 2, ',', '.'),
        ]);
    }

    //completo el alta de empresa y administrador usando el token emitido tras un pago correcto.

    public function completeRegistration(Request $request)
    {
        $validated = $request->validate([
            'token' => 'required|string',

            'fiscal_name' => 'required|string|max:255',
            'commercial_name' => 'nullable|string|max:255',
            'cif_nif' => 'required|string|max:50|unique:companies,cif_nif',
            'logo' => 'nullable|image|mimes:jpg,jpeg,png,webp|max:5120',
            'email' => 'required|email|unique:companies,email',
            'address' => 'required|string|max:255',
            'phone' => 'required|string|max:20',
            'phone2' => 'nullable|string|max:20',
            'city' => 'required|string|max:100',
            'province' => 'required|string|max:100',
            'postal_code' => 'required|string|max:20',

            'admin_name' => 'required|string|max:255',
            'admin_email' => 'required|email|same:admin_email_confirmation|unique:users,email',
            'admin_email_confirmation' => 'required|email',
            'admin_password' => 'required|string|min:6|confirmed',
            'admin_password_confirmation' => 'required|string|min:6',
            'admin_dni' => 'required|string|unique:users,dni',
            'admin_phone' => 'nullable|string|max:20',
            'admin_address' => 'nullable|string|max:255',
            'admin_city' => 'nullable|string|max:100',
            'admin_province' => 'nullable|string|max:100',
        ], [
            'required' => 'El campo :attribute es obligatorio.',
            'string' => 'El campo :attribute debe ser un texto válido.',
            'email' => 'El campo :attribute debe ser un correo electrónico válido.',
            'max' => 'El campo :attribute no puede tener más de :max caracteres.',
            'min' => 'El campo :attribute debe tener al menos :min caracteres.',
            'unique' => 'El campo :attribute ya está registrado.',
            'token.required' => 'Falta el token de registro.',
            'token.string' => 'El token de registro no es válido.',
            'admin_email.same' => 'El email del administrador y su confirmación deben coincidir.',
            'admin_password.confirmed' => 'La contraseña del administrador y su confirmación deben coincidir.',
            'admin_dni.unique' => 'El DNI del administrador ya está registrado.',
        ], [
            'token' => 'token de registro',
            'fiscal_name' => 'nombre fiscal',
            'commercial_name' => 'nombre comercial',
            'cif_nif' => 'CIF/NIF',
            'logo' => 'logo de empresa',
            'email' => 'email de empresa',
            'address' => 'dirección',
            'phone' => 'teléfono',
            'phone2' => 'teléfono secundario',
            'city' => 'ciudad',
            'province' => 'provincia',
            'postal_code' => 'código postal',
            'admin_name' => 'nombre del administrador',
            'admin_email' => 'email del administrador',
            'admin_email_confirmation' => 'confirmación del email del administrador',
            'admin_password' => 'contraseña del administrador',
            'admin_password_confirmation' => 'confirmación de contraseña del administrador',
            'admin_dni' => 'DNI del administrador',
            'admin_phone' => 'teléfono del administrador',
            'admin_address' => 'dirección del administrador',
            'admin_city' => 'ciudad del administrador',
            'admin_province' => 'provincia del administrador',
        ]);

        $tokenCacheKey = 'stripe_registration_token_' . $validated['token'];
        $registration = Cache::get($tokenCacheKey);

        if (!$registration) {
            return response()->json([
                'message' => 'El enlace de registro es inválido o ha expirado.',
            ], 404);
        }

        $completedCacheKey = 'stripe_registration_completed_' . $registration['session_id'];
        if (Cache::has($completedCacheKey)) {
            return response()->json([
                'message' => 'Este registro ya se completó anteriormente.',
            ], 409);
        }

        if (strcasecmp($validated['admin_email'], $registration['customer_email']) !== 0) {
            return response()->json([
                'message' => 'El email del administrador debe coincidir con el email usado en el pago.',
            ], 422);
        }

        $logoPath = null;
        if ($request->hasFile('logo')) {
            $logoPath = $request->file('logo')->store('company-logos', 'local');

            if ($logoPath === false) {
                return response()->json([
                    'message' => 'No se pudo guardar el logo de la empresa.',
                ], 500);
            }
        }

        try {
            $resultado = DB::transaction(function () use ($validated, $registration, $logoPath) {
                $maxUsers = stripos($registration['plan_name'] ?? '', 'extendida') !== false ? 25 : 5;

                $empresa = Company::create([
                    'fiscal_name' => $validated['fiscal_name'],
                    'commercial_name' => $validated['commercial_name'] ?? null,
                    'cif_nif' => $validated['cif_nif'],
                    'email' => $validated['email'],
                    'address' => $validated['address'],
                    'phone' => $validated['phone'],
                    'phone2' => $validated['phone2'] ?? null,
                    'city' => $validated['city'],
                    'province' => $validated['province'],
                    'postal_code' => $validated['postal_code'],
                    'logo' => $logoPath,
                    'active' => true,
                    'max_users' => $maxUsers,
                ]);

                $administrador = User::create([
                    'company_id' => $empresa->id,
                    'name' => $validated['admin_name'],
                    'email' => $validated['admin_email'],
                    'password' => Hash::make($validated['admin_password']),
                    'dni' => $validated['admin_dni'],
                    'phone' => $validated['admin_phone'] ?? '',
                    'address' => $validated['admin_address'] ?? '',
                    'city' => $validated['admin_city'] ?? '',
                    'province' => $validated['admin_province'] ?? '',
                    'role' => 'admin',
                    'active' => true,
                ]);

                return [
                    'empresa' => $empresa,
                    'administrador' => $administrador,
                ];
            });
        } catch (\Throwable $e) {
            if ($logoPath) {
                Storage::disk('local')->delete($logoPath);
            }

            throw $e;
        }

        Cache::forget($tokenCacheKey);
        Cache::put($completedCacheKey, true, now()->addDays(30));

        return response()->json([
            'message' => 'Empresa registrada correctamente. Ya puedes iniciar sesión.',
            'company_id' => $resultado['empresa']->id,
            'admin_email' => $resultado['administrador']->email,
        ], 201);
    }

    // Yo agrego el placeholder de session_id a la URL de exito si todavia no esta incluido.
    private function appendSessionIdPlaceholder(string $url): string
    {
        if (str_contains($url, '{CHECKOUT_SESSION_ID}')) {
            return $url;
        }

        $separator = str_contains($url, '?') ? '&' : '?';

        return $url . $separator . 'session_id={CHECKOUT_SESSION_ID}';
    }
}
