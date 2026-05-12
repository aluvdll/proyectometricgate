<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('configurable_articles', function (Blueprint $table) {

            $table->id();

            // 🏢 EMPRESA
            $table->foreignId('company_id')
                ->constrained()
                ->onDelete('cascade');

            // 🔢 CÓDIGO único por empresa
            $table->string('code');

            $table->string('name');
            $table->text('description')->nullable();

            // 🧾 IVA por defecto
            $table->decimal('tax_percentage', 5, 2)->default(21);

            // ⚖️ Peso máximo soportado por las hojas (preparado para validación futura)
            $table->decimal('max_hojas_weight_kg', 8, 2)->nullable();

            $table->boolean('active')->default(true);

            $table->timestamps();

            $table->unique(['company_id', 'code']);
        });

        // Partes del artículo (cajón, hojas móviles, hojas fijas, fabricación...)
        Schema::create('configurable_article_parts', function (Blueprint $table) {

            $table->id();

            $table->foreignId('configurable_article_id')
                ->constrained()
                ->cascadeOnDelete();

            // Clave interna: 'cajon', 'hojas_moviles', 'hojas_fijas', 'fabricacion'
            $table->string('key');

            $table->string('name');

            // Unidad de medida para el cálculo
            $table->enum('unit', ['ml', 'm2', 'fixed', 'units']);

            // Orden de aparición en el formulario
            $table->unsignedSmallInteger('order')->default(0);

            $table->timestamps();

            $table->unique(['configurable_article_id', 'key']);
        });

        // Opciones de cada parte (colores, tipos de cristal, etc.)
        Schema::create('configurable_article_options', function (Blueprint $table) {

            $table->id();

            $table->foreignId('part_id')
                ->constrained('configurable_article_parts')
                ->cascadeOnDelete();

            // Clave interna: 'standard', 'ral_premium', 'incoloro', 'opalino'
            $table->string('key');

            $table->string('label');            // Texto visible al usuario
            $table->decimal('price', 15, 2);    // Precio base de esta opción
            $table->boolean('is_default')->default(false);

            $table->timestamps();

            $table->unique(['part_id', 'key']);
        });

        // Reglas de validación de las medidas de entrada
        Schema::create('configurable_article_rules', function (Blueprint $table) {

            $table->id();

            $table->foreignId('configurable_article_id')
                ->constrained()
                ->cascadeOnDelete();

            // Campo al que aplica la regla: 'ancho_cajon', 'alto_hueco', etc.
            $table->string('field');

            // Tipo de regla
            $table->enum('type', [
                'min_value',   // valor mínimo absoluto
                'max_value',   // valor máximo absoluto
                'min_diff',    // diferencia mínima entre dos campos
                'required',    // campo obligatorio
            ]);

            // Parámetros de la regla en JSON
            // min_value:  {"value": 1480}
            // min_diff:   {"field_a": "alto_obra", "field_b": "alto_libre", "min": 20}
            $table->json('params');

            // Mensaje de error legible
            $table->string('message');

            $table->timestamps();
        });

        // Snapshot de la configuración elegida, ligado a una línea del presupuesto
        Schema::create('budget_line_configurations', function (Blueprint $table) {

            $table->id();

            $table->foreignId('budget_line_id')
                ->constrained()
                ->cascadeOnDelete();

            // Medidas de entrada del cliente (todas opcionales, depende de la fórmula usada)
            $table->decimal('ancho_hueco', 8, 2)->nullable();   // Ancho hueco de paso libre
            $table->decimal('alto_hueco', 8, 2)->nullable();    // Alto hueco de paso libre
            $table->decimal('ancho_obra', 8, 2)->nullable();    // Ancho total superficie obra
            $table->decimal('alto_obra', 8, 2)->nullable();     // Alto total superficie obra
            $table->decimal('paso_deseado', 8, 2)->nullable();  // Medida de paso deseada

            // Opciones elegidas por parte: {"cajon": "ral_premium", "hojas_moviles": "incoloro"}
            $table->json('options_chosen');

            // Desglose del precio calculado por parte
            $table->json('price_breakdown');

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('budget_line_configurations');
        Schema::dropIfExists('configurable_article_rules');
        Schema::dropIfExists('configurable_article_options');
        Schema::dropIfExists('configurable_article_parts');
        Schema::dropIfExists('configurable_articles');
    }
};
