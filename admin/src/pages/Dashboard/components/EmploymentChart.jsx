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

const EmploymentChart = ({ data }) => {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-slate-900">
          Status Pekerjaan
        </h3>

        <p className="mt-1 text-sm text-slate-500">
          Perbandingan alumni bekerja dan tidak bekerja
        </p>
      </div>

      <div className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
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

            <Bar
              dataKey="bekerja"
              name="Bekerja"
              stackId="employment"
              radius={[8, 8, 0, 0]}
            />

            <Bar
              dataKey="tidakBekerja"
              name="Tidak Bekerja"
              stackId="employment"
              radius={[8, 8, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default EmploymentChart;