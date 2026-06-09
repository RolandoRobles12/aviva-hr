import { useCollection } from "@/hooks/useFirestore";
import type { User } from "@/data/types";

export const USERS_PATH = "users";

export function useUsers() {
  return useCollection<User>(USERS_PATH);
}
