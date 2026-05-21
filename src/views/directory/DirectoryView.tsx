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
import { ImportWizard } from "./ImportWizard";
import {
  Search, UserPlus, ChevronRight, Download, Upload,
  TableIcon, GridIcon, ArrowUpDown,
} from "@/components/icons";
import { cn } from "@/lib/cn";

const STATUS_TABS = ["all", "active", "invited", "offboarding", "suspended"] as const;
type StatusTab = (typeof STATUS_TABS)[number];
const STATUS_LABELS: Record<StatusTab, string> = {
  all: "Todos", active: "Activos", invited: "Invitados",
  offboarding: "En baja", suspended: "Suspendidos",
};

// ── KPI strip ─────────────────────────────────────────────────────────────────
function KPIs({ users }: { users: (User & { id: string })[] }) {
  const active      = users.filter((u) => u.status === "active").length;
  const invited     = users.filter((u) => u.status === "invited").length;
  const offboarding = users.filter((u) => u.status === "offboarding").length;

  return (
    <div className="grid grid-cols-4 gap-3 px-5 py-3 border-b border-[var(--color-line)] bg-[var(--color-surface)]">
      {[
        { label: "Activos",          value: active,         accent: "var(--color-green-700)" },
        { label: "Altas en curso",   value: invited,        accent: "var(--color-green-700)" },
        { label: "Bajas en proceso", value: offboarding,    accent: "var(--color-danger-fg)" },
        { label: "Total",            value: users.length,   accent: "var(--color-ink)" },
      ].map((k) => (
        <div key={k.label} className="px-4 py-2.5 rounded-[var(--radius-sm)] bg-[var(--color-surface-2)] border border-[var(--color-line)]">
          <div className="text-[11px] text-[var(--color-ink-4)] mb-0.5">{k.label}</div>
          <div className="text-[22px] font-bold font-mono leading-none" style={{ color: k.accent }}>{k.value}</div>
        </div>
      ))}
    </div>
  );
}

// ── User drawer ───────────────────────────────────────────────────────────────
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
                  ["Email",      user.email],
                  ["Teléfono",   user.phone],
                  ["Hub",        hubLabel(user.hub)],
                  ["Empresa",    user.empresa],
                  ["Manager",    manager?.fullName ?? user.managerName ?? "—"],
                  ["Ingreso",    user.hiredAt],
                  ["Antigüedad", `${user.hireMonths} meses`],
                  ["Talla",      user.talla],
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

// ── Grid card ─────────────────────────────────────────────────────────────────
function UserCard({ user, selected, onToggle, onClick, hubLabel }: {
  user: User & { id: string };
  selected: boolean;
  onToggle: (e: React.MouseEvent) => void;
  onClick: () => void;
  hubLabel: (id: string) => string;
}) {
  return (
    <div
      onClick={onClick}
      className={cn(
        "flex flex-col gap-3 p-4 rounded-[var(--radius)] border cursor-pointer transition-colors",
        selected ? "border-green-400 bg-[var(--color-mint-50)]" : "border-[var(--color-line)] bg-[var(--color-surface)] hover:bg-[var(--color-surface-2)]"
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <Avatar user={user} size="lg" />
        <div className="flex-1 min-w-0">
          <div className="font-semibold text-[13.5px] text-[var(--color-ink)] truncate">{user.fullName}</div>
          <div className="text-[12px] text-[var(--color-ink-3)] truncate mt-0.5">{user.role}</div>
        </div>
        <input
          type="checkbox"
          checked={selected}
          onClick={onToggle}
          onChange={() => null}
          className="mt-0.5 shrink-0 cursor-pointer"
        />
      </div>
      <div className="flex flex-wrap gap-1">
        <StatusBadge status={user.status} />
        <span className="text-[11px] px-1.5 py-0.5 rounded bg-[var(--color-surface-2)] border border-[var(--color-line)] text-[var(--color-ink-3)]">
          {hubLabel(user.hub)}
        </span>
        <span className="text-[11px] px-1.5 py-0.5 rounded bg-[var(--color-surface-2)] border border-[var(--color-line)] text-[var(--color-ink-3)]">
          {user.quiosco}
        </span>
      </div>
      <div className="text-[11.5px] text-[var(--color-ink-4)] font-mono">{user.email}</div>
    </div>
  );
}

// ── Bulk action bar ───────────────────────────────────────────────────────────
function BulkBar({ count, onClear }: { count: number; onClear: () => void }) {
  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-30 flex items-center gap-3 px-5 py-3 rounded-full bg-[var(--color-ink)] text-white shadow-[var(--shadow-lg)]">
      <span className="font-bold text-[13px]">{count} seleccionado{count > 1 ? "s" : ""}</span>
      <div className="w-px h-4 bg-white/20" />
      <button className="text-[12.5px] hover:text-green-300 transition-colors">Asignar equipo</button>
      <button className="text-[12.5px] hover:text-green-300 transition-colors">Sincronizar</button>
      <button className="text-[12.5px] text-[var(--color-danger-fg)] hover:opacity-80 transition-opacity">Iniciar baja</button>
      <div className="w-px h-4 bg-white/20" />
      <button onClick={onClear} className="text-[12px] text-white/60 hover:text-white transition-colors">Cancelar</button>
    </div>
  );
}

// ── Main view ─────────────────────────────────────────────────────────────────
export function DirectoryView() {
  const { hubs, hubLabel, estados } = useCatalog();
  const { data: users, loading, error } = useUsers();
  const [tab,      setTab]      = useState<StatusTab>("all");
  const [query,    setQuery]    = useState("");
  const [hubF,     setHubF]     = useState("all");
  const [estadoF,  setEstadoF]  = useState("all");
  const [sortBy,   setSortBy]   = useState("name");
  const [layout,   setLayout]   = useState<"table" | "grid">("table");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [drawer,   setDrawer]   = useState<(User & { id: string }) | null>(null);
  const [importing, setImporting] = useState(false);

  const norm = (s: string) => s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");

  const filtered = useMemo(() => {
    let arr = users.filter((u) => {
      if (tab !== "all" && u.status !== tab) return false;
      if (hubF !== "all" && u.hub !== hubF) return false;
      if (estadoF !== "all" && u.estado !== estadoF) return false;
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
    if (sortBy === "name")    arr = [...arr].sort((a, b) => a.fullName.localeCompare(b.fullName));
    if (sortBy === "hub")     arr = [...arr].sort((a, b) => (a.hub || "").localeCompare(b.hub || ""));
    if (sortBy === "quiosco") arr = [...arr].sort((a, b) => (a.quiosco || "").localeCompare(b.quiosco || ""));
    if (sortBy === "recent")  arr = [...arr].sort((a, b) => a.hireMonths - b.hireMonths);
    return arr;
  }, [users, tab, query, hubF, estadoF, sortBy]);

  const counts = useMemo(() => {
    const m: Record<string, number> = { all: users.length };
    for (const u of users) m[u.status] = (m[u.status] ?? 0) + 1;
    return m;
  }, [users]);

  function toggleRow(id: string, e: React.MouseEvent) {
    e.stopPropagation();
    setSelected((prev) => {
      const n = new Set(prev);
      if (n.has(id)) n.delete(id); else n.add(id);
      return n;
    });
  }

  function toggleAll() {
    if (selected.size === filtered.length) setSelected(new Set());
    else setSelected(new Set(filtered.map((u) => u.id)));
  }

  if (loading) return <LoadingView />;
  if (error)   return <ErrorView message={error.message} />;

  return (
    <div className="flex flex-col h-full">
      {/* KPIs */}
      <KPIs users={users} />

      {/* Toolbar */}
      <div className="flex flex-col border-b border-[var(--color-line)] bg-[var(--color-surface)] shrink-0">
        <div className="flex items-center gap-2 px-5 py-2">
          <div className="flex gap-0.5 overflow-x-auto">
            {STATUS_TABS.map((t) => (
              <button key={t} onClick={() => setTab(t)}
                className={cn("flex items-center gap-1.5 h-8 px-3 rounded-[var(--radius-sm)] text-[12.5px] font-medium whitespace-nowrap transition-colors",
                  tab === t ? "bg-green-500 text-white" : "text-[var(--color-ink-3)] hover:bg-[var(--color-surface-2)]"
                )}>
                {STATUS_LABELS[t]}
                <span className={cn("text-[11px] font-mono rounded-full px-1.5 py-px",
                  tab === t ? "bg-white/20 text-white" : "bg-[var(--color-line)] text-[var(--color-ink-3)]"
                )}>{counts[t] ?? 0}</span>
              </button>
            ))}
          </div>

          <div className="ml-auto flex items-center gap-2">
            {/* Layout toggle */}
            <div className="flex rounded-[var(--radius-sm)] border border-[var(--color-line)] overflow-hidden">
              <button onClick={() => setLayout("table")} title="Tabla"
                className={cn("p-1.5 transition-colors", layout === "table" ? "bg-[var(--color-mint-50)] text-green-700" : "text-[var(--color-ink-3)] hover:bg-[var(--color-surface-2)]")}>
                <TableIcon size={14} />
              </button>
              <button onClick={() => setLayout("grid")} title="Tarjetas"
                className={cn("p-1.5 transition-colors border-l border-[var(--color-line)]", layout === "grid" ? "bg-[var(--color-mint-50)] text-green-700" : "text-[var(--color-ink-3)] hover:bg-[var(--color-surface-2)]")}>
                <GridIcon size={14} />
              </button>
            </div>
            <Button variant="secondary" size="sm" icon={<Download size={13} />}>Exportar CSV</Button>
            <Button variant="secondary" size="sm" icon={<Upload size={13} />} onClick={() => setImporting(true)}>Importar</Button>
            <Button variant="primary"   size="sm" icon={<UserPlus size={14} />}>Nueva alta</Button>
          </div>
        </div>

        {/* Filters row */}
        <div className="flex items-center gap-2 px-5 py-2 border-t border-dashed border-[var(--color-line)]">
          <div className="flex items-center gap-2 h-8 px-3 rounded-[var(--radius-sm)] bg-[var(--color-surface-2)] border border-[var(--color-line)] min-w-[220px]">
            <Search size={13} className="text-[var(--color-ink-4)] shrink-0" />
            <input type="search" placeholder="Nombre, correo, quiósco…" value={query} onChange={(e) => setQuery(e.target.value)}
              className="flex-1 bg-transparent text-[13px] text-[var(--color-ink)] placeholder:text-[var(--color-ink-4)] outline-none" />
          </div>
          <select value={hubF} onChange={(e) => setHubF(e.target.value)}
            className="h-8 px-2 text-[12.5px] rounded-[var(--radius-sm)] border border-[var(--color-line)] bg-[var(--color-surface)] text-[var(--color-ink-2)] outline-none">
            <option value="all">Todos los hubs</option>
            {hubs.map((h) => <option key={h.id} value={h.id}>{h.label}</option>)}
          </select>
          <select value={estadoF} onChange={(e) => setEstadoF(e.target.value)}
            className="h-8 px-2 text-[12.5px] rounded-[var(--radius-sm)] border border-[var(--color-line)] bg-[var(--color-surface)] text-[var(--color-ink-2)] outline-none">
            <option value="all">Todos los estados</option>
            {estados.map((e) => <option key={e} value={e}>{e}</option>)}
          </select>
          <div className="flex items-center gap-1 ml-auto">
            <ArrowUpDown size={13} className="text-[var(--color-ink-4)]" />
            <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}
              className="h-8 px-2 text-[12.5px] rounded-[var(--radius-sm)] border border-[var(--color-line)] bg-[var(--color-surface)] text-[var(--color-ink-2)] outline-none">
              <option value="name">Nombre A–Z</option>
              <option value="hub">Hub</option>
              <option value="quiosco">Quiósco</option>
              <option value="recent">Más recientes</option>
            </select>
            <span className="text-[12px] text-[var(--color-ink-4)] ml-2">{filtered.length} resultados</span>
          </div>
        </div>
      </div>

      {/* Table view */}
      {layout === "table" && (
        <div className="flex-1 overflow-auto">
          <table className="w-full min-w-[800px] border-collapse text-[13px]">
            <thead className="sticky top-0 z-10">
              <tr className="border-b border-[var(--color-line)] bg-[var(--color-surface-2)]">
                <th className="px-4 py-2.5 w-9">
                  <input type="checkbox"
                    checked={selected.size > 0 && selected.size === filtered.length}
                    onChange={toggleAll}
                    className="cursor-pointer" />
                </th>
                {["Persona", "Puesto", "Hub", "Quiósco", "Estado", "Manager", "Estatus", "Antigüedad", ""].map((h) => (
                  <th key={h} className="px-4 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wider text-[var(--color-ink-4)] whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((u) => {
                const mgr = users.find((x) => x.id === u.manager);
                const sel = selected.has(u.id);
                return (
                  <tr key={u.id} onClick={() => setDrawer(u)}
                    className={cn("border-b border-[var(--color-line)] cursor-pointer transition-colors group",
                      sel ? "bg-[var(--color-mint-50)]" : "hover:bg-[var(--color-mint-50)]"
                    )}>
                    <td className="px-4 py-3" onClick={(e) => toggleRow(u.id, e)}>
                      <input type="checkbox" checked={sel} onChange={() => null} className="cursor-pointer" />
                    </td>
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
                <tr><td colSpan={10} className="px-4 py-16 text-center text-[var(--color-ink-4)] text-[13px]">Sin colaboradores para esta búsqueda.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Grid view */}
      {layout === "grid" && (
        <div className="flex-1 overflow-auto p-5">
          <div className="grid grid-cols-[repeat(auto-fill,minmax(260px,1fr))] gap-3">
            {filtered.map((u) => (
              <UserCard
                key={u.id}
                user={u}
                selected={selected.has(u.id)}
                onToggle={(e) => toggleRow(u.id, e)}
                onClick={() => setDrawer(u)}
                hubLabel={hubLabel}
              />
            ))}
            {filtered.length === 0 && (
              <div className="col-span-full py-16 text-center text-[var(--color-ink-4)] text-[13px]">Sin colaboradores para esta búsqueda.</div>
            )}
          </div>
        </div>
      )}

      {/* Bulk bar */}
      {selected.size > 0 && (
        <BulkBar count={selected.size} onClear={() => setSelected(new Set())} />
      )}

      {/* Import wizard */}
      {importing && (
        <ImportWizard
          onClose={() => setImporting(false)}
          onImported={() => setImporting(false)}
        />
      )}

      {/* User detail drawer */}
      {drawer && <UserDetail user={drawer} allUsers={users} onClose={() => setDrawer(null)} />}
    </div>
  );
}
