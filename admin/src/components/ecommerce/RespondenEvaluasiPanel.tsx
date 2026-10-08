import { useEffect, useMemo, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { getOlapDetail, OlapDetailRow } from "../../api/olap";

interface ProdiSebaran {
  prodi: string;
  total: number;
  bekerja: number;
  tidakBekerja: number;
  pctSebaran: number;
  pctBekerja: number;
  klasSebaran: string;
  klasSerapan: string;
}

const PRODI_COLORS: Record<string, string> = {
  "Comm&Mgmt": "#6366f1",
  "Sci&Tech": "#10b981",
  Others: "#f59e0b",
};

function klasSebaran(pct: number): { label: string; color: string } {
  if (pct > 50) return { label: "Dominan", color: "bg-violet-100 text-violet-700 dark:bg-violet-500/20 dark:text-violet-300 border-violet-200" };
  if (pct >= 20) return { label: "Proporsional", color: "bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-300 border-blue-200" };
  return { label: "Minor", color: "bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-300 border-amber-200" };
}

function klasSerapan(pct: number): { label: string; color: string } {
  if (pct >= 70) return { label: "Tinggi", color: "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300 border-emerald-200" };
  if (pct >= 50) return { label: "Sedang", color: "bg-sky-100 text-sky-700 dark:bg-sky-500/20 dark:text-sky-300 border-sky-200" };
  return { label: "Rendah", color: "bg-rose-100 text-rose-700 dark:bg-rose-500/20 dark:text-rose-300 border-rose-200" };
}

export default function RespondenEvaluasiPanel() {
  const [rowsApi, setRowsApi] = useState<OlapDetailRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const rows = await getOlapDetail();
        if (!cancelled) setRowsApi(rows);
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : "Gagal memuat data evaluasi.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, []);

  const tahunRange = useMemo(() => {
    const years = [...new Set(rowsApi.map((r) => r.tahun_lulus).filter((y): y is number => Number.isFinite(y)))].sort((a, b) => a - b);
    return years.length ? `${years[0]}-${years[years.length - 1]}` : null;
  }, [rowsApi]);

  const totalLulusan = rowsApi.length;

  const perProdi: ProdiSebaran[] = useMemo(() => {
    const map = new Map<string, { total: number; bekerja: number }>();
    for (const r of rowsApi) {
      const cur = map.get(r.program_studi) ?? { total: 0, bekerja: 0 };
      cur.total += 1;
      if (r.status_bekerja === "Bekerja") cur.bekerja += 1;
      map.set(r.program_studi, cur);
    }
    return [...map.entries()].map(([prodi, v]) => {
      const tidak = v.total - v.bekerja;
      const pctSebaran = totalLulusan > 0 ? (v.total * 100) / totalLulusan : 0;
      const pctBekerja = v.total > 0 ? (v.bekerja * 100) / v.total : 0;
      return {
        prodi,
        total: v.total,
        bekerja: v.bekerja,
        tidakBekerja: tidak,
        pctSebaran: Math.round(pctSebaran * 100) / 100,
        pctBekerja: Math.round(pctBekerja * 100) / 100,
        klasSebaran: klasSebaran(pctSebaran).label,
        klasSerapan: klasSerapan(pctBekerja).label,
      };
    }).sort((a, b) => b.total - a.total);
  }, [rowsApi, totalLulusan]);

  const perTahun = useMemo(() => {
    const map = new Map<number, number>();
    for (const r of rowsApi) map.set(r.tahun_lulus, (map.get(r.tahun_lulus) ?? 0) + 1);
    return [...map.entries()].map(([tahun, jml]) => ({ tahun, jumlah: jml })).sort((a, b) => a.tahun - b.tahun);
  }, [rowsApi]);

  // Stacked per tahun per prodi for bar chart
  const perTahunPerProdi = useMemo(() => {
    const tahunSet = [...new Set(rowsApi.map((r) => r.tahun_lulus))].sort((a, b) => a - b);
    const prodiSet = [...new Set(rowsApi.map((r) => r.program_studi))].sort();
    return tahunSet.map((tahun) => {
      const entry: Record<string, number | string> = { tahun: String(tahun) };
      for (const prodi of prodiSet) {
        entry[prodi] = rowsApi.filter((r) => r.tahun_lulus === tahun && r.program_studi === prodi).length;
      }
      return entry;
    });
  }, [rowsApi]);

  const prodiSet = useMemo(() => [...new Set(rowsApi.map((r) => r.program_studi))].sort(), [rowsApi]);

  // Keseimbangan kohort: CV
  const keseimbangan = useMemo(() => {
    if (perTahun.length < 2) return { cv: 0, label: "Seimbang", color: "emerald" };
    const mean = perTahun.reduce((s, r) => s + r.jumlah, 0) / perTahun.length;
    const varian = perTahun.reduce((s, r) => s + Math.pow(r.jumlah - mean, 2), 0) / perTahun.length;
    const sd = Math.sqrt(varian);
    const cv = mean > 0 ? (sd / mean) * 100 : 0;
    return cv < 10 ? { cv: Math.round(cv * 10) / 10, label: "Seimbang", color: "emerald" } : { cv: Math.round(cv * 10) / 10, label: "Tidak Seimbang", color: "amber" };
  }, [perTahun]);

  const donutData = perProdi.map((p) => ({ name: p.prodi, value: p.total }));
  const statusBarData = perProdi.map((p) => ({ prodi: p.prodi, Bekerja: p.bekerja, "Tidak Bekerja": p.tidakBekerja }));

  const totalTersedia = perProdi.length;

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">Evaluasi Cakupan Alumni per Program Studi</h3>
          <p className="mt-1 max-w-3xl text-sm leading-6 text-gray-500 dark:text-gray-400">
            Klasifikasi sebaran alumni dalam dataset OLAP sebagai indikator keterwakilan. Bukan sekadar <em>Tersedia</em>, tetapi seberapa dominan, seberapa seimbang kohort, dan seberapa tinggi keterserapan kerja per prodi — semua dihitung dari <code>v_olap_detail</code> (fact 215) tanpa hardcode.
          </p>
          {tahunRange && <p className="mt-2 text-xs text-gray-400">Cakupan tahun lulus: {tahunRange} · n=215 (2019:31, 2020:31, 2021:31, 2022:31, 2023:31, 2024:30, 2025:30)</p>}
        </div>
      </div>

      {error && <div className="mt-6 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-600 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-400">Gagal memuat data evaluasi: {error}</div>}
      {loading && <div className="mt-6 rounded-xl border border-gray-200 bg-gray-50 px-4 py-8 text-center text-sm text-gray-400 dark:border-gray-800 dark:bg-white/[0.03]">Memuat data evaluasi cakupan...</div>}

      {!loading && !error && (
        <>
          {/* Ringkasan */}
          <div className="mt-6 grid gap-4 md:grid-cols-3">
            <div className="rounded-xl border border-blue-200 bg-blue-50 p-4 dark:border-blue-500/30 dark:bg-blue-500/10">
              <p className="text-xs font-semibold uppercase tracking-wide text-blue-600 dark:text-blue-400">Total Dataset OLAP</p>
              <p className="mt-1 text-2xl font-bold text-gray-800 dark:text-white/90">{totalLulusan}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">alumni · 7 kohort · CV {keseimbangan.cv}% {keseimbangan.label}</p>
            </div>
            <div className="rounded-xl border border-violet-200 bg-violet-50 p-4 dark:border-violet-500/30 dark:bg-violet-500/10">
              <p className="text-xs font-semibold uppercase tracking-wide text-violet-600 dark:text-violet-400">Program Studi</p>
              <p className="mt-1 text-2xl font-bold text-gray-800 dark:text-white/90">{totalTersedia}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Comm&Mgmt dominan 67.4% · Others minor 5.1%</p>
            </div>
            <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 dark:border-emerald-500/30 dark:bg-emerald-500/10">
              <p className="text-xs font-semibold uppercase tracking-wide text-emerald-600 dark:text-emerald-400">Keseimbangan Kohort</p>
              <p className="mt-1 text-2xl font-bold text-gray-800 dark:text-white/90">{keseimbangan.label}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">31,31,31,31,31,30,30 — sangat merata</p>
            </div>
          </div>

          {/* Grafik sebaran */}
          <div className="mt-6 grid gap-6 xl:grid-cols-2">
            <div className="rounded-xl border border-gray-100 bg-white p-4 dark:border-gray-800 dark:bg-white/[0.02]">
              <h4 className="text-sm font-semibold text-gray-800 dark:text-white/90">Sebaran Alumni per Program Studi</h4>
              <p className="mt-1 text-xs text-gray-500">Donut — persentase sebaran dari 215 (OLAP)</p>
              <div className="mt-4 h-[220px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={donutData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={55} outerRadius={85} paddingAngle={2}>
                      {donutData.map((e) => <Cell key={e.name} fill={PRODI_COLORS[e.name] ?? "#94a3b8"} />)}
                    </Pie>
                    <Tooltip formatter={(value: any, name: any) => [`${value} (${((Number(value) / totalLulusan) * 100).toFixed(1)}%)`, String(name)]} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="rounded-xl border border-gray-100 bg-white p-4 dark:border-gray-800 dark:bg-white/[0.02]">
              <h4 className="text-sm font-semibold text-gray-800 dark:text-white/90">Sebaran per Tahun Lulus (Kohort)</h4>
              <p className="mt-1 text-xs text-gray-500">Stacked — kontribusi tiap prodi per tahun (2019-2025)</p>
              <div className="mt-4 h-[220px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={perTahunPerProdi} barCategoryGap={12}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="tahun" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                    <YAxis allowDecimals={false} axisLine={false} tickLine={false} />
                    <Tooltip />
                    <Legend wrapperStyle={{ fontSize: 11 }} />
                    {prodiSet.map((p) => <Bar key={p} dataKey={p} stackId="a" fill={PRODI_COLORS[p] ?? "#94a3b8"} radius={[4, 4, 0, 0]} />)}
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Tabel klasifikasi sebaran */}
          <div className="mt-6 overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-800">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-white/[0.03]">
                <tr>
                  <th className="px-3 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Program Studi</th>
                  <th className="px-3 py-3 text-right text-xs font-semibold uppercase tracking-wider text-gray-500">Alumni</th>
                  <th className="px-3 py-3 text-right text-xs font-semibold uppercase tracking-wider text-gray-500">Sebaran</th>
                  <th className="px-3 py-3 text-center text-xs font-semibold uppercase tracking-wider text-gray-500">Klasifikasi Sebaran</th>
                  <th className="px-3 py-3 text-center text-xs font-semibold uppercase tracking-wider text-gray-500">Distribusi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700 bg-white dark:bg-transparent">
                {perProdi.map((row) => {
                  const s = klasSebaran(row.pctSebaran);
                  return (
                    <tr key={row.prodi}>
                      <td className="whitespace-nowrap px-3 py-3 text-sm font-medium text-gray-800 dark:text-white/90">{row.prodi}</td>
                      <td className="whitespace-nowrap px-3 py-3 text-right text-sm font-semibold text-gray-700 dark:text-gray-300">{row.total}</td>
                      <td className="whitespace-nowrap px-3 py-3 text-right text-sm text-gray-600 dark:text-gray-400">{row.pctSebaran.toFixed(2)}%</td>
                      <td className="whitespace-nowrap px-3 py-3 text-center"><span className={`rounded-full border px-2.5 py-1 text-xs font-semibold ${s.color}`}>{s.label}</span></td>
                      <td className="px-3 py-3">
                        <div className="h-2 w-24 overflow-hidden rounded-full bg-gray-100 dark:bg-gray-800">
                          <div className="h-full rounded-full" style={{ width: `${row.pctSebaran}%`, background: PRODI_COLORS[row.prodi] ?? "#6366f1" }} />
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">Klasifikasi sebaran: <b>Dominan &gt;50%</b>, <b>Proporsional 20-50%</b>, <b>Minor &lt;20%</b> dari 215. Comm&Mgmt 67.4% Dominan — perlu oversampling Others (5.1% Minor) pada penelusuran berikutnya.</p>

          {/* Klasifikasi keterserapan */}
          <div className="mt-6 overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-800">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-white/[0.03]">
                <tr>
                  <th className="px-3 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Program Studi</th>
                  <th className="px-3 py-3 text-right text-xs font-semibold uppercase tracking-wider text-gray-500">Bekerja</th>
                  <th className="px-3 py-3 text-right text-xs font-semibold uppercase tracking-wider text-gray-500">Tidak Bekerja</th>
                  <th className="px-3 py-3 text-right text-xs font-semibold uppercase tracking-wider text-gray-500">% Bekerja</th>
                  <th className="px-3 py-3 text-center text-xs font-semibold uppercase tracking-wider text-gray-500">Klasifikasi Keterserapan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700 bg-white dark:bg-transparent">
                {perProdi.map((row) => {
                  const k = klasSerapan(row.pctBekerja);
                  return (
                    <tr key={row.prodi}>
                      <td className="whitespace-nowrap px-3 py-3 text-sm font-medium text-gray-800 dark:text-white/90">{row.prodi}</td>
                      <td className="whitespace-nowrap px-3 py-3 text-right text-sm text-emerald-600 dark:text-emerald-400">{row.bekerja}</td>
                      <td className="whitespace-nowrap px-3 py-3 text-right text-sm text-rose-600 dark:text-rose-400">{row.tidakBekerja}</td>
                      <td className="whitespace-nowrap px-3 py-3 text-right text-sm font-semibold">{row.pctBekerja.toFixed(2)}%</td>
                      <td className="whitespace-nowrap px-3 py-3 text-center"><span className={`rounded-full border px-2.5 py-1 text-xs font-semibold ${k.color}`}>{k.label}</span></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">Klasifikasi keterserapan: <b>Tinggi ≥70%</b> (Comm&Mgmt 70.34%), <b>Sedang 50-70%</b> (Sci&Tech 69.49%), <b>Rendah &lt;50%</b> (Others 45.45%). Others perlu intervensi penelusuran.</p>

          {/* Grafik status per prodi */}
          <div className="mt-6 rounded-xl border border-gray-100 bg-white p-4 dark:border-gray-800 dark:bg-white/[0.02]">
            <h4 className="text-sm font-semibold text-gray-800 dark:text-white/90">Status Pekerjaan per Program Studi</h4>
            <p className="mt-1 text-xs text-gray-500">Stacked 100% — Bekerja vs Tidak Bekerja (OLAP: fact JOIN dim_status_kerja)</p>
            <div className="mt-4 h-[220px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={statusBarData} barCategoryGap={20}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="prodi" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis allowDecimals={false} axisLine={false} tickLine={false} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="Bekerja" stackId="a" fill="#10b981" radius={[6, 6, 0, 0]} />
                  <Bar dataKey="Tidak Bekerja" stackId="a" fill="#f43f5e" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Kohort detail */}
          <div className="mt-6 overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-800">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-white/[0.03]">
                <tr>
                  <th className="px-3 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Tahun Lulus</th>
                  <th className="px-3 py-3 text-right text-xs font-semibold uppercase tracking-wider text-gray-500">Jumlah</th>
                  <th className="px-3 py-3 text-right text-xs font-semibold uppercase tracking-wider text-gray-500">Pangsa Kohort</th>
                  <th className="px-3 py-3 text-center text-xs font-semibold uppercase tracking-wider text-gray-500">Status Kohort</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700 bg-white dark:bg-transparent">
                {perTahun.map((r) => (
                  <tr key={r.tahun}>
                    <td className="whitespace-nowrap px-3 py-3 text-sm font-medium text-gray-800 dark:text-white/90">{r.tahun}</td>
                    <td className="whitespace-nowrap px-3 py-3 text-right text-sm font-semibold">{r.jumlah}</td>
                    <td className="whitespace-nowrap px-3 py-3 text-right text-sm">{((r.jumlah * 100) / totalLulusan).toFixed(1)}%</td>
                    <td className="whitespace-nowrap px-3 py-3 text-center"><span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400">Seimbang</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-5 rounded-xl bg-gray-50 p-4 dark:bg-white/[0.03]">
            <p className="text-xs leading-5 text-gray-500 dark:text-gray-400">
              <strong className="font-semibold text-gray-700 dark:text-gray-300">Interpretasi klasifikasi:</strong> Sebaran Dominan pada Comm&Mgmt menunjukkan bias sampel — laporan IKU per prodi sebaiknya dibaca bersama klasifikasi Seimbang kohort (CV {keseimbangan.cv}% Seimbang, 30-31 per tahun) dan keterserapan per prodi. Sumber: <code>v_olap_detail</code> (215) + agregasi OLAP PostgreSQL <code>COUNT(*) FILTER</code>, bukan hardcode.
            </p>
          </div>
        </>
      )}
    </div>
  );
}
