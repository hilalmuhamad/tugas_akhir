import { useEffect, useState } from 'react';
import { Search, MapPin, Building2, ExternalLink, Filter } from 'lucide-react';
import CareerNavbar from '../../career/components/CareerNavbar';
import Footer from '../../../components/Footer';
import { fetchJobs, fetchRegions, searchJobs } from '../services/jobApi';
import { getAnalysis, getHistory } from '../../career/services/careerApi';

function skorPersen(skor) {
  return Math.round(skor * 100);
}

function formatGaji(min, max) {
  if (min === null && max === null) return null;
  const jt = (v) => `Rp${v} jt`;
  if (min !== null && max !== null) return `${jt(min)} - ${jt(max)}`;
  return min !== null ? `${jt(min)}+` : `s.d. ${jt(max)}`;
}

export default function JobSearchPage() {
  const [query, setQuery] = useState('');
  const [jobs, setJobs] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [meta, setMeta] = useState(null);

  const [regions, setRegions] = useState([]);
  const [daerah, setDaerah] = useState('');
  const [profilAktif, setProfilAktif] = useState(false);
  const [profil, setProfil] = useState(null);
  const [profilLoading, setProfilLoading] = useState(true);

  useEffect(() => {
    fetchJobs()
      .then(({ data }) => setJobs(data))
      .catch(() => setError('Gagal memuat daftar lowongan.'))
      .finally(() => setLoading(false));

    fetchRegions()
      .then(({ data }) => setRegions(data))
      .catch(() => setRegions([]));

    getHistory()
      .then(async ({ data }) => {
        const latest = data[0];
        if (!latest) return null;
        const detail = await getAnalysis(latest.id);
        const a = detail.data?.analysis ?? {};
        const p = {
          pengalaman: Array.isArray(a.pengalaman) ? a.pengalaman : [],
          pendidikan: Array.isArray(a.pendidikan) ? a.pendidikan : [],
          keahlian: Array.isArray(a.skill) ? a.skill : [],
        };
        if (p.pengalaman.length > 0 || p.pendidikan.length > 0 || p.keahlian.length > 0) {
          setProfil(p);
        }
      })
      .catch(() => setProfil(null))
      .finally(() => setProfilLoading(false));
  }, []);

  const handleSearch = async (e) => {
    e.preventDefault();
    const q = query.trim();
    if (!q || isSearching) return;

    setIsSearching(true);
    setError(null);
    setMeta(null);
    try {
      const { data } = await searchJobs(q, {
        daerah: daerah || undefined,
        profil: profilAktif && profil ? profil : undefined,
      });
      setJobs(data.hasil);
      setMeta({
        query: data.query,
        daerah: data.daerah,
        metode: data.metode,
        total: data.total_korpus,
        profilDigunakan: data.profil_digunakan,
      });
    } catch (err) {
      setError(err.response?.data?.message || 'Pencarian gagal. Coba lagi.');
    } finally {
      setIsSearching(false);
    }
  };

  const profilChips = profil
    ? [
        ...profil.pengalaman.slice(0, 2),
        ...profil.pendidikan.slice(0, 2),
        ...profil.keahlian.slice(0, 4),
      ]
    : [];

  return (
    <div className="min-h-screen bg-slate-50">
      <CareerNavbar />

      <main className="mx-auto max-w-5xl px-4 py-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-slate-900">Cari Kerja dengan Bahasa Alami</h1>
          <p className="mx-auto mt-2 max-w-2xl text-slate-500">
            Ketik apa yang Anda cari — seperti mengobrol. Hasil bisa dipersempit
            berdasarkan <span className="font-medium text-slate-700">daerah kerja</span> dan
            dipersonalisasi lewat <span className="font-medium text-slate-700">profil LinkedIn Anda</span>{' '}
            (riwayat kerja, pendidikan, keahlian) dengan algoritma{' '}
            <span className="font-medium text-slate-700">TF-IDF + Cosine Similarity</span>.
          </p>
        </div>

        <form onSubmit={handleSearch} className="mx-auto mt-6 max-w-2xl">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder='Contoh: "saya lulusan teknik informatika ingin kerja sebagai programmer website"'
                className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-12 pr-4 text-sm shadow-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>
            <button
              type="submit"
              disabled={isSearching || !query.trim()}
              className="rounded-xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isSearching ? 'Mencari...' : 'Cari'}
            </button>
          </div>

          <div className="mt-3 flex flex-wrap items-center gap-3">
            <label className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-600 shadow-sm">
              <Filter className="h-4 w-4 text-slate-400" />
              <span>Daerah kerja:</span>
              <select
                value={daerah}
                onChange={(e) => setDaerah(e.target.value)}
                className="outline-none bg-transparent text-sm font-medium text-slate-700"
              >
                <option value="">Semua daerah</option>
                {regions.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            </label>

            <label className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-600 shadow-sm">
              <input
                type="checkbox"
                checked={profilAktif}
                disabled={!profil}
                onChange={(e) => setProfilAktif(e.target.checked)}
                className="h-4 w-4 accent-blue-600"
              />
              <span>Pakai profil saya (riwayat kerja &amp; pendidikan)</span>
            </label>
          </div>

          {profilAktif && profil && profilChips.length > 0 && (
            <div className="mt-3 flex flex-wrap items-center gap-1.5 rounded-xl border border-blue-100 bg-blue-50 px-3 py-2">
              <span className="text-xs font-medium text-blue-700">Profil yang digunakan:</span>
              {profilChips.map((c) => (
                <span key={c} className="rounded-full bg-white px-2.5 py-0.5 text-xs text-blue-700">
                  {c}
                </span>
              ))}
            </div>
          )}

          {!profilLoading && !profil && (
            <p className="mt-3 rounded-xl bg-amber-50 px-3 py-2 text-xs text-amber-700">
              Belum ada profil teranalisis. Lakukan{' '}
              <a href="/analyze" className="font-semibold underline">
                Analisis Karier
              </a>{' '}
              (tempel profil LinkedIn) agar rekomendasi lebih spesifik.
            </p>
          )}
        </form>

        {meta && (
          <p className="mt-3 text-center text-xs text-slate-400">
            Pencarian: "{meta.query}"
            {meta.daerah ? ` — daerah: ${meta.daerah}` : ''} —{' '}
            {meta.profilDigunakan ? 'profil LinkedIn ikut dipertimbangkan, ' : ''}
            {jobs.length} hasil teratas dari {meta.total} lowongan
          </p>
        )}

        {error && (
          <p className="mx-auto mt-4 max-w-2xl rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
            {error}
          </p>
        )}

        <div className="mt-8 space-y-3">
          {loading && <p className="py-10 text-center text-sm text-slate-400">Memuat lowongan...</p>}

          {!loading && jobs.length === 0 && (
            <p className="py-10 text-center text-sm text-slate-400">
              Belum ada lowongan yang cocok. Coba kata kunci lain atau ubah filter daerah.
            </p>
          )}

          {jobs.map((job) => {
            const skor = job.kecocokan ?? (job.skor !== undefined ? skorPersen(job.skor) : null);
            const gaji = formatGaji(job.gaji_min, job.gaji_max);

            return (
              <article
                key={job.id}
                className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm transition hover:shadow-md"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="font-semibold text-slate-900">{job.judul_posisi}</h2>
                      {job.status_aktif === false ? (
                        <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-500">
                          Nonaktif
                        </span>
                      ) : job.terbuka === false ? (
                        <span className="rounded-full bg-rose-50 px-2 py-0.5 text-[10px] font-semibold text-rose-600">
                          Sudah Tutup
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-600">
                          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" /> Aktif
                        </span>
                      )}
                    </div>
                    <p className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-slate-500">
                      <span className="inline-flex items-center gap-1.5">
                        <Building2 className="h-4 w-4" /> {job.perusahaan}
                      </span>
                      <span className="inline-flex items-center gap-1.5">
                        <MapPin className="h-4 w-4" /> {job.lokasi}
                      </span>
                      {gaji && <span className="font-medium text-slate-600">{gaji}</span>}
                    </p>
                  </div>

                  {skor !== null && (
                    <div className="shrink-0 text-right">
                      <span
                        className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-bold ${
                          skor >= 40
                            ? 'bg-green-50 text-green-700'
                            : skor >= 15
                              ? 'bg-blue-50 text-blue-700'
                              : 'bg-slate-100 text-slate-500'
                        }`}
                      >
                        {skor}%
                      </span>
                      <p className="mt-1 text-[10px] uppercase tracking-wide text-slate-400">
                        skor kecocokan
                      </p>
                    </div>
                  )}
                </div>

                {job.keahlian?.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {job.keahlian.slice(0, 6).map((k) => (
                      <span
                        key={k}
                        className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs text-slate-600"
                      >
                        {k}
                      </span>
                    ))}
                  </div>
                )}

                {job.deskripsi && (
                  <p className="mt-3 line-clamp-2 text-sm leading-relaxed text-slate-500">
                    {job.deskripsi}
                  </p>
                )}

                {job.sumber_url && (
                  <a
                    href={job.sumber_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-blue-600 hover:underline"
                  >
                    Lihat lowongan asli <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                )}
              </article>
            );
          })}
        </div>
      </main>
      <Footer />
    </div>
  );
}
