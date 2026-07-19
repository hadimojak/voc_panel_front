import axios from "axios";
import type {
  AuthUser,
  LoginPayload,
  LoginResponse,
  MeResponse,
  RefreshResponse,
} from "../types/auth";
import { authStorage } from "../utils/authStorage";
import { isTokenExpired } from "../utils/token";

const API_BASE_URL = "http://localhost:5001";

export type SessionTokens = {
  accessToken: string;
  refreshToken: string;
  user: AuthUser;
};

export const authApi = {
  login: async (payload: LoginPayload): Promise<LoginResponse> => {
    const response = await axios.post<LoginResponse>(
      `${API_BASE_URL}/auth/login`,
      payload,
    );
    return response.data;
  },

  logout: async (accessToken: string) => {
    const response = await axios.post(
      `${API_BASE_URL}/auth/logout`,
      {},
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      },
    );
    return response.data;
  },

  refresh: async (refreshToken: string): Promise<RefreshResponse> => {
    const response = await axios.post<RefreshResponse>(
      `${API_BASE_URL}/auth/refresh`,
      {},
      {
        headers: {
          Authorization: `Bearer ${refreshToken}`,
        },
      },
    );
    return response.data;
  },

  me: async (accessToken: string): Promise<MeResponse> => {
    const response = await axios.get<MeResponse>(`${API_BASE_URL}/auth/me`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
    return response.data;
  },
};

export async function refreshSession(): Promise<SessionTokens | null> {
  const refreshToken = authStorage.getRefreshToken();

  if (!refreshToken || isTokenExpired(refreshToken, 0)) {
    authStorage.clear();
    return null;
  }

  try {
    const data = await authApi.refresh(refreshToken);
    const session: SessionTokens = {
      accessToken: data.access_token,
      refreshToken: data.refresh_token,
      user: data.user,
    };

    authStorage.save(session);
    return session;
  } catch {
    authStorage.clear();
    return null;
  }
}

export async function restoreSession(): Promise<SessionTokens | null> {
  const accessToken = authStorage.getAccessToken();
  const refreshToken = authStorage.getRefreshToken();

  if (!accessToken && !refreshToken) {
    return null;
  }

  if (refreshToken && isTokenExpired(refreshToken, 0)) {
    authStorage.clear();
    return null;
  }

  if (accessToken && !isTokenExpired(accessToken)) {
    try {
      const { user } = await authApi.me(accessToken);
      const session: SessionTokens = {
        accessToken,
        refreshToken: refreshToken ?? "",
        user,
      };

      authStorage.save(session);
      return session;
    } catch {
      return refreshSession();
    }
  }

  return refreshSession();
}
