import { useEffect } from "react";
import { Close } from "@/components/icons";

interface DrawerProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  subtitle?: string;
  children: React.ReactNode;
}

export function Drawer({ open, onClose, title, subtitle, children }: DrawerProps) {
  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <>
      <div
        className="fixed inset-0 z-30 bg-black/20 backdrop-blur-[1px]"
        onClick={onClose}
      />
      <aside
        role="dialog"
        aria-modal="true"
        className="fixed right-0 top-0 z-40 flex h-full w-[620px] max-w-[95vw] flex-col bg-[var(--color-surface)] shadow-[var(--shadow-lg)] border-l border-[var(--color-line)]"
      >
        {(title || subtitle) && (
          <div className="flex items-start justify-between gap-4 px-6 py-5 border-b border-[var(--color-line)] shrink-0">
            <div>
              {title && (
                <h2 className="font-semibold text-[15px] text-[var(--color-ink)]">
                  {title}
                </h2>
              )}
              {subtitle && (
                <p className="text-xs text-[var(--color-ink-3)] mt-0.5">
                  {subtitle}
                </p>
              )}
            </div>
            <button
              onClick={onClose}
              className="mt-0.5 p-1 rounded-md text-[var(--color-ink-3)] hover:bg-[var(--color-surface-2)] hover:text-[var(--color-ink)] transition-colors shrink-0"
            >
              <Close size={16} />
            </button>
          </div>
        )}
        <div className="flex-1 overflow-y-auto">{children}</div>
      </aside>
    </>
  );
}
