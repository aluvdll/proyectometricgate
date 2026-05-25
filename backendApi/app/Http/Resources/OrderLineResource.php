<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

// Aqui defino la salida de cada linea del pedido para la pantalla de detalle.
class OrderLineResource extends JsonResource
{
    /**
     * Transformo una linea de pedido a JSON controlado.
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'article_type' => $this->article_type,
            'configurable_article_id' => $this->configurable_article_id,
            'name' => $this->name,
            'description' => $this->description,
            'quantity' => $this->quantity,
            'unit_price' => $this->unit_price,
            'total_amount' => $this->total_amount,
            'configuration' => $this->whenLoaded('configuration', function () {
                return [
                    'ancho_hueco' => $this->configuration?->ancho_hueco,
                    'alto_hueco' => $this->configuration?->alto_hueco,
                    'fabrication_measures' => $this->configuration?->fabrication_measures,
                ];
            }),
        ];
    }
}
