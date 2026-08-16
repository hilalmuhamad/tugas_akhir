# Tabel Hasil Implementasi: Perbandingan Sistem

Naskah untuk **Bab 4, subbab Analisa Hasil Pengujian**, disisipkan setelah
Tabel 4-5 dan sebelum paragraf penutup Bab 4. Tabel ini berbeda dari Tabel 3-2
di Bab 3: Tabel 3-2 menyatakan apa yang *dijanjikan* pada tahap perancangan,
sedangkan tabel di sini membuktikan apa yang *terwujud* setelah implementasi,
lengkap dengan angka hasil pengukuran dan rujukan skenario pengujiannya.

Seluruh angka diverifikasi langsung dari basis data PostgreSQL dan berkas hasil
pelatihan pada 11 Agustus 2026.

---

## 1. Paragraf pengantar (sebelum tabel)

> Pengujian black box pada Tabel 4-1 sampai Tabel 4-5 membuktikan bahwa setiap
> fungsi sistem berjalan sesuai rancangan. Namun keberhasilan fungsional belum
> menjawab pertanyaan yang lebih mendasar, yaitu sejauh mana sistem yang
> dibangun benar-benar mengubah cara pengelolaan data tracer study dibandingkan
> keadaan sebelumnya. Untuk menjawabnya, Tabel 4-6 membandingkan setiap aspek
> yang sebelumnya diidentifikasi sebagai kelemahan sistem berjalan pada Tabel
> 3-2 terhadap hasil implementasi yang terukur, disertai rujukan skenario
> pengujian yang menjadi buktinya. Kolom hasil implementasi memuat angka yang
> dibaca langsung dari basis data setelah rantai ETL dijalankan, bukan angka
> perkiraan pada tahap perancangan.

---

## 2. Tabel 4-6 (tabel utama)

**Tabel 4-6 Perbandingan Hasil Implementasi terhadap Sistem Berjalan**

| No | Aspek | Sistem Berjalan | Hasil Implementasi Sistem Usulan | Bukti |
|---|---|---|---|---|
| 1 | Penyajian rekapitulasi lintas dimensi | Tabel pivot disusun ulang secara manual pada berkas lembar sebar setiap kali kombinasi penyaring berubah | Satu permintaan ke `GET /api/stats/olap` mengembalikan seluruh agregasi sekaligus: ringkasan indikator, rekapitulasi per tahun kelulusan, per program studi, dan tabulasi silang program studi terhadap lima status kerja. Perubahan sudut pandang dilakukan dengan mengganti kolom pengelompokan pada kueri, bukan menyusun ulang data sumber | Tabel 4-3 skenario 1–4 |
| 2 | Basis data analitik dan pemuatan data | Tidak ada basis data analitik; data tersebar sebagai berkas terpisah per angkatan dan tidak saling terhubung | Skema bintang pada PostgreSQL terdiri atas satu tabel fakta dan **lima** tabel dimensi. Perintah `php artisan etl:sync` memuat 216 baris fakta melalui tabel singgah tanpa pelanggaran integritas referensial, membentuk 7 anggota dimensi program studi, 6 anggota dimensi waktu, 5 anggota dimensi status kerja, dan 20 anggota dimensi keselarasan | Tabel 4-3 skenario 1 |
| 3 | Cakupan populasi dan jendela kohort | Rentang angkatan yang dilaporkan ditentukan secara ad hoc oleh penyusun laporan, tanpa aturan baku yang tercatat | Tabel fakta menyimpan seluruh 216 lulusan tahun 2021–2026, sedangkan dashboard menyaring populasi pada lapisan kueri menjadi kohort TS-1 s.d. TS-3 (lulusan 2023–2025) sebanyak **127 alumni**. Data di luar jendela tetap tersimpan sehingga rentang dapat digeser tanpa memuat ulang gudang data | Tabel 4-3 skenario 6 |
| 4 | Pengukuran keselarasan lulusan | Tidak diukur; kesesuaian bidang kerja hanya diperkirakan dari nama jabatan pada berkas rekapitulasi | Dihitung langsung dari tabel fakta melalui dimensi keselarasan berisi 20 kombinasi tetap. Atas 78 alumni bekerja pada kohort: keselarasan horizontal **Selaras 68 (87,2%)** dan Tidak Selaras 10 (12,8%); keselarasan vertikal **Sama 52 (66,7%)**, Tinggi 23 (29,5%), dan Rendah 3 (3,8%) | Tabel 4-3 skenario 7; Gambar 4-6 dan 4-7 |
| 5 | Perhitungan indikator turunan | Masa tunggu kerja dan status ketepatan waktu lulus dihitung manual, dan berpotensi berbeda antarpenyusun laporan | Kedua indikator dihitung sistem: masa tunggu sebagai selisih bulan penuh antara tanggal lulus dan tanggal mulai bekerja, ketepatan waktu dari selisih tahun masuk dan tahun lulus terhadap durasi ideal jenjang. Pada kohort diperoleh rata-rata masa tunggu **4,65 bulan**, gaji awal **7,18 juta rupiah**, dan IPK **3,23**; sebanyak 52 dari 78 alumni bekerja memperoleh pekerjaan pertama di bawah enam bulan | Tabel 4-2 skenario 2 |
| 6 | Pencarian lowongan kerja bagi lulusan | Dilakukan mandiri di luar sistem, tanpa penyesuaian terhadap profil lulusan | Sistem memeringkat **335 lowongan** dengan pembobotan TF-IDF dan kemiripan kosinus atas kalimat bahasa alami. Kueri berbahasa Indonesia tercocokkan ke lowongan berbahasa Inggris melalui kamus stopword dua bahasa dan kamus sinonim; peringkat dipersonalisasi dengan menggabungkan kueri pengguna dan teks profil pada bobot 0,6 dan 0,4, serta dapat dipersempit menurut daerah kerja | Tabel 4-2 skenario 4–5 |
| 7 | Analitik pendukung atas data lulusan | Data hanya dipakai untuk pelaporan jumlah, tanpa penelusuran pola antarvariabel | Random Forest dilatih luring untuk mengklasifikasikan kelayakan lulusan terhadap Indikator Kinerja Utama pertama, dengan akurasi validasi silang berlapis **0,674 ± 0,109** dan F1 makro 0,672, melampaui penduga dasar *most frequent* 0,544. Peringkat kepentingan permutasi menempatkan pengalaman kerja (0,189) dan IPK (0,086) sebagai dua variabel paling berpengaruh | Tabel 4-4 skenario 1–5 |
| 8 | Timbal balik kepada alumni | Tidak ada; kuesioner bersifat searah sehingga tidak ada insentif bagi alumni untuk mengisi maupun memperbarui isian | Data yang sama dipakai kembali untuk kepentingan pengisinya: profil kuesioner menjadi masukan pemeringkatan lowongan, dan modul analisis karier mengubah teks profil yang ditempel menjadi ringkasan, pendidikan, pengalaman, keterampilan, rekomendasi posisi, serta daftar kesenjangan keterampilan | Tabel 4-2 skenario 4; Tabel 4-5 skenario 1–4 |

---

## 3. Paragraf penutup (setelah tabel)

> Tabel 4-6 menunjukkan bahwa kedelapan aspek yang diidentifikasi sebagai
> kelemahan sistem berjalan telah tertangani pada sistem yang dibangun, dan
> setiap penanganan tersebut dapat ditelusuri ke skenario pengujian tertentu.
> Perubahan yang paling menentukan terletak pada aspek kedua dan keempat.
> Pemindahan data dari berkas lembar sebar ke skema bintang membuat rekapitulasi
> lintas dimensi menjadi persoalan penyusunan kueri, bukan lagi persoalan
> penyusunan ulang data. Sementara itu, penempatan keselarasan sebagai dimensi
> tersendiri membuat dua indikator relevansi lulusan dapat dihitung dari tabel
> fakta, padahal sebelumnya kedua indikator tersebut tidak pernah diukur.
>
> Dua catatan perlu disampaikan agar perbandingan ini tidak terbaca melampaui
> apa yang benar-benar dibuktikan. Pertama, dashboard menyajikan agregasi yang
> telah ditetapkan sebelumnya beserta penyaring jendela kohort; penelusuran
> drill-down yang dikendalikan langsung oleh pengguna belum tersedia, sehingga
> perbaikan pada aspek pertama terbatas pada kecepatan penyajian dan belum
> mencakup keleluasaan penelusuran. Kedua, angka akurasi pada aspek ketujuh
> menunjukkan simpangan antar lapis validasi yang lebar, yaitu 0,465 sampai
> 0,767, sehingga yang tervalidasi adalah keterpaduan fungsional modul
> klasifikasi ke dalam dashboard dan bukan kelayakan modelnya sebagai alat
> prediksi. Kedua batasan tersebut dicatat sebagai bahan pengembangan pada
> Bab 5.

---

## 4. Perbaikan yang harus dilakukan pada Tabel 3-2 di Bab 3

Tabel 4-6 hanya konsisten apabila Tabel 3-2 diperbaiki lebih dahulu. Isi Tabel
3-2 sekarang (paragraf `[644]`–`[660]`) memuat empat baris dan **satu di
antaranya keliru**:

Baris keempat berbunyi *"algoritma Random Forest digunakan untuk menelaah
faktor yang berhubungan dengan ketepatan waktu kelulusan"*. Target itu tidak
lagi dipakai. Model yang benar-benar diterapkan mengklasifikasikan kelayakan
lulusan terhadap Indikator Kinerja Utama pertama, dan angka model ketepatan
waktu tidak boleh dikutip karena labelnya diturunkan dari variabel yang juga
menjadi fiturnya. Ganti sel tersebut menjadi:

> Data lulusan dianalisis menurut dimensi program studi, waktu, status kerja,
> dan keselarasan; sebagai pendukung, algoritma Random Forest digunakan untuk
> mengklasifikasikan kelayakan lulusan terhadap Indikator Kinerja Utama pertama.

Tambahkan pula baris kelima sesuai butir revisi A3.2:

| Aspek | Sistem Berjalan | Sistem Usulan |
|---|---|---|
| Pengukuran keselarasan lulusan | Tidak diukur; kesesuaian bidang kerja hanya diperkirakan dari nama jabatan pada berkas rekapitulasi | Diukur dari dua pertanyaan kuesioner, lalu dipetakan ke kategori keselarasan horizontal dan vertikal pada dimensi tersendiri di gudang data |

Dengan begitu Tabel 3-2 memuat lima baris dan Tabel 4-6 memuat delapan baris.
Perbedaan jumlah itu wajar dan sebaiknya dijelaskan dalam satu kalimat pada
paragraf pengantar: tiga aspek terakhir pada Tabel 4-6 (cakupan kohort,
indikator turunan, dan timbal balik kepada alumni) baru dapat dinyatakan
setelah implementasi, sehingga tidak muncul pada tahap perancangan.

---

## 5. Catatan penyusunan

**Penomoran.** Nomor 4-6 dipakai dengan asumsi Tabel 4-1 sampai Tabel 4-5 tetap
seperti sekarang. Bila butir A4.1 dikerjakan lebih dahulu dan menghasilkan tabel
komposisi data di awal Bab 4, seluruh nomor sesudahnya bergeser satu.

**Repeat Header.** Tabel ini hampir pasti melewati satu halaman. Aktifkan
*Repeat as header row at the top of each page* pada baris judulnya, sesuai
ketentuan yang juga berlaku untuk 16 tabel lain di laporan yang belum
mengaktifkannya.

**Lebar kolom.** Kolom "Hasil Implementasi Sistem Usulan" memuat teks paling
panjang. Proporsi yang terbaca rapi pada kertas A4: 5% untuk No, 18% Aspek, 25%
Sistem Berjalan, 40% Hasil Implementasi, dan 12% Bukti.

**Rujukan skenario baru.** Kolom Bukti menyebut Tabel 4-3 skenario 6 dan 7 serta
Tabel 4-2 skenario 6. Ketiganya adalah skenario tambahan dari butir revisi A4.6
dan A4.7 yang **belum ada di laporan sekarang**. Sisipkan ketiganya lebih dahulu,
atau hapus rujukannya dari kolom Bukti agar tidak menunjuk ke sesuatu yang tidak
ada. Kalau ketiga skenario itu ditambahkan, total skenario black box menjadi 31,
bukan 28 — angka pada kesimpulan Bab 4 dan Bab 5 perlu ikut disesuaikan.

**Yang tidak boleh masuk tabel ini.** Angka akurasi model ketepatan waktu lulus
(0,763 terhadap penduga dasar 0,758) tidak boleh dicantumkan sebagai bukti
kemampuan prediksi, karena labelnya dihitung dari variabel yang juga dipakai
sebagai fitur. Hindari juga istilah *real-time* dan *slice and dice* pada kolom
mana pun; keduanya masih muncul di beberapa bagian laporan dan termasuk dalam
daftar perbaikan Bab 3 dan Bab 4.

**Sumber angka.** 216 baris fakta, 7 anggota dimensi program studi, 127 alumni
kohort, 78 alumni bekerja, 335 lowongan, serta seluruh persentase keselarasan
dibaca dari basis data pada 11 Agustus 2026. Angka model (0,674 ± 0,109; F1
0,672; penduga dasar 0,544; kepentingan permutasi) berasal dari
`admin/src/data/randomForestResult.json` hasil pelatihan 5 Agustus 2026 atas 215
rekaman yang tersedia saat itu. Selisih 216 terhadap 215 sebaiknya dinyatakan
terbuka dalam satu kalimat, bukan disamakan.

