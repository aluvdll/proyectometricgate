<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('standard_articles', function (Blueprint $table) {

            $table->id();

            // 🏢 EMPRESA
            $table->foreignId('company_id')
                ->constrained()
                ->onDelete('cascade');

            // 🔢 CÓDIGO (obligatorio y único por empresa)
            $table->string('code');

            // 📦 DATOS
            $table->string('name');
            $table->longText('description')->nullable();

            // �️ IMAGEN (ruta en storage, igual que avatar en usuarios)
            $table->string('image')->nullable();

            // �💰 PRECIO BASE
            $table->decimal('base_price', 15, 2);

            // 🧾 IVA POR DEFECTO (pre-rellena la línea del presupuesto)
            $table->decimal('tax_percentage', 5, 2)->default(21);

            // 🔵 ACTIVO
            $table->boolean('active')->default(true);

            $table->timestamps();

            // Código único por empresa
            $table->unique(['company_id', 'code']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('standard_articles');
    }
};
