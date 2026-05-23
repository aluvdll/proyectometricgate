<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class UserResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'company_id' => $this->company_id,
            'name' => $this->name,
            'email' => $this->email,
            'dni' => $this->dni,
            'phone' =>
            $this->phone,
            'address' => $this->address,
            'city' => $this->city,
            'province' => $this->province,
            'avatar' => $this->avatar,
            'role' => $this->role,
            'active' => (bool) $this->active,
            'company' => $this->whenLoaded('company', function () {
                return [
                    'id' => $this->company->id,
                    'name' => $this->company->name,
                ];
            }),



            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
