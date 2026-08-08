import { Link } from 'react-router-dom';
import { ExternalLink, MapPin, ArrowUpRight } from 'lucide-react';

const warnaAvatar = ['bg-blue-100 text-blue-600', 'bg-emerald-100 text-emerald-600', 'bg-violet-100 text-violet-600', 'bg-amber-100 text-amber-600', 'bg-rose-100 text-rose-600'];

export default function JobRecommendationCards({ jobs }) {
  if (!jobs || jobs.length === 0) return null;

  return (
    <div className="rounded-2xl border border-blue-100 bg-blue-50/50 p-4">
      <div className="flex items-center justify-between gap-2">
        <div>
          <h3 className="text-sm font-bold text-slate-800">💼 Lowongan yang cocok untuk profil Anda</h3>
          <p className="text-xs text-slate-500">
            Direkomendasikan otomatis dari database lowongan berdasarkan hasil analisis.
          </p>
        </div>
        <Link
          to="/jobs"
          className="flex shrink-0 items-center gap-1 rounded-lg bg-white px-3 py-1.5 text-xs font-semibold text-blue-600 shadow-sm transition hover:bg-blue-600 hover:text-white"
        >
          Semua <ArrowUpRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        {jobs.map((job, i) => (
          <Card key={job.id} job={job} index={i} />
        ))}
      </div>
    </div>
  );
}

function Card({ job, index }) {
  const internal = !job.sumber_url;
  const linkTo = job.link || (internal ? `#` : job.sumber_url);
  const match = job.kecocokan ?? 0;

  return (
    <div className="flex flex-col rounded-xl border border-slate-100 bg-white p-4 shadow-sm transition hover:shadow-md">
      <div className="flex items-start justify-between gap-2">
        <div className="flex min-w-0 items-center gap-3">
          <span
            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-sm font-bold ${warnaAvatar[index % warnaAvatar.length]}`}
          >
            {job.perusahaan?.charAt(0)?.toUpperCase() || '?'}
          </span>
          <div className="min-w-0">
            <h4 className="truncate text-sm font-bold text-slate-800">{job.judul_posisi}</h4>
            <p className="truncate text-xs text-slate-500">{job.perusahaan}</p>
          </div>
        </div>
        <div className="flex shrink-0 flex-col items-end gap-1">
          <span className="rounded-lg bg-blue-50 px-2 py-0.5 text-xs font-bold text-blue-600">
            {match}% cocok
          </span>
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
      </div>

      <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500">
        {job.lokasi && (
          <span className="flex items-center gap-1">
            <MapPin className="h-3.5 w-3.5" /> {job.lokasi}
          </span>
        )}
        {job.gaji && (
          <span className="font-semibold text-slate-700">Rp {job.gaji} jt/bln</span>
        )}
      </div>

      {job.keahlian?.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {job.keahlian.slice(0, 3).map((skill) => (
            <span
              key={skill}
              className="rounded-md bg-slate-50 px-2 py-0.5 text-[10px] font-medium text-slate-600"
            >
              {skill}
            </span>
          ))}
          {job.keahlian.length > 3 && (
            <span className="text-[10px] text-slate-400">+{job.keahlian.length - 3}</span>
          )}
        </div>
      )}

      <div className="mt-auto pt-3">
        {internal ? (
          <Link
            to={`/jobs/${job.id}`}
            className="block rounded-lg bg-blue-600 px-3 py-1.5 text-center text-xs font-semibold text-white transition hover:bg-blue-700"
          >
            Lihat detail
          </Link>
        ) : (
          <a
            href={linkTo}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-1 rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-blue-700"
          >
            Lihat lowongan <ExternalLink className="h-3.5 w-3.5" />
          </a>
        )}
      </div>
    </div>
  );
}