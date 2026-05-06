<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Company;
use Illuminate\Http\Request;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

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

            // 👤 ADMIN DE LA EMPRESA
            'admin_name' => 'required|string',
            'admin_email' => 'required|email|unique:users,email',
            'admin_password' => 'required|string|min:6',
            'admin_dni' => 'required|string',
            'admin_phone' => 'nullable|string',
            'admin_address' => 'nullable|string',
            'admin_city' => 'nullable|string',
            'admin_province' => 'nullable|string',
        ]);

        // 🏢 1. CREAR EMPRESA
        $company = Company::create([
            'fiscal_name' => $request->fiscal_name,
            'commercial_name' => $request->commercial_name,
            'cif_nif' => $request->cif_nif,
            'email' => $request->email,
            'address' => $request->address,
            'phone' => $request->phone,
            'phone2' => $request->phone2,
            'city' => $request->city,
            'province' => $request->province,
            'postal_code' => $request->postal_code,
            'logo' => $request->logo,
            'max_users' => $request->max_users ?? 5,
            'active' => true,
        ]);

        // 👤 2. CREAR ADMIN AUTOMÁTICO
        $admin = User::create([
            'company_id' => $company->id,
            'name' => $request->admin_name,
            'email' => $request->admin_email,
            'password' => Hash::make($request->admin_password),
            'dni' => $request->admin_dni,
            'phone' => $request->admin_phone,
            'address' => $request->admin_address,
            'city' => $request->admin_city,
            'province' => $request->admin_province,
            'role' => 'admin',
            'active' => true,
        ]);

        return response()->json([
            'message' => 'Empresa creada correctamente',
            'company' => $company,
            'admin' => $admin,
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
            'company' => $company,

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

        if ($company->users()->count() > 0) {
            $company->users()->delete(); 
        }

        $company->delete();

        return response()->json([
            'message' => 'Empresa eliminada correctamente'
        ]);
    }
}
