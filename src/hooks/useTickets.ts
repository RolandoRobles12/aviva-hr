import { useCollection, orderBy } from "@/hooks/useFirestore";
import type { Ticket } from "@/data/types";

export const TICKETS_PATH = "tickets";

export function useTickets() {
  return useCollection<Ticket>(TICKETS_PATH, [orderBy("createdAt", "desc")]);
}
