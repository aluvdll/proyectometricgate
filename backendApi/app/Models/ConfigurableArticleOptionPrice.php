<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ConfigurableArticleOptionPrice extends Model
{
    use HasFactory;

    protected $fillable = [
        'company_id',
        'configurable_article_option_id',
        'price',
    ];

    protected $casts = [
        'price' => 'decimal:2',
    ];

    public function company()
    {
        return $this->belongsTo(Company::class);
    }

    public function option()
    {
        return $this->belongsTo(ConfigurableArticleOption::class, 'configurable_article_option_id');
    }
}
