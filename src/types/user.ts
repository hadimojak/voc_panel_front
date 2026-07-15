export type ManagedUserRole = 0 | 1 | 2;

export type ManagedUser = {
  id: number | string;
  username: string;
  email?: string | null;
  role?: ManagedUserRole | string | null;
  roles?: Array<number | string>;
  createdAt?: string | null;
  updatedAt?: string | null;
};

export type UsersResponse = {
  users: ManagedUser[];
};
