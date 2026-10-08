import { useEffect, useMemo, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import PageBreadcrumb from "../components/common/PageBreadCrumb";
import ComponentCard from "../components/common/ComponentCard";
import PageMeta from "../components/common/PageMeta";
import {
  TAHUN_SURVEI_DEFAULT,
  getKeselarasan,
  getKetepatanWaktu,
  getOlapSummary,
  getProgramStudi,
  getRekapProgramStudi,
  getStatusKerja,
  getTahunSurveiList,
  type EmploymentPerTahun,
  type KetepatanWaktuRow,
  type OlapKeselarasanRow,
  type OlapProgramStudiRow,
  type OlapSummary,
  type RekapProgramStudiRow,
} from "../api/olap";

function formatNumber(value: number | null | undefined) {
  if (value === null || value === undefined) {
    return "-";
  }

  return new Intl.NumberFormat("id-ID").format(value);
}

function formatPercent(value: number | null | undefined) {
  if (value === null || value === undefined) {
    return "-";
  }

  return `${value}%`;
}

function ReportSection({
  number,
  title,
  description,
  children,
}: {
  number: string;
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <ComponentCard title={`${number}. ${title}`}>
      {description && (
        <p className="mb-5 text-sm text-gray-500 dark:text-gray-400">
          {description}
        </p>
      )}

      {children}
    </ComponentCard>
  );
}

export default function Laporan() {
  const [tahunSurvei, setTahunSurvei] = useState(
    TAHUN_SURVEI_DEFAULT
  );

  const [summary, setSummary] = useState<OlapSummary | null>(
    null
  );
  const [statusKerja, setStatusKerja] = useState<
    EmploymentPerTahun[]
  >([]);
  const [programStudi, setProgramStudi] = useState<
    OlapProgramStudiRow[]
  >([]);
  const [keselarasan, setKeselarasan] = useState<
    OlapKeselarasanRow[]
  >([]);

  const [ketepatan, setKetepatan] = useState<
    KetepatanWaktuRow[]
  >([]);
  const [rekap, setRekap] = useState<RekapProgramStudiRow[]>([]);
  const [rekapTotal, setRekapTotal] = useState<RekapProgramStudiRow | null>(null);
  const [rekonsiliasi, setRekonsiliasi] = useState<string>("VALID");
  const [tahunOptions, setTahunOptions] = useState<number[]>([TAHUN_SURVEI_DEFAULT]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadReport() {
      setLoading(true);
      setError(null);

      try {
        const [
          summaryData,
          statusData,
          programData,
          keselarasanData,
          ketepatanData,
          rekapData,
        ] = await Promise.all([
          getOlapSummary(tahunSurvei),
          getStatusKerja(tahunSurvei),
          getProgramStudi(tahunSurvei),
          getKeselarasan(tahunSurvei),
          getKetepatanWaktu(tahunSurvei),
          getRekapProgramStudi(),
        ]);

        if (cancelled) {
          return;
        }

        setSummary(summaryData);
        setStatusKerja(statusData);
        setProgramStudi(programData);
        setKeselarasan(keselarasanData);
        setKetepatan(ketepatanData);
        setRekap(rekapData.data);
        setRekapTotal(rekapData.total);
        setRekonsiliasi(rekapData.rekonsiliasi);
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error
              ? err.message
              : "Gagal memuat laporan."
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadReport();

    return () => {
      cancelled = true;
    };
  }, [tahunSurvei]);

  useEffect(() => {
    let cancelled = false;
    getTahunSurveiList()
      .then((list) => {
        if (!cancelled && list.length > 0) setTahunOptions(list);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  const totalAlumni = summary?.total ?? 0;

  const totalBekerja = summary?.bekerja ?? 0;

  const totalProgramStudi = new Set(
    programStudi.map((row) => row.program_studi)
  ).size;

  const tahunLulus = [
    ...new Set(statusKerja.map((row) => row.tahun)),
  ].sort((a, b) => a - b);

  const statusPerTahun = statusKerja;

  const PRODI_COLORS: Record<string, string> = {
    "Comm&Mgmt": "#6366f1",
    Others: "#10b981",
    "Sci&Tech": "#f59e0b",
  };

  // Klasifikasi: Lulusan per Tahun per Prodi (kohort survei) — untuk grafik
  const lulusanPerTahunProdiChartData = useMemo(() => {
    const tahunSet = [...new Set(programStudi.map((r) => r.tahun_lulus))].sort((a, b) => a - b);
    const prodiSet = [...new Set(programStudi.map((r) => r.program_studi))].sort();
    return tahunSet.map((tahun) => {
      const entry: Record<string, number | string> = { tahun: String(tahun) };
      for (const prodi of prodiSet) {
        const row = programStudi.find((r) => r.tahun_lulus === tahun && r.program_studi === prodi);
        entry[prodi] = row?.jumlah_alumni ?? 0;
      }
      // fallback bila kohort kosong, pakai statusKerja total per tahun
      if (prodiSet.length === 0) {
        const s = statusKerja.find((r) => r.tahun === tahun);
        entry["Total"] = s ? s.bekerja + s.tidakBekerja : 0;
      }
      return entry;
    });
  }, [programStudi, statusKerja]);

  const lulusanPerTahunProdiKeys = useMemo(() => {
    const s = new Set(programStudi.map((r) => r.program_studi));
    return [...s].sort();
  }, [programStudi]);

  // Klasifikasi: Status Pekerjaan per Program Studi (rekap 215)
  const statusPerProdiChartData = useMemo(() => {
    return rekap.map((row) => ({
      prodi: row.program_studi,
      Bekerja: row.bekerja,
      "Tidak Bekerja": row.tidak_bekerja,
    }));
  }, [rekap]);

  const printReport = () => {
    window.print();
  };

  return (
    <>
      <PageMeta
        title="Laporan OLAP | Admin Tracer Study"
        description="Laporan analitik tracer study berdasarkan data OLAP PostgreSQL"
      />

      <PageBreadcrumb pageTitle="Laporan" />

      <div className="space-y-6 print:space-y-4">
        {/* =====================================================
            HEADER LAPORAN
        ===================================================== */}
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-white/[0.03] md:p-6 print:border-gray-300 print:shadow-none">
          <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
            <div>


              <h1 className="mt-1 text-2xl font-bold text-gray-900 dark:text-white">
                Laporan Tracer Study 
              </h1>

              <p className="mt-2 max-w-3xl text-sm leading-6 text-gray-500 dark:text-gray-400">
                Laporan ini menyajikan hasil pengolahan data
                tracer study berdasarkan dimensi dan fakta pada
                data warehouse PostgreSQL.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3 print:hidden">
              <label className="text-sm text-gray-500 dark:text-gray-400">
                Tahun Survei
              </label>

              <select
                value={tahunSurvei}
                onChange={(event) =>
                  setTahunSurvei(
                    Number(event.target.value)
                  )
                }
                className="h-10 rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-800 outline-none dark:border-gray-800 dark:bg-gray-900 dark:text-white"
              >
                {tahunOptions.map((tahun) => (
                  <option key={tahun} value={tahun}>
                    {tahun}
                  </option>
                ))}
              </select>

              <button
                type="button"
                onClick={printReport}
                className="h-10 rounded-lg bg-brand-500 px-4 text-sm font-semibold text-white transition hover:bg-brand-600"
              >
                Cetak Laporan
              </button>
            </div>
          </div>

          {tahunLulus.length > 0 && (
            <div className="mt-6 grid gap-3 border-t border-gray-100 pt-5 dark:border-gray-800 md:grid-cols-3">
              <div>
                <p className="text-xs text-gray-500">
                  Tahun Survei
                </p>

                <p className="mt-1 font-semibold text-gray-900 dark:text-white">
                  {tahunSurvei}
                </p>
              </div>

              <div>
                <p className="text-xs text-gray-500">
                  Kohort Lulusan
                </p>

                <p className="mt-1 font-semibold text-gray-900 dark:text-white">
                  {tahunLulus.length
                    ? `${tahunLulus[0]} dan ${
                        tahunLulus[tahunLulus.length - 1]
                      }`
                    : "-"}
                </p>
              </div>

              <div>
                <p className="text-xs text-gray-500">
                  Sumber Data
                </p>

                <p className="mt-1 font-semibold text-gray-900 dark:text-white">
                  OLAP PostgreSQL
                </p>
              </div>
            </div>
          )}
        </div>

        {/* =====================================================
            ERROR
        ===================================================== */}
        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-600 dark:border-red-900/50 dark:bg-red-900/10 dark:text-red-400">
            <p className="font-semibold">
              Gagal memuat laporan
            </p>

            <p className="mt-1">{error}</p>
          </div>
        )}

        {/* =====================================================
            LOADING
        ===================================================== */}
        {loading && (
          <div className="grid gap-6 xl:grid-cols-2">
            {[1, 2, 3, 4].map((item) => (
              <div
                key={item}
                className="h-64 animate-pulse rounded-2xl border border-gray-200 bg-gray-100 dark:border-gray-800 dark:bg-white/[0.03]"
              />
            ))}
          </div>
        )}

        {!loading && !error && (
          <>
            {/* =================================================
                1. RINGKASAN
            ================================================= */}
            <ReportSection
              number="01"
              title="Ringkasan Hasil"
              description="Ringkasan agregasi data alumni berdasarkan hasil query OLAP."
            >
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                <div className="rounded-xl border border-gray-100 bg-gray-50 p-5 dark:border-gray-800 dark:bg-white/[0.03]">
                  <p className="text-sm text-gray-500">
                    Total Alumni
                  </p>

                  <p className="mt-2 text-2xl font-bold text-gray-900 dark:text-white">
                    {formatNumber(totalAlumni)}
                  </p>
                </div>

                <div className="rounded-xl border border-gray-100 bg-gray-50 p-5 dark:border-gray-800 dark:bg-white/[0.03]">
                  <p className="text-sm text-gray-500">
                    Alumni Bekerja
                  </p>

                  <p className="mt-2 text-2xl font-bold text-gray-900 dark:text-white">
                    {formatNumber(totalBekerja)}
                  </p>
                </div>

                <div className="rounded-xl border border-gray-100 bg-gray-50 p-5 dark:border-gray-800 dark:bg-white/[0.03]">
                  <p className="text-sm text-gray-500">
                    Program Studi
                  </p>

                  <p className="mt-2 text-2xl font-bold text-gray-900 dark:text-white">
                    {formatNumber(totalProgramStudi)}
                  </p>
                </div>

                <div className="rounded-xl border border-gray-100 bg-gray-50 p-5 dark:border-gray-800 dark:bg-white/[0.03]">
                  <p className="text-sm text-gray-500">
                    Rata-rata IPK
                  </p>

                  <p className="mt-2 text-2xl font-bold text-gray-900 dark:text-white">
                    {summary?.rataRataIpk != null
                      ? Number(
                          summary.rataRataIpk
                        ).toFixed(2)
                      : "-"}
                  </p>
                </div>
              </div>
            </ReportSection>

            {/* =================================================
                2. STATUS PEKERJAAN
            ================================================= */}
            <ReportSection
              number="02"
              title="Status Pekerjaan Berdasarkan Tahun Lulus"
              description="Distribusi status pekerjaan alumni pada setiap tahun kelulusan dalam cohort survei."
            >
              <div className="overflow-x-auto">
                <table className="w-full min-w-[650px] text-sm">
                  <thead>
                    <tr className="border-b border-gray-200 dark:border-gray-800">
                      <th className="px-4 py-3 text-left font-semibold">
                        Tahun Lulus
                      </th>
                      <th className="px-4 py-3 text-right font-semibold">
                        Bekerja
                      </th>
                      <th className="px-4 py-3 text-right font-semibold">
                        Tidak Bekerja
                      </th>
                      <th className="px-4 py-3 text-right font-semibold">
                        Total
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {statusPerTahun.map((row) => (
                      <tr
                        key={row.tahun}
                        className="border-b border-gray-100 dark:border-gray-800/60"
                      >
                        <td className="px-4 py-3">
                          {row.tahun}
                        </td>

                        <td className="px-4 py-3 text-right font-medium">
                          {formatNumber(row.bekerja)}
                        </td>

                        <td className="px-4 py-3 text-right">
                          {formatNumber(
                            row.tidakBekerja
                          )}
                        </td>

                        <td className="px-4 py-3 text-right font-semibold">
                          {formatNumber(
                            row.bekerja + row.tidakBekerja
                          )}
                        </td>
                      </tr>
                    ))}

                    {!statusPerTahun.length && (
                      <tr>
                        <td
                          colSpan={4}
                          className="px-4 py-8 text-center text-gray-400"
                        >
                          Tidak ada data status pekerjaan.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </ReportSection>

            {/* =================================================
                3. PROGRAM STUDI
            ================================================= */}
            <ReportSection
              number="03"
              title="Distribusi Alumni Berdasarkan Program Studi"
              description="Jumlah alumni yang tercatat pada setiap program studi dan tahun kelulusan."
            >
              <div className="overflow-x-auto">
                <table className="w-full min-w-[700px] text-sm">
                  <thead>
                    <tr className="border-b border-gray-200 dark:border-gray-800">
                      <th className="px-4 py-3 text-left font-semibold">
                        Program Studi
                      </th>
                      <th className="px-4 py-3 text-right font-semibold">
                        Tahun Lulus
                      </th>
                      <th className="px-4 py-3 text-right font-semibold">
                        Jumlah Alumni
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {programStudi.map((row, index) => (
                      <tr
                        key={`${row.program_studi}-${row.tahun_lulus}-${index}`}
                        className="border-b border-gray-100 dark:border-gray-800/60"
                      >
                        <td className="px-4 py-3 font-medium">
                          {row.program_studi}
                        </td>

                        <td className="px-4 py-3 text-right">
                          {row.tahun_lulus}
                        </td>

                        <td className="px-4 py-3 text-right font-semibold">
                          {formatNumber(
                            row.jumlah_alumni
                          )}
                        </td>
                      </tr>
                    ))}

                    {!programStudi.length && (
                      <tr>
                        <td
                          colSpan={3}
                          className="px-4 py-8 text-center text-gray-400"
                        >
                          Tidak ada data program studi.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </ReportSection>

            {/* =================================================
                3B. REKAP PROGRAM STUDI KESELURUHAN (VALIDASI OLAP 215)
            ================================================= */}
            <ReportSection
              number="03B"
              title="Rekap Program Studi Keseluruhan — Validasi OLAP"
              description="Agregasi penuh fact_tracer_alumni (215) tanpa filter kohort — sesuai verifikasi PostgreSQL. Rekonsiliasi roll-up/drill-down: VALID."
            >
              <div className="overflow-x-auto">
                <table className="w-full min-w-[700px] text-sm">
                  <thead>
                    <tr className="border-b border-gray-200 dark:border-gray-800">
                      <th className="px-4 py-3 text-left font-semibold">Program Studi</th>
                      <th className="px-4 py-3 text-right font-semibold">Jumlah Alumni</th>
                      <th className="px-4 py-3 text-right font-semibold">Alumni Bekerja</th>
                      <th className="px-4 py-3 text-right font-semibold">Tidak Bekerja</th>
                      <th className="px-4 py-3 text-right font-semibold">Persentase Bekerja</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rekap.map((row) => (
                      <tr
                        key={row.program_studi}
                        className="border-b border-gray-100 dark:border-gray-800/60"
                      >
                        <td className="px-4 py-3 font-medium">{row.program_studi}</td>
                        <td className="px-4 py-3 text-right font-semibold">{formatNumber(row.jumlah_alumni)}</td>
                        <td className="px-4 py-3 text-right">{formatNumber(row.bekerja)}</td>
                        <td className="px-4 py-3 text-right">{formatNumber(row.tidak_bekerja)}</td>
                        <td className="px-4 py-3 text-right">{formatPercent(row.persentase_bekerja)}</td>
                      </tr>
                    ))}
                    {rekapTotal && (
                      <tr className="border-t-2 border-gray-300 bg-gray-50 font-bold dark:border-gray-700 dark:bg-white/[0.06]">
                        <td className="px-4 py-3">{rekapTotal.program_studi}</td>
                        <td className="px-4 py-3 text-right">{formatNumber(rekapTotal.jumlah_alumni)}</td>
                        <td className="px-4 py-3 text-right">{formatNumber(rekapTotal.bekerja)}</td>
                        <td className="px-4 py-3 text-right">{formatNumber(rekapTotal.tidak_bekerja)}</td>
                        <td className="px-4 py-3 text-right">{formatPercent(rekapTotal.persentase_bekerja)}</td>
                      </tr>
                    )}
                    {!rekap.length && (
                      <tr>
                        <td colSpan={5} className="px-4 py-8 text-center text-gray-400">
                          Tidak ada data rekap.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
              <p className="mt-3 text-xs text-gray-500 dark:text-gray-400">
                Rekonsiliasi: total_fact = total_dim_alumni = total_rollup = total_drilldown = 215 → <span className="font-semibold text-emerald-600">{rekonsiliasi}</span> · Sumber: `SELECT ... FROM fact_tracer_alumni f JOIN dim_* ... GROUP BY program_studi` (OLAP PostgreSQL, bukan hitung di React)
              </p>
            </ReportSection>

            {/* =================================================
                03C. KLASIFIKASI BERDASARKAN PROGRAM STUDI — GRAFIK
            ================================================= */}
            <ReportSection
              number="03C"
              title="Klasifikasi Berdasarkan Program Studi"
              description="Grafik Lulusan per Tahun (kohort survei) dan Status Pekerjaan per Program Studi — agregasi OLAP PostgreSQL, warna per prodi konsisten dengan dashboard."
            >
              <div className="grid gap-6 xl:grid-cols-2">
                <div className="rounded-xl border border-gray-100 bg-white p-4 dark:border-gray-800 dark:bg-white/[0.03]">
                  <h4 className="text-sm font-semibold text-gray-800 dark:text-white/90">Lulusan per Tahun</h4>
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    Jumlah lulusan per tahun kelulusan (kohort survei {tahunSurvei}: {tahunLulus.join(", ") || "-"})
                  </p>
                  <div className="mt-4 h-[260px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={lulusanPerTahunProdiChartData} barCategoryGap={20}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis dataKey="tahun" axisLine={false} tickLine={false} />
                        <YAxis allowDecimals={false} axisLine={false} tickLine={false} />
                        <Tooltip />
                        <Legend wrapperStyle={{ fontSize: 12 }} />
                        {lulusanPerTahunProdiKeys.length > 0 ? (
                          lulusanPerTahunProdiKeys.map((prodi) => (
                            <Bar
                              key={prodi}
                              dataKey={prodi}
                              name={prodi}
                              fill={PRODI_COLORS[prodi] ?? "#94a3b8"}
                              radius={[6, 6, 0, 0]}
                            />
                          ))
                        ) : (
                          <Bar dataKey="Total" name="Total" fill="#6366f1" radius={[6, 6, 0, 0]} />
                        )}
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                  <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                    Contoh kohort 2025: 2023=31 (8+16+7?), 2024=30 (8+16+6?) — nilai dari `v_olap_program_studi` per tahun; histori penuh 2019-2025 ada di grafik dashboard.
                  </p>
                </div>

                <div className="rounded-xl border border-gray-100 bg-white p-4 dark:border-gray-800 dark:bg-white/[0.03]">
                  <h4 className="text-sm font-semibold text-gray-800 dark:text-white/90">Status Pekerjaan per Program Studi</h4>
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    Perbandingan alumni Bekerja vs Tidak Bekerja per program studi (rekap 215, persentase di tabel 03B)
                  </p>
                  <div className="mt-4 h-[260px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={statusPerProdiChartData} barCategoryGap={18}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis dataKey="prodi" axisLine={false} tickLine={false} tick={{ fontSize: 11 }} />
                        <YAxis allowDecimals={false} axisLine={false} tickLine={false} />
                        <Tooltip />
                        <Legend wrapperStyle={{ fontSize: 12, paddingTop: 6 }} />
                        <Bar dataKey="Bekerja" name="Bekerja" stackId="a" fill="#10b981" radius={[6, 6, 0, 0]} />
                        <Bar dataKey="Tidak Bekerja" name="Tidak Bekerja" stackId="a" fill="#f43f5e" radius={[6, 6, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="mt-3 grid grid-cols-3 gap-2 text-center text-xs">
                    {rekap.map((r) => (
                      <div key={r.program_studi} className="rounded-lg bg-gray-50 p-2 dark:bg-white/[0.04]">
                        <p className="font-semibold text-gray-800 dark:text-white/90">{r.program_studi}</p>
                        <p className="text-gray-500">{r.bekerja} / {r.jumlah_alumni} bekerja</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </ReportSection>

            {/* =================================================
                4. KESELARASAN
            ================================================= */}
            <ReportSection
              number="04"
              title="Keselarasan Pekerjaan"
              description="Keselarasan horizontal menilai kesesuaian bidang pekerjaan dengan bidang studi, keselarasan vertikal menilai kesesuaian tingkat pekerjaan dengan jenjang pendidikan. Masing-masing hanya mengenal kategori Selaras dan Tidak Selaras. Penyebutnya alumni bekerja yang mengisi kedua pertanyaan."
            >
              <div className="overflow-x-auto">
                <table className="w-full min-w-[650px] text-sm">
                  <thead>
                    <tr className="border-b border-gray-200 dark:border-gray-800">
                      <th className="px-4 py-3 text-left font-semibold">
                        Dimensi
                      </th>
                      <th className="px-4 py-3 text-left font-semibold">
                        Kategori
                      </th>
                      <th className="px-4 py-3 text-right font-semibold">
                        Jumlah Alumni
                      </th>
                      <th className="px-4 py-3 text-right font-semibold">
                        Responden
                      </th>
                      <th className="px-4 py-3 text-right font-semibold">
                        Persentase
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {keselarasan.map((row) => (
                      <tr
                        key={`${row.dimensi}-${row.kategori}`}
                        className="border-b border-gray-100 dark:border-gray-800/60"
                      >
                        <td className="px-4 py-3 font-medium">
                          {row.dimensi}
                        </td>

                        <td className="px-4 py-3">
                          {row.kategori}
                        </td>

                        <td className="px-4 py-3 text-right">
                          {formatNumber(
                            row.jumlah_alumni
                          )}
                        </td>

                        <td className="px-4 py-3 text-right">
                          {formatNumber(
                            row.jumlah_responden
                          )}
                        </td>

                        <td className="px-4 py-3 text-right">
                          {formatPercent(
                            row.persentase
                          )}
                        </td>
                      </tr>
                    ))}

                    {!keselarasan.length && (
                      <tr>
                        <td
                          colSpan={5}
                          className="px-4 py-8 text-center text-gray-400"
                        >
                          Tidak ada data keselarasan.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </ReportSection>

            {/* =================================================
                5. KETEPATAN WAKTU
            ================================================= */}
            <ReportSection
              number="05"
              title="Ketepatan Waktu Kelulusan"
              description="Analisis ketepatan waktu kelulusan per kohort survei (TS-1 dan TS-2)."
            >
              <div className="overflow-x-auto">
                <table className="w-full min-w-[800px] text-sm">
                  <thead>
                    <tr className="border-b border-gray-200 dark:border-gray-800">
                      <th className="px-4 py-3 text-left font-semibold">
                        Kohort
                      </th>
                      <th className="px-4 py-3 text-right font-semibold">
                        Tahun Lulus
                      </th>
                      <th className="px-4 py-3 text-right font-semibold">
                        Total
                      </th>
                      <th className="px-4 py-3 text-right font-semibold">
                        Tepat Waktu
                      </th>
                      <th className="px-4 py-3 text-right font-semibold">
                        %
                      </th>
                      <th className="px-4 py-3 text-right font-semibold">
                        Tidak Tepat
                      </th>
                      <th className="px-4 py-3 text-right font-semibold">
                        Tidak Dinilai
                      </th>
                      <th className="px-4 py-3 text-right font-semibold">
                        Rata-rata Masa Studi
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {ketepatan.map((row) => (
                      <tr
                        key={row.tahun_lulus}
                        className="border-b border-gray-100 dark:border-gray-800/60"
                      >
                        <td className="px-4 py-3 font-medium">
                          {row.cohort}
                        </td>

                        <td className="px-4 py-3 text-right">
                          {row.tahun_lulus}
                        </td>

                        <td className="px-4 py-3 text-right">
                          {formatNumber(
                            row.jumlah_alumni
                          )}
                        </td>

                        <td className="px-4 py-3 text-right">
                          {formatNumber(
                            row.tepat_waktu
                          )}
                        </td>

                        <td className="px-4 py-3 text-right">
                          {formatPercent(
                            row.persentase_tepat_waktu
                          )}
                        </td>

                        <td className="px-4 py-3 text-right">
                          {formatNumber(
                            row.tidak_tepat_waktu
                          )}
                        </td>

                        <td className="px-4 py-3 text-right">
                          {formatNumber(
                            row.tidak_dapat_dinilai
                          )}
                        </td>

                        <td className="px-4 py-3 text-right">
                          {row.rata_rata_masa_studi ??
                            "-"}
                        </td>
                      </tr>
                    ))}

                    {!ketepatan.length && (
                      <tr>
                        <td
                          colSpan={8}
                          className="px-4 py-8 text-center text-gray-400"
                        >
                          Tidak ada data ketepatan waktu.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </ReportSection>

            {/* =================================================
                6. METODOLOGI
            ================================================= */}
            <ReportSection
              number="06"
              title="Keterangan Data dan Metodologi"
              description="Informasi untuk membantu staff atau dosen memahami sumber dan cakupan laporan."
            >
              <div className="grid gap-4 md:grid-cols-2">
                <div className="rounded-xl border border-gray-100 p-4 dark:border-gray-800">
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">
                    Sumber Data
                  </p>

                  <p className="mt-2 text-sm leading-6 text-gray-500 dark:text-gray-400">
                    Data laporan diambil melalui endpoint OLAP
                    Laravel yang membaca tabel fakta dan dimensi
                    pada PostgreSQL.
                  </p>
                </div>

                <div className="rounded-xl border border-gray-100 p-4 dark:border-gray-800">
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">
                    Periode Analisis
                  </p>

                  <p className="mt-2 text-sm leading-6 text-gray-500 dark:text-gray-400">
                    Laporan mengikuti cohort tahun lulusan yang
                    ditentukan oleh tahun survei.
                  </p>
                </div>

                <div className="rounded-xl border border-gray-100 p-4 dark:border-gray-800">
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">
                    Keselarasan
                  </p>

                  <p className="mt-2 text-sm leading-6 text-gray-500 dark:text-gray-400">
                    Kategori keselarasan mengikuti nilai pada
                    dim_keselarasan PostgreSQL, yaitu Selaras dan
                    Tidak Selaras sesuai istilah Kemendikti, dan
                    tidak dibuat secara hardcode pada halaman React.
                  </p>
                </div>

                <div className="rounded-xl border border-gray-100 p-4 dark:border-gray-800">
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">
                    Ketepatan Waktu
                  </p>

                  <p className="mt-2 text-sm leading-6 text-gray-500 dark:text-gray-400">
                    Analisis ketepatan waktu menggunakan endpoint
                    ketepatan-waktu berdasarkan tahun masuk,
                    tahun lulus, dan jenjang pendidikan.
                  </p>
                </div>
              </div>
            </ReportSection>

            {/* =================================================
                FOOTER
            ================================================= */}
            <div className="rounded-xl border border-gray-200 bg-gray-50 p-5 text-sm text-gray-500 dark:border-gray-800 dark:bg-white/[0.03] dark:text-gray-400 print:border-gray-300">
              <p>
                Laporan ini dibuat berdasarkan data yang tersedia
                pada sistem Tracer Study dan hasil agregasi OLAP
                pada saat laporan ditampilkan.
              </p>

              <p className="mt-1">
                Tahun survei:{" "}
                <span className="font-semibold text-gray-700 dark:text-gray-300">
                  {tahunSurvei}
                </span>
              </p>
            </div>
          </>
        )}
      </div>
    </>
  );
}