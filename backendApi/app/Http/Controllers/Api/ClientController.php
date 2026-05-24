<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\ClientResource;
use App\Models\Client;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class ClientController extends Controller
{
    // Aqui valido permisos base para todas las acciones de clientes.
    // Solo dejo pasar si hay usuario autenticado, rol correcto y empresa asignada.
    private function authorizeAdminOrCommercial(Request $request)
    {
        // Aqui recojo el usuario autenticado desde el token de la request.
        $user = $request->user();

        // Si no hay usuario, corto con 401 para evitar seguir con logica interna.
        if (!$user) {
            return response()->json([
                'error' => 'No autenticado',
            ], 401);
        }

        // Solo permito admin/commercial para gestionar clientes de empresa.
        if (!in_array($user->role, ['admin', 'commercial'], true)) {
            return response()->json([
                'error' => 'No autorizado. Solo admin o commercial.',
            ], 403);
        }

        // Si el usuario no tiene empresa, no puedo acotar consultas por company_id.
        if (!$user->company_id) {
            return response()->json([
                'error' => 'Usuario sin empresa asignada.',
            ], 422);
        }

        // Si todo esta bien, devuelvo null para que el flujo continue.
        return null;
    }

    // Aqui listo clientes de la empresa logueada con busqueda y paginacion opcional.
    public function index(Request $request)
    {
        // Primero valido permisos comunes antes de tocar datos.
        $authError = $this->authorizeAdminOrCommercial($request);
        if ($authError) {
            return $authError;
        }

        // Aqui saco datos base de contexto para construir la consulta.
        $companyId = $request->user()->company_id;
        $search = trim((string) $request->query('search', ''));

        // Empiezo siempre acotando por empresa para no mezclar clientes de otras cuentas.
        $clientsQuery = Client::where('company_id', $companyId);

        // Si llega texto de busqueda, filtro por los campos mas usados en panel.
        if ($search !== '') {
            $clientsQuery->where(function ($query) use ($search) {
                $query->where('client_number', 'like', "%{$search}%")
                    ->orWhere('dni', 'like', "%{$search}%")
                    ->orWhere('nombre', 'like', "%{$search}%")
                    ->orWhere('direccion', 'like', "%{$search}%")
                    ->orWhere('poblacion', 'like', "%{$search}%")
                    ->orWhere('codigo_postal', 'like', "%{$search}%")
                    ->orWhere('provincia', 'like', "%{$search}%")
                    ->orWhere('telefono', 'like', "%{$search}%")
                    ->orWhere('telefono2', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%");
            });
        }

        // Ordeno por numero de cliente para mantener consistencia visual en frontend.
        $clientsQuery->orderBy('client_number');

        // Si llega paginate=1, devuelvo solo una página y metadatos.
        // Si no llega, mantengo respuesta completa para no romper otros módulos.
        $usarPaginacion = filter_var($request->query('paginate', false), FILTER_VALIDATE_BOOLEAN);

        // En modo paginado devuelvo data+meta+links para ControlesPaginacion.
        if ($usarPaginacion) {
            // Protejo per_page con minimo y maximo para evitar cargas extremas.
            $perPage = (int) $request->query('per_page', 10);
            if ($perPage < 1) {
                $perPage = 10;
            }
            if ($perPage > 100) {
                $perPage = 100;
            }

            // Pagino y conservo query params para que links/meta respeten filtros activos.
            $clients = $clientsQuery
                ->paginate($perPage)
                ->appends($request->query());

            // Devuelvo Resource collection paginada con mensaje uniforme de API.
            return ClientResource::collection($clients)
                ->additional([
                    'message' => 'Listado de clientes obtenido correctamente',
                ]);
        }

        // En modo legacy devuelvo la coleccion completa para endpoints antiguos.
        $clients = $clientsQuery->get();

        return response()->json([
            // Entrada: colección completa de clientes de la empresa autenticada.
            // Salida: colección transformada por Resource con formato estable.
            'clients' => ClientResource::collection($clients),
        ]);
    }

    // Aqui obtengo un cliente concreto por id, siempre dentro de la empresa del usuario.
    public function show(Request $request, int $id)
    {
        // Reutilizo la misma puerta de seguridad para no repetir validaciones.
        $authError = $this->authorizeAdminOrCommercial($request);
        if ($authError) {
            return $authError;
        }

        // Acoto la busqueda por empresa + id para evitar fugas de datos entre empresas.
        $companyId = $request->user()->company_id;

        $client = Client::where('company_id', $companyId)
            ->where('id', $id)
            ->first();

        // Si no existe en esta empresa, respondo 404 claro.
        if (!$client) {
            return response()->json([
                'error' => 'Cliente no encontrado en tu empresa',
            ], 404);
        }

        return response()->json([
            // Entrada: cliente encontrado por empresa + id.
            // Salida: objeto cliente transformado por Resource.
            'client' => new ClientResource($client),
        ]);
    }

    // Aqui creo un cliente nuevo y le asigno numero consecutivo por empresa.
    // Nota: el 00000 se reserva para cliente contado.
    public function store(Request $request)
    {
        // Valido permisos de entrada antes de crear nada.
        $authError = $this->authorizeAdminOrCommercial($request);
        if ($authError) {
            return $authError;
        }

        // Saco company_id desde usuario autenticado para no confiar en datos del frontend.
        $companyId = $request->user()->company_id;

        // Aqui valido datos de negocio y unicidad de DNI dentro de la misma empresa.
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

        // Calculo siguiente numero correlativo de cliente dentro de la empresa.
        $maxNumber = (int) Client::where('company_id', $companyId)->max('client_number');
        $nextNumber = $maxNumber + 1;

        // Dejo un minimo de 1 para evitar numeracion invalida.
        if ($nextNumber < 1) {
            $nextNumber = 1;
        }

        // Formateo a 5 digitos (ej: 00001) para mantener convencion visual.
        $nextNumberFormatted = str_pad((string) $nextNumber, 5, '0', STR_PAD_LEFT);

        // Creo cliente con company_id forzado desde backend.
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
            // Entrada: cliente recién creado.
            // Salida: cliente transformado por Resource.
            'client' => new ClientResource($client),
        ], 201);
    }

    // Aqui actualizo un cliente existente, siempre limitado a la misma empresa.
    public function update(Request $request, int $id)
    {
        // Revalido permisos comunes para esta operacion.
        $authError = $this->authorizeAdminOrCommercial($request);
        if ($authError) {
            return $authError;
        }

        // Trabajo con company_id del usuario para proteger multiempresa.
        $companyId = $request->user()->company_id;

        // Busco cliente exacto por empresa + id.
        $client = Client::where('company_id', $companyId)
            ->where('id', $id)
            ->first();

        // Si no existe en esta empresa, corto con 404.
        if (!$client) {
            return response()->json([
                'error' => 'Cliente no encontrado en tu empresa',
            ], 404);
        }

        // Validacion parcial (sometimes) para permitir updates por campos sueltos.
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

        // Actualizo campo a campo, manteniendo valor actual cuando no llega en la request.
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
            // Entrada: cliente actualizado en BD.
            // Salida: cliente actualizado transformado por Resource.
            'client' => new ClientResource($client->fresh()),
        ]);
    }
}
