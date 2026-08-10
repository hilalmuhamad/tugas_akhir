/**
 * Utilitas pembuatan laporan IKU tracer study alumni:
 * - rekap per program studi (total, % bekerja, gaji, masa tunggu)
 * - unduhan CSV via endpoint backend (handled langsung oleh browser,
 *   lebih andal daripada klik sintetis di halaman)
 */

import api from '../../../services/api';
import { prodiLabel } from '../../../utils/prodiLabel';

export function laporanUnduhUrl() {
  const token = localStorage.getItem('token') || '';
  return `${api.defaults.baseURL}/laporan/unduh?token=${encodeURIComponent(token)}`;
}

export function rekapPerProdi(alumni) {
  const map = new Map();
  for (const r of alumni) {
    const key = r.programStudi || 'Umum';
    const g = map.get(key) ?? { prodi: prodiLabel(key), total: 0, bekerja: 0, gaji: [], tunggu: [] };
    g.total += 1;
    if (r.statusBekerja === 'Bekerja' || r.statusBekerja === 'Wirausaha') g.bekerja += 1;
    if (r.gajiJuta != null) g.gaji.push(r.gajiJuta);
    if (r.masaTungguBulan != null) g.tunggu.push(r.masaTungguBulan);
    map.set(key, g);
  }
  return [...map.values()]
    .map((g) => ({
      prodi: g.prodi,
      total: g.total,
      persenBekerja: Math.round((g.bekerja / g.total) * 1000) / 10,
      gajiRata: g.gaji.length
        ? Math.round((g.gaji.reduce((a, b) => a + b, 0) / g.gaji.length) * 10) / 10
        : null,
      masaTunggu: g.tunggu.length
        ? Math.round((g.tunggu.reduce((a, b) => a + b, 0) / g.tunggu.length) * 10) / 10
        : null,
    }))
    .sort((a, b) => b.total - a.total);
}

export function buildLaporanCsv(stats, alumni) {
  const perProdi = rekapPerProdi(alumni || []);
  const tanggal = new Date().toLocaleDateString('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
  const jam = new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });

  const rows = [
    ['Laporan IKU Tracer Study Alumni'],
    ['Dibuat pada', `${tanggal}, ${jam}`],
    [''],
    ['Indikator', 'Nilai'],
    ['Total alumni', stats?.total_alumni ?? 0],
    ['Alumni bekerja (%)', `${stats?.persentase_kerja ?? 0}%`],
    ['Masa tunggu rata-rata (bulan)', stats?.masa_tunggu_rata ?? '-'],
    ['Gaji rata-rata (Rp juta/bulan)', stats?.gaji_rata_rata ?? '-'],
    ['Jumlah program studi', stats?.jumlah_prodi ?? 0],
    ['Total lowongan aktif', stats?.total_lowongan ?? 0],
    [''],
    ['Program Studi', 'Total Alumni', 'Bekerja (%)', 'Gaji Rata-rata (jt)', 'Masa Tunggu (bln)'],
    ...perProdi.map((p) => [p.prodi, p.total, `${p.persenBekerja}%`, p.gajiRata ?? '-', p.masaTunggu ?? '-']),
  ];

  return rows
    .map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(','))
    .join('\r\n');
}

export function unduhLaporanCsv(stats, alumni) {
  const csv = buildLaporanCsv(stats, alumni);
  const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `laporan-iku-tracer-study-${new Date().toISOString().slice(0, 10)}.csv`;
  a.style.display = 'none';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
