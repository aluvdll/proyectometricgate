<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use App\Models\ArticleFamily;

class StandardArticle extends Model
{
    use HasFactory;

    protected $fillable = [
        'company_id',
        'family_id',
        'code',
        'name',
        'description',
        'image',
        'base_price',
        'tax_percentage',
        'active',
    ];

    /*
    | RELACIONES
    */

    // 🏢 Un artículo pertenece a una empresa
    public function company()
    {
        return $this->belongsTo(Company::class);
    }

    // 🗂️ Un artículo puede pertenecer a una familia o a ninguna
    public function family()
    {
        return $this->belongsTo(ArticleFamily::class, 'family_id');
    }

    // 🧾 Un artículo puede aparecer en muchas líneas de presupuesto
    public function budgetLines()
    {
        return $this->hasMany(BudgetLine::class);
    }
}
