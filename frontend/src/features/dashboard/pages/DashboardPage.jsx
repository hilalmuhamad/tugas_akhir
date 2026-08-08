import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Sparkles,
  Briefcase,
  TrendingUp,
  Clock,
  Wallet,
  ArrowRight,
  Search,
  FileText,
  History,
  User,
  Mail,
  BarChart3,
  Target,
  GraduationCap,
  Building2,
} from 'lucide-react';
import { useAuthStore } from '../../auth/store/authStore';
import { getAnalysis, getHistory } from '../../career/services/careerApi';
import { fetchJobs } from '../../jobs/services/jobApi';
import api from '../../../services/api';
import CareerNavbar from '../../career/components/CareerNavbar';
import JobRecommendationCards from '../../career/components/JobRecommendationCards';
import { laporanUnduhUrl } from '../utils/laporan';

const ROLE_LABEL = { admin: 'Admin', alumni: 'Alumni', viewer: 'Viewer' };

export default function DashboardPage() {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [totalJobs, setTotalJobs] = useState(null);
  const [latestJobs, setLatestJobs] = useState([]);
  const [history, setHistory] = useState([]);
  const [personalJobs, setPersonalJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    let active = true;

    (async () => {
      try {
        const [statsRes, jobsRes, historyRes] = await Promise.all([
          api.get('/stats'),
          fetchJobs(),
          getHistory(),
        ]);
        if (!active) return;

        const jobs = jobsRes.data || [];
        setStats(statsRes.data);
        setTotalJobs(jobs.length);
        setLatestJobs(jobs.slice(0, 6));
        setHistory(historyRes.data || []);

        if (historyRes.data?.length > 0) {
          try {
            const detail = await getAnalysis(historyRes.data[0].id);
            if (active) setPersonalJobs(detail.data.lowongan || []);
          } catch {
            // rekomendasi opsional
          }
        }
      } catch {
        // biarkan tampil kosong
      } finally {
        if (active) setLoading(false);
      }
    })();

    return () => {
      active = false;
    };
  }, []);

  const generateLaporan = async () => {
    if (generating) return;
    setGenerating(true);
    // Unduh ditangani langsung oleh browser via endpoint backend (andal,
    // tidak kena pemblokiran klik sintetis), lalu buka halaman laporan.
    window.location.href = laporanUnduhUrl();
    setTimeout(() => {
      setGenerating(false);
      navigate('/laporan');
    }, 500);
  };

  const hariIni = new Date().toLocaleDateString('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  const terakhirAnalisis = history[0]?.created_at
    ? new Date(history[0].created_at).toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      })
    : '-';

  const cards = [
    {
      label: 'Total Lowongan Aktif',
      value: totalJobs ?? '…',
      icon: Briefcase,
      color: 'bg-blue-50 text-blue-600',
    },
    {
      label: 'Alumni Sudah Bekerja',
      value: stats ? `${stats.persentase_kerja ?? 0}%` : '…',
      sub: stats ? `${stats.alumni_bekerja} dari ${stats.total_alumni} alumni` : '',
      icon: TrendingUp,
      color: 'bg-emerald-50 text-emerald-600',
    },
    {
      label: 'Masa Tunggu Rata-rata',
      value: stats && stats.masa_tunggu_rata != null ? `${stats.masa_tunggu_rata} bln` : '…',
      icon: Clock,
      color: 'bg-amber-50 text-amber-600',
    },
    {
      label: 'Gaji Awal Rata-rata',
      value: stats && stats.gaji_rata_rata != null ? `Rp ${stats.gaji_rata_rata} jt` : '…',
      sub: 'per bulan',
      icon: Wallet,
      color: 'bg-violet-50 text-violet-600',
    },
  ];

  const gajiPerProdi = stats?.gaji_per_prodi
    ? Object.entries(stats.gaji_per_prodi).sort((a, b) => b[1] - a[1])
    : [];
  const persenPerProdi = stats?.persen_kerja_per_prodi
    ? Object.entries(stats.persen_kerja_per_prodi).sort((a, b) => b[1] - a[1])
    : [];
  const maxGaji = Math.max(...gajiPerProdi.map(([, v]) => v), 1);

  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      <CareerNavbar />

      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6">
        {/* Banner sapaan */}
        <div className="relative flex flex-col gap-5 overflow-hidden rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 p-5 text-white shadow-md sm:p-8 md:flex-row md:items-center md:justify-between md:gap-8">
          {/* Pola latar halus — ikon siluet di ujung kanan dengan shadow */}
          <div aria-hidden="true" className="pointer-events-none absolute inset-0">
            <GraduationCap
              className="absolute -right-6 -top-12 h-40 w-40 rotate-12 text-white/10 drop-shadow-[0_0_25px_rgba(255,255,255,0.35)] sm:h-48 sm:w-48"
              strokeWidth={1}
            />
            <Briefcase
              className="absolute -bottom-16 right-2 h-40 w-40 -rotate-6 text-white/10 drop-shadow-[0_0_25px_rgba(255,255,255,0.35)] sm:h-48 sm:w-48"
              strokeWidth={1}
            />
            <Building2
              className="absolute right-44 -top-8 h-24 w-24 rotate-6 text-white/15 drop-shadow-[0_0_20px_rgba(255,255,255,0.3)] sm:right-56 sm:h-28 sm:w-28"
              strokeWidth={1.2}
            />
            <TrendingUp
              className="absolute bottom-8 right-44 h-20 w-20 -rotate-12 text-white/15 drop-shadow-[0_0_20px_rgba(255,255,255,0.3)] sm:bottom-10 sm:right-56"
              strokeWidth={1.2}
            />
          </div>

          <div className="relative z-10 min-w-0 max-w-3xl">
            <p className="text-xs font-medium text-white sm:text-sm">{hariIni}</p>
            <h1 className="mt-1.5 min-w-0 truncate text-3xl font-extrabold tracking-tight sm:text-4xl">
              Halo,{' '}
              {user?.name
                ? user.name
                    .split(' ')
                    .map((w) => (w ? w.charAt(0).toUpperCase() + w.slice(1) : w))
                    .join(' ')
                : ''}
              !
            </h1>
            <div className="mt-1.5 flex flex-wrap items-center gap-x-2.5 gap-y-1.5">
              <span className="rounded-full border border-white/40 px-2.5 py-0.5 text-[11px] font-semibold text-white">
                {ROLE_LABEL[user?.role] || 'Pengguna'}
              </span>
              <p className="min-w-0 text-xs text-white sm:text-sm">
                Pantau statistik alumni dan temukan lowongan yang cocok dengan profil Anda.
              </p>
            </div>
            <div className="mt-4 flex flex-wrap gap-2.5">
              <button
                onClick={() => navigate('/analyze')}
                className="flex h-11 items-center justify-center gap-1.5 rounded-2xl bg-white px-4 text-sm font-semibold text-blue-700 shadow-md transition hover:bg-blue-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70 sm:px-5"
              >
                <Sparkles className="h-4 w-4" /> Analisis Karier
              </button>
              <button
                onClick={() => navigate('/jobs')}
                className="flex h-11 items-center justify-center gap-1.5 rounded-2xl border border-white/40 px-4 text-sm font-semibold text-white transition hover:bg-black/15 hover:border-white/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70 sm:px-5"
              >
                <Search className="h-4 w-4" /> Cari Kerja
              </button>
              <button
                onClick={generateLaporan}
                disabled={generating}
                aria-busy={generating}
                className="flex h-11 items-center justify-center gap-1.5 rounded-2xl px-4 text-sm font-semibold text-white transition hover:bg-black/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70 disabled:cursor-not-allowed disabled:opacity-60 sm:px-5"
              >
                <FileText className="h-4 w-4" />
                <span>{generating ? 'Mengunduh...' : 'Generate Laporan IKU'}</span>
                <span aria-live="polite" className="sr-only">
                  {generating
                    ? 'Laporan sedang diunduh, mohon tunggu.'
                    : 'Laporan siap diunduh.'}
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* Kartu statistik */}
        <div className="mt-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
          {cards.map((card) => (
            <div
              key={card.label}
              className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm"
            >
              <span className={`flex h-9 w-9 items-center justify-center rounded-xl ${card.color}`}>
                <card.icon className="h-4.5 w-4.5" />
              </span>
              <p className="mt-3 text-xl font-bold text-slate-900">{card.value}</p>
              <p className="text-xs font-medium text-slate-500">{card.label}</p>
              {card.sub && <p className="mt-0.5 text-[11px] text-slate-400">{card.sub}</p>}
            </div>
          ))}
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-3">
          {/* Konten utama */}
          <div className="lg:col-span-2">
            {loading ? (
              <div className="rounded-2xl border border-slate-100 bg-white p-10 text-center text-sm text-slate-400">
                Memuat dashboard...
              </div>
            ) : personalJobs.length > 0 ? (
              <JobRecommendationCards jobs={personalJobs} />
            ) : (
              <div className="rounded-2xl border border-slate-100 bg-white p-8 text-center shadow-sm">
                <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
                  <FileText className="h-6 w-6" />
                </span>
                <h3 className="mt-3 font-bold text-slate-800">
                  Belum ada rekomendasi khusus untuk Anda
                </h3>
                <p className="mx-auto mt-1 max-w-sm text-sm text-slate-500">
                  Lakukan analisis karier dari profil Anda, dan sistem akan mencocokkan
                  lowongan yang paling cocok secara otomatis.
                </p>
                <button
                  onClick={() => navigate('/analyze')}
                  className="mt-4 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
                >
                  Mulai Analisis Karier
                </button>
              </div>
            )}

            {/* Grafik data alumni per prodi */}
            {!loading && stats && (
              <div className="mt-6 rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
                <h3 className="flex items-center gap-2 font-bold text-slate-800">
                  <BarChart3 className="h-4 w-4 text-slate-400" /> Data Alumni per Program Studi
                </h3>
                <div className="mt-4 grid gap-6 sm:grid-cols-2">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                      Gaji rata-rata (Rp juta/bln)
                    </p>
                    <div className="mt-2 space-y-2">
                      {gajiPerProdi.map(([prodi, nilai]) => (
                        <div key={prodi}>
                          <div className="flex items-center justify-between text-xs text-slate-600">
                            <span className="font-medium">{prodi}</span>
                            <span className="font-semibold">{nilai} jt</span>
                          </div>
                          <div className="mt-1 h-2 rounded-full bg-slate-100">
                            <div
                              className="h-2 rounded-full bg-gradient-to-r from-blue-500 to-indigo-500"
                              style={{ width: `${Math.round((nilai / maxGaji) * 100)}%` }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                      Alumni sudah bekerja (%)
                    </p>
                    <div className="mt-2 space-y-2">
                      {persenPerProdi.map(([prodi, nilai]) => (
                        <div key={prodi}>
                          <div className="flex items-center justify-between text-xs text-slate-600">
                            <span className="font-medium">{prodi}</span>
                            <span className="font-semibold">{nilai}%</span>
                          </div>
                          <div className="mt-1 h-2 rounded-full bg-slate-100">
                            <div
                              className="h-2 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500"
                              style={{ width: `${Math.min(nilai, 100)}%` }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Lowongan terbaru */}
            <div className="mt-6 rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-slate-800">Lowongan Terbaru</h3>
                <Link
                  to="/jobs"
                  className="flex items-center gap-1 text-sm font-semibold text-blue-600 hover:text-blue-700"
                >
                  Lihat semua <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
              <div className="mt-3 space-y-2">
                {latestJobs.map((job) => (
                  <Link
                    key={job.id}
                    to={`/jobs/${job.id}`}
                    className="flex items-center justify-between gap-3 rounded-xl border border-slate-100 px-4 py-3 transition hover:border-blue-200 hover:bg-blue-50/40"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-slate-800">
                        {job.judul_posisi}
                      </p>
                      <p className="truncate text-xs text-slate-500">
                        {job.perusahaan} · {job.lokasi || '-'}
                      </p>
                    </div>
                    {job.terbuka === false ? (
                      <span className="flex shrink-0 items-center gap-1 rounded-full bg-rose-50 px-2 py-0.5 text-[10px] font-semibold text-rose-600">
                        Sudah Tutup
                      </span>
                    ) : (
                      <span className="flex shrink-0 items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-600">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" /> Aktif
                      </span>
                    )}
                  </Link>
                ))}
                {!loading && latestJobs.length === 0 && (
                  <p className="py-4 text-center text-sm text-slate-400">Belum ada lowongan.</p>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar: profil + riwayat */}
          <aside className="space-y-6">
            <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
              <h3 className="flex items-center gap-2 font-bold text-slate-800">
                <User className="h-4 w-4 text-slate-400" /> Profil Saya
              </h3>
              <div className="mt-4 flex items-center gap-3">
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-blue-600 text-lg font-bold text-white">
                  {(user?.name || '?').charAt(0).toUpperCase()}
                </span>
                <div className="min-w-0">
                  <p className="truncate font-semibold text-slate-800">{user?.name}</p>
                  <p className="truncate text-xs text-slate-400">
                    {ROLE_LABEL[user?.role] || 'Pengguna'}
                  </p>
                </div>
              </div>
              <div className="mt-3 space-y-2 text-xs">
                <p className="flex items-center gap-2 truncate text-slate-500">
                  <Mail className="h-3.5 w-3.5 shrink-0 text-slate-400" /> {user?.email}
                </p>
                <p className="flex items-center gap-2 text-slate-500">
                  <History className="h-3.5 w-3.5 shrink-0 text-slate-400" /> {history.length} analisis
                  dilakukan
                </p>
                <p className="flex items-center gap-2 text-slate-500">
                  <Target className="h-3.5 w-3.5 shrink-0 text-slate-400" /> Analisis terakhir:{' '}
                  {terakhirAnalisis}
                </p>
              </div>
              {user?.role === 'alumni' && (
                <button
                  onClick={() => navigate('/kuisioner')}
                  className="mt-4 flex w-full items-center justify-center gap-1.5 rounded-xl bg-blue-50 px-4 py-2 text-xs font-semibold text-blue-700 transition hover:bg-blue-100"
                >
                  <FileText className="h-3.5 w-3.5" /> Isi Kuisioner Alumni
                </button>
              )}
            </div>

            <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <h3 className="flex items-center gap-2 font-bold text-slate-800">
                  <History className="h-4 w-4 text-slate-400" /> Riwayat Analisis
                </h3>
                <button
                  onClick={() => navigate('/analyze')}
                  className="text-xs font-semibold text-blue-600 hover:text-blue-700"
                >
                  + Baru
                </button>
              </div>
              <div className="mt-3 space-y-2">
                {history.slice(0, 4).map((item) => (
                  <Link
                    key={item.id}
                    to={`/chat/${item.id}`}
                    className="block rounded-xl border border-slate-100 px-4 py-3 transition hover:border-blue-200 hover:bg-blue-50/40"
                  >
                    <p className="truncate text-sm font-semibold text-slate-800">{item.nama}</p>
                    {item.ringkasan && (
                      <p className="mt-0.5 line-clamp-2 text-xs text-slate-500">{item.ringkasan}</p>
                    )}
                    <p className="mt-1 text-[10px] text-slate-400">
                      {new Date(item.created_at).toLocaleDateString('id-ID', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </p>
                  </Link>
                ))}
                {!loading && history.length === 0 && (
                  <p className="py-4 text-center text-sm text-slate-400">
                    Belum ada analisis. Mulai dari tombol "+ Baru".
                  </p>
                )}
              </div>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}