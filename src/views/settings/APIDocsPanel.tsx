import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Close, Copy, Check, Link, Shield, ExternalLink } from "@/components/icons";
import { cn } from "@/lib/cn";

// ── Types ─────────────────────────────────────────────────────────────────────
type Section = "auth" | "endpoints" | "webhooks" | "examples";
type Lang = "curl" | "node" | "python";

// ── Constants ─────────────────────────────────────────────────────────────────
const BASE_URL = "https://api.avivacredito.com/hr/v1";

const NAV: { id: Section; label: string; sub: string }[] = [
  { id: "auth",      label: "Autenticación",      sub: "API Keys · Scopes · Errores" },
  { id: "endpoints", label: "Referencia REST",     sub: "11 endpoints documentados" },
  { id: "webhooks",  label: "Guía de Webhooks",   sub: "Firma HMAC · Reintentos" },
  { id: "examples",  label: "Ejemplos de código",  sub: "cURL · Node.js · Python" },
];

// ── Copy button ───────────────────────────────────────────────────────────────
function CopyBtn({ text }: { text: string }) {
  const [ok, setOk] = useState(false);
  function copy() {
    navigator.clipboard?.writeText(text).catch(() => null);
    setOk(true);
    setTimeout(() => setOk(false), 2000);
  }
  return (
    <button onClick={copy} className="inline-flex items-center gap-1 text-[11px] px-2 py-1 rounded bg-white/10 hover:bg-white/20 text-white/70 hover:text-white transition-colors">
      {ok ? <><Check size={11} /> Copiado</> : <><Copy size={11} /> Copiar</>}
    </button>
  );
}

// ── Code block ────────────────────────────────────────────────────────────────
function Code({ code, label }: { code: string; label?: string }) {
  return (
    <div className="rounded-lg overflow-hidden border border-[#ffffff18] mt-3">
      {label && (
        <div className="flex items-center justify-between px-4 py-2 bg-[#1a2e28] border-b border-[#ffffff18]">
          <span className="text-[11px] text-white/50 font-mono uppercase tracking-widest">{label}</span>
          <CopyBtn text={code} />
        </div>
      )}
      {!label && (
        <div className="flex justify-end px-3 pt-2 bg-[#0d1f1a]">
          <CopyBtn text={code} />
        </div>
      )}
      <pre className="bg-[#0d1f1a] text-[#cfeede] px-4 py-3 font-mono text-[12.5px] leading-relaxed overflow-x-auto m-0 whitespace-pre">{code}</pre>
    </div>
  );
}

// ── Inline code ───────────────────────────────────────────────────────────────
function IC({ children }: { children: React.ReactNode }) {
  return <code className="font-mono text-[12px] bg-[var(--color-surface-2)] border border-[var(--color-line)] px-1.5 py-0.5 rounded text-green-700">{children}</code>;
}

// ── Method badge ──────────────────────────────────────────────────────────────
const METHOD_COLORS: Record<string, string> = {
  GET:    "bg-[var(--color-mint-50)] text-green-700",
  POST:   "bg-[#e3eeff] text-[#1b3f8a]",
  PATCH:  "bg-[#fff3d6] text-[#8a5a00]",
  DELETE: "bg-[var(--color-danger-bg)] text-[var(--color-danger-fg)]",
};
function MethodBadge({ method }: { method: string }) {
  return (
    <span className={cn("font-mono text-[11px] font-bold px-2 py-0.5 rounded w-14 text-center inline-block", METHOD_COLORS[method] ?? "bg-[var(--color-surface-2)]")}>
      {method}
    </span>
  );
}

// ── Params table ──────────────────────────────────────────────────────────────
function ParamsTable({ rows }: { rows: { name: string; type: string; req?: boolean; desc: string }[] }) {
  return (
    <table className="w-full text-[12.5px] border-collapse mt-2">
      <thead>
        <tr className="border-b border-[var(--color-line)]">
          <th className="text-left font-semibold text-[var(--color-ink-3)] py-1.5 pr-3 w-40">Parámetro</th>
          <th className="text-left font-semibold text-[var(--color-ink-3)] py-1.5 pr-3 w-20">Tipo</th>
          <th className="text-left font-semibold text-[var(--color-ink-3)] py-1.5">Descripción</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((r) => (
          <tr key={r.name} className="border-b border-dashed border-[var(--color-line)] last:border-0">
            <td className="py-2 pr-3 align-top">
              <IC>{r.name}</IC>
              {r.req && <span className="ml-1 text-[10px] text-red-500 font-semibold">*</span>}
            </td>
            <td className="py-2 pr-3 align-top text-[var(--color-ink-4)] font-mono text-[11.5px]">{r.type}</td>
            <td className="py-2 align-top text-[var(--color-ink-3)]">{r.desc}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

// ── Section heading ───────────────────────────────────────────────────────────
function H2({ children }: { children: React.ReactNode }) {
  return <h2 className="font-semibold text-[17px] text-[var(--color-ink)] mb-1 mt-8 first:mt-0">{children}</h2>;
}
function H3({ children }: { children: React.ReactNode }) {
  return <h3 className="font-semibold text-[14px] text-[var(--color-ink)] mb-2 mt-6 first:mt-0">{children}</h3>;
}
function P({ children }: { children: React.ReactNode }) {
  return <p className="text-[13px] text-[var(--color-ink-2)] leading-relaxed mb-3">{children}</p>;
}

// ── Callout ───────────────────────────────────────────────────────────────────
function Note({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex gap-2.5 px-4 py-3 rounded-lg bg-[var(--color-mint-50)] border border-green-200 text-[12.5px] text-green-800 leading-relaxed mb-4">
      <span className="shrink-0 mt-0.5">ℹ</span>
      <span>{children}</span>
    </div>
  );
}
function Warn({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex gap-2.5 px-4 py-3 rounded-lg bg-[#fff3d6] border border-[#f5d87a] text-[12.5px] text-[#8a5a00] leading-relaxed mb-4">
      <span className="shrink-0 mt-0.5">⚠</span>
      <span>{children}</span>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// SECTION: Autenticación
// ═══════════════════════════════════════════════════════════════════════════════
function SectionAuth() {
  return (
    <div>
      <H2>Autenticación</H2>
      <P>
        Aviva HR usa <strong>API Keys tipo Bearer</strong>. Todas las peticiones deben incluir el header
        <IC>Authorization</IC> con el token generado en Ajustes → Webhooks y API.
      </P>

      <Code
        label="Header requerido en cada request"
        code={`Authorization: Bearer ak_live_••••_••••••••••••••••••`}
      />

      <H3>Scopes disponibles</H3>
      <P>Al generar una API Key eliges los permisos mínimos necesarios. Una key sin el scope requerido devuelve <IC>403 Forbidden</IC>.</P>

      <table className="w-full text-[12.5px] border-collapse">
        <thead>
          <tr className="border-b border-[var(--color-line)]">
            <th className="text-left font-semibold text-[var(--color-ink-3)] py-2 pr-4 w-48">Scope</th>
            <th className="text-left font-semibold text-[var(--color-ink-3)] py-2">Qué permite</th>
          </tr>
        </thead>
        <tbody>
          {[
            ["users:read",        "Leer el directorio de colaboradores (GET /users, GET /users/:id)."],
            ["users:write",       "Crear y editar colaboradores (POST /users, PATCH /users/:id)."],
            ["users:delete",      "Iniciar tickets de baja (POST /users/:id/offboard)."],
            ["tickets:read",      "Consultar el estado de tickets de onboarding y offboarding."],
            ["tickets:write",     "Aprobar etapas de un ticket (POST /tickets/:id/approve)."],
            ["audit:read",        "Leer el log inmutable de auditoría (GET /audit)."],
            ["events:write",      "Publicar eventos hacia webhooks externos."],
            ["integrations:read", "Consultar el estado de apps conectadas (GET /integrations)."],
          ].map(([scope, desc]) => (
            <tr key={scope} className="border-b border-dashed border-[var(--color-line)] last:border-0">
              <td className="py-2 pr-4 align-top"><IC>{scope}</IC></td>
              <td className="py-2 text-[var(--color-ink-3)]">{desc}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <H3>Códigos de error de autenticación</H3>
      <table className="w-full text-[12.5px] border-collapse mb-4">
        <thead>
          <tr className="border-b border-[var(--color-line)]">
            <th className="text-left font-semibold text-[var(--color-ink-3)] py-2 pr-4 w-20">HTTP</th>
            <th className="text-left font-semibold text-[var(--color-ink-3)] py-2 pr-4 w-40">Código</th>
            <th className="text-left font-semibold text-[var(--color-ink-3)] py-2">Causa</th>
          </tr>
        </thead>
        <tbody>
          {[
            ["401", "unauthorized",  "Header Authorization ausente o token inválido / revocado."],
            ["403", "forbidden",     "Token válido pero le falta el scope requerido para este endpoint."],
            ["429", "rate_limited",  "Demasiadas peticiones. Límite: 300 req/min por API Key."],
          ].map(([code, err, desc]) => (
            <tr key={code} className="border-b border-dashed border-[var(--color-line)] last:border-0">
              <td className="py-2 pr-4 font-mono font-bold text-[var(--color-ink-2)]">{code}</td>
              <td className="py-2 pr-4"><IC>{err}</IC></td>
              <td className="py-2 text-[var(--color-ink-3)]">{desc}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <Code
        label="Respuesta de error 401"
        code={`{
  "error": "unauthorized",
  "message": "API Key inválida o revocada.",
  "docs": "${BASE_URL}/docs#auth"
}`}
      />

      <H3>Buenas prácticas</H3>
      <ul className="space-y-2 text-[13px] text-[var(--color-ink-2)] mb-4">
        <li className="flex gap-2"><span className="text-green-600 shrink-0">✓</span> Usa el <strong>mínimo de scopes</strong> necesario para cada integración.</li>
        <li className="flex gap-2"><span className="text-green-600 shrink-0">✓</span> Guarda las keys en variables de entorno, nunca en código fuente.</li>
        <li className="flex gap-2"><span className="text-green-600 shrink-0">✓</span> Rota las keys cada 90 días o tras cualquier posible exposición.</li>
        <li className="flex gap-2"><span className="text-green-600 shrink-0">✓</span> Una key marcada como <em>sin uso 30+ días</em> es candidata a revocación.</li>
      </ul>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// SECTION: Endpoints
// ═══════════════════════════════════════════════════════════════════════════════
const ENDPOINTS = [
  {
    method: "GET", path: "/users", scope: "users:read",
    desc: "Lista paginada de colaboradores. Soporta filtros por hub, estado y estatus.",
    params: [
      { name: "hub",    type: "string",  desc: "Filtrar por ID de hub. Ej: hub1-region_hidalgo" },
      { name: "estado", type: "string",  desc: "Estado de la república. Ej: Hidalgo" },
      { name: "status", type: "string",  desc: "active | inactive | pending" },
      { name: "q",      type: "string",  desc: "Búsqueda de texto libre en nombre, email o número." },
      { name: "page",   type: "integer", desc: "Página (default: 1)." },
      { name: "limit",  type: "integer", desc: "Resultados por página (default: 50, max: 200)." },
    ],
    response: `{
  "data": [
    {
      "id": "u-385_02",
      "num_colaborador": "385_02",
      "nombre": "Adrián Contreras Zapata",
      "email": "adrian.contreras@avivacredito.com",
      "puesto": "Kiosk Manager",
      "hub": "hub1-region_hidalgo",
      "quiosco": "Tulancingo",
      "estado": "Hidalgo",
      "status": "active",
      "fecha_ingreso": "2026-06-01"
    }
  ],
  "meta": { "page": 1, "limit": 50, "total": 142 }
}`,
  },
  {
    method: "GET", path: "/users/:id", scope: "users:read",
    desc: "Detalle completo de un colaborador: datos personales, accesos a apps y equipos asignados.",
    params: [
      { name: "id", type: "string", req: true, desc: "ID del colaborador. Ej: u-385_02" },
    ],
    response: `{
  "id": "u-385_02",
  "nombre": "Adrián Contreras Zapata",
  "email": "adrian.contreras@avivacredito.com",
  "puesto": "Kiosk Manager",
  "hub": "hub1-region_hidalgo",
  "quiosco": "Tulancingo",
  "estado": "Hidalgo",
  "status": "active",
  "fecha_ingreso": "2026-06-01",
  "jefe": { "id": "u-020_02", "nombre": "Marco Reyes" },
  "accesos": ["google", "slack", "okta", "hubspot"],
  "dispositivo": { "tipo": "tablet", "modelo": "Samsung Galaxy Tab A9" }
}`,
  },
  {
    method: "POST", path: "/users", scope: "users:write",
    desc: "Crea un colaborador y, si emit_invite=true, envía email/WhatsApp de bienvenida con el link de onboarding.",
    body: [
      { name: "num_colaborador", type: "string",   req: true,  desc: "Número único de empleado. Ej: 385_02" },
      { name: "nombre",          type: "string",   req: true,  desc: "Nombre completo." },
      { name: "email",           type: "string",   req: true,  desc: "Correo corporativo." },
      { name: "puesto",          type: "string",   req: true,  desc: "Nombre del puesto (debe existir en Catálogo)." },
      { name: "hub",             type: "string",   req: true,  desc: "ID del hub." },
      { name: "quiosco",         type: "string",   req: false, desc: "Nombre del quiosco asignado." },
      { name: "estado",          type: "string",   req: true,  desc: "Estado de la república." },
      { name: "jefe",            type: "string",   req: false, desc: "ID del jefe directo." },
      { name: "fecha_ingreso",   type: "date",     req: true,  desc: "Formato ISO 8601: YYYY-MM-DD." },
      { name: "provision",       type: "string[]", req: false, desc: "Apps a provisionar: google, slack, okta, hubspot, avivaflat." },
      { name: "emit_invite",     type: "boolean",  req: false, desc: "Si true envía la invitación. Default: false." },
    ],
    response: `{
  "id": "u-385_02",
  "nombre": "Adrián Contreras Zapata",
  "status": "pending",
  "invite_sent": true,
  "invite_expires_at": "2026-06-10T00:00:00Z"
}`,
  },
  {
    method: "PATCH", path: "/users/:id", scope: "users:write",
    desc: "Edita campos parciales de un colaborador. Solo los campos enviados se modifican. Queda registrado en auditoría.",
    body: [
      { name: "puesto",   type: "string", desc: "Nuevo puesto." },
      { name: "hub",      type: "string", desc: "Nuevo hub." },
      { name: "quiosco",  type: "string", desc: "Nuevo quiosco." },
      { name: "jefe",     type: "string", desc: "ID del nuevo jefe." },
      { name: "talla",    type: "string", desc: "Talla de uniforme." },
    ],
    response: `{
  "id": "u-385_02",
  "updated_fields": ["puesto", "hub"],
  "audit_id": "audit-20260603-abc1"
}`,
  },
  {
    method: "POST", path: "/users/:id/offboard", scope: "users:delete",
    desc: "Abre un ticket de baja para el colaborador. Inicia la cadena de aprobaciones configurada.",
    body: [
      { name: "reason",       type: "string", req: true,  desc: "renuncia_voluntaria | despido | fin_contrato | otro." },
      { name: "last_day",     type: "date",   req: true,  desc: "Último día de trabajo. Formato YYYY-MM-DD." },
      { name: "transfer_to",  type: "string", req: false, desc: "ID del colaborador que recibe los activos/contactos." },
      { name: "notes",        type: "string", req: false, desc: "Notas adicionales para el equipo HR." },
    ],
    response: `{
  "ticket_id": "TKT-2099",
  "user_id": "u-385_02",
  "status": "pending_approval",
  "pending_approvals": ["Manager directo", "HR Business Partner"]
}`,
  },
  {
    method: "POST", path: "/users/import", scope: "users:write",
    desc: "Carga masiva de colaboradores desde un archivo CSV o XLSX. Soporta modo dry_run para validar sin crear.",
    body: [
      { name: "file",     type: "file",    req: true,  desc: "Archivo multipart. Formatos: .csv, .xlsx (máx. 5 MB)." },
      { name: "dry_run",  type: "boolean", req: false, desc: "Si true valida el archivo y devuelve errores sin crear nada." },
    ],
    response: `{
  "dry_run": false,
  "processed": 48,
  "created": 45,
  "skipped": 3,
  "errors": [
    { "row": 12, "field": "email", "message": "Duplicado." },
    { "row": 27, "field": "puesto", "message": "Puesto no existe en catálogo." }
  ]
}`,
  },
  {
    method: "GET", path: "/tickets", scope: "tickets:read",
    desc: "Lista de tickets activos de onboarding y offboarding con su estado y progreso.",
    params: [
      { name: "type",   type: "string", desc: "onboarding | offboarding. Default: todos." },
      { name: "status", type: "string", desc: "pending_approval | in_progress | completed | failed." },
      { name: "limit",  type: "integer", desc: "Resultados por página (default: 50)." },
    ],
    response: `{
  "data": [
    {
      "id": "TKT-2041",
      "type": "offboarding",
      "user": { "id": "u-201_03", "nombre": "Laura Pérez Solís" },
      "status": "in_progress",
      "created_at": "2026-06-02T17:45:00Z",
      "last_day": "2026-06-15",
      "pending_approvals": [],
      "tasks": { "total": 6, "done": 4, "failed": 0 }
    }
  ]
}`,
  },
  {
    method: "POST", path: "/tickets/:id/approve", scope: "tickets:write",
    desc: "Aprueba una etapa de un ticket. El ticket avanza automáticamente a la siguiente etapa.",
    body: [
      { name: "stage",       type: "string", req: true,  desc: "Nombre de la etapa. Ej: Manager directo." },
      { name: "approver_id", type: "string", req: true,  desc: "ID del colaborador que aprueba." },
      { name: "notes",       type: "string", req: false, desc: "Comentario opcional." },
    ],
    response: `{
  "ticket_id": "TKT-2041",
  "stage_approved": "Manager directo",
  "next_stage": "HR Business Partner",
  "status": "pending_approval"
}`,
  },
  {
    method: "GET", path: "/audit", scope: "audit:read",
    desc: "Log inmutable de eventos del workspace. Filtros por fecha, actor y tipo de acción.",
    params: [
      { name: "from",   type: "date",    desc: "Fecha de inicio ISO 8601." },
      { name: "to",     type: "date",    desc: "Fecha de fin ISO 8601." },
      { name: "actor",  type: "string",  desc: "ID del colaborador que realizó la acción." },
      { name: "action", type: "string",  desc: "Ej: user_created, offboarding_approved." },
      { name: "limit",  type: "integer", desc: "Máx 500 por página." },
    ],
    response: `{
  "data": [
    {
      "id": "audit-20260603-abc1",
      "action": "user_updated",
      "actor": { "id": "u-001", "nombre": "Amran Frey" },
      "target": { "id": "u-385_02", "nombre": "Adrián Contreras Zapata" },
      "changed_fields": ["puesto"],
      "occurred_at": "2026-06-03T10:14:22Z"
    }
  ]
}`,
  },
  {
    method: "GET", path: "/integrations", scope: "integrations:read",
    desc: "Estado de las aplicaciones conectadas y la fecha de última sincronización.",
    response: `{
  "data": [
    {
      "id": "hubspot",
      "name": "HubSpot",
      "status": "connected",
      "last_sync": "2026-06-03T06:00:00Z",
      "records_synced": 142
    },
    {
      "id": "slack",
      "name": "Slack",
      "status": "connected",
      "last_sync": "2026-06-03T06:05:00Z"
    }
  ]
}`,
  },
  {
    method: "POST", path: "/integrations/:id/sync", scope: "integrations:read",
    desc: "Fuerza una sincronización inmediata para la integración especificada. La operación es asíncrona.",
    body: [
      { name: "id", type: "string", req: true, desc: "ID de la integración: hubspot, slack, okta, google." },
    ],
    response: `{
  "integration": "hubspot",
  "sync_id": "sync-20260603-xyz9",
  "status": "queued",
  "estimated_duration_s": 15
}`,
  },
];

function EndpointCard({ ep }: { ep: typeof ENDPOINTS[0] }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border border-[var(--color-line)] rounded-lg overflow-hidden mb-3">
      <button
        className="w-full flex items-center gap-3 px-4 py-3 bg-[var(--color-surface)] hover:bg-[var(--color-surface-2)] transition-colors text-left"
        onClick={() => setOpen(!open)}
      >
        <MethodBadge method={ep.method} />
        <code className="font-mono text-[13px] text-[var(--color-ink)] flex-1">{ep.path}</code>
        <span className="font-mono text-[11px] text-[var(--color-ink-4)] px-1.5 py-0.5 rounded bg-[var(--color-surface-2)] border border-[var(--color-line)]">{ep.scope}</span>
        <span className="text-[var(--color-ink-4)] text-[12px] ml-1">{open ? "▲" : "▼"}</span>
      </button>
      {open && (
        <div className="px-4 pb-4 pt-2 border-t border-[var(--color-line)] bg-[var(--color-bg)]">
          <p className="text-[13px] text-[var(--color-ink-2)] mb-3">{ep.desc}</p>
          {ep.params && ep.params.length > 0 && (
            <div className="mb-3">
              <div className="text-[12px] font-semibold text-[var(--color-ink-3)] uppercase tracking-wide mb-1">Query params</div>
              <ParamsTable rows={ep.params} />
            </div>
          )}
          {ep.body && ep.body.length > 0 && (
            <div className="mb-3">
              <div className="text-[12px] font-semibold text-[var(--color-ink-3)] uppercase tracking-wide mb-1">Request body (JSON)</div>
              <ParamsTable rows={ep.body} />
            </div>
          )}
          {ep.response && (
            <div>
              <div className="text-[12px] font-semibold text-[var(--color-ink-3)] uppercase tracking-wide mb-1">Respuesta 200</div>
              <Code code={ep.response} />
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function SectionEndpoints() {
  return (
    <div>
      <H2>Referencia REST</H2>
      <P>Base URL: <IC>{BASE_URL}</IC> · Todos los requests deben incluir <IC>Authorization: Bearer &lt;key&gt;</IC> y <IC>Content-Type: application/json</IC>.</P>
      <Note>Los campos marcados con <span className="text-red-500 font-bold">*</span> son obligatorios. El resto son opcionales.</Note>
      {ENDPOINTS.map((ep) => <EndpointCard key={ep.method + ep.path} ep={ep} />)}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// SECTION: Webhooks
// ═══════════════════════════════════════════════════════════════════════════════
function SectionWebhooks() {
  return (
    <div>
      <H2>Guía de Webhooks</H2>
      <P>
        Aviva HR envía eventos HTTP POST a las URLs que registras en Ajustes → Webhooks y API.
        Cada evento incluye un payload JSON y, si configuraste un secreto HMAC, una firma en el header
        <IC>X-Aviva-Signature</IC>.
      </P>

      <H3>Estructura del payload</H3>
      <Code
        label="Ejemplo · offboard.completed"
        code={`POST https://tu-servicio.com/webhook
Content-Type: application/json
X-Aviva-Signature: sha256=a1b2c3d4e5f6...
X-Aviva-Event: offboard.completed
X-Aviva-Delivery: del-20260603-xyz9

{
  "event": "offboard.completed",
  "occurred_at": "2026-06-03T18:30:00Z",
  "workspace": "avivacredito",
  "delivery_id": "del-20260603-xyz9",
  "data": {
    "ticket_id": "TKT-2041",
    "tasks_ok": 6,
    "tasks_failed": 0,
    "duration_s": 48
  }
}`}
      />

      <H3>Verificar la firma HMAC-SHA256</H3>
      <P>
        Si configuraste un secreto, Aviva HR firma el body completo con HMAC-SHA256.
        <strong> Siempre verifica la firma antes de procesar el evento</strong> para evitar requests falsificados.
      </P>

      <Code
        label="Node.js — verificar firma"
        code={`import crypto from "crypto";

function verifyWebhook(req, secret) {
  const signature = req.headers["x-aviva-signature"];
  if (!signature) return false;

  const expected = "sha256=" + crypto
    .createHmac("sha256", secret)
    .update(req.rawBody) // body como Buffer, antes de parsear JSON
    .digest("hex");

  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expected)
  );
}`}
      />

      <Code
        label="Python — verificar firma"
        code={`import hmac, hashlib

def verify_webhook(body: bytes, signature: str, secret: str) -> bool:
    expected = "sha256=" + hmac.new(
        key=secret.encode(),
        msg=body,
        digestmod=hashlib.sha256
    ).hexdigest()
    return hmac.compare_digest(signature, expected)`}
      />

      <Warn>Usa el <strong>body en bytes crudos</strong> antes de parsear como JSON. Si re-serializas el objeto el hash cambiará y la verificación fallará.</Warn>

      <H3>Política de reintentos</H3>
      <P>Si tu endpoint responde con un código diferente de 2xx, Aviva HR reintenta con backoff exponencial:</P>
      <table className="w-full text-[12.5px] border-collapse mb-4">
        <thead>
          <tr className="border-b border-[var(--color-line)]">
            <th className="text-left font-semibold text-[var(--color-ink-3)] py-2 pr-4 w-20">Intento</th>
            <th className="text-left font-semibold text-[var(--color-ink-3)] py-2 pr-4">Espera</th>
            <th className="text-left font-semibold text-[var(--color-ink-3)] py-2">Notas</th>
          </tr>
        </thead>
        <tbody>
          {[
            ["1°",  "Inmediato",  "Primer intento al momento del evento."],
            ["2°",  "5 segundos", "Primer reintento."],
            ["3°",  "30 segundos","Segundo reintento."],
            ["4°",  "5 minutos",  "Último intento. Si falla, el webhook queda en estado \"1 fallo\"."],
          ].map(([n, wait, note]) => (
            <tr key={n} className="border-b border-dashed border-[var(--color-line)] last:border-0">
              <td className="py-2 pr-4 font-semibold text-[var(--color-ink-2)]">{n}</td>
              <td className="py-2 pr-4 text-[var(--color-ink-3)]">{wait}</td>
              <td className="py-2 text-[var(--color-ink-4)]">{note}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <H3>Recomendaciones de implementación</H3>
      <ul className="space-y-2 text-[13px] text-[var(--color-ink-2)] mb-4">
        <li className="flex gap-2"><span className="text-green-600 shrink-0">✓</span> Responde con <IC>200 OK</IC> <strong>inmediatamente</strong> y procesa el evento de forma asíncrona (cola, worker).</li>
        <li className="flex gap-2"><span className="text-green-600 shrink-0">✓</span> Usa el campo <IC>delivery_id</IC> como idempotency key — el mismo evento puede llegar más de una vez.</li>
        <li className="flex gap-2"><span className="text-green-600 shrink-0">✓</span> Configura un timeout de respuesta ≤ 10 segundos en tu endpoint.</li>
        <li className="flex gap-2"><span className="text-green-600 shrink-0">✓</span> Filtra los tipos de evento que realmente necesitas — no uses <IC>*</IC> si solo te interesan dos eventos.</li>
      </ul>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// SECTION: Ejemplos de código
// ═══════════════════════════════════════════════════════════════════════════════
const EXAMPLES: Record<Lang, { label: string; scenarios: { title: string; code: string }[] }> = {
  curl: {
    label: "cURL",
    scenarios: [
      {
        title: "Listar colaboradores de un hub",
        code: `curl -G "${BASE_URL}/users" \\
  -H "Authorization: Bearer ak_live_••••_••••••••••••••••" \\
  --data-urlencode "hub=hub1-region_hidalgo" \\
  --data-urlencode "status=active" \\
  --data-urlencode "limit=50"`,
      },
      {
        title: "Crear un colaborador",
        code: `curl -X POST "${BASE_URL}/users" \\
  -H "Authorization: Bearer ak_live_••••_••••••••••••••••" \\
  -H "Content-Type: application/json" \\
  -d '{
    "num_colaborador": "385_02",
    "nombre": "Adrián Contreras Zapata",
    "email": "adrian.contreras@avivacredito.com",
    "puesto": "Kiosk Manager",
    "hub": "hub1-region_hidalgo",
    "quiosco": "Tulancingo",
    "estado": "Hidalgo",
    "fecha_ingreso": "2026-06-01",
    "provision": ["google", "slack", "okta"],
    "emit_invite": true
  }'`,
      },
      {
        title: "Iniciar una baja",
        code: `curl -X POST "${BASE_URL}/users/u-201_03/offboard" \\
  -H "Authorization: Bearer ak_live_••••_••••••••••••••••" \\
  -H "Content-Type: application/json" \\
  -d '{
    "reason": "renuncia_voluntaria",
    "last_day": "2026-06-15",
    "transfer_to": "u-080_01"
  }'`,
      },
    ],
  },
  node: {
    label: "Node.js",
    scenarios: [
      {
        title: "Cliente base (fetch)",
        code: `const API_KEY = process.env.AVIVA_API_KEY;
const BASE    = "${BASE_URL}";

async function avivaFetch(path, opts = {}) {
  const res = await fetch(BASE + path, {
    ...opts,
    headers: {
      "Authorization": \`Bearer \${API_KEY}\`,
      "Content-Type": "application/json",
      ...(opts.headers ?? {}),
    },
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw Object.assign(new Error(err.message ?? "API error"), { status: res.status });
  }
  return res.json();
}`,
      },
      {
        title: "Crear un colaborador",
        code: `const user = await avivaFetch("/users", {
  method: "POST",
  body: JSON.stringify({
    num_colaborador: "385_02",
    nombre: "Adrián Contreras Zapata",
    email: "adrian.contreras@avivacredito.com",
    puesto: "Kiosk Manager",
    hub: "hub1-region_hidalgo",
    estado: "Hidalgo",
    fecha_ingreso: "2026-06-01",
    provision: ["google", "slack"],
    emit_invite: true,
  }),
});
console.log("Creado:", user.id);`,
      },
      {
        title: "Receptor de webhook con Express",
        code: `import express from "express";
import crypto from "crypto";

const app = express();
app.use(express.raw({ type: "application/json" }));

app.post("/webhook", (req, res) => {
  const sig    = req.headers["x-aviva-signature"] ?? "";
  const secret = process.env.AVIVA_WEBHOOK_SECRET;

  const expected = "sha256=" + crypto
    .createHmac("sha256", secret)
    .update(req.body)
    .digest("hex");

  if (!crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expected))) {
    return res.status(401).send("Invalid signature");
  }

  const event = JSON.parse(req.body);
  res.sendStatus(200); // responde rápido

  // procesa de forma asíncrona
  handleEvent(event).catch(console.error);
});

async function handleEvent(event) {
  switch (event.event) {
    case "offboard.completed":
      await closeHubSpotDeals(event.data.ticket_id);
      break;
    case "users.created":
      await syncToBIWarehouse(event.data);
      break;
  }
}`,
      },
    ],
  },
  python: {
    label: "Python",
    scenarios: [
      {
        title: "Cliente base (httpx)",
        code: `import os, httpx

API_KEY = os.environ["AVIVA_API_KEY"]
BASE    = "${BASE_URL}"

def aviva(method: str, path: str, **kwargs):
    r = httpx.request(
        method, BASE + path,
        headers={"Authorization": f"Bearer {API_KEY}"},
        **kwargs,
    )
    r.raise_for_status()
    return r.json()`,
      },
      {
        title: "Listar y filtrar colaboradores",
        code: `users = aviva("GET", "/users", params={
    "hub": "hub1-region_hidalgo",
    "status": "active",
    "limit": 100,
})
for u in users["data"]:
    print(u["nombre"], u["puesto"])`,
      },
      {
        title: "Receptor de webhook con FastAPI",
        code: `from fastapi import FastAPI, Request, HTTPException
import hmac, hashlib, os, asyncio

app = FastAPI()
SECRET = os.environ["AVIVA_WEBHOOK_SECRET"].encode()

@app.post("/webhook")
async def webhook(request: Request):
    body = await request.body()
    sig  = request.headers.get("x-aviva-signature", "")

    expected = "sha256=" + hmac.new(SECRET, body, hashlib.sha256).hexdigest()
    if not hmac.compare_digest(sig, expected):
        raise HTTPException(status_code=401, detail="Invalid signature")

    event = await request.json()
    asyncio.create_task(handle_event(event))  # procesa async
    return {"ok": True}

async def handle_event(event: dict):
    match event["event"]:
        case "offboard.completed":
            await close_hubspot_deals(event["data"]["ticket_id"])
        case "users.created":
            await sync_to_bi(event["data"])`,
      },
    ],
  },
};

function SectionExamples() {
  const [lang, setLang] = useState<Lang>("curl");
  const ex = EXAMPLES[lang];
  return (
    <div>
      <H2>Ejemplos de código</H2>
      <P>Snippets listos para copiar en los tres escenarios más comunes: listar usuarios, crear un colaborador y recibir webhooks.</P>

      <div className="flex gap-2 mb-5">
        {(Object.keys(EXAMPLES) as Lang[]).map((l) => (
          <button
            key={l}
            onClick={() => setLang(l)}
            className={cn(
              "px-4 py-2 rounded-lg text-[13px] font-medium transition-colors border",
              lang === l
                ? "bg-[var(--color-mint-50)] text-green-700 border-green-300"
                : "bg-[var(--color-surface)] text-[var(--color-ink-3)] border-[var(--color-line)] hover:bg-[var(--color-surface-2)]"
            )}
          >
            {EXAMPLES[l].label}
          </button>
        ))}
      </div>

      {ex.scenarios.map((s) => (
        <div key={s.title} className="mb-6">
          <H3>{s.title}</H3>
          <Code code={s.code} />
        </div>
      ))}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN PANEL
// ═══════════════════════════════════════════════════════════════════════════════
export function APIDocsPanel({ onClose }: { onClose: () => void }) {
  const [section, setSection] = useState<Section>("auth");

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-[2px]" onClick={onClose} />

      {/* Panel */}
      <div className="fixed inset-4 z-50 rounded-2xl bg-[var(--color-bg)] border border-[var(--color-line)] shadow-2xl flex flex-col overflow-hidden">

        {/* Header */}
        <div className="flex items-center gap-4 px-6 py-4 border-b border-[var(--color-line)] bg-[var(--color-surface)] shrink-0">
          <div className="size-8 rounded-lg bg-[var(--color-mint-50)] grid place-items-center">
            <Link size={15} className="text-green-700" />
          </div>
          <div>
            <div className="font-semibold text-[14px] text-[var(--color-ink)]">Documentación de la API · Aviva HR</div>
            <code className="text-[11.5px] text-[var(--color-ink-3)] font-mono">{BASE_URL}</code>
          </div>
          <div className="flex items-center gap-2 ml-auto">
            <a
              href={`${BASE_URL}/docs`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 text-[12.5px] text-[var(--color-ink-3)] hover:text-[var(--color-ink)] transition-colors"
            >
              <ExternalLink size={13} /> Abrir externa
            </a>
            <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-[var(--color-surface-2)] text-[var(--color-ink-3)] transition-colors ml-2">
              <Close size={16} />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="flex flex-1 min-h-0">

          {/* Sidebar nav */}
          <nav className="w-56 shrink-0 border-r border-[var(--color-line)] bg-[var(--color-surface)] py-4 overflow-y-auto">
            {NAV.map((n) => (
              <button
                key={n.id}
                onClick={() => setSection(n.id)}
                className={cn(
                  "w-full text-left px-4 py-3 transition-colors",
                  section === n.id
                    ? "bg-[var(--color-mint-50)] border-r-2 border-green-500"
                    : "hover:bg-[var(--color-surface-2)]"
                )}
              >
                <div className={cn("text-[13px] font-medium", section === n.id ? "text-green-700" : "text-[var(--color-ink-2)]")}>{n.label}</div>
                <div className="text-[11px] text-[var(--color-ink-4)] mt-0.5">{n.sub}</div>
              </button>
            ))}

            <div className="mx-4 mt-6 pt-4 border-t border-[var(--color-line)]">
              <div className="text-[11px] font-semibold text-[var(--color-ink-4)] uppercase tracking-wide mb-2">Versión</div>
              <div className="flex items-center gap-2">
                <span className="text-[11.5px] font-mono text-[var(--color-ink-3)]">v1</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-[var(--color-mint-50)] text-green-700 font-medium">Estable</span>
              </div>
              <div className="text-[11px] text-[var(--color-ink-4)] mt-3 leading-relaxed">
                Soporte: <a href="mailto:tech@avivacredito.com" className="text-green-700 hover:underline">tech@avivacredito.com</a>
              </div>
            </div>
          </nav>

          {/* Content */}
          <div className="flex-1 overflow-y-auto">
            <div className="max-w-3xl mx-auto px-8 py-7">
              {section === "auth"      && <SectionAuth />}
              {section === "endpoints" && <SectionEndpoints />}
              {section === "webhooks"  && <SectionWebhooks />}
              {section === "examples"  && <SectionExamples />}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
