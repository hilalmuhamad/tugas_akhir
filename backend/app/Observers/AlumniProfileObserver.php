<?php

namespace App\Observers;

use App\Models\AlumniProfile;
use App\Services\EtlService;
use Illuminate\Support\Facades\Log;

/**
 * Observer Event-Driven Real-Time Sync
 * OLTP (alumni_profiles) -> DW (star schema) -> OLAP (views)
 *
 * Domain: Tracer Study. KuesionerTracer secara model = AlumniProfile
 * (1 user : 1 profile, unique user_id). Hook created/updated agar
 * dashboard OLAP admin selalu agregasi terbaru tanpa rebuild penuh
 * dan tanpa menunggu cron/manual etl:sync.
 *
 * Dipanggil otomatis oleh Eloquent. Inside -> EtlService::syncSingleProfile
 * Hanya proses 1 alumni (instant), bukan truncate+rebuild seluruh warehouse.
 */
class AlumniProfileObserver
{
    /**
     * Handle the AlumniProfile "created" event.
     */
    public function created(AlumniProfile $profile): void
    {
        $this->sync($profile, 'created');
    }

    /**
     * Handle the AlumniProfile "updated" event.
     */
    public function updated(AlumniProfile $profile): void
    {
        $this->sync($profile, 'updated');
    }

    /**
     * Central sync — instant single-profile ETL.
     */
    private function sync(AlumniProfile $profile, string $event): void
    {
        try {
            app(EtlService::class)->syncSingleProfile($profile->id);
        } catch (\Throwable $e) {
            Log::error("AlumniProfileObserver::{$event} sync failed for id={$profile->id}", [
                'error' => $e->getMessage(),
            ]);
            // Jangan throw ke user: kuesioner sudah tersimpan di OLTP,
            // sync DW boleh retry via etl:sync manual jika gagal.
        }
    }
}
