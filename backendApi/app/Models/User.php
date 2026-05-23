<?php

namespace App\Models;

use App\Models\Company;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Notifications\Notifiable;
use Illuminate\Testing\Fluent\Concerns\Has;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasFactory, Notifiable, HasApiTokens;

    protected $fillable = [
        'company_id',
        'name',
        'email',
        'password',
        'dni',
        'phone',
        'address',
        'city',
        'province',
        'avatar',
        'role',
        'active',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
        ];
    }

    // 🏢 RELACIÓN CON EMPRESA
    public function company()
    {
        return $this->belongsTo(Company::class);
    }

    // 📄 Presupuestos creados por este usuario
    public function createdBudgets()
    {
        return $this->hasMany(Budget::class, 'created_by_user_id');
    }
}
