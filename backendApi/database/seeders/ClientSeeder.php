<?php

namespace Database\Seeders;

use App\Models\Client;
use App\Models\Company;
use Illuminate\Database\Seeder;

class ClientSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Para cada empresa, crear el cliente de contado (00000) + 9 clientes más
        Company::all()->each(function ($company) {
            // 1️⃣ Crear cliente de contado (00000)
            Client::factory()
                ->contado()
                ->for($company)
                ->create();

            // 2️⃣ Crear 9 clientes más (00001-00009)
            for ($i = 1; $i <= 9; $i++) {
                Client::factory()
                    ->for($company)
                    ->state([
                        'client_number' => str_pad((string) $i, 5, '0', STR_PAD_LEFT),
                    ])
                    ->create();
            }
        });
    }
}
