import { useCollection, orderBy } from "@/hooks/useFirestore";

export interface Location {
  id?: string;
  code: string;
  ciudad: string;
  estado: string;
  direccion: string;
  categoria: string;
  catLabel: string;
  catShort: string;
  catColor: string;
  catBg: string;
  gerente: string;
  hub: string;
  status: "open" | "vacant" | "closed";
  fechaApertura: string;
  ubicacion?: string;
  determinante?: string;
  producto?: string;
  lat?: number;
  lng?: number;
  kit?: Record<string, "ok" | "missing" | "n/a">;
}

export const LOCATIONS_PATH = "locations";

export function useLocations() {
  return useCollection<Location>(LOCATIONS_PATH, [orderBy("fechaApertura", "desc")]);
}
