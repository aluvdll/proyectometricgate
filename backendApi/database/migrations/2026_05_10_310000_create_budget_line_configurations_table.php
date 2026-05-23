<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('budget_line_configurations', function (Blueprint $table) {
            $table->id();

            $table->foreignId('budget_line_id')
                ->constrained('budget_lines')
                ->cascadeOnDelete();

            // Medidas de entrada del cliente (todas opcionales, depende de la fórmula usada)
            $table->decimal('ancho_hueco', 8, 2)->nullable();
            $table->decimal('alto_hueco', 8, 2)->nullable();
            $table->decimal('ancho_obra', 8, 2)->nullable();
            $table->decimal('alto_obra', 8, 2)->nullable();
            $table->decimal('paso_deseado', 8, 2)->nullable();

            // Opciones elegidas por parte: {"cajon": "ral_premium", "hojas_moviles": "incoloro"}
            $table->json('options_chosen');

            // Desglose del precio calculado por parte
            $table->json('price_breakdown');

            // Medidas de fabricación derivadas
            $table->json('fabrication_measures')->nullable();

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('budget_line_configurations');
    }
};
