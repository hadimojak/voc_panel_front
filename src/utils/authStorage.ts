import type { AuthUser } from "../types/auth";

const ACCESS_TOKEN_KEY = "accessToken";
const REFRESH_TOKEN_KEY = "refreshToken";
const USER_KEY = "authUser";

type StoredSession = {
  accessToken: string;
  refreshToken: string;
  user?: AuthUser;
};

export const authStorage = {
  getAccessToken: () => localStorage.getItem(ACCESS_TOKEN_KEY),
  getRefreshToken: () => localStorage.getItem(REFRESH_TOKEN_KEY),
  getUser: (): AuthUser | null => {
    const rawUser = localStorage.getItem(USER_KEY);

    if (!rawUser) {
      return null;
    }

    try {
      return JSON.parse(rawUser) as AuthUser;
    } catch {
      localStorage.removeItem(USER_KEY);
      return null;
    }
  },
  hasTokens: () =>
    Boolean(
      localStorage.getItem(ACCESS_TOKEN_KEY) ||
        localStorage.getItem(REFRESH_TOKEN_KEY),
    ),
  save: ({ accessToken, refreshToken, user }: StoredSession) => {
    localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
    localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);

    if (user) {
      localStorage.setItem(USER_KEY, JSON.stringify(user));
    }
  },
  saveUser: (user: AuthUser) => {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  },
  saveFromResponse: (data: {
    access_token: string;
    refresh_token: string;
    user?: AuthUser;
  }) => {
    localStorage.setItem(ACCESS_TOKEN_KEY, data.access_token);
    localStorage.setItem(REFRESH_TOKEN_KEY, data.refresh_token);

    if (data.user) {
      localStorage.setItem(USER_KEY, JSON.stringify(data.user));
    }
  },
  clear: () => {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  },
};
