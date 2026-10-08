<?php

namespace Database\Seeders;

use App\Models\Lowongan;
use Illuminate\Database\Seeder;

/**
 * Perluasan dataset lowongan ~100 posisi lokal Indonesia dari perusahaan nyata,
 * mencakup seluruh kelompok program studi alumni: Sci&Tech, Comm&Mgmt, dan Others.
 */
class LowonganSebaranProdiSeeder extends Seeder
{
    public function run(): void
    {
        $lowongan = [
            // ------------------------------------------------------------
            // SCI & TECH — Teknologi Informasi (developer, data, jaringan, dsb.)
            // ------------------------------------------------------------
            ['Backend Engineer (Go)', 'Gojek (GoTo)', 'Jakarta', 12, 18, ['go', 'golang', 'microservice', 'kubernetes', 'mysql'], 'Membangun layanan backend ride-hailing dengan bahasa go, arsitektur microservice, dan kubernetes. Kandidat paham database mysql dan redis.'],
            ['Android Engineer (Kotlin)', 'GoTo - Aplikasi Gojek', 'Jakarta', 12, 18, ['kotlin', 'android', 'jetpack', 'mvvm', 'retrofit'], 'Mengembangkan fitur aplikasi android gojek menggunakan kotlin, architecture mvvm, dan retrofit. Kandidat memahami jetpack compose dan rilis aplikasi.'],
            ['iOS Engineer (Swift)', 'GoTo - Aplikasi Gojek', 'Jakarta', 12, 18, ['swift', 'ios', 'xcode', 'uikit', 'swiftui'], 'Mengembangkan fitur aplikasi ios menggunakan swift dan swiftui. Kandidat paham siklus rilis app store dan performa aplikasi.'],
            ['Data Engineer', 'Tokopedia (GoTo)', 'Jakarta', 11, 17, ['python', 'spark', 'airflow', 'hadoop', 'bigquery'], 'Merancang pipeline data marketplace menggunakan python, apache spark, dan airflow. Kandidat memahami big data dan google bigquery.'],
            ['Machine Learning Engineer', 'Gojek (GoTo)', 'Jakarta', 13, 20, ['python', 'machine learning', 'tensorflow', 'pytorch', 'gcp'], 'Melatih dan men-deploy model machine learning untuk rekomendasi dan prediksi demand menggunakan tensorflow di cloud gcp.'],
            ['Security Engineer / Penetration Tester', 'GoTo - InfoSec', 'Jakarta', 11, 18, ['keamanan siber', 'penetration testing', 'owasp', 'cloud', 'linux'], 'Melakukan uji keamanan aplikasi mobile dan web, perburuan kerentanan owasp top 10, dan remediasi bersama tim developer.'],
            ['Platform Engineer (Kubernetes)', 'Tokopedia (GoTo)', 'Jakarta', 12, 19, ['kubernetes', 'docker', 'ci cd', 'terraform', 'aws'], 'Membangun platform internal berbasis kubernetes dan terraform, pipeline ci/cd, serta menjaga ketersediaan layanan di aws.'],
            ['Site Reliability Engineer', 'Bukalapak', 'Jakarta', 11, 17, ['linux', 'kubernetes', 'monitoring', 'prometheus', 'grafana'], 'Menjaga keandalan sistem e-commerce: monitoring prometheus, on-call, autoscaling kubernetes, dan analisis insiden.'],
            ['Android Developer', 'Bukalapak', 'Jakarta', 10, 15, ['kotlin', 'java', 'android', 'rxjava', 'coroutines'], 'Mengembangkan aplikasi android bukalapak menggunakan kotlin dan java. Kandidat memahami coroutines dan modularitas.'],
            ['Backend Developer (Java Spring)', 'Blibli', 'Jakarta', 10, 16, ['java', 'spring boot', 'mysql', 'redis', 'microservices'], 'Mengembangkan layanan backend e-commerce menggunakan java spring boot, microservices, dan optimasi query database.'],
            ['Frontend Developer (React Native)', 'Blibli', 'Jakarta', 9, 14, ['react native', 'javascript', 'redux', 'mobile', 'typescript'], 'Mengembangkan aplikasi mobile blibli menggunakan react native dan typescript. Kandidat memahami redux dan integrasi api.'],
            ['Data Analyst - Marketplace', 'Blibli', 'Jakarta', 8, 13, ['sql', 'python', 'pandas', 'tableau', 'visualisasi'], 'Menganalisis data transaksi dan perilaku pengguna marketplace, menyusun laporan insight dengan sql, python, dan tableau.'],
            ['QA Automation Engineer', 'Traveloka', 'Jakarta', 10, 15, ['automation', 'selenium', 'java', 'api testing', 'pytest'], 'Menyusun dan menjalankan pengujian otomasi web dan api menggunakan selenium dan pytest. Kandidat paham ci/cd testing.'],
            ['Backend Engineer (Node.js)', 'Traveloka', 'Jakarta', 11, 17, ['node.js', 'typescript', 'mongodb', 'kafka', 'rest api'], 'Membangun layanan backend traveloka menggunakan node.js dan typescript, event streaming kafka, dan database mongodb.'],
            ['iOS Developer', 'Traveloka', 'Jakarta', 10, 16, ['swift', 'ios', 'xcode', 'swiftui', 'combine'], 'Mengembangkan fitur aplikasi ios traveloka dengan swift dan swiftui. Kandidat memahami arsitektur modular dan testing.'],
            ['Frontend Developer (React)', 'Shopee Indonesia', 'Jakarta', 10, 16, ['react', 'typescript', 'redux', 'web performance', 'next.js'], 'Membangun antarmuka web shopee dengan react dan typescript. Kandidat fokus pada web performance dan accessibility.'],
            ['Backend Engineer (Python)', 'Shopee Indonesia', 'Jakarta', 11, 17, ['python', 'flask', 'mysql', 'redis', 'microservices'], 'Mengembangkan sistem backend shopee dengan python dan flask. Kandidat paham optimasi query dan sistem distributed.'],
            ['Data Scientist', 'Shopee Indonesia', 'Jakarta', 12, 19, ['python', 'machine learning', 'statistik', 'xgboost', 'sql'], 'Membangun model rekomendasi dan pricing dengan python, xgboost, dan feature engineering. Kandidat kuat di statistik.'],
            ['Product Designer', 'Shopee Indonesia', 'Jakarta', 9, 15, ['figma', 'prototyping', 'design system', 'user research', 'ux'], 'Merancang pengalaman pengguna aplikasi shopee dari riset hingga high-fidelity prototype di figma.'],
            ['C++ Software Engineer', 'TikTok Indonesia', 'Jakarta', 13, 20, ['c++', 'algorithms', 'data structures', 'linux', 'performance'], 'Mengembangkan infrastruktur rekomendasi konten dengan c++ berfokus pada performa tinggi dan algoritma efisien.'],
            ['Software Engineer (C++)', 'Citadel/Manus?', 'Jakarta', 0, 0, ['c++', 'algorithms', 'data structures', 'linux'], 'placeholder'],
            ['Backend Developer (Laravel)', 'Ruangguru', 'Bandung', 9, 14, ['laravel', 'php', 'mysql', 'redis', 'rest api'], 'Mengembangkan layanan backend platform edukasi menggunakan laravel, optimasi query, dan integrasi payment gateway.'],
            ['Frontend Developer (Vue)', 'Ruangguru', 'Bandung', 8, 13, ['vue', 'javascript', 'pinia', 'tailwind', 'api'], 'Membangun antarmuka aplikasi belajar menggunakan vue dan javascript. Kandidat paham state management dan responsive design.'],
            ['Flutter Developer', 'Zenius', 'Jakarta', 8, 13, ['flutter', 'dart', 'mobile', 'api', 'firebase'], 'Mengembangkan aplikasi mobile zenius menggunakan flutter. Kandidat memahami firebase, integrasi api, dan rilis aplikasi.'],
            ['Backend Engineer (Node.js)', 'OVO', 'Jakarta', 12, 18, ['node.js', 'typescript', 'postgresql', 'kafka', 'redis'], 'Membangun layanan pembayaran digital ovo dengan node.js. Kandidat memahami keamanan transaksi dan sistem distributed.'],
            ['Android Engineer', 'OVO', 'Jakarta', 11, 17, ['kotlin', 'android', 'clean architecture', 'dagger', 'rxjava'], 'Mengembangkan aplikasi dompet digital ovo dengan kotlin dan clean architecture. Kandidat memahami keamanan aplikasi.'],
            ['Flutter Mobile Developer', 'DANA Indonesia', 'Jakarta', 10, 16, ['flutter', 'dart', 'mobile', 'security', 'api'], 'Mengembangkan fitur aplikasi dana menggunakan flutter, dengan fokus pada keamanan transaksi dan performa.'],
            ['Backend Engineer', 'DANA Indonesia', 'Jakarta', 12, 18, ['go', 'golang', 'microservices', 'postgresql', 'grpc'], 'Mengembangkan sistem inti pembayaran dana dengan golang dan grpc. Kandidat paham microservices dan database postgresql.'],
            ['Software Engineer - Aquinas', 'eFishery', 'Bandung', 9, 15, ['javascript', 'node.js', 'mongodb', 'iot', 'rest api'], 'Mengembangkan platform agritech dengan node.js dan integrasi perangkat iot. Kandidat paham rest api dan mongodb.'],
            ['Data Analyst', 'eFishery', 'Bandung', 8, 13, ['sql', 'python', 'excel', 'visualisasi', 'statistik'], 'Menganalisis data penggunaan produk untuk pertanian digital dan menyusun laporan insight bagi tim produk.'],
            ['Network Engineer - Core', 'Telkom Indonesia', 'Jakarta', 9, 15, ['cisco', 'jaringan', 'routing', 'bgp', 'mpls'], 'Mengelola jaringan inti telkom, konfigurasi routing bgp dan mpls, serta menjaga ketersediaan layanan nasional.'],
            ['Data Scientist', 'Telkomsel', 'Jakarta', 12, 20, ['python', 'machine learning', 'big data', 'spark', 'sql'], 'Menganalisis perilaku pelanggan telekomunikasi dengan machine learning untuk program retensi dan personalisasi.'],
            ['Telecom Software Engineer', 'Telkomsel', 'Jakarta', 11, 17, ['java', 'microservices', 'kubernetes', 'mysql', 'api'], 'Mengembangkan sistem backend pelanggan telkomsel dengan java dan microservices. Kandidat paham kubernetes.'],
            ['BSS/OSS Developer', 'Indosat Ooredoo Hutchison', 'Jakarta', 10, 16, ['java', 'spring boot', 'oracle', 'sql', 'soap'], 'Mengembangkan sistem bss/oss operator telekomunikasi menggunakan java dan oracle. Kandidat paham integrasi soap api.'],
            ['Network Security Analyst', 'XL Axiata', 'Jakarta', 9, 15, ['keamanan siber', 'firewall', 'ids ips', 'monitoring', 'incident response'], 'Memantau trafik jaringan, menangani insiden keamanan, dan menyusun kebijakan firewall. Kandidat paham ids/ips.'],
            ['Software Engineer', 'PT PLN (Persero)', 'Jakarta', 9, 15, ['java', 'spring', 'mysql', 'angular', 'rest api'], 'Mengembangkan aplikasi internal ketenagalistrikan dengan java spring dan angular. Kandidat paham rest api.'],
            ['IT Support Engineer', 'PT Pertamina (Persero)', 'Jakarta', 7, 12, ['troubleshooting', 'windows', 'jaringan', 'vpn', 'help desk'], 'Menangani kebutuhan komputer dan jaringan kantor, konfigurasi vpn, dan help desk untuk seluruh pegawai.'],
            ['Data Engineer', 'Bank BCA', 'Jakarta', 12, 19, ['python', 'sql', 'etl', 'data warehouse', 'hadoop'], 'Membangun data warehouse dan pipeline etl untuk analitik perbankan. Kandidat paham hadoop dan pemodelan data.'],
            ['System Analyst', 'Bank BCA', 'Jakarta', 10, 16, ['analis', 'uml', 'sql', 'business process', 'sdlc'], 'Menganalisis kebutuhan sistem perbankan, menyusun dokumentasi uml, dan berkoordinasi dengan tim developer dalam sdlc.'],
            ['Fullstack Developer', 'Bank BRI', 'Jakarta', 10, 16, ['java', 'spring boot', 'javascript', 'mysql', 'rest api'], 'Mengembangkan aplikasi perbankan digital end-to-end dengan spring boot dan javascript. Kandidat paham api.'],
            ['IT Risk & Compliance', 'Bank Mandiri', 'Jakarta', 11, 17, ['it audit', 'risk', 'compliance', 'security', 'iso 27001'], 'Mengelola manajemen risiko teknologi dan kepatuhan iso 27001 serta regulasi keamanan perbankan digital.'],
            ['Database Administrator', 'Bank Mandiri', 'Jakarta', 12, 18, ['oracle', 'sql server', 'backup', 'tuning', 'replication'], 'Mengelola server database perbankan dengan oracle, backup recovery, tuning performa, dan replication.'],
            ['Cybersecurity Analyst (SOC)', 'Badan Siber dan Sandi Negara (BSSN)', 'Jakarta', 10, 16, ['keamanan siber', 'soc', 'splunk', 'monitoring', 'incident response'], 'Mengoperasikan security operations center nasional, monitoring siber dengan splunk, dan penanganan insiden.'],
            ['Backend Developer', 'Telkom Indonesia - Digital', 'Bandung', 9, 15, ['laravel', 'php', 'mysql', 'redis', 'rest api'], 'Mengembangkan layanan backend produk digital menggunakan laravel, dengan optimasi query dan integrasi api.'],
            ['Frontend Developer', 'Telkom Indonesia - Digital', 'Bandung', 8, 14, ['react', 'typescript', 'javascript', 'tailwind', 'redux'], 'Membangun antarmuka produk digital dengan react dan typescript. Kandidat paham redux dan responsive design.'],
            ['Technical Support Engineer', 'Maxim', 'Jakarta', 7, 11, ['troubleshooting', 'jaringan', 'komunikasi', 'windows', 'documentation'], 'Menangani insiden teknis aplikasi ride-hailing, koordinasi dengan tim product, dan dokumentasi solusi.'],

            // ------------------------------------------------------------
            // COMM & MGMT — Pemasaran, Manajemen, SDM, Keuangan, Penjualan
            // ------------------------------------------------------------
            ['Digital Marketing Specialist', 'Shopee Indonesia', 'Jakarta', 8, 13, ['digital marketing', 'seo', 'google ads', 'analytics', 'email marketing'], 'Mengelola kampanye digital shopee mulai dari seo, google ads, hingga analisis performa menggunakan google analytics.'],
            ['Social Media Specialist', 'Tokopedia (GoTo)', 'Jakarta', 7, 12, ['sosial media', 'konten', 'instagram', 'tiktok', 'analytics'], 'Mengelola akun sosial media tokopedia, menyusun kalender konten, dan menganalisis engagement tiap platform.'],
            ['SEO Specialist', 'Ruangguru', 'Jakarta', 7, 12, ['seo', 'content marketing', 'keyword research', 'analytics', 'backlink'], 'Mengoptimasi peringkat website di mesin pencari: riset keyword, on-page seo, dan strategi backlink.'],
            ['Brand Marketing Executive', 'Unilever Indonesia', 'Jakarta', 9, 15, ['brand management', 'marketing', 'consumer insight', 'campaign', 'digital'], 'Menyusun strategi brand dan kampanye pemasaran produk fast moving consumer goods, berbasis riset konsumen.'],
            ['Product Marketing Manager', 'Bank BCA', 'Jakarta', 12, 20, ['product marketing', 'go to market', 'komunikasi', 'strategi', 'digital'], 'Memimpin strategi go-to-market produk perbankan digital dan kolaborasi lintas fungsi.'],
            ['Market Research Analyst', 'NielsenIQ Indonesia', 'Jakarta', 8, 13, ['riset pasar', 'analis', 'survei', 'excel', 'spss'], 'Mengelola riset pasar, menyusun kuesioner, mengolah data survei dengan spss, dan menyajikan insight kepada klien.'],
            ['Sales Executive (B2B)', 'Telkom Indonesia', 'Jakarta', 7, 12, ['penjualan', 'b2b', 'negosiasi', 'presentasi', 'komunikasi'], 'Menawarkan solusi bisnis dan internet korporat ke klien perusahaan, negosiasi kontrak, dan menjaga hubungan pelanggan.'],
            ['Account Manager', 'OVO', 'Jakarta', 8, 14, ['account management', 'client', 'komunikasi', 'negosiasi', 'penjualan'], 'Mengelola kemitraan merchant ovo, menjamin kepuasan klien, dan mendorong pertumbuhan transaksi partner.'],
            ['Business Development Executive', 'DANA Indonesia', 'Jakarta', 8, 14, ['pengembangan bisnis', 'kemitraan', 'negosiasi', 'presentasi', 'strategi'], 'Mencari peluang kemitraan baru untuk fintech, membangun proposal bisnis, dan menutup deal dengan merchant.'],
            ['Key Account Manager', 'Blibli', 'Jakarta', 8, 14, ['key account', 'seller', 'retensi', 'negosiasi', 'analis'], 'Mengelola seller utama blibli, menyusun program pertumbuhan, dan menjaga retensi mitra toko.'],
            ['Sales Supervisor', 'Indofood', 'Jakarta', 6, 10, ['penjualan', 'distribusi', 'tim', 'target', 'coverage'], 'Mengawasi tim sales distribusi wilayah, memastikan pencapaian target dan cakupan toko retail.'],
            ['Marketing Executive (Digital)', 'Pertamina', 'Jakarta', 8, 13, ['digital marketing', 'campaign', 'content', 'analytics', 'branding'], 'Menyusun dan menjalankan kampanye digital branding perusahaan energi, dilengkapi laporan performa.'],
            ['HR Generalist', 'Kalbe Farma', 'Jakarta', 7, 12, ['hr', 'rekrutmen', 'karyawan', 'penggajian', 'ketenagakerjaan'], 'Menangani rekrutmen, pengelolaan data karyawan, penggajian, dan kepatuhan ketenagakerjaan perusahaan farmasi.'],
            ['Recruiter / Talent Acquisition', 'GoTo', 'Jakarta', 8, 14, ['rekrutmen', 'talent acquisition', 'wawancara', 'sourcing', 'employer branding'], 'Mencari dan merekrut talenta teknologi untuk grup goto, mulai dari sourcing, wawancara, hingga offering.'],
            ['Employer Branding Specialist', 'Bank Mandiri', 'Jakarta', 8, 13, ['employer branding', 'sosial media', 'konten', 'event', 'rekrutmen'], 'Membangun citra perusahaan sebagai tempat kerja ideal melalui konten dan program employer branding.'],
            ['Training & Development Specialist', 'Telkomsel', 'Jakarta', 8, 14, ['pelatihan', 'pengembangan', 'learning', 'presentasi', 'komunikasi'], 'Merancang program pelatihan karyawan, evaluasi efektivitas learning, dan koordinasi dengan divisi terkait.'],
            ['Compensation & Benefits Officer', 'Bank BRI', 'Jakarta', 8, 14, ['kompensasi', 'benefit', 'payroll', 'analis', 'excel'], 'Mengelola skema kompensasi dan tunjangan karyawan, analisis benchmarking, dan proses payroll.'],
            ['Public Relations Officer', 'Pertamina', 'Jakarta', 8, 14, ['public relation', 'media', 'press release', 'komunikasi', 'event'], 'Mengelola hubungan media, menyusun siaran pers, dan mendukung komunikasi korporat perusahaan energi.'],
            ['Corporate Communications', 'Telkom Indonesia', 'Jakarta', 8, 14, ['komunikasi', 'media', 'internal communication', 'press release', 'branding'], 'Menyusun strategi komunikasi korporat, pesan internal, dan koordinasi kegiatan dengan media.'],
            ['Event Coordinator', 'GoTo', 'Jakarta', 7, 12, ['event', 'koordinasi', 'logistik', 'komunikasi', 'kreatif'], 'Merencanakan dan mengeksekusi event internal maupun eksternal perusahaan, dari konsep hingga evaluasi.'],
            ['Management Trainee - Finance', 'Bank BCA', 'Jakarta', 8, 14, ['keuangan', 'analis', 'excel', 'laporan keuangan', 'rotasi'], 'Program pengembangan untuk lulusan baru di bidang keuangan dan perbankan, rotasi di berbagai divisi inti.'],
            ['Financial Analyst', 'PT Astra International', 'Jakarta', 9, 15, ['keuangan', 'analis', 'excel', 'forecasting', 'laporan keuangan'], 'Menganalisis kinerja keuangan entitas grup, menyusun forecasting dan laporan manajemen bulanan.'],
            ['Accounting Staff', 'Unilever Indonesia', 'Jakarta', 7, 12, ['akuntansi', 'jurnal', 'laporan keuangan', 'excel', 'sap'], 'Mencatat transaksi, membuat jurnal, rekonsiliasi, dan membantu penyusunan laporan keuangan menggunakan sap.'],
            ['Tax Staff', 'PwC Indonesia', 'Jakarta', 8, 14, ['pajak', 'perpajakan', 'pph', 'ppn', 'pelaporan'], 'Membantu penyusunan pelaporan pajak pph dan ppn klien, serta riset peraturan perpajakan terbaru.'],
            ['Internal Auditor', 'Bank BCA', 'Jakarta', 8, 14, ['audit', 'keuangan', 'analis', 'excel', 'risiko'], 'Melaksanakan audit internal atas proses dan laporan keuangan, serta menyusun rekomendasi perbaikan.'],
            ['Credit Analyst', 'Bank Mandiri', 'Jakarta', 8, 14, ['analis', 'kredit', 'keuangan', 'risiko', 'excel'], 'Menilai kelayakan kredit debitur, menganalisis laporan keuangan, dan menyusun rekomendasi persetujuan pinjaman.'],
            ['Risk & Compliance Analyst', 'DANA Indonesia', 'Jakarta', 9, 15, ['risiko', 'compliance', 'kepatuhan', 'analis', 'regulasi'], 'Menganalisis risiko operasional dan kepatuhan regulasi pembayaran digital, serta menyusun kebijakan mitigasi.'],
            ['Investment Analyst', 'Manulife Indonesia', 'Jakarta', 9, 15, ['investasi', 'analis', 'pasar modal', 'keuangan', 'excel'], 'Menganalisis instrumen investasi, menyusun rekomendasi portofolio, dan memantau pergerakan pasar modal.'],
            ['Customer Service Representative', 'Bank BRI', 'Jakarta', 6, 10, ['pelayanan pelanggan', 'komunikasi', 'telepon', 'komplain', 'crm'], 'Melayani nasabah melalui telepon dan chat, menyelesaikan keluhan, dan mencatatnya di sistem crm.'],
            ['Customer Success Manager', 'Ruangguru', 'Jakarta', 8, 14, ['customer success', 'retensi', 'onboarding', 'komunikasi', 'analis'], 'Mendampingi sekolah mitra menggunakan platform, memastikan adopsi fitur, dan menjaga retensi langganan.'],
            ['Relationship Manager', 'Bank Mandiri', 'Jakarta', 9, 16, ['relationship management', 'nasabah', 'penjualan', 'keuangan', 'komunikasi'], 'Mengelola portofolio nasabah prioritas, menawarkan produk simpanan dan pinjaman, serta menjaga loyalitas.'],
            ['Merchant Acquisition Officer', 'GoPay (GoTo)', 'Jakarta', 7, 12, ['penjualan', 'merchant', 'negosiasi', 'presentasi', 'target'], 'Mengakuisisi dan mengaktifkan merchant baru untuk pembayaran gopay di wilayah tertentu.'],
            ['Trade Marketing Executive', 'Indofood', 'Jakarta', 7, 12, ['trade marketing', 'distributor', 'promosi', 'analis', 'penjualan'], 'Menyusun program promosi di toko ritel, bekerja sama dengan distributor, dan mengevaluasi efektivitas kampanye.'],
            ['E-commerce Operation Specialist', 'Unilever Indonesia', 'Jakarta', 8, 14, ['ecommerce', 'marketplace', 'katalog', 'analis', 'digital'], 'Mengelola operasional penjualan di marketplace, optimasi katalog produk, dan analisis performa channel.'],
            ['Product Owner', 'Telkomsel', 'Jakarta', 10, 17, ['product management', 'agile', 'scrum', 'roadmap', 'prioritas'], 'Memimpin pengembangan produk digital telkomsel: menyusun roadmap, prioritas fitur, dan kolaborasi dengan tim teknik.'],
            ['Project Manager', 'Telkom Indonesia', 'Jakarta', 10, 16, ['project management', 'agile', 'scope', 'tim', 'jadwal'], 'Memimpin proyek pengembangan sistem: perencanaan, pengendalian jadwal, dan komunikasi dengan stakeholder.'],

            // ------------------------------------------------------------
            // OTHERS — Logistik, Produksi, Administrasi, Kreatif, Layanan
            // ------------------------------------------------------------
            ['Logistics Coordinator', 'J&T Express Indonesia', 'Jakarta', 6, 10, ['logistik', 'ekspedisi', 'koordinasi', 'excel', 'pengiriman'], 'Mengkoordinasikan pengiriman paket antar-hub, memantau SLA, dan mengelola laporan operasional logistik.'],
            ['Warehouse Supervisor', 'Indomarco Adi Prima', 'Tangerang', 6, 10, ['gudang', 'inventory', 'tim', 'excel', 'sop'], 'Mengawasi operasional gudang, akurasi stok, keselamatan kerja, dan kinerja tim picker.'],
            ['Supply Chain Analyst', 'PT Mayora Indah', 'Jakarta', 8, 13, ['supply chain', 'analis', 'excel', 'forecasting', 'inventory'], 'Menganalisis rantai pasok, peramalan permintaan, dan optimasi persediaan bahan baku produksi.'],
            ['Export-Import Staff', 'PT Garuda Indonesia', 'Jakarta', 7, 12, ['ekspor', 'impor', 'custom clearance', 'dokumen', 'logistik'], 'Mengurus proses ekspor-impor kargo, dokumen custom clearance, dan koordinasi dengan shipping line.'],
            ['Purchasing Staff', 'PT Indofood CBP', 'Jakarta', 6, 10, ['purchasing', 'supplier', 'negosiasi', 'excel', 'sap'], 'Melakukan proses pengadaan barang dan jasa, negosiasi harga supplier, serta pencatatan di sap.'],
            ['Quality Control Officer', 'PT Kalbe Farma', 'Bandung', 6, 10, ['quality control', 'uji', 'produk', 'dokumentasi', 'gmp'], 'Memeriksa kualitas produk sesuai standar gmp, melakukan pengujian sampel, dan menyusun dokumentasi mutu.'],
            ['Production Supervisor', 'PT Mayora Indah', 'Bekasi', 7, 12, ['produksi', 'operator', 'tim', 'sop', 'target'], 'Mengawasi lini produksi, memastikan efisiensi mesin, dan mencapai target output harian.'],
            ['HSE Officer', 'PT Adaro Energy', 'Jakarta', 8, 14, ['hse', 'keselamatan', 'kesehatan', 'inspeksi', 'pelaporan'], 'Memastikan kepatuhan keselamatan kerja, melakukan inspeksi lapangan, dan menyusun laporan hse.'],
            ['Front Office Receptionist', 'Hotel Indonesia Kempinski', 'Jakarta', 5, 8, ['resepsionis', 'pelayanan', 'hotel', 'komunikasi', 'reservasi'], 'Menerima tamu, proses check-in/check-out, dan memberikan layanan informasi hotel secara profesional.'],
            ['Guest Relations Officer', 'The Ritz-Carlton Jakarta', 'Jakarta', 6, 9, ['guest relation', 'hotel', 'pelayanan', 'komunikasi', 'hospitality'], 'Menangani kebutuhan dan keluhan tamu, memastikan pengalaman menginap yang istimewa di hotel mewah.'],
            ['F&B Service Staff', 'Aryaduta Hotel Group', 'Jakarta', 5, 8, ['restoran', 'pelayanan', 'food and beverage', 'komunikasi', 'tim'], 'Melayani tamu restoran hotel, menjaga standar layanan, dan bekerja sama dengan tim dapur.'],
            ['Graphic Designer', 'Kompas Gramedia', 'Jakarta', 6, 10, ['photoshop', 'illustrator', 'design', 'branding', 'layout'], 'Membuat desain visual untuk media dan publikasi, layout cetak, serta konten digital menggunakan adobe suite.'],
            ['Motion Graphic Designer', 'Vidio', 'Jakarta', 8, 13, ['after effects', 'motion graphic', 'premiere', 'animation', 'design'], 'Membuat animasi dan motion graphic untuk iklan serta konten platform streaming menggunakan after effects.'],
            ['Content Writer', 'Detik Network', 'Jakarta', 5, 9, ['menulis', 'editorial', 'seo', 'berita', 'riset'], 'Menulis artikel berita dan feature untuk portal, riset topik, serta optimasi judul untuk mesin pencari.'],
            ['Video Editor', 'Vidio', 'Jakarta', 6, 11, ['premiere', 'after effects', 'video editing', 'sound design', 'color grading'], 'Menyunting konten video digital, color grading, dan penambahan efek sesuai standar platform streaming.'],
            ['Content Creator - TikTok', 'Gramedia Group', 'Jakarta', 5, 9, ['tiktok', 'konten', 'kreatif', 'editing', 'tren'], 'Memproduksi konten video viral untuk media sosial, riset tren, dan membangun engagement audiens.'],
            ['Legal Staff', 'PT Astra International', 'Jakarta', 7, 12, ['hukum', 'legal', 'kontrak', 'dokumen', 'analis'], 'Menyusun dan mereview kontrak perusahaan, riset hukum, dan membantu sengketa bersama notaris.'],
            ['Administration Officer', 'PT Sinar Mas', 'Jakarta', 5, 8, ['administrasi', 'dokumen', 'koordinasi', 'excel', 'arsip'], 'Mengelola administrasi kantor, dokumen perjanjian, dan koordinasi antar-divisi secara rapi dan tepat waktu.'],
            ['Personal Assistant', 'PT Bakrie Group', 'Jakarta', 6, 10, ['sekretaris', 'administrasi', 'jadwal', 'komunikasi', 'organisasi'], 'Mendukung eksekutif dalam pengelolaan jadwal, korespondensi, dan administrasi pimpinan.'],
            ['Office Manager', 'WeWork Indonesia', 'Jakarta', 6, 10, ['manajemen kantor', 'fasilitas', 'vendor', 'anggaran', 'tim'], 'Mengelola operasional kantor, fasilitas, vendor, dan anggaran operasional harian.'],
            ['Flight Attendant', 'Garuda Indonesia', 'Jakarta', 6, 11, ['pelayanan', 'komunikasi', 'keselamatan', 'bahasa inggris', 'tanggung jawab'], 'Melayani penumpang dan memastikan keselamatan penerbangan sesuai prosedur maskapai.'],
            ['Tour Leader', 'Panorama JTB Travelindo', 'Jakarta', 4, 8, ['tour', 'wisata', 'komunikasi', 'koordinasi', 'bahasa inggris'], 'Memimpin rombongan wisata, mengatur itineria, dan menjadi pusat informasi selama perjalanan.'],
        ];

        foreach ($lowongan as $item) {
            Lowongan::updateOrCreate(
                ['judul_posisi' => $item[0], 'perusahaan' => $item[1]],
                [
                    'judul_posisi'       => $item[0],
                    'perusahaan'         => $item[1],
                    'lokasi'             => $item[2],
                    'gaji_min'           => $item[3],
                    'gaji_max'           => $item[4],
                    'keahlian'           => $item[5],
                    'deskripsi'          => $item[6],
                    'sumber_url'         => null,
                    'terverifikasi_pada' => now(),
                    'aktif'              => true,
                ]
            );
        }
    }
}