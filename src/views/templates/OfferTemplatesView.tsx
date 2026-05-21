import { useOfferTemplates } from "@/hooks/useTemplates";
import { deleteDocById } from "@/hooks/useFirestore";
import { LoadingView, ErrorView } from "@/components/ui/Spinner";
import { Button } from "@/components/ui/Button";
import { Plus, Edit, Trash2, FileSign } from "@/components/icons";

export function OfferTemplatesView() {
  const { data, loading, error } = useOfferTemplates();

  if (loading) return <LoadingView />;
  if (error)   return <ErrorView message={error.message} />;

  return (
    <div className="p-5 space-y-5">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="font-serif text-[22px] font-medium text-[var(--color-ink)]">Cartas oferta</h1>
          <p className="text-[12.5px] text-[var(--color-ink-3)]">{data.length} plantillas · se asignan automáticamente según el puesto</p>
        </div>
        <Button variant="primary" icon={<Plus size={14} />}>Nueva plantilla</Button>
      </div>

      <div className="space-y-3">
        {data.map((t) => (
          <div key={t.id} className="rounded-[var(--radius)] bg-[var(--color-surface)] border border-[var(--color-line)] shadow-[var(--shadow-sm)] p-4">
            <div className="flex items-start gap-3">
              <FileSign size={18} className="text-[var(--color-ink-3)] mt-0.5 shrink-0" />
              <div className="flex-1">
                <div className="font-semibold text-[var(--color-ink)]">{t.name}</div>
                <div className="text-[12.5px] text-[var(--color-ink-3)] mt-0.5">
                  Salario: <strong>{t.salary}</strong> · Inicio: {t.startDate}
                </div>
                <div className="text-[12px] text-[var(--color-ink-4)] mt-1">{t.benefits}</div>
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {t.profileNames.map((n: string) => (
                    <span key={n} className="text-[11px] px-2 py-0.5 rounded-full bg-[var(--color-surface-2)] border border-[var(--color-line)] text-[var(--color-ink-3)]">{n}</span>
                  ))}
                </div>
              </div>
              <div className="flex gap-1 shrink-0">
                <Button size="sm" variant="ghost" icon={<Edit size={13} />} />
                <Button size="sm" variant="ghost" icon={<Trash2 size={13} />}
                  onClick={() => deleteDocById("templates/offers/items", t.id)} />
              </div>
            </div>
            <div className="mt-3 pt-2 border-t border-[var(--color-line)] text-[11.5px] text-[var(--color-ink-4)]">
              Actualizado: {t.updatedAt}
            </div>
          </div>
        ))}
        {data.length === 0 && <div className="py-12 text-center text-[13px] text-[var(--color-ink-4)]">Sin plantillas de carta oferta.</div>}
      </div>
    </div>
  );
}
