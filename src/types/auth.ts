export interface LoginPayload {
  username: string;
  password: string;
}

export interface AuthUser {
  id?: number;
  username: string;
  email?: string | null;
}

export interface LoginResponse {
  user: AuthUser;
  access_token: string;
  refresh_token: string;
}

export interface RefreshResponse {
  access_token: string;
  refresh_token?: string;
}

export interface MeResponse {
  user: AuthUser;
}
