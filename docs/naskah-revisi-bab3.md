# Naskah Revisi — Bab 3 (Analisa dan Perancangan)

Teks siap tempel. Ganti seluruh paragraf/baris tabel, jangan menambal kalimat
per kalimat.

---

## Cara memakai dokumen ini

**Nomor paragraf.** Nomor `[nnn]` di dokumen ini menghitung **seluruh** elemen
paragraf di `word/document.xml`, termasuk paragraf kosong. Nomor di
`docs/revisi-laporan-ta.md` menghitung paragraf yang berisi teks saja, sehingga
**sekitar 20 lebih kecil**. Jangan mengandalkan nomornya — **cari kalimat yang
dikutip** dengan Ctrl+F di Word. Kalimat kutipan selalu saya sertakan.

**Urutan pengerjaan yang saya sarankan.** Bagian 1 dulu (paling banyak dibaca
penguji), lalu Bagian 9–11 (Kamus Data, paling banyak salah), baru sisanya.

---

## Temuan besar yang harus Anda putuskan sebelum mengetik

Saya memeriksa kode sebelum menulis naskah ini. Ada satu selisih yang tidak bisa
diperbaiki dengan mengubah kalimat saja.

**Bab 3 menggambarkan layanan prediksi yang berjalan saat aplikasi dipakai.
Layanan itu tidak ada di dalam sistem.**

Bukti dari kode:

| Yang ditulis Bab 3 | Keadaan sebenarnya |
|---|---|
| `PredictionController` menerima permintaan prediksi (paragraf [804]) | Tidak ada di `backend/app/Http/Controllers/Api/`. Yang ada: `AlumniController`, `AuthController`, `CareerController`, `JobController` |
| `RandomForestService.predictCareer()` (paragraf [804]) | Tidak ada di `backend/app/Services/`. Yang ada: `AiService`, `EtlService`, `TfIdfService` |
| Ada rute API untuk prediksi | `backend/routes/api.php` tidak memuat satu pun rute prediksi |
| Tabel `log_prediksis` menyimpan riwayat prediksi (Tabel 3.12) | Tabel ini tidak pernah dibuat. Tidak ada berkas migrasinya |

Yang **benar-benar ada**: dua skrip pelatihan luring di `admin/scripts/`
(`train_random_forest_iku.py` dan `train_random_forest_tepat.py`). Keduanya
dijalankan terpisah dari aplikasi, hasilnya ditulis ke berkas JSON di
`admin/src/data/`, lalu berkas itu diimpor secara statis oleh komponen React
(`IkuScoreCard`, `IkuTrainingPanel`, `PredictionPanel`, `PredictionTable`).
Jadi dasbor **menampilkan hasil pelatihan model**, bukan memanggil model.

Ada dua jalan, dan Anda harus memilih satu:

**Jalan A — perbaiki naskah agar sesuai kode (saran saya).**
Random Forest ditulis sebagai **analisis luring** yang hasilnya ditampilkan pada
dasbor. Sequence Diagram dan Activity Diagram prediksi diganti menjadi *diagram
alur pelatihan dan pemuatan hasil*. Tabel `log_prediksis` dihapus dari ERD dan
Kamus Data. Tidak ada baris kode baru yang perlu ditulis. Seluruh naskah di
bawah ini ditulis mengikuti Jalan A.

**Jalan B — bangun layanan prediksinya.**
Perlu `PredictionController`, rute `POST /api/predict`, mekanisme memanggil
model terlatih dari PHP, dan tabel `log_prediksis`. Ini pekerjaan beberapa hari
dan menambah risiko baru menjelang sidang. Kalau Anda memilih ini, beri tahu
saya — naskahnya berbeda dan saya tulis ulang bagian 6–8.

Jalan A juga sejalan dengan Bab 1 yang sudah Anda revisi: butir 8 Ruang Lingkup
menyebut Random Forest sebagai **teknik pendukung pada modul analitik**, bukan
layanan yang dipanggil alumni.

---

## 1. Analisis Sistem yang akan Dibangun

### 1.1 Paragraf modul OLAP

Cari kalimat: *"melalui operasi roll-up, drill-down, dan slice-and-dice secara
real-time"* (paragraf [639]). Ganti seluruh butirnya:

> **Modul Analitik Multidimensi (OLAP).** Modul ini menyediakan dasbor
> pemantauan capaian lulusan bagi Admin dan Pimpinan. Data hasil kuesioner
> dipindahkan dari basis data operasional ke gudang data bersusun skema bintang
> melalui proses *Extract, Transform, Load* (ETL), kemudian diringkas melalui
> operasi *roll-up* menurut tahun kelulusan dan program studi serta ditelusuri
> melalui operasi *drill-down* pada tabulasi silang program studi terhadap
> status kerja. Penyaringan populasi dilakukan menurut jendela kohort *Tracer
> Study* TS-1 sampai TS-3. Selain distribusi status kerja dan masa tunggu,
> modul ini menyajikan dua indikator keselarasan lulusan, yaitu keselarasan
> horizontal berupa kesesuaian bidang studi dengan bidang pekerjaan dan
> keselarasan vertikal berupa kesesuaian jenjang pendidikan dengan tingkat
> pekerjaan, yang keduanya diperoleh langsung dari jawaban kuesioner [?].

Yang berubah dan alasannya:

- **"slice-and-dice" dihapus.** Sistem tidak menyediakan operasi itu. Yang ada
  hanya *roll-up*, *drill-down*, dan penyaringan kohort. Menyebut operasi yang
  tidak dibangun adalah hal pertama yang akan diuji penguji.
- **"real-time" dihapus.** Agregasi dijalankan saat permintaan HTTP diterima,
  bukan aliran data berkelanjutan.
- **Rujukan [30] dihapus.** Rujukan itu membahas pengindeksan MySQL, bukan
  operasi OLAP. Ganti dengan rujukan OLAP yang sesuai — lihat daftar `[?]` di
  bagian akhir.
- **Keselarasan ditambahkan.** Ini inti revisi dosen pembimbing dan sebelumnya
  tidak disebut sama sekali pada analisis sistem usulan.

### 1.2 Paragraf modul Random Forest

Cari kalimat: *"untuk memprediksi probabilitas kesesuaian jalur karier dan
mengestimasi masa tunggu kerja mereka"* (paragraf [640]). Ganti seluruh
butirnya:

> **Modul Analitik Pendukung (Random Forest).** Modul ini melengkapi analitik
> deskriptif pada dasbor dengan analisis klasifikasi atas data historis
> lulusan. Algoritma *Random Forest* [?] dilatih secara luring terhadap data
> gudang data untuk mengklasifikasikan pemenuhan Indikator Kinerja Utama
> pertama, yaitu perolehan pekerjaan dalam rentang kurang dari enam bulan sejak
> kelulusan. Keluaran pelatihan berupa nilai capaian validasi silang dan
> peringkat kepentingan variabel (*feature importance*) disajikan pada dasbor
> sebagai bahan pertimbangan program studi dalam menentukan prioritas pembinaan
> karier. Modul ini tidak digunakan untuk memprediksi keselarasan bidang
> pekerjaan, karena keselarasan telah diukur langsung dari jawaban kuesioner
> sebagaimana dijelaskan pada modul analitik multidimensi.

Yang berubah dan alasannya:

- **"probabilitas kesesuaian jalur karier" dihapus.** Butir 8 Ruang Lingkup yang
  sudah Anda revisi hanya menyanggupi satu variabel target. Kalimat lama
  membuat Bab 1 dan Bab 3 saling bertentangan di dokumen yang sama.
- **"Prediktif" diganti "Pendukung" pada nama modul.** Sesuai posisi Random
  Forest dalam penelitian ini: teknik pendukung di dalam modul analitik, bukan
  metode utama sejajar OLAP dan NLP.
- **"dilatih secara luring" ditambahkan.** Ini yang benar-benar terjadi. Kalau
  Anda memilih Jalan B, kalimat ini yang berubah.

### 1.3 Paragraf modul NLP

Cari kalimat: *"rekomendasi lowongan pekerjaan yang secara semantik paling
relevan"* (paragraf [641]). Ganti seluruh butirnya:

> **Modul Rekomendasi Pekerjaan (NLP).** Modul ini menerima masukan teks bebas
> berisi keahlian dan pengalaman alumni, lalu mencocokkannya dengan set data
> lowongan pekerjaan yang dikelola Admin. Teks masukan dan deskripsi lowongan
> lebih dahulu melalui prapemrosesan berupa penormalan huruf, pembuangan tanda
> baca, dan penyaringan kata henti (*stopword*), kemudian direpresentasikan
> sebagai vektor berbobot *Term Frequency–Inverse Document Frequency* (TF-IDF)
> [?]. Tingkat kemiripan antara vektor profil alumni dan vektor tiap lowongan
> dihitung menggunakan *Cosine Similarity*, dan lowongan diurutkan menurun
> berdasarkan nilai kemiripan tersebut. Perhitungan ini bekerja pada tingkat
> kemunculan dan bobot kata, sehingga sistem tidak melakukan penguraian makna
> kalimat maupun pengenalan entitas bernama.

Yang berubah dan alasannya:

- **"secara semantik paling relevan" dihapus.** TF-IDF dan *Cosine Similarity*
  membandingkan bobot kemunculan kata, bukan makna. Mengklaim kemampuan
  semantik akan gugur pada pertanyaan pertama penguji, dan mudah dibuktikan
  salah cukup dengan mencari sinonim yang tidak muncul di teks lowongan.
- **Kalimat batas negatif ditambahkan di akhir.** Menyatakan sendiri batasnya
  jauh lebih kuat daripada dibongkar penguji.

---

## 2. Tabel 3.2 — Perbandingan Sistem Berjalan dan Sistem Usulan

Tabel ini sudah sebagian diperbarui, tetapi **belum memuat satu baris pun
tentang keselarasan**, padahal itu revisi utama dosen pembimbing.

### 2.1 Tambahkan dua baris baru di akhir tabel

| Aspek | Sistem Berjalan | Sistem Usulan |
|---|---|---|
| Pengukuran keselarasan lulusan | Belum tersedia. Kesesuaian bidang kerja lulusan tidak pernah ditanyakan maupun direkapitulasi. | Kuesioner merekam hubungan bidang studi dengan bidang pekerjaan (lima tingkat) dan tingkat pendidikan yang paling sesuai dengan pekerjaan (empat tingkat). Sistem menurunkannya menjadi kategori keselarasan horizontal dan vertikal melalui dimensi konformasi pada gudang data. |
| Cakupan populasi laporan | Seluruh data lulusan yang pernah masuk, tanpa pembatasan tahun. | Perhitungan indikator dibatasi pada kohort *Tracer Study* TS-1 sampai TS-3. Data di luar jendela tetap tersimpan sebagai riwayat, tetapi tidak diikutsertakan dalam perhitungan Indikator Kinerja Utama. |

### 2.2 Periksa baris Random Forest yang sudah ada

Baris Random Forest pada tabel Anda saat ini menyebut target *"ketepatan waktu
kelulusan"*. Bagian 1.2 di atas menyebut target **pemenuhan IKU pertama**. Dua
target berbeda dalam satu bab.

Pilih satu, lalu samakan di **tiga tempat**: Ruang Lingkup butir 8, paragraf
[640], dan baris Tabel 3.2. Saran saya pakai **pemenuhan IKU pertama**, karena
itu yang menyambung ke tujuan penelitian dan ke laporan IKU yang dicetak
sistem. Model ketepatan waktu tetap boleh dilaporkan di Bab 4 sebagai
percobaan tambahan, dengan catatan keterbatasannya.

---

## 3. Gambar 3.2 — BPMN Sistem Usulan

### 3.1 Judul gambar salah

Cari teks kapsi: *"Diagram proses bisnis Sistem yang akan Berjalan (Current
System)"* (paragraf [662]). Gambar ini menggambarkan sistem **usulan**, tetapi
kapsinya menyebut sistem **berjalan**. Ganti menjadi:

> Gambar 3.2 Diagram Proses Bisnis Sistem yang Diusulkan (*Proposed System*)

Periksa juga kapsi Gambar 3.1 agar tidak menjadi kembar.

### 3.2 Paragraf penjelas

Cari kalimat: *"alumni memperoleh rekomendasi pekerjaan secara instan"*
(paragraf [665]). Kata "instan" adalah janji waktu tanggap yang tidak Anda ukur.
Ganti frasanya menjadi:

> alumni memperoleh daftar rekomendasi pekerjaan pada satu kali pengiriman
> formulir, tanpa perlu menunggu proses rekapitulasi manual oleh petugas

---

## 4. Use Case

### 4.1 Tabel 3.4 — deskripsi UC-02

Cari kalimat: *"Proses pengisian dan pembaruan data diri, rekam jejak
pekerjaan, dan kuesioner evaluasi kampus."* (paragraf [694]). Ganti menjadi:

> Proses pengisian dan pembaruan data diri serta kuesioner *Tracer Study*.
> Formulir bersifat bercabang: pertanyaan mengenai jabatan, bidang pekerjaan,
> hubungan bidang studi dengan pekerjaan, dan tingkat pendidikan yang paling
> sesuai hanya ditampilkan apabila alumni memilih status bekerja atau
> berwirausaha.

Alasan: percabangan ini menentukan mengapa `keselarasan_key` pada tabel fakta
boleh kosong. Tanpa disebut di sini, Kamus Data terlihat sembarangan
membolehkan NULL.

### 4.2 Tabel 3.4 — deskripsi UC-05

Cari kalimat: *"secara multidimensi (Drill-down, Roll-up)."* (paragraf [706]).
Ganti seluruh deskripsinya:

> Menampilkan dasbor analitik capaian lulusan. Pengguna dapat meringkas data
> menurut tahun kelulusan dan program studi (*roll-up*), menelusuri rincian
> program studi terhadap status kerja (*drill-down*), menyaring populasi
> menurut jendela kohort, serta melihat komposisi keselarasan horizontal dan
> vertikal lulusan yang bekerja.

### 4.3 Tabel 3.3 — Identifikasi Aktor

Nama peran pada Tabel 3.3 adalah **Admin, Alumni, Viewer**, sedangkan pada
paragraf [1026] dan beberapa tempat lain tertulis **Alumni, Staf, Pimpinan**.
Tiga kosakata untuk tiga peran yang sama.

Gunakan satu pasangan dan konsisten, misalnya:

> Admin (Staf Program Studi) — Alumni — Viewer (Pimpinan)

Sekali disebut lengkap seperti di atas pada Tabel 3.3, selanjutnya cukup pakai
**Admin**, **Alumni**, dan **Viewer** saja, karena itu yang tertulis di kolom
`role` basis data. Ganti seluruh kemunculan "Staf" dan "Pimpinan" yang berdiri
sendiri.

---

## 5. Tabel 3.6 — Skenario Use Case Dashboard OLAP

### 5.1 Langkah 4 menyebut dimensi yang tidak ada

Cari kalimat: *"membedah data tahun 2025 berdasarkan Kota"* (paragraf [754]).
Gudang data tidak memiliki dimensi lokasi. Dimensi yang ada hanya lima: waktu,
program studi, status kerja, alumni, dan keselarasan. Ganti langkah tersebut:

> Sistem menampilkan rincian data tahun kelulusan terpilih menurut program
> studi, lengkap dengan tabulasi silang program studi terhadap status kerja.

### 5.2 Langkah 5 menjanjikan kecepatan

Cari kalimat: *"memperbarui tampilan grafik secara instan."* (paragraf [755]).
Ganti menjadi:

> Sistem mengirimkan hasil agregasi dalam format JSON, dan antarmuka
> memperbarui komponen grafik sesuai data yang diterima.

### 5.3 Tambahkan satu langkah keselarasan

Sisipkan sebagai langkah setelahnya:

> Aktor memilih tab keselarasan. Sistem menampilkan komposisi keselarasan
> horizontal dan keselarasan vertikal untuk kohort yang sedang aktif, baik
> secara keseluruhan maupun per program studi, dengan penyebut berupa jumlah
> alumni yang bekerja.

---

## 6. Class Diagram dan Tabel 3.7

### 6.1 Masalahnya

Paragraf [760] menyebut enam kelas: `User`, `AlumniProfile`, `TracerData`,
`JobVacancy`, `JobMatcher`, `OlapAnalytics`. Empat dari enam tidak sesuai kode:

| Ditulis di laporan | Keadaan di kode |
|---|---|
| `TracerData` sebagai kelas terpisah | Tidak ada. Seluruh atribut *tracer* (status kerja, masa tunggu, gaji, jabatan, bidang pekerjaan, kesesuaian bidang, tingkat pendidikan sesuai) berada di dalam tabel `alumni_profiles`, jadi di dalam kelas `AlumniProfile` |
| `JobVacancy` | Nama kelasnya `Lowongan` (`backend/app/Models/Lowongan.php`) |
| `JobMatcher` dengan `analyzeQuery()` | Nama kelasnya `TfIdfService` (`backend/app/Services/TfIdfService.php`) |
| `OlapAnalytics` dengan `getDrillDownData()` dan `getRollUpData()` | Tidak ada kelas ini. Agregasi dikerjakan `AlumniController::olapStats()` dan `AlumniController::olapData()` |

Relasi *one-to-one* `User → AlumniProfile → TracerData` pada paragraf [761]
juga hanya benar separuh: `User → AlumniProfile` memang *one-to-one*
(`$table->unique('user_id')` pada migrasinya), tetapi rantai ketiganya tidak
ada.

### 6.2 Paragraf pengganti [760]–[761]

> Perancangan diagram kelas pada sistem ini memetakan kelas-kelas utama yang
> menyusun logika peladen beserta relasinya. Kelas `User` menyimpan kredensial
> dan peran otorisasi pengguna. Kelas `AlumniProfile` menyimpan biodata,
> riwayat akademik, sekaligus seluruh atribut hasil pengisian kuesioner
> *Tracer Study*, dan berelasi satu-ke-satu dengan `User`. Kelas `Lowongan`
> menyimpan data bursa kerja yang dikelola Admin. Pemrosesan bahasa alami
> ditangani kelas layanan `TfIdfService`, sedangkan pemindahan data dari basis
> data operasional ke gudang data ditangani kelas layanan `EtlService`. Kelas
> `AlumniController` bertindak sebagai pengendali yang menyediakan titik akhir
> agregasi analitik. Struktur gudang data direpresentasikan oleh kelas model
> `DimAlumni`, `DimProgramStudi`, `DimWaktu`, `DimStatusKerja`,
> `DimKeselarasan`, dan `FactTracerAlumni`.
>
> Pemilihan struktur ini menempatkan seluruh atribut kuesioner pada satu kelas
> `AlumniProfile`, bukan pada kelas transaksi terpisah, karena setiap alumni
> hanya memiliki satu rekaman *Tracer Study* aktif yang diperbarui, bukan
> banyak rekaman berulang.

Catatan: bila Anda ingin menyimpan **riwayat** pengisian kuesioner (satu alumni
banyak rekaman lintas tahun), kelas transaksi terpisah justru diperlukan. Itu
perubahan rancangan, bukan perubahan naskah. Untuk sidang sekarang, tulis apa
yang ada.

### 6.3 Tabel 3.7 — Deskripsi Kelas pengganti

Ganti seluruh isi tabel:

| Nama Kelas | Jenis | Atribut / Metode Utama | Keterangan |
|---|---|---|---|
| `User` | Model | `name`, `email`, `password`, `role` | Menyimpan kredensial dan peran otorisasi (`admin`, `alumni`, `viewer`). Otentikasi memakai Laravel Sanctum. |
| `AlumniProfile` | Model | `nama`, `jenjang`, `program_studi`, `tahun_masuk`, `tahun_lulus`, `ipk`, `status_bekerja`, `masa_tunggu_bulan`, `gaji_juta`, `jabatan`, `bidang_pekerjaan`, `kesesuaian_bidang`, `tingkat_pendidikan_sesuai` | Menyimpan biodata, riwayat akademik, dan seluruh jawaban kuesioner *Tracer Study*. Berelasi satu-ke-satu dengan `User`. |
| `Lowongan` | Model | `judul_posisi`, `perusahaan`, `lokasi`, `deskripsi`, `keahlian`, `aktif` | Menyimpan set data lowongan pekerjaan yang dikelola Admin dan menjadi pembanding pada proses pencocokan. |
| `TfIdfService` | Layanan | `cari()`, `skorKombinasi()` | Melakukan prapemrosesan teks, pembobotan TF-IDF, dan perhitungan *Cosine Similarity* antara profil alumni dan deskripsi lowongan, lalu mengurutkan hasilnya. |
| `EtlService` | Layanan | `loadStagingFromCsv()`, `mergeProfilesToStaging()`, `rebuildStarSchema()`, `syncProfile()` | Memindahkan data dari basis data operasional dan berkas CSV ke area staging, lalu membangun ulang tabel dimensi dan tabel fakta pada gudang data. |
| `AlumniController` | Pengendali | `index()`, `olapStats()`, `olapData()`, `saveProfile()`, `unduhLaporan()` | Menyediakan titik akhir REST API untuk data alumni, agregasi OLAP pada skema bintang, penyimpanan kuesioner, dan pencetakan laporan IKU. |
| `FactTracerAlumni` | Model | `alumni_key`, `prodi_key`, `waktu_key`, `status_key`, `keselarasan_key`, `ipk`, `masa_tunggu_bulan`, `gaji_juta` | Merepresentasikan tabel fakta pada skema bintang. Menyimpan kunci asing ke lima dimensi beserta ukuran numeriknya. |
| `DimKeselarasan` | Model | `hubungan_bidang`, `kategori_horizontal`, `tingkat_pendidikan_sesuai`, `kategori_vertikal` | Dimensi konformasi berisi dua puluh baris, yaitu seluruh kombinasi lima tingkat hubungan bidang dengan empat tingkat kesesuaian pendidikan. |

Seluruh nama kelas dan metode pada tabel di atas saya ambil langsung dari
berkas kodenya, jadi tidak perlu Anda periksa lagi. `TfIdfService` memiliki dua
metode publik, yaitu `cari()` dan `skorKombinasi()`; `EtlService` memiliki
empat, yaitu `syncProfile()`, `loadStagingFromCsv()`,
`mergeProfilesToStaging()`, dan `rebuildStarSchema()`.

**Gambar 3.4 harus digambar ulang** mengikuti tabel di atas. Kotak `TracerData`
dihapus, atributnya dipindah ke `AlumniProfile`; `JobVacancy` → `Lowongan`;
`JobMatcher` → `TfIdfService`; `OlapAnalytics` → `AlumniController` +
`FactTracerAlumni`.

---

## 7. Sequence Diagram

### 7.1 Gambar 3.7 — Kuesioner dan Job Matching

Cari kalimat: *"Jika proses ekstraksi kompetensi berhasil"* (paragraf [799]).
Frasa "ekstraksi kompetensi" menyiratkan sistem mengenali kompetensi sebagai
entitas. Yang terjadi adalah pembobotan kata. Ganti klausanya menjadi:

> Apabila pembobotan TF-IDF dan perhitungan *Cosine Similarity* selesai
> dijalankan dan peladen mengembalikan kode 200 (OK)

### 7.2 Gambar 3.8 — ganti seluruh subbab

Judul dan seluruh isi subbab *Sequence Diagram Eksekusi Prediksi Karier*
(paragraf [800]–[804]) mengacu pada kelas yang tidak ada. Ganti judulnya
menjadi **Sequence Diagram Pelatihan dan Penyajian Model Klasifikasi**, lalu
ganti kedua paragrafnya:

> Proses klasifikasi pemenuhan Indikator Kinerja Utama dijalankan sebagai
> analisis luring yang terpisah dari siklus permintaan pengguna. Skenario ini
> menggambarkan urutan interaksi sejak data gudang data diambil sampai hasil
> pelatihan ditampilkan pada dasbor.
>
> *(setelah Gambar 3.8)*
>
> Berdasarkan Gambar 3-8, proses diawali oleh Admin yang menjalankan skrip
> pelatihan. Skrip membaca himpunan data lulusan dari gudang data, membentuk
> variabel target berupa pemenuhan Indikator Kinerja Utama pertama, lalu
> melatih pengklasifikasi *Random Forest* dengan skema validasi silang
> berlapis. Hasil pelatihan berupa nilai capaian tiap lipatan, matriks
> kekeliruan, dan peringkat kepentingan variabel disimpan sebagai berkas JSON.
> Ketika Admin membuka dasbor, antarmuka React.js memuat berkas hasil tersebut
> dan menyajikannya sebagai panel capaian model beserta diagram batang
> kepentingan variabel. Dengan demikian, dasbor menampilkan ringkasan hasil
> pelatihan model, bukan memanggil model untuk setiap alumni secara satuan.

Kalimat terakhir itu penting. Ia menutup pertanyaan "kapan modelnya jalan?"
sebelum ditanyakan.

### 7.3 Gambar 3.9 — Pemrosesan Analitik OLAP

Cari kalimat: *"permintaan agregasi pemotongan data (slice and dice) ke Data
Warehouse"* (paragraf [806]). Ganti paragrafnya:

> Proses analitik OLAP memfasilitasi Admin dan Viewer dalam memantau capaian
> Indikator Kinerja Utama secara interaktif. Pada skenario ini, aplikasi
> mengirimkan permintaan agregasi bertingkat ke gudang data dan menerima
> hasilnya dalam bentuk himpunan ringkasan.

Lalu cari kalimat: *"merender ulang (re-render) komponen visualisasi grafik
secara real-time."* (paragraf [809]). Ganti seluruh paragrafnya:

> Berdasarkan Gambar 3-9, aktor Admin memilih parameter penyaring pada
> `DashboardView`, misalnya rentang tahun kelulusan kohort atau program studi.
> Permintaan dikirim ke peladen melalui metode HTTP GET menuju titik akhir
> `/api/stats/olap`. Pengendali `AlumniController` menjalankan metode
> `olapStats()` yang mengeksekusi kueri agregasi `GROUP BY` terhadap tabel
> fakta beserta lima tabel dimensinya, termasuk perhitungan komposisi
> keselarasan horizontal dan vertikal untuk alumni yang bekerja. Apabila kueri
> berhasil dan peladen mengembalikan kode 200 (OK), aplikasi React.js
> memperbarui *state* dan merender ulang komponen visualisasi grafik sesuai
> data yang diterima.

Perhatikan: nama titik akhir `/api/stats/olap` dan metode `olapStats()` saya
ambil langsung dari `backend/routes/api.php`, jadi keduanya benar.

---

## 8. Activity Diagram

### 8.1 Gambar 3.10 — Pengisian Kuesioner dan Job Matching

Paragraf [817] sudah cukup baik secara struktur, tetapi belum memuat
percabangan kuesioner yang menjadi inti revisi. Ganti kalimat setelah *"Jika
valid, aliran proses terpecah..."* — atau ganti seluruh paragrafnya:

> Berdasarkan Gambar 3-10, proses diawali (*initial node*) ketika alumni
> mengisi formulir kuesioner. Sistem memvalidasi masukan pada simpul keputusan
> pertama; apabila tidak valid, aliran kembali ke formulir. Aliran kemudian
> memasuki simpul keputusan kedua yang memeriksa status kerja alumni. Apabila
> status yang dipilih adalah bekerja atau berwirausaha, sistem menampilkan dan
> mewajibkan pengisian pertanyaan lanjutan mengenai jabatan, bidang pekerjaan,
> hubungan bidang studi dengan pekerjaan, serta tingkat pendidikan yang paling
> sesuai dengan pekerjaan tersebut. Apabila status yang dipilih bukan keduanya,
> pertanyaan lanjutan dilewati dan atribut keselarasan dibiarkan kosong. Setelah
> data tersimpan, aliran terpecah menjadi dua jalur paralel melalui *fork
> node*: jalur pertama menyimpan data ke basis data operasional, sedangkan
> jalur kedua menjalankan prapemrosesan teks, pembobotan TF-IDF, dan
> perhitungan *Cosine Similarity* terhadap set data lowongan. Kedua jalur
> bertemu kembali pada *join node* untuk menampilkan hasil rekomendasi di
> antarmuka klien.

**Gambar 3.10 harus digambar ulang** dengan menambahkan simpul keputusan kedua
tersebut. Ini gambar yang paling penting untuk membuktikan revisi keselarasan
sudah masuk ke rancangan, bukan hanya ke prosa.

### 8.2 Gambar 3.11 — Eksekusi Prediksi Karier

Ganti judul menjadi **Activity Diagram Pelatihan Model Klasifikasi Random
Forest**, lalu ganti paragraf [819] dan [822]:

> Skenario ini merinci tahapan komputasi saat sistem melatih pengklasifikasi
> atas data historis lulusan.
>
> *(setelah Gambar 3.11)*
>
> Berdasarkan Gambar 3-11, aktivitas dimulai dengan pembacaan himpunan data
> lulusan dari gudang data. Sistem membentuk variabel target berupa pemenuhan
> Indikator Kinerja Utama pertama, lalu melakukan penyandian variabel kategorik
> menjadi representasi numerik. Data kemudian dibagi menurut skema validasi
> silang berlapis. Pada setiap lipatan, sistem membangun sejumlah pohon
> keputusan atas cuplikan data dan cuplikan variabel yang berbeda-beda, lalu
> menetapkan kelas akhir melalui pemungutan suara terbanyak (*majority
> voting*). Nilai capaian tiap lipatan dihimpun menjadi rata-rata beserta
> simpangan bakunya. Status terminasi (*final node*) dicapai setelah ringkasan
> capaian dan peringkat kepentingan variabel ditulis ke berkas hasil yang
> dibaca dasbor.

### 8.3 Gambar 3.12 — Pemrosesan Analitik OLAP

Cari kalimat: *"misalnya operasi Slice untuk memotong data berdasarkan prodi
tertentu, atau Roll-up untuk melihat rekapitulasi tahunan"* (paragraf [827]).
Ganti klausanya menjadi:

> misalnya operasi *roll-up* untuk melihat rekapitulasi menurut tahun kelulusan,
> atau *drill-down* untuk menelusuri rincian program studi terhadap status kerja

Sisa paragrafnya boleh tetap.

---

## 9. Entity Relationship Diagram

### 9.1 Paragraf [836] — nama DBMS

Cari kalimat: *"diimplementasikan menggunakan sistem manajemen basis data
MySQL"*. Ganti "MySQL" menjadi "PostgreSQL" **hanya bila migrasi sudah
dijalankan**. Bila belum, biarkan MySQL dan jangan menulis PostgreSQL di Bab 1.
Kedua bab harus menyebut DBMS yang sama.

### 9.2 Paragraf [838]–[848] — daftar entitas

Tiga dari lima entitas yang didaftar **tidak ada tabelnya**: `Kuesioner_Tracer`,
`Lowongan_Kerja`, dan `Log_Prediksi`. Saya memeriksa seluruh berkas migrasi di
`backend/database/migrations/` — tidak satu pun membuat ketiganya.

Ganti seluruh daftar entitas menjadi:

> - **Entitas `users`** — tabel otentikasi utama yang menyimpan nama, alamat
>   surel, kata sandi terenkripsi, dan peran otorisasi (`admin`, `alumni`,
>   `viewer`) bagi seluruh pengguna sistem.
>
> - **Entitas `alumni_profiles`** — menyimpan biodata, riwayat akademik
>   (jenjang, program studi, tahun masuk, tahun lulus, indeks prestasi
>   kumulatif), sekaligus seluruh jawaban kuesioner *Tracer Study* berupa
>   status kerja, masa tunggu, penghasilan, jabatan, bidang pekerjaan,
>   hubungan bidang studi dengan pekerjaan, dan tingkat pendidikan yang paling
>   sesuai. Entitas ini berelasi satu-ke-satu dengan `users`.
>
> - **Entitas `lowongans`** — tabel induk yang dikelola Admin untuk menyimpan
>   set data lowongan pekerjaan beserta deskripsi persyaratannya. Data pada
>   entitas ini menjadi pembanding pada proses pencocokan TF-IDF.
>
> - **Entitas `career_analyses`** — menyimpan riwayat pengiriman teks profil
>   alumni beserta hasil analisisnya, dan berelasi satu-ke-banyak dengan
>   `users`.
>
> - **Entitas `career_chat_messages`** — menyimpan riwayat percakapan tanya
>   jawab karier, dan berelasi satu-ke-banyak dengan `career_analyses`.
>
> - **Entitas `search_logs`** — mencatat kueri pencarian kerja yang dijalankan
>   pengguna beserta jumlah hasil yang dikembalikan, sebagai bahan evaluasi
>   pemanfaatan fitur.

### 9.3 Paragraf [850] — klaim normalisasi

Kalimat *"menerapkan kaidah normalisasi basis data hingga bentuk normal ketiga
(3NF)"* berlaku untuk basis data operasional, tetapi **tidak** untuk gudang
data — skema bintang justru sengaja tidak dinormalkan. Tambahkan kalimat
penutup agar tidak dibaca sebagai berlaku untuk keduanya:

> Kaidah normalisasi ini diterapkan pada basis data operasional. Pada gudang
> data, dimensi sengaja dirancang dalam bentuk yang tidak dinormalkan sesuai
> kelaziman skema bintang, dengan tujuan mengurangi jumlah operasi penggabungan
> tabel pada kueri agregasi [?].

**Gambar 3.3 (ERD) harus digambar ulang** dengan enam entitas di atas.

---

## 10. Kamus Data — basis data operasional

### 10.1 Perbaiki salah ketik pada kalimat pembuka

Cari kalimat: *"kamus data untuk basis data operasional (OLAP)"* (paragraf
[854]). Basis data operasional adalah **OLTP**, bukan OLAP. Ganti menjadi
`(OLTP)`. Kesalahan ini persis membalik istilah yang menjadi judul penelitian
Anda — ini yang pertama dilihat penguji.

Sekalian, pada paragraf [852] terdapat *"Database Management System (DBMS)
MySQL"*. Samakan dengan keputusan di bagian 9.1.

### 10.2 Tabel 3.8 `users` — ganti isi

Kolom `username` tidak ada. Sistem masuk memakai `email`.

| Nama Field | Tipe Data | Ukuran | Keterangan |
|---|---|---|---|
| id | BigInt | 20 | *Primary Key*, *Auto Increment* |
| name | Varchar | 255 | Nama pengguna |
| email | Varchar | 255 | *Unique*, dipakai sebagai kredensial masuk |
| email_verified_at | Timestamp | — | Waktu verifikasi surel, boleh kosong |
| password | Varchar | 255 | Kata sandi terenkripsi Bcrypt |
| role | Enum | — | Nilai: `admin`, `alumni`, `viewer`; bawaan `viewer` |
| remember_token | Varchar | 100 | Token sesi "ingat saya", boleh kosong |
| created_at | Timestamp | — | Waktu data dibuat |
| updated_at | Timestamp | — | Waktu data terakhir diubah |

### 10.3 Tabel 3.9 `alumni_profiles` — ganti seluruh isi

Tabel lama hanya memuat tujuh kolom dan tidak satu pun kolom keselarasan.

| Nama Field | Tipe Data | Ukuran | Keterangan |
|---|---|---|---|
| id | BigInt | 20 | *Primary Key*, *Auto Increment* |
| user_id | BigInt | 20 | *Foreign Key* ke `users`, *Unique* (relasi satu-ke-satu) |
| nama | Varchar | 100 | Nama lengkap alumni |
| gender | Char | 1 | `L` atau `P` |
| jenjang | Enum | — | Nilai: `D3`, `S1` |
| program_studi | Varchar | 50 | Program studi asal alumni |
| specialisasi | Varchar | 50 | Peminatan program studi |
| pengalaman_kerja | Varchar | 10 | Pengalaman kerja semasa kuliah (`Ya`/`Tidak`) |
| tahun_masuk | SmallInt | — | Tahun masuk kuliah |
| tahun_lulus | SmallInt | — | Tahun kelulusan |
| tanggal_lulus | Date | — | Tanggal kelulusan, boleh kosong |
| tanggal_mulai_bekerja | Date | — | Tanggal mulai bekerja, boleh kosong |
| ipk | Decimal | 3,2 | Indeks Prestasi Kumulatif |
| status_bekerja | Varchar | 60 | Status kegiatan lulusan saat ini |
| jabatan | Varchar | 100 | Nama jabatan/posisi, boleh kosong |
| bidang_pekerjaan | Varchar | 100 | Bidang usaha tempat bekerja, boleh kosong |
| kesesuaian_bidang | Varchar | 50 | Hubungan bidang studi dengan pekerjaan (lima tingkat), boleh kosong |
| tingkat_pendidikan_sesuai | Varchar | 50 | Tingkat pendidikan yang paling sesuai dengan pekerjaan (empat tingkat), boleh kosong |
| masa_tunggu_bulan | SmallInt | — | Masa tunggu memperoleh pekerjaan dalam bulan, boleh kosong |
| gaji_juta | Decimal | 5,1 | Penghasilan per bulan dalam juta rupiah, boleh kosong |
| lulus_tepat_waktu | Boolean | — | Penanda kelulusan tepat waktu |
| created_at | Timestamp | — | Waktu data dibuat |
| updated_at | Timestamp | — | Waktu data terakhir diubah |

Tambahkan satu kalimat tepat di bawah tabel:

> Empat atribut terakhir yang berkaitan dengan pekerjaan — `jabatan`,
> `bidang_pekerjaan`, `kesesuaian_bidang`, dan `tingkat_pendidikan_sesuai` —
> dirancang boleh kosong (*nullable*) karena pertanyaan yang menghasilkannya
> hanya ditampilkan kepada alumni berstatus bekerja atau berwirausaha,
> sebagaimana dijelaskan pada skenario UC-02.

### 10.4 Tabel 3.10 `kuesioner_tracers` — hapus

Tabel ini tidak ada. Seluruh atributnya sudah berada di `alumni_profiles`.
Selain itu, kolom `keselarasan_bidang TinyInt (1=Selaras, 0=Tidak Selaras)`
yang tertulis di sana **bertentangan langsung dengan revisi dosen**: keselarasan
bukan nilai benar/salah, melainkan lima tingkat hubungan bidang dan empat
tingkat kesesuaian pendidikan. Membiarkan tabel ini berarti mempertahankan
rancangan yang sudah direvisi.

Hapus subbabnya, lalu **nomori ulang** tabel-tabel setelahnya.

### 10.5 Tabel 3.11 → `lowongans`

Nama tabelnya `lowongans`, bukan `lowongan_kerjas`. Kolom `vektor_kompetensi`
juga tidak ada — vektor TF-IDF dihitung saat permintaan berjalan, tidak
disimpan.

| Nama Field | Tipe Data | Ukuran | Keterangan |
|---|---|---|---|
| id | BigInt | 20 | *Primary Key*, *Auto Increment* |
| judul_posisi | Varchar | 255 | Nama posisi pekerjaan |
| perusahaan | Varchar | 255 | Nama perusahaan perekrut |
| lokasi | Varchar | 255 | Lokasi penempatan |
| gaji_min | SmallInt | — | Batas bawah penawaran gaji (juta rupiah), boleh kosong |
| gaji_max | SmallInt | — | Batas atas penawaran gaji (juta rupiah), boleh kosong |
| deskripsi | Text | — | Deskripsi kualifikasi dan persyaratan (teks bebas) |
| keahlian | JSON | — | Daftar keahlian yang disyaratkan |
| sumber_url | Varchar | 255 | Tautan sumber lowongan, boleh kosong |
| terverifikasi_pada | Timestamp | — | Waktu verifikasi oleh Admin, boleh kosong |
| aktif | Boolean | — | Penanda lowongan masih dibuka; bawaan `true` |
| created_at | Timestamp | — | Waktu data dibuat |
| updated_at | Timestamp | — | Waktu data terakhir diubah |

### 10.6 Tabel 3.12 `log_prediksis` — hapus

Tabel ini tidak pernah dibuat. Kolomnya (`probabilitas_keselarasan`,
`estimasi_masa_tunggu`) juga menjanjikan dua target prediksi yang sudah
dihapus dari Ruang Lingkup.

Gantikan dengan tiga tabel yang benar-benar ada:

**Tabel `career_analyses`**

| Nama Field | Tipe Data | Ukuran | Keterangan |
|---|---|---|---|
| id | BigInt | 20 | *Primary Key*, *Auto Increment* |
| user_id | BigInt | 20 | *Foreign Key* ke `users` |
| linkedin_url | Varchar | 255 | Tautan profil LinkedIn, boleh kosong |
| profile_text | LongText | — | Teks profil pengalaman dan pendidikan alumni |
| analysis | JSON | — | Hasil analisis yang dikembalikan sistem, boleh kosong |
| created_at | Timestamp | — | Waktu data dibuat |
| updated_at | Timestamp | — | Waktu data terakhir diubah |

**Tabel `career_chat_messages`**

| Nama Field | Tipe Data | Ukuran | Keterangan |
|---|---|---|---|
| id | BigInt | 20 | *Primary Key*, *Auto Increment* |
| career_analysis_id | BigInt | 20 | *Foreign Key* ke `career_analyses` |
| user_id | BigInt | 20 | *Foreign Key* ke `users` |
| role | Enum | — | Nilai: `user`, `assistant` |
| content | LongText | — | Isi pesan percakapan |
| created_at | Timestamp | — | Waktu data dibuat |
| updated_at | Timestamp | — | Waktu data terakhir diubah |

**Tabel `search_logs`**

| Nama Field | Tipe Data | Ukuran | Keterangan |
|---|---|---|---|
| id | BigInt | 20 | *Primary Key*, *Auto Increment* |
| user_id | BigInt | 20 | *Foreign Key* ke `users`, boleh kosong |
| query | Varchar | 255 | Kata kunci pencarian yang dimasukkan pengguna |
| jumlah_hasil | Int | — | Jumlah lowongan yang dikembalikan; bawaan 0 |
| kategori_deteksi | Varchar | 255 | Kategori bidang yang terdeteksi dari kueri, boleh kosong |
| created_at | Timestamp | — | Waktu data dibuat |
| updated_at | Timestamp | — | Waktu data terakhir diubah |

---

## 11. Subbab baru — Kamus Data Gudang Data

Sisipkan sebagai subbab baru setelah Kamus Data basis data operasional. **Ini
bagian yang paling penting untuk menjawab revisi dosen**, karena di sinilah
struktur keselarasan terlihat, dan sampai sekarang Bab 3 sama sekali tidak
memuatnya — padahal seluruh Bab 4 berpijak di atasnya.

### Paragraf pembuka

> Selain basis data operasional, sistem ini memiliki gudang data yang disusun
> mengikuti pola skema bintang. Gudang data dibangun melalui proses *Extract,
> Transform, Load* (ETL) yang membaca data dari basis data operasional dan
> berkas masukan, menempatkannya lebih dahulu pada tabel *staging*, lalu
> membangun ulang tabel dimensi dan tabel fakta. Pemisahan ini menjaga agar
> beban kueri agregasi tidak mengganggu operasi transaksional harian [?].
> Berikut spesifikasi kamus data untuk area *staging*, lima tabel dimensi, dan
> satu tabel fakta.

### Tabel `staging_alumni`

| Nama Field | Tipe Data | Ukuran | Keterangan |
|---|---|---|---|
| id | Int | — | *Primary Key*, identitas asal dari sumber data |
| nama | Varchar | 100 | Nama alumni |
| gender | Char | 1 | `L` atau `P` |
| jenjang | Enum | — | Nilai: `D3`, `S1`; boleh kosong |
| tahun_masuk | SmallInt | — | Tahun masuk kuliah, boleh kosong |
| program_studi | Varchar | 30 | Program studi asal |
| specialisasi | Varchar | 20 | Peminatan program studi |
| pengalaman_kerja | Varchar | 10 | Pengalaman kerja semasa kuliah |
| tahun_lulus | SmallInt | — | Tahun kelulusan |
| jabatan | Varchar | 100 | Nama jabatan, boleh kosong |
| bidang_pekerjaan | Varchar | 100 | Bidang usaha, boleh kosong |
| kesesuaian_bidang | Varchar | 50 | Hubungan bidang studi dengan pekerjaan, boleh kosong |
| tingkat_pendidikan_sesuai | Varchar | 50 | Tingkat pendidikan yang paling sesuai, boleh kosong |
| ipk | Decimal | 3,2 | Indeks Prestasi Kumulatif |
| status_bekerja | Varchar | 60 | Status kegiatan lulusan |
| masa_tunggu_bulan | SmallInt | — | Masa tunggu dalam bulan, boleh kosong |
| gaji_juta | Decimal | 5,1 | Penghasilan per bulan, boleh kosong |

### Tabel `dim_alumni`

| Nama Field | Tipe Data | Ukuran | Keterangan |
|---|---|---|---|
| alumni_key | BigInt | 20 | *Primary Key*, kunci pengganti (*surrogate key*) |
| id_sumber | Int | — | *Unique*, identitas asal pada sumber data |
| nama | Varchar | 100 | Nama alumni |
| gender | Char | 1 | `L` atau `P` |
| jenjang | Varchar | 5 | Jenjang pendidikan, boleh kosong |
| tahun_masuk | SmallInt | — | Tahun masuk kuliah, boleh kosong |
| jabatan | Varchar | 100 | Nama jabatan, boleh kosong |
| bidang_pekerjaan | Varchar | 100 | Bidang usaha, boleh kosong |
| kesesuaian_bidang | Varchar | 50 | Hubungan bidang studi dengan pekerjaan, boleh kosong |
| tingkat_pendidikan_sesuai | Varchar | 50 | Tingkat pendidikan yang paling sesuai, boleh kosong |

### Tabel `dim_program_studi`

| Nama Field | Tipe Data | Ukuran | Keterangan |
|---|---|---|---|
| prodi_key | BigInt | 20 | *Primary Key*, kunci pengganti |
| program_studi | Varchar | 30 | Nama program studi |
| specialisasi | Varchar | 20 | Peminatan program studi |

Batasan *unique* gabungan berlaku pada (`program_studi`, `specialisasi`).

### Tabel `dim_waktu`

| Nama Field | Tipe Data | Ukuran | Keterangan |
|---|---|---|---|
| waktu_key | BigInt | 20 | *Primary Key*, kunci pengganti |
| tahun_lulus | SmallInt | — | *Unique*, tahun kelulusan |
| dekade | Varchar | 10 | Kelompok dasawarsa, misalnya `2020s`; boleh kosong |

### Tabel `dim_status_kerja`

| Nama Field | Tipe Data | Ukuran | Keterangan |
|---|---|---|---|
| status_key | BigInt | 20 | *Primary Key*, kunci pengganti |
| status_bekerja | Varchar | 60 | *Unique*, status kegiatan lulusan |
| kategori_penghasilan | Varchar | 20 | `Berpenghasilan` atau `Tidak Berpenghasilan` |

### Tabel `dim_keselarasan`

| Nama Field | Tipe Data | Ukuran | Keterangan |
|---|---|---|---|
| keselarasan_key | BigInt | 20 | *Primary Key*, kunci pengganti |
| hubungan_bidang | Varchar | 50 | Lima tingkat: `Sangat erat`, `Erat`, `Cukup erat`, `Kurang erat`, `Tidak sama sekali` |
| kategori_horizontal | Varchar | 20 | `Selaras` atau `Tidak Selaras` |
| tingkat_pendidikan_sesuai | Varchar | 50 | Empat tingkat: `Setingkat lebih tinggi`, `Tingkat yang sama`, `Setingkat lebih rendah`, `Tidak perlu pendidikan tinggi` |
| kategori_vertikal | Varchar | 20 | `Tinggi`, `Sama`, atau `Rendah` |

Tambahkan paragraf penjelas di bawahnya:

> Tabel `dim_keselarasan` berisi dua puluh baris tetap, yaitu seluruh kombinasi
> lima tingkat hubungan bidang dengan empat tingkat kesesuaian pendidikan.
> Batasan *unique* gabungan berlaku pada (`hubungan_bidang`,
> `tingkat_pendidikan_sesuai`) sehingga tidak mungkin terjadi kombinasi ganda.
> Kolom `kategori_horizontal` dan `kategori_vertikal` merupakan pengelompokan
> yang sudah ditetapkan pada saat dimensi dibentuk, bukan dihitung ulang pada
> setiap kueri. Dengan demikian, satu definisi keselarasan berlaku sama di
> seluruh laporan, dan perubahan definisi cukup dilakukan pada satu tempat.

### Tabel `fact_tracer_alumni`

| Nama Field | Tipe Data | Ukuran | Keterangan |
|---|---|---|---|
| fact_key | BigInt | 20 | *Primary Key*, *Auto Increment* |
| alumni_key | BigInt | 20 | *Foreign Key* ke `dim_alumni` |
| prodi_key | BigInt | 20 | *Foreign Key* ke `dim_program_studi` |
| waktu_key | BigInt | 20 | *Foreign Key* ke `dim_waktu` |
| status_key | BigInt | 20 | *Foreign Key* ke `dim_status_kerja` |
| keselarasan_key | BigInt | 20 | *Foreign Key* ke `dim_keselarasan`, boleh kosong |
| pengalaman_kerja | Varchar | 10 | Dimensi merosot (*degenerate dimension*), bernilai `Ya`/`Tidak` |
| ipk | Decimal | 3,2 | Ukuran: Indeks Prestasi Kumulatif |
| masa_tunggu_bulan | SmallInt | — | Ukuran: masa tunggu dalam bulan, boleh kosong |
| gaji_juta | Decimal | 5,1 | Ukuran: penghasilan per bulan dalam juta rupiah, boleh kosong |

Tambahkan paragraf penjelas di bawahnya:

> Tabel fakta menyimpan lima kunci asing menuju tabel dimensi beserta tiga
> ukuran numerik. Kolom `keselarasan_key` dirancang boleh kosong karena
> indikator keselarasan hanya berlaku bagi alumni yang bekerja atau
> berwirausaha; baris fakta milik alumni berstatus lain tetap tercatat dengan
> nilai kunci tersebut kosong. Konsekuensinya, perhitungan persentase
> keselarasan menggunakan penyebut berupa jumlah baris fakta yang memiliki
> `keselarasan_key`, bukan seluruh baris fakta pada kohort. Kolom
> `pengalaman_kerja` disimpan langsung pada tabel fakta sebagai dimensi merosot
> karena hanya bernilai dua kemungkinan sehingga tidak memerlukan tabel dimensi
> tersendiri [?].

### Catatan pemetaan tipe data bila migrasi PostgreSQL dijalankan

Bila DBMS sudah berpindah ke PostgreSQL, sesuaikan kolom "Tipe Data" pada
seluruh tabel di atas:

| Ditulis sekarang | Padanan PostgreSQL |
|---|---|
| BigInt *Auto Increment* | `bigserial` (atau `bigint GENERATED BY DEFAULT AS IDENTITY`) |
| Int / SmallInt | `integer` / `smallint` |
| TinyInt | Tidak ada padanan; gunakan `smallint` atau `boolean` |
| Varchar(n) | `varchar(n)` |
| Text / LongText | `text` (PostgreSQL tidak membedakan panjangnya) |
| Enum | `varchar` dengan batasan `CHECK`, atau tipe `ENUM` buatan lewat `CREATE TYPE` |
| Decimal(p,s) | `numeric(p,s)` |
| Boolean / TinyInt(1) | `boolean` (asli, bukan bilangan) |
| Timestamp | `timestamp` |
| JSON | `jsonb` (disarankan, karena terindeks) |

Jangan menulis tabel bertipe MySQL sambil menyatakan sistem memakai PostgreSQL.
Ini termasuk perbedaan yang paling mudah ditemukan penguji.

---

## 12. Perancangan Antar Muka

### 12.1 Halaman Pengisian Kuesioner

Cari kalimat: *"Pengguna kemudian hanya perlu berinteraksi dengan elemen
dropdown dan radio button untuk melengkapi data dinamis seperti status
pekerjaan dan masa tunggu"* (paragraf [1035]). Ganti kalimat itu dan tambahkan
lanjutannya:

> Pengguna kemudian melengkapi data dinamis melalui elemen *dropdown* dan
> *radio button*, meliputi status kegiatan, masa tunggu memperoleh pekerjaan,
> dan rentang penghasilan. Apabila status yang dipilih adalah bekerja atau
> berwirausaha, antarmuka menampilkan bagian lanjutan berisi isian jabatan,
> bidang pekerjaan, pilihan hubungan bidang studi dengan pekerjaan dalam lima
> tingkat, serta pilihan tingkat pendidikan yang paling sesuai dengan pekerjaan
> dalam empat tingkat. Bagian lanjutan tersebut disembunyikan bagi alumni yang
> memilih status selain keduanya, sehingga jumlah pertanyaan yang dihadapi
> setiap responden menyesuaikan kondisinya.

### 12.2 Halaman Data Alumni

Cari kalimat: *"kolom pencarian terpadu (Global Search Bar) di bagian atas untuk
menyaring data secara real-time, serta kolom analitik khusus yang menampilkan
hasil proyeksi masa tunggu lulusan yang dikalkulasi oleh algoritma Random
Forest"* (paragraf [1047]). Ganti menjadi:

> kolom pencarian terpadu (*Global Search Bar*) di bagian atas untuk menyaring
> baris tabel tanpa memuat ulang halaman, serta kolom tambahan yang menampilkan
> jabatan, bidang pekerjaan, dan kategori keselarasan bagi alumni yang berstatus
> bekerja atau berwirausaha.

Dua alasan: "real-time" adalah istilah yang dihindari, dan kolom proyeksi masa
tunggu per alumni tidak ada — tidak ada layanan yang menghasilkannya.

### 12.3 Halaman Dashboard Analitik (OLAP)

Cari kalimat: *"operasi pemotongan data (Slice and Dice)"* dan *"secara instan
memperbarui (re-render)"* (paragraf [1051]). Ganti seluruh paragrafnya:

> Berdasarkan Gambar 3-18, antarmuka ini menyajikan visualisasi capaian lulusan
> untuk keperluan evaluasi institusi. Bagian atas layar memuat panel penyaring
> yang memungkinkan pengguna memilih rentang tahun kelulusan kohort maupun
> program studi. Perubahan penyaring memicu permintaan agregasi baru ke
> peladen, dan komponen grafik di bawahnya dirender ulang sesuai data yang
> diterima. Visualisasi yang disajikan meliputi bagan donat yang memetakan
> distribusi status kerja, bagan batang yang membandingkan rata-rata indeks
> prestasi kumulatif dan rentang penghasilan antar program studi, serta dua
> bagan keselarasan: bagan komposisi keselarasan horizontal yang membandingkan
> jumlah lulusan selaras dan tidak selaras, dan bagan bertumpuk keselarasan
> vertikal yang memetakan proporsi lulusan pada tingkat pekerjaan lebih tinggi,
> sama, dan lebih rendah dari jenjang pendidikannya. Panel ringkasan di bagian
> atas menampilkan jendela kohort yang sedang aktif beserta jumlah responden
> yang menjadi penyebut perhitungan.

### 12.4 Gambar 3.18 perlu digambar ulang

Rancangan antarmuka dasbor harus memperlihatkan dua bagan keselarasan dan
penanda kohort. Kalau gambar lama tidak memuatnya, penguji akan melihat revisi
dosen hanya masuk ke tulisan, bukan ke rancangan.

---

## Rekapitulasi perubahan

| No | Letak | Perubahan | Alasan |
|---|---|---|---|
| 1 | Paragraf [639] modul OLAP | Ganti seluruh butir | "slice-and-dice" dan "real-time" dihapus; rujukan [30] salah topik; keselarasan belum disebut |
| 2 | Paragraf [640] modul Random Forest | Ganti seluruh butir | Bertentangan dengan Ruang Lingkup butir 8 yang sudah direvisi |
| 3 | Paragraf [641] modul NLP | Ganti seluruh butir | Klaim pencocokan semantik tidak dapat dipertahankan pada TF-IDF |
| 4 | Tabel 3.2 | Tambah dua baris | Keselarasan dan jendela kohort belum muncul sama sekali |
| 5 | Tabel 3.2 baris Random Forest | Samakan target | Dua target berbeda dalam satu bab |
| 6 | Kapsi Gambar 3.2 | Ganti judul | Tertulis "Current System" untuk gambar sistem usulan |
| 7 | Paragraf [665] | Ganti frasa | "instan" adalah janji waktu tanggap yang tidak diukur |
| 8 | Tabel 3.4 UC-02 | Ganti deskripsi | Percabangan kuesioner adalah dasar `keselarasan_key` boleh kosong |
| 9 | Tabel 3.4 UC-05 | Ganti deskripsi | Belum menyebut kohort dan keselarasan |
| 10 | Tabel 3.3 dan seluruh bab | Satukan nama peran | Tiga kosakata untuk tiga peran yang sama |
| 11 | Tabel 3.6 langkah 4 | Ganti langkah | Menyebut dimensi Kota yang tidak ada |
| 12 | Tabel 3.6 langkah 5 | Ganti langkah | "instan" |
| 13 | Tabel 3.6 | Tambah satu langkah | Skenario keselarasan belum ada |
| 14 | Paragraf [760]–[761] | Ganti dua paragraf | Empat dari enam kelas tidak sesuai kode |
| 15 | Tabel 3.7 | Ganti seluruh isi | `TracerData` dan `OlapAnalytics` tidak ada; metode yang disebut tidak ada |
| 16 | Gambar 3.4 | Gambar ulang | Mengikuti Tabel 3.7 baru |
| 17 | Paragraf [799] | Ganti klausa | "ekstraksi kompetensi" menyiratkan pengenalan entitas |
| 18 | Subbab Sequence Diagram Prediksi | Ganti judul dan isi | `PredictionController` dan `RandomForestService` tidak ada di kode |
| 19 | Paragraf [806] dan [809] | Ganti dua paragraf | "slice and dice", "real-time", nama kelas keliru |
| 20 | Paragraf [817] | Ganti paragraf | Percabangan kuesioner belum ada |
| 21 | Gambar 3.10 | Gambar ulang | Perlu simpul keputusan status kerja |
| 22 | Subbab Activity Diagram Prediksi | Ganti judul dan isi | Menggambarkan alur runtutan yang tidak dijalankan sistem |
| 23 | Paragraf [827] | Ganti klausa | Menyebut operasi *Slice* yang tidak dibangun |
| 24 | Paragraf [836] | Sesuaikan nama DBMS | Harus sama dengan Bab 1 |
| 25 | Paragraf [838]–[848] | Ganti daftar entitas | Tiga dari lima entitas tidak punya tabel |
| 26 | Paragraf [850] | Tambah kalimat | 3NF tidak berlaku untuk skema bintang |
| 27 | Gambar 3.3 (ERD) | Gambar ulang | Mengikuti enam entitas yang benar |
| 28 | Paragraf [854] | `(OLAP)` → `(OLTP)` | Istilah terbalik, dan itu istilah judul penelitian |
| 29 | Tabel 3.8 `users` | Ganti isi | Kolom `username` tidak ada; masuk memakai `email` |
| 30 | Tabel 3.9 `alumni_profiles` | Ganti seluruh isi | Hanya tujuh kolom, tanpa satu pun kolom keselarasan |
| 31 | Tabel 3.10 `kuesioner_tracers` | Hapus | Tabel tidak ada; memuat `keselarasan_bidang` boolean yang sudah direvisi |
| 32 | Tabel 3.11 | Ganti nama dan isi | Nama tabel `lowongans`; `vektor_kompetensi` tidak ada |
| 33 | Tabel 3.12 `log_prediksis` | Hapus, ganti tiga tabel | Tabel tidak ada; menjanjikan dua target prediksi yang sudah dihapus |
| 34 | **Subbab baru** Kamus Data Gudang Data | Tambah | Struktur gudang data belum pernah dijabarkan, padahal seluruh Bab 4 berpijak di atasnya |
| 35 | Catatan pemetaan tipe data | Tambah | Menjaga konsistensi bila migrasi PostgreSQL dijalankan |
| 36 | Paragraf [1035] | Ganti kalimat | Percabangan kuesioner belum tergambar di antarmuka |
| 37 | Paragraf [1047] | Ganti frasa | "real-time" dan kolom proyeksi per alumni yang tidak ada |
| 38 | Paragraf [1051] | Ganti paragraf | "Slice and Dice", "instan", dua bagan keselarasan belum disebut |
| 39 | Gambar 3.18 | Gambar ulang | Harus memperlihatkan bagan keselarasan dan penanda kohort |

---

## Rujukan yang perlu Anda lengkapi

Enam tanda `[?]` pada naskah di atas. Lima di antaranya bisa dipenuhi dari
rujukan yang sudah Anda punya:

| Letak | Kebutuhan | Saran |
|---|---|---|
| Bagian 1.1, akhir paragraf OLAP | Definisi operasi OLAP dan indikator keselarasan | Pakai rujukan instrumen *Tracer Study* nasional yang sama dengan Bab 2. **Ini yang paling penting** — ia membuktikan skala lima dan empat tingkat bukan karangan sendiri |
| Bagian 1.2, setelah "*Random Forest*" | Algoritma Random Forest | Breiman, L. (2001). *Random Forests*. Machine Learning, 45(1), 5–32. Sudah tercatat sebagai rujukan metodologis di `admin/scripts/train_random_forest_iku.py` |
| Bagian 1.3, setelah "TF-IDF" | Pembobotan TF-IDF | Rujukan TF-IDF yang sudah Anda pakai di Bab 2. Jangan menambah rujukan baru bila sudah ada |
| Bagian 9.3, denormalisasi skema bintang | Alasan dimensi tidak dinormalkan | [P3] Ramadhani dkk. (2021) di `docs/rujukan-postgresql-data-warehouse.md` — memakai Kimball Lifecycle, terbit IEEE, penulis Bandung |
| Bagian 11, pemisahan OLTP dan gudang data | Alasan memisahkan beban analitik | [P1] Joiner dkk. (2024) atau [P8] Wijaya & Novaldi (2025), keduanya di dokumen rujukan yang sama |
| Bagian 11, dimensi merosot | Istilah *degenerate dimension* | Kimball & Ross. Bila aturan pustaka sepuluh tahun terakhir ditegakkan, pakai [P3] Ramadhani dkk. (2021) yang memakai metode Kimball |

Rujukan [30] yang sekarang dipakai di paragraf [639] **harus dicabut** dari
posisi itu. Ia membahas pengindeksan MySQL, bukan OLAP.

---

## Yang harus Anda putuskan

**Pertama — Jalan A atau Jalan B untuk Random Forest.** Ini menentukan bagian
6, 7, dan 8. Naskah di atas ditulis untuk Jalan A. Kalau Anda memilih Jalan B,
sampaikan sebelum mulai mengetik, bukan setelah.

**Kedua — target Random Forest yang mana.** Pemenuhan IKU pertama, atau
ketepatan waktu kelulusan. Harus sama di Ruang Lingkup butir 8, paragraf [640],
Tabel 3.2, dan Bab 4. Saran saya pemenuhan IKU pertama.

> Satu peringatan yang tetap berlaku. Model ketepatan waktu kelulusan membentuk
> label targetnya dari `tahunLulus - tahunMasuk`, sementara `tahunMasuk` dan
> `tahunLulus` juga dipakai sebagai fitur masukan. Nilai capaiannya karena itu
> tidak boleh dilaporkan sebagai bukti kemampuan memprediksi. Kalau Anda tetap
> ingin memakainya, target atau daftar fiturnya harus dirancang ulang lebih
> dahulu.

**Ketiga — nama DBMS di Bab 3.** PostgreSQL hanya boleh ditulis bila migrasi
sudah berjalan. Bab 1, Bab 3, dan Bab 4 harus menyebut yang sama. Kalau ragu,
tunda migrasi dan tulis MySQL di ketiga bab — itu tetap benar dan tidak ada
yang perlu dijelaskan.

**Keempat — apakah riwayat kuesioner perlu disimpan.** Rancangan sekarang
menimpa jawaban lama saat alumni memperbarui kuesioner. Kalau program studi
ingin membandingkan jawaban lintas tahun, tabel transaksi terpisah memang
diperlukan, dan Bab 3 harus memuatnya. Ini keputusan rancangan, bukan
keputusan penulisan.

**Kelima — penomoran ulang tabel.** Menghapus Tabel 3.10 dan 3.12 lalu
menambah tujuh tabel gudang data menggeser seluruh nomor tabel di Bab 3 dan
memengaruhi DAFTAR TABEL. Kerjakan penomoran **paling akhir**, setelah semua
isi selesai, supaya tidak dua kali kerja.
