import { useState } from "react";
import { useFormQuestions } from "@/hooks/useTemplates";
import { updateDocById } from "@/hooks/useFirestore";
import { LoadingView, ErrorView } from "@/components/ui/Spinner";
import { Button } from "@/components/ui/Button";
import { Plus, Clipboard } from "@/components/icons";
import type { FormQuestion } from "@/hooks/useTemplates";
import { cn } from "@/lib/cn";

export function FormConfigView() {
  const { data: questions, loading, error } = useFormQuestions();

  async function toggleEnabled(q: FormQuestion & { id: string }) {
    await updateDocById("templates/formConfig/questions", q.id, { enabled: !q.enabled });
  }

  if (loading) return <LoadingView />;
  if (error)   return <ErrorView message={error.message} />;

  return (
    <div className="p-5 space-y-5">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="font-serif text-[22px] font-medium text-[var(--color-ink)]">Preguntas y docs</h1>
          <p className="text-[12.5px] text-[var(--color-ink-3)]">Configura el formulario de ingreso y los documentos requeridos por candidato.</p>
        </div>
        <Button variant="primary" icon={<Plus size={14} />}>Nueva pregunta</Button>
      </div>

      <div className="rounded-[var(--radius)] bg-[var(--color-surface)] border border-[var(--color-line)] shadow-[var(--shadow-sm)] overflow-hidden">
        <div className="px-5 py-3 border-b border-[var(--color-line)] flex items-center gap-2">
          <Clipboard size={15} className="text-[var(--color-ink-3)]" />
          <span className="text-[13.5px] font-semibold text-[var(--color-ink)]">Preguntas del formulario</span>
          <span className="text-[12px] text-[var(--color-ink-4)] ml-1">({questions.filter(q => q.enabled).length} activas)</span>
        </div>
        <div>
          {questions.map((q, i) => (
            <div key={q.id} className={cn("flex items-center gap-3 px-5 py-3 border-b border-[var(--color-line)] last:border-0",
              !q.enabled && "opacity-50"
            )}>
              <span className="text-[11px] font-mono text-[var(--color-ink-4)] w-5 shrink-0">{q.order}</span>
              <div className="flex-1 min-w-0">
                <div className="font-medium text-[var(--color-ink)] text-[13px]">{q.label}</div>
                <div className="text-[11.5px] text-[var(--color-ink-4)]">
                  {q.type === "yes_no" ? "Sí / No" : q.type === "radio" ? `Opciones: ${q.options?.join(", ")}` : q.type}
                  {q.required && <span className="ml-2 text-[var(--color-danger-fg)]">Requerido</span>}
                </div>
              </div>
              <button
                onClick={() => toggleEnabled(q)}
                className={cn(
                  "relative w-10 h-5 rounded-full transition-colors",
                  q.enabled ? "bg-green-500" : "bg-[var(--color-line-strong)]"
                )}
              >
                <span className={cn("absolute top-0.5 size-4 rounded-full bg-white shadow transition-transform",
                  q.enabled ? "translate-x-5" : "translate-x-0.5"
                )} />
              </button>
            </div>
          ))}
          {questions.length === 0 && (
            <div className="px-5 py-12 text-center text-[13px] text-[var(--color-ink-4)]">Sin preguntas configuradas.</div>
          )}
        </div>
      </div>
    </div>
  );
}
