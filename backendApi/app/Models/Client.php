<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Client extends Model
{
    use HasFactory;

    protected $fillable = [
        'company_id',
        'client_number',
        'dni',
        'nombre',
        'direccion',
        'poblacion',
        'codigo_postal',
        'provincia',
        'telefono',
        'telefono2',
        'email',
        'active',
    ];

    /*
    | RELACIONES
    */

    // 🏢 Un cliente pertenece a una empresa
    public function company()
    {
        return $this->belongsTo(Company::class);
    }

    // 📄 Un cliente tiene muchos presupuestos
    public function budgets()
    {
        return $this->hasMany(Budget::class);
    }
    // }
}
