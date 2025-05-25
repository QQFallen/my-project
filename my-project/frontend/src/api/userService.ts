import { axiosInstance } from "./axiosInstance";

export const updateProfile = async (id: string, data: any) => {
  const response = await axiosInstance.put(`/users/${id}`, data);
  return response.data;
}; 