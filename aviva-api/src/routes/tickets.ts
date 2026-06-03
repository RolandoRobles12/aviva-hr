import { Router } from "express";
import { db } from "../lib/firestore";
import { authenticate, requireScope } from "../middleware/auth";
import { badRequest, notFound, serverError } from "../lib/errors";

const router = Router();

// ── GET /tickets ───────────────────────────────────────────────────────────────
router.get("/", authenticate, requireScope("tickets:read"), async (req, res) => {
  try {
    const { type, status, page = "1", limit = "50" } = req.query as Record<string, string>;

    let query: FirebaseFirestore.Query = db.collection("tickets");
    if (type)   query = query.where("type",   "==", type);
    if (status) query = query.where("status", "==", status);

    const snap = await query.orderBy("createdAt", "desc").get();

    const pageNum  = Math.max(1, parseInt(page) || 1);
    const limitNum = Math.min(200, Math.max(1, parseInt(limit) || 50));
    const all      = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    const total    = all.length;
    const data     = all.slice((pageNum - 1) * limitNum, pageNum * limitNum);

    res.json({ data, meta: { page: pageNum, limit: limitNum, total } });
  } catch (err) {
    serverError(res, err);
  }
});

// ── POST /tickets/:id/approve ──────────────────────────────────────────────────
router.post("/:id/approve", authenticate, requireScope("tickets:write"), async (req, res) => {
  try {
    const ref = db.collection("tickets").doc(req.params.id);
    const doc = await ref.get();

    if (!doc.exists) {
      notFound(res, `Ticket "${req.params.id}" no encontrado.`);
      return;
    }

    const { stage, approver_id, notes } = req.body ?? {};

    if (!stage || !approver_id) {
      badRequest(res, "Campos requeridos: stage, approver_id.");
      return;
    }

    const ticket        = doc.data()!;
    const pendingBefore = (ticket.pending_approvals as string[]) ?? [];
    const pendingAfter  = pendingBefore.filter((s: string) => s !== stage);
    const nextStage     = pendingAfter[0] ?? null;
    const newStatus     = pendingAfter.length === 0 ? "in_progress" : "pending_approval";

    await ref.update({ pending_approvals: pendingAfter, status: newStatus });

    const now = new Date().toISOString();
    await db.collection("auditLog").add({
      action:      "ticket_approved",
      actor:       { id: approver_id },
      target:      { id: req.params.id },
      stage,
      notes:       notes ?? null,
      source:      "api",
      occurred_at: now,
    });

    res.json({
      ticket_id:      req.params.id,
      stage_approved: stage,
      next_stage:     nextStage,
      status:         newStatus,
    });
  } catch (err) {
    serverError(res, err);
  }
});

export default router;
