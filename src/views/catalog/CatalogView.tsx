import { useState } from "react";
import { useCollection, createDoc, updateDocById, deleteDocById } from "@/hooks/useFirestore";
import { LoadingView, ErrorView } from "@/components/ui/Spinner";
import { Button } from "@/components/ui/Button";
import { Plus, Edit, Trash2, Close } from "@/components/icons";
import { cn } from "@/lib/cn";

interface Product {
  id?: string;
  name: string;
  tagline: string;
  color: string;
  bg: string;
}

interface Position {
  id?: string;
  name: string;
  level: string;
  area: string;
  productId: string | null;
}

// ── Product Modal ──────────────────────────────────────────────────────────────
function ProductModal({
  prod,
  onClose,
}: {
  prod: (Product & { id: string }) | "new";
  onClose: () => void;
}) {
  const isNew = prod === "new";
  const existing = isNew ? null : prod;

  const [name,    setName]    = useState(existing?.name ?? "");
  const [tagline, setTagline] = useState(existing?.tagline ?? "");
  const [color,   setColor]   = useState(existing?.color ?? "#16b877");
  const [bg,      setBg]      = useState(existing?.bg ?? "#e7f8ef");
  const [saving,  setSaving]  = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      if (isNew) {
        await createDoc("catalog/products/items", { name, tagline, color, bg });
      } else {
        await updateDocById("catalog/products/items", existing!.id, { name, tagline, color, bg });
      }
      onClose();
    } finally {
      setSaving(false);
    }
  }

  const inputClass = "h-9 w-full px-3 rounded-[var(--radius-sm)] border border-[var(--color-line)] bg-[var(--color-surface)] text-[var(--color-ink)] text-[13px] outline-none";

  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/30 backdrop-blur-[2px]" onClick={onClose} />
      <div className="fixed left-1/2 top-1/2 z-50 -translate-x-1/2 -translate-y-1/2 w-[520px] rounded-[var(--radius-lg)] bg-[var(--color-surface)] shadow-[var(--shadow-lg)] p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-[15px] text-[var(--color-ink)]">
            {isNew ? "Nuevo producto" : "Editar producto"}
          </h2>
          <button onClick={onClose} className="p-1 rounded-md text-[var(--color-ink-3)] hover:bg-[var(--color-surface-2)] transition-colors">
            <Close size={16} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="text-[11px] text-[var(--color-ink-4)] mb-1 block">Nombre *</label>
            <input className={inputClass} required value={name} onChange={(e) => setName(e.target.value)} placeholder="Nombre del producto" />
          </div>
          <div>
            <label className="text-[11px] text-[var(--color-ink-4)] mb-1 block">Tagline</label>
            <input className={inputClass} value={tagline} onChange={(e) => setTagline(e.target.value)} placeholder="Descripción breve" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] text-[var(--color-ink-4)] mb-1 block">Color de texto</label>
              <div className="flex items-center gap-2">
                <input type="color" className="h-9 w-12 rounded border border-[var(--color-line)] cursor-pointer" value={color} onChange={(e) => setColor(e.target.value)} />
                <input className={cn(inputClass, "flex-1")} value={color} onChange={(e) => setColor(e.target.value)} />
              </div>
            </div>
            <div>
              <label className="text-[11px] text-[var(--color-ink-4)] mb-1 block">Color de fondo</label>
              <div className="flex items-center gap-2">
                <input type="color" className="h-9 w-12 rounded border border-[var(--color-line)] cursor-pointer" value={bg} onChange={(e) => setBg(e.target.value)} />
                <input className={cn(inputClass, "flex-1")} value={bg} onChange={(e) => setBg(e.target.value)} />
              </div>
            </div>
          </div>
          {/* Preview */}
          <div className="flex items-center gap-2">
            <span className="text-[11px] text-[var(--color-ink-4)]">Preview:</span>
            <div className="size-8 rounded-[var(--radius-sm)] grid place-items-center font-bold text-[12px]"
              style={{ background: bg, color }}>
              {name.charAt(0) || "A"}
            </div>
            <span className="text-[13px] font-medium" style={{ color }}>{name || "Nombre"}</span>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="secondary" size="sm" onClick={onClose}>Cancelar</Button>
            <Button type="submit" variant="primary" size="sm" disabled={saving}>
              {saving ? "Guardando…" : isNew ? "Crear" : "Guardar"}
            </Button>
          </div>
        </form>
      </div>
    </>
  );
}

// ── Position Modal ─────────────────────────────────────────────────────────────
function PositionModal({
  pos,
  onClose,
}: {
  pos: (Position & { id: string }) | "new";
  onClose: () => void;
}) {
  const isNew = pos === "new";
  const existing = isNew ? null : pos;

  const [name,      setName]      = useState(existing?.name ?? "");
  const [level,     setLevel]     = useState(existing?.level ?? "operativo");
  const [area,      setArea]      = useState(existing?.area ?? "");
  const [productId, setProductId] = useState(existing?.productId ?? "");
  const [saving,    setSaving]    = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const data = { name, level, area, productId: productId || null };
      if (isNew) {
        await createDoc("catalog/positions/items", data);
      } else {
        await updateDocById("catalog/positions/items", existing!.id, data);
      }
      onClose();
    } finally {
      setSaving(false);
    }
  }

  const inputClass = "h-9 w-full px-3 rounded-[var(--radius-sm)] border border-[var(--color-line)] bg-[var(--color-surface)] text-[var(--color-ink)] text-[13px] outline-none";

  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/30 backdrop-blur-[2px]" onClick={onClose} />
      <div className="fixed left-1/2 top-1/2 z-50 -translate-x-1/2 -translate-y-1/2 w-[520px] rounded-[var(--radius-lg)] bg-[var(--color-surface)] shadow-[var(--shadow-lg)] p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-[15px] text-[var(--color-ink)]">
            {isNew ? "Nuevo puesto" : "Editar puesto"}
          </h2>
          <button onClick={onClose} className="p-1 rounded-md text-[var(--color-ink-3)] hover:bg-[var(--color-surface-2)] transition-colors">
            <Close size={16} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="text-[11px] text-[var(--color-ink-4)] mb-1 block">Nombre del puesto *</label>
            <input className={inputClass} required value={name} onChange={(e) => setName(e.target.value)} placeholder="Ej. Promotor de campo" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] text-[var(--color-ink-4)] mb-1 block">Nivel</label>
              <select className={inputClass} value={level} onChange={(e) => setLevel(e.target.value)}>
                <option value="operativo">Operativo</option>
                <option value="junior">Junior</option>
                <option value="senior">Senior</option>
                <option value="manager">Manager</option>
                <option value="director">Director</option>
              </select>
            </div>
            <div>
              <label className="text-[11px] text-[var(--color-ink-4)] mb-1 block">Área *</label>
              <input className={inputClass} required value={area} onChange={(e) => setArea(e.target.value)} placeholder="Ej. Ventas, Operaciones" />
            </div>
          </div>
          <div>
            <label className="text-[11px] text-[var(--color-ink-4)] mb-1 block">ID Producto (opcional)</label>
            <input className={inputClass} value={productId} onChange={(e) => setProductId(e.target.value)} placeholder="ID del producto asociado" />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="secondary" size="sm" onClick={onClose}>Cancelar</Button>
            <Button type="submit" variant="primary" size="sm" disabled={saving}>
              {saving ? "Guardando…" : isNew ? "Crear" : "Guardar"}
            </Button>
          </div>
        </form>
      </div>
    </>
  );
}

export function CatalogView() {
  const { data: products,  loading: lp, error: ep } = useCollection<Product>("catalog/products/items");
  const { data: positions, loading: lpos }           = useCollection<Position>("catalog/positions/items");
  const [tab,      setTab]      = useState<"products" | "positions">("products");
  const [prodModal, setProdModal] = useState<(Product & { id: string }) | "new" | null>(null);
  const [posModal,  setPosModal]  = useState<(Position & { id: string }) | "new" | null>(null);

  async function deleteProduct(id: string) {
    if (!confirm("¿Eliminar este producto?")) return;
    await deleteDocById("catalog/products/items", id);
  }

  async function deletePosition(id: string) {
    if (!confirm("¿Eliminar este puesto?")) return;
    await deleteDocById("catalog/positions/items", id);
  }

  if (lp || lpos) return <LoadingView />;
  if (ep)         return <ErrorView message={ep.message} />;

  return (
    <div className="p-5 space-y-5">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="font-serif text-[22px] font-medium text-[var(--color-ink)]">Catálogo</h1>
          <p className="text-[12.5px] text-[var(--color-ink-3)]">Productos y puestos que se usan en directorio y locaciones.</p>
        </div>
        <Button
          variant="primary"
          icon={<Plus size={14} />}
          onClick={() => tab === "products" ? setProdModal("new") : setPosModal("new")}
        >
          {tab === "products" ? "Nuevo producto" : "Nuevo puesto"}
        </Button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1">
        {(["products", "positions"] as const).map((t) => (
          <button key={t} onClick={() => setTab(t)}
            className={cn("h-8 px-4 rounded-[var(--radius-sm)] text-[13px] font-medium transition-colors",
              tab === t ? "bg-green-500 text-white" : "text-[var(--color-ink-3)] hover:bg-[var(--color-surface-2)]"
            )}>
            {t === "products" ? `Productos (${products.length})` : `Puestos (${positions.length})`}
          </button>
        ))}
      </div>

      {tab === "products" && (
        <div className="space-y-3">
          {products.map((p) => (
            <div key={p.id} className="flex items-center gap-4 px-4 py-3 rounded-[var(--radius)] bg-[var(--color-surface)] border border-[var(--color-line)] shadow-[var(--shadow-sm)]">
              <div className="size-8 rounded-[var(--radius-sm)] grid place-items-center font-bold text-[12px]"
                style={{ background: p.bg, color: p.color }}>
                {p.name.charAt(0)}
              </div>
              <div className="flex-1">
                <div className="font-semibold text-[var(--color-ink)]">{p.name}</div>
                <div className="text-[12px] text-[var(--color-ink-3)]">{p.tagline}</div>
              </div>
              <div className="flex gap-1">
                <Button size="sm" variant="ghost" icon={<Edit size={13} />} onClick={() => setProdModal(p)} />
                <Button size="sm" variant="ghost" icon={<Trash2 size={13} />} onClick={() => deleteProduct(p.id)} />
              </div>
            </div>
          ))}
          {products.length === 0 && <div className="py-12 text-center text-[13px] text-[var(--color-ink-4)]">Sin productos. Agrega el primero.</div>}
        </div>
      )}

      {tab === "positions" && (
        <div className="rounded-[var(--radius)] bg-[var(--color-surface)] border border-[var(--color-line)] shadow-[var(--shadow-sm)] overflow-hidden">
          <table className="w-full border-collapse text-[13px]">
            <thead>
              <tr className="border-b border-[var(--color-line)] bg-[var(--color-surface-2)]">
                {["Puesto", "Nivel", "Área", ""].map((h) => (
                  <th key={h} className="px-4 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wider text-[var(--color-ink-4)]">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {positions.map((pos) => (
                <tr key={pos.id} className="border-b border-[var(--color-line)] last:border-0 hover:bg-[var(--color-surface-2)]">
                  <td className="px-4 py-3 font-medium text-[var(--color-ink)]">{pos.name}</td>
                  <td className="px-4 py-3 text-[var(--color-ink-3)]">{pos.level}</td>
                  <td className="px-4 py-3 text-[var(--color-ink-3)]">{pos.area}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1 justify-end">
                      <Button size="sm" variant="ghost" icon={<Edit size={13} />} onClick={() => setPosModal(pos)} />
                      <Button size="sm" variant="ghost" icon={<Trash2 size={13} />} onClick={() => deletePosition(pos.id)} />
                    </div>
                  </td>
                </tr>
              ))}
              {positions.length === 0 && (
                <tr><td colSpan={4} className="px-4 py-12 text-center text-[13px] text-[var(--color-ink-4)]">Sin puestos configurados.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {prodModal && <ProductModal prod={prodModal} onClose={() => setProdModal(null)} />}
      {posModal  && <PositionModal pos={posModal} onClose={() => setPosModal(null)} />}
    </div>
  );
}
