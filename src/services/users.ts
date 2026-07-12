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
    const response = await api.get<RawUsersResponse>("/users");
    return normalizeUsersResponse(response.data);
  },

  updateUserRole: async (id: ManagedUser["id"], role: ManagedUserRole) => {
    const response = await api.patch<ManagedUser>(`/users/${id}`, { role });
    return response.data;
  },

  deleteUser: async (id: ManagedUser["id"]) => {
    const response = await api.delete(`/users/${id}`);
    return response.data;
  },
};
