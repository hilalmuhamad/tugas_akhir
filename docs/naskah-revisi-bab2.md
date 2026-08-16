# Naskah Revisi — Bab 2 Tinjauan Pustaka

Teks siap tempel untuk empat subbab yang terkena revisi. Subbab NLP (2.3.4) dan
Random Forest (2.3.5) tidak disertakan — keduanya belum terkena revisi dosen,
dan Tabel 2.3 masih menunggu keputusan Anda soal urutan *stopword* di
`TfIdfService`.

Tanda **[?]** berarti rujukan yang harus Anda cari sendiri. Saya tidak
mencantumkan nomor rujukan karangan.

---

## 2.2 Konsep Tracer Study

### 2.2.1 Tambahan pada Tabel 2.1

Sisipkan empat baris berikut setelah baris "Ketepatan Waktu Kelulusan". Format
kolomnya mengikuti tabel yang sudah ada.

| Indikator | Atribut Sumber Data | Parameter Pengukuran |
|---|---|---|
| Jabatan Pekerjaan | `dim_alumni.jabatan` | Nominal, teks bebas; terisi hanya untuk lulusan berkategori Berpenghasilan |
| Bidang Pekerjaan | `dim_alumni.bidang_pekerjaan` | Nominal, kategori bidang usaha; terisi hanya untuk lulusan berkategori Berpenghasilan |
| Keselarasan Horizontal | `dim_keselarasan.hubungan_bidang` → `dim_keselarasan.kategori_horizontal` | Ordinal, 5 tingkat: Sangat erat; Erat; Cukup erat; Kurang erat; Tidak sama sekali. Diringkas menjadi 2 kategori: Selaras; Tidak Selaras |
| Keselarasan Vertikal | `dim_keselarasan.tingkat_pendidikan_sesuai` → `dim_keselarasan.kategori_vertikal` | Ordinal, 4 pilihan: Setingkat lebih tinggi; Tingkat yang sama; Setingkat lebih rendah; Tidak perlu pendidikan tinggi. Diringkas menjadi 3 kategori: Tinggi; Sama; Rendah |

### 2.2.2 Paragraf penutup Tabel 2.1 — ganti isi paragraf [388]

Paragraf lama memuat dua hal yang perlu diperbaiki: frasa "secara real-time"
dan penyebutan *Data Cube* sebagai struktur yang benar-benar dibentuk. Sistem
ini tidak mewujudkan kubus data tersimpan; agregasi dihitung oleh basis data
saat kueri dijalankan. Teks pengganti:

> Indikator-indikator yang tertera pada Tabel 2.1 berpotensi menghasilkan
> variasi dan volume data yang kompleks ketika diisi oleh ribuan alumni setiap
> tahunnya. Oleh karena itu, pendekatan analisis data secara statis
> (konvensional) tidak lagi memadai [9]. Variabel-variabel terstruktur seperti
> masa tunggu kerja, tingkat pendapatan, dan tingkat keselarasan inilah yang
> diekstraksi, ditransformasi, dan dimuat ke dalam gudang data bermodel
> multidimensi, sehingga pelaporan menurut berbagai kombinasi dimensi dapat
> dihasilkan melalui satu perintah kueri agregasi.

### 2.2.3 Subbab baru — Keselarasan Lulusan

**Sisipkan sebagai subbab tersendiri di bawah 2.2, sebelum 2.3.** Ini bagian
yang benar-benar belum ada. Tanpa subbab ini, dua grafik pada Bab 4 muncul tanpa
landasan teori.

> **2.2.x Keselarasan Lulusan (*Graduate Alignment*)**
>
> Keselarasan lulusan merupakan ukuran kesesuaian antara pendidikan yang
> ditempuh seorang lulusan dengan pekerjaan yang dijalaninya. Ukuran ini
> menempati posisi penting dalam evaluasi mutu pendidikan tinggi karena tingkat
> serapan kerja semata belum menggambarkan mutu penempatan lulusan; seorang
> lulusan dapat terserap cepat oleh pasar kerja namun bekerja pada bidang yang
> tidak berkaitan dengan disiplin ilmunya, atau pada tingkat pekerjaan yang
> berada di bawah jenjang pendidikannya [?].
>
> Dalam instrumen *Tracer Study* nasional, keselarasan diukur melalui dua
> dimensi yang berdiri sendiri, yaitu keselarasan horizontal dan keselarasan
> vertikal [?].
>
> **Keselarasan horizontal** mengukur keeratan hubungan antara bidang ilmu yang
> ditempuh dengan bidang pekerjaan yang dijalani. Pengukurannya dilakukan
> melalui persepsi responden pada skala ordinal lima tingkat, yaitu sangat erat,
> erat, cukup erat, kurang erat, dan tidak sama sekali. Untuk keperluan
> pelaporan agregat, kelima tingkat tersebut diringkas menjadi dua kategori:
> tiga tingkat teratas dikelompokkan sebagai selaras, sedangkan dua tingkat
> terbawah dikelompokkan sebagai tidak selaras.
>
> **Keselarasan vertikal** mengukur kesesuaian antara jenjang pendidikan yang
> dimiliki lulusan dengan tingkat pendidikan yang sesungguhnya dituntut oleh
> pekerjaannya. Pengukurannya dilakukan melalui empat pilihan jawaban, yaitu
> setingkat lebih tinggi, tingkat yang sama, setingkat lebih rendah, dan tidak
> perlu pendidikan tinggi. Keempat pilihan tersebut diringkas menjadi tiga
> kategori sebagaimana disajikan pada Tabel 2.x.
>
> Berbeda dengan keselarasan horizontal yang memiliki arah tunggal, keselarasan
> vertikal bersifat dua arah. Kategori **sama** merupakan keadaan yang
> diharapkan, yaitu ketika tuntutan pekerjaan setara dengan jenjang pendidikan
> yang dimiliki. Kategori **rendah** menunjukkan gejala *underemployment*, yaitu
> lulusan bekerja pada posisi yang sebenarnya tidak menuntut jenjang pendidikan
> setinggi yang telah ditempuhnya, sehingga terjadi ketidakefisienan pemanfaatan
> hasil pendidikan [?]. Sebaliknya, kategori **tinggi** menunjukkan bahwa
> pekerjaan menuntut jenjang pendidikan yang lebih tinggi daripada yang dimiliki
> lulusan. Kategori terakhir ini tidak dapat langsung dibaca sebagai keadaan
> yang buruk maupun baik, melainkan sebagai penanda bahwa lulusan menempati
> posisi yang menuntut kualifikasi di atas jenjangnya.
>
> **Tabel 2.x Pemetaan Jawaban Kuesioner ke Kategori Keselarasan**
>
> | Dimensi | Jawaban Responden | Kategori Agregat |
> |---|---|---|
> | Horizontal | Sangat erat | Selaras |
> | Horizontal | Erat | Selaras |
> | Horizontal | Cukup erat | Selaras |
> | Horizontal | Kurang erat | Tidak Selaras |
> | Horizontal | Tidak sama sekali | Tidak Selaras |
> | Vertikal | Setingkat lebih tinggi | Tinggi |
> | Vertikal | Tingkat yang sama | Sama |
> | Vertikal | Setingkat lebih rendah | Rendah |
> | Vertikal | Tidak perlu pendidikan tinggi | Rendah |
>
> Kedua pertanyaan keselarasan hanya diajukan kepada responden yang berstatus
> bekerja atau berwirausaha, mengikuti kaidah percabangan pada instrumen
> *Tracer Study*. Akibatnya, penyebut perhitungan persentase keselarasan adalah
> jumlah alumni yang bekerja, bukan seluruh alumni pada kohort yang diamati.
> Konsekuensi rancangan ini terhadap struktur gudang data dibahas pada
> subbab 2.3.3.

---

## 2.3.2 Online Analytical Processing (OLAP)

### 2.3.2.1 Tabel 2.2 — ganti seluruh isi

Tabel lama memuat lima contoh implementasi, **empat di antaranya merujuk pada
dimensi yang tidak dibangun**: fakultas, bulan kelulusan, program studi Teknik
Informatika, dan perusahaan multinasional. Tak satu pun ada di skema bintang.
Penguji yang membandingkan Tabel 2.2 dengan Bab 3 akan langsung melihatnya.

Tabel pengganti memakai dimensi yang benar-benar ada:

> **Tabel 2.2 Operasi Analitik Multidimensi OLAP pada Data *Tracer Study***
>
> | Operasi OLAP | Konsep Pemrosesan Data | Contoh Implementasi pada Sistem |
> |---|---|---|
> | *Roll-up* | Mengonsolidasi atau menaikkan tingkat hierarki dimensi untuk memperoleh gambaran yang lebih makro (agregasi). | Menaikkan rincian dimensi program studi dari tingkat spesialisasi menjadi tingkat program studi, sehingga grafik rata-rata masa tunggu disajikan per program studi. |
> | *Drill-down* | Membedah data agregat menjadi rincian yang lebih halus; kebalikan dari *roll-up*. | Membedah jumlah lulusan per program studi menjadi tabulasi silang program studi terhadap status kerja, sehingga tampak sebaran status pada tiap program studi. |
> | *Slice* | Memotong kubus data dengan menetapkan satu kondisi penyaringan pada satu dimensi, menghasilkan sub-kubus berdimensi lebih rendah. | Menyaring seluruh laporan dasbor pada dimensi waktu, yaitu hanya menampilkan lulusan pada jendela kohort TS-1 sampai TS-3. |
> | *Dice* | Memotong kubus data menggunakan lebih dari satu kondisi penyaringan pada dua dimensi atau lebih secara bersamaan. | Menampilkan metrik keselarasan horizontal untuk lulusan pada kohort TS-1 sampai TS-3 yang sekaligus berstatus bekerja atau berwirausaha. |
> | *Pivot* | Merotasi sumbu dimensi untuk memperoleh sudut pandang visual yang berbeda tanpa mengubah nilai datanya. | Menukar posisi sumbu program studi dengan sumbu kategori keselarasan pada tabulasi silang, sehingga perbandingan dapat dibaca dari dua arah. |

Perhatikan bahwa contoh *roll-up* memakai hierarki spesialisasi → program studi
yang memang ada pada `dim_program_studi`. Dimensi waktu juga menyediakan
hierarki tahun lulus → dekade pada kolom `dekade`, yang dapat Anda pakai sebagai
contoh kedua bila diperlukan.

### 2.3.2.2 Paragraf penutup — ganti isi paragraf [431]

> Melalui penerapan pemodelan multidimensi ini, analisis Indikator Kinerja Utama
> tidak lagi membutuhkan penarikan data mentah yang memakan waktu lama. Operasi
> OLAP memungkinkan dasbor sistem menyajikan tren masa tunggu kerja, persentase
> keselarasan horizontal dan vertikal, serta sebaran demografi karier alumni
> pada saat halaman dimuat, tanpa perlu menyusun rekapitulasi secara manual.

---

## 2.3.3 Pemodelan Multidimensi (Star Schema)

### 2.3.3.1 Gambar 2.1 — gambar ulang

Gambar sekarang menampilkan empat tabel dimensi. Gambar penggantinya harus
memuat **lima**:

```
                    ┌──────────────────┐
                    │    dim_waktu     │
                    │  waktu_key (PK)  │
                    │  tahun_lulus     │
                    │  dekade          │
                    └────────┬─────────┘
                             │
┌────────────────────┐       │       ┌──────────────────────────┐
│ dim_program_studi  │       │       │    dim_status_kerja      │
│  prodi_key (PK)    │       │       │  status_key (PK)         │
│  program_studi     │       │       │  status_bekerja          │
│  specialisasi      │       │       │  kategori_penghasilan    │
└─────────┬──────────┘       │       └────────────┬─────────────┘
          │                  │                    │
          └──────────┬───────┴────────────┬───────┘
                     │                    │
              ┌──────┴────────────────────┴──────┐
              │      fact_tracer_alumni          │
              │  fact_key         (PK)           │
              │  alumni_key       (FK)           │
              │  prodi_key        (FK)           │
              │  waktu_key        (FK)           │
              │  status_key       (FK)           │
              │  keselarasan_key  (FK, nullable) │
              │  ── measures ──                  │
              │  pengalaman_kerja                │
              │  ipk                             │
              │  masa_tunggu_bulan               │
              │  gaji_juta                       │
              └──────┬────────────────────┬──────┘
                     │                    │
          ┌──────────┴─────────┐   ┌──────┴──────────────────────────┐
          │    dim_alumni      │   │       dim_keselarasan           │
          │  alumni_key (PK)   │   │  keselarasan_key (PK)           │
          │  id_sumber         │   │  hubungan_bidang                │
          │  nama              │   │  kategori_horizontal            │
          │  gender            │   │  tingkat_pendidikan_sesuai      │
          │  jenjang           │   │  kategori_vertikal              │
          │  tahun_masuk       │   └─────────────────────────────────┘
          │  jabatan           │
          │  bidang_pekerjaan  │
          │  kesesuaian_bidang │
          │  tingkat_pendidikan_sesuai │
          └────────────────────┘
```

Bagan di atas untuk acuan menggambar, bukan untuk ditempel ke laporan. Gambar
di laporan harus dibuat dengan alat pemodelan yang sama seperti gambar lainnya.
Beri keterangan pada relasi `keselarasan_key` bahwa relasi tersebut **opsional**.

### 2.3.3.2 Tabel Fakta — ganti isi paragraf [440]

Paragraf lama menyebut tabel fakta memuat "skor tingkat keselarasan antara
bidang pekerjaan dengan program studi asal". **Tidak ada skor keselarasan di
tabel fakta.** Keselarasan adalah atribut kategorik yang disimpan pada tabel
dimensi, dan tabel fakta hanya menyimpan kunci tamunya. Membiarkan kalimat ini
berarti Bab 2 menjanjikan struktur yang tidak dibangun di Bab 3.

> **Tabel Fakta (*Fact Table*):** Merupakan entitas pusat dalam skema bintang
> yang menyimpan data kuantitatif, metrik pengukuran (*measures*), serta kunci
> tamu (*foreign key*) yang menghubungkannya dengan tabel-tabel dimensi. Data
> pada tabel ini umumnya bersifat numerik dan terus bertambah seiring
> berjalannya waktu operasional [20]. Pada sistem yang dirancang, tabel fakta
> `fact_tracer_alumni` memuat empat metrik, yaitu durasi masa tunggu kerja dalam
> satuan bulan, penghasilan pertama dalam satuan juta rupiah, indeks prestasi
> kumulatif, dan penanda pengalaman kerja semasa kuliah. Kelima kunci tamu pada
> tabel ini menghubungkannya dengan dimensi waktu, program studi, status kerja,
> alumni, dan keselarasan.
>
> Kunci tamu `keselarasan_key` dirancang bernilai boleh kosong (*nullable*),
> berbeda dengan empat kunci tamu lainnya yang wajib terisi. Perancangan ini
> merupakan konsekuensi langsung dari kaidah percabangan pada instrumen *Tracer
> Study*: pertanyaan keselarasan hanya diajukan kepada responden yang berstatus
> bekerja atau berwirausaha, sehingga baris fakta milik responden yang
> melanjutkan studi atau belum bekerja tidak memiliki pasangan pada dimensi
> keselarasan.

### 2.3.3.3 Tabel Dimensi — ganti isi paragraf [442]

Paragraf lama menyebut "dimensi kategori industri pekerjaan" yang tidak
dibangun. Ganti contohnya dengan yang benar:

> **Tabel Dimensi (*Dimension Table*):** Merupakan tabel pendukung yang berelasi
> langsung dengan tabel fakta. Tabel dimensi menyimpan atribut deskriptif atau
> konteks tekstual yang digunakan sistem OLAP untuk menyaring (*filtering*),
> mengelompokkan (*grouping*), dan memberi label sumbu pada visualisasi data.
> Tabel dimensi umumnya dirancang dengan tingkat denormalisasi yang tinggi guna
> mempercepat waktu eksekusi kueri [19]. Pada sistem yang dirancang terdapat
> lima tabel dimensi, yaitu dimensi waktu yang memuat tahun kelulusan beserta
> hierarki dekadenya, dimensi program studi yang memuat hierarki program studi
> dan spesialisasi, dimensi status kerja yang memuat lima kategori status
> beserta turunannya berupa kategori penghasilan, dimensi alumni yang memuat
> atribut identitas dan riwayat pekerjaan, serta dimensi keselarasan yang memuat
> kategori keselarasan horizontal dan vertikal.

### 2.3.3.4 Paragraf baru — dimensi terkonformasi

Sisipkan setelah paragraf [442], sebelum paragraf [444]. Ini menjawab
pertanyaan yang hampir pasti muncul saat sidang: mengapa keselarasan dijadikan
dimensi tersendiri, bukan sekadar kolom pada dimensi alumni.

> Di antara kelima tabel dimensi tersebut, `dim_keselarasan` memiliki sifat yang
> berbeda dari yang lain. Tabel ini tidak tumbuh mengikuti pertambahan data
> responden, melainkan berisi sejumlah baris tetap hasil perkalian silang antara
> lima tingkat keeratan hubungan bidang dengan empat pilihan tingkat pendidikan,
> yakni sebanyak dua puluh kombinasi. Tabel dimensi yang berisi himpunan
> kategori tetap semacam ini dikenal sebagai dimensi terkonformasi (*conformed
> dimension*), yaitu dimensi yang maknanya konsisten dan dapat digunakan
> bersama oleh lebih dari satu proses analisis [?].
>
> Pemisahan keselarasan menjadi dimensi tersendiri memberikan dua keuntungan.
> Pertama, pemetaan dari jawaban mentah responden ke kategori agregat
> sebagaimana disajikan pada Tabel 2.x tersimpan satu kali pada tabel dimensi,
> tidak diulang pada setiap baris fakta, sehingga perubahan kaidah pengelompokan
> cukup dilakukan pada satu tempat. Kedua, kedua kategori keselarasan dapat
> langsung dipakai sebagai sumbu pengelompokan pada kueri agregasi tanpa
> memerlukan perhitungan tambahan pada saat kueri dijalankan.

### 2.3.3.5 Paragraf penutup — sunting paragraf [444]

Paragraf lama diakhiri "...dapat disajikan dengan performa tinggi dan waktu
respons yang instan, meskipun sistem harus memproses volume data historis
kelulusan dalam skala yang masif." Dua masalah: kata "instan" dan klaim "skala
masif" yang tidak sesuai dengan data penelitian ini. Ganti kalimat penutupnya
menjadi:

> Hal ini menjaga waktu eksekusi kueri agregasi tetap rendah seiring
> bertambahnya volume data historis kelulusan dari tahun ke tahun.

---

## 2.4.4 PostgreSQL

**Kerjakan hanya bila migrasi jadi dilakukan.** Bila belum, biarkan subbab
MySQL apa adanya — jangan menulis PostgreSQL di Bab 2 sementara Bab 4 masih
melaporkan XAMPP.

Ganti judul subbab dari "MySQL" menjadi "PostgreSQL", lalu ganti kedua
paragrafnya.

**Paragraf pertama — pengganti [539]:**

> PostgreSQL merupakan *Object-Relational Database Management System* (ORDBMS)
> berbasis sumber terbuka yang menggunakan *Structured Query Language* (SQL)
> sebagai bahasa interaksi standarnya. Sistem ini mengelola data melalui tabel
> relasional dengan penerapan kaidah ACID untuk menjamin integritas dan
> konsistensi data, serta dikenal memiliki tingkat kepatuhan yang tinggi
> terhadap standar SQL [?].

**Paragraf kedua — pengganti [541]:**

Ini butir terpenting di Bab 2 untuk keperluan migrasi. Struktur argumen paragraf
lama dipertahankan, isinya diganti. Naskah berikut disalin dari rangkuman yang
sudah disiapkan pada `docs/rujukan-postgresql-data-warehouse.md` §6.3, dengan
seluruh kutipan berasal dari dokumentasi resmi PostgreSQL:

> Pemilihan PostgreSQL sebagai fondasi gudang data didasarkan pada kelengkapan
> dukungan operasi agregasi multidimensi yang tersedia secara bawaan. MySQL 8.0
> hanya menyediakan pengubah `WITH ROLLUP`, sedangkan PostgreSQL menyediakan
> `GROUPING SETS`, `ROLLUP`, dan `CUBE` sebagaimana dinyatakan dalam dokumentasi
> resminya, sehingga seluruh kombinasi dimensi dapat diperoleh melalui satu
> perintah kueri. PostgreSQL juga menyediakan partisi deklaratif dengan
> mekanisme *partition pruning* yang berjalan pada tahap perencanaan maupun
> tahap eksekusi kueri, serta indeks BRIN (*Block Range Index*) yang dirancang
> untuk tabel berukuran besar dengan korelasi alami antara nilai kolom dan letak
> fisik datanya. Ketiga kemampuan tersebut sejalan dengan watak tabel fakta pada
> skema bintang yang digunakan dalam penelitian ini, yaitu tabel yang tersusun
> menurut urutan waktu dan bertambah secara berkala.
>
> Pemilihan ini tidak menyatakan bahwa MySQL tidak dapat digunakan sebagai basis
> data gudang data, melainkan bahwa PostgreSQL menyediakan dukungan operasi OLAP
> secara bawaan dengan cakupan yang lebih lengkap. Perlu dicatat pula bahwa
> manfaat partisi dan indeks BRIN baru terukur pada tabel berukuran sangat
> besar; dokumentasi PostgreSQL menyebutkan bahwa ambang kelayakan partisi
> umumnya tercapai ketika ukuran tabel melampaui memori fisik peladen. Pada
> volume data penelitian ini, kedua kemampuan tersebut diterapkan sebagai
> rancangan yang menjamin skalabilitas, bukan sebagai optimasi yang telah
> terbukti secara terukur.

Paragraf kedua itu sengaja mengakui batasannya. Menyatakannya sendiri jauh lebih
kuat daripada menunggu penguji yang menemukannya.

---

## Rujukan yang harus Anda cari

Enam tanda **[?]** di atas. Saya tidak mengarang nomor rujukan.

**1. Konsep keselarasan lulusan (2 tempat: paragraf pembuka dan *underemployment*).**
Rujukan yang tepat adalah literatur *education–job mismatch* atau
*horizontal and vertical mismatch*. Istilah pencariannya: "horizontal vertical
education job mismatch graduates". Jangan pakai istilah "keselarasan" saja saat
mencari — literatur internasional memakai *mismatch*, bukan *alignment*.

**2. Instrumen *Tracer Study* nasional (1 tempat).**
Sumber primernya adalah kuesioner *Tracer Study* nasional Direktorat Jenderal
Pendidikan Tinggi. Kelima pilihan keeratan bidang dan keempat pilihan tingkat
pendidikan pada sistem Anda diambil persis dari instrumen itu. **Ini rujukan
yang paling penting** — ia membuktikan skala yang Anda pakai bukan karangan
sendiri. Cari dokumen panduan atau laman resminya, dan simpan tangkapan
layarnya.

**3. Dimensi terkonformasi (1 tempat).**
Istilah ini berasal dari Kimball. Rujukan bakunya *The Data Warehouse Toolkit*.
Perhatikan tahun terbitnya — edisi ketiga 2013, di luar jendela sepuluh tahun.
Bila pembimbing Anda menuntut sepuluh tahun terakhir, pakai [P3] Ramadhani dkk.
(2021) dari `docs/rujukan-postgresql-data-warehouse.md`, yang memang memakai
metode Kimball dan terbit di IEEE.

**4. Definisi PostgreSQL (1 tempat).**
Pakai [P4] Dombrovskaya dkk. (2024) atau [P5] Shaik (2020), keduanya sudah
terverifikasi metadatanya di `docs/rujukan-postgresql-data-warehouse.md`.

Untuk paragraf kedua 2.4.4, rujuk dokumentasi resmi PostgreSQL secara langsung.
Kutipan `GROUPING SETS`/`ROLLUP`/`CUBE`, *partition pruning*, dan BRIN semuanya
sudah diverifikasi dari manualnya dan tercatat lengkap beserta tautannya pada
`docs/rujukan-postgresql-data-warehouse.md` bagian 4.

---

## Rekapitulasi perubahan

| Lokasi | Perubahan | Alasan |
|---|---|---|
| Tabel 2.1 | +4 baris indikator | Empat kolom kuesioner baru belum terdaftar sebagai indikator |
| [388] | Ganti paragraf | Hapus "real-time"; hapus klaim *Data Cube* yang tidak diwujudkan |
| **2.2.x baru** | **Subbab baru + Tabel 2.x** | **Landasan teori keselarasan belum ada sama sekali** |
| Tabel 2.2 | Ganti 5 contoh implementasi | 4 dari 5 contoh merujuk dimensi yang tidak dibangun (fakultas, bulan kelulusan, prodi Teknik Informatika, perusahaan multinasional) |
| [431] | Ganti paragraf | Hapus "real-time"; tambah keselarasan |
| Gambar 2.1 | Gambar ulang | Dimensi bertambah dari 4 menjadi 5 |
| [440] | Ganti paragraf + tambah 1 paragraf | Hapus "skor keselarasan" yang tidak ada; jelaskan kunci tamu yang boleh kosong |
| [442] | Ganti paragraf | "dimensi kategori industri" tidak dibangun; sebut kelima dimensi yang benar |
| **baru** | **Paragraf dimensi terkonformasi** | **Menjawab "mengapa dimensi tersendiri?" sebelum ditanyakan** |
| [444] | Sunting kalimat penutup | Hapus "instan" dan klaim "skala masif" |
| 2.4.4 | Ganti judul + 2 paragraf | Migrasi PostgreSQL — hanya bila jadi dilakukan |

---

## Satu hal yang saya temukan di luar lingkup revisi

Nilai `program_studi` pada sistem adalah `Sci&Tech`, `Comm&Mgmt`, dan `Others`,
dengan spesialisasi `Mkt&HR` dan `Mkt&Fin`. Ini penamaan bawaan set data
simulasi, bukan nama program studi ULBI.

Akibatnya Tabel 2.2 lama yang mencontohkan "Program Studi Teknik Informatika"
tidak akan pernah cocok dengan tangkapan layar dasbor di Bab 4 — penguji yang
membandingkan keduanya akan bertanya. Pada naskah pengganti di atas saya sudah
menghindari penyebutan nama program studi tertentu, sehingga masalahnya tidak
muncul di Bab 2.

Namun ini tetap perlu Anda putuskan sebelum Bab 4 ditulis: apakah nilai program
studi akan dipetakan ulang ke nama program studi ULBI yang sebenarnya, atau
tetap memakai penamaan set data simulasi dengan penjelasan pada butir Ruang
Lingkup nomor 7. Keduanya bisa dipertahankan, tetapi harus dipilih sekarang
karena memengaruhi seluruh tangkapan layar di Bab 4.
