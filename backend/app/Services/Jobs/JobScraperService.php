<?php

namespace App\Services\Jobs;

use App\Models\Lowongan;
use App\Services\Jobs\Sources\AdzunaSource;
use App\Services\Jobs\Sources\JobicySource;
use App\Services\Jobs\Sources\JobSource;
use App\Services\Jobs\Sources\LokerSource;
use App\Services\Jobs\Sources\RemotiveSource;
use Illuminate\Support\Facades\Log;

/**
 * Mengumpulkan lowongan dari berbagai sumber web (Remotive, Jobicy,
 * dan Adzuna bila dikonfigurasi) lalu menyimpannya ke tabel lowongans.
 *
 * Duplikat dicegah dengan upsert berbasis (judul_posisi + perusahaan);
 * data seeder tetap dipakai sebagai baseline saat web tidak terjangkau.
 */
class JobScraperService
{
    /** @var array<int, JobSource> */
    private array $sources;

    public function __construct()
    {
        $this->sources = [
            new LokerSource(),
            new RemotiveSource(),
            new JobicySource(),
            new AdzunaSource(),
        ];
    }

    /**
     * @return array{diambil: int, baru: int, diperbarui: int, gagal: int, ditolak: int}
     */
    public function scrape(?string $hanyaSource = null, int $limitPerSource = 50): array
    {
        $diambil = 0;
        $tersimpan = 0;
        $diperbarui = 0;
        $ditolak = 0;

        foreach ($this->sources as $source) {
            if ($hanyaSource !== null && $source->name() !== $hanyaSource) {
                continue;
            }

            if (method_exists($source, 'isEnabled') && ! $source->isEnabled()) {
                continue;
            }

            try {
                $jobs = $source->fetch($limitPerSource);
            } catch (\Throwable $e) {
                Log::warning("Scraper {$source->name()} gagal: {$e->getMessage()}");
                continue;
            }

            $diambil += count($jobs);

            foreach ($jobs as $job) {
                // Hanya lowongan IT yang disimpan — saring terpusat di sini
                // agar korpus TF-IDF tidak terkontaminasi non-IT.
                if (! ItKeywordFilter::isItJob($job)) {
                    $ditolak++;
                    continue;
                }

                $result = Lowongan::updateOrCreate(
                    [
                        'judul_posisi' => $job['judul_posisi'],
                        'perusahaan' => $job['perusahaan'],
                    ],
                    [
                        'lokasi' => $job['lokasi'],
                        'gaji_min' => $job['gaji_min'],
                        'gaji_max' => $job['gaji_max'],
                        'deskripsi' => $job['deskripsi'],
                        'keahlian' => $job['keahlian'],
                        'sumber_url' => $job['sumber_url'] ?? null,
                        'terverifikasi_pada' => now(),
                    ]
                );

                $result->wasRecentlyCreated ? $tersimpan++ : $diperbarui++;
            }
        }

        return [
            'diambil' => $diambil,
            'tersimpan' => $tersimpan,
            'diperbarui' => $diperbarui,
            'gagal' => 0,
            'ditolak' => $ditolak,
            'total_database' => Lowongan::count(),
        ];
    }

    /**
     * Rapikan korpus lama: nonaktifkan lowongan hasil scraping
     * (sumber_url terisi) yang bukan IT. Lowongan manual admin
     * (sumber_url kosong) tidak disentuh. Reversibel via toggle aktif.
     *
     * @return array{diperiksa: int, dinonaktifkan: int}
     */
    public function rapikan(): array
    {
        $diperiksa = 0;
        $dinonaktifkan = 0;

        foreach (Lowongan::whereNotNull('sumber_url')->get() as $job) {
            $diperiksa++;
            $data = [
                'judul_posisi' => $job->judul_posisi,
                'deskripsi' => (string) $job->deskripsi,
                'keahlian' => (array) $job->keahlian,
            ];
            if (! ItKeywordFilter::isItJob($data) && $job->aktif) {
                $job->aktif = false;
                $job->save();
                $dinonaktifkan++;
            }
        }

        return [
            'diperiksa' => $diperiksa,
            'dinonaktifkan' => $dinonaktifkan,
        ];
    }
}