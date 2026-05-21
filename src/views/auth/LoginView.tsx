import { useState } from "react";
import { useAuth } from "@/context/AuthContext";

export function LoginView() {
  const { signInWithGoogle } = useAuth();
  const [error, setError]   = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleGoogle() {
    setError(null);
    setLoading(true);
    try {
      await signInWithGoogle();
    } catch {
      setError("No se pudo iniciar sesión. Intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[var(--color-bg)] grid place-items-center px-4">
      <div className="w-full max-w-[360px]">
        {/* Logo */}
        <div className="mb-8 text-center">
          <div className="inline-flex size-12 rounded-xl bg-green-700 items-center justify-center mb-4">
            <span className="text-white font-bold text-lg font-serif">A</span>
          </div>
          <h1 className="font-serif text-[22px] font-medium text-[var(--color-ink)]">Aviva HR</h1>
          <p className="text-[12.5px] text-[var(--color-ink-3)] mt-1">People Ops · Aviva Crédito</p>
        </div>

        {/* Card */}
        <div className="rounded-[var(--radius)] bg-[var(--color-surface)] border border-[var(--color-line)] shadow-[var(--shadow-sm)] p-6 flex flex-col items-center gap-4">
          <p className="text-[13px] text-[var(--color-ink-2)] text-center">
            Inicia sesión con tu cuenta corporativa de Google.
          </p>

          <button
            onClick={handleGoogle}
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 h-10 px-4 rounded-[var(--radius-sm)] border border-[var(--color-line)] bg-[var(--color-surface)] hover:bg-[var(--color-surface-2)] transition-colors text-[13.5px] font-medium text-[var(--color-ink)] disabled:opacity-60"
          >
            {/* Google "G" logo */}
            <svg width="18" height="18" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
              <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
              <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
              <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
              <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.18 1.48-4.97 2.31-8.16 2.31-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
            </svg>
            {loading ? "Abriendo sesión…" : "Continuar con Google"}
          </button>

          {error && (
            <p className="text-[12px] text-[var(--color-danger-fg)] bg-[var(--color-danger-bg)] w-full px-3 py-2 rounded-[var(--radius-sm)] text-center">
              {error}
            </p>
          )}
        </div>

        <p className="text-center text-[11.5px] text-[var(--color-ink-4)] mt-4">
          Acceso restringido a personal autorizado.
        </p>
      </div>
    </div>
  );
}
