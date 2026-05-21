import { candidates, tickets, users, integrations, STAGES } from "@/data/mock";
import { stageMeta } from "@/data/mock";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";

interface KpiCardProps {
  label: string;
  value: number | string;
  sub?: string;
  accent?: string;
}

function KpiCard({ label, value, sub, accent }: KpiCardProps) {
  return (
    <div className="rounded-[var(--radius)] bg-[var(--color-surface)] border border-[var(--color-line)] p-5 shadow-[var(--shadow-sm)]">
      <div className="text-[11px] font-semibold uppercase tracking-widest text-[var(--color-ink-4)] mb-2">
        {label}
      </div>
      <div
        className="text-3xl font-bold font-mono"
        style={{ color: accent ?? "var(--color-ink)" }}
      >
        {value}
      </div>
      {sub && (
        <div className="text-[12px] text-[var(--color-ink-3)] mt-1">{sub}</div>
      )}
    </div>
  );
}

export function HomeView() {
  const activeUsers = users.filter((u) => u.status === "active").length;
  const activeCandidates = candidates.filter(
    (c) => !["disqualified", "rejected"].includes(c.stage)
  ).length;
  const pendingTickets = tickets.filter((t) => t.status === "in_progress").length;
  const okIntegrations = integrations.filter((i) => i.status === "ok").length;

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="font-serif text-[26px] font-medium text-[var(--color-ink)] leading-tight tracking-[-0.02em]">
          Resumen
        </h1>
        <p className="text-[13px] text-[var(--color-ink-3)] mt-1">
          Vista general de People Ops · Aviva Crédito
        </p>
      </div>

      {/* KPI grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <KpiCard
          label="Colaboradores activos"
          value={activeUsers}
          sub="en directorio"
          accent="var(--color-green-700)"
        />
        <KpiCard
          label="Candidatos activos"
          value={activeCandidates}
          sub="en pipeline"
          accent="var(--color-green-500)"
        />
        <KpiCard
          label="Bajas en proceso"
          value={pendingTickets}
          sub="tickets abiertos"
          accent="var(--color-warn-fg)"
        />
        <KpiCard
          label="Integraciones OK"
          value={`${okIntegrations}/${integrations.length}`}
          sub="sistemas conectados"
          accent="var(--color-info-fg)"
        />
      </div>

      {/* Recent candidates */}
      <div className="rounded-[var(--radius)] bg-[var(--color-surface)] border border-[var(--color-line)] shadow-[var(--shadow-sm)]">
        <div className="px-5 py-4 border-b border-[var(--color-line)]">
          <h2 className="text-[13.5px] font-semibold text-[var(--color-ink)]">
            Candidatos recientes
          </h2>
        </div>
        <div>
          {candidates.slice(0, 5).map((c) => {
            const stage = stageMeta(c.stage);
            return (
              <div
                key={c.id}
                className="flex items-center gap-3 px-5 py-3 border-b border-[var(--color-line)] last:border-0 hover:bg-[var(--color-surface-2)] transition-colors"
              >
                <Avatar user={c} size="sm" />
                <div className="flex-1 min-w-0">
                  <div className="text-[13px] font-medium text-[var(--color-ink)] truncate">
                    {c.fullName}
                  </div>
                  <div className="text-[12px] text-[var(--color-ink-3)] truncate">
                    {c.position} · {c.quiosco}
                  </div>
                </div>
                {stage && (
                  <Badge color={stage.color} bg={stage.bg}>
                    {stage.label}
                  </Badge>
                )}
                <div className="text-[12px] font-mono text-[var(--color-ink-4)] whitespace-nowrap">
                  {c.createdAt}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Integration health */}
      <div className="rounded-[var(--radius)] bg-[var(--color-surface)] border border-[var(--color-line)] shadow-[var(--shadow-sm)]">
        <div className="px-5 py-4 border-b border-[var(--color-line)]">
          <h2 className="text-[13.5px] font-semibold text-[var(--color-ink)]">
            Estado de integraciones
          </h2>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-0 divide-x divide-y divide-[var(--color-line)]">
          {integrations.map((integration) => (
            <div key={integration.id} className="flex items-center gap-2.5 px-4 py-3">
              <div
                className="size-7 rounded-md grid place-items-center text-[11px] font-bold shrink-0"
                style={{
                  background: integration.color + "18",
                  color: integration.color,
                  border: `1px solid ${integration.color}33`,
                }}
              >
                {integration.short}
              </div>
              <div className="min-w-0">
                <div className="text-[12.5px] font-medium text-[var(--color-ink-2)] truncate">
                  {integration.name}
                </div>
                <div className="flex items-center gap-1 mt-0.5">
                  <div
                    className={`size-1.5 rounded-full ${
                      integration.status === "ok"
                        ? "bg-green-500"
                        : "bg-amber-500"
                    }`}
                  />
                  <span className="text-[11px] text-[var(--color-ink-4)]">
                    {integration.lastSync}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
