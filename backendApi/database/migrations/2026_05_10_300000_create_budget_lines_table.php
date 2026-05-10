<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('budget_lines', function (Blueprint $table) {

            $table->id();

            // 🧾 PRESUPUESTO - si se borra el presupuesto se borran sus líneas
            $table->foreignId('budget_id')
                ->constrained()
                ->onDelete('cascade');

            // 📌 TIPO DE ARTÍCULO
            $table->enum('article_type', [
                'standard',      // Artículo del catálogo estándar
                'configurable',  // Artículo configurable (kit) - 🚧 pendiente de implementar
                'manual',        // Artículo escrito a mano en el presupuesto
            ]);

            // 📦 ARTÍCULO ESTÁNDAR (null si es configurable o manual)
            $table->foreignId('standard_article_id')
                ->nullable()
                ->constrained('standard_articles')
                ->nullOnDelete();

            // 📦 ARTÍCULO CONFIGURABLE (null si es estándar o manual) - 🚧 pendiente de implementar
            $table->foreignId('configurable_article_id')
                ->nullable()
                ->constrained('configurable_articles')
                ->nullOnDelete();

            // 📝 SNAPSHOT HISTÓRICO - se copia del artículo al añadirlo y no cambia nunca
            $table->string('name');             // Nombre en el momento de crear la línea
            $table->longText('description');    // Descripción en el momento de crear la línea

            // 🔢 CANTIDAD
            $table->decimal('quantity', 15, 2)->default(1);

            // 💰 PRECIO UNITARIO
            $table->decimal('unit_price', 15, 2);

            // 💰 SUBTOTAL BRUTO (quantity * unit_price)
            $table->decimal('gross_subtotal', 15, 2);

            // 🎯 DESCUENTO
            $table->decimal('discount_percentage', 5, 2)->default(0);  // % descuento
            $table->decimal('discount_amount', 15, 2)->default(0);     // Importe descuento

            // 💰 BASE IMPONIBLE DE LA LÍNEA (gross_subtotal - discount_amount)
            $table->decimal('net_subtotal', 15, 2);

            // 🧾 IVA (se copia del artículo pero se puede cambiar)
            $table->decimal('tax_percentage', 5, 2);   // % IVA aplicado
            $table->decimal('tax_amount', 15, 2);      // Importe IVA

            // 💵 TOTAL LÍNEA (net_subtotal + tax_amount)
            $table->decimal('total_amount', 15, 2);

            // 📌 ORDEN EN EL PRESUPUESTO
            $table->integer('position')->default(0);

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('budget_lines');
    }
};
