import { createHash } from "crypto";
import { Request, Response, NextFunction } from "express";
import { db } from "../lib/firestore";
import { forbidden, unauthorized } from "../lib/errors";

export interface ApiKeyRecord {
  id:       string;
  name:     string;
  prefix:   string;
  scopes:   string[];
  status:   string;
  author:   string;
  keyHash:  string;
}

export function hashKey(raw: string): string {
  return createHash("sha256").update(raw).digest("hex");
}

// Middleware — verifica que el Bearer token exista en Firestore y no esté revocado.
// Adjunta el registro de la key a req.apiKey para que los handlers lean name/scopes.
export async function authenticate(req: Request, res: Response, next: NextFunction) {
  const header = req.headers.authorization;

  if (!header?.startsWith("Bearer ")) {
    unauthorized(res, "Header Authorization ausente. Formato: Authorization: Bearer <api-key>");
    return;
  }

  const token = header.slice(7).trim();
  const hash  = hashKey(token);

  let snap;
  try {
    snap = await db.collection("apiKeys").where("keyHash", "==", hash).limit(1).get();
  } catch {
    unauthorized(res, "Error al validar la API Key.");
    return;
  }

  if (snap.empty) {
    unauthorized(res, "API Key inválida o revocada.");
    return;
  }

  const doc    = snap.docs[0];
  const record = { id: doc.id, ...doc.data() } as ApiKeyRecord;

  if (record.status === "revoked") {
    unauthorized(res, "Esta API Key ha sido revocada.");
    return;
  }

  // Actualiza lastUsed sin bloquear el request
  doc.ref.update({ lastUsed: new Date().toISOString() }).catch(() => null);

  req.apiKey = record;
  next();
}

// Factoría de middleware — verifica que la key tenga el scope requerido.
// Usar después de authenticate: router.get("/users", authenticate, requireScope("users:read"), handler)
export function requireScope(scope: string) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.apiKey?.scopes.includes(scope)) {
      forbidden(res, `Esta API Key no tiene el scope requerido: ${scope}`);
      return;
    }
    next();
  };
}
