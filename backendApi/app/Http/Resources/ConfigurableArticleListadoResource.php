<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

// Aqui defino la salida minima para el listado de articulos configurables.
// Solo envio lo que consume el panel de articulos en la pestaña configurable.
class ConfigurableArticleListadoResource extends JsonResource
{
    /**
     * Transformo un articulo configurable en un array JSON de listado.
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'code' => $this->code,
            'name' => $this->name,
            'description' => $this->description,
            'tax_percentage' => $this->tax_percentage,
            'active' => (bool) $this->active,
        ];
    }
}
