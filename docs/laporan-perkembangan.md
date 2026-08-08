# Laporan Perkembangan Sistem Tugas Akhir

**Judul:** Rancang Bangun Aplikasi Tracer Study Berbasis Web Menggunakan Metode
Online Analytic Processing (OLAP) dan Natural Language Processing

**Nama:** Hilal Muhamad Abdul Gani · **NPM:** 613230042
**Program Studi:** DIII Teknik Informatika
**Universitas Logistik dan Bisnis Internasional, Bandung**
**Periode laporan:** s.d. 7 Agustus 2026

> Seluruh angka pada laporan ini diambil langsung dari basis data dan berkas
> keluaran model, sehingga dapat ditelusuri ulang.

---

## 1. Ringkasan Capaian

Sistem sudah berjalan utuh dari hulu ke hilir: data alumni masuk melalui skema
bintang, diolah menjadi statistik OLAP, ditampilkan pada dua dashboard terpisah
(alumni dan admin), sekaligus dipakai sebagai dasar pencocokan lowongan berbasis
NLP dan klasifikasi Random Forest.

| Komponen | Status | Bukti terukur |
|---|---|---|
| REST API Laravel 12 + Sanctum | Berjalan | 19 endpoint aktif |
| Basis data MySQL (skema bintang) | Berjalan | 15 migrasi, 12 model Eloquent |
| Data tracer alumni | Terisi | 215 record pada tabel fakta |
| Mesin NLP (TF-IDF + Cosine) | Berjalan | `TfIdfService.php`, 208 baris |
| Scraping lowongan | Berjalan | 335 lowongan dari 4 sumber |
| Klasifikasi Random Forest — IKU 1 | Terlatih & tervalidasi | Akurasi 0,674 vs baseline 0,544 |
| Klasifikasi Random Forest — ketepatan waktu | **Perlu dirancang ulang** | Lihat §8 butir 6 |
| Dashboard alumni (React) | Berjalan | 10 halaman |
| Dashboard admin (React + TS) | Berjalan | 4 halaman fungsional |
| Analisis karier berbantuan LLM | Berjalan | 9 analisis tersimpan |

---

## 2. Arsitektur Sistem

Sistem dibagi menjadi tiga lapisan yang terpisah tegas.

**Lapisan data — skema bintang (*star schema*).**
Data mentah masuk ke `staging_alumni`, lalu dinormalisasi menjadi empat tabel
dimensi dan satu tabel fakta:

- `dim_alumni` — identitas alumni (215 record)
- `dim_program_studi` — program studi dan spesialisasi
- `dim_waktu` — tahun lulus
- `dim_status_kerja` — status kebekerjaan
- `fact_tracer_alumni` — tabel fakta, memuat IPK, masa tunggu, dan gaji (215 record)

Struktur inilah yang memungkinkan operasi OLAP (*roll-up*, *drill-down*,
*slice*, *dice*) dijalankan secara wajar, bukan sekadar agregasi tabel datar.

**Lapisan aplikasi — Laravel 12 REST API.**
19 endpoint yang terbagi atas autentikasi (Sanctum), data alumni dan statistik,
manajemen lowongan, pencarian berbasis NLP, serta analisis karier.

**Lapisan antarmuka.**
Dua aplikasi React terpisah: portal alumni (React 19 + Vite + Tailwind +
Recharts + Zustand) dan dashboard admin (React 19 + TypeScript + Tailwind +
ApexCharts).

---

## 3. Implementasi Natural Language Processing

Mesin NLP berada pada satu berkas, `backend/app/Services/TfIdfService.php`
(208 baris), dengan pipeline empat tahap:

1. **Tokenisasi Unicode** — pemisahan token dengan `preg_split` berbasis
   properti `\p{L}\p{N}`, sehingga aman untuk teks berbahasa Indonesia.
2. **Penyaringan *stopword*** — 60+ kata henti bahasa Indonesia dan Inggris.
3. **Normalisasi sinonim** — 70+ pasangan pemetaan Indonesia→Inggris
   (misalnya *pemasaran* → *marketing*, *pengembang* → *developer*).
4. **Pembobotan TF-IDF dan *Cosine Similarity*** — TF sublinear `1 + log(tf)`,
   IDF ter-*smoothing* `log((N+1)/(df+1)) + 1`, kemiripan
   `sim(q,d) = (q·d) / (‖q‖ × ‖d‖)`.

**Nilai tambah — kueri majemuk berbobot.** Pada `JobController::search()`,
pencarian tidak hanya memakai kata kunci pengguna. Teks kueri diberi bobot 0,6
dan teks profil kandidat diberi bobot 0,4, lalu skor keduanya dijumlahkan.
Hasil pencarian karenanya bersifat personal terhadap profil alumni, bukan
pencarian kata kunci biasa.

**Pemisahan dua jalur yang sering dikira satu.**

| Fitur | Metode | Memanggil LLM |
|---|---|---|
| Pencarian kerja bahasa alami | TF-IDF + Cosine, murni lokal | Tidak |
| Analisis karier | LLM untuk ekstraksi, hasilnya jadi kueri TF-IDF | Ya |

Pencarian lowongan sepenuhnya berjalan dengan algoritma lokal dan dapat
dipertanggungjawabkan perhitungannya. LLM hanya dipakai pada fitur analisis
karier untuk mengekstraksi profil dari teks bebas.

---

## 4. Pengumpulan Data Lowongan

`JobScraperService.php` menerapkan pola perancangan **Strategy** dengan
antarmuka `JobSource`, sehingga penambahan sumber baru tidak mengubah kode inti.
Empat sumber telah terpasang: `LokerSource`, `RemotiveSource`, `JobicySource`,
dan `AdzunaSource`.

Pencegahan duplikasi memakai `updateOrCreate` dengan kunci gabungan judul posisi
dan nama perusahaan. Penjadwalan otomatis diatur pada `routes/console.php`
setiap pukul 03.00. Hingga laporan ini disusun terkumpul **335 lowongan**.

---

## 5. Klasifikasi Random Forest untuk IKU 1

Sesuai arahan pembimbing, klasifikasi dashboard admin menggunakan algoritma
Random Forest (Breiman, 2001). Skrip pelatihan berada pada
`admin/scripts/train_random_forest_iku.py` (485 baris).

### 5.1 Perumusan target

Target model berbentuk **biner**, mengikuti rumus resmi IKU 1 pada Buku Panduan
IKU PTN 2021 halaman 16:

```
(lulusan bekerja + wiraswasta + lanjut studi) / total lulusan × 100
```

Formulasi empat kelas sempat diuji lebih dahulu dan **ditolak secara empiris**:
akurasi *nested* CV hanya 0,423, di bawah baseline tebakan mayoritas 0,456,
dengan F1 kelas wirausaha 0,000. Penyebabnya, kategori pekerjaan dan wirausaha
nyaris tidak terbedakan oleh fitur yang tersedia (rata-rata IPK 3,506 vs 3,540).
Rincian empat kategori tetap dihitung, tetapi diposisikan sebagai statistik
deskriptif, bukan target model.

**Tidak ada kebocoran data pada model ini.** Target `memenuhiIKU1` diturunkan
dari kolom `statusBekerja` dan `masaTungguBulan`, sedangkan fitur yang dipakai
adalah `ipk`, `tahunLulus`, `programStudi`, `specialisasi`, dan
`pengalamanKerja`. Kedua himpunan itu tidak beririsan, sehingga model benar-benar
harus menduga, bukan menghitung ulang jawabannya.

### 5.2 Metode validasi

Digunakan ***nested stratified k-fold cross-validation*** (Varma & Simon, 2006),
5 *outer fold* dan 3 *inner fold*, dengan metrik penyetelan `f1_macro`.
Pemisahan ini mencegah kebocoran informasi saat penyetelan *hyperparameter*,
yang bila diabaikan akan menghasilkan estimasi akurasi yang terlalu optimistis.

### 5.3 Hasil

| Metrik | Rerata | Simpangan baku |
|---|---|---|
| Akurasi | 0,674 | 0,109 |
| Presisi (macro) | 0,681 | 0,106 |
| Recall (macro) | 0,679 | 0,104 |
| F1 (macro) | 0,672 | 0,110 |

Baseline `most_frequent`: **0,544**. Model unggul **13 poin** di atas baseline,
sehingga dapat dinyatakan benar-benar mempelajari pola, bukan sekadar menebak
kelas mayoritas.

*Hyperparameter* terpilih: `n_estimators=200`, `max_depth=None`,
`min_samples_leaf=5`.

Metrik per kelas (*out-of-fold*):

| Kelas | Presisi | Recall | F1 | n |
|---|---|---|---|---|
| Memenuhi | 0,733 | 0,632 | 0,679 | 117 |
| Tidak memenuhi | 0,623 | 0,724 | 0,670 | 98 |

### 5.4 Temuan metodologis penting

Kepentingan fitur dilaporkan dengan **dua metode sekaligus**, mengikuti anjuran
Strobl et al. (2007), dan hasilnya berbeda:

| Peringkat | MDI (*impurity*) | *Permutation importance* |
|---|---|---|
| 1 | IPK — 0,359 | Pengalaman kerja — 0,189 |
| 2 | Pengalaman kerja — 0,299 | IPK — 0,086 |
| 3 | Tahun lulus — 0,141 | Program studi — 0,063 |

MDI menempatkan IPK di posisi teratas, sedangkan *permutation importance*
menempatkan pengalaman kerja jauh di atas IPK. Perbedaan ini adalah bukti nyata
bias MDI terhadap variabel kontinu berkardinalitas tinggi seperti IPK, persis
sebagaimana diperingatkan Strobl et al. Karena itu **kesimpulan substantif
diambil dari *permutation importance***: faktor yang paling menentukan kelayakan
kerja lulusan adalah pengalaman kerja, bukan IPK.

Temuan ini memiliki implikasi praktis bagi kampus — penguatan program magang
dan pengalaman kerja lebih berdampak daripada sekadar mendorong kenaikan IPK.

### 5.5 Keputusan etis

Jenis kelamin **sengaja tidak dipakai** sebagai fitur prediktif, untuk
menghindari pelanggengan bias gender pada rekomendasi sistem. Variabel ini tetap
boleh dipakai untuk analisis deskriptif, tetapi tidak menjadi masukan model.

---

## 6. Antarmuka yang Terbangun

**Portal alumni** — 10 halaman: Landing, Login, Register, Dashboard, Kuisioner,
Laporan, Pencarian Kerja, Detail Lowongan, Analisis Karier, dan Chat.

**Dashboard admin** — 4 halaman fungsional (Beranda, Laporan, Log Pencarian,
Lowongan Kerja). Susunan halaman beranda saat ini (`admin/src/pages/Dashboard/Home.tsx`):

| Blok | Isi | Sifat angka |
|---|---|---|
| Analitik Historis (OLAP) | `EcommerceMetrics`, `StatisticsChart`, `StatusDistributionChart`, `MasaStudiPerProdiChart`, `StatusPerProdiChart`, `MonthlySalesChart` | Hasil pengukuran |
| Panel Ketepatan Waktu | `TepatWaktuPanel` | Hasil prediksi model |

Pemisahan blok ini disengaja: pembaca dashboard harus selalu tahu mana angka
hasil pengukuran dan mana angka hasil prediksi.

Perlu dicatat, komponen tampilan hasil pelatihan model IKU 1 (`IkuScoreCard`,
`IkuTrainingPanel`, `PredictionTable`, `PredictionPanel`) **sudah dikeluarkan**
dari halaman beranda pada revisi terakhir. Metrik validasi model IKU 1 karenanya
belum memiliki tempat tampil di antarmuka, meski berkas hasilnya
(`randomForestResult.json`) tetap ada. Perlu diputuskan apakah komponen tersebut
dikembalikan atau dipindahkan ke halaman tersendiri.

---

## 7. Perbaikan yang Dilakukan pada Periode Ini

1. **Perbaikan kesalahan penghitungan status kerja.** Ditemukan ketidakcocokan
   nilai pada `AlumniController`: kode memeriksa string `'Wirausaha'` sedangkan
   nilai sesungguhnya di basis data adalah `'Wirausaha/Startup'`. Akibatnya 18
   alumni tidak pernah terhitung, dan persentase kebekerjaan tampil **41,4%**
   padahal seharusnya **49,8%** — selisih 8,4 poin persentase. Endpoint
   statistik dan berkas laporan CSV bahkan menghasilkan angka berbeda dari data
   yang sama. Sudah diperbaiki dan diverifikasi.

2. **Perbaikan kartu metrik dashboard admin.** Satu kartu selalu menampilkan 0%
   karena penyaringnya keliru, dan terdapat angka target responden yang ditulis
   permanen dalam kode. Keduanya sudah diganti dengan perhitungan yang benar
   berdasarkan ambang IKU 1 (masa tunggu < 6 bulan).

3. **Penambahan visualisasi OLAP baru.** Dibuat `MasaStudiPerProdiChart` (rata-rata
   `tahunLulus − tahunMasuk` dan persentase lulus tepat waktu per program studi)
   dan `StatusPerProdiChart` (*stacked bar* lima status pekerjaan per jurusan).
   Keduanya murni agregasi OLAP tanpa model.

4. **Penelusuran ulang klaim arsitektur.** Diverifikasi bahwa fitur pencarian
   kerja tidak memanggil LLM sama sekali, dan bahwa LinkedIn tidak di-*scrape* —
   alumni menempelkan teks profilnya sendiri. Keputusan tidak melakukan
   *scraping* LinkedIn diambil secara sadar karena melanggar ketentuan layanan
   platform tersebut.

5. **Penyusunan ulang daftar pustaka.** Seluruh sitasi Bab 1 dan Bab 2 dipetakan
   ke rujukan yang dapat ditelusuri; hasilnya ada pada
   [`docs/daftar-pustaka.md`](daftar-pustaka.md).

---

## 8. Keterbatasan yang Diakui

Bagian ini disusun terbuka agar tidak menjadi temuan saat sidang.

1. **Ambang gaji IKU 1 belum diterapkan.** Buku Panduan IKU 1 mensyaratkan dua
   ambang untuk kategori "pekerjaan layak": masa tunggu < 6 bulan **dan**
   penghasilan > 1,2 × UMP provinsi tempat bekerja. Dataset tidak memuat kolom
   provinsi tempat bekerja, sehingga ambang gaji belum dapat dihitung.
   Konsekuensinya, angka kategori "layak" yang dilaporkan merupakan **batas
   atas** dari capaian IKU 1 yang sebenarnya. Status ini ditandai eksplisit pada
   berkas keluaran model (`gajiDiterapkan: false`) dan ditampilkan di dashboard.

2. **Asumsi pada kriteria lanjut studi.** Kriteria resmi mensyaratkan lanjut
   studi dalam 12 bulan sejak tanggal ijazah. Dataset hanya memuat tahun lulus
   tanpa tanggal ijazah, sehingga seluruh alumni berstatus melanjutkan studi
   diasumsikan memenuhi ambang tersebut.

3. **Belum ada tahap *stemming* pada pipeline NLP.** Normalisasi masih berbasis
   kamus sinonim, belum memakai algoritma *stemming* seperti Nazief-Adriani atau
   pustaka Sastrawi. Akibatnya kata *mengembangkan* dan *pengembangan* masih
   dianggap dua token berbeda.

4. **Data kuesioner belum masuk ke skema bintang.** Halaman kuisioner sudah
   berfungsi dan menyimpan data ke tabel `alumni_profiles`, tetapi tabel tersebut
   masih terpisah dari `fact_tracer_alumni` yang menjadi sumber analitik OLAP.
   Saat ini baru terdapat 1 record profil berbanding 215 record fakta. Integrasi
   keduanya menjadi prioritas tahap berikutnya.

5. **Ukuran sampel terbatas.** Model dilatih atas 215 record. Simpangan baku
   akurasi sebesar 0,109 antar-*fold* mencerminkan keterbatasan ini dan perlu
   disebutkan setiap kali angka akurasi dikutip.

6. **Model ketepatan waktu lulus mengalami kebocoran data dan belum layak
   dilaporkan.** Rinciannya pada §8.1 di bawah.

### 8.1 Kebocoran data pada model ketepatan waktu lulus

Skrip `admin/scripts/train_random_forest_tepat.py` membentuk label targetnya
sendiri dari data:

```python
def mark_tepat(row):
    durasi = DURASI_JENJANG[row["jenjang"]]        # D3 -> 3, S1 -> 4
    masa_studi = row["tahunLulus"] - row["tahunMasuk"]
    return "tepatWaktu" if masa_studi <= durasi else "tidakTepatWaktu"
```

Ketiga kolom yang dipakai untuk menghitung label — `jenjang`, `tahunLulus`,
`tahunMasuk` — **seluruhnya juga dipakai sebagai fitur**:

```python
NUMERIC_FEATURES = ["ipk", "tahunMasuk", "tahunLulus"]
CATEGORICAL_FEATURES = ["jenjang", "programStudi", "specialisasi", "pengalamanKerja"]
```

Model karenanya tidak sedang memprediksi apa pun. Ia diberi soal beserta kunci
jawabannya, lalu diminta menghitung ulang pengurangan dua bilangan. Docstring
skrip menyatakan `masaStudi` sengaja tidak disertakan agar tidak bocor, tetapi
menghilangkan kolom turunannya tidak ada gunanya selama ketiga kolom
pembentuknya tetap ada.

Struktur datanya membuat ini makin jelas. Hanya ada tiga nilai masa studi:

| Jenjang | masaStudi 3 | 4 | 5 | Total |
|---|---|---|---|---|
| D3 | 56 | 0 | 0 | 56 |
| S1 | 0 | 107 | 52 | 159 |

Label sepenuhnya ditentukan oleh satu perbandingan aritmetika. Seluruh alumni D3
tepat waktu tanpa kecuali — kelas "tidak tepat waktu" hanya ada pada S1 dengan
masa studi 5 tahun. Tidak ada satu pun contoh D3 terlambat yang bisa dipelajari.

Hasil pelatihannya justru memperkuat kesimpulan itu:

| Metrik | Nilai |
|---|---|
| Akurasi *nested* CV | 0,763 |
| Baseline `most_frequent` | **0,758** |
| Selisih | **+0,005** |

Model hanya unggul **setengah poin persentase** di atas tebakan kelas mayoritas
— padahal ia memegang kunci jawaban. Aturan `tahunLulus − tahunMasuk ≤ durasi`
yang ditulis dalam dua baris kode akan mencapai akurasi 100%. Random Forest
mencapai 76,3%. Pada kelas minoritas, presisinya 0,507 — setara lemparan koin.

*Permutation importance* menampilkan sidik jari kebocoran itu dengan telanjang:

| Fitur | Kepentingan |
|---|---|
| `tahunMasuk` | 0,324 |
| `tahunLulus` | 0,256 |
| `jenjang` | 0,095 |
| `programStudi` | 0,086 |
| `ipk` | 0,065 |
| `specialisasi` | 0,060 |
| `pengalamanKerja` | 0,035 |

Tiga fitur teratas persis ketiga kolom pembentuk label. Semua fitur yang
sesungguhnya bersifat prediktif — IPK, pengalaman kerja, program studi — nyaris
tidak berkontribusi.

**Catatan tambahan.** Kolom `predictions` yang ditampilkan `TepatWaktuPanel`
dihasilkan dari `predict_proba(X)` atas `X` yang sama dengan yang dipakai
`fit()`, sehingga bersifat *in-sample*. Angka keyakinan pada tabel dashboard
lebih tinggi daripada kemampuan model yang sebenarnya. Hal yang sama berlaku
pada *permutation importance* di atas. Sebaliknya, blok `crossValidation`,
`perClass`, dan `confusionMatrix` memang dihitung *out-of-fold* dan sah.

**Pilihan penanganan** (belum diputuskan, menunggu arahan):

| Opsi | Isi | Konsekuensi |
|---|---|---|
| A | Turunkan ke statistik OLAP deskriptif | Jujur dan langsung benar; ketepatan waktu memang cukup dihitung, tidak perlu diprediksi |
| B | Ubah target menjadi prediksi sungguhan — misalnya memprediksi ketepatan waktu dari IPK, program studi, dan jalur masuk **tanpa** `tahunLulus` | Menjadi model yang sah, tetapi perlu pelatihan ulang |
| C | Ganti target ke pertanyaan yang belum terjawab data — misalnya risiko masa tunggu panjang | Paling bernilai, paling banyak pekerjaan |

Opsi B dan C sama-sama menuntut pelatihan ulang. Sesuai kesepakatan, pelatihan
tidak akan dijalankan sebelum ada persetujuan.

---

## 9. Rencana Tahap Berikutnya

| Prioritas | Rencana kerja |
|---|---|
| 1 | Menetapkan penanganan model ketepatan waktu (§8.1) — hentikan tampilan prediksinya hingga diputuskan |
| 2 | Mengalirkan data kuisioner dari `alumni_profiles` ke skema bintang `fact_tracer_alumni` melalui proses ETL, agar pengisian alumni langsung memperbarui analitik OLAP |
| 3 | Mengekspor prediksi *out-of-fold* per alumni pada model IKU 1 agar tabel prediksi dashboard menampilkan inferensi sungguhan beserta tingkat keyakinannya |
| 4 | Menentukan tempat tampil metrik pelatihan model IKU 1 setelah komponennya dikeluarkan dari beranda (§6) |
| 5 | Menambahkan tahap *stemming* pada pipeline NLP dan mengukur dampaknya terhadap kualitas pencocokan |
| 6 | Menambahkan kolom provinsi tempat bekerja agar ambang gaji 1,2 × UMP dapat diterapkan penuh |
| 7 | Melengkapi pengujian dan penyusunan dokumentasi akhir |

---

## 10. Daftar Rujukan

Daftar lengkap beserta peta penomoran ada pada
[`docs/daftar-pustaka.md`](daftar-pustaka.md). Rujukan yang dipakai langsung
pada laporan ini:

1. Kementerian Pendidikan dan Kebudayaan. (2021). *Keputusan Menteri Pendidikan
   dan Kebudayaan Nomor 3/M/2021 tentang Indikator Kinerja Utama PTN dan
   LLDIKTI*. Jakarta.
2. Direktorat Jenderal Pendidikan Tinggi. (2021). *Buku Panduan Indikator
   Kinerja Utama Perguruan Tinggi Negeri*, hal. 11–16. Jakarta.
3. Breiman, L. (2001). Random forests. *Machine Learning*, 45(1), 5–32.
4. Strobl, C., Boulesteix, A.-L., Zeileis, A., & Hothorn, T. (2007). Bias in
   random forest variable importance measures. *BMC Bioinformatics*, 8, 25.
5. Varma, S., & Simon, R. (2006). Bias in error estimation when using
   cross-validation for model selection. *BMC Bioinformatics*, 7, 91.
6. Schomburg, H. (2003). *Handbook for Graduate Tracer Studies*. University of
   Kassel.

> Sebagaimana dicatat pada `docs/daftar-pustaka.md`, detail bibliografis di atas
> masih perlu diverifikasi langsung melalui DOI atau Google Scholar.
