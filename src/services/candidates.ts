import { httpsCallable } from "firebase/functions";
import { functions } from "@/lib/firebase";
import { createDoc, updateDocById, deleteDocById } from "@/hooks/useFirestore";
import { writeAuditEntry } from "@/services/audit";
import type { Candidate } from "@/data/types";

export const CANDIDATES_PATH = "candidates";

export async function createCandidate(data: Omit<Candidate, "id">): Promise<string> {
  const id = await createDoc(CANDIDATES_PATH, data);
  await writeAuditEntry({
    action: "creó candidato",
    target: data.fullName,
    targetId: id,
    source: "manual",
  });
  return id;
}

export async function updateCandidateStage(
  id: string,
  stage: string,
  candidateName: string
): Promise<void> {
  await updateDocById(CANDIDATES_PATH, id, { stage });
  await writeAuditEntry({
    action: `cambió etapa a ${stage}`,
    target: candidateName,
    targetId: id,
    source: "manual",
  });
}

export async function updateCandidate(
  id: string,
  data: Partial<Candidate>
): Promise<void> {
  await updateDocById(CANDIDATES_PATH, id, data);
}

export async function deleteCandidate(id: string, name: string): Promise<void> {
  await deleteDocById(CANDIDATES_PATH, id);
  await writeAuditEntry({
    action: "eliminó candidato",
    target: name,
    targetId: id,
    source: "manual",
  });
}

// Cloud Function callables
export const sendInvitationEmail = httpsCallable<
  { candidateId: string },
  { success: boolean; message: string }
>(functions, "sendCandidateInvitation");

export const approveExpediente = httpsCallable<
  { candidateId: string },
  { success: boolean }
>(functions, "approveExpediente");

export const rejectExpediente = httpsCallable<
  { candidateId: string; reason: string },
  { success: boolean }
>(functions, "rejectExpediente");
