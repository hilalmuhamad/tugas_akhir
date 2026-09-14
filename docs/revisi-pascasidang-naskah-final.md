# Naskah Revisi Pascasidang

Berkas ini memuat teks siap tempel untuk dua butir revisi penguji. Seluruh angka
dihitung ulang dari `backend/database/seeders/data/alumnidummy.csv` (215 baris)
mengikuti logika `OlapController::kohortWindow()` dan `EtlService`, dengan tahun
survei 2025.

**Bagian A** menggantikan dan memperluas subbab istilah pada Bab 2 beserta satu
baris pada Tabel 2-1. **Bagian B** menggantikan seluruh subbab "Simulasi
Perhitungan ETL dan OLAP" pada Bab 4.

---

# BAGIAN A — untuk BAB 2

## A.1 Definisi Operasional Istilah dalam Tracer Study

*(Menggantikan daftar bernomor pada subbab Konsep Tracer Study. Empat istilah
yang sudah ada dipertahankan, lima istilah baru ditambahkan.)*

Penetapan variabel pada arsitektur sistem OLAP di penelitian ini merujuk pada
Keputusan Menteri Pendidikan, Kebudayaan, Riset, dan Teknologi Nomor 3/M/2021
tentang Indikator Kinerja Utama Perguruan Tinggi beserta Buku Panduan Indikator
Kinerja Utama Perguruan Tinggi Negeri. Karena istilah-istilah tersebut dipakai
sebagai nama kolom, nama dimensi, dan nama penyaring di dalam sistem, definisi
operasionalnya perlu ditetapkan lebih dahulu agar setiap angka pada bab hasil
dapat ditelusuri kembali ke aturan yang sama. Definisi tersebut dijabarkan
sebagai berikut.

**1. Tahun Survei (TS).** Tahun pelaksanaan pendataan rekam jejak lulusan, bukan
tahun kelulusan responden. Tahun survei berfungsi sebagai titik acuan bergerak:
seluruh penyaring populasi dinyatakan secara relatif terhadap TS sehingga aturan
pelaporan tidak perlu ditulis ulang setiap tahun. Pada sistem yang dibangun,
tahun survei disimpan sebagai parameter kueri dengan nilai bawaan 2025.

**2. Kohort dan Jendela Kohort.** Kohort adalah kelompok lulusan yang dijadikan
populasi pelaporan pada satu tahun survei, dinyatakan dengan notasi TS-1 untuk
lulusan satu tahun sebelum tahun survei dan TS-2 untuk lulusan dua tahun
sebelumnya. Jendela kohort adalah rentang tahun kelulusan yang dicakup. Dengan
tahun survei 2025, jendela kohort TS-1 sampai TS-2 mencakup lulusan tahun 2024
dan 2023. Pembatasan ini diperlukan karena indikator masa tunggu dan keselarasan
hanya bermakna bagi lulusan yang sudah melewati masa transisi ke dunia kerja,
sementara lulusan yang baru saja diwisuda belum sempat mengalaminya. Perlu
ditegaskan bahwa penyaringan jendela kohort dilakukan pada lapisan kueri, bukan
pada lapisan penyimpanan; seluruh rekaman di luar jendela tetap tersimpan utuh di
dalam gudang data sehingga jendela dapat digeser tanpa memuat ulang data.

**3. Status Kegiatan Lulusan.** Kegiatan utama responden pada saat survei
dilaksanakan, mengikuti pilihan jawaban instrumen tracer study nasional dan
terdiri atas lima kategori nominal: Bekerja; Wirausaha/Startup; Melanjutkan
Studi; Tidak Bekerja tetapi Sedang Mencari Kerja; dan Belum Memungkinkan Bekerja.

**4. Masa Tunggu Kerja.** Durasi dalam satuan bulan sejak lulusan ditetapkan
lulus secara resmi hingga memperoleh pekerjaan perdana. Ambang capaian yang
digariskan kementerian adalah masa tunggu kurang dari enam bulan.

**5. Ketepatan Waktu Lulus.** Status yang ditentukan dari selisih tahun
kelulusan dengan tahun penerimaan mahasiswa. Sebuah kelulusan berkategori "Tepat
Waktu" apabila studi jenjang D3 dirampungkan dalam waktu kurang dari atau sama
dengan tiga tahun dan studi jenjang S1 kurang dari atau sama dengan empat tahun.

**6. Penyebut Perhitungan (Basis Perhitungan).** Himpunan responden yang sah
dijadikan pembagi pada suatu indikator. Istilah ini dinyatakan secara eksplisit
karena instrumen tracer study bersifat bercabang: tidak setiap pertanyaan
diajukan kepada setiap responden. Pertanyaan mengenai keselarasan hanya muncul
bagi responden yang menyatakan dirinya bekerja, sehingga penyebut kedua indikator
keselarasan adalah jumlah responden bekerja pada kohort, bukan jumlah seluruh
lulusan pada kohort dan bukan pula jumlah seluruh rekaman pada gudang data.
Konsekuensi perancangannya adalah kunci tamu `keselarasan_key` pada tabel fakta
dibuat boleh bernilai kosong.

**7. Keselarasan Horizontal.** Tingkat kesesuaian antara disiplin ilmu yang
dipelajari semasa kuliah dengan bidang pekerjaan yang dijalani responden.
Instrumen tracer study nasional menanyakannya dalam skala ordinal lima tingkat:
Sangat erat; Erat; Cukup erat; Kurang erat; dan Tidak sama sekali. Untuk
keperluan pelaporan, kelima tingkat tersebut diringkas menjadi dua kategori,
yaitu Selaras dan Tidak Selaras, dengan dasar yang diuraikan pada subbab A.2.

**8. Keselarasan Vertikal.** Tingkat kesesuaian antara jenjang pendidikan yang
ditamatkan responden dengan jenjang pendidikan yang dituntut oleh pekerjaannya.
Instrumen menanyakannya dalam empat pilihan: Setingkat lebih tinggi; Tingkat yang
sama; Setingkat lebih rendah; dan Tidak perlu pendidikan tinggi. Sama seperti
keselarasan horizontal, keempat pilihan tersebut diringkas menjadi Selaras dan
Tidak Selaras.

**9. Bekerja di Bawah Kualifikasi (*Underemployment*).** Keadaan ketika lulusan
menempati pekerjaan yang menuntut jenjang pendidikan lebih rendah daripada
jenjang yang telah ditamatkannya. Keadaan ini merupakan bentuk ketidakselarasan
vertikal yang menjadi perhatian utama evaluasi, karena menunjukkan kapasitas
lulusan yang tidak terpakai sepenuhnya. Istilah ini perlu dibedakan dari keadaan
sebaliknya, yaitu lulusan yang menempati pekerjaan dengan tuntutan jenjang lebih
tinggi daripada ijazahnya, yang tidak termasuk ketidakselarasan.

## A.2 Dasar Penetapan Kategori Keselarasan

*(Subbab baru, ditempatkan setelah A.1 dan sebelum Tabel 2-1.)*

Instrumen tracer study nasional merekam keselarasan dalam skala ordinal — lima
tingkat untuk keselarasan horizontal dan empat pilihan untuk keselarasan
vertikal. Sebaliknya, Indikator Kinerja Utama pertama pada Keputusan Menteri
Pendidikan, Kebudayaan, Riset, dan Teknologi Nomor 3/M/2021 dirumuskan sebagai
capaian biner: seorang lulusan dinilai memenuhi kriteria atau tidak memenuhi
kriteria, tanpa tingkatan di antaranya. Buku Panduan Indikator Kinerja Utama
Perguruan Tinggi Negeri menurunkan rumusan tersebut menjadi perbandingan antara
jumlah lulusan yang memenuhi kriteria dengan jumlah lulusan yang menjadi
penyebut. Terdapat selisih bentuk di antara keduanya: skala pengukurannya
ordinal, sedangkan satuan pelaporannya biner.

Selisih bentuk itulah yang diselesaikan pada perancangan gudang data penelitian
ini, dengan cara memisahkan tegas antara satuan perekaman dan satuan pelaporan.
Jawaban ordinal responden disimpan apa adanya pada atribut `hubungan_bidang` dan
`tingkat_pendidikan_sesuai` di dalam dimensi keselarasan, sehingga tidak ada
informasi yang hilang dan penelusuran kembali ke jawaban asli tetap dimungkinkan.
Di atas kedua atribut tersebut diturunkan dua atribut kategori,
`kategori_horizontal` dan `kategori_vertikal`, yang masing-masing bernilai
Selaras atau Tidak Selaras. Atribut kategori inilah yang dipakai sebagai sumbu
pengelompokan pada pelaporan dan visualisasi. Dengan pemisahan ini, keluaran
sistem dapat langsung dijumlahkan menjadi capaian IKU tanpa penafsiran tambahan
oleh penyusun laporan, sementara kedalaman jawaban ordinal tetap tersedia bagi
analisis lanjutan.

Ambang pemisah kedua kategori ditetapkan sebagai berikut. Pada keselarasan
horizontal, tiga tingkat teratas — Sangat erat, Erat, dan Cukup erat —
dikelompokkan sebagai Selaras, karena ketiganya menyatakan adanya keterkaitan
antara bidang studi dengan pekerjaan meskipun dengan derajat yang berbeda.
Dua tingkat terbawah — Kurang erat dan Tidak sama sekali — dikelompokkan sebagai
Tidak Selaras, karena keduanya menyatakan keterkaitan yang tidak memadai atau
tidak ada sama sekali.

Pada keselarasan vertikal, ambang pemisahnya adalah ada atau tidaknya keadaan
bekerja di bawah kualifikasi. Pilihan Tingkat yang sama menyatakan kesesuaian
langsung antara ijazah dengan tuntutan pekerjaan. Pilihan Setingkat lebih tinggi
menyatakan bahwa pekerjaan yang dijalani justru menuntut jenjang di atas ijazah
responden; keadaan ini bukan bentuk ketidakselarasan, sebab kapasitas lulusan
terpakai sepenuhnya. Keduanya karena itu dikelompokkan sebagai Selaras.
Sebaliknya, pilihan Setingkat lebih rendah dan Tidak perlu pendidikan tinggi
sama-sama menyatakan bahwa pekerjaan yang dijalani menuntut jenjang di bawah
ijazah responden, yaitu keadaan bekerja di bawah kualifikasi, sehingga keduanya
dikelompokkan sebagai Tidak Selaras.

Tabel 2-2 merangkum pemetaan tersebut. Pemetaan ini diterapkan satu kali pada
tahap transformasi ETL dan tersimpan sebagai atribut dimensi, bukan dihitung
ulang pada setiap permintaan pelaporan, sehingga seluruh grafik dan tabel yang
dihasilkan sistem dijamin memakai ambang yang sama.

Table 2-2 Pemetaan jawaban instrumen menjadi kategori keselarasan

| Indikator | Jawaban instrumen | Kategori pelaporan | Alasan pengelompokan |
|---|---|---|---|
| Keselarasan horizontal | Sangat erat | Selaras | Terdapat keterkaitan bidang studi dengan pekerjaan |
| Keselarasan horizontal | Erat | Selaras | Terdapat keterkaitan bidang studi dengan pekerjaan |
| Keselarasan horizontal | Cukup erat | Selaras | Terdapat keterkaitan bidang studi dengan pekerjaan |
| Keselarasan horizontal | Kurang erat | Tidak Selaras | Keterkaitan tidak memadai |
| Keselarasan horizontal | Tidak sama sekali | Tidak Selaras | Tidak ada keterkaitan |
| Keselarasan vertikal | Setingkat lebih tinggi | Selaras | Pekerjaan menuntut jenjang di atas ijazah; bukan bekerja di bawah kualifikasi |
| Keselarasan vertikal | Tingkat yang sama | Selaras | Jenjang pekerjaan setara dengan ijazah |
| Keselarasan vertikal | Setingkat lebih rendah | Tidak Selaras | Bekerja di bawah kualifikasi |
| Keselarasan vertikal | Tidak perlu pendidikan tinggi | Tidak Selaras | Bekerja di bawah kualifikasi |

## A.3 Perbaikan pada Tabel 2-1

Satu baris pada Tabel 2-1 perlu diganti karena masih menuliskan tiga kategori
keselarasan vertikal. Teks lama pada kolom Parameter Pengukuran berbunyi
"Ordinal, 4 pilihan: Setingkat lebih tinggi; Tingkat yang sama; Setingkat lebih
rendah; Tidak perlu pendidikan tinggi. Diringkas menjadi 3 kategori: Tinggi;
Sama; Rendah". Teks penggantinya:

> Ordinal, 4 pilihan: Setingkat lebih tinggi; Tingkat yang sama; Setingkat lebih
> rendah; Tidak perlu pendidikan tinggi. Diringkas menjadi dua kategori biner
> (Selaras dan Tidak Selaras) dengan ambang pemisah keadaan bekerja di bawah
> kualifikasi, sebagaimana diuraikan pada Tabel 2-2.

---

# BAGIAN B — untuk BAB 4

## Simulasi Perhitungan ETL dan OLAP

*(Menggantikan seluruh subbab bernama sama pada Bab 4.)*

Subbab ini menelusuri satu putaran penuh pemrosesan data, dari berkas dataset
mentah sampai menjadi angka yang tampil pada dasbor, beserta operasi aritmetika
pada setiap tahapnya. Populasi simulasi ditetapkan pada berkas dataset kampus
yang memuat 215 rekaman lulusan tahun 2021 sampai 2026. Satu rekaman tambahan
hasil pengisian kuesioner langsung tidak diikutsertakan dalam simulasi ini agar
seluruh angka pada subbab ini dapat direproduksi dari berkas dataset yang sama.
Tahun survei ditetapkan 2025, sesuai nilai bawaan parameter tahun survei pada
sistem.

### Tahap 1 — Ekstraksi dan Pemuatan ke Tabel Singgah

Proses diawali perintah `php artisan etl:sync`. Seluruh 215 rekaman dibaca dari
berkas dataset, lalu dimuat ke tabel singgah `staging_alumni` tanpa perubahan
nilai. Tahap ini sengaja tidak melakukan transformasi apa pun agar data mentah
tetap tersedia sebagai pembanding apabila hasil akhir perlu diaudit.

$$N_{\text{ekstraksi}} = 215 \text{ rekaman}$$

### Tahap 2 — Transformasi Indikator Turunan

Dua indikator tidak tersedia langsung pada jawaban kuesioner dan harus dihitung
sistem. Yang pertama adalah masa tunggu kerja. Apabila responden mengisi tanggal
kelulusan dan tanggal mulai bekerja, sistem menghitung selisih bulan penuh di
antara keduanya, kemudian membulatkannya ke bawah:

$$\text{masa\_tunggu\_bulan} = \left\lfloor \text{selisih bulan penuh} \left( \text{tanggal\_lulus},\ \text{tanggal\_mulai\_bekerja} \right) \right\rfloor$$

Yang dihitung adalah banyaknya bulan kalender yang benar-benar terlewati, bukan
selisih hari yang dibagi rata-rata panjang bulan. Sebagai contoh, untuk tanggal
lulus 31 Agustus 2025 dan tanggal mulai bekerja 15 Januari 2026, penelusuran
bulan penuhnya adalah: 31 Agustus ke 30 September terhitung satu bulan, ke 31
Oktober dua bulan, ke 30 November tiga bulan, dan ke 31 Desember empat bulan.
Bulan penuh kelima baru tercapai pada 31 Januari 2026, sementara tanggal mulai
bekerja jatuh pada 15 Januari 2026, sehingga bulan kelima tidak terhitung.

$$\text{masa\_tunggu\_bulan} = \left\lfloor 4 \right\rfloor = 4 \text{ bulan}$$

Pembulatan ke bawah dipilih, bukan pembulatan terdekat, agar sistem tidak pernah
melaporkan masa tunggu yang lebih panjang daripada yang sebenarnya dialami
lulusan. Bagi rekaman yang tidak menyertakan kedua tanggal tersebut, nilai masa
tunggu diambil apa adanya dari jawaban kuesioner dalam satuan bulan; nilai hasil
perhitungan tanggal selalu menimpa nilai isian manual apabila keduanya tersedia.

Indikator kedua adalah ketepatan waktu lulus, yang dihitung dari selisih tahun:

$$\text{durasi\_studi} = \text{tahun\_lulus} - \text{tahun\_masuk}$$

$$\text{lulus\_tepat\_waktu} = \begin{cases} \text{benar} & \text{jika durasi\_studi} \leq 3 \text{ untuk jenjang D3} \\ \text{benar} & \text{jika durasi\_studi} \leq 4 \text{ untuk jenjang S1} \\ \text{salah} & \text{selain itu} \end{cases}$$

Untuk seorang lulusan D3 dengan tahun masuk 2021 dan tahun lulus 2024, durasi
studinya adalah $2024 - 2021 = 3$ tahun. Karena $3 \leq 3$, statusnya ditetapkan
tepat waktu.

### Tahap 3 — Transformasi Kategori Keselarasan

Jawaban ordinal responden diterjemahkan menjadi kategori biner mengikuti
pemetaan pada Tabel 2-2. Transformasi ini dijalankan satu kali di sini dan
hasilnya disimpan sebagai atribut dimensi, sehingga tidak ada tahap pelaporan
yang perlu menafsirkan ulang ambangnya. Agar rumusnya ringkas, himpunan jawaban
yang tergolong selaras dilambangkan $H$ untuk keselarasan horizontal dan $V$
untuk keselarasan vertikal:

$$H = \{ \text{Sangat erat},\ \text{Erat},\ \text{Cukup erat} \}$$

$$V = \{ \text{Setingkat lebih tinggi},\ \text{Tingkat yang sama} \}$$

$$\text{kategori\_horizontal} = \begin{cases} \text{Selaras} & \text{jika hubungan\_bidang} \in H \\ \text{Tidak Selaras} & \text{selain itu} \end{cases}$$

$$\text{kategori\_vertikal} = \begin{cases} \text{Selaras} & \text{jika tingkat\_pendidikan\_sesuai} \in V \\ \text{Tidak Selaras} & \text{selain itu} \end{cases}$$

Dimensi keselarasan diisi sebagai tabel referensi berisi seluruh kombinasi yang
mungkin, yaitu lima tingkat hubungan bidang dikali empat tingkat kesesuaian
pendidikan:

$$5 \times 4 = 20 \text{ baris dimensi}$$

Pengisian seluruh kombinasi, termasuk kombinasi yang belum muncul pada data,
membuat setiap kategori tetap memiliki baris rujukan sehingga kategori bernilai
nol tetap dapat ditampilkan pada grafik alih-alih hilang dari sumbu.

### Tahap 4 — Pemuatan ke Skema Bintang

Nilai hasil transformasi dimuat ke satu tabel fakta dan lima tabel dimensi.
Anggota dimensi yang terbentuk dari 215 rekaman adalah 7 anggota dimensi program
studi, 6 anggota dimensi waktu untuk tahun kelulusan 2021 sampai 2026, 5 anggota
dimensi status kerja, 20 anggota dimensi keselarasan, dan 215 anggota dimensi
alumni. Kunci tamu `keselarasan_key` dibiarkan kosong bagi rekaman responden yang
tidak menerima pertanyaan keselarasan, sebagai konsekuensi langsung dari kaidah
percabangan instrumen yang dijelaskan pada Bab 2.

### Tahap 5 — Operasi *Slice*: Penyaringan Jendela Kohort

Dasbor tidak melaporkan seluruh isi tabel fakta, melainkan memotongnya menurut
jendela kohort. Batas jendela dihitung dari tahun survei:

$$\text{batas\_bawah} = \text{TS} - 2 = 2025 - 2 = 2023$$

$$\text{batas\_atas} = \text{TS} - 1 = 2025 - 1 = 2024$$

Penyaringan `tahun_lulus BETWEEN 2023 AND 2024` menyisakan:

$$N_{\text{kohort}} = 42_{(2023)} + 42_{(2024)} = 84 \text{ lulusan}$$

Dari 215 rekaman, 131 rekaman berada di luar jendela dan tetap tersimpan tanpa
dihapus. Angka 84 inilah yang menjadi populasi pelaporan pada tahun survei 2025.

### Tahap 6 — Penetapan Penyebut Perhitungan

Sebaran status kegiatan pada 84 lulusan kohort adalah sebagai berikut.

Table 4-x Sebaran status kegiatan lulusan pada kohort tahun survei 2025

| Status kegiatan | Jumlah | Persentase terhadap kohort |
|---|---|---|
| Bekerja | 45 | 53,57% |
| Melanjutkan Studi | 12 | 14,29% |
| Tidak Bekerja tetapi Sedang Mencari Kerja | 12 | 14,29% |
| Belum Memungkinkan Bekerja | 10 | 11,90% |
| Wirausaha/Startup | 5 | 5,95% |
| **Jumlah** | **84** | **100,00%** |

Persentase pada kolom terakhir dihitung terhadap 84, misalnya untuk status
Bekerja:

$$\frac{45 \times 100}{84} = 53{,}5714\ldots \approx 53{,}57\%$$

Sesuai definisi penyebut perhitungan pada Bab 2, indikator masa tunggu dan kedua
indikator keselarasan dihitung terhadap responden bekerja saja, sehingga:

$$N_{\text{penyebut}} = 45 \text{ responden}$$

### Tahap 7 — Operasi *Roll-Up*: Agregasi Ukuran Numerik

Ukuran numerik pada tabel fakta diringkas dengan fungsi agregat terhadap 45
responden bekerja. Kueri yang dijalankan sistem adalah sebagai berikut.

```sql
SELECT
    COUNT(*)                              AS jumlah_responden,
    ROUND(AVG(f.masa_tunggu_bulan), 2)    AS rata_rata_masa_tunggu,
    ROUND(AVG(f.ipk), 2)                  AS rata_rata_ipk,
    ROUND(AVG(f.gaji_juta), 2)            AS rata_rata_gaji
FROM fact_tracer_alumni f
JOIN dim_waktu dw       ON dw.waktu_key  = f.waktu_key
JOIN dim_status_kerja sk ON sk.status_key = f.status_key
WHERE dw.tahun_lulus BETWEEN 2023 AND 2024
  AND sk.status_bekerja = 'Bekerja';
```

Perhitungan rata-rata masa tunggu kerja menjumlahkan seluruh nilai bulan lalu
membaginya dengan jumlah responden:

$$\overline{x}_{\text{masa tunggu}} = \frac{\sum x_i}{n} = \frac{202}{45} = 4{,}4888\ldots \approx 4{,}49 \text{ bulan}$$

Nilai masa tunggu pada kelompok ini berkisar antara 1 bulan sampai 10 bulan.
Sebanyak 36 dari 45 responden memiliki masa tunggu kurang dari atau sama dengan
enam bulan, yaitu:

$$\frac{36 \times 100}{45} = 80{,}00\%$$

Dengan cara yang sama diperoleh rata-rata indeks prestasi kumulatif dan
rata-rata penghasilan pertama:

$$\overline{x}_{\text{ipk}} = \frac{143{,}95}{45} = 3{,}1988\ldots \approx 3{,}20$$

$$\overline{x}_{\text{gaji}} = \frac{328{,}6}{45} = 7{,}3022\ldots \approx 7{,}30 \text{ juta rupiah}$$

### Tahap 8 — Agregasi Keselarasan Horizontal

Agregasi keselarasan dijalankan dalam dua lapis. Lapis pertama menghitung
sebaran jawaban ordinal apa adanya, lapis kedua menjumlahkannya menjadi dua
kategori pelaporan. Kedua lapis ditampilkan agar penyusutan lima tingkat menjadi
dua kategori dapat ditelusuri, bukan sekadar diumumkan hasilnya.

Table 4-x Sebaran keselarasan horizontal pada 45 responden bekerja

| Jawaban instrumen | Jumlah | Persentase | Kategori |
|---|---|---|---|
| Sangat erat | 16 | 35,56% | Selaras |
| Erat | 15 | 33,33% | Selaras |
| Cukup erat | 8 | 17,78% | Selaras |
| Kurang erat | 3 | 6,67% | Tidak Selaras |
| Tidak sama sekali | 3 | 6,67% | Tidak Selaras |
| **Jumlah** | **45** | **100,00%** | |

Penjumlahan menjadi dua kategori pelaporan menghasilkan:

$$n_{\text{Selaras}} = 16 + 15 + 8 = 39$$

$$n_{\text{Tidak Selaras}} = 3 + 3 = 6$$

$$P_{\text{Selaras}} = \frac{39 \times 100}{45} = 86{,}6666\ldots \approx 86{,}67\%$$

$$P_{\text{Tidak Selaras}} = \frac{6 \times 100}{45} = 13{,}3333\ldots \approx 13{,}33\%$$

Kueri yang menghasilkan angka tersebut adalah sebagai berikut.

```sql
SELECT
    dk.kategori_horizontal,
    COUNT(*)                                           AS jumlah_alumni,
    ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER (), 2)  AS persentase
FROM fact_tracer_alumni f
JOIN dim_waktu dw        ON dw.waktu_key      = f.waktu_key
JOIN dim_status_kerja sk ON sk.status_key     = f.status_key
JOIN dim_keselarasan dk  ON dk.keselarasan_key = f.keselarasan_key
WHERE dw.tahun_lulus BETWEEN 2023 AND 2024
  AND sk.status_bekerja = 'Bekerja'
GROUP BY dk.kategori_horizontal;
```

Karena jawaban ordinal tetap tersimpan, keenam responden berkategori Tidak
Selaras dapat ditelusuri satu per satu sampai ke bidang pekerjaan dan jabatannya.
Penelusuran ini merupakan bukti bahwa penyusutan kategori tidak menghilangkan
data, hanya meringkas penyajiannya.

Table 4-x Penelusuran responden berkategori Tidak Selaras horizontal

| Program studi | Tahun lulus | Jawaban instrumen | Bidang pekerjaan | Jabatan |
|---|---|---|---|---|
| Sci&Tech | 2023 | Tidak sama sekali | Logistik dan Transportasi | Staf Ekspedisi |
| Comm&Mgmt | 2023 | Kurang erat | Jasa Lainnya | Staf Operasional |
| Comm&Mgmt | 2023 | Tidak sama sekali | Keuangan dan Asuransi | Staf Keuangan |
| Others | 2023 | Kurang erat | Logistik dan Transportasi | Staf Gudang |
| Comm&Mgmt | 2023 | Kurang erat | Produksi dan Industri | Operator Produksi |
| Sci&Tech | 2024 | Tidak sama sekali | Logistik dan Transportasi | Admin Logistik |

### Tahap 9 — Agregasi Keselarasan Vertikal

Prosedur yang sama diterapkan pada keselarasan vertikal.

Table 4-x Sebaran keselarasan vertikal pada 45 responden bekerja

| Jawaban instrumen | Jumlah | Persentase | Kategori |
|---|---|---|---|
| Setingkat lebih tinggi | 12 | 26,67% | Selaras |
| Tingkat yang sama | 31 | 68,89% | Selaras |
| Setingkat lebih rendah | 2 | 4,44% | Tidak Selaras |
| Tidak perlu pendidikan tinggi | 0 | 0,00% | Tidak Selaras |
| **Jumlah** | **45** | **100,00%** | |

$$n_{\text{Selaras}} = 12 + 31 = 43$$

$$n_{\text{Tidak Selaras}} = 2 + 0 = 2$$

$$P_{\text{Selaras}} = \frac{43 \times 100}{45} = 95{,}5555\ldots \approx 95{,}56\%$$

$$P_{\text{Tidak Selaras}} = \frac{2 \times 100}{45} = 4{,}4444\ldots \approx 4{,}44\%$$

Kedua responden berkategori Tidak Selaras vertikal keduanya lulusan tahun 2024
dan keduanya menjawab Setingkat lebih rendah, yaitu seorang lulusan Sci&Tech yang
bekerja sebagai Web Developer dan seorang lulusan Comm&Mgmt yang bekerja sebagai
Staf HRD. Tidak ada responden yang menjawab Tidak perlu pendidikan tinggi,
sehingga kategori tersebut bernilai nol namun tetap ditampilkan karena barisnya
tersedia pada dimensi keselarasan.

Perlu dicatat bahwa persentase keselarasan vertikal yang tinggi pada kohort ini
tidak dapat dibaca sebagai mutu penempatan kerja secara umum, sebab angkanya
berasal dari persepsi 45 responden pada satu jendela kohort dan bukan dari
verifikasi persyaratan jabatan oleh pemberi kerja.

### Tahap 10 — Operasi *Dice*: Tabulasi Silang Program Studi

Operasi *dice* menerapkan dua kondisi penyaringan sekaligus, yaitu jendela kohort
dan status bekerja, lalu mengelompokkan hasilnya menurut dua dimensi sekaligus,
yaitu program studi dan kategori keselarasan. Penyebut persentasenya bukan
keseluruhan 45 responden, melainkan jumlah responden pada masing-masing program
studi, yang pada SQL dinyatakan dengan fungsi jendela `SUM(COUNT(*)) OVER
(PARTITION BY dp.program_studi)`.

Table 4-x Tabulasi silang program studi terhadap kategori keselarasan

| Program studi | Responden | Selaras horizontal | Persentase | Selaras vertikal | Persentase |
|---|---|---|---|---|---|
| Sci&Tech | 17 | 15 | 88,24% | 16 | 94,12% |
| Comm&Mgmt | 16 | 13 | 81,25% | 15 | 93,75% |
| Others | 12 | 11 | 91,67% | 12 | 100,00% |
| **Jumlah** | **45** | **39** | **86,67%** | **43** | **95,56%** |

Perhitungan persentase pada baris pertama, misalnya, memakai 17 sebagai penyebut
dan bukan 45:

$$P_{\text{Selaras, Sci\&Tech}} = \frac{15 \times 100}{17} = 88{,}2352\ldots \approx 88{,}24\%$$

Konsistensi hasil dapat diperiksa dengan menjumlahkan kembali pencacah dan
penyebut antarprogram studi, yang harus mengembalikan angka agregat pada Tahap 8
dan Tahap 9:

$$15 + 13 + 11 = 39 \quad \text{dan} \quad 17 + 16 + 12 = 45$$

$$16 + 15 + 12 = 43 \quad \text{dan} \quad 17 + 16 + 12 = 45$$

### Tahap 11 — Kaidah Pembulatan

Seluruh persentase dan rata-rata dibulatkan pada lapisan basis data memakai
fungsi `ROUND(nilai, 2)`, yaitu pembulatan ke dua angka desimal dengan kaidah
pembulatan setengah ke atas. Pembulatan sengaja dilakukan di lapisan basis data
dan bukan di lapisan antarmuka, agar angka yang tampil pada dasbor identik dengan
angka yang dikembalikan kueri dan dengan angka yang tercetak pada berkas laporan.

Karena pembulatan dilakukan pada setiap baris secara terpisah, jumlah persentase
antarkategori dapat menyimpang dari 100,00% sebesar satu satuan desimal terakhir.
Pada agregasi keselarasan horizontal penyimpangan tersebut tidak terjadi, sebab
$86{,}67 + 13{,}33 = 100{,}00$; demikian pula pada keselarasan vertikal, sebab
$95{,}56 + 4{,}44 = 100{,}00$. Pada sebaran lima tingkat jawaban instrumen,
jumlahnya adalah $35{,}56 + 33{,}33 + 17{,}78 + 6{,}67 + 6{,}67 = 100{,}01$,
yaitu selisih 0,01 yang berasal murni dari pembulatan per baris dan bukan dari
kekeliruan pencacahan. Selisih semacam ini dilaporkan apa adanya tanpa
penyesuaian, karena penyesuaian akan membuat angka pada tabel tidak lagi sama
dengan keluaran kueri.

### Tahap 12 — Verifikasi Hasil Simulasi

Seluruh angka pada subbab ini dapat diperiksa ulang langsung pada basis data
dengan menjalankan enam kueri berikut, yang hasilnya harus sama dengan nilai yang
tercantum.

```sql
-- 1. Populasi tabel fakta, harus 215
SELECT COUNT(*) FROM fact_tracer_alumni;

-- 2. Kohort tahun survei 2025, harus 84 dengan rincian 42 dan 42
SELECT dw.tahun_lulus, COUNT(*)
FROM fact_tracer_alumni f
JOIN dim_waktu dw ON dw.waktu_key = f.waktu_key
WHERE dw.tahun_lulus BETWEEN 2023 AND 2024
GROUP BY dw.tahun_lulus ORDER BY dw.tahun_lulus;

-- 3. Sebaran status kegiatan pada kohort, Bekerja harus 45
SELECT sk.status_bekerja, COUNT(*)
FROM fact_tracer_alumni f
JOIN dim_waktu dw        ON dw.waktu_key  = f.waktu_key
JOIN dim_status_kerja sk ON sk.status_key = f.status_key
WHERE dw.tahun_lulus BETWEEN 2023 AND 2024
GROUP BY sk.status_bekerja ORDER BY COUNT(*) DESC;

-- 4. Agregat numerik, harus 4.49 / 3.20 / 7.30
SELECT COUNT(*), ROUND(AVG(f.masa_tunggu_bulan),2),
       ROUND(AVG(f.ipk),2), ROUND(AVG(f.gaji_juta),2)
FROM fact_tracer_alumni f
JOIN dim_waktu dw        ON dw.waktu_key  = f.waktu_key
JOIN dim_status_kerja sk ON sk.status_key = f.status_key
WHERE dw.tahun_lulus BETWEEN 2023 AND 2024
  AND sk.status_bekerja = 'Bekerja';

-- 5. Sebaran ordinal dan kategori horizontal, harus 16/15/8/3/3 dan 39/6
SELECT dk.hubungan_bidang, dk.kategori_horizontal, COUNT(*)
FROM fact_tracer_alumni f
JOIN dim_waktu dw        ON dw.waktu_key       = f.waktu_key
JOIN dim_status_kerja sk ON sk.status_key      = f.status_key
JOIN dim_keselarasan dk  ON dk.keselarasan_key = f.keselarasan_key
WHERE dw.tahun_lulus BETWEEN 2023 AND 2024
  AND sk.status_bekerja = 'Bekerja'
GROUP BY dk.hubungan_bidang, dk.kategori_horizontal;

-- 6. Sebaran ordinal dan kategori vertikal, harus 12/31/2/0 dan 43/2
SELECT dk.tingkat_pendidikan_sesuai, dk.kategori_vertikal, COUNT(*)
FROM fact_tracer_alumni f
JOIN dim_waktu dw        ON dw.waktu_key       = f.waktu_key
JOIN dim_status_kerja sk ON sk.status_key      = f.status_key
JOIN dim_keselarasan dk  ON dk.keselarasan_key = f.keselarasan_key
WHERE dw.tahun_lulus BETWEEN 2023 AND 2024
  AND sk.status_bekerja = 'Bekerja'
GROUP BY dk.tingkat_pendidikan_sesuai, dk.kategori_vertikal;
```

---

# CATATAN PENYESUAIAN (jangan disalin ke laporan)

## 1. Titik yang berubah bila gambar saran dosen menetapkan pemetaan lain

Naskah di atas mengelompokkan "Setingkat lebih tinggi" sebagai **Selaras**, dengan
ambang pemisah keadaan bekerja di bawah kualifikasi. Apabila gambar saran dosen
menetapkan bahwa hanya "Tingkat yang sama" yang dihitung Selaras, tiga tempat
berikut yang berubah, dan hanya tiga tempat ini:

- Tabel 2-2, baris "Setingkat lebih tinggi": kategori menjadi Tidak Selaras,
  alasan menjadi "Jenjang pekerjaan tidak setara dengan ijazah".
- Definisi himpunan $V$ pada Tahap 3 Bab 4 menjadi
  $V = \{ \text{Tingkat yang sama} \}$.
- Paragraf keempat subbab A.2: kalimat mengenai "Setingkat lebih tinggi" diganti
  menjadi pernyataan bahwa hanya kesesuaian langsung yang dihitung selaras.
- Tahap 9 pada Bab 4 seluruhnya: kolom Kategori pada tabel sebaran, lalu
  $n_{\text{Selaras}} = 31$, $n_{\text{Tidak Selaras}} = 12 + 2 = 14$,
  $P_{\text{Selaras}} = 31 \times 100 / 45 = 68{,}8888\ldots \approx 68{,}89\%$,
  $P_{\text{Tidak Selaras}} = 14 \times 100 / 45 = 31{,}1111\ldots \approx 31{,}11\%$.
  Kolom Selaras vertikal pada Tahap 10 menjadi Sci&Tech 12 dari 17 (70,59%),
  Comm&Mgmt 11 dari 16 (68,75%), Others 8 dari 12 (66,67%), dengan jumlah 31 dari
  45 (68,89%). Kalimat penelusuran dua responden diganti menjadi penelusuran 14
  responden.

## 2. Yang harus diperbaiki di tempat lain pada naskah agar tidak bertentangan

- Abstrak menulis "empat tabel dimensi", badan naskah menulis "lima" di tiga
  tempat. Pilih lima.
- Abstrak menulis "215 rekam jejak", Tabel 4-3 menulis "216 baris fakta". Naskah
  Bagian B memakai 215 dan menyatakan alasannya; samakan Tabel 4-3.
- Tabel 4-3 baris 3 masih menulis "kohort TS-1 s.d. TS-3 (lulusan 2023–2025)
  sebanyak 127 alumni". Ganti menjadi TS-1 s.d. TS-2, lulusan 2023–2024,
  84 alumni.
- Dua tempat menulis endpoint `GET /api/stats/olap` dengan metode `olapStats()`.
  Keduanya tidak ada pada kode; agregasi dasbor dilayani rute `/api/olap/*` oleh
  `OlapController`.
- Subbab simulasi lama memakai contoh "Budi Santoso, NIM 613230015" yang tidak
  ada di dataset, kueri dengan kolom `d.nama_prodi` dan `d.id` yang tidak ada di
  basis data, serta perhitungan 137 hari dibagi 30,44 yang hasilnya 4,50 dan
  bukan 4,49. Seluruhnya sudah diganti pada Bagian B.
- Catatan pribadi yang tertinggal di badan naskah, tepat sebelum subbab simulasi,
  harus dihapus.
- Istilah yang sebaiknya disisir: "real-time" (10 tempat), "secara instan"
  (8 tempat), "slice and dice" (6 tempat).
- Keterangan gambar pada naskah memakai label "Gambar", sedangkan keterangan
  tabel memakai label "Table" dalam bahasa Inggris. Label tabel sebaiknya
  diseragamkan menjadi "Tabel" melalui pengaturan label keterangan di Word,
  agar seluruh naskah berbahasa Indonesia. Naskah ini sengaja masih menulis
  "Table" supaya cocok dengan keadaan dokumen sekarang; ganti bersamaan bila
  labelnya diseragamkan.
- Nomor rujukan tabel pada badan naskah tidak selalu cocok dengan nomor
  keterangannya. Satu kalimat pada Bab 2 merujuk "Tabel 2-5", padahal
  keterangan tabel yang dimaksud bernomor 2-3. Nomor pada keterangan berasal
  dari medan penomoran otomatis, sedangkan rujukan di badan naskah diketik
  manual, sehingga keduanya bergeser setiap ada tabel baru yang disisipkan.
  Rujukan sebaiknya diubah menjadi referensi silang (Insert Cross-reference)
  agar ikut menyesuaikan diri.

## 3. Perubahan kode yang menjadi konsekuensi naskah ini

- `EtlService::kategoriVertikal()` masih mengembalikan tiga nilai
  (Tinggi/Sama/Rendah); harus menjadi Selaras/Tidak Selaras.
- Konstanta `TINGKAT` pada migrasi `2026_08_14_000001_rebuild_dim_keselarasan_table`
  memuat pemetaan yang sama dan harus diubah bersamaan.
- `CHART_HUBUNGAN_BIDANG` pada `admin/src/pages/Dashboard/Home.tsx` memuat
  kategori "Tidak erat" yang tidak ada di data dan tidak memuat "Kurang erat"
  serta "Tidak sama sekali", sehingga keenam responden Tidak Selaras tidak tampil
  di dasbor. Harus diperbaiki sebelum tangkapan layar Bab 4 diambil.
- Dasbor belum memiliki grafik keselarasan vertikal sama sekali; grafiknya perlu
  dibuat lebih dahulu.
- View `v_olap_keselarasan` mengelompokkan `hubungan_bidang`, bukan
  `kategori_horizontal`; kueri pada Bagian B memakai `kategori_horizontal`
  sehingga view perlu disesuaikan agar naskah dan sistem memberi angka yang sama.

## 4. Cara menempelkan berkas Word pendamping ke dalam naskah

Berkas `Revisi-Pascasidang-Bab2-Bab4.docx` memuat isi yang sama dengan berkas ini,
tetapi rumusnya sudah berupa rumus Word, tabelnya sudah berupa tabel, dan kuerinya
sudah berhuruf tetap. Urutan yang disarankan:

1. Salin per bagian, jangan seluruh berkas sekaligus. Bagian A masuk ke Bab 2,
   Bagian B menggantikan subbab "Simulasi Perhitungan ETL dan OLAP" di Bab 4.
2. Tempel dengan pilihan **Merge Formatting**, bukan Keep Source Formatting, agar
   huruf dan spasi mengikuti gaya naskah. Rumus dan tabel tetap utuh.
3. Judul "Tahap 1" sampai "Tahap 12" dan judul "A.1" sampai "A.3" pada berkas
   pendamping memakai gaya Heading. Setelah ditempel, turunkan ke tingkat yang
   sesuai dengan penomoran subbab naskah, atau ubah menjadi paragraf bercetak
   tebal bila tidak ingin muncul di daftar isi.
4. Setiap baris keterangan tabel masih bernomor "4-x". Ganti dengan keterangan
   tabel Word (References, Insert Caption) supaya nomornya ikut penomoran
   otomatis naskah, lalu hapus teks "4-x" yang lama.
5. Kotak berisi kueri sebaiknya dibiarkan berhuruf Courier New ukuran 9 pt agar
   satu baris kueri tidak terpotong. Bila naskah mensyaratkan seluruh badan
   tulisan berhuruf Times New Roman, kotak kueri biasanya dikecualikan sebagai
   kutipan kode.
