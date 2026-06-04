<?php

use App\Models\Company;
use App\Models\User;
use Illuminate\Support\Facades\Artisan;
use Laravel\Sanctum\Sanctum;

// Aqui compruebo que login no filtra si la cuenta existe o no.
test('login returns same error for unknown email and wrong password', function () {
    skipIfSqliteMissing();
    resetDatabase();

    User::factory()->create([
        'email' => 'known@example.com',
        'password' => bcrypt('password123'),
        'role' => 'commercial',
    ]);

    $unknown = $this->postJson('/api/login', [
        'email' => 'unknown@example.com',
        'password' => 'password123',
    ]);

    $wrongPassword = $this->postJson('/api/login', [
        'email' => 'known@example.com',
        'password' => 'wrong-password',
    ]);

    $unknown->assertStatus(401)->assertJson([
        'error' => 'Credenciales invalidas',
    ]);

    $wrongPassword->assertStatus(401)->assertJson([
        'error' => 'Credenciales invalidas',
    ]);
});

// Aqui compruebo que forgot password responde igual aunque el email no exista.
test('forgot password does not reveal whether email exists', function () {
    skipIfSqliteMissing();
    resetDatabase();

    User::factory()->create([
        'email' => 'known@example.com',
        'role' => 'commercial',
    ]);

    $known = $this->postJson('/api/forgot-password', [
        'email' => 'known@example.com',
    ]);

    $unknown = $this->postJson('/api/forgot-password', [
        'email' => 'unknown@example.com',
    ]);

    $known->assertOk()->assertJson([
        'message' => 'Si el email es valido, recibiras instrucciones para recuperar tu contrasena',
    ]);

    $unknown->assertOk()->assertJson([
        'message' => 'Si el email es valido, recibiras instrucciones para recuperar tu contrasena',
    ]);
});

// Aqui compruebo que un comercial no puede listar usuarios de empresa.
test('commercial cannot list company users', function () {
    skipIfSqliteMissing();
    resetDatabase();

    $company = createCompany('a');
    $commercial = User::factory()->commercial()->forCompany($company->id)->create();

    Sanctum::actingAs($commercial);

    $this->getJson('/api/company/users')
        ->assertStatus(403)
        ->assertJson([
            'error' => 'No autorizado',
        ]);
});

// Aqui compruebo aislamiento multiempresa al listar usuarios como admin.
test('admin only sees users from own company', function () {
    skipIfSqliteMissing();
    resetDatabase();

    $companyA = createCompany('a');
    $companyB = createCompany('b');

    $adminA = User::factory()->admin()->forCompany($companyA->id)->create();
    $userA = User::factory()->commercial()->forCompany($companyA->id)->create();
    $userB = User::factory()->commercial()->forCompany($companyB->id)->create();

    Sanctum::actingAs($adminA);

    $response = $this->getJson('/api/company/users');

    $response->assertOk();
    $response->assertJsonFragment(['id' => $adminA->id]);
    $response->assertJsonFragment(['id' => $userA->id]);
    $response->assertJsonMissing(['id' => $userB->id]);
});

// Aqui compruebo que un comercial no puede actualizar a otro usuario.
test('commercial cannot update another user in same company', function () {
    skipIfSqliteMissing();
    resetDatabase();

    $company = createCompany('a');
    $commercial = User::factory()->commercial()->forCompany($company->id)->create();
    $otherUser = User::factory()->technician()->forCompany($company->id)->create();

    Sanctum::actingAs($commercial);

    $this->putJson('/api/company/users/' . $otherUser->id, [
        'name' => 'Intento no permitido',
    ])->assertStatus(403)
      ->assertJson([
          'error' => 'No autorizado',
      ]);
});

// Aqui compruebo que un comercial no puede ascender su propio rol a admin.
test('commercial cannot self promote role through update endpoint', function () {
    skipIfSqliteMissing();
    resetDatabase();

    $company = createCompany('a');
    $commercial = User::factory()->commercial()->forCompany($company->id)->create();

    Sanctum::actingAs($commercial);

    $this->putJson('/api/company/users/' . $commercial->id, [
        'role' => 'admin',
    ])->assertOk();

    $commercial->refresh();
    expect($commercial->role)->toBe('commercial');
});

// Aqui compruebo que un admin no puede ver un usuario de otra empresa.
test('admin cannot access user detail from other company', function () {
    skipIfSqliteMissing();
    resetDatabase();

    $companyA = createCompany('a');
    $companyB = createCompany('b');

    $adminA = User::factory()->admin()->forCompany($companyA->id)->create();
    $userB = User::factory()->commercial()->forCompany($companyB->id)->create();

    Sanctum::actingAs($adminA);

    $this->getJson('/api/company/users/' . $userB->id)
        ->assertStatus(404)
        ->assertJson([
            'error' => 'Usuario no encontrado en tu empresa',
        ]);
});

function createCompany(string $suffix): Company
{
    return Company::create([
        'fiscal_name' => 'Empresa ' . strtoupper($suffix) . ' SL',
        'commercial_name' => 'Empresa ' . strtoupper($suffix),
        'cif_nif' => 'B12345' . str_pad((string) ord($suffix), 3, '0', STR_PAD_LEFT),
        'email' => 'empresa-' . $suffix . '@example.com',
        'address' => 'Calle Prueba ' . strtoupper($suffix),
        'phone' => '6000000' . str_pad((string) (ord($suffix) % 10), 2, '0', STR_PAD_LEFT),
        'city' => 'Madrid',
        'province' => 'Madrid',
        'postal_code' => '2800' . (ord($suffix) % 10),
        'active' => true,
        'max_users' => 10,
    ]);
}

function skipIfSqliteMissing(): void
{
    if (!in_array('sqlite', PDO::getAvailableDrivers(), true)) {
        test()->markTestSkipped('sqlite no esta disponible en este entorno de tests.');
    }
}

function resetDatabase(): void
{
    Artisan::call('migrate:fresh');
}
