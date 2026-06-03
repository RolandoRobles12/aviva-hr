import { Router } from "express";
import { db } from "../lib/firestore";
import { authenticate, requireScope } from "../middleware/auth";
import { serverError } from "../lib/errors";

const router = Router();

// ── GET /locations ─────────────────────────────────────────────────────────────
router.get("/", authenticate, requireScope("users:read"), async (req, res) => {
  try {
    const { estado, status, producto, q, page = "1", limit = "50" } = req.query as Record<string, string>;

    let query: FirebaseFirestore.Query = db.collection("locations");

    if (estado)   query = query.where("estado",   "==", estado);
    if (status)   query = query.where("status",   "==", status);
    if (producto) query = query.where("producto", "==", producto);

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

export default router;
