<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

// Aqui defino el contrato JSON de detalle de pedido.
// Incluyo solo los campos que hoy consume el frontend en detalle.
class OrderResource extends JsonResource
{
    /**
     * Transformo el pedido en un array JSON de detalle.
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'order_number' => $this->order_number,
            'order_date' => $this->order_date,
            'delivery_date' => $this->delivery_date,
            'status' => $this->status,
            'total_amount' => $this->total_amount,
            'client' => $this->whenLoaded('client', function () {
                return [
                    'id' => $this->client?->id,
                    'nombre' => $this->client?->nombre,
                ];
            }),
            'lines' => OrderLineResource::collection($this->whenLoaded('lines')),
        ];
    }
}
