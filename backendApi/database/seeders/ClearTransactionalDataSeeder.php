<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

class ClearTransactionalDataSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Borra presupuestos y pedidos para dejar la base limpia sin tocar
     * empresas, usuarios, clientes ni catálogo de artículos.
     */
    public function run(): void
    {
        Schema::disableForeignKeyConstraints();

        try {
            DB::table('order_line_configurations')->truncate();
            DB::table('order_lines')->truncate();
            DB::table('orders')->truncate();

            DB::table('budget_line_configurations')->truncate();
            DB::table('budget_lines')->truncate();
            DB::table('budgets')->truncate();
        } finally {
            Schema::enableForeignKeyConstraints();
        }
    }
}
