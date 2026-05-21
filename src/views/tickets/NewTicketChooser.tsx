import { Close } from "@/components/icons";

interface Option {
  id: string;
  icon: string;
  label: string;
  desc: string;
  color: string;
  bg: string;
}

const OPTIONS: Option[] = [
  {
    id: "offboard",
    icon: "→",
    label: "Baja de persona",
    desc: "Revocar accesos, generar finiquito y archivar expediente. Requiere aprobaciones de Manager, HR e IT.",
    color: "var(--color-danger-fg)",
    bg: "var(--color-danger-bg)",
  },
  {
    id: "suspend",
    icon: "⊘",
    label: "Suspensión temporal",
    desc: "Congelar accesos sin dar de baja. Útil para investigaciones internas o permisos sin goce.",
    color: "#8a5a00",
    bg: "#fff3d6",
  },
  {
    id: "transfer",
    icon: "⇄",
    label: "Transferencia interna",
    desc: "Mover a una persona a otro hub, quiósco o manager. Sincroniza HubSpot y Slack automáticamente.",
    color: "var(--color-green-700)",
    bg: "var(--color-mint-50)",
  },
  {
    id: "access",
    icon: "⊕",
    label: "Acceso fuera de plantilla",
    desc: "Conceder acceso puntual a una app sensible. Requiere aprobación de Manager e IT.",
    color: "#1b3f8a",
    bg: "#e3eeff",
  },
  {
    id: "import",
    icon: "↑",
    label: "Alta en lote (importar CSV)",
    desc: "Cargar múltiples personas desde una hoja de cálculo o exportación de Humand.",
    color: "var(--color-ink-2)",
    bg: "var(--color-surface-2)",
  },
];

interface Props {
  onClose: () => void;
  onSelect: (id: string) => void;
}

export function NewTicketChooser({ onClose, onSelect }: Props) {
  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/30 backdrop-blur-[2px]" onClick={onClose} />
      <div className="fixed inset-x-4 top-1/2 z-50 -translate-y-1/2 mx-auto w-full max-w-[560px] rounded-[var(--radius-lg)] bg-[var(--color-surface)] shadow-[var(--shadow-lg)] overflow-hidden">
        <div className="flex items-start justify-between px-5 py-4 border-b border-[var(--color-line)]">
          <div>
            <div className="font-semibold text-[15px] text-[var(--color-ink)]">Nuevo ticket</div>
            <div className="text-[12px] text-[var(--color-ink-3)] mt-0.5">Elige el tipo de gestión a iniciar.</div>
          </div>
          <button onClick={onClose} className="p-1 rounded-md text-[var(--color-ink-3)] hover:bg-[var(--color-surface-2)] transition-colors">
            <Close size={16} />
          </button>
        </div>

        <div className="p-4 space-y-2">
          {OPTIONS.map((opt) => (
            <button
              key={opt.id}
              onClick={() => { onSelect(opt.id); onClose(); }}
              className="w-full flex items-start gap-4 px-4 py-3.5 rounded-[var(--radius-sm)] border border-[var(--color-line)] hover:bg-[var(--color-surface-2)] hover:border-[var(--color-line-strong)] transition-colors text-left group"
            >
              <div
                className="size-10 rounded-[var(--radius-sm)] grid place-items-center text-[18px] font-bold shrink-0"
                style={{ background: opt.bg, color: opt.color }}
              >
                {opt.icon}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-[13.5px] text-[var(--color-ink)] group-hover:text-green-700 transition-colors">{opt.label}</div>
                <div className="text-[12px] text-[var(--color-ink-3)] mt-0.5 leading-relaxed">{opt.desc}</div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </>
  );
}
