<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;
use Illuminate\Support\Facades\Auth;
use App\Models\Company;


class UserController extends Controller
{
    // 📄 listar usuarios (superadmin)
    public function index()
    {
        return User::with('company')->get();
    }

    // ➕ crear usuario desde superadmin
    public function store(Request $request)
    {
        $request->validate([
            'company_id' => 'required|exists:companies,id',
            'name' => 'required|string',
            'email' => 'required|email|unique:users,email',
            'password' => 'required|min:6',
            'dni' => 'required|string',
            'role' => 'required|in:admin,commercial,technician',
        ]);

        $user = User::create([
            'company_id' => $request->company_id,
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'dni' => $request->dni,
            'phone' => $request->phone,
            'address' => $request->address,
            'city' => $request->city,
            'province' => $request->province,
            'role' => $request->role,
            'active' => true,
        ]);

        return response()->json([
            'message' => 'Usuario creado correctamente',
            'user' => $user
        ], 201);
    }

    // ❌ eliminar usuario (superadmin)
    public function destroy($id)
    {
        $authUser = request()->user();

        $user = User::where('id', $id)
            ->where('company_id', $authUser->company_id)
            ->first();

        if (!$user) {
            return response()->json([
                'error' => 'Usuario no encontrado en tu empresa'
            ], 404);
        }

        $user->delete();

        return response()->json([
            'message' => 'Usuario eliminado correctamente'
        ]);
    }

    // 📄 listar todos los usuarios de la empresa (admin )
    // listar solo su empresa
     // 📄 listar usuarios de la empresa del usuario logueado (admin)
    private function companyUser($id)
    {
        return User::where('company_id', request()->user()->company_id)
            ->where('id', $id)
            ->first();
    }


    // ➕ crear usuario dentro de la empresa (admin)
    public function storeByCompany(Request $request)
    {
        $user = $request->user();

        if (!$user) {
            return response()->json([
                'error' => 'No autenticado'
            ], 401);
        }
        if ($user->role !== 'admin') {
            return response()->json(['error' => 'No autorizado'], 403);
        }

        $request->validate([
            'name' => 'required|string',
            'email' => [
                'required',
                'email',
                Rule::unique('users')->where(function ($query) use ($user) {
                    return $query->where('company_id', $user->company_id);
                }),
            ],
            'password' => 'required|min:6',
            'dni' => 'required|string',
            'role' => 'required|in:commercial,technician',
        ]);

        $newUser = User::create([
            'company_id' => $user->company_id,
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'dni' => $request->dni,
            'phone' => $request->phone,
            'address' => $request->address,
            'city' => $request->city,
            'province' => $request->province,
            'role' => $request->role,
            'active' => true,
        ]);

        return response()->json([
            'message' => 'Usuario creado correctamente',
            'user' => $newUser
        ], 201);
    }

    // ✏️ actualizar usuario dentro de la empresa (admin)
    public function updateByCompany(Request $request, $id)
    {
        $user = $request->user();

        if (!$user) {
            return response()->json([
                'error' => 'No autenticado'
            ], 401);
        }

        if ($user->role !== 'admin') {
            return response()->json(['error' => 'No autorizado'], 403);
        }

        $existingUser = User::where('company_id', $user->company_id)->where('id', $id)->first();

        if (!$existingUser) {
            return response()->json([
                'error' => 'Usuario no encontrado en tu empresa'
            ], 404);
        }

        $request->validate([
            'name' => 'sometimes|required|string',
            'email' => [
                'sometimes',
                'required',
                'email',
                Rule::unique('users')->where(function ($query) use ($user, $id) {
                    return $query->where('company_id', $user->company_id)->where('id', '!=', $id);
                }),
            ],
            'password' => 'sometimes|required|min:6',
            'dni' => 'sometimes|required|string',
            'role' => 'sometimes|required|in:commercial,technician',
        ]);

        $existingUser->update([
            'name' => $request->name ?? $existingUser->name,
            'email' => $request->email ?? $existingUser->email,
            'password' => isset($request->password) ? Hash::make($request->password) : $existingUser->password,
            'dni' => $request->dni ?? $existingUser->dni,
            'phone' => $request->phone ?? $existingUser->phone,
            'address' => $request->address ?? $existingUser->address,
            'city' => $request->city ?? $existingUser->city,
            'province' => $request->province ?? $existingUser->province,
            'role' => $request->role ?? $existingUser->role,
        ]);

        return response()->json([
            'message' => 'Usuario actualizado correctamente',
            'user' => $existingUser
        ], 200);
    }
    public function destroyByCompany(Request $request, $id)
    {
        $user = $request->user();

        if (!$user) {
            return response()->json([
                'error' => 'No autenticado'
            ], 401);
        }

        if ($user->role !== 'admin') {
            return response()->json([
                'error' => 'No autorizado'
            ], 403);
        }

        // 🔐 IMPORTANTE: filtrado por empresa
        $targetUser = User::where('id', $id)
            ->where('company_id', $user->company_id)
            ->first();

        if (!$targetUser) {
            return response()->json([
                'error' => 'Usuario no encontrado en tu empresa'
            ], 404);
        }

        // ❌ opcional: evitar que se borre a sí mismo
        if ($targetUser->id === $user->id) {
            return response()->json([
                'error' => 'No puedes eliminarte a ti mismo'
            ], 403);
        }

        $targetUser->delete();

        return response()->json([
            'message' => 'Usuario eliminado correctamente'
        ]);
    }

   
}
