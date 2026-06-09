import {
  collection,
  doc,
  onSnapshot,
  query,
  orderBy,
  where,
  addDoc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
  type QueryConstraint,
  type DocumentData,
} from "firebase/firestore";
import { useEffect, useState, useRef } from "react";
import { db } from "@/lib/firebase";

export type WithId<T> = T & { id: string };

// ── Real-time collection listener ─────────────────────────────────────────

export function useCollection<T extends DocumentData>(
  path: string,
  constraints: QueryConstraint[] = []
) {
  const [data, setData]       = useState<WithId<T>[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState<Error | null>(null);

  // Serialize constraints to a stable key so effect re-runs only when they change
  const constraintKey = constraints.map((c) => JSON.stringify(c)).join("|");

  useEffect(() => {
    setLoading(true);
    const q = constraints.length
      ? query(collection(db, path), ...constraints)
      : query(collection(db, path));

    const unsub = onSnapshot(
      q,
      (snap) => {
        console.log(`[useCollection] ${path}: ${snap.docs.length} docs`);
        setData(snap.docs.map((d) => ({ id: d.id, ...(d.data() as T) })));
        setLoading(false);
        setError(null);
      },
      (err) => {
        console.error(`[useCollection] ${path}:`, err);
        setError(err);
        setLoading(false);
      }
    );
    return unsub;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [path, constraintKey]);

  return { data, loading, error };
}

// ── Real-time document listener ───────────────────────────────────────────

export function useDocument<T extends DocumentData>(path: string, id: string | null) {
  const [data, setData]       = useState<WithId<T> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState<Error | null>(null);

  useEffect(() => {
    if (!id) { setData(null); setLoading(false); return; }
    setLoading(true);
    const ref = doc(db, path, id);
    const unsub = onSnapshot(
      ref,
      (snap) => {
        setData(snap.exists() ? { id: snap.id, ...(snap.data() as T) } : null);
        setLoading(false);
        setError(null);
      },
      (err) => {
        setError(err);
        setLoading(false);
      }
    );
    return unsub;
  }, [path, id]);

  return { data, loading, error };
}

// ── Write helpers ─────────────────────────────────────────────────────────

export async function createDoc<T extends DocumentData>(
  path: string,
  data: T
): Promise<string> {
  const ref = await addDoc(collection(db, path), {
    ...data,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return ref.id;
}

export async function updateDocById<T extends Partial<DocumentData>>(
  path: string,
  id: string,
  data: T
): Promise<void> {
  await updateDoc(doc(db, path, id), {
    ...data,
    updatedAt: serverTimestamp(),
  });
}

export async function deleteDocById(path: string, id: string): Promise<void> {
  await deleteDoc(doc(db, path, id));
}

// Re-export common constraints so callers don't need direct firebase/firestore imports
export { orderBy, where, serverTimestamp };
