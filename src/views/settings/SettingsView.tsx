import { useState } from "react";
import { useDocument, updateDocById } from "@/hooks/useFirestore";
import { LoadingView } from "@/components/ui/Spinner";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/cn";

interface AppSettings {
  theme: "light" | "dark";
  density: "comfortable" | "compact";
  language: string;
  defaultRecruiter: string;
}

export function SettingsView() {
  const { data: settings, loading } = useDocument<AppSettings>("settings", "app");
  const [saving, setSaving]          = useState(false);

  // Local state mirrors Firestore doc
  const [theme, setTheme]     = useState<"light" | "dark">("light");
  const [density, setDensity] = useState<"comfortable" | "compact">("comfortable");

  // Apply theme to document root
  function applyTheme(t: "light" | "dark") {
    setTheme(t);
    document.documentElement.setAttribute("data-theme", t);
  }

  async function handleSave() {
    setSaving(true);
    try {
      await updateDocById("settings", "app", { theme, density });
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <LoadingView />;

  return (
    <div className="p-5 max-w-xl space-y-8">
      <div>
        <h1 className="font-serif text-[22px] font-medium text-[var(--color-ink)]">Configuración</h1>
        <p className="text-[12.5px] text-[var(--color-ink-3)]">Preferencias de interfaz y valores por defecto.</p>
      </div>

      {/* Appearance */}
      <div className="space-y-4">
        <h2 className="text-[13px] font-semibold text-[var(--color-ink)] uppercase tracking-widest">Apariencia</h2>

        <div>
          <label className="text-[12.5px] font-medium text-[var(--color-ink-2)] mb-2 block">Tema</label>
          <div className="flex gap-2">
            {(["light", "dark"] as const).map((t) => (
              <button key={t} onClick={() => applyTheme(t)}
                className={cn("flex-1 py-3 rounded-[var(--radius-sm)] border text-[13px] font-medium transition-colors",
                  theme === t
                    ? "border-green-500 bg-[var(--color-mint-50)] text-green-700"
                    : "border-[var(--color-line)] bg-[var(--color-surface)] text-[var(--color-ink-3)] hover:bg-[var(--color-surface-2)]"
                )}>
                {t === "light" ? "☀️ Claro" : "🌙 Oscuro"}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="text-[12.5px] font-medium text-[var(--color-ink-2)] mb-2 block">Densidad de tabla</label>
          <div className="flex gap-2">
            {(["comfortable", "compact"] as const).map((d) => (
              <button key={d} onClick={() => setDensity(d)}
                className={cn("flex-1 py-3 rounded-[var(--radius-sm)] border text-[13px] font-medium transition-colors",
                  density === d
                    ? "border-green-500 bg-[var(--color-mint-50)] text-green-700"
                    : "border-[var(--color-line)] bg-[var(--color-surface)] text-[var(--color-ink-3)] hover:bg-[var(--color-surface-2)]"
                )}>
                {d === "comfortable" ? "Cómodo (48px)" : "Compacto (36px)"}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Firebase info */}
      <div className="rounded-[var(--radius-sm)] bg-[var(--color-surface-2)] border border-[var(--color-line)] px-4 py-3 text-[12.5px] text-[var(--color-ink-3)] space-y-1">
        <div className="font-medium text-[var(--color-ink-2)] mb-2">Conexión Firebase</div>
        <div>Proyecto: <code className="font-mono text-[var(--color-ink)]">{import.meta.env.VITE_FIREBASE_PROJECT_ID ?? "—"}</code></div>
        <div>Región: <code className="font-mono text-[var(--color-ink)]">{import.meta.env.VITE_FIREBASE_REGION ?? "us-central1"}</code></div>
        <div>Emulador: <code className="font-mono text-[var(--color-ink)]">{import.meta.env.VITE_USE_EMULATOR === "true" ? "Sí" : "No"}</code></div>
      </div>

      <Button variant="primary" onClick={handleSave} disabled={saving}>
        {saving ? "Guardando…" : "Guardar configuración"}
      </Button>
    </div>
  );
}
