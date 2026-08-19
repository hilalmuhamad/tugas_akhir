import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserCircle2, Mail, GraduationCap, CalendarDays, ClipboardList } from 'lucide-react';
import { useAuthStore } from '../../auth/store/authStore';
import AlumniNavbar from '../components/AlumniNavbar';
import { getTracerProfile } from '../services/tracerStudyApi';
import { prodiLabel } from '../../../utils/prodiLabel';

export default function ProfilePage() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let active = true;

    (async () => {
      try {
        const data = await getTracerProfile();
        if (active) {
          setProfile(data);
        }
      } catch {
        if (active) {
          setError('Data profil belum dapat dimuat. Silakan coba lagi.');
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    })();

    return () => {
      active = false;
    };
  }, []);

  return (
    <div className="min-h-screen bg-slate-50">
      <AlumniNavbar />

      <main className="mx-auto w-full max-w-4xl px-4 py-6">
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm md:p-6">
          <h1 className="text-2xl font-bold text-slate-900">Profil Saya</h1>
          <p className="mt-2 text-sm text-slate-600">
            Informasi profil ini digunakan untuk mendukung pengisian tracer study secara akurat.
          </p>
        </section>

        {loading ? (
          <div className="mt-6 h-48 animate-pulse rounded-2xl bg-slate-200" />
        ) : error ? (
          <section className="mt-6 rounded-2xl border border-rose-200 bg-rose-50 p-5 text-center">
            <p className="font-semibold text-rose-700">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-4 rounded-xl bg-rose-600 px-4 py-2 text-sm font-semibold text-white"
            >
              Coba Lagi
            </button>
          </section>
        ) : (
          <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm md:p-6">
            <div className="grid gap-4 md:grid-cols-2">
              <Info icon={UserCircle2} label="Nama" value={profile?.nama || user?.name || 'Belum tersedia'} />
              <Info icon={Mail} label="Email" value={user?.email || 'Belum tersedia'} />
              <Info
                icon={GraduationCap}
                label="Program Studi"
                value={profile?.programStudi ? prodiLabel(profile.programStudi) : 'Belum tersedia'}
              />
              <Info icon={GraduationCap} label="Jenjang" value={profile?.jenjang || 'Belum tersedia'} />
              <Info icon={CalendarDays} label="Tahun Masuk" value={profile?.tahunMasuk || 'Belum tersedia'} />
              <Info icon={CalendarDays} label="Tahun Lulus" value={profile?.tahunLulus || 'Belum tersedia'} />
              <Info
                icon={ClipboardList}
                label="Status Tracer Study"
                value={profile?.id ? 'Sudah Mengisi' : 'Belum Mengisi'}
              />
            </div>

            <div className="mt-6 flex flex-wrap gap-3">
              <button
                onClick={() => navigate('/kuisioner')}
                className="rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
              >
                {profile?.id ? 'Perbarui Data Tracer Study' : 'Lengkapi Profil'}
              </button>
              <button
                onClick={() => navigate('/dashboard')}
                className="rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                Kembali ke Dashboard
              </button>
            </div>
          </section>
        )}
      </main>
    </div>
  );
}

function Info({ icon: Icon, label, value }) {
  return (
    <div className="rounded-xl border border-slate-100 p-4">
      <p className="flex items-center gap-2 text-xs text-slate-500">
        <Icon className="h-4 w-4" /> {label}
      </p>
      <p className="mt-1 text-sm font-semibold text-slate-800">{value}</p>
    </div>
  );
}
