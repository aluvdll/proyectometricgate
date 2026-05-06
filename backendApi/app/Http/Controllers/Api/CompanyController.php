<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Company;
use Illuminate\Http\Request;

class CompanyController extends Controller
{
    // 📄 listar empresas (solo super admin)
    public function index()
    {
        return response()->json([
            'companies' => Company::all()
        ]);
    }

    // 👁 VER UNA EMPRESA
    public function show($id)
    {
        $company = Company::find($id);

        if (!$company) {
            return response()->json([
                'error' => 'Empresa no encontrada'
            ], 404);
        }

        return response()->json($company);
    }

    // ➕ CREAR EMPRESA
    public function store(Request $request)
    {
        $request->validate([
            'fiscal_name' => 'required|string|max:255',
            'commercial_name' => 'nullable|string|max:255',
            'cif_nif' => 'required|string|max:50|unique:companies,cif_nif',
            'email' => 'nullable|email|unique:companies,email',
            'address' => 'nullable|string|max:255',
            'phone' => 'nullable|string|max:20',
            'phone2' => 'nullable|string|max:20',
            'city' => 'nullable|string|max:100',
            'province' => 'nullable|string|max:100',
            'postal_code' => 'nullable|string|max:20',
            'logo' => 'nullable|string|max:255',
            'active' => 'boolean',
            'max_users' => 'nullable|integer|min:1',
        ]);

        $company = Company::create($request->all());

        return response()->json([
            'message' => 'Empresa creada correctamente',
            'company' => $company
        ], 201);
    }

    // ✏️ ACTUALIZAR EMPRESA
    public function update(Request $request, $id)
    {
        $company = Company::find($id);

        if (!$company) {
            return response()->json([
                'error' => 'Empresa no encontrada'
            ], 404);
        }

        $request->validate([
            'fiscal_name' => 'sometimes|string|max:255',
            'commercial_name' => 'nullable|string|max:255',
            'cif_nif' => 'sometimes|string|max:50|unique:companies,cif_nif,' . $id,
            'email' => 'nullable|email|unique:companies,email,' . $id,
            'address' => 'nullable|string|max:255',
            'phone' => 'nullable|string|max:20',
            'phone2' => 'nullable|string|max:20',
            'city' => 'nullable|string|max:100',
            'province' => 'nullable|string|max:100',
            'postal_code' => 'nullable|string|max:20',
            'logo' => 'nullable|string|max:255',
            'active' => 'boolean',
            'max_users' => 'nullable|integer|min:1',
        ]);

        $company->update($request->all());

        return response()->json([
            'message' => 'Empresa actualizada correctamente',
            'company' => $company
        ]);
    }

    // ❌ ELIMINAR EMPRESA
    public function destroy($id)
    {
        $company = Company::find($id);

        if (!$company) {
            return response()->json([
                'error' => 'Empresa no encontrada'
            ], 404);
        }

        $company->delete();

        return response()->json([
            'message' => 'Empresa eliminada correctamente'
        ]);
    }
}
