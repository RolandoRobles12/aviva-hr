import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useTickets } from "@/hooks/useTickets";
import { useUsers } from "@/hooks/useUsers";
import { createOffboardingTicket, submitApproval } from "@/services/tickets";
import { useNotif } from "@/context/NotifContext";
import { useAuth } from "@/context/AuthContext";
import type { Ticket } from "@/data/types";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import { Drawer } from "@/components/ui/Drawer";
import { LoadingView, ErrorView } from "@/components/ui/Spinner";
import { NewTicketChooser } from "./NewTicketChooser";
import { Plus, ChevronRight, Check, Close } from "@/components/icons";
import { cn } from "@/lib/cn";

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  in_progress: { label: "En curso",    color: "#1b3f8a", bg: "#e3eeff" },
  completed:   { label: "Completado",  color: "#026149", bg: "#e7f8ef" },
  rejected:    { label: "Rechazado",   color: "#a8200d", bg: "#ffe2dc" },
  approved:    { label: "Aprobado",    color: "#026149", bg: "#e7f8ef" },
};

type StatusKey = "all" | "in_progress" | "completed";

type TicketFormKind = "offboarding" | "suspend" | "transfer" | "access";

const KIND_LABELS: Record<TicketFormKind, string> = {
  offboarding: "Baja",
  suspend:     "Suspensión",
  transfer:    "Transferencia",
  access:      "Acceso especial",
};

const REASONS_BY_KIND: Record<TicketFormKind, string[]> = {
  offboarding: ["Renuncia voluntaria", "Fin de contrato", "Despido", "Mutuo acuerdo", "Otro"],
  suspend:     ["Investigación interna", "Permiso sin goce", "Incapacidad médica", "Otro"],
  transfer:    ["Cambio de hub", "Ascenso", "Reubicación geográfica", "Otro"],
  access:      ["Proyecto especial", "Cobertura temporal", "Solicitud de manager", "Otro"],
};

// ── New Ticket Modal ───────────────────────────────────────────────────────────
function NewTicketModal({
  kind,
  onClose,
}: {
  kind: TicketFormKind;
  onClose: () => void;
}) {
  const { data: users } = useUsers();
  const { notify } = useNotif();
  const { appUser } = useAuth();

  const sorted = useMemo(
    () => [...users].sort((a, b) => a.fullName.localeCompare(b.fullName)),
    [users]
  );

  const [selectedUserId, setSelectedUserId] = useState("");
  const [reason,  setReason]  = useState("");
  const [lastDay, setLastDay] = useState("");
  const [saving,  setSaving]  = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const now = new Date().toISOString().slice(0, 10);
      await createOffboardingTicket({
        kind,
        userId: selectedUserId,
        reason,
        lastDay: kind === "offboarding" ? lastDay : now,
        createdAt: now,
        createdBy: appUser?.fullName ?? "HR",
        status: "in_progress",
        progress: 0,
        approvals: [
          { role: "Manager directo",     who: "Pendiente", state: "pending" },
          { role: "HR Business Partner", who: "Pendiente", state: "pending" },
          ...(kind === "offboarding" || kind === "suspend"
            ? [{ role: "IT / Sistemas", who: "Pendiente", state: "pending" as const }]
            : []),
        ],
        timeline: [
          { state: "done",    title: "Ticket creado",           who: appUser?.fullName ?? "HR", when: now },
          { state: "current", title: "Esperando aprobaciones",  when: "—" },
          { state: "pending", title: "Ejecución",               when: "—" },
          { state: "pending", title: "Completado",              when: "—" },
        ],
      });
      notify({ title: "Ticket creado", body: `Ticket de ${KIND_LABELS[kind]} iniciado correctamente.`, kind: "info" });
      onClose();
    } finally {
      setSaving(false);
    }
  }

  const inputClass = "h-9 w-full px-3 rounded-[var(--radius-sm)] border border-[var(--color-line)] bg-[var(--color-surface)] text-[var(--color-ink)] text-[13px] outline-none";

  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/30 backdrop-blur-[2px]" onClick={onClose} />
      <div className="fixed left-1/2 top-1/2 z-50 -translate-x-1/2 -translate-y-1/2 w-[520px] rounded-[var(--radius-lg)] bg-[var(--color-surface)] shadow-[var(--shadow-lg)] p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-[15px] text-[var(--color-ink)]">
            Nuevo ticket · {KIND_LABELS[kind]}
          </h2>
          <button onClick={onClose} className="p-1 rounded-md text-[var(--color-ink-3)] hover:bg-[var(--color-surface-2)] transition-colors">
            <Close size={16} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="text-[11px] text-[var(--color-ink-4)] mb-1 block">Colaborador *</label>
            <select className={inputClass} required value={selectedUserId} onChange={(e) => setSelectedUserId(e.target.value)}>
              <option value="">Seleccionar colaborador…</option>
              {sorted.map((u) => (
                <option key={u.id} value={u.id}>{u.fullName}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-[11px] text-[var(--color-ink-4)] mb-1 block">Motivo *</label>
            <select className={inputClass} required value={reason} onChange={(e) => setReason(e.target.value)}>
              <option value="">Seleccionar motivo…</option>
              {REASONS_BY_KIND[kind].map((r) => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
          </div>
          {kind === "offboarding" && (
            <div>
              <label className="text-[11px] text-[var(--color-ink-4)] mb-1 block">Última jornada *</label>
              <input type="date" className={inputClass} required value={lastDay} onChange={(e) => setLastDay(e.target.value)} />
            </div>
          )}
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="secondary" size="sm" onClick={onClose}>Cancelar</Button>
            <Button type="submit" variant="primary" size="sm" disabled={saving}>
              {saving ? "Guardando…" : "Crear ticket"}
            </Button>
          </div>
        </form>
      </div>
    </>
  );
}

function TicketDetail({
  ticket,
  userName,
  onClose,
}: {
  ticket: Ticket & { id: string };
  userName: string;
  onClose: () => void;
}) {
  const [loading, setLoading] = useState(false);

  async function handleApprove(role: string) {
    setLoading(true);
    try { await submitApproval({ ticketId: ticket.id, role, decision: "approved" }); }
    finally { setLoading(false); }
  }

  const statusCfg = STATUS_CONFIG[ticket.status] ?? STATUS_CONFIG.in_progress;

  return (
    <Drawer open onClose={onClose} title={`${ticket.kind === "offboarding" ? "Baja" : "Ticket"} · ${userName}`} subtitle={`${ticket.id} · ${ticket.reason}`}>
      <div className="px-6 py-5 space-y-6">
        {/* Progress */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[12px] text-[var(--color-ink-3)]">{Math.round(ticket.progress * 100)}% completado</span>
            <span className="text-[12px] font-medium px-2 py-0.5 rounded-full" style={{ color: statusCfg.color, background: statusCfg.bg }}>
              {statusCfg.label}
            </span>
          </div>
          <div className="h-2 rounded-full bg-[var(--color-line)] overflow-hidden">
            <div className="h-full rounded-full bg-green-500 transition-all" style={{ width: `${ticket.progress * 100}%` }} />
          </div>
        </div>

        {/* Key info */}
        <div className="grid grid-cols-2 gap-3 text-[13px]">
          {[
            ["Motivo", ticket.reason],
            ["Última jornada", ticket.lastDay],
            ["Creado por", ticket.createdBy],
            ["Fecha", ticket.createdAt],
          ].map(([label, value]) => (
            <div key={label}>
              <div className="text-[11px] text-[var(--color-ink-4)] mb-0.5">{label}</div>
              <div className="font-medium text-[var(--color-ink-2)]">{value}</div>
            </div>
          ))}
        </div>

        {/* Approvals */}
        <div>
          <h3 className="text-[11px] font-semibold uppercase tracking-widest text-[var(--color-ink-4)] mb-3">Aprobaciones</h3>
          <div className="space-y-2">
            {ticket.approvals.map((a, i) => (
              <div key={i} className={cn("flex items-center gap-3 px-4 py-3 rounded-[var(--radius-sm)] border",
                a.state === "approved" ? "border-green-200 bg-[var(--color-success-bg)]" : "border-[var(--color-line)] bg-[var(--color-surface-2)]"
              )}>
                <div className="flex-1">
                  <div className="text-[11px] text-[var(--color-ink-4)] uppercase tracking-wide">{a.role}</div>
                  <div className="text-[13px] font-medium text-[var(--color-ink-2)]">{a.who}</div>
                </div>
                {a.state === "approved" ? (
                  <span className="flex items-center gap-1 text-green-600 text-[12px] font-medium">
                    <Check size={13} /> Aprobado
                  </span>
                ) : a.state === "pending" ? (
                  <Button size="sm" variant="primary" onClick={() => handleApprove(a.role)} disabled={loading}>
                    Aprobar
                  </Button>
                ) : (
                  <span className="text-[var(--color-danger-fg)] text-[12px]">Rechazado</span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Timeline */}
        <div>
          <h3 className="text-[11px] font-semibold uppercase tracking-widest text-[var(--color-ink-4)] mb-3">Línea de tiempo</h3>
          <div className="space-y-3">
            {ticket.timeline.map((e, i) => (
              <div key={i} className="flex gap-3">
                <div className="flex flex-col items-center">
                  <div className={cn("size-2 rounded-full mt-1 shrink-0",
                    e.state === "done" ? "bg-green-500" : e.state === "current" ? "bg-green-500 ring-4 ring-green-500/20" : "bg-[var(--color-line-strong)]"
                  )} />
                  {i < ticket.timeline.length - 1 && <div className="w-px flex-1 mt-1 bg-[var(--color-line)]" />}
                </div>
                <div className="pb-3">
                  <div className={cn("text-[13px]", e.state === "pending" ? "text-[var(--color-ink-3)]" : "text-[var(--color-ink-2)]")}>{e.title}</div>
                  <div className="text-[11.5px] text-[var(--color-ink-4)] mt-0.5">{e.who ? `${e.who} · ` : ""}{e.when}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Drawer>
  );
}

export function TicketsView() {
  const { data: tickets,  loading: lt, error: et } = useTickets();
  const { data: users,    loading: lu }             = useUsers();
  const { notify } = useNotif();
  const navigate   = useNavigate();
  const [statusF,  setStatusF]  = useState<StatusKey>("all");
  const [selected, setSelected] = useState<(Ticket & { id: string }) | null>(null);
  const [chooser,  setChooser]  = useState(false);
  const [ticketKind, setTicketKind] = useState<TicketFormKind | null>(null);

  function handleTicketSelect(id: string) {
    setChooser(false);
    if (id === "import") { navigate("/directory"); return; }
    if (id === "offboard") { setTicketKind("offboarding"); return; }
    if (id === "suspend" || id === "transfer" || id === "access") {
      setTicketKind(id as TicketFormKind);
      return;
    }
    notify({ title: `Nuevo ticket · ${id}`, body: "El formulario se abrirá en la siguiente versión.", kind: "info" });
  }

  const filtered = useMemo(() => {
    if (statusF === "all") return tickets;
    return tickets.filter((t) => t.status === statusF);
  }, [tickets, statusF]);

  const counts = useMemo(() => ({
    all:         tickets.length,
    in_progress: tickets.filter((t) => t.status === "in_progress").length,
    completed:   tickets.filter((t) => t.status === "completed").length,
  }), [tickets]);

  if (lt || lu) return <LoadingView />;
  if (et)       return <ErrorView message={et.message} />;

  function userName(userId: string) {
    return users.find((u) => u.id === userId)?.fullName ?? userId;
  }

  return (
    <div className="p-5 space-y-5">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="font-serif text-[22px] font-medium text-[var(--color-ink)]">Bajas</h1>
          <p className="text-[12.5px] text-[var(--color-ink-3)]">Tickets de baja, suspensión y transferencia.</p>
        </div>
        <Button variant="primary" icon={<Plus size={14} />} onClick={() => setChooser(true)}>Nuevo ticket</Button>
      </div>

      {/* Status tabs */}
      <div className="flex gap-1">
        {(["all", "in_progress", "completed"] as const).map((s) => {
          const labels: Record<string, string> = { all: "Todos", in_progress: "En curso", completed: "Completados" };
          return (
            <button key={s} onClick={() => setStatusF(s)}
              className={cn("flex items-center gap-1.5 h-8 px-3 rounded-[var(--radius-sm)] text-[12.5px] font-medium transition-colors",
                statusF === s ? "bg-green-500 text-white" : "text-[var(--color-ink-3)] hover:bg-[var(--color-surface-2)]"
              )}>
              {labels[s]} <span className={cn("text-[11px] font-mono rounded-full px-1.5 py-px",
                statusF === s ? "bg-white/20 text-white" : "bg-[var(--color-line)] text-[var(--color-ink-3)]"
              )}>{counts[s]}</span>
            </button>
          );
        })}
      </div>

      {/* Ticket cards */}
      <div className="space-y-3">
        {filtered.map((t) => {
          const statusCfg = STATUS_CONFIG[t.status] ?? STATUS_CONFIG.in_progress;
          const name = userName(t.userId);
          return (
            <div key={t.id} onClick={() => setSelected(t)}
              className="flex items-center gap-4 px-5 py-4 rounded-[var(--radius)] bg-[var(--color-surface)] border border-[var(--color-line)] shadow-[var(--shadow-sm)] cursor-pointer hover:bg-[var(--color-surface-2)] transition-colors group">
              <div className="size-10 rounded-[var(--radius-sm)] grid place-items-center shrink-0"
                style={{ background: t.kind === "offboarding" ? "var(--color-danger-bg)" : "var(--color-mint-50)",
                         color: t.kind === "offboarding" ? "var(--color-danger-fg)" : "var(--color-green-700)" }}>
                {t.kind === "offboarding" ? "↓" : "+"}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="font-mono text-[11.5px] text-[var(--color-ink-4)]">{t.id}</span>
                  <span className="text-[12px] font-medium px-2 py-0.5 rounded-full" style={{ color: statusCfg.color, background: statusCfg.bg }}>
                    {statusCfg.label}
                  </span>
                </div>
                <div className="font-medium text-[var(--color-ink)] text-[14px]">
                  {t.kind === "offboarding" ? "Baja" : "Alta"} de {name}
                </div>
                <div className="text-[12px] text-[var(--color-ink-3)] mt-0.5">{t.reason} · Última jornada {t.lastDay}</div>
              </div>
              <div className="flex items-center gap-4 shrink-0">
                <div className="text-right">
                  <div className="text-[11.5px] text-[var(--color-ink-3)]">{Math.round(t.progress * 100)}%</div>
                  <div className="w-24 h-1.5 rounded-full bg-[var(--color-line)] overflow-hidden mt-1">
                    <div className="h-full rounded-full bg-green-500" style={{ width: `${t.progress * 100}%` }} />
                  </div>
                </div>
                <ChevronRight size={16} className="text-[var(--color-ink-4)] opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            </div>
          );
        })}
        {filtered.length === 0 && (
          <div className="py-16 text-center text-[var(--color-ink-4)] text-[13px]">Sin tickets para esta categoría.</div>
        )}
      </div>

      {selected && (
        <TicketDetail ticket={selected} userName={userName(selected.userId)} onClose={() => setSelected(null)} />
      )}
      {chooser && (
        <NewTicketChooser onClose={() => setChooser(false)} onSelect={handleTicketSelect} />
      )}
      {ticketKind && (
        <NewTicketModal kind={ticketKind} onClose={() => setTicketKind(null)} />
      )}
    </div>
  );
}
