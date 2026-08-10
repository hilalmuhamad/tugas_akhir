# MySQL sebagai Data Warehouse — Landasan Teori, Arsitektur, dan Konfigurasi

Dokumen ini menjawab revisi dosen pembimbing: membuktikan bahwa MySQL dapat
digunakan sebagai data warehouse, menjelaskan dasar konseptualnya, dan
merinci pengaturan khusus MySQL untuk beban kerja analitik.

Status verifikasi:

- Angka batas MySQL, `WITH ROLLUP`/`GROUPING()`, dan partisi **sudah diverifikasi**
  langsung dari MySQL 8.0 Reference Manual (tautan dicantumkan).
- Metadata pustaka (DOI, judul, jurnal, tahun) **sudah diverifikasi** lewat Crossref API.
  Teks lengkapnya belum dibaca — nama penulis wajib dicocokkan ke artikel aslinya.
- Definisi Inmon dan Kimball ditulis dari pengetahuan umum, **belum** diverifikasi ke
  buku aslinya pada sesi ini. Cocokkan ke edisi cetak sebelum dikutip.

---

## 1. Arsitektur yang diusulkan

### 1.1 Arsitektur konseptual (untuk Bab 2 / Bab 3)

```
┌─────────────────────────────────────────────────────────────────────────┐
│  LAPIS 1 — SUMBER DATA (Data Source)                                    │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│   ┌──────────────────────┐        ┌──────────────────────┐              │
│   │  Basis Data OLTP     │        │  Berkas Eksternal    │              │
│   │  MySQL: smartcareer  │        │  alumnidummy.csv     │              │
│   │  ──────────────────  │        │  (dataset publik)    │              │
│   │  users               │        └──────────┬───────────┘              │
│   │  alumni_profiles     │                   │                          │
│   │  lowongans           │                   │                          │
│   │  career_analyses     │                   │                          │
│   │  ternormalisasi 3NF  │                   │                          │
│   │  transaksi harian    │                   │                          │
│   └──────────┬───────────┘                   │                          │
└──────────────┼───────────────────────────────┼──────────────────────────┘
               │                               │
               │      E K S T R A K S I        │
               ▼                               ▼
┌─────────────────────────────────────────────────────────────────────────┐
│  LAPIS 2 — ETL / STAGING AREA                                           │
├─────────────────────────────────────────────────────────────────────────┤
│   ┌───────────────────────────────────────────────────────────────┐     │
│   │  EtlService.php                                               │     │
│   │  ───────────────────────────────────────────────────────────  │     │
│   │  Extract   : baca CSV + baca alumni_profiles                  │     │
│   │  Transform : normalisasi label, hitung masa tunggu,           │     │
│   │              tangani nilai kosong, beri offset kunci          │     │
│   │              (PROFIL_ID_OFFSET = 1.000.000)                   │     │
│   │  Load      : tulis ke staging_alumni                          │     │
│   └────────────────────────────┬──────────────────────────────────┘     │
│                                ▼                                        │
│                    ┌───────────────────────┐                            │
│                    │   staging_alumni      │  ← area singgah, boleh     │
│                    │   (tabel datar/flat)  │    di-truncate & diisi     │
│                    └───────────┬───────────┘    ulang, tanpa FK         │
└────────────────────────────────┼────────────────────────────────────────┘
                                 │
                                 │   rebuildStarSchema()
                                 ▼
┌─────────────────────────────────────────────────────────────────────────┐
│  LAPIS 3 — DATA WAREHOUSE (MySQL, skema terpisah: smartcareer_dw)       │
│  Terdenormalisasi · Non-volatile · Time-variant · Subject-oriented       │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│      ┌──────────────┐   ┌──────────────────┐   ┌──────────────┐         │
│      │ dim_alumni   │   │ dim_program_studi│   │  dim_waktu   │         │
│      │ alumni_key   │   │ prodi_key        │   │ waktu_key    │         │
│      │ id_sumber    │   │ program_studi    │   │ tahun_lulus  │         │
│      │ nama, gender │   │ specialisasi     │   │ dekade       │         │
│      │ jenjang      │   └────────┬─────────┘   └──────┬───────┘         │
│      │ tahun_masuk  │            │                    │                 │
│      └──────┬───────┘            │                    │                 │
│             │                    ▼                    │                 │
│             │      ┌───────────────────────────┐      │                 │
│             └─────►│   fact_tracer_alumni      │◄─────┘                 │
│                    │  ───────────────────────  │                        │
│                    │  fact_key      (PK)       │                        │
│                    │  alumni_key    (FK)       │                        │
│                    │  prodi_key     (FK)       │      ┌───────────────┐ │
│                    │  waktu_key     (FK)       │◄─────┤dim_status_    │ │
│                    │  status_key    (FK)       │      │kerja          │ │
│                    │  pengalaman_kerja  ─ deg. │      │status_key     │ │
│                    │  ───── MEASURES ────────  │      │status_bekerja │ │
│                    │  ipk                      │      │kategori_      │ │
│                    │  masa_tunggu_bulan        │      │penghasilan    │ │
│                    │  gaji_juta                │      └───────────────┘ │
│                    └────────────┬──────────────┘                        │
│                                 │                                       │
│           (usulan tambahan) ┌───┴────────────┐                          │
│                             │  dim_lokasi    │  provinsi, kab/kota      │
│                             └────────────────┘                          │
└─────────────────────────────────┬───────────────────────────────────────┘
                                  │
                                  ▼
┌─────────────────────────────────────────────────────────────────────────┐
│  LAPIS 4 — OLAP ENGINE (SQL agregasi di MySQL)                          │
├─────────────────────────────────────────────────────────────────────────┤
│  Roll-up      : GROUP BY dim_waktu.tahun_lulus WITH ROLLUP              │
│  Drill-down   : GROUP BY program_studi, status_bekerja                  │
│  Slice        : WHERE dim_waktu.tahun_lulus = 2024                      │
│  Dice         : WHERE tahun IN (...) AND prodi IN (...)                 │
│  Pivot        : SUM(CASE WHEN ... THEN 1 ELSE 0 END)                    │
└─────────────────────────────────┬───────────────────────────────────────┘
                                  │  REST API (Laravel)
                                  ▼
┌─────────────────────────────────────────────────────────────────────────┐
│  LAPIS 5 — PENYAJIAN                                                    │
│  Dashboard React + Recharts  ·  Laporan IKU (CSV)                       │
└─────────────────────────────────────────────────────────────────────────┘
```

### 1.2 Pemisahan fisik OLTP dan OLAP

Kondisi sekarang: OLTP dan warehouse berada dalam **satu basis data MySQL yang
sama**. Ini yang membuat argumen "MySQL sebagai data warehouse" terlihat lemah,
karena tidak ada pemisahan yang bisa ditunjukkan.

Usulan minimal (murah, tidak mengubah kode aplikasi):

```
Satu server MySQL, dua schema (database) terpisah:

  smartcareer_oltp                 smartcareer_dw
  ├─ users                         ├─ staging_alumni
  ├─ alumni_profiles               ├─ dim_alumni
  ├─ lowongans                     ├─ dim_program_studi
  ├─ career_analyses               ├─ dim_waktu
  ├─ career_chat_messages          ├─ dim_status_kerja
  └─ search_logs                   ├─ dim_lokasi     (usulan)
                                   └─ fact_tracer_alumni
       ▲                                  ▲
       │ koneksi 'mysql'                  │ koneksi 'warehouse'
       │ (read-write)                     │ (read-only utk dashboard)
       └──────── Laravel ─────────────────┘
```

Di Laravel, tambahkan koneksi kedua pada `backend/config/database.php`:

```php
'warehouse' => [
    'driver'    => 'mysql',
    'host'      => env('DW_HOST', '127.0.0.1'),
    'port'      => env('DW_PORT', '3306'),
    'database'  => env('DW_DATABASE', 'smartcareer_dw'),
    'username'  => env('DW_USERNAME', 'dw_reader'),
    'password'  => env('DW_PASSWORD', ''),
    'charset'   => 'utf8mb4',
    'collation' => 'utf8mb4_unicode_ci',
    'strict'    => true,
],
```

Lalu setiap kueri dashboard memakai `DB::connection('warehouse')`. Dengan ini
pernyataan "beban analitik tidak mengganggu transaksi online" bukan lagi klaim,
melainkan sesuatu yang bisa ditunjukkan di depan penguji.

Jika ingin lebih jauh, jalankan **dua instans MySQL** pada port berbeda
(3306 untuk OLTP, 3307 untuk DW) dengan berkas `my.cnf` yang berbeda. Ini yang
membuat pengaturan pada bagian 4 benar-benar terasa berbeda antara keduanya.

---

## 2. Landasan teori: mengapa data warehouse dipisah dari OLTP

### 2.1 Definisi Inmon

W. H. Inmon mendefinisikan data warehouse sebagai kumpulan data yang memiliki
empat sifat. Empat sifat inilah jawaban paling langsung atas contoh ATM yang
dosen sampaikan:

| Sifat | Arti | Padanan pada sistem ini |
|---|---|---|
| **Subject-oriented** | Diorganisasi menurut subjek analisis, bukan menurut proses transaksi | Subjeknya "kelulusan dan karier alumni", bukan "pendaftaran akun" |
| **Integrated** | Data dari berbagai sumber diseragamkan format dan kodenya | CSV dan `alumni_profiles` disatukan lewat `staging_alumni` |
| **Time-variant** | Menyimpan rekaman historis, bukan hanya keadaan terkini | `dim_waktu` menyimpan tahun lulus tiap kohort |
| **Non-volatile** | Data dimuat lalu dibaca; tidak di-`UPDATE`/`DELETE` per transaksi | Fakta dimuat lewat ETL, bukan diubah pengguna |

Sifat **non-volatile** dan **time-variant** persis menggambarkan contoh yang
dosen berikan: transaksi ATM tidak selamanya disimpan di basis data online.
Setelah beberapa bulan, transaksi lama "dicabut" dari sistem online dan
dipindahkan ke warehouse. Yang online tetap ringan karena hanya memegang data
aktif; yang analitik mengambil dari warehouse yang isinya tidak berubah lagi.

### 2.2 Perbedaan OLTP dan OLAP

| Aspek | OLTP | OLAP / Data Warehouse |
|---|---|---|
| Tujuan | Menjalankan operasi harian | Mendukung pengambilan keputusan |
| Operasi dominan | `INSERT`, `UPDATE`, `DELETE` | `SELECT` dengan agregasi |
| Satuan akses | Beberapa baris per transaksi | Ribuan sampai jutaan baris per kueri |
| Rancangan | Ternormalisasi (3NF), minim redundansi | Terdenormalisasi, redundansi diterima |
| Jumlah `JOIN` per kueri | Banyak, tapi baris sedikit | Sedikit (bintang), tapi baris banyak |
| Cakupan waktu | Data terkini | Data historis bertahun-tahun |
| Pengguna | Banyak, bersamaan | Sedikit, analis/manajemen |
| Ukuran keberhasilan | Throughput transaksi | Waktu respons kueri agregat |

Karena dua beban kerja ini menuntut hal yang berlawanan, memaksakan keduanya
pada satu rancangan tabel selalu merugikan salah satu. Itulah alasan pemisahan,
dan itulah pembenaran akademis untuk membangun warehouse tersendiri.

### 2.3 Denormalisasi — apa yang sebenarnya terjadi

Ini bagian yang paling perlu dijelaskan dengan hati-hati, karena mudah
disalahpahami.

Data warehouse **tetap relasional**. Yang hilang bukan relasinya, melainkan
**normalisasinya**. Skema bintang masih punya kunci asing dari tabel fakta ke
tabel dimensi, dan penggabungannya tetap memakai `JOIN`. Yang membedakan dari
OLTP adalah:

1. Tabel dimensi sengaja dibuat **tidak ternormalisasi**. Pada OLTP,
   `program_studi` dan `specialisasi` akan dipecah menjadi dua tabel dengan
   relasi induk–anak. Pada `dim_program_studi`, keduanya digabung dalam satu
   tabel meskipun menimbulkan pengulangan nilai. Redundansi ini disengaja untuk
   memangkas jumlah `JOIN`.
2. Kedalaman `JOIN` menjadi **satu tingkat**. Fakta langsung menempel ke setiap
   dimensi, tidak ada rantai dimensi bertingkat. Inilah beda bintang (*star*)
   dengan kepingan salju (*snowflake*).
3. Redundansi dan anomali pembaruan **tidak lagi menjadi masalah**, karena data
   warehouse tidak menerima pembaruan per transaksi.

Ada tiga tingkat denormalisasi yang bisa dipilih, dan ketiganya sah:

```
Tingkat 1 — SNOWFLAKE          Tingkat 2 — STAR              Tingkat 3 — OBT
(dimensi ternormalisasi)       (dimensi datar)               (One Big Table)

   fakta                          fakta                        satu tabel lebar
     │                              │                          ┌──────────────┐
     ├─ dim_prodi                   ├─ dim_prodi (prodi +      │ nama         │
     │    └─ dim_fakultas           │    spesialisasi jadi     │ gender       │
     │         └─ dim_univ          │    satu tabel)           │ program_studi│
     ├─ dim_waktu                   ├─ dim_waktu               │ specialisasi │
     └─ dim_status                  └─ dim_status              │ tahun_lulus  │
                                                                │ status       │
   JOIN dalam, hemat ruang       JOIN dangkal, seimbang        │ ipk, gaji…   │
                                                                └──────────────┘
                                                                tanpa JOIN sama
                                                                sekali
```

Yang dosen maksud dengan "tabelnya sudah seribu kolom, tidak relasi lagi" adalah
tingkat 3, yaitu pola **One Big Table** — semua atribut ditumpuk dalam satu
tabel lebar tanpa `JOIN`. Pola ini nyata dan banyak dipakai, terutama pada mesin
penyimpanan kolom. Namun **pilihan Anda saat ini adalah tingkat 2 (star schema)**,
dan itu justru rancangan yang paling lazim dipakai pada penelitian data warehouse
dengan MySQL, sebagaimana tampak pada daftar pustaka di bagian 6.

Yang penting untuk sidang: Anda harus bisa menyebut ketiganya, menjelaskan
mengapa memilih tingkat 2, dan menunjukkan bahwa Anda memahami tingkat 3 sebagai
alternatif. Alasan memilih star schema untuk kasus ini:

- Volume data kecil (ribuan baris), sehingga biaya `JOIN` tidak signifikan.
- Dimensi masih dapat dibaca manusia, memudahkan verifikasi saat sidang.
- Kolom `NULL` jauh lebih sedikit dibanding OBT, karena atribut yang hanya
  berlaku untuk sebagian responden tidak memaksa kolom kosong di seluruh baris.
- Sesuai metodologi Kimball yang dirujuk pada Bab 2.

### 2.4 Kapan tabel lebar memang lebih baik

Untuk kelengkapan pembahasan, sebutkan bahwa OBT unggul ketika:

- Mesin penyimpanannya kolom (columnar), sehingga kolom yang tidak dipakai tidak
  ikut dibaca dari disk.
- Beban kerjanya membaca sedikit kolom dari sangat banyak baris.
- Sumber datanya memang sudah datar, misalnya log peristiwa.

MySQL InnoDB adalah penyimpanan **baris** (row-store). Pada row-store, membaca
satu kolom tetap menarik seluruh baris ke memori. Karena itu tabel dengan ratusan
kolom pada InnoDB justru **memperberat** kueri agregat yang hanya butuh tiga
kolom. Ini argumen teknis yang kuat untuk mempertahankan star schema, dan
sekaligus bukti bahwa Anda memahami karakteristik mesin penyimpanannya.

---

## 3. Bukti bahwa MySQL sanggup menampung struktur data warehouse

Semua angka berikut dikutip dari MySQL 8.0 Reference Manual dan sudah
diverifikasi langsung dari halaman resminya.

### 3.1 Batas jumlah kolom dan ukuran baris

Sumber: <https://dev.mysql.com/doc/refman/8.0/en/column-count-limit.html>

| Batas | Nilai |
|---|---|
| Batas keras MySQL | **4096 kolom per tabel** |
| Batas mesin penyimpanan InnoDB | **1017 kolom per tabel** |
| Ukuran baris maksimum (representasi internal MySQL) | **65.535 byte** |
| Ukuran baris maksimum InnoDB (halaman 16 KB) | sedikit di bawah 8 KB (pesan galat menyebut **8126 byte**) |
| Sumbangan kolom `BLOB`/`TEXT` ke batas ukuran baris | hanya 9–12 byte |

Kutipan langsung dari manual:

> "MySQL has hard limit of 4096 columns per table, but the effective maximum may
> be less for a given table."

> "Storage engines may impose additional restrictions that limit table column
> count. For example, `InnoDB` has a limit of 1017 columns per table."

**Ini jawaban langsung atas pertanyaan dosen.** Ketika beliau berkata "misalnya
tabelnya sudah seribu kolom", angka itu tepat berada di batas InnoDB: 1017 kolom.
Jadi MySQL secara teknis memang sanggup menampung tabel selebar itu, dengan
catatan total ukuran barisnya tetap harus di bawah 65.535 byte — sehingga kolom
teks panjang harus memakai tipe `TEXT` agar hanya menyumbang 9–12 byte.

Untuk sidang, sampaikan dua hal sekaligus: MySQL **mampu**, tetapi untuk kasus
ini star schema **lebih tepat** karena alasan row-store di bagian 2.4.

### 3.2 MySQL menyediakan operator OLAP secara bawaan

Sumber: <https://dev.mysql.com/doc/refman/8.0/en/group-by-modifiers.html>

MySQL menyediakan pengubah `WITH ROLLUP` pada `GROUP BY`, yang menghasilkan
baris ringkasan tingkat lebih tinggi (*super-aggregate*). Manual MySQL sendiri
menyatakan fitur ini memberi dukungan bagi operasi OLAP, dan menyebut fungsinya
sebagai cara menjawab pertanyaan pada beberapa tingkat analisis dalam satu kueri.

Contoh yang bisa langsung dipakai pada sistem Anda:

```sql
-- Roll-up: rincian per prodi per tahun, lalu subtotal per tahun,
-- lalu total keseluruhan — dalam satu kueri.
SELECT
    IF(GROUPING(dw.tahun_lulus), 'Semua tahun', dw.tahun_lulus)  AS tahun,
    IF(GROUPING(dp.program_studi), 'Semua prodi', dp.program_studi) AS prodi,
    COUNT(*)                                                     AS jumlah,
    ROUND(AVG(f.masa_tunggu_bulan), 1)                           AS rata_masa_tunggu,
    ROUND(AVG(f.gaji_juta), 2)                                   AS rata_gaji
FROM fact_tracer_alumni f
JOIN dim_waktu         dw ON f.waktu_key = dw.waktu_key
JOIN dim_program_studi dp ON f.prodi_key = dp.prodi_key
GROUP BY dw.tahun_lulus, dp.program_studi WITH ROLLUP;
```

Fungsi `GROUPING()` membedakan `NULL` hasil super-agregat dari `NULL` yang
memang nilai data; ia mengembalikan 1 pada baris super-agregat dan 0 pada baris
biasa.

Ini bukti kuat untuk sidang: **operasi roll-up bukan sesuatu yang Anda tiru
manual di PHP, melainkan fitur OLAP yang memang disediakan MySQL.** Sekarang
`AlumniController::olapStats()` masih menjalankan beberapa kueri `GROUP BY`
terpisah untuk setiap tingkat; menggantinya dengan satu kueri `WITH ROLLUP`
akan memperkuat argumen bahwa yang dipakai benar-benar mekanisme OLAP.

### 3.3 Partisi tabel — inilah "pencabutan data dari sistem online"

Sumber: <https://dev.mysql.com/doc/refman/8.0/en/partitioning-overview.html>

MySQL 8.0 mendukung partisi horizontal dengan tipe: **RANGE, LIST, COLUMNS
(RANGE COLUMNS dan LIST COLUMNS), HASH (dan LINEAR HASH), serta KEY (dan LINEAR
KEY)**, ditambah subpartisi. Mesin penyimpanan yang mendukungnya hanya **InnoDB
dan NDB**.

Dua manfaat yang relevan langsung dengan pertanyaan dosen:

1. **Partition pruning.** Bila kondisi `WHERE` hanya mungkin dipenuhi oleh
   sebagian partisi, MySQL mengeluarkan partisi lainnya dari pencarian. Untuk
   warehouse yang selalu difilter per tahun, ini pemangkasan besar.
2. **Pembuangan data lama secara murah.** Data usang dibuang dengan menghapus
   partisinya, bukan dengan `DELETE` baris demi baris. Inilah padanan teknis dari
   "transaksi ATM dicabut dari sistem online lalu disimpan": pada OLTP, partisi
   tahun lama di-`DROP` setelah disalin ke warehouse.

Contoh untuk tabel fakta Anda:

```sql
ALTER TABLE fact_tracer_alumni
PARTITION BY RANGE (tahun_lulus) (
    PARTITION p2020 VALUES LESS THAN (2021),
    PARTITION p2021 VALUES LESS THAN (2022),
    PARTITION p2022 VALUES LESS THAN (2023),
    PARTITION p2023 VALUES LESS THAN (2024),
    PARTITION p2024 VALUES LESS THAN (2025),
    PARTITION p2025 VALUES LESS THAN (2026),
    PARTITION pmax  VALUES LESS THAN MAXVALUE
);
```

**Syarat yang wajib diperhatikan:** setiap kolom pada ekspresi partisi harus
menjadi bagian dari **semua kunci unik, termasuk kunci primer**. Jadi
`fact_tracer_alumni` perlu kunci primer gabungan `(fact_key, tahun_lulus)`, dan
`tahun_lulus` perlu didenormalisasi masuk ke tabel fakta — yang justru sejalan
dengan prinsip data warehouse. Perlu diakui juga bahwa untuk volume data
sebesar milik Anda sekarang, partisi belum memberi manfaat terukur; nilainya ada
pada penjelasan rancangan yang siap tumbuh, dan itu harus dinyatakan apa adanya.

---

## 4. Pengaturan khusus MySQL untuk beban kerja data warehouse

Ini menjawab pertanyaan "apakah ada setting khusus untuk penerapan MySQL sebagai
data warehouse". Jawabannya: ada, dan bisa dikelompokkan menjadi lima.

### 4.1 Konfigurasi server (`my.cnf` / `my.ini`)

```ini
[mysqld]
# ---------- Memori ----------
# Buffer pool adalah penentu utama. Untuk warehouse, isi sebesar mungkin
# agar seluruh tabel fakta + dimensi muat di memori.
innodb_buffer_pool_size        = 4G      # 50-75% RAM pada server khusus DW
innodb_buffer_pool_instances   = 4

# ---------- Kueri agregat ----------
# Kueri OLAP membentuk tabel sementara besar untuk GROUP BY / ORDER BY.
tmp_table_size                 = 256M
max_heap_table_size            = 256M
sort_buffer_size               = 8M      # per sesi, jangan berlebihan
join_buffer_size               = 8M
read_rnd_buffer_size           = 4M

# ---------- Ketahanan vs kecepatan muat ----------
# Warehouse dimuat ulang lewat ETL; kehilangan detik terakhir tidak fatal,
# berbeda dengan OLTP yang wajib 1 (ACID penuh).
innodb_flush_log_at_trx_commit = 2
innodb_log_file_size           = 1G      # tulis besar saat ETL
innodb_io_capacity             = 2000    # naikkan bila memakai SSD/NVMe

# ---------- Statistik optimizer ----------
innodb_stats_persistent        = ON
innodb_stats_persistent_sample_pages = 64
```

Pembeda pentingnya: **`innodb_flush_log_at_trx_commit`**. Pada OLTP nilainya
wajib `1` demi jaminan daya tahan transaksi. Pada warehouse, nilai `2`
diperbolehkan karena data selalu dapat dibangun ulang dari sumber melalui ETL.
Perbedaan satu parameter ini sudah cukup untuk menunjukkan bahwa dua basis data
tersebut memang dikonfigurasi untuk tujuan yang berbeda.

### 4.2 Rancangan tabel

```sql
-- Tabel fakta: kunci ramping, kolom integer sekecil mungkin,
-- indeks gabungan mengikuti pola kueri dashboard.
CREATE TABLE fact_tracer_alumni (
    fact_key          BIGINT UNSIGNED   NOT NULL AUTO_INCREMENT,
    alumni_key        INT UNSIGNED      NOT NULL,
    prodi_key         SMALLINT UNSIGNED NOT NULL,
    waktu_key         SMALLINT UNSIGNED NOT NULL,
    status_key        TINYINT UNSIGNED  NOT NULL,
    pengalaman_kerja  ENUM('Ya','Tidak'),          -- degenerate dimension
    ipk               DECIMAL(3,2),
    masa_tunggu_bulan SMALLINT UNSIGNED,
    gaji_juta         DECIMAL(6,2),
    PRIMARY KEY (fact_key),
    KEY ix_waktu_prodi  (waktu_key, prodi_key),
    KEY ix_prodi_status (prodi_key, status_key),
    KEY ix_status       (status_key)
) ENGINE=InnoDB ROW_FORMAT=COMPRESSED;
```

Kaidah yang berlaku:

- **Surrogate key integer**, bukan kunci alami bertipe teks. Kunci integer
  membuat indeks jauh lebih kecil dan `JOIN` lebih cepat.
- **Tipe sekecil mungkin.** `TINYINT` untuk status (maksimal 255 nilai),
  `SMALLINT` untuk tahun. Baris yang lebih pendek berarti lebih banyak baris per
  halaman, dan lebih sedikit pembacaan disk.
- **Indeks gabungan mengikuti urutan `GROUP BY` yang nyata dipakai.**
- **`ROW_FORMAT=COMPRESSED`** memperkecil I/O pada tabel yang dominan dibaca.
- **Tanpa kendala `FOREIGN KEY` yang ditegakkan.** Pada warehouse, integritas
  rujukan dijamin oleh proses ETL, bukan oleh basis data. Menghilangkan
  penegakan FK mempercepat pemuatan massal. Relasi tetap ada secara logis dan
  tetap digambar pada diagram; yang dilepas hanya penegakannya oleh mesin.

### 4.3 Tabel ringkasan sebagai pengganti materialized view

MySQL **tidak memiliki materialized view**. Padanannya adalah tabel ringkasan
yang dihitung sekali saat ETL selesai, lalu dibaca langsung oleh dashboard:

```sql
CREATE TABLE agg_prodi_tahun (
    prodi_key       SMALLINT UNSIGNED NOT NULL,
    waktu_key       SMALLINT UNSIGNED NOT NULL,
    jumlah_alumni   INT UNSIGNED      NOT NULL,
    jumlah_bekerja  INT UNSIGNED      NOT NULL,
    rata_masa_tunggu DECIMAL(5,2),
    rata_gaji       DECIMAL(8,2),
    rata_ipk        DECIMAL(3,2),
    PRIMARY KEY (prodi_key, waktu_key)
) ENGINE=InnoDB;
```

Diisi di akhir `rebuildStarSchema()`. Dashboard membaca tabel ini alih-alih
mengagregasi ulang tabel fakta setiap kali halaman dibuka. Pada literatur data
warehouse, ini disebut *pre-aggregation* atau *summary table*, dan merupakan
teknik baku — layak dijadikan satu subbab tersendiri di Bab 3.

### 4.4 Pemuatan massal saat ETL

```sql
SET autocommit = 0;
SET unique_checks = 0;
SET foreign_key_checks = 0;

ALTER TABLE fact_tracer_alumni DISABLE KEYS;

LOAD DATA LOCAL INFILE 'alumnidummy.csv'
INTO TABLE staging_alumni
FIELDS TERMINATED BY ',' ENCLOSED BY '"'
LINES TERMINATED BY '\n'
IGNORE 1 ROWS;

ALTER TABLE fact_tracer_alumni ENABLE KEYS;

SET foreign_key_checks = 1;
SET unique_checks = 1;
COMMIT;
```

`LOAD DATA INFILE` jauh lebih cepat daripada `INSERT` baris demi baris.
Bandingkan waktunya dengan implementasi PHP Anda sekarang — hasil perbandingan
itu layak masuk Bab 4 sebagai bukti empiris.

### 4.5 Hak akses terpisah

```sql
CREATE USER 'dw_reader'@'localhost' IDENTIFIED BY '...';
GRANT SELECT ON smartcareer_dw.* TO 'dw_reader'@'localhost';

CREATE USER 'etl_writer'@'localhost' IDENTIFIED BY '...';
GRANT SELECT               ON smartcareer_oltp.* TO 'etl_writer'@'localhost';
GRANT SELECT, INSERT, UPDATE, DELETE, DROP, CREATE
                           ON smartcareer_dw.*   TO 'etl_writer'@'localhost';
```

Akun dashboard hanya boleh membaca. Ini penerapan langsung sifat
**non-volatile**: warehouse tidak dapat diubah dari antarmuka pengguna, hanya
oleh proses ETL. Sifat yang tadinya cuma teori di Bab 2 menjadi sesuatu yang
ditegakkan sistem.

---

## 5. Batasan MySQL sebagai data warehouse — nyatakan secara terbuka

Menyebut batasan justru memperkuat posisi Anda di sidang, karena menunjukkan
pilihan teknologi diambil sadar, bukan karena tidak tahu alternatifnya.

| Batasan MySQL | Dampak | Mengapa tetap dapat diterima di sini |
|---|---|---|
| Penyimpanan berbasis baris, bukan kolom | Kueri yang hanya butuh 3 kolom tetap membaca seluruh baris | Volume data ribuan baris; selisih waktunya tidak terasa |
| Tidak ada materialized view | Ringkasan harus dikelola manual | Diatasi dengan tabel `agg_*` pada bagian 4.3 |
| Tidak ada indeks bitmap | Kolom berkardinalitas rendah kurang optimal | Dimensi kecil; pemindaian penuhnya murah |
| Tidak ada eksekusi kueri paralel | Satu kueri hanya memakai satu inti CPU | Kueri agregat selesai di bawah satu detik pada skala ini |
| Tidak ada kompresi tingkat kolom | Ukuran penyimpanan lebih besar | Diredam `ROW_FORMAT=COMPRESSED` |

Kalimat penutup yang dapat dipakai di Bab 3:

> MySQL dipilih sebagai basis data warehouse dengan pertimbangan kesesuaian
> skala. Untuk volume data tracer study tingkat program studi yang berkisar pada
> ribuan baris per angkatan, keterbatasan MySQL dibanding basis data analitik
> berbasis kolom tidak berdampak nyata pada waktu respons, sementara MySQL
> memberikan keuntungan berupa kesamaan teknologi dengan basis data operasional,
> ketersediaan dukungan pada lingkungan pengembangan, dan tidak adanya biaya
> lisensi tambahan. Penggunaan MySQL sebagai basis data warehouse juga banyak
> dijumpai pada penelitian sejenis, sebagaimana dirujuk pada Bab 2.

---

## 6. Daftar pustaka pendukung

Metadata (DOI, judul, jurnal, tahun) **sudah diverifikasi melalui Crossref API**.
Teks lengkap belum dibaca, dan nama penulis dari Crossref kadang memuat nama
depan pada medan nama keluarga — **wajib dicocokkan ke artikel aslinya** sebelum
masuk daftar pustaka.

### 6.1 Star schema dan perancangan data warehouse

| # | Rujukan | DOI |
|---|---|---|
| 1 | Rabuzin, K. (2025). *Data Warehouse Design – Star Schema Synthesis Algorithm*. TEM Journal. | `10.18421/TEM142-68` |
| 2 | Kirmani, M. (2017). *Dimensional Modeling Using Star Schema for Data Warehouse Creation*. Oriental Journal of Computer Science and Technology. | `10.13005/ojcst/10.04.07` |
| 3 | Mohammed, et al. (2019). *Data Warehouse Design and Implementation Based on Star Schema vs. Snowflake Schema*. IJARBSS. | `10.6007/IJARBSS/v9-i14/6502` |
| 4 | (2019). *An improved join-free snowflake schema for ETL and OLAP of data warehouse*. Concurrency and Computation: Practice and Experience. | `10.1002/cpe.5519` |

Rujukan nomor 3 sangat berguna: perbandingan langsung star dan snowflake adalah
pembenaran tertulis atas pilihan denormalisasi Anda.

### 6.2 OLTP versus OLAP dan pemisahannya

| # | Rujukan | DOI |
|---|---|---|
| 5 | Gubner, et al. (2025). *Freely Moving between the OLTP and OLAP Worlds: Hermes — A High-Performance OLAP Accelerator for MySQL*. Proceedings of the VLDB Endowment. | `10.14778/3750601.3750631` |
| 6 | Lestari, Y. Y. (2026). *Implementasi Arsitektur OLAP pada Database OLTP dengan Log-Based CDC: Studi Kasus SIMKOPDES*. IKRA-ITH Informatika. | `10.37817/ikraith-informatika.v10i2.7199` |
| 7 | Rachapudi (2024). *Holistic Data Management: Integrating OLTP and OLAP in Financial Systems*. IJSR. | `10.21275/SR241015110206` |
| 8 | Vatresia, A. (2020). *Automated Data Integration of Biodiversity with OLAP and OLTP*. SISFORMA. | `10.24167/sisforma.v7i2.2817` |

Rujukan nomor 5 adalah yang paling berharga untuk revisi ini: makalah VLDB —
konferensi basis data papan atas — yang membahas percepatan OLAP **khusus untuk
MySQL**. Keberadaannya membuktikan bahwa MySQL sebagai sasaran beban kerja OLAP
adalah topik yang dibahas serius di literatur, bukan improvisasi.

### 6.3 Penerapan data warehouse pada domain nyata (berbahasa Indonesia)

| # | Rujukan | DOI |
|---|---|---|
| 9 | Purwanto (2021). *Perancangan Data Warehouse Rumah Sakit Berbasis Online Analytical Processing (OLAP)*. JTIIK. | `10.25126/jtiik.2021854232` |
| 10 | Triandini, E. (2021). *Implementasi Star Schema dalam Pembangunan Data Warehouse Penjualan Produk Tour*. CSRID. | `10.22303/csrid.12.1.2020.23-33` |
| 11 | Wijaya (2024). *Implementation of Data Warehouse and Star Schema for Optimizing Property Business Decision Making*. G-Tech. | `10.33379/gtech.v8i2.4091` |
| 12 | Angelya (2023). *Perancangan Data Warehouse Online Analytical Processing (OLAP) Data Hasil Kerja PT. ABC*. MDP Student Conference. | `10.35957/mdp-sc.v2i1.4241` |

JTIIK (nomor 9) terakreditasi Sinta 2 — rujukan paling kuat di antara yang
berbahasa Indonesia.

### 6.4 Rujukan primer yang wajib dilengkapi sendiri

Dua buku ini adalah pijakan teori yang tidak tergantikan. Keduanya belum
diverifikasi pada sesi ini; ambil data terbitannya dari perpustakaan atau
katalog penerbit:

- Inmon, W. H. *Building the Data Warehouse*. Wiley. — sumber empat sifat data
  warehouse pada bagian 2.1.
- Kimball, R., & Ross, M. *The Data Warehouse Toolkit: The Definitive Guide to
  Dimensional Modeling*. Wiley. — sumber metodologi dimensional dan star schema.

Perhatikan ketentuan artikel ilmiah Anda: rujukan harus terbit sepuluh tahun
terakhir. Kedua buku ini lebih tua, sehingga aman dipakai di laporan TA, tetapi
pada artikel sebaiknya didampingi rujukan jurnal terbaru dari bagian 6.1–6.3.

---

## 7. Tindak lanjut yang disarankan

### 7.1 Untuk laporan

Tambahkan pada **Bab 2** subbab baru: "MySQL sebagai Basis Data Warehouse",
memuat definisi Inmon (2.1), perbandingan OLTP–OLAP (2.2), konsep denormalisasi
beserta tiga tingkatnya (2.3), dan batas teknis MySQL beserta dukungan operator
OLAP-nya (3.1–3.2).

Tambahkan pada **Bab 3** subbab "Konfigurasi MySQL untuk Beban Kerja Analitik",
memuat pemisahan skema (1.2), konfigurasi server (4.1), rancangan tabel fakta
(4.2), tabel ringkasan (4.3), dan pemisahan hak akses (4.5).

Tambahkan pada **Bab 5** batasan dari bagian 5, sebagai bagian dari saran
pengembangan.

### 7.2 Untuk sistem — berurutan menurut prioritas

1. **Pisahkan skema OLTP dan warehouse** serta tambahkan koneksi `warehouse` di
   Laravel. Perubahan paling kecil dengan dampak argumentatif terbesar.
2. **Ganti agregasi bertingkat dengan `WITH ROLLUP` + `GROUPING()`** pada
   `olapStats()`, agar operasi roll-up benar-benar berjalan di mesin OLAP MySQL.
3. **Buat akun `dw_reader` yang hanya punya hak `SELECT`**, sebagai penegakan
   sifat non-volatile.
4. **Tambahkan tabel ringkasan `agg_prodi_tahun`** dan isi di akhir
   `rebuildStarSchema()`.
5. **Ganti pemuatan CSV dengan `LOAD DATA INFILE`** lalu catat waktunya.
6. **Terapkan partisi `RANGE` pada tabel fakta** — perlu kunci primer gabungan.
   Untuk volume sekarang manfaatnya belum terukur; nyatakan sebagai rancangan
   yang siap tumbuh, jangan diklaim sebagai peningkatan kinerja.

### 7.3 Bukti empiris untuk Bab 4

Dosen meminta penjelasan "dengan menyertakan datanya". Yang paling meyakinkan
adalah pengukuran langsung, bukan sekadar teori. Rancangan pengujian:

| Skenario | Kueri | Yang diukur |
|---|---|---|
| A | Agregasi dari tabel OLTP ternormalisasi (`alumni_profiles` + join `users`) | waktu eksekusi, baris diperiksa |
| B | Agregasi yang sama dari skema bintang | waktu eksekusi, baris diperiksa |
| C | Agregasi yang sama dari tabel ringkasan `agg_prodi_tahun` | waktu eksekusi, baris diperiksa |

Jalankan tiap skenario sepuluh kali, ambil reratanya, dan sertakan keluaran
`EXPLAIN` untuk menunjukkan indeks mana yang terpakai. Bersihkan cache di antara
pengujian, atau jalankan pemanasan lebih dulu agar perbandingannya adil.
Tabel hasilnya menjadi bukti kuantitatif bahwa pemisahan warehouse memberi
manfaat terukur — jauh lebih kuat daripada penjelasan naratif saja. Laporkan apa
adanya: bila pada volume data sekecil ini selisihnya kecil, katakan demikian dan
jelaskan bahwa keunggulannya baru tampak seiring pertumbuhan data.
