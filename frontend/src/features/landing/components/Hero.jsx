import { useEffect, useState } from "react";
import { Sparkles } from "lucide-react";
import { getStats } from "../../../services/api";

/**
 * Ganti dengan hasil import berkas foto bila sudah tersedia
 * di src/assets.
 */
const HERO_BG = null;

/**
 * Format angka statistik ke format Indonesia
 * tanpa mengubah data yang berasal dari API.
 */
function formatNumber(value, suffix = "") {
  if (value === null || value === undefined || value === "") {
    return "—";
  }

  const numericValue = Number(value);

  if (Number.isNaN(numericValue)) {
    return "—";
  }

  return `${numericValue.toLocaleString("id-ID")}${suffix}`;
}

export default function Hero() {
  /**
   * Statistik tracer study dari API OLAP PostgreSQL (publik).
   * Tidak ada angka hardcode di frontend.
   */
  const [stats, setStats] = useState(null);

  useEffect(() => {
    let active = true;

    getStats()
      .then(({ data }) => {
        if (active) {
          setStats(data);
        }
      })
      .catch(() => {
        // statistik tidak wajib: hero tetap tampil tanpa angka
      });

    return () => {
      active = false;
    };
  }, []);

  const statItems = [
    {
      label: "Alumni terpantau",
      value: formatNumber(stats?.total_alumni),
    },
    {
      label: "Bekerja / wirausaha",
      value: formatNumber(stats?.persentase_kerja, "%"),
    },
    {
      label: "Masa tunggu rata-rata",
      value: formatNumber(stats?.masa_tunggu_rata, " bln"),
    },
    {
      label: "Gaji rata-rata",
      value: formatNumber(stats?.gaji_rata_rata, " jt"),
    },
  ];

  return (
    <section className="relative isolate overflow-hidden bg-canvas px-6 pb-28 pt-20 md:pt-28">
      {HERO_BG ? (
        <img
          src={HERO_BG}
          alt=""
          aria-hidden
          className="pointer-events-none absolute inset-0 h-full w-full object-cover opacity-[0.07] grayscale"
        />
      ) : (
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{
            backgroundImage:
              "radial-gradient(ellipse 70% 55% at 50% 30%, #ffffff 0%, transparent 70%), linear-gradient(to right, rgba(15,23,42,0.035) 1px, transparent 1px), linear-gradient(to bottom, rgba(15,23,42,0.035) 1px, transparent 1px)",
            backgroundSize:
              "100% 100%, 64px 64px, 64px 64px",
          }}
        />
      )}

      <div
        aria-hidden
        className="pointer-events-none absolute inset-y-0 left-1/2 hidden w-full max-w-6xl -translate-x-1/2 lg:block"
      >
        <div className="absolute inset-y-0 left-0 w-px bg-hairline" />

        <div className="absolute inset-y-0 right-0 w-px bg-hairline" />
      </div>

      <div className="relative z-10 mx-auto max-w-3xl text-center">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-3.5 py-1.5 text-xs font-medium text-blue-700">
          <Sparkles
            aria-hidden
            className="h-3.5 w-3.5"
          />

          Untuk alumni &amp; pusat karier kampus
        </span>

        <h1 className="mt-7 font-display text-[34px] font-semibold leading-[1.12] tracking-tight text-slate-900 sm:text-5xl md:text-6xl lg:text-[64px]">
          Tracer study: jejak karier alumni
          <br className="hidden sm:block" />
          terpantau sejak lulus
        </h1>

        <p className="mx-auto mt-6 max-w-xl text-base leading-relaxed text-slate-500 md:text-lg">
          Alumni mengisi kuisioner satu kali — status
          bekerja, masa tunggu, kesesuaian bidang, hingga
          penghasilan — kampus memantau perjalanan karier
          secara terpusat.
        </p>

        <div className="mt-12 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <a
            href="/login"
            className="inline-flex h-[52px] w-full items-center justify-center rounded-[10px] bg-blue-600 px-7 text-sm font-semibold uppercase tracking-[0.05em] text-white shadow-btn transition-all duration-150 hover:-translate-y-px hover:bg-blue-700 hover:shadow-btn-hover active:translate-y-0 active:shadow-soft motion-reduce:hover:translate-y-0 sm:w-auto"
          >
            Isi Kuisioner
          </a>

          <a
            href="#pratinjau-olap"
            className="inline-flex h-[52px] w-full items-center justify-center rounded-[10px] border border-slate-900/[0.12] bg-white px-7 text-sm font-semibold uppercase tracking-[0.05em] text-slate-900 shadow-btn-ghost transition-all duration-150 hover:-translate-y-px hover:shadow-btn-ghost-hover active:translate-y-0 active:shadow-soft motion-reduce:hover:translate-y-0 sm:w-auto"
          >
            Lihat Statistik
          </a>
        </div>

        {stats && (
          <dl className="mx-auto mt-14 grid w-full max-w-2xl grid-cols-2 gap-3 sm:grid-cols-4">
            {statItems.map((item) => (
              <div
                key={item.label}
                className="rounded-2xl bg-white p-4 text-center shadow-soft"
              >
                <dd className="text-xl font-semibold text-slate-900 md:text-2xl">
                  {item.value}
                </dd>
                <dt className="mt-1 text-xs text-slate-500">
                  {item.label}
                </dt>
              </div>
            ))}
          </dl>
        )}
      </div>
    </section>
  );
}