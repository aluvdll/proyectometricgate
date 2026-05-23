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
        $companies = Company::all();

        foreach ($companies as $company) {
            // 1 admin extra por empresa
            User::factory()
                ->count(1)
                ->forCompany($company->id)
                ->admin()
                ->create();

            // 2 comerciales por empresa
            User::factory()
                ->count(2)
                ->forCompany($company->id)
                ->commercial()
                ->create();

            // 2 técnicos por empresa
            User::factory()
                ->count(2)
                ->forCompany($company->id)
                ->technician()
                ->create();
        }
    }
}
