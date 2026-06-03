<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\UserListResource;
use App\Http\Resources\UserResource;
use Illuminate\Http\Request;
use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;

class UserController extends Controller
{
    // Aquí devuelvo el listado paginado de usuarios para superadmin.
    public function index(Request $request)
    {
        $perPage = (int) $request->query('per_page', 10);

        if ($perPage < 1) {
            $perPage = 10;
        }

        if ($perPage > 200) {
            $perPage = 200;
        }

        $usersQuery = User::with('company');

        if ($request->filled('company_id')) {
            $usersQuery->where('company_id', (int) $request->query('company_id'));
        }

        $users = $usersQuery->paginate($perPage)->appends($request->query());


        // Esa consulta devuelve una colección paginada de usuarios
        // junto con la relación company cargada.
        //
        // UserResource::collection($users) recorre automáticamente
        // cada usuario de la colección y aplica el formato definido
        // dentro de UserResource.
        //
        // Gracias a collection(), no devuelvo directamente el modelo,
        // sino una respuesta JSON controlada y consistente.
        //
        // Además, como $users viene de paginate(),
        // Laravel añade automáticamente:
        // - data
        // - links
        // - meta
        //
        // Esto facilita la paginación en el frontend.

        return UserResource::collection($users)
            ->additional([
                'message' => 'Listado de usuarios obtenido correctamente',
            ]);
    }

    // Aquí creo un usuario nuevo cuando quien opera es superadmin.
    public function store(Request $request)
    {
        $request->validate([
            'company_id' => 'required|exists:companies,id',
            'name' => 'required|string',
            'email' => 'required|email|unique:users,email',
            'password' => 'required|min:6',
            'dni' => 'required|string',
            'phone' => 'nullable|string|max:20',
            'address' => 'nullable|string|max:255',
            'city' => 'nullable|string|max:100',
            'province' => 'nullable|string|max:100',
            'role' => 'required|in:admin,commercial,technician',
            'avatar' => 'nullable|image|mimes:jpg,jpeg,png,webp|max:15360',
        ]);

        $avatarPath = null;
        if ($request->hasFile('avatar')) {
            $avatarPath = $request->file('avatar')->store('avatars', 'public');
            if ($avatarPath === false) {
                return response()->json([
                    'error' => 'No se pudo guardar el avatar en almacenamiento público'
                ], 500);
            }
        }

        $user = User::create([
            'company_id' => $request->company_id,
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'dni' => $request->dni,
            'phone' => $request->phone ?? '',
            'address' => $request->address ?? '',
            'city' => $request->city ?? '',
            'province' => $request->province ?? '',
            'avatar' => $avatarPath,
            'role' => $request->role,
            'active' => true,
        ]);

        return response()->json([
            'message' => 'Usuario creado correctamente',
            // Entrada: usuario recién creado en BD.
            // Salida: ese usuario transformado por Resource para mantener contrato fijo.
            'data' => (new UserResource($user->load('company')))->toArray($request)
        ], 201);
    }

    // Aquí elimino un usuario desde el contexto de superadmin.
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

    // Aquí listo los usuarios de mi empresa (admin), con paginación y búsqueda.
    public function companyUsers(Request $request)
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

        $search = trim((string) $request->query('search', ''));

        $usersQuery = User::with('company')
            ->where('company_id', $user->company_id);

        if ($search !== '') {
            $usersQuery->where(function ($query) use ($search) {
                $query->where('name', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%")
                    ->orWhere('dni', 'like', "%{$search}%")
                    ->orWhere('phone', 'like', "%{$search}%")
                    ->orWhere('role', 'like', "%{$search}%")
                    ->orWhere('city', 'like', "%{$search}%")
                    ->orWhere('province', 'like', "%{$search}%");
            });
        }

        $users = $usersQuery
            ->paginate(10)
            ->appends($request->query());

        // Entrada: usuarios de mi empresa, ya paginados.
        // Salida: data con Resource + links/meta para que frontend pagine fácil.
        return UserListResource::collection($users)
            ->additional([
                'message' => 'Listado de usuarios de la empresa obtenido correctamente',
            ]);
    }

    // Aquí obtengo un usuario concreto de mi empresa por su id.
    public function showByCompany(Request $request, $id)
    {
        $user = $request->user();

        if (!$user) {
            return response()->json([
                'error' => 'No autenticado'
            ], 401);
        }

        $isAdmin = $user->role === 'admin';
        $isSelf = (int) $user->id === (int) $id;

        if (!$isAdmin && !$isSelf) {
            return response()->json([
                'error' => 'No autorizado'
            ], 403);
        }

        $companyUser = User::where('company_id', $user->company_id)
            ->where('id', $id)
            ->first();

        if (!$companyUser) {
            return response()->json([
                'error' => 'Usuario no encontrado en tu empresa'
            ], 404);
        }

        // Entrada: un usuario concreto (filtrado por empresa e id).
        // Salida: un único objeto user con formato limpio y consistente.
        return (new UserResource($companyUser->load('company')))
            ->additional([
                'message' => 'Usuario obtenido correctamente',
            ]);
    }

    // Aquí creo un usuario nuevo dentro de mi empresa como admin.
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
            // El campo name es obligatorio y debe ser una cadena de texto
            'name' => 'required|string',

            // Validación del email del usuario
            'email' => [
                // El email es obligatorio
                'required',

                // Debe tener formato de email válido
                'email',

                // Regla personalizada de unicidad:
                // El email no puede repetirse dentro de la misma empresa (company_id)
                // Esto permite que distintos clientes tengan el mismo email en empresas diferentes,
                // pero no dentro de la misma empresa.
                Rule::unique('users')->where(function ($query) use ($user) {
                    return $query->where('company_id', $user->company_id);
                }),
            ],

            // La contraseña es obligatoria y debe tener mínimo 6 caracteres
            'password' => 'required|min:6',

            // DNI obligatorio como texto
            'dni' => 'required|string',

            // Estos campos son opcionales
            'phone' => 'nullable|string|max:20',
            'address' => 'nullable|string|max:255',
            'city' => 'nullable|string|max:100',
            'province' => 'nullable|string|max:100',

            // El rol es obligatorio y solo puede ser uno de estos tres valores:
            // - admin (administrador)
            // - commercial (comercial)
            // - technician (técnico)
            'role' => 'required|in:admin,commercial,technician',

            // Avatar opcional
            'avatar' => 'nullable|image|mimes:jpg,jpeg,png,webp|max:15360',
        ]);

        $avatarPath = null;
        if ($request->hasFile('avatar')) {
            $avatarPath = $request->file('avatar')->store('avatars', 'public');
            if ($avatarPath === false) {
                return response()->json([
                    'error' => 'No se pudo guardar el avatar en almacenamiento público'
                ], 500);
            }
        }

        $newUser = User::create([
            'company_id' => $user->company_id,
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'dni' => $request->dni,
            'phone' => $request->phone ?? '',
            'address' => $request->address ?? '',
            'city' => $request->city ?? '',
            'province' => $request->province ?? '',
            'avatar' => $avatarPath,
            'role' => $request->role,
            'active' => true,
        ]);

        return response()->json([
            'message' => 'Usuario creado correctamente',
            // Entrada: nuevo usuario de la empresa creado por admin.
            // Salida: user normalizado por Resource para no romper el frontend.
            'data' => (new UserResource($newUser->load('company')))->toArray($request)
        ], 201);
    }

    // Aquí actualizo un usuario de mi empresa respetando permisos y validaciones.
    public function updateByCompany(Request $request, $id)
    {
        $user = $request->user();

        if (!$user) {
            return response()->json([
                'error' => 'No autenticado'
            ], 401);
        }

        $isAdmin = $user->role === 'admin';
        $isSelf = (int) $user->id === (int) $id;

        if (!$isAdmin && !$isSelf) {
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
            'phone' => 'sometimes|nullable|string|max:20',
            'address' => 'sometimes|nullable|string|max:255',
            'city' => 'sometimes|nullable|string|max:100',
            'province' => 'sometimes|nullable|string|max:100',
            'role' => [
                Rule::requiredIf($isAdmin),
                'sometimes',
                'in:admin,commercial,technician',
            ],
            'avatar' => 'sometimes|nullable|image|mimes:jpg,jpeg,png,webp|max:15360',
            'remove_avatar' => 'sometimes|boolean',
        ]);

        // Si llega 'avatar' pero no es archivo real, devolvemos error claro.
        if ($request->has('avatar') && !$request->hasFile('avatar')) {
            return response()->json([
                'message' => 'El campo avatar debe enviarse como archivo.',
                'errors' => [
                    'avatar' => ['Avatar no válido: no se recibió un archivo.'],
                ],
            ], 422);
        }

        $avatarPath = in_array($existingUser->avatar, ['0', 0, ''], true)
            ? null
            : $existingUser->avatar;
        $removeAvatar = filter_var($request->input('remove_avatar', false), FILTER_VALIDATE_BOOLEAN);

        if ($removeAvatar && !empty($existingUser->avatar)) {
            Storage::disk('public')->delete($existingUser->avatar);
            $avatarPath = null;
        }

        if ($request->hasFile('avatar')) {
            if (!empty($existingUser->avatar)) {
                Storage::disk('public')->delete($existingUser->avatar);
            }
            $avatarPath = $request->file('avatar')->store('avatars', 'public');
            if ($avatarPath === false) {
                return response()->json([
                    'error' => 'No se pudo guardar el avatar en almacenamiento público'
                ], 500);
            }
        }

        $existingUser->update([
            'name' => $request->name ?? $existingUser->name,
            'email' => $request->email ?? $existingUser->email,
            'password' => isset($request->password) ? Hash::make($request->password) : $existingUser->password,
            'dni' => $request->dni ?? $existingUser->dni,
            'phone' => $request->has('phone') ? ($request->input('phone') ?? '') : $existingUser->phone,
            'address' => $request->has('address') ? ($request->input('address') ?? '') : $existingUser->address,
            'city' => $request->has('city') ? ($request->input('city') ?? '') : $existingUser->city,
            'province' => $request->has('province') ? ($request->input('province') ?? '') : $existingUser->province,
            'avatar' => $avatarPath,
            'role' => $isAdmin ? ($request->role ?? $existingUser->role) : $existingUser->role,
        ]);

        return response()->json([
            'message' => 'Usuario actualizado correctamente',
            // Entrada: usuario ya actualizado con los cambios enviados.
            // Salida: usuario actualizado transformado por Resource.
            'data' => (new UserResource($existingUser->load('company')))->toArray($request)
        ], 200);
    }

    // Aquí elimino un usuario de mi empresa y bloqueo autoeliminación del admin.
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

        //  IMPORTANTE: filtrado por empresa
        $targetUser = User::where('id', $id)
            ->where('company_id', $user->company_id)
            ->first();

        if (!$targetUser) {
            return response()->json([
                'error' => 'Usuario no encontrado en tu empresa'
            ], 404);
        }

        // evitar que se borre a sí mismo
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
