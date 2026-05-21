import { createContext, useContext } from "react";
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

export function CatalogProvider({ children }: { children: React.ReactNode }) {
  const { data: stages,      loading: ls } = useCollection<Stage>(  "catalog/stages/items",   [orderBy("order")]);
  const { data: docTypes,    loading: ld } = useCollection<DocType>( "catalog/docTypes/items", [orderBy("order")]);
  const { data: groupDocs,   loading: lg } = useCollection<GroupMeta>("catalog/groupMeta/items");
  const { data: hubs,        loading: lh } = useCollection<Hub>(     "catalog/hubs/items",     [orderBy("label")]);
  const { data: estadoDocs,  loading: le } = useCollection<{ name: string; order: number }>("catalog/estados/items", [orderBy("order")]);

  if (ls || ld || lg || lh || le) return <LoadingView />;

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
