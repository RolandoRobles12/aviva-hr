import * as functions from "firebase-functions";
import { defineSecret } from "firebase-functions/params";
import * as admin from "firebase-admin";
import { WebClient } from "@slack/web-api";

const HUBSPOT_API_KEY = defineSecret("HUBSPOT_API_KEY");
const SLACK_BOT_TOKEN = defineSecret("SLACK_BOT_TOKEN");

// Callable version for manual sync triggered from the UI
export const manualIntegrationSync = functions
  .runWith({ timeoutSeconds: 540, memory: "256MB", secrets: ["HUBSPOT_API_KEY", "SLACK_BOT_TOKEN"] })
  .https.onCall(async (_data, context) => {
    if (!context.auth) throw new functions.https.HttpsError("unauthenticated", "Login requerido");

    const hubspotKey = HUBSPOT_API_KEY.value();
    const slackToken = SLACK_BOT_TOKEN.value();
    if (!hubspotKey || !slackToken) {
      throw new functions.https.HttpsError("failed-precondition", "Faltan variables HUBSPOT_API_KEY o SLACK_BOT_TOKEN");
    }

    const db = admin.firestore();
    const [missingHubspot, missingSlack] = await Promise.all([
      db.collection("users").where("hubspot",    "==", null).get(),
      db.collection("users").where("slackOpsId", "==", null).get(),
    ]);

    const pendingById = new Map<string, FirebaseFirestore.QueryDocumentSnapshot>();
    for (const doc of [...missingHubspot.docs, ...missingSlack.docs]) pendingById.set(doc.id, doc);

    if (pendingById.size === 0) return { synced: 0 };

    const ownersByEmail = missingHubspot.size > 0 ? await fetchHubSpotOwners(hubspotKey) : new Map<string, string>();
    const slackClient = new WebClient(slackToken);
    const batch = db.batch();
    let synced = 0;

    for (const userDoc of pendingById.values()) {
      const data  = userDoc.data();
      const email = (data.email as string | undefined)?.toLowerCase();
      if (!email) continue;
      const updates: Record<string, string | null> = {};
      if (data.hubspot   === null || data.hubspot   === undefined) updates.hubspot    = ownersByEmail.get(email) ?? null;
      if (data.slackOpsId === null || data.slackOpsId === undefined) updates.slackOpsId = await lookupSlackId(slackClient, email);
      if (Object.values(updates).some(v => v !== null)) { batch.update(userDoc.ref, updates); synced++; }
    }

    await batch.commit();
    return { synced };
  });

const db = admin.firestore();

// Runs every day at 02:00 AM Mexico City time.
// Only processes users that still have BOTH hubspot and slackOpsId empty.
export const dailyIntegrationSync = functions
  .runWith({ timeoutSeconds: 540, memory: "256MB", secrets: ["HUBSPOT_API_KEY", "SLACK_BOT_TOKEN"] })
  .pubsub.schedule("0 2 * * *")
  .timeZone("America/Mexico_City")
  .onRun(async () => {
    const hubspotKey  = HUBSPOT_API_KEY.value();
    const slackToken  = SLACK_BOT_TOKEN.value();

    if (!hubspotKey || !slackToken) {
      functions.logger.error("dailyIntegrationSync: faltan variables HUBSPOT_API_KEY o SLACK_BOT_TOKEN");
      return;
    }

    // Two separate queries since Firestore doesn't support OR filters.
    // Union by doc ID to avoid processing the same user twice.
    const [missingHubspot, missingSlack] = await Promise.all([
      db.collection("users").where("hubspot",    "==", null).get(),
      db.collection("users").where("slackOpsId", "==", null).get(),
    ]);

    const pendingById = new Map<string, FirebaseFirestore.QueryDocumentSnapshot>();
    for (const doc of [...missingHubspot.docs, ...missingSlack.docs]) {
      pendingById.set(doc.id, doc);
    }

    if (pendingById.size === 0) {
      functions.logger.info("dailyIntegrationSync: no hay usuarios pendientes, nada que sincronizar.");
      return;
    }

    functions.logger.info(`dailyIntegrationSync: procesando ${pendingById.size} usuario(s) con al menos un ID faltante.`);

    // Only fetch HubSpot owners if at least one user needs it
    const needsHubspot = missingHubspot.size > 0;
    const ownersByEmail = needsHubspot
      ? await fetchHubSpotOwners(hubspotKey)
      : new Map<string, string>();

    const slackClient = new WebClient(slackToken);
    const batch       = db.batch();
    let synced        = 0;

    for (const userDoc of pendingById.values()) {
      const data  = userDoc.data();
      const email = (data.email as string | undefined)?.toLowerCase();
      if (!email) continue;

      const updates: Record<string, string | null> = {};

      if (data.hubspot === null || data.hubspot === undefined) {
        updates.hubspot = ownersByEmail.get(email) ?? null;
      }

      if (data.slackOpsId === null || data.slackOpsId === undefined) {
        updates.slackOpsId = await lookupSlackId(slackClient, email);
      }

      if (Object.values(updates).some(v => v !== null)) {
        batch.update(userDoc.ref, updates);
        synced++;
      }
    }

    await batch.commit();

    functions.logger.info(`dailyIntegrationSync: ${synced} usuario(s) actualizados.`);
  });

async function fetchHubSpotOwners(apiKey: string): Promise<Map<string, string>> {
  const ownersByEmail = new Map<string, string>();
  let after: string | undefined;

  do {
    const url = new URL("https://api.hubapi.com/crm/v3/owners");
    url.searchParams.set("limit", "100");
    if (after) url.searchParams.set("after", after);

    const response = await fetch(url.toString(), {
      headers: { Authorization: `Bearer ${apiKey}` },
    });

    if (!response.ok) {
      const body = await response.text();
      throw new Error(`HubSpot API error ${response.status}: ${body}`);
    }

    const json = await response.json() as {
      results: Array<{ id: string; email: string }>;
      paging?: { next?: { after: string } };
    };

    for (const owner of json.results) {
      if (owner.email) ownersByEmail.set(owner.email.toLowerCase(), owner.id);
    }

    after = json.paging?.next?.after;
  } while (after);

  return ownersByEmail;
}

async function lookupSlackId(client: WebClient, email: string): Promise<string | null> {
  try {
    const result = await client.users.lookupByEmail({ email });
    return result.user?.id ?? null;
  } catch {
    return null;
  }
}
