<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class Super_AdminSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        User::create([
            'company_id' => null, // no pertenece a ninguna empresa
            'name' => 'Super Admin',
            'email' => 'admin@admin.com',
            'dni' => '74007888Y',
            'phone' => '637141076',
            'address' => 'Sistema',
            'city' => 'Sistema',
            'province' => 'Sistema',
            'password' => Hash::make('12345678'),
            'role' => 'super_admin',
            'active' => true,
        ]);
    }
}
