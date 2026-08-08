import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../../services/api';

export default function RegisterForm() {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [message, setMessage] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    try {
      await api.post('/auth/register', {
        name,
        email,
        password,
        password_confirmation: confirm,
        role: 'alumni',
      });
      setMessage({ type: 'success', text: 'Akun berhasil dibuat. Silakan masuk.' });
      setTimeout(() => navigate('/login'), 1500);
    } catch (error) {
      const errors = error.response?.data?.errors;
      const first = errors ? Object.values(errors)[0]?.[0] : null;
      setMessage({
        type: 'error',
        text: first || error.response?.data?.message || 'Pendaftaran gagal.',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="space-y-5" onSubmit={handleSubmit}>
      <div>
        <h2 className="text-2xl font-semibold text-slate-900">Daftar</h2>
        <p className="mt-1 text-sm text-slate-500">
          Buat akun alumni untuk menggunakan analisis karier.
        </p>
      </div>

      <label className="block">
        <span className="mb-1.5 block text-sm font-medium text-slate-700">Nama</span>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Nama lengkap"
          required
          className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
        />
      </label>

      <label className="block">
        <span className="mb-1.5 block text-sm font-medium text-slate-700">Email</span>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          required
          className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
        />
      </label>

      <label className="block">
        <span className="mb-1.5 block text-sm font-medium text-slate-700">Password</span>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Minimal 8 karakter"
          required
          minLength={8}
          className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
        />
      </label>

      <label className="block">
        <span className="mb-1.5 block text-sm font-medium text-slate-700">Konfirmasi Password</span>
        <input
          type="password"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          placeholder="Ulangi password"
          required
          className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
        />
      </label>

      {message && (
        <div
          className={`rounded-lg px-3 py-2 text-sm ${
            message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-600'
          }`}
        >
          {message.text}
          {message.type === 'success' && (
            <span>
              {' '}
              <Link to="/login" className="font-semibold underline">
                Masuk sekarang
              </Link>
            </span>
          )}
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {loading ? 'Memproses...' : 'Daftar'}
      </button>
    </form>
  );
}
