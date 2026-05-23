<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        // 1. Expandir el enum para que acepte tanto los valores viejos como los nuevos
        DB::statement("ALTER TABLE budgets MODIFY COLUMN status ENUM('draft','sent','accepted','rejected','invoiced','pendiente','aceptado') NOT NULL DEFAULT 'pendiente'");

        // 2. Convertir todos los registros con estado viejo a 'pendiente'
        DB::table('budgets')->whereNotIn('status', ['pendiente', 'aceptado'])->update(['status' => 'pendiente']);

        // 3. Ahora reducir el enum a solo los dos nuevos valores
        DB::statement("ALTER TABLE budgets MODIFY COLUMN status ENUM('pendiente', 'aceptado') NOT NULL DEFAULT 'pendiente'");
    }

    public function down(): void
    {
        // Restaurar los 5 estados originales si se hace rollback
        DB::statement("ALTER TABLE budgets MODIFY COLUMN status ENUM('draft', 'sent', 'accepted', 'rejected', 'invoiced') NOT NULL DEFAULT 'draft'");
    }
};
