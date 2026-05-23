<?php

namespace Database\Seeders;

use App\Models\ConfigurableArticle;
use App\Models\ConfigurableArticlePart;
use App\Models\ConfigurableArticleOption;
use App\Models\ConfigurableArticleRule;
use Illuminate\Database\Seeder;

class ConfigurableArticleSeeder extends Seeder
{
    public function run(): void
    {
        // Regla estricta de datos iniciales:
        // solo debe existir PTA2H2FSP para company_id=2.
        ConfigurableArticle::query()->delete();

        $this->crearPTA2H2FSP(2);
    }

    // ─────────────────────────────────────────────────────────────────
    //  PTA2H2FSP — Puerta automática 2 hojas móviles + 2 fijos laterales
    // ─────────────────────────────────────────────────────────────────
    private function crearPTA2H2FSP(int $companyId): void
    {
        $articulo = ConfigurableArticle::create([
            'company_id'          => $companyId,
            'code'                => 'PTA2H2FSP',
            'name'                => 'Puerta automática 2H + 2 fijos laterales',
            'description'         => 'Puerta automática deslizante con 2 hojas móviles y 2 paneles fijos laterales.',
            'tax_percentage'      => 21,
            'max_hojas_weight_kg' => null, // Preparado para validación futura
            'active'              => true,
        ]);

        $this->crearPartesComunesConFijos($articulo);
        $this->crearReglasComunes($articulo);
    }

    // ─────────────────────────────────────────────────────────────────
    //  PARTES COMUNES
    // ─────────────────────────────────────────────────────────────────
    private function crearPartesComunesConFijos(ConfigurableArticle $articulo): void
    {
        $this->crearPartesConFijos($articulo, incluirFijos: true);
    }

    private function crearPartesConFijos(ConfigurableArticle $articulo, bool $incluirFijos): void
    {
        // 1. Cajón (incremento fijo por acabado)
        $cajon = ConfigurableArticlePart::create([
            'configurable_article_id' => $articulo->id,
            'key'   => 'cajon',
            'name'  => 'Cajón',
            'unit'  => 'fixed',
            'order' => 2,
        ]);

        ConfigurableArticleOption::insert([
            ['part_id' => $cajon->id, 'key' => 'standard',    'label' => 'Color estándar (sin incremento)', 'price' => 0.00,   'is_default' => true,  'created_at' => now(), 'updated_at' => now()],
            ['part_id' => $cajon->id, 'key' => 'ral_premium', 'label' => 'RAL premium (+150€)',             'price' => 150.00, 'is_default' => false, 'created_at' => now(), 'updated_at' => now()],
        ]);

        // 2. Mecanismo (precio fijo)
        $mecanismo = ConfigurableArticlePart::create([
            'configurable_article_id' => $articulo->id,
            'key'   => 'mecanismo',
            'name'  => 'Mecanismo',
            'unit'  => 'fixed',
            'order' => 1,
        ]);

        ConfigurableArticleOption::insert([
            ['part_id' => $mecanismo->id, 'key' => 'standard', 'label' => 'Mecanismo estándar', 'price' => 2350.00, 'is_default' => true, 'created_at' => now(), 'updated_at' => now()],
        ]);

        // 3. Hojas móviles (metros cuadrados)
        $hojasMoviles = ConfigurableArticlePart::create([
            'configurable_article_id' => $articulo->id,
            'key'   => 'hojas_moviles',
            'name'  => 'Hojas móviles',
            'unit'  => 'm2',
            'order' => 3,
        ]);

        ConfigurableArticleOption::insert([
            ['part_id' => $hojasMoviles->id, 'key' => 'incoloro', 'label' => 'Cristal incoloro', 'price' => 95.00, 'is_default' => true,  'created_at' => now(), 'updated_at' => now()],
            ['part_id' => $hojasMoviles->id, 'key' => 'opalino',  'label' => 'Cristal opalino',  'price' => 120.00, 'is_default' => false, 'created_at' => now(), 'updated_at' => now()],
        ]);

        // 4. Hojas fijas (metros cuadrados) — solo si el modelo las incluye
        if ($incluirFijos) {
            $hojasFijas = ConfigurableArticlePart::create([
                'configurable_article_id' => $articulo->id,
                'key'   => 'hojas_fijas',
                'name'  => 'Hojas fijas',
                'unit'  => 'm2',
                'order' => 4,
            ]);

            ConfigurableArticleOption::insert([
                ['part_id' => $hojasFijas->id, 'key' => 'incoloro', 'label' => 'Cristal incoloro', 'price' => 85.00, 'is_default' => true,  'created_at' => now(), 'updated_at' => now()],
                ['part_id' => $hojasFijas->id, 'key' => 'opalino',  'label' => 'Cristal opalino',  'price' => 110.00, 'is_default' => false, 'created_at' => now(), 'updated_at' => now()],
            ]);
        }

        // 5. Fabricación (precio fijo)
        $fabricacion = ConfigurableArticlePart::create([
            'configurable_article_id' => $articulo->id,
            'key'   => 'fabricacion',
            'name'  => 'Fabricación',
            'unit'  => 'fixed',
            'order' => $incluirFijos ? 5 : 4,
        ]);

        ConfigurableArticleOption::insert([
            ['part_id' => $fabricacion->id, 'key' => 'standard', 'label' => 'Precio fabricación', 'price' => 850.00, 'is_default' => true, 'created_at' => now(), 'updated_at' => now()],
        ]);
    }

    // ─────────────────────────────────────────────────────────────────
    //  REGLAS DE VALIDACIÓN
    // ─────────────────────────────────────────────────────────────────
    private function crearReglasComunes(ConfigurableArticle $articulo): void
    {
        ConfigurableArticleRule::insert([
            // Cota C (ancho hueco) obligatoria
            [
                'configurable_article_id' => $articulo->id,
                'field'   => 'ancho_hueco',
                'type'    => 'required',
                'params'  => json_encode([]),
                'message' => 'La medida C (ancho hueco disponible) es obligatoria.',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            // Cota D (alto hueco) obligatoria
            [
                'configurable_article_id' => $articulo->id,
                'field'   => 'alto_hueco',
                'type'    => 'required',
                'params'  => json_encode([]),
                'message' => 'La medida D (alto hueco disponible) es obligatoria.',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            // Cota A (alto obra) obligatoria
            [
                'configurable_article_id' => $articulo->id,
                'field'   => 'alto_obra',
                'type'    => 'required',
                'params'  => json_encode([]),
                'message' => 'La medida A (alto obra disponible) es obligatoria.',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            // Cota C mínima
            [
                'configurable_article_id' => $articulo->id,
                'field'   => 'ancho_hueco',
                'type'    => 'min_value',
                'params'  => json_encode(['value' => 1580]),
                'message' => 'La medida C no puede ser inferior a 1580mm.',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            // Cota C máxima
            [
                'configurable_article_id' => $articulo->id,
                'field'   => 'ancho_hueco',
                'type'    => 'max_value',
                'params'  => json_encode(['value' => 6000]),
                'message' => 'La medida C no puede ser superior a 6000mm.',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            // Cota D máxima
            [
                'configurable_article_id' => $articulo->id,
                'field'   => 'alto_hueco',
                'type'    => 'max_value',
                'params'  => json_encode(['value' => 3000]),
                'message' => 'La medida D no puede ser superior a 3000mm.',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            // Cota A mínima respecto a D: A >= D + 140
            [
                'configurable_article_id' => $articulo->id,
                'field'   => 'alto_obra',
                'type'    => 'min_diff',
                'params'  => json_encode([
                    'field_a' => 'alto_obra',
                    'field_b' => 'alto_hueco',
                    'min'     => 140,
                ]),
                'message' => 'La medida A debe ser al menos 140mm mayor que la medida D.',
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ]);
    }
}
