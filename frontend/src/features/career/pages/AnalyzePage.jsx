import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { History, ArrowRight } from 'lucide-react';
import { useCareerStore } from '../store/careerStore';
import { getHistory } from '../services/careerApi';
import CareerNavbar from '../components/CareerNavbar';

const STEPS = [
  {
    number: '1',
    title: 'Analisis Latar Belakang',
    desc: 'Tempel teks profil LinkedIn Anda. AI akan membaca pengalaman, skill, dan pendidikan Anda.',
  },
  {
    number: '2',
    title: 'AI Menilai Kecocokan',
    desc: 'Profil Anda dibandingkan dengan data tracer alumni kampus untuk menentukan posisi paling cocok.',
  },
  {
    number: '3',
    title: 'Tanya Apa Saja',
    desc: 'Masuk ke ruang chat dan tanyakan detail karier: gaji, prospek, atau cara meningkatkan skill.',
  },
];

export default function AnalyzePage() {
  const navigate = useNavigate();
  const { analyze, analyzing, error } = useCareerStore();
  const [linkedinUrl, setLinkedinUrl] = useState('');
  const [profileText, setProfileText] = useState('');
  const [history, setHistory] = useState([]);

  useEffect(() => {
    getHistory()
      .then(({ data }) => setHistory(data || []))
      .catch(() => setHistory([]));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await analyze({
      linkedin_url: linkedinUrl || null,
      profile_text: profileText,
    });
    if (result.ok) {
      navigate(`/chat/${result.id}`);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <CareerNavbar />

      <main className="mx-auto max-w-6xl px-4 py-10">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-slate-900">
            Analisis Karier Anda
          </h1>
          <p className="mx-auto mt-2 max-w-2xl text-slate-500">
            Sebelum mencari pekerjaan, kami menganalisis latar belakang Anda
            terlebih dahulu — seperti yang dilakukan platform AI career intelligence.
          </p>
        </div>

        <div className="mt-10 grid gap-6 lg:grid-cols-2">
          <section className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900">Profil Anda</h2>
            <p className="mt-1 text-sm text-slate-500">
              Masukkan link LinkedIn dan tempel isi profil Anda.
            </p>

            <form className="mt-5 space-y-5" onSubmit={handleSubmit}>
              <label className="block">
                <span className="mb-1.5 block text-sm font-medium text-slate-700">
                  Link LinkedIn <span className="text-slate-400">(opsional)</span>
                </span>
                <input
                  type="url"
                  value={linkedinUrl}
                  onChange={(e) => setLinkedinUrl(e.target.value)}
                  placeholder="https://www.linkedin.com/in/username"
                  className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </label>

              <label className="block">
                <span className="mb-1.5 block text-sm font-medium text-slate-700">
                  Isi Profil LinkedIn <span className="text-red-500">*</span>
                </span>
                <textarea
                  value={profileText}
                  onChange={(e) => setProfileText(e.target.value)}
                  required
                  minLength={100}
                  rows={10}
                  placeholder="Salin seluruh isi profil LinkedIn Anda di sini — pengalaman kerja, pendidikan, skills, ringkasan, dll. (minimal 100 karakter)"
                  className="w-full resize-y rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
                <span className="mt-1 block text-xs text-slate-400">
                  {profileText.length} karakter
                </span>
              </label>

              {error && (
                <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>
              )}

              <button
                type="submit"
                disabled={analyzing}
                className="w-full rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {analyzing ? 'Menganalisis profil...' : 'Mulai Analisis'}
              </button>
            </form>

            <div className="mt-6 rounded-2xl border border-slate-100 bg-slate-50/60 p-4">
              <h3 className="flex items-center gap-2 text-sm font-bold text-slate-800">
                <History className="h-4 w-4 text-slate-400" /> Riwayat Hasil Analisis
              </h3>
              <div className="mt-3 space-y-2">
                {history.map((item) => (
                  <Link
                    key={item.id}
                    to={`/chat/${item.id}`}
                    className="flex items-center justify-between gap-3 rounded-xl border border-slate-100 bg-white px-4 py-3 transition hover:border-blue-200 hover:bg-blue-50/40"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-slate-800">{item.nama}</p>
                      {item.ringkasan && (
                        <p className="mt-0.5 line-clamp-1 text-xs text-slate-500">
                          {item.ringkasan}
                        </p>
                      )}
                      <p className="mt-0.5 text-[10px] text-slate-400">
                        {new Date(item.created_at).toLocaleDateString('id-ID', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </p>
                    </div>
                    <ArrowRight className="h-4 w-4 shrink-0 text-slate-300" />
                  </Link>
                ))}
                {history.length === 0 && (
                  <p className="rounded-xl bg-white px-4 py-3 text-xs text-slate-400">
                    Belum ada analisis sebelumnya. Mulai analisis pertama Anda di atas.
                  </p>
                )}
              </div>
            </div>
          </section>

          <section className="space-y-4">
            {STEPS.map((step) => (
              <div
                key={step.number}
                className="flex gap-4 rounded-2xl border border-slate-100 bg-white p-5 shadow-sm"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-600 text-sm font-bold text-white">
                  {step.number}
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900">{step.title}</h3>
                  <p className="mt-1 text-sm text-slate-500">{step.desc}</p>
                </div>
              </div>
            ))}

            <div className="rounded-2xl bg-blue-600 p-5 text-white shadow-sm">
              <p className="text-sm font-medium">
                Rekomendasi pekerjaan didasarkan pada data tracer study alumni
                kampus: gaji rata-rata, masa tunggu, dan tingkat keberhasilan
                per program studi.
              </p>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
