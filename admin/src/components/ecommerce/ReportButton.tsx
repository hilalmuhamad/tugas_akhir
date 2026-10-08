const API_BASE_URL = "http://127.0.0.1:8000/api";

function downloadFile(path: string, filename: string) {
  const token = localStorage.getItem("auth_token") || "";
  const url = `${API_BASE_URL}${path}?token=${encodeURIComponent(token)}`;

  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.style.display = "none";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

export default function ReportButton() {
  const tanggal = new Date().toISOString().slice(0, 10);

  return (
    <div className="flex flex-wrap gap-2">
      <button
        type="button"
        className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
        onClick={() =>
          downloadFile("/laporan/unduh-pdf", `laporan-tracer-study-${tanggal}.pdf`)
        }
      >
        Unduh Laporan PDF
      </button>
      <button
        type="button"
        className="rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-700 shadow-sm transition hover:bg-gray-50 dark:border-gray-800 dark:bg-white/[0.03] dark:text-gray-300 dark:hover:bg-white/[0.06]"
        onClick={() =>
          downloadFile("/laporan/unduh", `laporan-iku-tracer-study-${tanggal}.csv`)
        }
      >
        Generate Laporan IKU (CSV)
      </button>
    </div>
  );
}