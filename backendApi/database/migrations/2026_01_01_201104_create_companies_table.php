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
        Schema::create('companies', function (Blueprint $table) {
            $table->id();

            $table->string('fiscal_name');
            $table->string('commercial_name')->nullable();
            $table->string('cif_nif')->unique();

            $table->string('email');
            $table->string('address');
            $table->string('phone');
            $table->string('phone2')->nullable();
            $table->string('city');
            $table->string('province');
            $table->string('postal_code');
            $table->string('logo')->nullable();
            $table->boolean('active')->default(false);
            $table->integer('max_users')->default(1);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('companies');
    }
};
