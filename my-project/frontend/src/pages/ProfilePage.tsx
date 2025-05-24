import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { eventService } from '../api/eventService';
import { Event } from '../types';
import styles from './ProfilePage.module.scss';

const ProfilePage: React.FC = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    const fetchEvents = async () => {
      try {
        setIsLoading(true);
        const data = await eventService.getUserEvents(user.id.toString());
        setEvents(data);
        setError(null);
      } catch (err) {
        setError('Ошибка при загрузке мероприятий');
        console.error('Error fetching events:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchEvents();
  }, [isAuthenticated, navigate, user]);

  if (!user) {
    return <div>Пожалуйста, войдите в систему</div>;
  }

  return (
    <div className={styles.profileContainer}>
      <div className={styles.profileInfo}>
        <h1>Профиль пользователя</h1>
        <div className={styles.userInfo}>
          <p><strong>Имя:</strong> {user.name}</p>
          <p><strong>Email:</strong> {user.email}</p>
        </div>
      </div>

      <div className={styles.eventsSection}>
        <h2>Мои мероприятия</h2>
        {isLoading ? (
          <div>Загрузка...</div>
        ) : error ? (
          <div className={styles.error}>{error}</div>
        ) : events.length === 0 ? (
          <div>У вас пока нет созданных мероприятий</div>
        ) : (
          <div className={styles.eventsGrid}>
            {events.map((event) => (
              <div key={event.id} className={styles.eventCard}>
                <h3>{event.title}</h3>
                <p>{event.description}</p>
                <p className={styles.date}>
                  <strong>Дата:</strong> {new Date(event.date).toLocaleDateString()}
                </p>
                <p className={styles.location}>
                  <strong>Место:</strong> {event.location}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfilePage; 