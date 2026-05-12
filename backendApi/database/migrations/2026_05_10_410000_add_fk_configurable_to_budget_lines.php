<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('budget_lines', function (Blueprint $table) {
            // Agregar la FK a configurable_articles
            $table->foreign('configurable_article_id')
                ->references('id')
                ->on('configurable_articles')
                ->onDelete('set null');
        });
    }

    public function down(): void
    {
        Schema::table('budget_lines', function (Blueprint $table) {
            $table->dropForeign(['configurable_article_id']);
        });
    }
};
