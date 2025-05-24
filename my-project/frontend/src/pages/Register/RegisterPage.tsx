// frontend/src/pages/Register/RegisterPage.tsx
import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { register } from "@api/authService";
import styles from "./RegisterPage.module.scss";

interface ValidationErrors {
  name?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
  general?: string;
}

export const RegisterPage = () => {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [isLoading, setIsLoading] = useState(false);
  const [showToast, setShowToast] = useState(false);

  const validateForm = (): boolean => {
    const newErrors: ValidationErrors = {};

    // Валидация имени
    if (!name) {
      newErrors.name = "Имя обязательно";
    } else if (name.length < 2) {
      newErrors.name = "Имя должно содержать минимум 2 символа";
    }

    // Валидация email
    if (!email) {
      newErrors.email = "Email обязателен";
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = "Неверный формат email";
    }

    // Валидация пароля
    if (!password) {
      newErrors.password = "Пароль обязателен";
    } else if (password.length < 6) {
      newErrors.password = "Пароль должен содержать минимум 6 символов";
    } else if (!/\d/.test(password) || !/[a-zA-Z]/.test(password)) {
      newErrors.password = "Пароль должен содержать буквы и цифры";
    }

    // Валидация подтверждения пароля
    if (password !== confirmPassword) {
      newErrors.confirmPassword = "Пароли не совпадают";
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
      await register({ name, email, password });
      navigate("/login");
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      console.error("Registration error:", error);

      if (error.response?.status === 409) {
        setErrors({
          general: "Пользователь с таким email уже зарегистрирован",
        });
      } else if (error.response?.status === 400) {
        // Ошибки валидации
        setErrors(
          error.response.data.errors || {
            general: error.response.data.message,
          },
        );
      } else {
        setErrors({
          general: "Пользователь с таким email уже зарегистрирован",
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (errors.general || errors.email || errors.password || errors.name || errors.confirmPassword) {
      setShowToast(true);
      const timer = setTimeout(() => setShowToast(false), 3500);
      return () => clearTimeout(timer);
    }
  }, [errors]);

  return (
    <div className={styles.container}>
      <h2>Создать аккаунт</h2>

      <form onSubmit={handleSubmit}>
        <div className={styles.inputGroup}>
          <label htmlFor="name">Имя</label>
          <input
            id="name"
            type="text"
            placeholder="Введите ваше имя"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            disabled={isLoading}
          />
        </div>

        <div className={styles.inputGroup}>
          <label htmlFor="email">Email</label>
          <input
            id="email"
            type="email"
            placeholder="Введите email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={isLoading}
          />
        </div>

        <div className={styles.inputGroup}>
          <label htmlFor="password">Пароль</label>
          <input
            id="password"
            type="password"
            placeholder="Введите пароль"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            disabled={isLoading}
          />
        </div>

        <div className={styles.inputGroup}>
          <label htmlFor="confirmPassword">Подтверждение пароля</label>
          <input
            id="confirmPassword"
            type="password"
            placeholder="Подтвердите пароль"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            disabled={isLoading}
          />
        </div>

        {errors.general && (
          <div
            className={styles.error}
            style={{ marginBottom: "1rem", textAlign: "center" }}
          >
            {errors.general}
          </div>
        )}

        <button type="submit" disabled={isLoading}>
          {isLoading ? "Регистрация..." : "Зарегистрироваться"}
        </button>
      </form>

      <p className={styles.loginLink}>
        Уже есть аккаунт?<Link to="/login">Войти</Link>
      </p>

      {showToast && (errors.general || errors.email || errors.password || errors.name || errors.confirmPassword) && (
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
          {errors.general || errors.email || errors.password || errors.name || errors.confirmPassword}
        </div>
      )}
    </div>
  );
};
