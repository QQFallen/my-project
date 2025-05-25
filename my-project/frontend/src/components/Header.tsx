import { Link, useLocation, useNavigate } from "react-router-dom";
// import { checkAuth, logout } from "@api/authService";
import { logout } from "@api/authService";
import { useAppSelector } from "../app/hooks";
import styles from "./Header.module.scss";

const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const user = useAppSelector((state) => state.auth.user);

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/login");
    } catch (error) {
      console.error("Ошибка при выходе:", error);
    }
  };

  const displayName =
    user?.name || user?.email?.split("@")[0] || "Пользователь";

  return (
    <header className={styles.header}>
      <Link to="/" className={styles.logo}>
        Доска мероприятий
      </Link>

      <nav className={styles.nav}>
        <Link
          to="/all-events"
          className={
            location.pathname === "/all-events"
              ? `${styles.eventsLink} ${styles.activeLink}`
              : styles.eventsLink
          }
        >
          Мероприятия
        </Link>
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
