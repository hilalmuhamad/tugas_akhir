const STEPS = [
  {
    n: "01",
    title: "Isi kuisioner tracer study",
    desc: "Data karier singkat: prodi, tahun lulus, masa tunggu, dan rentang gaji.",
  },
  {
    n: "02",
    title: "Data diolah ke data warehouse",
    desc: "Jawaban kuisioner dibersihkan dan disusun ke skema OLAP untuk dianalisis.",
  },
  {
    n: "03",
    title: "Lihat statistik karier alumni",
    desc: "Status bekerja, masa tunggu, dan kesesuaian bidang tampil dalam dashboard kampus.",
  },
];

export default function CaraKerja() {
  return (
    <section id="cara-kerja" className="bg-white px-6 py-24">
      <div className="mx-auto max-w-5xl">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="font-display text-3xl font-semibold leading-tight tracking-tight text-slate-900 md:text-[42px]">
            Cara kerja
          </h2>
          <p className="mt-5 text-base leading-relaxed text-slate-500 md:text-lg">
            Data tracer study kampus tersebar di berbagai sumber. Sistem ini mengumpulkan jawaban
            alumni dalam satu gudang data, lalu menyajikan statistik karier secara terpusat.
          </p>
        </div>
        <div className="mt-16 grid gap-10 md:grid-cols-3">
          {STEPS.map((s) => (
            <div key={s.n} className="text-center md:text-left">
              <div className="font-display text-[40px] font-semibold leading-none text-blue-600">
                {s.n}
              </div>
              <h3 className="mt-4 text-lg font-semibold text-slate-900">{s.title}</h3>
              <p className="mt-2 text-[15px] leading-relaxed text-slate-500">{s.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
