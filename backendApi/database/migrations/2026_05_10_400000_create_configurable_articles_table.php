<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Migración duplicada conservada por histórico.
        // Las tablas de artículos configurables ya se crean en 2026_05_10_150000_create_configurable_articles_table.
    }

    public function down(): void
    {
        // No-op: esta migración es un duplicado histórico.
    }
};
