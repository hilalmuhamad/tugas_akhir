# Rujukan: PostgreSQL sebagai Data Warehouse dan Basis OLAP

Daftar pustaka pendukung rencana migrasi dari MySQL ke PostgreSQL, beserta dasar
teori yang membenarkan PostgreSQL dipakai sebagai basis data warehouse.

**Status verifikasi.** Metadata (DOI, judul, penulis, penerbit, tahun, halaman)
diambil langsung dari Crossref API dan sudah terverifikasi, kecuali satu entri
yang ditandai khusus di Bagian 3. Kutipan dari dokumentasi resmi PostgreSQL
diambil langsung dari halaman manualnya. **Teks lengkap artikel belum dibaca.**
Sebelum masuk daftar pustaka, buka DOI-nya dan pastikan isinya sesuai kebutuhan.

Dokumen ini melengkapi `docs/rujukan-mysql-data-warehouse.md`. Bila migrasi jadi
dilakukan, dokumen MySQL tetap disimpan sebagai pembanding — justru berguna untuk
menjawab pertanyaan penguji "mengapa pindah?".

---

## 1. Rujukan paling langsung: PostgreSQL diuji sebagai data warehouse

### [P1] Joiner dkk. (2024) — IEEE SysCon

> Joiner, D., Clement, M., Pereira, K., Chan, S. T., Khmelevsky, Y., Wong, A.,
> Mahony, J., & Ferri, M. (2024). PostgreSQL Data Warehouse Implementation and
> Performance Optimization For Energy Companies. Dalam *2024 IEEE International
> Systems Conference (SysCon)* (hlm. 1–8). IEEE.
> https://doi.org/10.1109/syscon61195.2024.10553614

**Rujukan terpenting untuk revisi ini.** Judulnya menyebut secara eksplisit
"PostgreSQL Data Warehouse Implementation **and Performance Optimization**" —
persis dua hal yang Anda butuhkan: bukti PostgreSQL dipakai sebagai warehouse,
sekaligus pembahasan optimasinya.

Nilainya saat sidang: penerbitnya IEEE, terbit 2024, dan penulisnya gabungan
akademisi (Okanagan College, Langara College) dengan praktisi industri (Harris
SmartWorks). Jadi ini bukan sekadar percobaan di laboratorium.

Konferensi diadakan 15–18 April 2024 di Montreal, Kanada.

### [P2] Fotache dkk. (2024) — IEEE RoEduNet

> Fotache, M., Badea, C., Cluci, M.-I., Pînzaru, C., Eşanu, C.-S., & Rusu, O.
> (2024). OLAP performance of distributed PostgreSQL and MongoDB on OpenStack:
> Preliminary Results on Smaller Scale Factors. Dalam *2024 23rd RoEduNet
> Conference: Networking in Education and Research* (hlm. 1–6). IEEE.
> https://doi.org/10.1109/roedunet64292.2024.10722556

Mengukur **performa OLAP PostgreSQL** dan membandingkannya dengan MongoDB.
Kutip di Bab 2 saat menjelaskan mengapa basis data relasional dipilih untuk
beban kerja OLAP.

Frasa "Smaller Scale Factors" pada judul justru menguntungkan Anda: penelitian
ini menguji pada skala data yang kecil, sama seperti tracer study tingkat
program studi. Anda bisa menyatakan bahwa skala penelitian Anda sejalan dengan
lingkup yang sudah diteliti, bukan sekadar mengecilkan klaim.

Konferensi 19–20 September 2024, Bukares, Rumania.

### [P3] Ramadhani, Hadi, & Rosadi (2021) — IEEE, Universitas Padjadjaran

> Ramadhani, P. P., Hadi, S., & Rosadi, R. (2021). Implementation of Data
> Warehouse in Making Business Intelligence Dashboard Development Using
> PostgreSQL Database and Kimball Lifecycle Method. Dalam *2021 International
> Conference on Artificial Intelligence and Big Data Analytics (ICAIBDA)*
> (hlm. 88–92). IEEE. https://doi.org/10.1109/icaibda53487.2021.9689697

Rujukan paling mirip dengan penelitian Anda: **data warehouse + dashboard +
PostgreSQL + metode Kimball**, ditulis peneliti Indonesia (Universitas
Padjadjaran, Bandung), diterbitkan IEEE.

Nilainya berlapis. Pertama, membuktikan pola penelitian Anda sudah punya
pendahulu yang terbit di penerbit internasional. Kedua, penulisnya dari Bandung
juga, sehingga wajar dijadikan rujukan lokal. Ketiga, memakai Kimball Lifecycle,
yang menyambung dengan pilihan star schema Anda.

Konferensi 27–29 Oktober 2021, Bandung.

---

## 2. Buku rujukan PostgreSQL (terverifikasi Crossref)

### [P4] Dombrovskaya, Novikov, & Bailliekova (2024) — edisi kedua

> Dombrovskaya, H., Novikov, B., & Bailliekova, A. (2024). *PostgreSQL Query
> Optimization: The Ultimate Guide to Building Efficient Queries* (Edisi ke-2).
> Apress. ISBN 979-8-8688-0068-9. https://doi.org/10.1007/979-8-8688-0069-6

Buku utama untuk bab optimasi kueri. Edisi kedua terbit 2024, jadi aman untuk
syarat pustaka sepuluh tahun terakhir. Boris Novikov punya ORCID terdaftar di
rekaman Crossref.

Dipakai untuk membenarkan pembacaan `EXPLAIN ANALYZE`, pemilihan indeks, dan
perencanaan kueri agregasi di Bab 3.

Edisi pertama (2021) juga terverifikasi bila diperlukan:
DOI `10.1007/978-1-4842-6885-8`, ISBN 978-1-4842-6884-1.

### [P5] Shaik (2020)

> Shaik, B. (2020). *PostgreSQL Configuration: Best Practices for Performance
> and Security*. Apress. ISBN 978-1-4842-5662-6.
> https://doi.org/10.1007/978-1-4842-5663-3

Rujukan untuk bagian konfigurasi server. Ini pengganti langsung Krogh (2020)
yang dipakai pada dokumen MySQL — perannya sama, hanya berganti DBMS.

Dipakai membenarkan setelan `shared_buffers`, `work_mem`,
`effective_cache_size`, dan `maintenance_work_mem` di Bab 3.

### [P6] Ravi Kumar, Samayam, & Kadambari (2025)

> Ravi Kumar, B., Samayam, N., & Kadambari, K. V. (2025). *Mastering PostgreSQL
> Administration*. Apress. ISBN 979-8-8688-1506-5.
> https://doi.org/10.1007/979-8-8688-1507-2

Rujukan administrasi paling mutakhir dalam daftar ini. Berguna untuk bagian
pengelolaan akun basis data, hak akses, dan pemeliharaan.

---

## 3. Penerapan berbahasa Indonesia

### [P7] Khaerunnisa dkk. (2025) — JITET, Universitas Lampung

> Khaerunnisa, Al Qodr, Putri, Firdaus, & Rozikin. (2025). Optimasi Proses Data
> Warehouse Menggunakan Partisi dan Indexing pada PostgreSQL untuk Meningkatkan
> Performa Query. *Jurnal Informatika dan Teknik Elektro Terapan (JITET)*,
> 13(3s1). https://doi.org/10.23960/jitet.v13i3s1.8012

**Rujukan Indonesia paling tepat sasaran.** Judulnya menggabungkan tiga hal
sekaligus: data warehouse, PostgreSQL, dan partisi + indexing untuk performa
kueri. Persis materi Bab 3 Anda.

> **Catatan verifikasi.** Metadata entri ini berasal dari hasil pencarian
> Crossref, tetapi permintaan verifikasi per-DOI-nya tertahan (HTTP 429, batas
> laju). Nama depan penulis dan nomor halaman **belum terkonfirmasi**. Buka
> `https://doi.org/10.23960/jitet.v13i3s1.8012` dan lengkapi sendiri sebelum
> masuk daftar pustaka.

### [P8] Wijaya & Novaldi (2025)

> Wijaya, A., & Novaldi. (2025). Perancangan Data Warehouse Menggunakan Model
> Star Schema untuk Analisis Penjualan Retail Berbasis PostgreSQL. *Journal of
> Informatics and Business*, 3(3). Universitas Dharma Andalas.
> https://doi.org/10.47233/jibs.v3i3.3759

**Star schema + PostgreSQL dalam satu judul.** Ini pembenaran langsung bahwa
kombinasi yang Anda pakai sudah lazim di literatur Indonesia.

### [P9] Selvianto, Daely, & Wijaya (2025)

> Selvianto, S. C., Daely, S. A. G., & Wijaya, A. (2025). Implementasi Data
> Warehouse Industri Film Menggunakan PostgreSQL. *Jurnal Sistem Informasi dan
> Teknologi Peradaban*, 6(2). Universitas Peradaban.
> https://doi.org/10.58436/jsitp.v6i2.2492

### [P10] Hadi, Sianturi, & Wijaya (2025)

> Hadi, A. M. J., Sianturi, A. E. N., & Wijaya, A. (2025). Perancangan Data
> Warehouse E-Commerce Menggunakan PostgreSQL pada Public Dataset Olist.
> *Jurnal Riset Sistem Informasi*. https://doi.org/10.69714/8dwt6j74

Catatan untuk [P8]–[P10]: ketiganya melibatkan penulis bernama Andri Wijaya.
Kalau ketiganya dikutip sekaligus, penguji mungkin bertanya. Pilih dua saja —
saran saya [P8] dan [P9] — dan jangan mengutip ketiganya berurutan.

---

## 4. Dukungan OLAP di dalam PostgreSQL sendiri

Bagian ini penting untuk sidang. Argumen terkuat bukan berasal dari jurnal,
melainkan dari **dokumentasi resmi PostgreSQL**, karena tidak bisa dibantah.

### 4.1 GROUPING SETS, ROLLUP, dan CUBE

Dokumentasi resmi PostgreSQL menyediakan tiga konstruksi agregasi bertingkat.
Kutipan berikut diambil langsung dari manual, bagian *Table Expressions*
(<https://www.postgresql.org/docs/current/queries-table-expressions.html>):

**ROLLUP** — "represents the given list of expressions and all prefixes of the
list including the empty list". Manual menambahkan bahwa konstruksi ini "is
commonly used for analysis over hierarchical data; e.g., total salary by
department, division, and company-wide total."

Untuk *n* ekspresi, `ROLLUP` menghasilkan *n+1* kelompok: daftar penuh, tiap
awalan yang makin pendek, lalu total keseluruhan. Urutan ekspresi berpengaruh.

**CUBE** — "represents the given list and all of its possible subsets (i.e., the
power set)." Untuk *n* ekspresi menghasilkan 2ⁿ kelompok. Urutan tidak
berpengaruh.

**GROUPING SETS** — bentuk paling umum: "The data selected by the FROM and WHERE
clauses is grouped separately by each specified grouping set, aggregates
computed for each group just as for simple GROUP BY clauses, and then the
results returned."

**Inilah keunggulan teknis terbesar PostgreSQL atas MySQL untuk OLAP.** MySQL 8.0
hanya punya `WITH ROLLUP`. PostgreSQL punya ketiganya. `CUBE` memberi seluruh
kombinasi dimensi dalam satu kueri — inti dari operasi OLAP multidimensi.

Contoh untuk skema bintang Anda:

```sql
SELECT
    dw.tahun_lulus,
    dp.program_studi,
    dk.kategori_horizontal,
    COUNT(*)                                    AS jumlah,
    GROUPING(dw.tahun_lulus)                    AS agg_tahun,
    GROUPING(dp.program_studi)                  AS agg_prodi
FROM fact_tracer_alumni f
JOIN dim_waktu         dw ON f.waktu_key = dw.waktu_key
JOIN dim_program_studi dp ON f.prodi_key = dp.prodi_key
JOIN dim_keselarasan   dk ON f.keselarasan_key = dk.keselarasan_key
WHERE dw.tahun_lulus BETWEEN 2023 AND 2025
GROUP BY CUBE (dw.tahun_lulus, dp.program_studi, dk.kategori_horizontal);
```

Satu kueri ini menghasilkan seluruh kombinasi: per tahun, per prodi, per
kategori, per pasangan, sampai total keseluruhan. Di MySQL, hasil yang sama
menuntut beberapa kueri terpisah.

Fungsi `GROUPING()` membedakan baris subtotal dari baris biasa. Manual
menjelaskan alasannya: nilai kolom yang tidak ikut dikelompokkan diganti NULL,
sehingga "If any of the ungrouped columns contains NULL, it will be
indistinguishable from the NULL used when that same column is grouped."

Ada juga `GROUP BY DISTINCT` untuk membuang kelompok yang terduplikasi — tidak
ada padanannya di MySQL.

### 4.2 Partisi deklaratif

Sumber: <https://www.postgresql.org/docs/current/ddl-partitioning.html>

PostgreSQL mendukung tiga metode partisi: **RANGE**, **LIST**, dan **HASH**.
Untuk tabel fakta tracer study, `RANGE` berdasarkan tahun lulus adalah pilihan
yang wajar.

Manual menyatakan manfaat *partition pruning*: "the planner will examine the
definition of each partition and prove that the partition need not be scanned
because it could not contain any rows meeting the query's WHERE clause. When the
planner can prove this, it excludes (prunes) the partition from the query plan."

Yang tidak dimiliki MySQL: PostgreSQL melakukan pruning **saat perencanaan dan
saat eksekusi**. Pruning saat eksekusi menangani parameter yang baru diketahui
ketika kueri berjalan — relevan untuk endpoint `olapStats()` yang menerima
`?tahunAwal=&tahunAkhir=` dari dashboard.

Untuk pemuatan data, manual menyebut pola *load-then-attach*: "This allows new
data to be loaded, checked, and transformed prior to it appearing in the
partitioned table." Cocok untuk ETL dari CSV.

Satu peringatan jujur yang perlu Anda cantumkan sebagai batasan. Manual
menyatakan: "These benefits will normally be worthwhile only when a table would
otherwise be very large. The exact point at which a table will benefit from
partitioning depends on the application, although a rule of thumb is that the
size of the table should exceed the physical memory of the database server."

Tabel fakta Anda berisi ratusan baris. **Jauh di bawah ambang itu.** Jadi
partisi sebaiknya Anda tulis sebagai rancangan yang menjamin skalabilitas ke
depan, bukan sebagai optimasi yang sudah terbukti pada data sekarang.
Menyatakannya begini lebih kuat daripada mengklaim manfaat yang tidak terjadi.

### 4.3 Indeks BRIN

Sumber: <https://www.postgresql.org/docs/current/brin.html>

Ini fitur yang **tidak ada padanannya di MySQL** dan sangat cocok untuk
warehouse. Manual membukanya begini: "BRIN stands for Block Range Index. BRIN is
designed for handling very large tables in which certain columns have some
natural correlation with their physical location within the table."

Alih-alih mengindeks tiap baris, BRIN mengindeks **kelompok halaman**: "A block
range is a group of pages that are physically adjacent in the table; for each
block range, some summary info is stored by the index."

Akibatnya indeksnya sangat kecil: "Because a BRIN index is very small, scanning
the index adds little overhead compared to a sequential scan, but may avoid
scanning large parts of the table that are known not to contain matching
tuples."

Contoh untuk tabel fakta Anda, yang terurut menurut tahun lulus:

```sql
CREATE INDEX fact_waktu_brin ON fact_tracer_alumni USING brin (waktu_key);
```

Catatan pemeliharaan dari manual: rentang baru tidak otomatis diringkas. Nyalakan
`autosummarize`, atau panggil `brin_summarize_new_values()` setelah ETL.

Sama seperti partisi, sampaikan ini sebagai rancangan skalabilitas. Pada
ratusan baris, BRIN belum memberi keuntungan terukur.

---

## 5. Rujukan pembanding dan pendukung

### [P11] Cubukcu dkk. (2021) — ACM SIGMOD

> Cubukcu, U., Erdogan, O., Pathak, S., Sannakkayala, S., & Slot, M. (2021).
> Citus: Distributed PostgreSQL for Data-Intensive Applications. Dalam
> *Proceedings of the 2021 International Conference on Management of Data*
> (SIGMOD '21). ACM. https://doi.org/10.1145/3448016.3457551

SIGMOD adalah konferensi basis data papan atas, setara VLDB. Makalah ini
membahas Citus, ekstensi PostgreSQL untuk beban kerja intensif data.

Nilainya untuk sidang: menunjukkan PostgreSQL punya jalur pertumbuhan yang jelas
bila data membesar — cukup pasang ekstensi, tanpa berganti DBMS. Anda tidak
perlu memakai Citus; cukup sebutkan sebagai arah pengembangan di Bab 5.

### [P12] Baranchikov & Petukhov (2025)

> Baranchikov, A., & Petukhov, A. (2025). Using Columnar Databases for Analytics
> Using OLAP. Dalam *Modern Technologies in Science and Education (MTSE-2025)*.
> Ryazan State Radio Engineering University.
> https://doi.org/10.21667/978-5-7722-0426-9-205-208

Untuk membahas batasan penyimpanan per baris (*row-store*). Kutip saat
menyatakan bahwa basis data kolumnar lebih unggul untuk agregasi, lalu jelaskan
mengapa pada skala Anda hal itu belum menentukan.

### [P13] Lee & Zhou

> Lee, R., & Zhou, M. Extending PostgreSQL to Support Distributed/Heterogeneous
> Query Processing. Dalam *Advances in Databases: Concepts, Systems and
> Applications* (Lecture Notes in Computer Science). Springer.
> https://doi.org/10.1007/978-3-540-71703-4_109

> **Catatan.** Rekaman Crossref tidak memuat tahun terbit. Seri DASFAA/LNCS ini
> terbit sekitar 2007, sehingga **di luar sepuluh tahun terakhir**. Pakai hanya
> bila penguji menanyakan riwayat kemampuan PostgreSQL, dan lengkapi tahunnya
> dari halaman penerbit.

---

## 6. Penjelasan sederhana: mengapa pindah dari MySQL ke PostgreSQL

Bagian ini ditulis agar bisa langsung disampaikan saat bimbingan.

### 6.1 Alasan yang bisa dipertanggungjawabkan

Ada tiga alasan yang berdiri di atas bukti, bukan selera.

**Pertama, dukungan agregasi multidimensi lebih lengkap.** MySQL 8.0 hanya punya
`WITH ROLLUP`. PostgreSQL punya `GROUPING SETS`, `ROLLUP`, dan `CUBE`. Karena
inti OLAP adalah melihat data dari berbagai kombinasi dimensi, `CUBE` menjawab
kebutuhan itu dalam satu kueri. Ini bisa Anda tunjukkan langsung di depan
penguji dengan menjalankan kuerinya.

**Kedua, partisi dan indeks yang lebih sesuai untuk warehouse.** Partition
pruning berjalan pada dua tahap (perencanaan dan eksekusi), sedangkan indeks
BRIN dirancang khusus untuk tabel besar yang tersusun menurut waktu — persis
watak tabel fakta.

**Ketiga, kepatuhan pada standar SQL.** PostgreSQL menerapkan standar SQL lebih
ketat, termasuk pada `GROUP BY` dan tipe data. Untuk penelitian akademik, ini
memudahkan pemindahan kueri ke sistem lain.

### 6.2 Yang harus dihindari saat menjelaskan

Jangan menyatakan "MySQL tidak bisa dipakai sebagai data warehouse". Itu **tidak
benar**, dan dokumen `docs/rujukan-mysql-data-warehouse.md` sudah mengumpulkan
buktinya sendiri — termasuk makalah VLDB 2025 tentang akselerator OLAP untuk
MySQL. Kalau Anda menyatakan MySQL tidak bisa, penguji yang membaca dokumen
sebelumnya akan melihat Anda berubah pendirian tanpa alasan.

Rumusan yang benar: **keduanya bisa; PostgreSQL menyediakan kemampuan OLAP
bawaan yang lebih lengkap.** Ini jujur sekaligus tetap membenarkan migrasi.

### 6.3 Rangkuman satu paragraf untuk laporan

> Migrasi basis data warehouse dari MySQL ke PostgreSQL dilakukan atas dasar
> kelengkapan dukungan operasi agregasi multidimensi. MySQL 8.0 hanya
> menyediakan pengubah `WITH ROLLUP`, sedangkan PostgreSQL menyediakan
> `GROUPING SETS`, `ROLLUP`, dan `CUBE` sebagaimana dinyatakan dalam
> dokumentasi resminya, sehingga seluruh kombinasi dimensi dapat diperoleh
> melalui satu perintah kueri. PostgreSQL juga menyediakan partisi deklaratif
> dengan mekanisme *partition pruning* pada tahap perencanaan maupun eksekusi,
> serta indeks BRIN yang dirancang untuk tabel berukuran besar dengan korelasi
> alami terhadap letak fisik datanya. Ketiga kemampuan tersebut sejalan dengan
> karakteristik tabel fakta pada skema bintang yang digunakan dalam penelitian
> ini. Pemilihan ini tidak menyatakan bahwa MySQL tidak dapat digunakan sebagai
> basis data warehouse, melainkan bahwa PostgreSQL menyediakan dukungan operasi
> OLAP secara bawaan dengan cakupan yang lebih lengkap.

---

## 7. Prioritas pengutipan

Bila hanya dapat memakai sedikit rujukan, urutan ini yang paling kuat:

1. **[P1] Joiner dkk. (2024) IEEE** — bukti langsung PostgreSQL sebagai data warehouse
2. **[P3] Ramadhani dkk. (2021) IEEE** — data warehouse + dashboard + PostgreSQL + Kimball, peneliti Indonesia
3. **Dokumentasi resmi PostgreSQL** (Bagian 4) — bukti terkuat, tidak terbantahkan
4. **[P2] Fotache dkk. (2024) IEEE** — pengukuran performa OLAP PostgreSQL
5. **[P8] Wijaya & Novaldi (2025)** — star schema + PostgreSQL berbahasa Indonesia
6. **[P4] Dombrovskaya dkk. (2024)** — buku optimasi kueri
7. **[P5] Shaik (2020)** — buku konfigurasi server

Tujuh ini sudah cukup menjawab revisi. Sisanya sebagai cadangan.

---

## 8. Catatan sebelum migrasi dijalankan

Rujukan sudah tersedia, tetapi migrasi itu sendiri menyentuh banyak berkas.
Beberapa hal yang perlu diputuskan lebih dahulu:

1. **Waktu.** Proyek sedang berjalan dengan revisi kohort TS-1..TS-3 dan grafik
   keselarasan. Migrasi di tengah pekerjaan itu menambah dua sumber galat
   sekaligus. Pertimbangkan menyelesaikan revisi dosen dulu.

2. **Cakupan perubahan.** Laravel menyediakan driver `pgsql` (sudah ada di
   `backend/config/database.php`), jadi Eloquent sebagian besar berpindah tanpa
   perubahan. Yang **tidak** berpindah otomatis: seluruh `selectRaw()` di
   `AlumniController.php`. Beberapa yang pasti berubah —
   - `IF(...)` → `CASE WHEN ... END`
   - `IFNULL(...)` → `COALESCE(...)`
   - pembagian bilangan bulat berperilaku beda
   - nama tabel/kolom peka huruf besar-kecil bila memakai tanda kutip
   - `LOAD DATA INFILE` → `COPY`

3. **Naskah laporan.** Bab 3 dan Bab 4 saat ini menyebut MySQL. Semua penyebutan
   harus disisir, termasuk gambar arsitektur dan Kamus Data.

4. **Manfaat nyata pada data sekarang.** Tabel fakta berisi ratusan baris. Baik
   partisi maupun BRIN belum memberi peningkatan yang terukur pada ukuran
   segitu. Kalau migrasi dijadikan bagian dari laporan, sampaikan sebagai
   pemilihan berdasarkan **kelengkapan fitur OLAP**, bukan berdasarkan hasil
   pengukuran kecepatan — kecuali Anda memang menjalankan pembandingan dan
   melaporkan angkanya.

Kalau ingin tetap melanjutkan, langkah berikutnya adalah menyusun daftar
lengkap kueri mentah yang perlu ditulis ulang.
