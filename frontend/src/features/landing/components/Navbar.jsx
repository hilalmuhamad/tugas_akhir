import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Sparkles, Menu, X, Home } from "lucide-react";
import { getHistory } from "../../career/services/careerApi";
import { useAuthStore } from "../../auth/store/authStore";

const LINKS = [
  { href: "#fitur", label: "Fitur" },
  { href: "#cara-kerja", label: "Cara kerja" },
  { href: "#pratinjau-olap", label: "Dashboard" },
  { href: "#faq", label: "FAQ" },
];

export default function Navbar() {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const goMenuAlumni = async () => {
    try {
      const { data } = await getHistory();
      if (data.length > 0) navigate(`/chat/${data[0].id}`);
      else navigate("/analyze");
    } catch {
      navigate("/analyze");
    }
  };

  const tutup = (fn) => () => {
    setSidebarOpen(false);
    fn();
  };

  const sidebar = (close) => (
    <>
      <div className="absolute inset-0 bg-slate-900/50" onClick={close} />
      <div className="absolute right-0 top-0 flex h-full w-72 flex-col bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-600">
              <Sparkles aria-hidden className="h-3.5 w-3.5 text-white" />
            </div>
            <span className="text-base font-semibold tracking-tight text-slate-900">SmartCareer</span>
          </div>
          <button onClick={close} className="rounded-lg p-1.5 transition hover:bg-slate-100" aria-label="Tutup menu">
            <X aria-hidden className="h-5 w-5 text-slate-500" />
          </button>
        </div>

        {user && (
          <div className="border-b border-slate-100 px-3 py-3">
            <p className="px-2 pb-1.5 text-[11px] font-semibold uppercase tracking-wide text-slate-400">
              Menu Alumni
            </p>
            <button
              onClick={tutup(() => navigate("/dashboard"))}
              className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-blue-50"
            >
              <Home aria-hidden className="h-4 w-4 text-blue-600" /> Beranda
            </button>
            <button
              onClick={tutup(goMenuAlumni)}
              className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-blue-50"
            >
              <Sparkles aria-hidden className="h-4 w-4 text-blue-600" /> Hasil Analisis
            </button>
          </div>
        )}

        <div className="flex-1 overflow-y-auto px-3 py-3">
          <p className="px-2 pb-1.5 text-[11px] font-semibold uppercase tracking-wide text-slate-400">
            Navigasi
          </p>
          {LINKS.map((l) => (
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
              onClick={tutup(() => navigate("/dashboard"))}
              className="w-full rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-blue-700"
            >
              Beranda Alumni
            </button>
          ) : (
            <Link
              to="/login"
              onClick={close}
              className="block w-full rounded-xl border border-slate-200 px-4 py-2.5 text-center text-sm font-medium text-slate-700 transition hover:border-slate-300"
            >
              Masuk
            </Link>
          )}
        </div>
      </div>
    </>
  );

  return (
    <nav className="sticky top-0 z-20 border-b border-slate-100 bg-white/90 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-600">
            <Sparkles aria-hidden className="h-4 w-4 text-white" />
          </div>
          <span className="text-lg font-semibold tracking-tight text-slate-900">SmartCareer</span>
        </div>
        <div className="hidden items-center gap-8 md:flex">
          {LINKS.map((l) => (
            <a key={l.href} href={l.href} className="text-sm text-slate-600 transition hover:text-slate-900">
              {l.label}
            </a>
          ))}
        </div>
        <div className="hidden items-center gap-3 md:flex">
          {user ? (
            <button onClick={goMenuAlumni} className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700">
              Menu Alumni
            </button>
          ) : (
            <Link to="/login" className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-slate-300">
              Masuk
            </Link>
          )}
          <a href="#cari" className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700">
            Coba sekarang
          </a>
        </div>
        <button
          onClick={() => setSidebarOpen(true)}
          className="rounded-lg p-2 transition hover:bg-slate-100 md:hidden"
          aria-label="Buka menu"
        >
          <Menu aria-hidden className="h-5 w-5 text-slate-600" />
        </button>
      </div>

      {sidebarOpen && (
        <div className="fixed inset-0 z-30 md:hidden">{sidebar(() => setSidebarOpen(false))}</div>
      )}
    </nav>
  );
}
