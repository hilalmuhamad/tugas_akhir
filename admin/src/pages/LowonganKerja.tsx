import { useCallback, useEffect, useState } from "react";
import { useSearchParams } from "react-router";
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
import {
  createJob,
  deleteJob,
  fetchJobs,
  LowonganRecord,
  scrapeJobs,
} from "../service/alumniService";

const emptyForm = {
  judul_posisi: "",
  perusahaan: "",
  lokasi: "",
  gajiMin: "",
  gajiMax: "",
  deskripsi: "",
  keahlian: "",
  sumberUrl: "",
};

export default function LowonganKerja() {
  const [data, setData] = useState<LowonganRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [scraping, setScraping] = useState(false);
  const [scrapeResult, setScrapeResult] = useState<string | null>(null);
  const [searchParams, setSearchParams] = useSearchParams();
  const query = (searchParams.get("q") ?? "").trim();

  const filtered = query
    ? data.filter((row) => {
        const teks = [
          row.judul_posisi,
          row.perusahaan,
          row.lokasi ?? "",
          (row.keahlian ?? []).join(" "),
        ]
          .join(" ")
          .toLowerCase();
        return teks.includes(query.toLowerCase());
      })
    : data;

  const clearQuery = () => setSearchParams({});

  const load = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      setData(await fetchJobs());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal memuat data lowongan");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const handleAdd = async () => {
    if (!form.judul_posisi.trim() || !form.perusahaan.trim()) return;
    setSaving(true);
    setError(null);
    try {
      await createJob({
        judul_posisi: form.judul_posisi.trim(),
        perusahaan: form.perusahaan.trim(),
        lokasi: form.lokasi.trim() || undefined,
        gaji_min: Number(form.gajiMin) || undefined,
        gaji_max: Number(form.gajiMax) || undefined,
        deskripsi: form.deskripsi.trim() || undefined,
        keahlian: form.keahlian
          .split(",")
          .map((k) => k.trim())
          .filter(Boolean),
        sumber_url: form.sumberUrl.trim() || undefined,
      });
      setForm(emptyForm);
      setShowForm(false);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal menyimpan lowongan");
    } finally {
      setSaving(false);
    }
  };

  const handleScrape = async () => {
    if (!window.confirm("Jalankan scraping lowongan dari 4 sumber (Loker, Remotive, Jobicy, Adzuna)?")) return;
    setScraping(true);
    setError(null);
    setScrapeResult(null);
    try {
      const r = await scrapeJobs(5);
      setScrapeResult(`Scraping selesai: ${r.diambil} diambil, ${r.tersimpan} baru, ${r.diperbarui} diperbarui. Total DB: ${r.total_database}`);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal scraping");
    } finally {
      setScraping(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("Hapus lowongan ini?")) return;
    setError(null);
    try {
      await deleteJob(id);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal menghapus lowongan");
    }
  };

  return (
    <>
      <PageMeta
        title="Lowongan Kerja | Admin Tracer Study"
        description="Manajemen data lowongan kerja untuk pencocokan TF-IDF"
      />
      <PageBreadcrumb pageTitle="Lowongan Kerja" />

      <div className="space-y-6">
        <ComponentCard title="Data Lowongan Kerja">
          <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Dataset ini menjadi korpus pencocokan kesesuaian bidang (TF-IDF + Cosine). Tersimpan di database —{" "}
              {isLoading ? "memuat..." : `${data.length} lowongan`}.
            </p>
            <div className="flex gap-2">
              <button
                onClick={handleScrape}
                disabled={scraping}
                className="shrink-0 rounded-lg border border-brand-200 bg-white px-4 py-2 text-sm font-medium text-brand-600 hover:bg-brand-50 disabled:opacity-50 dark:border-brand-500/30 dark:bg-brand-500/10 dark:text-brand-400"
              >
                {scraping ? "Scraping..." : "↻ Scraping (4 sumber)"}
              </button>
              <button
                onClick={() => setShowForm((v) => !v)}
                className="shrink-0 rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white hover:bg-brand-600"
              >
                {showForm ? "Batal" : "+ Tambah Lowongan"}
              </button>
            </div>
          </div>
          {scrapeResult && <p className="mb-4 rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400">{scrapeResult}</p>}

          {query && (
            <div className="mb-4 flex items-center justify-between rounded-lg border border-brand-100 bg-brand-50 px-4 py-2.5 text-sm text-brand-700 dark:border-brand-500/30 dark:bg-brand-500/10 dark:text-brand-400">
              <span>
                Hasil pencarian untuk <strong>"{query}"</strong> — {filtered.length} dari{" "}
                {data.length} lowongan
              </span>
              <button
                onClick={clearQuery}
                className="rounded-md px-2 py-1 text-xs font-semibold text-brand-600 hover:bg-brand-100 dark:text-brand-400 dark:hover:bg-white/10"
              >
                ✕ Bersihkan
              </button>
            </div>
          )}

          {error && (
            <p className="mb-4 rounded-lg border border-error-200 bg-error-50 px-4 py-3 text-sm text-error-600 dark:border-error-500/30 dark:bg-error-500/10 dark:text-error-400">
              {error}
            </p>
          )}

          {showForm && (
            <div className="mb-6 grid gap-3 rounded-xl border border-gray-200 p-4 dark:border-gray-800 sm:grid-cols-2">
              <input
                placeholder="Judul posisi *"
                value={form.judul_posisi}
                onChange={(e) => setForm({ ...form, judul_posisi: e.target.value })}
                className="rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-900 dark:text-white"
              />
              <input
                placeholder="Perusahaan *"
                value={form.perusahaan}
                onChange={(e) => setForm({ ...form, perusahaan: e.target.value })}
                className="rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-900 dark:text-white"
              />
              <input
                placeholder="Lokasi"
                value={form.lokasi}
                onChange={(e) => setForm({ ...form, lokasi: e.target.value })}
                className="rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-900 dark:text-white"
              />
              <div className="flex gap-2">
                <input
                  placeholder="Gaji min (jt)"
                  type="number"
                  value={form.gajiMin}
                  onChange={(e) => setForm({ ...form, gajiMin: e.target.value })}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                />
                <input
                  placeholder="Gaji max (jt)"
                  type="number"
                  value={form.gajiMax}
                  onChange={(e) => setForm({ ...form, gajiMax: e.target.value })}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                />
              </div>
              <input
                placeholder="Keahlian (pisahkan koma)"
                value={form.keahlian}
                onChange={(e) => setForm({ ...form, keahlian: e.target.value })}
                className="rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-900 dark:text-white sm:col-span-2"
              />
              <input
                placeholder="Link sumber / lowongan asli (opsional, mis. URL Jobstreet)"
                value={form.sumberUrl}
                onChange={(e) => setForm({ ...form, sumberUrl: e.target.value })}
                className="rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-900 dark:text-white sm:col-span-2"
              />
              <textarea
                placeholder="Deskripsi"
                value={form.deskripsi}
                onChange={(e) => setForm({ ...form, deskripsi: e.target.value })}
                rows={3}
                className="rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-900 dark:text-white sm:col-span-2"
              />
              <button
                onClick={handleAdd}
                disabled={saving}
                className="rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white hover:bg-brand-600 disabled:opacity-60 sm:col-span-2"
              >
                {saving ? "Menyimpan..." : "Simpan"}
              </button>
            </div>
          )}

          <div className="overflow-hidden rounded-xl border border-gray-200 dark:border-white/[0.05]">
            <div className="max-w-full overflow-x-auto">
              <Table>
                <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
                  <TableRow>
                    {["No", "Judul Posisi", "Perusahaan", "Lokasi", "Gaji", "Keahlian", "Aksi"].map((h) => (
                      <TableCell
                        key={h}
                        isHeader
                        className="px-4 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400 whitespace-nowrap"
                      >
                        {h}
                      </TableCell>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                  {isLoading ? (
                    <TableRow>
                      <TableCell colSpan={7} className="px-4 py-6 text-center text-sm text-gray-400">
                        Memuat data lowongan...
                      </TableCell>
                    </TableRow>
                  ) : data.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="px-4 py-6 text-center text-sm text-gray-400">
                        Belum ada lowongan. Tambahkan melalui tombol di atas.
                      </TableCell>
                    </TableRow>
                  ) : filtered.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="px-4 py-6 text-center text-sm text-gray-400">
                        Tidak ada lowongan yang cocok dengan "{query}".
                      </TableCell>
                    </TableRow>
                  ) : (
                    filtered.map((row, index) => (
                      <TableRow key={row.id}>
                        <TableCell className="px-4 py-3 text-gray-700 text-start text-theme-sm dark:text-gray-300">
                          {index + 1}
                        </TableCell>
                        <TableCell className="px-4 py-3 text-gray-700 text-start text-theme-sm dark:text-gray-300 whitespace-nowrap">
                          {row.judul_posisi}
                        </TableCell>
                        <TableCell className="px-4 py-3 text-gray-700 text-start text-theme-sm dark:text-gray-300 whitespace-nowrap">
                          {row.perusahaan}
                        </TableCell>
                        <TableCell className="px-4 py-3 text-gray-700 text-start text-theme-sm dark:text-gray-300">
                          {row.lokasi ?? "-"}
                        </TableCell>
                        <TableCell className="px-4 py-3 text-gray-700 text-start text-theme-sm dark:text-gray-300 whitespace-nowrap">
                          {row.gaji_min != null || row.gaji_max != null
                            ? `Rp${row.gaji_min ?? 0}–${row.gaji_max ?? "?"} jt`
                            : "-"}
                        </TableCell>
                        <TableCell className="px-4 py-3 text-gray-700 text-start text-theme-sm dark:text-gray-300">
                          <div className="flex flex-wrap gap-1">
                            {(row.keahlian ?? []).slice(0, 4).map((k) => (
                              <span
                                key={k}
                                className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-600 dark:bg-white/5 dark:text-gray-300"
                              >
                                {k}
                              </span>
                            ))}
                            {(row.keahlian ?? []).length > 4 && (
                              <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-400 dark:bg-white/5 dark:text-gray-500">
                                +{(row.keahlian ?? []).length - 4}
                              </span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="px-4 py-3 text-start">
                          <button
                            onClick={() => handleDelete(row.id)}
                            className="text-sm font-medium text-red-500 hover:text-red-600"
                          >
                            Hapus
                          </button>
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
