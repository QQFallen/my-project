import { getToken, saveToken as saveTokenToStorage } from "./localStorage";
import { checkAuth } from "@api/authService";

export const saveToken = (token: string): void => {
  saveTokenToStorage(token);
};

export const isAuthenticated = (): boolean => {
  return !!getToken();
};

export const getAuthToken = (): string | null => {
  return getToken();
};

export const setAuthToken = (token: string): void => {
  saveToken(token);
};

export const isAuthenticatedAsync = async (): Promise<boolean> => {
  const token = getToken();
  if (!token) return false;

  try {
    const res = await checkAuth();
    return !!res?.user;
  } catch {
    return false;
  }
};
