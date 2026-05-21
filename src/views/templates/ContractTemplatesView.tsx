import { useContractTemplates } from "@/hooks/useTemplates";
import { deleteDocById } from "@/hooks/useFirestore";
import { LoadingView, ErrorView } from "@/components/ui/Spinner";
import { Button } from "@/components/ui/Button";
import { Plus, Edit, Trash2, File } from "@/components/icons";

export function ContractTemplatesView() {
  const { data, loading, error } = useContractTemplates();

  if (loading) return <LoadingView />;
  if (error)   return <ErrorView message={error.message} />;

  return (
    <div className="p-5 space-y-5">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="font-serif text-[22px] font-medium text-[var(--color-ink)]">Contratos</h1>
          <p className="text-[12.5px] text-[var(--color-ink-3)]">{data.length} plantillas de contrato</p>
        </div>
        <Button variant="primary" icon={<Plus size={14} />}>Nueva plantilla</Button>
      </div>

      <div className="rounded-[var(--radius)] bg-[var(--color-surface)] border border-[var(--color-line)] shadow-[var(--shadow-sm)] overflow-hidden">
        <table className="w-full border-collapse text-[13px]">
          <thead>
            <tr className="border-b border-[var(--color-line)] bg-[var(--color-surface-2)]">
              {["Nombre", "Tipo", "Páginas", "Firma digital", "Actualizado", ""].map((h) => (
                <th key={h} className="px-4 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wider text-[var(--color-ink-4)]">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((t) => (
              <tr key={t.id} className="border-b border-[var(--color-line)] last:border-0 hover:bg-[var(--color-surface-2)]">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2.5">
                    <File size={15} className="text-[var(--color-ink-3)] shrink-0" />
                    <span className="font-medium text-[var(--color-ink)]">{t.name}</span>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <span className="text-[11.5px] px-2 py-0.5 rounded bg-[var(--color-surface-2)] border border-[var(--color-line)] text-[var(--color-ink-3)] uppercase">{t.type}</span>
                </td>
                <td className="px-4 py-3 font-mono text-[12px] text-[var(--color-ink-3)]">{t.pageCount}</td>
                <td className="px-4 py-3 text-[var(--color-ink-3)]">{t.hasSignatureFields ? "✓ Sí" : "—"}</td>
                <td className="px-4 py-3 font-mono text-[12px] text-[var(--color-ink-4)]">{t.updatedAt}</td>
                <td className="px-4 py-3">
                  <div className="flex gap-1 justify-end">
                    <Button size="sm" variant="ghost" icon={<Edit size={13} />} />
                    <Button size="sm" variant="ghost" icon={<Trash2 size={13} />}
                      onClick={() => deleteDocById("templates/contracts/items", t.id)} />
                  </div>
                </td>
              </tr>
            ))}
            {data.length === 0 && (
              <tr><td colSpan={6} className="px-4 py-12 text-center text-[13px] text-[var(--color-ink-4)]">Sin plantillas de contrato.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
