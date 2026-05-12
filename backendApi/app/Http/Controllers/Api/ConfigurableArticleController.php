<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ConfigurableArticle;
use App\Models\ConfigurableArticleOptionPrice;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class ConfigurableArticleController extends Controller
{
    // ─────────────────────────────────────────────────────────────────
    //  GET /api/company/configurable-articles
    //  Listado de artículos configurables de la empresa del usuario
    // ─────────────────────────────────────────────────────────────────
    public function index()
    {
        // Empresa del usuario autenticado (multitenancy por empresa)
        $companyId = Auth::user()->company_id;

        // Solo artículos activos de esa empresa, incluyendo partes y opciones
        $articles = ConfigurableArticle::where('company_id', $companyId)
            ->where('active', true)
            ->with(['parts.options'])
            ->orderBy('code')
            ->get();

        // Respuesta directa en JSON para consumo del frontend
        return response()->json($articles);
    }

    // ─────────────────────────────────────────────────────────────────
    //  GET /api/company/configurable-articles/{id}
    //  Detalle con partes, opciones y reglas (para construir el formulario)
    // ─────────────────────────────────────────────────────────────────
    public function show(int $id)
    {
        // Se vuelve a filtrar por empresa para evitar acceso cruzado entre compañías
        $companyId = Auth::user()->company_id;

        // Carga completa para pintar formulario: partes, opciones y reglas de validación
        $article = ConfigurableArticle::where('company_id', $companyId)
            ->with(['parts.options', 'rules'])
            ->findOrFail($id);

        return response()->json($article);
    }

    // ─────────────────────────────────────────────────────────────────
    //  GET /api/company/configurable-articles/{id}/pricing
    //  Tarifas efectivas por opción para la empresa actual
    // ─────────────────────────────────────────────────────────────────
    public function pricing(int $id)
    {
        $companyId = Auth::user()->company_id;

        $article = ConfigurableArticle::where('company_id', $companyId)
            ->with(['parts.options'])
            ->findOrFail($id);

        return response()->json($this->construirTarifasRespuesta($article, $companyId));
    }

    // ─────────────────────────────────────────────────────────────────
    //  PUT /api/company/configurable-articles/{id}/pricing
    //  Guardar override de precios por opción para la empresa
    // ─────────────────────────────────────────────────────────────────
    public function updatePricing(Request $request, int $id)
    {
        $companyId = Auth::user()->company_id;

        $validated = $request->validate([
            'prices' => ['required', 'array', 'min:1'],
            'prices.*.option_id' => ['required', 'integer'],
            'prices.*.price' => ['required', 'numeric', 'min:0'],
        ]);

        $article = ConfigurableArticle::where('company_id', $companyId)
            ->with(['parts.options'])
            ->findOrFail($id);

        $allowedOptionIds = $article->parts
            ->flatMap(fn($part) => $part->options->pluck('id'))
            ->unique()
            ->values();

        $requestedOptionIds = collect($validated['prices'])
            ->pluck('option_id')
            ->unique()
            ->values();

        $invalidOptionIds = $requestedOptionIds
            ->diff($allowedOptionIds)
            ->values();

        if ($invalidOptionIds->isNotEmpty()) {
            return response()->json([
                'message' => 'Hay opciones que no pertenecen al artículo configurable.',
                'invalid_option_ids' => $invalidOptionIds,
            ], 422);
        }

        $now = now();
        $upserts = collect($validated['prices'])
            ->map(fn($item) => [
                'company_id' => $companyId,
                'configurable_article_option_id' => (int) $item['option_id'],
                'price' => (float) $item['price'],
                'created_at' => $now,
                'updated_at' => $now,
            ])
            ->values()
            ->all();

        ConfigurableArticleOptionPrice::upsert(
            $upserts,
            ['company_id', 'configurable_article_option_id'],
            ['price', 'updated_at']
        );

        return response()->json([
            'message' => 'Tarifas guardadas correctamente.',
            'pricing' => $this->construirTarifasRespuesta($article->fresh(['parts.options']), $companyId),
        ]);
    }

    // ─────────────────────────────────────────────────────────────────
    //  POST /api/company/configurable-articles/{id}/calculate
    //  Valida las medidas y devuelve el precio desglosado
    // ─────────────────────────────────────────────────────────────────
    public function calculate(Request $request, int $id)
    {
        // Seguridad por tenant: solo se calcula sobre artículos de la empresa del usuario
        $companyId = Auth::user()->company_id;

        // Traemos definición del artículo (partes/opciones/reglas) para validar y calcular
        $article = ConfigurableArticle::where('company_id', $companyId)
            ->with(['parts.options', 'rules'])
            ->findOrFail($id);

        // Se limita el input a las claves esperadas
        $data = $request->only([
            'ancho_hueco',
            'alto_hueco',
            'ancho_obra',
            'alto_obra',
            'paso_deseado',
            'options',
        ]);

        // ── Validar reglas ──────────────────────────────────────────
        $errors = $this->validarReglas($article->rules, $data);

        if (!empty($errors)) {
            // 422: datos sintácticamente correctos pero inválidos según reglas de negocio
            return response()->json(['valid' => false, 'errors' => $errors], 422);
        }

        // ── Calcular precio por parte ───────────────────────────────
        $breakdown = $this->calcularDesglose($article, $data, $companyId);

        // Medidas técnicas derivadas para fabricación y explicación comercial
        $fabricationMeasures = $this->calcularMedidasFabricacion($data);

        // Suma de todos los conceptos calculados
        $total = collect($breakdown)->sum('price');

        return response()->json([
            'valid'     => true,
            'breakdown' => $breakdown,
            'fabrication_measures' => $fabricationMeasures,
            'total'     => round($total, 2),
        ]);
    }

    // ─────────────────────────────────────────────────────────────────
    //  LÓGICA DE VALIDACIÓN
    // ─────────────────────────────────────────────────────────────────
    private function validarReglas($rules, array $data): array
    {
        $errors = [];

        // Reglas dinámicas guardadas en base de datos
        foreach ($rules as $rule) {
            $field  = $rule->field;
            $params = $rule->params;
            // Si no existe el campo, queda null y cada regla decide cómo tratarlo
            $value  = isset($data[$field]) ? (float) $data[$field] : null;

            switch ($rule->type) {
                case 'required':
                    // Campo obligatorio
                    if ($value === null || $value === '') {
                        $errors[$field][] = $rule->message;
                    }
                    break;

                case 'min_value':
                    // Valor mínimo permitido
                    if ($value !== null && $value < (float) $params['value']) {
                        $errors[$field][] = $rule->message;
                    }
                    break;

                case 'max_value':
                    // Valor máximo permitido
                    if ($value !== null && $value > (float) $params['value']) {
                        $errors[$field][] = $rule->message;
                    }
                    break;

                case 'min_diff':
                    // Diferencia mínima entre dos campos (ej. hueco vs obra)
                    $a = isset($data[$params['field_a']]) ? (float) $data[$params['field_a']] : null;
                    $b = isset($data[$params['field_b']]) ? (float) $data[$params['field_b']] : null;
                    if ($a !== null && $b !== null && ($a - $b) < (float) $params['min']) {
                        $errors[$field][] = $rule->message;
                    }
                    break;
            }
        }

        return $errors;
    }

    // ─────────────────────────────────────────────────────────────────
    //  LÓGICA DE CÁLCULO
    // ─────────────────────────────────────────────────────────────────
    private function calcularDesglose(ConfigurableArticle $article, array $data, int $companyId): array
    {
        // Resultado por parte: clave => detalle de precio
        $breakdown     = [];
        // Opciones elegidas desde el frontend (por key de parte)
        $optionsChosen = $data['options'] ?? [];

        // Regla de negocio: ancho de cajón limitado a 1480 mm
        $anchoCajon = min(
            (float) ($data['ancho_hueco'] ?? 0),
            1480
        );
        // Altura útil para cálculos de m2
        $alturaHueco = (float) ($data['alto_hueco'] ?? 0);

        $articleOptionIds = $article->parts
            ->flatMap(fn($part) => $part->options->pluck('id'))
            ->unique()
            ->values();

        $companyOptionPrices = ConfigurableArticleOptionPrice::where('company_id', $companyId)
            ->whereIn('configurable_article_option_id', $articleOptionIds)
            ->pluck('price', 'configurable_article_option_id');

        // Se calcula precio para cada parte configurable del artículo
        foreach ($article->parts as $part) {
            // Opción seleccionada para esta parte (si llega en request)
            $optionKey = $optionsChosen[$part->key] ?? null;

            // Buscar la opción elegida o la default
            $option = $optionKey
                ? $part->options->firstWhere('key', $optionKey)
                : $part->options->firstWhere('is_default', true);

            // Fallback: primera opción disponible si no hay default o key inválida
            if (!$option) {
                $option = $part->options->first();
            }

            // Sin opción no se puede calcular esa parte
            if (!$option) {
                continue;
            }

            $effectivePrice = $companyOptionPrices->has($option->id)
                ? (float) $companyOptionPrices[$option->id]
                : (float) $option->price;

            // Cálculo según unidad de negocio definida en la parte
            $price = match ($part->unit) {
                // Cajón → precio por metro lineal × metros del cajón
                'ml' => $effectivePrice * ($anchoCajon / 1000),

                // Hojas → precio por m² × (ancho × alto en metros)
                'm2' => $effectivePrice * (($anchoCajon / 1000) * ($alturaHueco / 1000)),

                // Precio fijo (fabricación)
                'fixed', 'units' => $effectivePrice,

                default => $effectivePrice,
            };

            // Se guarda el concepto en el desglose final
            $breakdown[$part->key] = [
                'label'      => $part->name . ' — ' . $option->label,
                'unit'       => $part->unit,
                'option_key' => $option->key,
                'base_price' => round((float) $option->price, 2),
                'effective_price' => round($effectivePrice, 2),
                'price'      => round($price, 2),
            ];
        }

        // El controlador calculate() suma este desglose para obtener el total
        return $breakdown;
    }

    private function construirTarifasRespuesta(ConfigurableArticle $article, int $companyId): array
    {
        $optionIds = $article->parts
            ->flatMap(fn($part) => $part->options->pluck('id'))
            ->unique()
            ->values();

        $companyOptionPrices = ConfigurableArticleOptionPrice::where('company_id', $companyId)
            ->whereIn('configurable_article_option_id', $optionIds)
            ->pluck('price', 'configurable_article_option_id');

        return [
            'article_id' => $article->id,
            'article_code' => $article->code,
            'parts' => $article->parts->map(function ($part) use ($companyOptionPrices) {
                return [
                    'part_id' => $part->id,
                    'part_key' => $part->key,
                    'part_name' => $part->name,
                    'unit' => $part->unit,
                    'options' => $part->options->map(function ($option) use ($companyOptionPrices) {
                        $companyPrice = $companyOptionPrices->has($option->id)
                            ? (float) $companyOptionPrices[$option->id]
                            : null;

                        return [
                            'option_id' => $option->id,
                            'option_key' => $option->key,
                            'label' => $option->label,
                            'is_default' => (bool) $option->is_default,
                            'base_price' => round((float) $option->price, 2),
                            'company_price' => $companyPrice !== null ? round($companyPrice, 2) : null,
                            'effective_price' => round($companyPrice ?? (float) $option->price, 2),
                        ];
                    })->values(),
                ];
            })->values(),
        ];
    }

    // ─────────────────────────────────────────────────────────────────
    //  MEDIDAS DE FABRICACIÓN DERIVADAS
    //  Se devuelven en la API para mostrarlas en frontend o guardarlas
    // ─────────────────────────────────────────────────────────────────
    private function calcularMedidasFabricacion(array $data): array
    {
        // C = ancho_hueco, D = alto_hueco (en mm)
        $c = (float) ($data['ancho_hueco'] ?? 0);
        $d = (float) ($data['alto_hueco'] ?? 0);

        // Fórmulas solicitadas para PTA2H2FSP
        $anchoCristalFijosLaterales = ($c / 4) + 45;
        $altoCristalFijosLaterales = $d;
        $anchoCristalHojasMoviles = ($c / 4) - 5;
        $altoCristalHojasMovilesSinPerfilPlinton = $d - 50;
        $anchoHuecoPasoLibreFinal = $c - ((($c / 4) + 45) * 2);
        $altoHuecoPasoLibre = $d;

        return [
            // Se incluye fórmula y resultado para que sea trazable en clase/auditoría
            'ancho_cristal_fijos_laterales' => [
                'formula' => '(C/4) + 45',
                'value_mm' => round($anchoCristalFijosLaterales, 2),
            ],
            'alto_cristal_fijos_laterales' => [
                'formula' => 'D',
                'value_mm' => round($altoCristalFijosLaterales, 2),
            ],
            'ancho_cristal_hojas_moviles' => [
                'formula' => '(C/4) - 5',
                'value_mm' => round($anchoCristalHojasMoviles, 2),
            ],
            'alto_cristal_hojas_moviles_sin_perfil_plinton' => [
                'formula' => 'D - 50',
                'value_mm' => round($altoCristalHojasMovilesSinPerfilPlinton, 2),
            ],
            'ancho_hueco_paso_libre_final' => [
                'formula' => 'C - ((C/4) + 45) * 2',
                'value_mm' => round($anchoHuecoPasoLibreFinal, 2),
            ],
            'alto_hueco_paso_libre' => [
                'formula' => 'D',
                'value_mm' => round($altoHuecoPasoLibre, 2),
            ],
        ];
    }
}
