import { useCollection, orderBy } from "@/hooks/useFirestore";
import type { Candidate } from "@/data/types";

export const CANDIDATES_PATH = "candidates";

export function useCandidates() {
  return useCollection<Candidate>(CANDIDATES_PATH, [orderBy("createdAt", "desc")]);
}
