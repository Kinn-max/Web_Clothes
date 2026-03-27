/**
 * API Service Composable
 * Provides reusable HTTP methods with automatic token injection
 */
import type { User, ApiResponse } from "../@type/user";
export const useApi = () => {
  const config = useRuntimeConfig();
  const baseURL = config.public.apiBaseUrl;
  const { token } = useAuth();
  const getAuthHeaders = (): HeadersInit => {
    if (token.value) {
      const token = localStorage.getItem("token");
      if (token) {
        return {
          Authorization: `Bearer ${token}`,
        };
      }
    }
    return {};
  };

  const getUsers = async () => {
    const res: any = await $fetch(`${baseURL}/users`, {
      headers: getAuthHeaders(),
    });
    return res.data || res;
  };

  const createUser = async (data: any) => {
    return await $fetch(`${baseURL}/users/create-user`, {
      method: "POST",
      body: data,
      headers: getAuthHeaders(),
    });
  };

  const updateProfile = async (id: number, formData: Partial<User>) => {
    return await $fetch(`${baseURL}/users/update-user/${id}`, {
      method: "PUT",
      body: formData,
      headers: getAuthHeaders(),
    });
  };

  const deleteUser = async (id: number) => {
    return await $fetch(`${baseURL}/users/delete-user/${id}`, {
      method: "DELETE",
      headers: getAuthHeaders(),
    });
  };
  const getMe = async ():Promise<User> => {
    const res = await $fetch<ApiResponse<User>>(`${baseURL}/users/me`, {
          method: "GET",
          headers: getAuthHeaders(),
      });
      return res.data;
    }
  return { getUsers, createUser, updateProfile, deleteUser, getMe };
};
