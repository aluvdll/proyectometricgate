<!DOCTYPE html>
<html lang="es">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Recuperar Contraseña - MetricGates</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif;
            background-color: #f5f5f5;
            margin: 0;
            padding: 20px;
        }

        .container {
            max-width: 600px;
            margin: 0 auto;
            background-color: white;
            border-radius: 8px;
            overflow: hidden;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }

        .header {
            background: linear-gradient(135deg, #f97316 0%, #ea580c 100%);
            color: white;
            padding: 30px 20px;
            text-align: center;
        }

        .header h1 {
            margin: 0;
            font-size: 28px;
            font-weight: bold;
        }

        .content {
            padding: 30px;
        }

        .content h2 {
            color: #333;
            font-size: 20px;
            margin-top: 0;
        }

        .content p {
            color: #666;
            line-height: 1.6;
            margin: 15px 0;
        }

        .button-container {
            text-align: center;
            margin: 30px 0;
        }

        .button {
            display: inline-block;
            background: linear-gradient(135deg, #f97316 0%, #ea580c 100%);
            color: white;
            padding: 12px 30px;
            border-radius: 6px;
            text-decoration: none;
            font-weight: bold;
            font-size: 16px;
        }

        .button:hover {
            background: linear-gradient(135deg, #ea580c 0%, #d94a07 100%);
        }

        .link-container {
            background-color: #f9fafb;
            padding: 15px;
            border-radius: 6px;
            margin: 20px 0;
            word-break: break-all;
        }

        .link-container p {
            color: #666;
            font-size: 12px;
            margin: 5px 0 10px 0;
        }

        .link-container a {
            color: #f97316;
            text-decoration: none;
            font-size: 12px;
        }

        .footer {
            background-color: #f9fafb;
            border-top: 1px solid #e5e7eb;
            padding: 20px;
            text-align: center;
            color: #999;
            font-size: 12px;
        }

        .warning {
            background-color: #fef3c7;
            border-left: 4px solid #f97316;
            padding: 15px;
            margin: 20px 0;
            border-radius: 4px;
        }

        .warning p {
            margin: 5px 0;
            color: #92400e;
        }
    </style>
</head>

<body>
    <div class="container">
        <div class="header">
            <h1>🔐 Recupera tu Contraseña</h1>
        </div>

        <div class="content">
            <h2>Hola {{ $user->name }},</h2>

            <p>Hemos recibido una solicitud para cambiar la contraseña de tu cuenta en <strong>MetricGates</strong>.</p>

            <p>Si fue tuyo este cambio, haz clic en el botón de abajo para establer una nueva contraseña:</p>

            <div class="button-container">
                <a href="{{ $url }}" class="button">Cambiar Contraseña</a>
            </div>

            <p>O copia este link en tu navegador:</p>

            <div class="link-container">
                <p><strong>Link de recuperación:</strong></p>
                <a href="{{ $url }}">{{ $url }}</a>
            </div>

            <div class="warning">
                <p><strong>⚠️ Seguridad importante:</strong></p>
                <p>• Este link expirará en <strong>1 hora</strong></p>
                <p>• Si no solicitaste cambiar tu contraseña, ignora este correo</p>
                <p>• Nunca compartas este link con nadie</p>
            </div>

            <p>Si tienes problemas, contacta con nuestro equipo de soporte.</p>

            <p>
                Saludos,<br>
                <strong>El equipo de MetricGates</strong>
            </p>
        </div>

        <div class="footer">
            <p>Este es un correo automático, por favor no respondas a este mensaje.</p>
            <p>&copy; {{ date('Y') }} MetricGates. Todos los derechos reservados.</p>
        </div>
    </div>
</body>

</html>