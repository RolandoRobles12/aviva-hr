import { Request, Response, NextFunction } from "express";
import { tooManyRequests } from "../lib/errors";

const WINDOW_MS = 60_000;
const MAX_REQ   = 300;

// In-memory store: keyId → { count, resetAt }
// Sufficient for a single-instance Cloud Run service.
const store = new Map<string, { count: number; resetAt: number }>();

export function rateLimit(req: Request, res: Response, next: NextFunction) {
  if (!req.apiKey) { next(); return; }

  const keyId = req.apiKey.id;
  const now   = Date.now();
  const entry = store.get(keyId);

  if (!entry || now > entry.resetAt) {
    store.set(keyId, { count: 1, resetAt: now + WINDOW_MS });
    next();
    return;
  }

  if (entry.count >= MAX_REQ) {
    const retryAfter = Math.ceil((entry.resetAt - now) / 1000);
    res.setHeader("Retry-After", retryAfter);
    tooManyRequests(res);
    return;
  }

  entry.count++;
  next();
}
