import { createContext, useContext, useEffect, useState } from "react";
import { useCollection, orderBy } from "@/hooks/useFirestore";
import { LoadingView } from "@/components/ui/Spinner";
import type { Stage, GroupMeta, DocType, Hub } from "@/data/types";

interface CatalogState {
  stages:    (Stage   & { id: string })[];
  groupMeta: Record<string, GroupMeta>;
  docTypes:  (DocType & { id: string })[];
  hubs:      (Hub     & { id: string })[];
  estados:   string[];
  stageMeta: (stageId: string) => (Stage & { id: string }) | undefined;
  hubLabel:  (hubId: string)   => string;
}

const CatalogContext = createContext<CatalogState | null>(null);

const CATALOG_TIMEOUT_MS = 8_000;

export function CatalogProvider({ children }: { children: React.ReactNode }) {
  const { data: stages,      loading: ls, error: es } = useCollection<Stage>(  "catalog/stages/items",   [orderBy("order")]);
  const { data: docTypes,    loading: ld, error: ed } = useCollection<DocType>( "catalog/docTypes/items", [orderBy("order")]);
  const { data: groupDocs,   loading: lg, error: eg } = useCollection<GroupMeta>("catalog/groupMeta/items");
  const { data: hubs,        loading: lh, error: eh } = useCollection<Hub>(     "catalog/hubs/items",     [orderBy("label")]);
  const { data: estadoDocs,  loading: le, error: ee } = useCollection<{ name: string; order: number }>("catalog/estados/items", [orderBy("order")]);

  // Timeout: si Firestore tarda más de 8 s, renderizamos igual (colecciones vacías)
  const [timedOut, setTimedOut] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setTimedOut(true), CATALOG_TIMEOUT_MS);
    return () => clearTimeout(t);
  }, []);

  const stillLoading = ls || ld || lg || lh || le;
  const anyError = es || ed || eg || eh || ee;

  if (stillLoading && !timedOut && !anyError) return <LoadingView />;

  const groupMeta = groupDocs.reduce<Record<string, GroupMeta>>((acc, g) => {
    acc[g.id] = { label: g.label, color: g.color, bg: g.bg };
    return acc;
  }, {});

  const estados = estadoDocs.map((e) => e.name);

  const value: CatalogState = {
    stages,
    groupMeta,
    docTypes,
    hubs,
    estados,
    stageMeta: (id) => stages.find((s) => s.id === id),
    hubLabel:  (id) => hubs.find((h) => h.id === id)?.label ?? id,
  };

  return <CatalogContext.Provider value={value}>{children}</CatalogContext.Provider>;
}

export function useCatalog() {
  const ctx = useContext(CatalogContext);
  if (!ctx) throw new Error("useCatalog must be used inside CatalogProvider");
  return ctx;
}
