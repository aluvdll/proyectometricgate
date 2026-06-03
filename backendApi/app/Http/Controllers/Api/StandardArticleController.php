<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\StandardArticleResource;
use App\Models\StandardArticle;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;

class StandardArticleController extends Controller
{
    private function authorizeReadAccess(Request $request)
    {
        $user = $request->user();

        if (!$user) {
            return response()->json([
                'error' => 'No autenticado',
            ], 401);
        }

        if (!in_array($user->role, ['admin', 'commercial', 'technician'], true)) {
            return response()->json([
                'error' => 'No autorizado. Solo administrador, comercial o técnico.',
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
                'error' => 'No autorizado. Solo el administrador puede crear o editar artículos.',
            ], 403);
        }

        if (!$user->company_id) {
            return response()->json([
                'error' => 'Usuario sin empresa asignada.',
            ], 422);
        }

        return null;
    }

    // Listar artículos de la empresa (admin/commercial/technician)
    public function index(Request $request)
    {
        // Aqui valido permisos de lectura antes de consultar articulos.
        $authError = $this->authorizeReadAccess($request);
        if ($authError) {
            return $authError;
        }

        // Aqui acoto por empresa y solo cargo lo necesario para panel/frontend.
        $companyId = $request->user()->company_id;

        $articles = StandardArticle::with('family')
            ->where('company_id', $companyId)
            ->orderBy('code')
            ->get();

        return response()->json([
            // Entrada: coleccion de articulos de la empresa autenticada.
            // Salida: coleccion transformada por Resource con contrato estable.
            'articles' => StandardArticleResource::collection($articles)->resolve($request),
        ]);
    }

    // Ver artículo de la empresa (admin/commercial/technician)
    public function show(Request $request, int $id)
    {
        // Aqui valido permisos de lectura antes de ver un articulo puntual.
        $authError = $this->authorizeReadAccess($request);
        if ($authError) {
            return $authError;
        }

        // Aqui busco por empresa + id para evitar cruces entre empresas.
        $companyId = $request->user()->company_id;

        $article = StandardArticle::with('family')
            ->where('company_id', $companyId)
            ->where('id', $id)
            ->first();

        if (!$article) {
            return response()->json([
                'error' => 'Artículo no encontrado en tu empresa.',
            ], 404);
        }

        return response()->json([
            // Entrada: articulo encontrado con su familia.
            // Salida: objeto transformado por Resource.
            'article' => (new StandardArticleResource($article))->resolve($request),
        ]);
    }

    // Crear artículo (solo admin)
    public function store(Request $request)
    {
        // Aqui valido permisos de admin antes de crear articulos.
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
            'family_id' => [
                'nullable',
                'integer',
                Rule::exists('article_families', 'id')->where(function ($query) use ($companyId) {
                    return $query->where('company_id', $companyId);
                }),
            ],
            'base_price' => 'required|numeric|min:0',
            'tax_percentage' => 'nullable|numeric|min:0|max:100',
            'active' => 'nullable|boolean',
            'image' => 'nullable|image|max:30720',
        ], [
            'code.required' => 'El código es obligatorio.',
            'code.unique' => 'Este código ya existe en tu empresa.',
            'name.required' => 'El nombre es obligatorio.',
            'family_id.exists' => 'La familia seleccionada no pertenece a tu empresa.',
            'base_price.required' => 'El precio base es obligatorio.',
            'image.image' => 'El archivo debe ser una imagen válida.',
            'image.max' => 'La imagen no puede superar 30MB.',
        ]);

        $imagePath = null;
        if ($request->hasFile('image')) {
            $imagePath = $request->file('image')->store('standard-articles', 'public');
        }

        // Aqui creo el articulo forzando company_id desde backend.
        $article = StandardArticle::create([
            'company_id' => $companyId,
            'family_id' => $validated['family_id'] ?? null,
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
            // Entrada: articulo recien creado con familia cargada.
            // Salida: articulo transformado por Resource.
            'article' => (new StandardArticleResource($article->load('family')))->resolve($request),
        ], 201);
    }

    // Editar artículo (solo admin)
    public function update(Request $request, int $id)
    {
        // Aqui valido permisos de admin antes de editar articulos.
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
            'family_id' => [
                'sometimes',
                'nullable',
                'integer',
                Rule::exists('article_families', 'id')->where(function ($query) use ($companyId) {
                    return $query->where('company_id', $companyId);
                }),
            ],
            'base_price' => 'sometimes|required|numeric|min:0',
            'tax_percentage' => 'sometimes|nullable|numeric|min:0|max:100',
            'active' => 'sometimes|boolean',
            'image' => 'sometimes|nullable|image|max:30720',
        ], [
            'code.required' => 'El código es obligatorio.',
            'code.unique' => 'Este código ya existe en tu empresa.',
            'name.required' => 'El nombre es obligatorio.',
            'family_id.exists' => 'La familia seleccionada no pertenece a tu empresa.',
            'base_price.required' => 'El precio base es obligatorio.',
            'image.image' => 'El archivo debe ser una imagen válida.',
            'image.max' => 'La imagen no puede superar 30MB.',
        ]);

        $updateData = [
            'family_id' => $request->has('family_id') ? ($validated['family_id'] ?? null) : $article->family_id,
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
            // Entrada: articulo actualizado refrescado con familia.
            // Salida: articulo transformado por Resource.
            'article' => (new StandardArticleResource($article->fresh()->load('family')))->resolve($request),
        ]);
    }
}
