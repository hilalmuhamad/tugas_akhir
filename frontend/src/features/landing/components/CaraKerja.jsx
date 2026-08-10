const STEPS = [
  {
    n: "01",
    title: "Isi kuisioner tracer study",
    desc: "Data karier singkat: prodi, tahun lulus, masa tunggu, dan rentang gaji.",
  },
  {
    n: "02",
    title: "Ceritakan yang Anda cari",
    desc: "Ketik dengan bahasa sendiri: keahlian, lokasi, dan preferensi kerja.",
  },
  {
    n: "03",
    title: "Terima hasil urut skor kemiripan",
    desc: "Setiap lowongan tampil dengan skor kemiripan dan daftar keahlian yang diharapkan.",
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
            Pencarian kerja konvensional memaksa alumni menyaring filter yang rumit, sementara data
            tracer study kampus tersebar. Smart Career Matching menyatukan keduanya dalam satu alur
            yang sederhana.
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
