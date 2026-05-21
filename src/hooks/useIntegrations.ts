import { useCollection } from "@/hooks/useFirestore";
import type { Integration } from "@/data/types";

export const INTEGRATIONS_PATH = "integrations";

export function useIntegrations() {
  return useCollection<Integration>(INTEGRATIONS_PATH);
}
