import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  MapPin,
  Building2,
  ExternalLink,
  ArrowLeft,
  Search,
  Globe,
} from 'lucide-react';
import CareerNavbar from '../../career/components/CareerNavbar';
import Footer from '../../../components/Footer';
import { fetchJobs } from '../services/jobApi';

function portalSearch(title, location) {
  const q = encodeURIComponent(`${title} ${location || ''}`.trim());
  return [
    {
      nama: 'Google',
      icon: Search,
      url: `https://www.google.com/search?q=${q} lowongan`,
    },
    {
      nama: 'LokerID',
      icon: Globe,
      url: `https://www.loker.id/cari-lowongan-kerja?q=${q}`,
    },
    {
      nama: 'Glints',
      icon: Globe,
      url: `https://glints.com/id/opportunities/jobs/explore?keyword=${q}`,
    },
    {
      nama: 'Kalibrr',
      icon: Globe,
      url: `https://www.kalibrr.id/id_ID/job-board?search_title=${q}`,
    },
  ];
}

function formatGaji(min, max) {
  if (min === null && min === undefined && max === null && max === undefined) return null;
  const jt = (v) => `Rp${v} jt`;
  if (min != null && max != null) return `${jt(min)} - ${jt(max)}`;
  return min != null ? `${jt(min)}+` : max != null ? `s.d. ${jt(max)}` : null;
}

export default function JobDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let active = true;
    fetchJobs()
      .then(({ data }) => {
        if (!active) return;
        const found = data.find((j) => String(j.id) === String(id));
        if (found) setJob(found);
        else setError('Lowongan tidak ditemukan.');
      })
      .catch(() => active && setError('Gagal memuat detail lowongan.'))
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, [id]);

  const gaji = job ? formatGaji(job.gaji_min, job.gaji_max) : null;

  return (
    <div className="min-h-screen bg-slate-50">
      <CareerNavbar />
      <main className="mx-auto max-w-3xl px-4 py-8">
        <Link
          to="/jobs"
          onClick={(e) => {
            if (window.history.length > 1) {
              e.preventDefault();
              navigate(-1);
            }
          }}
          className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-slate-800"
        >
          <ArrowLeft className="h-4 w-4" /> Kembali ke pencarian
        </Link>

        {loading && <p className="py-16 text-center text-sm text-slate-400">Memuat lowongan...</p>}

        {error && !loading && (
          <div className="mt-8 rounded-2xl border border-slate-100 bg-white p-10 text-center">
            <p className="text-sm text-slate-500">{error}</p>
            <Link
              to="/jobs"
              className="mt-4 inline-block rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
            >
              Lihat semua lowongan
            </Link>
          </div>
        )}

        {job && (
          <article className="mt-6 rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
            <h1 className="text-2xl font-bold text-slate-900">{job.judul_posisi}</h1>
            <p className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-slate-500">
              <span className="inline-flex items-center gap-1.5">
                <Building2 className="h-4 w-4" /> {job.perusahaan}
              </span>
              {job.lokasi && (
                <span className="inline-flex items-center gap-1.5">
                  <MapPin className="h-4 w-4" /> {job.lokasi}
                </span>
              )}
              {gaji && <span className="font-medium text-slate-600">{gaji}</span>}
            </p>

            {job.keahlian?.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-1.5">
                {job.keahlian.map((k) => (
                  <span
                    key={k}
                    className="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-700"
                  >
                    {k}
                  </span>
                ))}
              </div>
            )}

            {job.deskripsi && (
              <div className="mt-6">
                <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-400">
                  Deskripsi
                </h2>
                <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-slate-600">
                  {job.deskripsi}
                </p>
              </div>
            )}

            {job.sumber_url && (
              <a
                href={job.sumber_url}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-6 inline-flex items-center gap-1.5 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
              >
                Lihat lowongan eksternal <ExternalLink className="h-4 w-4" />
              </a>
            )}

            {!job.sumber_url && (
              <div className="mt-6 rounded-xl bg-amber-50 px-4 py-3">
                <p className="text-xs text-amber-700">
                  Lowongan ini dipasang langsung oleh admin kampus (tanpa tautan eksternal).
                  Cari lamaran aslinya di portal pekerjaan berikut:
                </p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {portalSearch(job.judul_posisi, job.lokasi).map((p) => (
                    <a
                      key={p.nama}
                      href={p.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 rounded-lg bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-sm transition hover:bg-amber-100"
                    >
                      <p.icon className="h-3.5 w-3.5" /> {p.nama}
                    </a>
                  ))}
                </div>
              </div>
            )}
          </article>
        )}
      </main>
      <Footer />
    </div>
  );
}