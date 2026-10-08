import { useEffect, useState } from "react";
import PageBreadcrumb from "../components/common/PageBreadCrumb";
import ComponentCard from "../components/common/ComponentCard";
import PageMeta from "../components/common/PageMeta";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../components/ui/table";
import Badge from "../components/ui/badge/Badge";
import { getToken } from "../service/alumniService";

interface SearchLogRow {
  id: number;
  user: string;
  query: string;
  jumlah_hasil: number;
  kategori_deteksi: string;
  created_at: string;
}

const API_BASE_URL = "http://127.0.0.1:8000/api";

export default function LogPencarian() {
  const [rows, setRows] = useState<SearchLogRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const token = getToken();
    fetch(`${API_BASE_URL}/search-logs`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then(setRows)
      .catch((err) => setError(err.message ?? "Gagal memuat log pencarian"))
      .finally(() => setIsLoading(false));
  }, []);

  return (
    <>
      <PageMeta
        title="Log Pencarian | Admin Tracer Study"
        description="Log pencarian kerja alumni (TF-IDF + Cosine Similarity)"
      />
      <PageBreadcrumb pageTitle="Log Pencarian" />

      <div className="space-y-6">
        <ComponentCard title="Log Pencarian Alumni">
          <p className="mb-4 text-sm text-gray-500 dark:text-gray-400">
            Riwayat pencarian kerja bahasa alami alumni — setiap query diproses
            dengan metode TF-IDF + Cosine Similarity dan dicatat untuk evaluasi
            relevansi hasil.
          </p>

          {error && (
            <p className="mb-4 rounded-lg border border-error-200 bg-error-50 px-4 py-3 text-sm text-error-600 dark:border-error-500/30 dark:bg-error-500/10 dark:text-error-400">
              {error}
            </p>
          )}

          <div className="overflow-hidden rounded-xl border border-gray-200 dark:border-white/[0.05]">
            <div className="max-w-full overflow-x-auto">
              <Table>
                <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
                  <TableRow>
                    {["ID", "Alumni", "Waktu", "Kata Kunci Pencarian", "Kategori", "Jumlah Hasil"].map(
                      (h) => (
                        <TableCell
                          key={h}
                          isHeader
                          className="px-4 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400 whitespace-nowrap"
                        >
                          {h}
                        </TableCell>
                      )
                    )}
                  </TableRow>
                </TableHeader>
                <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                  {isLoading ? (
                    <TableRow>
                      <TableCell colSpan={6} className="px-4 py-6 text-center text-sm text-gray-400">
                        Memuat log pencarian...
                      </TableCell>
                    </TableRow>
                  ) : rows.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="px-4 py-6 text-center text-sm text-gray-400">
                        Belum ada pencarian. Coba lakukan pencarian dari halaman alumni.
                      </TableCell>
                    </TableRow>
                  ) : (
                    rows.map((row) => (
                      <TableRow key={row.id}>
                        <TableCell className="px-4 py-3 text-gray-700 text-start text-theme-sm dark:text-gray-300">
                          {row.id}
                        </TableCell>
                        <TableCell className="px-4 py-3 text-gray-700 text-start text-theme-sm dark:text-gray-300 whitespace-nowrap">
                          {row.user}
                        </TableCell>
                        <TableCell className="px-4 py-3 text-gray-700 text-start text-theme-sm dark:text-gray-300 whitespace-nowrap">
                          {row.created_at}
                        </TableCell>
                        <TableCell className="px-4 py-3 text-gray-700 text-start text-theme-sm dark:text-gray-300">
                          {row.query}
                        </TableCell>
                        <TableCell className="px-4 py-3 text-start">
                          <Badge size="sm" color="info">
                            {row.kategori_deteksi}
                          </Badge>
                        </TableCell>
                        <TableCell className="px-4 py-3 text-start">
                          <Badge size="sm" color={row.jumlah_hasil > 0 ? "success" : "error"}>
                            {row.jumlah_hasil} hasil
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        </ComponentCard>
      </div>
    </>
  );
}
