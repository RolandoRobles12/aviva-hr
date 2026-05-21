import { useCollection, orderBy } from "@/hooks/useFirestore";

export interface AuditEvent {
  actor?: string;
  actorId?: string;
  action: string;
  target: string;
  targetId?: string;
  source: "manual" | "auto" | string;
  when: string;
  metadata?: Record<string, unknown>;
}

export const AUDIT_PATH = "auditLog";

export function useAuditLog(limit = 100) {
  return useCollection<AuditEvent>(AUDIT_PATH, [orderBy("when", "desc")]);
}
