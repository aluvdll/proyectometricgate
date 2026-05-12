<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class ConfigurableArticleRule extends Model
{
    use HasFactory;

    protected $fillable = [
        'configurable_article_id',
        'field',
        'type',
        'params',
        'message',
    ];

    protected $casts = [
        'params' => 'array',
    ];

    /*
    | RELACIONES
    */

    public function article()
    {
        return $this->belongsTo(ConfigurableArticle::class, 'configurable_article_id');
    }
}
