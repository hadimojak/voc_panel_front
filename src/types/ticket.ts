export type Ticket = {
  ticketid: string;
  ticket_no: string | null;
  nationalcode: string | null;
  accountname: string | null;
  fname: string | null;
  lname: string | null;
  mobile: string | null;
  productname: string | null;
  branchname: string | null;
  mainticket: string | null;
  subticket: string | null;
  reqtypeticket: string | null;
  createdtime: string | null;
  tickettype: string | null;
  complainttext: string | null;
  maincomplaint: string | null;
  complaintstatus: string | null;
  finalanswer: string | null;
  closeddate: string | null;
  description: string | null;
  mainrequest: string | null;
  mainoffer: string | null;
  ownername: string | null;
};

export type TicketsResponse = {
  tickets: Ticket[];
  total: number | null;
};
