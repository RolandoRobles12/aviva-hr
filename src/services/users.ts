import { httpsCallable } from "firebase/functions";
import { functions } from "@/lib/firebase";
import { createDoc, updateDocById } from "@/hooks/useFirestore";
import { writeAuditEntry } from "@/services/audit";
import type { User } from "@/data/types";

export const USERS_PATH = "users";

export async function createUser(data: Omit<User, "id">): Promise<string> {
  const id = await createDoc(USERS_PATH, data);
  await writeAuditEntry({
    action: "creó colaborador",
    target: data.fullName,
    targetId: id,
    source: "manual",
  });
  return id;
}

export async function updateUser(
  id: string,
  data: Partial<User>,
  actorNote?: string
): Promise<void> {
  await updateDocById(USERS_PATH, id, data);
  await writeAuditEntry({
    action: actorNote ?? "actualizó colaborador",
    target: id,
    targetId: id,
    source: "manual",
  });
}

// Cloud Function callables
export const provisionUser = httpsCallable<
  { userId: string; apps: string[] },
  { success: boolean; provisioned: string[] }
>(functions, "provisionUser");

export const deprovisionUser = httpsCallable<
  { userId: string },
  { success: boolean }
>(functions, "deprovisionUser");
