<?php

namespace Database\Factories;

use App\Models\Client;
use App\Models\Company;
use Illuminate\Database\Eloquent\Factories\Factory;
use Faker\Generator as Faker;

class ClientFactory extends Factory
{
    protected $model = Client::class;

    public function definition(): array
    {
        $clientNumber = str_pad((string) $this->faker->numberBetween(1, 99999), 5, '0', STR_PAD_LEFT);

        return [
            'company_id' => Company::query()->value('id') ?? 1,
            'client_number' => $clientNumber,
            'dni' => $this->faker->unique()->regexify('[0-9]{8}[A-Z]'),
            'nombre' => $this->faker->name(),
            'direccion' => $this->faker->address(),
            'poblacion' => $this->faker->city(),
            'codigo_postal' => $this->faker->postcode(),
            'provincia' => $this->faker->state(),
            'telefono' => $this->faker->phoneNumber(),
            'telefono2' => $this->faker->optional()->phoneNumber(),
            'email' => $this->faker->optional()->email(),
            'active' => true,
        ];
    }

    // Para el cliente de contado (número 00000)
    public function contado()
    {
        return $this->state(function (array $attributes) {
            return [
                'client_number' => '00000',
                'nombre' => 'Cliente Contado',
                'dni' => null,
                'telefono' => null,
                'telefono2' => null,
                'email' => null,
            ];
        });
    }
}
