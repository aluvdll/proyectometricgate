<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class () extends Migration {
    public function up(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $globalUniqueExists = ! empty(DB::select(
                'SHOW INDEX FROM `orders` WHERE Key_name = ?',
                ['orders_order_number_unique']
            ));

            // Eliminamos el índice único simple (order_number global)
            // que impedía que dos empresas distintas tuvieran el mismo número
            if ($globalUniqueExists) {
                $table->dropUnique('orders_order_number_unique');
            }

            $companyScopedUniqueExists = ! empty(DB::select(
                'SHOW INDEX FROM `orders` WHERE Key_name = ?',
                ['orders_company_order_number_unique']
            ));

            // Añadimos índice único compuesto: el número solo debe ser
            // único dentro de la misma empresa, no en toda la tabla
            if (! $companyScopedUniqueExists) {
                $table->unique(['company_id', 'order_number'], 'orders_company_order_number_unique');
            }
        });
    }

    public function down(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $companyScopedUniqueExists = ! empty(DB::select(
                'SHOW INDEX FROM `orders` WHERE Key_name = ?',
                ['orders_company_order_number_unique']
            ));

            // Revertir: volvemos al índice único simple
            if ($companyScopedUniqueExists) {
                $table->dropUnique('orders_company_order_number_unique');
            }

            $globalUniqueExists = ! empty(DB::select(
                'SHOW INDEX FROM `orders` WHERE Key_name = ?',
                ['orders_order_number_unique']
            ));

            if (! $globalUniqueExists) {
                $table->unique('order_number', 'orders_order_number_unique');
            }
        });
    }
};
