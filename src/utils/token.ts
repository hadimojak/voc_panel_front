import { ACCESS_TOKEN_REFRESH_BUFFER_SECONDS } from "../config/auth";

function decodeJwtPayload(token: string): { exp?: number } | null {
  try {
    const [, payload] = token.split(".");
    if (!payload) {
      return null;
    }

    const normalized = payload.replace(/-/g, "+").replace(/_/g, "/");
    const padded = normalized.padEnd(
      normalized.length + ((4 - (normalized.length % 4)) % 4),
      "="
    );

    return JSON.parse(atob(padded)) as { exp?: number };
  } catch {
    return null;
  }
}

export function getTokenExpiresAt(token: string): number | null {
  const payload = decodeJwtPayload(token);
  if (!payload?.exp) {
    return null;
  }

  return payload.exp * 1000;
}

export function isTokenExpired(
  token: string,
  bufferSeconds = ACCESS_TOKEN_REFRESH_BUFFER_SECONDS
): boolean {
  const expiresAt = getTokenExpiresAt(token);
  if (!expiresAt) {
    return true;
  }

  return Date.now() >= expiresAt - bufferSeconds * 1000;
}
