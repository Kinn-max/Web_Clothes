/**
 * API Service Composable
 * Provides reusable HTTP methods with automatic token injection
 */
import type { User, ApiResponse } from "../@type/user";
export const useApi = () => {
  const config = useRuntimeConfig();
  const baseURL = config.public.apiBaseUrl;
  const getAuthHeaders = (): HeadersInit => {
   const token =localStorage.getItem('token')
   return token ? {Authorization: `Bearer ${token}`}:{}    
  };

  return { getAuthHeaders, baseURL};
};
