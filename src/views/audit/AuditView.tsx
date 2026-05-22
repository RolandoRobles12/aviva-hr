import { useState, useMemo } from "react";
import { useAuditLog } from "@/hooks/useAuditLog";
import { LoadingView, ErrorView } from "@/components/ui/Spinner";
import { Button } from "@/components/ui/Button";
import { Search, Download } from "@/components/icons";

function exportToCSV(rows: ReturnType<typeof useAuditLog>["data"]) {
  const headers = ["Fecha", "Actor", "Acción", "Objetivo", "ID Objetivo", "Fuente"];
  const data = rows.map((e) => [
    e.when,
    e.actor ?? "Sistema",
    e.action,
    e.target,
    e.targetId ?? "",
    e.source,
  ]);
  const csv = [headers, ...data]
    .map((r) => r.map((c) => `"${String(c ?? "").replace(/"/g, '""')}"`).join(","))
    .join("\n");
  const a = document.createElement("a");
  a.href = URL.createObjectURL(new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8;" }));
  a.download = `audit-aviva-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
}

export function AuditView() {
  const { data: events, loading, error } = useAuditLog();
  const [query, setQuery]   = useState("");
  const [source, setSource] = useState("all");

  const filtered = useMemo(() => {
    return events.filter((e) => {
      if (source !== "all" && e.source !== source) return false;
      if (query.trim()) {
        const q = query.toLowerCase();
        return (
          (e.actor ?? "").toLowerCase().includes(q) ||
          e.action.toLowerCase().includes(q) ||
          e.target.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [events, query, source]);

  if (loading) return <LoadingView />;
  if (error)   return <ErrorView message={error.message} />;

  return (
    <div className="p-5 space-y-5">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="font-serif text-[22px] font-medium text-[var(--color-ink)]">Auditoría</h1>
          <p className="text-[12.5px] text-[var(--color-ink-3)]">Registro inmutable de cambios en personas, accesos y configuraciones.</p>
        </div>
        <Button variant="secondary" size="sm" icon={<Download size={13} />} onClick={() => exportToCSV(filtered)}>Exportar log</Button>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-2 h-8 px-3 rounded-[var(--radius-sm)] bg-[var(--color-surface)] border border-[var(--color-line)] min-w-[240px]">
          <Search size={13} className="text-[var(--color-ink-4)] shrink-0" />
          <input
            type="search"
            placeholder="Buscar actor, acción, objetivo…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-1 bg-transparent text-[13px] text-[var(--color-ink)] placeholder:text-[var(--color-ink-4)] outline-none"
          />
        </div>
        <select value={source} onChange={(e) => setSource(e.target.value)}
          className="h-8 px-2 text-[12.5px] rounded-[var(--radius-sm)] border border-[var(--color-line)] bg-[var(--color-surface)] text-[var(--color-ink-2)] outline-none">
          <option value="all">Todas las fuentes</option>
          <option value="manual">Manual</option>
          <option value="auto">Automático</option>
        </select>
        <span className="ml-auto text-[12px] text-[var(--color-ink-4)]">{filtered.length} eventos</span>
      </div>

      {/* Log */}
      <div className="rounded-[var(--radius)] bg-[var(--color-surface)] border border-[var(--color-line)] shadow-[var(--shadow-sm)] overflow-hidden">
        {filtered.length === 0 && (
          <div className="py-16 text-center text-[13px] text-[var(--color-ink-4)]">Sin eventos registrados.</div>
        )}
        {filtered.map((e) => (
          <div key={e.id} className="flex items-start gap-3 px-5 py-3 border-b border-[var(--color-line)] last:border-0 hover:bg-[var(--color-surface-2)] transition-colors">
            <div className="size-7 rounded-full bg-[var(--color-mint-50)] border border-[var(--color-line)] grid place-items-center text-[11px] font-bold text-green-700 shrink-0 mt-0.5">
              {(e.actor ?? "S").charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-[13px] text-[var(--color-ink)]">
                <strong className="text-[var(--color-ink)]">{e.actor ?? "Sistema"}</strong>{" "}
                <span className="text-[var(--color-ink-2)]">{e.action}</span>{" "}
                <strong className="text-[var(--color-ink)]">{e.target}</strong>
              </div>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              <span className="text-[11.5px] text-[var(--color-ink-4)] bg-[var(--color-surface-2)] px-2 py-0.5 rounded">
                {e.source === "manual" ? "✋ Manual" : e.source === "auto" ? "⚙ Auto" : e.source}
              </span>
              <span className="text-[11.5px] font-mono text-[var(--color-ink-4)]">{e.when}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
