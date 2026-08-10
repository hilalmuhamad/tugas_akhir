import { useEffect, useState } from "react";
import { Search, Sparkles, MapPin, Wallet } from "lucide-react";
import { searchJobs } from "../../jobs/services/jobApi";

const SAMPLE_QUERY = "lulusan Informatika, jago Flutter, cari kerja remote di Bandung";

/** Ganti dengan hasil import berkas foto bila sudah tersedia di src/assets. */
const HERO_BG = null;

function ResultCard({ result, isBest }) {
  return (
    <article className="rounded-2xl bg-white p-5 shadow-soft">
      <div className="flex items-start justify-between gap-4">
        <div>
          {isBest && (
            <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-emerald-700">
              Paling cocok
            </span>
          )}
          <h3 className={`text-base font-semibold text-slate-900 ${isBest ? "mt-2" : ""}`}>
            {result.judul_posisi}
          </h3>
          <p className="mt-0.5 text-sm text-slate-500">{result.perusahaan}</p>
        </div>
        {result.kecocokan != null && (
          <div className="shrink-0 text-right">
            <div className="text-xl font-semibold text-emerald-600">{result.kecocokan}%</div>
            <div className="text-xs text-slate-400">kecocokan</div>
          </div>
        )}
      </div>
      <div className="mt-3 flex flex-wrap gap-4 text-sm text-slate-500">
        {result.lokasi && (
          <span className="flex items-center gap-1.5">
            <MapPin aria-hidden className="h-4 w-4" />
            {result.lokasi}
          </span>
        )}
        {(result.gaji_min != null || result.gaji_max != null) && (
          <span className="flex items-center gap-1.5">
            <Wallet aria-hidden className="h-4 w-4" />
            Rp{result.gaji_min ?? 0}–{result.gaji_max ?? ""} jt
          </span>
        )}
      </div>
      {(result.keahlian ?? []).length > 0 && (
        <div className="mt-4 flex flex-wrap gap-1.5 border-t border-slate-100 pt-4">
          {result.keahlian.slice(0, 5).map((k) => (
            <span key={k} className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs text-emerald-700">
              {k}
            </span>
          ))}
        </div>
      )}
    </article>
  );
}

function ResultSkeleton() {
  return (
    <div className="animate-pulse rounded-2xl bg-white p-5 shadow-soft">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <div className="h-3 w-24 rounded bg-slate-100" />
          <div className="mt-3 h-4 w-2/3 rounded bg-slate-100" />
          <div className="mt-2 h-3 w-1/3 rounded bg-slate-100" />
        </div>
        <div className="h-8 w-14 rounded bg-slate-100" />
      </div>
      <div className="mt-4 flex gap-2">
        <div className="h-6 w-20 rounded-full bg-slate-100" />
        <div className="h-6 w-16 rounded-full bg-slate-100" />
        <div className="h-6 w-24 rounded-full bg-slate-100" />
      </div>
    </div>
  );
}

export default function Hero() {
  const [query, setQuery] = useState(SAMPLE_QUERY);
  const [results, setResults] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchResults = async (text, signal) => {
    try {
      const { data } = await searchJobs(text);
      if (signal?.aborted) return;
      setResults(data?.hasil ?? []);
      setTotal(data?.total_korpus ?? 0);
    } catch {
      if (signal?.aborted) return;
      setError("Gagal menjangkau server. Pastikan backend sudah berjalan.");
      setResults([]);
    } finally {
      if (!signal?.aborted) setLoading(false);
    }
  };

  const runSearch = (text) => {
    const q = text.trim();
    if (!q) return;
    setLoading(true);
    setError(null);
    fetchResults(q);
  };

  useEffect(() => {
    const controller = new AbortController();
    fetchResults(SAMPLE_QUERY, controller.signal);
    return () => controller.abort();
  }, []);

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
            backgroundSize: "100% 100%, 64px 64px, 64px 64px",
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
          <Sparkles aria-hidden className="h-3.5 w-3.5" /> Untuk alumni &amp; pusat karier kampus
        </span>

        <h1 className="mt-7 font-display text-[34px] font-semibold leading-[1.12] tracking-tight text-slate-900 sm:text-5xl md:text-6xl lg:text-[64px]">
          Jembatan alumni menuju
          <br className="hidden sm:block" /> pekerjaan yang tepat
        </h1>

        <p className="mx-auto mt-6 max-w-xl text-base leading-relaxed text-slate-500 md:text-lg">
          Cukup ceritakan keahlian dan preferensi Anda dengan bahasa sendiri — sistem mencarikan
          lowongan yang paling cocok.
        </p>

        <form
          id="cari"
          onSubmit={(e) => {
            e.preventDefault();
            runSearch(query);
          }}
          className="mx-auto mt-12 flex w-full max-w-2xl items-center gap-2 rounded-2xl bg-white p-2 pl-5 shadow-lifted"
        >
          <Search aria-hidden className="h-5 w-5 shrink-0 text-slate-400" />
          <label htmlFor="pencarian-hero" className="sr-only">
            Cari lowongan kerja
          </label>
          <input
            id="pencarian-hero"
            name="pencarian"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="h-12 w-full bg-transparent text-sm text-slate-800 outline-none placeholder:text-slate-400 md:text-base"
            placeholder="Ceritakan keahlian, lokasi, atau preferensi kerja Anda..."
          />
          <button
            type="submit"
            aria-label="Cari lowongan"
            className="inline-flex h-12 shrink-0 items-center rounded-[10px] bg-blue-600 px-5 text-sm font-semibold text-white transition hover:bg-blue-700"
          >
            {loading ? "Mencari..." : "Cari"}
          </button>
        </form>

        <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <a
            href="#hasil-cari"
            className="inline-flex h-[52px] w-full items-center justify-center rounded-[10px] bg-blue-600 px-7 text-sm font-semibold uppercase tracking-[0.05em] text-white shadow-btn transition-all duration-150 hover:-translate-y-px hover:bg-blue-700 hover:shadow-btn-hover active:translate-y-0 active:shadow-soft motion-reduce:hover:translate-y-0 sm:w-auto"
          >
            Coba Sekarang
          </a>
          <a
            href="#pratinjau-olap"
            className="inline-flex h-[52px] w-full items-center justify-center rounded-[10px] border border-slate-900/[0.12] bg-white px-7 text-sm font-semibold uppercase tracking-[0.05em] text-slate-900 shadow-btn-ghost transition-all duration-150 hover:-translate-y-px hover:shadow-btn-ghost-hover active:translate-y-0 active:shadow-soft motion-reduce:hover:translate-y-0 sm:w-auto"
          >
            Lihat Dashboard
          </a>
        </div>

        <div id="hasil-cari" className="mx-auto mt-16 w-full max-w-2xl text-left">
          {loading ? (
            <div className="grid gap-3">
              <ResultSkeleton />
              <ResultSkeleton />
              <ResultSkeleton />
            </div>
          ) : error ? (
            <div role="alert" className="rounded-2xl bg-red-50 p-4 text-sm text-red-700 shadow-soft">
              {error}
            </div>
          ) : (
            <>
              <p className="mb-4 text-center text-xs font-medium uppercase tracking-[0.08em] text-slate-400">
                Dijalankan oleh mesin TF-IDF + Cosine Similarity pada {total} lowongan tersimpan
              </p>
              {results.length === 0 ? (
                <p className="py-6 text-center text-sm text-slate-400">
                  Tidak ada lowongan yang cocok untuk kata kunci ini.
                </p>
              ) : (
                <div className="grid gap-3">
                  {results.slice(0, 3).map((r, i) => (
                    <ResultCard key={r.id} result={r} isBest={i === 0} />
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </section>
  );
}
