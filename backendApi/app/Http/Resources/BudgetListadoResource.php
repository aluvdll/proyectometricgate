<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

// Aqui defino la salida minima para el listado de presupuestos del panel.
// Lo dejo ligero para no enviar campos que en esa pantalla no se usan.
class BudgetListadoResource extends JsonResource
{
    /**
     * Transformo el presupuesto a un array JSON minimo para listado.
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'budget_number' => $this->budget_number,
            'budget_date' => $this->budget_date,
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
