import { Router } from "express";
import { db } from "../lib/firestore";
import { authenticate, requireScope } from "../middleware/auth";
import { badRequest, notFound, serverError } from "../lib/errors";
import { FieldValue } from "firebase-admin/firestore";

const router = Router();

// ── GET /locations ─────────────────────────────────────────────────────────────
router.get("/", authenticate, requireScope("locations:read"), async (req, res) => {
  try {
    const { estado, status, producto, region, q, page = "1", limit = "50" } = req.query as Record<string, string>;

    let query: FirebaseFirestore.Query = db.collection("locations");

    if (estado)   query = query.where("estado",   "==", estado);
    if (status)   query = query.where("status",   "==", status);
    if (producto) query = query.where("producto", "==", producto);
    if (region)   query = query.where("region",   "==", region);

    const snap = await query.get();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let docs: any[] = snap.docs.map(d => ({ id: d.id, ...d.data() }));

    if (q) {
      const lower = q.toLowerCase();
      docs = docs.filter(d =>
        d.ciudad?.toLowerCase().includes(lower)    ||
        d.code?.toLowerCase().includes(lower)      ||
        d.gerente?.toLowerCase().includes(lower)   ||
        d.ubicacion?.toLowerCase().includes(lower) ||
        d.catLabel?.toLowerCase().includes(lower)
      );
    }

    const pageNum  = Math.max(1, parseInt(page)  || 1);
    const limitNum = Math.min(200, Math.max(1, parseInt(limit) || 50));
    const total    = docs.length;
    const data     = docs.slice((pageNum - 1) * limitNum, pageNum * limitNum);

    res.json({ data, meta: { page: pageNum, limit: limitNum, total } });
  } catch (err) {
    serverError(res, err);
  }
});

// ── GET /locations/:id ────────────────────────────────────────────────────────
router.get("/:id", authenticate, requireScope("locations:read"), async (req, res) => {
  try {
    const snap = await db.collection("locations").doc(req.params.id).get();
    if (!snap.exists) return notFound(res, "Locación no encontrada.");
    res.json({ id: snap.id, ...snap.data() });
  } catch (err) {
    serverError(res, err);
  }
});

// ── POST /locations ───────────────────────────────────────────────────────────
router.post("/", authenticate, requireScope("locations:write"), async (req, res) => {
  try {
    const { code, ciudad, estado, ubicacion, producto, hub, gerente, fechaApertura } = req.body;

    if (!code || !ciudad || !estado || !producto || !hub) {
      return badRequest(res, "Campos requeridos: code, ciudad, estado, producto, hub.");
    }

    const existing = await db.collection("locations").where("code", "==", code).limit(1).get();
    if (!existing.empty) return badRequest(res, `Ya existe una locación con el código ${code}.`);

    const payload = {
      code, ciudad, estado, producto, hub,
      ...(ubicacion    ? { ubicacion }    : {}),
      ...(gerente      ? { gerente }      : {}),
      ...(fechaApertura ? { fechaApertura } : {}),
      status: "open",
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    };

    const ref = await db.collection("locations").add(payload);
    res.status(201).json({ id: ref.id, code, status: "open", created_at: new Date().toISOString() });
  } catch (err) {
    serverError(res, err);
  }
});

// ── PATCH /locations/:id ──────────────────────────────────────────────────────
router.patch("/:id", authenticate, requireScope("locations:write"), async (req, res) => {
  try {
    const ref  = db.collection("locations").doc(req.params.id);
    const snap = await ref.get();
    if (!snap.exists) return notFound(res, "Locación no encontrada.");

    const allowed = ["gerente", "ubicacion", "status", "hub", "ciudad", "estado", "producto", "fechaApertura", "code"];
    const updates: Record<string, unknown> = {};
    for (const key of allowed) {
      if (key in req.body) updates[key] = req.body[key];
    }

    if (Object.keys(updates).length === 0) return badRequest(res, "No se enviaron campos para actualizar.");

    updates.updatedAt = FieldValue.serverTimestamp();
    await ref.update(updates);

    const auditRef = await db.collection("audit").add({
      action:        "location_updated",
      targetId:      req.params.id,
      changedFields: Object.keys(updates).filter(k => k !== "updatedAt"),
      occurredAt:    FieldValue.serverTimestamp(),
    });

    res.json({ id: req.params.id, updated_fields: Object.keys(updates).filter(k => k !== "updatedAt"), audit_id: auditRef.id });
  } catch (err) {
    serverError(res, err);
  }
});

// ── DELETE /locations/:id ─────────────────────────────────────────────────────
router.delete("/:id", authenticate, requireScope("locations:delete"), async (req, res) => {
  try {
    const ref  = db.collection("locations").doc(req.params.id);
    const snap = await ref.get();
    if (!snap.exists) return notFound(res, "Locación no encontrada.");

    await ref.delete();

    const auditRef = await db.collection("audit").add({
      action:     "location_deleted",
      targetId:   req.params.id,
      snapshot:   snap.data(),
      occurredAt: FieldValue.serverTimestamp(),
    });

    res.json({ id: req.params.id, deleted: true, audit_id: auditRef.id });
  } catch (err) {
    serverError(res, err);
  }
});

export default router;
