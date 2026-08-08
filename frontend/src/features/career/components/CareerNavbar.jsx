import { useEffect, useRef, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Home,
  Search,
  Sparkles,
  History,
  LogOut,
  ChevronDown,
  ClipboardList,
} from 'lucide-react';
import { useAuthStore } from '../../auth/store/authStore';
import { getHistory } from '../services/careerApi';

const ROLE_LABEL = {
  admin: 'Admin',
  alumni: 'Alumni',
  viewer: 'Viewer',
};

export default function CareerNavbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuthStore();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const onClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, []);

  const handleLogout = async () => {
    setMenuOpen(false);
    await logout();
    navigate('/');
  };

  const go = (path) => {
    setMenuOpen(false);
    navigate(path);
  };

  const goToRiwayat = async () => {
    setMenuOpen(false);
    try {
      const { data } = await getHistory();
      if (data.length > 0) {
        navigate(`/chat/${data[0].id}`);
      } else {
        navigate('/analyze');
      }
    } catch {
      navigate('/analyze');
    }
  };

  // Beranda untuk alumni = hasil analisis & rekomendasi pekerjaan.
  const goHome = () => goToRiwayat();

  const navLink = (path, label) => (
    <button
      onClick={() => go(path)}
      className={`rounded-lg px-3 py-1.5 text-sm font-medium transition ${
        location.pathname === path
          ? 'bg-blue-50 text-blue-700'
          : 'text-slate-600 hover:bg-slate-100'
      }`}
    >
      {label}
    </button>
  );

  const hasilBtn = (label) => (
    <button
      onClick={goHome}
      className={`rounded-lg px-3 py-1.5 text-sm font-medium transition ${
        location.pathname.startsWith('/chat') || location.pathname === '/analyze'
          ? 'bg-blue-50 text-blue-700'
          : 'text-slate-600 hover:bg-slate-100'
      }`}
    >
      {label}
    </button>
  );

  return (
    <header className="sticky top-0 z-20 border-b border-slate-100 bg-white/80 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <div className="flex items-center gap-6">
          <button
            onClick={() => go('/dashboard')}
            className="flex items-center gap-1.5 text-lg font-bold text-blue-600"
          >
            <Sparkles className="h-5 w-5" />
            Smart Career
          </button>
          <nav className="hidden items-center gap-1 md:flex">
            {navLink('/dashboard', 'Beranda')}
            {hasilBtn('Hasil Analisis')}
            {navLink('/analyze', 'Analisis Karier')}
            {navLink('/jobs', 'Cari Kerja')}
            {user?.role === 'alumni' && navLink('/kuisioner', 'Isi Kuisioner')}
          </nav>
        </div>

        <div className="relative flex items-center gap-3" ref={menuRef}>
          <button
            onClick={() => setMenuOpen((v) => !v)}
            className="flex items-center gap-2 rounded-xl border border-slate-200 py-1.5 pl-1.5 pr-2.5 transition hover:bg-slate-50"
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-sm font-bold text-white">
              {(user?.name || '?').charAt(0).toUpperCase()}
            </span>
            <span className="hidden text-left sm:block">
              <span className="block max-w-[120px] truncate text-sm font-medium text-slate-800">
                {user?.name}
              </span>
              <span className="block text-xs text-slate-400">
                {ROLE_LABEL[user?.role] || 'Pengguna'}
              </span>
            </span>
            <ChevronDown
              className={`h-4 w-4 text-slate-400 transition-transform ${menuOpen ? 'rotate-180' : ''}`}
            />
          </button>

          {menuOpen && (
            <div className="absolute right-0 top-full mt-2 w-56 overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-lg">
              <div className="border-b border-slate-100 px-4 py-3">
                <p className="truncate text-sm font-semibold text-slate-800">{user?.name}</p>
                <p className="truncate text-xs text-slate-400">{user?.email || ''}</p>
              </div>
              <div className="p-1.5">
                <MenuItem icon={<Home className="h-4 w-4" />} label="Beranda" onClick={() => go('/dashboard')} />
                <MenuItem icon={<Sparkles className="h-4 w-4" />} label="Analisis Karier" onClick={() => go('/analyze')} />
                <MenuItem
                  icon={<Search className="h-4 w-4" />}
                  label="Cari Kerja"
                  onClick={() => go('/jobs')}
                />
                <MenuItem
                  icon={<History className="h-4 w-4" />}
                  label="Riwayat Analisis"
                  onClick={goToRiwayat}
                />
                {user?.role === 'alumni' && (
                  <MenuItem
                    icon={<ClipboardList className="h-4 w-4" />}
                    label="Isi Kuisioner"
                    onClick={() => go('/kuisioner')}
                  />
                )}
              </div>
              <div className="border-t border-slate-100 p-1.5">
                <MenuItem
                  icon={<LogOut className="h-4 w-4" />}
                  label="Keluar"
                  danger
                  onClick={handleLogout}
                />
              </div>
            </div>
          )}
        </div>
      </div>

      <nav className="flex items-center justify-center gap-1 border-t border-slate-100 px-4 py-2 md:hidden">
        {navLink('/dashboard', 'Beranda')}
        {hasilBtn('Hasil Analisis')}
        {navLink('/analyze', 'Analisis Karier')}
        {navLink('/jobs', 'Cari Kerja')}
        {user?.role === 'alumni' && navLink('/kuisioner', 'Isi Kuisioner')}
      </nav>
    </header>
  );
}

function MenuItem({ icon, label, onClick, danger }) {
  return (
    <button
      onClick={onClick}
      className={`flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-sm font-medium transition ${
        danger
          ? 'text-red-600 hover:bg-red-50'
          : 'text-slate-600 hover:bg-slate-50'
      }`}
    >
      {icon}
      {label}
    </button>
  );
}
