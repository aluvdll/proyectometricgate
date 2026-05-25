<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

// Aqui defino la salida de cada linea del presupuesto.
// Incluyo solo lo necesario para editar e imprimir sin enviar ruido extra.
class BudgetLineResource extends JsonResource
{
    /**
     * Transformo una linea en formato JSON controlado.
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'standard_article_id' => $this->standard_article_id,
            'configurable_article_id' => $this->configurable_article_id,
            'article_type' => $this->article_type,
            'name' => $this->name,
            'description' => $this->description,
            'quantity' => $this->quantity,
            'unit_price' => $this->unit_price,
            'discount_percentage' => $this->discount_percentage,
            'tax_percentage' => $this->tax_percentage,
            'total_amount' => $this->total_amount,
            'position' => $this->position,
            'configuration' => $this->whenLoaded('configuration', function () {
                return [
                    'ancho_hueco' => $this->configuration?->ancho_hueco,
                    'alto_hueco' => $this->configuration?->alto_hueco,
                    'ancho_obra' => $this->configuration?->ancho_obra,
                    'alto_obra' => $this->configuration?->alto_obra,
                    'paso_deseado' => $this->configuration?->paso_deseado,
                    'options_chosen' => $this->configuration?->options_chosen,
                    'price_breakdown' => $this->configuration?->price_breakdown,
                    'fabrication_measures' => $this->configuration?->fabrication_measures,
                ];
            }),
        ];
    }
}
