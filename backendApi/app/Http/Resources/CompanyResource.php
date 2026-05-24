<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

// Este Resource me sirve para controlar como sale una empresa en la API.
// Asi mantengo un contrato estable aunque cambie algo interno del modelo.
class CompanyResource extends JsonResource
{
    /**
     * Aqui transformo el modelo Company a un array JSON limpio y consistente.
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'fiscal_name' => $this->fiscal_name,
            'commercial_name' => $this->commercial_name,
            'cif_nif' => $this->cif_nif,
            'email' => $this->email,
            'address' => $this->address,
            'phone' => $this->phone,
            'phone2' => $this->phone2,
            'city' => $this->city,
            'province' => $this->province,
            'postal_code' => $this->postal_code,
            'logo' => $this->logo,
            'active' => (bool) $this->active,
            'max_users' => $this->max_users,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
