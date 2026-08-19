import { MessageSquareText, CheckCircle2, BarChart3, ClipboardList } from "lucide-react";

const FEATURES = [
  {
    icon: ClipboardList,
    title: "Kuisioner tracer study",
    desc: "Alumni mengisi data karier singkat: status bekerja, masa tunggu, kesesuaian bidang, dan rentang gaji.",
  },
  {
    icon: BarChart3,
    title: "Dashboard lintas dimensi",
    desc: "Rekapitulasi data karier alumni per program studi, tahun lulus, dan status kerja.",
  },
  {
    icon: CheckCircle2,
    title: "Kesesuaian bidang terukur",
    desc: "Perbandingan bidang pekerjaan dengan latar belakang prodi dihitung otomatis per lulusan.",
  },
  {
    icon: MessageSquareText,
    title: "Data terpusat satu gudang",
    desc: "Jawaban kuisioner dirapikan ke data warehouse agar mudah dianalisis kampus.",
  },
];

export default function Fitur() {
  return (
    <section id="fitur" className="bg-slate-50 px-6 py-24">
      <div className="mx-auto max-w-5xl">
        <h2 className="text-center font-display text-3xl font-semibold leading-tight tracking-tight text-slate-900 md:text-[42px]">
          Fitur utama
        </h2>
        <div className="mt-14 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {FEATURES.map((f) => (
            <div
              key={f.title}
              className="rounded-2xl bg-white p-6 shadow-soft transition-all duration-150 hover:-translate-y-0.5 hover:shadow-lifted motion-reduce:hover:translate-y-0"
            >
              <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50">
                <f.icon aria-hidden className="h-5 w-5 text-blue-600" />
              </div>
              <h3 className="text-base font-semibold text-slate-900">{f.title}</h3>
              <p className="mt-2 text-[15px] leading-relaxed text-slate-500">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
