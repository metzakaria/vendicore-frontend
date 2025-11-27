import axios, { AxiosError, AxiosInstance } from "axios";

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}

const apiClient: AxiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "/api",
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

// Request interceptor
apiClient.interceptors.request.use(
  (config) => {
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error: AxiosError<ApiResponse>) => {
    if (error.response?.data?.error) {
      return Promise.reject(new Error(error.response.data.error));
    }
    if (error.message) {
      return Promise.reject(new Error(error.message));
    }
    return Promise.reject(new Error("An unexpected error occurred"));
  }
);

export default apiClient;

