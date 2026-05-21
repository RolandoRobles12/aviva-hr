import { createContext, useContext, useEffect, useState } from "react";
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  type User as FirebaseUser,
} from "firebase/auth";
import { collection, getDocs, query, where } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import type { User } from "@/data/types";

interface AuthState {
  firebaseUser: FirebaseUser | null;
  appUser: (User & { id: string }) | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [appUser, setAppUser]           = useState<(User & { id: string }) | null>(null);
  const [loading, setLoading]           = useState(true);

  useEffect(() => {
    return onAuthStateChanged(auth, async (fbUser) => {
      setFirebaseUser(fbUser);
      if (fbUser?.email) {
        const snap = await getDocs(
          query(collection(db, "users"), where("email", "==", fbUser.email))
        );
        setAppUser(
          snap.empty ? null : ({ id: snap.docs[0].id, ...snap.docs[0].data() } as User & { id: string })
        );
      } else {
        setAppUser(null);
      }
      setLoading(false);
    });
  }, []);

  return (
    <AuthContext.Provider value={{
      firebaseUser,
      appUser,
      loading,
      signIn: (email, password) => signInWithEmailAndPassword(auth, email, password).then(),
      signOut: () => firebaseSignOut(auth),
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
