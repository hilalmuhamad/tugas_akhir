import { useState } from "react";
import { ChevronDown } from "lucide-react";

const ITEMS = [
  {
    q: "Apakah platform ini gratis untuk alumni?",
    a: "Ya, pengisian kuisioner dan pencarian kerja tidak dipungut biaya.",
  },
  {
    q: "Apakah tersedia untuk semua program studi?",
    a: "Saat ini mencakup empat program studi di bawah kampus dan dapat diperluas ke depannya.",
  },
  {
    q: "Bagaimana keamanan data alumni?",
    a: "Data hanya digunakan untuk pencocokan kerja dan analitik internal kampus.",
  },
  {
    q: "Dari mana data lowongan kerja berasal?",
    a: "Lowongan kerja tersimpan sebagai data nyata di basis data sistem, dikelola oleh admin, dan diperbarui dari sumber publik yang tersedia.",
  },
];

export default function Faq() {
  const [open, setOpen] = useState(0);

  return (
    <section id="faq" className="bg-slate-50 px-6 py-24">
      <div className="mx-auto max-w-2xl">
        <h2 className="text-center font-display text-3xl font-semibold leading-tight tracking-tight text-slate-900 md:text-[42px]">
          Pertanyaan umum
        </h2>
        <div className="mt-12 grid gap-3">
          {ITEMS.map((it, i) => {
            const expanded = open === i;
            return (
              <div key={it.q} className="overflow-hidden rounded-2xl bg-white shadow-soft">
                <button
                  type="button"
                  onClick={() => setOpen(expanded ? -1 : i)}
                  aria-expanded={expanded}
                  aria-controls={`faq-panel-${i}`}
                  id={`faq-trigger-${i}`}
                  className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left"
                >
                  <span className="text-base font-medium text-slate-900">{it.q}</span>
                  <ChevronDown
                    aria-hidden
                    className={`h-4 w-4 shrink-0 text-slate-400 transition-transform ${expanded ? "rotate-180" : ""}`}
                  />
                </button>
                {expanded && (
                  <div
                    id={`faq-panel-${i}`}
                    role="region"
                    aria-labelledby={`faq-trigger-${i}`}
                    className="px-5 pb-4"
                  >
                    <p className="text-[15px] leading-relaxed text-slate-500">{it.a}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
