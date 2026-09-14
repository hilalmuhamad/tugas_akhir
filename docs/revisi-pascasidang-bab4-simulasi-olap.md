# Revisi Pascasidang — Bab 4: Simulasi Agregasi OLAP

Menjawab butir revisi nomor 1: *"Detail tahapan simulasi harus dijelaskan di
Bab 4, tidak hanya langkah-langkah saja tetapi beserta proses perhitungannya."*

Disusun 2026-08-26. Lingkup yang disepakati: **agregasi OLAP**. Simulasi
perhitungan TF-IDF dan Random Forest tidak termasuk dokumen ini.

Teks di dalam blok kutipan (`>`) siap tempel ke laporan. Teks di luar blok
kutipan adalah catatan kerja untuk Anda.

---

## Dasar angka yang dipakai dokumen ini

Seluruh angka di bawah dihitung ulang langsung dari
`backend/database/seeders/data/alumnidummy.csv` mengikuti logika yang benar-benar
ada di kode, yaitu:

| Ketetapan | Nilai | Sumber di kode |
|---|---|---|
| Tahun survei acuan | 2025 | `OlapController`, nilai bawaan parameter `tahun_survei` |
| Jendela kohort | `[TS − 2, TS − 1]` = 2023–2024 | `OlapController::kohortWindow()` |
| Penyebut metrik ketenagakerjaan | `status_bekerja = 'Bekerja'` | `OlapController::fallbackKeselarasan()` |
| Pemetaan horizontal | 3 tingkat teratas → Selaras | `EtlService::kategoriHorizontal()` |

> **Dua peringatan yang harus Anda tangani sebelum menempel naskah ini.**
>
> **Pertama, selisih satu baris.** Perhitungan di dokumen ini memakai 215 baris
> dari CSV. Basis data Anda memuat **216** baris, karena ada satu jawaban
> kuesioner nyata yang masuk melalui ETL. Bila baris tambahan itu jatuh di dalam
> kohort 2023–2024 **dan** berstatus Bekerja, maka penyebut menjadi 46 dan
> seluruh persentase bergeser. Jalankan kueri verifikasi pada Bagian akhir
> dokumen ini di pgAdmin untuk memastikan. Bila angkanya berbeda, beri tahu saya
> dan saya hitung ulang seluruh tabel.
>
> **Kedua, keselarasan vertikal belum final.** Tahap 6 masih menyediakan dua
> kemungkinan, menunggu keputusan pada `revisi-pascasidang-bab2.md` Bagian C.2.

---

# Naskah untuk laporan

**Letak yang disarankan:** subbab tersendiri di bawah 4.x "Analisa Hasil
Implementasi", **sebelum** penyajian tangkapan layar dasbor. Alasannya: pembaca
perlu tahu asal-usul angkanya lebih dulu, agar tangkapan layar berikutnya
terbaca sebagai bukti, bukan sebagai klaim.

## Paragraf pembuka

> **4.x Simulasi Perhitungan Agregasi OLAP**
>
> Subbab ini menguraikan tahapan perhitungan yang dijalankan sistem untuk
> menghasilkan metrik yang tampil pada dasbor analitik, beserta proses
> aritmetikanya pada setiap tahapan. Penyajian dibuat sedemikian sehingga
> seluruh angka pada dasbor dapat ditelusuri kembali dari populasi awal tabel
> fakta melalui langkah-langkah yang dapat dihitung ulang secara manual.
>
> Simulasi dilakukan pada tahun survei 2025 sebagai acuan, dengan metrik
> keselarasan horizontal sebagai contoh utama karena metrik inilah yang
> melibatkan seluruh jenis operasi agregasi yang digunakan sistem, yaitu
> penyaringan dimensi, peringkasan kategori, serta pembedahan silang antar
> dimensi. Tahapan yang sama berlaku bagi metrik lain dengan hanya mengganti
> dimensi pengelompokannya.
>
> Keseluruhan tahapan diikhtisarkan pada Tabel 4.x, lalu diuraikan satu per satu
> beserta perhitungannya.
>
> **Tabel 4.x Ikhtisar Tahapan Agregasi OLAP**
>
> | Tahap | Operasi | Tindakan | Banyaknya Baris |
> |---:|---|---|---:|
> | 1 | — | Populasi awal tabel fakta | 215 |
> | 2 | Penyaringan dimensi waktu | Menetapkan jendela kohort 2023–2024 | 84 |
> | 3 | Penyaringan dimensi status kerja | Menetapkan responden bekerja | 45 |
> | 4 | *Drill-down* | Membedah menjadi lima tingkat keeratan | 45 |
> | 5 | *Roll-up* | Meringkas menjadi dua kategori pelaporan | 45 |
> | 6 | *Roll-up* | Meringkas keselarasan vertikal | 45 |
> | 7 | *Roll-up* | Menaikkan hierarki ke tingkat program studi | 84 |
> | 8 | *Drill-down* | Membedah silang program studi × kategori | 45 |

**Catatan kerja.** Kolom "Banyaknya Baris" pada tahap 4–6 tetap 45 karena
operasi peringkasan tidak membuang baris fakta, hanya mengubah tingkat
pengelompokannya. Ini perbedaan penting yang sering ditanyakan: penyaringan
mengurangi baris, peringkasan tidak.

---

## Tahap 1 — Populasi awal tabel fakta

> **Tahap 1. Populasi awal.** Tabel fakta `fact_tracer_alumni` memuat 215 baris
> hasil pemuatan data lulusan tahun 2021 sampai 2025. Setiap baris mewakili satu
> lulusan dan menyimpan empat metrik terukur beserta kunci tamu ke tabel-tabel
> dimensi. Sebaran baris menurut tahun kelulusan disajikan pada Tabel 4.x.
>
> **Tabel 4.x Sebaran Baris Tabel Fakta menurut Tahun Kelulusan**
>
> | Tahun Lulus | Banyaknya Lulusan |
> |---|---:|
> | 2021 | 47 |
> | 2022 | 41 |
> | 2023 | 42 |
> | 2024 | 42 |
> | 2025 | 43 |
> | **Jumlah** | **215** |
>
> Pemeriksaan: 47 + 41 + 42 + 42 + 43 = 215.

---

## Tahap 2 — Penyaringan dimensi waktu (jendela kohort)

> **Tahap 2. Penyaringan pada dimensi waktu.** Tidak seluruh baris tabel fakta
> disertakan dalam penyajian. Pelaporan *Tracer Study* hanya mencakup kohort
> yang berada dalam jendela pengamatan, yaitu lulusan yang disurvei satu sampai
> dua tahun setelah kelulusannya. Batas jendela dihitung dari tahun survei
> menurut hubungan berikut:
>
> $$\text{jendela kohort} = [\,TS - 2,\; TS - 1\,]$$
>
> dengan $TS$ menyatakan tahun survei. Untuk tahun survei 2025 diperoleh:
>
> $$[\,2025 - 2,\; 2025 - 1\,] = [\,2023,\; 2024\,]$$
>
> Batas bawah 2023 mewakili kohort TS-2 dan batas atas 2024 mewakili kohort
> TS-1. Lulusan tahun 2021 dan 2022 berada di luar jendela karena telah melampaui
> dua tahun sejak kelulusan, sedangkan lulusan tahun 2025 belum genap satu tahun
> sejak kelulusan sehingga belum memasuki jendela. Operasi penyaringan ini
> diwujudkan pada lapisan kueri sebagai berikut:
>
> ```sql
> SELECT COUNT(*)
> FROM fact_tracer_alumni f
> JOIN dim_waktu dw ON dw.waktu_key = f.waktu_key
> WHERE dw.tahun_lulus BETWEEN 2023 AND 2024;
> ```
>
> Banyaknya baris yang tersaring dihitung sebagai jumlah dua kohort:
>
> $$n_{\text{kohort}} = 42 + 42 = 84$$
>
> Perlu ditegaskan bahwa penyaringan ini **tidak menghapus** data di luar
> jendela. Gudang data tetap menyimpan seluruh riwayat kelulusan; pembatasan
> hanya dikerjakan pada lapisan kueri melalui klausa `BETWEEN`, sehingga jendela
> pengamatan dapat digeser dengan mengubah nilai tahun survei tanpa memuat ulang
> data.

**Catatan kerja.** Kalimat terakhir itu penting dan sengaja saya masukkan —
menyatakan sendiri bahwa data tidak dihapus mencegah pertanyaan penguji soal
kehilangan data historis.

---

## Tahap 3 — Penyaringan dimensi status kerja

> **Tahap 3. Penyaringan pada dimensi status kerja.** Metrik keselarasan hanya
> bermakna bagi lulusan yang telah bekerja, karena kedua pertanyaan keselarasan
> pada kuesioner hanya diajukan kepada responden berstatus bekerja. Karena itu
> jendela kohort sebanyak 84 lulusan dibedah lebih dahulu menurut dimensi status
> kerja, sebagaimana disajikan pada Tabel 4.x.
>
> **Tabel 4.x Sebaran Status Kerja dalam Jendela Kohort 2023–2024**
>
> | Status Bekerja | Jumlah | Persentase |
> |---|---:|---:|
> | Bekerja | 45 | 53,57% |
> | Melanjutkan Studi | 12 | 14,29% |
> | Tidak Bekerja tetapi Sedang Mencari Kerja | 12 | 14,29% |
> | Belum Memungkinkan Bekerja | 10 | 11,90% |
> | Wirausaha/*Startup* | 5 | 5,95% |
> | **Jumlah** | **84** | **100,00%** |
>
> Persentase pada tabel di atas dihitung terhadap penyebut 84, yaitu banyaknya
> lulusan dalam jendela kohort. Sebagai contoh, persentase lulusan berstatus
> bekerja diperoleh dari:
>
> $$\frac{45}{84} \times 100\% = 53{,}5714\ldots\% \approx 53{,}57\%$$
>
> Baris berstatus Bekerja inilah yang menjadi penyebut bagi seluruh perhitungan
> pada tahap berikutnya:
>
> $$n = 45$$
>
> ```sql
> SELECT sk.status_bekerja, COUNT(*) AS jumlah
> FROM fact_tracer_alumni f
> JOIN dim_waktu dw        ON dw.waktu_key  = f.waktu_key
> JOIN dim_status_kerja sk ON sk.status_key = f.status_key
> WHERE dw.tahun_lulus BETWEEN 2023 AND 2024
> GROUP BY sk.status_bekerja
> ORDER BY jumlah DESC;
> ```
>
> Seluruh 45 baris tersebut memiliki kunci tamu `keselarasan_key` yang terisi,
> sehingga tidak ada baris yang gugur pada penggabungan dengan tabel dimensi
> keselarasan. Keadaan ini sejalan dengan kaidah percabangan instrumen: setiap
> responden yang menyatakan bekerja pasti telah menjawab kedua pertanyaan
> keselarasan.

**Catatan kerja.** Saya sudah memeriksa ini: dari 45 responden Bekerja,
**nol** yang `keselarasan_key`-nya kosong, dan **nol** yang `masa_tunggu_bulan`-nya
kosong. Angka nol itu layak disebut karena membuktikan percabangan instrumennya
bekerja. Kalau nanti data nyata masuk dan angkanya tidak lagi nol, kalimat itu
harus disunting.

Perhatikan bahwa Wirausaha/*Startup* (5 lulusan) **tidak** ikut menjadi
penyebut, mengikuti kode sekarang. Bila penguji menanyakan alasannya, jawaban
yang jujur: penyebut dibatasi pada status Bekerja agar seragam dengan seluruh
metrik ketenagakerjaan lain di dasbor. Bila Anda ingin memasukkan wirausaha,
penyebutnya menjadi 50 dan seluruh angka di dokumen ini harus dihitung ulang —
beri tahu saya bila itu yang dipilih.

---

## Tahap 4 — *Drill-down* ke lima tingkat keeratan

> **Tahap 4. Operasi *drill-down*.** Dari 45 responden bekerja, jawaban atas
> pertanyaan keeratan hubungan bidang dibedah ke tingkat rincian paling halus,
> yaitu kelima tingkat jawaban sebagaimana terekam pada kolom `hubungan_bidang`.
> Hasilnya disajikan pada Tabel 4.x.
>
> **Tabel 4.x Hasil *Drill-down* Keselarasan Horizontal ke Lima Tingkat Keeratan**
>
> | Tingkat Keeratan | Jumlah | Persentase | Kategori Pelaporan |
> |---|---:|---:|---|
> | Sangat erat | 16 | 35,56% | Selaras |
> | Erat | 15 | 33,33% | Selaras |
> | Cukup erat | 8 | 17,78% | Selaras |
> | Kurang erat | 3 | 6,67% | Tidak Selaras |
> | Tidak sama sekali | 3 | 6,67% | Tidak Selaras |
> | **Jumlah** | **45** | **100,01%** | |
>
> Setiap persentase dihitung terhadap penyebut 45. Sebagai contoh, tingkat
> "sangat erat" diperoleh dari:
>
> $$\frac{16}{45} \times 100\% = 35{,}5555\ldots\% \approx 35{,}56\%$$
>
> Jumlah persentase pada tabel di atas adalah 100,01%, bukan tepat 100%. Selisih
> sebesar 0,01% tersebut merupakan galat pembulatan yang timbul karena setiap
> nilai dibulatkan ke dua angka di belakang koma secara terpisah sebelum
> dijumlahkan. Galat semacam ini tidak menandakan kekeliruan perhitungan, dan
> tidak dikoreksi secara manual agar setiap nilai tetap dapat ditelusuri
> langsung dari pembagiannya masing-masing.

**Catatan kerja.** Jumlah 100,01% itu **saya sengaja tampilkan**. Kalau
disembunyikan atau dipaksa jadi 100,00%, penguji yang menjumlahkan sendiri akan
menemukan selisihnya dan Anda tidak punya penjelasan. Dengan dijelaskan lebih
dulu, selisih itu justru menjadi bukti bahwa angkanya dihitung, bukan dikarang.

---

## Tahap 5 — *Roll-up* ke dua kategori pelaporan

> **Tahap 5. Operasi *roll-up*.** Kelima tingkat keeratan diringkas menjadi dua
> kategori pelaporan mengikuti pemetaan pada Tabel 2.x, yaitu tiga tingkat
> teratas menjadi Selaras dan dua tingkat terbawah menjadi Tidak Selaras.
> Peringkasan dikerjakan melalui penjumlahan frekuensi:
>
> $$n_{\text{Selaras}} = 16 + 15 + 8 = 39$$
>
> $$n_{\text{Tidak Selaras}} = 3 + 3 = 6$$
>
> Pemeriksaan keutuhan: $39 + 6 = 45$, sama dengan penyebut, sehingga tidak ada
> responden yang terlewat maupun terhitung ganda. Persentase kedua kategori
> dihitung terhadap penyebut yang sama:
>
> $$P_{\text{Selaras}} = \frac{39}{45} \times 100\% = 86{,}6666\ldots\% \approx 86{,}67\%$$
>
> $$P_{\text{Tidak Selaras}} = \frac{6}{45} \times 100\% = 13{,}3333\ldots\% \approx 13{,}33\%$$
>
> **Tabel 4.x Hasil *Roll-up* Keselarasan Horizontal**
>
> | Kategori | Jumlah | Persentase |
> |---|---:|---:|
> | Selaras | 39 | 86,67% |
> | Tidak Selaras | 6 | 13,33% |
> | **Jumlah** | **45** | **100,00%** |
>
> Berbeda dengan Tabel 4.x pada tahap sebelumnya, jumlah persentase pada tabel
> ini tepat 100,00% karena peringkasan menjadi dua kategori menghasilkan dua
> pecahan yang galat pembulatannya saling menghapus.
>
> Kueri agregasi yang menghasilkan tabel di atas adalah sebagai berikut. Kolom
> `kategori_horizontal` pada tabel dimensi telah memuat hasil pemetaan, sehingga
> peringkasan tidak memerlukan perhitungan tambahan pada saat kueri dijalankan:
>
> ```sql
> SELECT dk.kategori_horizontal,
>        COUNT(*) AS jumlah_alumni,
>        ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER (), 2) AS persentase
> FROM fact_tracer_alumni f
> JOIN dim_waktu dw         ON dw.waktu_key       = f.waktu_key
> JOIN dim_status_kerja sk  ON sk.status_key      = f.status_key
> JOIN dim_keselarasan dk   ON dk.keselarasan_key = f.keselarasan_key
> WHERE dw.tahun_lulus BETWEEN 2023 AND 2024
>   AND sk.status_bekerja = 'Bekerja'
> GROUP BY dk.kategori_horizontal;
> ```

---

## Tahap 6 — *Roll-up* keselarasan vertikal

> **Tahap 6. Peringkasan keselarasan vertikal.** Tahapan yang sama diterapkan
> pada dimensi keselarasan vertikal. Sebaran jawaban atas keempat pilihan
> tingkat pendidikan pada 45 responden bekerja disajikan pada Tabel 4.x.
>
> **Tabel 4.x Sebaran Jawaban Keselarasan Vertikal**
>
> | Pilihan Jawaban | Jumlah | Persentase |
> |---|---:|---:|
> | Setingkat lebih tinggi | 12 | 26,67% |
> | Tingkat yang sama | 31 | 68,89% |
> | Setingkat lebih rendah | 2 | 4,44% |
> | Tidak perlu pendidikan tinggi | 0 | 0,00% |
> | **Jumlah** | **45** | **100,00%** |

> ⚠️ **BAGIAN INI MENUNGGU KEPUTUSAN ANDA — jangan tempel dulu.**
>
> Lanjutan tahap 6 bergantung pada pilihan pemetaan di
> `revisi-pascasidang-bab2.md` Bagian C.2. Berikut kedua kemungkinan naskahnya,
> pilih satu lalu hapus yang lain.

**Bila Opsi A dipilih** (setingkat lebih tinggi digolongkan Selaras):

> Peringkasan menjadi dua kategori dikerjakan melalui penjumlahan frekuensi:
>
> $$n_{\text{Selaras}} = 12 + 31 = 43 \qquad n_{\text{Tidak Selaras}} = 2 + 0 = 2$$
>
> $$P_{\text{Selaras}} = \frac{43}{45} \times 100\% = 95{,}5555\ldots\% \approx 95{,}56\%$$
>
> $$P_{\text{Tidak Selaras}} = \frac{2}{45} \times 100\% = 4{,}4444\ldots\% \approx 4{,}44\%$$
>
> Angka 4,44% menunjukkan bahwa gejala *underemployment* pada kohort yang diamati
> tergolong rendah, yaitu hanya dua dari 45 responden bekerja yang menempati
> posisi tidak menuntut jenjang pendidikan setinggi yang telah ditempuhnya.

**Bila Opsi B dipilih** (hanya tingkat yang sama digolongkan Selaras):

> Peringkasan menjadi dua kategori dikerjakan melalui penjumlahan frekuensi:
>
> $$n_{\text{Selaras}} = 31 \qquad n_{\text{Tidak Selaras}} = 12 + 2 + 0 = 14$$
>
> $$P_{\text{Selaras}} = \frac{31}{45} \times 100\% = 68{,}8888\ldots\% \approx 68{,}89\%$$
>
> $$P_{\text{Tidak Selaras}} = \frac{14}{45} \times 100\% = 31{,}1111\ldots\% \approx 31{,}11\%$$
>
> Angka 31,11% didominasi oleh responden yang menempati pekerjaan menuntut
> jenjang lebih tinggi daripada yang dimilikinya, yaitu 12 dari 14 responden
> berkategori tidak selaras, sedangkan gejala *underemployment* hanya dialami dua
> responden.

---

## Tahap 7 — *Roll-up* ke tingkat program studi

> **Tahap 7. *Roll-up* pada hierarki dimensi program studi.** Dimensi program
> studi memiliki hierarki bertingkat dua, yaitu spesialisasi sebagai tingkat
> terhalus dan program studi sebagai tingkat di atasnya. Operasi *roll-up*
> menaikkan pengelompokan dari tingkat spesialisasi ke tingkat program studi,
> sehingga metrik disajikan per program studi sebagaimana Tabel 4.x.
>
> **Tabel 4.x Hasil *Roll-up* per Program Studi pada Jendela Kohort 2023–2024**
>
> | Program Studi | Lulusan | Bekerja | Jumlah Masa Tunggu (bulan) | Rata-rata Masa Tunggu (bulan) |
> |---|---:|---:|---:|---:|
> | Sci&Tech | 30 | 17 | 79,0 | 4,65 |
> | Others | 28 | 12 | 51,0 | 4,25 |
> | Comm&Mgmt | 26 | 16 | 72,0 | 4,50 |
> | **Jumlah** | **84** | **45** | **202,0** | **4,49** |
>
> Kolom rata-rata masa tunggu dihitung sebagai pembagian jumlah masa tunggu
> terhadap banyaknya responden bekerja pada program studi yang bersangkutan.
> Untuk program studi Sci&Tech:
>
> $$\bar{x}_{\text{Sci\&Tech}} = \frac{79{,}0}{17} = 4{,}6470\ldots \approx 4{,}65 \text{ bulan}$$
>
> Rata-rata gabungan tidak dihitung sebagai rata-rata dari ketiga rata-rata di
> atas, melainkan dari jumlah dan banyaknya pengamatan secara keseluruhan:
>
> $$\bar{x}_{\text{gabungan}} = \frac{79{,}0 + 51{,}0 + 72{,}0}{17 + 12 + 16} = \frac{202{,}0}{45} = 4{,}4888\ldots \approx 4{,}49 \text{ bulan}$$
>
> Pembedaan ini perlu diperhatikan karena rata-rata sederhana dari ketiga nilai
> rata-rata program studi, yaitu $(4{,}65 + 4{,}25 + 4{,}50)/3 = 4{,}47$ bulan,
> menghasilkan nilai yang berbeda. Nilai tersebut keliru karena memperlakukan
> ketiga program studi sebagai berbobot sama padahal banyaknya responden pada
> masing-masing program studi tidak sama. Operasi *roll-up* pada metrik yang
> berupa rata-rata karena itu selalu dikerjakan dengan mengagregasi ulang jumlah
> dan banyaknya pengamatan, bukan dengan merata-ratakan hasil agregasi tingkat
> di bawahnya.
>
> ```sql
> SELECT dp.program_studi,
>        COUNT(*) AS lulusan,
>        COUNT(*) FILTER (WHERE sk.status_bekerja = 'Bekerja') AS bekerja,
>        SUM(f.masa_tunggu_bulan) FILTER (WHERE sk.status_bekerja = 'Bekerja') AS jumlah_masa_tunggu,
>        ROUND(AVG(f.masa_tunggu_bulan) FILTER (WHERE sk.status_bekerja = 'Bekerja'), 2) AS rata_rata_masa_tunggu
> FROM fact_tracer_alumni f
> JOIN dim_waktu dw          ON dw.waktu_key  = f.waktu_key
> JOIN dim_status_kerja sk   ON sk.status_key = f.status_key
> JOIN dim_program_studi dp  ON dp.prodi_key  = f.prodi_key
> WHERE dw.tahun_lulus BETWEEN 2023 AND 2024
> GROUP BY dp.program_studi
> ORDER BY lulusan DESC;
> ```

**Catatan kerja — ini bagian terkuat dokumen ini.** Perangkap rata-rata dari
rata-rata (4,47 versus 4,49) adalah pertanyaan klasik penguji untuk soal
agregasi. Dengan menjelaskannya sendiri beserta angkanya, Anda menunjukkan
paham mengapa *roll-up* metrik rata-rata tidak boleh berjenjang. Jangan hapus
bagian ini demi menghemat halaman.

Saya sudah memeriksa juga: bila rata-rata per program studi yang **sudah
dibulatkan** dikalikan kembali dengan banyaknya responden, hasilnya 202,05 dan
bukan 202,0 — selisih 0,05 bulan akibat pembulatan. Selisih itu tidak mengubah
rata-rata gabungan pada dua angka di belakang koma, karena $202{,}05/45 = 4{,}49$
juga. Anda tidak perlu menuliskan ini di laporan, tetapi simpan sebagai bahan
jawaban bila ada penguji yang mengalikan balik.

---

## Tahap 8 — *Drill-down* silang program studi × kategori

> **Tahap 8. Operasi *drill-down* silang.** Tahap terakhir membedah kategori
> keselarasan horizontal menurut program studi, sehingga capaian tiap program
> studi dapat diperbandingkan. Operasi ini menyaring dua dimensi sekaligus,
> yaitu dimensi waktu dan dimensi status kerja, lalu mengelompokkan hasilnya
> menurut dua dimensi lain, yaitu program studi dan keselarasan.
>
> **Tabel 4.x Tabulasi Silang Program Studi terhadap Kategori Keselarasan Horizontal**
>
> | Program Studi | Selaras | Tidak Selaras | Jumlah | Persentase Selaras |
> |---|---:|---:|---:|---:|
> | Sci&Tech | 15 | 2 | 17 | 88,24% |
> | Comm&Mgmt | 13 | 3 | 16 | 81,25% |
> | Others | 11 | 1 | 12 | 91,67% |
> | **Jumlah** | **39** | **6** | **45** | **86,67%** |
>
> Persentase pada kolom terakhir dihitung terhadap penyebut masing-masing
> program studi, bukan terhadap penyebut keseluruhan. Untuk program studi
> Sci&Tech:
>
> $$P_{\text{Selaras, Sci\&Tech}} = \frac{15}{17} \times 100\% = 88{,}2352\ldots\% \approx 88{,}24\%$$
>
> Tabel ini sekaligus berfungsi sebagai pemeriksaan silang terhadap hasil tahap
> 5. Penjumlahan menurut kolom menghasilkan $15 + 13 + 11 = 39$ responden
> berkategori selaras dan $2 + 3 + 1 = 6$ responden berkategori tidak selaras,
> keduanya sama dengan hasil *roll-up* pada tahap 5. Penjumlahan menurut baris
> menghasilkan $17 + 16 + 12 = 45$, sama dengan penyebut. Kesesuaian kedua arah
> penjumlahan ini menunjukkan bahwa pembedahan menurut program studi tidak
> mengubah nilai agregat pada tingkat di atasnya, sesuai sifat operasi
> *drill-down* yang hanya mengubah tingkat rincian penyajian.
>
> ```sql
> SELECT dp.program_studi,
>        dk.kategori_horizontal,
>        COUNT(*) AS jumlah_alumni,
>        ROUND(COUNT(*) * 100.0
>              / SUM(COUNT(*)) OVER (PARTITION BY dp.program_studi), 2) AS persentase
> FROM fact_tracer_alumni f
> JOIN dim_waktu dw          ON dw.waktu_key       = f.waktu_key
> JOIN dim_status_kerja sk   ON sk.status_key      = f.status_key
> JOIN dim_program_studi dp  ON dp.prodi_key       = f.prodi_key
> JOIN dim_keselarasan dk    ON dk.keselarasan_key = f.keselarasan_key
> WHERE dw.tahun_lulus BETWEEN 2023 AND 2024
>   AND sk.status_bekerja = 'Bekerja'
> GROUP BY dp.program_studi, dk.kategori_horizontal
> ORDER BY dp.program_studi;
> ```

---

## Paragraf penutup dan kaidah pembulatan

> **4.x.y Kaidah Pembulatan dan Pemeriksaan Keutuhan**
>
> Seluruh persentase pada subbab ini dibulatkan ke dua angka di belakang koma
> menggunakan fungsi `ROUND` pada lapisan basis data, sehingga nilai yang tampil
> pada dasbor identik dengan nilai yang dihitung, tanpa pembulatan tambahan pada
> lapisan antarmuka. Pembulatan dikerjakan setelah pembagian, bukan sebelumnya.
>
> Akibat pembulatan yang dilakukan per nilai, jumlah persentase pada tabel
> berkategori banyak dapat menyimpang dari 100% sebesar satu satuan angka
> terakhir, sebagaimana tampak pada Tabel 4.x tahap 4 yang berjumlah 100,01%.
> Penyimpangan tersebut dibiarkan apa adanya agar setiap nilai tetap dapat
> ditelusuri dari pembagiannya sendiri.
>
> Keutuhan hasil agregasi diperiksa melalui dua cara. Pertama, penjumlahan
> frekuensi pada setiap tahap harus sama dengan penyebut tahap tersebut. Kedua,
> hasil pembedahan menurut dimensi tambahan harus menjumlah kembali ke nilai
> agregat pada tingkat di atasnya, sebagaimana ditunjukkan pada tahap 8. Kedua
> pemeriksaan tersebut terpenuhi pada seluruh tahapan yang diuraikan.

---

# Kueri verifikasi untuk dijalankan di pgAdmin

**Wajib Anda jalankan sebelum menempel naskah di atas.** Kueri ini memastikan
angka dari CSV sama dengan angka di basis data Anda yang memuat 216 baris.

```sql
-- 1. Populasi tabel fakta. Diharapkan 216 (CSV 215 + 1 kuesioner nyata).
SELECT COUNT(*) AS populasi_fakta FROM fact_tracer_alumni;

-- 2. Sebaran tahun lulus. Diharapkan 2023 = 42 dan 2024 = 42.
SELECT dw.tahun_lulus, COUNT(*) AS jumlah
FROM fact_tracer_alumni f
JOIN dim_waktu dw ON dw.waktu_key = f.waktu_key
GROUP BY dw.tahun_lulus ORDER BY dw.tahun_lulus;

-- 3. Kohort dan penyebut. Diharapkan kohort = 84, penyebut = 45.
SELECT COUNT(*) AS kohort,
       COUNT(*) FILTER (WHERE sk.status_bekerja = 'Bekerja') AS penyebut_bekerja,
       COUNT(*) FILTER (WHERE sk.status_bekerja = 'Bekerja'
                          AND f.keselarasan_key IS NULL)     AS bekerja_tanpa_keselarasan
FROM fact_tracer_alumni f
JOIN dim_waktu dw        ON dw.waktu_key  = f.waktu_key
JOIN dim_status_kerja sk ON sk.status_key = f.status_key
WHERE dw.tahun_lulus BETWEEN 2023 AND 2024;

-- 4. Lima tingkat keeratan + dua kategori sekaligus.
--    Diharapkan 16 / 15 / 8 / 3 / 3, dan Selaras 39 / Tidak Selaras 6.
SELECT dk.hubungan_bidang, dk.kategori_horizontal, COUNT(*) AS jumlah,
       ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER (), 2) AS persentase
FROM fact_tracer_alumni f
JOIN dim_waktu dw        ON dw.waktu_key       = f.waktu_key
JOIN dim_status_kerja sk ON sk.status_key      = f.status_key
JOIN dim_keselarasan dk  ON dk.keselarasan_key = f.keselarasan_key
WHERE dw.tahun_lulus BETWEEN 2023 AND 2024
  AND sk.status_bekerja = 'Bekerja'
GROUP BY dk.hubungan_bidang, dk.kategori_horizontal
ORDER BY jumlah DESC;

-- 5. Empat pilihan vertikal. Diharapkan 12 / 31 / 2 / 0.
SELECT dk.tingkat_pendidikan_sesuai, COUNT(*) AS jumlah
FROM fact_tracer_alumni f
JOIN dim_waktu dw        ON dw.waktu_key       = f.waktu_key
JOIN dim_status_kerja sk ON sk.status_key      = f.status_key
JOIN dim_keselarasan dk  ON dk.keselarasan_key = f.keselarasan_key
WHERE dw.tahun_lulus BETWEEN 2023 AND 2024
  AND sk.status_bekerja = 'Bekerja'
GROUP BY dk.tingkat_pendidikan_sesuai
ORDER BY jumlah DESC;

-- 6. Masa tunggu per prodi. Diharapkan jumlah 79 / 51 / 72, gabungan 202.
SELECT dp.program_studi,
       COUNT(*) AS bekerja,
       SUM(f.masa_tunggu_bulan)              AS jumlah_masa_tunggu,
       ROUND(AVG(f.masa_tunggu_bulan), 2)    AS rata_rata
FROM fact_tracer_alumni f
JOIN dim_waktu dw          ON dw.waktu_key = f.waktu_key
JOIN dim_status_kerja sk   ON sk.status_key = f.status_key
JOIN dim_program_studi dp  ON dp.prodi_key = f.prodi_key
WHERE dw.tahun_lulus BETWEEN 2023 AND 2024
  AND sk.status_bekerja = 'Bekerja'
GROUP BY dp.program_studi ORDER BY dp.program_studi;
```

**Cara membaca hasilnya.** Bila kueri 3 mengembalikan kohort 84 dan penyebut 45,
seluruh naskah di atas bisa ditempel apa adanya. Bila penyebutnya 46, berarti
jawaban kuesioner nyata Anda masuk ke dalam kohort dan berstatus bekerja —
kirimkan hasil keenam kueri itu dan saya hitung ulang semua tabel. Bila kueri 4
mengembalikan kolom `kategori_horizontal` kosong, berarti migrasi
`2026_08_14_000001` belum dijalankan pada basis data itu.

---

# Ringkasan angka resmi hasil simulasi ini

Simpan sebagai acuan tunggal, dan pastikan slide serta demo memakai angka yang
sama.

| Metrik | Nilai |
|---|---|
| Populasi tabel fakta | 215 (CSV) / 216 (basis data) |
| Jendela kohort | 2023–2024 (TS-2 dan TS-1 pada tahun survei 2025) |
| Lulusan dalam kohort | 84 |
| Penyebut responden bekerja | 45 |
| Keselarasan horizontal | Selaras 39 (86,67%) · Tidak Selaras 6 (13,33%) |
| Keselarasan vertikal — Opsi A | Selaras 43 (95,56%) · Tidak Selaras 2 (4,44%) |
| Keselarasan vertikal — Opsi B | Selaras 31 (68,89%) · Tidak Selaras 14 (31,11%) |
| Rata-rata masa tunggu | 4,49 bulan (202,0 ÷ 45) |
| Selaras per prodi | Sci&Tech 88,24% · Comm&Mgmt 81,25% · Others 91,67% |

**Angka lama yang harus diganti di seluruh naskah.** Laporan Anda sekarang
memakai kohort 127 dan penyebut 78 dengan keselarasan Selaras 68 (87,2%) dan
Tidak Selaras 10 (12,8%). Angka itu benar untuk definisi kohort TS-1 sampai TS-3
dengan penyebut Bekerja dan Wirausaha, tetapi **bukan** definisi yang dipakai
kode. Sisir seluruh Bab 1, 3, 4, dan slide untuk keenam angka berikut: 127, 78,
68, 87,2%, 10, dan 12,8%. Demikian pula angka keselarasan vertikal lama, yaitu
23, 52, dan 3.
