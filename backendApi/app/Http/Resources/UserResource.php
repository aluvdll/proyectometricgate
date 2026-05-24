<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

// Este Resource sirve para definir cómo se devuelve un usuario en la API.
// Aquí decido qué campos mostrar y con que formato.
//
// Tener esta capa intermedia me ayda a desacoplar backend y frontend.
// Así puedo cambiar campos internos de la base de datos o del modelo
// sin romper el frontend, porque la API siempre devuelve el mismo formato.
//
// También facilita mantener versiones de la API y controlar exactamente
// qué información recibe el cliente.
//
// Ejemplo backend:
// Si mañana en la base de datos cambio la columna "name"
// por "full_name", el frontend no tendría que cambiar.
// Aquí podría hacer:
//
// 'name' => $this->full_name
//
// y la API seguiría devolviendo "name".
//
// Ejemplo frontend:
// Si el frontend necessita un nuevo campo llamado "is_admin",
// puedo construirlo aquí sin modificar la tabla:
//
// 'is_admin' => $this->role === 'admin'
//
// Así el frontend recibe el dato ya preparado.
class UserResource extends JsonResource
{
    /**
     * Convierte el modelo User en un array que Laravel devolverá como JSON.
     *
     * $request contiene la petición actual.
     */
    public function toArray(Request $request): array
    {
        return [

            // Datos principales del usuario_
            'id' => $this->id,
            'company_id' => $this->company_id,
            'name' => $this->name,
            'email' => $this->email,
            'dni' => $this->dni,

            // Teléfono del usuario
            'phone' =>
            $this->phone,

            // Dirección completa
            'address' => $this->address,
            'city' => $this->city,
            'province' => $this->province,

            // Imagen/avatar del usuario (si llega "0" por datos legacy, lo trato como null)
            'avatar' => ($this->avatar === '0' || $this->avatar === 0 || $this->avatar === '') ? null : $this->avatar,

            // Rol del usuario dentro del sistema
            'role' => $this->role,

            // Convierto active a boolean para asegurar true/false
            'active' => (bool) $this->active,

            // Incluyo datos de la empresa SOLO si la relación viene cargada.
            // whenLoaded evita hacer consultas extra innecesarias.
            'company' => $this->whenLoaded('company', function () {

                // Devuelvo únicamente los campos necesarios de la empresa
                return [
                    'id' => $this->company->id,
                    'name' => $this->company->name,
                ];
            }),

            // Fechas automáticas del modelo
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
