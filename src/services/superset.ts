import { api } from "./api";

export interface SupersetGuestTokenResponse {
  token: string;
}

export async function getSupersetGuestToken(
  dashboardId: string,
): Promise<string> {
  const response = await api.post<SupersetGuestTokenResponse>(
    "/superset/guest-token",
    {
      dashboardId,
    },
  );

  return response.data.token;
}
