import { Navigate, Outlet } from "react-router-dom";
import { useAppSelector } from "../app/hooks";

export const ProtectedRoute = () => {
  const { isAuthenticated } = useAppSelector((state) => state.auth);

  const token = localStorage.getItem('auth_token');
  if (token && !isAuthenticated) {
    // Ждём восстановления пользователя (можно убрать, если не требуется)
    return <div style={{ color: '#e53935', textAlign: 'center', marginTop: '2rem' }}>Загрузка...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
