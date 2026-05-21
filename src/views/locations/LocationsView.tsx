import { useState, useMemo } from "react";
import { useLocations, type Location } from "@/hooks/useLocations";
import { LoadingView, ErrorView } from "@/components/ui/Spinner";
import { Button } from "@/components/ui/Button";
import { Drawer } from "@/components/ui/Drawer";
import { Search, Plus, ChevronRight } from "@/components/icons";
import { cn } from "@/lib/cn";
import { estados } from "@/data/mock";

const STATUS_LABELS: Record<string, { label: string; color: string; bg: string }> = {
  open:   { label: "Abierto",         color: "#026149", bg: "#e7f8ef" },
  vacant: { label: "Sin cobertura",   color: "#8a5a00", bg: "#fff3d6" },
  closed: { label: "Cerrado",         color: "#6b716b", bg: "#f1f1ee" },
};

function LocationDetail({ loc, onClose }: { loc: Location & { id: string }; onClose: () => void }) {
  const statusCfg = STATUS_LABELS[loc.status] ?? STATUS_LABELS.open;
  return (
    <Drawer open onClose={onClose} title={loc.ubicacion ?? loc.ciudad} subtitle={`${loc.catLabel} · ${loc.estado}`}>
      <div className="px-6 py-5 space-y-5">
        {/* Category badge */}
        <div className="flex items-center gap-3">
          <div className="size-10 rounded-[var(--radius-sm)] grid place-items-center text-[12px] font-bold"
            style={{ background: loc.catBg, color: loc.catColor, border: `1px solid ${loc.catColor}22` }}>
            {loc.catShort}
          </div>
          <div>
            <div className="text-[14px] font-semibold text-[var(--color-ink)]">{loc.catLabel}</div>
            <span className="text-[12px] font-medium px-2 py-0.5 rounded-full" style={{ color: statusCfg.color, background: statusCfg.bg }}>
              {statusCfg.label}
            </span>
          </div>
        </div>

        {/* Info grid */}
        <div className="grid grid-cols-2 gap-3 text-[13px]">
          {[
            ["Código", loc.code],
            ["Ciudad", loc.ciudad],
            ["Estado", loc.estado],
            ["Gerente", loc.gerente],
            ["Hub", loc.hub],
            ["Apertura", loc.fechaApertura],
            ["Dirección", loc.direccion],
            ["Producto", loc.producto ?? "—"],
          ].map(([label, value]) => (
            <div key={label} className={label === "Dirección" ? "col-span-2" : ""}>
              <div className="text-[11px] text-[var(--color-ink-4)] mb-0.5">{label}</div>
              <div className="font-medium text-[var(--color-ink-2)]">{value}</div>
            </div>
          ))}
        </div>

        {/* Kit inventory */}
        {loc.kit && (
          <div>
            <h3 className="text-[11px] font-semibold uppercase tracking-widest text-[var(--color-ink-4)] mb-2">Inventario de kit</h3>
            <div className="grid grid-cols-2 gap-2">
              {Object.entries(loc.kit).map(([k, v]) => {
                const labels: Record<string, string> = {
                  sim: "SIM", lanyard: "Lanyard", nametag: "Nametag",
                  pin: "Pin Aviva", audifonos: "Audífonos", tablet: "Tablet", uniforme: "Uniforme",
                };
                const color = v === "ok" ? "text-green-600" : v === "missing" ? "text-[var(--color-danger-fg)]" : "text-[var(--color-ink-4)]";
                return (
                  <div key={k} className="flex items-center gap-2 text-[13px]">
                    <span className={cn("font-medium", color)}>{v === "ok" ? "✓" : v === "missing" ? "✗" : "—"}</span>
                    <span className="text-[var(--color-ink-2)]">{labels[k] ?? k}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </Drawer>
  );
}

export function LocationsView() {
  const { data: locations, loading, error } = useLocations();
  const [query, setQuery]     = useState("");
  const [estadoF, setEstadoF] = useState("all");
  const [statusF, setStatusF] = useState("all");
  const [selected, setSelected] = useState<(Location & { id: string }) | null>(null);

  const filtered = useMemo(() => {
    const norm = (s: string) => s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
    return locations.filter((l) => {
      if (estadoF !== "all" && l.estado !== estadoF) return false;
      if (statusF !== "all" && l.status !== statusF) return false;
      if (query.trim()) {
        const q = norm(query);
        return (
          norm(l.ciudad).includes(q) ||
          norm(l.gerente).includes(q) ||
          norm(l.code).includes(q) ||
          norm(l.catLabel).includes(q)
        );
      }
      return true;
    });
  }, [locations, query, estadoF, statusF]);

  if (loading) return <LoadingView />;
  if (error)   return <ErrorView message={error.message} />;

  return (
    <div className="flex flex-col h-full">
      {/* Toolbar */}
      <div className="flex items-center gap-2 px-5 py-3 border-b border-[var(--color-line)] bg-[var(--color-surface)] shrink-0">
        <div className="flex items-center gap-2 h-8 px-3 rounded-[var(--radius-sm)] bg-[var(--color-surface-2)] border border-[var(--color-line)] min-w-[200px]">
          <Search size={13} className="text-[var(--color-ink-4)] shrink-0" />
          <input
            type="search"
            placeholder="Buscar locación…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-1 bg-transparent text-[13px] text-[var(--color-ink)] placeholder:text-[var(--color-ink-4)] outline-none"
          />
        </div>
        <select value={estadoF} onChange={(e) => setEstadoF(e.target.value)}
          className="h-8 px-2 text-[12.5px] rounded-[var(--radius-sm)] border border-[var(--color-line)] bg-[var(--color-surface)] text-[var(--color-ink-2)] outline-none">
          <option value="all">Todos los estados</option>
          {estados.map((e) => <option key={e} value={e}>{e}</option>)}
        </select>
        <select value={statusF} onChange={(e) => setStatusF(e.target.value)}
          className="h-8 px-2 text-[12.5px] rounded-[var(--radius-sm)] border border-[var(--color-line)] bg-[var(--color-surface)] text-[var(--color-ink-2)] outline-none">
          <option value="all">Todos los estados</option>
          <option value="open">Abierto</option>
          <option value="vacant">Sin cobertura</option>
          <option value="closed">Cerrado</option>
        </select>
        <div className="ml-auto flex items-center gap-2">
          <span className="text-[12px] text-[var(--color-ink-4)]">{filtered.length} locaciones</span>
          <Button variant="primary" size="sm" icon={<Plus size={14} />}>Nueva locación</Button>
        </div>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-auto">
        <table className="w-full min-w-[750px] border-collapse text-[13px]">
          <thead className="sticky top-0 z-10">
            <tr className="border-b border-[var(--color-line)] bg-[var(--color-surface-2)]">
              {["Locación", "Categoría", "Ciudad", "Estado", "Gerente", "Apertura", "Estatus", ""].map((h) => (
                <th key={h} className="px-4 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wider text-[var(--color-ink-4)]">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((l) => {
              const statusCfg = STATUS_LABELS[l.status] ?? STATUS_LABELS.open;
              return (
                <tr key={l.id} onClick={() => setSelected(l)}
                  className="border-b border-[var(--color-line)] hover:bg-[var(--color-mint-50)] cursor-pointer transition-colors group">
                  <td className="px-4 py-3 font-medium text-[var(--color-ink)]">
                    {l.ubicacion ?? l.ciudad}
                    <div className="text-[11px] text-[var(--color-ink-4)] font-mono">{l.code}</div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11.5px] font-medium"
                      style={{ background: l.catBg, color: l.catColor }}>
                      {l.catShort} {l.catLabel}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-[var(--color-ink-2)]">{l.ciudad}</td>
                  <td className="px-4 py-3 text-[var(--color-ink-3)]">{l.estado}</td>
                  <td className="px-4 py-3 text-[var(--color-ink-3)]">{l.gerente}</td>
                  <td className="px-4 py-3 font-mono text-[12px] text-[var(--color-ink-4)]">{l.fechaApertura}</td>
                  <td className="px-4 py-3">
                    <span className="text-[12px] font-medium px-2 py-0.5 rounded-full" style={{ color: statusCfg.color, background: statusCfg.bg }}>
                      {statusCfg.label}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <ChevronRight size={14} className="text-[var(--color-ink-4)] opacity-0 group-hover:opacity-100 transition-opacity" />
                  </td>
                </tr>
              );
            })}
            {filtered.length === 0 && (
              <tr><td colSpan={8} className="px-4 py-16 text-center text-[var(--color-ink-4)] text-[13px]">Sin locaciones para este filtro.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {selected && <LocationDetail loc={selected} onClose={() => setSelected(null)} />}
    </div>
  );
}
