# Kutipan untuk Latar Belakang (Bab 1)

**Status verifikasi:** seluruh rujukan di bawah dicek melalui **Crossref REST API**
(`api.crossref.org`) pada 7 Agustus 2026. Metadata (judul, penulis, jurnal,
volume, nomor, halaman, tahun, DOI) diambil langsung dari respons API, bukan
dari ingatan.

**Batas verifikasi yang perlu Anda tahu:** yang saya konfirmasi adalah bahwa
**karya itu benar-benar ada** dan metadatanya persis seperti tertulis. Saya
**tidak membaca isi** setiap makalah, jadi untuk rujukan yang menyangga klaim
spesifik (terutama [5]–[8] tentang kondisi pendataan manual), Anda tetap perlu
membuka DOI-nya dan memastikan klaim itu memang dibahas di sana. Untuk karya
mani seperti Breiman, Salton, dan Chaudhuri & Dayal, kaitannya sudah baku.

---

## Bagian 1 — Analisis Latar Belakang

Sebelum ke kutipan, ada empat hal pada naskah yang sebaiknya diperbaiki lebih
dulu. Tiga di antaranya berpotensi jadi pertanyaan penguji.

### 1.1 Ada dua prediksi yang dijanjikan tetapi belum dibangun ⚠️

Paragraf 4 menulis:

> "Penggunaan algoritma ini bertujuan untuk memprediksi **probabilitas
> kesesuaian bidang kerja** dan **estimasi masa tunggu kerja** lulusan…"

Model yang benar-benar ada di sistem (`train_random_forest_iku.py`) memprediksi
**satu hal**: apakah seorang lulusan memenuhi kriteria IKU 1 atau tidak — sebuah
klasifikasi biner. Model itu tidak memprediksi kesesuaian bidang kerja, dan
tidak mengestimasi masa tunggu.

Ini janji yang belum ditepati kode. Dua pilihan:

- **Sesuaikan kalimatnya** dengan yang benar-benar dibangun — misalnya
  "memprediksi probabilitas seorang lulusan memenuhi kriteria IKU 1
  berdasarkan profil akademiknya".
- **Bangun modelnya**, kalau memang ingin dipertahankan. Ini pekerjaan
  tambahan yang cukup besar dan butuh kolom data yang saat ini belum ada.

Saya sarankan yang pertama. Latar belakang yang menjanjikan lebih banyak
daripada isi laporan adalah celah yang paling mudah ditemukan penguji.

### 1.2 Kata "real-time" terlalu kuat

Paragraf 1 menyebut "data alumni yang akurat dan **real-time**". Data masuk
lewat pengisian kuesioner oleh alumni, bukan aliran otomatis. Ganti dengan
"mutakhir" atau "termutakhir secara berkala" — lebih jujur dan tetap kuat.

### 1.3 Posisi Random Forest terhadap judul

Judul Anda hanya menyebut OLAP dan NLP. Paragraf 4 memperkenalkan Random Forest
sebagai metode ketiga yang setara. Supaya tidak terbaca sebagai metode yang
hilang dari judul, posisikan Random Forest sebagai **komponen pendukung
dashboard OLAP**, bukan metode utama yang sejajar. Cukup ubah "penelitian ini
menambahkan algoritma" menjadi "dashboard analitik pada penelitian ini
dilengkapi algoritma".

### 1.4 Catatan teknis harus dihapus

Kalimat "(Catatan: Anda dapat memasukkan data dari Tabel 1.1 ke dalam Microsoft
Word melalui menu Insert > Chart > Column…)" adalah catatan kerja, bukan isi
laporan. Hapus sebelum dicetak.

---

## Bagian 2 — Latar Belakang dengan Penanda Sitasi

Teks di bawah adalah naskah Anda dengan penanda `[n]` disisipkan. Perubahan
kata yang saya sarankan ditandai **tebal**.

---

Pelacakan jejak alumni atau *Tracer Study* merupakan instrumen strategis bagi
institusi pendidikan tinggi untuk mengevaluasi relevansi kurikulum pendidikan
terhadap kebutuhan dunia kerja industri **[1]**. Pentingnya pelaksanaan
pendataan ini telah diatur secara resmi oleh Kementerian Pendidikan, Kebudayaan,
Riset, dan Teknologi melalui Keputusan Menteri Nomor 3/M/2021 tentang Indikator
Kinerja Utama (IKU) Perguruan Tinggi **[2]**. Pada indikator pertama (IKU 1),
institusi dituntut untuk memastikan lulusannya mendapatkan pekerjaan yang layak,
melanjutkan studi, atau menjadi wiraswasta dalam kurun waktu kurang dari enam
bulan setelah kelulusan **[3]**. Oleh karena itu, ketersediaan data alumni yang
akurat dan **mutakhir** menjadi krusial untuk pemenuhan standar akreditasi
**[4]**.

Namun, dalam pelaksanaannya, pendataan *Tracer Study* yang berjalan saat ini
masih menghadapi kendala fundamental. Proses pengumpulan dan pengolahan data
umumnya masih bergantung pada metode konvensional berbasis *spreadsheet* statis
**[5]**. Pendekatan ini memicu inefisiensi waktu, rentan terhadap kesalahan
operasional (*human error*), dan sangat terbatas ketika pihak manajemen program
studi membutuhkan laporan analitik pertumbuhan karier lulusan secara cepat
**[6]**. Selain itu, tingkat partisipasi pengisian kuesioner oleh alumni
cenderung rendah **[1]**. Hal ini disebabkan oleh sistem pendataan yang bersifat
birokratis satu arah, di mana alumni tidak mendapatkan insentif atau umpan balik
(*feedback*) berupa informasi peluang karier yang relevan dengan profil keahlian
mereka **[7]**.

Untuk mengatasi permasalahan tersebut, dibutuhkan sebuah arsitektur sistem
cerdas yang mampu mengotomatisasi pengolahan data berskala besar sekaligus
memberikan manfaat langsung bagi alumni. Integrasi metode *Online Analytical
Processing* (OLAP) pada sistem *Data Warehouse* memungkinkan pihak manajemen
untuk melakukan agregasi data lulusan secara multidimensi **[8]**. Metode ini
memfasilitasi operasi analitik deskriptif dan diagnostik seperti *drill-down*,
*roll-up*, dan *slice-and-dice* untuk menghasilkan *dashboard* pemantauan yang
interaktif **[9]**. Di sisi lain, untuk meningkatkan partisipasi alumni, sistem
diusulkan mengadopsi teknologi *Natural Language Processing* (NLP) dalam fitur
*Job Matching* **[10]**. Implementasi NLP memungkinkan alumni untuk mencari
rekomendasi lowongan pekerjaan secara intuitif melalui masukan bahasa alami yang
mencocokkan teks keahlian dengan kriteria industri secara semantik **[11]**.

Meskipun metode OLAP sangat efektif untuk mengevaluasi data historis, evaluasi
IKU di era modern membutuhkan pendekatan analitik prediktif untuk memproyeksikan
tren di masa depan **[12]**. Oleh karena itu, **dashboard analitik pada
penelitian ini dilengkapi** algoritma *machine learning* Random Forest. Random
Forest merupakan algoritma berbasis *ensemble learning* yang terbukti tangguh
dalam menangani data non-linear berskala besar dengan tingkat akurasi
klasifikasi yang tinggi **[13]**, terutama pada pemrosesan variabel akademik
**[14]**. Penggunaan algoritma ini bertujuan untuk **memprediksi probabilitas
seorang lulusan memenuhi kriteria IKU 1 berdasarkan profil akademiknya**,
sehingga program studi dapat melakukan intervensi kebijakan lebih awal **[15]**.

Sebagai gambaran mengenai urgensi pembaruan sistem pendataan alumni ini,
Tabel 1.1 menyajikan perbandingan tingkat kapabilitas analitik pada sistem
berjalan dibandingkan dengan sistem usulan. Tingkatan analitik yang dipakai
mengacu pada taksonomi deskriptif–diagnostik–prediktif **[12]**.

---

## Bagian 3 — Daftar Rujukan (IEEE)

Nomor mengikuti urutan kemunculan pertama. **Kolom DOI adalah yang Anda perlukan
untuk Mendeley** — cukup tempel DOI-nya ke *Add Entry Manually → DOI*, Mendeley
akan menarik metadatanya sendiri.

### [1] Tracer study sebagai instrumen evaluasi & kendala partisipasi

> H. P. Nudzor dan F. Ansah, "Enhancing post-graduate programme effectiveness
> through tracer studies: the reflective accounts of a Ghanaian nation-wide
> graduate tracer study research team," *Quality in Higher Education*, vol. 26,
> no. 2, hal. 192–208, 2020.

- **DOI:** `10.1080/13538322.2020.1763034`
- **Tautan:** https://doi.org/10.1080/13538322.2020.1763034
- **Penerbit:** Taylor & Francis · terindeks Scopus

### [2] Dasar hukum IKU

> Kementerian Pendidikan dan Kebudayaan Republik Indonesia, *Keputusan Menteri
> Pendidikan dan Kebudayaan Nomor 3/M/2021 tentang Indikator Kinerja Utama
> Perguruan Tinggi Negeri dan Lembaga Layanan Pendidikan Tinggi di Kementerian
> Pendidikan dan Kebudayaan*. Jakarta: Kemendikbud, 2021.

- **DOI:** tidak ada (dokumen regulasi)
- **Cara dapat:** cari "Kepmendikbud 3/M/2021" di JDIH Kemdikbud
  (https://jdih.kemdikbud.go.id) atau situs LLDIKTI wilayah Anda
- ⚠️ Naskah Anda sebelumnya menulis **3/P/2021** — nomor yang benar **3/M/2021**

### [3] Rincian kriteria IKU 1

> Direktorat Jenderal Pendidikan Tinggi, *Buku Panduan Indikator Kinerja Utama
> Perguruan Tinggi Negeri*. Jakarta: Kementerian Pendidikan dan Kebudayaan, 2021.

- **DOI:** tidak ada (dokumen panduan resmi)
- **Halaman relevan:** hal. 12 (ambang masa tunggu 6 bulan), hal. 16 (rumus IKU 1)
- ⚠️ Kriteria "pekerjaan layak" di dokumen ini mensyaratkan **dua** ambang: masa
  tunggu < 6 bulan **dan** penghasilan > 1,2 × UMP. Naskah Anda hanya menyebut
  yang pertama. Sebutkan keduanya, lalu jelaskan di Batasan Masalah bahwa ambang
  gaji belum dapat diterapkan karena kolom provinsi tempat bekerja tidak tersedia.

### [4] Tracer study untuk akreditasi & keterserapan lulusan

> M. Ragui, "University extra-curricular activities and employability: A graduate
> tracer study on ENACTUS program graduates from Kenya universities," *Industry
> and Higher Education*, vol. 40, no. 1, hal. 96–108, 2025.

- **DOI:** `10.1177/09504222251327283`
- **Tautan:** https://doi.org/10.1177/09504222251327283
- **Penerbit:** SAGE · terindeks Scopus

### [5] Pendataan konvensional berbasis spreadsheet

> M. Razi, F. Faradika, dan Z. Zulfahmi, "Perancangan Sistem Penelusuran Alumni
> (Tracer Study) Berbasis Web pada Universitas Dharma Andalas," *Jurnal Teknologi
> dan Sistem Informasi Bisnis*, vol. 3, no. 1, hal. 143–146, 2021.

- **DOI:** `10.47233/jteksis.v3i1.205`
- **Tautan:** https://doi.org/10.47233/jteksis.v3i1.205
- 🔍 **Perlu Anda buka:** pastikan bagian pendahuluannya memang menyebut masalah
  pendataan manual/spreadsheet

### [6] Inefisiensi dan human error pada pengolahan manual

> J. M. Yusup dan F. Abdussalaam, "Perancangan Sistem Informasi Manajemen Alumni
> (Tracer Study) Berbasis Web di Politeknik Piksi Ganesha," *Jurnal Sains dan
> Informatika*, vol. 9, no. 1, hal. 110–119, 2023.

- **DOI:** `10.34128/jsi.v9i1.621`
- **Tautan:** https://doi.org/10.34128/jsi.v9i1.621
- 🔍 **Perlu Anda buka:** konfirmasi klaim *human error* dan inefisiensi waktu

### [7] Sistem pendataan satu arah tanpa umpan balik

> M. Mashuri dan S. Assegaff, "Sistem Informasi Alumni (Tracer Study) Berbasis
> Web," *Jurnal Manajemen Sistem Informasi*, vol. 8, no. 3, hal. 449–460, 2023.

- **DOI:** `10.33998/jurnalmsi.2023.8.3.1481`
- **Tautan:** https://doi.org/10.33998/jurnalmsi.2023.8.3.1481
- 🔍 **Perlu Anda buka:** konfirmasi pembahasan soal rendahnya partisipasi alumni
- ⚠️ Studi kasus makalah ini SMA, bukan perguruan tinggi. Bila kurang pas,
  ganti dengan A. Rusli dan Ilyas, "Sistem Informasi Tracer Study Alumni
  Universitas Islam Indragiri Berbasis Web," *Jurnal Perangkat Lunak*, vol. 2,
  no. 1, hal. 41–50, 2020. DOI: `10.32520/jupel.v2i1.1083`

### [8] OLAP & Data Warehouse untuk agregasi multidimensi

> S. Chaudhuri dan U. Dayal, "An overview of data warehousing and OLAP
> technology," *ACM SIGMOD Record*, vol. 26, no. 1, hal. 65–74, 1997.

- **DOI:** `10.1145/248603.248616`
- **Tautan:** https://doi.org/10.1145/248603.248616
- **Catatan:** makalah rujukan baku untuk OLAP, disitasi puluhan ribu kali

### [9] Operasi drill-down, roll-up, slice-and-dice

> J. Gray, S. Chaudhuri, A. Bosworth, A. Layman, D. Reichart, M. Venkatrao,
> F. Pellow, dan H. Pirahesh, "Data cube: A relational aggregation operator
> generalizing group-by, cross-tab, and sub-totals," *Data Mining and Knowledge
> Discovery*, vol. 1, no. 1, hal. 29–53, 1997.

- **DOI:** `10.1023/A:1009726021843`
- **Tautan:** https://doi.org/10.1023/A:1009726021843
- ⚠️ Ada dua versi karya ini. Pakai versi jurnal 1997 di atas, **bukan** versi
  prosiding ICDE 1996 (DOI `10.1109/icde.1996.492099`) yang daftar penulisnya
  lebih pendek

### [10] NLP untuk pencocokan lowongan kerja

> P. Skondras, P. Zervas, dan G. Tzimas, "Zero-Shot Resume–Job Matching with LLMs
> via Structured Prompting and Semantic Embeddings," *Electronics*, vol. 14,
> no. 24, art. 4960, 2025.

- **DOI:** `10.3390/electronics14244960`
- **Tautan:** https://doi.org/10.3390/electronics14244960
- **Penerbit:** MDPI · akses terbuka, bisa langsung dibaca

### [11] Pembobotan TF-IDF & kemiripan semantik

> G. Salton dan C. Buckley, "Term-weighting approaches in automatic text
> retrieval," *Information Processing & Management*, vol. 24, no. 5, hal.
> 513–523, 1988.

- **DOI:** `10.1016/0306-4573(88)90021-0`
- **Tautan:** https://doi.org/10.1016/0306-4573(88)90021-0
- **Catatan:** inilah rujukan asli TF-IDF yang dipakai `TfIdfService.php`

### [12] Tingkatan analitik: deskriptif → diagnostik → prediktif

> K. Lepenioti, A. Bousdekis, D. Apostolou, dan G. Mentzas, "Prescriptive
> analytics: Literature review and research challenges," *International Journal
> of Information Management*, vol. 50, hal. 57–70, 2020.

- **DOI:** `10.1016/j.ijinfomgt.2019.04.003`
- **Tautan:** https://doi.org/10.1016/j.ijinfomgt.2019.04.003
- **Penerbit:** Elsevier · Q1, terindeks Scopus
- **Dipakai untuk:** kalimat penutup paragraf 4 **dan** landasan Tabel 1.1

### [13] Random Forest sebagai ensemble learning

> L. Breiman, "Random forests," *Machine Learning*, vol. 45, no. 1, hal. 5–32,
> 2001.

- **DOI:** `10.1023/A:1010933404324`
- **Tautan:** https://doi.org/10.1023/A:1010933404324
- **Catatan:** makalah asli algoritma; wajib ada karena dospem meminta Random Forest

### [14] Random Forest pada variabel akademik

> M. Nachouki dan M. Abou Naaj, "Predicting Student Performance to Improve
> Academic Advising Using the Random Forest Algorithm," *International Journal of
> Distance Education Technologies*, vol. 20, no. 1, hal. 1–17, 2022.

- **DOI:** `10.4018/ijdet.296702`
- **Tautan:** https://doi.org/10.4018/ijdet.296702
- **Penerbit:** IGI Global

### [15] Prediksi dini untuk intervensi kebijakan

> C. R. Çırak, H. Akıllı, dan Y. Ekinci, "Development of an early warning system
> for higher education institutions by predicting first-year student academic
> performance," *Higher Education Quarterly*, vol. 78, no. 4, 2024.

- **DOI:** `10.1111/hequ.12539`
- **Tautan:** https://doi.org/10.1111/hequ.12539
- **Penerbit:** Wiley · Q1, terindeks Scopus
- **Kenapa cocok:** persis mengangkat gagasan "intervensi lebih awal" yang Anda
  tulis di akhir paragraf 4

---

## Rujukan Cadangan

Dua rujukan ini tidak dipakai di latar belakang versi revisi, tetapi berguna
bila Anda memutuskan mempertahankan klaim estimasi masa tunggu (§1.1), atau
untuk Bab 2:

> B. Panuluh, I. Palupi, dan P. H. Gunawan, "Decision Tree Algorithm for
> Predicting Alumni Job Competitiveness Through Waiting Time Working," *Building
> of Informatics, Technology and Science (BITS)*, vol. 6, no. 2, 2024.
> DOI: `10.47065/bits.v6i2.5647` — https://doi.org/10.47065/bits.v6i2.5647

Satu-satunya rujukan yang saya temukan membahas prediksi **masa tunggu kerja
alumni** secara langsung. Perhatikan bahwa makalah ini memakai Decision Tree,
bukan Random Forest — justru berguna sebagai pembanding.

> V. Dermol dan V. Skrbinjek, "Predicting student dropout in higher education
> using Random Forest and survival analysis," *Discover Education*, vol. 5,
> no. 1, 2026. DOI: `10.1007/s44217-026-01710-8`

---

## Daftar Periksa Sebelum Impor ke Mendeley

- [ ] Buka setiap tautan DOI di atas — semuanya harus membuka halaman artikel
- [ ] Untuk [5], [6], [7]: baca pendahuluannya, pastikan klaim yang Anda sangga
      memang ada di sana
- [ ] Cari dan unduh Kepmendikbud **3/M/2021** dari JDIH, simpan PDF-nya
- [ ] Perbaiki `3/P/2021` → `3/M/2021` di seluruh naskah
- [ ] Hapus catatan "Insert > Chart > Column" dari Tabel 1.1
- [ ] Putuskan penanganan klaim prediksi masa tunggu & kesesuaian bidang (§1.1)
- [ ] Ganti "real-time" → "mutakhir"
- [ ] Setelah Bab 2 selesai, samakan penomoran — lihat
      [`docs/daftar-pustaka.md`](daftar-pustaka.md)
