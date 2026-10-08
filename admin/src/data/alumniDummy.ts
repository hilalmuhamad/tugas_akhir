// Dataset cadangan (fallback) yang dipakai HANYA ketika endpoint
// /api/alumni tidak dapat dihubungi. Angka di sini tidak pernah
// menjadi sumber laporan: seluruh angka laporan berasal dari view
// OLAP PostgreSQL. Skalanya sengaja dibuat menyerupai dataset
// referensi supaya tata letak dashboard tetap terlihat wajar.
//
// Field akademik (jurusan SMA, nilai SMP/SMA/S1/S2, nilai tes kerja)
// sengaja tidak dipakai — cukup field yang relevan untuk dashboard
// tracer study & tabel Data Alumni.

/**
 * Dua nilai status kerja, sama dengan dim_status_kerja PostgreSQL.
 *
 * Sejak revisi pascasidang 2026-08-27, "Wirausaha/Startup" masuk
 * ke "Bekerja", sedangkan "Melanjutkan Studi", "Belum Memungkinkan
 * Bekerja", dan "Tidak Bekerja tetapi Sedang Mencari Kerja" masuk
 * ke "Tidak Bekerja".
 */
export type StatusBekerja = "Bekerja" | "Tidak Bekerja";

/** Dua kategori keselarasan sesuai istilah Kemendikti. */
export type KategoriKeselarasan = "Selaras" | "Tidak Selaras";

export type Gender = "L" | "P";
export type PengalamanKerja = "Ya" | "Tidak"; // dari kolom workex

export interface AlumniRecord {
  id: number;
  nama: string;
  gender: Gender;
  jenjang: "D3" | "S1" | null;
  tahunMasuk: number | null;
  programStudi: "Sci&Tech" | "Comm&Mgmt" | "Others"; // dari kolom degree_t
  specialisasi: "Mkt&HR" | "Mkt&Fin"; // dari kolom specialisation
  pengalamanKerja: PengalamanKerja; // dari kolom workex
  tahunLulus: number;
  ipk: number; // skala 0.00 - 4.00
  statusBekerja: StatusBekerja;
  masaTungguBulan: number | null; // null kalau tidak bekerja
  gajiJuta: number | null; // null kalau tidak bekerja — dari kolom salary
  /** Keselarasan horizontal. Null kalau tidak bekerja. */
  kesesuaianBidang: KategoriKeselarasan | null;
  /** Keselarasan vertikal. Null kalau tidak bekerja. */
  tingkatPendidikanSesuai: KategoriKeselarasan | null;
}

const DEGREE_T: AlumniRecord["programStudi"][] = ["Sci&Tech", "Comm&Mgmt", "Others"];
const SPECIALISATION: AlumniRecord["specialisasi"][] = ["Mkt&HR", "Mkt&Fin"];
const YEARS = [2021, 2022, 2023, 2024, 2025];

// Nama depan & belakang bergaya internasional (campuran Barat, Eropa, dll)
const MALE_FIRST = [
  "James", "Michael", "David", "Daniel", "Matthew", "Andrew", "Joseph", "Ryan", "Nathan", "Ethan",
  "Lucas", "Benjamin", "Samuel", "Alexander", "Henry", "Oliver", "William", "Thomas", "Jack", "Leo",
];
const FEMALE_FIRST = [
  "Emily", "Sarah", "Jessica", "Amanda", "Sophia", "Olivia", "Emma", "Grace", "Hannah", "Chloe",
  "Isabella", "Charlotte", "Amelia", "Victoria", "Natalie", "Laura", "Rachel", "Megan", "Julia", "Claire",
];
const LAST = [
  "Anderson", "Thompson", "Johnson", "Williams", "Brown", "Miller", "Davis", "Wilson", "Moore", "Taylor",
  "Clark", "Harris", "Lewis", "Walker", "Young", "Robinson", "Carter", "Mitchell", "Bennett", "Foster",
];

function mulberry32(seed: number) {
  let s = seed;
  return () => {
    s |= 0;
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function pick<T>(arr: T[], rand: () => number): T {
  return arr[Math.floor(rand() * arr.length)];
}

export function generateAlumniDummy(): AlumniRecord[] {
  const rand = mulberry32(42);
  const rows: AlumniRecord[] = [];
  let id = 1;

  // target ~215 baris, mengikuti skala dataset referensi
  while (rows.length < 215) {
    const gender: Gender = rand() < 0.5 ? "L" : "P";
    const nama = `${pick(gender === "L" ? MALE_FIRST : FEMALE_FIRST, rand)} ${pick(LAST, rand)}`;
    const programStudi = pick(DEGREE_T, rand);
    const specialisasi = pick(SPECIALISATION, rand);
    const tahunLulus = pick(YEARS, rand);
    const jenjang: AlumniRecord["jenjang"] = rand() < 0.25 ? "D3" : "S1"; // ~25% D3
    const durasi = jenjang === "D3" ? 3 : 4;
    const tahunMasuk = tahunLulus - durasi - (rand() < 0.25 ? 1 : 0); // ~75% tepat waktu, sisanya 1 tahun tambahan
    const ipk = Math.round((2.5 + rand() * 1.5) * 100) / 100; // rentang 2.50 - 4.00
    const pengalamanKerja: PengalamanKerja = rand() < 0.34 ? "Ya" : "Tidak"; // ~34%, mendekati dataset referensi

    // --- Skor kesiapan kerja: kombinasi IPK (60%) + pengalaman kerja (40%) + noise sedang ---
    const ipkNormalized = (ipk - 2.5) / 1.5; // dinormalisasi ke 0..1
    const pengalamanBonus = pengalamanKerja === "Ya" ? 1 : 0;
    const noise = (rand() - 0.5) * 0.2; // noise realistis, kira-kira +-0.10
    const skorKesiapan = clamp(0.6 * ipkNormalized + 0.4 * pengalamanBonus + noise, 0, 1);

    // Peluang alumni bekerja naik seiring skor kesiapan kerja,
    // tapi tetap probabilistik (bukan ambang batas keras) supaya realistis & tidak 100% terpisah
    const probBekerja = clamp(0.1 + 0.8 * skorKesiapan, 0.05, 0.95);

    // Hanya dua nilai, sama seperti dim_status_kerja PostgreSQL.
    const statusBekerja: StatusBekerja =
      rand() < probBekerja ? "Bekerja" : "Tidak Bekerja";

    const bekerja = statusBekerja === "Bekerja";

    // Masa tunggu & gaji juga sedikit dipengaruhi skor (makin siap kerja, makin cepat terserap & makin tinggi gaji)
    const masaTungguBulan = bekerja
      ? clamp(Math.round(10 - skorKesiapan * 7 - rand() * 3), 1, 12)
      : null;
    const gajiJuta = bekerja
      ? Math.round((3 + skorKesiapan * 5 + rand() * 3) * 10) / 10
      : null;

    // Keselarasan hanya berlaku bagi alumni bekerja; alumni tidak
    // bekerja bernilai null, BUKAN "Tidak Selaras".
    const kesesuaianBidang: KategoriKeselarasan | null = bekerja
      ? rand() < clamp(0.45 + 0.4 * skorKesiapan, 0.2, 0.9)
        ? "Selaras"
        : "Tidak Selaras"
      : null;
    const tingkatPendidikanSesuai: KategoriKeselarasan | null = bekerja
      ? rand() < clamp(0.5 + 0.35 * skorKesiapan, 0.25, 0.9)
        ? "Selaras"
        : "Tidak Selaras"
      : null;

    rows.push({
      id: id++,
      nama,
      gender,
      jenjang,
      tahunMasuk,
      programStudi,
      specialisasi,
      pengalamanKerja,
      tahunLulus,
      ipk,
      statusBekerja,
      masaTungguBulan,
      gajiJuta,
      kesesuaianBidang,
      tingkatPendidikanSesuai,
    });
  }
  return rows;
}

export const alumniDummy = generateAlumniDummy();