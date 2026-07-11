import axios, { type InternalAxiosRequestConfig } from "axios";
import { authStorage } from "../utils/authStorage";
import { isTokenExpired } from "../utils/token";
import { refreshSession } from "./auth";

const API_BASE_URL = "http://localhost:5001";

type RetriableRequestConfig = InternalAxiosRequestConfig & {
  _retry?: boolean;
};

let onUnauthorized: (() => void) | null = null;

export function setOnUnauthorized(callback: () => void) {
  onUnauthorized = callback;
}

export const api = axios.create({
  baseURL: API_BASE_URL,
});

api.interceptors.request.use((config) => {
  const accessToken = authStorage.getAccessToken();

  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }

  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config as RetriableRequestConfig | undefined;

    if (
      !axios.isAxiosError(error) ||
      error.response?.status !== 401 ||
      !originalRequest ||
      originalRequest._retry ||
      originalRequest.url?.includes("/auth/refresh") ||
      originalRequest.url?.includes("/auth/login")
    ) {
      return Promise.reject(error);
    }

    originalRequest._retry = true;

    const refreshToken = authStorage.getRefreshToken();
    if (!refreshToken || isTokenExpired(refreshToken, 0)) {
      onUnauthorized?.();
      return Promise.reject(error);
    }

    const session = await refreshSession();
    if (!session) {
      onUnauthorized?.();
      return Promise.reject(error);
    }

    originalRequest.headers.Authorization = `Bearer ${session.accessToken}`;
    return api(originalRequest);
  }
);
