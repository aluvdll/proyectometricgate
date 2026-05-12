<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class ConfigurableArticle extends Model
{
    use HasFactory;

    protected $fillable = [
        'company_id',
        'code',
        'name',
        'description',
        'tax_percentage',
        'max_hojas_weight_kg',
        'active',
    ];

    protected $casts = [
        'tax_percentage'      => 'decimal:2',
        'max_hojas_weight_kg' => 'decimal:2',
        'active'              => 'boolean',
    ];

    /*
    | RELACIONES
    */

    public function company()
    {
        return $this->belongsTo(Company::class);
    }

    public function parts()
    {
        return $this->hasMany(ConfigurableArticlePart::class)->orderBy('order');
    }

    public function rules()
    {
        return $this->hasMany(ConfigurableArticleRule::class);
    }
}
