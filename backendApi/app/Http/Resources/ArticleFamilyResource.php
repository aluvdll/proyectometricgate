<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

// Aqui defino el contrato JSON de familias de articulos.
class ArticleFamilyResource extends JsonResource
{
    /**
     * Transformo una familia al formato JSON que usa frontend.
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'description' => $this->description,
            'active' => (bool) $this->active,
        ];
    }
}
