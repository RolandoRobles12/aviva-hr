import { createContext, useContext, useEffect, useState } from "react";
import { useCollection, orderBy } from "@/hooks/useFirestore";
import { LoadingView } from "@/components/ui/Spinner";
import type { Stage, GroupMeta, DocType, Region, Product } from "@/data/types";

interface CatalogState {
  stages:      (Stage   & { id: string })[];
  groupMeta:   Record<string, GroupMeta>;
  docTypes:    (DocType & { id: string })[];
  regions:     (Region  & { id: string })[];
  products:    (Product & { id: string })[];
  estados:     string[];
  stageMeta:   (stageId: string) => (Stage & { id: string }) | undefined;
  regionLabel: (regionId: string) => string;
}

const CatalogContext = createContext<CatalogState | null>(null);

const CATALOG_TIMEOUT_MS = 8_000;

export function CatalogProvider({ children }: { children: React.ReactNode }) {
  const { data: stages,      loading: ls, error: es } = useCollection<Stage>(  "catalog/stages/items",   [orderBy("order")]);
  const { data: docTypes,    loading: ld, error: ed } = useCollection<DocType>( "catalog/docTypes/items", [orderBy("order")]);
  const { data: groupDocs,   loading: lg, error: eg } = useCollection<GroupMeta>("catalog/groupMeta/items");
  const { data: regions,     loading: lr, error: er } = useCollection<Region>(  "catalog/regions/items",  [orderBy("label")]);
  const { data: estadoDocs,  loading: le, error: ee } = useCollection<{ name: string; order: number }>("catalog/estados/items", [orderBy("order")]);
  const { data: products,    loading: lpr             } = useCollection<Product>("catalog/products/items", [orderBy("name")]);

  // Timeout: si Firestore tarda más de 8 s, renderizamos igual (colecciones vacías)
  const [timedOut, setTimedOut] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setTimedOut(true), CATALOG_TIMEOUT_MS);
    return () => clearTimeout(t);
  }, []);

  const stillLoading = ls || ld || lg || lr || le || lpr;
  const anyError = es || ed || eg || er || ee;

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
    regions,
    products: products as (Product & { id: string })[],
    estados,
    stageMeta:   (id) => stages.find((s) => s.id === id),
    regionLabel: (id) => regions.find((r) => r.id === id)?.label ?? id,
  };

  return <CatalogContext.Provider value={value}>{children}</CatalogContext.Provider>;
}

export function useCatalog() {
  const ctx = useContext(CatalogContext);
  if (!ctx) throw new Error("useCatalog must be used inside CatalogProvider");
  return ctx;
}
