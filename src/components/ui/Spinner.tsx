import { cn } from "@/lib/cn";

interface SpinnerProps {
  size?: "sm" | "md" | "lg";
  className?: string;
}

const sizes = { sm: "size-4", md: "size-6", lg: "size-10" };

export function Spinner({ size = "md", className }: SpinnerProps) {
  return (
    <div
      role="status"
      className={cn(
        "animate-spin rounded-full border-2 border-[var(--color-line)] border-t-green-500",
        sizes[size],
        className
      )}
    />
  );
}

export function LoadingView() {
  return (
    <div className="flex h-full items-center justify-center">
      <Spinner size="lg" />
    </div>
  );
}

export function ErrorView({ message }: { message?: string }) {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-2 text-[var(--color-danger-fg)]">
      <p className="text-[13px] font-medium">Error al cargar datos</p>
      {message && (
        <p className="text-[12px] text-[var(--color-ink-4)]">{message}</p>
      )}
    </div>
  );
}
