<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Order extends Model
{
    use HasFactory;

    protected $fillable = [
        'company_id',
        'budget_id',
        'client_id',
        'order_number',
        'order_date',
        'estimated_delivery',
        'delivery_date',
        'status',
        'base_amount',
        'tax_amount',
        'total_amount',
        'notes',
        'created_by_user_id',
    ];

    protected $casts = [
        'order_date' => 'date',
        'estimated_delivery' => 'date',
        'delivery_date' => 'date',
        'base_amount' => 'decimal:2',
        'tax_amount' => 'decimal:2',
        'total_amount' => 'decimal:2',
    ];


    // Un pedido pertenece a una empresa
    public function company()
    {
        return $this->belongsTo(Company::class);
    }

    // Un pedido pertenece a un presupuesto
    public function budget()
    {
        return $this->belongsTo(Budget::class);
    }

    // Un pedido pertenece a un cliente
    public function client()
    {
        return $this->belongsTo(Client::class);
    }

    // Un pedido tiene muchas líneas
    public function lines()
    {
        return $this->hasMany(OrderLine::class)->orderBy('position');
    }

    // Usuario que creó el pedido
    public function createdBy()
    {
        return $this->belongsTo(User::class, 'created_by_user_id');
    }
}
