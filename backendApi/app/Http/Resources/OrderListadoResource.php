<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

// Aqui defino la salida minima para el listado de pedidos.
// Solo envio lo que usa el panel para evitar payload innecesario.
class OrderListadoResource extends JsonResource
{
    /**
     * Transformo un pedido en el formato JSON de listado.
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'order_number' => $this->order_number,
            'order_date' => $this->order_date,
            'status' => $this->status,
            'total_amount' => $this->total_amount,
            'client' => $this->whenLoaded('client', function () {
                return [
                    'nombre' => $this->client?->nombre,
                ];
            }),
        ];
    }
}
