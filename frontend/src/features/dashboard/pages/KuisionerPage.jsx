import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ClipboardList, AlertCircle, GraduationCap } from 'lucide-react';
import { useAuthStore } from '../../auth/store/authStore';
import api from '../../../services/api';
import CareerNavbar from '../../career/components/CareerNavbar';

const PROGRAM_STUDI_OPTIONS = [
  { value: 'Sci&Tech', label: 'Teknik Informatika' },
  { value: 'Comm&Mgmt', label: 'Manajemen' },
  { value: 'Others', label: 'Akuntansi' },
];
const SPECIALISASI_OPTIONS = ['Mkt&HR', 'Data Analytics', 'Software Dev', 'Other'];
const STATUS_BEKERJA_OPTIONS = [
  'Bekerja',
  'Wirausaha/Startup',
  'Melanjutkan Studi',
  'Belum Bekerja',
  'Belum Memungkinkan Bekerja',
];
const BIDANG_PEKERJAAN_OPTIONS = [
  'Teknologi Informasi dan Komunikasi',
  'Manajemen, Administrasi, dan Penjualan',
  'Logistik dan Transportasi',
  'Keuangan dan Asuransi',
  'Pendidikan',
  'Produksi dan Industri',
  'Perdagangan dan Distribusi',
  'Jasa Lainnya',
];
const KESESUAIAN_BIDANG_OPTIONS = [
  'Sangat erat',
  'Erat',
  'Cukup erat',
  'Kurang erat',
  'Tidak sama sekali',
];
const TINGKAT_PENDIDIKAN_OPTIONS = [
  'Setingkat lebih tinggi',
  'Tingkat yang sama',
  'Setingkat lebih rendah',
  'Tidak perlu pendidikan tinggi',
];
const STATUS_BEKERJA_KEJA = ['Bekerja', 'Wirausaha/Startup'];

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
  tingkatPendidikanSesuai: '',
};

export default function KuisionerPage() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [form, setForm] = useState(EMPTY_FORM);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const canFillKuisioner = user?.role === 'alumni' || user?.role === 'admin';

  useEffect(() => {
    let active = true;
    (async () => {
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
            tingkatPendidikanSesuai: data.tingkatPendidikanSesuai ?? '',
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
  }, [user]);

  const setField = (field, value) => setForm((f) => ({ ...f, [field]: value }));

  const isWorking = STATUS_BEKERJA_KEJA.includes(form.statusBekerja);

  const handleStatusBekerjaChange = (value) => {
    setForm((f) => {
      const next = { ...f, statusBekerja: value };
      if (!STATUS_BEKERJA_KEJA.includes(value)) {
        // Keselarasan kerja hanya relevan untuk yang sudah bekerja/wirausaha;
        // dikosongkan agar tidak terkirim ke backend.
        next.jabatan = '';
        next.bidangPekerjaan = '';
        next.kesesuaianBidang = '';
        next.tingkatPendidikanSesuai = '';
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
      // Setelah tersimpan, pindah ke halaman konfirmasi — form tidak
      // ditampilkan lagi.
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

  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      <CareerNavbar />

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
                Isi data sesuai format tracer study. Data akan disimpan ke database dan
                diproses dengan Random Forest (lulus tepat waktu / tidak tepat waktu
                sesuai jenjang D3 = 3 tahun, S1 = 4 tahun).
              </p>
            </div>

            {error && (
              <div className="mt-4 flex items-center gap-2 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">
                <AlertCircle className="h-4 w-4 shrink-0" /> {error}
              </div>
            )}

            <form
              onSubmit={handleSubmit}
              className="mt-4 rounded-2xl border border-slate-100 bg-white p-5 shadow-sm sm:p-6"
            >
              {loading ? (
                <p className="py-8 text-center text-sm text-slate-400">Memuat kuisioner...</p>
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
                        {PROGRAM_STUDI_OPTIONS.map((opt) => (
                          <option key={opt.value} value={opt.value}>
                            {opt.label}
                          </option>
                        ))}
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
                        {SPECIALISASI_OPTIONS.map((opt) => (
                          <option key={opt} value={opt}>
                            {opt}
                          </option>
                        ))}
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
                        {STATUS_BEKERJA_OPTIONS.map((opt) => (
                          <option key={opt} value={opt}>
                            {opt}
                          </option>
                        ))}
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
                          <p className="mb-3 border-t border-slate-100 pt-4 text-sm font-semibold text-blue-600">
                            Keselarasan Bidang Kerja (hanya untuk yang sudah bekerja)
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
                            {BIDANG_PEKERJAAN_OPTIONS.map((opt) => (
                              <option key={opt} value={opt}>
                                {opt}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div className="sm:col-span-2">
                          <label className={labelCls}>
                            Seberapa erat hubungan antara bidang studi dengan pekerjaan Anda
                            saat ini?
                          </label>
                          <div className="grid gap-2 sm:grid-cols-3">
                            {KESESUAIAN_BIDANG_OPTIONS.map((opt) => (
                              <label
                                key={opt}
                                className={`flex cursor-pointer items-center gap-2 rounded-xl border px-3 py-2 text-sm transition ${
                                  form.kesesuaianBidang === opt
                                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                                    : 'border-slate-200 text-slate-600 hover:border-blue-300'
                                }`}
                              >
                                <input
                                  type="radio"
                                  name="kesesuaianBidang"
                                  className="accent-blue-600"
                                  value={opt}
                                  checked={form.kesesuaianBidang === opt}
                                  onChange={(e) => setField('kesesuaianBidang', e.target.value)}
                                  required
                                />
                                {opt}
                              </label>
                            ))}
                          </div>
                        </div>

                        <div className="sm:col-span-2">
                          <label className={labelCls}>
                            Menurut Anda, tingkat pendidikan apa yang paling sesuai untuk
                            pekerjaan Anda saat ini?
                          </label>
                          <div className="grid gap-2 sm:grid-cols-2">
                            {TINGKAT_PENDIDIKAN_OPTIONS.map((opt) => (
                              <label
                                key={opt}
                                className={`flex cursor-pointer items-center gap-2 rounded-xl border px-3 py-2 text-sm transition ${
                                  form.tingkatPendidikanSesuai === opt
                                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                                    : 'border-slate-200 text-slate-600 hover:border-blue-300'
                                }`}
                              >
                                <input
                                  type="radio"
                                  name="tingkatPendidikanSesuai"
                                  className="accent-blue-600"
                                  value={opt}
                                  checked={form.tingkatPendidikanSesuai === opt}
                                  onChange={(e) =>
                                    setField('tingkatPendidikanSesuai', e.target.value)
                                  }
                                  required
                                />
                                {opt}
                              </label>
                            ))}
                          </div>
                        </div>
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
