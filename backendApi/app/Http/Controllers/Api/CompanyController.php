<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\CompanyResource;
use App\Http\Resources\UserResource;
use App\Models\Company;
use Illuminate\Http\Request;
// Estos imports quedan comentados porque hoy no se usan:
// dependen del destroy con cascade fisico, y ese bloque esta desactivado abajo.
// use Illuminate\Support\Facades\DB;
// use App\Models\ArticleFamily;
// use App\Models\Budget;
// use App\Models\BudgetLine;
// use App\Models\BudgetLineConfiguration;
// use App\Models\Client;
// use App\Models\ConfigurableArticle;
// use App\Models\ConfigurableArticleOption;
// use App\Models\ConfigurableArticleOptionPrice;
// use App\Models\ConfigurableArticlePart;
// use App\Models\ConfigurableArticleRule;
// use App\Models\Order;
// use App\Models\OrderLine;
// use App\Models\OrderLineConfiguration;
// use App\Models\StandardArticle;
use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;

class CompanyController extends Controller
{
    // Aquí devuelvo los datos de cabecera de la empresa autenticada para impresión.
    public function companyPrintInfo(Request $request)
    {
        $user = $request->user();

        if (!$user || !$user->company_id) {
            return response()->json([
                'error' => 'No autorizado para ver datos de empresa'
            ], 403);
        }

        $company = Company::find($user->company_id);

        if (!$company) {
            return response()->json([
                'error' => 'Empresa no encontrada'
            ], 404);
        }

        return response()->json([
            'company' => [
                'fiscal_name' => $company->fiscal_name,
                'commercial_name' => $company->commercial_name,
                'address' => $company->address,
                'city' => $company->city,
                'province' => $company->province,
                'phone' => $company->phone,
            ],
        ]);
    }

    // Aquí devuelvo el logo privado de la empresa del usuario autenticado.
    public function companyLogo(Request $request)
    {
        $user = $request->user();

        // Solo usuarios asociados a empresa pueden ver su logo.
        if (!$user || !$user->company_id) {
            return response()->json([
                'error' => 'No autorizado para ver logos de empresa'
            ], 403);
        }

        $company = Company::find($user->company_id);

        if (!$company || !$company->logo) {
            return response()->json([
                'error' => 'Logo no disponible'
            ], 404);
        }

        $logoGuardado = (string) $company->logo;
        $rutaRelativaPublica = null;

        // Formato nuevo: /storage/logos/archivo.ext
        if (str_starts_with($logoGuardado, '/storage/')) {
            $rutaRelativaPublica = ltrim(substr($logoGuardado, strlen('/storage/')), '/');
        }

        // Formato directo en disco public: logos/archivo.ext
        if (!$rutaRelativaPublica && str_starts_with($logoGuardado, 'logos/')) {
            $rutaRelativaPublica = $logoGuardado;
        }

        if ($rutaRelativaPublica && Storage::disk('public')->exists($rutaRelativaPublica)) {
            return response()->file(
                Storage::disk('public')->path($rutaRelativaPublica),
                [
                    'Cache-Control' => 'no-store, no-cache, must-revalidate, private',
                    'Pragma' => 'no-cache',
                    'Expires' => '0',
                    'Vary' => 'Authorization',
                ]
            );
        }

        // Compatibilidad con formato antiguo guardado en disco local.
        if (Storage::disk('local')->exists($logoGuardado)) {
            return response()->file(
                Storage::disk('local')->path($logoGuardado),
                [
                    'Cache-Control' => 'no-store, no-cache, must-revalidate, private',
                    'Pragma' => 'no-cache',
                    'Expires' => '0',
                    'Vary' => 'Authorization',
                ]
            );
        }

        return response()->json([
            'error' => 'Archivo de logo no encontrado'
        ], 404);
    }

    // Aqui listo todas las empresas para superadmin y las devuelvo con Resource.
    public function index()
    {
        // Entrada: coleccion de empresas desde BD.
        // Salida: array de empresas ya transformadas por CompanyResource.
        $companies = Company::all();

        return response()->json([
            'companies' => CompanyResource::collection($companies)->resolve(request()),
        ]);
    }

    // Aqui obtengo una empresa concreta por id.
    public function show($id)
    {
        $company = Company::find($id);

        // Si no existe, devuelvo 404 con mensaje claro.
        if (!$company) {
            return response()->json([
                'error' => 'Empresa no encontrada'
            ], 404);
        }

        // Entrada: empresa encontrada en BD.
        // Salida: empresa transformada por CompanyResource.
        return response()->json((new CompanyResource($company))->resolve(request()));
    }

    // Aqui creo una empresa y su admin inicial en una sola operacion.
    public function store(Request $request)
    {
        // Valido datos de empresa y datos minimos del admin inicial.
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

            //  ADMIN DE LA EMPRESA
            'admin_name' => 'required|string',
            'admin_email' => 'required|email|unique:users,email',
            'admin_password' => 'required|string|min:6',
            'admin_dni' => 'required|string',
            'admin_phone' => 'nullable|string',
            'admin_address' => 'nullable|string',
            'admin_city' => 'nullable|string',
            'admin_province' => 'nullable|string',
        ]);

        // Paso 1: creo la empresa con valores recibidos.
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

        // Paso 2: creo el admin inicial asociado a esa empresa.
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
            // Entrada: objetos recien creados (empresa y admin).
            // Salida: ambos objetos transformados con Resource.
            'company' => (new CompanyResource($company))->resolve($request),
            'admin' => (new UserResource($admin->load('company')))->toArray($request),
        ], 201);
    }

    // Aqui actualizo una empresa existente por id.
    public function update(Request $request, $id)
    {
        $company = Company::find($id);

        // Si la empresa no existe, respondo 404.
        if (!$company) {
            return response()->json([
                'error' => 'Empresa no encontrada'
            ], 404);
        }

        // Validacion parcial para poder enviar solo los campos que cambian.
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

        // Actualizo con el payload validado.
        $company->update($request->all());

        return response()->json([
            'message' => 'Empresa actualizada correctamente',
            // Entrada: empresa actualizada en BD.
            // Salida: empresa transformada por CompanyResource.
            'company' => (new CompanyResource($company->fresh()))->resolve($request),

        ]);
    }

    // ==============================================================
    // NOTA DE MANTENIMIENTO
    // Este bloque de destroy queda desactivado por ahora.
    // Lo activare en breve desde SuperAdmin Panel, cuando se habilite
    // el borrado fisico de empresas con su cascade completo.
    // Si permanece desactivado, revisar tambien la ruta DELETE
    // /api/companies/{id} para evitar endpoints activos sin metodo.
    // ==============================================================
    /*
        // Aqui dejo el borrado fisico de empresa implementado aunque actualmente no se usa desde frontend.
        // Lo mantengo preparado para cuando se quiera eliminar definitivamente una empresa y todo su arbol de datos.
        public function destroy($id)
        {
            $company = Company::find($id);

            // Si no existe, devuelvo 404.
            if (!$company) {
                return response()->json([
                    'error' => 'Empresa no encontrada'
                ], 404);
            }

            DB::transaction(function () use ($company) {
                // Aqui preparo ids para borrar en cascada sin dejar registros huerfanos.
                $companyId = $company->id;

                $budgetIds = Budget::where('company_id', $companyId)->pluck('id');
                $orderIds = Order::where('company_id', $companyId)->pluck('id');
                $configurableArticleIds = ConfigurableArticle::where('company_id', $companyId)->pluck('id');

                // ---------- Presupuestos -> lineas -> configuraciones ----------
                $budgetLineIds = BudgetLine::whereIn('budget_id', $budgetIds)->pluck('id');
                BudgetLineConfiguration::whereIn('budget_line_id', $budgetLineIds)->delete();
                BudgetLine::whereIn('budget_id', $budgetIds)->delete();
                Budget::where('company_id', $companyId)->delete();

                // ---------- Pedidos -> lineas -> configuraciones ----------
                $orderLineIds = OrderLine::whereIn('order_id', $orderIds)->pluck('id');
                OrderLineConfiguration::whereIn('order_line_id', $orderLineIds)->delete();
                OrderLine::whereIn('order_id', $orderIds)->delete();
                Order::where('company_id', $companyId)->delete();

                // ---------- Articulos configurables -> partes -> opciones -> precios ----------
                $partIds = ConfigurableArticlePart::whereIn('configurable_article_id', $configurableArticleIds)->pluck('id');
                $optionIds = ConfigurableArticleOption::whereIn('part_id', $partIds)->pluck('id');

                ConfigurableArticleOptionPrice::where('company_id', $companyId)->delete();
                ConfigurableArticleOptionPrice::whereIn('configurable_article_option_id', $optionIds)->delete();
                ConfigurableArticleOption::whereIn('part_id', $partIds)->delete();
                ConfigurableArticleRule::whereIn('configurable_article_id', $configurableArticleIds)->delete();
                ConfigurableArticlePart::whereIn('configurable_article_id', $configurableArticleIds)->delete();
                ConfigurableArticle::where('company_id', $companyId)->delete();

                // ---------- Articulos estandar / familias ----------
                StandardArticle::where('company_id', $companyId)->delete();
                ArticleFamily::where('company_id', $companyId)->delete();

                // ---------- Clientes y usuarios ----------
                Client::where('company_id', $companyId)->delete();
                User::where('company_id', $companyId)->delete();

                // ---------- Empresa ----------
                $company->delete();
            });

            return response()->json([
                'message' => 'Empresa eliminada correctamente'
            ]);
        }
    */
}
