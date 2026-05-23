<?php

namespace App\Services;

use App\Models\Budget;
use App\Models\Order;
use App\Models\OrderLine;
use App\Models\OrderLineConfiguration;
use Illuminate\Support\Facades\DB;

class CreateOrderFromBudgetService
{
    /**
     * Crea un pedido a partir de un presupuesto
     *
     * @param Budget $budget El presupuesto aceptado
     * @return Order El pedido creado
     */
    public static function execute(Budget $budget): Order
    {
        // Todo dentro de una transacción para garantizar consistencia
        return DB::transaction(function () use ($budget) {

            // Bloqueo del presupuesto para evitar que dos peticiones simultáneas
            // creen el mismo pedido a la vez
            Budget::where('id', $budget->id)->lockForUpdate()->first();

            // Si ya existe un pedido para este presupuesto, lo devolvemos sin crear otro
            $pedidoExistente = Order::where('budget_id', $budget->id)->first();
            if ($pedidoExistente) {
                return $pedidoExistente;
            }

            // Generamos el número de pedido único para esta empresa y año
            $numeroPedido = self::generarNumeroPedido($budget->company_id);

            // 1. Crear el pedido
            $pedido = Order::create([
                'company_id'          => $budget->company_id,
                'budget_id'           => $budget->id,
                'client_id'           => $budget->client_id,
                'order_number'        => $numeroPedido,
                'order_date'          => now()->toDateString(),
                'estimated_delivery'  => now()->addDays(14)->toDateString(),
                'status'              => 'pendiente',
                'base_amount'         => $budget->base_amount,
                'tax_amount'          => $budget->tax_amount,
                'total_amount'        => $budget->total_amount,
                'notes'               => $budget->notes,
                'created_by_user_id'  => auth()->id(),
            ]);

            // 2. Copiar cada línea del presupuesto al pedido
            foreach ($budget->lines as $lineaPresupuesto) {
                $lineaPedido = $pedido->lines()->create([
                    'article_type'              => $lineaPresupuesto->article_type,
                    'standard_article_id'       => $lineaPresupuesto->standard_article_id,
                    'configurable_article_id'   => $lineaPresupuesto->configurable_article_id,
                    'name'                      => $lineaPresupuesto->name,
                    'description'               => $lineaPresupuesto->description,
                    'quantity'                  => $lineaPresupuesto->quantity,
                    'unit_price'                => $lineaPresupuesto->unit_price,
                    'gross_subtotal'            => $lineaPresupuesto->gross_subtotal,
                    'discount_percentage'       => $lineaPresupuesto->discount_percentage,
                    'discount_amount'           => $lineaPresupuesto->discount_amount,
                    'net_subtotal'              => $lineaPresupuesto->net_subtotal,
                    'tax_percentage'            => $lineaPresupuesto->tax_percentage,
                    'tax_amount'                => $lineaPresupuesto->tax_amount,
                    'total_amount'              => $lineaPresupuesto->total_amount,
                    'position'                  => $lineaPresupuesto->position,
                ]);

                // 3. Si la línea tiene un artículo configurable, copiar sus medidas
                if ($lineaPresupuesto->configurable_article_id && $lineaPresupuesto->configuration) {
                    $lineaPedido->configuration()->create([
                        'ancho_hueco'          => $lineaPresupuesto->configuration->ancho_hueco,
                        'alto_hueco'           => $lineaPresupuesto->configuration->alto_hueco,
                        'ancho_obra'           => $lineaPresupuesto->configuration->ancho_obra,
                        'alto_obra'            => $lineaPresupuesto->configuration->alto_obra,
                        'paso_deseado'         => $lineaPresupuesto->configuration->paso_deseado,
                        'options_chosen'       => $lineaPresupuesto->configuration->options_chosen,
                        'price_breakdown'      => $lineaPresupuesto->configuration->price_breakdown,
                        'fabrication_measures' => $lineaPresupuesto->configuration->fabrication_measures,
                    ]);
                }
            }

            return $pedido->load(['client', 'createdBy', 'lines.standardArticle', 'lines.configurableArticle', 'lines.configuration']);
        });
    }

    /**
     * Genera el siguiente número de pedido para una empresa y año.
     * El número es único por empresa: dos empresas distintas pueden tener
     * el mismo número (ej: 2026-00001), pero no la misma empresa.
     * Formato: YYYY-NNNNN  (ej: 2026-00003)
     */
    private static function generarNumeroPedido(int $empresaId): string
    {
        $anio = now()->year;

        // Buscamos el último pedido de ESTA empresa en el año actual.
        // lockForUpdate evita que dos transacciones concurrentes lean
        // el mismo último número y generen un duplicado.
        $ultimoPedido = Order::where('company_id', $empresaId)
            ->where('order_number', 'like', $anio . '-%')
            ->orderByDesc('order_number')
            ->lockForUpdate()
            ->first();

        // Si no hay pedidos este año, empezamos desde 1
        if (!$ultimoPedido) {
            return $anio . '-00001';
        }

        // Extraemos los últimos 5 dígitos y sumamos 1
        $ultimoNumero  = (int) substr($ultimoPedido->order_number, -5);
        $siguienteNumero = $ultimoNumero + 1;

        return $anio . '-' . str_pad((string) $siguienteNumero, 5, '0', STR_PAD_LEFT);
    }
}
