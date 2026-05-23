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
        $empresas = [
            [
                'fiscal_name' => 'Empresa Prueba S.L.',
                'commercial_name' => 'Empresa Prueba',
                'cif_nif' => 'B12345678',
                'email' => 'empresa1@prueba.com',
                'address' => 'Direccion Principal 1',
                'phone' => '123456789',
                'phone2' => '987654321',
                'city' => 'Ciudad Uno',
                'province' => 'Provincia Uno',
                'postal_code' => '28001',
                'logo' => null,
                'active' => true,
                'max_users' => 20,
                'admin' => [
                    'name' => 'Admin Empresa 1',
                    'email' => 'admin1@prueba.com',
                    'dni' => '12345678A',
                    'phone' => '600000001',
                    'address' => 'Direccion Admin 1',
                    'city' => 'Ciudad Uno',
                    'province' => 'Provincia Uno',
                ],
            ],
            [
                'fiscal_name' => 'Otra Empresa S.L.',
                'commercial_name' => 'Otra Empresa',
                'cif_nif' => 'B87654321',
                'email' => 'empresa2@prueba.com',
                'address' => 'Direccion Principal 2',
                'phone' => '123456790',
                'phone2' => null,
                'city' => 'Ciudad Dos',
                'province' => 'Provincia Dos',
                'postal_code' => '28002',
                'logo' => null,
                'active' => true,
                'max_users' => 20,
                'admin' => [
                    'name' => 'Admin Empresa 2',
                    'email' => 'admin2@prueba.com',
                    'dni' => '12345679A',
                    'phone' => '600000002',
                    'address' => 'Direccion Admin 2',
                    'city' => 'Ciudad Dos',
                    'province' => 'Provincia Dos',
                ],
            ],
            [
                'fiscal_name' => 'Tercera Empresa S.L.',
                'commercial_name' => 'Tercera Empresa',
                'cif_nif' => 'B11223344',
                'email' => 'empresa3@prueba.com',
                'address' => 'Direccion Principal 3',
                'phone' => '123456791',
                'phone2' => null,
                'city' => 'Ciudad Tres',
                'province' => 'Provincia Tres',
                'postal_code' => '28003',
                'logo' => null,
                'active' => true,
                'max_users' => 20,
                'admin' => [
                    'name' => 'Admin Empresa 3',
                    'email' => 'admin3@prueba.com',
                    'dni' => '12345680A',
                    'phone' => '600000003',
                    'address' => 'Direccion Admin 3',
                    'city' => 'Ciudad Tres',
                    'province' => 'Provincia Tres',
                ],
            ],
            [
                'fiscal_name' => 'Cuarta Empresa S.L.',
                'commercial_name' => 'Cuarta Empresa',
                'cif_nif' => 'B55667788',
                'email' => 'empresa4@prueba.com',
                'address' => 'Direccion Principal 4',
                'phone' => '123456792',
                'phone2' => null,
                'city' => 'Ciudad Cuatro',
                'province' => 'Provincia Cuatro',
                'postal_code' => '28004',
                'logo' => null,
                'active' => true,
                'max_users' => 20,
                'admin' => [
                    'name' => 'Admin Empresa 4',
                    'email' => 'admin4@prueba.com',
                    'dni' => '12345681A',
                    'phone' => '600000004',
                    'address' => 'Direccion Admin 4',
                    'city' => 'Ciudad Cuatro',
                    'province' => 'Provincia Cuatro',
                ],
            ],
        ];

        foreach ($empresas as $item) {
            $admin = $item['admin'];
            unset($item['admin']);

            $company = Company::firstOrCreate(
                ['fiscal_name' => $item['fiscal_name']],
                $item,
            );

            User::updateOrCreate(
                ['email' => $admin['email']],
                [
                    'company_id' => $company->id,
                    'name' => $admin['name'],
                    'email' => $admin['email'],
                    'password' => 'admin',
                    'dni' => $admin['dni'],
                    'phone' => $admin['phone'],
                    'address' => $admin['address'],
                    'city' => $admin['city'],
                    'province' => $admin['province'],
                    'avatar' => null,
                    'role' => 'admin',
                    'active' => true,
                ]
            );
        }
    }
}
