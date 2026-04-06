import axios, { AxiosError } from 'axios';

const BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8000/api/v1';

export const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000,
});

// Request interceptor — attach auth headers here if ever needed
apiClient.interceptors.request.use(
  (config) => config,
  (error) => Promise.reject(error),
);

// Response interceptor — normalize errors
apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    const message =
      (error.response?.data as { detail?: string })?.detail ??
      error.message ??
      'An unexpected error occurred';
    return Promise.reject(new Error(message));
  },
);

export default apiClient;
