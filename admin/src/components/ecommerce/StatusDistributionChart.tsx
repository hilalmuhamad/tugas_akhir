import { useEffect, useState } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";

interface StatusData {
  status_key: number;
  status_bekerja: string;
  jumlah_alumni: number;
}

const COLORS = [
  "#465FFF",
  "#8098FF",
  "#12B76A",
  "#F79009",
  "#F04438",
  "#7A5AF8",
];

export default function StatusDistributionChart() {
  const [data, setData] = useState<StatusData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStatusKerja = async () => {
      try {
        setLoading(true);

        const response = await fetch(
          "http://127.0.0.1:8000/api/olap/status-kerja"
        );

        if (!response.ok) {
          throw new Error("Gagal mengambil data status pekerjaan");
        }

        const result = await response.json();

        if (!result.success) {
          throw new Error("API mengembalikan status gagal");
        }

        setData(result.data);
      } catch (err) {
        console.error("Error mengambil data status kerja:", err);

        setError("Data status pekerjaan gagal dimuat.");
      } finally {
        setLoading(false);
      }
    };

    fetchStatusKerja();
  }, []);

  const total = data.reduce(
    (sum, item) => sum + Number(item.jumlah_alumni),
    0
  );

  if (loading) {
    return (
      <div className="flex h-[450px] items-center justify-center">
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Memuat data status pekerjaan...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-[450px] items-center justify-center">
        <p className="text-sm text-red-500">{error}</p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03]">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
          Distribusi Status Pekerjaan
        </h3>

        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Proporsi alumni berdasarkan status pekerjaan saat ini
        </p>
      </div>

      <div className="relative h-[320px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              dataKey="jumlah_alumni"
              nameKey="status_bekerja"
              cx="50%"
              cy="50%"
              innerRadius={75}
              outerRadius={110}
              paddingAngle={2}
              strokeWidth={2}
              stroke="#ffffff"
            >
              {data.map((entry, index) => (
                <Cell
                  key={`cell-${entry.status_key}`}
                  fill={COLORS[index % COLORS.length]}
                />
              ))}
            </Pie>

            <Tooltip
              formatter={(value) => [
                `${value} alumni`,
                "Jumlah",
              ]}
            />
          </PieChart>
        </ResponsiveContainer>

        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-bold text-gray-800 dark:text-white">
            {total}
          </span>

          <span className="text-sm text-gray-500 dark:text-gray-400">
            Alumni
          </span>
        </div>
      </div>

      <div className="mt-4 flex flex-col gap-3">
        {data.map((item, index) => {
          const jumlah = Number(item.jumlah_alumni);

          const persentase =
            total > 0 ? ((jumlah / total) * 100).toFixed(2) : "0.00";

          return (
            <div
              key={item.status_key}
              className="flex items-center justify-between gap-3"
            >
              <div className="flex min-w-0 items-center gap-3">
                <span
                  className="h-3 w-3 shrink-0 rounded-full"
                  style={{
                    backgroundColor: COLORS[index % COLORS.length],
                  }}
                />

                <span className="truncate text-sm text-gray-600 dark:text-gray-300">
                  {item.status_bekerja}
                </span>
              </div>

              <div className="flex shrink-0 items-center gap-2">
                <span className="text-sm font-semibold text-gray-800 dark:text-white">
                  {jumlah}
                </span>

                <span className="text-xs text-gray-400">
                  ({persentase}%)
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}