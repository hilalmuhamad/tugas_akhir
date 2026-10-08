import { useEffect, useState } from "react";
import {
  getKetepatanWaktu,
  KetepatanWaktuRow,
  TAHUN_SURVEI_DEFAULT,
} from "../../api/olap";

interface TepatWaktuPanelProps {
  tahunSurvei?: number;
}

export default function TepatWaktuPanel({
  tahunSurvei = TAHUN_SURVEI_DEFAULT,
}: TepatWaktuPanelProps) {
  const [data, setData] = useState<KetepatanWaktuRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  /**
   * =========================================================
   * FETCH DATA OLAP
   * =========================================================
   *
   * Sumber langsung:
   * GET /api/olap/ketepatan-waktu?tahun_survei={tahunSurvei}
   *
   * Satu baris = satu cohort/tahun lulus (agregat dari
   * view v_olap_ketepatan_waktu), BUKAN satu alumni.
   * Tidak ada perhitungan ulang di React.
   */
  useEffect(() => {
    const fetchKetepatanWaktu = async () => {
      try {
        setLoading(true);
        setError(null);

        const rows = await getKetepatanWaktu(tahunSurvei);

        setData(rows);
      } catch (err) {
        console.error("OLAP Ketepatan Waktu Error:", err);

        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError("Gagal mengambil data ketepatan waktu.");
        }

        setData([]);
      } finally {
        setLoading(false);
      }
    };

    fetchKetepatanWaktu();
  }, [tahunSurvei, reloadKey]);

  /**
   * =========================================================
   * LOADING
   * =========================================================
   */
  if (loading) {
    return (
      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
        <div className="animate-pulse">
          <div className="h-6 w-64 rounded bg-gray-200 dark:bg-gray-800" />

          <div className="mt-2 h-4 w-96 max-w-full rounded bg-gray-200 dark:bg-gray-800" />

          <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {[1, 2, 3].map((item) => (
              <div
                key={item}
                className="h-56 rounded-xl bg-gray-100 dark:bg-white/[0.05]"
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

  /**
   * =========================================================
   * ERROR
   * =========================================================
   */
  if (error) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 p-5 dark:border-red-900/50 dark:bg-red-900/10 md:p-6">
        <h3 className="text-lg font-semibold text-red-700 dark:text-red-400">
          Gagal memuat data ketepatan waktu
        </h3>

        <p className="mt-2 text-sm text-red-600 dark:text-red-400">
          {error}
        </p>

        <p className="mt-3 text-xs text-red-500 dark:text-red-400">
          Endpoint: /api/olap/ketepatan-waktu?tahun_survei={tahunSurvei}
        </p>

        <button
          type="button"
          onClick={() => setReloadKey((key) => key + 1)}
          className="mt-3 rounded-lg border border-red-200 bg-white px-3 py-1.5 text-xs font-semibold text-red-600 transition hover:bg-red-100 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-400 dark:hover:bg-red-900/20"
        >
          Coba lagi
        </button>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">

      {/* =====================================================
          HEADER
      ===================================================== */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
            Ketepatan Waktu Lulus
          </h3>

          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            KPI per cohort (agregat) dari view v_olap_ketepatan_waktu
            — kohort survei {tahunSurvei}
          </p>
        </div>

        <span className="shrink-0 rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700 dark:bg-blue-500/10 dark:text-blue-400">
          Data OLAP
        </span>
      </div>

      {/* =====================================================
          KPI PER COHORT
      ===================================================== */}
      {data.length === 0 ? (
        <div className="mt-6 rounded-xl border border-gray-200 bg-gray-50 p-8 text-center text-sm text-gray-500 dark:border-gray-800 dark:bg-white/[0.03] dark:text-gray-400">
          Tidak ada data ketepatan waktu untuk survei {tahunSurvei}.
        </div>
      ) : (
        <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {data.map((row) => (
            <div
              key={`${row.cohort}-${row.tahun_lulus}`}
              className="rounded-xl border border-gray-200 p-4 dark:border-gray-800 dark:bg-white/[0.03]"
            >
              <div className="flex items-center justify-between gap-2">
                <h4 className="text-sm font-semibold text-gray-800 dark:text-white/90">
                  {row.cohort}
                </h4>

                <span className="rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-600 dark:bg-gray-800 dark:text-gray-300">
                  Lulus {row.tahun_lulus}
                </span>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-3">
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Jumlah Lulusan
                  </p>
                  <p className="mt-1 text-xl font-semibold text-gray-800 dark:text-white/90">
                    {row.jumlah_alumni}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Tepat Waktu
                  </p>
                  <p className="mt-1 text-xl font-semibold text-emerald-600 dark:text-emerald-400">
                    {row.tepat_waktu}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Tidak Tepat Waktu
                  </p>
                  <p className="mt-1 text-xl font-semibold text-rose-600 dark:text-rose-400">
                    {row.tidak_tepat_waktu}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Tidak Dapat Dinilai
                  </p>
                  <p className="mt-1 text-xl font-semibold text-gray-800 dark:text-white/90">
                    {row.tidak_dapat_dinilai}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Persentase Tepat
                  </p>
                  <p className="mt-1 text-xl font-semibold text-emerald-600 dark:text-emerald-400">
                    {row.persentase_tepat_waktu.toFixed(2)}%
                  </p>
                </div>

                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Rata-rata Masa Studi
                  </p>
                  <p className="mt-1 text-xl font-semibold text-gray-800 dark:text-white/90">
                    {row.rata_rata_masa_studi !== null &&
                    row.rata_rata_masa_studi !== undefined
                      ? `${row.rata_rata_masa_studi.toFixed(2)} tahun`
                      : "-"}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* =====================================================
          TABEL RINGKASAN PER COHORT
      ===================================================== */}
      {data.length > 0 && (
        <div className="mt-6">
          <div className="mb-3">
            <h4 className="text-sm font-semibold text-gray-800 dark:text-white/90">
              Ringkasan per Cohort
            </h4>

            <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">
              Nilai langsung dari v_olap_ketepatan_waktu (tanpa
              perhitungan ulang di aplikasi)
            </p>
          </div>

          <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-800">
            <table className="w-full min-w-[720px] text-sm">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50 dark:border-gray-800 dark:bg-white/[0.03]">
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                    Cohort
                  </th>

                  <th className="px-3 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                    Tahun Lulus
                  </th>

                  <th className="px-3 py-3 text-right text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                    Jumlah Alumni
                  </th>

                  <th className="px-3 py-3 text-right text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                    Tepat Waktu
                  </th>

                  <th className="px-3 py-3 text-right text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                    Tidak Tepat
                  </th>

                  <th className="px-3 py-3 text-right text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                    Tidak Dinilai
                  </th>

                  <th className="px-3 py-3 text-right text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                    % Tepat
                  </th>

                  <th className="px-3 py-3 text-right text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                    Rata Masa Studi
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {data.map((row) => (
                  <tr
                    key={`${row.cohort}-${row.tahun_lulus}`}
                    className="bg-white dark:bg-transparent"
                  >
                    <td className="whitespace-nowrap px-4 py-3 text-sm font-medium text-gray-800 dark:text-white/90">
                      {row.cohort}
                    </td>

                    <td className="whitespace-nowrap px-3 py-3 text-sm text-gray-600 dark:text-gray-400">
                      {row.tahun_lulus}
                    </td>

                    <td className="whitespace-nowrap px-3 py-3 text-right text-sm text-gray-600 dark:text-gray-400">
                      {row.jumlah_alumni}
                    </td>

                    <td className="whitespace-nowrap px-3 py-3 text-right text-sm font-semibold text-emerald-600 dark:text-emerald-400">
                      {row.tepat_waktu}
                    </td>

                    <td className="whitespace-nowrap px-3 py-3 text-right text-sm text-gray-600 dark:text-gray-400">
                      {row.tidak_tepat_waktu}
                    </td>

                    <td className="whitespace-nowrap px-3 py-3 text-right text-sm text-gray-600 dark:text-gray-400">
                      {row.tidak_dapat_dinilai}
                    </td>

                    <td className="whitespace-nowrap px-3 py-3 text-right text-sm font-semibold text-gray-800 dark:text-white/90">
                      {row.persentase_tepat_waktu.toFixed(2)}%
                    </td>

                    <td className="whitespace-nowrap px-3 py-3 text-right text-sm text-gray-600 dark:text-gray-400">
                      {row.rata_rata_masa_studi !== null &&
                      row.rata_rata_masa_studi !== undefined
                        ? `${row.rata_rata_masa_studi.toFixed(2)} tahun`
                        : "-"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}