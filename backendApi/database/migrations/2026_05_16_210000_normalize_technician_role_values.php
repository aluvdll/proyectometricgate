<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        if (DB::getDriverName() === 'mysql') {
            DB::statement("ALTER TABLE users MODIFY COLUMN role ENUM('super_admin', 'admin', 'commercial', 'technician', 'tecnician') NOT NULL DEFAULT 'commercial'");
        }

        DB::table('users')
            ->where('role', 'tecnician')
            ->update(['role' => 'technician']);

        if (DB::getDriverName() === 'mysql') {
            DB::statement("ALTER TABLE users MODIFY COLUMN role ENUM('super_admin', 'admin', 'commercial', 'technician') NOT NULL DEFAULT 'commercial'");
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        if (DB::getDriverName() === 'mysql') {
            DB::statement("ALTER TABLE users MODIFY COLUMN role ENUM('super_admin', 'admin', 'commercial', 'technician', 'tecnician') NOT NULL DEFAULT 'commercial'");
        }

        DB::table('users')
            ->where('role', 'technician')
            ->update(['role' => 'tecnician']);
    }
};
