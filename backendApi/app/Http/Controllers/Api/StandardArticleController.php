<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\StandardArticle;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;

class StandardArticleController extends Controller
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
                'error' => 'No autorizado. Solo admin puede crear o editar artículos.',
            ], 403);
        }

        if (!$user->company_id) {
            return response()->json([
                'error' => 'Usuario sin empresa asignada.',
            ], 422);
        }

        return null;
    }

    // Listar artículos de la empresa (admin/commercial)
    public function index(Request $request)
    {
        $authError = $this->authorizeAdminOrCommercial($request);
        if ($authError) {
            return $authError;
        }

        $companyId = $request->user()->company_id;

        $articles = StandardArticle::where('company_id', $companyId)
            ->orderBy('code')
            ->get();

        return response()->json([
            'articles' => $articles,
        ]);
    }

    // Ver artículo de la empresa (admin/commercial)
    public function show(Request $request, int $id)
    {
        $authError = $this->authorizeAdminOrCommercial($request);
        if ($authError) {
            return $authError;
        }

        $companyId = $request->user()->company_id;

        $article = StandardArticle::where('company_id', $companyId)
            ->where('id', $id)
            ->first();

        if (!$article) {
            return response()->json([
                'error' => 'Artículo no encontrado en tu empresa.',
            ], 404);
        }

        return response()->json([
            'article' => $article,
        ]);
    }

    // Crear artículo (solo admin)
    public function store(Request $request)
    {
        $authError = $this->authorizeAdmin($request);
        if ($authError) {
            return $authError;
        }

        $companyId = $request->user()->company_id;

        $validated = $request->validate([
            'code' => [
                'required',
                'string',
                'max:100',
                Rule::unique('standard_articles')->where(function ($query) use ($companyId) {
                    return $query->where('company_id', $companyId);
                }),
            ],
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'base_price' => 'required|numeric|min:0',
            'tax_percentage' => 'nullable|numeric|min:0|max:100',
            'active' => 'nullable|boolean',
            'image' => 'nullable|image|max:30720',
        ], [
            'code.required' => 'El código es obligatorio.',
            'code.unique' => 'Este código ya existe en tu empresa.',
            'name.required' => 'El nombre es obligatorio.',
            'base_price.required' => 'El precio base es obligatorio.',
            'image.image' => 'El archivo debe ser una imagen válida.',
            'image.max' => 'La imagen no puede superar 30MB.',
        ]);

        $imagePath = null;
        if ($request->hasFile('image')) {
            $imagePath = $request->file('image')->store('standard-articles', 'public');
        }

        $article = StandardArticle::create([
            'company_id' => $companyId,
            'code' => trim($validated['code']),
            'name' => trim($validated['name']),
            'description' => $validated['description'] ?? null,
            'image' => $imagePath,
            'base_price' => $validated['base_price'],
            'tax_percentage' => $validated['tax_percentage'] ?? 21,
            'active' => $validated['active'] ?? true,
        ]);

        return response()->json([
            'message' => 'Artículo creado correctamente.',
            'article' => $article,
        ], 201);
    }

    // Editar artículo (solo admin)
    public function update(Request $request, int $id)
    {
        $authError = $this->authorizeAdmin($request);
        if ($authError) {
            return $authError;
        }

        $companyId = $request->user()->company_id;

        $article = StandardArticle::where('company_id', $companyId)
            ->where('id', $id)
            ->first();

        if (!$article) {
            return response()->json([
                'error' => 'Artículo no encontrado en tu empresa.',
            ], 404);
        }

        $validated = $request->validate([
            'code' => [
                'sometimes',
                'required',
                'string',
                'max:100',
                Rule::unique('standard_articles')
                    ->where(function ($query) use ($companyId) {
                        return $query->where('company_id', $companyId);
                    })
                    ->ignore($article->id),
            ],
            'name' => 'sometimes|required|string|max:255',
            'description' => 'sometimes|nullable|string',
            'base_price' => 'sometimes|required|numeric|min:0',
            'tax_percentage' => 'sometimes|nullable|numeric|min:0|max:100',
            'active' => 'sometimes|boolean',
            'image' => 'sometimes|nullable|image|max:30720',
        ], [
            'code.required' => 'El código es obligatorio.',
            'code.unique' => 'Este código ya existe en tu empresa.',
            'name.required' => 'El nombre es obligatorio.',
            'base_price.required' => 'El precio base es obligatorio.',
            'image.image' => 'El archivo debe ser una imagen válida.',
            'image.max' => 'La imagen no puede superar 30MB.',
        ]);

        $updateData = [
            'code' => $request->has('code') ? trim($validated['code']) : $article->code,
            'name' => $request->has('name') ? trim($validated['name']) : $article->name,
            'description' => $request->has('description') ? $validated['description'] : $article->description,
            'base_price' => $request->has('base_price') ? $validated['base_price'] : $article->base_price,
            'tax_percentage' => $request->has('tax_percentage') ? ($validated['tax_percentage'] ?? null) : $article->tax_percentage,
            'active' => $request->has('active') ? (bool) $validated['active'] : $article->active,
        ];

        if ($request->hasFile('image')) {
            if ($article->image) {
                Storage::disk('public')->delete($article->image);
            }
            $updateData['image'] = $request->file('image')->store('standard-articles', 'public');
        }

        $article->update($updateData);

        return response()->json([
            'message' => 'Artículo actualizado correctamente.',
            'article' => $article->fresh(),
        ]);
    }
}
