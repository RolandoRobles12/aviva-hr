import { useState } from "react";
import { useDocument, updateDocById } from "@/hooks/useFirestore";
import { Button } from "@/components/ui/Button";
import {
  Cog, Bell, Mail, History, Shield, User, Link, Check, Plus, Close, Copy, Refresh,
} from "@/components/icons";
import { cn } from "@/lib/cn";

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
  const { data: settings } = useDocument<{ theme: string; density: string }>("settings", "app");
  const [theme,   setTheme]   = useState<"light" | "dark">("light");
  const [density, setDensity] = useState<"comfortable" | "compact">("comfortable");
  const [saving,  setSaving]  = useState(false);

  async function save() {
    setSaving(true);
    try {
      await updateDocById("settings", "app", { theme, density });
      document.documentElement.setAttribute("data-theme", theme);
    } finally { setSaving(false); }
  }

  void settings;

  return (
    <>
      <Section title="Workspace" sub="Información básica del workspace.">
        <div className="grid grid-cols-[140px_1fr] gap-y-3 gap-x-4 text-[13px]">
          <span className="text-[var(--color-ink-3)] self-center">Nombre</span>
          <input defaultValue="Aviva Crédito" className="h-8 px-3 rounded-[var(--radius-sm)] border border-[var(--color-line)] bg-[var(--color-surface)] text-[var(--color-ink)] outline-none text-[13px]" />
          <span className="text-[var(--color-ink-3)] self-center">Dominio corporativo</span>
          <span className="font-mono text-[12px] px-2 py-0.5 rounded bg-[var(--color-surface-2)] border border-[var(--color-line)] w-fit">@avivacredito.com</span>
          <span className="text-[var(--color-ink-3)] self-center">Zona horaria</span>
          <span className="text-[var(--color-ink-2)]">America/Mexico_City (GMT−6)</span>
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
const ALERT_EVENTS = [
  { id: "offboard.created",   label: "Baja iniciada",             desc: "Se crea un nuevo ticket de baja.",       channel: "#people-avisos", slack: true,  email: true  },
  { id: "offboard.approved",  label: "Baja aprobada",             desc: "Las tres aprobaciones están listas.",    channel: "#people-avisos", slack: true,  email: false },
  { id: "offboard.completed", label: "Baja ejecutada",            desc: "Todas las tareas automáticas terminaron.", channel: "#people-bajas", slack: true,  email: true  },
  { id: "offboard.failed",    label: "Tarea de baja fallida",     desc: "Una tarea automática falló.",            channel: "#it-alertas",    slack: true,  email: true  },
  { id: "onboard.created",    label: "Alta creada",               desc: "Se invita a una nueva persona.",         channel: "#people-altas",  slack: true,  email: false },
  { id: "access.granted",     label: "Acceso fuera de plantilla", desc: "Se da acceso manual a una app sensible.", channel: "#it-alertas",   slack: true,  email: true  },
];

function AlertRuleRow({ evt }: { evt: typeof ALERT_EVENTS[number] }) {
  const [slack, setSlack] = useState(evt.slack);
  const [email, setEmail] = useState(evt.email);
  return (
    <div className="flex items-center gap-4 px-5 py-3.5 border-b border-[var(--color-line)] last:border-0">
      <div className="flex-1">
        <div className="font-medium text-[13.5px] text-[var(--color-ink)]">{evt.label}</div>
        <div className="text-[12px] text-[var(--color-ink-3)] mt-0.5">{evt.desc}</div>
        <span className="inline-block mt-1.5 text-[11px] font-mono bg-[var(--color-surface-2)] border border-[var(--color-line)] text-[var(--color-ink-3)] px-1.5 py-0.5 rounded">
          {evt.channel}
        </span>
      </div>
      <div className="flex flex-col items-center gap-1 w-16">
        <span className="text-[10px] text-[var(--color-ink-4)] uppercase tracking-wide">Slack</span>
        <Toggle checked={slack} onChange={setSlack} />
      </div>
      <div className="flex flex-col items-center gap-1 w-16">
        <span className="text-[10px] text-[var(--color-ink-4)] uppercase tracking-wide">Email</span>
        <Toggle checked={email} onChange={setEmail} />
      </div>
    </div>
  );
}

function SettingsNotifications() {
  const [slackOn, setSlackOn] = useState(true);
  const [emailOn, setEmailOn] = useState(true);

  return (
    <>
      <Section title="Canales conectados" sub="Aviva HR envía alertas cuando ocurren eventos de personas." action={
        <Button size="sm" variant="secondary" icon={<Plus size={13} />}>Conectar canal</Button>
      }>
        <div className="grid grid-cols-2 gap-3">
          {[
            { icon: "#", iconColor: "#611f69", iconBg: "#611f6914", name: "Slack", workspace: "aviva-credito.slack.com", meta: "4 canales · 8 eventos suscritos · webhook OK", checked: slackOn, onChange: setSlackOn },
            { icon: "@", iconColor: "#1b3f8a", iconBg: "#1b3f8a14", name: "Email", workspace: "people@aviva.com",        meta: "HR Business Partners + Managers",             checked: emailOn, onChange: setEmailOn },
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
          {ALERT_EVENTS.map((evt) => <AlertRuleRow key={evt.id} evt={evt} />)}
        </div>
      </Section>

      <Section title="Vista previa de mensaje Slack" sub="Así verá el equipo una baja recién creada en #people-avisos.">
        <div className="rounded-[var(--radius-sm)] border border-[#e5e5e0] bg-white p-4 max-w-[520px] text-[13px]">
          <div className="flex items-start gap-3">
            <div className="size-9 rounded-[6px] bg-[var(--color-mint-50)] text-green-700 grid place-items-center font-bold text-[13px] shrink-0">av</div>
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <b className="text-black">Aviva HR</b>
                <span className="text-[10px] bg-[#e5e5e0] text-[#3a3a3a] px-1 py-px rounded font-semibold">APP</span>
                <span className="text-[11px] text-[#999]">16:42</span>
              </div>
              <div className="pl-3 border-l-[3px] border-[var(--color-danger-fg)]">
                <div className="font-semibold text-black">🔴 Nueva baja iniciada · TKT-2041</div>
                <div className="text-[#555] mt-1 leading-relaxed">
                  <b className="text-black">Andrés Morales</b> · Backend Engineer · Ingeniería<br />
                  Motivo: cambio voluntario · Última jornada: <b className="text-black">30 may</b>
                </div>
                <div className="flex gap-2 mt-2">
                  <button className="px-3 py-1 text-[12px] font-medium text-white bg-green-600 rounded">Aprobar</button>
                  <button className="px-3 py-1 text-[12px] font-medium text-[#555] border border-[#ddd] rounded">Ver ticket</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Section>
    </>
  );
}

// ── Gmail ─────────────────────────────────────────────────────────────────────
interface GmailSettings { connected: boolean; email: string; sentCount: number; deliveryRate: number; bounces: number }

function SettingsGmail() {
  const { data } = useDocument<GmailSettings>("settings", "gmail");
  const connected = data?.connected ?? true;
  const email     = data?.email     ?? "people@avivacredito.com";

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
            <Button size="sm" variant="secondary" icon={<Refresh size={12} />}>Re-autorizar</Button>
            <Button size="sm" variant="danger">Desconectar</Button>
          </div>
        ) : (
          <Button size="sm" variant="primary" icon={<Mail size={13} />}>Conectar Gmail</Button>
        )}
      </div>

      {connected && (
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: "Correos enviados (30d)", value: data?.sentCount ?? 312 },
            { label: "Tasa de entrega",        value: `${data?.deliveryRate ?? 98.7}%` },
            { label: "Rebotes",                value: data?.bounces ?? 4 },
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
  const [enabled,       setEnabled]       = useState(data?.enabled       ?? true);
  const [intervalHours, setIntervalHours] = useState(data?.intervalHours ?? 48);
  const [maxReminders,  setMaxReminders]  = useState(data?.maxReminders  ?? 3);
  const [saving,        setSaving]        = useState(false);

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
  const [formDays,     setFormDays]     = useState(data?.formDays     ?? 7);
  const [offerDays,    setOfferDays]    = useState(data?.offerDays    ?? 5);
  const [contractDays, setContractDays] = useState(data?.contractDays ?? 3);
  const [saving,       setSaving]       = useState(false);

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
  return (
    <Section title="Marca" sub="Logo y colores de los emails y la app.">
      <div className="flex items-center gap-4 mb-6">
        <div className="size-16 rounded-xl bg-[var(--color-mint-50)] text-green-700 grid place-items-center font-bold text-[22px] font-serif shrink-0">A</div>
        <div>
          <div className="font-semibold text-[var(--color-ink)]">Aviva Crédito</div>
          <div className="text-[12px] text-[var(--color-ink-3)]">Logo cuadrado · 256×256 px</div>
          <div className="flex gap-2 mt-2">
            <Button size="sm" variant="secondary">Cambiar</Button>
            <Button size="sm" variant="ghost">Eliminar</Button>
          </div>
        </div>
      </div>

      <div className="border-t border-[var(--color-line)] pt-5">
        <div className="font-semibold text-[13px] text-[var(--color-ink)] mb-3">Paleta de marca</div>
        <div className="flex gap-4">
          {[["#b0f5cd", "Mint"], ["#16b877", "Verde"], ["#026149", "Verde profundo"], ["#FFFFFF", "Blanco"]].map(([color, label]) => (
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
const STATIC_ROLES = [
  { id: "r-hr",    name: "HR Business Partner", desc: "Gestión completa de personas",      color: "#16b877", members: 3,  permsActive: 8  },
  { id: "r-it",    name: "IT / Sistemas",        desc: "Acceso a apps y equipamiento",      color: "#1b3f8a", members: 2,  permsActive: 5  },
  { id: "r-mgr",   name: "Manager",              desc: "Revisión y aprobación de su equipo", color: "#5c2e8e", members: 8,  permsActive: 4  },
  { id: "r-admin", name: "Administrador",         desc: "Acceso total",                      color: "#026149", members: 1,  permsActive: 12 },
];

const PERMISSION_GROUPS = [
  {
    group: "Directorio",
    perms: [
      { id: "users.read",   label: "Ver directorio",         desc: "Lista y ficha de colaboradores", scopes: ["Ninguno", "Propio hub", "Todos"] },
      { id: "users.write",  label: "Crear y editar personas", desc: "Altas, edición de datos",       scopes: ["Ninguno", "Propio hub", "Todos"] },
      { id: "users.delete", label: "Iniciar baja",            desc: "Crear tickets de offboarding",  scopes: ["Ninguno", "Todos"] },
    ],
  },
  {
    group: "Tickets",
    perms: [
      { id: "tickets.read",  label: "Ver tickets",       desc: "Bajas y transferencias",    scopes: ["Ninguno", "Propios", "Todos"] },
      { id: "tickets.write", label: "Gestionar tickets", desc: "Aprobar y ejecutar",        scopes: ["Ninguno", "Propios", "Todos"] },
    ],
  },
  {
    group: "Administración",
    perms: [
      { id: "settings.write", label: "Modificar ajustes", desc: "Configuración del workspace", scopes: ["Ninguno", "Todos"] },
      { id: "audit.read",     label: "Ver auditoría",     desc: "Log inmutable de eventos",    scopes: ["Ninguno", "Todos"] },
    ],
  },
];

function SettingsRoles() {
  return (
    <>
      <Section title={`Roles (${STATIC_ROLES.length})`} sub="Cada persona pertenece a uno o varios roles. Los permisos se acumulan." action={
        <Button size="sm" variant="primary" icon={<Plus size={13} />}>Nuevo rol</Button>
      }>
        <div className="grid grid-cols-2 gap-3">
          {STATIC_ROLES.map((r) => (
            <div key={r.id} className="flex items-center gap-3 p-4 rounded-[var(--radius-sm)] border border-[var(--color-line)]" style={{ borderLeft: `3px solid ${r.color}` }}>
              <div className="size-10 rounded-lg grid place-items-center text-[16px] font-bold shrink-0" style={{ background: r.color + "18", color: r.color }}>
                {r.name[0]}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-[13.5px] text-[var(--color-ink)]">{r.name}</div>
                <div className="text-[12px] text-[var(--color-ink-3)]">{r.desc}</div>
                <div className="text-[11.5px] text-[var(--color-ink-4)] mt-0.5">{r.members} personas · {r.permsActive} permisos activos</div>
              </div>
              <Button size="sm" variant="secondary">Editar</Button>
            </div>
          ))}
        </div>
      </Section>

      <Section title="Matriz de permisos" sub="Vista cruzada de roles × permisos.">
        <div className="overflow-x-auto -m-5">
          <table className="w-full text-[12.5px] border-collapse">
            <thead>
              <tr className="border-b border-[var(--color-line)]">
                <th className="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-wide text-[var(--color-ink-4)]">Permiso</th>
                {STATIC_ROLES.map((r) => (
                  <th key={r.id} className="px-4 py-3 text-center text-[11px] font-semibold text-[var(--color-ink-4)]" style={{ color: r.color }}>{r.name}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {PERMISSION_GROUPS.flatMap(({ group, perms }) => [
                <tr key={group} className="bg-[var(--color-surface-2)]">
                  <td colSpan={STATIC_ROLES.length + 1} className="px-5 py-2 text-[11px] font-bold uppercase tracking-widest text-[var(--color-ink-4)]">{group}</td>
                </tr>,
                ...perms.map((perm) => (
                  <tr key={perm.id} className="border-t border-[var(--color-line)] hover:bg-[var(--color-surface-2)]">
                    <td className="px-5 py-3">
                      <div className="font-medium text-[var(--color-ink)]">{perm.label}</div>
                      <div className="text-[11.5px] text-[var(--color-ink-4)]">{perm.desc}</div>
                    </td>
                    {STATIC_ROLES.map((r) => {
                      const hasAll    = r.id === "r-admin" || r.id === "r-hr";
                      const hasOwn    = hasAll || r.id === "r-mgr";
                      const scopeIdx  = hasAll ? perm.scopes.length - 1 : hasOwn ? 1 : 0;
                      const scope     = perm.scopes[scopeIdx] ?? "Ninguno";
                      return (
                        <td key={r.id} className="px-4 py-3 text-center">
                          <span className={cn("text-[11.5px] font-medium px-2 py-0.5 rounded-full",
                            scope === "Ninguno" ? "text-[var(--color-ink-4)]"
                            : "bg-[var(--color-mint-50)] text-green-700"
                          )}>{scope}</span>
                        </td>
                      );
                    })}
                  </tr>
                )),
              ])}
            </tbody>
          </table>
        </div>
      </Section>
    </>
  );
}

// ── Approvals ─────────────────────────────────────────────────────────────────
const APPROVAL_CHAINS = [
  { evt: "Alta de persona",       chain: ["HR Business Partner"] },
  { evt: "Baja por renuncia",     chain: ["Manager directo", "HR Business Partner", "IT / Sistemas"] },
  { evt: "Baja por despido",      chain: ["HR Business Partner", "Legal", "IT / Sistemas"] },
  { evt: "Suspensión inmediata",  chain: ["HR Business Partner", "Legal"] },
  { evt: "Acceso a app sensible", chain: ["Manager directo", "IT / Sistemas"] },
];

function SettingsApprovals() {
  return (
    <Section title="Cadena de aprobaciones" sub="Quién debe aprobar antes de ejecutar tareas irreversibles.">
      <div className="space-y-0 -m-5">
        {APPROVAL_CHAINS.map((row, i) => (
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
            <Button size="sm" variant="secondary">Editar</Button>
          </div>
        ))}
      </div>
    </Section>
  );
}

// ── Retention ─────────────────────────────────────────────────────────────────
function SettingsRetention() {
  return (
    <Section title="Retención de datos" sub="Cuánto tiempo se conservan los datos tras una baja.">
      <div className="grid grid-cols-[1fr_auto] gap-y-4 gap-x-8">
        {[
          ["Perfil archivado",                        "90 días tras la última jornada"],
          ["Documentos legales (contrato, finiquito)", "10 años (obligación legal)"],
          ["Log de auditoría",                         "5 años"],
          ["Backups cifrados",                         "30 días"],
          ["Cuenta SSO / email",                       "Desactivada el día de baja · borrada a los 30 días"],
        ].map(([key, val]) => (
          <div key={key} className="contents">
            <div className="text-[13.5px] font-medium text-[var(--color-ink)]">{key}</div>
            <div className="text-[13px] text-[var(--color-ink-3)] text-right">{val}</div>
          </div>
        ))}
      </div>
    </Section>
  );
}

// ── Webhooks & API ────────────────────────────────────────────────────────────
const WEBHOOKS = [
  { url: "https://api.aviva.com/hr/people-events",  events: ["onboard.*", "offboard.*"],                  status: "ok",   last: "hace 2 min · 200" },
  { url: "https://hooks.hubspot.com/aviva-people",  events: ["users.created", "users.updated"],            status: "ok",   last: "hace 8 min · 200" },
  { url: "https://internal.aviva.com/audit-stream", events: ["*"],                                         status: "warn", last: "hace 14 min · 503" },
];

const API_KEYS_STATIC = [
  { id: "k1", name: "Producción · Backend", prefix: "ak_live_w7F2", scopes: ["users:read", "users:write", "tickets:read"], lastUsed: "hace 4 min",  status: "ok" },
  { id: "k2", name: "Staging · Backend",    prefix: "ak_test_2qD9", scopes: ["users:read", "users:write"],                lastUsed: "hace 1 h",    status: "ok" },
  { id: "k3", name: "BI · Lectura",         prefix: "ak_live_bM4r", scopes: ["users:read", "audit:read"],                 lastUsed: "hace 2 d",    status: "ok" },
  { id: "k4", name: "HubSpot Sync",         prefix: "ak_live_h0p1", scopes: ["users:read", "users:write", "events:write"], lastUsed: "hace 1 min", status: "ok" },
  { id: "k5", name: "Webhooks Slack viejo", prefix: "ak_live_old3", scopes: ["events:write"],                              lastUsed: "hace 47 d",   status: "stale" },
];

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

function SettingsWebhooks() {
  const [copied, setCopied] = useState<string | null>(null);

  function copy(text: string, key: string) {
    navigator.clipboard?.writeText(text).catch(() => null);
    setCopied(key);
    setTimeout(() => setCopied(null), 2000);
  }

  return (
    <>
      <Section title="API Keys" sub="Para conectar Aviva HR a tus servicios." action={
        <Button size="sm" variant="primary" icon={<Plus size={13} />}>Nueva API Key</Button>
      }>
        <div className="space-y-0 -m-5">
          {API_KEYS_STATIC.map((k, i) => (
            <div key={k.id} className={cn("flex items-start gap-3 px-5 py-4", i < API_KEYS_STATIC.length - 1 && "border-b border-[var(--color-line)]")}>
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
                <Button size="sm" variant="danger">Revocar</Button>
              </div>
            </div>
          ))}
        </div>
      </Section>

      <Section title="Webhooks salientes" sub="Aviva HR envía eventos POST JSON a estos endpoints." action={
        <Button size="sm" variant="primary" icon={<Plus size={13} />}>Nuevo webhook</Button>
      }>
        <div className="space-y-0 -m-5">
          {WEBHOOKS.map((h, i) => (
            <div key={i} className={cn("flex items-start gap-3 px-5 py-4 flex-wrap", i < WEBHOOKS.length - 1 && "border-b border-[var(--color-line)]")}>
              <code className="text-[12px] font-mono bg-[var(--color-surface-2)] px-2 py-1 rounded text-[var(--color-ink-2)] truncate max-w-[280px]">{h.url}</code>
              <div className="flex flex-wrap gap-1">
                {h.events.map((e) => <span key={e} className="text-[11px] font-mono px-1.5 py-0.5 rounded bg-[var(--color-surface-2)] border border-[var(--color-line)] text-[var(--color-ink-3)]">{e}</span>)}
              </div>
              <div className="flex items-center gap-2 ml-auto">
                <span className="text-[12px] text-[var(--color-ink-4)]">{h.last}</span>
                <span className={cn("text-[11.5px] font-medium px-2 py-0.5 rounded-full",
                  h.status === "ok" ? "bg-[var(--color-mint-50)] text-green-700" : "bg-[var(--color-warn-bg)] text-[var(--color-warn-fg)]"
                )}>{h.status === "ok" ? "OK" : "1 fallo"}</span>
                <Button size="sm" variant="secondary">Editar</Button>
              </div>
            </div>
          ))}
        </div>
      </Section>

      <Section title="Catálogo de eventos" sub="Todos los eventos que Aviva HR puede emitir.">
        <div className="space-y-0 -m-5">
          {API_EVENTS.map((e, i) => (
            <div key={e.id} className={cn("flex items-center gap-4 px-5 py-3", i < API_EVENTS.length - 1 && "border-b border-[var(--color-line)]")}>
              <code className="text-[12.5px] font-mono font-semibold text-green-700 w-52 shrink-0">{e.id}</code>
              <span className="text-[13px] text-[var(--color-ink-3)] flex-1">{e.desc}</span>
              <Button size="sm" variant="ghost">Ver schema</Button>
            </div>
          ))}
        </div>
      </Section>

      <Section title="Documentación REST" sub={`Base URL: ${import.meta.env.VITE_FIREBASE_PROJECT_ID ? `https://api.avivacredito.com/hr/v1` : "(configura VITE_API_BASE_URL)"}`} action={
        <Button size="sm" variant="secondary" icon={<Link size={12} />}>Abrir docs</Button>
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
