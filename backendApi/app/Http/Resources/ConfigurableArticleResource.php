<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

// Aqui defino el contrato JSON de detalle para configurar un articulo.
// Incluyo solo campos necesarios para modal de configuracion y calculo.
class ConfigurableArticleResource extends JsonResource
{
    /**
     * Transformo el articulo configurable en un array JSON de detalle.
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
            'parts' => $this->whenLoaded('parts', function () {
                return $this->parts->map(function ($part) {
                    return [
                        'id' => $part->id,
                        'key' => $part->key,
                        'name' => $part->name,
                        'unit' => $part->unit,
                        'options' => $part->options->map(function ($option) {
                            return [
                                'id' => $option->id,
                                'key' => $option->key,
                                'label' => $option->label,
                                'price' => $option->price,
                                'is_default' => (bool) $option->is_default,
                            ];
                        })->values(),
                    ];
                })->values();
            }),
            'rules' => $this->whenLoaded('rules', function () {
                return $this->rules->map(function ($rule) {
                    return [
                        'id' => $rule->id,
                        'field' => $rule->field,
                        'type' => $rule->type,
                        'params' => $rule->params,
                        'message' => $rule->message,
                    ];
                })->values();
            }),
        ];
    }
}
