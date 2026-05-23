<!DOCTYPE html>
<html lang="es">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Registro de empresa</title>
</head>

<body style="font-family: Arial, sans-serif; color: #1f2937; line-height: 1.5;">
    <h2 style="margin-bottom: 8px;">Pago confirmado en MetricGates</h2>

    <p>
        Hemos confirmado tu pago correctamente.
    </p>

    <ul>
        <li><strong>Plan:</strong> {{ $planName }}</li>
        <li><strong>Importe:</strong> {{ $amountEuros }} EUR</li>
        <li><strong>Email de pago:</strong> {{ $customerEmail }}</li>
    </ul>

    <p>
        Para completar el registro de tu empresa, haz clic en este enlace seguro:
    </p>

    <p>
        <a href="{{ $registrationFormUrl }}">Completar registro de empresa</a>
    </p>

    <p>
        Este enlace caduca automaticamente por seguridad.
    </p>

    <p style="margin-top: 18px;">Gracias por confiar en MetricGates.</p>
</body>

</html>