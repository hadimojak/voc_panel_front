import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { TICKETS_PAGE_SIZE, ticketsApi } from "../services/tickets";
import type { Ticket } from "../types/ticket";

const ticketColumns: Array<{
  key: keyof Ticket;
  label: string;
  className?: string;
}> = [
  { key: "ticket_no", label: "Ticket No" },
  { key: "createdtime", label: "Created" },
  { key: "accountname", label: "Account" },
  { key: "fname", label: "First Name" },
  { key: "lname", label: "Last Name" },
  { key: "mobile", label: "Mobile" },
  { key: "nationalcode", label: "National Code" },
  { key: "productname", label: "Product" },
  { key: "branchname", label: "Branch" },
  { key: "tickettype", label: "Type" },
  { key: "mainticket", label: "Main Ticket" },
  { key: "subticket", label: "Sub Ticket" },
  { key: "reqtypeticket", label: "Request Type" },
  { key: "maincomplaint", label: "Main Complaint" },
  { key: "complaintstatus", label: "Status" },
  { key: "ownername", label: "Owner" },
  {
    key: "complainttext",
    label: "Complaint",
    className: "tickets-table__cell--wide",
  },
  {
    key: "finalanswer",
    label: "Final Answer",
    className: "tickets-table__cell--wide",
  },
  { key: "closeddate", label: "Closed Date" },
  {
    key: "description",
    label: "Description",
    className: "tickets-table__cell--wide",
  },
  { key: "mainrequest", label: "Main Request" },
  { key: "mainoffer", label: "Main Offer" },
];

function formatTicketValue(ticket: Ticket, key: keyof Ticket) {
  const value = ticket[key];

  if (!value) {
    return "-";
  }

  if (key === "createdtime") {
    const date = new Date(value);

    if (!Number.isNaN(date.getTime())) {
      return date.toLocaleString();
    }
  }

  return String(value);
}

export default function TicketsPage() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;

    async function loadTickets() {
      try {
        setLoading(true);
        setError("");

        const data = await ticketsApi.getTickets(page);
        console.log({ data });

        if (!isMounted) {
          return;
        }

        setTickets(data.tickets);
        setTotal(data.total);
      } catch (err) {
        if (!isMounted) {
          return;
        }

        if (axios.isAxiosError(err)) {
          setError(err.response?.data?.message || "Could not load tickets.");
        } else {
          setError("Something went wrong while loading tickets.");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    void loadTickets();

    return () => {
      isMounted = false;
    };
  }, [page]);

  const pageCount = useMemo(() => {
    if (total === null) {
      return null;
    }

    return Math.max(Math.ceil(total / TICKETS_PAGE_SIZE), 1);
  }, [total]);

  const hasNextPage =
    pageCount === null
      ? tickets.length === TICKETS_PAGE_SIZE
      : page < pageCount;
  const firstRow = (page - 1) * TICKETS_PAGE_SIZE + 1;
  const lastRow = firstRow + tickets.length - 1;

  return (
    <div className="tickets-page">
      <div className="tickets-page__header">
        <div>
          <h2>Tickets</h2>
          <p>
            {total === null
              ? `${tickets.length} rows on page ${page}`
              : `${firstRow}-${lastRow} of ${total} tickets`}
          </p>
        </div>
      </div>

      {error ? <p className="tickets-page__error">{error}</p> : null}

      <div className="tickets-table-shell">
        <table className="tickets-table">
          <thead>
            <tr>
              <th>ID</th>
              {ticketColumns.map((column) => (
                <th key={column.key}>{column.label}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td
                  colSpan={ticketColumns.length + 1}
                  className="tickets-table__empty"
                >
                  Loading tickets...
                </td>
              </tr>
            ) : tickets.length > 0 ? (
              tickets.map((ticket) => (
                <tr key={ticket.ticketid}>
                  <td>{ticket.ticketid}</td>
                  {ticketColumns.map((column) => (
                    <td key={column.key} className={column.className}>
                      {formatTicketValue(ticket, column.key)}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={ticketColumns.length + 1}
                  className="tickets-table__empty"
                >
                  No tickets found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="tickets-pagination">
        <button
          type="button"
          onClick={() => setPage((currentPage) => Math.max(currentPage - 1, 1))}
          disabled={page === 1 || loading}
        >
          Previous
        </button>
        <span>
          Page {page}
          {pageCount ? ` of ${pageCount}` : ""}
        </span>
        <button
          type="button"
          onClick={() => setPage((currentPage) => currentPage + 1)}
          disabled={!hasNextPage || loading}
        >
          Next
        </button>
      </div>
    </div>
  );
}
