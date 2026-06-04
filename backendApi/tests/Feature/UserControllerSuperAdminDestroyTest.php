<?php

use App\Models\Company;
use App\Models\User;
use Illuminate\Support\Facades\Artisan;
use Laravel\Sanctum\Sanctum;

// Este test comprueba la regresion: un superadmin sin company_id puede borrar usuarios de cualquier empresa.
test('super admin can delete a user even without company assigned', function () {
    if (!in_array('sqlite', \PDO::getAvailableDrivers(), true)) {
        $this->markTestSkipped('sqlite no está disponible en este entorno de tests.');
    }

    Artisan::call('migrate:fresh');

    $company = Company::create([
        'fiscal_name' => 'Empresa Demo SL',
        'commercial_name' => 'Empresa Demo',
        'cif_nif' => 'B12345678',
        'email' => 'empresa-demo@example.com',
        'address' => 'Calle Falsa 123',
        'phone' => '600000001',
        'city' => 'Madrid',
        'province' => 'Madrid',
        'postal_code' => '28001',
        'active' => true,
        'max_users' => 10,
    ]);

    $superAdmin = User::factory()->create([
        'company_id' => null,
        'role' => 'super_admin',
    ]);

    $targetUser = User::factory()->create([
        'company_id' => $company->id,
        'role' => 'commercial',
    ]);

    Sanctum::actingAs($superAdmin);

    $response = $this->deleteJson('/api/users/' . $targetUser->id);

    $response
        ->assertOk()
        ->assertJson([
            'message' => 'Usuario eliminado correctamente',
        ]);

    $this->assertDatabaseMissing('users', [
        'id' => $targetUser->id,
    ]);
});
