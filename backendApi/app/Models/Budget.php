<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Budget extends Model
{
    use HasFactory;

    protected $fillable = [
        'company_id',
        'client_id',
        'created_by_user_id',
        'budget_number',
        'budget_date',
        'status',
        'base_amount',
        'tax_amount',
        'total_amount',
        'notes',
    ];

    /*
    | RELACIONES
    */

    // 🏢 Un presupuesto pertenece a una empresa
    public function company()
    {
        return $this->belongsTo(Company::class);
    }

    // 👤 Un presupuesto pertenece a un cliente
    public function client()
    {
        return $this->belongsTo(Client::class);
    }

    // 👤 Un presupuesto fue creado por un usuario
    public function createdBy()
    {
        return $this->belongsTo(User::class, 'created_by_user_id');
    }

    // 📋 Un presupuesto tiene muchas líneas
    public function lines()
    {
        return $this->hasMany(BudgetLine::class);
    }
}
