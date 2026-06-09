import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import { WebClient } from "@slack/web-api";

const db = admin.firestore();

// Runs every day at 02:00 AM Mexico City time.
// Only processes users that still have BOTH hubspot and slackOpsId empty.
export const dailyIntegrationSync = functions
  .runWith({ timeoutSeconds: 540, memory: "256MB" })
  .pubsub.schedule("0 2 * * *")
  .timeZone("America/Mexico_City")
  .onRun(async () => {
    const hubspotKey  = process.env.HUBSPOT_API_KEY;
    const slackToken  = process.env.SLACK_BOT_TOKEN;

    if (!hubspotKey || !slackToken) {
      functions.logger.error("dailyIntegrationSync: faltan variables HUBSPOT_API_KEY o SLACK_BOT_TOKEN");
      return;
    }

    // Fetch users that are missing both IDs
    const snap = await db.collection("users")
      .where("hubspot",    "==", null)
      .where("slackOpsId", "==", null)
      .get();

    if (snap.empty) {
      functions.logger.info("dailyIntegrationSync: no hay usuarios pendientes, nada que sincronizar.");
      return;
    }

    functions.logger.info(`dailyIntegrationSync: procesando ${snap.size} usuario(s) sin IDs.`);

    // Build HubSpot owners map (email -> ownerId)
    const ownersByEmail = await fetchHubSpotOwners(hubspotKey);

    const slackClient = new WebClient(slackToken);
    const batch       = db.batch();
    let synced        = 0;

    for (const userDoc of snap.docs) {
      const email = (userDoc.data().email as string | undefined)?.toLowerCase();
      if (!email) continue;

      const hubspotId  = ownersByEmail.get(email) ?? null;
      const slackOpsId = await lookupSlackId(slackClient, email);

      // Only write if at least one ID was resolved
      if (hubspotId !== null || slackOpsId !== null) {
        batch.update(userDoc.ref, { hubspot: hubspotId, slackOpsId });
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
