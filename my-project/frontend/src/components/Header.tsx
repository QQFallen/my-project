import { Link, useLocation, useNavigate } from "react-router-dom";
import { checkAuth, logout } from "@api/authService";
import { useEffect, useState } from "react";
import styles from "./Header.module.scss";

interface User {
  id: string;
  email: string;
  name?: string;
}

const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const res = await checkAuth();
        console.log("Check auth response:", res);
        if (res.success && res.user) {
          console.log("Setting user:", res.user);
          setUser(res.user);
        } else {
          console.log("No user data in response");
          setUser(null);
        }
      } catch (error) {
        console.error("Error checking auth:", error);
        setUser(null);
      }
    };

    loadUser();
  }, [location.pathname]);

  const handleLogout = async () => {
    try {
      await logout();
      setUser(null);
      navigate("/login");
    } catch (error) {
      console.error("Ошибка при выходе:", error);
    }
  };

  const displayName =
    user?.name || user?.email?.split("@")[0] || "Пользователь";
  console.log("Current user state:", user);
  console.log("Display name:", displayName);

  return (
    <header className={styles.header}>
      <Link to="/" className={styles.logo}>
        Доска мероприятий
      </Link>

      <nav className={styles.nav}>
        <Link to="/all-events" className={styles.eventsLink}>Мероприятия</Link>
        {user ? (
          <>
            <span className={styles.welcome}>👋 {displayName}</span>
            <button onClick={handleLogout}>Выйти</button>
          </>
        ) : (
          <>
            <Link to="/login">Войти</Link>
            <Link to="/register">Регистрация</Link>
          </>
        )}
      </nav>
    </header>
  );
};

export default Header;
