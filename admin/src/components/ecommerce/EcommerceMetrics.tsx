import { useEffect, useState } from "react";
import {
  getOlapSummary,
  OlapSummary,
  TAHUN_SURVEI_DEFAULT,
} from "../../api/olap";

interface MetricCardProps {
  title: string;
  value: string | number;
  description: string;
  icon: React.ReactNode;
  backgroundIcon: React.ReactNode;
}

function MetricCard({
  title,
  value,
  description,
  icon,
  backgroundIcon,
}: MetricCardProps) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-[#1f2937]">
      {/* Icon utama dengan shadow */}
      <div className="relative z-10 flex h-14 w-14 items-center justify-center rounded-xl bg-gray-50 text-gray-700 shadow-lg shadow-gray-200/80 dark:bg-[#243247] dark:text-white dark:shadow-black/40">
        {icon}
      </div>

      {/* Isi */}
      <div className="relative z-10 mt-7">
        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
          {title}
        </p>

        <h3 className="mt-2 text-3xl font-bold tracking-tight text-gray-800 dark:text-white">
          {value}
        </h3>

        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
          {description}
        </p>
      </div>

      {/* Icon background dengan shadow halus */}
      <div className="pointer-events-none absolute -right-4 -top-4 text-gray-100 opacity-70 drop-shadow-xl dark:text-white/[0.04]">
        {backgroundIcon}
      </div>
    </div>
  );
}

interface EcommerceMetricsProps {
  tahunSurvei?: number;
}

export default function EcommerceMetrics({
  tahunSurvei = TAHUN_SURVEI_DEFAULT,
}: EcommerceMetricsProps) {
  const [data, setData] = useState<OlapSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        setLoading(true);
        setError(null);

        const result = await getOlapSummary(tahunSurvei);

        setData(result);
      } catch (err) {
        console.error("OLAP Summary Error:", err);

        setError(
          err instanceof Error
            ? err.message
            : "Data analitik gagal dimuat."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchSummary();
  }, [tahunSurvei, reloadKey]);

  // =========================
  // LOADING
  // =========================

  if (loading) {
    return (
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        {[1, 2, 3, 4].map((item) => (
          <div
            key={item}
            className="h-56 animate-pulse rounded-2xl border border-gray-200 bg-gray-100 dark:border-gray-800 dark:bg-white/[0.05]"
          />
        ))}
      </div>
    );
  }

  // =========================
  // ERROR
  // =========================

  if (error || !data) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 p-5 text-sm text-red-600 dark:border-red-900/50 dark:bg-red-900/10 dark:text-red-400">
        <p className="font-medium">
          {error ?? "Data analitik tidak tersedia."}
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

  // =========================
  // FORMAT DATA
  // =========================

  const formatNumber = (value: number | null) => {
    if (value === null || value === undefined) {
      return "-";
    }

    return value.toFixed(2);
  };

  const tingkatBekerja = `${data.tingkatBekerja.toFixed(1)}%`;
  const rataRataIpk = formatNumber(data.rataRataIpk);
  const rataRataGaji =
    data.rataRataGaji === null || data.rataRataGaji === undefined
      ? "-"
      : `Rp${data.rataRataGaji.toFixed(2)} jt`;

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">

      {/* =====================================
          CARD 1 - TOTAL ALUMNI
      ====================================== */}

      <MetricCard
        title="Total Alumni"
        value={data.total}
        description={`Kohort survei ${data.tahunSurvei} (OLAP)`}
        icon={
          <svg
            width="28"
            height="28"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
          >
            <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
            <path d="M16 3.13a4 4 0 0 1 0 7.75" />
          </svg>
        }
        backgroundIcon={
          <svg
            width="170"
            height="170"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="0.8"
          >
            <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
            <path d="M16 3.13a4 4 0 0 1 0 7.75" />
          </svg>
        }
      />

      {/* =====================================
          CARD 2 - ALUMNI BEKERJA
      ====================================== */}

      <MetricCard
        title="Tingkat Bekerja"
        value={tingkatBekerja}
        description={`${data.bekerja} dari ${data.total} alumni bekerja`}
        icon={
          <svg
            width="28"
            height="28"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
          >
            <circle cx="12" cy="12" r="9" />
            <path d="M12 7v5l3 2" />
          </svg>
        }
        backgroundIcon={
          <svg
            width="180"
            height="180"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="0.8"
          >
            <circle cx="12" cy="12" r="9" />
            <path d="M12 7v5l3 2" />
          </svg>
        }
      />

      {/* =====================================
          CARD 3 - RATA-RATA IPK
      ====================================== */}

      <MetricCard
        title="Rata-rata IPK"
        value={rataRataIpk}
        description="Rata-rata IPK alumni (view OLAP)"
        icon={
          <svg
            width="28"
            height="28"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
          >
            <circle cx="12" cy="12" r="9" />
            <path d="M8 12l2.5 2.5L16 9" />
          </svg>
        }
        backgroundIcon={
          <svg
            width="180"
            height="180"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="0.8"
          >
            <circle cx="12" cy="12" r="9" />
            <path d="M8 12l2.5 2.5L16 9" />
          </svg>
        }
      />

      {/* =====================================
          CARD 4 - RATA-RATA GAJI
      ====================================== */}

      <MetricCard
        title="Rata-rata Gaji Lulusan"
        value={rataRataGaji}
        description="Rata-rata gaji alumni bekerja (jutaan rupiah)"
        icon={
          <svg
            width="28"
            height="28"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
          >
            <path d="M12 1v22" />
            <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7H14a3.5 3.5 0 0 1 0 7H6" />
          </svg>
        }
        backgroundIcon={
          <svg
            width="180"
            height="180"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="0.8"
          >
            <path d="M12 1v22" />
            <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7H14a3.5 3.5 0 0 1 0 7H6" />
          </svg>
        }
      />
    </div>
  );
}