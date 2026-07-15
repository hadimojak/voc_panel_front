import type { AuthUser } from "../types/auth";
import type { ManagedUser } from "../types/user";

type RoleUser = Partial<AuthUser> | Partial<ManagedUser> | null | undefined;

export function getUserRoleValue(user: RoleUser): 0 | 1 | 2 {
  if (!user) {
    return 2;
  }

  const role = user.role ?? user.roles?.[0] ?? 2;
  const roleValue = String(role).toLowerCase();

  if (roleValue === "0" || roleValue === "superadmin") {
    return 0;
  }

  if (roleValue === "1" || roleValue === "admin") {
    return 1;
  }

  return 2;
}

export function isAdminUser(user: RoleUser): boolean {
  const role = getUserRoleValue(user);
  return role === 0 || role === 1;
}
