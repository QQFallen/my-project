import { useAppSelector, useAppDispatch } from '../store/hooks';
import { login, logout, register, clearError } from '../store/slices/authSlice';

export const useAuth = () => {
  const dispatch = useAppDispatch();
  const { user, isAuthenticated, isLoading, error } = useAppSelector((state) => state.auth);

  const handleLogin = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const result = await dispatch(login({ email, password })).unwrap();
      if (result.token) {
        localStorage.setItem('token', result.token);
        return { success: true };
      }
      return { success: false, error: 'Неизвестная ошибка при входе' };
    } catch (error: any) {
      return { 
        success: false, 
        error: error.message || 'Неверный email или пароль'
      };
    }
  };

  const handleRegister = async (email: string, password: string, name: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const result = await dispatch(register({ email, password, name })).unwrap();
      if (result.token) {
        localStorage.setItem('token', result.token);
        return { success: true };
      }
      return { success: false, error: 'Неизвестная ошибка при регистрации' };
    } catch (error: any) {
      return { 
        success: false, 
        error: error.message || 'Пользователь с таким email уже существует'
      };
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    dispatch(logout());
  };

  const handleClearError = () => {
    dispatch(clearError());
  };

  return {
    user,
    isAuthenticated,
    isLoading,
    error,
    login: handleLogin,
    register: handleRegister,
    logout: handleLogout,
    clearError: handleClearError,
  };
}; 