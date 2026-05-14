<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Budget;
use App\Models\Client;
use App\Models\StandardArticle;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;

class BudgetController extends Controller
{
    private function authorizeAdminOrCommercial(Request $request)
    {
        $user = $request->user();

        if (!$user) {
            return response()->json([
                'error' => 'No autenticado',
            ], 401);
        }

        if (!in_array($user->role, ['admin', 'commercial'], true)) {
            return response()->json([
                'error' => 'No autorizado. Solo admin o commercial.',
            ], 403);
        }

        if (!$user->company_id) {
            return response()->json([
                'error' => 'Usuario sin empresa asignada.',
            ], 422);
        }

        return null;
    }

    private function rules(int $companyId, bool $isUpdate = false): array
    {
        return [
            'client_id' => [
                $isUpdate ? 'sometimes' : 'required',
                'required',
                'integer',
                Rule::exists('clients', 'id')->where(function ($query) use ($companyId) {
                    return $query->where('company_id', $companyId);
                }),
            ],
            'budget_date' => [$isUpdate ? 'sometimes' : 'required', 'required', 'date'],
            'status' => [
                $isUpdate ? 'sometimes' : 'required',
                'required',
                Rule::in(['draft', 'sent', 'accepted', 'rejected', 'invoiced']),
            ],
            'notes' => 'nullable|string',
            'lines' => [$isUpdate ? 'sometimes' : 'required', 'required', 'array', 'min:1'],
            'lines.*.standard_article_id' => [
                'nullable',
                'integer',
                Rule::exists('standard_articles', 'id')->where(function ($query) use ($companyId) {
                    return $query->where('company_id', $companyId);
                }),
            ],            'lines.*.configuration' => 'nullable|array',            'lines.*.name' => 'required|string|max:255',
            'lines.*.description' => 'nullable|string',
            'lines.*.quantity' => 'required|numeric|gt:0',
            'lines.*.unit_price' => 'required|numeric|min:0',
            'lines.*.discount_percentage' => 'nullable|numeric|min:0|max:100',
            'lines.*.tax_percentage' => 'nullable|numeric|min:0|max:100',
            'lines.*.position' => 'nullable|integer|min:0',
        ];
    }

    private function messages(): array
    {
        return [
            'client_id.required' => 'Debes seleccionar un cliente.',
            'client_id.exists' => 'El cliente seleccionado no pertenece a tu empresa.',
            'budget_date.required' => 'La fecha del presupuesto es obligatoria.',
            'status.required' => 'El estado es obligatorio.',
            'lines.required' => 'Debes añadir al menos una línea.',
            'lines.min' => 'Debes añadir al menos una línea.',
            'lines.*.standard_article_id.exists' => 'El artículo seleccionado no pertenece a tu empresa.',
            'lines.*.name.required' => 'Cada línea debe tener un nombre.',
            'lines.*.quantity.required' => 'Cada línea debe tener cantidad.',
            'lines.*.quantity.gt' => 'La cantidad debe ser mayor que 0.',
            'lines.*.unit_price.required' => 'Cada línea debe tener precio unitario.',
        ];
    }

    private function generateBudgetNumber(int $companyId, string $budgetDate): string
    {
        $year = date('Y', strtotime($budgetDate));

        $lastBudget = Budget::where('company_id', $companyId)
            ->where('budget_number', 'like', $year . '-%')
            ->orderByDesc('budget_number')
            ->first();

        if (!$lastBudget) {
            return $year . '-00001';
        }

        $lastSequence = (int) substr($lastBudget->budget_number, -5);
        $nextSequence = $lastSequence + 1;

        return $year . '-' . str_pad((string) $nextSequence, 5, '0', STR_PAD_LEFT);
    }

    private function buildLines(array $lines, int $companyId): array
    {
        $articleIds = collect($lines)
            ->pluck('standard_article_id')
            ->filter()
            ->map(fn($id) => (int) $id)
            ->values()
            ->all();

        $articles = StandardArticle::where('company_id', $companyId)
            ->whereIn('id', $articleIds)
            ->get()
            ->keyBy('id');

        $preparedLines = [];
        $configurationsToSave = [];
        $baseAmount = 0;
        $taxAmount = 0;
        $totalAmount = 0;

        foreach ($lines as $index => $line) {
            $standardArticleId = !empty($line['standard_article_id']) ? (int) $line['standard_article_id'] : null;
            $configurableArticleId = !empty($line['configurable_article_id']) ? (int) $line['configurable_article_id'] : null;
            $article = $standardArticleId ? ($articles[$standardArticleId] ?? null) : null;

            $quantity = round((float) $line['quantity'], 2);
            $unitPrice = round((float) $line['unit_price'], 2);
            $discountPercentage = round((float) ($line['discount_percentage'] ?? 0), 2);
            $taxPercentage = round((float) ($line['tax_percentage'] ?? ($article?->tax_percentage ?? 21)), 2);

            $grossSubtotal = round($quantity * $unitPrice, 2);
            $discountAmount = round($grossSubtotal * ($discountPercentage / 100), 2);
            $netSubtotal = round($grossSubtotal - $discountAmount, 2);
            $lineTaxAmount = round($netSubtotal * ($taxPercentage / 100), 2);
            $lineTotalAmount = round($netSubtotal + $lineTaxAmount, 2);

            $preparedLine = [
                'article_type' => $configurableArticleId ? 'configurable' : ($standardArticleId ? 'standard' : 'manual'),
                'standard_article_id' => $standardArticleId,
                'configurable_article_id' => $configurableArticleId,
                'name' => trim((string) ($line['name'] ?? ($article?->name ?? ''))),
                'description' => trim((string) ($line['description'] ?? ($article?->description ?? ''))),
                'quantity' => $quantity,
                'unit_price' => $unitPrice,
                'gross_subtotal' => $grossSubtotal,
                'discount_percentage' => $discountPercentage,
                'discount_amount' => $discountAmount,
                'net_subtotal' => $netSubtotal,
                'tax_percentage' => $taxPercentage,
                'tax_amount' => $lineTaxAmount,
                'total_amount' => $lineTotalAmount,
                'position' => isset($line['position']) ? (int) $line['position'] : $index,
            ];

            if ($configurableArticleId && !empty($line['configuration'])) {
                $configurationsToSave[$index] = $line['configuration'];
            }

            $preparedLines[] = $preparedLine;

            $baseAmount += $netSubtotal;
            $taxAmount += $lineTaxAmount;
            $totalAmount += $lineTotalAmount;
        }

        return [
            'lines' => $preparedLines,
            'configurations' => $configurationsToSave,
            'base_amount' => round($baseAmount, 2),
            'tax_amount' => round($taxAmount, 2),
            'total_amount' => round($totalAmount, 2),
        ];
    }

    public function index(Request $request)
    {
        $authError = $this->authorizeAdminOrCommercial($request);
        if ($authError) {
            return $authError;
        }

        $budgets = Budget::with(['client', 'createdBy', 'lines'])
            ->where('company_id', $request->user()->company_id)
            ->orderByDesc('budget_date')
            ->orderByDesc('budget_number')
            ->get();

        return response()->json([
            'budgets' => $budgets,
        ]);
    }

    public function show(Request $request, int $id)
    {
        $authError = $this->authorizeAdminOrCommercial($request);
        if ($authError) {
            return $authError;
        }

        $budget = Budget::with(['client', 'createdBy', 'lines.standardArticle', 'lines.configuration', 'lines.configurableArticle'])
            ->where('company_id', $request->user()->company_id)
            ->where('id', $id)
            ->first();

        if (!$budget) {
            return response()->json([
                'error' => 'Presupuesto no encontrado en tu empresa.',
            ], 404);
        }

        return response()->json([
            'budget' => $budget,
        ]);
    }

    public function store(Request $request)
    {
        $authError = $this->authorizeAdminOrCommercial($request);
        if ($authError) {
            return $authError;
        }

        $companyId = $request->user()->company_id;
        $validated = $request->validate($this->rules($companyId), $this->messages());
        $buildResult = $this->buildLines($validated['lines'], $companyId);
        $configurations = $buildResult['configurations'];

        $budget = DB::transaction(function () use ($validated, $buildResult, $configurations, $companyId, $request) {
            $budget = Budget::create([
                'company_id' => $companyId,
                'client_id' => (int) $validated['client_id'],
                'created_by_user_id' => $request->user()->id,
                'budget_number' => $this->generateBudgetNumber($companyId, $validated['budget_date']),
                'budget_date' => $validated['budget_date'],
                'status' => $validated['status'],
                'base_amount' => $buildResult['base_amount'],
                'tax_amount' => $buildResult['tax_amount'],
                'total_amount' => $buildResult['total_amount'],
                'notes' => $validated['notes'] ?? null,
            ]);

            $budget->lines()->createMany($buildResult['lines']);

            if (!empty($configurations)) {
                $lines = $budget->lines()->get();
                foreach ($configurations as $lineIndex => $config) {
                    $line = $lines[$lineIndex] ?? null;
                    if ($line && $line->configurable_article_id) {
                        $line->configuration()->create([
                            'ancho_hueco' => $config['medidas']['ancho_hueco'] ?? null,
                            'alto_hueco' => $config['medidas']['alto_hueco'] ?? null,
                            'ancho_obra' => $config['medidas']['ancho_obra'] ?? null,
                            'alto_obra' => $config['medidas']['alto_obra'] ?? null,
                            'paso_deseado' => $config['medidas']['paso_deseado'] ?? null,
                            'options_chosen' => $config['opciones'] ?? [],
                            'price_breakdown' => $config['desglose'] ?? [],
                        ]);
                    }
                }
            }

            return $budget;
        });

        return response()->json([
            'message' => 'Presupuesto creado correctamente.',
            'budget' => $budget->load(['client', 'createdBy', 'lines.standardArticle', 'lines.configuration']),
        ], 201);
    }

    public function update(Request $request, int $id)
    {
        $authError = $this->authorizeAdminOrCommercial($request);
        if ($authError) {
            return $authError;
        }

        $companyId = $request->user()->company_id;
        $budget = Budget::where('company_id', $companyId)
            ->where('id', $id)
            ->first();

        if (!$budget) {
            return response()->json([
                'error' => 'Presupuesto no encontrado en tu empresa.',
            ], 404);
        }

        $validated = $request->validate($this->rules($companyId, true), $this->messages());
        $buildResult = $this->buildLines($validated['lines'], $companyId);
        $configurations = $buildResult['configurations'];

        DB::transaction(function () use ($budget, $validated, $buildResult, $configurations) {
            $budget->update([
                'client_id' => (int) $validated['client_id'],
                'budget_date' => $validated['budget_date'],
                'status' => $validated['status'],
                'base_amount' => $buildResult['base_amount'],
                'tax_amount' => $buildResult['tax_amount'],
                'total_amount' => $buildResult['total_amount'],
                'notes' => $validated['notes'] ?? null,
            ]);

            $budget->lines()->delete();
            $budget->lines()->createMany($buildResult['lines']);

            if (!empty($configurations)) {
                $lines = $budget->lines()->get();
                foreach ($configurations as $lineIndex => $config) {
                    $line = $lines[$lineIndex] ?? null;
                    if ($line && $line->configurable_article_id) {
                        $line->configuration()->create([
                            'ancho_hueco' => $config['medidas']['ancho_hueco'] ?? null,
                            'alto_hueco' => $config['medidas']['alto_hueco'] ?? null,
                            'ancho_obra' => $config['medidas']['ancho_obra'] ?? null,
                            'alto_obra' => $config['medidas']['alto_obra'] ?? null,
                            'paso_deseado' => $config['medidas']['paso_deseado'] ?? null,
                            'options_chosen' => $config['opciones'] ?? [],
                            'price_breakdown' => $config['desglose'] ?? [],
                        ]);
                    }
                }
            }
        });

        return response()->json([
            'message' => 'Presupuesto actualizado correctamente.',
            'budget' => $budget->fresh()->load(['client', 'createdBy', 'lines.standardArticle', 'lines.configuration', 'lines.configurableArticle']),
        ]);
    }
}
