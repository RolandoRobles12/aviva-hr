import { Bell, Search, Help } from "@/components/icons";
import { Avatar } from "@/components/ui/Avatar";
import { users } from "@/data/mock";

const currentUser = users[1]; // Paula Acevedo

interface TopBarProps {
  title: string;
  crumb?: string;
}

export function TopBar({ title, crumb }: TopBarProps) {
  return (
    <header className="flex items-center gap-3 px-5 h-14 border-b border-[var(--color-line)] bg-[var(--color-surface)] shrink-0">
      {/* Breadcrumb + title */}
      <div className="flex items-center gap-1.5 text-[13px] min-w-0">
        {crumb && (
          <>
            <span className="text-[var(--color-ink-3)]">{crumb}</span>
            <span className="text-[var(--color-line-strong)]">/</span>
          </>
        )}
        <span className="font-semibold text-[var(--color-ink)] truncate">
          {title}
        </span>
      </div>

      {/* Search */}
      <div className="flex-1 max-w-xs ml-4">
        <div className="flex items-center gap-2 h-8 px-3 rounded-[var(--radius-sm)] bg-[var(--color-surface-2)] border border-[var(--color-line)] text-[var(--color-ink-3)]">
          <Search size={13} className="shrink-0" />
          <input
            type="search"
            placeholder="Buscar…"
            className="flex-1 bg-transparent text-[13px] text-[var(--color-ink)] placeholder:text-[var(--color-ink-4)] outline-none min-w-0"
          />
        </div>
      </div>

      {/* Actions */}
      <div className="ml-auto flex items-center gap-1">
        <button className="p-2 rounded-md text-[var(--color-ink-3)] hover:bg-[var(--color-surface-2)] hover:text-[var(--color-ink)] transition-colors relative">
          <Bell size={16} />
          <span className="absolute top-1.5 right-1.5 size-1.5 rounded-full bg-green-500" />
        </button>
        <button className="p-2 rounded-md text-[var(--color-ink-3)] hover:bg-[var(--color-surface-2)] hover:text-[var(--color-ink)] transition-colors">
          <Help size={16} />
        </button>
        <button className="ml-1 flex items-center gap-2 px-2 py-1 rounded-md hover:bg-[var(--color-surface-2)] transition-colors">
          <Avatar user={currentUser} size="sm" />
          <span className="text-[12.5px] font-medium text-[var(--color-ink-2)]">
            {currentUser.first}
          </span>
        </button>
      </div>
    </header>
  );
}
