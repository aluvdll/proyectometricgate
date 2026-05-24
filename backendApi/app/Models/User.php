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
    use HasFactory;
    use Notifiable;
    use HasApiTokens;

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

    // Normalizo avatar antes de guardar para evitar valores inválidos como "0".
    public function setAvatarAttribute($value): void
    {
        if ($value === null || $value === '' || $value === '0' || $value === 0) {
            $this->attributes['avatar'] = null;

            return;
        }

        $this->attributes['avatar'] = $value;
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
