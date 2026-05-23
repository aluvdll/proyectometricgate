<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('configurable_article_option_prices', function (Blueprint $table) {
            $table->id();
            $table->foreignId('company_id')
                ->constrained(table: 'companies', indexName: 'caop_company_fk')
                ->cascadeOnDelete();
            $table->foreignId('configurable_article_option_id')
                ->constrained(table: 'configurable_article_options', indexName: 'caop_option_fk')
                ->cascadeOnDelete();
            $table->decimal('price', 15, 2);
            $table->timestamps();

            $table->unique(['company_id', 'configurable_article_option_id'], 'cfg_opt_price_company_option_unique');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('configurable_article_option_prices');
    }
};
