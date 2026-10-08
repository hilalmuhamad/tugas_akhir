const CareerTable = ({ data }) => {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-5">
        <h3 className="text-lg font-semibold text-slate-900">
          Analisis Karier Alumni
        </h3>

        <p className="mt-1 text-sm text-slate-500">
          Perbandingan indikator karier berdasarkan tahun kelulusan
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-slate-200">
              <th className="px-4 py-3 text-sm font-semibold text-slate-600">
                Tahun
              </th>

              <th className="px-4 py-3 text-sm font-semibold text-slate-600">
                Total Alumni
              </th>

              <th className="px-4 py-3 text-sm font-semibold text-slate-600">
                Bekerja
              </th>

              <th className="px-4 py-3 text-sm font-semibold text-slate-600">
                Rata-rata IPK
              </th>

              <th className="px-4 py-3 text-sm font-semibold text-slate-600">
                Masa Tunggu
              </th>

              <th className="px-4 py-3 text-sm font-semibold text-slate-600">
                Rata-rata Gaji
              </th>
            </tr>
          </thead>

          <tbody>
            {data.map((item) => (
              <tr
                key={item.tahun}
                className="border-b border-slate-100 last:border-0"
              >
                <td className="px-4 py-4 text-sm font-medium text-slate-900">
                  {item.tahun}
                </td>

                <td className="px-4 py-4 text-sm text-slate-600">
                  {item.totalAlumni}
                </td>

                <td className="px-4 py-4 text-sm text-slate-600">
                  {item.alumniBekerja}
                </td>

                <td className="px-4 py-4 text-sm text-slate-600">
                  {item.rataRataIpk}
                </td>

                <td className="px-4 py-4 text-sm text-slate-600">
                  {item.rataRataMasaTunggu}
                </td>

                <td className="px-4 py-4 text-sm text-slate-600">
                  {item.rataRataGaji}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default CareerTable;