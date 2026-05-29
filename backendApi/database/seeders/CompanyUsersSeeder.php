<?php

namespace Database\Seeders;

use App\Models\Company;
use App\Models\User;
use Illuminate\Database\Seeder;

class CompanyUsersSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Obtiene todas las empresas existentes para crear usuarios de ejemplo por cada una.
        $companies = Company::all();

        // Recorre empresa por empresa y genera un conjunto base de usuarios por rol.
        foreach ($companies as $company) {
            // 1 admin extra por empresa
            User::factory()
                ->count(1)
                // Asigna el usuario creado a la empresa actual.
                ->forCompany($company->id)
                // Aplica estado de factory para rol admin.
                ->admin()
                ->create();

            // 2 comerciales por empresa
            User::factory()
                ->count(2)
                // Asigna ambos usuarios comerciales a la empresa actual.
                ->forCompany($company->id)
                // Aplica estado de factory para rol commercial.
                ->commercial()
                ->create();

            // 2 técnicos por empresa
            User::factory()
                ->count(2)
                // Asigna ambos usuarios tecnicos a la empresa actual.
                ->forCompany($company->id)
                // Aplica estado de factory para rol technician.
                ->technician()
                ->create();
        }
    }
}
