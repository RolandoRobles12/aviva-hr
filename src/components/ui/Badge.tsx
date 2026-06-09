import { cn } from "@/lib/cn";
import type { UserStatus } from "@/data/types";

const STATUS_CONFIG: Record<
  UserStatus,
  { label: string; dot: string; badge: string }
> = {
  active:      { label: "Activo",     dot: "bg-green-500",   badge: "bg-[var(--color-success-bg)] text-[var(--color-success-fg)]" },
  invited:     { label: "Invitado",   dot: "bg-blue-500",    badge: "bg-[var(--color-info-bg)] text-[var(--color-info-fg)]" },
  suspended:   { label: "Suspendido", dot: "bg-amber-500",   badge: "bg-[var(--color-warn-bg)] text-[var(--color-warn-fg)]" },
  offboarding: { label: "En baja",    dot: "bg-red-500",     badge: "bg-[var(--color-danger-bg)] text-[var(--color-danger-fg)]" },
  archived:    { label: "Archivado",  dot: "bg-[var(--color-ink-4)]", badge: "bg-[var(--color-surface-2)] text-[var(--color-ink-3)]" },
};

interface StatusBadgeProps {
  status: UserStatus;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const resolved = status === "invited" ? "active" : status;
  const config = STATUS_CONFIG[resolved] ?? STATUS_CONFIG.active;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11.5px] font-medium",
        config.badge,
        className
      )}
    >
      <span className={cn("size-1.5 rounded-full shrink-0", config.dot)} />
      {config.label}
    </span>
  );
}

interface BadgeProps {
  children: React.ReactNode;
  color?: string;
  bg?: string;
  className?: string;
}

export function Badge({ children, color, bg, className }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center px-2 py-0.5 rounded-full text-[11.5px] font-medium",
        className
      )}
      style={{ color, backgroundColor: bg }}
    >
      {children}
    </span>
  );
}
