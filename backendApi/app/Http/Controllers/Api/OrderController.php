<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\OrderListadoResource;
use App\Http\Resources\OrderResource;
use App\Models\Order;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class OrderController extends Controller
{
    // Aqui valido acceso a pedidos para roles permitidos de la empresa.

    private function authorize(Request $request)
    {
        // Aqui leo el usuario autenticado de la request.
        $user = $request->user();

        if (!$user) {
            return response()->json(['error' => 'No autenticado'], 401);
        }

        // Aqui limito acceso solo a admin, commercial y technician.
        $allowed = ['admin', 'commercial', 'technician'];
        if (!in_array($user->role, $allowed, true)) {
            return response()->json(['error' => 'No autorizado. Solo admin, commercial o technician.'], 403);
        }

        if (!$user->company_id) {
            return response()->json(['error' => 'Usuario sin empresa asignada.'], 422);
        }

        return null; // Sin error = autorizado
    }

    // Aqui listo pedidos de la empresa con filtro opcional por estado.

    public function index(Request $request)
    {
        // Aqui valido permisos antes de consultar pedidos.
        $authError = $this->authorize($request);
        if ($authError) {
            return $authError;
        }

        $companyId = $request->user()->company_id;

        // Aqui leo filtro opcional por estado.
        $status = $request->query('status'); // 'pendiente', 'en_curso', 'finalizado'

        // Aqui construyo consulta minima para el panel de listado.
        $query = Order::where('company_id', $companyId)
            ->select(['id', 'company_id', 'client_id', 'order_number', 'order_date', 'status', 'total_amount'])
            ->with(['client:id,nombre'])
            ->orderByDesc('order_date');

        // Si llega estado valido, aplico el filtro.
        if ($status && in_array($status, ['pendiente', 'en_curso', 'finalizado'])) {
            $query->where('status', $status);
        }

        $orders = $query->get();

        return response()->json([
            // Entrada: pedidos de la empresa para la tabla.
            // Salida: listado transformado por Resource.
            'orders' => OrderListadoResource::collection($orders)->resolve($request),
        ]);
    }

    // Aqui devuelvo el detalle de un pedido de la empresa autenticada.

    public function show(Request $request, int $id)
    {
        // Aqui valido permisos antes de ver detalle.
        $authError = $this->authorize($request);
        if ($authError) {
            return $authError;
        }

        $companyId = $request->user()->company_id;

        // Aqui cargo solo relaciones necesarias para pantalla de detalle.
        $order = Order::where('company_id', $companyId)
            ->with(['client:id,nombre', 'lines.configuration'])
            ->find($id);

        if (!$order) {
            return response()->json(['error' => 'Pedido no encontrado en tu empresa.'], 404);
        }

        return response()->json([
            // Entrada: pedido encontrado con datos necesarios.
            // Salida: pedido transformado por Resource de detalle.
            'order' => (new OrderResource($order))->resolve($request),
        ]);
    }

    // Aqui actualizo estado y fecha de entrega de un pedido.

    public function update(Request $request, int $id)
    {
        // Aqui valido permisos antes de actualizar.
        $authError = $this->authorize($request);
        if ($authError) {
            return $authError;
        }

        $companyId = $request->user()->company_id;

        // Aqui busco el pedido dentro de la empresa actual.
        $order = Order::where('company_id', $companyId)->find($id);

        if (!$order) {
            return response()->json(['error' => 'Pedido no encontrado en tu empresa.'], 404);
        }

        // Aqui valido estado nuevo y fecha de entrega opcional.
        $validated = $request->validate([
            'status' => [
                'required',
                Rule::in(['pendiente', 'en_curso', 'finalizado']),
            ],
            'delivery_date' => 'nullable|date',
        ]);

        // Aqui persisto cambios de estado y entrega.
        $order->update([
            'status' => $validated['status'],
            'delivery_date' => $validated['delivery_date'] ?? null,
        ]);

        return response()->json([
            'message' => 'Pedido actualizado correctamente.',
            // Entrada: pedido actualizado.
            // Salida: pedido actualizado transformado por Resource.
            'order' => (new OrderResource(
                $order->fresh()->load(['client:id,nombre', 'lines.configuration'])
            ))->resolve($request),
        ]);
    }
}
