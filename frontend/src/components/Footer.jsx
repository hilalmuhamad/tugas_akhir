import { Link } from "react-router-dom";
import { GraduationCap } from "lucide-react";

const LINKS = [
  { to: "/dashboard", label: "Dashboard" },
  { to: "/kuisioner", label: "Tracer Study" },
  { to: "/analyze", label: "Analisis Karier" },
  { to: "/jobs", label: "Lowongan" },
  { to: "/profile", label: "Profil" },
];

/**
 * Footer bersama untuk halaman terautentikasi Portal Tracer Study.
 */
export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-slate-200 bg-white">
      <div className="mx-auto flex w-full max-w-6xl flex-col items-center justify-between gap-4 px-4 py-6 md:flex-row">
        <div className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-white">
            <GraduationCap className="h-4 w-4" />
          </span>
          <div>
            <p className="text-sm font-semibold text-slate-900">
              Portal Tracer Study
            </p>
            <p className="text-xs text-slate-500">
              Smart Career Matching Alumni
            </p>
          </div>
        </div>

        <nav
          className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1"
          aria-label="Navigasi footer"
        >
          {LINKS.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className="text-xs font-medium text-slate-500 transition hover:text-blue-600"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <p className="text-xs text-slate-400">
          &copy; {year} Tugas Akhir — Tracer Study &amp; Job Matching Alumni
        </p>
      </div>
    </footer>
  );
}
