<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class OrderLine extends Model
{
    use HasFactory;

    protected $table = 'order_lines';

    protected $fillable = [
        'order_id',
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

    protected $casts = [
        'quantity' => 'decimal:2',
        'unit_price' => 'decimal:2',
        'gross_subtotal' => 'decimal:2',
        'discount_percentage' => 'decimal:2',
        'discount_amount' => 'decimal:2',
        'net_subtotal' => 'decimal:2',
        'tax_percentage' => 'decimal:2',
        'tax_amount' => 'decimal:2',
        'total_amount' => 'decimal:2',
    ];

    // ╔════════════════════════════════════════════════════════════════╗
    // ║ RELACIONES                                                     ║
    // ╚════════════════════════════════════════════════════════════════╝

    // Una línea pertenece a un pedido
    public function order()
    {
        return $this->belongsTo(Order::class);
    }

    // Una línea puede apuntar a un artículo estándar
    public function standardArticle()
    {
        return $this->belongsTo(StandardArticle::class);
    }

    // Una línea puede apuntar a un artículo configurable
    public function configurableArticle()
    {
        return $this->belongsTo(ConfigurableArticle::class);
    }

    // Una línea configurable tiene medidas de fabricación
    public function configuration()
    {
        return $this->hasOne(OrderLineConfiguration::class);
    }
}
