import api from '../../../services/api';

export async function getTracerProfile() {
  try {
    const { data } = await api.get('/profile');
    return data || null;
  } catch (error) {
    if (error?.response?.status === 404) {
      return null;
    }
    throw error;
  }
}

export async function getActiveTracerPeriod() {
  try {
    const { data } = await api.get('/tracer-study/period-active');
    return {
      periode: data?.periode ?? new Date().getFullYear(),
      status: data?.status ?? 'Belum tersedia',
      batasPengisian: data?.batas_pengisian ?? null,
      source: 'api',
    };
  } catch {
    return {
      periode: new Date().getFullYear(),
      status: 'Belum tersedia',
      batasPengisian: null,
      source: 'fallback',
    };
  }
}

export async function getTracerHistory() {
  try {
    const { data } = await api.get('/tracer-study/history');
    if (!Array.isArray(data)) {
      return [];
    }

    return data.map((item) => ({
      periode: item.periode ?? item.tahun_survei ?? '-',
      status: item.status ?? 'Selesai',
      tanggalPengisian: item.tanggal_pengisian ?? item.created_at ?? null,
    }));
  } catch {
    return [];
  }
}

/**
 * Opsi isian kuisioner diambil langsung dari API OLAP PostgreSQL,
 * bukan konstanta hardcode di frontend:
 *  - program_studi / specialisasi / status_bekerja /
 *    kategori_horizontal / kategori_vertikal dari
 *    GET /api/olap/detail (view v_olap_detail, seluruh histori)
 *  - bidang_pekerjaan dari GET /api/alumni (dimensi alumni, butuh login)
 *
 * Opsi keselarasan sengaja dibaca dari dua kolom terpisah dan
 * digabung: dim_keselarasan menyimpan pasangan horizontal x
 * vertikal, jadi kedua kolom berisi himpunan nilai yang sama
 * ("Selaras" dan "Tidak Selaras"). Kalau tabel fakta masih kosong,
 * daftarnya ikut kosong dan formulir menampilkan pesan "opsi belum
 * tersedia" — nilai tidak pernah ditebak di frontend.
 */
export async function getKuisionerOptions() {
  const [detailRes, alumniRes] = await Promise.all([
    api.get('/olap/detail'),
    api.get('/alumni'),
  ]);

  const detailRows = Array.isArray(detailRes.data?.data) ? detailRes.data.data : [];
  const alumniRows = Array.isArray(alumniRes.data) ? alumniRes.data : [];

  const distinct = (values) => [...new Set(values.filter((v) => v != null && v !== ''))];

  const kategoriKeselarasan = distinct([
    ...detailRows.map((r) => r.kategori_horizontal),
    ...detailRows.map((r) => r.kategori_vertikal),
  ]).sort();

  return {
    programStudi: distinct(detailRows.map((r) => r.program_studi)),
    specialisasi: distinct(detailRows.map((r) => r.specialisasi)),
    statusBekerja: distinct(detailRows.map((r) => r.status_bekerja)),
    /** Dipakai untuk kedua pertanyaan keselarasan (horizontal & vertikal). */
    kategoriKeselarasan,
    bidangPekerjaan: distinct(alumniRows.map((r) => r.bidangPekerjaan)),
  };
}
