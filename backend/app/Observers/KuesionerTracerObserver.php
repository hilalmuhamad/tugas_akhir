<?php

namespace App\Observers;

use App\Models\AlumniProfile;

/**
 * Alias untuk skripsi: KuesionerTracer == AlumniProfile
 *
 * Bab 3 menyebut entitas "KuesionerTracer" sebagai sumber OLTP.
 * Di implementasi, tabel fisiknya adalah alumni_profiles (unique user_id).
 * Observer ini mewarisi AlumniProfileObserver agar dosen penguji
 * menemukan file dengan nama yang ada di naskah.
 *
 * Registrasi dua-duanya tidak duplikat: KuesionerTracerObserver
 * hanya extends, bukan di-register terpisah.
 *
 * @see AlumniProfileObserver
 */
class KuesionerTracerObserver extends AlumniProfileObserver
{
    // Inherit created/updated -> syncSingleProfile
}
