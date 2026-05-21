import { createBrowserRouter, Navigate } from "react-router-dom";
import { AppShell } from "@/components/layout/AppShell";
import { HomeView } from "@/views/home/HomeView";
import { CandidatesView } from "@/views/candidates/CandidatesView";
import { DirectoryView } from "@/views/directory/DirectoryView";
import { ExpedientesView } from "@/views/expedientes/ExpedientesView";
import { LocationsView } from "@/views/locations/LocationsView";
import { CatalogView } from "@/views/catalog/CatalogView";
import { TicketsView } from "@/views/tickets/TicketsView";
import { IntegrationsView } from "@/views/integrations/IntegrationsView";
import { AuditView } from "@/views/audit/AuditView";
import { SettingsView } from "@/views/settings/SettingsView";
import { OfferTemplatesView } from "@/views/templates/OfferTemplatesView";
import { ContractTemplatesView } from "@/views/templates/ContractTemplatesView";
import { EmailTemplatesView } from "@/views/templates/EmailTemplatesView";
import { FormConfigView } from "@/views/templates/FormConfigView";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <AppShell />,
    children: [
      { index: true, element: <Navigate to="/candidates" replace /> },
      { path: "home",               element: <HomeView /> },
      { path: "candidates",         element: <CandidatesView /> },
      { path: "expedientes",        element: <ExpedientesView /> },
      { path: "directory",          element: <DirectoryView /> },
      { path: "locations",          element: <LocationsView /> },
      { path: "catalog",            element: <CatalogView /> },
      { path: "tickets",            element: <TicketsView /> },
      { path: "integrations",       element: <IntegrationsView /> },
      { path: "audit",              element: <AuditView /> },
      { path: "settings",           element: <SettingsView /> },
      { path: "offer-templates",    element: <OfferTemplatesView /> },
      { path: "contract-templates", element: <ContractTemplatesView /> },
      { path: "email-templates",    element: <EmailTemplatesView /> },
      { path: "form-config",        element: <FormConfigView /> },
    ],
  },
]);
