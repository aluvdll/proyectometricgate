<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('clients', function (Blueprint $table) {
            $table->id();

            // 🏢 RELACIÓN CON EMPRESA
            $table->foreignId('company_id')
                ->constrained()
                ->onDelete('cascade');

            // 🆔 NUMERO DE CLIENTE POR EMPRESA (00000 = contado, 00001, 00002...)
            $table->string('client_number', 5)->default('00000');

            // 👤 DATOS OBLIGATORIOS
            $table->string('dni')->nullable();
            $table->string('nombre');
            $table->string('direccion');
            $table->string('poblacion');
            $table->string('codigo_postal');
            $table->string('provincia');

            // 📞 DATOS OPCIONALES
            $table->string('telefono')->nullable();
            $table->string('telefono2')->nullable();
            $table->string('email')->nullable();

            // 🔵 ESTADO
            $table->boolean('active')->default(true);

            // ⏰ TIMESTAMPS
            $table->timestamps();

            // Índices únicos: dni por empresa (si está presente)
            $table->unique(['company_id', 'dni']);
            // Número de cliente único por empresa
            $table->unique(['company_id', 'client_number']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('clients');
    }
};
