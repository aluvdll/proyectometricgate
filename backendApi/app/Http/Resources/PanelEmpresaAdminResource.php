<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

// Aqui defino salida minima del usuario admin creado al dar de alta una empresa.
class PanelEmpresaAdminResource extends JsonResource
{
    /**
     * Transformo el admin a JSON sin exponer campos innecesarios.
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'company_id' => $this->company_id,
            'name' => $this->name,
            'email' => $this->email,
            'dni' => $this->dni,
            'phone' => $this->phone,
            'address' => $this->address,
            'city' => $this->city,
            'province' => $this->province,
            'role' => $this->role,
            'active' => (bool) $this->active,
        ];
    }
}
