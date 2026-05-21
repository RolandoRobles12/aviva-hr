import { useState, useMemo } from "react";
import { candidates, STAGES, GROUP_META, stageMeta, hubLabel, DOC_TYPES } from "@/data/mock";
import type { Candidate } from "@/data/types";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Drawer } from "@/components/ui/Drawer";
import { Search, Plus, ChevronRight, CheckCircle2, Clock, XCircle } from "@/components/icons";
import { cn } from "@/lib/cn";

// ── Stage tab bar ─────────────────────────────────────────────────────────

const TABS = [
  { id: "all",       label: "Todos" },
  { id: "offer",     label: "Carta oferta" },
  { id: "documents", label: "Documentos" },
  { id: "contract",  label: "Contrato" },
  { id: "accounts",  label: "Correos" },
  { id: "induction", label: "Inducción" },
  { id: "rejected",  label: "Rechazados" },
];

// ── Doc progress pill ─────────────────────────────────────────────────────

function DocProgress({ docs }: { docs: Candidate["docs"] }) {
  const required = DOC_TYPES.filter((d) => d.required).length;
  const ok = docs.filter((d) => d.status === "ok").length;
  if (docs.length === 0) return <span className="text-[var(--color-ink-4)] text-xs">—</span>;
  return (
    <span className="text-[12.5px] font-mono text-[var(--color-ink-3)]">
      {ok}/{required}
    </span>
  );
}

// ── Progress bar ──────────────────────────────────────────────────────────

const STAGE_ORDER = ["offer", "documents", "contract", "accounts", "induction"];

function StageProgress({ stage }: { stage: string }) {
  const meta = stageMeta(stage);
  if (!meta) return null;
  const groupIdx = STAGE_ORDER.indexOf(meta.group);
  const pct = groupIdx < 0 ? 0 : Math.round(((groupIdx + 0.5) / STAGE_ORDER.length) * 100);
  return (
    <div className="flex items-center gap-2">
      <div className="w-16 h-1.5 rounded-full bg-[var(--color-line)] overflow-hidden">
        <div
          className="h-full rounded-full"
          style={{ width: `${pct}%`, backgroundColor: meta.color }}
        />
      </div>
      <span className="text-[11.5px] text-[var(--color-ink-3)] font-mono">{pct}%</span>
    </div>
  );
}

// ── Candidate detail drawer ───────────────────────────────────────────────

function DocStatusIcon({ status }: { status: string }) {
  if (status === "ok")     return <CheckCircle2 size={14} className="text-green-500 shrink-0" />;
  if (status === "review") return <Clock size={14} className="text-amber-500 shrink-0" />;
  if (status === "rejected") return <XCircle size={14} className="text-red-500 shrink-0" />;
  return <div className="size-3.5 rounded-full border-2 border-[var(--color-line)] shrink-0" />;
}

function CandidateDetail({
  candidate,
  onClose,
}: {
  candidate: Candidate;
  onClose: () => void;
}) {
  const stage = stageMeta(candidate.stage);
  const hub = hubLabel(candidate.hub);

  return (
    <Drawer
      open={!!candidate}
      onClose={onClose}
      title={candidate.fullName}
      subtitle={`${candidate.position} · ${candidate.quiosco}, ${candidate.estado}`}
    >
      <div className="px-6 py-5 space-y-6">
        {/* Stage badge + recruiter */}
        <div className="flex items-center justify-between">
          {stage && (
            <Badge color={stage.color} bg={stage.bg}>
              {stage.label}
            </Badge>
          )}
          <span className="text-[12px] text-[var(--color-ink-3)]">
            Reclutador: <strong className="text-[var(--color-ink-2)]">{candidate.recruiter}</strong>
          </span>
        </div>

        {/* Key info grid */}
        <div className="grid grid-cols-2 gap-x-4 gap-y-3 text-[13px]">
          {[
            ["Hub", hub],
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

        {/* Documents */}
        <div>
          <h3 className="text-[11px] font-semibold uppercase tracking-widest text-[var(--color-ink-4)] mb-3">
            Documentos
          </h3>
          <div className="space-y-2">
            {DOC_TYPES.map((dt) => {
              const doc = candidate.docs.find((d) => d.id === dt.id);
              const status = doc?.status ?? "pending";
              return (
                <div key={dt.id} className="flex items-center gap-2.5">
                  <DocStatusIcon status={status} />
                  <span className="text-[13px] text-[var(--color-ink-2)] flex-1">
                    {dt.label}
                  </span>
                  {!dt.required && (
                    <span className="text-[11px] text-[var(--color-ink-4)]">Opcional</span>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Timeline */}
        <div>
          <h3 className="text-[11px] font-semibold uppercase tracking-widest text-[var(--color-ink-4)] mb-3">
            Historial
          </h3>
          <div className="space-y-3">
            {candidate.timeline.map((event, i) => (
              <div key={i} className="flex gap-3">
                <div className="flex flex-col items-center">
                  <div
                    className={cn(
                      "size-2 rounded-full mt-1 shrink-0",
                      event.state === "done"    && "bg-green-500",
                      event.state === "current" && "bg-green-500 ring-4 ring-green-500/20",
                      event.state === "pending" && "bg-[var(--color-line-strong)]"
                    )}
                  />
                  {i < candidate.timeline.length - 1 && (
                    <div className="w-px flex-1 mt-1 bg-[var(--color-line)]" />
                  )}
                </div>
                <div className="pb-3 min-w-0">
                  <div className={cn(
                    "text-[13px]",
                    event.state === "pending" ? "text-[var(--color-ink-3)]" : "text-[var(--color-ink-2)]"
                  )}>
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

// ── Main view ─────────────────────────────────────────────────────────────

export function CandidatesView() {
  const [tab, setTab] = useState("all");
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<Candidate | null>(null);

  const filtered = useMemo(() => {
    let list = candidates;
    if (tab !== "all") {
      list = list.filter((c) => {
        const meta = stageMeta(c.stage);
        return meta?.group === tab;
      });
    }
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
  }, [tab, query]);

  // Count per group
  const counts = useMemo(() => {
    const map: Record<string, number> = { all: candidates.length };
    for (const c of candidates) {
      const meta = stageMeta(c.stage);
      if (meta?.group) map[meta.group] = (map[meta.group] ?? 0) + 1;
    }
    return map;
  }, []);

  return (
    <div className="flex flex-col h-full">
      {/* Toolbar */}
      <div className="flex items-center gap-2 px-5 py-3 border-b border-[var(--color-line)] bg-[var(--color-surface)] shrink-0">
        {/* Search */}
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

        {/* Tabs */}
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
                <span
                  className={cn(
                    "text-[11px] font-mono rounded-full px-1.5 py-px",
                    tab === t.id
                      ? "bg-white/20 text-white"
                      : "bg-[var(--color-line)] text-[var(--color-ink-3)]"
                  )}
                >
                  {counts[t.id]}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Actions */}
        <div className="ml-auto flex items-center gap-2">
          <Button variant="primary" size="sm" icon={<Plus />}>
            Nuevo candidato
          </Button>
        </div>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-auto">
        <table className="w-full min-w-[900px] border-collapse text-[13px]">
          <thead className="sticky top-0 z-10">
            <tr className="border-b border-[var(--color-line)] bg-[var(--color-surface-2)]">
              {[
                "Nombre",
                "Puesto",
                "Locación",
                "Etapa",
                "Documentos",
                "Progreso",
                "Reclutador",
                "Alta",
                "",
              ].map((h) => (
                <th
                  key={h}
                  className="px-4 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wider text-[var(--color-ink-4)] whitespace-nowrap"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((c) => {
              const stage = stageMeta(c.stage);
              return (
                <tr
                  key={c.id}
                  onClick={() => setSelected(c)}
                  className="border-b border-[var(--color-line)] hover:bg-[var(--color-mint-50)] cursor-pointer transition-colors group"
                >
                  {/* Name */}
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2.5">
                      <Avatar user={c} size="sm" />
                      <span className="font-medium text-[var(--color-ink)]">
                        {c.fullName}
                      </span>
                    </div>
                  </td>

                  {/* Position */}
                  <td className="px-4 py-3 text-[var(--color-ink-2)] max-w-[180px]">
                    <span className="truncate block">{c.position}</span>
                  </td>

                  {/* Location */}
                  <td className="px-4 py-3 text-[var(--color-ink-3)] whitespace-nowrap">
                    {c.quiosco}, {c.estado}
                  </td>

                  {/* Stage */}
                  <td className="px-4 py-3">
                    {stage ? (
                      <Badge color={stage.color} bg={stage.bg}>
                        {stage.label}
                      </Badge>
                    ) : (
                      <span className="text-[var(--color-ink-4)]">—</span>
                    )}
                  </td>

                  {/* Docs */}
                  <td className="px-4 py-3">
                    <DocProgress docs={c.docs} />
                  </td>

                  {/* Progress */}
                  <td className="px-4 py-3">
                    <StageProgress stage={c.stage} />
                  </td>

                  {/* Recruiter */}
                  <td className="px-4 py-3 text-[var(--color-ink-3)] whitespace-nowrap">
                    {c.recruiter}
                  </td>

                  {/* Created at */}
                  <td className="px-4 py-3 font-mono text-[12px] text-[var(--color-ink-4)] whitespace-nowrap">
                    {c.createdAt}
                  </td>

                  {/* Arrow */}
                  <td className="px-4 py-3">
                    <ChevronRight
                      size={14}
                      className="text-[var(--color-ink-4)] opacity-0 group-hover:opacity-100 transition-opacity"
                    />
                  </td>
                </tr>
              );
            })}

            {filtered.length === 0 && (
              <tr>
                <td
                  colSpan={9}
                  className="px-4 py-16 text-center text-[var(--color-ink-4)] text-[13px]"
                >
                  Sin candidatos para esta etapa.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Group summary bar */}
      <div className="flex items-center gap-3 px-5 py-2.5 border-t border-[var(--color-line)] bg-[var(--color-surface)] shrink-0 text-[12px] text-[var(--color-ink-3)]">
        {Object.entries(GROUP_META).map(([id, meta]) => {
          const count = counts[id] ?? 0;
          if (count === 0) return null;
          return (
            <div key={id} className="flex items-center gap-1.5">
              <div
                className="size-2 rounded-full"
                style={{ backgroundColor: meta.color }}
              />
              <span style={{ color: meta.color }}>{meta.label}</span>
              <span className="font-mono text-[var(--color-ink-4)]">{count}</span>
            </div>
          );
        })}
        <span className="ml-auto text-[var(--color-ink-4)]">
          {filtered.length} de {candidates.length} candidatos
        </span>
      </div>

      {/* Detail drawer */}
      {selected && (
        <CandidateDetail candidate={selected} onClose={() => setSelected(null)} />
      )}
    </div>
  );
}
