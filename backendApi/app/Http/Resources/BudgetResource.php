<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

// Aqui defino la salida de detalle del presupuesto (show/store/update).
// Mantengo solo los campos que hoy consume frontend para editar e imprimir.
class BudgetResource extends JsonResource
{
    /**
     * Transformo el presupuesto a JSON de detalle.
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'client_id' => $this->client_id,
            'budget_number' => $this->budget_number,
            'budget_date' => $this->budget_date,
            'status' => $this->status,
            'base_amount' => $this->base_amount,
            'tax_amount' => $this->tax_amount,
            'total_amount' => $this->total_amount,
            'notes' => $this->notes,
            'client' => $this->whenLoaded('client', function () {
                return [
                    'id' => $this->client?->id,
                    'client_number' => $this->client?->client_number,
                    'nombre' => $this->client?->nombre,
                    'dni' => $this->client?->dni,
                    'telefono' => $this->client?->telefono,
                    'direccion' => $this->client?->direccion,
                    'codigo_postal' => $this->client?->codigo_postal,
                    'poblacion' => $this->client?->poblacion,
                    'provincia' => $this->client?->provincia,
                    'email' => $this->client?->email,
                ];
            }),
            'lines' => BudgetLineResource::collection($this->whenLoaded('lines')),
        ];
    }
}
