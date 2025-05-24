import { useEffect, useState } from "react";
import styles from "./ProfilePage.module.scss";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import { fetchProfile } from "../../features/auth/authSlice";
import { eventService } from "../../api/eventService";

const ProfilePage = () => {
  const dispatch = useAppDispatch();
  const { user, isLoading, isError, errorMessage } = useAppSelector((state) => state.auth);
  const [events, setEvents] = useState([]);
  const [eventsLoading, setEventsLoading] = useState(false);
  const [eventsError, setEventsError] = useState<string | null>(null);

  useEffect(() => {
    dispatch(fetchProfile());
  }, [dispatch]);

  useEffect(() => {
    const fetchEvents = async () => {
      if (!user?.id) return;
      setEventsLoading(true);
      setEventsError(null);
      try {
        const data = await eventService.getUserEvents(user.id);
        setEvents(data);
      } catch (err) {
        setEventsError("Ошибка загрузки мероприятий");
      } finally {
        setEventsLoading(false);
      }
    };
    fetchEvents();
  }, [user]);

  if (isLoading) {
    return <div className={styles.loading}>Загрузка профиля...</div>;
  }

  if (isError) {
    return <div className={styles.error}>{errorMessage || "Ошибка загрузки профиля"}</div>;
  }

  return (
    <div className={styles.container}>
      <div className={styles.profileCard}>
        <h2>Профиль пользователя</h2>
        <div className={styles.info}><b>Имя:</b> {user?.name}</div>
        <div className={styles.info}><b>Email:</b> {user?.email}</div>
      </div>
      <div className={styles.eventsSection}>
        <h3>Мои мероприятия</h3>
        {eventsLoading ? (
          <div className={styles.loading}>Загрузка мероприятий...</div>
        ) : eventsError ? (
          <div className={styles.error}>{eventsError}</div>
        ) : events.length > 0 ? (
          <div className={styles.eventsGrid}>
            {events.map((event) => (
              <div key={event.id} className={styles.eventCard}>
                <div className={styles.eventTitle}>{event.title}</div>
                <div className={styles.eventDate}>{new Date(event.date).toLocaleString("ru-RU")}</div>
                <div className={styles.eventLocation}>{event.location}</div>
              </div>
            ))}
          </div>
        ) : (
          <div className={styles.noEvents}>У вас пока нет созданных мероприятий</div>
        )}
      </div>
    </div>
  );
};

export default ProfilePage; 