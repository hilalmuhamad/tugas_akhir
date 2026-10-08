<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;

/**
 * Salin seluruh data dari MySQL (koneksi default) ke PostgreSQL (koneksi 'pgsql').
 *
 * Aman: MySQL hanya dibaca; PostgreSQL dipakai per-tabel dalam transaksi dengan
 * rollback otomatis bila gagal; setiap tabel diverifikasi jumlah barisnya.
 * Migrasi skema dijalankan lebih dulu via `php artisan migrate --database=pgsql`.
 */
class SyncMysqlToPgsql extends Command
{
    protected $signature = 'db:sync-mysql-to-pgsql {--dry-run : hanya lapor, tanpa menulis ke PostgreSQL}';

    protected $description = 'Salin seluruh data dari MySQL ke PostgreSQL dengan verifikasi';

    /**
     * Urutan tabel mempertimbangkan foreign key (parent dulu, child belakangan).
     */
    private const TABLES = [
        'users',
        'password_reset_tokens',
        'sessions',
        'personal_access_tokens',
        'dim_program_studi',
        'dim_waktu',
        'dim_status_kerja',
        'dim_keselarasan',
        'dim_alumni',
        'fact_tracer_alumni',
        'staging_alumni',
        'career_analyses',
        'career_chat_messages',
        'lowongans',
        'search_logs',
        'alumni_profiles',
    ];

    public function handle(): int
    {
        $mysql = DB::connection('mysql')->getPdo();
        $pg = DB::connection('pgsql')->getPdo();
        $dry = (bool) $this->option('dry-run');

        $this->info('Sumber (MySQL): '.$mysql->query('SELECT DATABASE()')->fetchColumn());
        $this->info('Tujuan (PostgreSQL): '.$pg->query('SELECT current_database()')->fetchColumn());
        $this->info($dry ? 'Mode DRY-RUN: tidak ada tulisan ke PostgreSQL.' : '');

        // Kosongkan tabel tujuan sekali jalan supaya hasil copy deterministik
        // (TRUNCATE RESTART IDENTITY CASCADE juga mereset sequence).
        if (! $dry) {
            $this->truncateTarget($pg);
        }

        $ok = 0;
        $gagal = 0;

        foreach (self::TABLES as $tabel) {
            if ($this->tableExists($mysql, $tabel) === false) {
                $this->warn(sprintf('  [skip] %-30s tabel tidak ada di MySQL', $tabel));
                continue;
            }

            try {
                [$jumlah, $verif] = $this->syncTable($mysql, $pg, $tabel, $dry);
                if ($jumlah === $verif) {
                    $this->info(sprintf('  [ok ] %-30s %d baris (terverifikasi)', $tabel, $jumlah));
                    $ok++;
                } else {
                    $this->error(sprintf('  [!! ] %-30s sumber %d vs tujuan %d — TIDAK COCOK', $tabel, $jumlah, $verif));
                    $gagal++;
                }
            } catch (\Throwable $e) {
                $this->error(sprintf('  [xx ] %-30s gagal: %s', $tabel, $e->getMessage()));
                $gagal++;
            }
        }

        $this->newLine();
        if ($gagal === 0) {
            $this->info(sprintf('Selesai: %d tabel tersinkron dengan sukses%s.', $ok, $dry ? ' (dry-run)' : ''));
            return self::SUCCESS;
        }

        $this->error(sprintf('Selesai dengan %d tabel bermasalah dari %d.', $gagal, $ok + $gagal));
        return self::FAILURE;
    }

    private function truncateTarget(\PDO $pg): void
    {
        $ada = array_filter(self::TABLES, fn ($t) => $this->tableExists($pg, $t));
        if (! $ada) {
            return;
        }
        $quoted = array_map(fn ($t) => '"'.str_replace('"', '""', $t).'"', $ada);
        $pg->exec('TRUNCATE '.implode(', ', $quoted).' RESTART IDENTITY CASCADE');
        $this->line('Tabel tujuan dikosongkan (TRUNCATE CASCADE).');
    }

    private function syncTable(\PDO $mysql, \PDO $pg, string $tabel, bool $dry): array
    {
        $query = $mysql->query('SELECT * FROM `'.str_replace('`', '', $tabel).'`');
        $rows = $query->fetchAll(\PDO::FETCH_ASSOC);
        $jumlah = count($rows);

        if ($dry) {
            return [$jumlah, $jumlah];
        }

        if ($jumlah > 0) {
            // Satu transaksi per tabel: bila gagal, tidak ada baris parsial.
            $pg->beginTransaction();
            try {
                $stmt = null;
                $chunk = [];
                foreach ($rows as $i => $row) {
                    $chunk[] = $this->normalize($row);
                    if (count($chunk) >= 500) {
                        $this->insertChunk($pg, $tabel, $chunk, $stmt);
                        $chunk = [];
                    }
                }
                if ($chunk !== []) {
                    $this->insertChunk($pg, $tabel, $chunk, $stmt);
                }
                $pg->commit();
            } catch (\Throwable $e) {
                $pg->rollBack();
                throw $e;
            }
        }

        $this->resetSequence($pg, $tabel);

        $verif = (int) $pg->query('SELECT COUNT(*) FROM "'.str_replace('"', '', $tabel).'"')->fetchColumn();

        return [$jumlah, $verif];
    }

    /**
     * INSERT multi-row. Statement dibuat ulang setiap 100 baris agar panjang
     * query wajar (PostgreSQL batas parameter 65535).
     */
    private function insertChunk(\PDO $pg, string $tabel, array $rows, ?\PDOStatement &$stmt): void
    {
        foreach (array_chunk($rows, 100) as $batch) {
            $cols = array_keys($batch[0]);
            $quoted = array_map(fn ($c) => '"'.str_replace('"', '""', $c).'"', $cols);
            $placeholders = rtrim(str_repeat('('.rtrim(str_repeat('?,', count($cols)), ',').'),', count($batch)), ',');
            $sql = 'INSERT INTO "'.str_replace('"', '', $tabel).'" ('.implode(', ', $quoted).') VALUES '.$placeholders;
            $stmt = $pg->prepare($sql);
            $i = 1;
            foreach ($batch as $row) {
                foreach ($cols as $c) {
                    $stmt->bindValue($i++, $row[$c], $this->pdoType($row[$c]));
                }
            }
            $stmt->execute();
        }
    }

    /**
     * Normalisasi tipe silang-dialek:
     *  - tinyint(1) MySQL -> boolean PostgreSQL (string '0'/'1' tidak selalu
     *    diterima oleh driver PDO_PGSQL sebagai bool, jadi bind eksplisit).
     *  - kolom kosong tetap NULL bila memang NULL di sumber.
     */
    private function normalize(array $row): array
    {
        $out = [];
        foreach ($row as $k => $v) {
            $out[$k] = $v;
        }

        return $out;
    }

    private function pdoType(mixed $value): int
    {
        if ($value === null) {
            return \PDO::PARAM_NULL;
        }
        if (is_int($value)) {
            return \PDO::PARAM_INT;
        }

        return \PDO::PARAM_STR;
    }

    private function resetSequence(\PDO $pg, string $tabel): void
    {
        // Cari kolom serial/identity (mis. id, atau *_key pada tabel dimensi).
        $stmt = $pg->prepare(
            "SELECT column_name
               FROM information_schema.columns
              WHERE table_schema = 'public' AND table_name = ?
                AND (is_identity = 'YES' OR column_default LIKE 'nextval(%')"
        );
        $stmt->execute([$tabel]);
        $kolom = $stmt->fetchColumn();
        if (! $kolom) {
            return;
        }

        $pg->prepare(
            "SELECT setval(pg_get_serial_sequence(?, ?), GREATEST(COALESCE((SELECT MAX(\"$kolom\") FROM \"$tabel\"), 1), 1))"
        )->execute([$tabel, $kolom]);
    }

    private function tableExists(\PDO $pdo, string $tabel): bool
    {
        if (str_starts_with($pdo->getAttribute(\PDO::ATTR_DRIVER_NAME), 'pgsql')) {
            $stmt = $pdo->prepare(
                "SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name = ?"
            );
        } else {
            $stmt = $pdo->prepare(
                "SELECT 1 FROM information_schema.tables WHERE table_schema = DATABASE() AND table_name = ?"
            );
        }
        $stmt->execute([$tabel]);

        return (bool) $stmt->fetchColumn();
    }
}
