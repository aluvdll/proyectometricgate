<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class BudgetLineConfiguration extends Model
{
    use HasFactory;

    protected $fillable = [
        'budget_line_id',
        'ancho_hueco',
        'alto_hueco',
        'ancho_obra',
        'alto_obra',
        'paso_deseado',
        'options_chosen',
        'price_breakdown',
    ];

    protected $casts = [
        'ancho_hueco'     => 'decimal:2',
        'alto_hueco'      => 'decimal:2',
        'ancho_obra'      => 'decimal:2',
        'alto_obra'       => 'decimal:2',
        'paso_deseado'    => 'decimal:2',
        'options_chosen'  => 'array',
        'price_breakdown' => 'array',
    ];

    /*
    | RELACIONES
    */

    public function budgetLine()
    {
        return $this->belongsTo(BudgetLine::class);
    }
}
