import { createBrowserRouter, Navigate } from "react-router-dom";
import { AppShell } from "@/components/layout/AppShell";
import { CandidatesView } from "@/views/candidates/CandidatesView";
import { HomeView } from "@/views/home/HomeView";
import { DirectoryView } from "@/views/directory/DirectoryView";
import { PlaceholderView } from "@/views/PlaceholderView";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <AppShell />,
    children: [
      { index: true, element: <Navigate to="/candidates" replace /> },
      { path: "home",               element: <HomeView /> },
      { path: "candidates",         element: <CandidatesView /> },
      { path: "expedientes",        element: <PlaceholderView name="Expedientes" /> },
      { path: "directory",          element: <DirectoryView /> },
      { path: "locations",          element: <PlaceholderView name="Locaciones" /> },
      { path: "catalog",            element: <PlaceholderView name="Catálogo" /> },
      { path: "tickets",            element: <PlaceholderView name="Bajas" /> },
      { path: "integrations",       element: <PlaceholderView name="Integraciones" /> },
      { path: "audit",              element: <PlaceholderView name="Auditoría" /> },
      { path: "settings",           element: <PlaceholderView name="Configuración" /> },
      { path: "offer-templates",    element: <PlaceholderView name="Cartas oferta" /> },
      { path: "contract-templates", element: <PlaceholderView name="Contratos" /> },
      { path: "email-templates",    element: <PlaceholderView name="Correos" /> },
      { path: "form-config",        element: <PlaceholderView name="Preguntas y docs" /> },
    ],
  },
]);
