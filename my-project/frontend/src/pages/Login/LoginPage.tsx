// frontend/src/pages/Login/LoginPage.tsx
import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import styles from "./LoginPage.module.scss";
import { login } from "@api/authService";
import { saveToken } from "@utils/localStorage";

interface ValidationErrors {
  email?: string;
  password?: string;
  general?: string;
}

const LoginPage = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [isLoading, setIsLoading] = useState(false);
  const [showToast, setShowToast] = useState(false);

  const validateForm = (): boolean => {
    const newErrors: ValidationErrors = {};

    if (!email) {
      newErrors.email = "Email обязателен";
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = "Неверный формат email";
    }

    if (!password) {
      newErrors.password = "Пароль обязателен";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    try {
      const response = await login({ email, password });
      if (response.success && response.token) {
        saveToken(response.token);
        navigate("/all-events");
      } else {
        setErrors({ general: "Не удалось войти в систему" });
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      if (err.response?.data?.errors) {
        setErrors(err.response.data.errors);
      } else if (err.response?.data?.message) {
        setErrors({ general: err.response.data.message });
      } else {
        setErrors({
          general: "Произошла ошибка при входе. Пожалуйста, попробуйте снова.",
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (errors.general || errors.email || errors.password) {
      setShowToast(true);
      const timer = setTimeout(() => setShowToast(false), 3500);
      return () => clearTimeout(timer);
    }
  }, [errors]);

  return (
    <div className={styles.container}>
      <h2>Вход</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          disabled={isLoading}
        />

        <input
          type="password"
          placeholder="Пароль"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          disabled={isLoading}
        />

        <button type="submit" disabled={isLoading}>
          {isLoading ? "Вход..." : "Войти"}
        </button>
      </form>
      {showToast && (errors.general || errors.email || errors.password) && (
        <div style={{
          position: 'fixed',
          top: '32px',
          right: '32px',
          zIndex: 9999,
          background: '#e53935',
          color: '#fff',
          padding: '1rem 2rem',
          borderRadius: '8px',
          boxShadow: '0 4px 24px rgba(229,57,53,0.25)',
          fontWeight: 600,
          fontSize: '1rem',
          maxWidth: '350px',
          minWidth: '200px',
          textAlign: 'center',
          letterSpacing: '0.01em',
        }}>
          {errors.general || errors.email || errors.password}
        </div>
      )}
      <p className={styles.registerLink}>
        Нет аккаунта?<Link to="/register">Зарегистрируйтесь</Link>
      </p>
    </div>
  );
};

export default LoginPage;
