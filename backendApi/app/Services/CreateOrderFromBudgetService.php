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
        // Si ya existe pedido para este presupuesto, no crear otro
        $existingOrder = Order::where('budget_id', $budget->id)->first();
        if ($existingOrder) {
            return $existingOrder;
        }

        // Crear el pedido dentro de una transacción (todo o nada)
        return DB::transaction(function () use ($budget) {
            // Generar número de pedido único
            $orderNumber = self::generateOrderNumber($budget->company_id);

            // ╔════════════════════════════════════════════════════════════════╗
            // ║ 1. CREAR PEDIDO                                                ║
            // ╚════════════════════════════════════════════════════════════════╝

            $order = Order::create([
                'company_id' => $budget->company_id,
                'budget_id' => $budget->id,
                'client_id' => $budget->client_id,
                'order_number' => $orderNumber,
                'order_date' => now()->toDateString(),
                'estimated_delivery' => now()->addDays(14)->toDateString(), // 14 días por defecto
                'status' => 'pendiente',
                'base_amount' => $budget->base_amount,
                'tax_amount' => $budget->tax_amount,
                'total_amount' => $budget->total_amount,
                'notes' => $budget->notes,
                'created_by_user_id' => auth()->id(), // Usuario que acepta el presupuesto
            ]);

            // ╔════════════════════════════════════════════════════════════════╗
            // ║ 2. COPIAR LÍNEAS DEL PRESUPUESTO AL PEDIDO                    ║
            // ╚════════════════════════════════════════════════════════════════╝

            foreach ($budget->lines as $budgetLine) {
                // Crear línea del pedido
                $orderLine = $order->lines()->create([
                    'article_type' => $budgetLine->article_type,
                    'standard_article_id' => $budgetLine->standard_article_id,
                    'configurable_article_id' => $budgetLine->configurable_article_id,
                    'name' => $budgetLine->name,
                    'description' => $budgetLine->description,
                    'quantity' => $budgetLine->quantity,
                    'unit_price' => $budgetLine->unit_price,
                    'gross_subtotal' => $budgetLine->gross_subtotal,
                    'discount_percentage' => $budgetLine->discount_percentage,
                    'discount_amount' => $budgetLine->discount_amount,
                    'net_subtotal' => $budgetLine->net_subtotal,
                    'tax_percentage' => $budgetLine->tax_percentage,
                    'tax_amount' => $budgetLine->tax_amount,
                    'total_amount' => $budgetLine->total_amount,
                    'position' => $budgetLine->position,
                ]);

                // ╔════════════════════════════════════════════════════════════════╗
                // ║ 3. SI ES CONFIGURABLE, COPIAR MEDIDAS DE FABRICACIÓN         ║
                // ╚════════════════════════════════════════════════════════════════╝

                if ($budgetLine->configurable_article_id && $budgetLine->configuration) {
                    $orderLine->configuration()->create([
                        'ancho_hueco'          => $budgetLine->configuration->ancho_hueco,
                        'alto_hueco'           => $budgetLine->configuration->alto_hueco,
                        'ancho_obra'           => $budgetLine->configuration->ancho_obra,
                        'alto_obra'            => $budgetLine->configuration->alto_obra,
                        'paso_deseado'         => $budgetLine->configuration->paso_deseado,
                        'options_chosen'       => $budgetLine->configuration->options_chosen,
                        'price_breakdown'      => $budgetLine->configuration->price_breakdown,
                        'fabrication_measures' => $budgetLine->configuration->fabrication_measures,
                    ]);
                }
            }

            // Retornar pedido completo
            return $order->load(['client', 'createdBy', 'lines.standardArticle', 'lines.configurableArticle', 'lines.configuration']);
        });
    }

    /**
     * Genera número único de pedido (ej: 2026-00001)
     */
    private static function generateOrderNumber(int $companyId): string
    {
        $year = now()->year;

        // Buscar último pedido de la empresa en este año
        $lastOrder = Order::where('company_id', $companyId)
            ->where('order_number', 'like', $year . '-%')
            ->orderByDesc('order_number')
            ->first();

        if (!$lastOrder) {
            return $year . '-00001';
        }

        // Extraer número secuencial y aumentar
        $lastSequence = (int) substr($lastOrder->order_number, -5);
        $nextSequence = $lastSequence + 1;

        return $year . '-' . str_pad((string) $nextSequence, 5, '0', STR_PAD_LEFT);
    }
}
