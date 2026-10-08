import { useMemo } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const PRODI_COLORS = [
  "#6366f1",
  "#10b981",
  "#f59e0b",
  "#8b5cf6",
  "#ec4899",
  "#14b8a6",
];

const StudyProgramChart = ({ data = [] }) => {
  const { chartData, prodiNames, hasData } = useMemo(() => {
    const rows = Array.isArray(data) ? data : [];

    if (rows.length === 0) {
      return { chartData: [], prodiNames: [], hasData: false };
    }

    const isFlat = rows.some(
      (row) =>
        row &&
        (row.program_studi !== undefined ||
          row.programStudi !== undefined)
    );

    if (!isFlat) {
      const names = [
        ...new Set(
          rows.flatMap((row) =>
            Object.keys(row).filter(
              (key) =>
                key !== "tahun" && key !== "totalLulusan"
            )
          )
        ),
      ];

      return { chartData: rows, prodiNames: names, hasData: true };
    }

    const getProdi = (row) =>
      row.program_studi ?? row.programStudi;

    const getTahun = (row) => row.tahun_lulus ?? row.tahun;

    const getJumlah = (row) =>
      row.jumlah_alumni ?? row.jumlah ?? 0;

    const tahunList = [
      ...new Set(rows.map(getTahun)),
    ].sort();

    const prodiList = [...new Set(rows.map(getProdi))].sort();

    const pivoted = tahunList.map((tahun) => {
      const entry = { tahun };

      for (const prodi of prodiList) {
        entry[prodi] = rows
          .filter(
            (row) =>
              getTahun(row) === tahun && getProdi(row) === prodi
          )
          .reduce(
            (acc, row) => acc + (Number(getJumlah(row)) || 0),
            0
          );
      }

      return entry;
    });

    return {
      chartData: pivoted,
      prodiNames: prodiList,
      hasData: true,
    };
  }, [data]);

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-slate-900">
          Distribusi Program Studi
        </h3>

        <p className="mt-1 text-sm text-slate-500">
          Distribusi alumni berdasarkan kelompok program studi
        </p>
      </div>

      <div className="h-[300px]">
        {hasData ? (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
              />

              <XAxis
                dataKey="tahun"
                axisLine={false}
                tickLine={false}
              />

              <YAxis
                allowDecimals={false}
                axisLine={false}
                tickLine={false}
              />

              <Tooltip />

              <Legend />

              {prodiNames.map((prodi, index) => (
                <Bar
                  key={prodi}
                  dataKey={prodi}
                  name={prodi}
                  stackId="program"
                  fill={PRODI_COLORS[index % PRODI_COLORS.length]}
                />
              ))}
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-slate-400">
            Tidak ada data untuk ditampilkan.
          </div>
        )}
      </div>
    </div>
  );
};

export default StudyProgramChart;