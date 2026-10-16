<?php

use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return view('app');
});

/*
|--------------------------------------------------------------------------
| React SPA
|--------------------------------------------------------------------------
*/

Route::get('/{any}', function () {
    return view('app');
})->where('any', '.*');