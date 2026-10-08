import { Navigate, Outlet } from "react-router";

/**
 * ASUMSI YANG PERLU DIKONFIRMASI:
 * Data user hasil login disimpan di localStorage("auth_user") sebagai JSON
 * string berisi { id, name, role }, mengikuti struktur response
 * AuthController@login. Kalau alumniService.ts kamu menyimpan dengan key
 * lain (atau belum menyimpan sama sekali, cuma token), tambahkan baris ini
 * di dalam fungsi login() setelah fetch sukses:
 *
 *   localStorage.setItem("auth_user", JSON.stringify(data.user));
 *
 * Dipasang SETELAH <ProtectedRoute /> di routing, jadi saat komponen ini
 * jalan, token dijamin sudah ada (sudah lolos cek login). Kalau role bukan
 * "admin", user ditendang ke dashboard utama ("/") — bukan ke /signin,
 * karena dia sebetulnya sudah login sah, cuma tidak punya akses ke halaman
 * ini.
 */
export default function AdminRoute() {
  const rawUser = localStorage.getItem("auth_user");
  const user = rawUser ? JSON.parse(rawUser) : null;

  if (!user || user.role !== "admin") {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}