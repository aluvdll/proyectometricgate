<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

// Aqui defino salida de detalle de empresa para operaciones del panel superadmin.
class PanelEmpresaResource extends JsonResource
{
    /**
     * Transformo una empresa al JSON de detalle.
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
            'max_users' => $this->max_users,
            'active' => (bool) $this->active,
        ];
    }
}
