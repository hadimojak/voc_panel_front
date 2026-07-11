const ACCESS_TOKEN_KEY = "accessToken";
const REFRESH_TOKEN_KEY = "refreshToken";
const USER_KEY = "authUser";

type StoredUser = {
  id?: number;
  username: string;
  email?: string | null;
};

type StoredTokens = {
  accessToken: string;
  refreshToken: string;
};

export const authStorage = {
  getAccessToken: () => localStorage.getItem(ACCESS_TOKEN_KEY),
  getRefreshToken: () => localStorage.getItem(REFRESH_TOKEN_KEY),
  getUser: (): StoredUser | null => {
    const rawUser = localStorage.getItem(USER_KEY);

    if (!rawUser) {
      return null;
    }

    try {
      return JSON.parse(rawUser) as StoredUser;
    } catch {
      localStorage.removeItem(USER_KEY);
      return null;
    }
  },
  hasTokens: () =>
    Boolean(
      localStorage.getItem(ACCESS_TOKEN_KEY) ||
        localStorage.getItem(REFRESH_TOKEN_KEY)
    ),
  save: ({ accessToken, refreshToken }: StoredTokens) => {
    localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
    localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
  },
  saveUser: (user: StoredUser) => {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  },
  saveFromResponse: (data: { access_token: string; refresh_token?: string }) => {
    localStorage.setItem(ACCESS_TOKEN_KEY, data.access_token);

    if (data.refresh_token) {
      localStorage.setItem(REFRESH_TOKEN_KEY, data.refresh_token);
    }
  },
  clear: () => {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  },
};
