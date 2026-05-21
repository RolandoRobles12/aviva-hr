import { useState, useMemo } from "react";
import { useCandidates } from "@/hooks/useCandidates";
import { approveExpediente, rejectExpediente } from "@/services/candidates";
import { useCatalog } from "@/context/CatalogContext";
import type { Candidate } from "@/data/types";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Drawer } from "@/components/ui/Drawer";
import { LoadingView, ErrorView } from "@/components/ui/Spinner";
import { CheckCircle2, Clock, XCircle, Download } from "@/components/icons";
import { cn } from "@/lib/cn";

const DOC_STAGES = ["invited", "in_progress", "under_review", "approved", "rejected"];

function DocStatusIcon({ status }: { status: string }) {
  if (status === "ok")       return <CheckCircle2 size={14} className="text-green-500 shrink-0" />;
  if (status === "review")   return <Clock size={14} className="text-amber-500 shrink-0" />;
  if (status === "rejected") return <XCircle size={14} className="text-red-500 shrink-0" />;
  return <div className="size-3.5 rounded-full border-2 border-[var(--color-line)] shrink-0" />;
}

function docCompletion(docs: Candidate["docs"], requiredCount: number): number {
  const ok = docs.filter((d) => d.status === "ok").length;
  return requiredCount > 0 ? Math.round((ok / requiredCount) * 100) : 0;
}

function ExpedienteDetail({ candidate, onClose }: { candidate: Candidate & { id: string }; onClose: () => void }) {
  const { docTypes } = useCatalog();
  const [loading, setLoading] = useState(false);
  const requiredCount = docTypes.filter((d) => d.required).length;
  const pct = docCompletion(candidate.docs, requiredCount);

  async function handleApprove() {
    setLoading(true);
    try { await approveExpediente({ candidateId: candidate.id }); }
    finally { setLoading(false); }
  }

  async function handleReject() {
    const reason = prompt("Motivo del rechazo:");
    if (!reason) return;
    setLoading(true);
    try { await rejectExpediente({ candidateId: candidate.id, reason }); }
    finally { setLoading(false); }
  }

  return (
    <Drawer open onClose={onClose} title={candidate.fullName} subtitle={`${candidate.position} · ${candidate.quiosco}`}>
      <div className="px-6 py-5 space-y-5">
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-[13px] font-medium text-[var(--color-ink-2)]">Completado</span>
            <span className="font-mono text-[13px] text-[var(--color-green-700)]">{pct}%</span>
          </div>
          <div className="h-2 rounded-full bg-[var(--color-line)] overflow-hidden">
            <div className="h-full rounded-full bg-green-500 transition-all" style={{ width: `${pct}%` }} />
          </div>
        </div>

        <div className="space-y-1.5">
          {docTypes.map((dt) => {
            const entry  = candidate.docs.find((d) => d.id === dt.id);
            const status = entry?.status ?? "pending";
            return (
              <div key={dt.id} className="flex items-center gap-2.5 py-1.5 border-b border-[var(--color-line)] last:border-0">
                <DocStatusIcon status={status} />
                <span className="flex-1 text-[13px] text-[var(--color-ink-2)]">{dt.label}</span>
                {!dt.required && <span className="text-[11px] text-[var(--color-ink-4)]">Opcional</span>}
                {status === "review" && (
                  <div className="flex gap-1">
                    <Button size="sm" variant="primary" className="!h-6 !text-[11px]">Aprobar</Button>
                    <Button size="sm" variant="danger" className="!h-6 !text-[11px]">Rechazar</Button>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div className="flex gap-2 pt-2">
          <Button variant="primary" onClick={handleApprove} className="flex-1" disabled={loading}>Aprobar expediente</Button>
          <Button variant="danger" onClick={handleReject} disabled={loading}>Rechazar</Button>
        </div>
      </div>
    </Drawer>
  );
}

export function ExpedientesView() {
  const { data: candidates, loading, error } = useCandidates();
  const { docTypes, stageMeta } = useCatalog();
  const [filter, setFilter] = useState("all");
  const [selected, setSelected] = useState<(Candidate & { id: string }) | null>(null);

  const requiredCount = docTypes.filter((d) => d.required).length;
  const completion = (c: Candidate) => docCompletion(c.docs, requiredCount);

  const inDocs = useMemo(
    () => candidates.filter((c) => DOC_STAGES.includes(c.stage)),
    [candidates]
  );

  const filtered = useMemo(() => {
    if (filter === "needs_review") return inDocs.filter((c) => c.docs.some((d) => d.status === "review"));
    if (filter === "complete")     return inDocs.filter((c) => completion(c) >= 100);
    if (filter === "incomplete")   return inDocs.filter((c) => completion(c) < 100);
    return inDocs;
  }, [inDocs, filter, requiredCount]);

  const stats = useMemo(() => ({
    total:       inDocs.length,
    needsReview: inDocs.filter((c) => c.docs.some((d) => d.status === "review")).length,
    complete:    inDocs.filter((c) => completion(c) >= 100).length,
    pending:     inDocs.reduce((s, c) => s + docTypes.filter((d) => d.required && !c.docs.find((x) => x.id === d.id && x.status === "ok")).length, 0),
  }), [inDocs, requiredCount]);

  if (loading) return <LoadingView />;
  if (error)   return <ErrorView message={error.message} />;

  return (
    <div className="flex flex-col h-full">
      <div className="px-5 py-4 border-b border-[var(--color-line)] bg-[var(--color-surface)] shrink-0">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="font-serif text-[22px] font-medium text-[var(--color-ink)]">Expedientes</h1>
            <p className="text-[12.5px] text-[var(--color-ink-3)]">Revisión de documentos · {inDocs.length} activos</p>
          </div>
          <Button variant="secondary" size="sm" icon={<Download size={13} />}>Exportar a Drive</Button>
        </div>

        <div className="grid grid-cols-4 gap-3 mb-4">
          {[
            { label: "Expedientes activos",    value: stats.total,       accent: "var(--color-green-700)" },
            { label: "Requieren revisión",     value: stats.needsReview, accent: "var(--color-danger-fg)" },
            { label: "Completos al 100%",      value: stats.complete,    accent: "var(--color-green-500)" },
            { label: "Documentos pendientes",  value: stats.pending,     accent: "var(--color-warn-fg)" },
          ].map((k) => (
            <div key={k.label} className="rounded-[var(--radius)] bg-[var(--color-surface-2)] border border-[var(--color-line)] px-4 py-3">
              <div className="text-[11px] text-[var(--color-ink-4)] mb-1">{k.label}</div>
              <div className="text-2xl font-bold font-mono" style={{ color: k.accent }}>{k.value}</div>
            </div>
          ))}
        </div>

        <div className="flex gap-1">
          {[
            { id: "all",          label: "Todos",              count: stats.total },
            { id: "needs_review", label: "Requieren revisión", count: stats.needsReview },
            { id: "complete",     label: "Completos",          count: stats.complete },
            { id: "incomplete",   label: "Incompletos",        count: inDocs.length - stats.complete },
          ].map((t) => (
            <button key={t.id} onClick={() => setFilter(t.id)}
              className={cn("flex items-center gap-1.5 h-8 px-3 rounded-[var(--radius-sm)] text-[12.5px] font-medium whitespace-nowrap transition-colors",
                filter === t.id ? "bg-green-500 text-white" : "text-[var(--color-ink-3)] hover:bg-[var(--color-surface-2)]"
              )}>
              {t.label}
              <span className={cn("text-[11px] font-mono rounded-full px-1.5 py-px",
                filter === t.id ? "bg-white/20 text-white" : "bg-[var(--color-line)] text-[var(--color-ink-3)]"
              )}>{t.count}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-auto">
        <table className="w-full min-w-[700px] border-collapse text-[13px]">
          <thead className="sticky top-0 z-10">
            <tr className="border-b border-[var(--color-line)] bg-[var(--color-surface-2)]">
              {["Candidato", "Puesto", "Etapa", "Completado", "Revisión pendiente", "Reclutador", ""].map((h) => (
                <th key={h} className="px-4 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wider text-[var(--color-ink-4)]">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((c) => {
              const stage   = stageMeta(c.stage);
              const pct     = completion(c);
              const reviews = c.docs.filter((d) => d.status === "review").length;
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
                  <td className="px-4 py-3">
                    {stage ? <Badge color={stage.color} bg={stage.bg}>{stage.label}</Badge> : "—"}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-20 h-1.5 rounded-full bg-[var(--color-line)] overflow-hidden">
                        <div className="h-full rounded-full bg-green-500" style={{ width: `${pct}%` }} />
                      </div>
                      <span className="text-[11.5px] font-mono text-[var(--color-ink-3)]">{pct}%</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    {reviews > 0 ? (
                      <Badge color="var(--color-warn-fg)" bg="var(--color-warn-bg)">{reviews} doc{reviews > 1 ? "s" : ""}</Badge>
                    ) : (
                      <span className="text-[var(--color-ink-4)] text-[12.5px]">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-[var(--color-ink-3)] text-[12.5px]">{c.recruiter}</td>
                  <td className="px-4 py-3 w-8"></td>
                </tr>
              );
            })}
            {filtered.length === 0 && (
              <tr><td colSpan={7} className="px-4 py-16 text-center text-[var(--color-ink-4)] text-[13px]">Sin expedientes en esta categoría.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {selected && <ExpedienteDetail candidate={selected} onClose={() => setSelected(null)} />}
    </div>
  );
}
