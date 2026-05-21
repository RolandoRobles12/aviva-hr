import * as functions from "firebase-functions";
import * as admin from "firebase-admin";

const db = admin.firestore();

export const submitOffboardingApproval = functions.https.onCall(
  async (request) => {
    const { ticketId, approverId, approved, comment } = request.data as {
      ticketId: string;
      approverId: string;
      approved: boolean;
      comment?: string;
    };

    if (!ticketId || !approverId) {
      throw new functions.https.HttpsError("invalid-argument", "ticketId y approverId requeridos");
    }

    const snap = await db.collection("tickets").doc(ticketId).get();
    if (!snap.exists) throw new functions.https.HttpsError("not-found", "Ticket no encontrado");

    const ticket = snap.data()!;
    const approvals: Record<string, unknown>[] = ticket.approvals ?? [];

    const updatedApprovals = approvals.map((a) =>
      a.approverId === approverId
        ? { ...a, status: approved ? "approved" : "rejected", comment: comment ?? null, at: new Date().toISOString() }
        : a
    );

    const allApproved = updatedApprovals.every((a) => a.status === "approved");
    const anyRejected = updatedApprovals.some((a) => a.status === "rejected");
    const newStatus = anyRejected ? "rejected" : allApproved ? "approved" : ticket.status;

    await db.collection("tickets").doc(ticketId).update({
      approvals: updatedApprovals,
      status: newStatus,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    await db.collection("auditLog").add({
      action: approved ? "offboarding_approved" : "offboarding_rejected",
      targetId: ticketId,
      targetName: ticket.employeeName,
      actorId: approverId,
      source: "functions",
      when: admin.firestore.FieldValue.serverTimestamp(),
    });

    return { success: true, newStatus };
  }
);

export const executeOffboarding = functions.https.onCall(
  async (request) => {
    const { ticketId } = request.data as { ticketId: string };
    if (!ticketId) throw new functions.https.HttpsError("invalid-argument", "ticketId requerido");

    const snap = await db.collection("tickets").doc(ticketId).get();
    if (!snap.exists) throw new functions.https.HttpsError("not-found", "Ticket no encontrado");

    const ticket = snap.data()!;
    if (ticket.status !== "approved") {
      throw new functions.https.HttpsError("failed-precondition", "El ticket debe estar aprobado antes de ejecutar el offboarding");
    }

    // In production: trigger deprovisionUser, archive email, close access, etc.
    await db.collection("tickets").doc(ticketId).update({
      status: "completed",
      executedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    // Update associated user status
    if (ticket.userId) {
      await db.collection("users").doc(ticket.userId).update({
        status: "offboarded",
        deprovisionedAt: admin.firestore.FieldValue.serverTimestamp(),
      });
    }

    await db.collection("auditLog").add({
      action: "offboarding_executed",
      targetId: ticketId,
      targetName: ticket.employeeName,
      source: "functions",
      when: admin.firestore.FieldValue.serverTimestamp(),
    });

    return { success: true };
  }
);

export const onOffboardingTicketCreated = functions.firestore
  .document("tickets/{ticketId}")
  .onCreate(async (snap, context) => {
    const ticket = snap.data();

    await db.collection("auditLog").add({
      action: "offboarding_ticket_created",
      targetId: context.params.ticketId,
      targetName: ticket.employeeName,
      source: "trigger",
      when: admin.firestore.FieldValue.serverTimestamp(),
    });

    return null;
  });
