# Naskah Revisi — Bab 1

Teks siap tempel. Ganti seluruh isi subbab, jangan menambal kalimat per kalimat.

---

## 1.4 Ruang Lingkup

> Agar pembahasan dan proses pengembangan sistem lebih terarah serta tidak
> menyimpang dari tujuan utama penelitian, maka batasan masalah atau ruang
> lingkup pada Tugas Akhir ini ditetapkan sebagai berikut:
>
> 1. Sistem dibangun dalam bentuk aplikasi berbasis web menggunakan arsitektur
>    *Client-Server*. Antarmuka pengguna (*frontend*) dikembangkan menggunakan
>    *framework* React.js, sedangkan layanan *backend* dan integrasi
>    *Application Programming Interface* (API) dibangun menggunakan *framework*
>    Laravel.
>
> 2. Sistem manajemen basis data menggunakan PostgreSQL. Basis data operasional
>    (*Online Transaction Processing*) menampung data transaksional hasil
>    pengisian kuesioner, sedangkan gudang data (*data warehouse*) dirancang
>    menggunakan pendekatan multidimensi skema bintang (*star schema*) yang
>    terdiri atas satu tabel fakta dan lima tabel dimensi, yaitu dimensi waktu,
>    program studi, status kerja, alumni, dan keselarasan. Pemindahan data di
>    antara keduanya dilakukan melalui proses *Extract, Transform, Load* (ETL)
>    yang dijalankan oleh sistem.
>
> 3. Implementasi *Online Analytical Processing* (OLAP) dibatasi pada agregasi
>    data historis kelulusan untuk kebutuhan dasbor administrator, meliputi
>    operasi peringkasan (*roll-up*) menurut tahun kelulusan dan program studi,
>    penelusuran rinci (*drill-down*) pada tabulasi silang program studi
>    terhadap status kerja, serta penyaringan menurut jendela kohort. Sistem
>    tidak menyediakan pembentukan kubus data secara mandiri oleh pengguna
>    (*ad hoc cube*).
>
> 4. Populasi yang dianalisis pada dasbor dibatasi pada kohort *Tracer Study*
>    TS-1 sampai TS-3, yaitu tiga tahun kelulusan terakhir terhitung dari tahun
>    survei (TS). Data lulusan di luar jendela tersebut tetap tersimpan di dalam
>    gudang data sebagai riwayat, tetapi tidak diikutsertakan dalam perhitungan
>    Indikator Kinerja Utama.
>
> 5. Pengukuran keselarasan lulusan dibatasi pada dua indikator yang dihitung
>    langsung dari jawaban kuesioner, yaitu keselarasan horizontal berupa
>    kesesuaian bidang studi dengan bidang pekerjaan, dan keselarasan vertikal
>    berupa kesesuaian jenjang pendidikan dengan tingkat pekerjaan. Kedua
>    indikator diukur berdasarkan persepsi responden dan hanya ditanyakan kepada
>    alumni yang berstatus bekerja atau berwirausaha, sehingga penyebut
>    perhitungannya adalah jumlah alumni bekerja pada kohort, bukan seluruh
>    alumni.
>
> 6. Teknologi *Natural Language Processing* (NLP) difokuskan secara eksklusif
>    pada fitur *Job Matching*. Pencocokan dilakukan melalui pembobotan *Term
>    Frequency–Inverse Document Frequency* (TF-IDF) atas teks profil keahlian
>    alumni dan deskripsi lowongan, kemudian diukur kemiripannya menggunakan
>    *Cosine Similarity*. Sistem tidak melakukan penguraian makna kalimat maupun
>    pengenalan entitas bernama. Data lowongan pekerjaan yang digunakan sebagai
>    pembanding merupakan set data simulasi yang dikelola oleh Admin, bukan
>    integrasi langsung dari portal lowongan kerja pihak ketiga (API eksternal).
>
> 7. Data alumni yang digunakan dalam pengujian sistem merupakan data simulasi
>    yang disusun menyerupai sebaran data *Tracer Study* program studi,
>    ditambah data hasil pengisian kuesioner oleh pengguna sistem. Penelitian
>    ini tidak menggunakan data alumni sebenarnya.
>
> 8. Penerapan algoritma *Random Forest* dibatasi sebagai teknik pendukung pada
>    modul analitik dengan satu variabel target, yaitu klasifikasi pemenuhan
>    Indikator Kinerja Utama pertama berupa perolehan pekerjaan dalam rentang
>    kurang dari enam bulan sejak kelulusan. Algoritma ini tidak digunakan untuk
>    memprediksi keselarasan bidang pekerjaan, karena keselarasan telah diukur
>    langsung dari jawaban kuesioner sebagaimana disebutkan pada butir 5.
>
> 9. Interaksi sistem dibatasi pada tiga peran pengguna, yaitu Admin (memiliki
>    hak akses penuh untuk mengelola data induk, set data lowongan, dan dasbor
>    analitik), Alumni (memiliki hak akses untuk memperbarui profil keahlian,
>    mengisi kuesioner, dan menggunakan pencarian kerja cerdas), serta Viewer
>    (memiliki hak akses *read-only* untuk memantau dasbor analitik dan mencetak
>    laporan).

---

## Rekapitulasi perubahan

| Butir | Keadaan lama | Perubahan | Alasan |
|---|---|---|---|
| 1 | Butir 1 lama | Tidak berubah | — |
| 2 | Bagian pertama butir 2 lama | MySQL → PostgreSQL; ditambah pemisahan OLTP dan gudang data, jumlah dimensi (lima), dan penyebutan ETL | Migrasi basis data; skema bintang bertambah `dim_keselarasan`; pemisahan OLTP/OLAP belum pernah dinyatakan sebagai batasan |
| 3 | Bagian kedua butir 2 lama | Dipecah menjadi butir tersendiri; operasi OLAP disebut satu per satu; ditambah batasan *ad hoc cube* | Butir 2 lama memuat dua batasan berbeda dalam satu nomor; penyebutan operasi membuat lingkupnya terukur saat sidang |
| 4 | **Belum ada** | Butir baru | Revisi dosen pembimbing. Tanpa butir ini, jendela kohort di Bab 3 dan Bab 4 muncul tanpa dasar |
| 5 | **Belum ada** | Butir baru | Revisi dosen pembimbing. Sekaligus mengunci penyebut perhitungan — alumni bekerja, bukan seluruh kohort |
| 6 | Butir 3 lama | Ditambah nama metode (TF-IDF dan *Cosine Similarity*) dan batasan negatif; kalimat set data lowongan digabung ke sini | Bab 1 lama hanya menyebut "algoritma" tanpa nama. Batasan negatif mencegah penguji menuntut kemampuan yang memang tidak dibangun |
| 7 | **Belum ada** | Butir baru | Sifat data pengujian belum pernah diungkapkan di Bab 1. Ini akan ditanyakan penguji, lebih baik dinyatakan sendiri |
| 8 | Butir 4 lama | "probabilitas kesesuaian bidang pekerjaan" dihapus; target tinggal satu; ditegaskan sebagai teknik pendukung | Kesesuaian bidang kini **diukur**, bukan diprediksi. Membiarkan kalimat lama membuat butir 5 dan butir 8 saling bertentangan |
| 9 | Butir 5 lama | Tidak berubah, hanya penyesuaian istilah | — |

---

## Tiga hal yang perlu Anda putuskan

**Pertama — butir 2 berandaikan migrasi PostgreSQL sudah dilakukan.** Bila
migrasi belum dijalankan sampai naskah dikumpulkan, ganti kalimat pertamanya
menjadi:

> Sistem manajemen basis data menggunakan MySQL.

Sisanya tidak berubah. Jangan menulis PostgreSQL di Bab 1 sementara Bab 4 masih
melaporkan XAMPP dan MySQL.

**Kedua — butir 7 belum menyebut alasan.** Saya sengaja tidak mengarang. Bila
alasannya keterbatasan izin akses ke basis data institusi, tambahkan sebagai
kalimat penutup. Bila alasannya lain, sesuaikan.

**Ketiga — butir 8 sekarang bertentangan dengan Tujuan penelitian.**
Tujuan ketiga (paragraf yang berbunyi "...memproyeksikan estimasi masa tunggu
kerja **dan probabilitas kesesuaian karier lulusan** di masa depan") masih
menjanjikan dua target. Ruang Lingkup baru hanya menyanggupi satu. Tujuan ketiga
harus ikut diperbaiki menjadi:

> Menerapkan algoritma *Machine Learning* menggunakan metode *Random Forest*
> sebagai teknik pendukung pada dasbor analitik untuk mengklasifikasikan
> pemenuhan Indikator Kinerja Utama pertama oleh lulusan, sehingga program
> studi dapat mengambil langkah pembinaan karier lebih dini.

Identifikasi Masalah butir ketiga juga menyebut "mengestimasi masa tunggu kerja
**maupun keselarasan bidang pekerjaan** lulusan" sebagai sesuatu yang diprediksi.
Ubah agar keselarasan disebut sebagai yang **belum terukur**, bukan yang belum
terprediksi:

> Laporan yang dihasilkan sistem berjalan masih terbatas pada analitik
> deskriptif atas data historis. Program studi belum memiliki instrumen yang
> mampu mengukur keselarasan bidang pekerjaan lulusan maupun mengestimasi
> pemenuhan Indikator Kinerja Utama, sehingga intervensi kebijakan karier
> cenderung bersifat reaktif.

Ketiganya harus sejalan: masalah, tujuan, dan batasan. Penguji membaca ketiganya
berurutan dalam satu bab.
