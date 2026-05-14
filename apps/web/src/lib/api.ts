import axios, { AxiosError, type AxiosInstance } from 'axios';
import toast from 'react-hot-toast';

const API_URL = import.meta.env.VITE_API_URL || '/api';

class ApiClient {
  private client: AxiosInstance;
  private refreshing = false;
  private queue: Array<(token: string) => void> = [];

  constructor() {
    this.client = axios.create({
      baseURL: API_URL,
      timeout: 30000,
      headers: { 'Content-Type': 'application/json' },
    });

    this.client.interceptors.request.use((config) => {
      const token = localStorage.getItem('accessToken');
      if (token) config.headers.Authorization = `Bearer ${token}`;
      return config;
    });

    this.client.interceptors.response.use(
      (response) => response,
      async (error: AxiosError) => {
        const originalRequest: any = error.config;

        if (
          error.response?.status === 401 &&
          !originalRequest._retry &&
          originalRequest.url !== '/auth/login' &&
          originalRequest.url !== '/auth/refresh'
        ) {
          if (this.refreshing) {
            return new Promise((resolve) => {
              this.queue.push((token: string) => {
                originalRequest.headers.Authorization = `Bearer ${token}`;
                resolve(this.client(originalRequest));
              });
            });
          }

          originalRequest._retry = true;
          this.refreshing = true;

          try {
            const refreshToken = localStorage.getItem('refreshToken');
            if (!refreshToken) throw new Error('Pas de refresh token');

            const { data } = await axios.post(`${API_URL}/auth/refresh`, { refreshToken });
            const { accessToken, refreshToken: newRefresh } = data.data;

            localStorage.setItem('accessToken', accessToken);
            localStorage.setItem('refreshToken', newRefresh);

            this.queue.forEach((cb) => cb(accessToken));
            this.queue = [];

            originalRequest.headers.Authorization = `Bearer ${accessToken}`;
            return this.client(originalRequest);
          } catch (refreshErr) {
            localStorage.clear();
            window.location.href = '/login';
            return Promise.reject(refreshErr);
          } finally {
            this.refreshing = false;
          }
        }

        const message = (error.response?.data as any)?.error?.message || error.message;
        if (error.response?.status !== 401) {
          toast.error(message || 'Une erreur est survenue');
        }

        return Promise.reject(error);
      }
    );
  }

  get<T = any>(url: string, params?: any) {
    return this.client.get<{ success: boolean; data: T; meta?: any }>(url, { params });
  }

  post<T = any>(url: string, data?: any) {
    return this.client.post<{ success: boolean; data: T }>(url, data);
  }

  put<T = any>(url: string, data?: any) {
    return this.client.put<{ success: boolean; data: T }>(url, data);
  }

  patch<T = any>(url: string, data?: any) {
    return this.client.patch<{ success: boolean; data: T }>(url, data);
  }

  delete<T = any>(url: string) {
    return this.client.delete<{ success: boolean; data: T }>(url);
  }
}

export const api = new ApiClient();
