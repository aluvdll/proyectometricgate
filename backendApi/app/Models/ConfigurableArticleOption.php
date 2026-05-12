<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class ConfigurableArticleOption extends Model
{
    use HasFactory;

    protected $fillable = [
        'part_id',
        'key',
        'label',
        'price',
        'is_default',
    ];

    protected $casts = [
        'price'      => 'decimal:2',
        'is_default' => 'boolean',
    ];

    /*
    | RELACIONES
    */

    public function part()
    {
        return $this->belongsTo(ConfigurableArticlePart::class, 'part_id');
    }

    public function companyPrices()
    {
        return $this->hasMany(\App\Models\ConfigurableArticleOptionPrice::class, 'configurable_article_option_id');
    }
}
