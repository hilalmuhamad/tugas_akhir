# Revisi Bab 2 — Istilah Tracer Study dan Dasar Keselarasan

> **Cara memakai berkas ini.** Naskah di bawah ditulis untuk disalin ke Bab 2
> laporan. Subbab **2.2.x Istilah dan Definisi Operasional dalam Tracer Study**
> disisipkan sebagai subbab baru tepat **sesudah** subbab *Konsep Tracer Study*
> yang sudah ada dan **sebelum** subbab *Metode dan Algoritma Utama (Core
> Technologies)*. Tabel 2-1 pada naskah lama **diganti seluruhnya** oleh Tabel
> 2-1 versi baru di berkas ini, dan Tabel 2-2 adalah tabel baru.
>
> Daftar kalimat lama yang harus dihapus ada di bagian penutup berkas ini.

---

## 2.2.x Istilah dan Definisi Operasional dalam Tracer Study

Penelusuran rekam jejak lulusan memakai sejumlah istilah teknis yang maknanya
telah dibakukan oleh kementerian. Pembakuan itu penting karena satu istilah yang
sama dapat berarti berbeda antar perguruan tinggi, sehingga hasil penelusuran
menjadi tidak dapat dibandingkan. Subbab ini menetapkan definisi operasional
setiap istilah yang dipakai pada penelitian ini, sekaligus menyebutkan sumber
normatifnya, agar setiap angka yang muncul pada bab implementasi dapat
ditelusuri sampai ke rumusan aslinya.

Rujukan normatif utama yang dipakai adalah Keputusan Menteri Pendidikan,
Kebudayaan, Riset, dan Teknologi Nomor 3/M/2021 tentang Indikator Kinerja Utama
Perguruan Tinggi Negeri dan Lembaga Layanan Pendidikan Tinggi, beserta Buku
Panduan Indikator Kinerja Utama Perguruan Tinggi yang diterbitkan oleh
Kementerian Pendidikan, Kebudayaan, Riset, dan Teknologi sebagai penjelas
teknisnya. Kedua dokumen tersebut menetapkan Indikator Kinerja Utama 1 (IKU 1),
yaitu *lulusan mendapat pekerjaan yang layak*, sebagai indikator yang wajib
dilaporkan perguruan tinggi, dan menetapkan pula instrumen penelusuran yang
menjadi alat ukurnya. Struktur pertanyaan pada instrumen penelusuran nasional
itulah yang diadopsi menjadi struktur kuesioner pada sistem yang dibangun.

### 2.2.x.1 Istilah penyelenggaraan penelusuran

**Populasi sasaran** adalah seluruh lulusan yang berada di dalam jendela
penelusuran pada satu periode survei. **Kohort** adalah pengelompokan lulusan
menurut tahun kelulusannya. Instrumen nasional menelusuri lulusan pada dua
kohort sekaligus, yaitu lulusan satu tahun sebelum tahun survei (dinotasikan
TS-1) dan lulusan dua tahun sebelum tahun survei (TS-2), dengan TS adalah tahun
pelaksanaan survei. Ketentuan ini dipakai karena lulusan yang baru saja
diwisuda belum tentu telah menyelesaikan masa transisinya ke dunia kerja,
sementara lulusan yang sudah terlalu lama meninggalkan kampus sukar dihubungi
dan jawabannya sudah tidak lagi mencerminkan mutu kurikulum yang berlaku.

**Responden** adalah lulusan yang mengembalikan kuesioner dalam keadaan terisi.
**Tingkat respons** (*response rate*) adalah nisbah antara jumlah responden
dengan jumlah populasi sasaran. Perbedaan antara populasi sasaran dan responden
perlu dipertahankan secara eksplisit di dalam basis data, sebab setiap
persentase capaian pada laporan harus jelas memakai penyebut yang mana.

Pada sistem yang dibangun, jendela dua kohort tersebut diwujudkan sebagai relasi
antara dimensi tahun survei dengan dimensi waktu. Satu tahun kelulusan dapat
muncul pada dua periode survei yang berbeda, yaitu sebagai TS-1 pada survei
tahun berikutnya dan sebagai TS-2 pada survei dua tahun berikutnya. Perlu
ditegaskan bahwa pemenggalan jendela ini hanya berlaku pada penyajian per
periode survei; seluruh baris rekam jejak tetap tersimpan utuh di dalam tabel
fakta sehingga penelusuran lintas tahun tetap dapat dilakukan.

### 2.2.x.2 Istilah luaran penelusuran

**Status kegiatan lulusan** adalah keadaan utama lulusan pada saat kuesioner
diisi. Instrumen nasional menyediakan pilihan yang cukup rinci, yaitu bekerja,
berwirausaha atau merintis usaha rintisan, melanjutkan studi, belum bekerja
tetapi sedang mencari kerja, serta belum memungkinkan bekerja. Untuk keperluan
agregasi pada gudang data, pilihan tersebut diringkas menjadi dua kategori,
yaitu **Bekerja** dan **Tidak Bekerja**, dengan aturan peringkasan yang
dijabarkan pada Tabel 2-2. Peringkasan ini dilakukan karena tabel dimensi pada
skema bintang harus memuat kategori yang saling terpisah dan menutup seluruh
kemungkinan, sedangkan kategori rinci lebih tepat disimpan sebagai jawaban
mentah pada area penampungan.

**Masa tunggu kerja** adalah selang waktu, dalam satuan bulan, terhitung sejak
lulusan ditetapkan lulus sampai memperoleh pekerjaan pertama. Buku Panduan
Indikator Kinerja Utama menetapkan ambang capaian yang baik pada masa tunggu
kurang dari atau sama dengan enam bulan. Metrik ini hanya bermakna bagi lulusan
berkategori Bekerja, sehingga bagi lulusan berkategori Tidak Bekerja nilainya
dibiarkan kosong dan bukan diisi angka nol. Membedakan keduanya penting karena
angka nol akan ikut terhitung pada rata-rata dan menarik nilainya ke bawah
secara keliru.

**Keselarasan** (*alignment*) adalah tingkat kesepadanan antara pendidikan yang
ditempuh lulusan dengan pekerjaan yang dijalaninya. Istilah ini terbagi menjadi
dua dimensi yang berdiri sendiri dan tidak boleh dicampur, yaitu keselarasan
horizontal dan keselarasan vertikal. Karena dua dimensi inilah yang menjadi
pokok arahan penguji, dasar dan bukti keduanya diuraikan tersendiri pada subbab
berikutnya.

### 2.2.x.3 Keselarasan horizontal dan vertikal beserta dasarnya

**Keselarasan horizontal** menyatakan kesepadanan antara *bidang* ilmu yang
ditempuh lulusan dengan *bidang* pekerjaan yang dijalaninya. Pertanyaannya
menyoal keeratan hubungan antara bidang studi dengan pekerjaan, dan instrumen
penelusuran nasional menyediakan lima pilihan berjenjang, yaitu sangat erat,
erat, cukup erat, kurang erat, dan tidak sama sekali. Dimensi ini menjawab
pertanyaan “apakah lulusan bekerja pada bidang yang ia pelajari”.

**Keselarasan vertikal** menyatakan kesepadanan antara *jenjang* pendidikan yang
ditamatkan lulusan dengan *tingkat* pendidikan yang sesungguhnya dituntut oleh
pekerjaannya. Pertanyaannya menyoal tingkat pendidikan yang paling tepat untuk
pekerjaan tersebut, dengan empat pilihan, yaitu setingkat lebih tinggi, tingkat
yang sama, setingkat lebih rendah, serta tidak perlu pendidikan tinggi. Dimensi
ini menjawab pertanyaan yang sama sekali berbeda, yaitu “apakah jenjang
pendidikan lulusan terpakai pada pekerjaannya”.

Landasan teoretis pemisahan kedua dimensi tersebut berasal dari kajian
ketidaksepadanan pendidikan dan pekerjaan (*educational mismatch*). Kajian
tersebut membedakan ketidaksepadanan menurut bidang (*horizontal mismatch*) dari
ketidaksepadanan menurut tingkat (*vertical mismatch*), dan menunjukkan bahwa
keduanya berdampak berbeda terhadap pendapatan serta kepuasan kerja lulusan.
Keadaan lulusan yang bekerja pada tingkat lebih rendah daripada jenjang yang
ditamatkannya dikenal sebagai bekerja di bawah kualifikasi
(*underemployment* atau *overeducation*). Pembedaan inilah yang menjadi alasan
mengapa satu orang lulusan dapat berstatus selaras pada satu dimensi tetapi
tidak selaras pada dimensi yang lain, sehingga kedua dimensi wajib disimpan
sebagai dua atribut terpisah di dalam gudang data.

Sebagai bukti bahwa kedua dimensi tersebut memang berperilaku berbeda pada data
penelitian ini, hasil pengolahan menunjukkan angka yang tidak sama untuk
keduanya, yaitu 122 dari 132 responden bekerja tergolong selaras pada dimensi
horizontal, sedangkan pada dimensi vertikal angkanya 127 dari 132 responden.
Rincian perhitungannya disajikan pada Bab 4.

Mengenai penamaan kategori, Buku Panduan Indikator Kinerja Utama memakai istilah
**selaras** dan **tidak selaras** untuk melaporkan capaian keselarasan, bukan
istilah berjenjang seperti sangat erat atau cukup erat. Istilah berjenjang
tersebut adalah pilihan jawaban pada instrumen, bukan kategori pelaporan. Oleh
sebab itu, sejalan dengan arahan penguji, penelitian ini memakai dua kategori
saja, yaitu Selaras dan Tidak Selaras, pada kedua dimensi keselarasan. Jawaban
berjenjang pada instrumen diringkas menjadi dua kategori tersebut memakai aturan
pada Tabel 2-2.

Aturan peringkasan pada dimensi horizontal menempatkan sangat erat, erat, dan
cukup erat sebagai Selaras, sedangkan kurang erat dan tidak sama sekali sebagai
Tidak Selaras. Batas dipasang di antara cukup erat dan kurang erat karena tiga
pilihan teratas sama-sama menyatakan adanya hubungan antara bidang studi dengan
pekerjaan, sedangkan dua pilihan terbawah menyatakan hubungan yang lemah atau
tidak ada sama sekali.

Aturan peringkasan pada dimensi vertikal menempatkan setingkat lebih tinggi dan
tingkat yang sama sebagai Selaras, sedangkan setingkat lebih rendah dan tidak
perlu pendidikan tinggi sebagai Tidak Selaras. Dasarnya adalah konsep bekerja di
bawah kualifikasi yang telah diuraikan di atas. Pekerjaan yang menuntut tingkat
pendidikan sama dengan atau lebih tinggi daripada jenjang yang ditamatkan
lulusan berarti jenjang tersebut terpakai seluruhnya, sehingga tergolong
selaras. Sebaliknya, pekerjaan yang menuntut tingkat lebih rendah, termasuk
pekerjaan yang sebenarnya tidak menuntut pendidikan tinggi, menunjukkan sebagian
jenjang pendidikan lulusan tidak terpakai, sehingga tergolong tidak selaras.

Perlu ditegaskan satu hal yang menyangkut penyebut. Kedua pertanyaan keselarasan
hanya diajukan kepada lulusan berkategori Bekerja, karena pertanyaan tentang
kesepadanan pekerjaan tidak dapat dijawab oleh lulusan yang tidak memiliki
pekerjaan. Dengan demikian penyebut persentase keselarasan adalah jumlah
responden berkategori Bekerja yang menjawab kedua pertanyaan tersebut, bukan
jumlah seluruh lulusan. Jawaban yang kosong tetap dibiarkan kosong dan tidak
dianggap sebagai Tidak Selaras, sebab tidak menjawab bukanlah pernyataan bahwa
pekerjaannya tidak selaras.

**Tabel 2-2 Pemetaan pilihan jawaban instrumen ke kategori pelaporan Kemendikti**

| Dimensi | Pilihan jawaban pada instrumen | Kategori pelaporan | Dasar penetapan |
|---|---|---|---|
| Status kegiatan | Bekerja | Bekerja | Lulusan memiliki pekerjaan berpenghasilan pada pemberi kerja |
| Status kegiatan | Wirausaha/Startup | Bekerja | Berwirausaha diakui sebagai bentuk bekerja pada Buku Panduan IKU |
| Status kegiatan | Melanjutkan Studi | Tidak Bekerja | Lulusan tidak berada di pasar kerja pada saat survei |
| Status kegiatan | Tidak Bekerja tetapi Sedang Mencari Kerja | Tidak Bekerja | Lulusan berada di pasar kerja namun belum terserap |
| Status kegiatan | Belum Memungkinkan Bekerja | Tidak Bekerja | Lulusan belum memasuki pasar kerja |
| Keselarasan horizontal | Sangat erat | Selaras | Bidang pekerjaan sepadan dengan bidang studi |
| Keselarasan horizontal | Erat | Selaras | Bidang pekerjaan sepadan dengan bidang studi |
| Keselarasan horizontal | Cukup erat | Selaras | Masih terdapat hubungan bidang yang dapat ditunjukkan |
| Keselarasan horizontal | Kurang erat | Tidak Selaras | Hubungan bidang lemah |
| Keselarasan horizontal | Tidak sama sekali | Tidak Selaras | Tidak ada hubungan bidang |
| Keselarasan vertikal | Setingkat lebih tinggi | Selaras | Jenjang lulusan terpakai seluruhnya |
| Keselarasan vertikal | Tingkat yang sama | Selaras | Jenjang lulusan terpakai seluruhnya |
| Keselarasan vertikal | Setingkat lebih rendah | Tidak Selaras | Bekerja di bawah kualifikasi (*underemployment*) |
| Keselarasan vertikal | Tidak perlu pendidikan tinggi | Tidak Selaras | Bekerja di bawah kualifikasi (*underemployment*) |
| Keselarasan (kedua dimensi) | Tidak dijawab / bukan kategori Bekerja | *tidak dihitung* | Keluar dari penyebut, tidak digolongkan Tidak Selaras |

Tabel 2-2 sekaligus berfungsi sebagai spesifikasi transformasi pada tahap
*Extract, Transform, Load*. Setiap baris pada tabel tersebut diwujudkan menjadi
satu aturan pemetaan di dalam kode, sehingga penggolongan kategori tidak
ditetapkan secara manual pada antarmuka melainkan dihitung dari jawaban mentah
responden. Penerapan dan pembuktian numeriknya diuraikan pada Bab 4.

### 2.2.x.4 Catatan tentang penyebutan Indikator Kinerja Utama 1

Terdapat satu kekeliruan penyebutan yang lazim terjadi dan perlu dihindari.
Indikator Kinerja Utama 1 menghitung lulusan yang bekerja, berwirausaha,
**atau** melanjutkan studi sebagai capaian. Sementara itu, peringkasan status
kegiatan pada penelitian ini menempatkan melanjutkan studi ke dalam kategori
Tidak Bekerja, karena lulusan tersebut memang belum berada di pasar kerja
sehingga masa tunggu dan keselarasannya tidak terdefinisi. Akibatnya, persentase
yang dihasilkan sistem ini adalah **persentase alumni bekerja**, dan angka itu
**bukan** angka capaian Indikator Kinerja Utama 1. Keduanya tidak boleh
dipertukarkan pada penyajian laporan. Apabila capaian Indikator Kinerja Utama 1
hendak dilaporkan, jumlah lulusan yang melanjutkan studi harus dijumlahkan
kembali ke pembilang, dan hal itu dapat dilakukan karena jawaban rinci responden
tetap tersimpan pada area penampungan.

### Tabel 2-1 versi baru

**Tabel 2-1 Indikator Evaluasi Pertumbuhan Karier Lulusan**

| Indikator | Atribut sumber data | Parameter pengukuran |
|---|---|---|
| Status kegiatan lulusan | `dim_status_kerja.status_bekerja` | Nominal biner: Bekerja; Tidak Bekerja. Diringkas dari lima pilihan instrumen menurut Tabel 2-2 |
| Masa tunggu kerja | `fact_tracer_alumni.masa_tunggu_bulan` | Rasio, satuan bulan. Terisi hanya untuk lulusan berkategori Bekerja; ambang capaian baik ≤ 6 bulan |
| Tingkat pendapatan | `fact_tracer_alumni.gaji_juta` | Rasio, satuan juta rupiah per bulan. Terisi hanya untuk lulusan berkategori Bekerja |
| Indeks prestasi kumulatif | `fact_tracer_alumni.ipk` | Rasio, rentang 0,00–4,00 dengan presisi dua angka desimal |
| Pengalaman kerja semasa kuliah | `fact_tracer_alumni.pengalaman_kerja` | Nominal biner: Ya; Tidak |
| Masa studi | `v_olap_detail.masa_studi_tahun` | Rasio, satuan tahun; selisih tahun lulus dengan tahun masuk |
| Ketepatan waktu kelulusan | `v_olap_detail.lulus_tepat_waktu` | Nominal biner: Tepat waktu; Tidak tepat waktu. Ambang D3 ≤ 3 tahun; S1 ≤ 4 tahun |
| Jabatan pekerjaan | `dim_alumni.jabatan` | Nominal, teks bebas. Terisi hanya untuk lulusan berkategori Bekerja |
| Bidang pekerjaan | `dim_alumni.bidang_pekerjaan` | Nominal, kategori bidang usaha. Terisi hanya untuk lulusan berkategori Bekerja |
| Keselarasan horizontal | `dim_keselarasan` dimensi Horizontal | Nominal biner: Selaras; Tidak Selaras. Diringkas dari lima pilihan instrumen menurut Tabel 2-2 |
| Keselarasan vertikal | `dim_keselarasan` dimensi Vertikal | Nominal biner: Selaras; Tidak Selaras. Diringkas dari empat pilihan instrumen menurut Tabel 2-2 |
| Program studi | `dim_program_studi.program_studi` | Nominal, kelompok program studi |
| Tahun kelulusan | `dim_waktu.tahun_lulus` | Interval, satuan tahun |
| Periode survei | `dim_tahun_survei.tahun_survei` | Interval, satuan tahun; menentukan jendela kohort TS-1 dan TS-2 |

---

## Kalimat pada naskah lama yang harus dihapus atau diganti

1. Pada Tabel 2-1 lama, baris **Status Kegiatan Lulusan** menyebut “Nominal, 5
   kategori”. Sistem hanya menyimpan dua kategori pada tabel dimensi, sehingga
   baris ini harus memakai rumusan Tabel 2-1 versi baru.

2. Pada Tabel 2-1 lama, baris **Kategori Penghasilan** dengan nilai
   “Berpenghasilan; Tidak Berpenghasilan” harus dihapus seluruhnya. Kolom
   tersebut tidak ada lagi pada skema basis data. Seluruh frasa “terisi hanya
   untuk lulusan berkategori Berpenghasilan” pada baris lain diganti menjadi
   “terisi hanya untuk lulusan berkategori Bekerja”.

3. Pada Tabel 2-1 lama, baris **Keselarasan Vertikal** menyatakan “Ordinal, 4
   pilihan … Diringkas menjadi 3 kategori: Tinggi; Sama; Rendah”. Rumusan ini
   bertentangan dengan arahan penguji dan bertentangan pula dengan baris
   Keselarasan Horizontal pada tabel yang sama. Harus diganti menjadi dua
   kategori Selaras dan Tidak Selaras.

4. Notasi bertanda panah pada Tabel 2-1 lama, yaitu
   `dim_keselarasan.hubungan_bidang → dim_keselarasan.kategori_horizontal` dan
   `dim_keselarasan.tingkat_pendidikan_sesuai → dim_keselarasan.kategori_vertikal`,
   adalah sisa penyuntingan yang menyebut dua nama kolom sekaligus. Harus
   diganti oleh rumusan Tabel 2-1 versi baru.

5. Pada penomoran definisi istilah di subbab *Konsep Tracer Study*, butir
   pertama berbunyi “Masa Tunggu Kerja (IKU 1)”. Penyebutan “(IKU 1)” harus
   dihapus. Masa tunggu adalah salah satu variabel yang diukur, bukan nama
   indikator kinerja utama.

6. Pada subbab *Data Warehouse*, karakteristik **Non-Volatile** memuat frasa
   “dihapus secara real-time”. Frasa tersebut harus diganti, misalnya menjadi
   “dihapus sewaktu-waktu mengikuti transaksi”, agar tidak menimbulkan kesan
   bahwa sistem ini menjanjikan pemrosesan seketika.

7. Butir definisi **Keselarasan Horizontal** dan **Keselarasan Vertikal** pada
   naskah lama hanya menyebut “Berlandaskan pada format kuesioner standar
   Kemendikbudristek” tanpa dasar yang dapat diperiksa. Kedua butir tersebut
   diganti oleh subbab 2.2.x.3 pada berkas ini, yang memuat rumusan pertanyaan,
   daftar pilihan jawaban, aturan peringkasan, serta alasan teoretisnya.

## Rujukan yang perlu ditambahkan ke daftar pustaka

Rujukan berikut dipakai oleh naskah di atas dan perlu dimasukkan ke daftar
pustaka dengan penomoran yang menyesuaikan gaya penulisan yang sudah berjalan.
Mohon periksa kembali setiap data terbitan pada sumber aslinya sebelum
dicantumkan, terutama nomor halaman dan penerbit.

1. Keputusan Menteri Pendidikan, Kebudayaan, Riset, dan Teknologi Republik
   Indonesia Nomor 3/M/2021 tentang Indikator Kinerja Utama Perguruan Tinggi
   Negeri dan Lembaga Layanan Pendidikan Tinggi di Kementerian Pendidikan dan
   Kebudayaan.
2. Kementerian Pendidikan, Kebudayaan, Riset, dan Teknologi, *Buku Panduan
   Indikator Kinerja Utama Perguruan Tinggi*, Jakarta: Kemendikbudristek.
3. Rujukan kajian ketidaksepadanan pendidikan dan pekerjaan, untuk mendukung
   pemisahan dimensi horizontal dan vertikal serta konsep bekerja di bawah
   kualifikasi. Disarankan memakai karya yang membedakan *horizontal* dan
   *vertical mismatch* secara eksplisit, misalnya kajian J. Allen dan R. van der
   Velden mengenai ketidaksepadanan pendidikan serta kajian D. Verhaest dan E.
   Omey mengenai pengukuran *overeducation*.
