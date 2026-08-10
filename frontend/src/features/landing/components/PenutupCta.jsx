import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

export default function PenutupCta() {
  return (
    <section className="bg-white px-6 py-24 text-center">
      <div className="mx-auto max-w-xl">
        <h2 className="font-display text-3xl font-semibold leading-tight tracking-tight text-slate-900 md:text-[42px]">
          Siap menemukan langkah karier berikutnya?
        </h2>
        <p className="mt-5 text-base leading-relaxed text-slate-500 md:text-lg">
          Mulai dengan mengisi kuisioner tracer study Anda.
        </p>
        <Link
          to="/register"
          className="mt-9 inline-flex h-[52px] items-center justify-center gap-2 rounded-[10px] bg-blue-600 px-8 text-sm font-semibold uppercase tracking-[0.05em] text-white shadow-btn transition-all duration-150 hover:-translate-y-px hover:bg-blue-700 hover:shadow-btn-hover active:translate-y-0 active:shadow-soft motion-reduce:hover:translate-y-0"
        >
          Mulai Sekarang <ArrowRight aria-hidden className="h-4 w-4" />
        </Link>
      </div>
    </section>
  );
}
