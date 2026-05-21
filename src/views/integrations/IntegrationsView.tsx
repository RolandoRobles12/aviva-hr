import { useIntegrations } from "@/hooks/useIntegrations";
import { LoadingView, ErrorView } from "@/components/ui/Spinner";
import { Button } from "@/components/ui/Button";
import { Plus, Refresh } from "@/components/icons";
import { cn } from "@/lib/cn";

export function IntegrationsView() {
  const { data: items, loading, error } = useIntegrations();

  if (loading) return <LoadingView />;
  if (error)   return <ErrorView message={error.message} />;

  const okCount   = items.filter((i) => i.status === "ok").length;
  const warnCount = items.filter((i) => i.status === "warn").length;
  const totalAccounts = items.reduce((s, i) => s + i.accounts, 0);

  return (
    <div className="p-5 space-y-5">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="font-serif text-[22px] font-medium text-[var(--color-ink)]">Integraciones</h1>
          <p className="text-[12.5px] text-[var(--color-ink-3)]">{items.length} apps conectadas · sincronización en tiempo real</p>
        </div>
        <Button variant="primary" icon={<Plus size={14} />}>Conectar app</Button>
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
              <div className="font-serif text-[28px] text-[var(--color-warn-fg)]">{warnCount}</div>
            </div>
          </>
        )}
      </div>

      {/* Integration cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {items.map((it) => (
          <div key={it.id} className="rounded-[var(--radius)] bg-[var(--color-surface)] border border-[var(--color-line)] shadow-[var(--shadow-sm)] p-4 space-y-3">
            {/* Top */}
            <div className="flex items-start gap-3">
              <div className="size-10 rounded-[var(--radius-sm)] grid place-items-center text-[13px] font-bold shrink-0"
                style={{ background: it.color + "16", color: it.color, border: `1px solid ${it.color}33` }}>
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

            {/* Stats */}
            <div className="flex gap-4 text-[12.5px]">
              <div><span className="text-[var(--color-ink-4)]">Cuentas </span><span className="font-medium text-[var(--color-ink-2)]">{it.accounts}</span></div>
              <div><span className="text-[var(--color-ink-4)]">Última sync </span><span className="font-medium text-[var(--color-ink-2)]">{it.lastSync}</span></div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 pt-1 border-t border-[var(--color-line)]">
              <Button size="sm" variant="secondary">Configurar</Button>
              <Button size="sm" variant="ghost" icon={<Refresh size={12} />}>Sync</Button>
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
    </div>
  );
}
