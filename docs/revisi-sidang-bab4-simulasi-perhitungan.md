# Revisi Bab 4 — Simulasi Perhitungan ETL dan OLAP

> **Cara memakai berkas ini.** Naskah di bawah **mengganti seluruh isi** subbab
> *Simulasi Perhitungan ETL dan OLAP* pada Bab 4 laporan, yaitu bagian yang
> sekarang memuat contoh “Budi Santoso (NIM 613230015)”. Seluruh angka pada
> naskah ini dihitung dari berkas sumber `alumnidummy.csv` yang dibaca oleh
> *seeder* sistem, sehingga dapat diperiksa ulang oleh penguji dengan menjalankan
> `php artisan migrate:fresh --seed` lalu membandingkan hasilnya dengan tabel di
> bawah. Daftar kalimat lama yang harus dihapus ada di penutup berkas ini.

---

## 4.x Simulasi Perhitungan ETL dan OLAP

Subbab ini membuktikan bahwa metrik yang tampil pada dasbor analitik memang
dihitung oleh sistem, bukan ditetapkan secara manual pada antarmuka. Pembuktian
dilakukan dengan menelusuri satu himpunan data dari keadaan mentah sampai menjadi
angka agregat, sambil menampilkan proses aritmetikanya pada setiap tahap.
Himpunan data yang dipakai berjumlah 215 rekam jejak lulusan dengan lima tahun
kelulusan, yaitu 2021 sampai 2025.

Penelusuran dibagi menjadi dua bagian besar. Bagian pertama, yaitu Tahap 1 sampai
Tahap 6, meliputi proses *Extract, Transform, Load* yang mengubah jawaban mentah
responden menjadi baris pada tabel fakta. Bagian kedua, yaitu Tahap 7 sampai
Tahap 10, meliputi operasi *Online Analytical Processing* yang mengubah tabel
fakta menjadi angka pada dasbor. Tahap 11 menutup penelusuran dengan uji
rekonsiliasi untuk memastikan tidak ada baris yang hilang atau terhitung ganda.

Agar proses transformasi dapat diikuti pada tataran satu orang lulusan,
penelusuran memakai lima baris data nyata sebagai contoh yang dibawa dari tahap
ke tahap. Kelima baris tersebut disajikan pada Tabel 4-A dalam keadaan mentah,
yaitu persis sebagaimana tersimpan pada area penampungan sebelum transformasi
apa pun dikerjakan.

**Tabel 4-A Lima baris contoh dalam keadaan mentah pada area penampungan**

| Kode | Nama | Jenjang | Program studi | Tahun masuk | Tahun lulus | IPK | Status kegiatan | Masa tunggu | Gaji | Keeratan bidang | Tingkat pendidikan |
|---|---|---|---|---|---|---|---|---|---|---|---|
| A | Isabella Young | D3 | Sci&Tech | 2020 | 2023 | 3,55 | Bekerja | 5 | 7,5 | Erat | Tingkat yang sama |
| B | Nathan Brown | D3 | Comm&Mgmt | 2020 | 2023 | 3,79 | Bekerja | 9 | 10,1 | Tidak sama sekali | Tingkat yang sama |
| C | Julia Clark | S1 | Sci&Tech | 2019 | 2024 | 3,03 | Bekerja | 4 | 8,0 | Sangat erat | Setingkat lebih rendah |
| D | Chloe Williams | S1 | Others | 2019 | 2023 | 3,66 | Wirausaha/Startup | 2 | 10,7 | Sangat erat | Setingkat lebih tinggi |
| E | Oliver Wilson | S1 | Sci&Tech | 2018 | 2022 | 2,67 | Melanjutkan Studi | *kosong* | *kosong* | *kosong* | *kosong* |

### Tahap 1 — Ekstraksi data ke area penampungan

Ekstraksi memindahkan jawaban responden dari sumbernya ke tabel penampungan
`staging_alumni` tanpa mengubah nilainya. Tujuan tahap ini adalah memisahkan
kegiatan pembacaan sumber dari kegiatan transformasi, sehingga apabila aturan
transformasi berubah, sistem tidak perlu membaca ulang sumber aslinya.

Hasil ekstraksi berjumlah 215 baris. Setiap baris memuat tujuh belas atribut,
dan lima di antaranya, yaitu status kegiatan, keeratan bidang, tingkat
pendidikan, masa tunggu, serta gaji, akan menjadi masukan bagi transformasi pada
tahap berikutnya. Jumlah baris pada tahap ini menjadi angka acuan bagi uji
rekonsiliasi pada Tahap 11.

### Tahap 2 — Transformasi status kegiatan menjadi dua kategori

Tabel dimensi pada skema bintang harus memuat kategori yang saling terpisah dan
menutup seluruh kemungkinan. Karena itu lima pilihan status kegiatan pada
instrumen diringkas menjadi dua kategori, mengikuti aturan yang telah ditetapkan
pada Tabel 2-2 di Bab 2.

Perhitungan pembilang kategori Bekerja adalah penjumlahan responden yang memilih
bekerja dengan responden yang memilih berwirausaha:

$$n_{\text{Bekerja}} = 117 + 15 = 132$$

Perhitungan pembilang kategori Tidak Bekerja adalah penjumlahan tiga pilihan
sisanya, yaitu belum bekerja tetapi sedang mencari kerja, melanjutkan studi,
serta belum memungkinkan bekerja:

$$n_{\text{Tidak Bekerja}} = 31 + 29 + 23 = 83$$

Kedua hasil tersebut menutup seluruh himpunan data, sebab
$132 + 83 = 215$. Persentase alumni bekerja dihitung sebagai berikut:

$$\text{persentase bekerja} = \frac{132}{215} \times 100\% = 61{,}3953\ldots\% \approx 61{,}40\%$$

Pembulatan dilakukan pada dua angka desimal oleh fungsi `ROUND` di dalam view,
bukan di dalam kode antarmuka, agar seluruh penyaji angka memperoleh nilai yang
sama.

Terhadap lima baris contoh, transformasi ini menghasilkan keadaan berikut. Baris
A, B, dan C tetap berkategori Bekerja. Baris D yang semula berstatus
Wirausaha/Startup berubah menjadi Bekerja. Baris E yang semula berstatus
Melanjutkan Studi berubah menjadi Tidak Bekerja.

Perlu dicatat bahwa perpindahan baris E inilah yang menyebabkan angka 61,40%
pada paragraf di atas **tidak boleh** disebut sebagai capaian Indikator Kinerja
Utama 1, sebagaimana telah dijelaskan pada Bab 2. Indikator tersebut menghitung
lulusan yang melanjutkan studi sebagai capaian, sedangkan sistem ini
menempatkannya pada kategori Tidak Bekerja karena masa tunggu dan keselarasannya
tidak terdefinisi.

**Tabel 4-B Hasil transformasi status kegiatan**

| Pilihan pada instrumen | Jumlah responden | Kategori hasil | Jumlah kategori |
|---|---|---|---|
| Bekerja | 117 | Bekerja | 132 |
| Wirausaha/Startup | 15 | Bekerja | |
| Tidak Bekerja tetapi Sedang Mencari Kerja | 31 | Tidak Bekerja | 83 |
| Melanjutkan Studi | 29 | Tidak Bekerja | |
| Belum Memungkinkan Bekerja | 23 | Tidak Bekerja | |
| **Jumlah** | **215** | | **215** |

### Tahap 3 — Transformasi keselarasan horizontal

Keselarasan horizontal diperoleh dari jawaban atas pertanyaan tentang keeratan
hubungan bidang studi dengan pekerjaan. Lima pilihan berjenjang pada instrumen
diringkas menjadi dua kategori pelaporan Kemendikti, yaitu Selaras dan Tidak
Selaras, mengikuti aturan pada Tabel 2-2.

Pembilang kategori Selaras adalah penjumlahan tiga pilihan teratas:

$$n_{\text{Selaras}}^{H} = 50 + 48 + 24 = 122$$

Pembilang kategori Tidak Selaras adalah penjumlahan dua pilihan terbawah:

$$n_{\text{Tidak Selaras}}^{H} = 5 + 5 = 10$$

Penyebutnya adalah jumlah responden berkategori Bekerja yang menjawab pertanyaan
tersebut, yaitu $122 + 10 = 132$. Angka penyebut ini sama dengan jumlah kategori
Bekerja pada Tahap 2, yang berarti seluruh responden bekerja telah menjawab
pertanyaan keselarasan horizontal. Persentasenya adalah:

$$\text{persentase selaras horizontal} = \frac{122}{132} \times 100\% = 92{,}4242\ldots\% \approx 92{,}42\%$$

$$\text{persentase tidak selaras horizontal} = \frac{10}{132} \times 100\% = 7{,}5757\ldots\% \approx 7{,}58\%$$

Terhadap lima baris contoh, baris A yang menjawab erat menjadi Selaras, baris C
dan D yang menjawab sangat erat menjadi Selaras, sedangkan baris B yang menjawab
tidak sama sekali menjadi Tidak Selaras. Baris E tidak memperoleh nilai
keselarasan karena berkategori Tidak Bekerja, dan nilainya dibiarkan kosong.

Pengosongan pada baris E perlu ditegaskan sebagai keputusan perancangan yang
disengaja. Baris tersebut keluar dari penyebut dan tidak digolongkan sebagai
Tidak Selaras, sebab tidak menjawab bukanlah pernyataan bahwa pekerjaannya tidak
selaras. Apabila baris kosong ikut digolongkan Tidak Selaras, persentase
keselarasan akan tertekan turun oleh lulusan yang bahkan tidak memiliki
pekerjaan, dan angka itu tidak lagi mengukur apa yang hendak diukur.

### Tahap 4 — Transformasi keselarasan vertikal

Keselarasan vertikal diperoleh dari jawaban atas pertanyaan tentang tingkat
pendidikan yang paling tepat untuk pekerjaan yang dijalani. Empat pilihan pada
instrumen diringkas menjadi dua kategori dengan dasar konsep bekerja di bawah
kualifikasi yang telah diuraikan pada Bab 2.

Pembilang kategori Selaras adalah penjumlahan pilihan tingkat yang sama dengan
pilihan setingkat lebih tinggi, sebab pada kedua keadaan itu jenjang pendidikan
lulusan terpakai seluruhnya:

$$n_{\text{Selaras}}^{V} = 85 + 42 = 127$$

Pembilang kategori Tidak Selaras adalah penjumlahan pilihan setingkat lebih
rendah dengan pilihan tidak perlu pendidikan tinggi, sebab pada kedua keadaan itu
sebagian jenjang pendidikan lulusan tidak terpakai:

$$n_{\text{Tidak Selaras}}^{V} = 4 + 1 = 5$$

Penyebutnya kembali $127 + 5 = 132$, sehingga persentasenya adalah:

$$\text{persentase selaras vertikal} = \frac{127}{132} \times 100\% = 96{,}2121\ldots\% \approx 96{,}21\%$$

$$\text{persentase tidak selaras vertikal} = \frac{5}{132} \times 100\% = 3{,}7878\ldots\% \approx 3{,}79\%$$

Perbandingan hasil Tahap 3 dengan Tahap 4 memperlihatkan bukti empiris bahwa
kedua dimensi keselarasan memang mengukur hal yang berbeda. Pada himpunan data
ini keselarasan vertikal bernilai 96,21% sedangkan keselarasan horizontal
bernilai 92,42%, sehingga kedua angka tidak dapat saling menggantikan.

Bukti yang lebih tegas terlihat pada tataran satu orang lulusan. Baris C, yaitu
Julia Clark yang bekerja sebagai *Web Developer* pada bidang teknologi informasi
dan komunikasi, menjawab sangat erat pada pertanyaan bidang sehingga tergolong
Selaras secara horizontal, tetapi menjawab setingkat lebih rendah pada
pertanyaan tingkat pendidikan sehingga tergolong Tidak Selaras secara vertikal.
Lulusan tersebut bekerja pada bidang yang memang ia pelajari, namun pada tingkat
yang berada di bawah jenjang sarjana yang ia tamatkan. Keadaan sebaliknya
terlihat pada baris B, yaitu Nathan Brown yang bekerja sebagai Staf Keuangan,
yang tergolong Tidak Selaras secara horizontal namun Selaras secara vertikal.
Kedua baris tersebut menunjukkan bahwa penggabungan dua dimensi menjadi satu
atribut akan menghilangkan informasi.

**Tabel 4-C Hasil transformasi kedua dimensi keselarasan**

| Dimensi | Pilihan pada instrumen | Jumlah | Kategori hasil | Jumlah kategori | Persentase |
|---|---|---|---|---|---|
| Horizontal | Sangat erat | 50 | Selaras | 122 | 92,42% |
| Horizontal | Erat | 48 | Selaras | | |
| Horizontal | Cukup erat | 24 | Selaras | | |
| Horizontal | Kurang erat | 5 | Tidak Selaras | 10 | 7,58% |
| Horizontal | Tidak sama sekali | 5 | Tidak Selaras | | |
| Horizontal | **Penyebut** | | | **132** | **100%** |
| Vertikal | Setingkat lebih tinggi | 42 | Selaras | 127 | 96,21% |
| Vertikal | Tingkat yang sama | 85 | Selaras | | |
| Vertikal | Setingkat lebih rendah | 4 | Tidak Selaras | 5 | 3,79% |
| Vertikal | Tidak perlu pendidikan tinggi | 1 | Tidak Selaras | | |
| Vertikal | **Penyebut** | | | **132** | **100%** |

### Tahap 5 — Perhitungan masa studi dan ketepatan waktu kelulusan

Masa studi tidak ditanyakan kepada responden melainkan dihitung oleh sistem dari
selisih tahun kelulusan dengan tahun masuk:

$$\text{masa studi} = \text{tahun lulus} - \text{tahun masuk}$$

Status ketepatan waktu ditetapkan dengan membandingkan masa studi terhadap
ambang yang berbeda menurut jenjang, yaitu tiga tahun bagi jenjang D3 dan empat
tahun bagi jenjang S1:

$$\text{lulus tepat waktu} = \begin{cases}
\text{benar} & \text{jika jenjang} = \text{D3 dan masa studi} \leq 3 \\
\text{benar} & \text{jika jenjang} = \text{S1 dan masa studi} \leq 4 \\
\text{salah} & \text{selain itu}
\end{cases}$$

Pembedaan ambang menurut jenjang penting karena himpunan data memuat 56 lulusan
D3 dan 159 lulusan S1. Ambang tunggal akan menggolongkan seluruh lulusan S1 yang
menempuh empat tahun sebagai tidak tepat waktu, padahal empat tahun adalah masa
studi normal bagi jenjang tersebut.

Penerapan pada lima baris contoh menghasilkan perhitungan berikut. Baris A
memperoleh $2023 - 2020 = 3$ tahun, dan karena berjenjang D3 dengan $3 \leq 3$
maka digolongkan tepat waktu. Baris B memperoleh hasil dan penggolongan yang
sama. Baris C memperoleh $2024 - 2019 = 5$ tahun, dan karena berjenjang S1
dengan $5 > 4$ maka digolongkan tidak tepat waktu. Baris D memperoleh
$2023 - 2019 = 4$ tahun, dan karena berjenjang S1 dengan $4 \leq 4$ maka
digolongkan tepat waktu. Baris E memperoleh $2022 - 2018 = 4$ tahun dan
digolongkan tepat waktu.

Agregat pada seluruh himpunan data disajikan pada Tabel 4-D. Jumlah lulusan tepat
waktu adalah $45 + 118 = 163$ orang, dan jumlah lulusan tidak tepat waktu adalah
$11 + 41 = 52$ orang, sehingga $163 + 52 = 215$. Persentase ketepatan waktu
kelulusan adalah:

$$\frac{163}{215} \times 100\% = 75{,}8139\ldots\% \approx 75{,}81\%$$

**Tabel 4-D Hasil perhitungan ketepatan waktu kelulusan**

| Jenjang | Ambang masa studi | Tepat waktu | Tidak tepat waktu | Jumlah |
|---|---|---|---|---|
| D3 | ≤ 3 tahun | 45 | 11 | 56 |
| S1 | ≤ 4 tahun | 118 | 41 | 159 |
| **Jumlah** | | **163** | **52** | **215** |

### Tahap 6 — Pemuatan ke tabel dimensi dan tabel fakta

Pemuatan menyimpan hasil transformasi ke dalam skema bintang. Nilai bertipe teks
disimpan pada tabel dimensi, sedangkan nilai bertipe angka yang akan diagregasi
disimpan pada tabel fakta. Penghubung antara keduanya adalah kunci pengganti
(*surrogate key*), yaitu bilangan bulat yang menggantikan teks kategori.

Pemakaian kunci pengganti membuat tabel fakta menjadi ringkas, sebab satu
bilangan bulat menggantikan teks yang dapat berpanjang puluhan karakter, dan
sekaligus membuat perubahan penamaan kategori tidak perlu menyentuh tabel fakta
sama sekali. Sebagai contoh, ketika penamaan kategori keselarasan diubah dari
istilah berjenjang menjadi istilah Selaras dan Tidak Selaras, perubahan hanya
dikerjakan pada satu baris di tabel dimensi, sedangkan seluruh baris di tabel
fakta tetap menunjuk kunci yang sama.

Penelusuran pemuatan bagi baris A adalah sebagai berikut. Nilai program studi
`Sci&Tech` dicarikan padanannya pada `dim_program_studi` dan memperoleh
`prodi_key`. Kategori `Bekerja` hasil Tahap 2 dicarikan padanannya pada
`dim_status_kerja` dan memperoleh `status_key`. Pasangan kategori Selaras hasil
Tahap 3 dan Tahap 4 dicarikan padanannya pada `dim_keselarasan` dan memperoleh
`keselarasan_key`. Tahun kelulusan 2023 dicarikan padanannya pada `dim_waktu` dan
memperoleh `waktu_key`. Setelah keempat kunci diperoleh, sistem menuliskan satu
baris pada `fact_tracer_alumni` yang memuat keempat kunci tersebut beserta tiga
nilai terukur, yaitu IPK sebesar 3,55, masa tunggu sebesar 5 bulan, dan gaji
sebesar 7,5 juta rupiah.

Penelusuran pemuatan bagi baris E berbeda pada satu hal. Karena baris tersebut
berkategori Tidak Bekerja, kolom `keselarasan_key`, `masa_tunggu_bulan`, dan
`gaji_juta` dibiarkan kosong. Pengosongan ini yang membuat rata-rata masa tunggu
dan rata-rata gaji pada tahap agregasi memakai penyebut 132 dan bukan 215.

### Tahap 7 — Operasi *roll-up* menurut program studi

Operasi *roll-up* menaikkan tingkat perincian data dengan meringkas baris fakta
menjadi satu baris ringkasan per anggota dimensi. Kueri berikut meringkas 215
baris fakta menjadi tiga baris ringkasan menurut program studi:

```sql
SELECT dp.program_studi,
       COUNT(*)                                                    AS jumlah_alumni,
       COUNT(*) FILTER (WHERE sk.status_bekerja = 'Bekerja')        AS alumni_bekerja,
       ROUND(AVG(f.masa_tunggu_bulan)
             FILTER (WHERE sk.status_bekerja = 'Bekerja'), 2)       AS rata_masa_tunggu,
       ROUND(AVG(f.gaji_juta)
             FILTER (WHERE sk.status_bekerja = 'Bekerja'), 2)       AS rata_gaji
FROM fact_tracer_alumni f
JOIN dim_program_studi dp ON dp.prodi_key  = f.prodi_key
JOIN dim_status_kerja  sk ON sk.status_key = f.status_key
GROUP BY dp.program_studi
ORDER BY dp.program_studi;
```

Klausa `FILTER` pada kueri tersebut menjalankan peran penting. Tanpa klausa itu,
rata-rata masa tunggu akan dihitung atas seluruh baris termasuk baris berkategori
Tidak Bekerja yang nilainya kosong. Dengan klausa itu, penyebut rata-rata
dibatasi hanya pada baris berkategori Bekerja, sehingga rata-rata yang dihasilkan
memang rata-rata masa tunggu lulusan yang bekerja.

Proses perhitungan rata-rata masa tunggu bagi program studi Sci&Tech adalah
penjumlahan seluruh nilai masa tunggu pada program studi tersebut dibagi jumlah
lulusan bekerjanya:

$$\overline{mt}_{\text{Sci\&Tech}} = \frac{235}{51} = 4{,}6078\ldots \approx 4{,}61 \text{ bulan}$$

Perhitungan yang sama bagi dua program studi lainnya menghasilkan:

$$\overline{mt}_{\text{Comm\&Mgmt}} = \frac{196}{39} = 5{,}0256\ldots \approx 5{,}03 \text{ bulan}$$

$$\overline{mt}_{\text{Others}} = \frac{227}{42} = 5{,}4047\ldots \approx 5{,}40 \text{ bulan}$$

Rata-rata pada tingkat institusi dihitung dari jumlah keseluruhan, bukan dari
rata-rata ketiga program studi, sebab jumlah lulusan tiap program studi tidak
sama:

$$\overline{mt}_{\text{institusi}} = \frac{658}{132} = 4{,}9848\ldots \approx 4{,}98 \text{ bulan}$$

Pembedaan ini perlu ditegaskan karena rata-rata dari ketiga rata-rata program
studi akan menghasilkan $(4{,}61 + 5{,}03 + 5{,}40) / 3 = 5{,}01$ bulan, dan
angka tersebut keliru sebab memperlakukan ketiga program studi seolah berukuran
sama.

**Tabel 4-E Hasil operasi *roll-up* menurut program studi**

| Program studi | Jumlah alumni | Alumni bekerja | Persentase bekerja | Jumlah masa tunggu | Rata-rata masa tunggu | Jumlah gaji | Rata-rata gaji |
|---|---|---|---|---|---|---|---|
| Comm&Mgmt | 64 | 39 | 60,94% | 196 | 5,03 | 283,1 | 7,26 |
| Others | 69 | 42 | 60,87% | 227 | 5,40 | 301,3 | 7,17 |
| Sci&Tech | 82 | 51 | 62,20% | 235 | 4,61 | 376,7 | 7,39 |
| **Institusi** | **215** | **132** | **61,40%** | **658** | **4,98** | **961,1** | **7,28** |

Rata-rata gaji pada tingkat institusi dihitung dengan cara yang sama:

$$\overline{gaji}_{\text{institusi}} = \frac{961{,}1}{132} = 7{,}2810\ldots \approx 7{,}28 \text{ juta rupiah}$$

Ambang capaian masa tunggu yang ditetapkan Buku Panduan Indikator Kinerja Utama
adalah kurang dari atau sama dengan enam bulan. Terhadap ambang tersebut,
sebaran masa tunggu pada Tabel 4-F menunjukkan bahwa lulusan yang terserap dalam
waktu paling lama enam bulan berjumlah
$9 + 18 + 16 + 18 + 22 + 11 = 94$ orang, sehingga capaiannya adalah:

$$\frac{94}{132} \times 100\% = 71{,}2121\ldots\% \approx 71{,}21\%$$

**Tabel 4-F Sebaran masa tunggu kerja lulusan berkategori Bekerja**

| Masa tunggu (bulan) | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | Jumlah |
|---|---|---|---|---|---|---|---|---|---|---|---|
| Jumlah lulusan | 9 | 18 | 16 | 18 | 22 | 11 | 10 | 11 | 11 | 6 | 132 |

Sebaran pada Tabel 4-F sekaligus memeriksa kembali hasil Tahap 7, sebab jumlah
hasil kali masa tunggu dengan jumlah lulusannya harus sama dengan angka 658 yang
dipakai sebagai pembilang rata-rata:

$$(1)(9) + (2)(18) + (3)(16) + (4)(18) + (5)(22) + (6)(11) + (7)(10) + (8)(11) + (9)(11) + (10)(6) = 658$$

### Tahap 8 — Operasi *slice* menurut dimensi keselarasan

Operasi *slice* memilih satu nilai pada satu dimensi lalu menyajikan data hanya
pada bidang tersebut. Pada dasbor keselarasan, operasi ini dipakai untuk
berpindah antara dimensi horizontal dengan dimensi vertikal.

View `v_olap_keselarasan` menghasilkan empat baris, yaitu hasil kali dua dimensi
dengan dua kategori. Ketika pengguna memilih dimensi horizontal, dasbor
menyajikan dua baris berdimensi Horizontal, dan ketika pengguna memilih dimensi
vertikal, dasbor menyajikan dua baris berdimensi Vertikal. Perlu dicatat bahwa
perpindahan tersebut tidak menerbitkan permintaan baru ke peladen, sebab keempat
baris telah termuat seluruhnya pada satu permintaan. Yang berpindah hanyalah
penyaringan di sisi penyaji, sehingga operasi *slice* pada rancangan ini tidak
menambah beban komputasi peladen.

**Tabel 4-G Hasil operasi *slice* pada dimensi keselarasan**

| Dimensi | Kategori | Jumlah alumni | Penyebut responden | Persentase |
|---|---|---|---|---|
| Horizontal | Selaras | 122 | 132 | 92,42% |
| Horizontal | Tidak Selaras | 10 | 132 | 7,58% |
| Vertikal | Selaras | 127 | 132 | 96,21% |
| Vertikal | Tidak Selaras | 5 | 132 | 3,79% |

### Tahap 9 — Operasi *dice* menurut program studi dan keselarasan

Operasi *dice* memilih sebagian nilai pada lebih dari satu dimensi sekaligus,
sehingga menghasilkan tabulasi silang. Kueri berikut menyilangkan dimensi
program studi dengan dimensi keselarasan horizontal, dan membatasi cakupannya
hanya pada lulusan berkategori Bekerja:

```sql
SELECT program_studi,
       kategori_horizontal,
       COUNT(*)              AS jumlah_alumni,
       ROUND(AVG(ipk), 2)    AS rata_rata_ipk
FROM v_olap_detail
WHERE status_bekerja      = 'Bekerja'
  AND kategori_horizontal IS NOT NULL
GROUP BY program_studi, kategori_horizontal
ORDER BY program_studi, kategori_horizontal;
```

Proses perhitungan persentase keselarasan pada tiap program studi memakai
penyebut yang berbeda, yaitu jumlah lulusan bekerja pada program studi itu
sendiri:

$$\text{Comm\&Mgmt} = \frac{34}{39} \times 100\% = 87{,}1794\ldots\% \approx 87{,}18\%$$

$$\text{Others} = \frac{39}{42} \times 100\% = 92{,}8571\ldots\% \approx 92{,}86\%$$

$$\text{Sci\&Tech} = \frac{49}{51} \times 100\% = 96{,}0784\ldots\% \approx 96{,}08\%$$

**Tabel 4-H Hasil operasi *dice* program studi terhadap keselarasan horizontal**

| Program studi | Selaras | Tidak Selaras | Penyebut | Persentase selaras | Rata-rata IPK yang selaras |
|---|---|---|---|---|---|
| Comm&Mgmt | 34 | 5 | 39 | 87,18% | 3,17 |
| Others | 39 | 3 | 42 | 92,86% | 3,26 |
| Sci&Tech | 49 | 2 | 51 | 96,08% | 3,36 |
| **Jumlah** | **122** | **10** | **132** | **92,42%** | |

Kolom jumlah pada Tabel 4-H berfungsi sebagai pemeriksaan silang terhadap Tahap
3. Penjumlahan kolom Selaras menghasilkan $34 + 39 + 49 = 122$ dan penjumlahan
kolom Tidak Selaras menghasilkan $5 + 3 + 2 = 10$, keduanya sama dengan hasil
Tahap 3. Kesamaan ini menunjukkan bahwa operasi *dice* memang memecah himpunan
yang sama dan tidak menciptakan atau menghilangkan baris.

Perlu diingat bahwa persentase pada tingkat institusi, yaitu 92,42%, bukan
rata-rata dari ketiga persentase program studi. Rata-rata ketiganya adalah
$(87{,}18 + 92{,}86 + 96{,}08)/3 = 92{,}04\%$, dan angka itu berbeda dari 92,42%
karena mengabaikan perbedaan jumlah lulusan antar program studi.

### Tahap 10 — Operasi *drill-down* menurut tahun kelulusan

Operasi *drill-down* menurunkan tingkat perincian data, yaitu kebalikan dari
operasi *roll-up*. Dari ringkasan tiga baris per program studi pada Tahap 7,
operasi ini menurunkan perincian menjadi tabulasi tahun kelulusan terhadap
program studi.

**Tabel 4-I Hasil operasi *drill-down* tahun kelulusan terhadap program studi**

| Tahun lulus | Comm&Mgmt | Others | Sci&Tech | Jumlah alumni | Alumni bekerja | Persentase bekerja |
|---|---|---|---|---|---|---|
| 2021 | 11 | 15 | 21 | 47 | 32 | 68,09% |
| 2022 | 12 | 11 | 18 | 41 | 22 | 53,66% |
| 2023 | 14 | 17 | 11 | 42 | 25 | 59,52% |
| 2024 | 12 | 11 | 19 | 42 | 25 | 59,52% |
| 2025 | 15 | 15 | 13 | 43 | 28 | 65,12% |
| **Jumlah** | **64** | **69** | **82** | **215** | **132** | **61,40%** |

Proses perhitungan persentase bekerja pada tahun kelulusan 2021 adalah:

$$\frac{32}{47} \times 100\% = 68{,}0851\ldots\% \approx 68{,}09\%$$

Baris jumlah pada Tabel 4-I harus sama dengan baris institusi pada Tabel 4-E,
sebab keduanya meringkas himpunan yang sama pada tingkat perincian yang berbeda.
Kesamaan kedua baris tersebut adalah sifat pokok yang diharapkan dari model
multidimensi, yaitu bahwa hasil agregasi tidak bergantung pada urutan operasi
yang dikerjakan pengguna.

Perlu dijelaskan pula bahwa jumlah lulusan per tahun pada Tabel 4-I adalah
jumlah pada tabel fakta, yaitu seluruh rekam jejak yang tersimpan. Penyajian per
periode survei pada dasbor dapat menampilkan angka yang lebih kecil, sebab
penyajian tersebut dibatasi oleh jendela kohort dua tahun sebagaimana diuraikan
pada Bab 2. Pembatasan itu hanya berlaku pada penyajian; seluruh baris tetap
tersimpan pada tabel fakta sehingga penelusuran lintas tahun tetap dapat
dilakukan kapan saja.

### Tahap 11 — Uji rekonsiliasi hasil perhitungan

Tahap penutup memeriksa bahwa rangkaian transformasi dan agregasi di atas tidak
menghilangkan maupun menggandakan baris. Pemeriksaan dilakukan dengan menelusuri
kembali jumlah baris pada setiap tahap dan membandingkannya terhadap angka acuan
215 dari Tahap 1.

**Tabel 4-J Uji rekonsiliasi jumlah baris antar tahap**

| Pemeriksaan | Perhitungan | Hasil | Acuan | Keterangan |
|---|---|---|---|---|
| Keutuhan status kegiatan | 132 + 83 | 215 | 215 | Sesuai |
| Keutuhan ketepatan waktu | 163 + 52 | 215 | 215 | Sesuai |
| Keutuhan program studi | 64 + 69 + 82 | 215 | 215 | Sesuai |
| Keutuhan tahun kelulusan | 47 + 41 + 42 + 42 + 43 | 215 | 215 | Sesuai |
| Penyebut keselarasan horizontal | 122 + 10 | 132 | 132 | Sesuai jumlah kategori Bekerja |
| Penyebut keselarasan vertikal | 127 + 5 | 132 | 132 | Sesuai jumlah kategori Bekerja |
| Pembilang *dice* horizontal | 34 + 39 + 49 | 122 | 122 | Sesuai hasil Tahap 3 |
| Jumlah masa tunggu | 196 + 227 + 235 | 658 | 658 | Sesuai sebaran Tabel 4-F |
| Jumlah gaji | 283,1 + 301,3 + 376,7 | 961,1 | 961,1 | Sesuai |
| Jumlah alumni bekerja per prodi | 39 + 42 + 51 | 132 | 132 | Sesuai hasil Tahap 2 |

Seluruh pemeriksaan pada Tabel 4-J menghasilkan angka yang sesuai dengan
acuannya. Dengan demikian rangkaian perhitungan dari data mentah sampai angka
agregat pada dasbor telah terbukti utuh dan dapat ditelusuri kembali. Penguji
dapat memeriksa ulang seluruh angka pada subbab ini dengan menjalankan perintah
`php artisan migrate:fresh --seed` untuk membangun kembali gudang data dari kode,
lalu menjalankan kueri pada Tahap 7 dan Tahap 9 langsung di PostgreSQL.

---

## Kalimat pada naskah lama yang harus dihapus atau diganti

1. Seluruh contoh kasus bernama **“Budi Santoso (NIM: 613230015)”** beserta
   tanggal 31 Agustus 2025 dan 15 Januari 2026 harus dihapus. Nama, nomor induk,
   dan tanggal tersebut tidak ada di dalam basis data sistem, sehingga penguji
   tidak dapat memeriksa ulang perhitungannya. Penggantinya adalah lima baris
   contoh pada Tabel 4-A yang seluruhnya berasal dari data sistem.

2. Rumus masa tunggu yang memakai pembagian selisih hari dengan angka 30,44 harus
   dihapus. Sistem tidak menghitung masa tunggu dari selisih dua tanggal,
   melainkan menerimanya sebagai nilai dalam satuan bulan dari jawaban responden.
   Rumus pada naskah lama menjanjikan perhitungan yang tidak dikerjakan sistem.

3. Contoh ketepatan waktu yang memakai **tahun masuk 2023 dan tahun lulus 2026**
   harus dihapus, sebab kedua tahun tersebut berada di luar rentang data sistem
   yang mencakup kelulusan 2021 sampai 2025. Penggantinya adalah Tahap 5 pada
   berkas ini.

4. Kueri SQL pada naskah lama memuat dua kekeliruan nama kolom, yaitu
   `d.nama_prodi` yang seharusnya `dp.program_studi`, dan
   `JOIN dim_program_studi d ON f.prodi_key = d.id` yang seharusnya
   `JOIN dim_program_studi dp ON dp.prodi_key = f.prodi_key`. Kueri tersebut
   tidak akan berjalan apabila diuji. Penggantinya adalah kueri pada Tahap 7.

5. Contoh agregasi yang memakai **“3 data rekam jejak dengan masa tunggu 3, 4,
   dan 5 bulan”** harus dihapus. Angka tersebut dikarang dan tidak menunjukkan
   kemampuan sistem mengolah 215 baris. Penggantinya adalah Tahap 7 beserta
   Tabel 4-E dan Tabel 4-F.

6. Frasa **“secara instan dirender oleh dashboard antarmuka React.js”** harus
   dihapus. Sistem tidak menjanjikan penyajian seketika, dan klaim semacam itu
   tidak diukur pada bab pengujian.

7. Penyebutan **“program studi D3 Teknik Informatika”** pada contoh agregasi
   harus disesuaikan. Tabel dimensi program studi pada sistem memuat tiga nilai,
   yaitu Comm&Mgmt, Others, dan Sci&Tech, sehingga nama program studi formal
   tidak dapat dipakai sebagai contoh tanpa mengubah isi tabel dimensi.
