<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

// Aqui defino el contrato JSON de articulos estandar para panel y formularios.
class StandardArticleResource extends JsonResource
{
    /**
     * Transformo un articulo estandar al JSON que consume frontend.
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'family_id' => $this->family_id,
            'code' => $this->code,
            'name' => $this->name,
            'description' => $this->description,
            'image' => $this->image,
            'base_price' => $this->base_price,
            'tax_percentage' => $this->tax_percentage,
            'active' => (bool) $this->active,
            'family' => $this->whenLoaded('family', function () {
                return [
                    'id' => $this->family?->id,
                    'name' => $this->family?->name,
                ];
            }),
        ];
    }
}
