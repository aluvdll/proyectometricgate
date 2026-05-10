<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ArticleFamily extends Model
{
    use HasFactory;

    protected $fillable = [
        'company_id',
        'name',
        'description',
        'active',
    ];

    /*
    | RELACIONES
    */

    // 🏢 Una familia pertenece a una empresa
    public function company()
    {
        return $this->belongsTo(Company::class);
    }

    // 📦 Una familia puede tener muchos artículos
    public function standardArticles()
    {
        return $this->hasMany(StandardArticle::class, 'family_id');
    }
}
