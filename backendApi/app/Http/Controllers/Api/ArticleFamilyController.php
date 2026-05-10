<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
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
                'error' => 'No autorizado. Solo admin puede crear o editar familias.',
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
        $authError = $this->authorizeAdminOrCommercial($request);
        if ($authError) {
            return $authError;
        }

        $families = ArticleFamily::where('company_id', $request->user()->company_id)
            ->orderBy('name')
            ->get();

        return response()->json([
            'families' => $families,
        ]);
    }

    public function show(Request $request, int $id)
    {
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
            'family' => $family,
        ]);
    }

    public function store(Request $request)
    {
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
            'family' => $family,
        ], 201);
    }

    public function update(Request $request, int $id)
    {
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
            'family' => $family->fresh(),
        ]);
    }
}
