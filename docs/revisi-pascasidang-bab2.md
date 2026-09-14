# Revisi Pascasidang — Bab 2

Menjawab butir revisi nomor 2: *"Penggunaan istilah-istilah dalam tracer study
dimasukkan ke Bab 2, pada bagian keselarasan harus disertakan dasar/bukti yang
konkret. Kemudian untuk kategori keselarasan hanya gunakan istilah selaras dan
tidak selaras sesuai Kemendikti."*

Disusun 2026-08-26. Tiga bagian:

- **Bagian A** — subbab baru daftar istilah *Tracer Study* (butir revisi: istilah masuk Bab 2)
- **Bagian B** — subbab keselarasan beserta dasar rujukannya (butir revisi: dasar konkret)
- **Bagian C** — penetapan kategori Selaras/Tidak Selaras (butir revisi: istilah Kemendikti)

Teks di dalam blok kutipan (`>`) siap tempel ke laporan. Teks di luar blok
kutipan adalah catatan kerja untuk Anda, jangan ditempel.

> **Peringatan pada Bagian C.** Pemetaan keselarasan vertikal **belum final**
> karena gambar saran dosen belum saya terima. Bagian C memuat dua opsi beserta
> angkanya masing-masing. Pilih satu, baru Bab 4 bisa dibekukan.

---

## Dokumen ini menggantikan sebagian `naskah-revisi-bab2.md`

Berkas `naskah-revisi-bab2.md` (revisi Jalur A, sebelum sidang) menulis pada
subbab 2.2.x dan Tabel 2.x bahwa keselarasan vertikal *"diringkas menjadi tiga
kategori"*, yaitu Tinggi, Sama, dan Rendah. **Itu justru yang ditolak penguji.**
Bagian B dan C di bawah menggantikan subbab 2.2.x dan Tabel 2.x pada berkas
tersebut. Bagian lain `naskah-revisi-bab2.md` (Tabel 2.1, Tabel 2.2, paragraf
[388], [431], [440], [442], [444], subbab PostgreSQL) tetap berlaku.

Satu baris pada **Tabel 2.1** juga harus disunting. Baris "Keselarasan Vertikal"
di sana masih berbunyi *"Diringkas menjadi 3 kategori: Tinggi; Sama; Rendah"* —
ganti menjadi *"Diringkas menjadi 2 kategori: Selaras; Tidak Selaras"*.

---

# Bagian A — Subbab baru: Istilah dalam *Tracer Study*

**Letak yang disarankan:** subbab tersendiri di bawah 2.2, **sebelum** subbab
keselarasan. Alasannya berurutan: istilah kohort, tahun survei, dan responden
bekerja dipakai di dalam definisi keselarasan, jadi harus diperkenalkan lebih
dulu. Bila diberi nomor 2.2.2, maka keselarasan menjadi 2.2.3.

> **2.2.2 Istilah dalam *Tracer Study***
>
> Pembahasan pada subbab-subbab berikutnya serta penyajian hasil pada Bab 4
> menggunakan sejumlah istilah baku yang berlaku dalam penyelenggaraan *Tracer
> Study*. Istilah-istilah tersebut dihimpun pada Tabel 2.x beserta perwujudannya
> di dalam sistem yang dibangun, agar pembacaan hasil analisis tidak menimbulkan
> penafsiran ganda.
>
> **Tabel 2.x Istilah dalam *Tracer Study* dan Perwujudannya pada Sistem**
>
> | Istilah | Pengertian | Perwujudan pada Sistem |
> |---|---|---|
> | *Tracer Study* | Penelusuran jejak lulusan yang dilakukan perguruan tinggi untuk memperoleh keterangan mengenai keadaan lulusan setelah meninggalkan bangku pendidikan, terutama masa peralihan dari pendidikan ke dunia kerja | Kuesioner alumni yang hasilnya dimuat ke dalam gudang data melalui proses ETL |
> | Kohort | Sekelompok lulusan yang dihimpun menurut tahun kelulusan yang sama dan diperlakukan sebagai satu satuan pengamatan | Nilai `dim_waktu.tahun_lulus` |
> | Tahun survei (*TS*) | Tahun pelaksanaan survei, dipakai sebagai titik acuan penentuan kohort yang disurvei | Parameter kueri `tahun_survei`, bawaan 2025 |
> | Kohort TS-1 | Lulusan yang disurvei satu tahun setelah tahun kelulusannya, yaitu lulusan tahun (*TS* − 1) | Untuk *TS* 2025, kohort lulusan 2024 |
> | Kohort TS-2 | Lulusan yang disurvei dua tahun setelah tahun kelulusannya, yaitu lulusan tahun (*TS* − 2) | Untuk *TS* 2025, kohort lulusan 2023 |
> | Jendela kohort | Rentang tahun kelulusan yang disertakan pada satu penyajian hasil | Rentang [(*TS* − 2), (*TS* − 1)]; untuk *TS* 2025 menjadi 2023–2024 |
> | Status bekerja | Keadaan kegiatan utama lulusan pada saat pengisian kuesioner | `dim_status_kerja.status_bekerja`, lima kategori: Bekerja; Wirausaha/*Startup*; Melanjutkan Studi; Tidak Bekerja tetapi Sedang Mencari Kerja; Belum Memungkinkan Bekerja |
> | Responden bekerja | Lulusan berstatus bekerja, yang menjadi basis perhitungan seluruh metrik ketenagakerjaan | Penyaringan `status_bekerja = 'Bekerja'` |
> | Masa tunggu kerja | Lama tenggang waktu antara kelulusan dengan perolehan pekerjaan pertama, dinyatakan dalam satuan bulan | Metrik `fact_tracer_alumni.masa_tunggu_bulan` |
> | Keselarasan horizontal | Kesesuaian antara bidang ilmu yang ditempuh lulusan dengan bidang pekerjaan yang dijalaninya | `dim_keselarasan.hubungan_bidang` → `kategori_horizontal` |
> | Keselarasan vertikal | Kesesuaian antara jenjang pendidikan yang dimiliki lulusan dengan tingkat pendidikan yang dituntut oleh pekerjaannya | `dim_keselarasan.tingkat_pendidikan_sesuai` → `kategori_vertikal` |
> | *Underemployment* | Keadaan lulusan bekerja pada posisi yang tidak menuntut jenjang pendidikan setinggi yang telah ditempuhnya, sehingga hasil pendidikan tidak termanfaatkan sepenuhnya | Kategori Tidak Selaras pada keselarasan vertikal |
> | Penyebut perhitungan | Banyaknya lulusan yang dipakai sebagai pembagi dalam perhitungan persentase suatu metrik | Berbeda antar metrik; dirinci pada Bab 4 |
>
> Perlu ditegaskan bahwa penyebut perhitungan tidak seragam untuk seluruh
> metrik. Metrik yang berlaku bagi seluruh lulusan, seperti sebaran status
> bekerja, memakai penyebut berupa banyaknya lulusan dalam jendela kohort.
> Sebaliknya, metrik yang hanya bermakna bagi lulusan yang telah bekerja,
> seperti masa tunggu kerja dan kedua jenis keselarasan, memakai penyebut
> berupa banyaknya responden bekerja. Perbedaan penyebut inilah yang menjadi
> alasan mengapa persentase pada Bab 4 tidak dapat dijumlahkan lintas metrik.

**Catatan kerja.** Baris "Status bekerja" pada tabel di atas memuat kelima
kategori persis seperti nilai yang ada di basis data. Periksa Bab 3 Anda: bila
di sana masih tertulis jumlah kategori yang berbeda, samakan dengan yang ini.

---

# Bagian B — Subbab keselarasan beserta dasar rujukan

Ini pengganti subbab 2.2.x pada `naskah-revisi-bab2.md`. Perubahan pokoknya:
keselarasan vertikal kini bermuara pada dua kategori, dan setiap pernyataan
normatif diberi tempat rujukan yang jelas.

> **2.2.3 Keselarasan Lulusan**
>
> Keselarasan lulusan merupakan ukuran kesesuaian antara pendidikan yang
> ditempuh seorang lulusan dengan pekerjaan yang dijalaninya. Ukuran ini
> menempati kedudukan penting dalam penilaian mutu pendidikan tinggi karena
> tingkat serapan kerja semata belum menggambarkan mutu penempatan lulusan.
> Seorang lulusan dapat terserap cepat oleh pasar kerja namun bekerja pada
> bidang yang tidak berkaitan dengan disiplin ilmunya, atau pada tingkat
> pekerjaan yang berada di bawah jenjang pendidikannya, sehingga hasil
> pendidikan yang telah ditempuhnya tidak termanfaatkan sepenuhnya [R1].
>
> Kedudukan keselarasan sebagai ukuran mutu lulusan memperoleh dasar
> kebijakannya pada Keputusan Menteri Pendidikan dan Kebudayaan Republik
> Indonesia Nomor 3/M/2021 tentang Indikator Kinerja Utama Perguruan Tinggi
> Negeri, yang menempatkan perolehan pekerjaan yang layak oleh lulusan sebagai
> indikator kinerja pertama [R2]. Indikator tersebut tidak berhenti pada
> pertanyaan apakah lulusan memperoleh pekerjaan, melainkan turut menimbang
> mutu pekerjaan yang diperolehnya. Penelusuran keselarasan merupakan salah
> satu cara untuk menimbang mutu tersebut.
>
> Dalam instrumen *Tracer Study* nasional yang diselenggarakan Direktorat
> Jenderal Pendidikan Tinggi, keselarasan diukur melalui dua dimensi yang
> berdiri sendiri dan tidak saling menggantikan, yaitu keselarasan horizontal
> dan keselarasan vertikal [R3]. Pemisahan kedua dimensi ini sejalan dengan
> kepustakaan mengenai ketidakselarasan pendidikan dengan pekerjaan
> (*education–job mismatch*), yang membedakan ketidakselarasan menurut bidang
> ilmu dari ketidakselarasan menurut jenjang pendidikan [R4].
>
> **Keselarasan horizontal** mengukur keeratan hubungan antara bidang ilmu yang
> ditempuh dengan bidang pekerjaan yang dijalani. Pengukurannya dilakukan
> melalui persepsi responden pada skala ordinal lima tingkat, yaitu sangat erat,
> erat, cukup erat, kurang erat, dan tidak sama sekali [R3].
>
> **Keselarasan vertikal** mengukur kesesuaian antara jenjang pendidikan yang
> dimiliki lulusan dengan tingkat pendidikan yang sesungguhnya dituntut oleh
> pekerjaannya. Pengukurannya dilakukan melalui empat pilihan jawaban, yaitu
> setingkat lebih tinggi, tingkat yang sama, setingkat lebih rendah, dan tidak
> perlu pendidikan tinggi [R3]. Pilihan "setingkat lebih tinggi" menyatakan
> bahwa pekerjaan menuntut jenjang pendidikan yang lebih tinggi daripada yang
> dimiliki lulusan, sedangkan pilihan "setingkat lebih rendah" dan "tidak perlu
> pendidikan tinggi" menyatakan keadaan sebaliknya, yaitu pekerjaan menuntut
> jenjang yang lebih rendah daripada yang telah ditempuh lulusan. Keadaan
> terakhir inilah yang dikenal sebagai *underemployment* [R1].
>
> Kedua pertanyaan keselarasan hanya diajukan kepada responden yang berstatus
> bekerja, mengikuti kaidah percabangan pada instrumen *Tracer Study*. Akibatnya
> penyebut perhitungan persentase keselarasan adalah banyaknya responden
> bekerja, bukan seluruh lulusan pada jendela kohort yang diamati. Konsekuensi
> rancangan ini terhadap struktur gudang data, yaitu kunci tamu
> `keselarasan_key` yang dirancang boleh bernilai kosong, dibahas pada
> subbab 2.3.3.

## Rujukan yang harus Anda lengkapi

Empat penanda `[R1]`–`[R4]` di atas. **Saya tidak mencantumkan nomor rujukan
karangan, dan pada sesi ini saya tidak dapat memverifikasi metadatanya** karena
penelusuran web tidak tersedia — setiap panggilan pencarian ditolak oleh galat
layanan. Jadi keempatnya harus Anda ambil sendiri dari sumber aslinya. Berikut
keterangan secukupnya agar Anda tahu persis apa yang dicari.

**[R2] adalah yang paling penting.** Inilah "dasar konkret" yang diminta
penguji, karena ia dokumen kebijakan resmi, bukan tafsiran.

| Penanda | Dipakai untuk | Yang harus dicari |
|---|---|---|
| **[R1]** | Konsep keselarasan sebagai ukuran mutu, dan *underemployment* (2 tempat) | Kepustakaan *education–job mismatch*. Cari dengan istilah Inggris **"horizontal vertical education job mismatch graduates"** atau **"overeducation underemployment graduates"** — kepustakaan internasional memakai *mismatch*, bukan *alignment*, sehingga mencari "keselarasan" saja tidak akan menemukannya |
| **[R2]** | Dasar kebijakan IKU-1 | **Keputusan Mendikbud RI Nomor 3/M/2021 tentang Indikator Kinerja Utama Perguruan Tinggi Negeri**. Anda sudah memakai *Buku Panduan IKU PTN* halaman 16 sebagai dasar rumus target Random Forest — pakai pasangan dokumen yang sama di sini agar Bab 2 dan Bab 4 bersandar pada dasar yang serupa |
| **[R3]** | Kelima pilihan keeratan dan keempat pilihan tingkat pendidikan (3 tempat) | **Instrumen/kuesioner *Tracer Study* nasional Ditjen Pendidikan Tinggi.** Kelima dan keempat pilihan pada sistem Anda diambil kata demi kata dari instrumen ini. Rujukan inilah yang membuktikan skala Anda bukan karangan sendiri. Simpan tangkapan layar butir pertanyaannya sebagai lampiran |
| **[R4]** | Pembedaan dimensi horizontal dan vertikal | Boleh memakai sumber yang sama dengan [R1] bila di dalamnya kedua dimensi memang dibedakan secara eksplisit. Bila iya, gabungkan saja menjadi satu penanda |

**Cara memakai tabel ini.** Ganti `[R1]`–`[R4]` dengan nomor rujukan sesuai
urutan pada daftar pustaka Anda, lalu tambahkan entrinya ke `daftar-pustaka.md`.
Jangan tempel naskah Bagian B ke laporan selama penandanya masih berupa `[R#]`.

**Pertanyaan penguji yang hampir pasti muncul.** Bila ditanya mengapa skala
lima tingkat dan empat pilihan itu yang dipakai, jawabannya adalah [R3]: skala
tersebut bukan rancangan sendiri melainkan salinan instrumen nasional. Pastikan
Anda benar-benar memegang dokumennya sebelum sidang perbaikan, karena jawaban
ini hanya kuat bila dokumennya bisa ditunjukkan.

---

# Bagian C — Penetapan kategori Selaras dan Tidak Selaras

Inilah inti butir revisi: penguji meminta kategori keselarasan **cukup dua**,
yaitu Selaras dan Tidak Selaras, mengikuti istilah Kemendikti.

## C.1 Keselarasan horizontal — sudah sesuai, tinggal ditegaskan

Keselarasan horizontal pada sistem **sudah** bermuara pada dua kategori. Pemetaan
ini nyata ada di kode, pada migrasi
`2026_08_14_000001_rebuild_dim_keselarasan_table.php` dan pada
`EtlService::kategoriHorizontal()`:

```php
return in_array($hubunganBidang, ['Sangat erat', 'Erat', 'Cukup erat'])
    ? 'Selaras'
    : 'Tidak Selaras';
```

Jadi untuk dimensi horizontal tidak ada yang perlu diubah, baik di kode maupun
di angka. Yang perlu Anda lakukan hanya memastikan naskah menyebutnya "Selaras"
dan "Tidak Selaras", tidak lagi menyebut kelima tingkat mentah sebagai kategori
pelaporan.

## C.2 Keselarasan vertikal — dua opsi, harus Anda pilih

Di sinilah perubahannya. Sistem sekarang meringkas empat pilihan jawaban menjadi
**tiga** kategori (Tinggi, Sama, Rendah) — inilah yang ditolak penguji. Meringkas
menjadi dua kategori mudah untuk dua pilihan terbawah, yang jelas menyatakan
*underemployment*. Yang harus diputuskan adalah nasib pilihan **"setingkat lebih
tinggi"**, yaitu keadaan ketika pekerjaan menuntut jenjang **lebih tinggi**
daripada yang dimiliki lulusan.

Sebaran jawaban nyata pada penyebut resmi (45 responden bekerja, kohort
2023–2024) adalah sebagai berikut:

| Pilihan jawaban | Jumlah | Persentase |
|---|---:|---:|
| Setingkat lebih tinggi | 12 | 26,67% |
| Tingkat yang sama | 31 | 68,89% |
| Setingkat lebih rendah | 2 | 4,44% |
| Tidak perlu pendidikan tinggi | 0 | 0,00% |
| **Jumlah** | **45** | **100,00%** |

Dari sebaran itu, kedua opsi menghasilkan angka yang jauh berbeda:

| Opsi | Selaras | Tidak Selaras | Dasar penalaran |
|---|---:|---:|---|
| **Opsi A** — "lebih tinggi" masuk Selaras | **43 (95,56%)** | **2 (4,44%)** | Tidak selaras dimaknai sebagai jenjang pendidikan yang tidak termanfaatkan. Lulusan pada pekerjaan yang menuntut jenjang lebih tinggi tidak mengalami hal itu, sehingga digolongkan selaras |
| **Opsi B** — hanya "tingkat yang sama" yang Selaras | **31 (68,89%)** | **14 (31,11%)** | Selaras dimaknai secara ketat sebagai kesetaraan jenjang. Setiap penyimpangan ke atas maupun ke bawah dihitung tidak selaras |

**Pertimbangan yang perlu Anda timbang sebelum memilih.**

Opsi A lebih dekat pada logika yang sudah dipakai sistem, karena kode memang
sudah melebur dua pilihan terbawah menjadi satu kategori — pertanda bahwa yang
diperlakukan sebagai persoalan adalah arah ke bawah, bukan arah ke atas. Opsi A
juga sejalan dengan pemaknaan *underemployment* pada Bagian B. Kelemahannya
terletak pada tampilan angkanya: 95,56% adalah angka yang sangat tinggi, dan
penguji dapat mempertanyakan apakah ukuran dengan sebaran seperti itu masih
mampu membedakan apa pun.

Opsi B menghasilkan angka yang jauh lebih berhati-hati dan lebih mudah
dipertahankan dari sisi kesan, tetapi menuntut Anda menjelaskan mengapa lulusan
yang bekerja pada posisi menuntut jenjang lebih tinggi digolongkan tidak
selaras. Penjelasan itu bisa dibuat, namun harus konsisten dengan definisi
*underemployment* di Bagian B, yang hanya menyebut arah ke bawah.

**Yang menentukan pilihan adalah gambar saran dosen Anda, bukan penalaran saya.**
Kirimkan gambarnya dan saya kunci salah satu, lengkap dengan penyesuaian
angkanya di Bab 4.

## C.3 Tabel pemetaan — pengganti Tabel 2.x

Tempel setelah paragraf keselarasan vertikal pada Bagian B. **Baris bertanda
`⟨pilih⟩` menunggu keputusan C.2.**

> **Tabel 2.x Pemetaan Jawaban Kuesioner ke Kategori Keselarasan**
>
> | Dimensi | Jawaban Responden | Kategori Pelaporan |
> |---|---|---|
> | Horizontal | Sangat erat | Selaras |
> | Horizontal | Erat | Selaras |
> | Horizontal | Cukup erat | Selaras |
> | Horizontal | Kurang erat | Tidak Selaras |
> | Horizontal | Tidak sama sekali | Tidak Selaras |
> | Vertikal | Setingkat lebih tinggi | ⟨pilih: Selaras (Opsi A) / Tidak Selaras (Opsi B)⟩ |
> | Vertikal | Tingkat yang sama | Selaras |
> | Vertikal | Setingkat lebih rendah | Tidak Selaras |
> | Vertikal | Tidak perlu pendidikan tinggi | Tidak Selaras |

Sertakan satu paragraf pengiring di bawah tabel, agar peringkasan itu tampak
sebagai keputusan beralasan dan bukan penyederhanaan sembarangan:

> Peringkasan jawaban menjadi dua kategori dilakukan pada tahap pelaporan, bukan
> pada tahap perekaman data. Jawaban responden tetap disimpan utuh pada kolom
> `hubungan_bidang` dan `tingkat_pendidikan_sesuai` di tabel dimensi, sehingga
> rincian kelima tingkat keeratan dan keempat pilihan tingkat pendidikan tetap
> dapat ditelusuri kembali apabila diperlukan. Peringkasan ini menyesuaikan
> penyajian dengan istilah baku Selaras dan Tidak Selaras, sekaligus menjaga
> agar kategori pelaporan tidak terpecah menjadi kelompok-kelompok yang terlalu
> kecil untuk dibandingkan antar program studi.

Paragraf itu sekaligus menjawab pertanyaan "mengapa data mentahnya tidak
hilang", dan itu benar: kolom mentahnya memang tetap ada di
`dim_keselarasan`.

---

## Yang masih harus dikerjakan di sisi kode (dicatat, belum dikerjakan)

Sesuai keputusan Anda, revisi ini naskah dulu. Tetapi setelah Opsi A atau B
dipilih, tiga tempat di kode masih menghasilkan **tiga** kategori vertikal dan
akan berselisih dengan naskah:

| Berkas | Yang perlu diubah |
|---|---|
| `backend/app/Services/EtlService.php` — `kategoriVertikal()` | `match` yang mengembalikan `'Tinggi'`/`'Sama'`/`'Rendah'` harus mengembalikan `'Selaras'`/`'Tidak Selaras'` |
| `backend/database/migrations/2026_08_14_000001_rebuild_dim_keselarasan_table.php` | Konstanta `TINGKAT` masih memetakan ke tiga nilai; perlu migrasi baru untuk memperbarui isi kolom `kategori_vertikal` |
| `admin/src/pages/Dashboard/Home.tsx` | **Koreksi 2026-08-26:** dasbor sama sekali **tidak punya** grafik keselarasan vertikal — tidak ada satu pun penyebutan `vertikal`/`tingkat_pendidikan` di seluruh `admin/src`. Jadi yang perlu dikerjakan bukan mengganti label, melainkan **membuat grafiknya**. Lihat pula temuan kritis pada konstanta `CHART_HUBUNGAN_BIDANG` di bawah |

Selain itu ada tiga selisih lain antara kode dan laporan yang saya temukan
sewaktu menelusuri, tidak termasuk butir revisi penguji tetapi sebaiknya Anda
ketahui sebelum sidang perbaikan:

1. **Dimensi keenam tanpa migrasi.** Tabel `dim_tahun_survei` dipakai
   `EtlService` dan `OlapController`, tetapi tidak ada berkas migrasi yang
   membuatnya — tabel itu dibentuk sendiri oleh `OlapController::tahunSurvei()`
   saat dijalankan. Naskah Bab 2 dan Bab 3 masih menyebut "lima tabel dimensi".
   Bila `dim_tahun_survei` memang dimensi, jumlahnya enam dan Gambar 2.1 harus
   digambar ulang lagi.
2. **Definisi view di luar migrasi.** `OlapController` membaca
   `v_olap_keselarasan` dan `v_olap_keselarasan_program_studi` yang memiliki
   kolom `tahun_survei` dan `keselarasan_key`, sedangkan migrasi
   `2026_08_14_000002` mendefinisikan bentuk lama tanpa `tahun_survei` dan
   dengan nama `v_olap_program_studi_keselarasan` (urutan katanya berbeda).
   Berarti view yang hidup dibuat di luar migrasi. Ini berisiko: bila basis data
   dibangun ulang dari migrasi saja, dasbor akan jatuh ke jalur *fallback*.
3. **Grafik memakai tingkat mentah, dan dua kategori Tidak Selaras hilang dari
   layar.** View keselarasan mengelompokkan `hubungan_bidang` (lima tingkat),
   bukan `kategori_horizontal` (dua kategori). Lebih buruk lagi, konstanta
   `CHART_HUBUNGAN_BIDANG` pada `admin/src/pages/Dashboard/Home.tsx` baris 71
   berbunyi `["Cukup erat", "Erat", "Sangat erat", "Tidak erat"]`. Nilai
   **"Tidak erat" tidak ada di data mana pun**, sedangkan dua nilai yang nyata
   ada — **"Kurang erat"** dan **"Tidak sama sekali"** — tidak tercantum.
   Karena grafik dibentuk dengan `CHART_HUBUNGAN_BIDANG.map(...)` lalu
   `lookup.get(kategori) ?? 0`, akibatnya: keenam responden Tidak Selaras
   **tidak muncul di grafik**, dan sebagai gantinya tampil satu kategori
   "Tidak erat" yang selalu 0. Tangkapan layar dasbor saat ini akan
   memperlihatkan seolah seluruh responden selaras — bertentangan dengan
   naskah yang menulis 39 Selaras dan 6 Tidak Selaras. **Perbaiki konstanta ini
   sebelum mengambil tangkapan layar Bab 4.**
