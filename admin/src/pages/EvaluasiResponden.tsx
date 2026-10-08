import PageMeta from "../components/common/PageMeta";
import RespondenEvaluasiPanel from "../components/ecommerce/RespondenEvaluasiPanel";

export default function EvaluasiResponden() {
  return (
    <>
      <PageMeta
        title="Evaluasi Cakupan Alumni per Program Studi | Admin"
        description="Jumlah alumni yang tersedia dalam dataset OLAP untuk evaluasi cakupan per program studi"
      />

      <div className="space-y-6">
        <div className="flex flex-col gap-3 rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:flex-row md:items-center md:justify-between md:p-6">
          <div>
            <h2 className="text-xl font-semibold text-gray-800 dark:text-white/90">
              Evaluasi Cakupan Alumni per Program Studi
            </h2>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Membandingkan jumlah alumni yang tersedia dalam dataset terhadap data alumni
              yang telah berhasil dihimpun sebagai indikator awal evaluasi penelusuran alumni.
            </p>
          </div>
        </div>

        <RespondenEvaluasiPanel />
      </div>
    </>
  );
}