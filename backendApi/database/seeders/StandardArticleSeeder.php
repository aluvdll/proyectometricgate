<?php

namespace Database\Seeders;

use App\Models\ArticleFamily;
use App\Models\Company;
use App\Models\StandardArticle;
use Illuminate\Database\Seeder;

class StandardArticleSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $companies = Company::all();

        foreach ($companies as $company) {
            $familias = ArticleFamily::where('company_id', $company->id)
                ->get()
                ->keyBy('name');

            $articulos = [
                [
                    'family_name' => 'Seguridad',
                    'code' => 'SEG-001',
                    'name' => 'Sensor magnético',
                    'description' => 'Sensor magnético para puertas y ventanas.',
                    'base_price' => 24.90,
                    'tax_percentage' => 21,
                ],
                [
                    'family_name' => 'Automatismo',
                    'code' => 'AUT-001',
                    'name' => 'Motor corredera',
                    'description' => 'Motor para puerta corredera residencial.',
                    'base_price' => 289.00,
                    'tax_percentage' => 21,
                ],
                [
                    'family_name' => 'Emisores',
                    'code' => 'EMI-001',
                    'name' => 'Mando 4 canales',
                    'description' => 'Emisor de cuatro canales para automatismos.',
                    'base_price' => 39.50,
                    'tax_percentage' => 21,
                ],
                [
                    'family_name' => null,
                    'code' => 'GEN-001',
                    'name' => 'Instalación básica',
                    'description' => 'Artículo genérico sin familia para pruebas.',
                    'base_price' => 95.00,
                    'tax_percentage' => 21,
                ],
            ];

            foreach ($articulos as $articulo) {
                $family = $articulo['family_name']
                    ? ($familias[$articulo['family_name']] ?? null)
                    : null;

                StandardArticle::updateOrCreate(
                    [
                        'company_id' => $company->id,
                        'code' => $articulo['code'],
                    ],
                    [
                        'family_id' => $family?->id,
                        'name' => $articulo['name'],
                        'description' => $articulo['description'],
                        'image' => null,
                        'base_price' => $articulo['base_price'],
                        'tax_percentage' => $articulo['tax_percentage'],
                        'active' => true,
                    ]
                );
            }
        }
    }
}
