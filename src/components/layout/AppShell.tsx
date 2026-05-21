import { Outlet, useLocation } from "react-router-dom";
import { Sidebar } from "./Sidebar";
import { TopBar } from "./TopBar";

const ROUTE_TITLES: Record<string, { title: string; crumb?: string }> = {
  "/":                    { title: "Resumen" },
  "/home":                { title: "Resumen" },
  "/candidates":          { title: "Candidatos" },
  "/expedientes":         { title: "Expedientes" },
  "/directory":           { title: "Directorio" },
  "/locations":           { title: "Locaciones" },
  "/catalog":             { title: "Catálogo" },
  "/tickets":             { title: "Bajas" },
  "/integrations":        { title: "Integraciones" },
  "/audit":               { title: "Auditoría" },
  "/settings":            { title: "Configuración" },
  "/offer-templates":     { title: "Cartas oferta",    crumb: "Plantillas" },
  "/contract-templates":  { title: "Contratos",        crumb: "Plantillas" },
  "/email-templates":     { title: "Correos",          crumb: "Plantillas" },
  "/form-config":         { title: "Preguntas y docs", crumb: "Plantillas" },
};

export function AppShell() {
  const { pathname } = useLocation();
  const meta = ROUTE_TITLES[pathname] ?? { title: "Aviva HR" };

  return (
    <div className="grid h-screen overflow-hidden" style={{ gridTemplateColumns: "248px 1fr" }}>
      <Sidebar />
      <div className="flex flex-col overflow-hidden bg-[var(--color-bg)]">
        <TopBar title={meta.title} crumb={meta.crumb} />
        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
