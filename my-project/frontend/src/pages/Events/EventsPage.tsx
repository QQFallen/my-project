import { useEffect, useState } from "react";
import styles from "./EventsPage.module.scss";
import profileStyles from '../Profile/ProfilePage.module.scss';
import { eventService } from "@api/eventService";
import { getToken } from "@utils/localStorage";
import { useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import { fetchEventsThunk } from "../../features/events/eventsSlice";
import { logout } from "@api/authService";

interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
  deletedAt?: string | null;
  imageUrl?: string | null;
  createdBy?: string;
}

const EventsPage = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { events, isLoading, error, isDataInvalid } = useAppSelector((state) => state.events);
  const { isAuthenticated, user } = useAppSelector((state) => state.auth);
  const [showDeleted, setShowDeleted] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [showBurgerMenu, setShowBurgerMenu] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState("");
  const [location, setLocation] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
      setTimeout(() => {
        navigate("/login");
      }, 100);
    } catch (error) {
      console.error("Ошибка при выходе:", error);
    }
  };

  useEffect(() => {
    dispatch(fetchEventsThunk(false));
  }, [dispatch]);

  const handleCreateEventClick = () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    setShowModal(true);
  };

  const handleCreateEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.id) {
      alert("Не удалось определить пользователя.");
      return;
    }
    setIsSubmitting(true);
    try {
      await eventService.createEvent({
        title,
        description,
        date,
        location,
        createdBy: user?.id,
      });
      setShowModal(false);
      setTitle("");
      setDescription("");
      setDate("");
      setLocation("");
      dispatch(fetchEventsThunk(false));
    } catch (err) {
      alert("Ошибка при создании мероприятия");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className={styles.container}>
        <div className={styles.header}>
          <h2>Список мероприятий</h2>
        </div>
        <div className={styles.loading}>Загрузка мероприятий...</div>
      </div>
    );
  }

  if (isDataInvalid) {
    return (
      <div className={styles.container}>
        <div className={styles.header}>
          <h2>Ошибка данных</h2>
        </div>
        <div className={styles.error}>
          API вернул не массив. Проверьте авторизацию и корректность ответа сервера.
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2>Список мероприятий</h2>
        <button className={styles.burgerButton} onClick={() => setShowBurgerMenu(!showBurgerMenu)}>
          ☰
        </button>
      </div>

      {showBurgerMenu && (
        <div className={`${styles.burgerMenu} ${showBurgerMenu ? styles.open : ''}`}>
          <a href="/all-events" className={styles.burgerLink}>Мероприятия</a>
          {user && <a href="/profile" className={styles.burgerLink}>{user.name || user.email.split('@')[0]}</a>}
          {isAuthenticated && <button onClick={handleLogout} className={styles.burgerLogoutButton}>Выйти</button>}
        </div>
      )}

      <div style={{ display: 'flex', justifyContent: 'flex-start', margin: '2rem 0', paddingLeft: '2rem' }}>
        <button
          className={profileStyles.createEventBtn}
          onClick={handleCreateEventClick}
        >
          + Создать мероприятие
        </button>
      </div>

      {showModal && (
        <div className={profileStyles.modalOverlay}>
          <div className={profileStyles.modalContent}>
            <h2>Создать мероприятие</h2>
            <form onSubmit={handleCreateEvent} className={profileStyles.eventForm}>
              <input type="text" placeholder="Название" required className={profileStyles.inputField} value={title} onChange={e => setTitle(e.target.value)} />
              <input type="text" placeholder="Описание" required className={profileStyles.inputField} value={description} onChange={e => setDescription(e.target.value)} />
              <input type="date" required className={profileStyles.inputField} value={date} onChange={e => setDate(e.target.value)} />
              <input type="text" placeholder="Место" required className={profileStyles.inputField} value={location} onChange={e => setLocation(e.target.value)} />
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
                <button type="button" onClick={() => setShowModal(false)} className={profileStyles.cancelBtn} disabled={isSubmitting}>
                  Отмена
                </button>
                <button type="submit" className={profileStyles.submitBtn} disabled={isSubmitting}>
                  Создать
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {error && (
        <div className={styles.error}>
          <span>⚠️</span> {error}
        </div>
      )}

      {Array.isArray(events) && events.length === 0 ? (
        <div className={styles.noEvents}>
          "Пока нет созданных мероприятий"
        </div>
      ) : (
        <div className={styles.grid}>
          {Array.isArray(events) && events.map((event) => (
            <div
              key={event.id}
              className={`${styles.card} ${
                event.deletedAt ? styles.deleted : ""
              }`}
            >
              {event.imageUrl && (
                <img
                  src={event.imageUrl}
                  alt={event.title}
                  style={{
                    width: "100%",
                    borderRadius: "8px",
                    marginBottom: "12px",
                    objectFit: "cover",
                    maxHeight: "180px"
                  }}
                />
              )}
              <h3>{event.title}</h3>
              <p className={styles.description}>{event.description}</p>
              <div className={styles.date}>
                <span className={styles.icon}>📅</span>
                {new Date(event.date).toLocaleString("ru-RU", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
                {event.deletedAt && (
                  <span className={styles.deletedLabel}>
                    удалено {new Date(event.deletedAt).toLocaleDateString()}
                  </span>
                )}
              </div>
              {event.createdBy && (
                <div className={styles.creator}>
                  <span className={styles.icon}>👤</span>
                  Создатель: {event.createdBy}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default EventsPage;
