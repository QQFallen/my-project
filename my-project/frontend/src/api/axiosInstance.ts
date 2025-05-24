import axios from "axios";
import { getToken as getStorageToken } from "@utils/localStorage";

// В режиме разработки используем относительные пути
const isDevelopment = import.meta.env.MODE === "development";
const API_BASE_URL = isDevelopment ? "" : import.meta.env.VITE_API_URL;

console.log("[axios] Environment:", import.meta.env.MODE);
console.log("[axios] baseURL =", API_BASE_URL);

export const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 10000, // 10 секунд таймаут
  withCredentials: true, // Важно для CORS
});

// Добавляем интерцепторы для логирования и токена
axiosInstance.interceptors.request.use(
  (config) => {
    // Добавляем токен к каждому запросу
    const token = getStorageToken();
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    console.log("🚀 Request:", {
      method: config.method?.toUpperCase(),
      url: config.url,
      headers: {
        ...config.headers,
        Authorization: config.headers?.Authorization ? "[HIDDEN]" : undefined,
      },
      data: config.data,
    });
    return config;
  },
  (error) => {
    console.error("❌ Request Error:", error.message);
    return Promise.reject(error);
  },
);

axiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Не логируем ошибки 401 при проверке аутентификации
    if (
      error.config.url === "/auth/check-auth" &&
      error.response?.status === 401
    ) {
      return Promise.reject(error);
    }

    if (error.response) {
      // Сервер вернул ответ с кодом ошибки
      console.error("❌ Response Error:", {
        status: error.response.status,
        statusText: error.response.statusText,
        data: error.response.data,
      });
    } else if (error.request) {
      // Запрос был сделан, но ответ не получен
      console.error("❌ Network Error:", error.message);
    } else {
      // Ошибка при настройке запроса
      console.error("❌ Request Setup Error:", error.message);
    }
    return Promise.reject(error);
  },
);
