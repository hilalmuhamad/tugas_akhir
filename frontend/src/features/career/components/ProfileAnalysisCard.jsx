import { ExternalLink } from 'lucide-react';
import { prodiLabel } from '../../../utils/prodiLabel';

export default function ProfileAnalysisCard({ analysis }) {
  if (!analysis) return null;

  const {
    nama,
    headline,
    ringkasan,
    program_studi,
    level_karier,
    pengalaman_tahun,
    domain = [],
    skill = [],
    skill_utama = [],
    skill_pendukung = [],
    soft_skill = [],
    pengalaman = [],
    pendidikan = [],
    kekuatan = [],
    rekomendasi = [],
    gap_skill = [],
    catatan,
  } = analysis;

  const domainList = Array.isArray(domain) ? domain : [domain].filter(Boolean);
  const skillUtama = skill_utama.length > 0 ? skill_utama : skill.slice(0, 8);
  const skillPendukung =
    skill_pendukung.length > 0 ? skill_pendukung : skill.slice(skillUtama.length);

  return (
    <div className="space-y-5">
      <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-600 text-lg font-bold text-white">
            {(nama || '?').charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0">
            <h2 className="text-lg font-semibold text-slate-900">{nama || 'Kandidat'}</h2>
            {headline && <p className="truncate text-sm text-slate-500">{headline}</p>}
            {program_studi && (
              <p className="text-sm text-slate-500">{prodiLabel(program_studi)}</p>
            )}
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-1.5">
          {level_karier && (
            <span className="rounded-full bg-violet-50 px-2.5 py-1 text-xs font-semibold text-violet-700">
              Level: {level_karier}
            </span>
          )}
          {pengalaman_tahun > 0 && (
            <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">
              Pengalaman: {pengalaman_tahun} tahun
            </span>
          )}
          {domainList.map((d) => (
            <span
              key={d}
              className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700"
            >
              {d}
            </span>
          ))}
        </div>

        {ringkasan && (
          <p className="mt-4 text-sm leading-relaxed text-slate-600">{ringkasan}</p>
        )}

        <div className="mt-5 grid gap-5 sm:grid-cols-3">
          {pengalaman.length > 0 && <Section title="Pengalaman" items={pengalaman} />}
          {pendidikan.length > 0 && <Section title="Pendidikan" items={pendidikan} />}
          {(skillUtama.length > 0 || soft_skill.length > 0) && (
            <div>
              <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
                Skill
              </h3>
              <div className="flex flex-wrap gap-1.5">
                {[...skillUtama, ...soft_skill].map((s) => (
                  <span
                    key={s}
                    className="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-700"
                  >
                    {s}
                  </span>
                ))}
                {skillPendukung.slice(0, 6).map((s) => (
                  <span
                    key={s}
                    className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600"
                  >
                    {s}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {kekuatan.length > 0 && (
          <div className="mt-5 rounded-xl border border-blue-100 bg-blue-50/50 p-4">
            <h3 className="text-xs font-semibold uppercase tracking-wide text-blue-700">
              Kekuatan Profil
            </h3>
            <ul className="mt-2 list-disc space-y-1 pl-4 text-sm text-slate-600">
              {kekuatan.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {rekomendasi.length > 0 && (
        <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
          <h3 className="text-base font-semibold text-slate-900">
            Pekerjaan yang Paling Cocok
          </h3>
          <div className="mt-4 space-y-4">
            {rekomendasi.map((job, index) => (
              <div
                key={`${job.posisi}-${job.perusahaan || index}`}
                className="rounded-xl border border-slate-100 bg-slate-50/60 p-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex min-w-0 items-start gap-3">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-600 text-xs font-bold text-white">
                      {index + 1}
                    </span>
                    <div className="min-w-0">
                      <h4 className="font-semibold text-slate-900">{job.posisi}</h4>
                      <p className="text-xs text-slate-500">
                        {[job.perusahaan, job.level_posisi, job.gaji_estimasi && `Estimasi gaji: ${job.gaji_estimasi}`]
                          .filter(Boolean)
                          .join(' · ')}
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

                {job.skill_cocok?.length > 0 && (
                  <div className="mt-3 flex flex-wrap items-center gap-1.5">
                    <span className="text-[11px] font-medium text-slate-500">Cocok:</span>
                    {job.skill_cocok.map((s) => (
                      <span
                        key={s}
                        className="rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-medium text-emerald-700"
                      >
                        {s}
                      </span>
                    ))}
                  </div>
                )}
                {job.skill_kurang?.length > 0 && (
                  <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                    <span className="text-[11px] font-medium text-slate-500">Perlu dipelajari:</span>
                    {job.skill_kurang.slice(0, 4).map((s) => (
                      <span
                        key={s}
                        className="rounded-full bg-amber-50 px-2 py-0.5 text-[11px] font-medium text-amber-700"
                      >
                        {s}
                      </span>
                    ))}
                  </div>
                )}

                {job.alasan && <p className="mt-3 text-sm text-slate-600">{job.alasan}</p>}
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

      {catatan && (
        <p className="rounded-xl bg-slate-100 px-4 py-3 text-sm text-slate-600">{catatan}</p>
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
