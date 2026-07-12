export type ManagedUserRole = 0 | 1;

export type ManagedUser = {
  id: number | string;
  username: string;
  email?: string | null;
  role?: ManagedUserRole | string | null;
  roles?: Array<number | string>;
  created_at?: string | null;
  updated_at?: string | null;
};

export type UsersResponse = {
  users: ManagedUser[];
};
