<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (!Schema::hasColumn('budget_line_configurations', 'fabrication_measures')) {
            Schema::table('budget_line_configurations', function (Blueprint $table) {
                // Medidas de fabricación pre-calculadas (array de {label, formula, valor})
                $table->json('fabrication_measures')->nullable()->after('price_breakdown');
            });
        }
    }

    public function down(): void
    {
        Schema::table('budget_line_configurations', function (Blueprint $table) {
            $table->dropColumn('fabrication_measures');
        });
    }
};
