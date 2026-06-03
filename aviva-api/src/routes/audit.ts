import { Router } from "express";
import { db } from "../lib/firestore";
import { authenticate, requireScope } from "../middleware/auth";
import { serverError } from "../lib/errors";

const router = Router();

// ── GET /audit ─────────────────────────────────────────────────────────────────
router.get("/", authenticate, requireScope("audit:read"), async (req, res) => {
  try {
    const { from, to, actor, action, page = "1", limit = "50" } = req.query as Record<string, string>;

    let query: FirebaseFirestore.Query = db.collection("auditLog").orderBy("occurred_at", "desc");

    if (from)   query = query.where("occurred_at", ">=", from);
    if (to)     query = query.where("occurred_at", "<=", to);
    if (actor)  query = query.where("actor.id",    "==", actor);
    if (action) query = query.where("action",      "==", action);

    const pageNum  = Math.max(1, parseInt(page)  || 1);
    const limitNum = Math.min(500, Math.max(1, parseInt(limit) || 50));

    // Fetch enough to paginate
    const snap = await query.limit((pageNum * limitNum) + 1).get();
    const all  = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    const data = all.slice((pageNum - 1) * limitNum, pageNum * limitNum);

    res.json({ data, meta: { page: pageNum, limit: limitNum, has_more: all.length > pageNum * limitNum } });
  } catch (err) {
    serverError(res, err);
  }
});

export default router;
