<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Company;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class PanelEmpresasController extends Controller
{
    // 📄 Listar empresas para el panel de superadmin
    public function listarEmpresas()
    {
        $empresas = Company::orderByDesc('id')->get();

        return response()->json([
            'empresas' => $empresas,
        ]);
    }

    // 👁️ Ver detalle de una empresa
    public function verEmpresa(int $id)
    {
        $empresa = Company::find($id);

        if (!$empresa) {
            return response()->json([
                'error' => 'Empresa no encontrada',
            ], 404);
        }

        return response()->json([
            'empresa' => $empresa,
        ]);
    }

    // ➕ Dar de alta una empresa y su usuario admin
    public function darDeAltaEmpresa(Request $request)
    {
        $request->validate([
            'fiscal_name' => 'required|string|max:255',
            'commercial_name' => 'nullable|string|max:255',
            'cif_nif' => 'required|string|max:50|unique:companies,cif_nif',
            'email' => 'required|email|unique:companies,email',
            'address' => 'required|string|max:255',
            'phone' => 'required|string|max:20',
            'phone2' => 'nullable|string|max:20',
            'city' => 'required|string|max:100',
            'province' => 'required|string|max:100',
            'postal_code' => 'required|string|max:20',
            'logo' => 'nullable|string|max:255',
            'max_users' => 'nullable|integer|min:1',

            'admin_name' => 'required|string|max:255',
            'admin_email' => 'required|email|same:admin_email_confirmation|unique:users,email',
            'admin_email_confirmation' => 'required|email',
            'admin_password' => 'required|string|min:6|confirmed',
            'admin_password_confirmation' => 'required|string|min:6',
            'admin_dni' => 'required|string|unique:users,dni',
            'admin_phone' => 'nullable|string|max:20',
            'admin_address' => 'nullable|string|max:255',
            'admin_city' => 'nullable|string|max:100',
            'admin_province' => 'nullable|string|max:100',
        ], [
            'admin_email.same' => 'El email del administrador y su confirmación deben coincidir.',
            'admin_email_confirmation.required' => 'Debes confirmar el email del administrador.',
            'admin_email_confirmation.email' => 'El email de confirmación del administrador no es válido.',
            'admin_password.confirmed' => 'La contraseña del administrador y su confirmación deben coincidir.',
            'admin_password_confirmation.required' => 'Debes confirmar la contraseña del administrador.',
            'admin_password_confirmation.min' => 'La confirmación de contraseña debe tener al menos 6 caracteres.',
            'admin_email.unique' => 'El email del administrador ya está registrado.',
            'admin_dni.unique' => 'El DNI del administrador ya está registrado.',
        ]);

        $resultado = DB::transaction(function () use ($request) {
            $empresa = Company::create([
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
                'active' => true,
                'max_users' => $request->max_users ?? 5,
            ]);

            $administrador = User::create([
                'company_id' => $empresa->id,
                'name' => $request->admin_name,
                'email' => $request->admin_email,
                'password' => Hash::make($request->admin_password),
                'dni' => $request->admin_dni,
                // En la tabla users estos campos no aceptan null.
                'phone' => $request->admin_phone ?? '',
                'address' => $request->admin_address ?? '',
                'city' => $request->admin_city ?? '',
                'province' => $request->admin_province ?? '',
                'role' => 'admin',
                'active' => true,
            ]);

            return [
                'empresa' => $empresa,
                'administrador' => $administrador,
            ];
        });

        return response()->json([
            'mensaje' => 'Empresa dada de alta correctamente',
            'empresa' => $resultado['empresa'],
            'administrador' => $resultado['administrador'],
        ], 201);
    }

    // ✏️ Actualizar datos de empresa
    public function actualizarEmpresa(Request $request, int $id)
    {
        $empresa = Company::find($id);

        if (!$empresa) {
            return response()->json([
                'error' => 'Empresa no encontrada',
            ], 404);
        }

        $request->validate([
            'fiscal_name' => 'sometimes|required|string|max:255',
            'commercial_name' => 'nullable|string|max:255',
            'cif_nif' => 'sometimes|required|string|max:50|unique:companies,cif_nif,' . $empresa->id,
            'email' => 'sometimes|required|email|unique:companies,email,' . $empresa->id,
            'address' => 'sometimes|required|string|max:255',
            'phone' => 'sometimes|required|string|max:20',
            'phone2' => 'nullable|string|max:20',
            'city' => 'sometimes|required|string|max:100',
            'province' => 'sometimes|required|string|max:100',
            'postal_code' => 'sometimes|required|string|max:20',
            'logo' => 'nullable|string|max:255',
            'max_users' => 'nullable|integer|min:1',
            'active' => 'sometimes|boolean',
        ]);

        $empresa->update($request->all());

        return response()->json([
            'mensaje' => 'Empresa actualizada correctamente',
            'empresa' => $empresa,
        ]);
    }

    // ⛔ Dar de baja lógica (desactivar) empresa
    public function darDeBajaEmpresa(int $id)
    {
        $empresa = Company::find($id);

        if (!$empresa) {
            return response()->json([
                'error' => 'Empresa no encontrada',
            ], 404);
        }

        if (!$empresa->active) {
            return response()->json([
                'mensaje' => 'La empresa ya estaba dada de baja',
                'empresa' => $empresa,
            ]);
        }

        $empresa->update(['active' => false]);

        return response()->json([
            'mensaje' => 'Empresa dada de baja correctamente',
            'empresa' => $empresa->fresh(),
        ]);
    }

    // ✅ Reactivar empresa dada de baja
    public function reactivarEmpresa(int $id)
    {
        $empresa = Company::find($id);

        if (!$empresa) {
            return response()->json([
                'error' => 'Empresa no encontrada',
            ], 404);
        }

        if ($empresa->active) {
            return response()->json([
                'mensaje' => 'La empresa ya estaba activa',
                'empresa' => $empresa,
            ]);
        }

        $empresa->update(['active' => true]);

        return response()->json([
            'mensaje' => 'Empresa reactivada correctamente',
            'empresa' => $empresa->fresh(),
        ]);
    }
}
