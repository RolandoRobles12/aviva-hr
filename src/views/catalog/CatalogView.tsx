import { useState } from "react";
import { useCollection, createDoc, updateDocById, deleteDocById } from "@/hooks/useFirestore";
import { LoadingView, ErrorView } from "@/components/ui/Spinner";
import { Button } from "@/components/ui/Button";
import { Plus, Edit, Trash2 } from "@/components/icons";
import { cn } from "@/lib/cn";

interface Product {
  name: string;
  tagline: string;
  color: string;
  bg: string;
}

interface Position {
  name: string;
  level: string;
  area: string;
  productId: string | null;
}

export function CatalogView() {
  const { data: products,  loading: lp, error: ep } = useCollection<Product>("catalog/products/items");
  const { data: positions, loading: lpos }           = useCollection<Position>("catalog/positions/items");
  const [tab, setTab] = useState<"products" | "positions">("products");

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
        <Button variant="primary" icon={<Plus size={14} />}>
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
                <Button size="sm" variant="ghost" icon={<Edit size={13} />} />
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
                      <Button size="sm" variant="ghost" icon={<Edit size={13} />} />
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
    </div>
  );
}
