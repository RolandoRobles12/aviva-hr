import { Router } from "express";
import { db } from "../lib/firestore";
import { authenticate, requireScope } from "../middleware/auth";
import { badRequest, notFound, serverError } from "../lib/errors";

const router = Router();

// ── GET /users ─────────────────────────────────────────────────────────────────
router.get("/", authenticate, requireScope("users:read"), async (req, res) => {
  try {
    const { hub, estado, status, q, page = "1", limit = "50" } = req.query as Record<string, string>;

    let query: FirebaseFirestore.Query = db.collection("users");

    // Firestore only allows equality filters without a composite index,
    // so we apply hub/estado/status as equality filters and do the rest in memory.
    if (hub)    query = query.where("hub",    "==", hub);
    if (estado) query = query.where("estado", "==", estado);
    if (status) query = query.where("status", "==", status);

    const snap = await query.get();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let docs: any[] = snap.docs.map(d => ({ id: d.id, ...d.data() }));

    // Text search in memory — sufficient for ~200 users
    if (q) {
      const lower = q.toLowerCase();
      docs = docs.filter(d =>
        d.nombre?.toLowerCase().includes(lower)       ||
        d.email?.toLowerCase().includes(lower)        ||
        d.num_colaborador?.toLowerCase().includes(lower)
      );
    }

    // Pagination
    const pageNum  = Math.max(1, parseInt(page)  || 1);
    const limitNum = Math.min(200, Math.max(1, parseInt(limit) || 50));
    const total    = docs.length;
    const data     = docs.slice((pageNum - 1) * limitNum, pageNum * limitNum);

    res.json({ data, meta: { page: pageNum, limit: limitNum, total } });
  } catch (err) {
    serverError(res, err);
  }
});

// ── GET /users/:id ─────────────────────────────────────────────────────────────
router.get("/:id", authenticate, requireScope("users:read"), async (req, res) => {
  try {
    const doc = await db.collection("users").doc(req.params.id).get();

    if (!doc.exists) {
      notFound(res, `Colaborador "${req.params.id}" no encontrado.`);
      return;
    }

    res.json({ id: doc.id, ...doc.data() });
  } catch (err) {
    serverError(res, err);
  }
});

// ── POST /users ────────────────────────────────────────────────────────────────
const REQUIRED_FIELDS = [
  "num_colaborador", "nombre", "email", "puesto", "hub", "estado", "fecha_ingreso",
];

router.post("/", authenticate, requireScope("users:write"), async (req, res) => {
  try {
    const body = req.body ?? {};

    // Validate required fields
    const missing: Record<string, string> = {};
    for (const field of REQUIRED_FIELDS) {
      if (!body[field]) missing[field] = "Campo requerido.";
    }
    if (Object.keys(missing).length > 0) {
      badRequest(res, "Faltan campos requeridos.", missing);
      return;
    }

    const now = new Date().toISOString();

    const user = {
      num_colaborador: body.num_colaborador,
      nombre:          body.nombre,
      email:           body.email,
      puesto:          body.puesto,
      hub:             body.hub,
      quiosco:         body.quiosco       ?? null,
      estado:          body.estado,
      jefe:            body.jefe          ?? null,
      talla:           body.talla         ?? null,
      fecha_ingreso:   body.fecha_ingreso,
      provision:       body.provision     ?? [],
      status:          "pending",
      created_at:      now,
    };

    const ref = await db.collection("users").add(user);

    await db.collection("auditLog").add({
      action:      "user_created",
      actor:       { id: req.apiKey!.id, name: req.apiKey!.author },
      target:      { id: ref.id, nombre: body.nombre },
      source:      "api",
      occurred_at: now,
    });

    const invite_sent = body.emit_invite === true;

    res.status(201).json({
      id:          ref.id,
      nombre:      body.nombre,
      status:      "pending",
      invite_sent,
      ...(invite_sent && {
        invite_expires_at: new Date(Date.now() + 7 * 86_400_000).toISOString(),
      }),
    });
  } catch (err) {
    serverError(res, err);
  }
});

// ── PATCH /users/:id ───────────────────────────────────────────────────────────
const PATCHABLE_FIELDS = ["puesto", "hub", "quiosco", "jefe", "estado", "talla", "status"];

router.patch("/:id", authenticate, requireScope("users:write"), async (req, res) => {
  try {
    const ref = db.collection("users").doc(req.params.id);
    const doc = await ref.get();

    if (!doc.exists) {
      notFound(res, `Colaborador "${req.params.id}" no encontrado.`);
      return;
    }

    const updates: Record<string, unknown> = {};
    const changed: string[] = [];

    for (const field of PATCHABLE_FIELDS) {
      if (field in (req.body ?? {})) {
        updates[field] = req.body[field];
        changed.push(field);
      }
    }

    if (changed.length === 0) {
      badRequest(
        res,
        `No se enviaron campos editables. Campos válidos: ${PATCHABLE_FIELDS.join(", ")}.`
      );
      return;
    }

    await ref.update(updates);

    const now      = new Date().toISOString();
    const auditRef = await db.collection("auditLog").add({
      action:         "user_updated",
      actor:          { id: req.apiKey!.id, name: req.apiKey!.author },
      target:         { id: req.params.id, nombre: doc.data()?.nombre },
      changed_fields: changed,
      source:         "api",
      occurred_at:    now,
    });

    res.json({ id: req.params.id, updated_fields: changed, audit_id: auditRef.id });
  } catch (err) {
    serverError(res, err);
  }
});

// ── POST /users/:id/offboard ───────────────────────────────────────────────────
router.post("/:id/offboard", authenticate, requireScope("users:delete"), async (req, res) => {
  try {
    const userRef = db.collection("users").doc(req.params.id);
    const userDoc = await userRef.get();

    if (!userDoc.exists) {
      notFound(res, `Colaborador "${req.params.id}" no encontrado.`);
      return;
    }

    const { reason, last_day, transfer_to, notes } = req.body ?? {};

    if (!reason || !last_day) {
      badRequest(res, "Campos requeridos: reason, last_day.");
      return;
    }

    const now              = new Date().toISOString();
    const pending_approvals = ["Manager directo", "HR Business Partner"];

    const ticketRef = await db.collection("tickets").add({
      type:               "offboarding",
      user:               { id: req.params.id, nombre: userDoc.data()?.nombre ?? userDoc.data()?.fullName },
      reason,
      last_day,
      transfer_to:        transfer_to ?? null,
      notes:              notes       ?? null,
      status:             "pending_approval",
      pending_approvals,
      tasks:              { total: 0, done: 0, failed: 0 },
      created_by:         req.apiKey!.author,
      createdAt:          now,
    });

    await db.collection("auditLog").add({
      action:      "offboarding_created",
      actor:       { id: req.apiKey!.id, name: req.apiKey!.author },
      target:      { id: req.params.id, nombre: userDoc.data()?.nombre ?? userDoc.data()?.fullName },
      ticket_id:   ticketRef.id,
      source:      "api",
      occurred_at: now,
    });

    res.status(201).json({
      ticket_id:          ticketRef.id,
      user_id:            req.params.id,
      status:             "pending_approval",
      pending_approvals,
    });
  } catch (err) {
    serverError(res, err);
  }
});

export default router;
