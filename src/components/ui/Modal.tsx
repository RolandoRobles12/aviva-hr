import { useEffect } from "react";
import { Close } from "@/components/icons";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  width?: "sm" | "md" | "lg";
}

const widths = { sm: "max-w-sm", md: "max-w-lg", lg: "max-w-2xl" };

export function Modal({
  open,
  onClose,
  title,
  children,
  width = "md",
}: ModalProps) {
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
        className="fixed inset-0 z-40 bg-black/30 backdrop-blur-[2px]"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        className={`fixed inset-x-4 top-1/2 z-50 -translate-y-1/2 mx-auto w-full ${widths[width]} rounded-[var(--radius-lg)] bg-[var(--color-surface)] shadow-[var(--shadow-lg)] overflow-hidden`}
      >
        {title && (
          <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--color-line)]">
            <h2 className="text-[15px] font-semibold text-[var(--color-ink)]">
              {title}
            </h2>
            <button
              onClick={onClose}
              className="p-1 rounded-md text-[var(--color-ink-3)] hover:bg-[var(--color-surface-2)] hover:text-[var(--color-ink)] transition-colors"
            >
              <Close size={16} />
            </button>
          </div>
        )}
        <div>{children}</div>
      </div>
    </>
  );
}
