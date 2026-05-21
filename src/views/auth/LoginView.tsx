import { useState } from "react";
import { useAuth } from "@/context/AuthContext";

export function LoginView() {
  const { signIn } = useAuth();
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [error, setError]       = useState<string | null>(null);
  const [loading, setLoading]   = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await signIn(email, password);
    } catch {
      setError("Correo o contraseña incorrectos.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[var(--color-bg)] grid place-items-center px-4">
      <div className="w-full max-w-[360px]">
        {/* Logo / wordmark */}
        <div className="mb-8 text-center">
          <div className="inline-flex size-12 rounded-xl bg-green-700 items-center justify-center mb-4">
            <span className="text-white font-bold text-lg font-serif">A</span>
          </div>
          <h1 className="font-serif text-[22px] font-medium text-[var(--color-ink)]">Aviva HR</h1>
          <p className="text-[12.5px] text-[var(--color-ink-3)] mt-1">People Ops · Aviva Crédito</p>
        </div>

        {/* Card */}
        <div className="rounded-[var(--radius)] bg-[var(--color-surface)] border border-[var(--color-line)] shadow-[var(--shadow-sm)] p-6">
          <h2 className="text-[15px] font-semibold text-[var(--color-ink)] mb-5">Iniciar sesión</h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-[11px] text-[var(--color-ink-4)] mb-1 block">Correo corporativo</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                placeholder="nombre@avivacredito.com"
                className="w-full h-9 px-3 text-[13px] rounded-[var(--radius-sm)] border border-[var(--color-line)] bg-[var(--color-surface-2)] text-[var(--color-ink)] outline-none focus:border-green-500 placeholder:text-[var(--color-ink-4)]"
              />
            </div>
            <div>
              <label className="text-[11px] text-[var(--color-ink-4)] mb-1 block">Contraseña</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
                placeholder="••••••••"
                className="w-full h-9 px-3 text-[13px] rounded-[var(--radius-sm)] border border-[var(--color-line)] bg-[var(--color-surface-2)] text-[var(--color-ink)] outline-none focus:border-green-500 placeholder:text-[var(--color-ink-4)]"
              />
            </div>

            {error && (
              <p className="text-[12px] text-[var(--color-danger-fg)] bg-[var(--color-danger-bg)] px-3 py-2 rounded-[var(--radius-sm)]">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full h-9 rounded-[var(--radius-sm)] bg-green-700 text-white text-[13px] font-semibold hover:bg-green-800 transition-colors disabled:opacity-60 mt-1"
            >
              {loading ? "Ingresando…" : "Ingresar"}
            </button>
          </form>
        </div>

        <p className="text-center text-[11.5px] text-[var(--color-ink-4)] mt-4">
          Acceso restringido a personal autorizado.
        </p>
      </div>
    </div>
  );
}
