<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('article_families', function (Blueprint $table) {
            $table->id();

            // 🏢 EMPRESA - cada empresa tiene sus propias familias
            $table->foreignId('company_id')
                ->constrained()
                ->onDelete('cascade');

            // 🗂️ DATOS DE LA FAMILIA
            $table->string('name');
            $table->longText('description')->nullable();

            // 🔵 ESTADO
            $table->boolean('active')->default(true);

            $table->timestamps();

            // Nombre único por empresa
            $table->unique(['company_id', 'name']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('article_families');
    }
};
