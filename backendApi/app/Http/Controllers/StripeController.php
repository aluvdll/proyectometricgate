<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Stripe\Stripe;
use Stripe\Checkout\Session;

class StripeController extends Controller
{
    public function checkout(Request $request)
    {
        Stripe::setApiKey(config('services.stripe.secret'));

        $plan = $request->input('plan', 'basica');

        $products = [
            'basica' => [
                'name' => 'Plan Basica',
                'amount' => 15000,
            ],
            'extendida' => [
                'name' => 'Plan Extendida',
                'amount' => 12500,
            ],
        ];

        $producto = $products[$plan] ?? $products['basica'];

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
            'success_url' => 'http://localhost:5173/pago-aceptado',
            'cancel_url' => 'http://localhost:5173/pago-cancelado',
        ]);

        return response()->json([
            'id' => $session->id,
            'url' => $session->url,
        ]);
    }
}
