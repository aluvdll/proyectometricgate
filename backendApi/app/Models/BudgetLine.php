<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class BudgetLine extends Model
{
    use HasFactory;

    protected $fillable = [
        'budget_id',
        'article_type',
        'standard_article_id',
        'configurable_article_id',
        'name',
        'description',
        'quantity',
        'unit_price',
        'gross_subtotal',
        'discount_percentage',
        'discount_amount',
        'net_subtotal',
        'tax_percentage',
        'tax_amount',
        'total_amount',
        'position',
    ];

    /*
    | RELACIONES
    */

    // 🧾 Una línea pertenece a un presupuesto
    public function budget()
    {
        return $this->belongsTo(Budget::class);
    }

    // 📦 Una línea puede apuntar a un artículo estándar (nullable)
    public function standardArticle()
    {
        return $this->belongsTo(StandardArticle::class);
    }

    // 📦 Una línea puede apuntar a un artículo configurable (nullable) - 🚧 pendiente
    public function configurableArticle()
    {
        return $this->belongsTo(ConfigurableArticle::class);
    }
}
