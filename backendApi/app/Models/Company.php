<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use App\Models\ArticleFamily;

class Company extends Model
{

    protected $fillable = [
        'fiscal_name',
        'commercial_name',
        'cif_nif',
        'email',
        'address',
        'phone',
        'phone2',
        'city',
        'province',
        'postal_code',
        'logo',
        'active',
        'max_users',
    ];

    /*
    | RELACIONES
    */

    # Una empresa tiene muchos usuarios
    public function users()
    {
        return $this->hasMany(User::class);
    }

    # Una empresa tiene muchos clientes
    public function clients()
    {
        return $this->hasMany(Client::class);
    }

    # Una empresa tiene muchos artículos estándar
    public function standardArticles()
    {
        return $this->hasMany(StandardArticle::class);
    }

    # Una empresa tiene muchas familias de artículos
    public function articleFamilies()
    {
        return $this->hasMany(ArticleFamily::class);
    }

    # Una empresa tiene muchos presupuestos
    public function budgets()
    {
        return $this->hasMany(Budget::class);
    }

    /*

    # Una empresa tiene muchos productos
    public function products()
    {
        return $this->hasMany(Product::class);
    }

    # Una empresa tiene muchos presupuestos
    public function quotes()
    {
        return $this->hasMany(Quote::class);
    }
*/
}
