import { api } from "./api";
import type { Ticket, TicketsResponse } from "../types/ticket";

type RawTicketsResponse =
  | Ticket[]
  | {
      tickets?: Ticket[];
      data?: Ticket[];
      items?: Ticket[];
      results?: Ticket[];
      total?: number;
      count?: number;
    };

function normalizeTicketsResponse(payload: RawTicketsResponse): TicketsResponse {
  if (Array.isArray(payload)) {
    return {
      tickets: payload,
      total: null,
    };
  }

  const tickets =
    payload.tickets ??
    payload.data ??
    payload.items ??
    payload.results ??
    [];

  return {
    tickets,
    total: payload.total ?? payload.count ?? null,
  };
}

export const TICKETS_PAGE_SIZE = 60;

export const ticketsApi = {
  getTickets: async (page: number, limit = TICKETS_PAGE_SIZE) => {
    const response = await api.get<RawTicketsResponse>("/ticket", {
      params: {
        page,
        limit,
      },
    });

    return normalizeTicketsResponse(response.data);
  },
};
