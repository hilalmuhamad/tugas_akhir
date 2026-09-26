import { useEffect, useMemo, useState } from 'react';
import {
  FileText,
  Printer,
  Download,
  CheckCircle2,
  Building2,
  TrendingUp,
  Clock,
  Wallet,
  Briefcase,
  GraduationCap,
  Sparkles,
  Target,
  BarChart3,
} from 'lucide-react';
import CareerNavbar from '../../career/components/CareerNavbar';
import Footer from '../../../components/Footer';
import api from '../../../services/api';
import { rekapPerProdi, laporanUnduhUrl } from '../utils/laporan';

export default function LaporanPage() {
  const [alumni, setAlumni] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let active = true;
    Promise.all([api.get('/alumni'), api.get('/stats')])
      .then(([a, s]) => {
        if (!active) return;
        setAlumni(a.data || []);
        setStats(s.data);
      })
      .catch(() => active && setError('Gagal memuat data laporan.'))
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, []);

  const perProdi = useMemo(() => rekapPerProdi(alumni), [alumni]);

  const tanggal = new Date().toLocaleDateString('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
  const jam = new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });

  const unduhCsv = () => {
    window.location.href = laporanUnduhUrl();
  };

  const cards = [
    {
      label: 'Total Alumni',
      value: stats ? stats.total_alumni : '…',
      icon: GraduationCap,
      color: 'bg-blue-50 text-blue-600',
    },
    {
      label: 'Alumni Bekerja',
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

  const ikuRows = [
    {
      indikator: 'IKU-1: Persentase lulusan bekerja (≤ 6 bulan setelah lulus)',
      nilai: stats ? `${stats.persentase_kerja ?? 0}%` : '-',
      proksi: 'Alumni berstatus Bekerja / Wirausaha dari total responden',
    },
    {
      indikator: 'Masa tunggu kerja rata-rata',
      nilai: stats && stats.masa_tunggu_rata != null ? `${stats.masa_tunggu_rata} bulan` : '-',
      proksi: 'Rata-rata durasi tunggu kerja setelah lulus',
    },
    {
      indikator: 'Kesejahteraan lulusan (gaji awal rata-rata)',
      nilai: stats && stats.gaji_rata_rata != null ? `Rp ${stats.gaji_rata_rata} jt/bln` : '-',
      proksi: 'Rata-rata gaji pertama alumni per bulan',
    },
    {
      indikator: 'Ketersediaan lowongan di platform',
      nilai: stats ? `${stats.total_lowongan} lowongan` : '-',
      proksi: 'Total lowongan terpasang di sistem Smart Career',
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 print:bg-white">
      <div className="print:hidden">
        <CareerNavbar />
      </div>

      <main className="mx-auto max-w-6xl px-4 py-6 print:max-w-none print:px-0 print:py-0">
        {error && (
          <p className="mb-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>
        )}

        <div className="relative flex flex-wrap items-start justify-between gap-4 overflow-hidden rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 p-6 text-white shadow-md print:hidden">
          {/* Siluet ikon latar — hanya di ujung kanan */}
          <div aria-hidden="true" className="pointer-events-none absolute inset-y-0 right-0 hidden sm:block">
            <FileText className="absolute -right-8 -top-10 h-44 w-44 rotate-12 text-white/10" strokeWidth={1} />
            <BarChart3 className="absolute -bottom-14 right-4 h-40 w-40 -rotate-6 text-white/10" strokeWidth={1} />
            <Building2 className="absolute -right-4 top-1/2 h-28 w-28 -translate-y-1/2 text-white/10" strokeWidth={1} />
            <Briefcase className="absolute right-36 -top-6 h-16 w-16 -rotate-12 text-white/15" strokeWidth={1.2} />
            <TrendingUp className="absolute bottom-4 right-36 h-14 w-14 rotate-6 text-white/15" strokeWidth={1.2} />
            <Target className="absolute right-28 top-1/3 h-12 w-12 text-white/10" strokeWidth={1.2} />
            <Wallet className="absolute -right-2 bottom-1/4 h-10 w-10 text-white/20" strokeWidth={1.2} />
            <Sparkles className="absolute right-56 top-2 h-8 w-8 text-white/20" strokeWidth={1.2} />
          </div>

          <div className="relative z-10">
            <p className="text-xs text-blue-100 sm:text-sm">{tanggal}</p>
            <h1 className="mt-1 text-xl font-bold sm:text-2xl">Generate Laporan IKU</h1>
            <p className="mt-1 text-xs text-blue-100 sm:text-sm">
              Laporan indikator kinerja utama dari hasil dashboard analisis tracer study alumni.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => window.print()}
              className="flex items-center gap-1.5 rounded-xl bg-white px-3 py-2 text-xs font-semibold text-blue-700 shadow-sm transition hover:bg-blue-50 sm:px-4 sm:py-2.5 sm:text-sm"
            >
              <Printer className="h-4 w-4" /> Cetak / Simpan PDF
            </button>
            <button
              onClick={unduhCsv}
              className="flex items-center gap-1.5 rounded-xl bg-blue-500 px-3 py-2 text-xs font-semibold text-white transition hover:bg-blue-400 sm:px-4 sm:py-2.5 sm:text-sm"
            >
              <Download className="h-4 w-4" /> Unduh CSV
            </button>
          </div>
        </div>

        {loading ? (
          <div className="mt-6 rounded-2xl border border-slate-100 bg-white p-10 text-center text-sm text-slate-400">
            Memuat data laporan...
          </div>
        ) : (
          <>
            {/* Kop laporan (tampil saat dicetak) */}
            <div className="mb-4 hidden print:block">
              <h1 className="text-2xl font-bold text-slate-900">Laporan IKU Tracer Study Alumni</h1>
              <p className="mt-1 text-sm text-slate-500">
                Smart Career Matching Alumni — Zona historis berbasis data kuesioner dan zona
                prediksi berbasis Random Forest
              </p>
              <p className="mt-2 text-xs text-slate-400">
                Dibuat pada {tanggal}, {jam} · Data terhubung ke backend
              </p>
            </div>

            {/* Status data */}
            <div className="mt-6 flex items-center gap-2 rounded-2xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm text-emerald-700 print:hidden">
              <CheckCircle2 className="h-4 w-4" />
              Data terhubung ke backend — {alumni.length} responden, {stats?.jumlah_prodi ?? 0}{' '}
              program studi, diperbarui pada {tanggal}, {jam}.
            </div>

            {/* Kartu ringkasan */}
            <div className="mt-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
              {cards.map((card) => (
                <div
                  key={card.label}
                  className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm print:border-slate-300 print:shadow-none"
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
              {/* Tabel IKU */}
              <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm print:border-slate-300 print:shadow-none lg:col-span-1">
                <h3 className="flex items-center gap-2 font-bold text-slate-800">
                  <FileText className="h-4 w-4 text-slate-400" /> Ringkasan IKU
                </h3>
                <div className="mt-4 space-y-3">
                  {ikuRows.map((row) => (
                    <div key={row.indikator} className="rounded-xl bg-slate-50 p-3">
                      <p className="text-xs font-semibold text-slate-700">{row.indikator}</p>
                      <p className="mt-1 text-lg font-bold text-blue-600">{row.nilai}</p>
                      <p className="mt-0.5 text-[11px] text-slate-400">{row.proksi}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Tabel per prodi */}
              <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm print:border-slate-300 print:shadow-none lg:col-span-2">
                <h3 className="flex items-center gap-2 font-bold text-slate-800">
                  <Building2 className="h-4 w-4 text-slate-400" /> Rekap per Program Studi
                </h3>
                <div className="mt-4 overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead>
                      <tr className="border-b border-slate-100 text-xs uppercase tracking-wide text-slate-400">
                        <th className="pb-2 pr-4 font-semibold">Program Studi</th>
                        <th className="pb-2 pr-4 font-semibold">Total</th>
                        <th className="pb-2 pr-4 font-semibold">Bekerja (%)</th>
                        <th className="pb-2 pr-4 font-semibold">Gaji Rata-rata (jt)</th>
                        <th className="pb-2 font-semibold">Masa Tunggu (bln)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {perProdi.map((p) => (
                        <tr
                          key={p.prodi}
                          className="border-b border-slate-50 last:border-0 hover:bg-slate-50/50"
                        >
                          <td className="py-2.5 pr-4 font-medium text-slate-800">{p.prodi}</td>
                          <td className="py-2.5 pr-4 text-slate-600">{p.total}</td>
                          <td className="py-2.5 pr-4 text-slate-600">{p.persenBekerja}%</td>
                          <td className="py-2.5 pr-4 text-slate-600">{p.gajiRata ?? '-'}</td>
                          <td className="py-2.5 text-slate-600">{p.masaTunggu ?? '-'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="mt-4 flex items-start gap-2 rounded-xl bg-blue-50 p-3 text-xs text-blue-700">
                  <Briefcase className="mt-0.5 h-4 w-4 shrink-0" />
                  <span>
                    Zona historis: data kuesioner tracer study. Zona prediksi: model Random Forest
                    untuk memproyeksikan masa tunggu dan gaji lulusan mendatang. Unduh CSV untuk
                    mengolah data lebih lanjut.
                  </span>
                </div>
              </div>
            </div>

            <p className="mt-6 text-center text-[11px] text-slate-400 print:block hidden">
              Laporan ini dihasilkan otomatis oleh Smart Career Matching Alumni pada {tanggal}, {jam}.
            </p>
          </>
        )}
      </main>
      <div className="print:hidden">
        <Footer />
      </div>
    </div>
  );
}
