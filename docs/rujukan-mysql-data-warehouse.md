# Rujukan: MySQL sebagai Data Warehouse

Daftar pustaka pendukung untuk revisi dosen pembimbing, beserta penjelasan
sederhana bahwa MySQL sah digunakan sebagai basis data warehouse.

**Status verifikasi.** Seluruh metadata (DOI, judul, penulis, jurnal, tahun)
diambil langsung dari Crossref API dan sudah terverifikasi. Teks lengkap artikel
**belum dibaca**. Sebelum masuk daftar pustaka, buka DOI-nya dan pastikan isinya
memang sesuai yang Anda butuhkan.

---

## 1. Rujukan paling langsung: MySQL diuji sebagai data warehouse

### [A] Grigorev & Ustimov (2016)

> Grigorev, Yu. A., & Ustimov, A. I. (2016). Comparison of Query Execution Time
> to Data Warehouse in MapReduce/Hadoop and RDBMS MySQL. *Informatika i sistemy
> upravleniya*, (49), 3–12. https://doi.org/10.22250/isu.2016.49.3-12

Ini rujukan terpenting untuk revisi Anda. Judulnya menyebut secara eksplisit
"**Data Warehouse ... RDBMS MySQL**" — MySQL diperlakukan sebagai basis data
warehouse, lalu waktu eksekusi kuerinya dibandingkan dengan Hadoop/MapReduce.

Nilainya untuk sidang: keberadaan penelitian ini membuktikan bahwa MySQL sebagai
data warehouse bukan asumsi pribadi Anda, melainkan objek penelitian yang sudah
diuji dan dipublikasikan. Bahkan dibandingkan langsung dengan teknologi big data.

Catatan: terbitan Rusia, berbahasa Rusia dengan judul Inggris. Teks lengkap
tersedia di `http://ics.khstu.ru/media/2016/N49_01.pdf`. Tahun 2016 — masih
masuk sepuluh tahun terakhir bila dihitung dari 2026, tetapi berada di batas.

### [B] Gubner dkk. (2025) — VLDB

> Gubner, T., dkk. (2025). Freely Moving between the OLTP and OLAP Worlds:
> Hermes — A High-Performance OLAP Accelerator for MySQL. *Proceedings of the
> VLDB Endowment*. https://doi.org/10.14778/3750601.3750631

Rujukan berkualitas tertinggi dalam daftar ini. VLDB adalah konferensi basis data
peringkat teratas dunia. Makalah ini membahas percepatan beban kerja **OLAP
khusus untuk MySQL**.

Nilainya untuk sidang: kalau MySQL sama sekali tidak layak untuk OLAP, tidak akan
ada peneliti VLDB yang menulis akselerator OLAP untuknya. Keberadaan makalah ini
sekaligus mengakui dua hal — bahwa MySQL memang punya keterbatasan pada beban
analitik (karena itu perlu akselerator), dan bahwa MySQL cukup penting sebagai
sasaran OLAP sehingga layak diteliti di konferensi papan atas. Kutip untuk kedua
sisi argumen; ini justru membuat pembahasan Anda tampak berimbang.

### [C] Krogh (2020) — buku

> Krogh, J. W. (2020). *MySQL 8 Query Performance Tuning: A Systematic Method for
> Improving Execution Speeds*. Berkeley, CA: Apress.
> ISBN 978-1-4842-5583-4. https://doi.org/10.1007/978-1-4842-5584-1

Buku rujukan untuk bagian konfigurasi. Penulisnya mantan insinyur dukungan MySQL
di Oracle. Dipakai untuk membenarkan setelan pada Bab 3: `innodb_buffer_pool_size`,
`tmp_table_size`, `innodb_flush_log_at_trx_commit`, dan pembacaan `EXPLAIN`.

Metadata sudah diverifikasi Crossref: penerbit Apress, terbit 2020,
ISBN cetak 9781484255834, ISBN elektronik 9781484255841.

---

## 2. Star schema, denormalisasi, dan optimasi warehouse

### [D] Mohammed, K. I. (2019)

> Mohammed, K. I. (2019). Data Warehouse Design and Implementation Based on Star
> Schema vs. Snowflake Schema. *International Journal of Academic Research in
> Business and Social Sciences*, 9(14). https://doi.org/10.6007/IJARBSS/v9-i14/6502

Pembenaran tertulis atas pilihan Anda memakai star schema, bukan snowflake.
Kutip di Bab 3 saat menjelaskan alasan denormalisasi tabel dimensi.

### [E] Sidi, E., dkk. (2016)

> Sidi, E., El Amin, M., & El Merouani, M. (2016). Star Schema Advantages on Data
> Warehouse: Using Bitmap Index and Partitioned Fact Tables. *International
> Journal of Computer Applications*, 134(13).
> https://doi.org/10.5120/ijca2016908108

Membahas keunggulan star schema sekaligus **partisi tabel fakta** — persis materi
bagian partisi `RANGE` yang Anda rencanakan. Perhatikan bahwa artikel ini
membahas indeks bitmap; MySQL tidak memilikinya, dan itu justru dapat Anda
kutip sebagai batasan yang disadari.

### [F] Rabuzin, K., Cerjan, M., & Lovrenčić, A. (2025)

> Rabuzin, K., Cerjan, M., & Lovrenčić, A. (2025). Data Warehouse Design – Star
> Schema Synthesis Algorithm. *TEM Journal*, 14(2).
> https://doi.org/10.18421/TEM142-68

Rujukan star schema paling mutakhir. Cocok untuk artikel ilmiah yang menuntut
pustaka sepuluh tahun terakhir.

### [G] Kirmani, M. M. (2017)

> Kirmani, M. M. (2017). Dimensional Modeling Using Star Schema for Data Warehouse
> Creation. *Oriental Journal of Computer Science and Technology*, 10(4).
> https://doi.org/10.13005/ojcst/10.04.07

Dasar pemodelan dimensional: tabel fakta, tabel dimensi, ukuran, granularitas.

### [H] Setiawan, D., & Isa, S. M. (2025)

> Setiawan, D., & Isa, S. M. (2025). Improving Data Warehouse ETL Efficiency with
> Partitioning and Parallelism in Financial Services. *JST (Jurnal Sains dan
> Teknologi)*, 14(3). https://doi.org/10.23887/jst-undiksha.v14i3.103391

Terbitan Undiksha, berbahasa Indonesia, sangat baru. Membahas partisi dan
paralelisme untuk efisiensi ETL — langsung mendukung bagian ETL Anda.

---

## 3. Penerapan data warehouse berbahasa Indonesia

### [I] Purwanto (2021) — Sinta 2

> Purwanto, dkk. (2021). Perancangan Data Warehouse Rumah Sakit Berbasis Online
> Analytical Processing (OLAP). *Jurnal Teknologi Informasi dan Ilmu Komputer
> (JTIIK)*, 8(5). https://doi.org/10.25126/jtiik.2021854232

Jurnal berbahasa Indonesia dengan akreditasi tertinggi di daftar ini (Sinta 2,
Universitas Brawijaya). Polanya sama dengan penelitian Anda: warehouse + OLAP
untuk sebuah institusi.

### [J] Triandini, E., Rijal, M. S., & Ambara, M. P. (2021)

> Triandini, E., Rijal, M. S., & Ambara, M. P. (2021). Implementasi Star Schema
> dalam Pembangunan Data Warehouse Penjualan Produk Tour. *CSRID Journal*, 12(1),
> 23–33. https://doi.org/10.22303/csrid.12.1.2020.23-33

### [K] Pratama, I. P. A. E., & Permana, I. K. W. H. (2023)

> Pratama, I. P. A. E., & Permana, I. K. W. H. (2023). Analisa Pola Penjualan
> Berbasis Data Warehouse Menggunakan Metode ETL dan OLAP (Studi Kasus: Restoran
> Khayangan Kuliner). *TEMATIK*, 10(1).
> https://doi.org/10.38204/tematik.v10i1.1317

Gabungan ETL + OLAP dalam satu penelitian — struktur yang paling mirip dengan
milik Anda. Penulis pertama dosen Universitas Udayana yang produktif di bidang ini.

### [L] Wijaya, W., Wiratama, J., & Wijaya, S. F. (2024)

> Wijaya, W., Wiratama, J., & Wijaya, S. F. (2024). Implementation of Data
> Warehouse and Star Schema for Optimizing Property Business Decision Making.
> *G-Tech: Jurnal Teknologi Terapan*, 8(2).
> https://doi.org/10.33379/gtech.v8i2.4091

### [M] Hartanto, R., Kirana, J. C., & Indra (2026)

> Hartanto, R., Kirana, J. C., & Indra. (2026). Perancangan Data Warehouse
> Menggunakan Metode Star Schema dan ETL untuk Menghasilkan Laporan Efektivitas
> Proses Rekrutmen Kandidat di Enigma Camp. *Jurnal Pendidikan dan Teknologi
> Indonesia*. https://doi.org/10.52436/1.jpti.1229

Domainnya rekrutmen kandidat — paling dekat dengan tema karier alumni Anda.

---

## 4. Pembanding MySQL dan pilihan DBMS

### [N] Warman, I., & Ramdaniansyah, R. (2018)

> Warman, I., & Ramdaniansyah, R. (2018). Analisis Perbandingan Kinerja Query
> Database Management System (DBMS) antara MySQL 5.7.16 dan MariaDB 10.1.
> *Jurnal TEKNOIF*, 6(1), 32–41.
> https://doi.org/10.21063/jtif.2018.v6.1.32-41

Untuk subbab "alasan pemilihan MySQL" — memberi dasar empiris berbahasa
Indonesia, bukan sekadar pernyataan bahwa MySQL populer.

### [O] Wang, J., dkk. (2019)

> Wang, J., Zhao, W., Fan, T., Yang, S., & Lv, H. (2019). An improved join-free
> snowflake schema for ETL and OLAP of data warehouse. *Concurrency and
> Computation: Practice and Experience*, 31(24).
> https://doi.org/10.1002/cpe.5519

Membahas skema *join-free* — dukungan literatur untuk gagasan "tabel lebar tanpa
JOIN" yang dosen sebut. Kutip saat menjelaskan alternatif One Big Table.

---

## 5. Rujukan primer Kimball yang terverifikasi

Buku *The Data Warehouse Toolkit* tidak punya DOI. Sebagai gantinya, bab-bab
berikut dari *The Kimball Group Reader* (Wiley, 2015) sudah terverifikasi
Crossref dan lebih mudah dipertanggungjawabkan:

> Kimball, R., & Ross, M. (2015). Dimensional Modeling Fundamentals. Dalam *The
> Kimball Group Reader: Relentlessly Practical Tools for Data Warehousing and
> Business Intelligence* (Edisi ke-2). Wiley.
> https://doi.org/10.1002/9781119228912.ch6

> Kimball, R., & Ross, M. (2015). Dimensional Modeling Tasks and Responsibilities.
> Dalam *The Kimball Group Reader* (Edisi ke-2). Wiley.
> https://doi.org/10.1002/9781119228912.ch7

Catatan: medan penulis pada rekaman Crossref kosong, jadi nama Kimball & Ross
harus Anda cocokkan ke halaman judul bukunya.

Untuk Inmon, ambil dari katalog perpustakaan:

> Inmon, W. H. (2005). *Building the Data Warehouse* (Edisi ke-4). Wiley.

---

## 6. PERINGATAN — jangan mengutip yang ini

Pencarian memunculkan artikel berikut, dan judulnya sangat menggoda:

> Zhang, Y., & Pan, F. (2022). Design and implementation of a new intelligent
> **warehouse management system** based on MySQL database technology.
> *Informatica*, 46(3). https://doi.org/10.31449/inf.v46i3.3968

**Ini bukan tentang data warehouse.** "Warehouse management system" berarti
sistem manajemen **gudang barang** — rak, stok, keluar-masuk barang. Sama sekali
berbeda dengan *data* warehouse. Mengutipnya sebagai rujukan data warehouse akan
langsung terlihat oleh penguji yang membuka DOI-nya.

Hal serupa berlaku untuk artikel bertema "Rancang Bangun Pendataan Rak Barang
Warehouse ... PHP MySQL" dan sejenisnya. Selalu buka DOI-nya, jangan menilai dari
kata "warehouse" pada judul.

---

## 7. Penjelasan sederhana: mengapa MySQL sah dipakai sebagai data warehouse

Bagian ini ditulis dengan bahasa yang bisa langsung Anda sampaikan saat
bimbingan, tanpa istilah yang berlebihan.

### 7.1 Data warehouse adalah cara menyusun data, bukan merek perangkat lunak

Ini inti argumennya. Data warehouse bukan produk yang harus dibeli, melainkan
**pola perancangan**: data dikumpulkan dari berbagai sumber, diseragamkan,
disusun sebagai tabel fakta dan tabel dimensi, lalu disimpan untuk dianalisis
dan tidak diubah-ubah lagi.

Pola ini dapat diwujudkan pada basis data relasional mana pun yang mampu
menyimpan tabel dan menjalankan `JOIN` serta `GROUP BY`. MySQL memenuhi
keduanya. Yang membedakan sebuah basis data disebut OLTP atau warehouse bukanlah
mesinnya, melainkan **bagaimana tabelnya dirancang dan bagaimana data
diperlakukan**.

Perumpamaan yang mudah diterima: gudang dan toko bisa sama-sama berupa bangunan
bata. Yang membedakan bukan bahan bangunannya, melainkan cara isinya ditata —
toko menata barang agar mudah diambil satuan, gudang menata barang agar mudah
dihitung dalam jumlah besar.

### 7.2 MySQL secara teknis sanggup menampungnya

Angka berikut dikutip dari MySQL 8.0 Reference Manual dan sudah diverifikasi:

| Kemampuan | MySQL 8.0 |
|---|---|
| Jumlah kolom per tabel | 4096 (batas keras), 1017 pada InnoDB |
| Ukuran baris maksimum | 65.535 byte |
| Operasi roll-up | `GROUP BY ... WITH ROLLUP` + `GROUPING()` |
| Partisi tabel | RANGE, LIST, COLUMNS, HASH, KEY |
| Pemuatan massal | `LOAD DATA INFILE` |

Sumber:
<https://dev.mysql.com/doc/refman/8.0/en/column-count-limit.html>,
<https://dev.mysql.com/doc/refman/8.0/en/group-by-modifiers.html>,
<https://dev.mysql.com/doc/refman/8.0/en/partitioning-overview.html>

Yang paling menentukan: **manual MySQL sendiri menyebut `WITH ROLLUP` sebagai
dukungan bagi operasi OLAP.** Jadi kemampuan OLAP bukan sesuatu yang ditempelkan
dari luar — sudah ada di dalam MySQL.

### 7.3 Yang membuatnya menjadi warehouse adalah perlakuannya

Tiga hal berikut yang mengubah sebuah basis data MySQL biasa menjadi warehouse:

1. **Rancangan tabelnya terdenormalisasi.** Tabel fakta di tengah, tabel dimensi
   di sekelilingnya. Redundansi dibiarkan agar `JOIN` cukup satu tingkat.
2. **Datanya tidak diubah oleh pengguna.** Data hanya masuk melalui proses ETL.
   Ditegakkan dengan membuat akun basis data yang hanya punya hak `SELECT`.
3. **Konfigurasinya disetel untuk membaca, bukan menulis.** Buffer pool besar,
   `innodb_flush_log_at_trx_commit = 2`, penegakan kunci asing dilepas.

### 7.4 Batasannya harus dinyatakan

MySQL menyimpan data per baris (*row-store*), sedangkan basis data analitik
modern menyimpan per kolom (*column-store*). Untuk kueri yang hanya membutuhkan
tiga kolom dari jutaan baris, column-store jauh lebih cepat karena tidak perlu
membaca kolom lain dari disk.

Namun pada volume data tracer study tingkat program studi — ribuan baris per
angkatan — selisih ini tidak terasa. MySQL dipilih karena sesuai skala, sama
dengan basis data operasional yang sudah dipakai, dan tanpa biaya lisensi
tambahan.

Menyebut batasan ini justru menguatkan posisi Anda: menunjukkan pilihan diambil
secara sadar, bukan karena tidak mengetahui alternatifnya.

### 7.5 Rangkuman satu paragraf untuk laporan

> Data warehouse merupakan pendekatan perancangan basis data, bukan produk
> perangkat lunak tertentu. Selama sebuah sistem manajemen basis data relasional
> mampu menyimpan struktur tabel fakta dan tabel dimensi serta menjalankan
> operasi agregasi, sistem tersebut dapat digunakan sebagai basis data warehouse.
> MySQL 8.0 memenuhi persyaratan tersebut: mendukung hingga 1017 kolom per tabel
> pada mesin penyimpanan InnoDB, menyediakan pengubah `WITH ROLLUP` beserta
> fungsi `GROUPING()` untuk operasi agregasi bertingkat yang dinyatakan dalam
> dokumentasi resminya sebagai dukungan terhadap operasi OLAP, serta menyediakan
> mekanisme partisi tabel dan pemuatan data massal. Perbedaan antara basis data
> operasional dan basis data warehouse terletak pada rancangan skema, perlakuan
> terhadap data, dan konfigurasi server, bukan pada perangkat lunak yang
> digunakan.

---

## 8. Prioritas pengutipan

Jika hanya dapat memakai sedikit rujukan, urutan ini yang paling kuat:

1. **[A] Grigorev & Ustimov (2016)** — bukti langsung MySQL diuji sebagai data warehouse
2. **[B] Gubner dkk. (2025) VLDB** — bukti MySQL sebagai sasaran OLAP di literatur papan atas
3. **[D] Mohammed (2019)** — pembenaran star schema atas snowflake
4. **[I] Purwanto (2021) JTIIK** — rujukan Indonesia berakreditasi tertinggi
5. **[C] Krogh (2020)** — dasar konfigurasi MySQL
6. **[E] Sidi dkk. (2016)** — partisi tabel fakta

Enam ini sudah cukup untuk menjawab revisi. Sisanya sebagai cadangan bila
penguji meminta pembanding tambahan.
