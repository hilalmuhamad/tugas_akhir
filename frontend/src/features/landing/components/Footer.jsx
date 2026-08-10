import { Sparkles } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-slate-900 px-6 py-10 text-slate-400">
      <div className="mx-auto flex max-w-5xl flex-col items-center justify-between gap-4 md:flex-row">
        <div className="flex items-center gap-2 text-white">
          <Sparkles aria-hidden className="h-4 w-4 text-blue-400" />
          <span className="text-base font-semibold tracking-tight">SmartCareer</span>
        </div>
        <p className="text-xs">
          Tugas akhir — Tracer Study &amp; Job Matching Alumni · Data alumni bersifat contoh
        </p>
      </div>
    </footer>
  );
}
