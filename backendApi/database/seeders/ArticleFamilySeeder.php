<?php

namespace Database\Seeders;

use App\Models\ArticleFamily;
use App\Models\Company;
use Illuminate\Database\Seeder;

class ArticleFamilySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $familias = [
            [
                'name' => 'Seguridad',
                'description' => 'Familia de artículos relacionados con seguridad.',
            ],
            [
                'name' => 'Automatismo',
                'description' => 'Familia de artículos relacionados con automatismos.',
            ],
            [
                'name' => 'Emisores',
                'description' => 'Familia de artículos relacionados con emisores.',
            ],
        ];

        $companies = Company::all();

        foreach ($companies as $company) {
            foreach ($familias as $familia) {
                ArticleFamily::updateOrCreate(
                    [
                        'company_id' => $company->id,
                        'name' => $familia['name'],
                    ],
                    [
                        'description' => $familia['description'],
                        'active' => true,
                    ]
                );
            }
        }
    }
}
