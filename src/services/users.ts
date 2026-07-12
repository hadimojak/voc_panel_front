import { api } from "./api";
import type { ManagedUser, ManagedUserRole, UsersResponse } from "../types/user";

type RawUsersResponse =
  | ManagedUser[]
  | {
      users?: ManagedUser[];
      data?: ManagedUser[];
      items?: ManagedUser[];
      results?: ManagedUser[];
    };

function normalizeUsersResponse(payload: RawUsersResponse): UsersResponse {
  if (Array.isArray(payload)) {
    return {
      users: payload,
    };
  }

  return {
    users:
      payload.users ??
      payload.data ??
      payload.items ??
      payload.results ??
      [],
  };
}

export const usersApi = {
  getUsers: async () => {
    const response = await api.get<RawUsersResponse>("/user");
    return normalizeUsersResponse(response.data);
  },

  createUser: async (userData: {
    username: string;
    email?: string;
    password: string; // required by backend
    role: ManagedUserRole;
  }) => {
    const response = await api.post<ManagedUser>("/user", userData);
    return response.data;
  },

  updateUser: async (
    id: ManagedUser["id"],
    updateData: Partial<ManagedUser> & { password?: string },
  ) => {
    const response = await api.patch<ManagedUser>(`/user/${id}`, updateData);
    return response.data;
  },

  updateUserRole: async (id: ManagedUser["id"], role: ManagedUserRole) => {
    const response = await api.patch<ManagedUser>(`/user/${id}`, { role });
    return response.data;
  },

  deleteUser: async (id: ManagedUser["id"]) => {
    const response = await api.delete(`/user/${id}`);
    return response.data;
  },
};
