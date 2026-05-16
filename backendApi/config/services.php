<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Third Party Services
    |--------------------------------------------------------------------------
    |
    | This file is for storing the credentials for third party services such
    | as Mailgun, Postmark, AWS and more. This file provides the de facto
    | location for this type of information, allowing packages to have
    | a conventional file to locate the various service credentials.
    |
    */

    'postmark' => [
        'key' => env('POSTMARK_API_KEY'),
    ],

    'resend' => [
        'key' => env('RESEND_API_KEY'),
    ],

    'ses' => [
        'key' => env('AWS_ACCESS_KEY_ID'),
        'secret' => env('AWS_SECRET_ACCESS_KEY'),
        'region' => env('AWS_DEFAULT_REGION', 'us-east-1'),
    ],

    'slack' => [
        'notifications' => [
            'bot_user_oauth_token' => env('SLACK_BOT_USER_OAUTH_TOKEN'),
            'channel' => env('SLACK_BOT_USER_DEFAULT_CHANNEL'),
        ],
    ],

    'stripe' => [
        'key' => env('STRIPE_KEY'),
        'secret' => env('STRIPE_SECRET'),
        'webhook_secret' => env('STRIPE_WEBHOOK_SECRET'),
        'success_url' => env('STRIPE_SUCCESS_URL', env('FRONTEND_URL', 'http://localhost:5173') . '/pago-aceptado'),
        'cancel_url' => env('STRIPE_CANCEL_URL', env('FRONTEND_URL', 'http://localhost:5173') . '/pago-cancelado'),
        'plans' => [
            'basica' => [
                'name' => env('STRIPE_PLAN_BASICA_NAME', 'Plan Basica'),
                'amount' => (int) env('STRIPE_PLAN_BASICA_AMOUNT', 15000),
            ],
            'extendida' => [
                'name' => env('STRIPE_PLAN_EXTENDIDA_NAME', 'Plan Extendida'),
                'amount' => (int) env('STRIPE_PLAN_EXTENDIDA_AMOUNT', 12500),
            ],
        ],
    ],

];
