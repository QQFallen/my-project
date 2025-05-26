// frontend/src/pages/Register/RegisterPage.tsx
import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import styles from "./RegisterPage.module.scss";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import { registerUser } from "../../features/auth/authSlice";

interface ValidationErrors {
  name?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
  firstName?: string;
  lastName?: string;
  middleName?: string;
  gender?: string;
  dateOfBirth?: string;
  general?: string;
}

export const RegisterPage = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { isLoading, error } = useAppSelector((state) => state.auth);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [middleName, setMiddleName] = useState("");
  const [gender, setGender] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [showToast, setShowToast] = useState(false);

  const validateForm = (): boolean => {
    const newErrors: ValidationErrors = {};

    // Валидация полей ФИО
    if (!firstName) {
      newErrors.firstName = "Имя обязательно";
    }
    if (!lastName) {
      newErrors.lastName = "Фамилия обязательна";
    }
    // Отчество опционально, валидация не нужна, если пустое

    // Валидация пола
    if (!gender) {
      newErrors.gender = "Пол обязателен";
    }

    // Валидация даты рождения
    if (!dateOfBirth) {
      newErrors.dateOfBirth = "Дата рождения обязательна";
    } else {
      // Простая проверка формата YYYY-MM-DD
      const datePattern = /^\d{4}-\d{2}-\d{2}$/;
      if (!datePattern.test(dateOfBirth)) {
        newErrors.dateOfBirth = "Неверный формат даты (ожидается ГГГГ-ММ-ДД)";
      }
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

    try {
      const result = await dispatch(registerUser({
        firstName,
        lastName,
        middleName: middleName ? middleName : null,
        gender,
        dateOfBirth,
        email,
        password
      })).unwrap();
      if (result.success) {
        navigate("/login");
      }
    } catch (err: any) {
      if (err.message === "Пользователь с таким email уже зарегистрирован") {
        setErrors({
          general: "Пользователь с таким email уже зарегистрирован",
        });
      } else if (err.response?.status === 409) {
        setErrors({
          general: "Пользователь с таким email уже зарегистрирован",
        });
      } else if (err.response?.status === 400) {
        setErrors(
          err.response.data.errors || {
            general: err.response.data.message,
          },
        );
      } else {
        setErrors({
          general: "Произошла ошибка при регистрации",
        });
      }
    }
  };

  useEffect(() => {
    if (errors.general || errors.email || errors.password || errors.name || errors.confirmPassword || error) {
      setShowToast(true);
      const timer = setTimeout(() => setShowToast(false), 3500);
      return () => clearTimeout(timer);
    }
  }, [errors, error]);

  return (
    <div className={styles.container}>
      <h2>Создать аккаунт</h2>

      <form onSubmit={handleSubmit}>
        <div className={styles.inputGroup}>
          <label htmlFor="firstName">Имя</label>
          <input
            id="firstName"
            type="text"
            placeholder="Введите ваше имя"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            required
            disabled={isLoading}
          />
          {errors.firstName && <span className={styles.errorText}>{errors.firstName}</span>}
        </div>

        <div className={styles.inputGroup}>
          <label htmlFor="lastName">Фамилия</label>
          <input
            id="lastName"
            type="text"
            placeholder="Введите вашу фамилию"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            required
            disabled={isLoading}
          />
          {errors.lastName && <span className={styles.errorText}>{errors.lastName}</span>}
        </div>

        <div className={styles.inputGroup}>
          <label htmlFor="middleName">Отчество (необязательно)</label>
          <input
            id="middleName"
            type="text"
            placeholder="Введите ваше отчество"
            value={middleName}
            onChange={(e) => setMiddleName(e.target.value)}
            disabled={isLoading}
          />
          {errors.middleName && <span className={styles.errorText}>{errors.middleName}</span>}
        </div>

        <div className={styles.inputGroup}>
          <label htmlFor="gender">Пол</label>
          <select
            id="gender"
            value={gender}
            onChange={(e) => setGender(e.target.value)}
            required
            disabled={isLoading}
          >
            <option value="">Выберите пол</option>
            <option value="Автобот">Автобот</option>
            <option value="Десептикон">Десептикон</option>
          </select>
          {errors.gender && <span className={styles.errorText}>{errors.gender}</span>}
        </div>

        <div className={styles.inputGroup}>
          <label htmlFor="dateOfBirth">Дата рождения</label>
          <input
            id="dateOfBirth"
            type="date"
            value={dateOfBirth}
            onChange={(e) => setDateOfBirth(e.target.value)}
            required
            disabled={isLoading}
          />
          {errors.dateOfBirth && <span className={styles.errorText}>{errors.dateOfBirth}</span>}
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

        <button type="submit" disabled={isLoading}>
          {isLoading ? "Регистрация..." : "Зарегистрироваться"}
        </button>
      </form>

      <p className={styles.loginLink}>
        Уже есть аккаунт?<Link to="/login">Войти</Link>
      </p>

      {showToast && (
        <div className={styles.toast} style={{ background: '#e53935', color: '#fff', position: 'fixed', top: 16, right: 16, zIndex: 1000, padding: '1rem 2rem', borderRadius: 10, fontWeight: 600, fontSize: '1.1rem', boxShadow: '0 4px 32px rgba(229,57,53,0.25)' }}>
          {errors.general === 'Пользователь с таким email уже зарегистрирован'
            ? 'Пользователь с таким email уже зарегистрирован'
            : error || errors.general || errors.email || errors.password || errors.name || errors.confirmPassword}
        </div>
      )}
    </div>
  );
};
