import * as functions from "firebase-functions";
import * as admin from "firebase-admin";

const db = admin.firestore();

export const provisionUser = functions.https.onCall(
  async (request) => {
    const { userId } = request.data as { userId: string };
    if (!userId) throw new functions.https.HttpsError("invalid-argument", "userId requerido");

    const snap = await db.collection("users").doc(userId).get();
    if (!snap.exists) throw new functions.https.HttpsError("not-found", "Usuario no encontrado");

    const user = snap.data()!;

    // In production: call IT provisioning APIs (Google Workspace, Okta, etc.)
    await db.collection("users").doc(userId).update({
      status: "active",
      provisionedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    await db.collection("auditLog").add({
      action: "user_provisioned",
      targetId: userId,
      targetName: user.fullName,
      source: "functions",
      when: admin.firestore.FieldValue.serverTimestamp(),
    });

    return { success: true };
  }
);

export const deprovisionUser = functions.https.onCall(
  async (request) => {
    const { userId, reason } = request.data as {
      userId: string;
      reason?: string;
    };
    if (!userId) throw new functions.https.HttpsError("invalid-argument", "userId requerido");

    const snap = await db.collection("users").doc(userId).get();
    if (!snap.exists) throw new functions.https.HttpsError("not-found", "Usuario no encontrado");

    const user = snap.data()!;

    // In production: revoke tokens, disable accounts in IdP, etc.
    await db.collection("users").doc(userId).update({
      status: "offboarded",
      deprovisionedAt: admin.firestore.FieldValue.serverTimestamp(),
      deprovisionReason: reason ?? null,
    });

    await db.collection("auditLog").add({
      action: "user_deprovisioned",
      targetId: userId,
      targetName: user.fullName,
      source: "functions",
      when: admin.firestore.FieldValue.serverTimestamp(),
    });

    return { success: true };
  }
);
