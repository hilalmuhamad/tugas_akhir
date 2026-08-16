# Prompt Presentasi Sidang TA untuk Gamma AI

**Disusun untuk:** Hilal Muhamad Abdul Gani · NPM 613230042 · DIII Teknik Informatika ULBI
**Target:** 13 kartu, durasi bicara ±15 menit
**Basis data yang disebut:** PostgreSQL (sesuai `backend/.env` — `DB_CONNECTION=pgsql`, `DB_DATABASE=tugasakhir`, port 5432)

---

## Cara pakai

1. Buka gamma.app → **Create new** → pilih **Paste in text** (jangan "Generate from prompt" — hasilnya lebih liar dan Gamma akan mengarang angka).
2. Atur dulu pengaturan di bawah, baru tempel teks.
3. Salin **seluruh** isi blok `PROMPT` di bawah, dari baris `INSTRUKSI` sampai kartu ke-13.
4. Klik Generate, lalu ganti tiga kartu bergambar dengan tangkapan layar Anda sendiri (lihat bagian "Slide yang wajib diganti").

### Pengaturan Gamma

| Pengaturan | Pilih |
|---|---|
| Format | Presentation |
| Jumlah kartu | 13 (kunci angkanya, jangan biarkan "auto") |
| Bahasa / Language | Indonesian |
| Tone | Formal / Professional |
| Text density / Amount of text per card | Medium — jangan Detailed, slide sidang harus bisa dibaca dari kursi penguji |
| Image source | **AI illustration** dengan gaya minimal, atau **No images**. Jangan "Web images" — Gamma akan menarik foto stok kampus yang tidak relevan |
| Tema | Tema apa pun berlatar terang dengan aksen biru, agar selaras dengan tema aplikasi Anda |

---

## PROMPT — salin mulai dari baris di bawah ini

```text
INSTRUKSI UNTUK GAMMA

Buat presentasi sidang Tugas Akhir Diploma III Teknik Informatika sebanyak
tepat 13 kartu, dalam bahasa Indonesia formal akademik.

Aturan yang tidak boleh dilanggar:
- Gunakan HANYA angka, nama berkas, dan istilah yang tertulis di bawah ini.
  Jangan menambah statistik, persentase, nama institusi mitra, atau nama
  teknologi apa pun yang tidak saya sebutkan.
- Jangan pernah memakai frasa "real-time", "secara instan", atau
  "slice-and-dice".
- Jangan menulis bahwa sistem memahami makna kalimat atau melakukan
  pencocokan semantik. Yang dihitung adalah kemiripan vektor bobot kata.
- Jangan mengklaim kebaruan mutlak. Bila perlu, gunakan "belum banyak
  ditemukan".
- Setiap kartu maksimal 5 butir, setiap butir maksimal 2 baris.
- Judul kartu ringkas, tanpa tanda baca akhir.
- Jangan membuat kartu penutup tambahan seperti "Terima kasih" atau
  "Pertanyaan". Tepat 13 kartu.

---

KARTU 1 — Halaman Judul

Judul: Rancang Bangun Aplikasi Tracer Study Berbasis Web Menggunakan Metode
Online Analytical Processing (OLAP)

Isi:
Hilal Muhamad Abdul Gani
NPM 613230042
Program Studi DIII Teknik Informatika
Universitas Logistik dan Bisnis Internasional, Bandung
Sidang Tugas Akhir 2026

Tata letak: kartu judul, terpusat, tanpa butir daftar.

---

KARTU 2 — Latar Belakang dan Identifikasi Masalah

- Tracer study adalah instrumen wajib perguruan tinggi untuk menelusuri
  keterserapan lulusan di dunia kerja, sekaligus dasar perhitungan Indikator
  Kinerja Utama pertama (IKU-1) menurut Kepmendikbud Nomor 3/M/2021.
- Pengelolaan data tracer study pada praktik yang berjalan masih bertumpu pada
  berkas rekapitulasi tabel datar, sehingga penelusuran lintas tahun kelulusan
  dan lintas program studi harus dikerjakan manual.
- Laporan yang dihasilkan masih terbatas pada analitik deskriptif atas data
  historis. Program studi belum memiliki instrumen yang mampu mengukur
  keselarasan bidang pekerjaan lulusan maupun mengestimasi pemenuhan IKU-1,
  sehingga intervensi kebijakan karier cenderung bersifat reaktif.
- Di sisi alumni, pencarian lowongan masih mengandalkan penelusuran kata kunci
  yang harus persis, padahal alumni menuliskan keahliannya dalam bahasa sehari-
  hari.

---

KARTU 3 — Tujuan Penelitian

- Membangun aplikasi tracer study berbasis web tiga peran pengguna (Admin,
  Alumni, Viewer) yang menggantikan pengelolaan berbasis berkas rekapitulasi.
- Merancang gudang data multidimensi skema bintang dan menerapkan operasi OLAP
  agar program studi dapat meringkas dan menelusuri capaian lulusan menurut
  tahun kelulusan serta program studi.
- Menerapkan algoritma Random Forest sebagai teknik pendukung pada dasbor
  analitik untuk mengklasifikasikan pemenuhan IKU-1 oleh lulusan, sehingga
  program studi dapat mengambil langkah pembinaan karier lebih dini.
- Menyediakan pencarian lowongan kerja berbahasa alami bagi alumni melalui
  pembobotan TF-IDF dan Cosine Similarity.

---

KARTU 4 — Ruang Lingkup

- Aplikasi web arsitektur client-server: antarmuka React.js, layanan backend
  dan API menggunakan Laravel.
- Basis data PostgreSQL, memisahkan basis data operasional (OLTP) dari gudang
  data skema bintang. Pemindahan data melalui proses Extract, Transform, Load
  (ETL) yang dijalankan sistem.
- Operasi OLAP dibatasi pada peringkasan (roll-up) menurut tahun kelulusan dan
  program studi, penelusuran rinci (drill-down) pada tabulasi silang program
  studi terhadap status kerja, serta penyaringan menurut jendela kohort. Sistem
  tidak menyediakan pembentukan kubus data mandiri oleh pengguna.
- Populasi dasbor dibatasi pada kohort tracer study TS-1 sampai TS-3, yaitu
  tiga tahun kelulusan terakhir. Data di luar jendela tersebut tetap tersimpan
  di gudang data sebagai riwayat.
- Data alumni yang dipakai merupakan data simulasi yang disusun menyerupai
  sebaran tracer study program studi, ditambah hasil pengisian kuesioner oleh
  pengguna sistem. Penelitian ini tidak menggunakan data alumni sebenarnya.

---

KARTU 5 — Landasan Metode

Sajikan sebagai tiga kolom berdampingan, satu kolom satu metode.

Kolom 1 — Online Analytical Processing (OLAP):
Pendekatan analisis data multidimensi yang menyimpan data pada skema bintang,
sehingga peringkasan dan penelusuran rinci dapat dijalankan sebagai operasi
basis data, bukan sebagai perhitungan ulang atas tabel datar.

Kolom 2 — TF-IDF dan Cosine Similarity:
Pembobotan kata yang menilai sebuah kata makin penting bila sering muncul pada
satu dokumen namun jarang muncul pada dokumen lain. Kemiripan dua teks diukur
sebagai kosinus sudut antar vektor bobotnya.

Kolom 3 — Random Forest (Breiman, 2001):
Gabungan banyak pohon keputusan yang dilatih atas cuplikan data dan cuplikan
fitur yang berbeda. Keputusan akhir diambil melalui pemungutan suara mayoritas,
sehingga lebih tahan terhadap pemasangan berlebih dibandingkan pohon tunggal.

---

KARTU 6 — Arsitektur Sistem

Sajikan sebagai diagram tiga lapisan bertumpuk, dari bawah ke atas.

- Lapisan data — PostgreSQL. Basis data operasional menampung hasil pengisian
  kuesioner; gudang data menampung skema bintang. Keduanya dihubungkan proses
  ETL (`php artisan etl:sync`), yang juga berjalan otomatis setiap kali seorang
  alumni menyimpan kuesionernya.
- Lapisan aplikasi — REST API Laravel 12 dengan autentikasi token Laravel
  Sanctum. 19 endpoint aktif, mencakup autentikasi, data dan statistik alumni,
  manajemen lowongan, pencarian berbasis NLP, serta analisis karier.
- Lapisan antarmuka — dua aplikasi React 19 terpisah. Portal alumni (Vite,
  Tailwind CSS, Zustand, Recharts) dan dasbor admin (TypeScript, Tailwind CSS,
  ApexCharts).
- Pemisahan tegas ini membuat pengujian tiap lapisan dapat dilakukan mandiri.

---

KARTU 7 — Perancangan Gudang Data

- Skema bintang terdiri atas satu tabel fakta `fact_tracer_alumni` dan lima
  tabel dimensi: `dim_waktu`, `dim_program_studi`, `dim_status_kerja`,
  `dim_alumni`, dan `dim_keselarasan`.
- Alur ETL: data mentah masuk ke `staging_alumni`, dinormalisasi menjadi baris
  dimensi, lalu dirangkai menjadi baris fakta berisi IPK, masa tunggu kerja,
  dan gaji pertama.
- `dim_keselarasan` berisi 20 baris tetap, hasil perkalian lima tingkat
  keeratan hubungan bidang studi dengan empat tingkat pendidikan. Ia merupakan
  tabel referensi kategori, bukan dimensi yang tumbuh mengikuti data.
- Kunci tamu `keselarasan_key` pada tabel fakta bersifat opsional, karena
  pertanyaan keselarasan hanya diajukan kepada responden yang bekerja atau
  berwirausaha. Ini konsekuensi percabangan instrumen tracer study.
- Isi tabel fakta seluruhnya 216 baris untuk lulusan 2021 sampai 2026.

Tambahkan catatan kecil di bawah kartu: gudang data menyimpan seluruh riwayat,
dasbor menyajikan jendela kohort.

---

KARTU 8 — Dasbor Analitik OLAP

- Penyaringan jendela kohort: dari 216 baris tabel fakta, 127 baris masuk
  perhitungan dasbor, yaitu kohort TS-1 sampai TS-3 atau lulusan 2023 sampai
  2025. Label kohort ditampilkan pada dasbor.
- Operasi peringkasan (roll-up) menyajikan capaian menurut tahun kelulusan dan
  program studi.
- Operasi penelusuran rinci (drill-down) menyajikan tabulasi silang program
  studi terhadap lima kategori status kerja.
- Visualisasi yang tersedia: kartu metrik IKU-1, tren masa tunggu kerja,
  sebaran status kerja, rata-rata masa studi per program studi, dan status
  kerja per program studi.
- Dasbor memisahkan tegas blok angka hasil pengukuran dari blok angka hasil
  prediksi model, agar pembaca selalu tahu mana yang mana.

Sisakan ruang kosong besar di sisi kanan kartu untuk tangkapan layar.

---

KARTU 9 — Pengukuran Keselarasan Lulusan

- Keselarasan diukur langsung dari jawaban kuesioner, bukan diprediksi model.
- Keselarasan horizontal adalah kesesuaian bidang studi dengan bidang
  pekerjaan. Hasil: Selaras 68 alumni (87,2 persen), Tidak Selaras 10 alumni
  (12,8 persen).
- Keselarasan vertikal adalah kesesuaian jenjang pendidikan dengan tingkat
  pekerjaan. Hasil: Tinggi 23 alumni (29,5 persen), Sama 52 alumni (66,7
  persen), Rendah 3 alumni (3,8 persen).
- Penyebut kedua perhitungan adalah 78 alumni yang bekerja atau berwirausaha di
  dalam kohort, bukan 127 alumni kohort, karena pertanyaan keselarasan hanya
  diajukan kepada responden yang bekerja.
- Kategori "Sama" adalah hasil yang diharapkan. Kategori "Rendah" menandakan
  lulusan bekerja di bawah jenjangnya, atau underemployment.

Sisakan ruang kosong besar di sisi kanan kartu untuk tangkapan layar.

---

KARTU 10 — Pencocokan Lowongan Berbasis NLP

- Mesin NLP berada pada satu berkas layanan, `TfIdfService.php`, dengan
  pipeline empat tahap: tokenisasi Unicode, penyaringan stopword Indonesia dan
  Inggris, normalisasi sinonim, lalu pembobotan TF-IDF dan Cosine Similarity.
- Pembobotan memakai TF sublinear dan IDF ter-smoothing, sehingga kata yang
  muncul sangat sering tidak mendominasi perhitungan.
- Kueri majemuk berbobot: teks pencarian alumni diberi bobot 0,6 dan teks
  profil keahliannya diberi bobot 0,4, lalu kedua skor dijumlahkan. Hasil
  pencarian karenanya bersifat personal terhadap profil alumni.
- Set data pembanding berisi 335 lowongan yang dihimpun dari empat sumber
  melalui layanan pengumpul yang menerapkan pola perancangan Strategy.
- Pencarian lowongan berjalan sepenuhnya dengan algoritma lokal dan tidak
  memanggil layanan model bahasa apa pun, sehingga perhitungan skornya dapat
  ditelusuri ulang.

Sisakan ruang kosong besar di sisi kanan kartu untuk tangkapan layar.

---

KARTU 11 — Klasifikasi Random Forest untuk IKU-1

- Variabel target berbentuk biner, mengikuti rumus resmi IKU-1 pada Buku
  Panduan Indikator Kinerja Utama Perguruan Tinggi Negeri 2021 halaman 16.
- Fitur masukan: IPK, tahun lulus, program studi, spesialisasi, dan pengalaman
  kerja. Himpunan fitur ini tidak beririsan dengan kolom pembentuk target,
  sehingga model benar-benar harus menduga.
- Validasi memakai nested stratified k-fold cross-validation dengan 5 outer
  fold dan 3 inner fold, metrik penyetelan f1_macro. Pemisahan berlapis ini
  mencegah estimasi akurasi yang terlalu optimistis.
- Hasil atas populasi 215 lulusan: akurasi 0,674 dengan simpangan baku 0,109,
  presisi macro 0,681, recall macro 0,679, F1 macro 0,672. Baseline tebakan
  kelas mayoritas 0,544, sehingga model unggul 13 poin di atas baseline.
- Jenis kelamin sengaja tidak dipakai sebagai fitur, untuk menghindari
  pelanggengan bias gender pada keluaran sistem.

---

KARTU 12 — Temuan Kepentingan Fitur

- Kepentingan fitur dilaporkan dengan dua metode sekaligus, mengikuti anjuran
  Strobl dan rekan (2007), dan hasilnya berbeda.
- Metode penurunan impurity (MDI) menempatkan IPK di peringkat pertama dengan
  nilai 0,359, disusul pengalaman kerja 0,299 dan tahun lulus 0,141.
- Permutation importance menempatkan pengalaman kerja di peringkat pertama
  dengan nilai 0,189, jauh di atas IPK yang hanya 0,086, disusul program studi
  0,063.
- Perbedaan ini adalah bukti bias MDI terhadap variabel kontinu
  berkardinalitas tinggi seperti IPK. Karena itu kesimpulan substantif diambil
  dari permutation importance.
- Implikasi bagi program studi: penguatan program magang dan pengalaman kerja
  lebih berdampak pada kelayakan kerja lulusan daripada semata mendorong
  kenaikan IPK.

Sajikan dua peringkat MDI dan permutation importance sebagai tabel dua kolom
yang berdampingan agar perbedaannya langsung terlihat.

---

KARTU 13 — Kesimpulan dan Saran

Kesimpulan:
- Aplikasi tracer study berbasis web berhasil dibangun menggunakan React,
  Laravel 12, dan PostgreSQL, dengan tiga peran pengguna dan gudang data skema
  bintang satu tabel fakta serta lima tabel dimensi.
- Operasi OLAP peringkasan dan penelusuran rinci berjalan atas jendela kohort
  TS-1 sampai TS-3, dan sistem menyajikan keselarasan horizontal serta
  keselarasan vertikal lulusan per program studi.
- Random Forest mengklasifikasikan pemenuhan IKU-1 dengan akurasi 0,674 di atas
  baseline 0,544, dan mengidentifikasi pengalaman kerja sebagai faktor paling
  menentukan.
- Pencarian lowongan berbahasa alami berjalan melalui TF-IDF dan Cosine
  Similarity secara lokal atas 335 lowongan.

Saran:
- Batas kohort tiga tahun membuat jumlah responden mengecil dari 216 menjadi
  127. Pengumpulan data pada kohort berjalan perlu diperluas agar setiap tahun
  kelulusan memiliki responden yang memadai untuk pembandingan antar program
  studi.
- Penambahan tahap stemming pada pipeline NLP dan penambahan kolom provinsi
  tempat bekerja agar ambang penghasilan 1,2 kali UMP pada IKU-1 dapat
  diterapkan penuh.
```

## Salin sampai baris di atas

---

## Slide yang wajib Anda ganti dengan tangkapan layar

Gamma tidak bisa membuat tampilan sistem Anda. Tiga kartu ini sudah saya beri
ruang kosong, isi sendiri setelah generate:

| Kartu | Tangkapan layar yang diambil |
|---|---|
| 8 | Beranda dasbor admin, pastikan label kohort "TS-1 s.d. TS-3 (lulusan 2023–2025)" terlihat |
| 9 | `KeselarasanHorizontalChart` dan `KeselarasanVertikalChart` bersebelahan |
| 10 | Halaman pencarian kerja alumni beserta daftar hasil dan skor kemiripannya |

Ambil tangkapan layar pada peramban mode terang, lebar penuh, dan perbesar
tampilan ke 110 persen supaya angkanya terbaca dari proyektor.

---

## Dua hal yang perlu Anda periksa sebelum generate

**Pertama — judul.** Prompt di atas memakai judul tanpa frasa NLP, sesuai
lembar pengesahan yang Anda sebutkan. Namun `docs/laporan-perkembangan.md`
menuliskan judul dengan tambahan "dan Natural Language Processing". Cocokkan
dengan lembar pengesahan yang sudah ditandatangani, lalu perbaiki Kartu 1 bila
perlu. Bila judul resmi memang tanpa NLP, siapkan jawaban mengapa NLP tetap
dibahas — jawabannya ada di bagian amunisi di bawah.

**Kedua — nama dosen pembimbing belum ada.** Tambahkan manual di Kartu 1
setelah generate, karena saya tidak memiliki datanya.

---

## Amunisi jawaban penguji

Anda memilih tanpa slide keterbatasan, jadi materi ini bukan untuk ditampilkan.
Hafalkan saja — semua pertanyaan di bawah punya kemungkinan besar muncul karena
angkanya tampil di slide Anda.

**"Mengapa penyebut keselarasan 78, bukan 127?"**
Karena pertanyaan keselarasan hanya diajukan kepada responden yang bekerja atau
berwirausaha. Instrumen tracer study memakai percabangan. Menghitung keselarasan
atas 127 alumni berarti memasukkan responden yang tidak pernah ditanya.

**"Mengapa akurasi model hanya 0,674?"**
Angka itu hasil nested cross-validation atas 215 record, bukan akurasi
in-sample. Baseline tebakan kelas mayoritas 0,544, jadi model unggul 13 poin.
Simpangan bakunya 0,109 antar-fold, mencerminkan ukuran sampel yang terbatas.
Akurasi yang lebih tinggi justru perlu dicurigai pada data sebesar ini.

**"Mengapa model dilatih atas 215 sedangkan dasbor menampilkan 127?"**
Model dilatih atas seluruh populasi lulusan agar jumlah sampelnya memadai,
sedangkan dasbor menyajikan jendela kohort TS-1 sampai TS-3 sesuai ketentuan
tracer study. Keduanya populasi berbeda untuk keperluan berbeda, dan itu
dinyatakan terbuka di laporan.

**"Mengapa PostgreSQL, bukan MySQL?"**
Keduanya bisa dipakai sebagai gudang data. PostgreSQL dipilih karena menyediakan
`GROUPING SETS`, `ROLLUP`, dan `CUBE` secara bawaan, sedangkan MySQL 8.0 hanya
menyediakan `WITH ROLLUP`. Tersedia pula partisi deklaratif dan indeks BRIN
sebagai rancangan skalabilitas. Pada tabel fakta berukuran ratusan baris,
keunggulan itu belum memberi peningkatan terukur — ini rancangan untuk
pertumbuhan data, bukan optimasi yang sudah terbukti.
Jangan pernah menjawab bahwa MySQL tidak mampu menjadi gudang data.

**"Apakah sistem memahami maksud kalimat pencarian?"**
Tidak. Yang dihitung adalah kemiripan vektor bobot kata melalui TF-IDF dan
Cosine Similarity. Sistem tidak melakukan penguraian makna kalimat maupun
pengenalan entitas bernama, dan itu dinyatakan sebagai batasan di Bab 1.

**"Mengapa NLP dibahas jika judul hanya menyebut OLAP?"**
NLP diterapkan secara terbatas dan eksklusif pada fitur job matching sebagai
pemanfaatan lanjutan atas data profil yang sama, sementara metode utama
penelitian tetap OLAP. Ruang lingkup Bab 1 butir keenam menyatakan batasan ini.

**"Mengapa jenis kelamin tidak dipakai sebagai fitur?"**
Keputusan etis. Memakainya berisiko melanggengkan bias gender pada keluaran
sistem yang akan dipakai untuk pembinaan karier. Variabel itu tetap dipakai
untuk analisis deskriptif, tetapi tidak menjadi masukan model.

**Bila penguji menanyakan prediksi ketepatan waktu lulus:**
Jawab bahwa ketepatan waktu lulus disajikan sebagai statistik OLAP deskriptif,
bukan sebagai hasil prediksi, karena besaran itu dapat dihitung langsung dari
selisih tahun masuk dan tahun lulus sehingga tidak perlu diprediksi. Jangan
menampilkan angka akurasi model ketepatan waktu — pastikan `TepatWaktuPanel`
sudah tidak menampilkan kolom prediksi saat demo.

---

## Angka resmi yang harus konsisten di slide, laporan, dan demo

| Besaran | Nilai |
|---|---|
| Baris tabel fakta seluruhnya | 216 (215 CSV + 1 kuesioner nyata) |
| Kohort TS-1 s.d. TS-3 (lulus 2023–2025) | 127 alumni |
| Bekerja + wirausaha dalam kohort | 78 alumni |
| Keselarasan horizontal | Selaras 68 (87,2%), Tidak Selaras 10 (12,8%) |
| Keselarasan vertikal | Tinggi 23 (29,5%), Sama 52 (66,7%), Rendah 3 (3,8%) |
| Tabel dimensi | 5 |
| Baris `dim_keselarasan` | 20 |
| Populasi pelatihan Random Forest | 215 |
| Akurasi Random Forest | 0,674 (SD 0,109) |
| Baseline kelas mayoritas | 0,544 |
| Permutation importance teratas | Pengalaman kerja 0,189 |
| Endpoint API aktif | 19 |
| Lowongan terhimpun | 335 dari 4 sumber |
