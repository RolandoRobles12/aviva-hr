import { useState } from "react";
import { useIntegrations } from "@/hooks/useIntegrations";
import { updateDocById, createDoc } from "@/hooks/useFirestore";
import { useNotif } from "@/context/NotifContext";
import { useAuth } from "@/context/AuthContext";
import { LoadingView, ErrorView } from "@/components/ui/Spinner";
import { Drawer } from "@/components/ui/Drawer";
import { Button } from "@/components/ui/Button";
import { Plus, Refresh, Close } from "@/components/icons";
import { cn } from "@/lib/cn";
import type { Integration } from "@/data/types";

const INTEGRATION_TYPES = [
  "HRIS / Nómina", "Identidad / SSO", "CRM", "Comunicación",
  "Productividad", "Seguridad / Compliance", "Otro",
];

const inputClass =
  "h-9 w-full px-3 rounded-[var(--radius-sm)] border border-[var(--color-line)] bg-[var(--color-surface)] text-[var(--color-ink)] text-[13px] outline-none";

// ── Connect request modal ──────────────────────────────────────────────────────
function ConnectModal({ onClose }: { onClose: () => void }) {
  const { notify } = useNotif();
  const { appUser } = useAuth();
  const [name,    setName]    = useState("");
  const [type,    setType]    = useState("");
  const [reason,  setReason]  = useState("");
  const [saving,  setSaving]  = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      await createDoc("integrationRequests", {
        name, type, reason,
        requestedBy: appUser?.fullName ?? "HR",
        requestedAt: new Date().toISOString(),
        status: "pending",
      });
      notify({ title: "Solicitud enviada", body: `IT / Sistemas revisará la integración con ${name} a la brevedad.`, kind: "info" });
      onClose();
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/30 backdrop-blur-[2px]" onClick={onClose} />
      <div className="fixed left-1/2 top-1/2 z-50 -translate-x-1/2 -translate-y-1/2 w-[480px] rounded-[var(--radius-lg)] bg-[var(--color-surface)] shadow-[var(--shadow-lg)] p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-[15px] text-[var(--color-ink)]">Solicitar nueva integración</h2>
          <button onClick={onClose} className="p-1 rounded-md text-[var(--color-ink-3)] hover:bg-[var(--color-surface-2)]">
            <Close size={16} />
          </button>
        </div>
        <p className="text-[12.5px] text-[var(--color-ink-3)]">
          IT / Sistemas coordinará el setup de OAuth y permisos. Tu solicitud quedará registrada.
        </p>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="text-[11px] text-[var(--color-ink-4)] mb-1 block">Nombre de la app *</label>
            <input className={inputClass} required value={name} onChange={(e) => setName(e.target.value)} placeholder="Ej. Workday, Zoom, Jira…" />
          </div>
          <div>
            <label className="text-[11px] text-[var(--color-ink-4)] mb-1 block">Tipo *</label>
            <select className={inputClass} required value={type} onChange={(e) => setType(e.target.value)}>
              <option value="">Seleccionar tipo…</option>
              {INTEGRATION_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <div>
            <label className="text-[11px] text-[var(--color-ink-4)] mb-1 block">Justificación *</label>
            <textarea
              required value={reason} onChange={(e) => setReason(e.target.value)}
              className="w-full px-3 py-2 rounded-[var(--radius-sm)] border border-[var(--color-line)] bg-[var(--color-surface)] text-[var(--color-ink)] text-[13px] outline-none resize-none h-20"
              placeholder="¿Para qué se usará y quién la necesita?"
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="secondary" size="sm" onClick={onClose}>Cancelar</Button>
            <Button type="submit" variant="primary" size="sm" disabled={saving}>
              {saving ? "Enviando…" : "Enviar solicitud"}
            </Button>
          </div>
        </form>
      </div>
    </>
  );
}

// ── Integration detail drawer ──────────────────────────────────────────────────
function IntegrationDrawer({ it, onClose }: { it: Integration & { id: string }; onClose: () => void }) {
  const { notify } = useNotif();
  const [syncing,  setSyncing]  = useState(false);
  const [disconnecting, setDisconnecting] = useState(false);

  async function handleSync() {
    setSyncing(true);
    try {
      await updateDocById("integrations", it.id, { lastSync: "hace 0 min", status: "ok" });
      notify({ title: "Sync completado", body: `${it.name} sincronizado correctamente.`, kind: "info" });
    } finally {
      setSyncing(false);
    }
  }

  function handleReauth() {
    notify({
      title: "Re-autorización OAuth",
      body: "Configura el flujo OAuth en Firebase Functions para re-conectar esta app.",
      kind: "info",
    });
  }

  async function handleDisconnect() {
    if (!confirm(`¿Desconectar ${it.name}? Los accesos existentes no se revocarán automáticamente.`)) return;
    setDisconnecting(true);
    try {
      await updateDocById("integrations", it.id, { status: "error" });
      notify({ title: "Integración desconectada", body: `${it.name} marcada como desconectada.`, kind: "offboard" });
      onClose();
    } finally {
      setDisconnecting(false);
    }
  }

  return (
    <Drawer open onClose={onClose} title={it.name} subtitle={it.desc}>
      <div className="px-6 py-5 space-y-5">
        {/* Badge row */}
        <div className="flex items-center gap-4">
          <div
            className="size-12 rounded-xl grid place-items-center text-[15px] font-bold shrink-0"
            style={{ background: it.color + "16", color: it.color, border: `1px solid ${it.color}33` }}
          >
            {it.short}
          </div>
          <span className={cn(
            "text-[12px] font-medium px-2.5 py-1 rounded-full flex items-center gap-1.5",
            it.status === "ok"
              ? "text-green-700 bg-[var(--color-success-bg)]"
              : it.status === "warn"
              ? "text-amber-700 bg-[var(--color-warn-bg)]"
              : "text-[var(--color-danger-fg)] bg-[var(--color-danger-bg)]"
          )}>
            <span className={cn("size-1.5 rounded-full",
              it.status === "ok" ? "bg-green-500 animate-pulse" : it.status === "warn" ? "bg-amber-500" : "bg-red-500"
            )} />
            {it.status === "ok" ? "Activa" : it.status === "warn" ? "Atención requerida" : "Desconectada"}
          </span>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3">
          {[
            ["Cuentas gestionadas", it.accounts.toLocaleString("es-MX")],
            ["Última sincronización", it.lastSync],
          ].map(([label, value]) => (
            <div key={label} className="px-4 py-3 rounded-[var(--radius-sm)] bg-[var(--color-surface-2)] border border-[var(--color-line)]">
              <div className="text-[11px] text-[var(--color-ink-4)] mb-1">{label}</div>
              <div className="font-semibold text-[13px] text-[var(--color-ink)]">{value}</div>
            </div>
          ))}
        </div>

        {it.status === "warn" && (
          <div className="px-4 py-3 rounded-[var(--radius-sm)] bg-[var(--color-warn-bg)] text-amber-800 text-[13px]">
            Esta integración requiere atención. Verifica las credenciales o re-autoriza el acceso OAuth.
          </div>
        )}
        {it.status === "error" && (
          <div className="px-4 py-3 rounded-[var(--radius-sm)] bg-[var(--color-danger-bg)] text-[var(--color-danger-fg)] text-[13px]">
            Integración desconectada. Re-autoriza para restablecer la sincronización.
          </div>
        )}

        {/* Actions */}
        <div className="space-y-2 pt-2 border-t border-[var(--color-line)]">
          <Button
            variant="primary" className="w-full"
            icon={<Refresh size={13} />}
            onClick={handleSync} disabled={syncing}
          >
            {syncing ? "Sincronizando…" : "Forzar sincronización"}
          </Button>
          <Button variant="secondary" className="w-full" onClick={handleReauth}>
            Re-autorizar OAuth
          </Button>
          <Button variant="danger" className="w-full" onClick={handleDisconnect} disabled={disconnecting}>
            {disconnecting ? "Desconectando…" : "Desconectar integración"}
          </Button>
        </div>
      </div>
    </Drawer>
  );
}

// ── Main view ──────────────────────────────────────────────────────────────────
export function IntegrationsView() {
  const { data: items, loading, error } = useIntegrations();
  const { notify } = useNotif();
  const [selected,    setSelected]    = useState<(Integration & { id: string }) | null>(null);
  const [connectOpen, setConnectOpen] = useState(false);

  if (loading) return <LoadingView />;
  if (error)   return <ErrorView message={error.message} />;

  const okCount    = items.filter((i) => i.status === "ok").length;
  const warnCount  = items.filter((i) => i.status === "warn").length;
  const totalAccounts = items.reduce((s, i) => s + i.accounts, 0);

  async function handleSync(it: Integration & { id: string }, e: React.MouseEvent) {
    e.stopPropagation();
    await updateDocById("integrations", it.id, { lastSync: "hace 0 min", status: "ok" });
    notify({ title: "Sync completado", body: `${it.name} sincronizado.`, kind: "info" });
  }

  return (
    <div className="p-5 space-y-5">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="font-serif text-[22px] font-medium text-[var(--color-ink)]">Integraciones</h1>
          <p className="text-[12.5px] text-[var(--color-ink-3)]">{items.length} apps conectadas · sincronización en tiempo real</p>
        </div>
        <Button variant="primary" icon={<Plus size={14} />} onClick={() => setConnectOpen(true)}>Conectar app</Button>
      </div>

      {/* Health summary */}
      <div className="flex items-center gap-5 px-5 py-4 rounded-[var(--radius)] bg-[var(--color-surface)] border border-[var(--color-line)] shadow-[var(--shadow-sm)]">
        <div>
          <div className="text-[11px] text-[var(--color-ink-4)] uppercase tracking-wide mb-1">Salud de sincronización</div>
          <div className="flex items-center gap-2">
            <span className="font-serif text-[28px] text-[var(--color-ink)]">{okCount}/{items.length}</span>
            <span className="flex items-center gap-1 text-[12px] font-medium text-green-600 bg-[var(--color-success-bg)] px-2 py-0.5 rounded-full">
              <span className="size-1.5 rounded-full bg-green-500 animate-pulse" /> En vivo
            </span>
          </div>
        </div>
        <div className="h-10 w-px bg-[var(--color-line)]" />
        <div>
          <div className="text-[11px] text-[var(--color-ink-4)] uppercase tracking-wide mb-1">Cuentas gestionadas</div>
          <div className="font-serif text-[28px] text-[var(--color-ink)]">{totalAccounts.toLocaleString("es-MX")}</div>
        </div>
        {warnCount > 0 && (
          <>
            <div className="h-10 w-px bg-[var(--color-line)]" />
            <div>
              <div className="text-[11px] text-[var(--color-ink-4)] uppercase tracking-wide mb-1">Advertencias</div>
              <div className="font-serif text-[28px] text-amber-600">{warnCount}</div>
            </div>
          </>
        )}
      </div>

      {/* Integration cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {items.map((it) => (
          <div
            key={it.id}
            onClick={() => setSelected(it)}
            className="rounded-[var(--radius)] bg-[var(--color-surface)] border border-[var(--color-line)] shadow-[var(--shadow-sm)] p-4 space-y-3 cursor-pointer hover:border-[var(--color-line-strong)] transition-colors"
          >
            <div className="flex items-start gap-3">
              <div
                className="size-10 rounded-[var(--radius-sm)] grid place-items-center text-[13px] font-bold shrink-0"
                style={{ background: it.color + "16", color: it.color, border: `1px solid ${it.color}33` }}
              >
                {it.short}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-[14px] text-[var(--color-ink)]">{it.name}</div>
                <div className="text-[12px] text-[var(--color-ink-3)] truncate">{it.desc}</div>
              </div>
              <span className={cn(
                "text-[11.5px] font-medium px-2 py-0.5 rounded-full flex items-center gap-1 shrink-0",
                it.status === "ok" ? "text-green-700 bg-[var(--color-success-bg)]" : "text-amber-700 bg-[var(--color-warn-bg)]"
              )}>
                <span className={cn("size-1.5 rounded-full", it.status === "ok" ? "bg-green-500" : "bg-amber-500")} />
                {it.status === "ok" ? "Activa" : "Atención"}
              </span>
            </div>

            <div className="flex gap-4 text-[12.5px]">
              <div><span className="text-[var(--color-ink-4)]">Cuentas </span><span className="font-medium text-[var(--color-ink-2)]">{it.accounts}</span></div>
              <div><span className="text-[var(--color-ink-4)]">Última sync </span><span className="font-medium text-[var(--color-ink-2)]">{it.lastSync}</span></div>
            </div>

            <div className="flex items-center gap-2 pt-1 border-t border-[var(--color-line)]">
              <Button size="sm" variant="secondary" onClick={(e) => { e.stopPropagation(); setSelected(it); }}>Configurar</Button>
              <Button size="sm" variant="ghost" icon={<Refresh size={12} />} onClick={(e) => handleSync(it, e)}>Sync</Button>
              <span className="ml-auto text-[11.5px] text-[var(--color-ink-4)]">
                {it.status === "warn" ? "1 advertencia" : "OK"}
              </span>
            </div>
          </div>
        ))}
        {items.length === 0 && (
          <div className="col-span-3 py-16 text-center text-[var(--color-ink-4)] text-[13px]">Sin integraciones configuradas.</div>
        )}
      </div>

      {selected    && <IntegrationDrawer it={selected}  onClose={() => setSelected(null)} />}
      {connectOpen && <ConnectModal onClose={() => setConnectOpen(false)} />}
    </div>
  );
}
