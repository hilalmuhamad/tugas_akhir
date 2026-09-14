-- ============================================================================
-- dump-keadaan-db.sql
--
-- Tujuan: menuliskan keadaan NYATA basis data PostgreSQL ke berkas CSV di
-- folder docs/, supaya isinya bisa dibaca langsung tanpa perlu ditempel
-- ke chat sepotong-sepotong.
--
-- Cara menjalankan (satu baris, dari Command Prompt / PowerShell):
--
--   psql -U postgres -d tugasakhir -f C:/laragon/www/tugasakhir/docs/dump-keadaan-db.sql
--
-- Atau bila sudah berada di dalam psql:
--
--   \i C:/laragon/www/tugasakhir/docs/dump-keadaan-db.sql
--
-- Ganti "postgres" dan "tugasakhir" bila nama pengguna / basis datanya berbeda
-- (lihat DB_USERNAME dan DB_DATABASE di backend/.env).
--
-- Catatan:
-- * Perintah \copy dijalankan di sisi klien, jadi tidak perlu hak superuser
--   dan berkasnya ditulis di komputer tempat psql dijalankan.
-- * ON_ERROR_STOP sengaja dimatikan: bila ada tabel yang tidak ada, baris itu
--   dilewati dan sisanya tetap jalan. Galat "relation does not exist" pada
--   sebagian tabel itu WAJAR dan tidak perlu dikhawatirkan.
-- * Semua SELECT memakai * supaya tidak mungkin gagal karena nama kolom yang
--   tidak terduga.
-- * Tabel yang memuat data pribadi (users, alumni_profiles) TIDAK diambil
--   isinya, hanya daftar kolomnya.
-- * Berkas dbdump-*.csv ini bersifat sementara. Boleh dihapus setelah dipakai,
--   dan sebaiknya jangan ikut di-commit ke git.
-- ============================================================================

\set ON_ERROR_STOP off
\pset pager off
\timing off

\echo ''
\echo '=== 1/4  Struktur: daftar tabel, kolom, view, indeks ==='

\copy (SELECT table_name, table_type FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_type, table_name) TO 'C:/laragon/www/tugasakhir/docs/dbdump-tabel.csv' WITH (FORMAT csv, HEADER true)

\copy (SELECT table_name, ordinal_position, column_name, data_type, character_maximum_length, numeric_precision, numeric_scale, is_nullable, column_default FROM information_schema.columns WHERE table_schema = 'public' ORDER BY table_name, ordinal_position) TO 'C:/laragon/www/tugasakhir/docs/dbdump-kolom.csv' WITH (FORMAT csv, HEADER true)

\copy (SELECT viewname, definition FROM pg_views WHERE schemaname = 'public' ORDER BY viewname) TO 'C:/laragon/www/tugasakhir/docs/dbdump-view.csv' WITH (FORMAT csv, HEADER true)

\copy (SELECT tablename, indexname, indexdef FROM pg_indexes WHERE schemaname = 'public' ORDER BY tablename, indexname) TO 'C:/laragon/www/tugasakhir/docs/dbdump-indeks.csv' WITH (FORMAT csv, HEADER true)

\copy (SELECT conrelid::regclass::text AS tabel, conname, pg_get_constraintdef(oid) AS definisi FROM pg_constraint WHERE connamespace = 'public'::regnamespace ORDER BY conrelid::regclass::text, conname) TO 'C:/laragon/www/tugasakhir/docs/dbdump-constraint.csv' WITH (FORMAT csv, HEADER true)

\copy (SELECT relname AS tabel, n_live_tup AS perkiraan_baris FROM pg_stat_user_tables ORDER BY relname) TO 'C:/laragon/www/tugasakhir/docs/dbdump-jumlah-baris.csv' WITH (FORMAT csv, HEADER true)

\echo ''
\echo '=== 2/4  Riwayat migrasi Laravel ==='

\copy (SELECT * FROM migrations ORDER BY id) TO 'C:/laragon/www/tugasakhir/docs/dbdump-migrations.csv' WITH (FORMAT csv, HEADER true)

\echo ''
\echo '=== 3/4  Isi tabel dimensi ==='

\copy (SELECT * FROM dim_program_studi) TO 'C:/laragon/www/tugasakhir/docs/dbdump-dim-program-studi.csv' WITH (FORMAT csv, HEADER true)

\copy (SELECT * FROM dim_status_kerja) TO 'C:/laragon/www/tugasakhir/docs/dbdump-dim-status-kerja.csv' WITH (FORMAT csv, HEADER true)

\copy (SELECT * FROM dim_keselarasan) TO 'C:/laragon/www/tugasakhir/docs/dbdump-dim-keselarasan.csv' WITH (FORMAT csv, HEADER true)

\copy (SELECT * FROM dim_waktu) TO 'C:/laragon/www/tugasakhir/docs/dbdump-dim-waktu.csv' WITH (FORMAT csv, HEADER true)

\copy (SELECT * FROM dim_tahun_survei) TO 'C:/laragon/www/tugasakhir/docs/dbdump-dim-tahun-survei.csv' WITH (FORMAT csv, HEADER true)

\copy (SELECT * FROM dim_alumni) TO 'C:/laragon/www/tugasakhir/docs/dbdump-dim-alumni.csv' WITH (FORMAT csv, HEADER true)

\copy (SELECT * FROM etl_aturan_keselarasan) TO 'C:/laragon/www/tugasakhir/docs/dbdump-etl-aturan-keselarasan.csv' WITH (FORMAT csv, HEADER true)

\echo ''
\echo '=== 4/4  Isi tabel fakta dan staging ==='

\copy (SELECT * FROM fact_tracer_alumni) TO 'C:/laragon/www/tugasakhir/docs/dbdump-fact-tracer-alumni.csv' WITH (FORMAT csv, HEADER true)

\copy (SELECT * FROM staging_alumni) TO 'C:/laragon/www/tugasakhir/docs/dbdump-staging-alumni.csv' WITH (FORMAT csv, HEADER true)

\echo ''
\echo '=== Rekap cepat (tampil di layar saja) ==='

SELECT dw.tahun_lulus, COUNT(*) AS jumlah
FROM fact_tracer_alumni f
JOIN dim_waktu dw ON dw.waktu_key = f.waktu_key
GROUP BY dw.tahun_lulus
ORDER BY dw.tahun_lulus;

SELECT dsk.status_bekerja, COUNT(*) AS jumlah
FROM fact_tracer_alumni f
JOIN dim_status_kerja dsk ON dsk.status_key = f.status_key
GROUP BY dsk.status_bekerja
ORDER BY jumlah DESC;

\echo ''
\echo '=== SELESAI. Berkas dbdump-*.csv sudah ada di folder docs/ ==='
\echo ''
