import { RouterProvider } from "react-router-dom";
import { AuthProvider, useAuth } from "@/context/AuthContext";
import { CatalogProvider } from "@/context/CatalogContext";
import { LoginView } from "@/views/auth/LoginView";
import { LoadingView } from "@/components/ui/Spinner";
import { router } from "@/router";

function AppInner() {
  const { firebaseUser, loading } = useAuth();
  if (loading)      return <LoadingView />;
  if (!firebaseUser) return <LoginView />;
  return (
    <CatalogProvider>
      <RouterProvider router={router} />
    </CatalogProvider>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppInner />
    </AuthProvider>
  );
}
