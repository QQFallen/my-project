import { useEffect, useState } from "react";
import styles from "./EventsPage.module.scss";
import { fetchEvents } from "@api/eventService";
import { getToken } from "@utils/localStorage";
import { useNavigate } from "react-router-dom";

interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
  deletedAt?: string | null;
  imageUrl?: string | null;
}

const EventsPage = () => {
  const navigate = useNavigate();
  const [events, setEvents] = useState<Event[]>([]);
  const [showDeleted, setShowDeleted] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isDataInvalid, setIsDataInvalid] = useState(false);

  const token = getToken();

  useEffect(() => {
    const loadEvents = async () => {
      try {
        console.log("Loading events...");
        setIsLoading(true);
        setError("");
        const data = await fetchEvents(false);
        console.log("Events loaded:", data);
        if (!Array.isArray(data)) {
          setIsDataInvalid(true);
          setEvents([]);
        } else {
          setEvents(data);
        }
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (err: any) {
        console.error("Error loading events:", err);
        console.error("Error response:", err.response);
        setError(
          err.response?.data?.message || "Ошибка при загрузке мероприятий",
        );
      } finally {
        setIsLoading(false);
      }
    };

    loadEvents();
  }, []);

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
      </div>

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
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default EventsPage;
