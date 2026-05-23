<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\OrderLine;
use App\Models\OrderLineConfiguration;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\Rule;

class OrderController extends Controller
{
    // ╔════════════════════════════════════════════════════════════════╗
    // ║ AUTORIZACIÓN (solo admin, commercial, technician)            ║
    // ╚════════════════════════════════════════════════════════════════╝

    private function authorize(Request $request)
    {
        $user = $request->user();

        if (!$user) {
            return response()->json(['error' => 'No autenticado'], 401);
        }

        // Permitir estos roles
        $allowed = ['admin', 'commercial', 'technician'];
        if (!in_array($user->role, $allowed, true)) {
            return response()->json(['error' => 'No autorizado. Solo admin, commercial o technician.'], 403);
        }

        if (!$user->company_id) {
            return response()->json(['error' => 'Usuario sin empresa asignada.'], 422);
        }

        return null; // Sin error = autorizado
    }

    // ╔════════════════════════════════════════════════════════════════╗
    // ║ GET /api/company/orders                                        ║
    // ║ Listar pedidos de la empresa                                   ║
    // ╚════════════════════════════════════════════════════════════════╝

    public function index(Request $request)
    {
        // Verificar autorización
        $authError = $this->authorize($request);
        if ($authError) {
            return $authError;
        }

        $companyId = $request->user()->company_id;

        // Filtro por estado (opcional)
        $status = $request->query('status'); // 'pendiente', 'en_curso', 'finalizado'

        // Construir consulta
        $query = Order::where('company_id', $companyId)
            ->with(['client', 'createdBy', 'lines.standardArticle', 'lines.configurableArticle', 'lines.configuration'])
            ->orderByDesc('order_date');

        // Si viene filtro de estado, aplicarlo
        if ($status && in_array($status, ['pendiente', 'en_curso', 'finalizado'])) {
            $query->where('status', $status);
        }

        $orders = $query->get();

        return response()->json([
            'orders' => $orders,
        ]);
    }

    // ╔════════════════════════════════════════════════════════════════╗
    // ║ GET /api/company/orders/{id}                                   ║
    // ║ Ver detalle de un pedido                                       ║
    // ╚════════════════════════════════════════════════════════════════╝

    public function show(Request $request, int $id)
    {
        // Verificar autorización
        $authError = $this->authorize($request);
        if ($authError) {
            return $authError;
        }

        $companyId = $request->user()->company_id;

        // Buscar pedido en la empresa del usuario
        $order = Order::where('company_id', $companyId)
            ->with(['client', 'createdBy', 'lines.standardArticle', 'lines.configurableArticle', 'lines.configuration'])
            ->find($id);

        if (!$order) {
            return response()->json(['error' => 'Pedido no encontrado en tu empresa.'], 404);
        }

        return response()->json([
            'order' => $order,
        ]);
    }

    // ╔════════════════════════════════════════════════════════════════╗
    // ║ PUT /api/company/orders/{id}                                   ║
    // ║ Actualizar estado del pedido                                   ║
    // ║ Estados: pendiente → en_curso → finalizado                    ║
    // ╚════════════════════════════════════════════════════════════════╝

    public function update(Request $request, int $id)
    {
        // Verificar autorización
        $authError = $this->authorize($request);
        if ($authError) {
            return $authError;
        }

        $companyId = $request->user()->company_id;

        // Buscar pedido
        $order = Order::where('company_id', $companyId)->find($id);

        if (!$order) {
            return response()->json(['error' => 'Pedido no encontrado en tu empresa.'], 404);
        }

        // Validar nuevo estado
        $validated = $request->validate([
            'status' => [
                'required',
                Rule::in(['pendiente', 'en_curso', 'finalizado']),
            ],
            'delivery_date' => 'nullable|date',
        ]);

        // Actualizar estado
        $order->update([
            'status' => $validated['status'],
            'delivery_date' => $validated['delivery_date'] ?? null,
        ]);

        return response()->json([
            'message' => 'Pedido actualizado correctamente.',
            'order' => $order->fresh()->load(['client', 'createdBy', 'lines.standardArticle', 'lines.configurableArticle', 'lines.configuration']),
        ]);
    }
}
