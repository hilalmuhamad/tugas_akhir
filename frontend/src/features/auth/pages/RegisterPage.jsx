import { Link } from 'react-router-dom';
import { Sparkles } from 'lucide-react';
import RegisterForm from '../components/RegisterForm.jsx';

export default function RegisterPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 via-white to-sky-100 px-4">
      <div className="w-full max-w-md rounded-2xl border border-slate-100 bg-white p-8 shadow-xl shadow-blue-100/50">
        <div className="mb-6 text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-600">
            <Sparkles className="h-6 w-6 text-white" />
          </div>
          <Link to="/" className="text-xl font-bold text-blue-600">
            Smart Career
          </Link>
          <p className="mt-1 text-xs text-slate-400">Tracer Study &amp; Job Matching Alumni</p>
        </div>
        <RegisterForm />
        <p className="mt-6 text-center text-sm text-slate-500">
          Sudah punya akun?{' '}
          <Link to="/login" className="font-medium text-blue-600 hover:underline">
            Masuk
          </Link>
        </p>
      </div>
    </main>
  );
}
