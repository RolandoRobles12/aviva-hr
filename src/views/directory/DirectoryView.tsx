import { useState, useMemo } from "react";
import { users, hubLabel } from "@/data/mock";
import type { User } from "@/data/types";
import { Avatar } from "@/components/ui/Avatar";
import { StatusBadge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Drawer } from "@/components/ui/Drawer";
import { Search, UserPlus, ChevronRight, Mail, Phone } from "@/components/icons";
import { cn } from "@/lib/cn";

function UserDetail({
  user,
  onClose,
}: {
  user: User;
  onClose: () => void;
}) {
  return (
    <Drawer
      open={!!user}
      onClose={onClose}
      title={user.fullName}
      subtitle={`${user.role} · ${user.quiosco}, ${user.estado}`}
    >
      <div className="px-6 py-5 space-y-6">
        {/* Avatar + status */}
        <div className="flex items-center gap-4">
          <Avatar user={user} size="lg" />
          <div>
            <StatusBadge status={user.status} />
            <div className="text-[12px] text-[var(--color-ink-4)] mt-1 font-mono">
              #{user.numColaborador}
            </div>
          </div>
        </div>

        {/* Info grid */}
        <div className="grid grid-cols-2 gap-x-4 gap-y-3 text-[13px]">
          {[
            ["Email", user.email],
            ["Teléfono", user.phone],
            ["Hub", hubLabel(user.hub)],
            ["Empresa", user.empresa],
            ["Manager", user.managerName ?? "—"],
            ["Ingreso", user.hiredAt],
            ["Antigüedad", `${user.hireMonths} meses`],
            ["Talla uniforme", user.talla],
          ].map(([label, value]) => (
            <div key={label}>
              <div className="text-[11px] text-[var(--color-ink-4)] mb-0.5">{label}</div>
              <div className="text-[var(--color-ink-2)] font-medium truncate">{value}</div>
            </div>
          ))}
        </div>

        {/* Accesos */}
        <div>
          <h3 className="text-[11px] font-semibold uppercase tracking-widest text-[var(--color-ink-4)] mb-2">
            Accesos ({user.access.length})
          </h3>
          <div className="flex flex-wrap gap-1.5">
            {user.access.map((id) => (
              <span
                key={id}
                className="px-2 py-0.5 rounded-full text-[11.5px] bg-[var(--color-surface-2)] border border-[var(--color-line)] text-[var(--color-ink-3)]"
              >
                {id}
              </span>
            ))}
          </div>
        </div>

        {/* Equipo */}
        {(user.laptop || user.tablets.length > 0) && (
          <div>
            <h3 className="text-[11px] font-semibold uppercase tracking-widest text-[var(--color-ink-4)] mb-2">
              Equipo asignado
            </h3>
            <div className="space-y-1 text-[13px] text-[var(--color-ink-2)]">
              {user.laptop && <div>💻 {user.laptop}</div>}
              {user.tablets.map((t) => (
                <div key={t}>📱 {t}</div>
              ))}
            </div>
          </div>
        )}
      </div>
    </Drawer>
  );
}

export function DirectoryView() {
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<User | null>(null);

  const filtered = useMemo(() => {
    if (!query.trim()) return users;
    const q = query.toLowerCase();
    return users.filter(
      (u) =>
        u.fullName.toLowerCase().includes(q) ||
        u.role.toLowerCase().includes(q) ||
        u.quiosco.toLowerCase().includes(q) ||
        u.estado.toLowerCase().includes(q)
    );
  }, [query]);

  return (
    <div className="flex flex-col h-full">
      {/* Toolbar */}
      <div className="flex items-center gap-3 px-5 py-3 border-b border-[var(--color-line)] bg-[var(--color-surface)] shrink-0">
        <div className="flex items-center gap-2 h-8 px-3 rounded-[var(--radius-sm)] bg-[var(--color-surface-2)] border border-[var(--color-line)] min-w-[220px]">
          <Search size={13} className="text-[var(--color-ink-4)] shrink-0" />
          <input
            type="search"
            placeholder="Buscar colaborador…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-1 bg-transparent text-[13px] text-[var(--color-ink)] placeholder:text-[var(--color-ink-4)] outline-none"
          />
        </div>
        <div className="ml-auto flex items-center gap-2">
          <span className="text-[12.5px] text-[var(--color-ink-4)] font-mono">
            {filtered.length} colaboradores
          </span>
          <Button variant="primary" size="sm" icon={<UserPlus size={14} />}>
            Nuevo colaborador
          </Button>
        </div>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-auto">
        <table className="w-full min-w-[780px] border-collapse text-[13px]">
          <thead className="sticky top-0 z-10">
            <tr className="border-b border-[var(--color-line)] bg-[var(--color-surface-2)]">
              {["Nombre", "Puesto", "Hub", "Locación", "Manager", "Antigüedad", "Estado", ""].map(
                (h) => (
                  <th
                    key={h}
                    className="px-4 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wider text-[var(--color-ink-4)] whitespace-nowrap"
                  >
                    {h}
                  </th>
                )
              )}
            </tr>
          </thead>
          <tbody>
            {filtered.map((u) => (
              <tr
                key={u.id}
                onClick={() => setSelected(u)}
                className="border-b border-[var(--color-line)] hover:bg-[var(--color-mint-50)] cursor-pointer transition-colors group"
              >
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2.5">
                    <Avatar user={u} size="sm" />
                    <div>
                      <div className="font-medium text-[var(--color-ink)]">{u.fullName}</div>
                      <div className="text-[11.5px] text-[var(--color-ink-4)] font-mono">
                        #{u.numColaborador}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 text-[var(--color-ink-2)] max-w-[160px]">
                  <span className="truncate block">{u.role}</span>
                </td>
                <td className="px-4 py-3 text-[var(--color-ink-3)] max-w-[140px]">
                  <span className="truncate block text-[12.5px]">{hubLabel(u.hub)}</span>
                </td>
                <td className="px-4 py-3 text-[var(--color-ink-3)] whitespace-nowrap">
                  {u.quiosco}, {u.estado}
                </td>
                <td className="px-4 py-3 text-[var(--color-ink-3)]">
                  {u.managerName ?? "—"}
                </td>
                <td className="px-4 py-3 font-mono text-[12px] text-[var(--color-ink-4)] whitespace-nowrap">
                  {u.hireMonths}m
                </td>
                <td className="px-4 py-3">
                  <StatusBadge status={u.status} />
                </td>
                <td className="px-4 py-3">
                  <ChevronRight
                    size={14}
                    className="text-[var(--color-ink-4)] opacity-0 group-hover:opacity-100 transition-opacity"
                  />
                </td>
              </tr>
            ))}

            {filtered.length === 0 && (
              <tr>
                <td
                  colSpan={8}
                  className="px-4 py-16 text-center text-[var(--color-ink-4)] text-[13px]"
                >
                  Sin colaboradores para esta búsqueda.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {selected && (
        <UserDetail user={selected} onClose={() => setSelected(null)} />
      )}
    </div>
  );
}
