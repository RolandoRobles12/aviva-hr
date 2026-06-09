import { Router } from "express";
import { db } from "../lib/firestore";
import { authenticate, requireScope } from "../middleware/auth";
import { notFound, serverError } from "../lib/errors";
import { WebClient } from "@slack/web-api";

const router = Router();

// ── GET /integrations ──────────────────────────────────────────────────────────
router.get("/", authenticate, requireScope("integrations:read"), async (req, res) => {
  try {
    const snap = await db.collection("integrations").get();
    const data = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    res.json({ data });
  } catch (err) {
    serverError(res, err);
  }
});

// ── POST /integrations/:id/sync ────────────────────────────────────────────────
router.post("/:id/sync", authenticate, requireScope("integrations:read"), async (req, res) => {
  try {
    const ref = db.collection("integrations").doc(req.params.id);
    const doc = await ref.get();

    if (!doc.exists) {
      notFound(res, `Integración "${req.params.id}" no encontrada.`);
      return;
    }

    const syncId = `sync-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    const now    = new Date().toISOString();

    await ref.update({ syncStatus: "running", lastSyncTriggeredAt: now, lastSyncId: syncId });

    // Run sync in background so we can respond immediately
    runSync(req.params.id, syncId, ref).catch(console.error);

    res.json({
      integration:          req.params.id,
      sync_id:              syncId,
      status:               "running",
      estimated_duration_s: 15,
    });
  } catch (err) {
    serverError(res, err);
  }
});

async function runSync(
  integrationId: string,
  syncId: string,
  ref: FirebaseFirestore.DocumentReference,
): Promise<void> {
  try {
    if (integrationId === "hubspot") {
      await syncHubSpot();
    } else if (integrationId === "slack") {
      await syncSlack();
    }

    await ref.update({
      syncStatus:    "ok",
      lastSyncedAt:  new Date().toISOString(),
      lastSyncId:    syncId,
      lastSyncError: null,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    await ref.update({
      syncStatus:    "error",
      lastSyncedAt:  new Date().toISOString(),
      lastSyncId:    syncId,
      lastSyncError: message,
    });
    throw err;
  }
}

// ── HubSpot sync ───────────────────────────────────────────────────────────────
// Fetches all owners from HubSpot, matches by email to Firestore users,
// and writes the HubSpot owner ID into the `hubspot` field.
async function syncHubSpot(): Promise<void> {
  const apiKey = process.env.HUBSPOT_API_KEY;
  if (!apiKey) throw new Error("HUBSPOT_API_KEY no configurado.");

  const ownersByEmail = new Map<string, string>(); // email -> ownerId
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

  const snap = await db.collection("users").get();
  const batch = db.batch();

  for (const userDoc of snap.docs) {
    const email = (userDoc.data().email as string | undefined)?.toLowerCase();
    if (!email) continue;
    const ownerId = ownersByEmail.get(email) ?? null;
    batch.update(userDoc.ref, { hubspot: ownerId });
  }

  await batch.commit();
}

// ── Slack sync ─────────────────────────────────────────────────────────────────
// Looks up each Firestore user by email in Slack and writes their member ID
// to the `slackOpsId` field.
async function syncSlack(): Promise<void> {
  const token = process.env.SLACK_BOT_TOKEN;
  if (!token) throw new Error("SLACK_BOT_TOKEN no configurado.");

  const client = new WebClient(token);
  const snap   = await db.collection("users").get();
  const batch  = db.batch();

  for (const userDoc of snap.docs) {
    const email = userDoc.data().email as string | undefined;
    if (!email) continue;

    try {
      const result  = await client.users.lookupByEmail({ email });
      const slackId = result.user?.id ?? null;
      batch.update(userDoc.ref, { slackOpsId: slackId });
    } catch {
      // User not found in Slack workspace — clear the field
      batch.update(userDoc.ref, { slackOpsId: null });
    }
  }

  await batch.commit();
}

export default router;
