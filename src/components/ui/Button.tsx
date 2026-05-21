import { cn } from "@/lib/cn";
import { forwardRef } from "react";

type Variant = "primary" | "secondary" | "ghost" | "danger";
type Size = "sm" | "md";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  icon?: React.ReactNode;
  iconEnd?: React.ReactNode;
}

const variants: Record<Variant, string> = {
  primary:
    "bg-green-500 text-white hover:bg-green-600 active:bg-green-700 shadow-[var(--shadow-sm)]",
  secondary:
    "bg-[var(--color-surface)] text-[var(--color-ink-2)] border border-[var(--color-line)] hover:bg-[var(--color-surface-2)] hover:border-[var(--color-line-strong)] shadow-[var(--shadow-sm)]",
  ghost:
    "bg-transparent text-[var(--color-ink-2)] hover:bg-[var(--color-mint-50)] hover:text-[var(--color-ink)]",
  danger:
    "bg-[var(--color-danger-bg)] text-[var(--color-danger-fg)] hover:opacity-90",
};

const sizes: Record<Size, string> = {
  sm: "h-7 px-2.5 text-[12.5px] gap-1.5",
  md: "h-8 px-3 text-[13px] gap-2",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = "secondary",
      size = "md",
      icon,
      iconEnd,
      children,
      className,
      ...props
    },
    ref
  ) => {
    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center rounded-[var(--radius-sm)] font-medium transition-colors select-none whitespace-nowrap",
          "disabled:opacity-50 disabled:cursor-not-allowed",
          variants[variant],
          sizes[size],
          !children && "px-1.5",
          className
        )}
        {...props}
      >
        {icon && (
          <span className="inline-flex shrink-0 [&>svg]:size-3.5">{icon}</span>
        )}
        {children}
        {iconEnd && (
          <span className="inline-flex shrink-0 [&>svg]:size-3.5">{iconEnd}</span>
        )}
      </button>
    );
  }
);

Button.displayName = "Button";
