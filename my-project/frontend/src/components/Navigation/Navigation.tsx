import { Link, useNavigate, useLocation } from "react-router-dom";
// import { checkAuth, logout } from "@api/authService";
import { logout as logoutApi } from "@api/authService";
import { useAppSelector, useAppDispatch } from "../../app/hooks";
import { logout as logoutAction } from "../../features/auth/authSlice";
import styles from "./Navigation.module.scss";
import { User } from "../../types";

const Navigation = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.auth.user) as User | null;

  const handleLogout = async () => {
    try {
      await logoutApi();
      dispatch(logoutAction());
      navigate("/login");
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

  const displayNameRaw = user?.firstName || user?.email?.split("@")[0] || "Пользователь";
  const displayName = displayNameRaw.length > 15 ? displayNameRaw.slice(0, 15) + '…' : displayNameRaw;

  const isEventsActive = location.pathname === "/all-events";
  const isProfileActive = location.pathname === "/profile";

  return (
    <nav className={styles.navigation}>
      <div className={styles.logo}>
        <Link to={user ? "/" : "/"} onClick={handleLogoClick}>
          Доска мероприятий
        </Link>
      </div>
      <div className={styles.links}>
        <Link 
          to="/all-events" 
          className={isEventsActive ? `${styles.eventsLink} ${styles.activeLinkGlow}` : `${styles.eventsLink} ${styles.otherLink}`}
          onClick={(e) => isEventsActive && e.preventDefault()}
        >
          Мероприятия
        </Link>
        {user ? (
          <>
            <Link
              to="/profile"
              className={isProfileActive ? `${styles.welcome} ${styles.activeLinkGlow}` : `${styles.welcome} ${styles.otherLink}`}
              style={{ cursor: isProfileActive ? 'default' : 'pointer' }}
              onClick={(e) => isProfileActive && e.preventDefault()}
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
