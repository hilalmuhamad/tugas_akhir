import { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useCareerStore } from '../store/careerStore';
import CareerNavbar from '../components/CareerNavbar';
import Footer from '../../../components/Footer';
import ProfileAnalysisCard from '../components/ProfileAnalysisCard';
import JobRecommendationCards from '../components/JobRecommendationCards';
import ChatBubble from '../components/ChatBubble';
import { Home, FileText, ClipboardList } from 'lucide-react';

export default function ChatPage() {
  const { analysisId } = useParams();
  const navigate = useNavigate();
  const {
    analysis,
    messages,
    lowongan,
    sending,
    error,
    loadAnalysis,
    loadHistory,
    send,
    history,
  } = useCareerStore();
  const [input, setInput] = useState('');
  const [showAnalysis, setShowAnalysis] = useState(true);
  const bottomRef = useRef(null);

  useEffect(() => {
    loadAnalysis(analysisId);
    loadHistory();
  }, [analysisId, loadAnalysis, loadHistory]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, sending]);

  const handleSend = async (e) => {
    e.preventDefault();
    const text = input.trim();
    if (!text || sending) return;
    setInput('');
    await send(text);
  };

  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      <CareerNavbar />

      <main className="mx-auto flex w-full max-w-7xl flex-1 gap-6 px-4 py-6">
        <aside className="hidden w-64 shrink-0 lg:block">
          <button
            onClick={() => navigate('/analyze')}
            className="mb-4 w-full rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
          >
            + Analisis Baru
          </button>
          <div className="rounded-2xl border border-slate-100 bg-white p-2 shadow-sm">
            <button
              onClick={() => navigate('/dashboard')}
              className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-sm font-medium text-slate-600 transition hover:bg-slate-50"
            >
              <Home className="h-4 w-4 text-slate-400" /> Beranda
            </button>
            <button
              onClick={() => navigate('/laporan')}
              className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-sm font-medium text-slate-600 transition hover:bg-slate-50"
            >
              <FileText className="h-4 w-4 text-slate-400" /> Laporan IKU
            </button>
            <button
              onClick={() => navigate('/kuisioner')}
              className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-sm font-medium text-slate-600 transition hover:bg-slate-50"
            >
              <ClipboardList className="h-4 w-4 text-slate-400" /> Isi Kuisioner
            </button>
          </div>
          <div className="mt-4 rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
            <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-400">
              Riwayat Analisis
            </h3>
            <div className="mt-3 space-y-2">
              {history.map((item) => (
                <button
                  key={item.id}
                  onClick={() => navigate(`/chat/${item.id}`)}
                  className={`block w-full rounded-lg px-3 py-2 text-left text-sm transition ${
                    String(item.id) === String(analysisId)
                      ? 'bg-blue-50 text-blue-700'
                      : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <span className="block truncate font-medium">{item.nama}</span>
                  <span className="block truncate text-xs text-slate-400">
                    {item.ringkasan}
                  </span>
                </button>
              ))}
              {history.length === 0 && (
                <p className="text-xs text-slate-400">Belum ada analisis.</p>
              )}
            </div>
          </div>
        </aside>

        <section className="flex min-w-0 flex-1 flex-col">
          {error && (
            <p className="mb-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>
          )}

          {analysis && (
            <div className="mb-4">
              <button
                onClick={() => setShowAnalysis((v) => !v)}
                className="mb-2 flex items-center gap-2 text-sm font-semibold text-blue-600"
              >
                <span className={`transition-transform ${showAnalysis ? 'rotate-90' : ''}`}>›</span>
                {showAnalysis ? 'Sembunyikan' : 'Lihat'} Hasil Analisis
              </button>
              {showAnalysis && (
                <div className="max-h-96 overflow-y-auto rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
                  <ProfileAnalysisCard analysis={analysis} />
                </div>
              )}
            </div>
          )}

          <div className="flex flex-1 flex-col overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm">
            <div className="flex-1 space-y-4 overflow-y-auto p-5">
              {messages.length === 0 && (
                <div className="py-10 text-center text-sm text-slate-400">
                  <p className="text-3xl">💼</p>
                  <p className="mt-2 font-medium text-slate-500">AI Career Assistant</p>
                  <p className="mt-1">
                    Tanyakan apa saja: rekomendasi posisi, gaji yang wajar,
                    persiapan wawancara, atau pengembangan skill.
                  </p>
                </div>
              )}

              {messages.map((m) => (
                <ChatBubble key={m.id} role={m.role} content={m.content} />
              ))}

              {!sending && lowongan.length > 0 && <JobRecommendationCards jobs={lowongan} />}

              {sending && (
                <div className="flex justify-start">
                  <div className="flex items-center gap-1.5 rounded-2xl rounded-bl-md border border-slate-100 bg-white px-4 py-3 shadow-sm">
                    <Dot className="animate-bounce [animation-delay:0ms]" />
                    <Dot className="animate-bounce [animation-delay:150ms]" />
                    <Dot className="animate-bounce [animation-delay:300ms]" />
                  </div>
                </div>
              )}
              <div ref={bottomRef} />
            </div>

            <form
              onSubmit={handleSend}
              className="flex items-center gap-3 border-t border-slate-100 p-4"
            >
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Tanyakan sesuatu tentang karier Anda..."
                className="flex-1 rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
              <button
                type="submit"
                disabled={sending || !input.trim()}
                className="rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Kirim
              </button>
            </form>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}

function Dot({ className }) {
  return (
    <span
      className={`h-2 w-2 rounded-full bg-slate-400 ${className}`}
    />
  );
}
