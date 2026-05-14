<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Tabla de pedidos (creados cuando presupuesto pasa a "aceptado")
        Schema::create('orders', function (Blueprint $table) {
            $table->id();

            // 🏢 EMPRESA
            $table->foreignId('company_id')
                ->constrained()
                ->onDelete('cascade');

            // 📄 PRESUPUESTO ORIGEN
            $table->foreignId('budget_id')
                ->constrained()
                ->onDelete('cascade');

            // 👤 CLIENTE
            $table->foreignId('client_id')
                ->constrained()
                ->onDelete('restrict');

            // 🔢 NÚMERO ÚNICO POR EMPRESA (ej: 2026-00001)
            $table->string('order_number')->unique();

            // 📅 FECHAS
            $table->date('order_date');
            $table->date('estimated_delivery')->nullable();
            $table->date('delivery_date')->nullable();

            // 📊 ESTADO: pendiente | en_curso | finalizado
            $table->enum('status', ['pendiente', 'en_curso', 'finalizado'])
                ->default('pendiente');

            // 💰 TOTALES (copia de presupuesto)
            $table->decimal('base_amount', 15, 2);
            $table->decimal('tax_amount', 15, 2);
            $table->decimal('total_amount', 15, 2);

            // 📝 NOTAS
            $table->text('notes')->nullable();

            // 👨‍💼 USUARIO QUE CREÓ EL PEDIDO
            $table->foreignId('created_by_user_id')
                ->nullable()
                ->constrained('users')
                ->onDelete('set null');

            $table->timestamps();

            // Índices para búsquedas rápidas
            $table->index('company_id');
            $table->index('client_id');
            $table->index('status');
            $table->index('order_date');
        });

        // Líneas del pedido (copia de presupuesto)
        Schema::create('order_lines', function (Blueprint $table) {
            $table->id();

            $table->foreignId('order_id')
                ->constrained()
                ->onDelete('cascade');

            // Tipo: standard (artículo normal) | configurable (con medidas)
            $table->enum('article_type', ['standard', 'configurable', 'manual']);

            // FK a artículo estándar (si aplica)
            $table->foreignId('standard_article_id')
                ->nullable()
                ->constrained()
                ->onDelete('set null');

            // FK a artículo configurable (si aplica)
            $table->foreignId('configurable_article_id')
                ->nullable()
                ->constrained()
                ->onDelete('set null');

            // DATOS DE LA LÍNEA
            $table->string('name');
            $table->text('description')->nullable();
            $table->decimal('quantity', 10, 2);
            $table->decimal('unit_price', 15, 2);
            $table->decimal('gross_subtotal', 15, 2);
            $table->decimal('discount_percentage', 5, 2)->default(0);
            $table->decimal('discount_amount', 15, 2)->default(0);
            $table->decimal('net_subtotal', 15, 2);
            $table->decimal('tax_percentage', 5, 2)->default(21);
            $table->decimal('tax_amount', 15, 2);
            $table->decimal('total_amount', 15, 2);

            // Orden de aparición
            $table->unsignedSmallInteger('position')->default(0);

            $table->timestamps();

            $table->index('order_id');
            $table->index('article_type');
        });

        // Configuraciones de líneas configurables (referencia a medidas de fabricación)
        Schema::create('order_line_configurations', function (Blueprint $table) {
            $table->id();

            $table->foreignId('order_line_id')
                ->constrained('order_lines')
                ->onDelete('cascade');

            // MEDIDAS DE ENTRADA DEL CLIENTE
            $table->decimal('ancho_hueco', 8, 2)->nullable();
            $table->decimal('alto_hueco', 8, 2)->nullable();
            $table->decimal('ancho_obra', 8, 2)->nullable();
            $table->decimal('alto_obra', 8, 2)->nullable();
            $table->decimal('paso_deseado', 8, 2)->nullable();

            // OPCIONES ELEGIDAS (JSON)
            $table->json('options_chosen')->nullable();

            // DESGLOSE DE PRECIO (JSON)
            $table->json('price_breakdown')->nullable();

            // MEDIDAS DE FABRICACIÓN DERIVADAS (JSON)
            $table->json('fabrication_measures')->nullable();

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('order_line_configurations');
        Schema::dropIfExists('order_lines');
        Schema::dropIfExists('orders');
    }
};
