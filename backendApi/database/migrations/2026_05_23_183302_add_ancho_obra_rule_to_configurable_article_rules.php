<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class () extends Migration {
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Insertar regla: B (ancho_obra) no puede ser inferior a C (ancho_hueco)
        // Solo aplica al artículo PTA2H2FSP de company_id=2
        $article = \App\Models\ConfigurableArticle::where('code', 'PTA2H2FSP')->first();

        if (!$article) {
            return;
        }

        $alreadyExists = \App\Models\ConfigurableArticleRule::where('configurable_article_id', $article->id)
            ->where('field', 'ancho_obra')
            ->where('type', 'min_diff')
            ->exists();

        if ($alreadyExists) {
            return;
        }

        \App\Models\ConfigurableArticleRule::create([
            'configurable_article_id' => $article->id,
            'field'   => 'ancho_obra',
            'type'    => 'min_diff',
            'params'  => [
                'field_a' => 'ancho_obra',
                'field_b' => 'ancho_hueco',
                'min'     => 0,
            ],
            'message' => 'La medida B (ancho obra) no puede ser inferior a C (ancho hueco libre).',
        ]);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        $article = \App\Models\ConfigurableArticle::where('code', 'PTA2H2FSP')->first();
        if (!$article) {
            return;
        }

        \App\Models\ConfigurableArticleRule::where('configurable_article_id', $article->id)
            ->where('field', 'ancho_obra')
            ->where('type', 'min_diff')
            ->delete();
    }
};
