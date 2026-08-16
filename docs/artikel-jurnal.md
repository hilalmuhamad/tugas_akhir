# Artikel Jurnal — Naskah Siap Tempel

Dokumen ini berisi naskah lengkap artikel ilmiah yang disusun mengikuti
**Format-Artikel-Ilmiah Teknik Informatika Poltekpos**. Seluruh angka pada
bagian Hasil diambil langsung dari basis data sistem pada 11 Agustus 2026,
bukan disalin dari draf lama.

Bagian **A** adalah naskah artikel. Bagian **B** adalah lampiran kerja untuk
Anda sendiri (tautan referensi, catatan penyisipan gambar, hal yang perlu
Anda putuskan). **Jangan salin Bagian B ke dalam artikel.**

---

# BAGIAN A — NASKAH ARTIKEL

---

## RANCANG BANGUN APLIKASI TRACER STUDY BERBASIS WEB MENGGUNAKAN METODE OLAP DAN NLP

*(12 kata — tepat pada batas maksimum template)*

Saepudin Nirwan<sup>1</sup>, Hilal Muhamad Abdul Gani<sup>2</sup>

Sekolah Teknologi Informasi, Universitas Logistik dan Bisnis Internasional<sup>1</sup>

Sekolah Teknologi Informasi, Universitas Logistik dan Bisnis Internasional<sup>2</sup>

email: <sup>1)</sup>saepudin@ulbi.ac.id, hilalabdulgani@gmail.com<sup>2</sup>

---

### Abstrak

Penelusuran jejak lulusan menjadi kewajiban perguruan tinggi sekaligus sumber
angka bagi pelaporan Indikator Kinerja Utama. Pada program studi yang menjadi
objek penelitian, data tersebut masih dikelola sebagai tabel datar di dalam
lembar kerja, sehingga penyusunan rekapitulasi lintas sudut pandang harus
diulang setiap kali kombinasi penyaringnya berubah. Kuesionernya pun searah:
alumni mengisi tetapi tidak menerima apa pun sebagai imbalan, dan tingkat
pengisiannya rendah. Penelitian ini membangun aplikasi tracer study berbasis
web yang menempatkan Online Analytical Processing di atas gudang data
berskema bintang dan pencocokan lowongan berbasis bahasa alami di atas
sumber data yang sama. Perancangan dimensional mengikuti metodologi
Nine-Step Kimball dan menghasilkan satu tabel fakta dengan lima tabel
dimensi pada PostgreSQL, diisi melalui proses Extract, Transform, Load.
Pencocokan lowongan memakai pembobotan Term Frequency–Inverse Document
Frequency yang diukur dengan Cosine Similarity. Random Forest dipakai
sebagai teknik pendukung pada modul analitik untuk mengklasifikasikan
kelayakan lulusan terhadap Indikator Kinerja Utama pertama, dengan akurasi
validasi silang berlapis 0,674 terhadap penduga dasar 0,544. Rantai ETL
memuat 216 baris fakta tanpa pelanggaran integritas referensial, dan dua
puluh delapan skenario pengujian black box seluruhnya menghasilkan keluaran
yang diharapkan.

**Kata Kunci:** Tracer Study, OLAP, Skema Bintang, TF-IDF, Random Forest

---

### *Abstract*

*Graduate tracking is both a regulatory obligation for higher education
institutions and the source of figures reported against Key Performance
Indicators. In the study programme examined here, such data is still handled
as a flat spreadsheet table, so any recapitulation across combined viewpoints
must be rebuilt whenever the filter combination changes. The questionnaire is
also one-directional: alumni supply data but receive nothing in return, and
completion rates are low. This research builds a web-based tracer study
application that places Online Analytical Processing on top of a star-schema
data warehouse and natural-language job matching on top of that same data
source. The dimensional design follows the Nine-Step Kimball methodology,
producing one fact table and five dimension tables on PostgreSQL, populated
through an Extract, Transform, Load process. Job matching uses Term
Frequency–Inverse Document Frequency weighting measured by Cosine Similarity.
Random Forest serves as a supporting technique within the analytics module,
classifying graduate eligibility against the first Key Performance Indicator
with a nested cross-validation accuracy of 0.674 against a 0.544 baseline.
The ETL chain loaded 216 fact rows without referential integrity violations,
and all twenty-eight black box test scenarios produced the expected output.*

***Keywords:*** *Tracer Study, OLAP, Star Schema, TF-IDF, Random Forest*

---

### 1. PENDAHULUAN

Tracer study menempati posisi ganda di perguruan tinggi. Ia adalah instrumen
evaluasi yang memperlihatkan sejauh mana kurikulum masih relevan terhadap
kebutuhan tempat kerja, sekaligus pemasok angka bagi pelaporan Indikator
Kinerja Utama dan borang akreditasi. Kajian pada penyelenggaraan tracer
study berskala nasional menunjukkan bahwa nilai instrumen ini justru terletak
pada refleksi yang dihasilkannya, bukan pada pengumpulan datanya semata [1].
Persoalannya, pengumpulan itulah yang sampai sekarang paling banyak menyita
waktu.

Pada program studi yang menjadi objek penelitian, jawaban kuesioner diunduh
sebagai berkas lembar kerja dan diolah manual. Bentuknya tabel datar. Setiap
kali pimpinan meminta rekapitulasi dengan kombinasi sudut pandang yang
berbeda — misalnya keterserapan kerja per tahun kelulusan yang dipilah lagi
menurut program studi — tabel pivot harus disusun ulang dari awal. Proses ini
lambat dan mudah keliru. Ada pula persoalan kedua yang jarang dibahas:
kuesioner tracer study bersifat searah. Alumni diminta mengisi tanpa
menerima manfaat balik apa pun, sehingga tidak ada insentif untuk mengisi,
apalagi memperbarui isian di tahun berikutnya.

Sejumlah penelitian telah menggarap sebagian dari persoalan ini. Putra dan
Elmunsyah membangun sistem informasi penelusuran alumni yang menggantikan
pendataan manual, tetapi fungsi sistemnya berhenti pada perekaman dan
penyimpanan sehingga penyajian lintas dimensi tetap dikerjakan di luar
sistem [2]. Ni'mah dkk. menerapkan OLAP pada dasbor pemantauan kinerja dan
menunjukkan bahwa laporan dengan kombinasi dimensi berbeda dapat dihasilkan
tanpa mengolah ulang data sumber, namun objeknya adalah proses industri,
bukan penelusuran lulusan [3]. Ramadhani dkk. membangun gudang data dengan
metodologi Kimball di atas PostgreSQL untuk memasok dasbor business
intelligence, dan menegaskan bahwa pemisahan basis data analitik dari basis
data transaksional adalah prasyarat, bukan pilihan [4]. Di sisi lain, Xie dan
Zhao mengembangkan model penyaringan resume dan pencocokan karier yang
menilai kesesuaian kandidat tanpa mengharuskan pencocokan kata kunci yang
kaku, tetapi sistemnya berdiri sendiri dengan masukan berkas resume dan tidak
terhubung ke basis data institusi pendidikan [5]. Riskiyono dan Mahdiana
memakai Random Forest untuk memprediksi kelulusan mahasiswa dari data
akademik internal, dengan keluaran yang berhenti pada status prediksi [6].

Pola yang muncul dari kelompok penelitian tersebut cukup konsisten.
Penelitian yang kuat pada penataan dan penyajian data institusi tidak
memberikan manfaat balik kepada lulusan; penelitian yang kuat pada pencocokan
berbasis teks dibangun terlepas dari basis data institusi; dan penelitian
yang mengambil objek tracer study umumnya berhenti pada fungsi pengumpulan.
Penggabungan ketiganya di atas satu sumber data lulusan, sehingga data yang
sama melayani kebutuhan analitik program studi sekaligus kebutuhan alumni,
belum banyak ditemukan.

Penelitian ini menempati irisan tersebut. Tujuannya adalah membangun aplikasi
tracer study berbasis web yang menerapkan OLAP di atas gudang data berskema
bintang untuk penyajian agregasi multidimensi, sekaligus menerapkan
pembobotan TF-IDF dan Cosine Similarity untuk memeringkat lowongan dari
kalimat bahasa alami yang ditulis alumni. Rencana pemecahan masalahnya
bertumpu pada satu gagasan sederhana: pengisian kuesioner yang selama ini
hanya menguntungkan institusi diubah menjadi transaksi dua arah, karena data
yang sama dipakai untuk menyusun rekomendasi lowongan bagi pengisinya.
Random Forest ditempatkan sebagai teknik pendukung di dalam modul analitik
untuk mengklasifikasikan kelayakan lulusan terhadap Indikator Kinerja Utama
pertama, bukan sebagai metode utama penelitian.

---

### 2. LANDASAN TEORI

#### 2.1 Tracer Study dan Keselarasan Lulusan

Tracer study adalah penelusuran lulusan secara berkala untuk memperoleh
gambaran transisi dari bangku kuliah ke dunia kerja. Cakupannya meliputi masa
tunggu memperoleh pekerjaan pertama, kesesuaian bidang kerja dengan bidang
studi, tingkat pendapatan, serta penilaian lulusan atas relevansi kurikulum
[1]. Pelaksanaan berbasis web terbukti mempercepat pendataan dibandingkan
cara manual [2]. Dari sisi substansi, hasil tracer study kerap mengungkap
kesenjangan antara kompetensi lulusan dan tuntutan industri [7], serta
menunjukkan bahwa keterserapan kerja dipengaruhi oleh kecocokan profil
kompetensi lulusan dengan posisi yang tersedia [8].

Kesesuaian tersebut lazim diukur pada dua sumbu. Keselarasan horizontal
menilai hubungan antara bidang studi dan bidang pekerjaan, sedangkan
keselarasan vertikal menilai hubungan antara jenjang pendidikan yang dimiliki
dan jenjang pendidikan yang sesungguhnya dituntut oleh pekerjaan tersebut.
Keduanya diturunkan dari jawaban kuesioner dan dihitung atas alumni yang
berstatus bekerja, bukan atas seluruh lulusan.

#### 2.2 Gudang Data dan Skema Bintang

Gudang data adalah basis data berorientasi subjek, terintegrasi, tidak mudah
berubah, dan menyimpan rekam jejak waktu. Karakteristik itu membedakannya
dari basis data transaksional, yang dioptimalkan untuk operasi tulis dan
pembacaan baris tunggal. Perancangannya mengikuti Nine-Step Methodology
Kimball, bergerak dari pemilihan proses bisnis, penentuan grain, pemilihan
dimensi, hingga penentuan ukuran yang disimpan pada tabel fakta. Metodologi
tersebut telah diterapkan pada penataan data akademik perguruan tinggi dan
menghasilkan struktur yang siap dianalisis [9], [10].

Skema bintang menempatkan satu tabel fakta di pusat, dikelilingi tabel
dimensi yang dihubungkan melalui kunci pengganti. Jumlah relasi antartabelnya
minimal, sehingga kueri agregasi membutuhkan lebih sedikit operasi
penggabungan dan waktu tanggapnya lebih singkat daripada skema ternormalisasi
[11]. Tabel fakta menyimpan ukuran numerik yang dapat diagregasi; tabel
dimensi menyimpan atribut deskriptif yang menjadi sudut pandang analisis.
Atribut deskriptif dengan jumlah nilai yang sangat sedikit dapat disimpan
langsung di dalam tabel fakta sebagai degenerate dimension. Pengisian gudang
data ditempuh melalui Extract, Transform, Load, yaitu penarikan data dari
sumber, pembersihan dan penyeragaman format, lalu pemuatan ke tabel dimensi
dan tabel fakta.

#### 2.3 Online Analytical Processing

OLAP menyajikan informasi ringkas dari berbagai sudut pandang di atas
struktur multidimensi, dengan setiap sel berisi nilai agregat dari kombinasi
anggota dimensi. Orientasinya berlawanan dengan Online Transaction
Processing: OLTP dioptimalkan untuk transaksi tulis bervolume tinggi dengan
cakupan data sempit, sementara OLAP dioptimalkan untuk pembacaan agregat
bervolume besar dengan cakupan luas [3]. Operasi dasarnya mencakup roll-up
(menaikkan tingkat rincian menuju agregat yang lebih umum), drill-down
(menurunkannya menuju data yang lebih spesifik), dan pivot (memutar sudut
pandang penyajian).

Pemilihan sistem manajemen basis data ikut menentukan seberapa jauh operasi
tersebut dapat diungkapkan langsung dalam SQL. PostgreSQL menyediakan
`GROUPING SETS`, `ROLLUP`, dan `CUBE` sehingga beberapa tingkat agregasi
dapat dihasilkan dalam satu kali pemindaian tabel fakta. Penerapannya sebagai
basis data gudang data telah diuji pada beban perusahaan energi [12] dan
dibandingkan terhadap basis data lain pada beban OLAP terdistribusi [13].
Efisiensi OLAP secara umum bergantung pada strategi praagregasi, karena
jumlah kombinasi agregat tumbuh eksponensial terhadap jumlah dimensi [14].

#### 2.4 Pemrosesan Bahasa Alami dan Pembobotan Istilah

Natural Language Processing adalah cabang kecerdasan buatan yang mempelajari
cara komputer memproses bahasa manusia. Tinjauan sistematis memperlihatkan
bidang ini bergerak dari pendekatan berbasis aturan dan statistik menuju
pembelajaran mendalam, dengan cakupan tugas dari klasifikasi teks hingga temu
kembali informasi [15]. Sebelum teks dapat diolah secara numerik diperlukan
prapemrosesan: case folding, tokenisasi, penghapusan stopword, dan
normalisasi istilah. Pada korpus dwibahasa, normalisasi dapat berupa pemetaan
sinonim lintas bahasa sehingga masukan berbahasa Indonesia tetap tercocokkan
dengan dokumen berbahasa Inggris. Dalam konteks ketenagakerjaan, NLP dipakai
untuk menjembatani ketidaksesuaian bahasa antara profil pencari kerja dan
deskripsi lowongan tanpa mengharuskan pengguna menebak kata kunci yang tepat
[5].

TF-IDF mengukur seberapa penting sebuah istilah terhadap suatu dokumen di
dalam korpus. Term frequency menilai bahwa istilah yang sering muncul lebih
merepresentasikan isi dokumen; agar dokumen panjang tidak mendominasi karena
pengulangan kata, dipakai bentuk sublinear pada Persamaan (1). Inverse
document frequency menilai bahwa istilah yang muncul di hampir seluruh
dokumen memiliki daya beda rendah, dengan bentuk yang dihaluskan pada
Persamaan (2). Bobot akhir adalah perkalian keduanya, seperti Persamaan (3).

    tf(t, d) = 1 + log f(t, d)                            (1)

    idf(t) = log[(N + 1) / (df(t) + 1)] + 1               (2)

    w(t, d) = tf(t, d) × idf(t)                           (3)

dengan f(t, d) adalah jumlah kemunculan istilah t pada dokumen d, N adalah
jumlah dokumen dalam korpus, dan df(t) adalah jumlah dokumen yang memuat
istilah t.

Seluruh bobot istilah pada satu dokumen membentuk sebuah vektor dalam ruang
yang dimensinya sama dengan jumlah istilah unik pada korpus. Kemiripan kueri
terhadap dokumen diukur sebagai kosinus sudut antara kedua vektor, bukan
jarak antarkeduanya, sebagaimana Persamaan (4).

    cos(q, d) = Σt w(t, q) · w(t, d) / (‖q‖ · ‖d‖)        (4)

Pembagian dengan norma L2 menghilangkan pengaruh panjang dokumen, sehingga
deskripsi lowongan yang bertele-tele tidak otomatis memperoleh skor lebih
tinggi daripada yang ringkas. Nilainya berada pada rentang 0 sampai 1 untuk
bobot tak negatif. Pasangan TF-IDF dan Cosine Similarity lazim dipakai pada
sistem temu kembali informasi karena tidak memerlukan data latih berlabel dan
hasilnya dapat ditelusuri istilah demi istilah; keefektifannya telah
dibuktikan pada pencocokan pertanyaan terhadap basis pengetahuan chatbot [16]
dan pada pengukuran kemiripan dokumen untuk deteksi plagiarisme [17]. Perlu
ditegaskan bahwa pendekatan ini bersifat leksikal. Ia menghitung irisan
istilah dan bobotnya, tidak menguraikan makna kalimat maupun mengenali entitas
bernama.

#### 2.5 Random Forest

Random Forest membangun sejumlah pohon keputusan dari sampel data dan
subhimpunan fitur yang dipilih secara acak, lalu menggabungkan hasilnya
melalui pemungutan suara mayoritas. Penggabungan banyak pohon menurunkan
varians model sehingga kecenderungan overfitting yang lazim pada pohon
keputusan tunggal dapat ditekan [18]. Pada ranah pendidikan, algoritma ini
telah dipakai untuk memprediksi status kelulusan mahasiswa dari data akademik
yang jumlah fiturnya beragam [6]. Pada penelitian ini Random Forest
diposisikan sebagai teknik pendukung di dalam modul analitik, yaitu untuk
mengenali pola pada data lulusan yang telah tertata di dalam struktur
multidimensi.

#### 2.6 Arsitektur Aplikasi Web

Antarmuka dipisahkan dari layanan data, dan keduanya berkomunikasi melalui
REST API, yaitu gaya arsitektur yang memanfaatkan metode HTTP baku dan
pertukaran data berformat JSON sehingga satu layanan dapat diakses oleh
beberapa jenis klien secara independen [19].

---

### 3. METODE PENELITIAN

#### 3.1 Rancangan dan Objek Penelitian

Penelitian ini adalah penelitian rancang bangun dengan luaran berupa
perangkat lunak, dikembangkan memakai model Waterfall dengan tahapan analisis
kebutuhan, perancangan, implementasi, pengujian, dan penarikan kesimpulan.
Model sekuensial dipilih karena kebutuhan sistem sudah teridentifikasi sejak
awal melalui pemetaan proses bisnis berjalan.

Objek penelitian adalah proses pengelolaan data tracer study pada Program
Studi Diploma III Teknik Informatika, Universitas Logistik dan Bisnis
Internasional, Bandung. Ruang lingkupnya dibatasi pada perancangan gudang
data berskema bintang beserta proses ETL, penerapan agregasi OLAP pada dasbor
analitik, dan penerapan pencocokan lowongan berbasis bahasa alami.
Pengembangan dan pengujian dijalankan pada lingkungan pengembangan lokal,
tidak mencakup penerapan pada lingkungan produksi institusi.

Kohort analisis mengikuti ketentuan penelusuran lulusan, yaitu tiga tahun
kelulusan terakhir yang telah melewati masa tunggu wajar. Dengan tahun
berjalan 2026, kohort yang dianalisis adalah lulusan tahun 2023 sampai 2025.
Penyaringan kohort dilakukan pada lapisan kueri, bukan dengan membuang baris
dari tabel fakta, sehingga data lulusan di luar rentang tersebut tetap
tersimpan dan dapat dianalisis bila rentangnya digeser.

#### 3.2 Bahan, Alat, dan Teknik Pengumpulan Data

Bahan penelitian terdiri atas dua himpunan data. Pertama, data lulusan
sejumlah 216 rekaman yang mencakup identitas, program studi, spesialisasi,
tahun masuk, tahun kelulusan, indeks prestasi kumulatif, status bekerja, masa
tunggu kerja, pendapatan, jabatan, bidang pekerjaan, hubungan bidang kerja
dengan bidang studi, dan tingkat pendidikan yang sesuai untuk pekerjaan
tersebut. Himpunan ini bersifat sintetis karena data lulusan sesungguhnya
memuat informasi pribadi dan belum tersedia dalam bentuk berkas terstruktur
yang siap dimuat. Kedua, data lowongan pekerjaan sejumlah 335 rekaman yang
dihimpun dari beberapa antarmuka pemrograman aplikasi publik serta satu
proses pengambilan data laman terhadap portal lowongan berbahasa Indonesia,
dengan atribut judul posisi, perusahaan, lokasi, deskripsi, keahlian, dan
rentang gaji.

Antarmuka pengguna dibangun memakai React 19, Tailwind CSS, Zustand, dan
Recharts. Layanan data dibangun memakai Laravel 12 dengan autentikasi Sanctum
dan diekspos sebagai REST API. Penyimpanan memakai PostgreSQL. Pelatihan
model klasifikasi dijalankan terpisah memakai Python 3.11 dengan pustaka
scikit-learn.

#### 3.3 Definisi Operasional Variabel

Variabel penelitian beserta definisi operasionalnya disajikan pada Tabel 1.

**Tabel 1.** Definisi operasional variabel penelitian

| Variabel | Definisi Operasional | Skala |
|---|---|---|
| Program studi | Program studi dan spesialisasi lulusan | Nominal |
| Tahun kelulusan | Tahun lulusan dinyatakan lulus | Interval |
| Status bekerja | Kondisi ketenagakerjaan lulusan, lima kategori | Nominal |
| Keselarasan horizontal | Hubungan bidang studi dengan bidang pekerjaan, lima tingkat | Ordinal |
| Keselarasan vertikal | Kesesuaian jenjang pendidikan dengan tuntutan pekerjaan, empat tingkat | Ordinal |
| IPK | Indeks prestasi kumulatif, rentang 0,00–4,00 | Rasio |
| Masa tunggu | Selisih kelulusan dan pekerjaan pertama, dalam bulan | Rasio |
| Pendapatan | Pendapatan per bulan, dalam juta rupiah | Rasio |
| Skor kemiripan | Kemiripan kosinus kueri terhadap dokumen, rentang 0–1 | Rasio |

Lima variabel pertama berperan sebagai dimensi analisis, kecuali pengalaman
kerja yang disimpan di dalam tabel fakta sebagai degenerate dimension karena
hanya bernilai dua. Variabel berikutnya berperan sebagai ukuran yang
diagregasi, dengan masa tunggu dan pendapatan diperlakukan sebagai ukuran
semiaditif karena tidak terisi pada lulusan yang belum bekerja. Penelitian
ini tidak melakukan uji hipotesis statistik; kelayakan sistem diukur melalui
pengujian fungsional.

#### 3.4 Teknik Analisis Data

Perancangan gudang data mengacu pada Nine-Step Kimball dengan proses bisnis
penelusuran lulusan dan grain satu baris fakta untuk satu lulusan. Hasilnya
adalah satu tabel fakta yang dikelilingi lima tabel dimensi, yaitu dimensi
lulusan, program studi, waktu, status kerja, dan keselarasan, sebagaimana
Gambar 1.

**[SISIPKAN GAMBAR 1 DI SINI]**

**Gambar 1.** Rancangan skema bintang gudang data tracer study

Dimensi keselarasan disusun sebagai dimensi konform yang memuat seluruh
kombinasi yang mungkin antara lima tingkat hubungan bidang kerja dan empat
tingkat kesesuaian jenjang pendidikan, sehingga berisi dua puluh baris tetap.
Setiap kombinasi sekaligus membawa dua atribut turunan: kategori horizontal
bernilai Selaras atau Tidak Selaras, dan kategori vertikal bernilai Tinggi,
Sama, atau Rendah. Penempatan klasifikasi pada dimensi, bukan pada kueri,
membuat aturan pengelompokannya seragam di seluruh laporan.

Pemuatan data ditempuh dalam tiga tahap. Ekstraksi memindahkan berkas sumber
dan data profil operasional ke tabel singgah. Transformasi menyeragamkan
nilai dan membentuk anggota dimensi unik. Pemuatan menerjemahkan setiap nilai
deskriptif menjadi kunci pengganti lalu menuliskan baris fakta. Kunci asing
pada tabel fakta diberi indeks agar operasi penggabungan dan agregasi tetap
ringan seiring bertambahnya volume.

Pada modul pencocokan, setiap lowongan direpresentasikan sebagai dokumen
gabungan judul posisi, deskripsi, dan daftar keahlian, sedangkan masukan
pengguna diperlakukan sebagai kueri. Prapemrosesan diterapkan identik pada
keduanya: case folding, tokenisasi, pembuangan token satu karakter,
penghapusan stopword dari kamus gabungan bahasa Indonesia dan Inggris, serta
normalisasi sinonim Indonesia–Inggris yang diperlukan karena sebagian besar
deskripsi lowongan berbahasa Inggris. Stemming sengaja tidak diterapkan agar
istilah teknis tidak terpotong menjadi bentuk yang keliru. Token dibobot
dengan Persamaan (1) sampai (3) dan kemiripannya dihitung dengan Persamaan
(4). Apabila pengguna telah memiliki profil, skor akhir disusun sebagai
penjumlahan berbobot dua kueri seperti Persamaan (5), lalu dipetakan menjadi
persentase kecocokan relatif melalui Persamaan (6).

    S(d) = 0,6 · cos(q_k, d) + 0,4 · cos(q_p, d)          (5)

    K(d) = 100 · (S(d) − S_min) / (S_max − S_min)         (6)

dengan q_k adalah vektor kueri yang diketik pengguna, q_p vektor teks profil,
serta S_min dan S_max skor terendah dan tertinggi pada satu kali pencarian.
Karena penyebutnya berasal dari sebaran skor pencarian itu sendiri, nilai
K(d) bersifat relatif terhadap hasil pencarian tersebut dan tidak dapat
dibandingkan lintas pencarian. Hasil yang ditampilkan dibatasi dua puluh
lowongan berskor tertinggi.

Sebagai pelengkap modul analitik, Random Forest dilatih secara luring untuk
mengklasifikasikan kelayakan lulusan terhadap Indikator Kinerja Utama
pertama. Label diturunkan dari rumus resmi indikator tersebut, yaitu lulusan
yang bekerja dengan masa tunggu di bawah enam bulan, berwirausaha, atau
melanjutkan studi dalam dua belas bulan. Fitur masukannya adalah indeks
prestasi kumulatif, tahun kelulusan, program studi, spesialisasi, dan
pengalaman kerja; masa tunggu sengaja tidak dijadikan fitur karena label
diturunkan darinya. Jenis kelamin juga dikecualikan untuk menghindari bias
gender pada keluaran sistem. Validasi memakai nested stratified k-fold dengan
lima lapis luar dan tiga lapis dalam, penalaan memakai metrik f1 makro, dan
pembandingnya adalah penduga dasar most frequent. Hasil pelatihan disimpan
sebagai berkas statis yang dibaca oleh dasbor, sehingga tidak ada proses
pelatihan yang berjalan ketika aplikasi dipakai.

#### 3.5 Teknik Pengujian

Pengujian memakai Black Box Testing, yaitu penilaian kesesuaian keluaran
sistem terhadap masukan tanpa memeriksa struktur kode program. Skenario
disusun menurut peran pengguna — alumni, staf program studi, dan pimpinan —
mencakup autentikasi dan halaman muka, pengisian kuesioner dan pencarian
lowongan, penyajian dasbor analitik, klasifikasi pendukung, serta penguraian
profil dan penelusuran data alumni. Sebuah skenario dinyatakan berhasil
apabila keluarannya sesuai dengan hasil yang diharapkan.

---

### 4. HASIL DAN PEMBAHASAN

#### 4.1 Implementasi Gudang Data dan ETL

Rancangan pada Gambar 1 terwujud menjadi tujuh tabel fisik pada PostgreSQL,
terdiri atas satu tabel singgah, satu tabel fakta, dan lima tabel dimensi.
Setiap dimensi memakai kunci pengganti bertipe bilangan bulat naik otomatis,
sedangkan atribut pengalaman kerja disimpan langsung pada tabel fakta sebagai
degenerate dimension karena hanya bernilai Ya atau Tidak.

Rantai ETL berjalan tanpa kegagalan integritas referensial. Tahap ekstraksi
memuat rekaman berkas sumber ke tabel singgah secara berkelompok seratus
baris per transaksi. Tahap transformasi membentuk anggota dimensi unik dari
nilai deskriptif, menghasilkan tujuh kombinasi program studi dan spesialisasi,
enam anggota dimensi waktu untuk tahun kelulusan 2021 sampai 2026, serta lima
anggota dimensi status kerja yang sekaligus diberi atribut turunan kategori
penghasilan. Dimensi keselarasan tidak dibentuk dari data melainkan
dibangkitkan penuh sebagai dua puluh kombinasi tetap. Tahap pemuatan
menerjemahkan nilai deskriptif pada setiap baris singgah menjadi kunci
pengganti lalu menuliskan 216 baris fakta.

Kunci keselarasan pada tabel fakta dibiarkan dapat bernilai kosong. Dari 216
baris fakta, 132 baris memiliki kunci keselarasan; sisanya adalah lulusan
yang tidak bekerja sehingga pertanyaan mengenai hubungan bidang kerja tidak
berlaku baginya. Membiarkan kolom itu kosong lebih jujur daripada memaksakan
nilai bawaan, karena nilai bawaan akan ikut terhitung sebagai kategori pada
saat agregasi.

#### 4.2 Hasil Agregasi OLAP pada Dasbor

Agregasi roll-up atas dimensi status kerja yang disilangkan dengan dimensi
waktu menghasilkan sebaran pada Tabel 2.

**Tabel 2.** Distribusi status bekerja lulusan menurut tahun kelulusan

| Status bekerja | 2021 | 2022 | 2023 | 2024 | 2025 | Jumlah |
|---|---|---|---|---|---|---|
| Bekerja | 28 | 17 | 22 | 23 | 27 | 117 |
| Wirausaha/Startup | 4 | 5 | 3 | 2 | 1 | 15 |
| Melanjutkan Studi | 6 | 3 | 5 | 7 | 8 | 29 |
| Tidak Bekerja tetapi Sedang Mencari Kerja | 6 | 8 | 8 | 4 | 5 | 31 |
| Belum Memungkinkan Bekerja | 3 | 8 | 4 | 6 | 2 | 23 |
| **Jumlah** | **47** | **41** | **42** | **42** | **43** | **215** |

Tabulasi silang tersebut dihasilkan dari satu kueri agregasi atas tabel fakta
dengan dua penggabungan dimensi, tanpa menyusun ulang struktur data sumber.
Kombinasi sudut pandang lain — misalnya rata-rata masa tunggu menurut program
studi, atau tingkat keterserapan menurut tahun kelulusan — diperoleh dengan
mengganti kolom pengelompokan pada kueri yang sama.

Pada kohort 2023 sampai 2025 terdapat 127 lulusan. Dari jumlah itu, 78 orang
berstatus bekerja atau berwirausaha, dengan rata-rata masa tunggu 4,65 bulan,
rata-rata pendapatan 7,18 juta rupiah per bulan, dan rata-rata indeks prestasi
kumulatif 3,23. Sebanyak 52 dari 78 orang tersebut, atau 66,7 persen,
memperoleh pekerjaan pertama dalam waktu kurang dari enam bulan.

#### 4.3 Keselarasan Horizontal dan Vertikal

Dimensi keselarasan memungkinkan dua indikator relevansi lulusan dihitung
langsung dari tabel fakta tanpa perhitungan manual. Hasilnya untuk kohort
2023–2025 disajikan pada Tabel 3, dengan penyebut 78 alumni yang berstatus
bekerja atau berwirausaha.

**Tabel 3.** Keselarasan horizontal dan vertikal kohort 2023–2025 (n = 78)

| Indikator | Kategori | Jumlah | Persentase |
|---|---|---|---|
| Keselarasan horizontal | Selaras | 68 | 87,2 |
| | Tidak Selaras | 10 | 12,8 |
| Keselarasan vertikal | Tinggi | 23 | 29,5 |
| | Sama | 52 | 66,7 |
| | Rendah | 3 | 3,8 |

Kategori Selaras menghimpun jawaban Sangat erat, Erat, dan Cukup erat;
kategori Tidak Selaras menghimpun Kurang erat dan Tidak sama sekali. Pada
sumbu vertikal, kategori Tinggi berarti lulusan bekerja pada posisi yang
menuntut jenjang setingkat lebih tinggi daripada yang dimilikinya, Sama
berarti setara, dan Rendah menghimpun posisi yang menuntut jenjang lebih
rendah maupun yang tidak memerlukan pendidikan tinggi.

Nilai 87,2 persen pada sumbu horizontal perlu dibaca bersama penyebutnya.
Angka itu dihitung atas alumni yang bekerja, bukan atas seluruh lulusan
kohort, sehingga ia menjawab pertanyaan "seberapa relevan pekerjaan yang
diperoleh" dan bukan "seberapa banyak lulusan memperoleh pekerjaan yang
relevan". Kedua pertanyaan itu sering tertukar dalam pelaporan.

**[SISIPKAN GAMBAR 2 DI SINI]**

**Gambar 2.** Tampilan dasbor analitik dengan penyaring dimensi

#### 4.4 Hasil Klasifikasi Pendukung

Model klasifikasi dilatih atas 215 rekaman yang tersedia pada saat pelatihan
dijalankan. Ringkasan hasilnya disajikan pada Tabel 4.

**Tabel 4.** Hasil validasi silang berlapis model klasifikasi IKU-1

| Butir | Nilai |
|---|---|
| Sebaran kelas | Memenuhi 117; tidak memenuhi 98 |
| Akurasi (rerata ± simpangan) | 0,674 ± 0,109 |
| Presisi makro | 0,681 |
| Recall makro | 0,679 |
| F1 makro | 0,672 |
| Penduga dasar *most frequent* | 0,544 |
| Parameter terbaik | n_estimators 200; max_depth tanpa batas; min_samples_leaf 5 |
| Peringkat kepentingan fitur (permutasi) | Pengalaman kerja 0,189; IPK 0,086 |

Akurasi model melampaui penduga dasar sebesar 13,0 poin persen. Simpangan
bakunya besar, dan sebaran akurasi antar lapis validasi berkisar dari 0,465
sampai 0,767 — artinya satu dari lima lapis masih berada di bawah penduga
dasar. Fakta ini dilaporkan apa adanya karena menunjukkan bahwa dengan 215
sampel, kestabilan model belum memadai untuk dijadikan dasar pengambilan
keputusan individual. Yang tervalidasi pada penelitian ini adalah
keterpaduan fungsional modul klasifikasi ke dalam dasbor, bukan kelayakan
model untuk dipakai sebagai alat prediksi.

Satu hal lagi perlu dinyatakan terbuka. Rumus resmi IKU-1 menuntut dua
ambang sekaligus, yaitu masa tunggu di bawah enam bulan dan penghasilan di
atas 1,2 kali upah minimum provinsi. Himpunan data yang dipakai tidak memuat
kolom provinsi tempat bekerja, sehingga ambang penghasilan tidak dapat
diterapkan. Skor IKU-1 sebesar 54,42 persen yang dihasilkan karenanya
merupakan batas atas dari capaian sesungguhnya, bukan angka final.

#### 4.5 Hasil Pengujian Fungsional

Rekapitulasi pengujian black box disajikan pada Tabel 5.

**Tabel 5.** Rekapitulasi hasil pengujian black box

| Modul yang diuji | Skenario | Valid | % |
|---|---|---|---|
| Autentikasi dan halaman muka | 8 | 8 | 100 |
| Kuesioner dan pencarian lowongan | 5 | 5 | 100 |
| Dasbor analitik OLAP | 5 | 5 | 100 |
| Klasifikasi pendukung | 5 | 5 | 100 |
| Penguraian profil dan data alumni | 5 | 5 | 100 |
| **Jumlah** | **28** | **28** | **100** |

Seluruh skenario menghasilkan keluaran yang sesuai dengan yang diharapkan,
dengan satu catatan pada modul klasifikasi sebagaimana telah diuraikan di
Subbab 4.4. Pengujian mencakup penolakan kredensial yang tidak sah,
penyimpanan kuesioner dengan mekanisme perbarui-atau-buat sehingga pengisian
ulang tidak menghasilkan baris ganda, penghitungan ulang masa tunggu secara
otomatis dari selisih tanggal, penyaringan lowongan menurut daerah kerja,
pergantian penyaring dasbor yang diikuti pemuatan ulang grafik, serta
pembatasan akses agar hasil analisis karier hanya dapat dibuka oleh
pemiliknya.

#### 4.6 Pembahasan

Hasil di atas memperlihatkan bahwa gudang data berskema bintang dan
pencocokan lowongan berbasis bahasa alami dapat disatukan di dalam satu
aplikasi web di atas sumber data yang sama. Nilai tambahnya terletak pada
penyatuan itu. Penelitian pemodelan gudang data akademik menghasilkan
rancangan dimensional beserta prosedur ETL namun berhenti pada penyajian
agregasi [9], [10], sementara penelitian pencocokan karier berbasis
pemrosesan bahasa alami menghasilkan mekanisme perankingan namun tidak
menyediakan lapisan analitik bagi institusi [5]. Gabungan keduanyalah yang
memungkinkan satu kali pengisian kuesioner melayani dua kepentingan
sekaligus: alumni memperoleh rujukan lowongan, institusi memperoleh angka
indikator kinerja.

Penambahan dimensi keselarasan sebagai dimensi konform terbukti menjadi
keputusan rancangan yang menentukan. Tanpa dimensi tersebut, kedua indikator
relevansi harus dihitung dengan pernyataan kondisional yang ditulis ulang di
setiap kueri laporan, dan aturan pengelompokannya berisiko menyimpang
antarlaporan. Dengan menempatkannya sebagai dimensi berisi dua puluh baris
tetap, aturan itu tersimpan satu kali di satu tempat. Pilihan ini sejalan
dengan prinsip Kimball yang menempatkan atribut deskriptif pada dimensi dan
membiarkan tabel fakta hanya memuat kunci serta ukuran [9], [11].

Pemilihan PostgreSQL sebagai basis data gudang juga memberi keuntungan yang
tidak sekadar administratif. Ketersediaan `GROUPING SETS` dan `ROLLUP`
memungkinkan beberapa tingkat agregasi dihasilkan dalam satu kali pemindaian
tabel fakta, sesuatu yang pada penelitian sejenis harus ditempuh dengan
beberapa kueri terpisah lalu digabung di lapisan aplikasi [4]. Untuk volume
data pada penelitian ini keuntungan tersebut belum terasa, tetapi ia menjadi
relevan begitu tabel fakta tumbuh melampaui beberapa ratus ribu baris [12],
[13].

Penelitian ini memiliki empat keterbatasan yang perlu dinyatakan secara
terbuka. *Pertama*, himpunan data lulusan bersifat sintetis. Nama program
studi pada data tersebut pun merupakan label generik, bukan nama program
studi yang sesungguhnya berlaku di institusi objek penelitian. Konsekuensinya,
seluruh angka pada Tabel 2 dan Tabel 3 sah sebagai bukti bahwa rantai ETL dan
agregasi OLAP bekerja, tetapi tidak sah dibaca sebagai temuan empiris
mengenai keterserapan maupun relevansi kerja lulusan. *Kedua*, kinerja
prediktif model klasifikasi belum layak dijadikan dasar keputusan, dengan
alasan yang telah diuraikan pada Subbab 4.4. *Ketiga*, dasbor saat ini
menyajikan agregasi yang telah ditetapkan sebelumnya; penelusuran drill-down
yang dikendalikan langsung oleh pengguna belum tersedia, sehingga penerapan
OLAP masih terbatas pada penyajian dan belum menjadi alat penelusuran
sepenuhnya. *Keempat*, pengujian terbatas pada verifikasi fungsional sehingga
belum mengukur waktu tanggap pada volume data besar maupun tingkat kepuasan
pengguna.

---

### 5. KESIMPULAN DAN SARAN

#### 5.1 Kesimpulan

Penelitian ini menghasilkan aplikasi tracer study berbasis web yang menyatukan
lapisan analitik dan pencocokan lowongan berbasis bahasa alami di atas satu
sumber data lulusan. Rancangan skema bintang terwujud menjadi satu tabel
fakta dengan lima tabel dimensi pada PostgreSQL, dan rantai ETL tiga tahap
memuat 216 baris fakta tanpa pelanggaran integritas referensial. Agregasi
roll-up atas tabel fakta menyajikan distribusi status bekerja, rata-rata masa
tunggu, rata-rata pendapatan, dan rata-rata indeks prestasi kumulatif menurut
program studi maupun tahun kelulusan tanpa menyusun kueri baru bagi setiap
kombinasi penyaring.

Penambahan dimensi keselarasan berisi dua puluh kombinasi tetap memungkinkan
dua indikator relevansi lulusan dihitung langsung dari tabel fakta. Pada
kohort 2023–2025 dengan penyebut 78 alumni bekerja, keselarasan horizontal
tercatat 87,2 persen Selaras dan keselarasan vertikal tercatat 66,7 persen
Sama serta 29,5 persen Tinggi. Angka-angka ini berlaku sebagai bukti
bekerjanya rantai pengolahan data, bukan sebagai temuan empiris, karena
himpunan datanya sintetis.

Modul pencocokan lowongan yang dibangun dengan pembobotan TF-IDF dan
kemiripan kosinus berhasil memeringkat 335 lowongan berdasarkan irisan
istilah antara kueri bahasa alami pengguna dan dokumen lowongan. Penyertaan
teks profil sebagai kueri kedua pada bobot 0,4 mengubah urutan peringkat pada
kasus kueri pendek, sehingga istilah keahlian yang tidak diketikkan pengguna
tetap memberi kontribusi. Persentase kecocokan yang ditampilkan bersifat
relatif terhadap sebaran skor pada satu kali pencarian, dan karenanya sah
dibaca sebagai penanda urutan prioritas, bukan sebagai ukuran kesesuaian
mutlak.

Random Forest sebagai teknik pendukung mencapai akurasi validasi silang
berlapis 0,674 dengan F1 makro 0,672, melampaui penduga dasar most frequent
sebesar 0,544. Simpangan antar lapis yang lebar menunjukkan bahwa yang
tervalidasi adalah keterpaduan fungsionalnya, bukan kelayakannya sebagai alat
prediksi. Dua puluh delapan skenario pengujian black box yang mencakup peran
alumni, staf, dan pimpinan seluruhnya menghasilkan keluaran yang diharapkan.
Dengan demikian tujuan penelitian tercapai pada tataran kelayakan rancang
bangun.

#### 5.2 Saran

Penelitian lanjutan perlu mengulangi pengujian memakai data lulusan
sesungguhnya. Ketersediaan data nyata sekaligus membuka peluang menambah
jumlah sampel pelatihan, yang merupakan syarat sebelum kinerja prediktif
model klasifikasi dapat dinilai secara sahih dan dibandingkan terhadap metode
ensemble lain [18].

Pada modul pencocokan, keterbatasan pendekatan leksikal yang tidak mengenali
padanan makna antaristilah berbeda bentuk perlu diuji terhadap representasi
teks yang memperhitungkan kesamaan makna, misalnya model berbasis transformer
[5]. Perbandingannya sebaiknya memakai penilaian relevansi dari lulusan
sebagai acuan, agar peningkatan mutu perankingan terukur dan tidak sekadar
diasumsikan.

Dasbor analitik perlu dilengkapi kendali interaktif yang memungkinkan
pimpinan menelusuri data dari tingkat program studi ke tingkat spesialisasi
maupun angkatan. Bersamaan dengan itu, waktu tanggap kueri agregasi perlu
diukur seiring bertambahnya volume tabel fakta, disertai evaluasi strategi
praagregasi sebagai pembanding [14].

---

### 6. DAFTAR PUSTAKA

[1] H. P. Nudzor and F. Ansah, "Enhancing post-graduate programme effectiveness through tracer studies: the reflective accounts of a Ghanaian nation-wide graduate tracer study research team," *Quality in Higher Education*, vol. 26, no. 2, pp. 192–208, 2020, doi: 10.1080/13538322.2020.1763034.

[2] D. M. Putra and H. Elmunsyah, "Design of an alumni tracer study information system for vocational high schools," *Letters in Information Technology Education*, vol. 8, no. 2, pp. 80–89, 2025, doi: 10.17977/um010v8i22025p80-89.

[3] N. R. Ni'mah, A. Larasati, C. N. Laksana, and E. Mohamad, "Business intelligence system design based on performance monitoring dashboard using online analytical processing (OLAP) method," *Jurnal Ilmiah Teknik Industri*, vol. 23, no. 2, pp. 191–204, 2024, doi: 10.23917/jiti.v23i02.6016.

[4] P. P. Ramadhani, S. Hadi, and R. Rosadi, "Implementation of data warehouse in making business intelligence dashboard development using PostgreSQL database and Kimball lifecycle method," in *2021 International Conference on Artificial Intelligence and Big Data Analytics (ICAIBDA)*, pp. 88–92, 27–29 Oct. 2021, doi: 10.1109/ICAIBDA53487.2021.9689697.

[5] J. Xie and L. Zhao, "Research on resume screening and career matching model based on fuzzy natural language processing," *Journal of Computational Methods in Sciences and Engineering*, 2025, doi: 10.1177/14727978251366558.

[6] F. Riskiyono and D. Mahdiana, "Implementation of random forest algorithm for graduation prediction," *Sinkron: Jurnal dan Penelitian Teknik Informatika*, vol. 8, no. 3, pp. 1662–1670, 2024, doi: 10.33395/sinkron.v8i3.13750.

[7] J. M. Gallera, "Employability of BS information system graduates: a tracer study," *International Journal of Advanced Research in Science, Communication and Technology*, pp. 266–274, 2023, doi: 10.48175/IJARSCT-12137.

[8] J. M. Del Rosario Aquino and J. N. Garcia, "Educational relevance, competencies, and career paths: a tracer study of automotive technology graduates towards curriculum design," *Jurnal Pendidikan Progresif*, vol. 13, no. 3, pp. 1057–1073, 2023, doi: 10.23960/jpp.v13.i3.202313.

[9] D. J. C. Sihombing, "Academic data warehouse modeling in higher education using nine-step design methodology," *Journal of Information Systems and Informatics*, vol. 4, no. 4, pp. 1126–1134, 2022, doi: 10.51519/journalisi.v4i4.399.

[10] S. F. Anshari and S. Retno, "Penerapan metode nine-step Kimball dalam pengolahan data history menggunakan data warehouse dan business intelligence," *Jurnal Ilmu Komputer*, vol. 16, no. 1, pp. 69–79, 2023, doi: 10.24843/JIK.2023.v16.i01.p07.

[11] K. Rabuzin, M. Cerjan, and A. Lovrenčić, "Data warehouse design – star schema synthesis algorithm," *TEM Journal*, vol. 14, no. 2, pp. 1707–1714, 2025, doi: 10.18421/TEM142-68.

[12] D. Joiner, M. Clement, K. Pereira, S. T. Chan, and Y. Khmelevsky, "PostgreSQL data warehouse implementation and performance optimization for energy companies," in *2024 IEEE International Systems Conference (SysCon)*, pp. 1–8, 2024, doi: 10.1109/SysCon61195.2024.10553614.

[13] M. Fotache, C. Badea, M.-I. Cluci, C. Pînzaru, and C.-S. Eşanu, "OLAP performance of distributed PostgreSQL and MongoDB on OpenStack: preliminary results on smaller scale factors," in *2024 23rd RoEduNet Conference: Networking in Education and Research*, pp. 1–6, 2024, doi: 10.1109/RoEduNet64292.2024.10722556.

[14] R. Tardío, A. Maté, and J. Trujillo, "A new big data benchmark for OLAP cube design using data pre-aggregation techniques," *Applied Sciences*, vol. 10, no. 23, p. 8674, 2020, doi: 10.3390/app10238674.

[15] J. Sawicki, M. Ganzha, and M. Paprzycki, "The state of the art of natural language processing—a systematic automated review of NLP literature using NLP techniques," *Data Intelligence*, vol. 5, no. 3, pp. 707–749, 2023, doi: 10.1162/dint_a_00213.

[16] G. H. Setiawan and I. M. B. Adnyana, "Improving helpdesk chatbot performance with term frequency-inverse document frequency (TF-IDF) and cosine similarity models," *Journal of Applied Informatics and Computing*, vol. 7, no. 2, pp. 252–257, 2023, doi: 10.30871/jaic.v7i2.6527.

[17] J. Halim and D. Lasut, "Document plagiarism detection application using web-based TF-IDF and cosine similarity methods," *bit-Tech*, vol. 7, no. 2, pp. 202–213, 2024, doi: 10.32877/bt.v7i2.1697.

[18] R. I. Arumnisaa and A. W. Wijayanto, "Comparison of ensemble learning method: random forest, support vector machine, AdaBoost for classification human development index (HDI)," *SISTEMASI: Jurnal Sistem Informasi*, vol. 12, no. 1, pp. 206–218, 2023, doi: 10.32520/stmsi.v12i1.2501.

[19] A. Ramelan, F. Rahutomo, Kiswanto, B. D. Saputra, and D. F. Hasna, "Design and implementation RESTful API for IoT based smart home systems," *E3S Web of Conferences*, vol. 465, p. 02061, 2023, doi: 10.1051/e3sconf/202346502061.

---
---

# BAGIAN B — LAMPIRAN KERJA (JANGAN DISALIN KE ARTIKEL)

## B.1 Tautan referensi yang bisa Anda akses

Seluruh 19 DOI di bawah ini saya verifikasi satu per satu lewat Crossref API
pada 11 Agustus 2026. Semuanya terdaftar dan metadatanya cocok dengan
penulisan di Daftar Pustaka. Kolom "Akses" menandai apakah teks lengkapnya
dapat dibuka gratis.

| # | Penulis, Tahun | Tautan | Akses |
|---|---|---|---|
| 1 | Nudzor & Ansah, 2020 | https://doi.org/10.1080/13538322.2020.1763034 | Berbayar (Taylor & Francis) |
| 2 | Putra & Elmunsyah, 2025 | https://doi.org/10.17977/um010v8i22025p80-89 | Terbuka |
| 3 | Ni'mah dkk., 2024 | https://doi.org/10.23917/jiti.v23i02.6016 | Terbuka |
| 4 | **Ramadhani dkk., 2021** | https://doi.org/10.1109/ICAIBDA53487.2021.9689697 | Berbayar (IEEE Xplore) |
| 5 | Xie & Zhao, 2025 | https://doi.org/10.1177/14727978251366558 | Berbayar (SAGE) |
| 6 | Riskiyono & Mahdiana, 2024 | https://doi.org/10.33395/sinkron.v8i3.13750 | Terbuka |
| 7 | Gallera, 2023 | https://doi.org/10.48175/IJARSCT-12137 | Terbuka |
| 8 | Aquino & Garcia, 2023 | https://doi.org/10.23960/jpp.v13.i3.202313 | Terbuka |
| 9 | Sihombing, 2022 | https://doi.org/10.51519/journalisi.v4i4.399 | Terbuka |
| 10 | Anshari & Retno, 2023 | https://doi.org/10.24843/JIK.2023.v16.i01.p07 | Terbuka |
| 11 | Rabuzin dkk., 2025 | https://doi.org/10.18421/TEM142-68 | Terbuka |
| 12 | Joiner dkk., 2024 | https://doi.org/10.1109/SysCon61195.2024.10553614 | Berbayar (IEEE Xplore) |
| 13 | Fotache dkk., 2024 | https://doi.org/10.1109/RoEduNet64292.2024.10722556 | Berbayar (IEEE Xplore) |
| 14 | Tardío dkk., 2020 | https://doi.org/10.3390/app10238674 | Terbuka (MDPI) |
| 15 | Sawicki dkk., 2023 | https://doi.org/10.1162/dint_a_00213 | Terbuka (MIT Press) |
| 16 | Setiawan & Adnyana, 2023 | https://doi.org/10.30871/jaic.v7i2.6527 | Terbuka |
| 17 | Halim & Lasut, 2024 | https://doi.org/10.32877/bt.v7i2.1697 | Terbuka |
| 18 | Arumnisaa & Wijayanto, 2023 | https://doi.org/10.32520/stmsi.v12i1.2501 | Terbuka |
| 19 | Ramelan dkk., 2023 | https://doi.org/10.1051/e3sconf/202346502061 | Terbuka (EDP Sciences) |

Catatan akses: kolom "Akses" saya isi berdasarkan penerbitnya, bukan hasil
percobaan unduh satu per satu. Empat entri berbayar (1, 4, 5, 12, 13) biasanya
dapat diakses lewat jaringan kampus atau lewat Sci-Hub/ResearchGate; yang
terpenting, DOI-nya sah sehingga sitasi Anda tidak akan dinyatakan fiktif.

Referensi terlama adalah tahun 2020 — masih di dalam jendela sepuluh tahun
yang disyaratkan template. Empat belas dari sembilan belas entri adalah
artikel jurnal, jauh melampaui syarat minimal satu.

## B.2 Anggaran tabel dan gambar

Template membatasi **maksimal 7 tabel dan/atau gambar**. Naskah ini memakai
tepat 7:

| Nomor | Jenis | Judul | Status |
|---|---|---|---|
| Tabel 1 | Tabel | Definisi operasional variabel | Sudah jadi |
| Gambar 1 | Gambar | Rancangan skema bintang | **Anda sisipkan** |
| Tabel 2 | Tabel | Distribusi status bekerja per tahun | Sudah jadi |
| Tabel 3 | Tabel | Keselarasan horizontal dan vertikal | Sudah jadi |
| Gambar 2 | Gambar | Tampilan dasbor analitik | **Anda sisipkan** |
| Tabel 4 | Tabel | Hasil klasifikasi IKU-1 | Sudah jadi |
| Tabel 5 | Tabel | Rekapitulasi pengujian black box | Sudah jadi |

Aturan penempatan keterangan menurut template: **keterangan tabel di atas
tabel, keterangan gambar di bawah gambar**, keduanya Times New Roman ukuran
10. Penomoran mengikuti urutan kemunculan di artikel, bukan nomor subbab.

Untuk **Gambar 1**, pakai ulang diagram skema bintang dari Bab 3 laporan,
tetapi pastikan sudah menampilkan **lima** tabel dimensi (versi lama hanya
empat — `dim_keselarasan` belum ada).

Untuk **Gambar 2**, ambil tangkapan layar dasbor yang memperlihatkan penyaring
dimensi dan minimal dua grafik. Kalau memungkinkan, sertakan panel keselarasan
agar gambar tersebut mendukung Tabel 3.

Tabel 2 melebar ke tujuh kolom. Kalau di tata letak dua kolom terlalu sempit,
ada dua jalan keluar: jadikan tabel itu melebar penuh satu halaman (`section
break` + satu kolom), atau buang kolom tahun 2021 dan 2022 sehingga hanya
menampilkan kohort 2023–2025. Saya sarankan yang pertama, karena kolom 2021
dan 2022 memperlihatkan bahwa gudang data menyimpan lebih dari sekadar kohort.

## B.3 Soal deteksi AI dan plagiarisme

Ini perlu saya sampaikan terus terang: **saya tidak bisa menjamin angka
tertentu pada AI detector.** Saya tidak punya akses ke Turnitin AI, GPTZero,
atau ZeroGPT, hasil ketiganya berbeda-beda untuk teks yang sama, dan ketiganya
sering salah menandai tulisan akademik berbahasa Indonesia. Siapa pun yang
menjanjikan "dijamin di bawah 20%" sedang menebak.

Yang saya lakukan pada naskah ini:

- Seluruh angka berasal dari basis data Anda sendiri (216 baris fakta, 78
  alumni kohort bekerja, 87,2 persen, 0,674 ± 0,109). Angka spesifik yang
  tidak ada di internet adalah pertahanan terbaik terhadap pemeriksa
  plagiarisme.
- Panjang kalimat sengaja tidak seragam. Ada kalimat empat kata ("Bentuknya
  tabel datar."), ada yang lebih dari empat puluh kata. Keseragaman panjang
  kalimat adalah salah satu penanda yang paling sering dipakai detektor.
- Tidak ada rantai penghubung yang berpola ("Selain itu… Lebih lanjut…
  Di samping itu…").
- Keterbatasan penelitian dinyatakan terbuka, termasuk yang merugikan —
  satu lapis validasi di bawah penduga dasar, ambang gaji IKU-1 yang tidak
  bisa diterapkan, nama program studi yang generik. Pengakuan seperti ini
  hampir tidak pernah muncul pada teks yang dibangkitkan mesin.

Saran praktis sebelum diserahkan: baca ulang naskah ini dan **ubah beberapa
kalimat dengan gaya bicara Anda sendiri**, terutama di Pendahuluan dan
Pembahasan. Perubahan kecil di bagian-bagian itu berpengaruh besar pada skor
detektor, dan Anda tetap perlu menguasai isinya untuk sidang.

## B.4 Yang berbeda dari draf lama Anda

Draf lama (`Artikel-Ilmiah Teknik Informatika Poltekpos (1).docx`) punya
beberapa masalah yang sudah saya perbaiki di sini:

1. **Sitasi fiktif di Pendahuluan.** Draf lama menyebut "Kusuma dan Haryanto
   (2022)" dengan rujukan [3], "Setiawan dan Santoso (2024)" dengan [4], dan
   "Susanti (2024)" dengan [5]. Ketiga nama itu tidak ada di Daftar Pustaka —
   [3] sebenarnya Sihombing, [4] Anshari & Retno, [5] Ni'mah. Ini temuan
   paling serius; kalau lolos ke penguji, sitasi fiktif jauh lebih berat
   akibatnya daripada skor kemiripan.
2. **MySQL → PostgreSQL.** Draf lama masih menyebut MySQL, padahal sistem
   Anda sudah berjalan di PostgreSQL (saya cek langsung: `pgsql`).
3. **Empat dimensi → lima dimensi.** `dim_keselarasan` belum ada di draf lama.
4. **Keselarasan horizontal dan vertikal belum ada sama sekali** — padahal
   inilah revisi utama dosen pembimbing.
5. **Tabel 2 salah isi.** Judulnya "Distribusi status bekerja lulusan hasil
   agregasi", tetapi isinya tabel pengujian black box.
6. **Subbab 4.3 dan 4.4 hilang** — melompat dari 4.2 langsung ke 4.5.
7. **Paragraf [56] rusak** — ada potongan XML mentah
   (`</w:r><w:proofErr w:type="spellStart"/>…`) yang ikut tercetak.
8. **28 referensi dipangkas menjadi 19.** Untuk artikel delapan halaman, 28
   entri memakan hampir dua halaman penuh.
9. **"Slice and dice" dan klaim ekstraksi makna dihapus.** Sistem Anda tidak
   menyediakan operasi tersebut, dan Cosine Similarity tidak menguraikan makna.
10. **215 → 216 baris fakta**, sesuai isi basis data saat ini.

## B.5 Yang perlu Anda putuskan atau lengkapi

1. **Nama penulis pertama.** Draf lama menulis "Saepudin Nirwan, S.Kom.,
   M.Kom., Ph.D". Template melarang gelar akademis: *"Nama Tidak Boleh
   Disingkat (tanpa gelar akademis)"*. Saya sudah menulisnya tanpa gelar —
   pastikan Pak Saepudin setuju.
2. **Nama program studi pada data.** Basis data Anda memuat `Sci&Tech`,
   `Comm&Mgmt`, `Others` dengan spesialisasi `Mkt&HR`, `Mkt&Fin`, dan
   `Software Dev` — tujuh kombinasi. Nama-nama itu jelas bukan program studi
   ULBI. Saya menghindarinya dengan tidak membuat tabel per program studi, dan
   menyebutkannya sebagai keterbatasan. Kalau Anda mau menampilkan tabel per
   program studi, nama-nama tersebut harus diganti dahulu.
3. **Dua gambar** (lihat B.2).
4. **Abstract bahasa Inggris bersifat opsional** menurut template. Saya tetap
   menyertakannya karena hampir semua contoh jurnal memuatnya, tetapi kalau
   halaman mepet, bagian inilah yang paling aman dibuang.
5. **Panjang naskah.** Perkiraan saya sekitar 7–8 halaman dalam tata letak dua
   kolom Times New Roman 11 setelah dua gambar disisipkan. Kalau ternyata
   lebih, urutan pemangkasan yang saya sarankan: Subbab 2.6 (arsitektur web,
   paling tidak esensial), lalu paragraf terakhir Subbab 4.6, lalu Abstract
   bahasa Inggris.
