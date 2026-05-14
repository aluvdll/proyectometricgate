<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class OrderLineConfiguration extends Model
{
    use HasFactory;

    protected $table = 'order_line_configurations';

    protected $fillable = [
        'order_line_id',
        'ancho_hueco',
        'alto_hueco',
        'ancho_obra',
        'alto_obra',
        'paso_deseado',
        'options_chosen',
        'price_breakdown',
        'fabrication_measures',
    ];

    protected $casts = [
        'ancho_hueco' => 'decimal:2',
        'alto_hueco' => 'decimal:2',
        'ancho_obra' => 'decimal:2',
        'alto_obra' => 'decimal:2',
        'paso_deseado' => 'decimal:2',
        'options_chosen' => 'array',
        'price_breakdown' => 'array',
        'fabrication_measures' => 'array',
    ];

    // Una configuración pertenece a una línea de pedido
    public function orderLine()
    {
        return $this->belongsTo(OrderLine::class);
    }
}
