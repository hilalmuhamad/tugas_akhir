import { useSearchParams } from "react-router";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import ComponentCard from "../../components/common/ComponentCard";
import PageMeta from "../../components/common/PageMeta";
import BasicTableOne from "../../components/tables/BasicTables/BasicTableOne";

export default function BasicTables() {
  const [searchParams] = useSearchParams();
  const query = (searchParams.get("q") ?? "").trim();

  return (
    <>
      <PageMeta
        title="Data Alumni | Sistem Tracer Study"
        description="Data alumni tracer study - Sistem Tracer Study"
      />
      <PageBreadcrumb pageTitle="Data Alumni" />
      <div className="space-y-6">
        {query && (
          <div className="flex items-center justify-between rounded-2xl border border-blue-200 bg-blue-50 px-4 py-3 dark:border-blue-500/20 dark:bg-blue-500/10">
            <p className="text-sm text-blue-800 dark:text-blue-300">
              Menampilkan hasil pencarian untuk{" "}
              <strong>"{query}"</strong>
            </p>
            <a
              href="/basic-tables"
              className="text-sm font-semibold text-blue-700 hover:underline dark:text-blue-400"
            >
              Hapus filter
            </a>
          </div>
        )}
        <ComponentCard title="Data Alumni">
          <BasicTableOne />
        </ComponentCard>
      </div>
    </>
  );
}
