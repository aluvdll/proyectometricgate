<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

// Este Resource define el formato de salida de un cliente en la API.
// Así mantenemos contrato estable con frontend aunque cambie el modelo internamente.
class ClientResource extends JsonResource
{
    /**
     * Convierte el modelo Client en array JSON controlado.
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'company_id' => $this->company_id,
            'client_number' => $this->client_number,
            'dni' => $this->dni,
            'nombre' => $this->nombre,
            'direccion' => $this->direccion,
            'poblacion' => $this->poblacion,
            'codigo_postal' => $this->codigo_postal,
            'provincia' => $this->provincia,
            'telefono' => $this->telefono,
            'telefono2' => $this->telefono2,
            'email' => $this->email,
            'active' => (bool) $this->active,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
