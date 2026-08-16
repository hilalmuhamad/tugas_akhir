# Daftar Revisi Laporan Tugas Akhir

Disusun dari pembacaan menyeluruh `Hilal_Laporan Tugas Akhir.docx` (1.136 paragraf
berteks) dibandingkan dengan keadaan sistem sekarang di `C:\laragon\www\tugasakhir`.

Nomor `[n]` adalah indeks paragraf hasil ekstraksi, dipakai supaya Anda bisa
menemukan letaknya dengan cepat. Cari kalimat pembuka yang dikutip, bukan
nomornya — nomor itu tidak ada di dokumen Word.

Ada **dua jalur revisi yang berdiri sendiri**. Jalur A wajib. Jalur B hanya
dikerjakan bila migrasi basis data benar-benar jadi dilakukan.

- **Jalur A** — penyesuaian atas revisi dosen pembimbing yang sudah masuk ke
  sistem (kohort TS-1 s.d. TS-3, empat pertanyaan kuesioner baru, dimensi
  keselarasan, dua grafik keselarasan). 24 butir.
- **Jalur B** — penyesuaian atas migrasi MySQL → PostgreSQL. 16 butir.

---

## Keadaan sistem sekarang (angka acuan)

Diambil langsung dari basis data pada 11 Agustus 2026, bukan dari perkiraan.

| Besaran | Nilai |
|---|---|
| Baris tabel fakta seluruhnya | 216 (215 CSV + 1 kuesioner nyata) |
| Sebaran tahun lulus di tabel fakta | 2021=47, 2022=41, 2023=42, 2024=42, 2025=43, 2026=1 |
| **Kohort TS-1 s.d. TS-3 (lulus 2023–2025)** | **127 alumni** |
| Bekerja + Wirausaha dalam kohort | **78 alumni** ← penyebut kedua grafik keselarasan |
| Keselarasan horizontal | Selaras 68 (87,2%), Tidak Selaras 10 (12,8%) |
| Keselarasan vertikal | Tinggi 23 (29,5%), Sama 52 (66,7%), Rendah 3 (3,8%) |
| Baris `dim_keselarasan` | 20 (5 tingkat hubungan × 4 tingkat pendidikan) |
| Tabel dimensi | **5** (bukan 4): waktu, program studi, status kerja, alumni, keselarasan |

Perhatikan: **CSV tetap memuat lulusan 2021–2025.** Penyaringan kohort dikerjakan
di lapisan kueri (`whereBetween('dw.tahun_lulus', [$tahunAwal, $tahunAkhir])`),
bukan dengan membuang data lama. Ini rancangan yang benar dan harus dijelaskan
begitu di laporan: gudang data menyimpan seluruh riwayat, dashboard menyajikan
jendela kohort. Jangan menulis "data dibatasi menjadi 2023–2025" seolah data
lama dihapus.

Daftar tabel nyata di basis data: `users`, `alumni_profiles`, `lowongans`,
`career_analyses`, `career_chat_messages`, `search_logs`, `staging_alumni`,
`dim_alumni`, `dim_program_studi`, `dim_waktu`, `dim_status_kerja`,
`dim_keselarasan`, `fact_tracer_alumni`.

---

# JALUR A — Revisi dosen pembimbing (Bab 3 dan Bab 4)

## A1. Bab 1 — Ruang Lingkup

**A1.1 — [330] Batasan kohort belum disebutkan.**
Sekarang butir ini hanya membahas basis data dan star schema. Tambahkan satu
butir baru di bawahnya:

> Populasi yang dianalisis pada dashboard dibatasi pada kohort tracer study
> TS-1 sampai TS-3, yaitu lulusan tiga tahun terakhir terhitung dari tahun
> survei. Data lulusan di luar jendela tersebut tetap tersimpan di dalam gudang
> data sebagai riwayat, tetapi tidak diikutsertakan dalam perhitungan indikator
> kinerja utama.

**A1.2 — [332] Batasan Random Forest menyebut "probabilitas kesesuaian bidang pekerjaan".**
Ini sekarang bertabrakan dengan modul keselarasan yang baru. Kesesuaian bidang
sudah menjadi **hasil pengukuran dari jawaban kuesioner**, bukan hasil prediksi
model. Ubah butir ini menjadi hanya menyebut satu sasaran klasifikasi, yaitu
kelayakan lulusan terhadap IKU-1, dan hapus frasa "probabilitas kesesuaian
bidang pekerjaan".

**A1.3 — [326] Tujuan ketiga juga menyebut "probabilitas kesesuaian karier".**
Sama alasannya dengan A1.2. Perbaiki agar konsisten.

## A2. Bab 2 — Tinjauan Pustaka

**A2.1 — [431] Kalimat penutup subbab OLAP.**
Berbunyi "...persentase keselarasan bidang, dan sebaran demografi karier alumni
secara real-time dan interaktif." Dua masalah: (a) frasa **real-time** harus
dihapus di seluruh laporan — dashboard menghitung ulang saat halaman dimuat,
bukan secara sinambung; (b) kalimat ini sekarang justru menjadi tepat karena
keselarasan sudah benar-benar ada, jadi pertahankan isinya dan cukup ganti
"secara real-time dan interaktif" menjadi "pada saat halaman dimuat".

**A2.2 — [436] Gambar 2.1 "Rancangan skema bintang basis data analitik".**
Gambar harus digambar ulang. Sekarang menampilkan empat tabel dimensi.
Tambahkan **`dim_keselarasan`** sebagai dimensi kelima, dengan kolom
`keselarasan_key` (PK), `hubungan_bidang`, `kategori_horizontal`,
`tingkat_pendidikan_sesuai`, `kategori_vertikal`, terhubung ke
`fact_tracer_alumni.keselarasan_key`. Beri catatan pada gambar bahwa relasi ini
**opsional (nullable)** karena hanya terisi untuk alumni yang bekerja atau
berwirausaha.

**A2.3 — [440] Uraian Tabel Fakta.**
Sebutkan `keselarasan_key` di antara kunci tamu tabel fakta, dan jelaskan sekali
mengapa ia boleh kosong. Ini titik yang paling mungkin ditanyakan penguji:
tabel fakta biasanya tidak punya kunci tamu kosong. Jawabannya: percabangan
instrumen tracer study — pertanyaan keselarasan hanya ditanyakan kepada
responden yang bekerja.

**A2.4 — [432]–[444] Subbab Star Schema.**
Tambahkan satu paragraf tentang **dimensi terkonformasi (conformed dimension)**.
`dim_keselarasan` berisi 20 baris tetap hasil perkalian 5 tingkat hubungan
bidang dengan 4 tingkat pendidikan; ia bukan dimensi yang tumbuh mengikuti data,
melainkan tabel referensi kategori. Ini pembenaran rancangan yang layak ditulis.

**A2.5 — Subbab baru: Konsep Keselarasan Lulusan.**
Belum ada sama sekali di Bab 2. Sisipkan sebagai subbab di bawah 2.2 (Konsep
Tracer Study), memuat:
- keselarasan **horizontal** = kesesuaian bidang studi dengan bidang pekerjaan;
- keselarasan **vertikal** = kesesuaian jenjang pendidikan dengan tingkat
  pekerjaan, dengan catatan bahwa kategori "sama" adalah hasil yang diharapkan,
  sedangkan "rendah" menandakan *underemployment*;
- tabel pemetaan jawaban kuesioner ke kategori (isinya sama dengan A3.7).

Tanpa subbab ini, Bab 4 akan menyajikan dua grafik yang landasan teorinya tidak
pernah dibangun.

## A3. Bab 3 — Analisa dan Perancangan

**A3.1 — [619] Modul Analitik Multidimensi (OLAP).**
Kalimatnya: "...melalui operasi roll-up, drill-down, dan slice-and-dice secara
real-time [30]." Tiga koreksi sekaligus:
- hapus **slice-and-dice** dan **real-time**;
- rujukan **[30]** salah tempat — itu makalah optimasi indeks MySQL, bukan
  rujukan operasi OLAP (lihat B6);
- tambahkan keselarasan sebagai luaran modul ini.

Usulan pengganti:

> Modul Analitik Multidimensi (OLAP): Sistem tidak lagi menyimpan data kuesioner
> dalam bentuk tabel datar yang terisolasi, melainkan mentransformasikannya ke
> dalam Data Warehouse berbasis Star Schema. Hal ini memfasilitasi pembuatan
> dashboard analitik bagi Admin untuk memantau Indikator Kinerja Utama melalui
> operasi peringkasan (roll-up) menurut tahun kelulusan dan program studi,
> penelusuran rinci (drill-down) pada tabulasi silang program studi terhadap
> status kerja, serta penyaringan menurut jendela kohort TS-1 sampai TS-3.
> Sejak revisi terakhir, dashboard juga menyajikan keselarasan horizontal dan
> keselarasan vertikal lulusan yang dihitung dari dimensi keselarasan.

**A3.2 — [623] Tabel 3.2 Perbandingan Sistem Berjalan dan Sistem Usulan.**
Tambahkan satu baris:

| Aspek | Sistem Berjalan | Sistem Usulan |
|---|---|---|
| Pengukuran keselarasan lulusan | Tidak diukur; kesesuaian bidang kerja hanya diperkirakan dari nama jabatan pada berkas rekapitulasi | Diukur dari dua pertanyaan kuesioner, lalu dipetakan ke kategori keselarasan horizontal dan vertikal pada dimensi tersendiri di gudang data |

**A3.3 — [663] Tabel 3.4 Daftar Definisi Use Case.**
UC-02 "Mengelola Profil & Kuesioner" masih berbunyi "pengisian dan pembaruan
data diri, rekam jejak pekerjaan, dan kuesioner evaluasi kampus". Perluas
deskripsinya agar menyebut percabangan: alumni yang menjawab bekerja atau
berwirausaha akan mendapat empat pertanyaan lanjutan mengenai jabatan, bidang
pekerjaan, keeratan hubungan bidang studi, dan tingkat pendidikan yang paling
sesuai.

**A3.4 — [719] Tabel 3.6 Skenario Use Case: Mengakses Dashboard OLAP.**
Langkah 4 berbunyi "membedah data tahun 2025 berdasarkan Kota". **Tidak ada
dimensi lokasi di sistem.** Ganti dengan penelusuran yang benar-benar ada:
membedah satu program studi menjadi rincian status kerja, atau membedah kohort
menjadi rincian keselarasan horizontal. Tambahkan pula langkah awal bahwa sistem
memuat data terbatas pada jendela kohort TS-1 s.d. TS-3.

**A3.5 — [747] Tabel 3.7 Deskripsi Kelas, baris `OlapAnalytics`.**
Metode yang disebut, `getDrillDownData()` dan `getRollUpData()`, tidak ada di
kode. Yang ada satu metode `olapData()` di `AlumniController` yang mengembalikan
seluruh agregasi dalam satu tanggapan JSON. Perbarui deskripsinya agar sesuai,
dan sebutkan bahwa keluarannya kini memuat blok `kohort`, `keselarasanH`, dan
`keselarasanV`.

**A3.6 — [790]–[807] Activity Diagram.**
- Gambar 3-10 (Pengisian Kuesioner): tambahkan **decision node** setelah
  pengisian status kerja. Cabang "bekerja/wirausaha" menuju empat pertanyaan
  keselarasan; cabang lain langsung menuju simpan. Ini inti revisi dosen dan
  paling mudah terlihat di diagram.
- Gambar 3-12 (Pemrosesan OLAP) dan paragraf [807]: hapus "operasi Slice untuk
  memotong data", ganti dengan penyaringan jendela kohort. Tambahkan langkah
  gabungan (join) ke `dim_keselarasan`.

**A3.7 — [813]–[830] ERD (3.2.1). Perbaikan paling besar di Bab 3.**

Lima entitas yang dinamakan sekarang — User, Alumni_Profile, Kuesioner_Tracer,
Lowongan_Kerja, Log_Prediksi — **tiga di antaranya tidak pernah dibuat**.
Tabel yang benar-benar ada: `users`, `alumni_profiles`, `lowongans`,
`career_analyses`, `career_chat_messages`, `search_logs`.

Yang harus dilakukan:
- Hapus entitas **Kuesioner_Tracer**. Jawaban kuesioner tersimpan sebagai kolom
  di `alumni_profiles`, bukan tabel terpisah. Jelaskan alasannya: satu alumni
  hanya memiliki satu berkas tracer study yang diperbarui, sehingga relasi
  satu-ke-satu digabung ke satu tabel.
- Hapus entitas **Log_Prediksi**. Ganti dengan **`career_analyses`** dan
  **`career_chat_messages`** yang benar-benar ada, atau hilangkan sama sekali
  bila tidak ingin membahas modul analisis karier di ERD.
- Ganti nama **Lowongan_Kerja** menjadi **`lowongans`**.
- Tambahkan **`search_logs`** bila log pencarian ingin dimasukkan.
- Pada uraian `alumni_profiles`, tambahkan empat kolom baru: `jabatan`,
  `bidang_pekerjaan`, `kesesuaian_bidang`, `tingkat_pendidikan_sesuai`.
- [830] mengklaim normalisasi sampai 3NF. Setelah empat kolom itu masuk ke
  `alumni_profiles`, pernyataan itu masih dapat dipertahankan karena keempatnya
  bergantung penuh pada kunci utama. Namun sebaiknya ditambahkan kalimat bahwa
  kolom-kolom tersebut bernilai kosong bagi responden yang tidak bekerja,
  sebagai konsekuensi percabangan instrumen.
- Gambar ERD-nya harus digambar ulang mengikuti perubahan di atas.

**A3.8 — [816] Kalimat pembuka ERD.**
Selain penggantian MySQL (lihat B3), tambahkan kalimat penghubung bahwa keempat
kolom keselarasan pada basis data operasional inilah yang kemudian dimuat ke
`dim_keselarasan` pada gudang data.

**A3.9 — [834] Salah label.**
Berbunyi "kamus data untuk basis data operasional **(OLAP)**". Harus **(OLTP)**.
Ini salah ketik yang langsung terlihat penguji.

**A3.10 — [836]–[866] Tabel 3.8 `users`.**
Kolom `username` tidak ada; autentikasi memakai `email`. Perbaiki menjadi
`name`, `email`, `email_verified_at`, `password`, `role`, `remember_token`,
`created_at`, `updated_at`.

**A3.11 — [868]–[906] Tabel 3.9 `alumni_profiles`. Perbaikan menyeluruh.**
Kolom yang tercantum sekarang (`nim`, `nama_lengkap`, `teks_keahlian`) tidak
ada di tabel nyata. Ganti seluruh isi tabel dengan kolom yang benar:

| Nama Field | Tipe Data | Ukuran | Keterangan |
|---|---|---|---|
| id | BigInt | 20 | Primary Key, Auto Increment |
| user_id | BigInt | 20 | Foreign Key ke tabel users |
| nama | Varchar | 100 | Nama lengkap alumni |
| gender | Char | 1 | L atau P |
| jenjang | Varchar | 10 | D3 atau S1 |
| program_studi | Varchar | 50 | Program studi asal |
| specialisasi | Varchar | 50 | Spesialisasi program studi |
| pengalaman_kerja | Varchar | 10 | Ya atau Tidak |
| tahun_masuk | Year | 4 | Tahun mulai kuliah |
| tahun_lulus | Year | 4 | Tahun kelulusan |
| tanggal_lulus | Date | – | Tanggal kelulusan, dasar hitung masa tunggu |
| tanggal_mulai_bekerja | Date | – | Tanggal mulai bekerja pertama |
| ipk | Decimal | 3,2 | Indeks Prestasi Kumulatif |
| status_bekerja | Varchar | 50 | Lima kategori status kerja |
| masa_tunggu_bulan | Int | 11 | Dihitung sistem dari selisih dua tanggal |
| gaji_juta | Decimal | 8,2 | Gaji pertama dalam juta rupiah |
| lulus_tepat_waktu | TinyInt | 1 | Dihitung sistem dari masa studi |
| **jabatan** | **Varchar** | **100** | **Nama jabatan pekerjaan saat ini** |
| **bidang_pekerjaan** | **Varchar** | **100** | **Bidang usaha tempat bekerja** |
| **kesesuaian_bidang** | **Varchar** | **50** | **Keeratan hubungan bidang studi dengan pekerjaan (5 tingkat)** |
| **tingkat_pendidikan_sesuai** | **Varchar** | **50** | **Tingkat pendidikan yang paling sesuai menurut responden (4 pilihan)** |
| created_at / updated_at | Timestamp | – | Waktu dibuat dan diubah |

Empat baris tebal adalah tambahan hasil revisi dosen.

**A3.12 — [908]–[942] Tabel 3.10 `kuesioner_tracers`. HAPUS.**
Tabel ini tidak ada. Perhatikan juga bahwa di dalamnya ada kolom
`keselarasan_bidang TinyInt (1=Selaras, 0=Tidak Selaras)` — rancangan lama yang
sudah **digantikan** oleh dua kolom berskala lima dan empat tingkat. Menyimpan
tabel ini berarti laporan memuat dua rancangan keselarasan yang saling
bertentangan.

**A3.13 — [944]–[974] Tabel 3.11 `lowongan_kerjas` → `lowongans`.**
Nama tabel salah. Kolom `vektor_kompetensi JSON` juga tidak ada; pembobotan
TF-IDF dihitung saat kueri dijalankan, tidak disimpan. Kolom yang benar:
`id`, `judul_posisi`, `perusahaan`, `lokasi`, `gaji_min`, `gaji_max`,
`keahlian` (JSON), `deskripsi`, `sumber_url`, `aktif`, `created_at`,
`updated_at`.

**A3.14 — [977]–[1003] Tabel 3.12 `log_prediksis`. HAPUS atau GANTI.**
Tidak ada. Bila ingin mempertahankan lima tabel di kamus data, ganti dengan
`career_analyses`. Bila tidak, kamus data cukup empat tabel dan penomoran
Tabel 3.8–3.11 disesuaikan.

**A3.15 — Kamus data gudang data belum ada sama sekali.**
Bab 3 hanya memuat kamus data OLTP. Tambahkan subbab **3.2.3 Kamus Data Gudang
Data**, memuat enam tabel: `staging_alumni`, `dim_alumni`, `dim_program_studi`,
`dim_waktu`, `dim_status_kerja`, `dim_keselarasan`, dan `fact_tracer_alumni`.
Ini bagian yang paling sering ditanyakan pada TA bertema OLAP, dan sekarang
kosong. Isi `dim_keselarasan`:

| Nama Field | Tipe Data | Ukuran | Keterangan |
|---|---|---|---|
| keselarasan_key | BigInt | 20 | Primary Key, Auto Increment |
| hubungan_bidang | Varchar | 50 | Jawaban mentah, 5 tingkat |
| kategori_horizontal | Varchar | 20 | Selaras / Tidak Selaras |
| tingkat_pendidikan_sesuai | Varchar | 50 | Jawaban mentah, 4 pilihan |
| kategori_vertikal | Varchar | 20 | Tinggi / Sama / Rendah |

Sertakan tabel pemetaannya:

| Jawaban keeratan bidang | Kategori horizontal |
|---|---|
| Sangat erat / Erat / Cukup erat | Selaras |
| Kurang erat / Tidak sama sekali | Tidak Selaras |

| Jawaban tingkat pendidikan | Kategori vertikal |
|---|---|
| Setingkat lebih tinggi | Tinggi |
| Tingkat yang sama | Sama |
| Setingkat lebih rendah / Tidak perlu pendidikan tinggi | Rendah |

Jelaskan sekali bahwa "Tinggi" berarti pekerjaan menuntut pendidikan lebih
tinggi daripada yang dimiliki, dan "Rendah" menandakan lulusan bekerja di bawah
jenjangnya. Tanpa penjelasan ini, pembaca akan mengira "Tinggi" adalah hasil
yang baik.

**A3.16 — [1012]–[1015] Rancangan Antarmuka Halaman Pengisian Kuesioner.**
Uraiannya masih menyebut alur lama: masuk dengan NIM lalu formulir *pre-populated*.
Sistem sekarang memakai autentikasi akun, dan formulir memuat percabangan.
Perbarui uraian, dan **ganti gambar rancangannya** agar memperlihatkan blok
pertanyaan lanjutan yang muncul hanya bila status kerja bernilai bekerja atau
wirausaha.

**A3.17 — [1028]–[1031] Rancangan Antarmuka Dashboard Analitik (OLAP).**
Sekarang hanya menyebut donut chart dan bar chart. Tambahkan dua komponen baru:
diagram batang bertumpuk keselarasan horizontal per program studi, dan diagram
batang bertumpuk keselarasan vertikal per program studi. Hapus frasa
"Slice and Dice" dan "secara instan". Ganti gambar rancangannya.

## A4. Bab 4 — Implementasi dan Pengujian

**A4.1 — Subbab baru: komposisi data yang dipakai.**
Belum ada di mana pun. Sisipkan sebelum 4.1.2, memuat tabel angka acuan di
bagian atas dokumen ini. Wajib menyebut secara terbuka bahwa tabel fakta memuat
216 baris untuk lulusan 2021–2026, sedangkan dashboard menyajikan 127 alumni
kohort TS-1 s.d. TS-3. **Ini titik revisi dosen yang paling utama** — angka 216
yang selama ini muncul di dashboard adalah seluruh isi tabel fakta tanpa
penyaringan kohort, dan itulah yang dikoreksi.

**A4.2 — [1083]–[1086] Halaman Dashboard Analitik (OLAP).**
Uraian sekarang: donut chart status kerja + bar chart IPK dan gaji + filter
"Slice and Dice ... secara real-time". Tulis ulang:
- hapus **Slice and Dice** dan **real-time**;
- sebutkan label kohort yang tampil di dashboard, "Kohort TS-1 s.d. TS-3
  (lulusan 2023–2025)";
- tambahkan dua grafik keselarasan beserta angkanya (68/10 dan 23/52/3 dari 78
  alumni bekerja);
- tegaskan bahwa penyebut kedua grafik adalah **78 alumni yang bekerja**, bukan
  127 alumni kohort. Penguji hampir pasti menanyakan ini.

**A4.3 — Dua gambar baru di Bab 4.**
Tangkapan layar `KeselarasanHorizontalChart` dan `KeselarasanVertikalChart`.
Beri nomor Gambar 4-6 dan 4-7, lalu geser penomoran gambar sesudahnya.

**A4.4 — [1075]–[1078] Halaman Form Kuesioner.**
Uraiannya masih menyebut data *pre-populated* dan NIM. Perbarui, dan tambahkan
tangkapan layar bagian pertanyaan keselarasan yang muncul setelah status kerja
dipilih.

**A4.5 — [1201] Tabel 4.3 skenario 1: "keempat tabel dimensinya".**
Sekarang lima. Perbaiki, dan perbarui kolom Hasil Pengujian dengan angka kohort.

**A4.6 — Tabel 4.3: tambahkan dua skenario pengujian baru.**

| No | Skenario | Hasil yang Diharapkan | Hasil Pengujian |
|---|---|---|---|
| 6 | Penyaringan populasi menurut jendela kohort TS-1 s.d. TS-3 | Dashboard hanya menghitung lulusan tiga tahun terakhir; lulusan di luar jendela tetap tersimpan tetapi tidak ikut diagregasi | Dari 216 baris tabel fakta, 127 baris masuk perhitungan (lulusan 2023–2025); label kohort tampil pada dashboard |
| 7 | Peringkasan keselarasan horizontal dan vertikal per program studi | Kedua grafik memakai penyebut alumni bekerja, bukan seluruh kohort; alumni tanpa jawaban keselarasan tidak dihitung | Penyebut 78 alumni bekerja. Horizontal: Selaras 68 (87,2%), Tidak Selaras 10 (12,8%). Vertikal: Tinggi 23 (29,5%), Sama 52 (66,7%), Rendah 3 (3,8%) |

**A4.7 — Tabel 4.2: tambahkan skenario percabangan kuesioner.**

| No | Skenario | Hasil yang Diharapkan | Hasil Pengujian |
|---|---|---|---|
| 6 | Alumni memilih status "Melanjutkan Studi" setelah sebelumnya mengisi pertanyaan keselarasan | Empat medan keselarasan disembunyikan dan nilainya dikosongkan, tidak tersimpan sebagai sisa isian sebelumnya | Medan jabatan, bidang pekerjaan, keeratan bidang, dan tingkat pendidikan dikosongkan; baris tersimpan tanpa nilai keselarasan dan kunci dimensi keselarasan bernilai kosong pada tabel fakta |

**A4.8 — [1223]–[1247] Tabel 4.4 Pengujian Random Forest.**
Angka-angkanya (215 sampel, akurasi 0,674) berasal dari populasi **seluruh
lulusan**, sedangkan dashboard kini menampilkan kohort 127. Tambahkan satu
kalimat pengantar sebelum tabel yang menyatakan populasi mana yang dipakai
model, agar tidak terbaca sebagai ketidakcocokan angka. Bila model dilatih ulang
pada kohort saja, seluruh angka pada tabel ini harus diukur ulang — jangan
menyalin angka lama.

**A4.9 — [1247] "Panel menampilkan 215 baris ... 163 tepat waktu dan 52 tidak".**
Periksa apakah `TepatWaktuPanel` sudah ikut disaring kohort. Bila sudah, angka
215/163/52 harus diperbarui. Bila belum, tuliskan secara jujur bahwa panel ini
memakai seluruh populasi sementara grafik OLAP memakai kohort, dan jelaskan
alasannya.

**A4.10 — [1105]–[1117] Lingkungan Pengujian.**
Tambahkan satu butir bahwa pengujian keselarasan menuntut basis data terisi
melalui `php artisan etl:sync` agar `dim_keselarasan` dan kunci tamunya
terbentuk.

## A5. Bab 5 — Penutup

**A5.1 — [1284] Kesimpulan butir OLAP.**
Berbunyi "...skema bintang yang terdiri atas satu tabel fakta dan **empat tabel
dimensi**". Sekarang **lima**. Tambahkan pula kalimat mengenai penyajian
keselarasan horizontal dan vertikal pada jendela kohort TS-1 s.d. TS-3.

**A5.2 — [1289] Saran kedua sudah tidak berlaku.**
Berbunyi "Jawaban kuesioner alumni saat ini tersimpan pada tabel operasional dan
belum dialirkan ke dalam skema bintang". **Ini sudah dikerjakan** —
`EtlService::syncProfile()` memindahkan profil ke staging lalu ke skema bintang
setiap kali kuesioner disimpan. Butir saran ini harus dihapus atau diubah
menjadi pencapaian di bagian Kesimpulan. Membiarkannya berarti laporan
menyarankan sesuatu yang sudah ada di dalam sistemnya sendiri.

**A5.3 — Tambahkan satu butir kesimpulan mengenai keselarasan.**
Sistem sekarang mengukur dua indikator keselarasan langsung dari jawaban
kuesioner dan menyajikannya per program studi. Ini luaran revisi dosen yang
paling nyata dan belum tercermin di Bab 5 sama sekali.

**A5.4 — Tambahkan satu butir saran.**
Batas kohort tiga tahun membuat jumlah responden mengecil dari 216 menjadi 127.
Saran: perluasan pengumpulan data pada kohort berjalan agar setiap tahun
kelulusan memiliki jumlah responden yang memadai untuk pembandingan antar
program studi.

---

# JALUR B — Migrasi MySQL → PostgreSQL

Kerjakan hanya bila migrasi benar-benar dijalankan. Dasar teori dan daftar
pustakanya sudah tersedia di `docs/rujukan-postgresql-data-warehouse.md`.

**Aturan yang tidak boleh dilanggar:** jangan pernah menulis bahwa MySQL tidak
dapat dipakai sebagai gudang data. Rumusan yang benar adalah **keduanya bisa,
PostgreSQL menyediakan dukungan operasi OLAP bawaan yang lebih lengkap**.
Dokumen `docs/rujukan-mysql-data-warehouse.md` memuat bukti sebaliknya, dan
penguji yang membaca keduanya akan melihat perubahan pendirian tanpa alasan.

Berikut seluruh 15 penyebutan MySQL beserta perlakuannya.

**B1 — [192] Daftar Isi, entri "2.4.4 MySQL".**
Perbarui setelah judul subbabnya diganti. Bangun ulang seluruh Daftar Isi di
akhir, jangan mengetik manual.

**B2 — [330] Ruang Lingkup.**
"Sistem manajemen basis data menggunakan MySQL yang dirancang secara spesifik
menggunakan pendekatan multidimensi (Star Schema)." Ganti MySQL → PostgreSQL.

**B3 — [527] Daftar tech stack.**
Ganti nama.

**B4 — [538] Judul subbab 2.4.4 "MySQL" → "PostgreSQL".**

**B5 — [539] Paragraf definisi MySQL, merujuk [30].**
Tulis ulang seluruhnya sebagai definisi PostgreSQL. Rujuk buku [P4]
Dombrovskaya dkk. (2024) atau [P5] Shaik (2020), bukan [30].

**B6 — [541] Paragraf pembenaran. Butir terpenting di Jalur B.**
Berbunyi: "Meskipun secara konvensional digunakan untuk basis data
transaksional, kapabilitas mesin penyimpanan MySQL sangat memadai untuk
dikonfigurasi sebagai fondasi Data Warehouse..."

Struktur argumennya tetap dipakai, isinya diganti. Gunakan rangkuman satu
paragraf yang sudah disiapkan di `docs/rujukan-postgresql-data-warehouse.md`
§6.3, yang bertumpu pada tiga hal terverifikasi dari manual resmi PostgreSQL:
`GROUPING SETS`/`ROLLUP`/`CUBE` (MySQL 8.0 hanya punya `WITH ROLLUP`), partisi
deklaratif dengan *partition pruning* pada tahap perencanaan maupun eksekusi,
dan indeks BRIN.

Satu peringatan yang harus ikut ditulis sebagai batasan: pada tabel fakta
berukuran ratusan baris, partisi dan BRIN **belum memberi peningkatan terukur**.
Manual PostgreSQL sendiri menyatakan ambangnya adalah ketika ukuran tabel
melampaui memori fisik peladen. Sampaikan keduanya sebagai rancangan
skalabilitas, bukan sebagai optimasi yang sudah terbukti. Menyatakannya begini
justru lebih kuat daripada mengklaim manfaat yang tidak terjadi.

**B7 — [568] Notasi Class Diagram.**
"Menjadi acuan utama dalam membangun struktur Star Schema pada database MySQL."
Ganti nama.

**B8 — [761] Tabel 3.7, baris OlapAnalytics.**
"...query langsung ke Skema Bintang pada basis data MySQL." Ganti nama.
Perhatikan bahwa baris ini juga kena revisi A3.5.

**B9 — [816] Kalimat pembuka ERD.** Ganti nama. Kena juga oleh A3.8.

**B10 — [832] Kalimat pembuka Kamus Data.** Ganti nama. Kena juga oleh A3.9.

**B11 — [1042] Bab 4, spesifikasi penyimpanan.**
"...mempercepat proses build dan query ke Data Warehouse." Tidak menyebut MySQL,
tetapi periksa konsistensinya dengan B12.

**B12 — [1050] Web Server: "XAMPP atau Laragon".**
Keduanya membundel MySQL/MariaDB, bukan PostgreSQL. Ganti menjadi peladen
pengembangan Laravel (`php artisan serve`) dengan PostgreSQL yang dipasang
tersendiri, atau sebutkan Docker bila itu yang dipakai. **Jangan biarkan XAMPP
tertulis bersamaan dengan PostgreSQL** — itu tanda naskah belum disisir.

**B13 — [1059] DBMS pada Perangkat Lunak.**
"MySQL (digunakan untuk mengelola basis data transaksional operasional dan
repositori Data Warehouse berbasis Star Schema)." Ganti menjadi PostgreSQL, dan
cantumkan nomor versi yang benar-benar dipakai.

**B14 — [1111] Lingkungan Pengujian, penyimpanan.**
"...kecepatan Read/Write pada basis data MySQL." Ganti nama.

**B15 — [1116] Lingkungan Pengujian, web server.**
"Apache dan MySQL (menggunakan environment XAMPP atau Laragon)." Sama dengan
B12.

**B16 — [1279] Kesimpulan butir pertama.**
"...dan MySQL sebagai basis data." Ganti nama.

**B17 — [1326] Daftar Pustaka rujukan [30].**
Maesaroh dkk., *"Query Optimization in MySQL Database Using Index"* (2022).
Rujukan ini menjadi tidak relevan setelah migrasi. Dipakai di dua tempat: [539]
dan [619] — keduanya salah tempat bahkan sebelum migrasi, karena [619] membahas
operasi OLAP, bukan indeks MySQL.

Penggantinya, sesuai urutan prioritas di
`docs/rujukan-postgresql-data-warehouse.md` §7:
1. **[P1] Joiner dkk. (2024) IEEE SysCon** — bukti langsung PostgreSQL sebagai
   gudang data. DOI `10.1109/syscon61195.2024.10553614`.
2. **[P3] Ramadhani dkk. (2021) IEEE ICAIBDA** — gudang data + dashboard +
   PostgreSQL + Kimball, peneliti Universitas Padjadjaran, Bandung.
   DOI `10.1109/icaibda53487.2021.9689697`.
3. **Dokumentasi resmi PostgreSQL** — untuk `GROUPING SETS`/`ROLLUP`/`CUBE`,
   partisi, dan BRIN.
4. **[P8] Wijaya & Novaldi (2025)** — star schema + PostgreSQL berbahasa
   Indonesia. DOI `10.47233/jibs.v3i3.3759`.

Setelah [30] dihapus, seluruh penomoran rujukan sesudahnya bergeser. Periksa
seluruh sitasi dalam kurung siku di badan laporan.

**B18 — Pekerjaan teknis yang harus selesai sebelum Bab 4 ditulis ulang.**
Bab 4 melaporkan hasil, jadi migrasi kodenya harus jalan lebih dulu. Yang tidak
berpindah otomatis dari Laravel:
- seluruh `selectRaw()` di `AlumniController.php` — sudah memakai
  `CASE WHEN ... END`, jadi aman; periksa ulang tidak ada `IF()` atau `IFNULL()`
  yang tersisa;
- `DB::statement('SET FOREIGN_KEY_CHECKS=0')` di `EtlService::rebuildStarSchema()`
  **tidak ada di PostgreSQL** dan akan gagal. Ganti dengan
  `TRUNCATE ... RESTART IDENTITY CASCADE` atau urutkan penghapusan dari tabel
  fakta lebih dahulu. Ini kegagalan paling pasti terjadi saat migrasi;
- `truncate()` pada tabel bertautan kunci tamu berperilaku berbeda;
- nama tabel dan kolom menjadi peka huruf besar-kecil bila diberi tanda kutip.

---

# Urutan pengerjaan yang disarankan

1. **Jalur A dulu, seluruhnya.** Ini revisi yang diminta dosen dan sistemnya
   sudah jadi. Laporan tinggal menyusul.
2. Putuskan migrasi PostgreSQL secara terpisah. Bila diambil, jalankan B18
   lebih dahulu sampai sistem benar-benar berjalan di PostgreSQL, baru tulis
   B1–B17.
3. Terakhir, sekali jalan: bangun ulang Daftar Isi, Daftar Tabel, dan Daftar
   Gambar; sisir seluruh kemunculan **"real-time"** dan **"slice-and-dice"**;
   samakan format keterangan tabel menjadi `Tabel X.Y`.

# Yang tidak boleh ditulis

- Jangan menyatakan MySQL tidak mampu menjadi gudang data (B6).
- Jangan mengutip angka percepatan 2800× dari [P1] sebagai capaian penelitian
  ini. Angka itu berlaku pada data sensor berukuran terabita, bukan pada tabel
  fakta ratusan baris.
- Jangan menyebut Cosine Similarity mengekstraksi entitas atau mencocokkan
  secara semantik. Yang dihitung adalah kemiripan vektor bobot kata.
- Jangan mengklaim kebaruan mutlak. Pakai "belum banyak ditemukan".
- Jangan menyajikan capaian model klasifikasi sebagai bukti kemampuan prediksi
  selama variabel target masih dibentuk dari variabel yang juga dipakai sebagai
  fitur masukan. Saran [1290] sudah mengakui hal ini — pertahankan.
