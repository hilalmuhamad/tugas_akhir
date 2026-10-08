import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../../ui/table";

import Badge from "../../ui/badge/Badge";
import { getOlapDetail } from "../../../api/olap";
import type {
  KategoriKeselarasan,
  OlapDetailRow,
  StatusBekerja,
} from "../../../api/olap";

/**
 * Halaman Data Alumni (tabel detail/drilldown).
 *
 * Sumber: GET /api/olap/detail -> v_olap_detail, yaitu seluruh
 * histori alumni tanpa filter tahun survei. Jumlah barisnya
 * mengikuti isi tabel fakta, tidak ditulis di komentar ini
 * supaya tidak pernah usang.
 *
 * Aturan:
 * - program_studi / specialisasi ditampilkan persis dari
 *   PostgreSQL (Comm&Mgmt, Others, Sci&Tech, Mkt&Fin, ...).
 *   TIDAK ada mapping nama formal jurusan di frontend.
 * - Tidak ada agregasi bisnis (COUNT/AVG/persentase) di sini.
 * - Keselarasan kosong ("-") berarti alumni tidak bekerja atau
 *   tidak menjawab, BUKAN berarti "Tidak Selaras".
 */

const headers = [
  "ID",
  "Nama",
  "Gender",
  "Jenjang",
  "Tahun Masuk",
  "Program Studi",
  "Spesialisasi",
  "Pengalaman Kerja",
  "Tahun Lulus",
  "IPK",
  "Status",
  "Masa Tunggu",
  "Gaji",
  "Keselarasan Horizontal",
  "Keselarasan Vertikal",
];

/**
 * Warna badge status (UI saja).
 *
 * dim_status_kerja hanya berisi dua baris sejak revisi
 * pascasidang, jadi peta ini pun hanya dua entri.
 */
const STATUS_BADGE_COLOR: Record<StatusBekerja, "success" | "warning"> = {
  Bekerja: "success",
  "Tidak Bekerja": "warning",
};

/** Warna badge dua kategori keselarasan (UI saja). */
const KESELARASAN_BADGE_COLOR: Record<
  KategoriKeselarasan,
  "success" | "error"
> = {
  Selaras: "success",
  "Tidak Selaras": "error",
};

export default function BasicTableOne() {
  const [tableData, setTableData] = useState<OlapDetailRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchParams] = useSearchParams();
  const query = (searchParams.get("q") ?? "").trim().toLowerCase();
  const [tahunFilter, setTahunFilter] = useState<number | "all">("all");

  useEffect(() => {
    getOlapDetail()
      .then((data: OlapDetailRow[]) => setTableData(data))
      .catch((err: Error) =>
        setError(err.message ?? "Gagal memuat data alumni")
      )
      .finally(() => setIsLoading(false));
  }, []);

  const tahunOptions = useMemo(
    () =>
      [...new Set(tableData.map((row) => row.tahun_lulus))].sort(
        (a, b) => a - b
      ),
    [tableData]
  );

  const filtered = useMemo(() => {
    return tableData.filter((row) => {
      const cocokTahun =
        tahunFilter === "all" || row.tahun_lulus === tahunFilter;

      if (!cocokTahun) {
        return false;
      }

      if (!query) {
        return true;
      }

      return [
        row.nama,
        row.gender,
        row.jenjang,
        String(row.tahun_masuk ?? ""),
        row.program_studi,
        row.specialisasi ?? "",
        row.pengalaman_kerja ?? "",
        String(row.tahun_lulus),
        row.status_bekerja,
      ]
        .join(" ")
        .toLowerCase()
        .includes(query);
    });
  }, [tableData, query, tahunFilter]);

  if (isLoading) {
    return (
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white p-6 text-center text-gray-500 dark:border-white/[0.05] dark:bg-white/[0.03] dark:text-gray-400">
        Memuat data alumni...
      </div>
    );
  }

  if (error) {
    return (
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white p-6 text-center text-error-500 dark:border-white/[0.05] dark:bg-white/[0.03]">
        {error}
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-100 px-5 py-4 dark:border-white/[0.05]">
        <p className="text-sm text-gray-500 dark:text-gray-400">
          {filtered.length} alumni ditampilkan
        </p>

        <label className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
          <span className="shrink-0">Tahun Lulus</span>

          <select
            value={tahunFilter}
            onChange={(event) =>
              setTahunFilter(
                event.target.value === "all"
                  ? "all"
                  : Number(event.target.value)
              )
            }
            className="h-9 rounded-lg border border-gray-200 bg-white px-2.5 text-sm text-gray-800 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-800 dark:bg-gray-900 dark:text-white/90 dark:focus:border-brand-800"
          >
            <option value="all">Semua Tahun</option>

            {tahunOptions.map((tahun) => (
              <option key={tahun} value={tahun}>
                {tahun}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="max-w-full overflow-x-auto">
        <Table>
          {/* Table Header */}
          <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
            <TableRow>
              {headers.map((h) => (
                <TableCell
                  key={h}
                  isHeader
                  className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400 whitespace-nowrap"
                >
                  {h}
                </TableCell>
              ))}
            </TableRow>
          </TableHeader>

          {/* Table Body */}
          <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={headers.length}
                  className="px-5 py-8 text-center text-sm text-gray-500 dark:text-gray-400"
                >
                  {query
                    ? `Tidak ada alumni yang cocok dengan "${searchParams.get("q")}"`
                    : "Tidak ada data alumni"}
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((alumni, index) => (
              <TableRow key={alumni.id_sumber}>
                <TableCell className="px-5 py-4 sm:px-6 text-start text-gray-700 dark:text-gray-300">
                  {index + 1}
                </TableCell>
                <TableCell className="px-4 py-3 text-gray-700 text-start text-theme-sm dark:text-gray-300 whitespace-nowrap">
                  {alumni.nama}
                </TableCell>
                <TableCell className="px-4 py-3 text-gray-700 text-start text-theme-sm dark:text-gray-300">
                  {alumni.gender}
                </TableCell>
                <TableCell className="px-4 py-3 text-gray-700 text-start text-theme-sm dark:text-gray-300 whitespace-nowrap">
                  <Badge size="sm" color={alumni.jenjang === "D3" ? "info" : "success"}>
                    {alumni.jenjang}
                  </Badge>
                </TableCell>
                <TableCell className="px-4 py-3 text-gray-700 text-start text-theme-sm dark:text-gray-300 whitespace-nowrap">
                  {alumni.tahun_masuk ?? "-"}
                </TableCell>
                <TableCell className="px-4 py-3 text-gray-700 text-start text-theme-sm dark:text-gray-300 whitespace-nowrap">
                  {alumni.program_studi ?? "-"}
                </TableCell>
                <TableCell className="px-4 py-3 text-gray-700 text-start text-theme-sm dark:text-gray-300 whitespace-nowrap">
                  {alumni.specialisasi ?? "-"}
                </TableCell>
                <TableCell className="px-4 py-3 text-gray-700 text-start text-theme-sm dark:text-gray-300">
                  {alumni.pengalaman_kerja ?? "-"}
                </TableCell>
                <TableCell className="px-4 py-3 text-gray-700 text-start text-theme-sm dark:text-gray-300">
                  {alumni.tahun_lulus}
                </TableCell>
                <TableCell className="px-4 py-3 text-gray-700 text-start text-theme-sm dark:text-gray-300">
                  {alumni.ipk !== null ? alumni.ipk.toFixed(2) : "-"}
                </TableCell>
                <TableCell className="px-4 py-3 text-gray-700 text-start text-theme-sm dark:text-gray-300 whitespace-nowrap">
                  <Badge size="sm" color={STATUS_BADGE_COLOR[alumni.status_bekerja] ?? "warning"}>
                    {alumni.status_bekerja}
                  </Badge>
                </TableCell>
                <TableCell className="px-4 py-3 text-gray-700 text-start text-theme-sm dark:text-gray-300 whitespace-nowrap">
                  {alumni.masa_tunggu_bulan === null ? "-" : `${alumni.masa_tunggu_bulan} bulan`}
                </TableCell>
                <TableCell className="px-4 py-3 text-gray-700 text-theme-sm dark:text-gray-300 whitespace-nowrap">
                  {alumni.gaji_juta === null ? "-" : `Rp ${alumni.gaji_juta.toFixed(1)} jt`}
                </TableCell>
                <TableCell className="px-4 py-3 text-gray-700 text-start text-theme-sm dark:text-gray-300 whitespace-nowrap">
                  {!alumni.kategori_horizontal ? (
                    "-"
                  ) : (
                    <Badge
                      size="sm"
                      color={
                        KESELARASAN_BADGE_COLOR[alumni.kategori_horizontal]
                      }
                    >
                      {alumni.kategori_horizontal}
                    </Badge>
                  )}
                </TableCell>
                <TableCell className="px-4 py-3 text-gray-700 text-start text-theme-sm dark:text-gray-300 whitespace-nowrap">
                  {!alumni.kategori_vertikal ? (
                    "-"
                  ) : (
                    <Badge
                      size="sm"
                      color={
                        KESELARASAN_BADGE_COLOR[alumni.kategori_vertikal]
                      }
                    >
                      {alumni.kategori_vertikal}
                    </Badge>
                  )}
                </TableCell>
              </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}