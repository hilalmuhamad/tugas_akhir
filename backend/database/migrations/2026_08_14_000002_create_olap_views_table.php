<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

/*
 * Lapisan OLAP: seluruh agregasi dasbor tracer study dikerjakan PostgreSQL
 * lewat view. Laravel hanya SELECT, tidak menghitung apa pun.
 *
 * Ditulis ulang 2026-08-27 karena tiga hal:
 *
 *  1. OlapController menyaring setiap view dengan `WHERE tahun_survei = ?`,
 *     padahal versi lama tidak punya kolom itu sama sekali. Akibatnya seluruh
 *     dasbor selalu jatuh ke fallback, atau galat kolom tidak ditemukan pada
 *     basis data yang dibangun ulang dari migrasi.
 *  2. Empat view yang dibaca controller tidak pernah dibuat oleh migrasi apa
 *     pun: v_olap_keselarasan_program_studi (versi lama bernama
 *     v_olap_program_studi_keselarasan), v_olap_masa_tunggu,
 *     v_olap_ketepatan_waktu.
 *  3. Kategori keselarasan diringkas menjadi 'Selaras'/'Tidak Selaras' dan
 *     status kerja menjadi 'Bekerja'/'Tidak Bekerja' (revisi pascasidang).
 *
 * JENDELA KOHORT. Survei tahun TS mencakup lulusan TS-1 dan TS-2, sama dengan
 * OlapController::kohortWindow(). Karena itu satu baris fakta ikut dua survei:
 * sebagai TS-1 pada survei tahun_lulus+1 dan sebagai TS-2 pada survei
 * tahun_lulus+2. Penggandaan itu disengaja dan hanya ada di v_olap_kohort ke
 * atas; v_olap_detail tetap satu baris per alumni.
 *
 * PENYEBUT KESELARASAN. Keselarasan hanya bermakna bagi alumni yang bekerja,
 * jadi penyebutnya adalah alumni berstatus 'Bekerja' yang keselarasan_key-nya
 * terisi — bukan seluruh responden. Kategori yang tidak punya satu pun alumni
 * tetap muncul dengan nilai 0 supaya grafik tidak berubah jumlah batangnya.
 */
return new class extends Migration
{
    public function up(): void
    {
        foreach ($this->views() as $name => $sql) {
            DB::statement($sql);
            DB::statement("COMMENT ON VIEW {$name} IS 'Lapisan OLAP dasbor tracer study — agregasi dikerjakan PostgreSQL'");
        }
    }

    public function down(): void
    {
        foreach (array_reverse(array_keys($this->views())) as $name) {
            DB::statement("DROP VIEW IF EXISTS {$name} CASCADE");
        }
    }

    /**
     * Urutan penting: v_olap_kohort dan v_olap_detail dibuat lebih dahulu
     * karena view lain membangun di atasnya.
     *
     * @return array<string, string>
     */
    private function views(): array
    {
        return [

            /* ---------------------------------------------------------------
             * 1. v_olap_detail — satu baris per alumni, tanpa tahun survei.
             *    Dipakai GET /api/olap/detail ketika tidak ada filter, dan
             *    menjadi sumber opsi isian kuesioner di frontend.
             * ------------------------------------------------------------- */
            'v_olap_detail' => <<<'SQL'
                CREATE OR REPLACE VIEW v_olap_detail AS
                SELECT
                    f.fact_key,
                    f.alumni_key,
                    da.id_sumber,
                    da.nama,
                    da.gender,
                    da.jenjang,
                    da.tahun_masuk,
                    da.jabatan,
                    da.bidang_pekerjaan,
                    dp.program_studi,
                    dp.specialisasi,
                    dw.tahun_lulus,
                    dw.dekade,
                    sk.status_bekerja,
                    sk.kategori_penghasilan,
                    dk.kategori_horizontal,
                    dk.kategori_vertikal,
                    f.pengalaman_kerja,
                    f.ipk,
                    f.masa_tunggu_bulan,
                    f.gaji_juta,
                    (dw.tahun_lulus - da.tahun_masuk) AS masa_studi_tahun,
                    CASE
                        WHEN da.tahun_masuk IS NULL THEN NULL
                        WHEN da.jenjang = 'D3' THEN (dw.tahun_lulus - da.tahun_masuk) <= 3
                        ELSE (dw.tahun_lulus - da.tahun_masuk) <= 4
                    END AS lulus_tepat_waktu
                FROM fact_tracer_alumni f
                JOIN dim_alumni da            ON da.alumni_key      = f.alumni_key
                JOIN dim_program_studi dp     ON dp.prodi_key       = f.prodi_key
                JOIN dim_waktu dw             ON dw.waktu_key       = f.waktu_key
                JOIN dim_status_kerja sk      ON sk.status_key      = f.status_key
                LEFT JOIN dim_keselarasan dk  ON dk.keselarasan_key = f.keselarasan_key
            SQL,

            /* ---------------------------------------------------------------
             * 2. v_olap_kohort — v_olap_detail yang sudah dipetakan ke tahun
             *    survei. Inilah dasar seluruh view agregasi di bawahnya.
             * ------------------------------------------------------------- */
            'v_olap_kohort' => <<<'SQL'
                CREATE OR REPLACE VIEW v_olap_kohort AS
                SELECT
                    ts.tahun_survei,
                    CASE d.tahun_lulus
                        WHEN ts.tahun_survei - 1 THEN 'TS-1'
                        WHEN ts.tahun_survei - 2 THEN 'TS-2'
                    END AS cohort,
                    d.*
                FROM v_olap_detail d
                JOIN dim_tahun_survei ts
                  ON d.tahun_lulus BETWEEN ts.tahun_survei - 2 AND ts.tahun_survei - 1
            SQL,

            /* ---------------------------------------------------------------
             * 3. v_olap_summary — kartu ringkasan di puncak dasbor.
             *    Grain: tahun_survei.
             * ------------------------------------------------------------- */
            'v_olap_summary' => <<<'SQL'
                CREATE OR REPLACE VIEW v_olap_summary AS
                SELECT
                    tahun_survei,
                    COUNT(*)::bigint AS total_alumni,
                    (COUNT(*) FILTER (WHERE status_bekerja = 'Bekerja'))::bigint AS alumni_bekerja,
                    (COUNT(*) FILTER (WHERE status_bekerja <> 'Bekerja'))::bigint AS alumni_tidak_bekerja,
                    ROUND(COUNT(*) FILTER (WHERE status_bekerja = 'Bekerja') * 100.0
                          / NULLIF(COUNT(*), 0), 2) AS persentase_bekerja,
                    ROUND(AVG(ipk)::numeric, 2) AS rata_rata_ipk,
                    ROUND(AVG(masa_tunggu_bulan)::numeric, 2) AS rata_rata_masa_tunggu,
                    ROUND((AVG(gaji_juta) FILTER (WHERE status_bekerja = 'Bekerja'))::numeric, 2) AS rata_rata_gaji
                FROM v_olap_kohort
                GROUP BY tahun_survei
                ORDER BY tahun_survei DESC
            SQL,

            /* ---------------------------------------------------------------
             * 4. v_olap_status_kerja — dua kategori status per tahun lulus.
             *    Grain: tahun_survei x tahun_lulus.
             * ------------------------------------------------------------- */
            'v_olap_status_kerja' => <<<'SQL'
                CREATE OR REPLACE VIEW v_olap_status_kerja AS
                SELECT
                    tahun_survei,
                    cohort,
                    tahun_lulus,
                    COUNT(*)::bigint AS jumlah_alumni,
                    (COUNT(*) FILTER (WHERE status_bekerja = 'Bekerja'))::bigint AS bekerja,
                    (COUNT(*) FILTER (WHERE status_bekerja = 'Tidak Bekerja'))::bigint AS tidak_bekerja,
                    ROUND(COUNT(*) FILTER (WHERE status_bekerja = 'Bekerja') * 100.0
                          / NULLIF(COUNT(*), 0), 2) AS persentase_bekerja
                FROM v_olap_kohort
                GROUP BY tahun_survei, cohort, tahun_lulus
                ORDER BY tahun_survei DESC, tahun_lulus DESC
            SQL,

            /* ---------------------------------------------------------------
             * 5. v_olap_program_studi — sebaran dan capaian per prodi.
             *    Grain: tahun_survei x tahun_lulus x program_studi.
             * ------------------------------------------------------------- */
            'v_olap_program_studi' => <<<'SQL'
                CREATE OR REPLACE VIEW v_olap_program_studi AS
                SELECT
                    tahun_survei,
                    cohort,
                    tahun_lulus,
                    program_studi,
                    COUNT(*)::bigint AS jumlah_alumni,
                    (COUNT(*) FILTER (WHERE status_bekerja = 'Bekerja'))::bigint AS alumni_bekerja,
                    (COUNT(*) FILTER (WHERE status_bekerja = 'Tidak Bekerja'))::bigint AS alumni_tidak_bekerja,
                    ROUND(COUNT(*) FILTER (WHERE status_bekerja = 'Bekerja') * 100.0
                          / NULLIF(COUNT(*), 0), 2) AS persentase_bekerja,
                    ROUND(AVG(ipk)::numeric, 2) AS rata_rata_ipk,
                    ROUND(AVG(gaji_juta)::numeric, 2) AS rata_rata_gaji,
                    ROUND(AVG(masa_tunggu_bulan)::numeric, 2) AS rata_rata_masa_tunggu,
                    ROUND(AVG(masa_studi_tahun)::numeric, 2) AS rata_rata_masa_studi,
                    (COUNT(*) FILTER (WHERE lulus_tepat_waktu))::bigint AS lulus_tepat_waktu
                FROM v_olap_kohort
                GROUP BY tahun_survei, cohort, tahun_lulus, program_studi
                ORDER BY tahun_survei DESC, tahun_lulus DESC, program_studi
            SQL,

            /* ---------------------------------------------------------------
             * 6. v_olap_tahun_lulus — roll-up waktu.
             *    Grain: tahun_survei x tahun_lulus.
             * ------------------------------------------------------------- */
            'v_olap_tahun_lulus' => <<<'SQL'
                CREATE OR REPLACE VIEW v_olap_tahun_lulus AS
                SELECT
                    tahun_survei,
                    cohort,
                    tahun_lulus,
                    dekade,
                    COUNT(*)::bigint AS jumlah_alumni,
                    (COUNT(*) FILTER (WHERE status_bekerja = 'Bekerja'))::bigint AS alumni_bekerja,
                    (COUNT(*) FILTER (WHERE status_bekerja = 'Tidak Bekerja'))::bigint AS alumni_tidak_bekerja,
                    ROUND(AVG(masa_tunggu_bulan)::numeric, 2) AS rata_rata_masa_tunggu
                FROM v_olap_kohort
                GROUP BY tahun_survei, cohort, tahun_lulus, dekade
                ORDER BY tahun_survei DESC, tahun_lulus DESC
            SQL,

            /* ---------------------------------------------------------------
             * 7. v_olap_keselarasan — dua dimensi keselarasan, dua kategori.
             *    Grain: tahun_survei x dimensi x kategori (4 baris per survei).
             *    Kategori berjumlah 0 tetap muncul (CROSS JOIN kerangka).
             * ------------------------------------------------------------- */
            'v_olap_keselarasan' => <<<'SQL'
                CREATE OR REPLACE VIEW v_olap_keselarasan AS
                WITH dasar AS (
                    SELECT tahun_survei, kategori_horizontal, kategori_vertikal
                    FROM v_olap_kohort
                    WHERE status_bekerja = 'Bekerja'
                      AND kategori_horizontal IS NOT NULL
                      AND kategori_vertikal IS NOT NULL
                ),
                terurai AS (
                    SELECT tahun_survei, 'Horizontal'::text AS dimensi, kategori_horizontal AS kategori FROM dasar
                    UNION ALL
                    SELECT tahun_survei, 'Vertikal'::text   AS dimensi, kategori_vertikal   AS kategori FROM dasar
                ),
                penyebut AS (
                    SELECT tahun_survei, COUNT(*)::bigint AS jumlah_responden
                    FROM dasar
                    GROUP BY tahun_survei
                ),
                kerangka AS (
                    SELECT p.tahun_survei, p.jumlah_responden,
                           d.dimensi, d.urutan_dimensi,
                           k.kategori, k.urutan_kategori
                    FROM penyebut p
                    CROSS JOIN (VALUES ('Horizontal'::text, 1), ('Vertikal'::text, 2))
                               AS d(dimensi, urutan_dimensi)
                    CROSS JOIN (VALUES ('Selaras'::text, 1), ('Tidak Selaras'::text, 2))
                               AS k(kategori, urutan_kategori)
                )
                SELECT
                    kr.tahun_survei,
                    kr.dimensi,
                    kr.kategori,
                    kr.urutan_dimensi,
                    kr.urutan_kategori,
                    kr.jumlah_responden,
                    COUNT(t.kategori)::bigint AS jumlah_alumni,
                    ROUND(COUNT(t.kategori) * 100.0 / NULLIF(kr.jumlah_responden, 0), 2) AS persentase
                FROM kerangka kr
                LEFT JOIN terurai t
                       ON t.tahun_survei = kr.tahun_survei
                      AND t.dimensi      = kr.dimensi
                      AND t.kategori     = kr.kategori
                GROUP BY kr.tahun_survei, kr.dimensi, kr.kategori,
                         kr.urutan_dimensi, kr.urutan_kategori, kr.jumlah_responden
                ORDER BY kr.tahun_survei DESC, kr.urutan_dimensi, kr.urutan_kategori
            SQL,

            /* ---------------------------------------------------------------
             * 8. v_olap_keselarasan_program_studi — drill-down keselarasan.
             *    Grain: tahun_survei x program_studi x dimensi x kategori.
             *    Penyebut dihitung per prodi, jadi persentase tiap prodi
             *    berjumlah 100 untuk masing-masing dimensi.
             * ------------------------------------------------------------- */
            'v_olap_keselarasan_program_studi' => <<<'SQL'
                CREATE OR REPLACE VIEW v_olap_keselarasan_program_studi AS
                WITH dasar AS (
                    SELECT tahun_survei, program_studi, kategori_horizontal, kategori_vertikal
                    FROM v_olap_kohort
                    WHERE status_bekerja = 'Bekerja'
                      AND kategori_horizontal IS NOT NULL
                      AND kategori_vertikal IS NOT NULL
                ),
                terurai AS (
                    SELECT tahun_survei, program_studi, 'Horizontal'::text AS dimensi, kategori_horizontal AS kategori FROM dasar
                    UNION ALL
                    SELECT tahun_survei, program_studi, 'Vertikal'::text   AS dimensi, kategori_vertikal   AS kategori FROM dasar
                ),
                penyebut AS (
                    SELECT tahun_survei, program_studi, COUNT(*)::bigint AS jumlah_responden
                    FROM dasar
                    GROUP BY tahun_survei, program_studi
                ),
                kerangka AS (
                    SELECT p.tahun_survei, p.program_studi, p.jumlah_responden,
                           d.dimensi, d.urutan_dimensi,
                           k.kategori, k.urutan_kategori
                    FROM penyebut p
                    CROSS JOIN (VALUES ('Horizontal'::text, 1), ('Vertikal'::text, 2))
                               AS d(dimensi, urutan_dimensi)
                    CROSS JOIN (VALUES ('Selaras'::text, 1), ('Tidak Selaras'::text, 2))
                               AS k(kategori, urutan_kategori)
                )
                SELECT
                    kr.tahun_survei,
                    kr.program_studi,
                    kr.dimensi,
                    kr.kategori,
                    kr.urutan_dimensi,
                    kr.urutan_kategori,
                    kr.jumlah_responden,
                    COUNT(t.kategori)::bigint AS jumlah_alumni,
                    ROUND(COUNT(t.kategori) * 100.0 / NULLIF(kr.jumlah_responden, 0), 2) AS persentase
                FROM kerangka kr
                LEFT JOIN terurai t
                       ON t.tahun_survei  = kr.tahun_survei
                      AND t.program_studi = kr.program_studi
                      AND t.dimensi       = kr.dimensi
                      AND t.kategori      = kr.kategori
                GROUP BY kr.tahun_survei, kr.program_studi, kr.dimensi, kr.kategori,
                         kr.urutan_dimensi, kr.urutan_kategori, kr.jumlah_responden
                ORDER BY kr.tahun_survei DESC, kr.program_studi,
                         kr.urutan_dimensi, kr.urutan_kategori
            SQL,

            /* ---------------------------------------------------------------
             * 9. v_olap_masa_tunggu — hanya alumni yang punya masa tunggu.
             *    Grain: tahun_survei x tahun_lulus x program_studi.
             * ------------------------------------------------------------- */
            'v_olap_masa_tunggu' => <<<'SQL'
                CREATE OR REPLACE VIEW v_olap_masa_tunggu AS
                SELECT
                    tahun_survei,
                    cohort,
                    tahun_lulus,
                    program_studi,
                    COUNT(*)::bigint AS jumlah_alumni,
                    ROUND(AVG(masa_tunggu_bulan)::numeric, 2) AS rata_rata_masa_tunggu,
                    MIN(masa_tunggu_bulan) AS masa_tunggu_min,
                    MAX(masa_tunggu_bulan) AS masa_tunggu_max
                FROM v_olap_kohort
                WHERE masa_tunggu_bulan IS NOT NULL
                GROUP BY tahun_survei, cohort, tahun_lulus, program_studi
                ORDER BY tahun_survei DESC, tahun_lulus DESC, program_studi
            SQL,

            /* ---------------------------------------------------------------
             * 10. v_olap_ketepatan_waktu — D3 <= 3 tahun, S1 <= 4 tahun.
             *     Alumni tanpa tahun_masuk tidak dapat dinilai dan
             *     dikeluarkan dari penyebut persentase.
             *     Grain: tahun_survei x tahun_lulus.
             * ------------------------------------------------------------- */
            'v_olap_ketepatan_waktu' => <<<'SQL'
                CREATE OR REPLACE VIEW v_olap_ketepatan_waktu AS
                SELECT
                    tahun_survei,
                    cohort,
                    tahun_lulus,
                    COUNT(*)::bigint AS jumlah_alumni,
                    (COUNT(*) FILTER (WHERE lulus_tepat_waktu))::bigint AS tepat_waktu,
                    (COUNT(*) FILTER (WHERE NOT lulus_tepat_waktu))::bigint AS tidak_tepat_waktu,
                    (COUNT(*) FILTER (WHERE lulus_tepat_waktu IS NULL))::bigint AS tidak_dapat_dinilai,
                    ROUND(AVG(masa_studi_tahun)::numeric, 2) AS rata_rata_masa_studi,
                    ROUND(COUNT(*) FILTER (WHERE lulus_tepat_waktu) * 100.0
                          / NULLIF(COUNT(*) FILTER (WHERE lulus_tepat_waktu IS NOT NULL), 0), 2)
                          AS persentase_tepat_waktu
                FROM v_olap_kohort
                GROUP BY tahun_survei, cohort, tahun_lulus
                ORDER BY tahun_survei DESC, tahun_lulus DESC
            SQL,
        ];
    }
};
