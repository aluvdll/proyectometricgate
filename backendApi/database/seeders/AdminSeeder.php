<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Company;
use App\Models\User;

class AdminSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // crear empresa si no existe
        $company = Company::firstOrCreate(
            ['fiscal_name' => 'Empresa Prueba S.L.'],
            [
                'fiscal_name' => 'Empresa Prueba S.L.',
                'commercial_name' => 'Empresa Prueba',
                'cif_nif' => 'B12345678',
                'email' => 'empresa@prueba.com',
                'address' => 'Dirección Principal',
                'phone' => '123456789',
                'phone2' => '987654321',
                'city' => 'Ciudad Principal',
                'province' => 'Provincia Principal',
                'postal_code' => '00000',
                'logo' => null,
                'active' => true,
                'max_users' => 3,
            ]
        );
        // Empresa 2
        $company2 = Company::firstOrCreate(
            ['fiscal_name' => 'Otra Empresa S.L.'],
            [
                'fiscal_name' => 'Otra Empresa S.L.',
                'commercial_name' => 'Otra Empresa',
                'cif_nif' => 'B87654321',
                'email' => 'otra@empresa.com',
                'address' => 'Otra Dirección',
                'phone' => '111222333',
                'phone2' => null,
                'city' => 'Otra Ciudad',
                'province' => 'Otra Provincia',
                'postal_code' => '11111',
                'logo' => null,
                'active' => true,
                'max_users' => 5,
            ]
        );


        // crear admin si no existe
        User::updateOrCreate(
            ['email' => 'admin@prueba.com'],
            [
                'company_id' => $company->id,
                'name' => 'Admin Prueba',
                'email' => 'admin@prueba.com',
                'password' => 'admin', // Laravel 10+ hash automático
                'dni' => '12345678A',
                'phone' => '123456789',
                'address' => 'Dirección Admin',
                'city' => 'Ciudad Admin',
                'province' => 'Provincia Admin',
                'avatar' => null,
                'role' => 'admin',
                'active' => true,
            ]
        );
        User::updateOrCreate(
            ['email' => 'admin2@empresa.com'],
            [
                'company_id' => $company2->id,
                'name' => 'Admin Prueba',
                'email' => 'admin2@prueba.com',
                'password' => 'admin', // Laravel 10+ hash automático
                'dni' => '12345679A',
                'phone' => '123446789',
                'address' => 'Dirección Admin',
                'city' => 'Ciudad Admin',
                'province' => 'Provincia Admin',
                'avatar' => null,
                'role' => 'admin',
                'active' => true,
            ]
        );
    }
}
