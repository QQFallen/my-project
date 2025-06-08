import React, { useEffect, useState } from "react";
import styles from "./ProfilePage.module.scss";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import { fetchProfile } from "../../features/auth/authSlice";
import { eventService } from "../../api/eventService";
import Navigation from '../../components/Navigation/Navigation';
import { User } from '../../types';
import { logout } from '@api/authService';
import { useNavigate } from 'react-router-dom';
import { updateProfile } from "@api/userService";
import eventStyles from '../Events/EventsPage.module.scss';
import { YMaps, Map, Placemark } from '@pbe/react-yandex-maps';

interface Event {
  id: string;
  title: string;
  date: string;
  description: string;
  imageUrl?: string | null;
  createdBy?: string;
  location?: string;
}

const ProfilePage = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { user, isLoading, isError, errorMessage } = useAppSelector((state) => state.auth);
  const typedUser = user as User | null;
  const [events, setEvents] = useState<Event[]>([]);
  const [eventsLoading, setEventsLoading] = useState(false);
  const [eventsError, setEventsError] = useState<string | null>(null);
  const [editEvent, setEditEvent] = useState<Event | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState({ title: '', description: '', date: '', location: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [profileForm, setProfileForm] = useState({
    firstName: '',
    lastName: '',
    middleName: '',
    gender: '',
    dateOfBirth: '',
  });
  const [profileErrors, setProfileErrors] = useState<{
    firstName?: string;
    lastName?: string;
    gender?: string;
    dateOfBirth?: string;
    general?: string;
  }>({});
  const [eventErrors, setEventErrors] = useState<{ [key: string]: string }>({});
  const [addresses, setAddresses] = useState<{ [id: string]: string }>({});
  const [coords, setCoords] = useState<[number, number] | null>(null);
  const [searchValue, setSearchValue] = useState('');

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

  const openEditModal = (event: Event) => {
    setEditEvent(event);
    setForm({
      title: event.title,
      description: event.description,
      date: event.date.slice(0, 16),
      location: event.location || ''
    });
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditEvent(null);
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleProfileFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setProfileForm({ ...profileForm, [e.target.name]: e.target.value });
  };

  const openProfileModal = () => {
    if (typedUser) {
      setProfileForm({
        firstName: typedUser.firstName || '',
        lastName: typedUser.lastName || '',
        middleName: typedUser.middleName || '',
        gender: typedUser.gender || '',
        dateOfBirth: typedUser.dateOfBirth ? typedUser.dateOfBirth.split('T')[0] : '', // Форматируем дату для input type='date'
      });
    }
    setProfileErrors({});
    setProfileModalOpen(true);
  };

  const closeProfileModal = () => {
    setProfileModalOpen(false);
    setProfileErrors({});
  };

  const validateProfileForm = (): boolean => {
    const newErrors: typeof profileErrors = {};

    if (!profileForm.firstName) newErrors.firstName = "Имя обязательно";
    if (!profileForm.lastName) newErrors.lastName = "Фамилия обязательна";
    if (!profileForm.gender) newErrors.gender = "Пол обязателен";
    if (!profileForm.dateOfBirth) {
      newErrors.dateOfBirth = "Дата рождения обязательна";
    } else {
      const datePattern = /^\d{4}-\d{2}-\d{2}$/;
      if (!datePattern.test(profileForm.dateOfBirth)) {
        newErrors.dateOfBirth = "Неверный формат даты (ожидается ГГГГ-ММ-ДД)";
      }
    }

    setProfileErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSaveProfile = async () => {
    if (!typedUser || isSubmitting) return;

    if (!validateProfileForm()) {
      return;
    }

    setIsSubmitting(true);
    try {
      await updateProfile(typedUser.id, profileForm);
      await dispatch(fetchProfile()).unwrap();
      closeProfileModal();
    } catch (err: any) {
      setProfileErrors({ general: "Ошибка при сохранении профиля" });
      console.error("Ошибка при сохранении профиля:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const validateEventForm = (): boolean => {
    const errors: { [key: string]: string } = {};
    if (!form.title.trim()) errors.title = 'Название обязательно';
    if (!form.date.trim()) errors.date = 'Дата и время обязательны';
    if (!form.location.trim()) errors.location = 'Место обязательно';
    if (!form.description.trim()) errors.description = 'Описание обязательно';
    setEventErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSave = async () => {
    if (!editEvent || !user) return;
    if (!validateEventForm()) return;
    try {
      await eventService.updateEvent(editEvent.id, form);
      // обновить список событий
      const data = await eventService.getUserEvents(user.id);
      setEvents(data);
      closeModal();
    } catch (err) {
      alert('Ошибка при сохранении изменений');
    }
  };

  const handleDeleteEventById = async (eventId: string) => {
    if (!window.confirm('Удалить это мероприятие?')) return;
    setIsSubmitting(true);
    try {
      await eventService.deleteEvent(eventId);
      setIsSubmitting(false);
      // обновить список
      if (user) {
        const data = await eventService.getUserEvents(user.id.toString());
        setEvents(data);
      }
    } catch (err) {
      alert("Ошибка при удалении мероприятия");
      setIsSubmitting(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/login");
      window.location.reload();
    } catch (error) {
      console.error("Ошибка при выходе:", error);
    }
  };

  // Функция для сокращения длинных строк
  const getShortText = (text: string) => text.length > 15 ? text.slice(0, 15) + '…' : text;

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
      setForm({ ...form, location: `${lat},${lng}` });
    } else {
      alert('Адрес не найден');
    }
  }

  if (isLoading) {
    return <div className={styles.loading}>Загрузка профиля...</div>;
  }

  if (isError) {
    return <div className={styles.error}>{errorMessage || "Ошибка загрузки профиля"}</div>;
  }

  return (
    <>
      <Navigation />
      <div className={styles.container}>
        <div className={styles.profileCard}>
          <h2>Профиль пользователя</h2>
          <div className={styles.info}><b>Имя:</b> {typedUser?.firstName}</div>
          <div className={styles.info}><b>Фамилия:</b> {typedUser?.lastName}</div>
          {typedUser?.middleName && <div className={styles.info}><b>Отчество:</b> {typedUser?.middleName}</div>}
          <div className={styles.info}><b>Пол:</b> {typedUser?.gender}</div>
          <div className={styles.info}>
            <b>Дата рождения:</b> {typedUser?.dateOfBirth ? new Date(typedUser.dateOfBirth).toLocaleDateString('ru-RU') : ''}
          </div>
          <button className={styles.editBtn} onClick={openProfileModal}>Редактировать профиль</button>
        </div>
        <div className={eventStyles.container}>
          <h2 className={eventStyles.header} style={{ color: '#e53935', textAlign: 'center' }}>Мои мероприятия</h2>
          {eventsLoading ? (
            <div className={eventStyles.loading}>Загрузка мероприятий...</div>
          ) : eventsError ? (
            <div className={eventStyles.error}>{eventsError}</div>
          ) : Array.isArray(events) && events.length === 0 ? (
            <div className={eventStyles.noEvents}>Пока нет созданных мероприятий</div>
          ) : (
            <div className={eventStyles.list} style={{ marginTop: 10 }}>
              {events.map((event) => (
                <div
                  key={event.id}
                  className={eventStyles.card}
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
                  {event.createdBy === user?.id && (
                    <button
                      onClick={() => handleDeleteEventById(event.id)}
                      className={styles.deleteCircleBtn}
                      title="Удалить мероприятие"
                    >
                      ×
                    </button>
                  )}
                  <h3>{event.title}</h3>
                  <div style={{ color: '#e53935', fontSize: '0.95rem', marginBottom: '0.5rem' }}>
                    {addresses[event.id]
                      ? `Адрес: ${addresses[event.id].length > 45 ? addresses[event.id].slice(0, 48) + '…' : addresses[event.id]}`
                      : event.location ? `Координаты: ${event.location}` : ''}
                  </div>
                  <p className={eventStyles.description}>{event.description}</p>
                  <div className={eventStyles.date}>
                    <span className={eventStyles.icon}>📅</span>
                    {new Date(event.date).toLocaleDateString("ru-RU", {
                      day: "numeric",
                      month: "long",
                      year: "numeric"
                    })}
                  </div>
                  {event.createdBy === user?.id && (
                    <button
                      onClick={() => openEditModal(event)}
                      className={eventStyles.editBtn}
                      style={{ marginTop: '1rem' }}
                    >
                      Редактировать
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      {modalOpen && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <form className={styles.eventForm}>
              <h2 style={{ color: '#fff', textAlign: 'center', marginBottom: '2rem', fontSize: '2rem', fontWeight: 700 }}>
                Редактировать мероприятие
              </h2>
              <input name="title" value={form.title} onChange={handleFormChange} placeholder="Название" className={styles.inputField} />
              <input name="date" type="datetime-local" value={form.date} onChange={handleFormChange} className={styles.inputField} />
              <input name="description" type="text" value={form.description} onChange={handleFormChange} placeholder="Описание" className={styles.inputField} />
              <input
                type="text"
                value={searchValue}
                onChange={e => setSearchValue(e.target.value)}
                placeholder="Введите адрес для поиска"
                className={styles.inputField}
              />
              <button type="button" onClick={handleAddressSearch} className={styles.submitBtn} style={{ marginBottom: '1rem', width: '100%' }}>
                Найти на карте
              </button>
              <div style={{ width: '100%', height: '300px', marginBottom: '1rem' }}>
                <YMaps query={{ apikey: 'd7d5d9a1-c39b-429b-9aa1-19281ca00b45' }}>
                  <Map
                    defaultState={{ center: coords ? coords : form.location ? form.location.split(',').map(Number) : [55.751574, 37.573856], zoom: 9 }}
                    width="100%"
                    height="300px"
                    onClick={(e: any) => {
                      const coords = e.get('coords');
                      setCoords(coords);
                      setForm({ ...form, location: coords.join(',') });
                    }}
                  >
                    {(coords || form.location) && <Placemark geometry={coords || form.location.split(',').map(Number)} />}
                  </Map>
                </YMaps>
              </div>
              <div className={styles.modalActions}>
                <button type="button" onClick={handleSave} className={styles.submitBtn} disabled={isSubmitting}>Сохранить</button>
                <button type="button" onClick={closeModal} className={styles.cancelBtn} disabled={isSubmitting}>Отмена</button>
              </div>
            </form>
          </div>
        </div>
      )}
      {user && (
        <button onClick={handleLogout} className={styles.logoutButtonProfile}>Выйти</button>
      )}
      {profileModalOpen && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <h3>Редактировать профиль</h3>
            <div className={styles.eventForm}> {/* Используем тот же класс формы для стилей */}
              <label htmlFor="profileFirstName">Имя</label>
              <input id="profileFirstName" name="firstName" type="text" value={profileForm.firstName} onChange={handleProfileFormChange} placeholder="Имя" required disabled={isSubmitting} />
              {profileErrors.firstName && <span className={styles.errorText}>{profileErrors.firstName}</span>}

              <label htmlFor="profileLastName">Фамилия</label>
              <input id="profileLastName" name="lastName" type="text" value={profileForm.lastName} onChange={handleProfileFormChange} placeholder="Фамилия" required disabled={isSubmitting} />
              {profileErrors.lastName && <span className={styles.errorText}>{profileErrors.lastName}</span>}

              <label htmlFor="profileMiddleName">Отчество (необязательно)</label>
              <input id="profileMiddleName" name="middleName" type="text" value={profileForm.middleName} onChange={handleProfileFormChange} placeholder="Отчество" disabled={isSubmitting} />

              <label htmlFor="profileGender">Пол</label>
              <select id="profileGender" name="gender" value={profileForm.gender} onChange={handleProfileFormChange} required disabled={isSubmitting}>
                <option value="">Выберите пол</option>
                <option value="Автобот">Автобот</option>
                <option value="Десептикон">Десептикон</option>
              </select>
              {profileErrors.gender && <span className={styles.errorText}>{profileErrors.gender}</span>}

              <label htmlFor="profileDateOfBirth">Дата рождения</label>
              <input id="profileDateOfBirth" name="dateOfBirth" type="date" value={profileForm.dateOfBirth} onChange={handleProfileFormChange} required disabled={isSubmitting} />
              {profileErrors.dateOfBirth && <span className={styles.errorText}>{profileErrors.dateOfBirth}</span>}
            </div>
            <div className={styles.modalActions}>
              <button onClick={handleSaveProfile} disabled={isSubmitting}>Сохранить</button>
              <button onClick={closeProfileModal} disabled={isSubmitting}>Отмена</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ProfilePage; 