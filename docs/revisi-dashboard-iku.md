# Rencana Revisi Dashboard Admin Sesuai IKU 2021

**Tanggal:** 6 Agustus 2026  
**Referensi:** Kepmendikbud No. 3/M/2021 tentang Indikator Kinerja Utama PTN

---

## Masalah Utama yang Ditemukan

### 1. Model Random Forest Tidak Sesuai IKU 1

**Kondisi Sekarang:**
- Target: `berpenghasilan` (binary: Bekerja/Wirausaha vs lainnya)
- Tidak ada validasi kriteria IKU 1:
  - ❌ Masa tunggu < 6 bulan
  - ❌ Gaji > 1.2x UMP
  - ❌ Jenis perjanjian kerja (PKWTT/PKWT)

**Yang Seharusnya (IKU 1):**
- Target: `kategoriIKU` (4 kelas)
  - `pekerjaanLayak`: masa tunggu < 6 bulan + gaji > 1.2x UMP + PKWTT/PKWT
  - `wirausahaLayak`: masa tunggu < 6 bulan + penghasilan > 1.2x UMP + SIUP/IUMK
  - `lanjutStudi`: melanjutkan studi < 12 bulan setelah lulus
  - `tidakMemenuhi`: tidak masuk 3 kategori di atas

### 2. Dashboard Metrics Tidak Akurat

**EcommerceMetrics.tsx Line 14-22:**
```tsx
// ❌ Sekarang: hanya hitung masa tunggu <= 0
const beforeOrAt = alumni.filter(
  (item) => item.masaTungguBulan !== null && item.masaTungguBulan <= 0
).length;
```

**Yang Seharusnya:**
```tsx
// ✅ Hitung sesuai IKU 1
const pekerjaanLayak = alumni.filter((a) => 
  a.statusBekerja === "Bekerja" &&
  a.masaTungguBulan !== null &&
  a.masaTungguBulan < 6 &&
  a.gajiJuta !== null &&
  a.gajiJuta > (umpProvinsi[a.provinsiBekerja] * 1.2 / 1000000) &&
  ['PKWTT', 'PKWT'].includes(a.jenisPerjanjianKerja)
).length;
```

### 3. Data Tidak Lengkap

**Field yang hilang di database:**
- `provinsiBekerja` (wajib untuk hitung UMP)
- `jenisPerjanjianKerja` (wajib: PKWTT/PKWT/Paruh Waktu)
- `bentukUsaha` (untuk wirausaha: Perorangan/Firma/CV/PT)
- `tanggalIjazah` (sekarang hanya `tahunLulus`)
- `nomorSIUP_IUMK` (opsional untuk validasi)

---

## Solusi Lengkap

### Phase 1: Update Database Schema

**File:** `backend/database/migrations/xxxx_update_alumni_table_iku.php`

```php
Schema::table('alumni', function (Blueprint $table) {
    // Field IKU 1 yang wajib
    $table->string('provinsiBekerja', 50)->nullable()->after('statusBekerja');
    $table->enum('jenisPerjanjianKerja', ['PKWTT', 'PKWT', 'Paruh Waktu', 'Tidak Ada'])->nullable()->after('provinsiBekerja');
    $table->enum('bentukUsaha', ['Perorangan', 'Firma', 'CV', 'PT', 'Tidak Ada'])->nullable()->after('jenisPerjanjianKerja');
    $table->date('tanggalIjazah')->nullable()->after('tahunLulus');
    $table->string('nomorSIUP_IUMK', 100)->nullable()->after('bentukUsaha');
    
    // Computed field untuk kemudahan query
    $table->enum('kategoriIKU', ['pekerjaanLayak', 'wirausahaLayak', 'lanjutStudi', 'tidakMemenuhi'])->nullable()->after('gajiJuta');
});
```

### Phase 2: Data UMP 2021-2025

**File:** `backend/database/seeders/UMPSeeder.php`

Sumber: Permenaker tentang UMP per provinsi (2021-2025)

```php
// Contoh data UMP 2024 (dalam Rupiah)
$ump2024 = [
    'DKI Jakarta' => 5_067_381,
    'Jawa Barat' => 2_000_000,
    'Jawa Tengah' => 2_126_000,
    'Jawa Timur' => 2_040_244,
    'Banten' => 2_661_280,
    // ... 34 provinsi
];
```

### Phase 3: Training Script Baru

**File:** `admin/scripts/train_random_forest_iku.py`

**Target klasifikasi:** 4 kelas (sesuai IKU 1)

```python
def build_iku_target(df: pd.DataFrame, ump_data: dict) -> pd.Series:
    """
    Klasifikasi alumni ke kategori IKU 1 sesuai Kepmendikbud 3/M/2021
    
    Referensi:
    - Kementerian Pendidikan, Kebudayaan, Riset, dan Teknologi. (2021).
      Buku Panduan Indikator Kinerja Utama Perguruan Tinggi Negeri 2021.
      Hal. 11-16 (IKU 1: Lulusan Mendapat Pekerjaan yang Layak)
    """
    kategori = []
    
    for _, row in df.iterrows():
        # 1. Pekerjaan Layak
        if (row['statusBekerja'] == 'Bekerja' and
            row['masaTungguBulan'] is not None and row['masaTungguBulan'] < 6 and
            row['gajiJuta'] is not None and 
            row['provinsiBekerja'] in ump_data and
            row['gajiJuta'] > (ump_data[row['provinsiBekerja']] * 1.2 / 1_000_000) and
            row['jenisPerjanjianKerja'] in ['PKWTT', 'PKWT']):
            kategori.append('pekerjaanLayak')
        
        # 2. Wirausaha Layak
        elif (row['statusBekerja'] == 'Wirausaha/Startup' and
              row['masaTungguBulan'] is not None and row['masaTungguBulan'] < 6 and
              row['gajiJuta'] is not None and
              row['provinsiBekerja'] in ump_data and
              row['gajiJuta'] > (ump_data[row['provinsiBekerja']] * 1.2 / 1_000_000) and
              row['bentukUsaha'] in ['Perorangan', 'Firma', 'CV', 'PT']):
            kategori.append('wirausahaLayak')
        
        # 3. Lanjut Studi
        elif (row['statusBekerja'] == 'Melanjutkan Studi' and
              row['tanggalIjazah'] is not None and
              row['tanggalMulaiStudi'] is not None and
              (row['tanggalMulaiStudi'] - row['tanggalIjazah']).days < 365):
            kategori.append('lanjutStudi')
        
        # 4. Tidak Memenuhi
        else:
            kategori.append('tidakMemenuhi')
    
    return pd.Series(kategori, index=df.index)
```

**Hyperparameter tuning:** GridSearchCV dengan stratified k-fold

```python
from sklearn.model_selection import GridSearchCV, StratifiedKFold

param_grid = {
    'n_estimators': [100, 200, 300],
    'max_depth': [4, 6, 8],
    'min_samples_leaf': [3, 5, 7],
    'class_weight': ['balanced', 'balanced_subsample']
}

skf = StratifiedKFold(n_splits=5, shuffle=True, random_state=42)

grid_search = GridSearchCV(
    RandomForestClassifier(random_state=42),
    param_grid,
    cv=skf,
    scoring='f1_macro',  # balanced untuk multi-class
    n_jobs=-1
)
```

### Phase 4: Dashboard Metrics Baru

**File:** `admin/src/components/ecommerce/IKUMetrics.tsx`

```tsx
interface IKUStats {
  totalLulusan: number;
  pekerjaanLayak: number;
  wirausahaLayak: number;
  lanjutStudi: number;
  skorIKU1: number; // persentase (0-100)
}

const stats: IKUStats = useMemo(() => {
  const totalLulusan = alumni.length;
  
  const pekerjaanLayak = alumni.filter(a => 
    a.statusBekerja === "Bekerja" &&
    a.masaTungguBulan !== null && a.masaTungguBulan < 6 &&
    a.gajiJuta !== null && 
    a.gajiJuta > (getUMP(a.provinsiBekerja, a.tahunLulus) * 1.2 / 1_000_000) &&
    ['PKWTT', 'PKWT'].includes(a.jenisPerjanjianKerja)
  ).length;
  
  const wirausahaLayak = alumni.filter(a =>
    a.statusBekerja === "Wirausaha/Startup" &&
    a.masaTungguBulan !== null && a.masaTungguBulan < 6 &&
    a.gajiJuta !== null &&
    a.gajiJuta > (getUMP(a.provinsiBekerja, a.tahunLulus) * 1.2 / 1_000_000) &&
    ['Perorangan', 'Firma', 'CV', 'PT'].includes(a.bentukUsaha)
  ).length;
  
  const lanjutStudi = alumni.filter(a =>
    a.statusBekerja === "Melanjutkan Studi" &&
    a.tanggalIjazah && a.tanggalMulaiStudi &&
    diffInDays(a.tanggalMulaiStudi, a.tanggalIjazah) < 365
  ).length;
  
  // Formula IKU 1 (hal. 16 Buku Panduan IKU 2021)
  const skorIKU1 = totalLulusan > 0
    ? ((pekerjaanLayak + wirausahaLayak + lanjutStudi) / totalLulusan) * 100
    : 0;
  
  return { totalLulusan, pekerjaanLayak, wirausahaLayak, lanjutStudi, skorIKU1 };
}, [alumni]);
```

**Tampilan card:**
```tsx
<div className="metric-card">
  <h3>Skor IKU 1 (Kepmendikbud 3/M/2021)</h3>
  <div className="score">{skorIKU1.toFixed(1)}%</div>
  <div className="breakdown">
    <span>Pekerjaan Layak: {pekerjaanLayak}</span>
    <span>Wirausaha Layak: {wirausahaLayak}</span>
    <span>Lanjut Studi: {lanjutStudi}</span>
  </div>
  <p className="reference">
    Kriteria: masa tunggu {"<"} 6 bulan, gaji {">"} 1.2x UMP, 
    perjanjian PKWTT/PKWT (Buku Panduan IKU 2021, hal. 11-15)
  </p>
</div>
```

### Phase 5: Referensi & Sitasi

**File:** `docs/references.md`

```markdown
# Referensi Metodologi Dashboard Tracer Study

## Regulasi Pemerintah

1. **Kementerian Pendidikan, Kebudayaan, Riset, dan Teknologi.** (2021). 
   *Keputusan Menteri Pendidikan dan Kebudayaan Nomor 3/M/2021 tentang 
   Indikator Kinerja Utama Perguruan Tinggi Negeri dan Lembaga Layanan 
   Pendidikan Tinggi di Lingkungan Kementerian Pendidikan dan Kebudayaan.*

2. **Kementerian Pendidikan, Kebudayaan, Riset, dan Teknologi.** (2021). 
   *Buku Panduan Indikator Kinerja Utama Perguruan Tinggi Negeri 2021* 
   (Versi 28 Juni 2021). Hal. 11-16.

## Metodologi Machine Learning

3. **Breiman, L.** (2001). Random Forests. *Machine Learning*, 45(1), 5-32.
   DOI: 10.1023/A:1010933404324

4. **Strobl, C., Boulesteix, A. L., Zeileis, A., & Hothorn, T.** (2007).
   Bias in random forest variable importance measures: Illustrations, 
   sources and a solution. *BMC Bioinformatics*, 8(1), 25.
   DOI: 10.1186/1471-2105-8-25

5. **Lundberg, S. M., & Lee, S. I.** (2017). A unified approach to 
   interpreting model predictions. *Advances in Neural Information 
   Processing Systems*, 30, 4765-4774.

## Tracer Study

6. **Schomburg, H.** (2003). *Handbook for Graduate Tracer Studies*. 
   Kassel, Germany: Centre for Research on Higher Education and Work,
   University of Kassel.

7. **Teichler, U.** (2015). Higher education and the world of work: 
   The perennial controversial issue. *Asia Pacific Education Review*, 
   16(4), 501-514. DOI: 10.1007/s12564-015-9401-8
```

---

## Tahapan Implementasi

### ✅ **Step 1: Training Model Baru (Wajib)**

**Aksi:**
1. Lengkapi data dummy dengan field IKU 1:
   - `provinsiBekerja` (randomize 34 provinsi Indonesia)
   - `jenisPerjanjianKerja` (80% PKWTT/PKWT, 20% Paruh Waktu)
   - `bentukUsaha` (untuk wirausaha)
   - `tanggalIjazah` (generate dari `tahunLulus`)

2. Buat file UMP 2021-2025 (JSON atau Python dict)

3. Jalankan script training baru:
   ```bash
   cd admin/scripts
   python train_random_forest_iku.py
   ```

4. Output: `randomForestResult_iku.json` dengan:
   - Target: `kategoriIKU` (4 kelas)
   - Metrics: accuracy, precision, recall, F1-score per kelas
   - Feature importance + permutation importance
   - Confusion matrix
   - Referensi metodologi

**Estimasi waktu:** 2-3 jam (termasuk data augmentation)

### ✅ **Step 2: Update Frontend Dashboard**

1. Ganti `EcommerceMetrics.tsx` dengan `IKUMetrics.tsx`
2. Update `PredictionPanel.tsx` untuk menampilkan 4 kelas prediksi
3. Tambahkan chart breakdown IKU 1 (pie chart 4 kategori)
4. Tambahkan tooltip referensi IKU pada setiap metric

**Estimasi waktu:** 3-4 jam

### ✅ **Step 3: Update Backend (Opsional)**

Jika ingin data real dari database:
1. Buat migration untuk field baru
2. Seed data UMP
3. Update API endpoint `/api/alumni` untuk include field IKU
4. Buat endpoint `/api/iku-stats` untuk agregasi

**Estimasi waktu:** 2-3 jam

---

## Checklist Quality Assurance

- [ ] Model accuracy >= 70% (balanced untuk 4 kelas)
- [ ] Confusion matrix menunjukkan tidak ada bias ke 1 kelas
- [ ] Feature importance sesuai teori (IPK, pengalaman kerja dominan)
- [ ] Dashboard menampilkan skor IKU 1 sesuai formula resmi (hal. 16)
- [ ] Setiap metric ada tooltip referensi Kepmendikbud 3/M/2021
- [ ] Prediksi table menunjukkan 4 kategori IKU dengan confidence
- [ ] Dokumentasi mencantumkan 7 referensi di atas
- [ ] Laporan TA mencantumkan flowchart klasifikasi IKU 1

---

**Catatan Penting:**

> Klasifikasi 4 kelas ini **berlandaskan regulasi resmi** (Kepmendikbud 3/M/2021),
> bukan kategori arbitrer yang dibuat sendiri. Setiap threshold (6 bulan, 1.2x UMP)
> dan kriteria (PKWTT/PKWT, SIUP/IUMK) **wajib sesuai Buku Panduan IKU hal. 11-16**.

**Untuk Laporan TA:**

Bab Metodologi harus jelaskan:
1. **Mengapa 4 kelas?** → Sesuai regulasi IKU 1
2. **Darimana threshold?** → Kepmendikbud 3/M/2021 hal. 12-15
3. **Referensi Random Forest?** → Breiman (2001), Strobl et al. (2007)
4. **Validasi?** → Stratified k-fold + confusion matrix + F1-score

---

**Status:** Draft untuk review dospem  
**Next Action:** User approval → Step 1 (training model baru)
