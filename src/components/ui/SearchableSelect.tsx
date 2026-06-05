import { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/cn";

interface Option {
  value: string;
  label: string;
  sub?: string;
}

interface Props {
  value: string;
  onChange: (value: string) => void;
  options: Option[];
  placeholder?: string;
  emptyLabel?: string;
  className?: string;
}

export function SearchableSelect({ value, onChange, options, placeholder = "Buscar…", emptyLabel = "Sin asignar", className }: Props) {
  const [open, setOpen]       = useState(false);
  const [query, setQuery]     = useState("");
  const containerRef          = useRef<HTMLDivElement>(null);
  const inputRef              = useRef<HTMLInputElement>(null);

  const selected = options.find((o) => o.value === value);

  const filtered = query.trim()
    ? options.filter((o) =>
        o.label.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").includes(
          query.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "")
        ) ||
        (o.sub ?? "").toLowerCase().includes(query.toLowerCase())
      )
    : options;

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (!containerRef.current?.contains(e.target as Node)) {
        setOpen(false);
        setQuery("");
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  function select(val: string) {
    onChange(val);
    setOpen(false);
    setQuery("");
  }

  return (
    <div ref={containerRef} className={cn("relative", className)}>
      <button
        type="button"
        onClick={() => { setOpen((o) => !o); setTimeout(() => inputRef.current?.focus(), 50); }}
        className="h-9 w-full px-3 rounded-[var(--radius-sm)] border border-[var(--color-line)] bg-[var(--color-surface)] text-[var(--color-ink)] text-[13px] outline-none flex items-center justify-between gap-2 text-left"
      >
        <span className={cn("truncate", !selected && "text-[var(--color-ink-4)]")}>
          {selected ? (
            <span className="flex items-center gap-1.5">
              {selected.sub && <span className="font-mono text-[11px] text-[var(--color-ink-4)]">{selected.sub}</span>}
              {selected.label}
            </span>
          ) : emptyLabel}
        </span>
        <svg width="12" height="12" viewBox="0 0 12 12" className="shrink-0 text-[var(--color-ink-4)]">
          <path d="M2 4l4 4 4-4" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
        </svg>
      </button>

      {open && (
        <div className="absolute z-50 mt-1 w-full min-w-[220px] rounded-[var(--radius-sm)] border border-[var(--color-line)] bg-[var(--color-surface)] shadow-[var(--shadow-lg)] overflow-hidden">
          <div className="p-2 border-b border-[var(--color-line)]">
            <input
              ref={inputRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={placeholder}
              className="w-full h-7 px-2 text-[12.5px] rounded-[var(--radius-sm)] border border-[var(--color-line)] bg-[var(--color-surface-2)] text-[var(--color-ink)] outline-none placeholder:text-[var(--color-ink-4)]"
            />
          </div>
          <div className="max-h-[220px] overflow-y-auto">
            <button type="button" onClick={() => select("")}
              className={cn("w-full text-left px-3 py-2 text-[12.5px] hover:bg-[var(--color-surface-2)] transition-colors",
                !value ? "text-[var(--color-ink)] font-medium" : "text-[var(--color-ink-3)]"
              )}>
              {emptyLabel}
            </button>
            {filtered.length === 0 && (
              <div className="px-3 py-3 text-[12px] text-[var(--color-ink-4)]">Sin resultados</div>
            )}
            {filtered.map((o) => (
              <button key={o.value} type="button" onClick={() => select(o.value)}
                className={cn("w-full text-left px-3 py-2 text-[12.5px] hover:bg-[var(--color-surface-2)] transition-colors flex items-center gap-2",
                  value === o.value ? "bg-[var(--color-mint-50)] text-[var(--color-ink)] font-medium" : "text-[var(--color-ink-2)]"
                )}>
                {o.sub && <span className="font-mono text-[11px] text-[var(--color-ink-4)] w-10 shrink-0">{o.sub}</span>}
                <span className="truncate">{o.label}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
