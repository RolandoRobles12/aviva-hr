import { useState, useMemo } from "react";
import { useCandidates } from "@/hooks/useCandidates";
import { updateCandidateStage } from "@/services/candidates";
import { useCatalog } from "@/context/CatalogContext";
import { useAuth } from "@/context/AuthContext";
import { useNotif } from "@/context/NotifContext";
import { createDoc } from "@/hooks/useFirestore";
import type { Candidate } from "@/data/types";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Drawer } from "@/components/ui/Drawer";
import { LoadingView, ErrorView } from "@/components/ui/Spinner";
import { Search, Plus, ChevronRight, CheckCircle2, Clock, XCircle, Close } from "@/components/icons";
import { cn } from "@/lib/cn";

// ── New Candidate Modal ────────────────────────────────────────────────────────
function NewCandidateModal({ onClose }: { onClose: () => void }) {
  const { regions, estados } = useCatalog();
  const { appUser } = useAuth();
  const { notify } = useNotif();
  const [saving, setSaving] = useState(false);

  const [first,     setFirst]     = useState("");
  const [last,      setLast]      = useState("");
  const [position,  setPosition]  = useState("");
  const [region,    setRegion]    = useState("");
  const [quiosco,   setQuiosco]   = useState("");
  const [estado,    setEstado]    = useState("");
  const [recruiter, setRecruiter] = useState(appUser?.fullName ?? "");
  const [email,     setEmail]     = useState("");
  const [phone,     setPhone]     = useState("");
  const [salary,    setSalary]    = useState("");
  const [startDate, setStartDate] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const now = new Date().toISOString().slice(0, 10);
      await createDoc("candidates", {
        first, last,
        fullName: `${first} ${last}`,
        position, region, quiosco, estado,
        recruiter,
        email, phone,
        salary,
        startDate,
        stage: "offer_sent",
        avatar: {
          initials: (first[0] ?? "?").toUpperCase() + (last[0] ?? "").toUpperCase(),
          color: "c2",
        },
        docs: [],
        answers: [],
        timeline: [{ state: "current", title: "Candidato registrado", who: recruiter, when: now }],
        createdAt: now,
      });
      notify({ title: "Candidato registrado", body: `${first} ${last} · etapa: Carta enviada.`, kind: "onboard" });
      onClose();
    } finally {
      setSaving(false);
    }
  }

  const inputClass = "h-9 w-full px-3 rounded-[var(--radius-sm)] border border-[var(--color-line)] bg-[var(--color-surface)] text-[var(--color-ink)] text-[13px] outline-none";

  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/30 backdrop-blur-[2px]" onClick={onClose} />
      <div className="fixed left-1/2 top-1/2 z-50 -translate-x-1/2 -translate-y-1/2 w-[520px] max-h-[90vh] overflow-y-auto rounded-[var(--radius-lg)] bg-[var(--color-surface)] shadow-[var(--shadow-lg)] p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-[15px] text-[var(--color-ink)]">Nuevo candidato</h2>
          <button onClick={onClose} className="p-1 rounded-md text-[var(--color-ink-3)] hover:bg-[var(--color-surface-2)] transition-colors">
            <Close size={16} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] text-[var(--color-ink-4)] mb-1 block">Nombre *</label>
              <input className={inputClass} required value={first} onChange={(e) => setFirst(e.target.value)} placeholder="Juan" />
            </div>
            <div>
              <label className="text-[11px] text-[var(--color-ink-4)] mb-1 block">Apellidos *</label>
              <input className={inputClass} required value={last} onChange={(e) => setLast(e.target.value)} placeholder="García López" />
            </div>
            <div className="col-span-2">
              <label className="text-[11px] text-[var(--color-ink-4)] mb-1 block">Puesto *</label>
              <input className={inputClass} required value={position} onChange={(e) => setPosition(e.target.value)} placeholder="Ej. Promotor de campo" />
            </div>
            <div>
              <label className="text-[11px] text-[var(--color-ink-4)] mb-1 block">Región</label>
              <select className={inputClass} value={region} onChange={(e) => setRegion(e.target.value)}>
                <option value="">Sin asignar</option>
                {regions.map((r) => <option key={r.id} value={r.id}>{r.label}</option>)}
              </select>
            </div>
            <div>
              <label className="text-[11px] text-[var(--color-ink-4)] mb-1 block">Estado</label>
              <select className={inputClass} value={estado} onChange={(e) => setEstado(e.target.value)}>
                <option value="">Sin asignar</option>
                {estados.map((est) => <option key={est} value={est}>{est}</option>)}
              </select>
            </div>
            <div>
              <label className="text-[11px] text-[var(--color-ink-4)] mb-1 block">Quiósco</label>
              <input className={inputClass} value={quiosco} onChange={(e) => setQuiosco(e.target.value)} placeholder="Nombre del quiósco" />
            </div>
            <div>
              <label className="text-[11px] text-[var(--color-ink-4)] mb-1 block">Reclutador</label>
              <input className={inputClass} value={recruiter} onChange={(e) => setRecruiter(e.target.value)} />
            </div>
            <div>
              <label className="text-[11px] text-[var(--color-ink-4)] mb-1 block">Email</label>
              <input type="email" className={inputClass} value={email} onChange={(e) => setEmail(e.target.value)} placeholder="candidato@email.com" />
            </div>
            <div>
              <label className="text-[11px] text-[var(--color-ink-4)] mb-1 block">Teléfono</label>
              <input className={inputClass} value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+52 55 0000 0000" />
            </div>
            <div>
              <label className="text-[11px] text-[var(--color-ink-4)] mb-1 block">Salario bruto</label>
              <input className={inputClass} value={salary} onChange={(e) => setSalary(e.target.value)} placeholder="$15,000" />
            </div>
            <div>
              <label className="text-[11px] text-[var(--color-ink-4)] mb-1 block">Fecha de inicio prevista</label>
              <input type="date" className={inputClass} value={startDate} onChange={(e) => setStartDate(e.target.value)} />
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="secondary" size="sm" onClick={onClose}>Cancelar</Button>
            <Button type="submit" variant="primary" size="sm" disabled={saving}>
              {saving ? "Guardando…" : "Registrar candidato"}
            </Button>
          </div>
        </form>
      </div>
    </>
  );
}

const TABS = [
  { id: "all",       label: "Todos" },
  { id: "offer",     label: "Carta oferta" },
  { id: "documents", label: "Documentos" },
  { id: "contract",  label: "Contrato" },
  { id: "accounts",  label: "Correos" },
  { id: "induction", label: "Inducción" },
  { id: "rejected",  label: "Rechazados" },
];

const STAGE_ORDER = ["offer", "documents", "contract", "accounts", "induction"];

function DocStatusIcon({ status }: { status: string }) {
  if (status === "ok")       return <CheckCircle2 size={14} className="text-green-500 shrink-0" />;
  if (status === "review")   return <Clock size={14} className="text-amber-500 shrink-0" />;
  if (status === "rejected") return <XCircle size={14} className="text-red-500 shrink-0" />;
  return <div className="size-3.5 rounded-full border-2 border-[var(--color-line)] shrink-0" />;
}

function DocProgress({ docs }: { docs: Candidate["docs"] }) {
  const { docTypes } = useCatalog();
  const required = docTypes.filter((d) => d.required).length;
  const ok = docs.filter((d) => d.status === "ok").length;
  if (docs.length === 0) return <span className="text-[var(--color-ink-4)] text-xs">—</span>;
  return (
    <span className="text-[12.5px] font-mono text-[var(--color-ink-3)]">{ok}/{required}</span>
  );
}

function StageProgress({ stage }: { stage: string }) {
  const { stageMeta } = useCatalog();
  const meta = stageMeta(stage);
  if (!meta) return null;
  const groupIdx = STAGE_ORDER.indexOf(meta.group);
  const pct = groupIdx < 0 ? 0 : Math.round(((groupIdx + 0.5) / STAGE_ORDER.length) * 100);
  return (
    <div className="flex items-center gap-2">
      <div className="w-16 h-1.5 rounded-full bg-[var(--color-line)] overflow-hidden">
        <div className="h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: meta.color }} />
      </div>
      <span className="text-[11.5px] text-[var(--color-ink-3)] font-mono">{pct}%</span>
    </div>
  );
}

function CandidateDetail({ candidate, onClose }: { candidate: Candidate; onClose: () => void }) {
  const { stages, stageMeta, regionLabel, docTypes } = useCatalog();
  const stage  = stageMeta(candidate.stage);
  const region = regionLabel(candidate.region);

  async function handleStageChange(newStage: string) {
    await updateCandidateStage((candidate as Candidate & { id: string }).id ?? "", newStage, candidate.fullName);
  }

  return (
    <Drawer open onClose={onClose} title={candidate.fullName} subtitle={`${candidate.position} · ${candidate.quiosco}, ${candidate.estado}`}>
      <div className="px-6 py-5 space-y-6">
        <div className="flex items-center justify-between">
          {stage && <Badge color={stage.color} bg={stage.bg}>{stage.label}</Badge>}
          <span className="text-[12px] text-[var(--color-ink-3)]">
            Reclutador: <strong className="text-[var(--color-ink-2)]">{candidate.recruiter}</strong>
          </span>
        </div>

        <div className="grid grid-cols-2 gap-x-4 gap-y-3 text-[13px]">
          {[
            ["Región", region],
            ["Ingreso", candidate.startDate ?? "—"],
            ["Salario", candidate.salary ?? "—"],
            ["Viterbit", candidate.viterbitId ?? "—"],
            ["Email", candidate.email ?? "—"],
            ["Teléfono", candidate.phone ?? "—"],
          ].map(([label, value]) => (
            <div key={label}>
              <div className="text-[11px] text-[var(--color-ink-4)] mb-0.5">{label}</div>
              <div className="text-[var(--color-ink-2)] font-medium">{value}</div>
            </div>
          ))}
        </div>

        <div>
          <h3 className="text-[11px] font-semibold uppercase tracking-widest text-[var(--color-ink-4)] mb-2">Cambiar etapa</h3>
          <select
            value={candidate.stage}
            onChange={(e) => handleStageChange(e.target.value)}
            className="w-full h-8 px-2 text-[13px] rounded-[var(--radius-sm)] border border-[var(--color-line)] bg-[var(--color-surface)] text-[var(--color-ink)] outline-none"
          >
            {stages.map((s) => (
              <option key={s.id} value={s.id}>{s.label}</option>
            ))}
          </select>
        </div>

        <div>
          <h3 className="text-[11px] font-semibold uppercase tracking-widest text-[var(--color-ink-4)] mb-3">Documentos</h3>
          <div className="space-y-2">
            {docTypes.map((dt) => {
              const docEntry = candidate.docs.find((d) => d.id === dt.id);
              const status   = docEntry?.status ?? "pending";
              return (
                <div key={dt.id} className="flex items-center gap-2.5">
                  <DocStatusIcon status={status} />
                  <span className="text-[13px] text-[var(--color-ink-2)] flex-1">{dt.label}</span>
                  {!dt.required && <span className="text-[11px] text-[var(--color-ink-4)]">Opcional</span>}
                </div>
              );
            })}
          </div>
        </div>

        <div>
          <h3 className="text-[11px] font-semibold uppercase tracking-widest text-[var(--color-ink-4)] mb-3">Historial</h3>
          <div className="space-y-3">
            {candidate.timeline.map((event, i) => (
              <div key={i} className="flex gap-3">
                <div className="flex flex-col items-center">
                  <div className={cn(
                    "size-2 rounded-full mt-1 shrink-0",
                    event.state === "done"    && "bg-green-500",
                    event.state === "current" && "bg-green-500 ring-4 ring-green-500/20",
                    event.state === "pending" && "bg-[var(--color-line-strong)]"
                  )} />
                  {i < candidate.timeline.length - 1 && (
                    <div className="w-px flex-1 mt-1 bg-[var(--color-line)]" />
                  )}
                </div>
                <div className="pb-3 min-w-0">
                  <div className={cn("text-[13px]", event.state === "pending" ? "text-[var(--color-ink-3)]" : "text-[var(--color-ink-2)]")}>
                    {event.title}
                  </div>
                  <div className="text-[11.5px] text-[var(--color-ink-4)] mt-0.5">
                    {event.who ? `${event.who} · ` : ""}{event.when}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Drawer>
  );
}

export function CandidatesView() {
  const { data: candidates, loading, error } = useCandidates();
  const { stageMeta, groupMeta } = useCatalog();
  const [tab, setTab]         = useState("all");
  const [query, setQuery]     = useState("");
  const [selected, setSelected] = useState<(Candidate & { id: string }) | null>(null);
  const [newCandOpen, setNewCandOpen] = useState(false);

  const filtered = useMemo(() => {
    let list = candidates;
    if (tab !== "all") list = list.filter((c) => stageMeta(c.stage)?.group === tab);
    if (query.trim()) {
      const q = query.toLowerCase();
      list = list.filter(
        (c) =>
          c.fullName.toLowerCase().includes(q) ||
          c.position.toLowerCase().includes(q) ||
          c.quiosco.toLowerCase().includes(q) ||
          c.recruiter.toLowerCase().includes(q)
      );
    }
    return list;
  }, [candidates, tab, query, stageMeta]);

  const counts = useMemo(() => {
    const map: Record<string, number> = { all: candidates.length };
    for (const c of candidates) {
      const meta = stageMeta(c.stage);
      if (meta?.group) map[meta.group] = (map[meta.group] ?? 0) + 1;
    }
    return map;
  }, [candidates, stageMeta]);

  if (loading) return <LoadingView />;
  if (error)   return <ErrorView message={error.message} />;

  return (
    <div className="flex flex-col h-full">
      {/* Toolbar */}
      <div className="flex items-center gap-2 px-5 py-3 border-b border-[var(--color-line)] bg-[var(--color-surface)] shrink-0">
        <div className="flex items-center gap-2 h-8 px-3 rounded-[var(--radius-sm)] bg-[var(--color-surface-2)] border border-[var(--color-line)] min-w-[220px]">
          <Search size={13} className="text-[var(--color-ink-4)] shrink-0" />
          <input
            type="search"
            placeholder="Buscar candidato…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-1 bg-transparent text-[13px] text-[var(--color-ink)] placeholder:text-[var(--color-ink-4)] outline-none"
          />
        </div>

        <div className="flex items-center gap-1 ml-2 overflow-x-auto">
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={cn(
                "flex items-center gap-1.5 h-8 px-3 rounded-[var(--radius-sm)] text-[12.5px] font-medium whitespace-nowrap transition-colors",
                tab === t.id
                  ? "bg-green-500 text-white"
                  : "text-[var(--color-ink-3)] hover:bg-[var(--color-surface-2)] hover:text-[var(--color-ink)]"
              )}
            >
              {t.label}
              {counts[t.id] != null && (
                <span className={cn(
                  "text-[11px] font-mono rounded-full px-1.5 py-px",
                  tab === t.id ? "bg-white/20 text-white" : "bg-[var(--color-line)] text-[var(--color-ink-3)]"
                )}>
                  {counts[t.id]}
                </span>
              )}
            </button>
          ))}
        </div>

        <div className="ml-auto flex items-center gap-2">
          <Button variant="primary" size="sm" icon={<Plus />} onClick={() => setNewCandOpen(true)}>Nuevo candidato</Button>
        </div>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-auto">
        <table className="w-full min-w-[900px] border-collapse text-[13px]">
          <thead className="sticky top-0 z-10">
            <tr className="border-b border-[var(--color-line)] bg-[var(--color-surface-2)]">
              {["Nombre", "Puesto", "Locación", "Etapa", "Documentos", "Progreso", "Reclutador", "Alta", ""].map((h) => (
                <th key={h} className="px-4 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wider text-[var(--color-ink-4)] whitespace-nowrap">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((c) => {
              const stage = stageMeta(c.stage);
              return (
                <tr key={c.id} onClick={() => setSelected(c)} className="border-b border-[var(--color-line)] hover:bg-[var(--color-mint-50)] cursor-pointer transition-colors group">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2.5">
                      <Avatar user={c} size="sm" />
                      <span className="font-medium text-[var(--color-ink)]">{c.fullName}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-[var(--color-ink-2)] max-w-[180px]">
                    <span className="truncate block">{c.position}</span>
                  </td>
                  <td className="px-4 py-3 text-[var(--color-ink-3)] whitespace-nowrap">{c.quiosco}, {c.estado}</td>
                  <td className="px-4 py-3">
                    {stage ? <Badge color={stage.color} bg={stage.bg}>{stage.label}</Badge> : <span className="text-[var(--color-ink-4)]">—</span>}
                  </td>
                  <td className="px-4 py-3"><DocProgress docs={c.docs} /></td>
                  <td className="px-4 py-3"><StageProgress stage={c.stage} /></td>
                  <td className="px-4 py-3 text-[var(--color-ink-3)] whitespace-nowrap">{c.recruiter}</td>
                  <td className="px-4 py-3 font-mono text-[12px] text-[var(--color-ink-4)] whitespace-nowrap">{c.createdAt}</td>
                  <td className="px-4 py-3">
                    <ChevronRight size={14} className="text-[var(--color-ink-4)] opacity-0 group-hover:opacity-100 transition-opacity" />
                  </td>
                </tr>
              );
            })}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={9} className="px-4 py-16 text-center text-[var(--color-ink-4)] text-[13px]">Sin candidatos para esta etapa.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Summary bar */}
      <div className="flex items-center gap-3 px-5 py-2.5 border-t border-[var(--color-line)] bg-[var(--color-surface)] shrink-0 text-[12px] text-[var(--color-ink-3)]">
        {Object.entries(groupMeta).map(([id, meta]) => {
          const count = counts[id] ?? 0;
          if (count === 0) return null;
          return (
            <div key={id} className="flex items-center gap-1.5">
              <div className="size-2 rounded-full" style={{ backgroundColor: meta.color }} />
              <span style={{ color: meta.color }}>{meta.label}</span>
              <span className="font-mono text-[var(--color-ink-4)]">{count}</span>
            </div>
          );
        })}
        <span className="ml-auto text-[var(--color-ink-4)]">{filtered.length} de {candidates.length} candidatos</span>
      </div>

      {selected && <CandidateDetail candidate={selected} onClose={() => setSelected(null)} />}
      {newCandOpen && <NewCandidateModal onClose={() => setNewCandOpen(false)} />}
    </div>
  );
}
