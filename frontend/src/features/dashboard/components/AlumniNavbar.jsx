import { useMemo, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ChevronDown, ClipboardList, LayoutDashboard, LogOut, UserCircle2, History } from 'lucide-react';
import { useAuthStore } from '../../auth/store/authStore';

const ROLE_LABEL = {
  admin: 'Administrator',
  alumni: 'Alumni',
  viewer: 'Viewer',
};

function initials(name) {
  if (!name || !name.trim()) {
    return 'U';
  }

  const parts = name.trim().split(/\s+/);
  const first = parts[0]?.[0] ?? '';
  const second = parts.length > 1 ? parts[parts.length - 1]?.[0] ?? '' : '';
  return `${first}${second}`.toUpperCase() || 'U';
}

export default function AlumniNavbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const [menuOpen, setMenuOpen] = useState(false);

  const links = useMemo(
    () => [
      { to: '/dashboard', label: 'Dashboard' },
      { to: '/kuisioner', label: 'Tracer Study' },
      { to: '/profile', label: 'Profil Saya' },
      { to: '/dashboard#riwayat', label: 'Riwayat' },
    ],
    []
  );

  const isActive = (to) => {
    if (to.startsWith('/dashboard#')) {
      return location.pathname === '/dashboard';
    }

    return location.pathname === to;
  };

  const handleLogout = async () => {
    setMenuOpen(false);
    await logout();
    navigate('/');
  };

  return (
    <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/95 backdrop-blur">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-3 px-4 py-3">
        <div className="flex items-center gap-4 md:gap-6">
          <Link to="/dashboard" className="text-base font-semibold tracking-tight text-slate-900 md:text-lg">
            Portal Tracer Study
          </Link>

          <nav className="hidden items-center gap-1 md:flex">
            {links.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={`rounded-lg px-3 py-1.5 text-sm font-medium transition ${
                  isActive(link.to)
                    ? 'bg-blue-50 text-blue-700'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="relative">
          <button
            onClick={() => setMenuOpen((open) => !open)}
            className="flex items-center gap-2 rounded-xl border border-slate-200 px-2 py-1.5 hover:bg-slate-50"
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-600 text-sm font-semibold text-white">
              {initials(user?.name)}
            </span>
            <span className="hidden min-w-0 text-left sm:block">
              <span className="block max-w-[140px] truncate text-sm font-semibold text-slate-800">
                {user?.name || 'Pengguna'}
              </span>
              <span className="block text-xs text-slate-500">{ROLE_LABEL[user?.role] || 'Pengguna'}</span>
            </span>
            <ChevronDown className={`h-4 w-4 text-slate-400 transition ${menuOpen ? 'rotate-180' : ''}`} />
          </button>

          {menuOpen && (
            <div className="absolute right-0 top-full z-30 mt-2 w-56 rounded-2xl border border-slate-200 bg-white p-1.5 shadow-lg">
              <button
                onClick={() => {
                  setMenuOpen(false);
                  navigate('/dashboard');
                }}
                className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm font-medium text-slate-600 hover:bg-slate-50"
              >
                <LayoutDashboard className="h-4 w-4" /> Dashboard
              </button>
              <button
                onClick={() => {
                  setMenuOpen(false);
                  navigate('/kuisioner');
                }}
                className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm font-medium text-slate-600 hover:bg-slate-50"
              >
                <ClipboardList className="h-4 w-4" /> Tracer Study
              </button>
              <button
                onClick={() => {
                  setMenuOpen(false);
                  navigate('/profile');
                }}
                className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm font-medium text-slate-600 hover:bg-slate-50"
              >
                <UserCircle2 className="h-4 w-4" /> Profil Saya
              </button>
              <button
                onClick={() => {
                  setMenuOpen(false);
                  navigate('/dashboard#riwayat');
                }}
                className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm font-medium text-slate-600 hover:bg-slate-50"
              >
                <History className="h-4 w-4" /> Riwayat
              </button>
              <div className="my-1 border-t border-slate-100" />
              <button
                onClick={handleLogout}
                className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm font-medium text-rose-600 hover:bg-rose-50"
              >
                <LogOut className="h-4 w-4" /> Keluar
              </button>
            </div>
          )}
        </div>
      </div>

      <nav className="flex items-center justify-start gap-1 overflow-x-auto border-t border-slate-100 px-4 py-2 md:hidden">
        {links.map((link) => (
          <Link
            key={link.to}
            to={link.to}
            className={`whitespace-nowrap rounded-lg px-3 py-1.5 text-xs font-medium transition ${
              isActive(link.to)
                ? 'bg-blue-50 text-blue-700'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            {link.label}
          </Link>
        ))}
      </nav>
    </header>
  );
}
