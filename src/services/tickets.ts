import { httpsCallable } from "firebase/functions";
import { functions } from "@/lib/firebase";
import { createDoc, updateDocById } from "@/hooks/useFirestore";
import { writeAuditEntry } from "@/services/audit";
import type { Ticket } from "@/data/types";

export const TICKETS_PATH = "tickets";

export async function createOffboardingTicket(
  data: Omit<Ticket, "id">
): Promise<string> {
  const id = await createDoc(TICKETS_PATH, data);
  await writeAuditEntry({
    action: "creó ticket de baja",
    target: data.userId,
    targetId: id,
    source: "manual",
  });
  return id;
}

export async function updateTicketStatus(
  id: string,
  status: Ticket["status"]
): Promise<void> {
  await updateDocById(TICKETS_PATH, id, { status });
}

// Cloud Function callables
export const submitApproval = httpsCallable<
  { ticketId: string; role: string; decision: "approved" | "rejected"; note?: string },
  { success: boolean; allApproved: boolean }
>(functions, "submitOffboardingApproval");

export const executeOffboarding = httpsCallable<
  { ticketId: string },
  { success: boolean; tasksCompleted: string[] }
>(functions, "executeOffboarding");
