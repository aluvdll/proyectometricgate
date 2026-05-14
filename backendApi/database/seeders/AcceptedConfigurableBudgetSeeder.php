<?php

namespace Database\Seeders;

use App\Models\Budget;
use App\Models\BudgetLine;
use App\Models\BudgetLineConfiguration;
use App\Models\Client;
use App\Models\Company;
use App\Models\ConfigurableArticle;
use App\Models\Order;
use App\Models\User;
use App\Services\CreateOrderFromBudgetService;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class AcceptedConfigurableBudgetSeeder extends Seeder
{
    use WithoutModelEvents;

    public function run(): void
    {
        $company = Company::where('fiscal_name', 'Otra Empresa S.L.')->first();

        if (!$company) {
            return;
        }

        $article = ConfigurableArticle::where('company_id', $company->id)
            ->where('code', 'PTA2H2FSP')
            ->first();

        if (!$article) {
            return;
        }

        $client = Client::where('company_id', $company->id)
            ->orderByRaw("client_number = '00000' desc")
            ->orderBy('client_number')
            ->first();

        $admin = User::where('company_id', $company->id)
            ->where('role', 'admin')
            ->first();

        if (!$client || !$admin) {
            return;
        }

        DB::transaction(function () use ($company, $client, $admin, $article) {
            $budgetNumber = now()->year . '-00001';

            $budget = Budget::firstOrCreate(
                [
                    'company_id' => $company->id,
                    'budget_number' => $budgetNumber,
                ],
                [
                    'client_id' => $client->id,
                    'created_by_user_id' => $admin->id,
                    'budget_date' => now()->toDateString(),
                    'status' => 'aceptado',
                    'base_amount' => 4016.00,
                    'tax_amount' => 843.36,
                    'total_amount' => 4859.36,
                    'notes' => 'Presupuesto semilla de artículo configurable para empresa 2.',
                ]
            );

            if (!$budget->lines()->exists()) {
                $line = $budget->lines()->create([
                    'article_type' => 'configurable',
                    'standard_article_id' => null,
                    'configurable_article_id' => $article->id,
                    'name' => $article->code . ' — ' . $article->name,
                    'description' => 'Semilla: C=2500, D=2500, A=2700',
                    'quantity' => 1,
                    'unit_price' => 4016.00,
                    'gross_subtotal' => 4016.00,
                    'discount_percentage' => 0,
                    'discount_amount' => 0,
                    'net_subtotal' => 4016.00,
                    'tax_percentage' => 21,
                    'tax_amount' => 843.36,
                    'total_amount' => 4859.36,
                    'position' => 0,
                ]);

                $line->configuration()->create([
                    'ancho_hueco' => 2500,
                    'alto_hueco' => 2500,
                    'ancho_obra' => 2700,
                    'alto_obra' => 2700,
                    'paso_deseado' => null,
                    'options_chosen' => [
                        'mecanismo' => 'standard',
                        'cajon' => 'ral_premium',
                        'hojas_moviles' => 'incoloro',
                        'hojas_fijas' => 'incoloro',
                        'fabricacion' => 'standard',
                    ],
                    'price_breakdown' => [
                        'mecanismo' => [
                            'label' => 'Mecanismo — Mecanismo estándar',
                            'unit' => 'fixed',
                            'option_key' => 'standard',
                            'base_price' => 2350.00,
                            'effective_price' => 2350.00,
                            'price' => 2350.00,
                        ],
                        'cajon' => [
                            'label' => 'Cajón — RAL premium (+150€)',
                            'unit' => 'fixed',
                            'option_key' => 'ral_premium',
                            'base_price' => 150.00,
                            'effective_price' => 150.00,
                            'price' => 150.00,
                        ],
                        'hojas_moviles' => [
                            'label' => 'Hojas móviles — Cristal incoloro',
                            'unit' => 'm2',
                            'option_key' => 'incoloro',
                            'base_price' => 95.00,
                            'effective_price' => 95.00,
                            'price' => 351.50,
                        ],
                        'hojas_fijas' => [
                            'label' => 'Hojas fijas — Cristal incoloro',
                            'unit' => 'm2',
                            'option_key' => 'incoloro',
                            'base_price' => 85.00,
                            'effective_price' => 85.00,
                            'price' => 314.50,
                        ],
                        'fabricacion' => [
                            'label' => 'Fabricación — Precio fabricación',
                            'unit' => 'fixed',
                            'option_key' => 'standard',
                            'base_price' => 850.00,
                            'effective_price' => 850.00,
                            'price' => 850.00,
                        ],
                    ],
                    'fabrication_measures' => [
                        ['label' => 'Ancho cristal de fijos laterales', 'formula' => '(C/4) + 45', 'valor' => 670.00],
                        ['label' => 'Alto cristal de los fijos laterales', 'formula' => 'D', 'valor' => 2500.00],
                        ['label' => 'Ancho cristal de las hojas móviles', 'formula' => '(C/4) - 5', 'valor' => 620.00],
                        ['label' => 'Alto cristal de las hojas móviles (sin perfil plintón)', 'formula' => 'D - 50', 'valor' => 2450.00],
                        ['label' => 'Ancho hueco de paso libre final', 'formula' => 'C - ((C/4) + 45) * 2', 'valor' => 1160.00],
                        ['label' => 'Alto hueco de paso libre', 'formula' => 'D', 'valor' => 2500.00],
                    ],
                ]);
            }

            $budget->load('lines.configuration');

            if (!Order::where('budget_id', $budget->id)->exists()) {
                $previousUser = auth()->user();
                auth()->setUser($admin);

                try {
                    CreateOrderFromBudgetService::execute($budget);
                } finally {
                    if ($previousUser) {
                        auth()->setUser($previousUser);
                    }
                }
            }
        });
    }
}
