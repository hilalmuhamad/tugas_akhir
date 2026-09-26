import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { useEffect, useRef, useState } from 'react';
import ProtectedRoute from './components/ProtectedRoute';
import LandingPage from './features/landing/pages/LandingPage.jsx';
import LoginPage from './features/auth/pages/LoginPage.jsx';
import RegisterPage from './features/auth/pages/RegisterPage.jsx';
import AnalyzePage from './features/career/pages/AnalyzePage.jsx';
import ChatPage from './features/career/pages/ChatPage.jsx';
import JobSearchPage from './features/jobs/pages/JobSearchPage.jsx';
import JobDetailPage from './features/jobs/pages/JobDetailPage.jsx';
import DashboardPage from './features/dashboard/pages/DashboardPage.jsx';
import KuisionerPage from './features/dashboard/pages/KuisionerPage.jsx';
import KuisionerSuccessPage from './features/dashboard/pages/KuisionerSuccessPage.jsx';
import LaporanPage from './features/dashboard/pages/LaporanPage.jsx';
import ProfilePage from './features/dashboard/pages/ProfilePage.jsx';

/**
 * Bungkus halaman dengan animasi fade/slide saat rute berubah.
 */
function AnimatedRoutes() {
  const location = useLocation();
  const [displayed, setDisplayed] = useState(location);
  const timer = useRef(null);
  const animating = location.pathname !== displayed.pathname;

  useEffect(() => {
    if (!animating) return undefined;
    timer.current = setTimeout(() => setDisplayed(location), 160);
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, [animating, location]);

  return (
    <div
      key={displayed.pathname}
      className="page-enter"
      style={{
        opacity: animating ? 0 : 1,
        transition: 'opacity 160ms ease',
      }}
    >
      <Routes location={displayed}>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/alumni"
          element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/laporan"
          element={
            <ProtectedRoute>
              <LaporanPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/kuisioner"
          element={
            <ProtectedRoute>
              <KuisionerPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/kuisioner/sukses"
          element={
            <ProtectedRoute>
              <KuisionerSuccessPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/analyze"
          element={
            <ProtectedRoute>
              <AnalyzePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/chat/:analysisId"
          element={
            <ProtectedRoute>
              <ChatPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/jobs"
          element={
            <ProtectedRoute>
              <JobSearchPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/jobs/:id"
          element={
            <ProtectedRoute>
              <JobDetailPage />
            </ProtectedRoute>
          }
        />
      </Routes>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AnimatedRoutes />
    </BrowserRouter>
  );
}

export default App;
