const API_URL = "http://127.0.0.1:8000/api";

export const TAHUN_SURVEI_DEFAULT = 2025;

/* =========================================================
   NILAI BAKU DIMENSI

   Ditetapkan pada revisi pascasidang 2026-08-27. Sumbernya
   dua dimensi acuan di PostgreSQL yang isinya dibekukan di
   migrasi, jadi daftar di bawah bukan asumsi frontend:
   dim_status_kerja berisi 2 baris, dim_keselarasan 4 baris
   (2 dimensi x 2 kategori).
========================================================= */

/** Dua nilai status kerja. Tidak ada nilai lain di basis data. */
export type StatusBekerja = "Bekerja" | "Tidak Bekerja";

export const STATUS_BEKERJA: StatusBekerja[] = [
  "Bekerja",
  "Tidak Bekerja",
];

/**
 * Dua dimensi keselarasan.
 * Horizontal = kesesuaian bidang pekerjaan dengan bidang studi.
 * Vertikal   = kesesuaian tingkat pekerjaan dengan jenjang pendidikan.
 */
export type DimensiKeselarasan = "Horizontal" | "Vertikal";

export const DIMENSI_KESELARASAN: DimensiKeselarasan[] = [
  "Horizontal",
  "Vertikal",
];

/** Label panjang untuk judul grafik dan keterangan tabel. */
export const LABEL_DIMENSI: Record<DimensiKeselarasan, string> = {
  Horizontal: "Keselarasan Horizontal (kesesuaian bidang)",
  Vertikal: "Keselarasan Vertikal (kesesuaian tingkat pendidikan)",
};

/**
 * Dua kategori keselarasan sesuai istilah Kemendikti.
 * Skala berjenjang ("Sangat erat", "Cukup erat", dan seterusnya)
 * sudah dihapus dari sistem.
 */
export type KategoriKeselarasan = "Selaras" | "Tidak Selaras";

export const KATEGORI_KESELARASAN: KategoriKeselarasan[] = [
  "Selaras",
  "Tidak Selaras",
];

async function fetchApi<T>(
  endpoint: string
): Promise<T> {
  const response = await fetch(
    `${API_URL}${endpoint}`,
    {
      headers: {
        Accept: "application/json",
      },
    }
  );

  if (!response.ok) {
    throw new Error(
      `API Error ${response.status}: ${response.statusText}`
    );
  }

  const json = await response.json();

  return json as T;
}

/**
 * Validasi envelope API Laravel.
 */
function envelope<T>(
  res: {
    success?: boolean;
    message?: string;
    data?: T;
  }
): T {
  if (
    res.success !== true ||
    res.data === undefined ||
    res.data === null
  ) {
    throw new Error(
      res.message ??
        "Data OLAP tidak tersedia."
    );
  }

  return res.data;
}

/** Konversi nilai numerik/null tanpa kalkulasi. */
function numberOrNull(
  value: number | null | undefined
): number | null {
  if (value === null || value === undefined) {
    return null;
  }

  return Number(value);
}

/* =========================================================
   SUMMARY
========================================================= */

/**
 * Kontrak API /olap/summary (view v_olap_summary).
 */
export interface OlapSummaryRaw {
  tahun_survei: number;
  total_alumni: number;
  alumni_bekerja: number;
  alumni_tidak_bekerja: number;
  persentase_bekerja: number;
  rata_rata_ipk: number | null;
  rata_rata_masa_tunggu: number | null;
  rata_rata_gaji: number | null;
}

export interface OlapSummary {
  total: number;
  bekerja: number;
  tidakBekerja: number;
  tingkatBekerja: number;
  rataRataIpk: number | null;
  rataRataMasaTunggu: number | null;
  rataRataGaji: number | null;
  tahunSurvei: number;
}

/**
 * KPI dashboard dari OLAP PostgreSQL.
 *
 * Tidak ada weighted average, reduce, atau perhitungan
 * persentase di TypeScript: semua sudah dihitung view.
 */
export async function getOlapSummary(
  tahunSurvei: number = TAHUN_SURVEI_DEFAULT
): Promise<OlapSummary> {
  const res = await fetchApi<{
    success: boolean;
    tahun_survei: number;
    data: OlapSummaryRaw;
  }>(
    `/olap/summary?tahun_survei=${encodeURIComponent(
      tahunSurvei
    )}`
  );

  const row = envelope(res);

  return {
    total: Number(row.total_alumni),
    bekerja: Number(row.alumni_bekerja),
    tidakBekerja: Number(row.alumni_tidak_bekerja),
    tingkatBekerja: Number(row.persentase_bekerja),
    rataRataIpk: numberOrNull(row.rata_rata_ipk),
    rataRataMasaTunggu: numberOrNull(
      row.rata_rata_masa_tunggu
    ),
    rataRataGaji: numberOrNull(row.rata_rata_gaji),
    tahunSurvei: res.tahun_survei,
  };
}

/* =========================================================
   STATUS KERJA
========================================================= */

/**
 * Kontrak API /olap/status-kerja (view v_olap_status_kerja).
 *
 * Format WIDE: setiap baris sudah berisi jumlah_alumni,
 * bekerja, tidak_bekerja, persentase_bekerja.
 */
export interface OlapStatusKerjaRow {
  tahun_survei: number;
  cohort: string;
  tahun_lulus: number;
  jumlah_alumni: number;
  bekerja: number;
  tidak_bekerja: number;
  persentase_bekerja: number;
}

export interface EmploymentPerTahun {
  tahun: number;
  bekerja: number;
  tidakBekerja: number;
}

/**
 * Chart status pekerjaan per tahun.
 *
 * Pivot dari format wide PostgreSQL ke format Recharts.
 * Tidak ada penjumlahan/pivot bisnis di sini.
 */
export async function getStatusKerja(
  tahunSurvei: number = TAHUN_SURVEI_DEFAULT
): Promise<EmploymentPerTahun[]> {
  const res = await fetchApi<{
    success: boolean;
    data: OlapStatusKerjaRow[];
  }>(
    `/olap/status-kerja?tahun_survei=${encodeURIComponent(
      tahunSurvei
    )}`
  );

  const rows = envelope(res);

  return rows
    .map((row) => ({
      tahun: row.tahun_lulus,
      bekerja: Number(row.bekerja),
      tidakBekerja: Number(row.tidak_bekerja),
    }))
    .sort((a, b) => a.tahun - b.tahun);
}

/* =========================================================
   TAHUN LULUS
========================================================= */

/**
 * Kontrak API /olap/tahun-lulus (view v_olap_tahun_lulus).
 */
export interface OlapTahunLulusRow {
  tahun_survei: number;
  cohort: string;
  tahun_lulus: number;
  jumlah_alumni: number;
  alumni_bekerja: number;
  alumni_tidak_bekerja: number;
}

/**
 * Lulusan per tahun (kohort survei).
 */
export async function getTahunLulus(
  tahunSurvei: number = TAHUN_SURVEI_DEFAULT
): Promise<OlapTahunLulusRow[]> {
  const res = await fetchApi<{
    success: boolean;
    data: OlapTahunLulusRow[];
  }>(
    `/olap/tahun-lulus?tahun_survei=${encodeURIComponent(
      tahunSurvei
    )}`
  );

  const rows = envelope(res);

  return [...rows].sort(
    (a, b) => a.tahun_lulus - b.tahun_lulus
  );
}

/* =========================================================
   PROGRAM STUDI
========================================================= */

/**
 * Kontrak API /olap/program-studi (view v_olap_program_studi).
 */
export interface OlapProgramStudiRow {
  tahun_survei: number;
  cohort: string;
  tahun_lulus: number;
  program_studi: string;
  jumlah_alumni: number;
}

/**
 * Distribusi program studi.
 *
 * Nama program studi sepenuhnya berasal dari API
 * (mis. Comm&Mgmt, Others, Sci&Tech).
 */
export async function getProgramStudi(
  tahunSurvei: number = TAHUN_SURVEI_DEFAULT
): Promise<OlapProgramStudiRow[]> {
  const res = await fetchApi<{
    success: boolean;
    data: OlapProgramStudiRow[];
  }>(
    `/olap/program-studi?tahun_survei=${encodeURIComponent(
      tahunSurvei
    )}`
  );

  const rows = envelope(res);

  return [...rows].sort((a, b) => {
    if (a.tahun_lulus !== b.tahun_lulus) {
      return a.tahun_lulus - b.tahun_lulus;
    }

    return a.program_studi.localeCompare(
      b.program_studi
    );
  });
}

/* =========================================================
   KESELARASAN
========================================================= */

/**
 * Kontrak API /olap/keselarasan (view v_olap_keselarasan).
 *
 * View selalu mengirim empat baris per tahun survei
 * (2 dimensi x 2 kategori), termasuk kategori bernilai 0,
 * supaya jumlah batang grafik tidak berubah antar tahun.
 *
 * `jumlah_responden` adalah penyebutnya: alumni berstatus
 * "Bekerja" yang mengisi kedua pertanyaan keselarasan.
 * Alumni tanpa jawaban (NULL) tidak dihitung sebagai
 * "Tidak Selaras" — ia keluar dari penyebut.
 */
export interface OlapKeselarasanRow {
  tahun_survei: number;
  dimensi: DimensiKeselarasan;
  kategori: KategoriKeselarasan;
  urutan_dimensi: number;
  urutan_kategori: number;
  jumlah_responden: number;
  jumlah_alumni: number;
  persentase: number;
}

/**
 * Komposisi keselarasan keseluruhan.
 *
 * Sumber: view v_olap_keselarasan. Penyebut dan persentase
 * dihitung PostgreSQL, bukan di React.
 */
export async function getKeselarasan(
  tahunSurvei: number = TAHUN_SURVEI_DEFAULT
): Promise<OlapKeselarasanRow[]> {
  const res = await fetchApi<{
    success: boolean;
    data: OlapKeselarasanRow[];
  }>(
    `/olap/keselarasan?tahun_survei=${encodeURIComponent(
      tahunSurvei
    )}`
  );

  return envelope(res);
}

/**
 * Kontrak API /olap/keselarasan-program-studi
 * (view v_olap_keselarasan_program_studi).
 *
 * Grain: tahun survei x prodi x dimensi x kategori, jadi
 * empat baris per program studi termasuk nilai 0. Penyebut
 * dihitung per prodi sehingga persentase tiap prodi berjumlah
 * 100 untuk masing-masing dimensi.
 */
export interface OlapKeselarasanProgramStudiRow {
  tahun_survei: number;
  program_studi: string;
  dimensi: DimensiKeselarasan;
  kategori: KategoriKeselarasan;
  urutan_dimensi: number;
  urutan_kategori: number;
  jumlah_responden: number;
  jumlah_alumni: number;
  persentase: number;
}

/**
 * Keselarasan per program studi (stacked bar + tabel).
 *
 * React TIDAK menghitung persentase: nilai `persentase`
 * sudah dihitung view v_olap_keselarasan_program_studi.
 */
export async function getKeselarasanProgramStudi(
  tahunSurvei: number = TAHUN_SURVEI_DEFAULT
): Promise<OlapKeselarasanProgramStudiRow[]> {
  const res = await fetchApi<{
    success: boolean;
    data: OlapKeselarasanProgramStudiRow[];
  }>(
    `/olap/keselarasan-program-studi?tahun_survei=${encodeURIComponent(
      tahunSurvei
    )}`
  );

  return envelope(res);
}

/* =========================================================
   MASA TUNGGU KERJA
========================================================= */

/**
 * Kontrak API /olap/masa-tunggu (view v_olap_masa_tunggu,
 * survey-specific).
 */
export interface OlapMasaTungguRow {
  tahun_survei: number;
  cohort: string;
  tahun_lulus: number;
  program_studi: string;
  jumlah_alumni: number;
  rata_rata_masa_tunggu: number | null;
  masa_tunggu_min: number | null;
  masa_tunggu_max: number | null;
}

/**
 * Masa tunggu kerja per program studi per tahun lulus
 * (kohort survei tertentu).
 */
export async function getMasaTunggu(
  tahunSurvei: number = TAHUN_SURVEI_DEFAULT
): Promise<OlapMasaTungguRow[]> {
  const res = await fetchApi<{
    success: boolean;
    data: OlapMasaTungguRow[];
  }>(
    `/olap/masa-tunggu?tahun_survei=${encodeURIComponent(
      tahunSurvei
    )}`
  );

  return envelope(res);
}

/**
 * Kontrak API /olap/masa-tunggu-histori
 * (view v_olap_masa_tunggu_histori).
 *
 * Seluruh histori fact (215 alumni, tahun 2019-2025),
 * tanpa filter tahun_survei. AVG/MIN/MAX hanya atas
 * masa_tunggu_bulan non-NULL; NULL dipertahankan.
 */
export interface OlapMasaTungguHistoriRow {
  tahun_lulus: number;
  program_studi: string;
  jumlah_alumni: number;
  jumlah_alumni_bermasa_tunggu: number;
  rata_rata_masa_tunggu: number | null;
  masa_tunggu_min: number | null;
  masa_tunggu_max: number | null;
}

/**
 * Rata-rata masa tunggu kerja seluruh histori (chart
 * "Program Studi dan Masa Tunggu Kerja").
 *
 * React hanya menerima agregasi; TIDAK menghitung AVG.
 */
export async function getMasaTungguHistori(): Promise<OlapMasaTungguHistoriRow[]> {
  const res = await fetchApi<{
    success: boolean;
    data: OlapMasaTungguHistoriRow[];
  }>("/olap/masa-tunggu-histori");

  return envelope(res);
}

/* =========================================================
   DETAIL (DRILLDOWN SAJA)
========================================================= */

export interface OlapDetailRow {
  alumni_key: number;
  id_sumber: number;
  nama: string;
  gender: string;
  jenjang: string;
  tahun_masuk: number | null;
  jabatan: string | null;
  bidang_pekerjaan: string | null;
  program_studi: string;
  specialisasi: string | null;
  tahun_lulus: number;
  dekade: string;
  status_bekerja: StatusBekerja;
  /** Kesesuaian bidang. NULL bila alumni tidak bekerja atau tidak menjawab. */
  kategori_horizontal: KategoriKeselarasan | null;
  /** Kesesuaian tingkat pendidikan. NULL dengan alasan yang sama. */
  kategori_vertikal: KategoriKeselarasan | null;
  pengalaman_kerja: string | null;
  ipk: number | null;
  masa_tunggu_bulan: number | null;
  gaji_juta: number | null;
  masa_studi_tahun: number | null;
  lulus_tepat_waktu: boolean | null;
  /** Hanya terisi bila endpoint dipanggil dengan filter tahun_survei. */
  tahun_survei: number | null;
  cohort: string | null;
}

/**
 * Seluruh baris detail OLAP (fact level).
 *
 * PENTING: v_olap_detail hanya untuk drilldown/detail
 * (tabel responden). BUKAN sumber agregasi bisnis —
 * KPI/AVG/persentase harus berasal dari view agregat.
 */
export async function getOlapDetail(): Promise<OlapDetailRow[]> {
  const res = await fetchApi<{
    success: boolean;
    data: OlapDetailRow[];
  }>("/olap/detail");

  const rows = envelope(res);

  if (!Array.isArray(rows)) {
    throw new Error(
      "Format detail OLAP tidak valid."
    );
  }

  return rows;
}

/* =========================================================
   KETEPATAN WAKTU
========================================================= */

/**
 * Kontrak API /olap/ketepatan-waktu
 * (view v_olap_ketepatan_waktu).
 *
 * Agregat per cohort/tahun lulus. Satu baris = satu
 * kelompok (tahun lulus), BUKAN satu alumni.
 */
export interface KetepatanWaktuRow {
  tahun_survei: number;
  cohort: string;
  tahun_lulus: number;
  jumlah_alumni: number;
  tepat_waktu: number;
  tidak_tepat_waktu: number;
  tidak_dapat_dinilai: number;
  persentase_tepat_waktu: number;
  rata_rata_masa_studi: number | null;
}

/**
 * Ketepatan waktu lulus per cohort/tahun.
 *
 * Semua indikator (persentase, rata-rata) sudah dihitung
 * view v_olap_ketepatan_waktu. React TIDAK menghitung ulang.
 */
export async function getKetepatanWaktu(
  tahunSurvei: number = TAHUN_SURVEI_DEFAULT
): Promise<KetepatanWaktuRow[]> {
  const res = await fetchApi<{
    success: boolean;
    data: KetepatanWaktuRow[];
  }>(
    `/olap/ketepatan-waktu?tahun_survei=${encodeURIComponent(
      tahunSurvei
    )}`
  );

  return envelope(res);
}

/* =========================================================
   TAHUN SURVEI & SINKRONISASI REAL-TIME
   ========================================================= */

export async function getTahunSurveiList(): Promise<number[]> {
  const res = await fetchApi<{
    success: boolean;
    data: number[];
  }>("/olap/tahun-survei");
  const list = envelope(res) as unknown as number[];
  if (Array.isArray(list) && list.length > 0) return list.map((v) => Number(v));
  return [TAHUN_SURVEI_DEFAULT];
}

export async function syncOlap(): Promise<{ staging: number; fakta: number }> {
  const token = localStorage.getItem("auth_token") || "";
  const res = await fetch(`${API_URL}/olap/sync`, {
    method: "POST",
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${token}`,
    },
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.message || `Sinkronisasi gagal HTTP ${res.status}`);
  }
  const json = (await res.json()) as { success: boolean; data: { staging: number; fakta: number }; message?: string };
  if (!json.success) throw new Error(json.message || "Sinkronisasi gagal");
  return json.data;
}

export interface RekapProgramStudiRow {
  program_studi: string;
  jumlah_alumni: number;
  bekerja: number;
  tidak_bekerja: number;
  persentase_bekerja: number;
}

export async function getRekapProgramStudi(): Promise<{
  data: RekapProgramStudiRow[];
  total: RekapProgramStudiRow | null;
  rekonsiliasi: string;
}> {
  const res = await fetchApi<{
    success: boolean;
    data: RekapProgramStudiRow[];
    total: RekapProgramStudiRow | null;
    rekonsiliasi: string;
  }>("/olap/rekap-program-studi");
  const json = res as unknown as { success: boolean; data: RekapProgramStudiRow[]; total: RekapProgramStudiRow | null; rekonsiliasi: string };
  return { data: json.data ?? [], total: json.total ?? null, rekonsiliasi: json.rekonsiliasi ?? "VALID" };
}