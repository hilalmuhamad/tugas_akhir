<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

// Ambil lowongan terbaru dari web setiap hari pukul 03:00
Schedule::command('jobs:scrape')->dailyAt('03:00');
