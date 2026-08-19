import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  CheckCircle2,
  GraduationCap,
  CalendarDays,
  Briefcase,
  LayoutDashboard,
} from 'lucide-react';
import api from '../../../services/api';
import AlumniNavbar from '../components/AlumniNavbar';
import { prodiLabel } from '../../../utils/prodiLabel';

const STATUS_LABEL = {
  Bekerja: 'Bekerja',
  'Wirausaha/Startup': 'Wirausaha/Startup',
  'Melanjutkan Studi': 'Melanjutkan Studi',
  'Belum Bekerja': 'Belum Bekerja',
  'Belum Memungkinkan Bekerja': 'Belum Memungkinkan Bekerja',
};

export default function KuisionerSuccessPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const { data } = await api.get('/profile');
        if (!data) {
          // Belum pernah mengisi kuisioner — arahkan kembali ke form.
          navigate('/kuisioner', { replace: true });
          return;
        }
        if (active) setProfile(data);
      } catch {
        // Jaringan bermasalah: pakai data yang dikirim lewat state navigasi.
        const fromState = location.state?.profile;
        if (fromState) {
          if (active) setProfile(fromState);
        } else {
          navigate('/kuisioner', { replace: true });
        }
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [navigate, location.state]);

  const jenjang = profile?.jenjang || 'S1';
  const durasiIdeal = jenjang === 'D3' ? 3 : 4;
  const masaStudi =
    profile?.tahunLulus != null && profile?.tahunMasuk != null
      ? profile.tahunLulus - profile.tahunMasuk
      : null;
  const lulusTepatWaktu = profile?.lulusTepatWaktu;

  const rows = [
    { label: 'Nama Lengkap', value: profile?.nama || '—' },
    {
      label: 'Jenis Kelamin',
      value: profile?.gender === 'P' ? 'Perempuan' : 'Laki-laki',
    },
    { label: 'Jenjang Pendidikan', value: `${jenjang} (${durasiIdeal} tahun)` },
    { label: 'Program Studi', value: prodiLabel(profile?.programStudi) || '—' },
    { label: 'Specialisasi', value: profile?.specialisasi || '—' },
    { label: 'Pengalaman Kerja', value: profile?.pengalamanKerja || '—' },
    { label: 'Tahun Masuk', value: profile?.tahunMasuk ?? '—' },
    { label: 'Tahun Lulus', value: profile?.tahunLulus ?? '—' },
    {
      label: 'Masa Studi',
      value: masaStudi !== null ? `${masaStudi} tahun` : '—',
    },
    { label: 'IPK', value: profile?.ipk != null ? Number(profile.ipk).toFixed(2) : '—' },
    { label: 'Status Bekerja', value: STATUS_LABEL[profile?.statusBekerja] || '—' },
    {
      label: 'Tanggal Lulus',
      value: profile?.tanggalLulus ? new Date(profile.tanggalLulus).toLocaleDateString('id-ID') : '—',
    },
    {
      label: 'Mulai Bekerja Pertama',
      value: profile?.tanggalMulaiBekerja
        ? new Date(profile.tanggalMulaiBekerja).toLocaleDateString('id-ID')
        : '—',
    },
    {
      label: 'Masa Tunggu',
      value:
        profile?.masaTungguBulan != null
          ? `${profile.masaTungguBulan} bulan`
          : profile?.statusBekerja === 'Bekerja' || profile?.statusBekerja === 'Wirausaha/Startup'
            ? 'Belum diketahui'
            : 'Tidak berlaku',
    },
    {
      label: 'Gaji (Rp juta/bulan)',
      value: profile?.gajiJuta != null ? Number(profile.gajiJuta).toFixed(1) : '—',
    },
  ];

  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      <AlumniNavbar />

      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-6">
        {loading ? (
          <p className="py-16 text-center text-sm text-slate-400">Memuat data...</p>
        ) : (
          <>
            <div className="rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 p-5 text-white shadow-md sm:p-6">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="mt-1 h-8 w-8 shrink-0" />
                <div>
                  <h1 className="text-xl font-bold">Kuisioner Berhasil Disimpan</h1>
                  <p className="mt-1 text-sm text-emerald-100">
                    Data tracer study Anda telah tersimpan di database dan siap diproses
                    sistem (OLAP, Random Forest, dan Job Matching).
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-4 rounded-2xl border border-slate-100 bg-white p-5 shadow-sm sm:p-6">
              <h2 className="flex items-center gap-2 text-base font-bold text-slate-800">
                <GraduationCap className="h-5 w-5 text-blue-600" /> Prediksi Ketepatan Lulus
              </h2>
              <div className="mt-3 flex flex-wrap items-center gap-2 text-sm text-slate-600">
                <span className="inline-flex items-center gap-1.5 rounded-lg bg-blue-50 px-3 py-1.5 font-medium text-blue-700">
                  <CalendarDays className="h-4 w-4" />
                  Masa studi {masaStudi ?? '—'} tahun (ideal {jenjang} = {durasiIdeal} tahun)
                </span>
                {lulusTepatWaktu != null && (
                  <span
                    className={
                      lulusTepatWaktu
                        ? 'inline-flex items-center gap-1.5 rounded-lg bg-emerald-100 px-3 py-1.5 font-semibold text-emerald-700'
                        : 'inline-flex items-center gap-1.5 rounded-lg bg-amber-100 px-3 py-1.5 font-semibold text-amber-700'
                    }
                  >
                    <CheckCircle2 className="h-4 w-4" />
                    {lulusTepatWaktu ? 'LULUS TEPAT WAKTU' : 'TIDAK TEPAT WAKTU'}
                  </span>
                )}
              </div>
            </div>

            <div className="mt-4 rounded-2xl border border-slate-100 bg-white p-5 shadow-sm sm:p-6">
              <h2 className="flex items-center gap-2 text-base font-bold text-slate-800">
                <Briefcase className="h-5 w-5 text-blue-600" /> Ringkasan Data yang Disimpan
              </h2>
              <dl className="mt-4 grid gap-x-6 gap-y-3 sm:grid-cols-2">
                {rows.map((row) => (
                  <div key={row.label} className="flex flex-col border-b border-slate-100 pb-2">
                    <dt className="text-xs font-medium text-slate-400">{row.label}</dt>
                    <dd className="mt-0.5 text-sm font-semibold text-slate-700">{row.value}</dd>
                  </div>
                ))}
              </dl>
            </div>

            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              <Link
                to="/dashboard"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
              >
                <LayoutDashboard className="h-4 w-4" /> Kembali ke Dashboard
              </Link>
              <Link
                to="/profile"
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-blue-600 bg-white px-4 py-2.5 text-sm font-semibold text-blue-600 transition hover:bg-blue-50"
              >
                <GraduationCap className="h-4 w-4" /> Lihat Profil Saya
              </Link>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
