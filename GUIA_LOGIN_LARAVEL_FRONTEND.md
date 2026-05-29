# GUIA LOGIN LARAVEL + FRONTEND (EXPLICADO EN CODIGO)

Esta guia te explica 2 cosas:
1. Como esta creado AHORA el login en tu proyecto.
2. Como funciona extremo a extremo (frontend -> backend -> frontend).

## 1) Arquitectura que usa tu proyecto

Tu proyecto usa login por token Bearer con Laravel Sanctum:
- El frontend envia email + password a `/api/login`.
- Laravel valida credenciales y devuelve `user`, `role` y `token`.
- El frontend guarda el token en `localStorage`.
- En cada request protegida se envia `Authorization: Bearer <token>`.
- El backend protege rutas con `auth:sanctum`.

---

## 2) Backend Laravel (como esta creado)

### 2.1 Ruta publica de login

Archivo: `backendApi/routes/api.php`

```php
Route::post('/login', [AuthController::class, 'login']);
```

Esto permite que un usuario NO autenticado pueda intentar iniciar sesion.

### 2.2 Metodo login del controlador

Archivo: `backendApi/app/Http/Controllers/Api/AuthController.php`

```php
public function login(Request $request)
{
    // 1) Validacion de entrada
    $request->validate([
        'email' => 'required|email',
        'password' => 'required'
    ]);

    // 2) Buscar usuario por email
    $user = User::where('email', $request->email)->first();

    // 3) Usuario no existe
    if (!$user) {
        return response()->json(['error' => 'Usuario no registrado'], 404);
    }

    // 4) Password incorrecta
    if (!Hash::check($request->password, $user->password)) {
        return response()->json(['error' => 'Usuario o contrasena incorrecta'], 401);
    }

    // 5) Usuario inactivo
    if (!$user->active) {
        return response()->json(['error' => 'Usuario inactivo'], 403);
    }

    // 6) Si pertenece a empresa, validar empresa activa
    if ($user->company_id) {
        $company = Company::find($user->company_id);
        if ($company && !$company->active) {
            return response()->json([
                'error' => 'Por favor, contacte con el servicio tecnico de MetricGate.'
            ], 403);
        }
    }

    // 7) Crear token Sanctum
    // Sanctum es el sistema de Laravel para autenticacion por token en APIs.
    // createToken(...) genera un token PERSONAL para este usuario y lo devuelve en texto plano
    // solo en este momento; Laravel guarda internamente el hash en la base de datos.
    // El frontend debe guardar este valor y enviarlo en Authorization: Bearer <token>
    // para que auth:sanctum identifique al usuario en rutas protegidas como /api/me.
    $token = $user->createToken('api-token')->plainTextToken;

    // 8) Respuesta del login
    return response()->json([
        'message' => 'Login correcto',
        'data' => [
        // UserResource transforma el modelo User a un JSON estable para frontend.
        // Aqui filtra/formatea campos y tambien incluye company solo si viene cargada
        // por el load('company') para evitar consultas extra y mantener consistencia.
            'user' => (new UserResource($user->load('company')))->toArray($request),
            'role' => $user->role,
            'token' => $token,
        ],
    ]);
}
```

### 2.3 Modelo User preparado para tokens

Archivo: `backendApi/app/Models/User.php`

```php
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens;
    // ...
}
```

Sin `HasApiTokens`, `createToken(...)` no funcionaria.

### 2.4 Rutas protegidas por token

Archivo: `backendApi/routes/api.php`

```php
Route::middleware(['auth:sanctum', 'company'])->group(function () {
    Route::get('/me', [AuthController::class, 'me']);
    Route::post('/logout', [AuthController::class, 'logout']);

    // ... resto de rutas privadas
});
```

`auth:sanctum` obliga a enviar un Bearer token valido.

### 2.5 Endpoint /me y logout

Archivo: `backendApi/app/Http/Controllers/Api/AuthController.php`

```php
public function me(Request $request)
{
    return (new UserResource($request->user()->load('company')))
        ->additional(['message' => 'Usuario autenticado obtenido correctamente']);
}

public function logout(Request $request)
{
    $request->user()->tokens()->delete();

    return response()->json([
        'message' => 'Logout correcto'
    ]);
}
```

- `/me` devuelve el usuario autenticado segun token.
- `/logout` invalida tokens del usuario (cierre de sesion real en backend).

---

## 3) Frontend React (como esta creado)

### 3.1 Servicio que llama al login

Archivo: `frontend/src/services/auth.jsx`

```jsx
const AUTH_LOGIN_URL = `${API_URL}/api/login`;

export const loginUsuario = async (data) => {
  try {
    // Envia email/password al endpoint de login del backend.
    const response = await axios.post(AUTH_LOGIN_URL, data);

    // Devuelve solo el body JSON (message + data con user/role/token).
    return response.data;
  } catch (error) {
    // Si el backend respondio con error (401, 403, 404, etc.),
    // reutilizo su mensaje para mostrarlo tal cual en la UI.
    if (axios.isAxiosError(error) && error.response) {
      throw new Error(error.response.data.error);
    }

    // Si no hubo respuesta del backend, suele ser un problema de red,
    // API caida, CORS o timeout.
    throw new Error('Error de conexion con el servidor');
  }
};
```

Aqui solo se hace la llamada HTTP y se normalizan errores.

### 3.2 Formulario de login

Archivo: `frontend/src/pages/public/Login.jsx`

```jsx
const handleSubmit = async (e) => {
  e.preventDefault();

  const res = await loginUsuario({
    email: correo,
    password: password,
  });

  const authData = res?.data ?? {};

  // Guarda sesion en AuthContext + localStorage
  login(authData.user, authData.token, authData.role);

  // Redireccion segun rol
  if (authData.role === 'super_admin') {
    navigate('/superadminPanel', { replace: true });
    return;
  }

  navigate('/adminPanel/', { replace: true });
};
```

Este componente hace 3 cosas claves:
- envia credenciales,
- guarda sesion,
- redirige por rol.

### 3.3 AuthContext guarda y restaura sesion

Archivo: `frontend/src/context/AuthContext.tsx`

```tsx
const login = (userData: Usuario, token: string, role: string) => {
  localStorage.setItem('usuario', JSON.stringify(userData));
  localStorage.setItem('token', token);
  localStorage.setItem('role', role);
  localStorage.setItem(LAST_ACTIVITY_KEY, String(Date.now()));

  setUser(userData);
  setToken(token);
  setRole(role);
};
```

Al cargar la app, tambien intenta reconstruir sesion:

```tsx
const storedUser = localStorage.getItem('usuario');
const storedToken = localStorage.getItem('token');

if (storedUser && storedToken) {
  setUser(JSON.parse(storedUser));
  setToken(storedToken);
  await hydrateUserFromApi(storedToken); // llama a /api/me
}
```

Esto evita que el usuario tenga que hacer login de nuevo al refrescar pagina.

### 3.4 Manejo automatico de expiracion (401)

Archivo: `frontend/src/services/axiosSetup.js`

Que es un interceptor:
- Un interceptor es una funcion "gancho" de Axios que se ejecuta automaticamente
  antes o despues de cada peticion HTTP.
- En este caso es un interceptor de RESPUESTA, asi que actua cuando el servidor
  ya ha contestado (ok o error).

Como actua en este codigo:
1. Cada respuesta pasa por `axios.interceptors.response.use(...)`.
2. Si la respuesta viene bien, retorna `response` sin tocarla.
3. Si viene error y el estado es 401, dispara el evento global `session-expired`.
4. Luego hace `Promise.reject(error)` para que el componente que llamo la API
   tambien pueda manejar ese error.
5. `AuthContext` escucha `session-expired` y ejecuta `logout()`, cerrando sesion
   en toda la app de forma centralizada.

```js
// Interceptor global de respuestas de Axios.
// Se ejecuta en TODAS las respuestas HTTP.
axios.interceptors.response.use(
  // Si la respuesta es correcta, la dejo pasar tal cual.
  (response) => response,
  (error) => {
    // Si el backend responde 401, significa token invalido/expirado
    // o sesion no autorizada.
    if (error.response && error.response.status === 401) {
      // Disparo un evento global para avisar a toda la app.
      window.dispatchEvent(new Event('session-expired'));
    }

    // Re-lanzo el error para que el codigo que hizo la peticion
    // tambien pueda manejarlo si lo necesita.
    return Promise.reject(error);
  },
);
```

Y en AuthContext:

```tsx
useEffect(() => {
  // Cuando se reciba el evento global, cierro sesion.
  const handleSessionExpired = () => logout();

  // Me suscribo al evento una sola vez al montar el provider.
  window.addEventListener('session-expired', handleSessionExpired);

  // Limpieza al desmontar para evitar listeners duplicados o fugas.
  return () => window.removeEventListener('session-expired', handleSessionExpired);
}, []);
```

Resultado: si el backend responde 401, el frontend cierra sesion automaticamente.

### 3.5 Proteccion de rutas en frontend

Archivo: `frontend/src/App.tsx`

```tsx
if (!autenticado) return <Navigate to="/login" replace />;
```

Los componentes `PrivateRoute`, `SuperAdminRoute` y `RoleRoute` controlan acceso segun:
- token,
- usuario,
- rol.

---

## 4) Flujo completo de login (paso a paso)

1. Usuario rellena email/password en `Login.jsx`.
2. `loginUsuario(...)` envia POST a `/api/login`.
3. Laravel valida y crea token Sanctum.
4. Backend responde `data.user`, `data.role`, `data.token`.
5. Frontend guarda token/usuario/rol en `localStorage` y estado global.
6. Frontend redirige al panel correcto.
7. Requests privadas envian `Authorization: Bearer <token>`.
8. `auth:sanctum` autentica al usuario en backend.

---

## 5) Mini ejemplo de request/response real

### Request

```http
POST /api/login
Content-Type: application/json

{
  "email": "admin@empresa.com",
  "password": "secret123"
}
```

### Response (200)

```json
{
  "message": "Login correcto",
  "data": {
    "user": {
      "id": 12,
      "name": "Admin Empresa",
      "email": "admin@empresa.com",
      "role": "admin"
    },
    "role": "admin",
    "token": "1|xxxxx..."
  }
}
```

---

## 6) Errores importantes ya contemplados en tu backend

- 404: usuario no registrado.
- 401: password incorrecta.
- 403: usuario inactivo.
- 403: empresa inactiva.

Esto esta bien porque separa claramente errores de autenticacion y permisos.

---

## 7) Si quisieras crear este login desde cero

Checklist minimo:
1. Instalar y configurar Sanctum.
2. Anadir `HasApiTokens` en `User`.
3. Crear `POST /api/login` que valide y haga `createToken(...)`.
4. Proteger rutas privadas con `auth:sanctum`.
5. En frontend, guardar token y enviarlo en header Bearer.
6. Crear guardas de rutas y logout al recibir 401.

Con eso tienes exactamente el patron que ya estas usando en este proyecto.
