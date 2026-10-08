import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { History, ArrowRight, Link2, Loader2 } from 'lucide-react';
import { useCareerStore } from '../store/careerStore';
import { getHistory, scrapeLinkedin } from '../services/careerApi';
import CareerNavbar from '../components/CareerNavbar';
import Footer from '../../../components/Footer';

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
  const [linkedinLoading, setLinkedinLoading] = useState(false);
  const [linkedinMsg, setLinkedinMsg] = useState(null);

  useEffect(() => {
    getHistory()
      .then(({ data }) => setHistory(data || []))
      .catch(() => setHistory([]));
  }, []);

  const normalizeLinkedinUrl = (raw) => {
    const v = (raw || '').trim();
    if (!v) return '';
    if (/^https?:\/\//i.test(v)) return v;
    return `https://${v}`;
  };

  const handleLinkedinScrape = async () => {
    const url = normalizeLinkedinUrl(linkedinUrl);
    if (!url) return;
    if (url !== linkedinUrl) setLinkedinUrl(url);
    setLinkedinLoading(true);
    setLinkedinMsg(null);
    try {
      const { data } = await scrapeLinkedin(url);
      if (data.success && data.text) {
        // Isi otomatis profileText dengan hasil scrape + beri tahu user
        setProfileText((prev) => {
          const sep = prev ? '\n\n--- LinkedIn scrape ---\n' : '';
          return prev + sep + data.text;
        });
        setLinkedinMsg(`✓ Berhasil mengambil ${data.length} karakter dari LinkedIn. Silakan periksa dan lengkapi sebelum analisis.`);
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Gagal mengambil LinkedIn (halaman privat). Silakan tempel manual isi profil.';
      setLinkedinMsg(msg);
    } finally {
      setLinkedinLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const url = normalizeLinkedinUrl(linkedinUrl);
    if (url !== linkedinUrl) setLinkedinUrl(url);
    const result = await analyze({
      linkedin_url: url || null,
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
                  Link LinkedIn <span className="text-slate-400">(opsional — via OpenRouter 9-router DeepSeek)</span>
                </span>
                <div className="flex gap-2">
                  <input
                    type="url"
                    value={linkedinUrl}
                    onChange={(e) => setLinkedinUrl(e.target.value)}
                    placeholder="https://www.linkedin.com/in/username"
                    className="flex-1 rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />
                  <button
                    type="button"
                    onClick={handleLinkedinScrape}
                    disabled={linkedinLoading || !linkedinUrl}
                    className="shrink-0 inline-flex items-center gap-1.5 rounded-xl border border-blue-200 bg-blue-50 px-3 py-2.5 text-xs font-semibold text-blue-700 hover:bg-blue-100 disabled:opacity-50"
                  >
                    {linkedinLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Link2 className="h-4 w-4" />}
                    Ambil
                  </button>
                </div>
                {linkedinMsg && <p className="mt-1.5 text-xs text-slate-500">{linkedinMsg}</p>}
                <p className="mt-1 text-xs text-slate-400">Jika link privat, tempel manual isi profil di bawah. Deskripsi berat IT Backend akan otomatis menunjukkan % kecocokan ke lowongan Backend.</p>
              </label>

              <label className="block">
                <span className="mb-1.5 block text-sm font-medium text-slate-700">
                  Isi Profil LinkedIn <span className="text-red-500">*</span> <span className="text-slate-400 text-xs">(akan dicocokkan TF-IDF ke lowongan — mis. backend → % kecocokan backend)</span>
                </span>
                <textarea
                  value={profileText}
                  onChange={(e) => setProfileText(e.target.value)}
                  required
                  minLength={linkedinUrl ? 50 : 100}
                  rows={10}
                  placeholder="Salin seluruh isi profil LinkedIn Anda di sini — pengalaman kerja, pendidikan, skills, ringkasan, dll. Jika sudah klik 'Ambil' dari link di atas, periksa hasilnya di sini. Minimal 50 karakter jika pakai link, 100 jika tanpa link."
                  className="w-full resize-y rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
                <span className="mt-1 block text-xs text-slate-400">
                  {profileText.length} karakter {linkedinUrl ? '(min 50 dengan link)' : '(min 100)'} — model OpenRouter DeepSeek via 9-router gateway akan analisis deskripsi berat IT Backend → % kecocokan
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
      <Footer />
    </div>
  );
}
