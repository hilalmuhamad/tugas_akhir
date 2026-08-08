import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Search, Sparkles, BarChart3, ClipboardList, ShieldCheck, Zap, Users,
  Building2, CheckCircle2, ChevronDown, ArrowRight, MapPin, Wallet,
  Layers, MessageSquareText, TrendingUp, Menu, X, Home,
} from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, CartesianGrid } from "recharts";
import { searchJobs } from "../../jobs/services/jobApi";
import { getHistory } from "../../career/services/careerApi";
import { useAuthStore } from "../../auth/store/authStore";

const FONT_IMPORT = "@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Poppins:wght@600;700&display=swap');";
const heading = { fontFamily: "'Poppins', sans-serif" };
const body = { fontFamily: "'Inter', sans-serif" };

function Navbar() {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const goMenuAlumni = async () => {
    try {
      const { data } = await getHistory();
      if (data.length > 0) navigate(`/chat/${data[0].id}`);
      else navigate('/analyze');
    } catch {
      navigate('/analyze');
    }
  };

  const tutup = (fn) => () => {
    setSidebarOpen(false);
    fn();
  };

  const links = [
    { href: "#features", label: "Fitur" },
    { href: "#how-it-works", label: "Cara kerja" },
    { href: "#analytics-preview", label: "Dashboard" },
    { href: "#faq", label: "FAQ" },
  ];

  const sidebar = (close) => (
    <>
      <div className="absolute inset-0 bg-slate-900/50" onClick={close} />
      <div className="absolute right-0 top-0 flex h-full w-72 flex-col bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center">
              <Sparkles className="w-3.5 h-3.5 text-white" />
            </div>
            <span style={heading} className="text-slate-900 font-semibold">SmartCareer</span>
          </div>
          <button onClick={close} className="p-1.5 rounded-lg hover:bg-slate-100 transition">
            <X className="w-5 h-5 text-slate-500" />
          </button>
        </div>

        {user && (
          <div className="border-b border-slate-100 px-3 py-3">
            <p className="px-2 pb-1.5 text-[11px] font-semibold uppercase tracking-wide text-slate-400">
              Menu Alumni
            </p>
            <button
              onClick={tutup(() => navigate('/dashboard'))}
              className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-blue-50"
            >
              <Home className="w-4 h-4 text-blue-600" /> Beranda
            </button>
            <button
              onClick={tutup(goMenuAlumni)}
              className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-blue-50"
            >
              <Sparkles className="w-4 h-4 text-blue-600" /> Hasil Analisis
            </button>
          </div>
        )}

        <div className="flex-1 overflow-y-auto px-3 py-3">
          <p className="px-2 pb-1.5 text-[11px] font-semibold uppercase tracking-wide text-slate-400">
            Navigasi
          </p>
          {links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              onClick={close}
              className="block rounded-lg px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50"
            >
              {l.label}
            </a>
          ))}
        </div>

        <div className="border-t border-slate-100 p-3">
          {user ? (
            <button
              onClick={tutup(() => navigate('/dashboard'))}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2.5 rounded-xl transition"
            >
              Beranda Alumni
            </button>
          ) : (
            <Link
              to="/login"
              onClick={close}
              className="block w-full border border-slate-200 hover:border-slate-300 text-slate-700 text-sm font-medium px-4 py-2.5 rounded-xl text-center transition"
            >
              Masuk
            </Link>
          )}
        </div>
      </div>
    </>
  );

  return (
    <nav className="sticky top-0 z-20 bg-white/90 backdrop-blur border-b border-slate-100">
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-blue-600 flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <span style={heading} className="text-slate-900 font-semibold">SmartCareer</span>
        </div>
        <div className="hidden md:flex items-center gap-8">
          {links.map((l) => (
            <a key={l.href} href={l.href} className="text-sm text-slate-600 hover:text-slate-900 transition">{l.label}</a>
          ))}
        </div>
        <div className="hidden md:flex items-center gap-3">
          {user ? (
            <button onClick={goMenuAlumni} className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-xl transition">
              Menu Alumni →
            </button>
          ) : (
            <Link to="/login" className="border border-slate-200 hover:border-slate-300 text-slate-700 text-sm font-medium px-4 py-2 rounded-xl transition">
              Masuk
            </Link>
          )}
          <a href="#job-preview" className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-xl transition">
            Coba sekarang
          </a>
        </div>
        <button
          onClick={() => setSidebarOpen(true)}
          className="md:hidden p-2 rounded-lg hover:bg-slate-100 transition"
          aria-label="Buka menu"
        >
          <Menu className="w-5 h-5 text-slate-600" />
        </button>
      </div>

      {sidebarOpen && (
        <div className="fixed inset-0 z-30 md:hidden">
          {sidebar(() => setSidebarOpen(false))}
        </div>
      )}
    </nav>
  );
}

function Hero() {
  return (
    <section className="bg-gray-50 px-6 py-20">
      <div className="max-w-3xl mx-auto text-center">
        <span className="inline-flex items-center gap-1.5 bg-cyan-50 text-cyan-700 text-xs font-medium px-3 py-1.5 rounded-full">
          <Sparkles className="w-3.5 h-3.5" /> Untuk alumni &amp; pusat karier kampus
        </span>
        <h1 style={heading} className="text-4xl md:text-5xl text-slate-900 font-semibold mt-5 leading-tight">
          Jembatan alumni menuju<br />pekerjaan yang tepat
        </h1>
        <p className="text-slate-600 mt-4 text-base md:text-lg max-w-xl mx-auto">
          Alumni cukup ceritakan apa yang mereka cari dengan bahasa sendiri. Kampus mendapat dashboard OLAP untuk memantau pertumbuhan karier lulusan secara menyeluruh.
        </p>
        <div className="flex items-center justify-center gap-3 mt-8">
          <a href="#job-preview" className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-5 py-3 rounded-xl transition flex items-center gap-1.5">
            Cari peran cocok <ArrowRight className="w-4 h-4" />
          </a>
          <a href="#analytics-preview" className="bg-white border border-slate-200 hover:border-slate-300 text-slate-700 text-sm font-medium px-5 py-3 rounded-xl transition">
            Lihat dashboard
          </a>
        </div>
      </div>
    </section>
  );
}

function TrustBar() {
  const items = [
    { label: "Program studi tercakup", value: "4" },
    { label: "Peran pengguna", value: "3" },
    { label: "Dimensi analitik OLAP", value: "Multi" },
    { label: "Filter pencarian rumit", value: "0" },
  ];
  return (
    <section className="border-y border-slate-100 bg-white px-6 py-8">
      <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
        {items.map((it) => (
          <div key={it.label} className="bg-slate-50 rounded-xl py-4 px-3">
            <div style={heading} className="text-2xl text-slate-900 font-semibold">{it.value}</div>
            <div className="text-xs text-slate-500 mt-1">{it.label}</div>
          </div>
        ))}
      </div>
    </section>
  );
}

function ProblemSolution() {
  const problems = [
    { icon: Search, text: "Alumni kesulitan menemukan lowongan yang benar-benar sesuai keahlian mereka." },
    { icon: ClipboardList, text: "Data tracer study tersebar dan sulit dipantau oleh kampus secara berkala." },
    { icon: Users, text: "Formulir dan filter pencarian kerja yang rumit membuat alumni enggan mengisi." },
  ];
  return (
    <section id="problem" className="px-6 py-20 bg-gray-50">
      <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-12">
        <div>
          <h2 style={heading} className="text-2xl text-slate-900 font-semibold mb-5">Masalahnya jelas</h2>
          <div className="grid gap-4">
            {problems.map((p, i) => (
              <div key={i} className="flex gap-3 bg-white rounded-2xl p-4 border border-slate-100 shadow-sm transition-shadow hover:shadow-md">
                <p.icon className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                <p className="text-sm text-slate-600">{p.text}</p>
              </div>
            ))}
          </div>
        </div>
        <div id="solution">
          <h2 style={heading} className="text-2xl text-slate-900 font-semibold mb-5">Solusi kami</h2>
          <div className="bg-blue-600 rounded-2xl p-6 text-white">
            <ShieldCheck className="w-6 h-6 text-cyan-300 mb-3" />
            <p className="text-sm leading-relaxed">
              Satu platform yang menghubungkan pencarian kerja berbahasa alami untuk alumni dengan dashboard analitik OLAP untuk kampus — tanpa form rumit, tanpa data yang tercecer.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

function FeatureCard({ icon: Icon, title, desc }) {
  return (
    <div className="bg-white rounded-2xl p-6 border border-slate-100 hover:border-slate-200 shadow-sm transition-all duration-200 hover:shadow-md hover:-translate-y-0.5">
      <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center mb-4">
        <Icon className="w-5 h-5 text-blue-600" />
      </div>
      <h3 className="text-sm font-medium text-slate-900">{title}</h3>
      <p className="text-sm text-slate-500 mt-1.5">{desc}</p>
    </div>
  );
}

function Features() {
  const features = [
    { icon: MessageSquareText, title: "Pencarian bahasa alami", desc: "Alumni cukup mengetik dengan kata-kata sendiri, tanpa dropdown atau filter." },
    { icon: CheckCircle2, title: "Alasan kecocokan transparan", desc: "Setiap rekomendasi disertai alasan kenapa peran itu cocok." },
    { icon: BarChart3, title: "Dashboard OLAP interaktif", desc: "Roll-up, drill-down, slice, dan dice atas data karier lulusan." },
    { icon: ClipboardList, title: "Kuisioner terintegrasi", desc: "Data tracer study langsung mengisi basis analitik kampus." },
    { icon: Layers, title: "Multi-dimensi", desc: "Analisis per program studi, tahun lulus, dan rentang gaji sekaligus." },
    { icon: Building2, title: "Siap untuk mitra perusahaan", desc: "Struktur data disiapkan untuk integrasi lowongan dari perusahaan mitra." },
  ];
  return (
    <section id="features" className="px-6 py-20 bg-white">
      <div className="max-w-5xl mx-auto">
        <h2 style={heading} className="text-2xl text-slate-900 font-semibold mb-10 text-center">Fitur utama</h2>
        <div className="grid md:grid-cols-3 gap-5">
          {features.map((f) => <FeatureCard key={f.title} {...f} />)}
        </div>
      </div>
    </section>
  );
}

function HowItWorks() {
  const steps = [
    { n: "01", title: "Isi kuisioner tracer study", desc: "Data karier singkat: prodi, tahun lulus, masa tunggu, rentang gaji." },
    { n: "02", title: "Ceritakan yang Anda cari", desc: "Ketik dengan bahasa sendiri — keahlian, lokasi, preferensi kerja." },
    { n: "03", title: "Terima rekomendasi beralasan", desc: "Lihat peran yang paling cocok, lengkap dengan alasannya." },
  ];
  return (
    <section id="how-it-works" className="px-6 py-20 bg-gray-50">
      <div className="max-w-5xl mx-auto">
        <h2 style={heading} className="text-2xl text-slate-900 font-semibold mb-10 text-center">Cara kerja</h2>
        <div className="grid md:grid-cols-3 gap-6">
          {steps.map((s) => (
            <div key={s.n} className="text-center md:text-left">
              <div style={heading} className="text-3xl text-blue-600 font-semibold mb-2">{s.n}</div>
              <h3 className="text-sm font-medium text-slate-900">{s.title}</h3>
              <p className="text-sm text-slate-500 mt-1.5">{s.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function JobMatchingPreview() {
  const SAMPLE = "lulusan Informatika, jago Flutter, cari kerja remote di Bandung";
  const [query, setQuery] = useState(SAMPLE);
  const [results, setResults] = useState(null);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const runSearch = async (text) => {
    const q = text.trim();
    if (!q) return;
    setLoading(true);
    setError(null);
    try {
      const res = await searchJobs(q);
      setResults(res.data.hasil ?? []);
      setTotal(res.data.total_korpus ?? 0);
    } catch {
      setError("Gagal menjangkau backend. Pastikan Laravel sudah berjalan.");
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    searchJobs(SAMPLE)
      .then((res) => {
        setResults(res.data?.hasil ?? []);
        setTotal(res.data?.total_korpus ?? 0);
      })
      .catch(() => {
        setError("Gagal menjangkau backend. Pastikan Laravel sudah berjalan.");
        setResults([]);
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <section id="job-preview" className="px-6 py-20 bg-white">
      <div className="max-w-2xl mx-auto">
        <h2 style={heading} className="text-2xl text-slate-900 font-semibold mb-2 text-center">Pratinjau pencarian kerja</h2>
        <p className="text-sm text-slate-500 text-center mb-8">
          Dijalankan langsung oleh mesin TF-IDF + Cosine Similarity pada {total || "..."} lowongan sungguhan
        </p>
        <form
          onSubmit={(e) => { e.preventDefault(); runSearch(query); }}
          className="flex items-center gap-2 bg-gray-50 rounded-xl p-2 border border-slate-200"
        >
          <Search className="w-4 h-4 text-slate-400 ml-3 shrink-0" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-1 bg-transparent text-sm text-slate-700 py-2 outline-none"
            placeholder="Ceritakan keahlian, lokasi, atau preferensi kerja Anda..."
          />
          <button
            type="submit"
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white text-sm font-medium px-4 py-2 rounded-lg transition shrink-0"
          >
            {loading ? "Mencari..." : "Cari"}
          </button>
        </form>

        {error && (
          <div className="mt-4 text-sm text-red-600 bg-red-50 rounded-xl p-4">{error}</div>
        )}

        {!loading && !error && results !== null && (
          <div className="mt-4 grid gap-3">
            {results.slice(0, 3).map((r, i) => (
              <div key={r.id} className={`bg-white rounded-2xl border p-5 ${i === 0 ? "border-emerald-200 shadow-sm" : "border-slate-100"}`}>
                <div className="flex items-start justify-between gap-4">
                  <div>
                    {i === 0 && (
                      <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full uppercase">Paling cocok</span>
                    )}
                    <h3 className="text-sm font-medium text-slate-900 mt-1">{r.judul_posisi}</h3>
                    <p className="text-sm text-slate-500 mt-0.5">{r.perusahaan}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <div style={heading} className="font-semibold text-emerald-600">{r.kecocokan ?? Math.round(r.skor * 100)}%</div>
                    <div className="text-xs text-slate-400">kecocokan</div>
                  </div>
                </div>
                <div className="flex gap-3 mt-3 text-sm text-slate-500">
                  {r.lokasi && <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" />{r.lokasi}</span>}
                  {(r.gaji_min != null || r.gaji_max != null) && (
                    <span className="flex items-center gap-1"><Wallet className="w-3.5 h-3.5" />Rp{r.gaji_min ?? 0}–{r.gaji_max ?? ""} jt</span>
                  )}
                </div>
                {(r.keahlian ?? []).length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-4 pt-4 border-t border-slate-100">
                    {r.keahlian.slice(0, 5).map((k) => (
                      <span key={k} className="text-xs px-2 py-1 rounded-full bg-emerald-50 text-emerald-700">{k}</span>
                    ))}
                  </div>
                )}
              </div>
            ))}
            {results.length === 0 && (
              <p className="text-sm text-slate-400 text-center py-4">Tidak ada lowongan yang cocok untuk query ini.</p>
            )}
          </div>
        )}
      </div>
    </section>
  );
}

function AnalyticsPreview() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("http://localhost:8000/api/stats")
      .then((res) => (res.ok ? res.json() : Promise.reject()))
      .then((stats) => {
        const gaji = stats?.gaji_per_prodi ?? {};
        const rows = Object.entries(gaji)
          .map(([prodi, nilai]) => ({ prodi, gaji: Number(nilai) }))
          .filter((r) => r.gaji > 0);
        if (rows.length > 0) setData(rows);
      })
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, []);

  const fallbackData = [
    { prodi: "Informatika", gaji: 6.4 },
    { prodi: "Sistem Info", gaji: 5.8 },
    { prodi: "Logistik", gaji: 5.2 },
    { prodi: "Bisnis Digital", gaji: 5.5 },
  ];

  return (
    <section id="analytics-preview" className="px-6 py-20 bg-gray-50">
      <div className="max-w-3xl mx-auto">
        <h2 style={heading} className="text-2xl text-slate-900 font-semibold mb-2 text-center">Pratinjau dashboard OLAP</h2>
        <p className="text-sm text-slate-500 text-center mb-8">
          {loading
            ? "Memuat data..."
            : data
              ? "Rata-rata gaji lulusan per program studi (sumber: data tracer study)"
              : "Data dummy — ilustrasi tampilan (backend offline)"}
        </p>
        <div className="bg-white rounded-2xl border border-slate-100 p-6">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-4 h-4 text-blue-600" />
            <p className="text-sm font-medium text-slate-700">Rata-rata gaji per program studi (juta)</p>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={data ?? fallbackData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
              <XAxis dataKey="prodi" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Bar dataKey="gaji" fill="#2563eb" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </section>
  );
}

function Statistics() {
  const stats = [
    { icon: Layers, label: "Analisis multi-dimensi OLAP" },
    { icon: MessageSquareText, label: "Pencarian tanpa filter rumit" },
    { icon: Users, label: "3 peran pengguna terlayani" },
    { icon: Zap, label: "Alasan kecocokan instan" },
  ];
  return (
    <section className="px-6 py-20 bg-blue-600">
      <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6">
        {stats.map((s) => (
          <div key={s.label} className="text-center text-white">
            <s.icon className="w-5 h-5 mx-auto mb-2 text-cyan-300" />
            <p className="text-xs">{s.label}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function Testimonials() {
  const quotes = [
    { text: "Saya cuma cerita apa yang saya cari, langsung dapat beberapa rekomendasi yang masuk akal.", who: "Alumni Teknik Informatika, 2023" },
    { text: "Dashboard-nya membantu kami melihat pola masa tunggu kerja per prodi tanpa rekap manual.", who: "Staf Pusat Karier" },
    { text: "Alasan kecocokan tiap lowongan bikin saya lebih yakin sebelum melamar.", who: "Alumni Sistem Informasi, 2024" },
  ];
  return (
    <section id="testimonials" className="px-6 py-20 bg-white">
      <div className="max-w-5xl mx-auto">
        <h2 style={heading} className="text-2xl text-slate-900 font-semibold mb-2 text-center">Contoh tanggapan pengguna</h2>
        <p className="text-xs text-slate-400 text-center mb-8">Ilustratif — untuk keperluan prototipe</p>
        <div className="grid md:grid-cols-3 gap-5">
          {quotes.map((q, i) => (
            <div key={i} className="bg-gray-50 rounded-2xl p-5 border border-slate-100">
              <p className="text-sm text-slate-600 leading-relaxed">"{q.text}"</p>
              <p className="text-xs text-slate-400 mt-4">{q.who}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function FAQ() {
  const items = [
    { q: "Apakah platform ini gratis untuk alumni?", a: "Ya, pengisian kuisioner dan pencarian kerja tidak dipungut biaya." },
    { q: "Apakah tersedia untuk semua program studi?", a: "Saat ini mencakup 4 program studi di bawah kampus, dapat diperluas ke depannya." },
    { q: "Bagaimana keamanan data alumni?", a: "Data hanya digunakan untuk pencocokan kerja dan analitik internal kampus." },
    { q: "Dari mana data lowongan kerja berasal?", a: "Versi ini memakai data dummy untuk keperluan demonstrasi/prototipe." },
  ];
  const [open, setOpen] = useState(0);
  return (
    <section id="faq" className="px-6 py-20 bg-gray-50">
      <div className="max-w-2xl mx-auto">
        <h2 style={heading} className="text-2xl text-slate-900 font-semibold mb-8 text-center">Pertanyaan umum</h2>
        <div className="grid gap-3">
          {items.map((it, i) => (
            <div key={i} className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
              <button onClick={() => setOpen(open === i ? -1 : i)} className="w-full flex items-center justify-between px-5 py-4 text-left">
                <span className="text-sm font-medium text-slate-900">{it.q}</span>
                <ChevronDown className={`w-4 h-4 text-slate-400 shrink-0 transition-transform ${open === i ? "rotate-180" : ""}`} />
              </button>
              {open === i && <p className="text-sm text-slate-500 px-5 pb-4">{it.a}</p>}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function CTASection() {
  return (
    <section className="px-6 py-20 bg-white text-center">
      <div className="max-w-xl mx-auto">
        <h2 style={heading} className="text-2xl md:text-3xl text-slate-900 font-semibold mb-3">
          Siap menemukan langkah karier berikutnya?
        </h2>
        <p className="text-sm text-slate-500 mb-6">Mulai dengan mengisi kuisioner tracer study Anda.</p>
        <a href="#job-preview" className="inline-flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-6 py-3 rounded-xl transition">
          Mulai sekarang <ArrowRight className="w-4 h-4" />
        </a>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="px-6 py-10 bg-slate-900 text-slate-400">
      <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-white">
          <Sparkles className="w-4 h-4 text-cyan-400" />
          <span style={heading} className="text-sm font-semibold">SmartCareer</span>
        </div>
        <p className="text-xs">Tugas akhir — Tracer Study &amp; Job Matching Alumni · Data dummy untuk prototipe</p>
      </div>
    </footer>
  );
}

export default function LandingPage() {
  return (
    <div style={body} className="w-full min-h-full bg-white">
      <style>{FONT_IMPORT}</style>
      <Navbar />
      <Hero />
      <TrustBar />
      <ProblemSolution />
      <Features />
      <HowItWorks />
      <JobMatchingPreview />
      <AnalyticsPreview />
      <Statistics />
      <Testimonials />
      <FAQ />
      <CTASection />
      <Footer />
    </div>
  );
}