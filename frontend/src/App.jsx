import { BrowserRouter, Routes, Route } from 'react-router-dom';
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
import LaporanPage from './features/dashboard/pages/LaporanPage.jsx';

function App() {
  return (
    <BrowserRouter>
      <Routes>
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
    </BrowserRouter>
  );
}

export default App;
