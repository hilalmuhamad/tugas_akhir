import { useEffect, useMemo, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  LabelList,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import PageMeta from "../../components/common/PageMeta";
import EcommerceMetrics from "../../components/ecommerce/EcommerceMetrics";
import ReportButton from "../../components/ecommerce/ReportButton";
import TepatWaktuPanel from "../../components/ecommerce/TepatWaktuPanel";
import {
  DIMENSI_KESELARASAN,
  getKeselarasan,
  getKeselarasanProgramStudi,
  getMasaTungguHistori,
  getStatusKerja,
  getTahunLulus,
  getTahunSurveiList,
  KATEGORI_KESELARASAN,
  LABEL_DIMENSI,
  syncOlap,
  TAHUN_SURVEI_DEFAULT,
} from "../../api/olap";
import type {
  DimensiKeselarasan,
  EmploymentPerTahun,
  KategoriKeselarasan,
  OlapKeselarasanProgramStudiRow,
  OlapKeselarasanRow,
  OlapMasaTungguHistoriRow,
  OlapTahunLulusRow,
} from "../../api/olap";

interface ChartBundle {
  perTahun: OlapTahunLulusRow[];
  employment: EmploymentPerTahun[];
  keselarasan: OlapKeselarasanRow[];
  keselarasanProgramStudi: OlapKeselarasanProgramStudiRow[];
  masaTungguHistori: OlapMasaTungguHistoriRow[];
}

const PRODI_COLORS = [
  "#6366f1",
  "#10b981",
  "#f59e0b",
  "#8b5cf6",
  "#ec4899",
  "#14b8a6",
];

/**
 * Warna dua kategori keselarasan.
 *
 * Skala berjenjang ("Sangat erat", "Cukup erat", dan
 * seterusnya) sudah dihapus dari basis data pada revisi
 * pascasidang, jadi hanya ada dua warna di sini.
 */
const KATEGORI_COLORS: Record<KategoriKeselarasan, string> = {
  Selaras: "#10b981",
  "Tidak Selaras": "#f43f5e",
};

function ChartPanel({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
          {title}
        </h3>

        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          {subtitle}
        </p>
      </div>

      {children}
    </div>
  );
}

export default function Home() {
  const [tahunSurvei, setTahunSurvei] = useState(
    TAHUN_SURVEI_DEFAULT
  );

  const [charts, setCharts] = useState<ChartBundle | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  /**
   * Operasi SLICE pada dimensi keselarasan.
   *
   * Satu panggilan /olap/keselarasan mengirim kedua dimensi
   * sekaligus, jadi pergantian dimensi tidak memicu request
   * baru: yang berubah hanya irisan baris yang ditampilkan.
   */
  const [dimensi, setDimensi] =
    useState<DimensiKeselarasan>("Horizontal");
  const [tahunOptions, setTahunOptions] = useState<number[]>([
    TAHUN_SURVEI_DEFAULT,
  ]);
  const [syncing, setSyncing] = useState(false);
  const [syncMsg, setSyncMsg] = useState<string | null>(null);

  /**
   * =========================================================
   * DATA OLAP — terpusat PostgreSQL
   * =========================================================
   *
   * Semua agregasi dihitung view PostgreSQL; React hanya
   * mengirim tahun_survei untuk grafik kohort, kecuali
   * masa tunggu histori yang memang seluruh rentang OLAP.
   *
   * - getKeselarasan            -> v_olap_keselarasan
   * - getKeselarasanProgramStudi -> v_olap_keselarasan_program_studi
   * - getMasaTungguHistori      -> v_olap_masa_tunggu_histori (seluruh 2019-2025, OLAP)
   */
  useEffect(() => {
    let cancelled = false;

    setLoading(true);
    setError(null);

    Promise.all([
      getTahunLulus(tahunSurvei),
      getStatusKerja(tahunSurvei),
      getKeselarasan(tahunSurvei),
      getKeselarasanProgramStudi(tahunSurvei),
      getMasaTungguHistori(),
    ])
      .then(
        ([
          perTahun,
          employment,
          keselarasan,
          keselarasanProgramStudi,
          masaTungguHistori,
        ]) => {
          if (!cancelled) {
            setCharts({
              perTahun,
              employment,
              keselarasan,
              keselarasanProgramStudi,
              masaTungguHistori,
            });
          }
        }
      )
      .catch((err) => {
        if (!cancelled) {
          setError(
            err instanceof Error
              ? err.message
              : "Gagal memuat data dashboard."
          );
        }
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [tahunSurvei, reloadKey]);

  /**
   * REAL-TIME REFRESH (Event-Driven OLAP)
   * - Jika Laravel Reverb/Pusher aktif: Echo.channel('olap').listen('OlapDataUpdated') -> reload
   * - Fallback: polling 30s + window event 'olap-updated'
   * GET /api/olap/* tetap query fact_tracer_alumni langsung (GROUP BY/ROLLUP di PostgreSQL view)
   */
  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const w = window as unknown as Record<string, any>;
    let echoCleanup: (() => void) | null = null;

    if (w.Echo?.channel) {
      try {
        const channel = w.Echo.channel('olap');
        channel.listen('.OlapDataUpdated', () => setReloadKey((k) => k + 1));
        echoCleanup = () => {
          try {
            w.Echo.leaveChannel('olap');
          } catch {
            /* ignore */
          }
        };
      } catch {
        /* Echo not configured — fallback below */
      }
    }

    const onOlapUpdated = () => setReloadKey((k) => k + 1);
    window.addEventListener('olap-updated', onOlapUpdated);

    const pollId = window.setInterval(() => {
      if (!document.hidden) setReloadKey((k) => k + 1);
    }, 30000);

    const onVisible = () => {
      if (!document.hidden) setReloadKey((k) => k + 1);
    };
    document.addEventListener('visibilitychange', onVisible);

    return () => {
      if (echoCleanup) echoCleanup();
      window.removeEventListener('olap-updated', onOlapUpdated);
      document.removeEventListener('visibilitychange', onVisible);
      window.clearInterval(pollId);
    };
  }, []);

  // Tahun survei dinamis — agar admin bisa ganti tanpa pgAdmin
  useEffect(() => {
    let cancelled = false;
    getTahunSurveiList()
      .then((list) => {
        if (!cancelled && list.length > 0) {
          setTahunOptions(list);
          // jika tahunSurvei saat ini tidak ada di list, pakai yang terbaru
          if (!list.includes(tahunSurvei)) setTahunSurvei(list[0]!);
        }
      })
      .catch(() => {
        /* fallback tetap 2025 */
      });
    return () => {
      cancelled = true;
    };
  }, []); // fetch sekali, list jarang berubah kecuali sync

  const handleSync = async () => {
    setSyncing(true);
    setSyncMsg(null);
    try {
      const result = await syncOlap();
      setSyncMsg(`Sinkronisasi berhasil — staging ${result.staging}, fakta ${result.fakta}`);
      // refresh tahun options & dashboard
      try {
        const list = await getTahunSurveiList();
        if (list.length > 0) setTahunOptions(list);
      } catch {}
      setReloadKey((k) => k + 1);
      window.dispatchEvent(new CustomEvent("olap-updated"));
      setTimeout(() => setSyncMsg(null), 4000);
    } catch (err) {
      setSyncMsg(err instanceof Error ? err.message : "Sinkronisasi gagal");
    } finally {
      setSyncing(false);
    }
  };

  const graduateData = useMemo(
    () =>
      charts?.perTahun.map((row) => ({
        tahun: row.tahun_lulus,
        totalLulusan: row.jumlah_alumni,
      })) ?? [],
    [charts]
  );

  const employmentData = useMemo(
    () => charts?.employment ?? [],
    [charts]
  );

  /**
   * Irisan baris keselarasan untuk dimensi yang aktif.
   *
   * View mengirim empat baris per tahun survei
   * (2 dimensi x 2 kategori); di sini diambil dua di
   * antaranya. Tidak ada penjumlahan di React.
   */
  const keselarasanAktif = useMemo(
    () =>
      charts?.keselarasan.filter(
        (row) => row.dimensi === dimensi
      ) ?? [],
    [charts, dimensi]
  );

  /**
   * Penyebut dimensi aktif: alumni berstatus "Bekerja" yang
   * mengisi kedua pertanyaan keselarasan. Nilainya sama pada
   * setiap baris satu dimensi, jadi cukup dibaca sekali.
   */
  const respondenKeselarasan =
    keselarasanAktif[0]?.jumlah_responden ?? 0;

  /**
   * Donut komposisi keselarasan dimensi aktif.
   *
   * Sumber: view v_olap_keselarasan (jumlah_alumni sudah
   * final). React TIDAK menjumlahkan baris per prodi —
   * perhitungan tersebut ada di PostgreSQL.
   */
  const keselarasanDonutData = useMemo(() => {
    const lookup = new Map(
      keselarasanAktif.map((row) => [
        row.kategori,
        row.jumlah_alumni,
      ])
    );

    return KATEGORI_KESELARASAN.map((kategori) => ({
      name: kategori,
      value: lookup.get(kategori) ?? 0,
    }));
  }, [keselarasanAktif]);

  /**
   * Ringkasan kedua dimensi sekaligus, supaya angka dimensi
   * yang sedang tidak dipilih tetap terlihat tanpa klik.
   *
   * `persentase` diambil apa adanya dari view.
   */
  const ringkasanKeselarasan = useMemo(
    () =>
      DIMENSI_KESELARASAN.map((dim) => {
        const baris = charts?.keselarasan.find(
          (row) =>
            row.dimensi === dim && row.kategori === "Selaras"
        );

        return {
          dimensi: dim,
          label: LABEL_DIMENSI[dim],
          selaras: baris?.jumlah_alumni ?? 0,
          responden: baris?.jumlah_responden ?? 0,
          persentase: baris?.persentase ?? 0,
        };
      }),
    [charts]
  );

  /**
   * Nama program studi dari OLAP histori (bukan hardcode).
   * Sumber: v_olap_masa_tunggu_histori — seluruh rentang.
   */
  const prodiNames = useMemo(() => {
    if (!charts) return [];
    return [...new Set(charts.masaTungguHistori.map((row) => row.program_studi))].sort();
  }, [charts]);

  const historiTahunRange = useMemo(() => {
    if (!charts?.masaTungguHistori.length) return null;
    const ys = [...new Set(charts.masaTungguHistori.map((r) => r.tahun_lulus))].sort((a, b) => a - b);
    return ys.length ? `${ys[0]}-${ys[ys.length - 1]}` : null;
  }, [charts]);

  /**
   * Transformasi untuk line chart masa tunggu — seluruh histori.
   * Rata-rata sudah agregasi OLAP v_olap_masa_tunggu_histori (AVG per prodi per tahun).
   * React hanya pivot {tahun_lulus, prodi: rataRata}, NULL dipertahankan.
   */
  const masaTungguData = useMemo(() => {
    if (!charts) return [];
    const tahunList = [...new Set(charts.masaTungguHistori.map((row) => row.tahun_lulus))].sort((a, b) => a - b);
    return tahunList.map((tahun) => {
      const entry: Record<string, number | string | null> = { tahun_lulus: tahun };
      for (const prodi of prodiNames) {
        const row = charts.masaTungguHistori.find((r) => r.tahun_lulus === tahun && r.program_studi === prodi);
        entry[prodi] = row?.rata_rata_masa_tunggu ?? null;
      }
      return entry;
    });
  }, [charts, prodiNames]);

  /**
   * Stacked bar keselarasan per program studi (dimensi aktif).
   *
   * Nilai bar adalah `persentase` langsung dari view
   * v_olap_keselarasan_program_studi. React TIDAK
   * menghitung jumlah/total*100.
   */
  const keselarasanProgramChartData = useMemo(() => {
    if (!charts) {
      return [];
    }

    const baris = charts.keselarasanProgramStudi.filter(
      (row) => row.dimensi === dimensi
    );

    const prodis = [
      ...new Set(baris.map((row) => row.program_studi)),
    ].sort();

    return prodis.map((prodi) => {
      const entry: Record<string, number | string> = {
        programStudi: prodi,
      };

      for (const kategori of KATEGORI_KESELARASAN) {
        entry[kategori] =
          baris.find(
            (row) =>
              row.program_studi === prodi &&
              row.kategori === kategori
          )?.persentase ?? 0;
      }

      return entry;
    });
  }, [charts, dimensi]);

  /**
   * Tabel detail keselarasan per program studi (dimensi aktif).
   *
   * Baris API tetap jumlahnya (prodi x 2 kategori) karena view
   * memakai kerangka CROSS JOIN, jadi kategori bernilai 0 pun
   * tetap muncul. `jumlah_alumni`, `jumlah_responden`, dan
   * `persentase` sudah final dari PostgreSQL.
   */
  const keselarasanProgramTableData = useMemo(
    () =>
      charts?.keselarasanProgramStudi.filter(
        (row) => row.dimensi === dimensi
      ) ?? [],
    [charts, dimensi]
  );

  /**
   * Kekosongan dinilai dari baris mentah API, bukan dari data
   * chart: keselarasanDonutData selalu berisi dua kategori
   * (hasil map atas KATEGORI_KESELARASAN) sehingga panjangnya
   * tidak pernah nol dan tidak bisa dipakai sebagai penanda.
   */
  const isEmpty =
    graduateData.length === 0 &&
    employmentData.length === 0 &&
    (charts?.keselarasan.length ?? 0) === 0 &&
    (charts?.keselarasanProgramStudi.length ?? 0) === 0 &&
    masaTungguData.length === 0;

  return (
    <>
      <PageMeta
        title="Dashboard Tracer Study | Admin"
        description="Dashboard analitik OLAP untuk monitoring pertumbuhan karier lulusan"
      />

      <div className="space-y-6">
        <div className="flex flex-col gap-3 rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:flex-row md:items-center md:justify-between md:p-6">
          <div>
            <h2 className="text-xl font-semibold text-gray-800 dark:text-white/90">
              Dashboard Tracer Study Alumni
            </h2>

            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
               kohort survei {tahunSurvei}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <label className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
              <span className="shrink-0">Tahun Survei</span>

              <select
                value={tahunSurvei}
                onChange={(event) =>
                  setTahunSurvei(Number(event.target.value))
                }
                className="h-9 rounded-lg border border-gray-200 bg-white px-2.5 text-sm text-gray-800 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-800 dark:bg-gray-900 dark:text-white/90 dark:focus:border-brand-800"
              >
                {tahunOptions.map((th) => (
                  <option key={th} value={th}>
                    {th}
                  </option>
                ))}
              </select>
            </label>

            <button
              type="button"
              onClick={handleSync}
              disabled={syncing}
              className="inline-flex h-9 items-center justify-center gap-1.5 rounded-lg bg-emerald-600 px-3.5 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
              title="Muat ulang staging dari kuesioner lalu bangun ulang tabel fakta OLAP"
            >
              {syncing ? (
                <>
                  <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                  Sinkronisasi...
                </>
              ) : (
                <>↻ Sinkronisasi</>
              )}
            </button>

            <ReportButton />
          </div>
        </div>

        {syncMsg && (
          <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800 dark:border-emerald-900/30 dark:bg-emerald-900/20 dark:text-emerald-300">
            {syncMsg}
          </div>
        )}

        <EcommerceMetrics tahunSurvei={tahunSurvei} />

        {/* =====================================================
            KESELARASAN PEKERJAAN ALUMNI
        ===================================================== */}

        {!loading && !error && !isEmpty && (
          <ChartPanel
            title="Keselarasan Pekerjaan Alumni"
            subtitle="Dua kategori sesuai istilah Kemendikti: Selaras dan Tidak Selaras. Penyebutnya alumni berstatus bekerja yang mengisi kedua pertanyaan keselarasan."
          >
            {/* =================================================
                RINGKASAN DUA DIMENSI SEKALIGUS KENDALI SLICE
            ================================================== */}
            <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
              <div className="grid gap-3 sm:grid-cols-2">
                {ringkasanKeselarasan.map((item) => (
                  <button
                    key={item.dimensi}
                    type="button"
                    onClick={() => setDimensi(item.dimensi)}
                    aria-pressed={dimensi === item.dimensi}
                    className={`rounded-xl border p-4 text-left transition ${
                      dimensi === item.dimensi
                        ? "border-brand-400 bg-brand-50 dark:border-brand-700 dark:bg-brand-500/10"
                        : "border-gray-200 bg-white hover:border-gray-300 dark:border-gray-800 dark:bg-white/[0.03] dark:hover:border-gray-700"
                    }`}
                  >
                    <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
                      {item.label}
                    </p>

                    <p className="mt-2 text-2xl font-semibold text-gray-800 dark:text-white/90">
                      {item.persentase}%

                      <span className="ml-1.5 text-xs font-normal text-gray-500 dark:text-gray-400">
                        Selaras
                      </span>
                    </p>

                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                      {item.selaras} dari {item.responden} responden
                    </p>
                  </button>
                ))}
              </div>

              <p className="max-w-xs text-xs text-gray-500 dark:text-gray-400">
                Pilih salah satu kartu untuk mengiris grafik dan tabel
                di bawah menurut dimensi tersebut.
              </p>
            </div>

            <div className="grid gap-8 xl:grid-cols-[1.7fr_1fr]">

              {/* LEFT — BAR CHART */}
              <div>
                <div className="mb-4">
                  <h4 className="text-sm font-semibold text-gray-800 dark:text-white/90">
                    Keselarasan {dimensi} per Program Studi
                  </h4>

                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    Persentase responden per kategori (dari view
                    v_olap_keselarasan_program_studi)
                  </p>
                </div>

                <div className="h-[200px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={keselarasanProgramChartData}
                      layout="vertical"
                      margin={{
                        top: 10,
                        right: 20,
                        left: 0,
                        bottom: 0,
                      }}
                    >
                      <CartesianGrid
                        strokeDasharray="3 3"
                        horizontal={false}
                      />

                      <XAxis
                        type="number"
                        unit="%"
                        axisLine={false}
                        tickLine={false}
                      />

                      <YAxis
                        type="category"
                        dataKey="programStudi"
                        width={150}
                        axisLine={false}
                        tickLine={false}
                        tick={{ fontSize: 11 }}
                      />

                      <Tooltip
                        formatter={(value, name) => [
                          `${value}%`,
                          name,
                        ]}
                      />
                      <Legend />

                      <Bar
                        dataKey="Selaras"
                        name="Selaras"
                        stackId="keselarasan"
                        fill={KATEGORI_COLORS.Selaras}
                      />
                      <Bar
                        dataKey="Tidak Selaras"
                        name="Tidak Selaras"
                        stackId="keselarasan"
                        fill={KATEGORI_COLORS["Tidak Selaras"]}
                        radius={[0, 6, 6, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* RIGHT — DONUT */}
              <div>
                <div className="mb-4">
                  <h4 className="text-sm font-semibold text-gray-800 dark:text-white/90">
                    Komposisi Keselarasan {dimensi}
                  </h4>

                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    {respondenKeselarasan} responden bekerja yang
                    menjawab (view v_olap_keselarasan)
                  </p>
                </div>

                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={keselarasanDonutData}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        innerRadius={65}
                        outerRadius={100}
                        paddingAngle={2}
                      >
                        {keselarasanDonutData.map((entry) => (
                          <Cell
                            key={`keselarasan-${entry.name}`}
                            fill={KATEGORI_COLORS[entry.name]}
                          />
                        ))}
                      </Pie>

                      <Tooltip
                        formatter={(value, name) => [
                          `${value} alumni`,
                          name,
                        ]}
                      />

                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* =================================================
                  FULL WIDTH TABLE
              ================================================== */}
              <div className="xl:col-span-2">

                <div className="mb-4">
                  <h4 className="text-sm font-semibold text-gray-800 dark:text-white/90">
                    Detail Keselarasan {dimensi} per Program Studi
                  </h4>

                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    Jumlah dan persentase responden (langsung dari
                    v_olap_keselarasan_program_studi). Kolom
                    "Responden" adalah penyebut persentase di baris
                    tersebut.
                  </p>
                </div>

                <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-800">
                  <table className="w-full min-w-[720px] text-sm">
                    <thead>
                      <tr className="border-b border-gray-200 bg-gray-50 dark:border-gray-800 dark:bg-white/[0.03]">
                        <th
                          rowSpan={2}
                          className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-600 dark:text-gray-300"
                        >
                          Program Studi
                        </th>

                        <th
                          rowSpan={2}
                          className="border-l border-gray-200 px-3 py-3 text-center text-xs font-semibold uppercase tracking-wide text-gray-600 dark:border-gray-800 dark:text-gray-300"
                        >
                          Responden
                        </th>

                        {KATEGORI_KESELARASAN.map((category) => (
                          <th
                            key={category}
                            colSpan={2}
                            className="border-l border-gray-200 px-3 py-3 text-center text-xs font-semibold uppercase tracking-wide text-gray-600 dark:border-gray-800 dark:text-gray-300"
                          >
                            {category}
                          </th>
                        ))}
                      </tr>

                      <tr className="border-b border-gray-200 bg-gray-50 dark:border-gray-800 dark:bg-white/[0.03]">
                        {KATEGORI_KESELARASAN.flatMap((category) => [
                          <th
                            key={`${category}-jumlah`}
                            className="border-l border-gray-200 px-3 py-2 text-center text-[11px] font-medium text-gray-500 dark:border-gray-800 dark:text-gray-400"
                          >
                            Jumlah
                          </th>,
                          <th
                            key={`${category}-persen`}
                            className="px-3 py-2 text-center text-[11px] font-medium text-gray-500 dark:text-gray-400"
                          >
                            %
                          </th>,
                        ])}
                      </tr>
                    </thead>

                    <tbody>
                      {keselarasanProgramTableData
                        .filter(
                          (row, index, all) =>
                            all.findIndex(
                              (r) => r.program_studi === row.program_studi
                            ) === index
                        )
                        .sort((a, b) =>
                          a.program_studi.localeCompare(b.program_studi)
                        )
                        .map((prodiRow) => (
                          <tr
                            key={prodiRow.program_studi}
                            className="border-b border-gray-100 last:border-0 hover:bg-gray-50 dark:border-gray-800/60 dark:hover:bg-white/[0.02]"
                          >
                            <td className="px-4 py-4 font-medium text-gray-700 dark:text-gray-300">
                              {prodiRow.program_studi}
                            </td>

                            <td className="border-l border-gray-100 px-3 py-4 text-center text-gray-500 dark:border-gray-800/60 dark:text-gray-400">
                              {prodiRow.jumlah_responden}
                            </td>

                            {KATEGORI_KESELARASAN.flatMap((category) => {
                              const item =
                                keselarasanProgramTableData.find(
                                  (row) =>
                                    row.program_studi ===
                                      prodiRow.program_studi &&
                                    row.kategori === category
                                );

                              return [
                                <td
                                  key={`${prodiRow.program_studi}-${category}-jumlah`}
                                  className="border-l border-gray-100 px-3 py-4 text-center font-semibold text-gray-800 dark:border-gray-800/60 dark:text-white/90"
                                >
                                  {item?.jumlah_alumni ?? 0}
                                </td>,
                                <td
                                  key={`${prodiRow.program_studi}-${category}-persen`}
                                  className="px-3 py-4 text-center text-gray-500 dark:text-gray-400"
                                >
                                  {item?.persentase ?? 0}%
                                </td>,
                              ];
                            })}
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>

              </div>

            </div>
          </ChartPanel>
        )}

        {loading && (
          <div className="grid gap-6 xl:grid-cols-2">
            {[1, 2].map((item) => (
              <div
                key={item}
                className="h-96 animate-pulse rounded-2xl border border-gray-200 bg-gray-100 dark:border-gray-800 dark:bg-white/[0.05]"
              />
            ))}
          </div>
        )}

        {!loading && error && (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-5 text-sm text-red-600 dark:border-red-900/50 dark:bg-red-900/10 dark:text-red-400">
            <p className="font-medium">Gagal memuat data dashboard.</p>

            <p className="mt-1">{error}</p>

            <button
              type="button"
              onClick={() => setReloadKey((key) => key + 1)}
              className="mt-3 rounded-lg border border-red-200 bg-white px-3 py-1.5 text-xs font-semibold text-red-600 transition hover:bg-red-100 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-400 dark:hover:bg-red-900/20"
            >
              Coba lagi
            </button>
          </div>
        )}

        {!loading && !error && isEmpty && (
          <div className="rounded-2xl border border-gray-200 bg-white p-8 text-center text-sm text-gray-500 dark:border-gray-800 dark:bg-white/[0.03] dark:text-gray-400">
            Tidak ada data untuk filter yang dipilih.
          </div>
        )}

        {!loading && !error && !isEmpty && (
          <>
            {/* Row 1 */}
            <div className="grid gap-6 xl:grid-cols-2">
              <ChartPanel
                title="Lulusan per Tahun"
                subtitle="Jumlah lulusan per tahun kelulusan (kohort survei)"
              >
                <div className="h-[260px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={graduateData} barCategoryGap={18}>
                      <CartesianGrid
                        strokeDasharray="3 3"
                        vertical={false}
                      />

                      <XAxis
                        dataKey="tahun"
                        axisLine={false}
                        tickLine={false}
                      />

                      <YAxis
                        allowDecimals={false}
                        axisLine={false}
                        tickLine={false}
                      />

                      <Tooltip />

                      <Bar
                        dataKey="totalLulusan"
                        name="Total Lulusan"
                        fill="#6366f1"
                        radius={[8, 8, 0, 0]}
                      >
                        <LabelList
                          dataKey="totalLulusan"
                          position="top"
                          formatter={(value) => String(value ?? "")}
                          fill="#374151"
                          fontSize={11}
                        />
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </ChartPanel>

              <ChartPanel
                title="Status Pekerjaan"
                subtitle="Perbandingan alumni bekerja dan tidak bekerja per tahun"
              >
                <div className="h-[260px]">
                  <ResponsiveContainer width="50%" height="100%">
                    <BarChart data={employmentData} barCategoryGap={18}>
                      <CartesianGrid
                        strokeDasharray="3 3"
                        vertical={false}
                      />

                      <XAxis
                        dataKey="tahun"
                        axisLine={false}
                        tickLine={false}
                      />

                      <YAxis
                        allowDecimals={false}
                        axisLine={false}
                        tickLine={false}
                      />

                      <Tooltip />

                      <Legend wrapperStyle={{ fontSize: 12, paddingTop: 8 }} />

                      <Bar
                        dataKey="bekerja"
                        name="Bekerja"
                        stackId="employment"
                        fill="#10b981"
                        radius={[8, 8, 0, 0]}
                      >
                        <LabelList
                          dataKey="bekerja"
                          position="top"
                          formatter={(value) => String(value ?? "")}
                          fill="#0f172a"
                          fontSize={11}
                        />
                      </Bar>

                      <Bar
                        dataKey="tidakBekerja"
                        name="Tidak Bekerja"
                        stackId="employment"
                        fill="#f43f5e"
                        radius={[8, 8, 0, 0]}
                      >
                        <LabelList
                          dataKey="tidakBekerja"
                          position="top"
                          formatter={(value) => String(value ?? "")}
                          fill="#0f172a"
                          fontSize={11}
                        />
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </ChartPanel>
            </div>

            {/* Row 2 — OLAP histori terpusat PostgreSQL, bukan hardcode */}
            <ChartPanel
              title="Program Studi dan Masa Tunggu Kerja"
              subtitle={`Rata-rata masa tunggu kerja alumni (bulan) per program studi per tahun lulus — seluruh histori ${historiTahunRange ?? "OLAP"} (v_olap_masa_tunggu_histori, OLAP PostgreSQL)`}
            >
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={masaTungguData}
                    margin={{
                      top: 10,
                      right: 20,
                      left: 0,
                      bottom: 0,
                    }}
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      vertical={false}
                    />

                    <XAxis
                      dataKey="tahun_lulus"
                      axisLine={false}
                      tickLine={false}
                    />

                    <YAxis
                      axisLine={false}
                      tickLine={false}
                      unit=" bln"
                    />

                    <Tooltip
                      formatter={(value, name) => [
                        value === null || value === undefined
                          ? "Tidak ada data"
                          : `${value} bulan`,
                        name,
                      ]}
                    />

                    <Legend
                      wrapperStyle={{
                        fontSize: 12,
                        paddingTop: 8,
                      }}
                    />

                    {prodiNames.map((prodi, index) => (
                      <Line
                        key={prodi}
                        type="monotone"
                        dataKey={prodi}
                        name={prodi}
                        stroke={
                          PRODI_COLORS[index % PRODI_COLORS.length]
                        }
                        strokeWidth={2}
                        dot={{ r: 4 }}
                        activeDot={{ r: 6 }}
                        connectNulls
                      />
                    ))}
                  </LineChart>
                </ResponsiveContainer>
              </div>

              {/* Data awal sebelum agregasi grafik — OLAP */}
              <div className="mt-6 overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-800">
                <table className="w-full min-w-[720px] text-sm">
                  <thead>
                    <tr className="border-b border-gray-200 bg-gray-50 dark:border-gray-800 dark:bg-white/[0.03]">
                      <th className="px-3 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-600 dark:text-gray-300">Tahun Lulus</th>
                      <th className="px-3 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-600 dark:text-gray-300">Program Studi</th>
                      <th className="px-3 py-3 text-center text-xs font-semibold uppercase tracking-wide text-gray-600 dark:text-gray-300">Jumlah Alumni</th>
                      <th className="px-3 py-3 text-center text-xs font-semibold uppercase tracking-wide text-gray-600 dark:text-gray-300">Rata-rata (bln)</th>
                      <th className="px-3 py-3 text-center text-xs font-semibold uppercase tracking-wide text-gray-600 dark:text-gray-300">Min</th>
                      <th className="px-3 py-3 text-center text-xs font-semibold uppercase tracking-wide text-gray-600 dark:text-gray-300">Max</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[...(charts?.masaTungguHistori ?? [])]
                      .sort((a, b) => a.tahun_lulus - b.tahun_lulus || a.program_studi.localeCompare(b.program_studi))
                      .map((row) => (
                        <tr key={`${row.tahun_lulus}-${row.program_studi}`} className="border-b border-gray-100 last:border-0 hover:bg-gray-50 dark:border-gray-800/60 dark:hover:bg-white/[0.02]">
                          <td className="px-3 py-2.5 text-center font-medium text-gray-700 dark:text-gray-300">{row.tahun_lulus}</td>
                          <td className="px-3 py-2.5 font-medium text-gray-700 dark:text-gray-300">{row.program_studi}</td>
                          <td className="px-3 py-2.5 text-center">{row.jumlah_alumni}</td>
                          <td className="px-3 py-2.5 text-center font-semibold text-gray-800 dark:text-white/90">
                            {row.rata_rata_masa_tunggu != null ? `${row.rata_rata_masa_tunggu} bln` : "—"}
                          </td>
                          <td className="px-3 py-2.5 text-center text-gray-500">{row.masa_tunggu_min ?? "—"}</td>
                          <td className="px-3 py-2.5 text-center text-gray-500">{row.masa_tunggu_max ?? "—"}</td>
                        </tr>
                      ))}
                    {(!charts?.masaTungguHistori.length) && (
                      <tr><td colSpan={6} className="px-3 py-8 text-center text-sm text-gray-400">Tidak ada data masa tunggu</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
              <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                Data awal sebelum dihitung menjadi grafik — langsung dari <code>v_olap_masa_tunggu_histori</code> (OLAP PostgreSQL, 18 baris: 7 tahun × prodi, AVG/MIN/MAX masa_tunggu_bulan non-NULL).
              </p>
            </ChartPanel>
          </>
        )}

        <TepatWaktuPanel tahunSurvei={tahunSurvei} />

      </div>
    </>
  );
}