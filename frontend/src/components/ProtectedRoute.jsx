import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../features/auth/store/authStore';

export default function ProtectedRoute({ children }) {
  const user = useAuthStore((s) => s.user);

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
}
