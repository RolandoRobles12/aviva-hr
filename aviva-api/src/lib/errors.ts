import { Response } from "express";

const DOCS = "https://api.avivacredito.com/hr/v1/docs";

export function unauthorized(res: Response, message: string) {
  return res.status(401).json({ error: "unauthorized", message, docs: `${DOCS}#auth` });
}

export function forbidden(res: Response, message: string) {
  return res.status(403).json({ error: "forbidden", message, docs: `${DOCS}#auth` });
}

export function notFound(res: Response, message: string) {
  return res.status(404).json({ error: "not_found", message });
}

export function badRequest(res: Response, message: string, fields?: Record<string, string>) {
  return res.status(400).json({ error: "bad_request", message, ...(fields ? { fields } : {}) });
}

export function tooManyRequests(res: Response) {
  return res.status(429).json({
    error:   "rate_limited",
    message: "Demasiadas peticiones. Límite: 300 req/min por API Key.",
    docs:    `${DOCS}#auth`,
  });
}

export function serverError(res: Response, err?: unknown) {
  console.error(err);
  return res.status(500).json({ error: "server_error", message: "Error interno. Inténtalo de nuevo." });
}
