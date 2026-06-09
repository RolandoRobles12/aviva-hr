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
  const [open, setOpen]   = useState(false);
  const [query, setQuery] = useState("");
  const rootRef           = useRef<HTMLDivElement>(null);
  const inputRef          = useRef<HTMLInputElement>(null);

  const norm = (s: string) => s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
  const q    = norm(query.trim());

  const filtered = q
    ? options.filter((o) => norm(o.label).includes(q) || norm(o.sub ?? "").includes(q))
    : options;

  const selected = options.find((o) => o.value === value);

  // Close on outside click — use blur + relatedTarget instead of document listeners
  function handleRootBlur(e: React.FocusEvent) {
    // relatedTarget is the element receiving focus next
    if (!rootRef.current?.contains(e.relatedTarget as Node)) {
      setOpen(false);
      setQuery("");
    }
  }

  // Also close on Escape (already handled by Drawer but belt-and-suspenders)
  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") { setOpen(false); setQuery(""); }
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  function openDropdown() {
    setOpen(true);
    setQuery("");
    setTimeout(() => inputRef.current?.focus(), 20);
  }

  function closeDropdown() {
    setOpen(false);
    setQuery("");
  }

  function select(val: string) {
    onChange(val);
    closeDropdown();
  }

  return (
    <div
      ref={rootRef}
      className={cn("relative", className)}
      onBlur={handleRootBlur}
    >
      {/* Trigger */}
      <button
        type="button"
        tabIndex={0}
        onMouseDown={(e) => {
          e.preventDefault(); // prevent blur on rootRef before toggle
          open ? closeDropdown() : openDropdown();
        }}
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

      {/* Dropdown — rendered in a portal-like fixed position to escape overflow clipping */}
      {open && <Dropdown
        inputRef={inputRef}
        query={query}
        onQueryChange={setQuery}
        placeholder={placeholder}
        emptyLabel={emptyLabel}
        filtered={filtered}
        value={value}
        onSelect={select}
        anchorRef={rootRef}
      />}
    </div>
  );
}

// Separate dropdown component to calculate position relative to anchor
function Dropdown({
  inputRef, query, onQueryChange, placeholder, emptyLabel,
  filtered, value, onSelect, anchorRef,
}: {
  inputRef: React.RefObject<HTMLInputElement>;
  query: string;
  onQueryChange: (q: string) => void;
  placeholder: string;
  emptyLabel: string;
  filtered: { value: string; label: string; sub?: string }[];
  value: string;
  onSelect: (v: string) => void;
  anchorRef: React.RefObject<HTMLDivElement>;
}) {
  const [pos, setPos] = useState({ top: 0, left: 0, width: 0 });

  useEffect(() => {
    const rect = anchorRef.current?.getBoundingClientRect();
    if (rect) {
      setPos({ top: rect.bottom + window.scrollY + 4, left: rect.left + window.scrollX, width: rect.width });
    }
  }, [anchorRef]);

  // Render into a fixed-position div via inline style to escape any overflow clipping
  return (
    <div
      style={{ position: "fixed", top: pos.top - window.scrollY, left: pos.left, width: pos.width, zIndex: 9999 }}
      // Prevent this from triggering rootRef's onBlur via relatedTarget leaking
      onMouseDown={(e) => e.preventDefault()}
    >
      <div className="rounded-[var(--radius-sm)] border border-[var(--color-line)] bg-[var(--color-surface)] shadow-[var(--shadow-lg)] overflow-hidden">
        <div className="p-2 border-b border-[var(--color-line)]">
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => onQueryChange(e.target.value)}
            placeholder={placeholder}
            autoComplete="off"
            className="w-full h-7 px-2 text-[12.5px] rounded-[var(--radius-sm)] border border-[var(--color-line)] bg-[var(--color-surface-2)] text-[var(--color-ink)] outline-none placeholder:text-[var(--color-ink-4)]"
          />
        </div>
        <div className="max-h-[220px] overflow-y-auto">
          <button type="button" onMouseDown={(e) => { e.preventDefault(); onSelect(""); }}
            className={cn("w-full text-left px-3 py-2 text-[12.5px] hover:bg-[var(--color-surface-2)] transition-colors",
              !value ? "text-[var(--color-ink)] font-medium" : "text-[var(--color-ink-3)]"
            )}>
            {emptyLabel}
          </button>
          {filtered.length === 0 && (
            <div className="px-3 py-3 text-[12px] text-[var(--color-ink-4)]">Sin resultados</div>
          )}
          {filtered.map((o) => (
            <button key={o.value} type="button" onMouseDown={(e) => { e.preventDefault(); onSelect(o.value); }}
              className={cn("w-full text-left px-3 py-2 text-[12.5px] hover:bg-[var(--color-surface-2)] transition-colors flex items-center gap-2",
                value === o.value ? "bg-[var(--color-mint-50)] text-[var(--color-ink)] font-medium" : "text-[var(--color-ink-2)]"
              )}>
              {o.sub && <span className="font-mono text-[11px] text-[var(--color-ink-4)] w-10 shrink-0">{o.sub}</span>}
              <span className="truncate">{o.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
