import type { AuthUser } from "../types/auth";

export function isAdminUser(user?: AuthUser | null) {
  const role = String(user?.role).toLowerCase();
  return role === "0" || role === "admin";
}
