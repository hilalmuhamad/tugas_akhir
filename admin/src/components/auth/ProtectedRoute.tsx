import { Navigate, Outlet, useLocation } from "react-router";

/**
 * Asumsi (tolong konfirmasi setelah share alumniService.ts):
 * - Token disimpan di localStorage dengan key "auth_token" setelah login sukses.
 * - Belum ada pengecekan validitas/expiry token ke backend di sini — ini cuma
 *   cek "ada token atau tidak" di client. Kalau token sudah expired di server
 *   tapi masih ada di localStorage, user akan tetap lolos ke dashboard dan baru
 *   ke-detect invalid saat request API pertama gagal 401 (yang katanya sudah
 *   di-handle auto-clear token di alumniService.ts). Cukup untuk sekarang,
 *   tapi kalau mau lebih ketat bisa ditambah validasi token ke endpoint
 *   /api/user atau semacamnya saat mount.
 *
 * Dipakai sebagai parent route yang membungkus <AppLayout />, jadi semua
 * route anak (dashboard, tables, charts, dst.) otomatis ikut terproteksi.
 */
export default function ProtectedRoute() {
  const location = useLocation();
  const token = localStorage.getItem("auth_token");

  if (!token) {
    // simpan halaman tujuan asal, supaya SignIn bisa redirect balik ke situ
    // setelah login sukses (opsional, lihat catatan di SignInForm)
    return <Navigate to="/signin" state={{ from: location }} replace />;
  }

  return <Outlet />;
}