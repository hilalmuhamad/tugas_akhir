<?php

use App\Http\Controllers\Api\AlumniController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\CareerController;
use App\Http\Controllers\Api\JobController;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\OlapController;

Route::post('/auth/login', [AuthController::class, 'login']);
Route::post('/auth/register', [AuthController::class, 'register']);
Route::get('/stats', [AlumniController::class, 'stats']);
Route::post('/jobs/search', [JobController::class, 'search']);
Route::get('/jobs/regions', [JobController::class, 'regions']);
Route::get('/laporan/unduh', [AlumniController::class, 'unduhLaporan']);
Route::get('/laporan/unduh-pdf', [AlumniController::class, 'unduhLaporanPdf']);
Route::prefix('olap')->group(function () {
    Route::get('/summary', [OlapController::class, 'summary']);
    Route::get('/status-kerja', [OlapController::class, 'statusKerja']);
    Route::get('/program-studi', [OlapController::class, 'programStudi']);
    Route::get('/tahun-lulus', [OlapController::class, 'tahunLulus']);
    Route::get('/keselarasan', [OlapController::class, 'keselarasan']);

    Route::get(
        '/keselarasan-program-studi',
        [OlapController::class, 'keselarasanProgramStudi']
    );

    Route::get('/detail', [OlapController::class, 'detail']);
    Route::get('/masa-tunggu', [OlapController::class, 'masaTunggu']);
    Route::get(
        '/masa-tunggu-histori',
        [OlapController::class, 'masaTungguHistori']
    );
    Route::get('/ketepatan-waktu', [OlapController::class, 'ketepatanWaktu']);

    Route::get(
        '/staff/target-responden',
        [OlapController::class, 'targetResponden']
    );

    Route::get('/tahun-survei', [OlapController::class, 'tahunSurvei']);
    Route::get('/rekap-program-studi', [OlapController::class, 'rekapProgramStudi']);
});
Route::middleware('auth:sanctum')->post('/olap/sync', [OlapController::class, 'sync']);

    Route::middleware('auth:sanctum')->group(function () {
        // route yang memang membutuhkan login
    });

Route::middleware('auth:sanctum')->group(function () {
    Route::post('/auth/logout', [AuthController::class, 'logout']);
    Route::get('/auth/me', [AuthController::class, 'me']);
    Route::post('/auth/profile', [AuthController::class, 'updateProfile']);
    Route::put('/auth/password', [AuthController::class, 'updatePassword']);
    Route::put('/auth/notifications', [AuthController::class, 'updateNotifications']);
    Route::get('/alumni', [AlumniController::class, 'index']);
    Route::get('/profile', [AlumniController::class, 'showProfile']);
    Route::post('/profile', [AlumniController::class, 'saveProfile']);

    Route::get('/jobs', [JobController::class, 'index']);
    Route::post('/jobs', [JobController::class, 'store']);
    Route::patch('/jobs/{id}', [JobController::class, 'toggleAktif']);
    Route::delete('/jobs/{id}', [JobController::class, 'destroy']);
    Route::get('/search-logs', [JobController::class, 'logs']);

    Route::post('/career/analyze', [CareerController::class, 'analyze']);
    Route::post('/career/linkedin-scrape', [CareerController::class, 'linkedinScrape']);
    Route::post('/career/{id}/chat', [CareerController::class, 'chat']);
    Route::get('/career/history', [CareerController::class, 'history']);
    Route::get('/career/{id}', [CareerController::class, 'show']);
    Route::post('/jobs/scrape', [JobController::class, 'scrape']);


}); 