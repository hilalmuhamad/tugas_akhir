<!DOCTYPE html>
<html lang="id">
<head>
<meta charset="UTF-8">
<style>
    * { font-family: "DejaVu Sans", sans-serif; }
    body { font-size: 10.5px; color: #1f2937; line-height: 1.55; }
    h1 { font-size: 22px; color: #1e3a8a; margin: 0 0 4px 0; }
    h2 { font-size: 14px; color: #ffffff; background: #1e3a8a; padding: 6px 10px; margin: 22px 0 10px 0; border-radius: 3px; }
    h3 { font-size: 12px; color: #1e3a8a; margin: 14px 0 6px 0; }
    p { margin: 6px 0; text-align: justify; }
    .cover { text-align: center; padding-top: 140px; }
    .cover .kampus { font-size: 13px; color: #6b7280; letter-spacing: 2px; }
    .cover .judul { font-size: 26px; font-weight: bold; color: #1e3a8a; margin: 26px 0 6px 0; }
    .cover .sub { font-size: 12px; color: #374151; }
    .cover .meta { margin-top: 46px; font-size: 11px; color: #374151; }
    .page-break { page-break-before: always; }
    table { width: 100%; border-collapse: collapse; margin: 8px 0 4px 0; font-size: 9.5px; }
    th { background: #e8edf7; color: #1e3a8a; font-weight: bold; padding: 5px 6px; border: 1px solid #c7d2e5; text-align: left; }
    td { padding: 4px 6px; border: 1px solid #d8dee9; }
    tr.alt td { background: #f7f9fc; }
    .right { text-align: right; }
    .center { text-align: center; }
    .kpi { margin: 10px 0; }
    .kpi td { padding: 7px 8px; font-size: 10.5px; }
    .kpi .label { background: #f7f9fc; width: 55%; font-weight: bold; }
    .note { font-size: 8.5px; color: #6b7280; margin-top: 2px; }
    .rekom { margin: 4px 0 4px 16px; }
    .rekom li { margin-bottom: 6px; }
</style>
</head>
<body>

{{-- ======================= HALAMAN SAMPUL ======================= --}}
<div class="cover">
    <p class="kampus">CAREER DEVELOPMENT CENTER</p>
    <h1 style="font-size:26px; margin-top:30px;">SMART CAREER MATCHING ALUMNI</h1>
    <p class="judul">LAPORAN TRACER STUDY ALUMNI</p>
    <p class="sub">Survei {{ $tahunSurvei }}</p>
    <p class="sub">Disusun untuk bahan evaluasi dan pemantauan Staf Career Development</p>
    <p class="meta">
        Tanggal pembuatan: {{ $waktu }}<br>
        Sumber data: view OLAP PostgreSQL (skema bintang tracer study)
    </p>
</div>

{{-- ======================= RINGKASAN EKSEKUTIF ======================= --}}
<div class="page-break"></div>
<h2>1. RINGKASAN EKSEKUTIF</h2>
<p>
    Laporan ini menyajikan hasil pelacakan (tracer study) untuk Survei {{ $tahunSurvei }}
    terhadap alumni yang tercatat dalam dataset tracer study. Seluruh angka pada laporan ini
    dihasilkan langsung oleh view OLAP PostgreSQL sehingga identik dengan angka yang tampil
    di dashboard admin.
</p>
<table class="kpi">
    <tr><td class="label">Total alumni dalam dataset</td><td class="right"><strong>{{ $summary->total_alumni }}</strong> alumni</td></tr>
    <tr><td class="label">Alumni bekerja</td><td class="right"><strong>{{ $summary->alumni_bekerja }}</strong> alumni ({{ $summary->persentase_bekerja }}%)</td></tr>
    <tr><td class="label">Alumni tidak bekerja</td><td class="right"><strong>{{ $summary->alumni_tidak_bekerja }}</strong> alumni</td></tr>
    <tr><td class="label">Rata-rata IPK</td><td class="right">{{ $summary->rata_rata_ipk }}</td></tr>
    <tr><td class="label">Rata-rata masa tunggu kerja pertama</td><td class="right">{{ $summary->rata_rata_masa_tunggu }} bulan</td></tr>
    <tr><td class="label">Rata-rata gaji bulanan</td><td class="right">{{ $summary->rata_rata_gaji }} juta rupiah</td></tr>
</table>
<p>
    Cakupan kohort Survei {{ $tahunSurvei }} terdiri atas:
</p>
<table>
    <thead>
        <tr>
            <th>Cohort</th>
            <th class="right">Tahun Lulus</th>
            <th class="right">Jumlah Alumni</th>
        </tr>
    </thead>
    <tbody>
        @foreach ($tahunLulus as $i => $row)
        <tr class="{{ $i % 2 ? 'alt' : '' }}">
            <td>{{ $row->cohort }}</td>
            <td class="right">{{ $row->tahun_lulus }}</td>
            <td class="right">{{ $row->jumlah_alumni }}</td>
        </tr>
        @endforeach
    </tbody>
</table>
<p class="note">
    Laporan menampilkan jumlah alumni yang tercatat dalam dataset tracer study untuk
    Survei {{ $tahunSurvei }}. Persentase cakupan terhadap seluruh populasi lulusan tidak
    dihitung karena denominator populasi target tidak tersedia dalam model OLAP.
</p>

{{-- ======================= METODOLOGI DAN DEFINISI ======================= --}}
<h2>2. METODOLOGI DAN DEFINISI</h2>
<h3>2.1. Sasaran dan Jendela Kohort</h3>
<p>
    Sasaran tracer study Survei {{ $tahunSurvei }} adalah alumni yang tercatat dalam dataset
    pada jendela cohort survei, yaitu lulusan dua tahun sebelum tahun survei (TS-1 dan TS-2).
    Data seluruhnya diagregasi oleh view OLAP PostgreSQL berdasarkan tahun_survei.
</p>
<h3>2.2. Definisi Responden</h3>
<p>
    Alumni yang termasuk dalam laporan ini adalah alumni yang terdata pada tabel fakta
    tracer study untuk Survei {{ $tahunSurvei }}. Persentase cakupan terhadap seluruh
    populasi lulusan tidak dihitung karena denominator populasi target tidak tersedia dalam
    model OLAP.
</p>
<h3>2.3. Metode Analisis</h3>
<p>
    Data dianalisis secara deskriptif-kuantitatif. Seluruh agregasi (penghitungan jumlah,
    rata-rata, dan persentase) dikerjakan di sisi basis data PostgreSQL melalui view OLAP,
    sehingga hasilnya terukur dan dapat ditelusuri ulang dari dashboard admin.
</p>

{{-- ======================= PROFIL ALUMNI PER PRODI ======================= --}}
<h2>3. PROFIL ALUMNI PER PROGRAM STUDI</h2>
<p>
    Tabel berikut menampilkan jumlah alumni dalam dataset OLAP per program studi dan per
    tahun lulus sebagai indikator awal evaluasi penelusuran alumni.
</p>
<table>
    <thead>
        <tr>
            <th>Cohort</th>
            <th class="right">Tahun Lulus</th>
            <th>Program Studi</th>
            <th class="right">Jumlah Alumni</th>
        </tr>
    </thead>
    <tbody>
        @foreach ($programStudi as $i => $row)
        <tr class="{{ $i % 2 ? 'alt' : '' }}">
            <td>{{ $row->cohort }}</td>
            <td class="right">{{ $row->tahun_lulus }}</td>
            <td>{{ $row->program_studi }}</td>
            <td class="right">{{ $row->jumlah_alumni }}</td>
        </tr>
        @endforeach
    </tbody>
</table>

{{-- ======================= STATUS PEKERJAAN ======================= --}}
<h2>4. STATUS PEKERJAAN ALUMNI</h2>
<h3>4.1. Gambaran Keseluruhan</h3>
<p>
    Sebanyak <strong>{{ $summary->alumni_bekerja }} alumni ({{ $summary->persentase_bekerja }}%)</strong>
    dari {{ $summary->total_alumni }} alumni dalam dataset telah bekerja, sedangkan
    <strong>{{ $summary->alumni_tidak_bekerja }} alumni</strong> tidak bekerja. Distribusi
    ini menjadi indikator output pendidikan sekaligus dasar penyusunan program pembinaan
    karier bagi alumni.
</p>
<h3>4.2. Status Kerja per Cohort dan Tahun Lulus</h3>
<table>
    <thead>
        <tr>
            <th>Cohort</th>
            <th class="right">Tahun Lulus</th>
            <th class="right">Jumlah Alumni</th>
            <th class="right">Bekerja</th>
            <th class="right">Tidak Bekerja</th>
            <th class="right">Persentase Bekerja</th>
        </tr>
    </thead>
    <tbody>
        @foreach ($statusKerja as $i => $row)
        <tr class="{{ $i % 2 ? 'alt' : '' }}">
            <td>{{ $row->cohort }}</td>
            <td class="right">{{ $row->tahun_lulus }}</td>
            <td class="right">{{ $row->jumlah_alumni }}</td>
            <td class="right">{{ $row->bekerja }}</td>
            <td class="right">{{ $row->tidak_bekerja }}</td>
            <td class="right">{{ $row->persentase_bekerja }}%</td>
        </tr>
        @endforeach
    </tbody>
</table>

{{-- ======================= WAKTU TUNGGU & PENDAPATAN ======================= --}}
<h2>5. WAKTU TUNGGU KERJA DAN PENDAPATAN</h2>
<h3>5.1. Gambaran Umum</h3>
<p>
    Rata-rata masa tunggu alumni memperoleh pekerjaan pertama pada Survei
    {{ $tahunSurvei }} adalah <strong>{{ $summary->rata_rata_masa_tunggu }} bulan</strong>,
    dengan rata-rata pendapatan bulanan alumni bekerja sebesar
    <strong>{{ $summary->rata_rata_gaji }} juta rupiah</strong>.
</p>
<h3>5.2. Rincian per Cohort, Tahun Lulus, dan Program Studi</h3>
<table>
    <thead>
        <tr>
            <th>Cohort</th>
            <th class="right">Tahun Lulus</th>
            <th>Program Studi</th>
            <th class="right">Jumlah Alumni</th>
            <th class="right">Rata-rata Masa Tunggu (bln)</th>
            <th class="right">Min</th>
            <th class="right">Max</th>
        </tr>
    </thead>
    <tbody>
        @foreach ($masaTunggu as $i => $row)
        <tr class="{{ $i % 2 ? 'alt' : '' }}">
            <td>{{ $row->cohort }}</td>
            <td class="right">{{ $row->tahun_lulus }}</td>
            <td>{{ $row->program_studi }}</td>
            <td class="right">{{ $row->jumlah_alumni }}</td>
            <td class="right">{{ $row->rata_rata_masa_tunggu }}</td>
            <td class="right">{{ $row->masa_tunggu_min }}</td>
            <td class="right">{{ $row->masa_tunggu_max }}</td>
        </tr>
        @endforeach
    </tbody>
</table>
<p>
    Perbedaan masa tunggu antar program studi dapat menjadi masukan bagi program studi dalam
    memperkuat kerja sama industri, praktik kerja lapangan, dan pendampingan persiapan
    karier bagi lulusan.
</p>

{{-- ======================= KESELARASAN ======================= --}}
<div class="page-break"></div>
<h2>6. KESELARASAN PEKERJAAN DENGAN BIDANG STUDI</h2>
<p>
    Keselarasan diukur pada dua dimensi. Keselarasan <strong>horizontal</strong> menilai
    kesesuaian bidang pekerjaan dengan bidang studi, sedangkan keselarasan
    <strong>vertikal</strong> menilai kesesuaian tingkat pekerjaan dengan jenjang pendidikan
    yang ditempuh. Mengikuti istilah Kemendikti, masing-masing dimensi hanya mengenal dua
    kategori: <strong>Selaras</strong> dan <strong>Tidak Selaras</strong>.
</p>
<p>
    Penyebut persentase adalah alumni <strong>berstatus bekerja</strong> yang mengisi kedua
    pertanyaan keselarasan, bukan seluruh responden, karena keselarasan tidak berlaku bagi
    alumni yang tidak bekerja.
</p>
<h3>6.1. Komposisi Keselarasan Keseluruhan</h3>
<table>
    <thead>
        <tr>
            <th>Dimensi</th>
            <th>Kategori</th>
            <th class="right">Jumlah Alumni</th>
            <th class="right">Responden</th>
            <th class="right">Persentase</th>
        </tr>
    </thead>
    <tbody>
        @foreach ($keselarasan as $i => $row)
        <tr class="{{ $i % 2 ? 'alt' : '' }}">
            <td>{{ $row->dimensi }}</td>
            <td>{{ $row->kategori }}</td>
            <td class="right">{{ $row->jumlah_alumni }}</td>
            <td class="right">{{ $row->jumlah_responden }}</td>
            <td class="right">{{ $row->persentase }}%</td>
        </tr>
        @endforeach
    </tbody>
</table>
<h3>6.2. Keselarasan per Program Studi</h3>
<table>
    <thead>
        <tr>
            <th>Program Studi</th>
            <th>Dimensi</th>
            <th>Kategori</th>
            <th class="right">Jumlah Alumni</th>
            <th class="right">Responden</th>
            <th class="right">Persentase</th>
        </tr>
    </thead>
    <tbody>
        @foreach ($keselarasanProgramStudi as $i => $row)
        <tr class="{{ $i % 2 ? 'alt' : '' }}">
            <td>{{ $row->program_studi }}</td>
            <td>{{ $row->dimensi }}</td>
            <td>{{ $row->kategori }}</td>
            <td class="right">{{ $row->jumlah_alumni }}</td>
            <td class="right">{{ $row->jumlah_responden }}</td>
            <td class="right">{{ $row->persentase }}%</td>
        </tr>
        @endforeach
    </tbody>
</table>
<p>
    Angka keselarasan mencerminkan relevansi kurikulum dengan kebutuhan pasar kerja dan
    menjadi bukti empiris keterkaitan kompetensi lulusan dengan pekerjaannya. Program studi
    dengan proporsi "Tidak Selaras" tertinggi dapat meninjau pemutakhiran kurikulum serta
    memperkuat pembekalan karier lintas bidang.
</p>

{{-- ======================= MASA STUDI & KETEPATAN WAKTU ======================= --}}
<h2>7. MASA STUDI DAN KETEPATAN WAKTU LULUS</h2>
<p>
    Masa studi dihitung dari tahun masuk hingga tahun lulus. Lulus dianggap tepat waktu bila
    masa studi tidak melebihi 3 tahun untuk jenjang D3 dan 4 tahun untuk jenjang S1. Seluruh
    indikator ketepatan waktu dihitung oleh view OLAP PostgreSQL.
</p>
<table>
    <thead>
        <tr>
            <th>Cohort</th>
            <th class="right">Tahun Lulus</th>
            <th class="right">Jumlah Alumni</th>
            <th class="right">Tepat Waktu</th>
            <th class="right">Tidak Tepat Waktu</th>
            <th class="right">Tidak Dapat Dinilai</th>
            <th class="right">Persentase Tepat Waktu</th>
            <th class="right">Rata-rata Masa Studi (thn)</th>
        </tr>
    </thead>
    <tbody>
        @foreach ($ketepatanWaktu as $i => $row)
        <tr class="{{ $i % 2 ? 'alt' : '' }}">
            <td>{{ $row->cohort }}</td>
            <td class="right">{{ $row->tahun_lulus }}</td>
            <td class="right">{{ $row->jumlah_alumni }}</td>
            <td class="right">{{ $row->tepat_waktu }}</td>
            <td class="right">{{ $row->tidak_tepat_waktu }}</td>
            <td class="right">{{ $row->tidak_dapat_dinilai }}</td>
            <td class="right">{{ $row->persentase_tepat_waktu }}%</td>
            <td class="right">{{ $row->rata_rata_masa_studi }}</td>
        </tr>
        @endforeach
    </tbody>
</table>
<p>
    Indikator ketepatan waktu lulus dapat menjadi bahan pendampingan akademik agar
    ketepatan waktu lulus terus meningkat.
</p>

{{-- ======================= KESIMPULAN & REKOMENDASI ======================= --}}
<h2>8. KESIMPULAN DAN REKOMENDASI</h2>
<h3>8.1. Kesimpulan</h3>
<p>
    Berdasarkan hasil tracer study Survei {{ $tahunSurvei }} diperoleh gambaran sebagai
    berikut: (1) total {{ $summary->total_alumni }} alumni tercatat dalam dataset;
    (2) {{ $summary->persentase_bekerja }}% alumni telah bekerja; (3) rata-rata masa tunggu
    kerja {{ $summary->rata_rata_masa_tunggu }} bulan dengan rata-rata pendapatan
    {{ $summary->rata_rata_gaji }} juta rupiah; serta (4) indikator ketepatan waktu lulus
    tersaji per cohort dan tahun lulus pada bagian 7.
</p>
<h3>8.2. Rekomendasi untuk Staf Career Development</h3>
<ul class="rekom">
    <li>Jaga kelengkapan kuesioner agar data yang tersedia semakin representatif.</li>
    <li>Prioritaskan penelusuran alumni pada program studi yang masih memiliki jumlah data paling sedikit.</li>
    <li>Gunakan komposisi keselarasan pekerjaan dengan bidang studi sebagai bahan evaluasi kurikulum bersama program studi.</li>
    <li>Fasilitasi alumni berstatus mencari kerja melalui bursa kerja, pelatihan, dan pembekalan karier untuk mempercepat masa tunggu kerja.</li>
</ul>

<p class="note">
    Dokumen ini dihasilkan otomatis dari sistem Smart Career Matching Alumni pada
    {{ $waktu }}. Data dapat berubah mengikuti pembaruan kuesioner alumni di sistem.
</p>

</body>
</html>
