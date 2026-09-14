import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ClipboardList, AlertCircle, GraduationCap, RefreshCw } from 'lucide-react';
import { useAuthStore } from '../../auth/store/authStore';
import api from '../../../services/api';
import { getKuisionerOptions } from '../services/tracerStudyApi';
import AlumniNavbar from '../components/AlumniNavbar';

/*
 * Kuisioner API-driven: seluruh opsi isian (program studi, specialisasi,
 * status bekerja, bidang pekerjaan, kesesuaian bidang) diambil dari API
 * OLAP PostgreSQL (lihat getKuisionerOptions di tracerStudyApi.js).
 * Tidak ada konstanta hardcode di frontend.
 *
 * Catatan kesesuaian dengan backend:
 *  - gender    : L/P (validasi API /api/profile: in:L,P)
 *  - jenjang   : D3/S1 (validasi API: in:D3,S1)
 *  - pengalaman: Ya/Tidak (validasi API: in:Ya,Tidak)
 *  - status bekerja: hanya nilai yang benar-benar ada di PostgreSQL
 *    (saat ini "Bekerja" & "Tidak Bekerja"; "Wirausaha/Startup"
 *    dihilangkan karena tidak ada di data OLAP)
 *  - tingkatPendidikanSesuai: TIDAK dikirim/ditampilkan — kolomnya
 *    tidak ada di PostgreSQL (schema PG tidak mengikuti migration)
 */

const EMPTY_FORM = {
  nama: '',
  gender: 'L',
  jenjang: 'S1',
  programStudi: '',
  specialisasi: '',
  pengalamanKerja: 'Tidak',
  tahunMasuk: '',
  tahunLulus: '',
  tanggalLulus: '',
  tanggalMulaiBekerja: '',
  ipk: '',
  statusBekerja: '',
  gajiJuta: '',
  jabatan: '',
  bidangPekerjaan: '',
  kesesuaianBidang: '',
};

export default function KuisionerPage() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [form, setForm] = useState(EMPTY_FORM);
  const [options, setOptions] = useState(null);
  const [optionsError, setOptionsError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const canFillKuisioner = user?.role === 'alumni' || user?.role === 'admin';

  const loadOptions = async () => {
    setOptionsError(null);
    try {
      setOptions(await getKuisionerOptions());
    } catch {
      setOptionsError('Gagal memuat opsi isian dari API OLAP PostgreSQL.');
    }
  };

  useEffect(() => {
    let active = true;
    (async () => {
      await loadOptions();
      try {
        const { data } = await api.get('/profile');
        if (data && active) {
          setForm({
            nama: data.nama || user?.name || '',
            gender: data.gender || 'L',
            jenjang: data.jenjang || 'S1',
            programStudi: data.programStudi || '',
            specialisasi: data.specialisasi || '',
            pengalamanKerja: data.pengalamanKerja || 'Tidak',
            tahunMasuk: data.tahunMasuk ?? '',
            tahunLulus: data.tahunLulus ?? '',
            tanggalLulus: data.tanggalLulus ?? '',
            tanggalMulaiBekerja: data.tanggalMulaiBekerja ?? '',
            ipk: data.ipk ?? '',
            statusBekerja: data.statusBekerja || '',
            gajiJuta: data.gajiJuta ?? '',
            jabatan: data.jabatan ?? '',
            bidangPekerjaan: data.bidangPekerjaan ?? '',
            kesesuaianBidang: data.kesesuaianBidang ?? '',
          });
        }
      } catch {
        // belum ada profil, biarkan form kosong
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const setField = (field, value) => setForm((f) => ({ ...f, [field]: value }));

  const isWorking = form.statusBekerja === 'Bekerja';

  const handleStatusBekerjaChange = (value) => {
    setForm((f) => {
      const next = { ...f, statusBekerja: value };
      if (value !== 'Bekerja') {
        // Keselarasan kerja hanya relevan untuk yang sudah bekerja;
        // dikosongkan agar tidak terkirim ke backend.
        next.jabatan = '';
        next.bidangPekerjaan = '';
        next.kesesuaianBidang = '';
      }
      return next;
    });
  };

  // Masa tunggu kerja dihitung otomatis dari tanggal kelulusan & tanggal
  // mulai bekerja pertama (selisih bulan penuh, minimal 0).
  const masaTungguBulan = (() => {
    if (!form.tanggalLulus || !form.tanggalMulaiBekerja) return null;
    const lulus = new Date(form.tanggalLulus);
    const mulai = new Date(form.tanggalMulaiBekerja);
    if (mulai < lulus) return 0;
    return Math.max(
      0,
      (mulai.getFullYear() - lulus.getFullYear()) * 12 +
        (mulai.getMonth() - lulus.getMonth())
    );
  })();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const payload = { ...form };
      if (payload.tahunMasuk !== '') payload.tahunMasuk = Number(payload.tahunMasuk);
      if (payload.tahunLulus !== '') payload.tahunLulus = Number(payload.tahunLulus);
      if (payload.ipk !== '') payload.ipk = Number(payload.ipk);
      if (payload.gajiJuta !== '') payload.gajiJuta = Number(payload.gajiJuta);
      delete payload.masaTungguBulan;
      const { data } = await api.post('/profile', payload);
      navigate('/kuisioner/sukses', {
        replace: true,
        state: {
          form: payload,
          profile: data.profile,
          prediksi: data.prediksi,
        },
      });
    } catch (err) {
      const first = err.response?.data?.errors;
      const message = first
        ? Object.values(first)[0]?.[0]
        : err.response?.data?.message || 'Gagal menyimpan kuisioner. Coba lagi.';
      setError(message);
    } finally {
      setSaving(false);
    }
  };

  const inputCls =
    'w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100';
  const labelCls = 'mb-1.5 block text-sm font-medium text-slate-700';

  const renderOptions = (values) => {
    if (!values?.length) {
      return <option value="">-- Tidak ada data dari API --</option>;
    }
    return values.map((opt) => (
      <option key={opt} value={opt}>
        {opt}
      </option>
    ));
  };

  /**
   * Satu pertanyaan keselarasan (Selaras / Tidak Selaras).
   *
   * Kedua dimensi memakai himpunan opsi yang sama, yaitu
   * options.kategoriKeselarasan dari dim_keselarasan PostgreSQL,
   * sehingga tidak ada nilai yang ditulis tetap di frontend.
   */
  const renderKeselarasan = (field, judul, pertanyaan) => (
    <div className="sm:col-span-2">
      <label className={labelCls}>{judul}</label>

      <p className="mb-2 text-xs text-slate-500">{pertanyaan}</p>

      <div className="grid gap-2 sm:grid-cols-2">
        {options.kategoriKeselarasan?.map((opt) => (
          <label
            key={opt}
            className={`flex cursor-pointer items-center gap-2 rounded-xl border px-3 py-2 text-sm transition ${
              form[field] === opt
                ? 'border-blue-500 bg-blue-50 text-blue-700'
                : 'border-slate-200 text-slate-600 hover:border-blue-300'
            }`}
          >
            <input
              type="radio"
              name={field}
              className="accent-blue-600"
              value={opt}
              checked={form[field] === opt}
              onChange={(e) => setField(field, e.target.value)}
              required
            />
            {opt}
          </label>
        ))}

        {!options.kategoriKeselarasan?.length && (
          <p className="text-sm text-slate-400">-- Tidak ada data dari API --</p>
        )}
      </div>
    </div>
  );

  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      <AlumniNavbar />

      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-6">
        {!canFillKuisioner ? (
          <div className="rounded-2xl border border-slate-100 bg-white p-8 text-center shadow-sm">
            <AlertCircle className="mx-auto h-10 w-10 text-amber-500" />
            <h1 className="mt-3 text-lg font-bold text-slate-800">Khusus Alumni</h1>
            <p className="mt-1 text-sm text-slate-500">
              Halaman ini hanya dapat diakses oleh pengguna dengan role alumni.
            </p>
          </div>
        ) : (
          <>
            <div className="rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 p-5 text-white shadow-md sm:p-6">
              <h1 className="flex items-center gap-2 text-xl font-bold">
                <ClipboardList className="h-5 w-5" /> Kuisioner Alumni
              </h1>
              <p className="mt-1 text-sm text-blue-100">
                Isi data sesuai tracer study. Seluruh opsi isian diambil langsung
                dari API OLAP PostgreSQL.
              </p>
            </div>

            {optionsError && (
              <div className="mt-4 flex items-center justify-between gap-2 rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-700">
                <span className="flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 shrink-0" /> {optionsError}
                </span>
                <button
                  type="button"
                  onClick={loadOptions}
                  className="flex items-center gap-1 rounded-lg border border-amber-300 px-2.5 py-1 text-xs font-medium hover:bg-amber-100"
                >
                  <RefreshCw className="h-3.5 w-3.5" /> Muat Ulang
                </button>
              </div>
            )}

            {error && (
              <div className="mt-4 flex items-center gap-2 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">
                <AlertCircle className="h-4 w-4 shrink-0" /> {error}
              </div>
            )}

            <form
              onSubmit={handleSubmit}
              className="mt-4 rounded-2xl border border-slate-100 bg-white p-5 shadow-sm sm:p-6"
            >
              {loading || !options ? (
                <p className="py-8 text-center text-sm text-slate-400">
                  {loading ? 'Memuat kuisioner...' : 'Memuat opsi dari API OLAP...'}
                </p>
              ) : (
                <>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="sm:col-span-2">
                      <label className={labelCls}>Nama Lengkap</label>
                      <input
                        className={inputCls}
                        value={form.nama}
                        onChange={(e) => setField('nama', e.target.value)}
                        required
                      />
                    </div>

                    <div>
                      <label className={labelCls}>Jenis Kelamin</label>
                      <select
                        className={inputCls}
                        value={form.gender}
                        onChange={(e) => setField('gender', e.target.value)}
                      >
                        <option value="L">Laki-laki</option>
                        <option value="P">Perempuan</option>
                      </select>
                    </div>

                    <div>
                      <label className={labelCls}>Jenjang Pendidikan</label>
                      <select
                        className={inputCls}
                        value={form.jenjang}
                        onChange={(e) => setField('jenjang', e.target.value)}
                      >
                        <option value="S1">S1 (4 tahun)</option>
                        <option value="D3">D3 (3 tahun)</option>
                      </select>
                    </div>

                    <div>
                      <label className={labelCls}>Program Studi</label>
                      <select
                        className={inputCls}
                        value={form.programStudi}
                        onChange={(e) => setField('programStudi', e.target.value)}
                        required
                      >
                        <option value="">-- Pilih --</option>
                        {renderOptions(options.programStudi)}
                      </select>
                    </div>

                    <div>
                      <label className={labelCls}>Specialisasi</label>
                      <select
                        className={inputCls}
                        value={form.specialisasi}
                        onChange={(e) => setField('specialisasi', e.target.value)}
                        required
                      >
                        <option value="">-- Pilih --</option>
                        {renderOptions(options.specialisasi)}
                      </select>
                    </div>

                    <div>
                      <label className={labelCls}>Pengalaman Kerja</label>
                      <select
                        className={inputCls}
                        value={form.pengalamanKerja}
                        onChange={(e) => setField('pengalamanKerja', e.target.value)}
                      >
                        <option value="Ya">Ya</option>
                        <option value="Tidak">Tidak</option>
                      </select>
                    </div>

                    <div className="flex items-end pb-1">
                      <p className="flex items-center gap-1.5 text-xs text-slate-400">
                        <GraduationCap className="h-3.5 w-3.5" /> Ketepatan lulus dihitung
                        otomatis: {form.jenjang === 'D3' ? '≤ 3' : '≤ 4'} tahun.
                      </p>
                    </div>

                    <div>
                      <label className={labelCls}>Tahun Masuk</label>
                      <input
                        type="number"
                        min="2000"
                        max={new Date().getFullYear()}
                        className={inputCls}
                        value={form.tahunMasuk}
                        onChange={(e) => setField('tahunMasuk', e.target.value)}
                        required
                      />
                    </div>

                    <div>
                      <label className={labelCls}>Tahun Lulus</label>
                      <input
                        type="number"
                        min="2000"
                        max={new Date().getFullYear() + 1}
                        className={inputCls}
                        value={form.tahunLulus}
                        onChange={(e) => setField('tahunLulus', e.target.value)}
                        required
                      />
                    </div>

                    <div>
                      <label className={labelCls}>IPK</label>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        max="4"
                        className={inputCls}
                        value={form.ipk}
                        onChange={(e) => setField('ipk', e.target.value)}
                        required
                      />
                    </div>

                    <div>
                      <label className={labelCls}>Status Bekerja</label>
                      <select
                        className={inputCls}
                        value={form.statusBekerja}
                        onChange={(e) => handleStatusBekerjaChange(e.target.value)}
                        required
                      >
                        <option value="">-- Pilih --</option>
                        {renderOptions(options.statusBekerja)}
                      </select>
                    </div>

                    <div>
                      <label className={labelCls}>Tanggal Lulus</label>
                      <input
                        type="date"
                        max={new Date().toISOString().slice(0, 10)}
                        className={inputCls}
                        value={form.tanggalLulus}
                        onChange={(e) => setField('tanggalLulus', e.target.value)}
                      />
                    </div>

                    <div>
                      <label className={labelCls}>Tanggal Mulai Bekerja Pertama</label>
                      <input
                        type="date"
                        min={form.tanggalLulus || undefined}
                        max={new Date().toISOString().slice(0, 10)}
                        className={inputCls}
                        value={form.tanggalMulaiBekerja}
                        onChange={(e) => setField('tanggalMulaiBekerja', e.target.value)}
                        placeholder="Opsional, untuk yang sudah bekerja"
                      />
                      <p className="mt-1.5 text-xs text-slate-400">
                        {masaTungguBulan === null
                          ? 'Masa tunggu kerja dihitung otomatis: selisih tanggal mulai bekerja pertama dengan tanggal lulus (hanya untuk yang sudah bekerja).'
                          : `Masa tunggu otomatis: ${masaTungguBulan} bulan.`}
                      </p>
                    </div>

                    <div>
                      <label className={labelCls}>Gaji (Rp juta/bulan)</label>
                      <input
                        type="number"
                        step="0.1"
                        min="0"
                        className={inputCls}
                        value={form.gajiJuta}
                        onChange={(e) => setField('gajiJuta', e.target.value)}
                        placeholder="Opsional"
                      />
                    </div>

                    {isWorking && (
                      <>
                        <div className="sm:col-span-2">
                          <p className="mb-1 border-t border-slate-100 pt-4 text-sm font-semibold text-blue-600">
                            Keselarasan Pekerjaan (hanya untuk yang sudah bekerja)
                          </p>
                          <p className="mb-3 text-xs text-slate-500">
                            Keselarasan diukur pada dua dimensi. Horizontal
                            menilai kesesuaian bidang pekerjaan dengan bidang
                            studi, vertikal menilai kesesuaian tingkat
                            pekerjaan dengan jenjang pendidikan yang Anda
                            tempuh.
                          </p>
                        </div>

                        <div className="sm:col-span-2">
                          <label className={labelCls}>Jabatan / Posisi Saat Ini</label>
                          <input
                            className={inputCls}
                            value={form.jabatan}
                            onChange={(e) => setField('jabatan', e.target.value)}
                            placeholder="Contoh: Staf IT Support, Pengelola Usaha"
                            required
                          />
                        </div>

                        <div className="sm:col-span-2">
                          <label className={labelCls}>Bidang Pekerjaan</label>
                          <select
                            className={inputCls}
                            value={form.bidangPekerjaan}
                            onChange={(e) => setField('bidangPekerjaan', e.target.value)}
                            required
                          >
                            <option value="">-- Pilih --</option>
                            {renderOptions(options.bidangPekerjaan)}
                          </select>
                        </div>

                        {renderKeselarasan(
                          'kesesuaianBidang',
                          'Keselarasan horizontal',
                          'Apakah bidang pekerjaan Anda saat ini sesuai dengan bidang studi yang Anda tempuh?'
                        )}

                        {renderKeselarasan(
                          'tingkatPendidikanSesuai',
                          'Keselarasan vertikal',
                          'Apakah tingkat pekerjaan Anda saat ini sesuai dengan jenjang pendidikan Anda? Pekerjaan pada tingkat yang sama atau lebih tinggi dinilai Selaras, pekerjaan pada tingkat yang lebih rendah dinilai Tidak Selaras.'
                        )}
                      </>
                    )}
                  </div>

                  <button
                    type="submit"
                    disabled={saving}
                    className="mt-6 w-full rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {saving ? 'Menyimpan...' : 'Simpan Kuisioner'}
                  </button>
                </>
              )}
            </form>
          </>
        )}
      </main>
    </div>
  );
}