<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\ArticleFamilyResource;
use App\Models\ArticleFamily;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class ArticleFamilyController extends Controller
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
                'error' => 'No autorizado. Solo administrador o comercial.',
            ], 403);
        }

        if (!$user->company_id) {
            return response()->json([
                'error' => 'Usuario sin empresa asignada.',
            ], 422);
        }

        return null;
    }

    private function authorizeAdmin(Request $request)
    {
        $user = $request->user();

        if (!$user) {
            return response()->json([
                'error' => 'No autenticado',
            ], 401);
        }

        if ($user->role !== 'admin') {
            return response()->json([
                'error' => 'No autorizado. Solo el administrador puede crear o editar familias.',
            ], 403);
        }

        if (!$user->company_id) {
            return response()->json([
                'error' => 'Usuario sin empresa asignada.',
            ], 422);
        }

        return null;
    }

    public function index(Request $request)
    {
        // Aqui valido permisos antes de listar familias.
        $authError = $this->authorizeAdminOrCommercial($request);
        if ($authError) {
            return $authError;
        }

        // Aqui traigo solo familias de la empresa autenticada ordenadas por nombre.
        $families = ArticleFamily::where('company_id', $request->user()->company_id)
            ->orderBy('name')
            ->get();

        return response()->json([
            // Entrada: coleccion de familias de la empresa.
            // Salida: coleccion transformada por Resource.
            'families' => ArticleFamilyResource::collection($families)->resolve($request),
        ]);
    }

    public function show(Request $request, int $id)
    {
        // Aqui valido permisos antes de ver una familia puntual.
        $authError = $this->authorizeAdminOrCommercial($request);
        if ($authError) {
            return $authError;
        }

        $family = ArticleFamily::where('company_id', $request->user()->company_id)
            ->where('id', $id)
            ->first();

        if (!$family) {
            return response()->json([
                'error' => 'Familia no encontrada en tu empresa.',
            ], 404);
        }

        return response()->json([
            // Entrada: familia encontrada por empresa + id.
            // Salida: familia transformada por Resource.
            'family' => (new ArticleFamilyResource($family))->resolve($request),
        ]);
    }

    public function store(Request $request)
    {
        // Aqui valido permisos de admin antes de crear familias.
        $authError = $this->authorizeAdmin($request);
        if ($authError) {
            return $authError;
        }

        $companyId = $request->user()->company_id;

        $validated = $request->validate([
            'name' => [
                'required',
                'string',
                'max:255',
                Rule::unique('article_families')->where(function ($query) use ($companyId) {
                    return $query->where('company_id', $companyId);
                }),
            ],
            'description' => 'nullable|string',
            'active' => 'nullable|boolean',
        ], [
            'name.required' => 'El nombre de la familia es obligatorio.',
            'name.unique' => 'Ya existe una familia con ese nombre en tu empresa.',
        ]);

        $family = ArticleFamily::create([
            'company_id' => $companyId,
            'name' => trim($validated['name']),
            'description' => $validated['description'] ?? null,
            'active' => $validated['active'] ?? true,
        ]);

        return response()->json([
            'message' => 'Familia creada correctamente.',
            // Entrada: familia recien creada.
            // Salida: familia transformada por Resource.
            'family' => (new ArticleFamilyResource($family))->resolve($request),
        ], 201);
    }

    public function update(Request $request, int $id)
    {
        // Aqui valido permisos de admin antes de editar familias.
        $authError = $this->authorizeAdmin($request);
        if ($authError) {
            return $authError;
        }

        $companyId = $request->user()->company_id;

        $family = ArticleFamily::where('company_id', $companyId)
            ->where('id', $id)
            ->first();

        if (!$family) {
            return response()->json([
                'error' => 'Familia no encontrada en tu empresa.',
            ], 404);
        }

        $validated = $request->validate([
            'name' => [
                'sometimes',
                'required',
                'string',
                'max:255',
                Rule::unique('article_families')
                    ->where(function ($query) use ($companyId) {
                        return $query->where('company_id', $companyId);
                    })
                    ->ignore($family->id),
            ],
            'description' => 'sometimes|nullable|string',
            'active' => 'sometimes|boolean',
        ], [
            'name.required' => 'El nombre de la familia es obligatorio.',
            'name.unique' => 'Ya existe una familia con ese nombre en tu empresa.',
        ]);

        $family->update([
            'name' => $request->has('name') ? trim($validated['name']) : $family->name,
            'description' => $request->has('description') ? $validated['description'] : $family->description,
            'active' => $request->has('active') ? (bool) $validated['active'] : $family->active,
        ]);

        return response()->json([
            'message' => 'Familia actualizada correctamente.',
            // Entrada: familia actualizada refrescada.
            // Salida: familia transformada por Resource.
            'family' => (new ArticleFamilyResource($family->fresh()))->resolve($request),
        ]);
    }
}
