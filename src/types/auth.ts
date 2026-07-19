export type AuthRole = 0 | 1 | 2;

export interface LoginPayload {
  username: string;
  password: string;
}

export interface AuthUser {
  id?: number;
  username: string;
  email?: string | null;
  role: AuthRole;
}

export interface LoginResponse {
  user: AuthUser;
  access_token: string;
  refresh_token: string;
}

export interface RefreshResponse {
  user: AuthUser;
  access_token: string;
  refresh_token: string;
}

export interface MeResponse {
  user: AuthUser;
}
