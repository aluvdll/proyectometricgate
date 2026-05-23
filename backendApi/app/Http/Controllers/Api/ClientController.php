<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Client;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class ClientController extends Controller
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

    // Listar clientes de la empresa del usuario logueado
    public function index(Request $request)
    {
        $authError = $this->authorizeAdminOrCommercial($request);
        if ($authError) {
            return $authError;
        }

        $companyId = $request->user()->company_id;

        $clients = Client::where('company_id', $companyId)
            ->orderBy('client_number')
            ->get();

        return response()->json([
            'clients' => $clients,
        ]);
    }

    // Ver un cliente de la empresa del usuario logueado
    public function show(Request $request, int $id)
    {
        $authError = $this->authorizeAdminOrCommercial($request);
        if ($authError) {
            return $authError;
        }

        $companyId = $request->user()->company_id;

        $client = Client::where('company_id', $companyId)
            ->where('id', $id)
            ->first();

        if (!$client) {
            return response()->json([
                'error' => 'Cliente no encontrado en tu empresa',
            ], 404);
        }

        return response()->json([
            'client' => $client,
        ]);
    }

    // Crear cliente con numero consecutivo por empresa (0 reservado para contado)
    public function store(Request $request)
    {
        $authError = $this->authorizeAdminOrCommercial($request);
        if ($authError) {
            return $authError;
        }

        $companyId = $request->user()->company_id;

        $request->validate([
            'dni' => [
                'required',
                'string',
                Rule::unique('clients')->where(function ($query) use ($companyId) {
                    return $query->where('company_id', $companyId);
                }),
            ],
            'nombre' => 'required|string|max:255',
            'direccion' => 'required|string|max:255',
            'poblacion' => 'required|string|max:255',
            'codigo_postal' => 'required|string|max:20',
            'provincia' => 'required|string|max:255',
            'telefono' => 'nullable|string|max:30',
            'telefono2' => 'nullable|string|max:30',
            'email' => 'nullable|email|max:255',
        ], [
            'dni.unique' => 'Ya existe un cliente con ese DNI en tu empresa.',
        ]);

        $maxNumber = (int) Client::where('company_id', $companyId)->max('client_number');
        $nextNumber = $maxNumber + 1;

        if ($nextNumber < 1) {
            $nextNumber = 1;
        }

        $nextNumberFormatted = str_pad((string) $nextNumber, 5, '0', STR_PAD_LEFT);

        $client = Client::create([
            'company_id' => $companyId,
            'client_number' => $nextNumberFormatted,
            'dni' => $request->dni,
            'nombre' => $request->nombre,
            'direccion' => $request->direccion,
            'poblacion' => $request->poblacion,
            'codigo_postal' => $request->codigo_postal,
            'provincia' => $request->provincia,
            'telefono' => $request->telefono,
            'telefono2' => $request->telefono2,
            'email' => $request->email,
            'active' => true,
        ]);

        return response()->json([
            'message' => 'Cliente creado correctamente',
            'client' => $client,
        ], 201);
    }

    // Editar cliente de la misma empresa
    public function update(Request $request, int $id)
    {
        $authError = $this->authorizeAdminOrCommercial($request);
        if ($authError) {
            return $authError;
        }

        $companyId = $request->user()->company_id;

        $client = Client::where('company_id', $companyId)
            ->where('id', $id)
            ->first();

        if (!$client) {
            return response()->json([
                'error' => 'Cliente no encontrado en tu empresa',
            ], 404);
        }

        $request->validate([
            'dni' => [
                'sometimes',
                'required',
                'string',
                Rule::unique('clients')
                    ->where(function ($query) use ($companyId) {
                        return $query->where('company_id', $companyId);
                    })
                    ->ignore($client->id),
            ],
            'nombre' => 'sometimes|required|string|max:255',
            'direccion' => 'sometimes|required|string|max:255',
            'poblacion' => 'sometimes|required|string|max:255',
            'codigo_postal' => 'sometimes|required|string|max:20',
            'provincia' => 'sometimes|required|string|max:255',
            'telefono' => 'sometimes|nullable|string|max:30',
            'telefono2' => 'sometimes|nullable|string|max:30',
            'email' => 'sometimes|nullable|email|max:255',
            'active' => 'sometimes|boolean',
        ]);

        // Cliente contado (nº 0): no permitir cambiar DNI para no romper regla especial
        if ($client->client_number === '00000' && $request->has('dni')) {
            return response()->json([
                'error' => 'No se puede modificar el DNI del cliente contado (nº 0).',
            ], 422);
        }

        $client->update([
            'dni' => $request->has('dni') ? $request->dni : $client->dni,
            'nombre' => $request->has('nombre') ? $request->nombre : $client->nombre,
            'direccion' => $request->has('direccion') ? $request->direccion : $client->direccion,
            'poblacion' => $request->has('poblacion') ? $request->poblacion : $client->poblacion,
            'codigo_postal' => $request->has('codigo_postal') ? $request->codigo_postal : $client->codigo_postal,
            'provincia' => $request->has('provincia') ? $request->provincia : $client->provincia,
            'telefono' => $request->has('telefono') ? $request->telefono : $client->telefono,
            'telefono2' => $request->has('telefono2') ? $request->telefono2 : $client->telefono2,
            'email' => $request->has('email') ? $request->email : $client->email,
            'active' => $request->has('active') ? (bool) $request->active : $client->active,
        ]);

        return response()->json([
            'message' => 'Cliente actualizado correctamente',
            'client' => $client->fresh(),
        ]);
    }
}
