import * as functions from "firebase-functions";
import * as admin from "firebase-admin";

const db = admin.firestore();

export const sendCandidateInvitation = functions.https.onCall(
  async (request) => {
    const { candidateId } = request.data as { candidateId: string };
    if (!candidateId) throw new functions.https.HttpsError("invalid-argument", "candidateId requerido");

    const snap = await db.collection("candidates").doc(candidateId).get();
    if (!snap.exists) throw new functions.https.HttpsError("not-found", "Candidato no encontrado");

    const candidate = snap.data()!;

    // In production: call email provider (SendGrid, Mailgun, etc.)
    // For now, record the invitation in Firestore
    await db.collection("candidates").doc(candidateId).update({
      invitationSentAt: admin.firestore.FieldValue.serverTimestamp(),
      stage: "form_sent",
    });

    await db.collection("auditLog").add({
      action: "invitation_sent",
      targetId: candidateId,
      targetName: candidate.fullName,
      source: "functions",
      when: admin.firestore.FieldValue.serverTimestamp(),
    });

    return { success: true, email: candidate.email };
  }
);

export const approveExpediente = functions.https.onCall(
  async (request) => {
    const { candidateId, reviewerId } = request.data as {
      candidateId: string;
      reviewerId: string;
    };
    if (!candidateId) throw new functions.https.HttpsError("invalid-argument", "candidateId requerido");

    const snap = await db.collection("candidates").doc(candidateId).get();
    if (!snap.exists) throw new functions.https.HttpsError("not-found", "Candidato no encontrado");

    const candidate = snap.data()!;

    await db.collection("candidates").doc(candidateId).update({
      stage: "offer",
      docsReviewedAt: admin.firestore.FieldValue.serverTimestamp(),
      docsReviewedBy: reviewerId ?? null,
    });

    await db.collection("auditLog").add({
      action: "expediente_approved",
      targetId: candidateId,
      targetName: candidate.fullName,
      actorId: reviewerId ?? null,
      source: "functions",
      when: admin.firestore.FieldValue.serverTimestamp(),
    });

    return { success: true };
  }
);

export const rejectExpediente = functions.https.onCall(
  async (request) => {
    const { candidateId, reviewerId, reason } = request.data as {
      candidateId: string;
      reviewerId: string;
      reason?: string;
    };
    if (!candidateId) throw new functions.https.HttpsError("invalid-argument", "candidateId requerido");

    const snap = await db.collection("candidates").doc(candidateId).get();
    if (!snap.exists) throw new functions.https.HttpsError("not-found", "Candidato no encontrado");

    const candidate = snap.data()!;

    await db.collection("candidates").doc(candidateId).update({
      stage: "docs_rejected",
      docsRejectedAt: admin.firestore.FieldValue.serverTimestamp(),
      docsRejectedBy: reviewerId ?? null,
      docsRejectionReason: reason ?? null,
    });

    await db.collection("auditLog").add({
      action: "expediente_rejected",
      targetId: candidateId,
      targetName: candidate.fullName,
      actorId: reviewerId ?? null,
      source: "functions",
      when: admin.firestore.FieldValue.serverTimestamp(),
    });

    return { success: true };
  }
);

export const onCandidateStageChange = functions.firestore
  .document("candidates/{candidateId}")
  .onUpdate(async (change, context) => {
    const before = change.before.data();
    const after = change.after.data();

    if (before.stage === after.stage) return null;

    await db.collection("auditLog").add({
      action: "stage_changed",
      targetId: context.params.candidateId,
      targetName: after.fullName,
      meta: { from: before.stage, to: after.stage },
      source: "trigger",
      when: admin.firestore.FieldValue.serverTimestamp(),
    });

    return null;
  });
