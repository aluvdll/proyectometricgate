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
        Schema::create('users', function (Blueprint $table) {
            $table->id();

            // 🏢 RELACIÓN CON EMPRESA
            $table->foreignId('company_id')
                ->nullable()
                ->constrained()
                ->onDelete('cascade');

            // 👤 DATOS
            $table->string('name');
            $table->string('email')->unique();
            $table->string('dni')->unique();

            $table->string('phone');
            $table->string('address');
            $table->string('city');
            $table->string('province');

            $table->string('avatar')->nullable();

            // 🔐 AUTH
            $table->timestamp('email_verified_at')->nullable();
            $table->string('password');
            $table->rememberToken();

            // 🎭 ROLES
            $table->enum('role', [
                'super_admin', //soy yo que puedo hacer de todo
                'admin',
                'commercial',
                'technician'
            ])->default('commercial');

            // 🔵 ESTADO
            $table->boolean('active')->default(true);

            $table->timestamps();
        });

        // 🧠 Sessions
        Schema::create('sessions', function (Blueprint $table) {
            $table->string('id')->primary();

            $table->foreignId('user_id')
                ->nullable()
                ->constrained()
                ->onDelete('cascade')
                ->index();

            $table->string('ip_address', 45)->nullable();
            $table->text('user_agent')->nullable();
            $table->longText('payload');

            $table->integer('last_activity')->index();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('sessions');
        Schema::dropIfExists('users');
    }
};
