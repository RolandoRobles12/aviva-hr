import { useState, useMemo } from "react";
import { useLocations, type Location } from "@/hooks/useLocations";
import { createDoc, updateDocById, deleteDocById } from "@/hooks/useFirestore";
import { useUsers } from "@/hooks/useUsers";
import { LoadingView, ErrorView } from "@/components/ui/Spinner";
import { Button } from "@/components/ui/Button";
import { Drawer } from "@/components/ui/Drawer";
import { Search, Plus, ChevronRight, Close, Upload } from "@/components/icons";
import { cn } from "@/lib/cn";
import { monthsSince } from "@/lib/dates";
import { useCatalog } from "@/context/CatalogContext";
import { useNotif } from "@/context/NotifContext";
import { LocationImportWizard } from "./LocationImportWizard";

const STATUS_LABELS: Record<string, { label: string; color: string; bg: string }> = {
  open:   { label: "Activo",   color: "#026149", bg: "#e7f8ef" },
  closed: { label: "Inactivo", color: "#6b716b", bg: "#f1f1ee" },
};

const CAT_MAP: Record<string, { label: string; short: string; color: string; bg: string }> = {
  "Aviva tu Compra":      { label: "Aviva tu Compra",      short: "AtC", color: "#1b3f8a", bg: "#e3eeff" },
  "Aviva tu Negocio":     { label: "Aviva tu Negocio",     short: "AtN", color: "#026149", bg: "#e7f8ef" },
  "Casa Marchand":        { label: "Casa Marchand",        short: "CM",  color: "#5c2e8e", bg: "#ece2f5" },
  "Aviva tu Compra · BA": { label: "Aviva tu Compra · BA", short: "BA",  color: "#8a5a00", bg: "#fff3d6" },
  "Corporativo":          { label: "Corporativo",          short: "Corp",color: "#3a3a3a", bg: "#f1f1ee" },
};
const DEFAULT_CAT = { label: "Quiósco", short: "Q", color: "#1b3f8a", bg: "#e3eeff" };

function getCatFields(producto: string) {
  return CAT_MAP[producto] ?? DEFAULT_CAT;
}

// ── Location Modal ─────────────────────────────────────────────────────────────
function LocationModal({
  loc,
  onClose,
}: {
  loc: (Location & { id: string }) | "new";
  onClose: () => void;
}) {
  const { estados, regions } = useCatalog();
  const { notify } = useNotif();
  const { data: allUsers } = useUsers();
  const isNew = loc === "new";
  const existing = isNew ? null : loc;

  const [code,          setCode]          = useState(existing?.code ?? "");
  const [ciudad,        setCiudad]        = useState(existing?.ciudad ?? "");
  const [estado,        setEstado]        = useState(existing?.estado ?? "");
  const [direccion,     setDireccion]     = useState(existing?.direccion ?? "");
  const [gerente,       setGerente]       = useState(existing?.gerente ?? "");
  const [region,        setRegion]        = useState(existing?.region ?? "");
  const [fechaApertura, setFechaApertura] = useState(existing?.fechaApertura ?? "");
  const [status,        setStatus]        = useState<"open" | "vacant" | "closed">(existing?.status ?? "open");
  const [producto,      setProducto]      = useState(existing?.producto ?? "");
  const [ubicacion,     setUbicacion]     = useState(existing?.ubicacion ?? "");
  const [saving,        setSaving]        = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const catFields = getCatFields(producto);
      const allFields = {
        code, ciudad, estado, direccion, gerente, region,
        fechaApertura, status, producto, ubicacion,
        categoria: producto,
        catLabel: catFields.label,
        catShort: catFields.short,
        catColor: catFields.color,
        catBg: catFields.bg,
      };
      if (isNew) {
        await createDoc("locations", allFields);
        notify({ title: "Locación creada", body: `${ubicacion || ciudad} registrada correctamente.`, kind: "onboard" });
      } else {
        await updateDocById("locations", existing!.id, allFields);
        notify({ title: "Locación actualizada", body: `${ubicacion || ciudad} actualizada.`, kind: "info" });
      }
      onClose();
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!existing) return;
    if (!confirm(`¿Eliminar la locación "${existing.ubicacion ?? existing.ciudad}"? Esta acción no se puede deshacer.`)) return;
    await deleteDocById("locations", existing.id);
    onClose();
  }

  const inputClass = "h-9 w-full px-3 rounded-[var(--radius-sm)] border border-[var(--color-line)] bg-[var(--color-surface)] text-[var(--color-ink)] text-[13px] outline-none";

  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/30 backdrop-blur-[2px]" onClick={onClose} />
      <div className="fixed left-1/2 top-1/2 z-50 -translate-x-1/2 -translate-y-1/2 w-[520px] max-h-[90vh] overflow-y-auto rounded-[var(--radius-lg)] bg-[var(--color-surface)] shadow-[var(--shadow-lg)] p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-[15px] text-[var(--color-ink)]">
            {isNew ? "Nueva locación" : "Editar locación"}
          </h2>
          <button onClick={onClose} className="p-1 rounded-md text-[var(--color-ink-3)] hover:bg-[var(--color-surface-2)] transition-colors">
            <Close size={16} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] text-[var(--color-ink-4)] mb-1 block">Código *</label>
              <input className={inputClass} required value={code} onChange={(e) => setCode(e.target.value)} placeholder="MEX-001" />
            </div>
            <div>
              <label className="text-[11px] text-[var(--color-ink-4)] mb-1 block">Ciudad *</label>
              <input className={inputClass} required value={ciudad} onChange={(e) => setCiudad(e.target.value)} placeholder="Ciudad de México" />
            </div>
            <div>
              <label className="text-[11px] text-[var(--color-ink-4)] mb-1 block">Estado de la república *</label>
              <select className={inputClass} required value={estado} onChange={(e) => setEstado(e.target.value)}>
                <option value="">Seleccionar…</option>
                {estados.map((est) => <option key={est} value={est}>{est}</option>)}
              </select>
            </div>
            <div>
              <label className="text-[11px] text-[var(--color-ink-4)] mb-1 block">Fecha de apertura *</label>
              <input type="date" className={inputClass} required value={fechaApertura} onChange={(e) => setFechaApertura(e.target.value)} />
            </div>
            <div className="col-span-2">
              <label className="text-[11px] text-[var(--color-ink-4)] mb-1 block">Dirección</label>
              <input className={inputClass} value={direccion} onChange={(e) => setDireccion(e.target.value)} placeholder="Calle, número, colonia" />
            </div>
            <div>
              <label className="text-[11px] text-[var(--color-ink-4)] mb-1 block">Gerente</label>
              <select className={inputClass} value={gerente} onChange={(e) => setGerente(e.target.value)}>
                <option value="">Sin asignar</option>
                {allUsers.map((u) => (
                  <option key={u.id} value={u.fullName}>{u.fullName}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-[11px] text-[var(--color-ink-4)] mb-1 block">Región</label>
              <select className={inputClass} value={region} onChange={(e) => setRegion(e.target.value)}>
                <option value="">Sin asignar</option>
                {regions.map((r) => (
                  <option key={r.id} value={r.id}>{r.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-[11px] text-[var(--color-ink-4)] mb-1 block">Estatus del punto de venta</label>
              <select className={inputClass} value={status} onChange={(e) => setStatus(e.target.value as "open" | "closed")}>
                <option value="open">Activo</option>
                <option value="closed">Inactivo</option>
              </select>
            </div>
            <div>
              <label className="text-[11px] text-[var(--color-ink-4)] mb-1 block">Producto</label>
              <select className={inputClass} value={producto} onChange={(e) => setProducto(e.target.value)}>
                <option value="">Sin asignar</option>
                {Object.keys(CAT_MAP).map((p) => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
            <div className="col-span-2">
              <label className="text-[11px] text-[var(--color-ink-4)] mb-1 block">Nombre de pantalla (ubicación)</label>
              <input className={inputClass} value={ubicacion} onChange={(e) => setUbicacion(e.target.value)} placeholder="Nombre para mostrar" />
            </div>
          </div>
          <div className="flex justify-between gap-2 pt-2">
            {!isNew && (
              <Button type="button" variant="danger" size="sm" onClick={handleDelete}>Eliminar</Button>
            )}
            <div className="flex gap-2 ml-auto">
              <Button type="button" variant="secondary" size="sm" onClick={onClose}>Cancelar</Button>
              <Button type="submit" variant="primary" size="sm" disabled={saving}>
                {saving ? "Guardando…" : isNew ? "Crear" : "Guardar"}
              </Button>
            </div>
          </div>
        </form>
      </div>
    </>
  );
}

function LocationDetail({
  loc,
  onClose,
  onEdit,
}: {
  loc: Location & { id: string };
  onClose: () => void;
  onEdit: () => void;
}) {
  const statusCfg = STATUS_LABELS[loc.status] ?? STATUS_LABELS.open;
  return (
    <Drawer open onClose={onClose} title={loc.ubicacion ?? loc.ciudad} subtitle={`${loc.catLabel} · ${loc.estado}`}>
      <div className="px-6 py-5 space-y-5">
        {/* Header actions */}
        <div className="flex items-center gap-2 justify-end">
          <Button variant="secondary" size="sm" onClick={onEdit}>Editar</Button>
        </div>

        {/* Category badge */}
        <div className="flex items-center gap-3">
          <div className="size-10 rounded-[var(--radius-sm)] grid place-items-center text-[12px] font-bold"
            style={{ background: loc.catBg, color: loc.catColor, border: `1px solid ${loc.catColor}22` }}>
            {loc.catShort}
          </div>
          <div className="flex flex-col gap-1">
            <div className="text-[14px] font-semibold text-[var(--color-ink)]">{loc.catLabel}</div>
            <div className="flex items-center gap-1.5">
              <span className="text-[12px] font-medium px-2 py-0.5 rounded-full" style={{ color: statusCfg.color, background: statusCfg.bg }}>
                {statusCfg.label}
              </span>
              {!loc.gerente && (
                <span className="text-[12px] font-medium px-2 py-0.5 rounded-full" style={{ color: "#8a5a00", background: "#fff3d6" }}>
                  Sin cobertura
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Info grid */}
        <div className="grid grid-cols-2 gap-3 text-[13px]">
          {[
            ["Código", loc.code],
            ["Ciudad", loc.ciudad],
            ["Estado", loc.estado],
            ["Gerente", loc.gerente || "Sin asignar"],
            ["Región", loc.region],
            ["Apertura", loc.fechaApertura],
            ["Antigüedad", loc.fechaApertura ? `${monthsSince(loc.fechaApertura)} meses` : "—"],
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
  const { estados } = useCatalog();
  const { data: locations, loading, error } = useLocations();
  const [query,     setQuery]     = useState("");
  const [estadoF,   setEstadoF]   = useState("all");
  const [statusF,   setStatusF]   = useState("all");
  const [productoF, setProductoF] = useState("all");
  const [selected,   setSelected]   = useState<(Location & { id: string }) | null>(null);
  const [locModal,   setLocModal]   = useState<(Location & { id: string }) | "new" | null>(null);
  const [importing,  setImporting]  = useState(false);

  const filtered = useMemo(() => {
    const norm = (s: string) => s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
    return locations.filter((l) => {
      if (estadoF   !== "all" && l.estado   !== estadoF)   return false;
      if (statusF   !== "all" && l.status   !== statusF)   return false;
      if (productoF !== "all" && l.producto !== productoF) return false;
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
  }, [locations, query, estadoF, statusF, productoF]);

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
          <option value="all">Todos los estatus</option>
          <option value="open">Activo</option>
          <option value="closed">Inactivo</option>
        </select>
        <select value={productoF} onChange={(e) => setProductoF(e.target.value)}
          className="h-8 px-2 text-[12.5px] rounded-[var(--radius-sm)] border border-[var(--color-line)] bg-[var(--color-surface)] text-[var(--color-ink-2)] outline-none">
          <option value="all">Todos los productos</option>
          {Object.keys(CAT_MAP).map((p) => <option key={p} value={p}>{p}</option>)}
        </select>
        <div className="ml-auto flex items-center gap-2">
          <span className="text-[12px] text-[var(--color-ink-4)]">{filtered.length} locaciones</span>
          <Button variant="secondary" size="sm" icon={<Upload size={13} />} onClick={() => setImporting(true)}>Importar</Button>
          <Button variant="primary" size="sm" icon={<Plus size={14} />} onClick={() => setLocModal("new")}>Nueva locación</Button>
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
                  <td className="px-4 py-3 text-[var(--color-ink-3)]">{l.gerente || <span className="text-[11px] font-medium px-1.5 py-0.5 rounded-full" style={{ color: "#8a5a00", background: "#fff3d6" }}>Sin cobertura</span>}</td>
                  <td className="px-4 py-3 font-mono text-[12px] text-[var(--color-ink-4)]">{monthsSince(l.fechaApertura)}m</td>
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

      {selected && (
        <LocationDetail
          loc={selected}
          onClose={() => setSelected(null)}
          onEdit={() => { setLocModal(selected); setSelected(null); }}
        />
      )}
      {locModal && (
        <LocationModal loc={locModal} onClose={() => setLocModal(null)} />
      )}
      {importing && (
        <LocationImportWizard onClose={() => setImporting(false)} />
      )}
    </div>
  );
}
