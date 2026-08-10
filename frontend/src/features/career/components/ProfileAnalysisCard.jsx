import { ExternalLink } from 'lucide-react';
import { prodiLabel } from '../../../utils/prodiLabel';

export default function ProfileAnalysisCard({ analysis }) {
  if (!analysis) return null;

  const {
    nama,
    ringkasan,
    program_studi,
    skill = [],
    pengalaman = [],
    pendidikan = [],
    rekomendasi = [],
    gap_skill = [],
  } = analysis;

  return (
    <div className="space-y-5">
      <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-600 text-lg font-bold text-white">
            {(nama || '?').charAt(0).toUpperCase()}
          </div>
          <div>
            <h2 className="text-lg font-semibold text-slate-900">{nama || 'Kandidat'}</h2>
            {program_studi && (
              <p className="text-sm text-slate-500">{prodiLabel(program_studi)}</p>
            )}
          </div>
        </div>
        {ringkasan && (
          <p className="mt-4 text-sm leading-relaxed text-slate-600">{ringkasan}</p>
        )}

        <div className="mt-5 grid gap-5 sm:grid-cols-3">
          {pengalaman.length > 0 && (
            <Section title="Pengalaman" items={pengalaman} />
          )}
          {pendidikan.length > 0 && (
            <Section title="Pendidikan" items={pendidikan} />
          )}
          {skill.length > 0 && (
            <div>
              <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
                Skill
              </h3>
              <div className="flex flex-wrap gap-1.5">
                {skill.map((s) => (
                  <span
                    key={s}
                    className="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-700"
                  >
                    {s}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {rekomendasi.length > 0 && (
        <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
          <h3 className="text-base font-semibold text-slate-900">
            Pekerjaan yang Paling Cocok
          </h3>
          <div className="mt-4 space-y-4">
            {rekomendasi.map((job, index) => (
              <div
                key={job.posisi}
                className="rounded-xl border border-slate-100 bg-slate-50/60 p-4"
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-xs font-bold text-white">
                      {index + 1}
                    </span>
                    <div>
                      <h4 className="font-semibold text-slate-900">{job.posisi}</h4>
                      <p className="text-xs text-slate-500">
                        {job.gaji_estimasi ? `Estimasi gaji: ${job.gaji_estimasi}` : ''}
                      </p>
                    </div>
                  </div>
                  <span className="shrink-0 text-lg font-bold text-blue-600">
                    {job.kecocokan}%
                  </span>
                </div>
                <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-slate-200">
                  <div
                    className="h-full rounded-full bg-blue-600"
                    style={{ width: `${Math.min(Math.max(job.kecocokan, 0), 100)}%` }}
                  />
                </div>
                {job.alasan && (
                  <p className="mt-3 text-sm text-slate-600">{job.alasan}</p>
                )}
                {job.prospek && (
                  <p className="mt-2 text-xs text-slate-500">
                    <span className="font-medium text-slate-600">Prospek: </span>
                    {job.prospek}
                  </p>
                )}
                {job.link && (
                  <a
                    href={job.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:underline"
                  >
                    Lihat lowongan <ExternalLink className="h-3 w-3" />
                  </a>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {gap_skill.length > 0 && (
        <div className="rounded-2xl border border-amber-100 bg-amber-50/60 p-6">
          <h3 className="text-sm font-semibold text-amber-800">
            Skill yang Perlu Ditingkatkan
          </h3>
          <div className="mt-3 flex flex-wrap gap-1.5">
            {gap_skill.map((g) => (
              <span
                key={g}
                className="rounded-full bg-white px-2.5 py-1 text-xs font-medium text-amber-700"
              >
                {g}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function Section({ title, items }) {
  return (
    <div>
      <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
        {title}
      </h3>
      <ul className="space-y-1.5">
        {items.map((item) => (
          <li key={item} className="text-sm text-slate-600">
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}
