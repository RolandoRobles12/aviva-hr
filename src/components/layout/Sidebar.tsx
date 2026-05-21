import { NavLink } from "react-router-dom";
import { cn } from "@/lib/cn";
import {
  Home, UserPlus, Folder, Users, Map, ShoppingBag, Ticket,
  Plug, History, Cog, FileSign, File, Mail, Clipboard,
} from "@/components/icons";

const iconMap: Record<string, React.ReactNode> = {
  home:       <Home size={18} />,
  userPlus:   <UserPlus size={18} />,
  folder:     <Folder size={18} />,
  users:      <Users size={18} />,
  map:        <Map size={18} />,
  shoppingBag:<ShoppingBag size={18} />,
  ticket:     <Ticket size={18} />,
  plug:       <Plug size={18} />,
  history:    <History size={18} />,
  cog:        <Cog size={18} />,
  fileSign:   <FileSign size={18} />,
  file:       <File size={18} />,
  mail:       <Mail size={18} />,
  clipboard:  <Clipboard size={18} />,
};

interface NavItem { id: string; label: string; icon: string }

const NAV: NavItem[] = [
  { id: "home",         label: "Resumen",       icon: "home" },
  { id: "candidates",   label: "Candidatos",    icon: "userPlus" },
  { id: "expedientes",  label: "Expedientes",   icon: "folder" },
  { id: "directory",    label: "Directorio",    icon: "users" },
  { id: "locations",    label: "Locaciones",    icon: "map" },
  { id: "catalog",      label: "Catálogo",      icon: "shoppingBag" },
  { id: "tickets",      label: "Bajas",         icon: "ticket" },
  { id: "integrations", label: "Integraciones", icon: "plug" },
  { id: "audit",        label: "Auditoría",     icon: "history" },
];

const NAV_TEMPLATES: NavItem[] = [
  { id: "offer-templates",    label: "Cartas oferta",    icon: "fileSign" },
  { id: "contract-templates", label: "Contratos",        icon: "file" },
  { id: "email-templates",    label: "Correos",          icon: "mail" },
  { id: "form-config",        label: "Preguntas y docs", icon: "clipboard" },
];

const NAV_BOTTOM: NavItem[] = [
  { id: "settings", label: "Configuración", icon: "cog" },
];

function NavItem({ item }: { item: NavItem }) {
  return (
    <NavLink
      to={`/${item.id}`}
      className={({ isActive }) =>
        cn(
          "flex items-center gap-2.5 px-3 py-2 mx-2 rounded-[var(--radius-sm)] text-[13px] font-medium transition-colors",
          isActive
            ? "bg-white/15 text-white"
            : "text-[#cfeede]/80 hover:bg-white/10 hover:text-white"
        )
      }
    >
      <span className="shrink-0 opacity-80">{iconMap[item.icon]}</span>
      {item.label}
    </NavLink>
  );
}

export function Sidebar() {
  return (
    <nav className="flex flex-col h-full bg-green-700 dark:bg-[#021f17] border-r border-[var(--color-line)] select-none">
      {/* Brand */}
      <div className="flex items-center gap-2.5 px-5 py-[22px]">
        <div className="size-[30px] bg-mint-100 text-green-700 rounded-lg grid place-items-center font-bold font-serif text-lg shrink-0">
          A
        </div>
        <div>
          <div className="text-white font-semibold text-[13.5px] leading-tight">
            Aviva HR
          </div>
          <div className="text-[#cfeede]/60 text-[11px]">People Ops</div>
        </div>
      </div>

      {/* Main nav */}
      <div className="flex flex-col gap-0.5 pb-2">
        {NAV.map((item) => (
          <NavItem key={item.id} item={item} />
        ))}
      </div>

      {/* Templates section */}
      <div className="mt-2 border-t border-white/10 pt-3 pb-2">
        <div className="px-5 pb-1.5 text-[10.5px] font-semibold uppercase tracking-widest text-[#cfeede]/40">
          Plantillas
        </div>
        <div className="flex flex-col gap-0.5">
          {NAV_TEMPLATES.map((item) => (
            <NavItem key={item.id} item={item} />
          ))}
        </div>
      </div>

      {/* Bottom */}
      <div className="mt-auto border-t border-white/10 py-2">
        {NAV_BOTTOM.map((item) => (
          <NavItem key={item.id} item={item} />
        ))}
      </div>
    </nav>
  );
}
