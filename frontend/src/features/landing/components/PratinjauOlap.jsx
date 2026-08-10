import { useEffect, useState } from "react";
import { TrendingUp } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, CartesianGrid } from "recharts";
import { getStats } from "../../../services/api";

const FALLBACK = [
  { prodi: "Informatika", gaji: 6.4 },
  { prodi: "Sistem Info", gaji: 5.8 },
  { prodi: "Logistik", gaji: 5.2 },
  { prodi: "Bisnis Digital", gaji: 5.5 },
];

export default function PratinjauOlap() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    getStats()
      .then(({ data: stats }) => {
        if (!active) return;
        const rows = Object.entries(stats?.gaji_per_prodi ?? {})
          .map(([prodi, gaji]) => ({ prodi, gaji: Number(gaji) }))
          .filter((r) => r.gaji > 0);
        if (rows.length > 0) setData(rows);
      })
      .catch(() => {
        if (active) setData(null);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  return (
    <section id="pratinjau-olap" className="bg-white px-6 py-24">
      <div className="mx-auto max-w-3xl">
        <h2 className="text-center font-display text-3xl font-semibold leading-tight tracking-tight text-slate-900 md:text-[42px]">
          Pratinjau dashboard OLAP
        </h2>
        <p className="mx-auto mt-5 max-w-xl text-center text-base leading-relaxed text-slate-500">
          {loading
            ? "Menyiapkan data..."
            : data
              ? "Rata-rata gaji lulusan per program studi (sumber: data tracer study)"
              : "Data dummy — ilustrasi tampilan (backend offline)"}
        </p>

        <div className="mt-12 rounded-2xl bg-white p-6 shadow-soft">
          {loading ? (
            <div className="flex h-[220px] items-end gap-6 rounded-xl bg-slate-50 p-4">
              {[0, 1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="flex-1 animate-pulse rounded-t-lg bg-slate-200"
                  style={{ height: `${35 + ((i * 17) % 45)}%` }}
                />
              ))}
            </div>
          ) : (
            <>
              <div className="mb-4 flex items-center gap-2">
                <TrendingUp aria-hidden className="h-4 w-4 text-blue-600" />
                <p className="text-sm font-medium text-slate-700">Rata-rata gaji per program studi (juta)</p>
              </div>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={data ?? FALLBACK}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="prodi" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Bar dataKey="gaji" fill="#2563eb" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </>
          )}
        </div>
      </div>
    </section>
  );
}
