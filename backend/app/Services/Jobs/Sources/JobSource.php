<?php

namespace App\Services\Jobs\Sources;

/**
 * Kontrak untuk tiap sumber lowongan.
 */
interface JobSource
{
    public function name(): string;

    /**
     * Ambil daftar lowongan ternormalisasi dari sumber.
     *
     * @return array<int, array{
     *     judul_posisi: string,
     *     perusahaan: string,
     *     lokasi: string,
     *     gaji_min: ?int,
     *     gaji_max: ?int,
     *     deskripsi: string,
     *     keahlian: array<int, string>,
     *     sumber_url: ?string,
     * }>
     */
    public function fetch(int $limit): array;
}