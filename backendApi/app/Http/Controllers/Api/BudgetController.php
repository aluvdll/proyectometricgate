<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\BudgetListadoResource;
use App\Http\Resources\BudgetResource;
use App\Models\Budget;
use App\Models\StandardArticle;
use App\Services\CreateOrderFromBudgetService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;

class BudgetController extends Controller
{
    // Esta funcion la uso para cortar acceso al principio y asegurar que solo entren usuarios validos de mi empresa.
    // Aqui centralizo la validacion de acceso para los endpoints de presupuestos.
    // Solo permito usuarios autenticados con rol admin o commercial y con empresa asignada.
    private function authorizeAdminOrCommercial(Request $request)
    {
        // Aqui leo el usuario autenticado de la request.
        $user = $request->user();

        // Si no hay sesion valida, corto el flujo con 401.
        if (!$user) {
            return response()->json([
                'error' => 'No autenticado',
            ], 401);
        }

        // Si el rol no esta permitido para presupuestos, corto con 403.
        if (!in_array($user->role, ['admin', 'commercial'], true)) {
            return response()->json([
                'error' => 'No autorizado. Solo administrador o comercial.',
            ], 403);
        }

        // Si no hay empresa asociada, no puedo continuar con consultas por company_id.
        if (!$user->company_id) {
            return response()->json([
                'error' => 'Usuario sin empresa asignada.',
            ], 422);
        }

        // Si todo esta correcto, devuelvo null para que el controlador siga.
        return null;
    }

    // Esta funcion me devuelve todas las reglas que voy a aplicar al payload para crear o actualizar sin duplicar codigo.
    // Aqui defino las reglas de validacion para crear o actualizar presupuestos.
    // Reutilizo esta funcion para no duplicar reglas en store y update.
    private function rules(int $companyId, bool $isUpdate = false): array
    {
        return [
            'client_id' => [
                // Si estoy en update, permito que el campo venga o no (sometimes).
                // Si estoy en create, exijo que venga siempre (required).
                $isUpdate ? 'sometimes' : 'required',

                // Si el campo viene en la request, obligo a que no venga vacio.
                'required',

                // Fuerzo que el id del cliente sea numerico entero.
                'integer',

                // Verifico que el cliente exista en tabla clients
                // y ademas pertenezca a la misma empresa del usuario autenticado.
                Rule::exists('clients', 'id')->where(function ($query) use ($companyId) {
                    return $query->where('company_id', $companyId);
                }),
            ],
            'budget_date' => [$isUpdate ? 'sometimes' : 'required', 'required', 'date'],
            'status' => [
                $isUpdate ? 'sometimes' : 'required',
                'required',
                Rule::in(['pendiente', 'aceptado']),
            ],
            'notes' => 'nullable|string',
            'lines' => [$isUpdate ? 'sometimes' : 'required', 'required', 'array', 'min:1'],
            'lines.*.standard_article_id' => [
                'nullable',
                'integer',
                Rule::exists('standard_articles', 'id')->where(function ($query) use ($companyId) {
                    return $query->where('company_id', $companyId);
                }),
            ],
            'lines.*.configurable_article_id' => [
                'nullable',
                'integer',
                Rule::exists('configurable_articles', 'id')->where(function ($query) use ($companyId) {
                    return $query->where('company_id', $companyId);
                }),
            ],
            'lines.*.configuration' => 'nullable|array',
            'lines.*.name' => 'required|string|max:255',
            'lines.*.description' => 'nullable|string',
            'lines.*.quantity' => 'required|numeric|gt:0',
            'lines.*.unit_price' => 'required|numeric|min:0',
            'lines.*.discount_percentage' => 'nullable|numeric|min:0|max:100',
            'lines.*.tax_percentage' => 'nullable|numeric|min:0|max:100',
            'lines.*.position' => 'nullable|integer|min:0',
        ];
    }

    // Esta funcion centraliza los textos de error para que frontend reciba mensajes claros y consistentes.
    // Aqui agrupo todos los mensajes de error personalizados de validacion.
    // Asi mantengo textos consistentes para frontend.
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
            'lines.*.configurable_article_id.exists' => 'El artículo configurable seleccionado no pertenece a tu empresa.',
            'lines.*.name.required' => 'Cada línea debe tener un nombre.',
            'lines.*.quantity.required' => 'Cada línea debe tener cantidad.',
            'lines.*.quantity.gt' => 'La cantidad debe ser mayor que 0.',
            'lines.*.unit_price.required' => 'Cada línea debe tener precio unitario.',
        ];
    }

    // Esta funcion genera el siguiente numero de presupuesto por empresa y año con formato fijo para mantener trazabilidad.
    // Aqui genero el numero de presupuesto correlativo por año y por empresa.
    // Formato final: YYYY-00001.
    private function generateBudgetNumber(int $companyId, string $budgetDate): string
    {
        // Aqui obtengo el año de la fecha del presupuesto.
        // strtotime convierte la fecha en texto a timestamp para que date pueda extraer el año (Y).
        $year = date('Y', strtotime($budgetDate));

        // Aqui busco el ultimo presupuesto de ese año para calcular el siguiente numero.
        $lastBudget = Budget::where('company_id', $companyId)
            // Aqui '-%' significa: empieza por "YYYY-" y luego cualquier secuencia (ej: 2026-00012).
            ->where('budget_number', 'like', $year . '-%')
            ->orderByDesc('budget_number')
            ->first();

        // Si no hay ninguno en ese año, arranco desde 00001.
        if (!$lastBudget) {
            return $year . '-00001';
        }

        // Aqui tomo los ultimos 5 caracteres del budget_number (ej: 2026-00012 -> 00012).
        // substr(..., -5) empieza desde el final del texto y corta 5 posiciones.
        // Luego convierto ese texto a entero para poder operar matematicamente.
        $lastSequence = (int) substr($lastBudget->budget_number, -5);

        // Aqui incremento en 1 la secuencia para generar el siguiente numero.
        $nextSequence = $lastSequence + 1;

        // Aqui reconstruyo el codigo final:
        // 1) (string) fuerza la secuencia a texto.
        // 2) str_pad(..., 5, '0', STR_PAD_LEFT) rellena con ceros a la izquierda hasta 5 digitos.
        // 3) concateno año + '-' + secuencia formateada (ej: 2026-00013).
        return $year . '-' . str_pad((string) $nextSequence, 5, '0', STR_PAD_LEFT);
    }

    // Esta funcion es mi motor de calculo: normaliza lineas, calcula importes y prepara todo lo que luego voy a guardar.
    // Aqui preparo las lineas del presupuesto y calculo importes totales.
    // Tambien valido coherencia en lineas configurables y separo su configuracion.
    private function buildLines(array $lines, int $companyId): array
    {
        // Primero valido que ninguna linea tenga configuracion sin articulo configurable.
        foreach ($lines as $lineIndex => $line) {
            if (!empty($line['configuration']) && empty($line['configurable_article_id'])) {
                throw ValidationException::withMessages([
                    "lines.$lineIndex.configurable_article_id" => [
                        'La línea tiene configuración pero no tiene artículo configurable.',
                    ],
                ]);
            }
        }

        // Aqui recojo los ids de articulos estandar para resolver datos por lote.
        // Aqui convierto el array de lineas en una coleccion para poder encadenar operaciones comodamente.
        $articleIds = collect($lines)
            // Aqui me quedo solo con el valor standard_article_id de cada linea.
            ->pluck('standard_article_id')
            // Aqui quito los valores vacios o nulos para no consultar ids invalidos.
            ->filter()
            // Aqui fuerzo cada id a entero para trabajar siempre con un tipo consistente.
            ->map(fn ($id) => (int) $id)
            // Aqui reindexo la coleccion desde cero para dejarla limpia y ordenada.
            ->values()
            // Aqui convierto la coleccion final en array normal para usarlo en whereIn.
            ->all();

        // Aqui cargo articulos estandar de la empresa y los indexo por id.
        $articles = StandardArticle::where('company_id', $companyId)
            ->whereIn('id', $articleIds)
            ->get()
            ->keyBy('id');

        // Aqui inicializo acumuladores de lineas, configuraciones y totales.
        $preparedLines = [];
        $configurationsToSave = [];
        $baseAmount = 0;
        $taxAmount = 0;
        $totalAmount = 0;

        // Aqui recorro cada linea para normalizar campos y calcular importes.
        foreach ($lines as $index => $line) {
            // Aqui normalizo ids de articulo estandar/configurable y articulo asociado.
            $standardArticleId = !empty($line['standard_article_id']) ? (int) $line['standard_article_id'] : null;
            $configurableArticleId = !empty($line['configurable_article_id']) ? (int) $line['configurable_article_id'] : null;
            $article = $standardArticleId ? ($articles[$standardArticleId] ?? null) : null;

            // Aqui normalizo valores numericos base de la linea.
            $quantity = round((float) $line['quantity'], 2);
            $unitPrice = round((float) $line['unit_price'], 2);
            $discountPercentage = round((float) ($line['discount_percentage'] ?? 0), 2);
            $taxPercentage = round((float) ($line['tax_percentage'] ?? ($article?->tax_percentage ?? 21)), 2);

            // Aqui calculo subtotales, descuento, impuestos y total de la linea.
            $grossSubtotal = round($quantity * $unitPrice, 2);
            $discountAmount = round($grossSubtotal * ($discountPercentage / 100), 2);
            $netSubtotal = round($grossSubtotal - $discountAmount, 2);
            $lineTaxAmount = round($netSubtotal * ($taxPercentage / 100), 2);
            $lineTotalAmount = round($netSubtotal + $lineTaxAmount, 2);

            // Aqui construyo la estructura final de linea que voy a persistir.
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

            // Si la linea es configurable y trae configuracion, la guardo aparte.
            if ($configurableArticleId && !empty($line['configuration'])) {
                $configurationsToSave[$index] = $line['configuration'];
            }

            // Aqui acumulo la linea y 
            // SUMO sus importes a los totales del presupuesto.
            $preparedLines[] = $preparedLine;

            $baseAmount += $netSubtotal;
            $taxAmount += $lineTaxAmount;
            $totalAmount += $lineTotalAmount;
        }

        // Devuelvo lineas preparadas, configuraciones y totales calculados.
        return [
            'lines' => $preparedLines,
            'configurations' => $configurationsToSave,
            'base_amount' => round($baseAmount, 2),
            'tax_amount' => round($taxAmount, 2),
            'total_amount' => round($totalAmount, 2),
        ];
    }

    // Esta funcion devuelve el listado de presupuestos de la empresa actual para pintar el panel de forma ligera.
    public function index(Request $request)
    {
        // Aqui valido permisos antes de listar presupuestos.
        $authError = $this->authorizeAdminOrCommercial($request);
        if ($authError) {
            return $authError;
        }

        // Aqui solo cargo lo que usa el panel de listado para ahorrar payload.
        $budgets = Budget::query()
            ->select(['id', 'company_id', 'client_id', 'budget_number', 'budget_date', 'status', 'total_amount'])
            ->with(['client:id,nombre'])
            ->where('company_id', $request->user()->company_id)
            ->orderByDesc('budget_date')
            ->orderByDesc('budget_number')
            ->get();

        return response()->json([
            // Entrada: coleccion de presupuestos para panel.
            // Salida: listado minimo transformado por Resource.
            'budgets' => BudgetListadoResource::collection($budgets)->resolve($request),
        ]);
    }

    // Esta funcion devuelve el detalle completo de un presupuesto concreto siempre dentro del contexto de mi empresa.
    public function show(Request $request, int $id)
    {
        // Aqui valido permisos antes de ver detalle.
        $authError = $this->authorizeAdminOrCommercial($request);
        if ($authError) {
            return $authError;
        }

        // Aqui cargo solo relaciones que usa frontend en editar/imprimir.
        $budget = Budget::with([
            'client:id,client_number,nombre,dni,telefono,direccion,codigo_postal,poblacion,provincia,email',
            'lines.configuration',
        ])
            ->where('company_id', $request->user()->company_id)
            ->where('id', $id)
            ->first();

        if (!$budget) {
            return response()->json([
                'error' => 'Presupuesto no encontrado en tu empresa.',
            ], 404);
        }

        return response()->json([
            // Entrada: presupuesto encontrado con relaciones necesarias.
            // Salida: presupuesto transformado por Resource de detalle.
            'budget' => (new BudgetResource($budget))->resolve($request),
        ]);
    }

    // Esta funcion crea un presupuesto nuevo de principio a fin: valida, calcula y guarda cabecera, lineas y configuraciones en transaccion.
    public function store(Request $request)
    {
        // Aqui valido permisos antes de crear un presupuesto nuevo.
        $authError = $this->authorizeAdminOrCommercial($request);
        if ($authError) {
            return $authError;
        }

        // Aqui valido payload y construyo lineas/totales en base a reglas de negocio.
        $companyId = $request->user()->company_id;
        $validated = $request->validate($this->rules($companyId), $this->messages());
        $buildResult = $this->buildLines($validated['lines'], $companyId);
        $configurations = $buildResult['configurations'];

        // Aqui ejecuto el guardado completo en transaccion para mantener consistencia.
        $budget = DB::transaction(function () use ($validated, $buildResult, $configurations, $companyId, $request) {
            // Primero creo la cabecera del presupuesto.
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

            // Despues creo todas las lineas asociadas.
            $budget->lines()->createMany($buildResult['lines']);

            // Si hay lineas configurables, guardo su configuracion vinculada.
            if (!empty($configurations)) {
                $lines = $budget->lines()->get();
                foreach ($configurations as $lineIndex => $config) {
                    $line = $lines[$lineIndex] ?? null;
                    if ($line && $line->configurable_article_id) {
                        $line->configuration()->create([
                            'ancho_hueco'          => $config['ancho_hueco'] ?? null,
                            'alto_hueco'           => $config['alto_hueco'] ?? null,
                            'ancho_obra'           => $config['ancho_obra'] ?? null,
                            'alto_obra'            => $config['alto_obra'] ?? null,
                            'paso_deseado'         => $config['paso_deseado'] ?? null,
                            'options_chosen'       => $config['options_chosen'] ?? [],
                            'price_breakdown'      => $config['price_breakdown'] ?? [],
                            'fabrication_measures' => $config['fabrication_measures'] ?? [],
                        ]);
                    }
                }
            }

            // Devuelvo el presupuesto creado para seguir con la respuesta.
            return $budget;
        });

        return response()->json([
            'message' => 'Presupuesto creado correctamente.',
            // Aqui devuelvo el presupuesto creado con formato estable y payload reducido.
            'budget' => (new BudgetResource(
                $budget->load([
                    'client:id,client_number,nombre,dni,telefono,direccion,codigo_postal,poblacion,provincia,email',
                    'lines.configuration',
                ])
            ))->resolve($request),
        ], 201);
    }

    // Esta funcion actualiza un presupuesto existente recalculando todo en backend y creando pedido automaticamente si pasa a aceptado.
    public function update(Request $request, int $id)
    {
        // Aqui valido permisos antes de actualizar presupuesto.
        $authError = $this->authorizeAdminOrCommercial($request);
        if ($authError) {
            return $authError;
        }

        // Aqui busco presupuesto por empresa + id para evitar cruces entre empresas.
        $companyId = $request->user()->company_id;
        $budget = Budget::where('company_id', $companyId)
            ->where('id', $id)
            ->first();

        if (!$budget) {
            return response()->json([
                'error' => 'Presupuesto no encontrado en tu empresa.',
            ], 404);
        }

        // Aqui valido payload y reconstruyo lineas/totales para reemplazar el contenido.
        $validated = $request->validate($this->rules($companyId, true), $this->messages());
        $buildResult = $this->buildLines($validated['lines'], $companyId);
        $configurations = $buildResult['configurations'];

        // Guardo estado anterior para decidir si debo crear pedido automaticamente.
        $oldStatus = $budget->status;
        $newStatus = $validated['status'];

        // Aqui actualizo todo dentro de una transaccion.
        DB::transaction(function () use ($budget, $validated, $buildResult, $configurations, $oldStatus, $newStatus) {
            // Primero actualizo cabecera del presupuesto.
            $budget->update([
                'client_id' => (int) $validated['client_id'],
                'budget_date' => $validated['budget_date'],
                'status' => $validated['status'],
                'base_amount' => $buildResult['base_amount'],
                'tax_amount' => $buildResult['tax_amount'],
                'total_amount' => $buildResult['total_amount'],
                'notes' => $validated['notes'] ?? null,
            ]);

            // Borro lineas anteriores y creo la nueva version completa.
            $budget->lines()->delete();
            $budget->lines()->createMany($buildResult['lines']);

            // Si hay lineas configurables, guardo configuraciones de esta nueva version.
            if (!empty($configurations)) {
                $lines = $budget->lines()->get();
                foreach ($configurations as $lineIndex => $config) {
                    $line = $lines[$lineIndex] ?? null;
                    if ($line && $line->configurable_article_id) {
                        $line->configuration()->create([
                            'ancho_hueco'          => $config['ancho_hueco'] ?? null,
                            'alto_hueco'           => $config['alto_hueco'] ?? null,
                            'ancho_obra'           => $config['ancho_obra'] ?? null,
                            'alto_obra'            => $config['alto_obra'] ?? null,
                            'paso_deseado'         => $config['paso_deseado'] ?? null,
                            'options_chosen'       => $config['options_chosen'] ?? [],
                            'price_breakdown'      => $config['price_breakdown'] ?? [],
                            'fabrication_measures' => $config['fabrication_measures'] ?? [],
                        ]);
                    }
                }
            }

            // Si el estado pasa de pendiente a aceptado, creo el pedido automaticamente.
            if ($oldStatus !== 'aceptado' && $newStatus === 'aceptado') {
                CreateOrderFromBudgetService::execute($budget->fresh());
            }
        });

        return response()->json([
            'message' => 'Presupuesto actualizado correctamente.',
            // Aqui devuelvo el presupuesto actualizado con el mismo contrato JSON de detalle.
            'budget' => (new BudgetResource(
                $budget->fresh()->load([
                    'client:id,client_number,nombre,dni,telefono,direccion,codigo_postal,poblacion,provincia,email',
                    'lines.configuration',
                ])
            ))->resolve($request),
        ]);
    }
}
