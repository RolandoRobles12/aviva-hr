import { useState, useEffect } from "react";
import { useDocument, useCollection, updateDocById, createDoc, deleteDocById, orderBy } from "@/hooks/useFirestore";
import { useNotif } from "@/context/NotifContext";
import { Button } from "@/components/ui/Button";
import {
  Cog, Bell, Mail, History, Shield, User, Link, Check, Plus, Close, Copy, Refresh,
} from "@/components/icons";
import { cn } from "@/lib/cn";
import { APIDocsPanel } from "./APIDocsPanel";

// ── Tab definitions ─────────────────────────────────────────────────────────
const TABS = [
  { id: "general",       label: "General",             icon: <Cog size={14} /> },
  { id: "notifications", label: "Notificaciones",      icon: <Bell size={14} /> },
  { id: "gmail",         label: "Conexión Gmail",       icon: <Mail size={14} /> },
  { id: "reminders",     label: "Recordatorios",        icon: <Bell size={14} /> },
  { id: "link-duration", label: "Duración de enlaces",  icon: <History size={14} /> },
  { id: "branding",      label: "Marca",                icon: <User size={14} /> },
  { id: "roles",         label: "Roles y permisos",     icon: <Shield size={14} /> },
  { id: "approvals",     label: "Aprobaciones",         icon: <Check size={14} /> },
  { id: "retention",     label: "Retención de datos",   icon: <History size={14} /> },
  { id: "webhooks",      label: "Webhooks y API",       icon: <Link size={14} /> },
] as const;

type TabId = (typeof TABS)[number]["id"];

// ── Shared section wrapper ───────────────────────────────────────────────────
function Section({ title, sub, action, children }: { title: string; sub?: string; action?: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="rounded-[var(--radius)] border border-[var(--color-line)] bg-[var(--color-surface)] overflow-hidden mb-5">
      <div className="flex items-start justify-between px-5 py-4 border-b border-[var(--color-line)]">
        <div>
          <h3 className="font-semibold text-[14px] text-[var(--color-ink)]">{title}</h3>
          {sub && <p className="text-[12px] text-[var(--color-ink-3)] mt-0.5">{sub}</p>}
        </div>
        {action}
      </div>
      <div className="p-5">{children}</div>
    </div>
  );
}

function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={cn("relative inline-flex h-5 w-9 rounded-full transition-colors shrink-0",
        checked ? "bg-green-500" : "bg-[var(--color-line-strong)]"
      )}
    >
      <span className={cn("absolute top-0.5 left-0.5 size-4 rounded-full bg-white shadow transition-transform",
        checked ? "translate-x-4" : "translate-x-0"
      )} />
    </button>
  );
}

// ── General ──────────────────────────────────────────────────────────────────
function SettingsGeneral() {
  const { data: wsData } = useDocument<{ name: string; domain: string; timezone: string }>("settings", "workspace");
  const { data: appData } = useDocument<{ theme: string; density: string }>("settings", "app");
  const [name,     setName]    = useState("");
  const [timezone, setTimezone] = useState("");
  const [theme,    setTheme]   = useState<"light" | "dark">("light");
  const [density,  setDensity] = useState<"comfortable" | "compact">("comfortable");
  const [saving,   setSaving]  = useState(false);

  useEffect(() => {
    if (wsData) {
      setName(wsData.name);
      setTimezone(wsData.timezone);
    }
  }, [wsData]);

  useEffect(() => {
    if (appData) {
      setTheme((appData.theme as "light" | "dark") ?? "light");
      setDensity((appData.density as "comfortable" | "compact") ?? "comfortable");
    }
  }, [appData]);

  async function save() {
    setSaving(true);
    try {
      await updateDocById("settings", "workspace", { name, timezone });
      await updateDocById("settings", "app", { theme, density });
      document.documentElement.setAttribute("data-theme", theme);
    } finally { setSaving(false); }
  }

  return (
    <>
      <Section title="Workspace" sub="Información básica del workspace.">
        <div className="grid grid-cols-[140px_1fr] gap-y-3 gap-x-4 text-[13px]">
          <span className="text-[var(--color-ink-3)] self-center">Nombre</span>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="h-8 px-3 rounded-[var(--radius-sm)] border border-[var(--color-line)] bg-[var(--color-surface)] text-[var(--color-ink)] outline-none text-[13px]"
          />
          <span className="text-[var(--color-ink-3)] self-center">Dominio corporativo</span>
          <span className="font-mono text-[12px] px-2 py-0.5 rounded bg-[var(--color-surface-2)] border border-[var(--color-line)] w-fit">
            {wsData?.domain ?? "—"}
          </span>
          <span className="text-[var(--color-ink-3)] self-center">Zona horaria</span>
          <span className="text-[var(--color-ink-2)]">{timezone || "—"}</span>
        </div>
      </Section>

      <Section title="Apariencia" sub="Tema e interfaz.">
        <div className="space-y-4">
          <div>
            <label className="text-[12.5px] font-medium text-[var(--color-ink-2)] mb-2 block">Tema</label>
            <div className="flex gap-2 max-w-xs">
              {(["light", "dark"] as const).map((t) => (
                <button key={t} onClick={() => setTheme(t)} className={cn("flex-1 py-2.5 rounded-[var(--radius-sm)] border text-[13px] font-medium transition-colors",
                  theme === t ? "border-green-500 bg-[var(--color-mint-50)] text-green-700" : "border-[var(--color-line)] bg-[var(--color-surface)] text-[var(--color-ink-3)] hover:bg-[var(--color-surface-2)]"
                )}>
                  {t === "light" ? "☀️ Claro" : "🌙 Oscuro"}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="text-[12.5px] font-medium text-[var(--color-ink-2)] mb-2 block">Densidad de tabla</label>
            <div className="flex gap-2 max-w-xs">
              {(["comfortable", "compact"] as const).map((d) => (
                <button key={d} onClick={() => setDensity(d)} className={cn("flex-1 py-2.5 rounded-[var(--radius-sm)] border text-[13px] font-medium transition-colors",
                  density === d ? "border-green-500 bg-[var(--color-mint-50)] text-green-700" : "border-[var(--color-line)] bg-[var(--color-surface)] text-[var(--color-ink-3)] hover:bg-[var(--color-surface-2)]"
                )}>
                  {d === "comfortable" ? "Cómodo" : "Compacto"}
                </button>
              ))}
            </div>
          </div>
          <Button variant="primary" onClick={save} disabled={saving}>{saving ? "Guardando…" : "Guardar"}</Button>
        </div>
      </Section>

      <Section title="Conexión Firebase" sub="Entorno de despliegue.">
        <div className="grid grid-cols-[140px_1fr] gap-y-2 text-[12.5px]">
          <span className="text-[var(--color-ink-3)]">Proyecto</span>
          <code className="font-mono text-[var(--color-ink)]">{import.meta.env.VITE_FIREBASE_PROJECT_ID ?? "—"}</code>
          <span className="text-[var(--color-ink-3)]">Región</span>
          <code className="font-mono text-[var(--color-ink)]">{import.meta.env.VITE_FIREBASE_REGION ?? "us-central1"}</code>
          <span className="text-[var(--color-ink-3)]">Emulador</span>
          <code className="font-mono text-[var(--color-ink)]">{import.meta.env.VITE_USE_EMULATOR === "true" ? "Sí" : "No"}</code>
        </div>
      </Section>
    </>
  );
}

// ── Notifications ────────────────────────────────────────────────────────────
interface NotifRule { id: string; label: string; channel: string; slack: boolean; email: boolean }
interface NotifRulesDoc {
  slackEnabled: boolean; emailEnabled: boolean; rules: NotifRule[];
  slackWorkspace: string; slackMeta: string;
  emailAddress: string; emailMeta: string;
}

function AlertRuleRow({
  rule,
  onToggle,
}: {
  rule: NotifRule;
  onToggle: (field: "slack" | "email", val: boolean) => void;
}) {
  return (
    <div className="flex items-center gap-4 px-5 py-3.5 border-b border-[var(--color-line)] last:border-0">
      <div className="flex-1">
        <div className="font-medium text-[13.5px] text-[var(--color-ink)]">{rule.label}</div>
        <span className="inline-block mt-1.5 text-[11px] font-mono bg-[var(--color-surface-2)] border border-[var(--color-line)] text-[var(--color-ink-3)] px-1.5 py-0.5 rounded">
          {rule.channel}
        </span>
      </div>
      <div className="flex flex-col items-center gap-1 w-16">
        <span className="text-[10px] text-[var(--color-ink-4)] uppercase tracking-wide">Slack</span>
        <Toggle checked={rule.slack} onChange={(v) => onToggle("slack", v)} />
      </div>
      <div className="flex flex-col items-center gap-1 w-16">
        <span className="text-[10px] text-[var(--color-ink-4)] uppercase tracking-wide">Email</span>
        <Toggle checked={rule.email} onChange={(v) => onToggle("email", v)} />
      </div>
    </div>
  );
}

function SettingsNotifications() {
  const { notify } = useNotif();
  const { data } = useDocument<NotifRulesDoc>("settings", "notifRules");
  const slackOn = data?.slackEnabled ?? true;
  const emailOn = data?.emailEnabled ?? true;
  const rules   = data?.rules ?? [];

  function setSlackOn(v: boolean) {
    updateDocById("settings", "notifRules", { slackEnabled: v });
  }
  function setEmailOn(v: boolean) {
    updateDocById("settings", "notifRules", { emailEnabled: v });
  }

  function handleRuleToggle(ruleId: string, field: "slack" | "email", val: boolean) {
    if (!data?.rules) return;
    const updated = data.rules.map((r) =>
      r.id === ruleId ? { ...r, [field]: val } : r
    );
    updateDocById("settings", "notifRules", { rules: updated });
  }

  return (
    <>
      <Section title="Canales conectados" sub="Aviva HR envía alertas cuando ocurren eventos de personas." action={
        <Button size="sm" variant="secondary" icon={<Plus size={13} />}
          onClick={() => notify({ title: "Próximamente", body: "La integración con Slack/Email requiere configuración del backend.", kind: "info" })}>
          Conectar canal
        </Button>
      }>
        <div className="grid grid-cols-2 gap-3">
          {[
            { icon: "#", iconColor: "#611f69", iconBg: "#611f6914", name: "Slack", workspace: data?.slackWorkspace ?? "—", meta: data?.slackMeta ?? "Sin configurar", checked: slackOn, onChange: setSlackOn },
            { icon: "@", iconColor: "#1b3f8a", iconBg: "#1b3f8a14", name: "Email", workspace: data?.emailAddress   ?? "—", meta: data?.emailMeta ?? "Sin configurar", checked: emailOn, onChange: setEmailOn },
          ].map((ch) => (
            <div key={ch.name} className="flex items-start gap-3 p-4 rounded-[var(--radius-sm)] border border-[var(--color-line)]">
              <div className="size-10 rounded-lg grid place-items-center font-bold text-[16px] shrink-0" style={{ background: ch.iconBg, color: ch.iconColor }}>{ch.icon}</div>
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-[13px] text-[var(--color-ink)]">{ch.name}</div>
                <div className="text-[12px] text-[var(--color-ink-3)]">{ch.workspace}</div>
                <div className="text-[11.5px] text-[var(--color-ink-4)] mt-0.5">{ch.meta}</div>
              </div>
              <Toggle checked={ch.checked} onChange={ch.onChange} />
            </div>
          ))}
        </div>
      </Section>

      <Section title="Reglas de alertas" sub="Qué eventos disparan una notificación y a qué canal.">
        <div className="-m-5 mt-0">
          {rules.map((rule) => (
            <AlertRuleRow
              key={rule.id}
              rule={rule}
              onToggle={(field, val) => handleRuleToggle(rule.id, field, val)}
            />
          ))}
          {rules.length === 0 && (
            <div className="px-5 py-8 text-center text-[13px] text-[var(--color-ink-4)]">Cargando reglas…</div>
          )}
        </div>
      </Section>

    </>
  );
}

// ── Gmail ─────────────────────────────────────────────────────────────────────
interface GmailSettings { connected: boolean; email: string; sentCount: number; deliveryRate: number; bounces: number }

function SettingsGmail() {
  const { notify } = useNotif();
  const { data } = useDocument<GmailSettings>("settings", "gmail");
  const connected = data?.connected ?? false;
  const email     = data?.email     ?? "";

  function handleDisconnect() {
    updateDocById("settings", "gmail", { connected: false, email: "" });
  }

  function handleOAuth() {
    notify({ title: "Configuración OAuth", body: "Configura el backend OAuth en Firebase Functions para conectar Gmail.", kind: "info" });
  }

  return (
    <Section title="Conexión con Gmail" sub="Aviva HR envía invitaciones y recordatorios desde tu cuenta de Google Workspace.">
      <div className={cn("flex items-center gap-4 p-4 rounded-[var(--radius-sm)] border mb-5",
        connected ? "border-green-200 bg-[var(--color-mint-50)]" : "border-[var(--color-line)] bg-[var(--color-surface-2)]"
      )}>
        <div className="size-10 rounded-lg bg-white border border-[var(--color-line)] grid place-items-center shrink-0">
          <Mail size={18} className="text-[#EA4335]" />
        </div>
        <div className="flex-1">
          <div className="font-semibold text-[13.5px] text-[var(--color-ink)]">{connected ? "Conectado" : "Sin conexión"}</div>
          <div className="text-[12px] text-[var(--color-ink-3)]">{connected ? email : "No se ha autorizado ninguna cuenta."}</div>
        </div>
        {connected ? (
          <div className="flex gap-2">
            <Button size="sm" variant="secondary" icon={<Refresh size={12} />} onClick={handleOAuth}>Re-autorizar</Button>
            <Button size="sm" variant="danger" onClick={handleDisconnect}>Desconectar</Button>
          </div>
        ) : (
          <Button size="sm" variant="primary" icon={<Mail size={13} />} onClick={handleOAuth}>Conectar Gmail</Button>
        )}
      </div>

      {connected && (
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: "Correos enviados (30d)", value: data?.sentCount  ?? "—" },
            { label: "Tasa de entrega",        value: data?.deliveryRate != null ? `${data.deliveryRate}%` : "—" },
            { label: "Rebotes",                value: data?.bounces     ?? "—" },
          ].map((s) => (
            <div key={s.label} className="px-4 py-3 rounded-[var(--radius-sm)] border border-[var(--color-line)] bg-[var(--color-surface-2)]">
              <div className="text-[11px] text-[var(--color-ink-4)] mb-1">{s.label}</div>
              <div className="text-[20px] font-bold font-mono text-[var(--color-green-700)]">{s.value}</div>
            </div>
          ))}
        </div>
      )}
    </Section>
  );
}

// ── Reminders ─────────────────────────────────────────────────────────────────
interface RemindersSettings { enabled: boolean; intervalHours: number; maxReminders: number }

function SettingsReminders() {
  const { data } = useDocument<RemindersSettings>("settings", "reminders");
  const [enabled,       setEnabled]       = useState(true);
  const [intervalHours, setIntervalHours] = useState(48);
  const [maxReminders,  setMaxReminders]  = useState(3);
  const [saving,        setSaving]        = useState(false);

  useEffect(() => {
    if (data) {
      setEnabled(data.enabled ?? true);
      setIntervalHours(data.intervalHours ?? 48);
      setMaxReminders(data.maxReminders ?? 3);
    }
  }, [data]);

  async function save() {
    setSaving(true);
    try { await updateDocById("settings", "reminders", { enabled, intervalHours, maxReminders }); }
    finally { setSaving(false); }
  }

  return (
    <Section title="Recordatorios automáticos" sub="Aviva HR re-envía el link de onboarding si la persona no ha completado su expediente.">
      <div className="space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <div className="font-medium text-[13.5px] text-[var(--color-ink)]">Recordatorios habilitados</div>
            <div className="text-[12px] text-[var(--color-ink-3)]">Enviar recordatorios automáticos a personas con documentación pendiente.</div>
          </div>
          <Toggle checked={enabled} onChange={setEnabled} />
        </div>

        <div className={cn("grid grid-cols-2 gap-4 transition-opacity", !enabled && "opacity-40 pointer-events-none")}>
          <div>
            <label className="text-[12.5px] font-medium text-[var(--color-ink-2)] mb-1.5 block">Intervalo entre recordatorios (horas)</label>
            <input
              type="number"
              min={1}
              value={intervalHours}
              onChange={(e) => setIntervalHours(Number(e.target.value))}
              className="h-9 w-full px-3 rounded-[var(--radius-sm)] border border-[var(--color-line)] bg-[var(--color-surface)] text-[var(--color-ink)] text-[13px] outline-none"
            />
            <p className="text-[11.5px] text-[var(--color-ink-4)] mt-1">Ej. 48 = cada 2 días.</p>
          </div>
          <div>
            <label className="text-[12.5px] font-medium text-[var(--color-ink-2)] mb-1.5 block">Máximo de recordatorios por persona</label>
            <input
              type="number"
              min={1}
              value={maxReminders}
              onChange={(e) => setMaxReminders(Number(e.target.value))}
              className="h-9 w-full px-3 rounded-[var(--radius-sm)] border border-[var(--color-line)] bg-[var(--color-surface)] text-[var(--color-ink)] text-[13px] outline-none"
            />
            <p className="text-[11.5px] text-[var(--color-ink-4)] mt-1">Después se notifica a HR manualmente.</p>
          </div>
        </div>

        <Button variant="primary" onClick={save} disabled={saving}>{saving ? "Guardando…" : "Guardar"}</Button>
      </div>
    </Section>
  );
}

// ── Link Duration ─────────────────────────────────────────────────────────────
interface LinkDurationSettings { formDays: number; offerDays: number; contractDays: number }

function SettingsLinkDuration() {
  const { data } = useDocument<LinkDurationSettings>("settings", "linkDuration");
  const [formDays,     setFormDays]     = useState(7);
  const [offerDays,    setOfferDays]    = useState(5);
  const [contractDays, setContractDays] = useState(3);
  const [saving,       setSaving]       = useState(false);

  useEffect(() => {
    if (data) {
      setFormDays(data.formDays ?? 7);
      setOfferDays(data.offerDays ?? 5);
      setContractDays(data.contractDays ?? 3);
    }
  }, [data]);

  async function save() {
    setSaving(true);
    try { await updateDocById("settings", "linkDuration", { formDays, offerDays, contractDays }); }
    finally { setSaving(false); }
  }

  return (
    <Section title="Duración de enlaces" sub="Tiempo antes de que los links enviados a candidatos y nuevos ingresos expiren.">
      <div className="space-y-4">
        {[
          { label: "Formulario de datos (onboarding)", desc: "Link para que la persona complete su expediente.", value: formDays,     onChange: setFormDays },
          { label: "Carta oferta",                     desc: "Link de firma electrónica para la oferta.",       value: offerDays,    onChange: setOfferDays },
          { label: "Contrato",                          desc: "Link de firma electrónica para el contrato.",    value: contractDays, onChange: setContractDays },
        ].map((row) => (
          <div key={row.label} className="flex items-center gap-4">
            <div className="flex-1">
              <div className="font-medium text-[13.5px] text-[var(--color-ink)]">{row.label}</div>
              <div className="text-[12px] text-[var(--color-ink-3)]">{row.desc}</div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <input
                type="number"
                min={1}
                value={row.value}
                onChange={(e) => row.onChange(Number(e.target.value))}
                className="h-9 w-16 px-3 text-center rounded-[var(--radius-sm)] border border-[var(--color-line)] bg-[var(--color-surface)] text-[var(--color-ink)] text-[13px] outline-none"
              />
              <span className="text-[13px] text-[var(--color-ink-3)]">días</span>
            </div>
          </div>
        ))}
        <Button variant="primary" onClick={save} disabled={saving}>{saving ? "Guardando…" : "Guardar"}</Button>
      </div>
    </Section>
  );
}

// ── Branding ──────────────────────────────────────────────────────────────────
function SettingsBranding() {
  const { notify } = useNotif();
  const { data } = useDocument<{ palette: Array<{ color: string; label: string }> }>("settings", "branding");
  const { data: wsData } = useDocument<{ name: string }>("settings", "general");
  const palette = data?.palette ?? [];

  return (
    <Section title="Marca" sub="Logo y colores de los emails y la app.">
      <div className="flex items-center gap-4 mb-6">
        <div className="size-16 rounded-xl bg-[var(--color-mint-50)] text-green-700 grid place-items-center font-bold text-[22px] font-serif shrink-0">A</div>
        <div>
          <div className="font-semibold text-[var(--color-ink)]">{wsData?.name ?? "—"}</div>
          <div className="text-[12px] text-[var(--color-ink-3)]">Logo cuadrado · 256×256 px</div>
          <div className="flex gap-2 mt-2">
            <Button size="sm" variant="secondary" onClick={() => notify({ title: "Próximamente", body: "La carga de logo se habilitará con Firebase Storage.", kind: "info" })}>Cambiar</Button>
            <Button size="sm" variant="ghost">Eliminar</Button>
          </div>
        </div>
      </div>

      <div className="border-t border-[var(--color-line)] pt-5">
        <div className="font-semibold text-[13px] text-[var(--color-ink)] mb-3">Paleta de marca</div>
        <div className="flex gap-4">
          {palette.length === 0 && (
            <div className="text-[13px] text-[var(--color-ink-4)]">Cargando paleta…</div>
          )}
          {palette.map(({ color, label }) => (
            <div key={color} className="flex flex-col items-center gap-1.5">
              <div className="size-14 rounded-xl border border-[var(--color-line)]" style={{ background: color }} />
              <div className="text-[12px] font-medium text-[var(--color-ink)]">{label}</div>
              <code className="text-[11px] text-[var(--color-ink-4)]">{color}</code>
            </div>
          ))}
        </div>
      </div>
    </Section>
  );
}

// ── Roles & Permissions ───────────────────────────────────────────────────────
interface RoleDoc { id: string; name: string; desc: string; color: string; members: number }

const PRESET_COLORS = ["#16b877", "#1b3f8a", "#5c2e8e", "#026149", "#a8200d", "#8a5a00"];

function RoleModal({
  role,
  onSave,
  onClose,
}: {
  role: Partial<RoleDoc> | null;
  onSave: (data: { name: string; desc: string; color: string }) => void;
  onClose: () => void;
}) {
  const [name,  setName]  = useState(role?.name  ?? "");
  const [desc,  setDesc]  = useState(role?.desc  ?? "");
  const [color, setColor] = useState(role?.color ?? PRESET_COLORS[0]);

  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/30 backdrop-blur-[2px]" onClick={onClose} />
      <div className="fixed left-1/2 top-1/2 z-50 -translate-x-1/2 -translate-y-1/2 w-[400px] rounded-[var(--radius-lg)] bg-[var(--color-surface)] shadow-[var(--shadow-lg)] p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-[14px] text-[var(--color-ink)]">{role?.id ? "Editar rol" : "Nuevo rol"}</h3>
          <button onClick={onClose} className="p-1 rounded text-[var(--color-ink-3)] hover:bg-[var(--color-surface-2)]"><Close size={14} /></button>
        </div>
        <div className="space-y-3">
          <div>
            <label className="text-[12px] font-medium text-[var(--color-ink-2)] mb-1 block">Nombre</label>
            <input value={name} onChange={(e) => setName(e.target.value)}
              className="w-full h-8 px-3 rounded-[var(--radius-sm)] border border-[var(--color-line)] bg-[var(--color-surface)] text-[var(--color-ink)] text-[13px] outline-none" />
          </div>
          <div>
            <label className="text-[12px] font-medium text-[var(--color-ink-2)] mb-1 block">Descripción</label>
            <input value={desc} onChange={(e) => setDesc(e.target.value)}
              className="w-full h-8 px-3 rounded-[var(--radius-sm)] border border-[var(--color-line)] bg-[var(--color-surface)] text-[var(--color-ink)] text-[13px] outline-none" />
          </div>
          <div>
            <label className="text-[12px] font-medium text-[var(--color-ink-2)] mb-2 block">Color</label>
            <div className="flex gap-2">
              {PRESET_COLORS.map((c) => (
                <button key={c} onClick={() => setColor(c)}
                  className={cn("size-7 rounded-full transition-all", color === c && "ring-2 ring-offset-1 ring-[var(--color-ink)]")}
                  style={{ background: c }} />
              ))}
            </div>
          </div>
        </div>
        <div className="flex gap-2 justify-end pt-2">
          <Button variant="secondary" onClick={onClose}>Cancelar</Button>
          <Button variant="primary" onClick={() => { if (name.trim()) onSave({ name, desc, color }); }}>Guardar</Button>
        </div>
      </div>
    </>
  );
}

function SettingsRoles() {
  const { data: roles } = useCollection<{ name: string; desc: string; color: string; level: string; members: number }>("roles");
  const [editing, setEditing] = useState<RoleDoc | null | "new">(null);

  async function handleSave(data: { name: string; desc: string; color: string }) {
    if (editing === "new") {
      await createDoc("roles", { ...data, members: 0 });
    } else if (editing) {
      await updateDocById("roles", (editing as RoleDoc).id, data);
    }
    setEditing(null);
  }

  async function handleDelete(id: string, name: string) {
    if (!confirm(`¿Eliminar el rol "${name}"? Las personas asignadas a este rol perderán sus permisos.`)) return;
    await deleteDocById("roles", id);
  }

  return (
    <>
      <div className="flex items-start gap-3 px-4 py-3 mb-4 rounded-[var(--radius-sm)] bg-[var(--color-surface-2)] border border-[var(--color-line)] text-[13px] text-[var(--color-ink-3)]">
        <Shield size={15} className="text-[var(--color-ink-4)] shrink-0 mt-0.5" />
        <span>
          Estos roles controlan <strong className="text-[var(--color-ink-2)]">quién puede usar Aviva HR</strong> y qué acciones puede ejecutar.
          Son distintos a los puestos del directorio (esos se gestionan en <strong className="text-[var(--color-ink-2)]">Catálogo → Puestos</strong>).
        </span>
      </div>

      <Section title={`Roles de acceso (${roles.length})`} sub="HR, Legal, Nómina, Managers y Directivos con acceso a la herramienta." action={
        <Button size="sm" variant="primary" icon={<Plus size={13} />} onClick={() => setEditing("new")}>Nuevo rol</Button>
      }>
        <div className="grid grid-cols-2 gap-3">
          {roles.map((r) => (
            <div key={r.id} className="flex items-start gap-3 p-4 rounded-[var(--radius-sm)] border border-[var(--color-line)]" style={{ borderLeft: `3px solid ${r.color}` }}>
              <div className="size-9 rounded-lg grid place-items-center text-[14px] font-bold shrink-0 mt-0.5" style={{ background: r.color + "18", color: r.color }}>
                {r.name[0]}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-[13.5px] text-[var(--color-ink)]">{r.name}</div>
                <div className="text-[12px] text-[var(--color-ink-3)] mt-0.5">{r.desc}</div>
                {r.level && (
                  <span className="inline-block mt-1.5 text-[11px] font-medium px-1.5 py-0.5 rounded" style={{ background: r.color + "18", color: r.color }}>
                    {r.level}
                  </span>
                )}
              </div>
              <div className="flex gap-1 shrink-0">
                <Button size="sm" variant="ghost" onClick={() => setEditing(r as RoleDoc)}>Editar</Button>
                <Button size="sm" variant="danger" onClick={() => handleDelete(r.id, r.name)}>✕</Button>
              </div>
            </div>
          ))}
          {roles.length === 0 && (
            <div className="col-span-2 py-8 text-center text-[13px] text-[var(--color-ink-4)]">Sin roles configurados. Crea el primero.</div>
          )}
        </div>
      </Section>

      {editing !== null && (
        <RoleModal
          role={editing === "new" ? null : editing}
          onSave={handleSave}
          onClose={() => setEditing(null)}
        />
      )}
    </>
  );
}

// ── Approvals ─────────────────────────────────────────────────────────────────
interface ApprovalChain { evt: string; chain: string[] }
interface ApprovalsDoc { chains: ApprovalChain[] }

function ApprovalModal({
  index,
  chain,
  evt,
  onSave,
  onClose,
}: {
  index: number;
  chain: string[];
  evt: string;
  onSave: (index: number, chain: string[]) => void;
  onClose: () => void;
}) {
  const [text, setText] = useState(chain.join(", "));
  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/30 backdrop-blur-[2px]" onClick={onClose} />
      <div className="fixed left-1/2 top-1/2 z-50 -translate-x-1/2 -translate-y-1/2 w-[440px] rounded-[var(--radius-lg)] bg-[var(--color-surface)] shadow-[var(--shadow-lg)] p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-[14px] text-[var(--color-ink)]">Editar cadena · {evt}</h3>
          <button onClick={onClose} className="p-1 rounded text-[var(--color-ink-3)] hover:bg-[var(--color-surface-2)]"><Close size={14} /></button>
        </div>
        <div>
          <label className="text-[12px] font-medium text-[var(--color-ink-2)] mb-1 block">Roles separados por coma</label>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={3}
            className="w-full px-3 py-2 rounded-[var(--radius-sm)] border border-[var(--color-line)] bg-[var(--color-surface)] text-[var(--color-ink)] text-[13px] outline-none resize-none"
          />
          <p className="text-[11.5px] text-[var(--color-ink-4)] mt-1">Ej. Manager directo, HR Business Partner, IT / Sistemas</p>
        </div>
        <div className="flex gap-2 justify-end pt-2">
          <Button variant="secondary" onClick={onClose}>Cancelar</Button>
          <Button variant="primary" onClick={() => {
            const parsed = text.split(",").map((s) => s.trim()).filter(Boolean);
            onSave(index, parsed);
          }}>Guardar</Button>
        </div>
      </div>
    </>
  );
}

function SettingsApprovals() {
  const { data } = useDocument<ApprovalsDoc>("settings", "approvals");
  const chains = data?.chains ?? [];
  const [editing, setEditing] = useState<{ index: number; chain: string[]; evt: string } | null>(null);

  function handleSave(index: number, newChain: string[]) {
    if (!data) return;
    const updatedChains = data.chains.map((c, i) =>
      i === index ? { ...c, chain: newChain } : c
    );
    updateDocById("settings", "approvals", { chains: updatedChains });
    setEditing(null);
  }

  return (
    <>
      <Section title="Cadena de aprobaciones" sub="Quién debe aprobar antes de ejecutar tareas irreversibles.">
        <div className="space-y-0 -m-5">
          {chains.map((row, i) => (
            <div key={i} className="flex items-center gap-4 px-5 py-4 border-b border-dashed border-[var(--color-line)] last:border-0">
              <div className="w-[200px] font-semibold text-[13.5px] text-[var(--color-ink)] shrink-0">{row.evt}</div>
              <div className="flex flex-wrap items-center gap-2 flex-1">
                {row.chain.map((step, j) => (
                  <div key={j} className="flex items-center gap-2">
                    <span className="text-[12.5px] font-medium px-3 py-1.5 rounded-lg bg-[var(--color-mint-50)] text-green-700 border border-green-200">
                      {step}
                    </span>
                    {j < row.chain.length - 1 && <span className="text-[var(--color-ink-4)] text-[12px]">→</span>}
                  </div>
                ))}
              </div>
              <Button size="sm" variant="secondary" onClick={() => setEditing({ index: i, chain: row.chain, evt: row.evt })}>Editar</Button>
            </div>
          ))}
          {chains.length === 0 && (
            <div className="px-5 py-8 text-center text-[13px] text-[var(--color-ink-4)]">Cargando cadenas…</div>
          )}
        </div>
      </Section>

      {editing && (
        <ApprovalModal
          index={editing.index}
          chain={editing.chain}
          evt={editing.evt}
          onSave={handleSave}
          onClose={() => setEditing(null)}
        />
      )}
    </>
  );
}

// ── Retention ─────────────────────────────────────────────────────────────────
interface RetentionPolicy { key: string; value: string }
interface RetentionDoc { policies: RetentionPolicy[] }

function SettingsRetention() {
  const { data } = useDocument<RetentionDoc>("settings", "retention");
  const [policies, setPolicies] = useState<RetentionPolicy[]>([]);
  const [saving,   setSaving]   = useState(false);

  useEffect(() => {
    if (data?.policies) setPolicies(data.policies);
  }, [data]);

  function setPolicy(index: number, value: string) {
    setPolicies((prev) => prev.map((p, i) => i === index ? { ...p, value } : p));
  }

  async function save() {
    setSaving(true);
    try { await updateDocById("settings", "retention", { policies }); }
    finally { setSaving(false); }
  }

  return (
    <Section title="Retención de datos" sub="Cuánto tiempo se conservan los datos tras una baja.">
      {policies.length === 0 ? (
        <div className="py-6 text-center text-[13px] text-[var(--color-ink-4)]">Cargando políticas…</div>
      ) : (
        <div className="space-y-3">
          {policies.map((p, i) => (
            <div key={p.key} className="flex items-center gap-4">
              <div className="flex-1 text-[13.5px] font-medium text-[var(--color-ink)]">{p.key}</div>
              <input
                value={p.value}
                onChange={(e) => setPolicy(i, e.target.value)}
                className="w-72 h-8 px-3 rounded-[var(--radius-sm)] border border-[var(--color-line)] bg-[var(--color-surface)] text-[var(--color-ink)] text-[13px] outline-none text-right"
              />
            </div>
          ))}
          <div className="pt-2">
            <Button variant="primary" onClick={save} disabled={saving}>{saving ? "Guardando…" : "Guardar"}</Button>
          </div>
        </div>
      )}
    </Section>
  );
}

// ── Webhooks & API ────────────────────────────────────────────────────────────
const ALL_SCOPES = ["users:read", "users:write", "tickets:read", "audit:read", "events:write"];

const API_EVENTS = [
  { id: "users.created",      desc: "Se creó un colaborador." },
  { id: "users.updated",      desc: "Se editaron datos de un colaborador." },
  { id: "offboard.created",   desc: "Ticket de baja abierto." },
  { id: "offboard.approved",  desc: "Todas las aprobaciones obtenidas." },
  { id: "offboard.completed", desc: "Tareas automáticas terminaron." },
  { id: "offboard.failed",    desc: "Una tarea automática falló." },
  { id: "access.granted",     desc: "Acceso concedido a una app." },
  { id: "sync.completed",     desc: "Sincronización con una integración terminó." },
];

interface ApiKeyDoc { id: string; name: string; prefix: string; scopes: string[]; lastUsed: string; status: string; author: string }
interface WebhookDoc { id: string; url: string; events: string[]; status: string; last: string }

function NewApiKeyModal({ onClose }: { onClose: () => void }) {
  const { notify } = useNotif();
  const [name,      setName]      = useState("");
  const [scopes,    setScopes]    = useState<string[]>([]);
  const [generated, setGenerated] = useState<string | null>(null);
  const [saving,    setSaving]    = useState(false);

  async function generate() {
    if (!name.trim()) return;
    setSaving(true);
    const prefix = "ak_live_" + Math.random().toString(36).slice(2, 6);
    await createDoc("apiKeys", { name, prefix, scopes, lastUsed: "nunca", status: "ok", author: "Tú" });
    setGenerated(prefix + "_•••••••••••••••••••••");
    setSaving(false);
  }

  function copyKey() {
    navigator.clipboard?.writeText(generated ?? "").catch(() => null);
    notify({ title: "API Key copiada", body: "Guárdala en un lugar seguro.", kind: "info" });
  }

  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/30 backdrop-blur-[2px]" onClick={onClose} />
      <div className="fixed left-1/2 top-1/2 z-50 -translate-x-1/2 -translate-y-1/2 w-[460px] rounded-[var(--radius-lg)] bg-[var(--color-surface)] shadow-[var(--shadow-lg)] p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-[14px] text-[var(--color-ink)]">Nueva API Key</h3>
          <button onClick={onClose} className="p-1 rounded text-[var(--color-ink-3)] hover:bg-[var(--color-surface-2)]"><Close size={14} /></button>
        </div>
        {!generated ? (
          <>
            <div>
              <label className="text-[12px] font-medium text-[var(--color-ink-2)] mb-1 block">Nombre</label>
              <input value={name} onChange={(e) => setName(e.target.value)}
                placeholder="Ej. Producción · Backend"
                className="w-full h-8 px-3 rounded-[var(--radius-sm)] border border-[var(--color-line)] bg-[var(--color-surface)] text-[var(--color-ink)] text-[13px] outline-none" />
            </div>
            <div>
              <label className="text-[12px] font-medium text-[var(--color-ink-2)] mb-2 block">Permisos (scopes)</label>
              <div className="space-y-1.5">
                {ALL_SCOPES.map((s) => (
                  <label key={s} className="flex items-center gap-2 text-[13px] cursor-pointer">
                    <input type="checkbox" checked={scopes.includes(s)}
                      onChange={(e) => setScopes(e.target.checked ? [...scopes, s] : scopes.filter((x) => x !== s))}
                      className="cursor-pointer" />
                    <code className="font-mono text-[12px]">{s}</code>
                  </label>
                ))}
              </div>
            </div>
            <div className="flex gap-2 justify-end pt-2">
              <Button variant="secondary" onClick={onClose}>Cancelar</Button>
              <Button variant="primary" onClick={generate} disabled={saving || !name.trim()}>
                {saving ? "Generando…" : "Generar API Key"}
              </Button>
            </div>
          </>
        ) : (
          <>
            <div className="px-4 py-3 rounded-[var(--radius-sm)] bg-[var(--color-mint-50)] border border-green-200">
              <div className="text-[12px] text-green-700 font-medium mb-1">API Key generada · cópiala ahora</div>
              <code className="text-[13px] font-mono text-[var(--color-ink)] break-all">{generated}</code>
            </div>
            <p className="text-[12px] text-[var(--color-ink-4)]">No podrás volver a ver el valor completo.</p>
            <div className="flex gap-2 justify-end">
              <Button variant="primary" icon={<Copy size={13} />} onClick={copyKey}>Copiar y cerrar</Button>
            </div>
          </>
        )}
      </div>
    </>
  );
}

function WebhookModal({
  webhook,
  onClose,
}: {
  webhook: WebhookDoc | null;
  onClose: () => void;
}) {
  const [url,       setUrl]       = useState(webhook?.url       ?? "");
  const [eventsStr, setEventsStr] = useState(webhook?.events?.join(", ") ?? "");
  const [saving,    setSaving]    = useState(false);

  async function handleSave() {
    if (!url.trim()) return;
    setSaving(true);
    const events = eventsStr.split(",").map((s) => s.trim()).filter(Boolean);
    if (webhook) {
      await updateDocById("webhooks", webhook.id, { url, events });
    } else {
      await createDoc("webhooks", { url, events, status: "ok", last: "nunca" });
    }
    setSaving(false);
    onClose();
  }

  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/30 backdrop-blur-[2px]" onClick={onClose} />
      <div className="fixed left-1/2 top-1/2 z-50 -translate-x-1/2 -translate-y-1/2 w-[460px] rounded-[var(--radius-lg)] bg-[var(--color-surface)] shadow-[var(--shadow-lg)] p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-[14px] text-[var(--color-ink)]">{webhook ? "Editar webhook" : "Nuevo webhook"}</h3>
          <button onClick={onClose} className="p-1 rounded text-[var(--color-ink-3)] hover:bg-[var(--color-surface-2)]"><Close size={14} /></button>
        </div>
        <div>
          <label className="text-[12px] font-medium text-[var(--color-ink-2)] mb-1 block">URL del endpoint</label>
          <input value={url} onChange={(e) => setUrl(e.target.value)}
            placeholder="https://api.example.com/webhook"
            className="w-full h-8 px-3 rounded-[var(--radius-sm)] border border-[var(--color-line)] bg-[var(--color-surface)] text-[var(--color-ink)] text-[13px] outline-none" />
        </div>
        <div>
          <label className="text-[12px] font-medium text-[var(--color-ink-2)] mb-1 block">Eventos (separados por coma)</label>
          <textarea value={eventsStr} onChange={(e) => setEventsStr(e.target.value)}
            rows={3} placeholder="onboard.*, offboard.*, users.created"
            className="w-full px-3 py-2 rounded-[var(--radius-sm)] border border-[var(--color-line)] bg-[var(--color-surface)] text-[var(--color-ink)] text-[13px] outline-none resize-none" />
        </div>
        <div className="flex gap-2 justify-end pt-2">
          <Button variant="secondary" onClick={onClose}>Cancelar</Button>
          <Button variant="primary" onClick={handleSave} disabled={saving || !url.trim()}>
            {saving ? "Guardando…" : "Guardar"}
          </Button>
        </div>
      </div>
    </>
  );
}

function SettingsWebhooks() {
  const { notify } = useNotif();
  const { data: apiKeys }  = useCollection<{ name: string; prefix: string; scopes: string[]; lastUsed: string; status: string; author: string }>("apiKeys");
  const { data: webhooks } = useCollection<{ url: string; events: string[]; status: string; last: string }>("webhooks");
  const [copied,       setCopied]       = useState<string | null>(null);
  const [showNewKey,   setShowNewKey]   = useState(false);
  const [webhookModal, setWebhookModal] = useState<WebhookDoc | null | "new">(null);
  const [showDocs,     setShowDocs]     = useState(false);

  function copy(text: string, key: string) {
    navigator.clipboard?.writeText(text).catch(() => null);
    setCopied(key);
    setTimeout(() => setCopied(null), 2000);
  }

  function handleRevoke(id: string) {
    if (!confirm("¿Revocar esta API Key?")) return;
    deleteDocById("apiKeys", id);
  }

  function handleRotate() {
    notify({ title: "Rotar API Key", body: "La rotación de keys se ejecuta desde el panel de administración.", kind: "info" });
  }

  return (
    <>
      <Section title="API Keys" sub="Para conectar Aviva HR a tus servicios." action={
        <Button size="sm" variant="primary" icon={<Plus size={13} />} onClick={() => setShowNewKey(true)}>Nueva API Key</Button>
      }>
        <div className="space-y-0 -m-5">
          {apiKeys.map((k, i) => (
            <div key={k.id} className={cn("flex items-start gap-3 px-5 py-4", i < apiKeys.length - 1 && "border-b border-[var(--color-line)]")}>
              <div className="size-9 rounded-lg bg-[var(--color-surface-2)] border border-[var(--color-line)] grid place-items-center shrink-0">
                <Shield size={14} className="text-[var(--color-ink-3)]" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="font-semibold text-[13.5px] text-[var(--color-ink)]">{k.name}</span>
                  {k.status === "stale" && <span className="text-[11px] px-1.5 py-0.5 rounded bg-[var(--color-warn-bg)] text-[var(--color-warn-fg)] font-medium">Sin uso 30+ días</span>}
                </div>
                <code className="text-[12px] font-mono text-[var(--color-ink-3)]">{k.prefix}_•••••••••••••••••••••</code>
                <div className="flex flex-wrap gap-1 mt-1.5">
                  {k.scopes.map((s) => (
                    <span key={s} className="text-[11px] font-mono px-1.5 py-0.5 rounded bg-[var(--color-surface-2)] border border-[var(--color-line)] text-[var(--color-ink-3)]">{s}</span>
                  ))}
                </div>
                <div className="text-[11.5px] text-[var(--color-ink-4)] mt-1">Último uso {k.lastUsed}</div>
              </div>
              <div className="flex gap-2 shrink-0">
                <Button size="sm" variant="secondary" icon={<Copy size={12} />} onClick={() => copy(k.prefix, k.id)}>
                  {copied === k.id ? "¡Copiado!" : "Copiar"}
                </Button>
                <Button size="sm" variant="secondary" onClick={handleRotate}>Rotar</Button>
                <Button size="sm" variant="danger" onClick={() => handleRevoke(k.id)}>Revocar</Button>
              </div>
            </div>
          ))}
          {apiKeys.length === 0 && (
            <div className="px-5 py-8 text-center text-[13px] text-[var(--color-ink-4)]">Sin API Keys. Crea la primera.</div>
          )}
        </div>
      </Section>

      <Section title="Webhooks salientes" sub="Aviva HR envía eventos POST JSON a estos endpoints." action={
        <Button size="sm" variant="primary" icon={<Plus size={13} />} onClick={() => setWebhookModal("new")}>Nuevo webhook</Button>
      }>
        <div className="space-y-0 -m-5">
          {webhooks.map((h, i) => (
            <div key={h.id} className={cn("flex items-start gap-3 px-5 py-4 flex-wrap", i < webhooks.length - 1 && "border-b border-[var(--color-line)]")}>
              <code className="text-[12px] font-mono bg-[var(--color-surface-2)] px-2 py-1 rounded text-[var(--color-ink-2)] truncate max-w-[280px]">{h.url}</code>
              <div className="flex flex-wrap gap-1">
                {h.events.map((e) => <span key={e} className="text-[11px] font-mono px-1.5 py-0.5 rounded bg-[var(--color-surface-2)] border border-[var(--color-line)] text-[var(--color-ink-3)]">{e}</span>)}
              </div>
              <div className="flex items-center gap-2 ml-auto">
                <span className="text-[12px] text-[var(--color-ink-4)]">{h.last}</span>
                <span className={cn("text-[11.5px] font-medium px-2 py-0.5 rounded-full",
                  h.status === "ok" ? "bg-[var(--color-mint-50)] text-green-700" : "bg-[var(--color-warn-bg)] text-[var(--color-warn-fg)]"
                )}>{h.status === "ok" ? "OK" : "1 fallo"}</span>
                <Button size="sm" variant="secondary" onClick={() => setWebhookModal(h as WebhookDoc)}>Editar</Button>
              </div>
            </div>
          ))}
          {webhooks.length === 0 && (
            <div className="px-5 py-8 text-center text-[13px] text-[var(--color-ink-4)]">Sin webhooks configurados.</div>
          )}
        </div>
      </Section>

      <Section title="Catálogo de eventos" sub="Todos los eventos que Aviva HR puede emitir.">
        <div className="space-y-0 -m-5">
          {API_EVENTS.map((e, i) => (
            <div key={e.id} className={cn("flex items-center gap-4 px-5 py-3", i < API_EVENTS.length - 1 && "border-b border-[var(--color-line)]")}>
              <code className="text-[12.5px] font-mono font-semibold text-green-700 w-52 shrink-0">{e.id}</code>
              <span className="text-[13px] text-[var(--color-ink-3)] flex-1">{e.desc}</span>
              <Button size="sm" variant="ghost"
                onClick={() => notify({ title: "Schema de evento", body: `El schema de ${e.id} está disponible en la documentación REST.`, kind: "info" })}>
                Ver schema
              </Button>
            </div>
          ))}
        </div>
      </Section>

      <Section title="Documentación REST" sub="Base URL: https://api.avivacredito.com/hr/v1" action={
        <Button size="sm" variant="primary" icon={<Link size={12} />} onClick={() => setShowDocs(true)}>Abrir guía completa</Button>
      }>
        <div className="space-y-2">
          {[
            { method: "GET",   path: "/users",             desc: "Lista de colaboradores con filtros." },
            { method: "POST",  path: "/users",             desc: "Crear colaborador y enviar invitación." },
            { method: "PATCH", path: "/users/:id",         desc: "Editar campos parciales." },
            { method: "POST",  path: "/users/:id/offboard", desc: "Iniciar ticket de baja." },
            { method: "GET",   path: "/tickets",           desc: "Lista de tickets activos." },
            { method: "GET",   path: "/audit",             desc: "Log inmutable de eventos." },
          ].map((ep) => {
            const colors: Record<string, string> = {
              GET: "bg-[var(--color-mint-50)] text-green-700", POST: "bg-[#e3eeff] text-[#1b3f8a]", PATCH: "bg-[#fff3d6] text-[#8a5a00]",
            };
            return (
              <div key={ep.path + ep.method} className="flex items-center gap-3 py-2 border-b border-dashed border-[var(--color-line)] last:border-0">
                <span className={cn("text-[11px] font-bold font-mono px-2 py-0.5 rounded w-14 text-center", colors[ep.method] ?? "bg-[var(--color-surface-2)]")}>{ep.method}</span>
                <code className="font-mono text-[13px] text-[var(--color-ink)] w-52 shrink-0">{ep.path}</code>
                <span className="text-[12.5px] text-[var(--color-ink-3)]">{ep.desc}</span>
              </div>
            );
          })}
        </div>
      </Section>

      {showNewKey && <NewApiKeyModal onClose={() => setShowNewKey(false)} />}
      {webhookModal !== null && (
        <WebhookModal
          webhook={webhookModal === "new" ? null : webhookModal}
          onClose={() => setWebhookModal(null)}
        />
      )}
      {showDocs && <APIDocsPanel onClose={() => setShowDocs(false)} />}
    </>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────
export function SettingsView() {
  const [tab, setTab] = useState<TabId>("general");

  return (
    <div className="flex h-full">
      {/* Sidebar nav */}
      <nav className="w-52 shrink-0 border-r border-[var(--color-line)] bg-[var(--color-surface)] overflow-y-auto py-3">
        {TABS.map((t) => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={cn(
              "w-full flex items-center gap-2.5 px-4 py-2.5 text-[13px] font-medium transition-colors text-left",
              tab === t.id
                ? "bg-[var(--color-mint-50)] text-green-700 border-r-2 border-green-500"
                : "text-[var(--color-ink-3)] hover:bg-[var(--color-surface-2)] hover:text-[var(--color-ink)]"
            )}
          >
            <span className="shrink-0 [&>svg]:size-3.5">{t.icon}</span>
            {t.label}
          </button>
        ))}
      </nav>

      {/* Content */}
      <div className="flex-1 overflow-auto">
        <div className="px-6 py-5 border-b border-[var(--color-line)] bg-[var(--color-surface)] shrink-0">
          <h1 className="font-serif text-[22px] font-medium text-[var(--color-ink)]">Ajustes</h1>
          <p className="text-[12.5px] text-[var(--color-ink-3)]">Configuración del workspace de Aviva. Solo administradores.</p>
        </div>
        <div className="p-6">
          {tab === "general"       && <SettingsGeneral />}
          {tab === "notifications" && <SettingsNotifications />}
          {tab === "gmail"         && <SettingsGmail />}
          {tab === "reminders"     && <SettingsReminders />}
          {tab === "link-duration" && <SettingsLinkDuration />}
          {tab === "branding"      && <SettingsBranding />}
          {tab === "roles"         && <SettingsRoles />}
          {tab === "approvals"     && <SettingsApprovals />}
          {tab === "retention"     && <SettingsRetention />}
          {tab === "webhooks"      && <SettingsWebhooks />}
        </div>
      </div>
    </div>
  );
}
