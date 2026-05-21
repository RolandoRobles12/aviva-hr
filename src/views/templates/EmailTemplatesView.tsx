import { useState } from "react";
import { useEmailTemplates } from "@/hooks/useTemplates";
import { updateDocById } from "@/hooks/useFirestore";
import { LoadingView, ErrorView } from "@/components/ui/Spinner";
import { Button } from "@/components/ui/Button";
import { Drawer } from "@/components/ui/Drawer";
import { Plus, Mail, Edit } from "@/components/icons";
import type { EmailTemplate } from "@/hooks/useTemplates";

function EmailEditor({
  template,
  onClose,
}: {
  template: EmailTemplate & { id: string };
  onClose: () => void;
}) {
  const [subject, setSubject] = useState(template.subject);
  const [body, setBody]       = useState(template.body);
  const [saving, setSaving]   = useState(false);

  async function handleSave() {
    setSaving(true);
    try {
      await updateDocById("templates/emails/items", template.id, {
        subject,
        body,
        updatedAt: new Date().toISOString().slice(0, 10),
      });
      onClose();
    } finally {
      setSaving(false);
    }
  }

  return (
    <Drawer open onClose={onClose} title={template.name} subtitle={`Tipo: ${template.type}`}>
      <div className="px-6 py-5 space-y-4">
        <div>
          <label className="text-[11px] text-[var(--color-ink-4)] mb-1 block">Asunto</label>
          <input
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            className="w-full h-9 px-3 text-[13px] rounded-[var(--radius-sm)] border border-[var(--color-line)] bg-[var(--color-surface-2)] text-[var(--color-ink)] outline-none focus:border-green-500"
          />
        </div>
        <div>
          <label className="text-[11px] text-[var(--color-ink-4)] mb-1 block">Cuerpo</label>
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            rows={14}
            className="w-full px-3 py-2 text-[13px] font-mono rounded-[var(--radius-sm)] border border-[var(--color-line)] bg-[var(--color-surface-2)] text-[var(--color-ink)] outline-none focus:border-green-500 resize-none"
          />
          <p className="text-[11px] text-[var(--color-ink-4)] mt-1">Variables disponibles: {`{{firstName}}`}, {`{{position}}`}, {`{{formUrl}}`}</p>
        </div>
        <div className="flex gap-2 pt-2">
          <Button variant="primary" onClick={handleSave} disabled={saving} className="flex-1">
            {saving ? "Guardando…" : "Guardar cambios"}
          </Button>
          <Button variant="secondary" onClick={onClose}>Cancelar</Button>
        </div>
      </div>
    </Drawer>
  );
}

export function EmailTemplatesView() {
  const { data, loading, error } = useEmailTemplates();
  const [editing, setEditing]    = useState<(EmailTemplate & { id: string }) | null>(null);

  if (loading) return <LoadingView />;
  if (error)   return <ErrorView message={error.message} />;

  return (
    <div className="p-5 space-y-5">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="font-serif text-[22px] font-medium text-[var(--color-ink)]">Plantillas de correo</h1>
          <p className="text-[12.5px] text-[var(--color-ink-3)]">{data.length} templates · se envían automáticamente según la etapa del candidato</p>
        </div>
        <Button variant="primary" icon={<Plus size={14} />}>Nueva plantilla</Button>
      </div>

      <div className="space-y-3">
        {data.map((t) => (
          <div key={t.id} className="rounded-[var(--radius)] bg-[var(--color-surface)] border border-[var(--color-line)] shadow-[var(--shadow-sm)] p-4">
            <div className="flex items-start gap-3">
              <Mail size={16} className="text-[var(--color-ink-3)] mt-0.5 shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-[var(--color-ink)]">{t.name}</span>
                  <span className="text-[11px] px-2 py-0.5 rounded-full bg-[var(--color-surface-2)] border border-[var(--color-line)] text-[var(--color-ink-4)] uppercase">{t.type}</span>
                </div>
                <div className="text-[12.5px] text-[var(--color-ink-3)] mt-1 truncate">Asunto: {t.subject}</div>
                <pre className="text-[11.5px] text-[var(--color-ink-4)] mt-2 whitespace-pre-wrap font-sans line-clamp-3">{t.body.slice(0, 180)}…</pre>
              </div>
              <Button size="sm" variant="ghost" icon={<Edit size={13} />} onClick={() => setEditing(t)}>
                Editar
              </Button>
            </div>
            <div className="mt-3 pt-2 border-t border-[var(--color-line)] text-[11.5px] text-[var(--color-ink-4)]">
              Actualizado: {t.updatedAt}
            </div>
          </div>
        ))}
        {data.length === 0 && <div className="py-12 text-center text-[13px] text-[var(--color-ink-4)]">Sin plantillas de correo.</div>}
      </div>

      {editing && <EmailEditor template={editing} onClose={() => setEditing(null)} />}
    </div>
  );
}
