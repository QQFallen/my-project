import { axiosInstance } from "./axiosInstance";
import {
  getToken as getStorageToken,
  removeToken,
  saveToken,
} from "@utils/localStorage";

interface LoginData {
  email: string;
  password: string;
}

interface RegisterData {
  email: string;
  password: string;
  name?: string;
}

interface AuthResponse {
  success: boolean;
  token?: string;
  user?: {
    id: string;
    email: string;
    name?: string;
  };
  message?: string;
}

export const login = async (data: LoginData): Promise<AuthResponse> => {
  const response = await axiosInstance.post<AuthResponse>("/auth/login", data);
  if (response.data.success && response.data.token) {
    saveToken(response.data.token);
  }
  return response.data;
};

export const register = async (data: RegisterData): Promise<AuthResponse> => {
  try {
    const response = await axiosInstance.post<AuthResponse>(
      "/auth/register",
      data,
    );
    if (response.data.success && response.data.token) {
      saveToken(response.data.token);
    }
    return response.data;
  } catch (error: any) {
    // eslint-disable-line @typescript-eslint/no-explicit-any
    if (error.response?.data?.message?.includes("уже существует")) {
      throw new Error("Пользователь с таким email уже зарегистрирован");
    }
    throw error;
  }
};

export const checkAuth = async (): Promise<AuthResponse> => {
  const response = await axiosInstance.get<AuthResponse>("/auth/check-auth");
  return response.data;
};

export const logout = async (): Promise<void> => {
  const token = getStorageToken();
  if (token) {
    try {
      await axiosInstance.post("/auth/logout");
    } finally {
      removeToken();
    }
  }
};

export const isAuthenticated = (): boolean => {
  return !!getStorageToken();
};
