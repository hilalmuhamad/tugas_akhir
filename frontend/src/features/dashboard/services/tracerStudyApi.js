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
    // Backend tidak punya /tracer-study/period-active; tahun survei aktif
    // dibaca dari dim_tahun_survei via OLAP (tahun terbesar = survei berjalan).
    const { data } = await api.get('/olap/tahun-survei');
    const list = Array.isArray(data?.data) ? data.data.map(Number).filter(Number.isFinite) : [];
    if (list.length === 0) throw new Error('empty');
    return {
      periode: Math.max(...list),
      status: 'Aktif',
      batasPengisian: null,
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
    // Backend tidak punya /tracer-study/history per user; riwayat
    // diturunkan dari profil milik sendiri: ada profil = pernah mengisi.
    const { data } = await api.get('/profile');
    if (!data || data.tahunLulus == null) {
      return [];
    }
    return [
      {
        periode: data.tahunLulus,
        status: 'Selesai',
        tanggalPengisian: null,
      },
    ];
  } catch {
    return [];
  }
}

/**
 * Opsi isian kuisioner diambil langsung dari API OLAP PostgreSQL,
 * bukan konstanta hardcode di frontend:
 *  - program_studi / specialisasi / status_bekerja dari
 *    GET /api/olap/detail (view v_olap_detail, seluruh histori)
 *  - kategori keselarasan dari kolom `hubungan_bidang` di
 *    v_olap_detail digabung dengan kolom `kategori` di
 *    GET /api/olap/keselarasan (view memakai kerangka CROSS JOIN
 *    sehingga kategori bernilai 0 tetap dikirim, mis. "Tidak Selaras")
 *  - bidang_pekerjaan dari GET /api/alumni (dimensi alumni, butuh login)
 *
 * Kalau tabel fakta masih kosong, daftarnya ikut kosong dan formulir
 * menampilkan pesan "opsi belum tersedia" — nilai tidak pernah
 * ditebak di frontend.
 */
export async function getKuisionerOptions() {
  const [detailRes, alumniRes, selarasRes] = await Promise.all([
    api.get('/olap/detail'),
    api.get('/alumni'),
    api.get('/olap/keselarasan').catch(() => ({ data: null })),
  ]);

  const detailRows = Array.isArray(detailRes.data?.data) ? detailRes.data.data : [];
  const alumniRows = Array.isArray(alumniRes.data) ? alumniRes.data : [];
  const selarasRows = Array.isArray(selarasRes.data?.data) ? selarasRes.data.data : [];

  const distinct = (values) => [...new Set(values.filter((v) => v != null && v !== ''))];

  const kategoriKeselarasan = distinct([
    ...detailRows.map((r) => r.hubungan_bidang),
    ...selarasRows.map((r) => r.kategori),
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
