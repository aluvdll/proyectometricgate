<?php

namespace Database\Factories;

use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

/**
 * @extends Factory<User>
 */
class UserFactory extends Factory
{
    /**
     * The current password being used by the factory.
     */
    protected static ?string $password;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        // Aqui defino los datos base que voy a usar cuando creo un usuario fake.
        // Si no aplico ningun state (admin/commercial/technician), sale con estos valores por defecto.
        return [
            // Por defecto lo dejo sin empresa; luego puedo enlazarlo con forCompany(...).
            'company_id' => null,

            // Genero datos realistas para pruebas y seeders.
            'name' => fake()->name(),
            'email' => fake()->unique()->safeEmail(),
            'dni' => fake()->unique()->regexify('[0-9]{8}[A-Z]'),
            'phone' => fake()->numerify('6########'),
            'address' => fake()->streetAddress(),
            'city' => fake()->city(),
            'province' => fake()->state(),
            'avatar' => null,

            // Si no digo lo contrario, el rol inicial sera commercial y activo.
            'role' => 'commercial',
            'active' => true,

            // Marco el email como verificado para simplificar pruebas de login.
            'email_verified_at' => now(),

            // Reutilizo la misma password hasheada en memoria para no recalcularla en cada usuario.
            // El texto plano para entrar en local suele ser: password
            'password' => static::$password ??= Hash::make('password'),
            'remember_token' => Str::random(10),
        ];
    }

    public function forCompany(int $companyId): static
    {
        // Con este state asigno el usuario a una empresa concreta.
        return $this->state(fn () => [
            'company_id' => $companyId,
        ]);
    }

    public function admin(): static
    {
        // Con este state fuerzo rol admin.
        return $this->state(fn () => [
            'role' => 'admin',
        ]);
    }

    public function commercial(): static
    {
        // Con este state fuerzo rol commercial.
        return $this->state(fn () => [
            'role' => 'commercial',
        ]);
    }

    public function technician(): static
    {
        // Con este state fuerzo rol technician.
        return $this->state(fn () => [
            'role' => 'technician',
        ]);
    }

    /**
     * Indicate that the model's email address should be unverified.
     */
    public function unverified(): static
    {
        // Este state me sirve para simular usuarios con email sin verificar.
        return $this->state(fn (array $attributes) => [
            'email_verified_at' => null,
        ]);
    }
}
