import { useCallback, useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  ClipboardList,
  CheckCircle2,
  CalendarDays,
  FileText,
  UserCircle2,
  Info,
  BookOpen,
  GraduationCap,
  Database,
  ArrowRight,
  Clock3,
  BriefcaseBusiness,
  WalletCards,
  Building2,
  RefreshCw,
} from 'lucide-react';

import { useAuthStore } from '../../auth/store/authStore';
import AlumniNavbar from '../components/AlumniNavbar';

import {
  getActiveTracerPeriod,
  getTracerHistory,
  getTracerProfile,
} from '../services/tracerStudyApi';

import { prodiLabel } from '../../../utils/prodiLabel';

const ROLE_LABEL = {
  admin: 'Administrator',
  alumni: 'Alumni',
  viewer: 'Viewer',
};

const FALLBACK_PERIOD = {
  periode: new Date().getFullYear(),
  status: 'Belum tersedia',
  batasPengisian: null,
  source: 'fallback',
};

function formatDate(value) {
  if (!value) return 'Belum tersedia';

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return 'Belum tersedia';
  }

  return date.toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

function formatValue(value, suffix = '') {
  if (value === null || value === undefined || value === '') {
    return 'Belum tersedia';
  }

  return `${value}${suffix}`;
}

function getTracerFilled(profile, history) {
  /*
   * Jangan menggunakan profile?.id sebagai indikator
   * tracer sudah diisi.
   *
   * Profil alumni dan pengisian tracer study adalah
   * dua data yang berbeda.
   *
   * Untuk sementara, status dianggap sudah mengisi
   * apabila API history mengembalikan minimal satu data.
   *
   * Jika API profile nantinya memiliki field seperti:
   * profile.tracerFilled
   * atau
   * profile.sudahMengisiTracer
   * maka field tersebut akan digunakan terlebih dahulu.
   */

  if (typeof profile?.tracerFilled === 'boolean') {
    return profile.tracerFilled;
  }

  if (typeof profile?.sudahMengisiTracer === 'boolean') {
    return profile.sudahMengisiTracer;
  }

  if (typeof profile?.tracerStudyFilled === 'boolean') {
    return profile.tracerStudyFilled;
  }

  return Array.isArray(history) && history.length > 0;
}

export default function DashboardPage() {
  const { user } = useAuthStore();
  const location = useLocation();
  const navigate = useNavigate();

  const [profile, setProfile] = useState(null);
  const [period, setPeriod] = useState(FALLBACK_PERIOD);
  const [history, setHistory] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadDashboard = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const [profileData, periodData, historyData] =
        await Promise.all([
          getTracerProfile(),
          getActiveTracerPeriod(),
          getTracerHistory(),
        ]);

      setProfile(profileData || null);

      setPeriod(
        periodData
          ? {
              ...FALLBACK_PERIOD,
              ...periodData,
            }
          : FALLBACK_PERIOD
      );

      setHistory(
        Array.isArray(historyData)
          ? historyData
          : []
      );
    } catch (err) {
      console.error(
        'Gagal memuat dashboard alumni:',
        err
      );

      setError(
        'Data Tracer Study belum dapat dimuat. Silakan coba lagi.'
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  useEffect(() => {
    if (location.hash !== '#riwayat') {
      return;
    }

    if (loading) {
      return;
    }

    const target = document.getElementById('riwayat');

    if (!target) {
      return;
    }

    setTimeout(() => {
      target.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });
    }, 100);
  }, [location.hash, loading]);

  const hariIni = new Date().toLocaleDateString(
    'id-ID',
    {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }
  );

  /*
   * Status tracer study TIDAK lagi bergantung
   * pada keberadaan profile.id.
   */
  const tracerFilled = useMemo(
    () => getTracerFilled(profile, history),
    [profile, history]
  );

  const profileIncomplete =
    !profile?.nama ||
    !profile?.programStudi ||
    !profile?.tahunMasuk ||
    !profile?.tahunLulus;

  /*
   * History asli dari API diprioritaskan.
   *
   * Jika belum ada history tetapi tracer status
   * menyatakan sudah mengisi, kita tidak membuat
   * data tanggal palsu.
   */
  const normalizedHistory = useMemo(() => {
    if (history.length > 0) {
      return history;
    }

    return [];
  }, [history]);

  const latestHistory = normalizedHistory[0];

  const tracerDataItems = useMemo(() => {
    if (!profile || !tracerFilled) {
      return [];
    }

    return [
      {
        label: 'Tahun Lulus',
        value: profile.tahunLulus,
        icon: GraduationCap,
      },
      {
        label: 'Status Setelah Lulus',
        value: profile.statusBekerja,
        icon: BriefcaseBusiness,
      },
      {
        label: 'Masa Tunggu',
        value:
          profile.masaTungguBulan !== null &&
          profile.masaTungguBulan !== undefined
            ? `${profile.masaTungguBulan} bulan`
            : null,
        icon: Clock3,
      },
      {
        label: 'Bidang Pekerjaan',
        value: profile.bidangPekerjaan,
        icon: Building2,
      },
      {
        label: 'Gaji Pertama',
        value:
          profile.gajiJuta !== null &&
          profile.gajiJuta !== undefined
            ? `Rp ${profile.gajiJuta} juta / bulan`
            : null,
        icon: WalletCards,
      },
      {
        label: 'Kesesuaian Bidang',
        value: profile.kesesuaianBidang,
        icon: BookOpen,
      },
    ].filter(
      (item) =>
        item.value !== null &&
        item.value !== undefined &&
        item.value !== ''
    );
  }, [profile, tracerFilled]);

  const displayName =
    user?.name ||
    profile?.nama ||
    'Alumni';

  return (
    <div className="min-h-screen bg-slate-50">
      <AlumniNavbar />

      <main className="mx-auto w-full max-w-6xl px-4 py-6 md:py-8">

        {/* =========================
            LOADING
        ========================== */}
        {loading && <DashboardSkeleton />}

        {/* =========================
            ERROR
        ========================== */}
        {!loading && error && (
          <section className="rounded-2xl border border-rose-200 bg-white p-8 text-center shadow-sm">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-50 text-rose-600">
              <RefreshCw className="h-6 w-6" />
            </div>

            <h2 className="mt-4 text-lg font-bold text-slate-900">
              Data belum dapat dimuat
            </h2>

            <p className="mt-2 text-sm text-slate-500">
              {error}
            </p>

            <button
              type="button"
              onClick={loadDashboard}
              className="mt-5 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
            >
              <RefreshCw className="h-4 w-4" />
              Coba Lagi
            </button>
          </section>
        )}

        {/* =========================
            DASHBOARD
        ========================== */}
        {!loading && !error && (
          <div className="space-y-6">

            {/* =========================
                HERO
            ========================== */}
            <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-700 via-blue-600 to-indigo-600 p-6 text-white shadow-lg md:p-8">

              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 overflow-hidden"
              >
                <GraduationCap
                  className="absolute -right-8 -top-10 h-48 w-48 rotate-12 text-white/10 md:h-64 md:w-64"
                  strokeWidth={1}
                />

                <Database
                  className="absolute -bottom-12 right-32 h-40 w-40 text-white/5 md:h-52 md:w-52"
                  strokeWidth={1}
                />

                <ClipboardList
                  className="absolute right-72 top-12 h-20 w-20 rotate-12 text-white/5"
                  strokeWidth={1}
                />
              </div>

              <div className="relative z-10 max-w-3xl">

                <div className="flex flex-wrap items-center gap-2">
                  <span className="inline-flex items-center rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-medium text-white">
                    {ROLE_LABEL[user?.role] || 'Alumni'}
                  </span>

                  <span className="text-xs text-blue-100">
                    {hariIni}
                  </span>
                </div>

                <h1 className="mt-4 text-3xl font-extrabold tracking-tight md:text-4xl">
                  Halo, {displayName} 👋
                </h1>

                <p className="mt-3 max-w-2xl text-sm leading-6 text-blue-50 md:text-base">
                  Selamat datang di halaman Tracer Study.
                  Bantu kami memahami perjalanan Anda setelah
                  menyelesaikan pendidikan dengan memperbarui
                  informasi dan pengalaman Anda sebagai alumni.
                </p>

                <div className="mt-6 flex flex-wrap gap-3">

                  <button
                    type="button"
                    onClick={() => navigate('/kuisioner')}
                    className="inline-flex h-11 items-center gap-2 rounded-xl bg-white px-5 text-sm font-bold text-blue-700 shadow-md transition hover:bg-blue-50"
                  >
                    <ClipboardList className="h-4 w-4" />

                    {tracerFilled
                      ? 'Perbarui Tracer Study'
                      : 'Isi Tracer Study'}
                  </button>

                  <button
                    type="button"
                    onClick={() => navigate('/profile')}
                    className="inline-flex h-11 items-center gap-2 rounded-xl border border-white/30 bg-white/10 px-5 text-sm font-semibold text-white transition hover:bg-white/15"
                  >
                    <UserCircle2 className="h-4 w-4" />
                    Profil Saya
                  </button>

                </div>
              </div>
            </section>

            {/* =========================
                STATUS RINGKAS
            ========================== */}
            <section className="grid gap-4 md:grid-cols-3">

              <StatusCard
                icon={
                  tracerFilled
                    ? CheckCircle2
                    : ClipboardList
                }
                title="Status Pengisian"
                value={
                  tracerFilled
                    ? 'Sudah Mengisi'
                    : 'Belum Mengisi'
                }
                description={
                  tracerFilled
                    ? 'Data tracer study Anda telah tersimpan.'
                    : 'Anda belum mengisi tracer study.'
                }
                success={tracerFilled}
              />

              <StatusCard
                icon={CalendarDays}
                title="Periode Tracer"
                value={period.periode}
                description={`Status periode: ${
                  period.status || 'Belum tersedia'
                }`}
              />

              <StatusCard
                icon={Clock3}
                title="Batas Pengisian"
                value={
                  period.batasPengisian
                    ? formatDate(period.batasPengisian)
                    : 'Belum tersedia'
                }
                description="Periksa kembali periode pengisian yang sedang aktif."
              />

            </section>

            {/* =========================
                STATUS TRACER
            ========================== */}
            <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm md:p-6">

              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">

                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-blue-600">
                    Tracer Study
                  </p>

                  <h2 className="mt-1 text-xl font-bold text-slate-900">
                    Status Tracer Study Anda
                  </h2>

                  <p className="mt-1 text-sm text-slate-500">
                    Informasi mengenai pengisian tracer study
                    pada periode {period.periode}.
                  </p>
                </div>

                <div
                  className={`inline-flex w-fit items-center gap-2 rounded-full px-3 py-1.5 text-xs font-bold ${
                    tracerFilled
                      ? 'bg-emerald-50 text-emerald-700'
                      : 'bg-amber-50 text-amber-700'
                  }`}
                >
                  {tracerFilled ? (
                    <CheckCircle2 className="h-4 w-4" />
                  ) : (
                    <ClipboardList className="h-4 w-4" />
                  )}

                  {tracerFilled
                    ? 'Sudah Mengisi'
                    : 'Belum Mengisi'}
                </div>

              </div>

              <div className="mt-5 grid gap-3 md:grid-cols-3">

                <InfoItem
                  label="Periode"
                  value={period.periode}
                />

                <InfoItem
                  label="Status Periode"
                  value={
                    period.status || 'Belum tersedia'
                  }
                />

                <InfoItem
                  label="Tanggal Pengisian"
                  value={
                    latestHistory?.tanggalPengisian
                      ? formatDate(
                          latestHistory.tanggalPengisian
                        )
                      : 'Belum tersedia'
                  }
                />

              </div>

              <div className="mt-5">

                <button
                  type="button"
                  onClick={() =>
                    navigate(
                      tracerFilled
                        ? '/kuisioner/sukses'
                        : '/kuisioner'
                    )
                  }
                  className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
                >
                  <FileText className="h-4 w-4" />

                  {tracerFilled
                    ? 'Lihat Data Tracer Study'
                    : 'Isi Tracer Study Sekarang'}

                  <ArrowRight className="h-4 w-4" />
                </button>

              </div>
            </section>

            {/* =========================
                PROFIL
            ========================== */}
            <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm md:p-6">

              <div className="flex items-center justify-between gap-4">

                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-blue-600">
                    Data Pribadi
                  </p>

                  <h2 className="mt-1 text-xl font-bold text-slate-900">
                    Profil Alumni
                  </h2>

                  <p className="mt-1 text-sm text-slate-500">
                    Informasi dasar yang digunakan dalam
                    penelusuran alumni.
                  </p>
                </div>

                <div className="hidden h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600 sm:flex">
                  <UserCircle2 className="h-5 w-5" />
                </div>

              </div>

              <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">

                <InfoItem
                  label="Nama"
                  value={
                    profile?.nama ||
                    user?.name ||
                    'Belum tersedia'
                  }
                />

                <InfoItem
                  label="Email"
                  value={
                    user?.email ||
                    profile?.email ||
                    'Belum tersedia'
                  }
                />

                <InfoItem
                  label="Program Studi"
                  value={
                    profile?.programStudi
                      ? prodiLabel(
                          profile.programStudi
                        )
                      : 'Belum tersedia'
                  }
                />

                <InfoItem
                  label="Jenjang"
                  value={
                    profile?.jenjang ||
                    'Belum tersedia'
                  }
                />

                <InfoItem
                  label="Tahun Masuk"
                  value={formatValue(
                    profile?.tahunMasuk
                  )}
                />

                <InfoItem
                  label="Tahun Lulus"
                  value={formatValue(
                    profile?.tahunLulus
                  )}
                />

              </div>

              {profileIncomplete && (
                <div className="mt-5 flex flex-col gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4 sm:flex-row sm:items-center sm:justify-between">

                  <div>
                    <p className="text-sm font-semibold text-amber-800">
                      Profil Anda belum lengkap
                    </p>

                    <p className="mt-1 text-xs leading-5 text-amber-700">
                      Lengkapi informasi profil agar
                      data tracer study Anda lebih akurat.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      navigate('/profile')
                    }
                    className="w-fit rounded-lg bg-amber-500 px-4 py-2 text-xs font-bold text-white transition hover:bg-amber-600"
                  >
                    Lengkapi Profil
                  </button>

                </div>
              )}

            </section>

            {/* =========================
                DATA TRACER
            ========================== */}
            <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm md:p-6">

              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-blue-600">
                  Data Saya
                </p>

                <h2 className="mt-1 text-xl font-bold text-slate-900">
                  Ringkasan Data Tracer Study
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Ringkasan informasi yang telah Anda
                  berikan melalui tracer study.
                </p>
              </div>

              {!tracerFilled ? (

                <div className="mt-5 rounded-xl border border-dashed border-slate-300 bg-slate-50 p-6 text-center">

                  <ClipboardList className="mx-auto h-8 w-8 text-slate-400" />

                  <p className="mt-3 text-sm font-semibold text-slate-700">
                    Belum ada data tracer study
                  </p>

                  <p className="mx-auto mt-1 max-w-md text-xs leading-5 text-slate-500">
                    Data akan muncul setelah Anda mengisi
                    tracer study.
                  </p>

                  <button
                    type="button"
                    onClick={() =>
                      navigate('/kuisioner')
                    }
                    className="mt-4 inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-xs font-bold text-white transition hover:bg-blue-700"
                  >
                    Isi Tracer Study
                    <ArrowRight className="h-3.5 w-3.5" />
                  </button>

                </div>

              ) : tracerDataItems.length === 0 ? (

                <div className="mt-5 rounded-xl border border-dashed border-slate-300 bg-slate-50 p-6 text-center">

                  <Info className="mx-auto h-8 w-8 text-slate-400" />

                  <p className="mt-3 text-sm font-semibold text-slate-700">
                    Data tracer tersimpan
                  </p>

                  <p className="mx-auto mt-1 max-w-md text-xs leading-5 text-slate-500">
                    Data tracer study Anda sudah tersimpan,
                    tetapi belum ada ringkasan yang dapat
                    ditampilkan.
                  </p>

                </div>

              ) : (

                <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">

                  {tracerDataItems.map((item) => {
                    const Icon = item.icon;

                    return (
                      <div
                        key={item.label}
                        className="rounded-xl border border-slate-100 bg-slate-50/60 p-4 transition hover:border-blue-100 hover:bg-blue-50/30"
                      >

                        <div className="flex items-center gap-2">

                          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-white text-blue-600 shadow-sm">
                            <Icon className="h-4 w-4" />
                          </span>

                          <p className="text-xs font-medium text-slate-500">
                            {item.label}
                          </p>

                        </div>

                        <p className="mt-3 text-sm font-bold text-slate-800">
                          {item.value}
                        </p>

                      </div>
                    );
                  })}

                </div>

              )}

            </section>

            {/* =========================
                INFORMASI
            ========================== */}
            <section className="grid gap-6 lg:grid-cols-2">

              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm md:p-6">

                <div className="flex items-center gap-3">

                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                    <Info className="h-5 w-5" />
                  </span>

                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-blue-600">
                      Informasi
                    </p>

                    <h2 className="text-lg font-bold text-slate-900">
                      Apa itu Tracer Study?
                    </h2>
                  </div>

                </div>

                <p className="mt-4 text-sm leading-6 text-slate-600">
                  Tracer Study merupakan kegiatan penelusuran
                  alumni yang dilakukan perguruan tinggi untuk
                  memperoleh informasi dan umpan balik mengenai
                  perjalanan lulusan setelah menyelesaikan
                  pendidikan.
                </p>

                <p className="mt-3 text-sm leading-6 text-slate-600">
                  Informasi yang diberikan alumni menjadi bahan
                  bagi program studi untuk memahami perjalanan
                  lulusan dan meningkatkan kualitas pendidikan.
                </p>

              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm md:p-6">

                <div className="flex items-center gap-3">

                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                    <GraduationCap className="h-5 w-5" />
                  </span>

                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-emerald-600">
                      Kontribusi Alumni
                    </p>

                    <h2 className="text-lg font-bold text-slate-900">
                      Mengapa Partisipasi Anda Penting?
                    </h2>
                  </div>

                </div>

                <div className="mt-4 grid gap-3 sm:grid-cols-2">

                  <BenefitCard
                    icon={BookOpen}
                    title="Umpan Balik"
                    text="Memberikan informasi mengenai perjalanan Anda setelah menyelesaikan pendidikan."
                  />

                  <BenefitCard
                    icon={GraduationCap}
                    title="Evaluasi Pendidikan"
                    text="Membantu program studi memahami relevansi pendidikan dengan perjalanan lulusan."
                  />

                  <BenefitCard
                    icon={Database}
                    title="Database Alumni"
                    text="Membantu membangun data alumni yang lebih lengkap dan terkini."
                  />

                  <BenefitCard
                    icon={Building2}
                    title="Pengembangan"
                    text="Menjadi salah satu bahan pertimbangan dalam pengembangan pendidikan."
                  />

                </div>

              </div>

            </section>

            {/* =========================
                RIWAYAT
            ========================== */}
            <section
              id="riwayat"
              className="scroll-mt-24 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm md:p-6"
            >

              <div className="flex items-center justify-between gap-4">

                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-blue-600">
                    Riwayat
                  </p>

                  <h2 className="mt-1 text-xl font-bold text-slate-900">
                    Riwayat Tracer Study
                  </h2>

                  <p className="mt-1 text-sm text-slate-500">
                    Riwayat pengisian tracer study Anda.
                  </p>
                </div>

                <CalendarDays className="hidden h-5 w-5 text-slate-400 sm:block" />

              </div>

              {normalizedHistory.length === 0 ? (

                <div className="mt-5 rounded-xl border border-dashed border-slate-300 bg-slate-50 p-6 text-center">

                  <ClipboardList className="mx-auto h-8 w-8 text-slate-400" />

                  <p className="mt-3 text-sm font-semibold text-slate-700">
                    Belum ada riwayat tracer study
                  </p>

                  <p className="mx-auto mt-1 max-w-md text-xs leading-5 text-slate-500">
                    Isi tracer study untuk mulai mencatat
                    perjalanan pengisian Anda.
                  </p>

                  <button
                    type="button"
                    onClick={() =>
                      navigate('/kuisioner')
                    }
                    className="mt-4 inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-xs font-bold text-white transition hover:bg-blue-700"
                  >
                    Isi Tracer Study
                    <ArrowRight className="h-3.5 w-3.5" />
                  </button>

                </div>

              ) : (

                <div className="mt-5 overflow-x-auto">

                  <table className="w-full min-w-[520px] text-left text-sm">

                    <thead>
                      <tr className="border-b border-slate-200 text-xs uppercase tracking-wide text-slate-400">

                        <th className="py-3 font-semibold">
                          Periode
                        </th>

                        <th className="py-3 font-semibold">
                          Status
                        </th>

                        <th className="py-3 font-semibold">
                          Tanggal Pengisian
                        </th>

                      </tr>
                    </thead>

                    <tbody>

                      {normalizedHistory.map(
                        (item, index) => {

                          const isComplete =
                            item.status === 'Selesai' ||
                            item.status === 'Sudah Mengisi' ||
                            item.status === 'completed' ||
                            item.status === 'completed';

                          return (
                            <tr
                              key={`${item.periode}-${index}`}
                              className="border-b border-slate-100 last:border-0"
                            >

                              <td className="py-3 font-medium text-slate-700">
                                {item.periode ||
                                  'Belum tersedia'}
                              </td>

                              <td className="py-3">

                                <span
                                  className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${
                                    isComplete
                                      ? 'bg-emerald-50 text-emerald-700'
                                      : 'bg-amber-50 text-amber-700'
                                  }`}
                                >
                                  {isComplete ? (
                                    <CheckCircle2 className="h-3.5 w-3.5" />
                                  ) : (
                                    <ClipboardList className="h-3.5 w-3.5" />
                                  )}

                                  {item.status ||
                                    'Belum tersedia'}
                                </span>

                              </td>

                              <td className="py-3 text-slate-600">
                                {formatDate(
                                  item.tanggalPengisian
                                )}
                              </td>

                            </tr>
                          );
                        }
                      )}

                    </tbody>

                  </table>

                </div>

              )}

            </section>

            {/* =========================
                CTA
            ========================== */}
            <section className="relative overflow-hidden rounded-2xl border border-blue-100 bg-blue-50 p-6 md:p-8">

              <div className="relative z-10 max-w-3xl">

                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-600 text-white">
                  <ClipboardList className="h-5 w-5" />
                </div>

                <h2 className="mt-4 text-2xl font-bold text-slate-900">
                  Mari Berkontribusi Melalui Tracer Study
                </h2>

                <p className="mt-2 text-sm leading-6 text-slate-600">
                  Informasi dari Anda membantu program studi
                  memahami perjalanan alumni dan menjadi bahan
                  pengembangan kualitas pendidikan di masa
                  mendatang.
                </p>

                <button
                  type="button"
                  onClick={() =>
                    navigate(
                      tracerFilled
                        ? '/kuisioner/sukses'
                        : '/kuisioner'
                    )
                  }
                  className="mt-5 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-blue-700"
                >
                  <FileText className="h-4 w-4" />

                  {tracerFilled
                    ? 'Lihat Data Tracer Study'
                    : 'Isi Tracer Study'}

                  <ArrowRight className="h-4 w-4" />
                </button>

              </div>

              <GraduationCap
                aria-hidden="true"
                className="absolute -bottom-12 -right-6 h-48 w-48 text-blue-600/5 md:h-64 md:w-64"
                strokeWidth={1}
              />

            </section>

          </div>
        )}

      </main>
    </div>
  );
}

/* ============================================================
   STATUS CARD
============================================================ */

function StatusCard({
  icon: Icon,
  title,
  value,
  description,
  success = false,
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

      <div className="flex items-start justify-between gap-3">

        <div className="min-w-0">

          <p className="text-xs font-medium text-slate-500">
            {title}
          </p>

          <p className="mt-2 break-words text-lg font-bold text-slate-900">
            {value}
          </p>

        </div>

        <span
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
            success
              ? 'bg-emerald-50 text-emerald-600'
              : 'bg-blue-50 text-blue-600'
          }`}
        >
          <Icon className="h-5 w-5" />
        </span>

      </div>

      <p className="mt-3 text-xs leading-5 text-slate-500">
        {description}
      </p>

    </div>
  );
}

/* ============================================================
   INFO ITEM
============================================================ */

function InfoItem({ label, value }) {
  return (
    <div className="rounded-xl border border-slate-100 bg-slate-50/50 p-4">

      <p className="text-xs font-medium text-slate-500">
        {label}
      </p>

      <p className="mt-1.5 break-words text-sm font-semibold text-slate-800">
        {value}
      </p>

    </div>
  );
}

/* ============================================================
   BENEFIT CARD
============================================================ */

function BenefitCard({
  icon: Icon,
  title,
  text,
}) {
  return (
    <div className="rounded-xl border border-slate-100 p-4">

      <div className="flex items-center gap-2">

        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
          <Icon className="h-4 w-4" />
        </span>

        <p className="text-xs font-bold text-slate-800">
          {title}
        </p>

      </div>

      <p className="mt-2 text-xs leading-5 text-slate-500">
        {text}
      </p>

    </div>
  );
}

/* ============================================================
   DASHBOARD SKELETON
============================================================ */

function DashboardSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">

      <div className="h-64 rounded-3xl bg-slate-200" />

      <div className="grid gap-4 md:grid-cols-3">
        <div className="h-32 rounded-2xl bg-slate-200" />
        <div className="h-32 rounded-2xl bg-slate-200" />
        <div className="h-32 rounded-2xl bg-slate-200" />
      </div>

      <div className="h-52 rounded-2xl bg-slate-200" />

      <div className="h-64 rounded-2xl bg-slate-200" />

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="h-64 rounded-2xl bg-slate-200" />
        <div className="h-64 rounded-2xl bg-slate-200" />
      </div>

      <div className="h-64 rounded-2xl bg-slate-200" />

      <div className="h-48 rounded-2xl bg-slate-200" />

    </div>
  );
}