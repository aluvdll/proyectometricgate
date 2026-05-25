<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

// Aqui defino salida minima de empresas para la tabla del panel superadmin.
class PanelEmpresaListadoResource extends JsonResource
{
    /**
     * Transformo una empresa al JSON de listado.
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'fiscal_name' => $this->fiscal_name,
            'email' => $this->email,
            'city' => $this->city,
            'active' => (bool) $this->active,
        ];
    }
}
