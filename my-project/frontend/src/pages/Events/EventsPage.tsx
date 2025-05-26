import { useEffect, useState } from "react";
import styles from "./EventsPage.module.scss";
import profileStyles from '../Profile/ProfilePage.module.scss';
import { eventService } from "@api/eventService";
import { getToken } from "@utils/localStorage";
import { useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import { fetchEventsThunk } from "../../features/events/eventsSlice";
import { logout } from "@api/authService";
import { YMaps, Map, Placemark, SearchControl } from '@pbe/react-yandex-maps';

interface Event {
  id: string;
  title: string;
  date: string;
  description: string;
  deletedAt?: string | null;
  imageUrl?: string | null;
  createdBy?: string;
  location?: string;
}

function useAddressFromCoords(coords: string | undefined) {
  const [address, setAddress] = useState<string>("");

  useEffect(() => {
    if (!coords) return;
    const [lat, lng] = coords.split(',').map(Number);
    fetch(`https://geocode-maps.yandex.ru/1.x/?apikey=d7d5d9a1-c39b-429b-9aa1-19281ca00b45&format=json&geocode=${lng},${lat}`)
      .then(res => res.json())
      .then(data => {
        const geoObj = data.response.GeoObjectCollection.featureMember[0]?.GeoObject;
        setAddress(geoObj?.metaDataProperty?.GeocoderMetaData?.text || "");
      });
  }, [coords]);

  return address;
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
  const [editEvent, setEditEvent] = useState<Event | null>(null);
  const [editForm, setEditForm] = useState({ title: '', description: '', date: '', location: '' });
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [coords, setCoords] = useState<[number, number] | null>(null);
  const [searchValue, setSearchValue] = useState('');
  const [editSearchValue, setEditSearchValue] = useState('');
  const [addresses, setAddresses] = useState<{ [id: string]: string }>({});

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
    dispatch(fetchEventsThunk());
  }, [dispatch]);

  useEffect(() => {
    async function fetchAddresses() {
      if (!Array.isArray(events)) return;
      const newAddresses: { [id: string]: string } = {};
      await Promise.all(events.map(async (event) => {
        if (event.location) {
          const [lat, lng] = event.location.split(',').map(Number);
          const res = await fetch(`https://geocode-maps.yandex.ru/1.x/?apikey=d7d5d9a1-c39b-429b-9aa1-19281ca00b45&format=json&geocode=${lng},${lat}`);
          const data = await res.json();
          const geoObj = data.response.GeoObjectCollection.featureMember[0]?.GeoObject;
          newAddresses[event.id] = geoObj?.metaDataProperty?.GeocoderMetaData?.text || '';
        }
      }));
      setAddresses(newAddresses);
    }
    fetchAddresses();
  }, [events]);

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
        date,
        description,
        location: coords ? `${coords[0]},${coords[1]}` : '',
        createdBy: user?.id,
      });
      setShowModal(false);
      setTitle("");
      setDate("");
      setDescription("");
      setLocation("");
      dispatch(fetchEventsThunk());
    } catch (err) {
      alert("Ошибка при создании мероприятия");
    } finally {
      setIsSubmitting(false);
    }
  };

  const openEditModal = (event: Event) => {
    setEditEvent(event);
    setEditForm({
      title: event.title,
      description: event.description,
      date: event.date.slice(0, 16),
      location: event.location || ''
    });
    setEditModalOpen(true);
  };

  const closeEditModal = () => {
    setEditModalOpen(false);
    setEditEvent(null);
  };

  const handleEditFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setEditForm({ ...editForm, [e.target.name]: e.target.value });
  };

  const handleEditSave = async () => {
    if (!editEvent || !user) return;
    setIsSubmitting(true);
    try {
      await eventService.updateEvent(editEvent.id, editForm);
      setEditModalOpen(false);
      setEditEvent(null);
      dispatch(fetchEventsThunk());
    } catch (err) {
      alert('Ошибка при сохранении изменений');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteEventById = async (id: string) => {
    if (!user) return;
    setIsSubmitting(true);
    try {
      await eventService.deleteEvent(id);
      dispatch(fetchEventsThunk());
    } catch (err) {
      alert('Ошибка при удалении мероприятия');
    } finally {
      setIsSubmitting(false);
    }
  };

  async function handleAddressSearch() {
    if (!searchValue) return;
    const response = await fetch(
      `https://geocode-maps.yandex.ru/1.x/?apikey=d7d5d9a1-c39b-429b-9aa1-19281ca00b45&format=json&geocode=${encodeURIComponent(searchValue)}`
    );
    const data = await response.json();
    const pos = data.response.GeoObjectCollection.featureMember[0]?.GeoObject?.Point?.pos;
    if (pos) {
      const [lng, lat] = pos.split(' ').map(Number);
      setCoords([lat, lng]);
    } else {
      alert('Адрес не найден');
    }
  }

  async function handleEditAddressSearch() {
    if (!editSearchValue) return;
    const response = await fetch(
      `https://geocode-maps.yandex.ru/1.x/?apikey=d7d5d9a1-c39b-429b-9aa1-19281ca00b45&format=json&geocode=${encodeURIComponent(editSearchValue)}`
    );
    const data = await response.json();
    const pos = data.response.GeoObjectCollection.featureMember[0]?.GeoObject?.Point?.pos;
    if (pos) {
      const [lng, lat] = pos.split(' ').map(Number);
      setEditForm({ ...editForm, location: `${lat},${lng}` });
    } else {
      alert('Адрес не найден');
    }
  }

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

      {!getToken() && (
        <div style={{
          textAlign: 'center',
          color: '#e53935',
          fontWeight: 550,
          margin: '1.5rem 0 0.5rem 0',
          fontSize: '1.3rem'
        }}>
          Войдите/Зарегистрируйтесь, для создания собственных мероприятий!
        </div>
      )}

      {getToken() && (
        <div style={{ display: 'flex', justifyContent: 'flex-start', margin: '2rem 0', paddingLeft: '2rem' }}>
          <button
            className={profileStyles.createEventBtn}
            onClick={handleCreateEventClick}
          >
            + Создать мероприятие
          </button>
        </div>
      )}

      {showModal && (
        <div className={profileStyles.modalOverlay}>
          <div className={profileStyles.modalContent}>
            <form onSubmit={handleCreateEvent} className={profileStyles.eventForm}>
              <h2>Создать мероприятие</h2>
              <input type="text" placeholder="Название" required className={profileStyles.inputField} value={title} onChange={e => setTitle(e.target.value)} />
              <input type="text" placeholder="Описание" required className={profileStyles.inputField} value={description} onChange={e => setDescription(e.target.value)} />
              <input type="date" required className={profileStyles.inputField} value={date} onChange={e => setDate(e.target.value)} />
              <input
                type="text"
                value={searchValue}
                onChange={e => setSearchValue(e.target.value)}
                placeholder="Введите адрес для поиска"
                style={{ marginBottom: '0.5rem' }}
              />
              <button type="button" onClick={handleAddressSearch} style={{ marginBottom: '1rem' }}>
                Найти на карте
              </button>
              <div style={{ width: '100%', height: '300px', marginBottom: '1rem' }}>
                <YMaps query={{ apikey: 'd7d5d9a1-c39b-429b-9aa1-19281ca00b45' }}>
                  <Map
                    defaultState={{ center: [55.751574, 37.573856], zoom: 9 }}
                    width="100%"
                    height="300px"
                    onClick={(e: any) => {
                      const coords = e.get('coords');
                      setCoords(coords);
                    }}
                  >
                    {coords && <Placemark geometry={coords} />}
                    <SearchControl options={{ float: 'right' }} />
                  </Map>
                </YMaps>
              </div>
              {coords && (
                <div style={{ color: '#fff', marginBottom: '1rem' }}>
                  Координаты: {coords[0].toFixed(6)}, {coords[1].toFixed(6)}
                </div>
              )}
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
          {Array.isArray(events) && events.map((event) => {
            return (
              <div
                key={event.id}
                className={`${styles.card} ${event.deletedAt ? styles.deleted : ""}`}
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
                {event.location && (
                  <div style={{ color: '#e53935', fontSize: '0.95rem', marginBottom: '0.5rem' }}>
                    {addresses[event.id]
                      ? `Адрес: ${addresses[event.id].length > 30 ? addresses[event.id].slice(0, 48) + '…' : addresses[event.id]}`
                      : `Координаты: ${event.location}`}
                  </div>
                )}
                <p className={styles.description}>{event.description}</p>
                <div className={styles.date}>
                  <span className={styles.icon}>📅</span>
                  {new Date(event.date).toLocaleDateString("ru-RU", {
                    day: "numeric",
                    month: "long",
                    year: "numeric"
                  })}
                  {event.deletedAt && (
                    <span className={styles.deletedLabel}>
                      удалено {new Date(event.deletedAt).toLocaleDateString()}
                    </span>
                  )}
                </div>
                {event.createdBy === user?.id && (
                  <button
                    onClick={() => handleDeleteEventById(event.id)}
                    className={styles.deleteCircleBtn}
                    title="Удалить мероприятие"
                  >
                    ×
                  </button>
                )}
                {event.createdBy === user?.id && (
                  <button
                    onClick={() => openEditModal(event)}
                    className={styles.editBtn}
                    style={{ marginTop: '1rem' }}
                  >
                    Редактировать
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}

      {editModalOpen && (
        <div className={profileStyles.modalOverlay}>
          <div className={profileStyles.modalContent}>
            <form className={profileStyles.eventForm}>
              <h2 style={{ color: '#fff', textAlign: 'center', marginBottom: '2rem', fontSize: '2rem', fontWeight: 700 }}>
                Редактировать мероприятие
              </h2>
              <input name="title" value={editForm.title} onChange={handleEditFormChange} placeholder="Название" className={profileStyles.inputField} />
              <input name="date" type="datetime-local" value={editForm.date} onChange={handleEditFormChange} className={profileStyles.inputField} />
              <input name="description" type="text" value={editForm.description} onChange={handleEditFormChange} placeholder="Описание" className={profileStyles.inputField} />
              <input
                type="text"
                value={editSearchValue}
                onChange={e => setEditSearchValue(e.target.value)}
                placeholder="Введите адрес для поиска"
                className={profileStyles.inputField}
              />
              <button type="button" onClick={handleEditAddressSearch} className={profileStyles.submitBtn} style={{ marginBottom: '1rem', width: '100%' }}>
                Найти на карте
              </button>
              <div style={{ width: '100%', height: '300px', marginBottom: '1rem' }}>
                <YMaps query={{ apikey: 'd7d5d9a1-c39b-429b-9aa1-19281ca00b45' }}>
                  <Map
                    defaultState={{ center: editForm.location ? editForm.location.split(',').map(Number) : [55.751574, 37.573856], zoom: 9 }}
                    width="100%"
                    height="300px"
                    onClick={(e: any) => {
                      const coords = e.get('coords');
                      setEditForm({ ...editForm, location: coords.join(',') });
                    }}
                  >
                    {editForm.location && <Placemark geometry={editForm.location.split(',').map(Number)} />}
                  </Map>
                </YMaps>
              </div>
              <div className={profileStyles.modalActions}>
                <button type="button" onClick={handleEditSave} className={profileStyles.submitBtn} disabled={isSubmitting}>Сохранить</button>
                <button type="button" onClick={closeEditModal} className={profileStyles.cancelBtn} disabled={isSubmitting}>Отмена</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default EventsPage;
