<?php

namespace App\Providers;

use App\Models\AlumniProfile;
use App\Models\PersonalAccessToken;
use App\Observers\AlumniProfileObserver;
use Illuminate\Support\ServiceProvider;
use Laravel\Sanctum\Sanctum;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     * Event-Driven Real-Time Sync: OLTP -> DW instant.
     */
    public function boot(): void
    {
        AlumniProfile::observe(AlumniProfileObserver::class);
        Sanctum::usePersonalAccessTokenModel(PersonalAccessToken::class);
    }
}
