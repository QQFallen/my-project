import { Link, useNavigate, useLocation } from "react-router-dom";
import { checkAuth, logout } from "@api/authService";
import { useEffect, useState } from "react";
import styles from "./Navigation.module.scss";

interface User {
  id: string;
  email: string;
  name?: string;
}

const Navigation = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const loadUser = async () => {
      if (location.pathname === "/login" || location.pathname === "/register") {
        setUser(null);
        return;
      }

      try {
        const res = await checkAuth();
        if (res.success && res.user) {
          setUser(res.user);
        } else {
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
      setTimeout(() => {
        navigate("/login");
      }, 100);
    } catch (error) {
      console.error("Ошибка при выходе:", error);
    }
  };

  const handleLogoClick = (e: React.MouseEvent) => {
    if (!user) {
      e.preventDefault();
      navigate("/");
    }
  };

  const displayName =
    user?.name || user?.email?.split("@")[0] || "Пользователь";
  console.log("Current user state:", user);
  console.log("Display name:", displayName);

  return (
    <nav className={styles.navigation}>
      <div className={styles.logo}>
        <Link to={user ? "/all-events" : "/"} onClick={handleLogoClick}>
          Доска мероприятий
        </Link>
      </div>
      <div className={styles.links}>
        <Link to="/all-events" className={styles.eventsLink}>Мероприятия</Link>
        {user ? (
          <>
            <Link
              to="/profile"
              className={styles.welcome}
              style={{ cursor: 'pointer' }}
            >
              {displayName}
            </Link>
            <button onClick={handleLogout} className={styles.logoutButton}>
              Выйти
            </button>
          </>
        ) : (
          <>
            <Link to="/login">Войти</Link>
            <Link to="/register">Регистрация</Link>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navigation;
