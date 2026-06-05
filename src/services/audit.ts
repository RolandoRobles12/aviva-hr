import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db, auth } from "@/lib/firebase";
import type { AuditEvent } from "@/hooks/useAuditLog";

export async function writeAuditEntry(
  entry: Omit<AuditEvent, "when">
): Promise<void> {
  try {
    const fbUser = auth.currentUser;
    await addDoc(collection(db, "auditLog"), {
      actor:    entry.actor    ?? fbUser?.displayName ?? fbUser?.email ?? "Sistema",
      actorId:  entry.actorId  ?? fbUser?.uid ?? null,
      action:   entry.action,
      target:   entry.target,
      targetId: entry.targetId ?? null,
      source:   entry.source,
      metadata: entry.metadata ?? null,
      when:     new Date().toISOString(),
      whenTs:   serverTimestamp(),
    });
  } catch (err) {
    console.error("[audit] Failed to write audit entry:", err);
  }
}
