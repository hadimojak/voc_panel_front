const ACCESS_TOKEN_KEY = "accessToken";
const REFRESH_TOKEN_KEY = "refreshToken";

type StoredTokens = {
  accessToken: string;
  refreshToken: string;
};

export const authStorage = {
  getAccessToken: () => localStorage.getItem(ACCESS_TOKEN_KEY),
  getRefreshToken: () => localStorage.getItem(REFRESH_TOKEN_KEY),
  hasTokens: () =>
    Boolean(
      localStorage.getItem(ACCESS_TOKEN_KEY) ||
        localStorage.getItem(REFRESH_TOKEN_KEY)
    ),
  save: ({ accessToken, refreshToken }: StoredTokens) => {
    localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
    localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
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
  },
};
