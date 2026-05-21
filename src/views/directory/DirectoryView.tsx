import { useState, useMemo } from "react";
import { useUsers } from "@/hooks/useUsers";
import { useIntegrations } from "@/hooks/useIntegrations";
import { updateUser } from "@/services/users";
import { useCatalog } from "@/context/CatalogContext";
import type { User } from "@/data/types";
import { Avatar } from "@/components/ui/Avatar";
import { StatusBadge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Drawer } from "@/components/ui/Drawer";
import { LoadingView, ErrorView } from "@/components/ui/Spinner";
import { Search, UserPlus, ChevronRight, Download } from "@/components/icons";
import { cn } from "@/lib/cn";

const STATUS_TABS = ["all", "active", "invited", "offboarding", "suspended"] as const;
const STATUS_LABELS: Record<string, string> = {
  all: "Todos", active: "Activos", invited: "Invitados",
  offboarding: "En baja", suspended: "Suspendidos",
};

function UserDetail({ user, allUsers, onClose }: { user: User & { id: string }; allUsers: (User & { id: string })[]; onClose: () => void }) {
  const { hubLabel } = useCatalog();
  const { data: integrations } = useIntegrations();
  const [tab, setTab] = useState<"info" | "access" | "devices">("info");
  const manager = allUsers.find((u) => u.id === user.manager);

  async function handleStatusChange(status: User["status"]) {
    await updateUser(user.id, { status }, `cambió estado a ${status}`);
  }

  return (
    <Drawer open onClose={onClose} title={user.fullName} subtitle={`${user.role} · ${user.quiosco}, ${user.estado}`}>
      <div>
        <div className="flex border-b border-[var(--color-line)] px-6">
          {(["info", "access", "devices"] as const).map((t) => (
            <button key={t} onClick={() => setTab(t)}
              className={cn("px-3 py-3 text-[13px] font-medium border-b-2 -mb-px transition-colors",
                tab === t ? "border-green-500 text-[var(--color-ink)]" : "border-transparent text-[var(--color-ink-3)] hover:text-[var(--color-ink)]"
              )}>
              {t === "info" ? "Información" : t === "access" ? "Accesos" : "Equipo"}
            </button>
          ))}
        </div>

        <div className="px-6 py-5 space-y-5">
          {tab === "info" && (
            <>
              <div className="flex items-center gap-4">
                <Avatar user={user} size="lg" />
                <div>
                  <StatusBadge status={user.status} />
                  <div className="text-[12px] text-[var(--color-ink-4)] mt-1 font-mono">#{user.numColaborador}</div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-x-4 gap-y-3 text-[13px]">
                {[
                  ["Email", user.email],
                  ["Teléfono", user.phone],
                  ["Hub", hubLabel(user.hub)],
                  ["Empresa", user.empresa],
                  ["Manager", manager?.fullName ?? user.managerName ?? "—"],
                  ["Ingreso", user.hiredAt],
                  ["Antigüedad", `${user.hireMonths} meses`],
                  ["Talla", user.talla],
                ].map(([label, value]) => (
                  <div key={label}>
                    <div className="text-[11px] text-[var(--color-ink-4)] mb-0.5">{label}</div>
                    <div className="text-[var(--color-ink-2)] font-medium truncate">{value}</div>
                  </div>
                ))}
              </div>

              <div>
                <label className="text-[11px] text-[var(--color-ink-4)] mb-1 block">Estado en Aviva</label>
                <select
                  value={user.status}
                  onChange={(e) => handleStatusChange(e.target.value as User["status"])}
                  className="w-full h-8 px-2 text-[13px] rounded-[var(--radius-sm)] border border-[var(--color-line)] bg-[var(--color-surface)] text-[var(--color-ink)] outline-none"
                >
                  <option value="active">Activo</option>
                  <option value="invited">Invitado</option>
                  <option value="suspended">Suspendido</option>
                  <option value="offboarding">En baja</option>
                  <option value="archived">Archivado</option>
                </select>
              </div>
            </>
          )}

          {tab === "access" && (
            <div className="space-y-2">
              <p className="text-[12px] text-[var(--color-ink-3)] mb-3">{user.access.length} apps conectadas</p>
              {integrations.map((it) => {
                const has = user.access.includes(it.id);
                return (
                  <div key={it.id} className={cn("flex items-center gap-3 px-3 py-2.5 rounded-[var(--radius-sm)] border",
                    has ? "border-[var(--color-line)] bg-[var(--color-mint-50)]" : "border-[var(--color-line)] opacity-50")}>
                    <div className="size-7 rounded-md grid place-items-center text-[11px] font-bold shrink-0"
                      style={{ background: it.color + "18", color: it.color, border: `1px solid ${it.color}33` }}>
                      {it.short}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-[13px] font-medium text-[var(--color-ink-2)]">{it.name}</div>
                      <div className="text-[11.5px] text-[var(--color-ink-4)]">{it.desc}</div>
                    </div>
                    <span className={cn("text-[11.5px] font-medium", has ? "text-green-600" : "text-[var(--color-ink-4)]")}>
                      {has ? "Activo" : "Sin acceso"}
                    </span>
                  </div>
                );
              })}
            </div>
          )}

          {tab === "devices" && (
            <div className="space-y-2">
              {user.laptop && (
                <div className="flex items-center gap-3 px-3 py-2.5 rounded-[var(--radius-sm)] border border-[var(--color-line)]">
                  <span className="text-[16px]">💻</span>
                  <div>
                    <div className="text-[13px] font-medium text-[var(--color-ink-2)]">{user.laptop}</div>
                    <div className="text-[12px] text-[var(--color-ink-4)]">Laptop corporativa</div>
                  </div>
                </div>
              )}
              {user.tablets.map((t) => (
                <div key={t} className="flex items-center gap-3 px-3 py-2.5 rounded-[var(--radius-sm)] border border-[var(--color-line)]">
                  <span className="text-[16px]">📱</span>
                  <div>
                    <div className="text-[13px] font-medium text-[var(--color-ink-2)]">{t}</div>
                    <div className="text-[12px] text-[var(--color-ink-4)]">Tablet de campo</div>
                  </div>
                </div>
              ))}
              {!user.laptop && user.tablets.length === 0 && (
                <p className="text-[13px] text-[var(--color-ink-4)]">Sin equipos asignados.</p>
              )}
            </div>
          )}
        </div>
      </div>
    </Drawer>
  );
}

export function DirectoryView() {
  const { hubs, hubLabel } = useCatalog();
  const { data: users, loading, error } = useUsers();
  const [tab, setTab]       = useState<"all" | "active" | "invited" | "offboarding" | "suspended">("all");
  const [query, setQuery]   = useState("");
  const [hubF, setHubF]     = useState("all");
  const [selected, setSelected] = useState<(User & { id: string }) | null>(null);

  const filtered = useMemo(() => {
    const norm = (s: string) =>
      s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
    return users.filter((u) => {
      if (tab !== "all" && u.status !== tab) return false;
      if (hubF !== "all" && u.hub !== hubF) return false;
      if (query.trim()) {
        const q = norm(query);
        return (
          norm(u.fullName).includes(q) ||
          norm(u.email).includes(q) ||
          norm(u.role).includes(q) ||
          norm(u.quiosco).includes(q) ||
          u.numColaborador.includes(q)
        );
      }
      return true;
    });
  }, [users, tab, query, hubF]);

  const counts = useMemo(() => {
    const m: Record<string, number> = { all: users.length };
    for (const u of users) m[u.status] = (m[u.status] ?? 0) + 1;
    return m;
  }, [users]);

  if (loading) return <LoadingView />;
  if (error)   return <ErrorView message={error.message} />;

  return (
    <div className="flex flex-col h-full">
      <div className="flex flex-col gap-0 border-b border-[var(--color-line)] bg-[var(--color-surface)] shrink-0">
        <div className="flex items-center gap-2 px-5 py-2">
          <div className="flex gap-0.5 overflow-x-auto">
            {STATUS_TABS.map((t) => (
              <button key={t} onClick={() => setTab(t)}
                className={cn("flex items-center gap-1.5 h-8 px-3 rounded-[var(--radius-sm)] text-[12.5px] font-medium whitespace-nowrap transition-colors",
                  tab === t ? "bg-green-500 text-white" : "text-[var(--color-ink-3)] hover:bg-[var(--color-surface-2)] hover:text-[var(--color-ink)]"
                )}>
                {STATUS_LABELS[t]}
                <span className={cn("text-[11px] font-mono rounded-full px-1.5 py-px",
                  tab === t ? "bg-white/20 text-white" : "bg-[var(--color-line)] text-[var(--color-ink-3)]"
                )}>{counts[t] ?? 0}</span>
              </button>
            ))}
          </div>
          <div className="ml-auto flex items-center gap-2">
            <Button variant="secondary" size="sm" icon={<Download size={13} />}>Exportar CSV</Button>
            <Button variant="primary" size="sm" icon={<UserPlus size={14} />}>Nueva alta</Button>
          </div>
        </div>

        <div className="flex items-center gap-2 px-5 py-2 border-t border-dashed border-[var(--color-line)]">
          <div className="flex items-center gap-2 h-8 px-3 rounded-[var(--radius-sm)] bg-[var(--color-surface-2)] border border-[var(--color-line)] min-w-[220px]">
            <Search size={13} className="text-[var(--color-ink-4)] shrink-0" />
            <input
              type="search"
              placeholder="Nombre, correo, quiósco…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="flex-1 bg-transparent text-[13px] text-[var(--color-ink)] placeholder:text-[var(--color-ink-4)] outline-none"
            />
          </div>
          <select
            value={hubF}
            onChange={(e) => setHubF(e.target.value)}
            className="h-8 px-2 text-[12.5px] rounded-[var(--radius-sm)] border border-[var(--color-line)] bg-[var(--color-surface)] text-[var(--color-ink-2)] outline-none"
          >
            <option value="all">Todos los hubs</option>
            {hubs.map((h) => <option key={h.id} value={h.id}>{h.label}</option>)}
          </select>
          <span className="ml-auto text-[12px] text-[var(--color-ink-4)]">{filtered.length} resultados</span>
        </div>
      </div>

      <div className="flex-1 overflow-auto">
        <table className="w-full min-w-[800px] border-collapse text-[13px]">
          <thead className="sticky top-0 z-10">
            <tr className="border-b border-[var(--color-line)] bg-[var(--color-surface-2)]">
              {["Persona", "Puesto", "Hub", "Quiósco", "Estado", "Manager", "Estatus", "Antigüedad", ""].map((h) => (
                <th key={h} className="px-4 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wider text-[var(--color-ink-4)] whitespace-nowrap">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((u) => {
              const mgr = users.find((x) => x.id === u.manager);
              return (
                <tr key={u.id} onClick={() => setSelected(u)} className="border-b border-[var(--color-line)] hover:bg-[var(--color-mint-50)] cursor-pointer transition-colors group">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2.5">
                      <Avatar user={u} size="sm" />
                      <div>
                        <div className="font-medium text-[var(--color-ink)]">{u.fullName}</div>
                        <div className="text-[11px] text-[var(--color-ink-4)] font-mono">{u.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-[var(--color-ink-2)] max-w-[160px]">
                    <span className="truncate block text-[12.5px]">{u.role}</span>
                  </td>
                  <td className="px-4 py-3 max-w-[140px]">
                    <span className="truncate block text-[12px] text-[var(--color-ink-3)]">{hubLabel(u.hub)}</span>
                  </td>
                  <td className="px-4 py-3 text-[var(--color-ink-3)] whitespace-nowrap text-[12.5px]">{u.quiosco}</td>
                  <td className="px-4 py-3 text-[12px] text-[var(--color-ink-3)]">{u.estado}</td>
                  <td className="px-4 py-3 text-[12.5px] text-[var(--color-ink-3)]">
                    {mgr ? <span className="flex items-center gap-1.5"><Avatar user={mgr} size="sm" />{mgr.first}</span> : "—"}
                  </td>
                  <td className="px-4 py-3"><StatusBadge status={u.status} /></td>
                  <td className="px-4 py-3 font-mono text-[12px] text-[var(--color-ink-4)]">{u.hireMonths}m</td>
                  <td className="px-4 py-3">
                    <ChevronRight size={14} className="text-[var(--color-ink-4)] opacity-0 group-hover:opacity-100 transition-opacity" />
                  </td>
                </tr>
              );
            })}
            {filtered.length === 0 && (
              <tr><td colSpan={9} className="px-4 py-16 text-center text-[var(--color-ink-4)] text-[13px]">Sin colaboradores para esta búsqueda.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {selected && <UserDetail user={selected} allUsers={users} onClose={() => setSelected(null)} />}
    </div>
  );
}
