import { BrowserRouter as Router, Routes, Route } from "react-router";
import SignIn from "./pages/AuthPages/SignIn";
import NotFound from "./pages/OtherPage/NotFound";
import BasicTables from "./pages/Tables/BasicTables";
import AppLayout from "./layout/AppLayout";
import { ScrollToTop } from "./components/common/ScrollToTop";
import Home from "./pages/Dashboard/Home";
import EvaluasiResponden from "./pages/EvaluasiResponden";
import LowonganKerja from "./pages/LowonganKerja";
import Laporan from "./pages/Laporan";
import LogPencarian from "./pages/LogPencarian";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import AdminRoute from "./components/auth/AdminRoute";
import CreateUser from "./pages/Users/CreateUser";
import UserProfiles from "./pages/UserProfiles";

export default function App() {
  return (
    <>
      <Router>
        <ScrollToTop />
        <Routes>
          {/* Semua route dashboard OLAP dibungkus ProtectedRoute:
              belum login -> otomatis dilempar ke /signin */}
          <Route element={<ProtectedRoute />}>
            <Route element={<AppLayout />}>
              <Route index path="/" element={<Home />} />

              {/* Data */}
              <Route path="/basic-tables" element={<BasicTables />} />
              <Route path="/evaluasi-responden" element={<EvaluasiResponden />} />
              <Route path="/lowongan-kerja" element={<LowonganKerja />} />
              <Route path="/laporan" element={<Laporan />} />
              <Route path="/log-pencarian" element={<LogPencarian />} />
              <Route path="/profile" element={<UserProfiles />} />

              {/* Admin only */}
              <Route element={<AdminRoute />}>
                <Route path="/users/create" element={<CreateUser />} />
              </Route>
            </Route>
          </Route>

          {/* Auth Layout - tidak diproteksi, harus bisa diakses tanpa login.
              /signup dihapus dari sini karena pembuatan akun sekarang
              hanya boleh dilakukan admin dari dalam dashboard
              (lihat /users/create di atas). */}
          <Route path="/signin" element={<SignIn />} />

          {/* Fallback Route */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Router>
    </>
  );
}
