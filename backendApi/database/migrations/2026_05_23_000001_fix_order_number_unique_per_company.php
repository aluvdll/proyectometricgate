<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            // Eliminamos el índice único simple (order_number global)
            // que impedía que dos empresas distintas tuvieran el mismo número
            $table->dropUnique('orders_order_number_unique');

            // Añadimos índice único compuesto: el número solo debe ser
            // único dentro de la misma empresa, no en toda la tabla
            $table->unique(['company_id', 'order_number'], 'orders_company_order_number_unique');
        });
    }

    public function down(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            // Revertir: volvemos al índice único simple
            $table->dropUnique('orders_company_order_number_unique');
            $table->unique('order_number', 'orders_order_number_unique');
        });
    }
};
