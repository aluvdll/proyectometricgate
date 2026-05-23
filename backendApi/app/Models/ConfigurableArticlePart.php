<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class ConfigurableArticlePart extends Model
{
    use HasFactory;

    protected $fillable = [
        'configurable_article_id',
        'key',
        'name',
        'unit',
        'order',
    ];

    /*
    | RELACIONES
    */

    public function article()
    {
        return $this->belongsTo(ConfigurableArticle::class, 'configurable_article_id')->orderBy('order');
    }

    public function options()
    {
        return $this->hasMany(ConfigurableArticleOption::class, 'part_id');
    }
}
