<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('budgets', function (Blueprint $table) {

            $table->id();

            // 🏢 EMPRESA - si se borra la empresa se borran sus presupuestos
            $table->foreignId('company_id')
                ->constrained()
                ->onDelete('cascade');

            // 👤 CLIENTE - si se borra el cliente el presupuesto se conserva (client_id queda null)
            $table->foreignId('client_id')
                ->nullable()
                ->constrained()
                ->nullOnDelete();

            // 👤 CREADO POR - si se borra el usuario el presupuesto se conserva (created_by_user_id queda null)
            $table->foreignId('created_by_user_id')
                ->nullable()
                ->constrained('users')
                ->nullOnDelete();

            // 🔢 NÚMERO PRESUPUESTO (formato: 2026-00001)
            $table->string('budget_number', 12);

            // 📅 FECHA DEL PRESUPUESTO
            $table->date('budget_date');

            // 📌 ESTADO
            $table->enum('status', [
                'draft',      // Borrador
                'sent',       // Enviado al cliente
                'accepted',   // Aceptado por el cliente
                'rejected',   // Rechazado por el cliente
                'invoiced',   // Facturado
            ])->default('draft');

            // 💰 TOTALES (se calculan sumando las líneas, nunca se editan directamente)
            $table->decimal('base_amount', 15, 2)->default(0);   // Base imponible total
            $table->decimal('tax_amount', 15, 2)->default(0);    // Total IVA
            $table->decimal('total_amount', 15, 2)->default(0);  // Total con IVA

            // 📝 OBSERVACIONES
            $table->longText('notes')->nullable();

            $table->timestamps();

            // Número único por empresa
            $table->unique(['company_id', 'budget_number']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('budgets');
    }
};
