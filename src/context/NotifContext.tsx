import { createContext, useContext, useState, useEffect, useRef } from "react";
import { Bell, Close } from "@/components/icons";
import { cn } from "@/lib/cn";
import { useCollection, createDoc, updateDocById, orderBy } from "@/hooks/useFirestore";

type NotifKind = "offboard" | "onboard" | "alert" | "approval" | "sync" | "info";

interface NotifItem {
  id: string;
  kind: NotifKind;
  unread: boolean;
  title: string;
  body?: string;
  when: string;
}

interface Toast {
  id: string;
  kind: NotifKind;
  title: string;
  body?: string;
}

interface NotifState {
  notify: (opts: { title: string; body?: string; kind?: NotifKind }) => void;
  items: NotifItem[];
  markAllRead: () => void;
}

const NotifContext = createContext<NotifState | null>(null);

export function useNotif() {
  const ctx = useContext(NotifContext);
  if (!ctx) throw new Error("useNotif must be used inside NotifProvider");
  return ctx;
}

const KIND_ICON: Record<string, string> = {
  offboard: "→", onboard: "+", alert: "!", approval: "✓", sync: "↺", info: "·",
};

function ToastStack({ toasts, onDismiss }: { toasts: Toast[]; onDismiss: (id: string) => void }) {
  return (
    <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2 w-[320px] pointer-events-none">
      {toasts.map((t) => (
        <div
          key={t.id}
          className="pointer-events-auto flex items-start gap-3 px-4 py-3 rounded-[var(--radius)] bg-[var(--color-surface)] border border-[var(--color-line)] shadow-[var(--shadow-lg)]"
        >
          <div className={cn(
            "size-6 rounded-full grid place-items-center text-[11px] font-bold shrink-0 mt-0.5",
            t.kind === "alert" || t.kind === "offboard"
              ? "bg-[var(--color-danger-bg)] text-[var(--color-danger-fg)]"
              : "bg-[var(--color-mint-50)] text-[var(--color-green-700)]"
          )}>
            {t.kind === "alert" || t.kind === "offboard" ? "!" : "✓"}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-[13px] font-medium text-[var(--color-ink)]">{t.title}</div>
            {t.body && <div className="text-[12px] text-[var(--color-ink-3)] mt-0.5">{t.body}</div>}
          </div>
          <button
            onClick={() => onDismiss(t.id)}
            className="p-0.5 rounded text-[var(--color-ink-4)] hover:text-[var(--color-ink)] transition-colors shrink-0"
          >
            <Close size={13} />
          </button>
        </div>
      ))}
    </div>
  );
}

export function NotifProvider({ children }: { children: React.ReactNode }) {
  const { data: firestoreItems } = useCollection<NotifItem & { createdAt: unknown }>(
    "notifications",
    [orderBy("createdAt", "desc")]
  );
  const items: NotifItem[] = firestoreItems;
  const [toasts, setToasts] = useState<Toast[]>([]);

  function notify({ title, body, kind = "info" as NotifKind }: { title: string; body?: string; kind?: NotifKind }) {
    const id = "t" + Date.now() + Math.random().toString(36).slice(2, 6);
    setToasts((t) => [...t, { id, title, body, kind }]);
    createDoc("notifications", { kind, unread: true, title, body, when: "ahora mismo" });
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 5200);
  }

  function markAllRead() {
    Promise.all(
      items.filter((x) => x.unread).map((x) => updateDocById("notifications", x.id, { unread: false }))
    );
  }

  return (
    <NotifContext.Provider value={{ notify, items, markAllRead }}>
      {children}
      <ToastStack toasts={toasts} onDismiss={(id) => setToasts((t) => t.filter((x) => x.id !== id))} />
    </NotifContext.Provider>
  );
}

export function NotifBell() {
  const { items, markAllRead } = useNotif();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const unread = items.filter((x) => x.unread).length;

  useEffect(() => {
    if (!open) return;
    function onDoc(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={(e) => { e.stopPropagation(); setOpen((o) => !o); }}
        className="relative p-2 rounded-md text-[var(--color-ink-3)] hover:bg-[var(--color-surface-2)] hover:text-[var(--color-ink)] transition-colors"
        title="Notificaciones"
      >
        <Bell size={16} />
        {unread > 0 && (
          <span className="absolute top-1 right-1 min-w-[14px] h-3.5 px-0.5 rounded-full bg-green-500 text-white text-[9px] font-bold grid place-items-center leading-none">
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-1 w-[340px] rounded-[var(--radius)] bg-[var(--color-surface)] border border-[var(--color-line)] shadow-[var(--shadow-lg)] z-50 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--color-line)]">
            <h4 className="text-[13.5px] font-semibold text-[var(--color-ink)]">Notificaciones</h4>
            <button
              onClick={markAllRead}
              className="text-[12px] text-[var(--color-ink-3)] hover:text-[var(--color-ink)] transition-colors"
            >
              Marcar todas como leídas
            </button>
          </div>

          <div className="max-h-[360px] overflow-auto">
            {items.length === 0 && (
              <div className="px-4 py-8 text-center text-[13px] text-[var(--color-ink-4)]">Sin notificaciones</div>
            )}
            {items.map((n) => (
              <div key={n.id} className={cn(
                "flex items-start gap-3 px-4 py-3 border-b border-[var(--color-line)] last:border-0 transition-colors",
                n.unread ? "bg-[var(--color-mint-50)]" : "hover:bg-[var(--color-surface-2)]"
              )}>
                <div className={cn(
                  "size-7 rounded-full grid place-items-center text-[12px] font-bold shrink-0 mt-0.5",
                  n.kind === "alert" || n.kind === "offboard"
                    ? "bg-[var(--color-danger-bg)] text-[var(--color-danger-fg)]"
                    : "bg-[var(--color-mint-50)] text-[var(--color-green-700)]"
                )}>
                  {KIND_ICON[n.kind] ?? "·"}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-[13px] font-medium text-[var(--color-ink)] leading-snug">{n.title}</div>
                  {n.body && <div className="text-[12px] text-[var(--color-ink-3)] mt-0.5 leading-snug">{n.body}</div>}
                  <div className="text-[11px] text-[var(--color-ink-4)] mt-1">{n.when}</div>
                </div>
                {n.unread && <div className="size-1.5 rounded-full bg-green-500 shrink-0 mt-2" />}
              </div>
            ))}
          </div>

          <div className="flex gap-1 px-3 py-2 border-t border-[var(--color-line)]">
            <button className="flex-1 h-7 text-[12.5px] text-[var(--color-ink-3)] hover:text-[var(--color-ink)] transition-colors">
              Ver todas
            </button>
            <button className="h-7 px-2 text-[12.5px] text-[var(--color-ink-3)] hover:text-[var(--color-ink)] transition-colors">
              Configurar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
