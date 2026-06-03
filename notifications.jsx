// Aviva HR — Notifications + Settings
const { useState: useNS, useMemo: useNM, useEffect: useNE, useRef: useNR } = React;

// =========================================================================
// Notifications context (very small in-page hub)
// =========================================================================
const NotifCtx = React.createContext({ notify: () => {}, items: [], setItems: () => {} });
function useNotif() { return React.useContext(NotifCtx); }

function NotifProvider({ children }) {
  const [items, setItems] = useNS([
    {
      id: "n1", kind: "offboard", unread: true,
      title: "Nueva baja · Andrés Morales",
      body: "Ticket TKT-2041 creado. Notificado en #people-avisos.",
      when: "hace 4 h",
    },
    {
      id: "n2", kind: "alert", unread: true,
      title: "Tarea fallida en HubSpot",
      body: "TKT-2041: reasignación de 14 contactos · Conflict.",
      when: "hace 2 h",
    },
    {
      id: "n3", kind: "approval", unread: false,
      title: "Aprobación pendiente · IT",
      body: "Mateo García debe revisar TKT-2041.",
      when: "hace 1 h",
    },
    {
      id: "n4", kind: "sync", unread: false,
      title: "Sincronización con Google completada",
      body: "144 cuentas verificadas, 0 inconsistencias.",
      when: "hace 12 min",
    },
  ]);
  const [toasts, setToasts] = useNS([]);

  function notify({ title, body, kind = "info" }) {
    const id = "t" + Date.now() + Math.random().toString(36).slice(2, 6);
    setToasts(t => [...t, { id, title, body, kind }]);
    setItems(it => [{ id: "n" + id, kind, unread: true, title, body, when: "ahora mismo" }, ...it]);
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 5200);
  }

  function dismissToast(id) { setToasts(t => t.filter(x => x.id !== id)); }
  function markAllRead() { setItems(items.map(x => ({ ...x, unread: false }))); }

  return (
    <NotifCtx.Provider value={{ notify, items, setItems, markAllRead }}>
      {children}
      <div className="toast-stack">
        {toasts.map(t => (
          <div key={t.id} className="toast">
            <div className="ic" style={{
              background: t.kind === "error" ? "var(--danger-fg)" : t.kind === "warn" ? "#b67e00" : "var(--green-500)"
            }}>{t.kind === "error" ? "!" : t.kind === "warn" ? "!" : "✓"}</div>
            <div style={{ flex: 1 }}>
              <div className="title">{t.title}</div>
              {t.body && <div className="body">{t.body}</div>}
            </div>
            <button className="close" onClick={() => dismissToast(t.id)}>{Ic.close}</button>
          </div>
        ))}
      </div>
    </NotifCtx.Provider>
  );
}

function NotifBell() {
  const { items, markAllRead } = useNotif();
  const [open, setOpen] = useNS(false);
  const ref = useNR(null);
  const unread = items.filter(x => x.unread).length;

  useNE(() => {
    function onDoc(e) { if (ref.current && !ref.current.contains(e.target)) setOpen(false); }
    if (open) document.addEventListener("click", onDoc);
    return () => document.removeEventListener("click", onDoc);
  }, [open]);

  const KIND_IC = { offboard: "→", onboard: "+", alert: "!", approval: "✓", sync: "↺", info: "·" };

  return (
    <div style={{ position: "relative" }} ref={ref}>
      <button className={"iconbtn " + (unread ? "has-badge" : "")} onClick={(e) => { e.stopPropagation(); setOpen(o => !o); }} title="Notificaciones">
        {Ic.bell}
        {unread > 0 && <span className="badge-dot">{unread}</span>}
      </button>
      {open && (
        <div className="notif-pop">
          <div className="notif-head">
            <h4>Notificaciones</h4>
            <button className="btn sm ghost" onClick={markAllRead}>Marcar todas como leídas</button>
          </div>
          <div className="notif-body">
            {items.length === 0 && <div className="empty">Sin notificaciones</div>}
            {items.map(n => (
              <div key={n.id} className={"notif-item " + (n.unread ? "unread" : "")}>
                <div className="ic" style={{
                  background: n.kind === "alert" ? "var(--danger-bg)" : n.kind === "offboard" ? "var(--danger-bg)" : "var(--mint-50)",
                  color: n.kind === "alert" ? "var(--danger-fg)" : n.kind === "offboard" ? "var(--danger-fg)" : "var(--green-700)"
                }}>{KIND_IC[n.kind] || "·"}</div>
                <div style={{ flex: 1 }}>
                  <div className="title">{n.title}</div>
                  <div className="body">{n.body}</div>
                  <div className="when">{n.when}</div>
                </div>
              </div>
            ))}
          </div>
          <div className="notif-foot">
            <button className="btn sm ghost" style={{ flex: 1 }}>Ver todas</button>
            <button className="btn sm ghost">Configurar</button>
          </div>
        </div>
      )}
    </div>
  );
}

// =========================================================================
// Settings view — real, with sub-sections
// =========================================================================
function SettingsView() {
  const [tab, setTab] = useNS("notifications");
  const tabs = [
    { id: "general",       label: "General",          icon: "cog" },
    { id: "notifications", label: "Notificaciones",   icon: "bell" },
    { id: "gmail",         label: "Conexión Gmail",    icon: "mail" },
    { id: "reminders",     label: "Recordatorios",    icon: "bell" },
    { id: "link-duration", label: "Duración de enlaces", icon: "history" },
    { id: "branding",      label: "Marca",            icon: "user" },
    { id: "roles",         label: "Roles y permisos", icon: "shield" },
    { id: "approvals",     label: "Aprobaciones",     icon: "check" },
    { id: "retention",     label: "Retención de datos", icon: "history" },
    { id: "webhooks",      label: "Webhooks y API",   icon: "link" },
  ];

  return (
    <div className="view-pad">
      <div className="view-head">
        <div>
          <h1>Ajustes</h1>
          <div className="sub">Configuración del workspace de Aviva. Solo administradores.</div>
        </div>
      </div>
      <div className="settings-shell">
        <nav className="settings-nav">
          {tabs.map(t => (
            <button key={t.id} className={tab === t.id ? "active" : ""} onClick={() => setTab(t.id)}>
              {Ic[t.icon]} <span>{t.label}</span>
            </button>
          ))}
        </nav>
        <div>
          {tab === "general"       && <SettingsGeneral/>}
          {tab === "notifications" && <SettingsNotifications/>}
          {tab === "gmail"         && <window.SettingsGmail/>}
          {tab === "reminders"     && <window.SettingsReminders/>}
          {tab === "link-duration" && <window.SettingsLinkDuration/>}
          {tab === "roles"         && <SettingsRoles/>}
          {tab === "approvals"     && <SettingsApprovals/>}
          {tab === "retention"     && <SettingsRetention/>}
          {tab === "webhooks"      && <SettingsWebhooks/>}
          {tab === "branding"      && <SettingsBranding/>}
        </div>
      </div>
    </div>
  );
}

// ----- General -----
function SettingsGeneral() {
  return (
    <div className="settings-section">
      <div className="head">
        <h3>General</h3>
        <div className="sub">Información básica del workspace.</div>
      </div>
      <div className="body">
        <div className="kv">
          <div className="k">Nombre del workspace</div>
          <div className="v"><input type="text" defaultValue="Aviva Crédito" style={{ width: 280, padding: "6px 8px", border: "1px solid var(--line-strong)", borderRadius: 6 }}/></div>
          <div className="k">Dominio corporativo</div>
          <div className="v"><span className="badge neutral">@avivacredito.com</span></div>
          <div className="k">Zona horaria</div>
          <div className="v">America/Mexico_City (GMT−6)</div>
        </div>
      </div>
    </div>
  );
}

// ----- Notifications (Slack alerts) -----
function SettingsNotifications() {
  const [slackEnabled, setSlackEnabled] = useNS(true);
  const [emailEnabled, setEmailEnabled] = useNS(true);
  const events = [
    { id: "offboard.created",  label: "Baja iniciada",                 desc: "Se crea un nuevo ticket de baja.",                   channel: "#people-avisos", slack: true,  email: true,  roles: ["HR", "Manager"] },
    { id: "offboard.approved", label: "Baja aprobada por completo",    desc: "Las tres aprobaciones (Manager, HR, IT) están listas.", channel: "#people-avisos", slack: true,  email: false, roles: ["HR", "IT"] },
    { id: "offboard.completed",label: "Baja ejecutada",                desc: "Todas las tareas automáticas terminaron.",            channel: "#people-bajas",  slack: true,  email: true,  roles: ["HR", "IT", "Manager"] },
    { id: "offboard.failed",   label: "Tarea de baja fallida",         desc: "Una tarea automática falló y necesita atención.",     channel: "#it-alertas",    slack: true,  email: true,  roles: ["IT"] },
    { id: "onboard.created",   label: "Alta creada",                   desc: "Se invita a una nueva persona.",                      channel: "#people-altas",  slack: true,  email: false, roles: ["HR", "Manager"] },
    { id: "onboard.firstlogin",label: "Primer login de un invitado",   desc: "La persona acepta la invitación y entra por SSO.",    channel: "#people-altas",  slack: true,  email: false, roles: ["HR"] },
    { id: "access.granted",    label: "Acceso otorgado fuera de plantilla", desc: "Se da acceso manual a una app sensible.",        channel: "#it-alertas",    slack: true,  email: true,  roles: ["IT"] },
    { id: "device.unreturned", label: "Equipo no devuelto a tiempo",   desc: "Una persona en baja no entregó su equipo en plazo.", channel: "#it-alertas",    slack: false, email: true,  roles: ["IT", "Operaciones"] },
  ];

  return (
    <React.Fragment>
      <div className="settings-section">
        <div className="head" style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <h3>Canales conectados</h3>
            <div className="sub">Aviva HR envía alertas en estos canales cuando ocurren eventos de personas.</div>
          </div>
          <button className="btn">{Ic.plus} Conectar canal</button>
        </div>
        <div className="body">
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <ChannelRow
              icon="#" iconColor="#611f69" iconBg="#611f6914"
              name="Slack" workspace="aviva-credito.slack.com"
              status={slackEnabled} onToggle={setSlackEnabled}
              meta="4 canales · 8 eventos suscritos · webhook OK"
            />
            <ChannelRow
              icon="@" iconColor="#1b3f8a" iconBg="#1b3f8a14"
              name="Email" workspace="people@aviva.com"
              status={emailEnabled} onToggle={setEmailEnabled}
              meta="HR Business Partners + Managers"
            />
          </div>
        </div>
      </div>

      <div className="settings-section">
        <div className="head">
          <h3>Reglas de alertas</h3>
          <div className="sub">Define qué eventos disparan una notificación, a qué canal y a qué roles.</div>
        </div>
        <div className="body" style={{ padding: 0 }}>
          {events.map((e, i) => (
            <AlertRule key={e.id} rule={e} last={i === events.length - 1}/>
          ))}
        </div>
      </div>

      <div className="settings-section">
        <div className="head">
          <h3>Previsualización de mensaje de Slack</h3>
          <div className="sub">Así verá el equipo una baja recién creada en #people-avisos.</div>
        </div>
        <div className="body">
          <SlackPreview/>
        </div>
      </div>
    </React.Fragment>
  );
}

function ChannelRow({ icon, iconColor, iconBg, name, workspace, status, onToggle, meta }) {
  return (
    <div className="row" style={{ padding: 14, border: "1px solid var(--line)", borderRadius: 12, background: "var(--surface)" }}>
      <div style={{
        width: 38, height: 38, borderRadius: 10, background: iconBg, color: iconColor,
        display: "grid", placeItems: "center", fontWeight: 700, fontSize: 16
      }}>{icon}</div>
      <div style={{ flex: 1 }}>
        <div style={{ fontWeight: 600 }}>{name}</div>
        <div className="muted" style={{ fontSize: 12 }}>{workspace}</div>
        <div className="muted" style={{ fontSize: 11.5, marginTop: 2 }}>{meta}</div>
      </div>
      <label className="switch">
        <input type="checkbox" checked={status} onChange={e => onToggle(e.target.checked)}/>
        <span className="track"/><span className="thumb"/>
      </label>
    </div>
  );
}

function AlertRule({ rule, last }) {
  const [slack, setSlack] = useNS(rule.slack);
  const [email, setEmail] = useNS(rule.email);
  return (
    <div className="row" style={{ padding: "14px 18px", borderBottom: last ? 0 : "1px solid var(--line)", gap: 14 }}>
      <div style={{ flex: 1 }}>
        <div style={{ fontWeight: 600, fontSize: 13.5 }}>{rule.label}</div>
        <div className="muted" style={{ fontSize: 12, marginTop: 2 }}>{rule.desc}</div>
        <div className="row" style={{ marginTop: 6, gap: 6, flexWrap: "wrap" }}>
          <span className="channel-pill">{rule.channel}</span>
          {rule.roles.map(r => <span key={r} className="badge neutral">{r}</span>)}
        </div>
      </div>
      <div className="col" style={{ gap: 4, alignItems: "center", width: 80 }}>
        <span style={{ fontSize: 11, color: "var(--ink-3)", textTransform: "uppercase", letterSpacing: 0.05 }}>Slack</span>
        <label className="switch"><input type="checkbox" checked={slack} onChange={e => setSlack(e.target.checked)}/><span className="track"/><span className="thumb"/></label>
      </div>
      <div className="col" style={{ gap: 4, alignItems: "center", width: 80 }}>
        <span style={{ fontSize: 11, color: "var(--ink-3)", textTransform: "uppercase", letterSpacing: 0.05 }}>Email</span>
        <label className="switch"><input type="checkbox" checked={email} onChange={e => setEmail(e.target.checked)}/><span className="track"/><span className="thumb"/></label>
      </div>
    </div>
  );
}

function SlackPreview() {
  return (
    <div style={{
      background: "#fff", border: "1px solid #e5e5e0", borderRadius: 10,
      padding: 14, fontSize: 13, maxWidth: 540
    }}>
      <div className="row" style={{ gap: 10 }}>
        <div className="av c1" style={{ background: "var(--mint-100)", color: "var(--green-700)", borderRadius: 6 }}>av</div>
        <div className="col">
          <div className="row" style={{ gap: 6 }}>
            <b style={{ color: "#000" }}>Aviva HR</b>
            <span style={{ fontSize: 11, background: "#e5e5e0", color: "#3a3a3a", padding: "0 4px", borderRadius: 3, fontWeight: 600 }}>APP</span>
            <span className="muted" style={{ fontSize: 11 }}>16:42</span>
          </div>
          <div style={{ marginTop: 6, paddingLeft: 12, borderLeft: "3px solid var(--danger-fg)" }}>
            <div style={{ fontWeight: 600, color: "#000" }}>🔴 Nueva baja iniciada · TKT-2041</div>
            <div className="muted" style={{ marginTop: 4 }}>
              <b style={{ color: "#000" }}>Andrés Morales</b> · Backend Engineer · Ingeniería<br/>
              Motivo: cambio voluntario · Última jornada: <b style={{ color: "#000" }}>30 may</b>
            </div>
            <div className="row" style={{ marginTop: 8, gap: 6 }}>
              <button className="btn sm primary">Aprobar</button>
              <button className="btn sm">Ver ticket</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ----- Roles & Permissions (dynamic) -----
function SettingsRoles() {
  const [roles, setRoles] = useNS(window.CatalogData.roles);
  const PERMS = window.CatalogData.permissions;
  const SCOPE_LABEL = window.CatalogData.scopeLabel;
  const SCOPE_COLOR = window.CatalogData.scopeColor;
  const [editing, setEditing] = useNS(null);

  // Persist back so other views can read
  useNE(() => { window.CatalogData.roles = roles; }, [roles]);

  function blankRole() {
    const perms = {};
    PERMS.forEach(p => perms[p.id] = "none");
    return { id: null, name: "", desc: "", icon: "shield", color: "#16b877", members: 0, perms };
  }
  function save(r) {
    setRoles(prev => {
      if (!r.id) return [...prev, { ...r, id: "r-" + Date.now() }];
      return prev.map(x => x.id === r.id ? r : x);
    });
    setEditing(null);
  }
  function remove(id) {
    if (!confirm("¿Eliminar este rol? Las personas asignadas quedarán sin él.")) return;
    setRoles(prev => prev.filter(r => r.id !== id));
  }

  function ScopePill({ value }) {
    const c = SCOPE_COLOR[value] || SCOPE_COLOR.none;
    return <span className="scope-pill" style={{ background: c.bg, color: c.fg, borderColor: c.fg + "33" }}>{SCOPE_LABEL[value] || value}</span>;
  }

  return (
    <React.Fragment>
      <div className="settings-section">
        <div className="head" style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <h3>Roles ({roles.length})</h3>
            <div className="sub">Cada persona pertenece a uno o varios roles. Los permisos se acumulan.</div>
          </div>
          <button className="btn accent" onClick={() => setEditing(blankRole())}>{Ic.plus} Nuevo rol</button>
        </div>
        <div className="body" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 12 }}>
          {roles.map(r => (
            <div key={r.id} className="role-card" style={{ borderLeft: "3px solid " + r.color }}>
              <div className="role-ic" style={{ background: r.color + "18", color: r.color }}>{Ic[r.icon] || Ic.shield}</div>
              <div className="role-info">
                <div className="role-name">{r.name}</div>
                <div className="role-desc">{r.desc}</div>
                <div className="role-count" style={{ marginTop: 4 }}>{r.members} persona{r.members !== 1 ? "s" : ""}{" · "}
                  <b>{Object.values(r.perms).filter(v => v !== "none").length}</b>/{PERMS.length} permisos
                </div>
              </div>
              <div className="col" style={{ gap: 4 }}>
                <button className="btn sm" onClick={() => setEditing(r)}>{Ic.edit}</button>
                <button className="iconbtn" onClick={() => remove(r.id)} title="Eliminar">{Ic.close}</button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="settings-section">
        <div className="head">
          <h3>Matriz de permisos</h3>
          <div className="sub">Vista cruzada de roles × permisos. Edita un rol para cambiar sus accesos.</div>
        </div>
        <div className="body" style={{ padding: 0, overflowX: "auto" }}>
          <table className="perm-matrix">
            <thead>
              <tr>
                <th>Permiso</th>
                {roles.map(r => (
                  <th key={r.id} className="perm-role-head">
                    <div className="col" style={{ alignItems: "center", gap: 4 }}>
                      <div className="role-ic" style={{ width: 24, height: 24, background: r.color + "18", color: r.color, borderRadius: 6 }}>{Ic[r.icon] || Ic.shield}</div>
                      <span>{r.name}</span>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {(() => {
                const groups = {};
                PERMS.forEach(p => { (groups[p.group || "General"] = groups[p.group || "General"] || []).push(p); });
                return Object.entries(groups).flatMap(([groupName, perms]) => [
                  <tr key={"g-" + groupName} className="perm-group-row">
                    <td colSpan={roles.length + 1}>{groupName}</td>
                  </tr>,
                  ...perms.map(perm => (
                    <tr key={perm.id}>
                      <td>
                        <div style={{ fontWeight: 600, fontSize: 13 }}>{perm.label}</div>
                        <div className="desc">{perm.desc}</div>
                      </td>
                      {roles.map(r => (
                        <td key={r.id} style={{ textAlign: "center" }}>
                          <ScopePill value={r.perms[perm.id] || "none"}/>
                        </td>
                      ))}
                    </tr>
                  )),
                ]);
              })()}
            </tbody>
          </table>
        </div>
      </div>

      <Modal open={!!editing} onClose={() => setEditing(null)}>
        {editing && <RoleEditorModal role={editing} permissions={PERMS} scopeLabel={SCOPE_LABEL} scopeColor={SCOPE_COLOR}
          onClose={() => setEditing(null)} onSave={save}/>}
      </Modal>
    </React.Fragment>
  );
}

function RoleEditorModal({ role, permissions, scopeLabel, scopeColor, onClose, onSave }) {
  const [form, setForm] = useNS({ ...role, perms: { ...role.perms } });
  function f(k, v) { setForm(p => ({ ...p, [k]: v })); }
  function setPerm(id, v) { setForm(p => ({ ...p, perms: { ...p.perms, [id]: v } })); }

  const palette = ["#16b877","#026149","#1b3f8a","#5c2e8e","#b15a0c","#9b1c2b","#6b716b"];
  const icons = ["shield","users","plug","user","cog","map"];

  return (
    <div className="panel" style={{ width: "min(720px, 96vw)", maxHeight: "90vh" }}>
      <div className="row" style={{ padding: "14px 20px", borderBottom: "1px solid var(--line)" }}>
        <div className="role-ic" style={{ background: form.color + "18", color: form.color, width: 40, height: 40 }}>
          {Ic[form.icon] || Ic.shield}
        </div>
        <div className="col">
          <div style={{ fontWeight: 600, fontSize: 15 }}>{role.id ? "Editar rol" : "Nuevo rol"}</div>
          <div style={{ fontSize: 12, color: "var(--ink-3)" }}>Los cambios afectan a {role.members || 0} persona{role.members !== 1 ? "s" : ""} de inmediato.</div>
        </div>
        <span style={{ flex: 1 }}/>
        <button className="iconbtn" onClick={onClose}>{Ic.close}</button>
      </div>

      <div style={{ padding: 20, overflow: "auto" }}>
        <div className="edit-section">
          <div className="edit-section-head">Identidad</div>
          <div className="field-row">
            <div className="field"><label>Nombre del rol</label>
              <input type="text" value={form.name} onChange={e => f("name", e.target.value)} placeholder="Ej. HR Business Partner"/>
            </div>
          </div>
          <div className="field"><label>Descripción</label>
            <input type="text" value={form.desc} onChange={e => f("desc", e.target.value)} placeholder="Qué hace este rol en una línea"/>
          </div>
          <div className="field-row">
            <div className="field">
              <label>Color</label>
              <div className="row" style={{ gap: 6, flexWrap: "wrap" }}>
                {palette.map(c => (
                  <button key={c} type="button" onClick={() => f("color", c)}
                    className={"swatch-btn " + (form.color === c ? "active" : "")}
                    style={{ background: c + "20", border: "2px solid " + (form.color === c ? c : "transparent") }}>
                    <span style={{ background: c }}/>
                  </button>
                ))}
              </div>
            </div>
            <div className="field">
              <label>Ícono</label>
              <div className="row" style={{ gap: 6, flexWrap: "wrap" }}>
                {icons.map(ic => (
                  <button key={ic} type="button" onClick={() => f("icon", ic)}
                    className={"icon-pick " + (form.icon === ic ? "active" : "")}>
                    {Ic[ic]}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="edit-section">
          <div className="edit-section-head">Permisos ({Object.values(form.perms).filter(v => v !== "none").length} activos)</div>
          <div className="perm-editor">
            {(() => {
              const groups = {};
              permissions.forEach(p => { (groups[p.group || "General"] = groups[p.group || "General"] || []).push(p); });
              return Object.entries(groups).flatMap(([groupName, perms]) => [
                <div key={"gh-" + groupName} className="perm-group-header">{groupName}</div>,
                ...perms.map(perm => (
                  <div key={perm.id} className="perm-row">
                    <div className="perm-row-info">
                      <div style={{ fontWeight: 600, fontSize: 13.5 }}>{perm.label}</div>
                      <div style={{ fontSize: 12, color: "var(--ink-3)" }}>{perm.desc}</div>
                    </div>
                    <div className="perm-scope-row">
                      {perm.scopes.map(s => {
                        const c = scopeColor[s] || scopeColor.none;
                        const active = (form.perms[perm.id] || "none") === s;
                        return (
                          <button key={s} type="button"
                            onClick={() => setPerm(perm.id, s)}
                            className={"scope-btn " + (active ? "active" : "")}
                            style={active ? { background: c.bg, color: c.fg, borderColor: c.fg + "55" } : null}>
                            {scopeLabel[s] || s}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )),
              ]);
            })()}
          </div>
        </div>
      </div>

      <div style={{ padding: 14, borderTop: "1px solid var(--line)", display: "flex", gap: 8, alignItems: "center", background: "var(--surface)" }}>
        <span style={{ fontSize: 12, color: "var(--ink-3)" }}>Los cambios se reflejan al instante en la matriz.</span>
        <span style={{ flex: 1 }}/>
        <button className="btn" onClick={onClose}>Cancelar</button>
        <button className="btn accent" onClick={() => onSave(form)}>{Ic.check} Guardar</button>
      </div>
    </div>
  );
}

// ----- Approvals -----
function SettingsApprovals() {
  return (
    <div className="settings-section">
      <div className="head">
        <h3>Cadena de aprobaciones</h3>
        <div className="sub">Quién debe aprobar antes de ejecutar tareas irreversibles.</div>
      </div>
      <div className="body">
        {[
          { evt: "Alta de persona",      chain: ["HR Business Partner"] },
          { evt: "Baja por renuncia",    chain: ["Manager directo", "HR Business Partner", "IT / Sistemas"] },
          { evt: "Baja por despido",     chain: ["HR Business Partner", "Legal", "IT / Sistemas"] },
          { evt: "Suspensión inmediata", chain: ["HR Business Partner", "Legal"] },
          { evt: "Acceso a app sensible", chain: ["Manager directo", "IT / Sistemas"] },
        ].map((row, i) => (
          <div key={i} className="row" style={{ padding: "14px 0", borderBottom: i < 4 ? "1px dashed var(--line)" : 0, gap: 16 }}>
            <div style={{ width: 220, fontWeight: 600, fontSize: 13.5 }}>{row.evt}</div>
            <div className="row" style={{ flex: 1, gap: 6, flexWrap: "wrap" }}>
              {row.chain.map((step, j) => (
                <React.Fragment key={j}>
                  <span style={{
                    padding: "6px 10px",
                    background: "var(--mint-50)",
                    color: "var(--green-700)",
                    border: "1px solid var(--mint-100)",
                    borderRadius: 8, fontSize: 12.5, fontWeight: 600
                  }}>{step}</span>
                  {j < row.chain.length - 1 && <span className="muted">{Ic.arrowR}</span>}
                </React.Fragment>
              ))}
            </div>
            <button className="btn sm">Editar</button>
          </div>
        ))}
      </div>
    </div>
  );
}

function SettingsRetention() {
  return (
    <div className="settings-section">
      <div className="head"><h3>Retención de datos</h3>
        <div className="sub">Cuánto tiempo se conservan los datos tras una baja.</div>
      </div>
      <div className="body">
        <div className="kv">
          <div className="k">Perfil archivado</div><div className="v">90 días tras la última jornada</div>
          <div className="k">Documentos legales (contrato, finiquito)</div><div className="v">10 años (obligación legal ES)</div>
          <div className="k">Log de auditoría</div><div className="v">5 años</div>
          <div className="k">Backups cifrados</div><div className="v">30 días</div>
          <div className="k">Cuenta SSO / email</div><div className="v">Desactivada el día de baja · borrada a los 30 días</div>
        </div>
      </div>
    </div>
  );
}

function SettingsWebhooks() {
  return (
    <React.Fragment>
      <SettingsAPIKeys/>
      <SettingsWebhooksList/>
      <SettingsAPIEvents/>
      <SettingsAPIDocs/>
    </React.Fragment>
  );
}

function SettingsAPIKeys() {
  const [keys, setKeys] = useNS([
    { id: "k1", name: "Producción · Backend",   prefix: "ak_live_w7F2",  scopes: ["users:read", "users:write", "tickets:read"], created: "2026-01-15", lastUsed: "hace 4 min", status: "ok",      author: "Amran Frey" },
    { id: "k2", name: "Staging · Backend",      prefix: "ak_test_2qD9",  scopes: ["users:read", "users:write"],                created: "2026-02-08", lastUsed: "hace 1 h",   status: "ok",      author: "Amran Frey" },
    { id: "k3", name: "BI · Lectura",           prefix: "ak_live_bM4r",  scopes: ["users:read", "audit:read"],                 created: "2026-03-22", lastUsed: "hace 2 d",   status: "ok",      author: "Sofía Ramírez" },
    { id: "k4", name: "HubSpot Sync",           prefix: "ak_live_h0p1",  scopes: ["users:read", "users:write", "events:write"],created: "2025-12-04", lastUsed: "hace 1 min", status: "ok",      author: "Andrés Arías" },
    { id: "k5", name: "Webhooks Slack viejo",   prefix: "ak_live_old3",  scopes: ["events:write"],                              created: "2025-08-20", lastUsed: "hace 47 d",  status: "stale",   author: "Paula Acevedo" },
  ]);
  const [showNew, setShowNew] = useNS(false);
  const [created, setCreated] = useNS(null);
  const [rotating, setRotating] = useNS(null);
  const [revoking, setRevoking] = useNS(null);

  function generate(name, scopes) {
    const id = "k" + (keys.length + 1);
    const prefix = "ak_live_" + Math.random().toString(36).slice(2, 6);
    const full = prefix + "_" + Math.random().toString(36).slice(2, 18) + Math.random().toString(36).slice(2, 18);
    const newKey = { id, name, prefix, scopes, created: "ahora", lastUsed: "nunca", status: "ok", author: "Tú" };
    setKeys([newKey, ...keys]);
    setCreated({ ...newKey, full });
    setShowNew(false);
  }

  function rotate(k) {
    const newPrefix = "ak_live_" + Math.random().toString(36).slice(2, 6);
    const full = newPrefix + "_" + Math.random().toString(36).slice(2, 18) + Math.random().toString(36).slice(2, 18);
    const rotated = { ...k, prefix: newPrefix, lastUsed: "nunca", status: "ok" };
    setKeys(keys.map(x => x.id === k.id ? rotated : x));
    setRotating(null);
    setCreated({ ...rotated, full });
  }

  function revoke(id) {
    setKeys(keys.filter(k => k.id !== id));
    setRevoking(null);
  }

  return (
    <React.Fragment>
      <div className="settings-section">
        <div className="head" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div>
            <h3>API Keys</h3>
            <div className="sub">Para conectar Aviva HR a tus servicios (BI, integraciones internas, sincronización con HubSpot).</div>
          </div>
          <button className="btn accent" onClick={() => setShowNew(true)}>{Ic.plus} Nueva API Key</button>
        </div>
        <div className="body" style={{ padding: 0 }}>
          {keys.map((k, i) => (
            <div key={k.id} className="api-key-row">
              <div className="api-key-ic">{Ic.shield}</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div className="row" style={{ gap: 8 }}>
                  <b>{k.name}</b>
                  {k.status === "stale" && <span className="badge suspended"><span className="dot"/>Sin uso 30+ días</span>}
                </div>
                <code className="api-key-mask">{k.prefix}_•••••••••••••••••••••</code>
                <div className="row" style={{ gap: 4, flexWrap: "wrap", marginTop: 6 }}>
                  {k.scopes.map(s => <span key={s} className="scope-pill">{s}</span>)}
                </div>
                <div style={{ fontSize: 11, color: "var(--ink-3)", marginTop: 6 }}>
                  Creada {k.created} por {k.author} · último uso {k.lastUsed}
                </div>
              </div>
              <div className="row" style={{ gap: 6 }}>
                <button className="btn sm" onClick={() => setRotating(k)}>Rotar</button>
                <button className="btn sm danger" onClick={() => setRevoking(k)}>Revocar</button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {showNew   && <NewKeyForm onClose={() => setShowNew(false)} onGenerate={generate}/>}
      {created   && <CreatedKeyView k={created} onClose={() => setCreated(null)}/>}
      {rotating  && <RotateKeyConfirm k={rotating} onClose={() => setRotating(null)} onConfirm={rotate}/>}
      {revoking  && <RevokeKeyConfirm k={revoking} onClose={() => setRevoking(null)} onConfirm={revoke}/>}
    </React.Fragment>
  );
}

function NewKeyForm({ onClose, onGenerate }) {
  const [name, setName] = useNS("");
  const [scopes, setScopes] = useNS(["users:read"]);
  const SCOPES = [
    { id: "users:read",     label: "Leer colaboradores", desc: "Listar y consultar datos del directorio." },
    { id: "users:write",    label: "Crear y editar colaboradores", desc: "Altas, ediciones de campos, asignación de hubs/quioscos." },
    { id: "users:delete",   label: "Iniciar bajas",       desc: "Crear tickets de offboarding." },
    { id: "tickets:read",   label: "Leer tickets",        desc: "Consultar el estado y la cola de tickets." },
    { id: "tickets:write",  label: "Aprobar / ejecutar tickets", desc: "Mover tickets entre estados." },
    { id: "audit:read",     label: "Leer auditoría",      desc: "Acceso al log inmutable de eventos." },
    { id: "events:write",   label: "Enviar eventos",      desc: "Publicar eventos hacia webhooks externos." },
    { id: "integrations:read", label: "Leer integraciones", desc: "Estado de apps conectadas." },
  ];
  function toggle(s) {
    setScopes(scopes.includes(s) ? scopes.filter(x => x !== s) : [...scopes, s]);
  }
  return (
    <React.Fragment>
      <div className="scrim" onClick={onClose}/>
      <div className="modal">
        <div className="panel" style={{ width: "min(580px, 96vw)" }}>
          <div className="row" style={{ padding: "14px 20px", borderBottom: "1px solid var(--line)" }}>
            <div className="col">
              <div style={{ fontWeight: 600, fontSize: 15 }}>Nueva API Key</div>
              <div style={{ fontSize: 12, color: "var(--ink-3)" }}>Define un nombre y los permisos. La key solo se mostrará una vez.</div>
            </div>
            <span style={{ flex: 1 }}/>
            <button className="iconbtn" onClick={onClose}>{Ic.close}</button>
          </div>
          <div style={{ padding: 20, maxHeight: "60vh", overflow: "auto" }}>
            <div className="field">
              <label>Nombre descriptivo</label>
              <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="ej. Sincronizador BI"/>
              <span className="hint">Para identificarla después en este listado.</span>
            </div>
            <div className="field">
              <label>Permisos (scopes)</label>
              <span className="hint">Sigue el principio de mínimo privilegio.</span>
              <div className="col" style={{ gap: 6, marginTop: 8 }}>
                {SCOPES.map(s => (
                  <label key={s.id} className="row" style={{
                    gap: 10, padding: 10,
                    border: "1px solid var(--line)", borderRadius: 8,
                    background: scopes.includes(s.id) ? "var(--mint-50)" : "var(--surface)",
                    cursor: "pointer"
                  }}>
                    <input type="checkbox" className="cb" checked={scopes.includes(s.id)} onChange={() => toggle(s.id)}/>
                    <div style={{ flex: 1 }}>
                      <div className="row" style={{ gap: 8 }}>
                        <code style={{ fontSize: 11, fontFamily: "var(--mono)", color: "var(--green-700)", fontWeight: 600 }}>{s.id}</code>
                        <span style={{ fontWeight: 600, fontSize: 13 }}>{s.label}</span>
                      </div>
                      <div style={{ fontSize: 11.5, color: "var(--ink-3)", marginTop: 2 }}>{s.desc}</div>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          </div>
          <div style={{ padding: 14, borderTop: "1px solid var(--line)", display: "flex", gap: 8 }}>
            <button className="btn ghost" onClick={onClose}>Cancelar</button>
            <span style={{ flex: 1 }}/>
            <button className="btn primary" disabled={!name || scopes.length === 0} onClick={() => onGenerate(name, scopes)}>
              {Ic.plus} Generar API Key
            </button>
          </div>
        </div>
      </div>
    </React.Fragment>
  );
}

function CreatedKeyView({ k, onClose }) {
  const [copied, setCopied] = useNS(false);
  function copy() {
    navigator.clipboard?.writeText(k.full);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }
  return (
    <React.Fragment>
      <div className="scrim" onClick={onClose}/>
      <div className="modal">
        <div className="panel" style={{ width: "min(540px, 96vw)" }}>
          <div className="row" style={{ padding: "14px 20px", borderBottom: "1px solid var(--line)" }}>
            <div className="col">
              <div style={{ fontWeight: 600, fontSize: 15 }}>API Key generada</div>
            </div>
            <span style={{ flex: 1 }}/>
            <button className="iconbtn" onClick={onClose}>{Ic.close}</button>
          </div>
          <div style={{ padding: 20 }}>
            <div className="row" style={{ gap: 8, padding: 12, background: "#fff3d6", color: "#8a5a00", borderRadius: 10, fontSize: 13, marginBottom: 16 }}>
              {Ic.warn} <span>Copia y guarda esta key ahora. <b>No la podrás ver de nuevo.</b></span>
            </div>
            <div className="field">
              <label>{k.name}</label>
              <div className="row" style={{ gap: 6 }}>
                <code style={{
                  flex: 1, padding: "10px 12px",
                  background: "var(--ink)", color: "#cfeede",
                  borderRadius: 8, fontFamily: "var(--mono)", fontSize: 12.5,
                  wordBreak: "break-all", lineHeight: 1.4
                }}>{k.full}</code>
                <button className="btn" onClick={copy} style={{ height: 42 }}>
                  {copied ? <>{Ic.check} Copiado</> : <>{Ic.link} Copiar</>}
                </button>
              </div>
            </div>
            <div className="field">
              <label>Permisos asignados</label>
              <div className="row" style={{ gap: 4, flexWrap: "wrap" }}>
                {k.scopes.map(s => <span key={s} className="scope-pill">{s}</span>)}
              </div>
            </div>
          </div>
          <div style={{ padding: 14, borderTop: "1px solid var(--line)", display: "flex", gap: 8 }}>
            <span style={{ flex: 1 }}/>
            <button className="btn primary" onClick={onClose}>Listo, ya la guardé</button>
          </div>
        </div>
      </div>
    </React.Fragment>
  );
}

function RotateKeyConfirm({ k, onClose, onConfirm }) {
  return (
    <React.Fragment>
      <div className="scrim" onClick={onClose}/>
      <div className="modal">
        <div className="panel" style={{ width: "min(480px, 96vw)" }}>
          <div className="row" style={{ padding: "14px 20px", borderBottom: "1px solid var(--line)" }}>
            <div className="col">
              <div style={{ fontWeight: 600, fontSize: 15 }}>Rotar API Key</div>
              <div style={{ fontSize: 12, color: "var(--ink-3)" }}>Se generará una nueva key con los mismos permisos.</div>
            </div>
            <span style={{ flex: 1 }}/>
            <button className="iconbtn" onClick={onClose}>{Ic.close}</button>
          </div>
          <div style={{ padding: 20 }}>
            <div className="row" style={{ gap: 8, padding: 12, background: "#fff3d6", color: "#8a5a00", borderRadius: 10, fontSize: 13, marginBottom: 16 }}>
              {Ic.warn} <span>La key actual (<code style={{ fontFamily: "var(--mono)" }}>{k.prefix}_•••</code>) quedará <b>inválida de inmediato</b>.</span>
            </div>
            <div style={{ fontSize: 13, color: "var(--ink-2)", lineHeight: 1.6 }}>
              Cualquier servicio que use esta key dejará de funcionar hasta que actualices el secreto. Asegúrate de tener acceso al sistema de destino antes de continuar.
            </div>
          </div>
          <div style={{ padding: 14, borderTop: "1px solid var(--line)", display: "flex", gap: 8 }}>
            <button className="btn ghost" onClick={onClose}>Cancelar</button>
            <span style={{ flex: 1 }}/>
            <button className="btn primary" onClick={() => onConfirm(k)}>{Ic.refresh} Rotar y mostrar nueva key</button>
          </div>
        </div>
      </div>
    </React.Fragment>
  );
}

function RevokeKeyConfirm({ k, onClose, onConfirm }) {
  const [typed, setTyped] = useNS("");
  const confirmed = typed === k.name;
  return (
    <React.Fragment>
      <div className="scrim" onClick={onClose}/>
      <div className="modal">
        <div className="panel" style={{ width: "min(480px, 96vw)" }}>
          <div className="row" style={{ padding: "14px 20px", borderBottom: "1px solid var(--line)" }}>
            <div className="col">
              <div style={{ fontWeight: 600, fontSize: 15 }}>Revocar API Key</div>
              <div style={{ fontSize: 12, color: "var(--danger-fg)" }}>Esta acción es permanente e irreversible.</div>
            </div>
            <span style={{ flex: 1 }}/>
            <button className="iconbtn" onClick={onClose}>{Ic.close}</button>
          </div>
          <div style={{ padding: 20 }}>
            <div className="row" style={{ gap: 8, padding: 12, background: "var(--danger-bg)", color: "var(--danger-fg)", borderRadius: 10, fontSize: 13, marginBottom: 16 }}>
              {Ic.warn} <span>La key <code style={{ fontFamily: "var(--mono)" }}>{k.prefix}_•••</code> quedará <b>inválida permanentemente</b>.</span>
            </div>
            <div className="field">
              <label>Escribe <b>{k.name}</b> para confirmar</label>
              <input type="text" value={typed} onChange={e => setTyped(e.target.value)} placeholder={k.name} autoFocus/>
            </div>
          </div>
          <div style={{ padding: 14, borderTop: "1px solid var(--line)", display: "flex", gap: 8 }}>
            <button className="btn ghost" onClick={onClose}>Cancelar</button>
            <span style={{ flex: 1 }}/>
            <button className="btn danger" disabled={!confirmed} onClick={() => onConfirm(k.id)}>Revocar definitivamente</button>
          </div>
        </div>
      </div>
    </React.Fragment>
  );
}

const ALL_WEBHOOK_EVENTS = [
  "users.created", "users.updated", "users.deleted",
  "onboard.created", "onboard.firstlogin",
  "offboard.created", "offboard.approved", "offboard.completed", "offboard.failed",
  "access.granted", "access.revoked",
  "device.assigned", "sync.completed",
];

function SettingsWebhooksList() {
  const [hooks, setHooks] = useNS([
    { id: "wh1", url: "https://api.aviva.com/hr/people-events",  events: ["onboard.*", "offboard.*"],          secret: "", status: "ok",   last: "hace 2 min · 200" },
    { id: "wh2", url: "https://hooks.hubspot.com/aviva-people",  events: ["users.created", "users.updated"],   secret: "", status: "ok",   last: "hace 8 min · 200" },
    { id: "wh3", url: "https://hooks.datadog.com/aviva-hr",      events: ["offboard.failed", "sync.completed"],secret: "", status: "ok",   last: "hace 1 h · 200" },
    { id: "wh4", url: "https://internal.aviva.com/audit-stream", events: ["*"],                                secret: "", status: "warn", last: "hace 14 min · 503" },
  ]);
  const [showNew, setShowNew] = useNS(false);
  const [editing, setEditing] = useNS(null);

  function saveHook(hook) {
    if (hook.id) {
      setHooks(hooks.map(h => h.id === hook.id ? { ...h, ...hook } : h));
    } else {
      setHooks([...hooks, { ...hook, id: "wh" + Date.now(), status: "ok", last: "nunca" }]);
    }
    setShowNew(false);
    setEditing(null);
  }

  function deleteHook(id) {
    setHooks(hooks.filter(h => h.id !== id));
    setEditing(null);
  }

  return (
    <React.Fragment>
      <div className="settings-section">
        <div className="head" style={{ display: "flex", justifyContent: "space-between" }}>
          <div>
            <h3>Webhooks salientes</h3>
            <div className="sub">Aviva HR envía eventos POST JSON a estos endpoints.</div>
          </div>
          <button className="btn accent" onClick={() => setShowNew(true)}>{Ic.plus} Nuevo webhook</button>
        </div>
        <div className="body" style={{ padding: 0 }}>
          {hooks.map((h, i) => (
            <div key={h.id} className="row" style={{ padding: "14px 18px", borderBottom: i < hooks.length - 1 ? "1px solid var(--line)" : 0, gap: 12, flexWrap: "wrap" }}>
              <code style={{ background: "var(--surface-2)", padding: "4px 10px", borderRadius: 4, fontSize: 12, fontFamily: "var(--mono)" }}>{h.url}</code>
              <div className="row" style={{ gap: 4, flexWrap: "wrap" }}>
                {h.events.map(e => <span key={e} className="scope-pill">{e}</span>)}
              </div>
              <span style={{ flex: 1 }}/>
              <span style={{ fontSize: 11.5, color: "var(--ink-3)" }}>{h.last}</span>
              {h.status === "ok"
                ? <span className="badge active"><span className="dot"/>OK</span>
                : <span className="badge suspended"><span className="dot"/>1 fallo</span>}
              <button className="btn sm" onClick={() => setEditing(h)}>Editar</button>
            </div>
          ))}
        </div>
      </div>

      {showNew && <WebhookForm onClose={() => setShowNew(false)} onSave={saveHook}/>}
      {editing  && <WebhookForm hook={editing} onClose={() => setEditing(null)} onSave={saveHook} onDelete={deleteHook}/>}
    </React.Fragment>
  );
}

function WebhookForm({ hook, onClose, onSave, onDelete }) {
  const isEdit = !!hook;
  const [url, setUrl] = useNS(hook?.url ?? "");
  const [secret, setSecret] = useNS(hook?.secret ?? "");
  const [events, setEvents] = useNS(hook?.events ?? []);
  const [confirmDelete, setConfirmDelete] = useNS(false);

  function toggleEvent(e) {
    if (e === "*") {
      setEvents(events.includes("*") ? [] : ["*"]);
      return;
    }
    const without = events.filter(x => x !== "*");
    setEvents(without.includes(e) ? without.filter(x => x !== e) : [...without, e]);
  }

  function handleSave() {
    onSave({ ...(hook ?? {}), url: url.trim(), secret: secret.trim(), events });
  }

  const valid = url.trim().startsWith("http") && events.length > 0;

  return (
    <React.Fragment>
      <div className="scrim" onClick={onClose}/>
      <div className="modal">
        <div className="panel" style={{ width: "min(600px, 96vw)" }}>
          <div className="row" style={{ padding: "14px 20px", borderBottom: "1px solid var(--line)" }}>
            <div className="col">
              <div style={{ fontWeight: 600, fontSize: 15 }}>{isEdit ? "Editar webhook" : "Nuevo webhook"}</div>
              <div style={{ fontSize: 12, color: "var(--ink-3)" }}>Aviva HR enviará un POST JSON firmado a esta URL.</div>
            </div>
            <span style={{ flex: 1 }}/>
            <button className="iconbtn" onClick={onClose}>{Ic.close}</button>
          </div>

          <div style={{ padding: 20, maxHeight: "65vh", overflowY: "auto" }}>
            <div className="field">
              <label>URL del endpoint</label>
              <input type="url" value={url} onChange={e => setUrl(e.target.value)} placeholder="https://tu-servicio.com/webhook"/>
              <span className="hint">Debe responder con HTTP 2xx en menos de 10 s.</span>
            </div>

            <div className="field">
              <label>Secreto HMAC <span style={{ fontWeight: 400, color: "var(--ink-3)" }}>(opcional)</span></label>
              <input type="text" value={secret} onChange={e => setSecret(e.target.value)} placeholder="Dejar vacío para no firmar"/>
              <span className="hint">Si se proporciona, cada request incluirá el header <code style={{ fontFamily: "var(--mono)", fontSize: 11 }}>X-Aviva-Signature</code>.</span>
            </div>

            <div className="field">
              <label>Eventos suscritos</label>
              <span className="hint">Elige qué eventos disparan este webhook.</span>
              <div className="col" style={{ gap: 4, marginTop: 8 }}>
                <label className="row" style={{
                  gap: 10, padding: "8px 10px",
                  border: "1px solid var(--line)", borderRadius: 8,
                  background: events.includes("*") ? "var(--mint-50)" : "var(--surface)", cursor: "pointer"
                }}>
                  <input type="checkbox" className="cb" checked={events.includes("*")} onChange={() => toggleEvent("*")}/>
                  <div style={{ flex: 1 }}>
                    <code style={{ fontSize: 11, fontFamily: "var(--mono)", color: "var(--green-700)", fontWeight: 600 }}>*</code>
                    <span style={{ marginLeft: 8, fontWeight: 600, fontSize: 13 }}>Todos los eventos</span>
                  </div>
                </label>
                {!events.includes("*") && ALL_WEBHOOK_EVENTS.map(e => (
                  <label key={e} className="row" style={{
                    gap: 10, padding: "8px 10px",
                    border: "1px solid var(--line)", borderRadius: 8,
                    background: events.includes(e) ? "var(--mint-50)" : "var(--surface)", cursor: "pointer"
                  }}>
                    <input type="checkbox" className="cb" checked={events.includes(e)} onChange={() => toggleEvent(e)}/>
                    <code style={{ flex: 1, fontSize: 11, fontFamily: "var(--mono)", color: "var(--green-700)", fontWeight: 600 }}>{e}</code>
                  </label>
                ))}
              </div>
            </div>
          </div>

          <div style={{ padding: 14, borderTop: "1px solid var(--line)", display: "flex", gap: 8 }}>
            {isEdit && !confirmDelete && (
              <button className="btn sm danger" onClick={() => setConfirmDelete(true)}>Eliminar</button>
            )}
            {isEdit && confirmDelete && (
              <div className="row" style={{ gap: 6 }}>
                <span style={{ fontSize: 12, color: "var(--danger-fg)" }}>¿Confirmar eliminación?</span>
                <button className="btn sm danger" onClick={() => onDelete(hook.id)}>Sí, eliminar</button>
                <button className="btn sm ghost" onClick={() => setConfirmDelete(false)}>No</button>
              </div>
            )}
            <span style={{ flex: 1 }}/>
            <button className="btn ghost" onClick={onClose}>Cancelar</button>
            <button className="btn primary" disabled={!valid} onClick={handleSave}>
              {isEdit ? "Guardar cambios" : <>{Ic.plus} Crear webhook</>}
            </button>
          </div>
        </div>
      </div>
    </React.Fragment>
  );
}

const EVENT_SCHEMAS = {
  "users.created": {
    event: "users.created",
    occurred_at: "2026-06-03T10:14:22Z",
    data: {
      id: "u-385_02",
      num_colaborador: "385_02",
      nombre: "Adrián Contreras Zapata",
      email: "adrian.contreras@avivacredito.com",
      puesto: "Kiosk Manager",
      hub: "hub1-region_hidalgo",
      quiosco: "Tulancingo",
      estado: "Hidalgo",
      fecha_ingreso: "2026-06-01",
      status: "active",
    },
  },
  "users.updated": {
    event: "users.updated",
    occurred_at: "2026-06-03T11:02:05Z",
    data: {
      id: "u-312_01",
      changed_fields: ["puesto", "hub"],
      before: { puesto: "Asesor de Crédito", hub: "hub2-region_cdmx" },
      after:  { puesto: "Kiosk Manager",     hub: "hub1-region_hidalgo" },
    },
  },
  "users.deleted": {
    event: "users.deleted",
    occurred_at: "2026-06-03T09:00:00Z",
    data: { id: "u-201_03", nombre: "Laura Pérez Solís", reason: "offboarding_completed" },
  },
  "onboard.created": {
    event: "onboard.created",
    occurred_at: "2026-06-03T08:30:00Z",
    data: {
      ticket_id: "TKT-2098",
      user_id: "u-385_02",
      nombre: "Adrián Contreras Zapata",
      fecha_ingreso: "2026-06-01",
      provision: ["google", "slack", "okta"],
    },
  },
  "onboard.firstlogin": {
    event: "onboard.firstlogin",
    occurred_at: "2026-06-03T09:15:11Z",
    data: { user_id: "u-385_02", provider: "google_sso", ip: "189.216.x.x" },
  },
  "offboard.created": {
    event: "offboard.created",
    occurred_at: "2026-06-02T17:45:00Z",
    data: {
      ticket_id: "TKT-2041",
      user_id: "u-201_03",
      nombre: "Laura Pérez Solís",
      last_day: "2026-06-15",
      reason: "renuncia_voluntaria",
      transfer_to: "u-080_01",
    },
  },
  "offboard.approved": {
    event: "offboard.approved",
    occurred_at: "2026-06-02T18:10:00Z",
    data: { ticket_id: "TKT-2041", approved_by: ["u-001", "u-004", "u-011"], stages_completed: 3 },
  },
  "offboard.completed": {
    event: "offboard.completed",
    occurred_at: "2026-06-02T18:30:00Z",
    data: { ticket_id: "TKT-2041", tasks_ok: 6, tasks_failed: 0, duration_s: 48 },
  },
  "offboard.failed": {
    event: "offboard.failed",
    occurred_at: "2026-06-02T18:28:00Z",
    data: {
      ticket_id: "TKT-2041",
      failed_task: "hubspot_contact_reassign",
      error: "CONFLICT: 14 open deals",
      retry_at: "2026-06-02T18:43:00Z",
    },
  },
  "access.granted": {
    event: "access.granted",
    occurred_at: "2026-06-01T10:00:00Z",
    data: { user_id: "u-385_02", app: "hubspot", role: "viewer", granted_by: "u-001" },
  },
  "access.revoked": {
    event: "access.revoked",
    occurred_at: "2026-06-15T18:30:00Z",
    data: { user_id: "u-201_03", app: "slack", revoked_by: "system", reason: "offboarding" },
  },
  "device.assigned": {
    event: "device.assigned",
    occurred_at: "2026-06-01T09:00:00Z",
    data: { user_id: "u-385_02", device_type: "tablet", model: "Samsung Galaxy Tab A9", serial: "SN-20240601-0042" },
  },
  "sync.completed": {
    event: "sync.completed",
    occurred_at: "2026-06-03T06:00:00Z",
    data: { integration: "hubspot", records_synced: 142, records_skipped: 3, duration_s: 11 },
  },
};

function SettingsAPIEvents() {
  const [schemaFor, setSchemaFor] = useNS(null);
  const evts = [
    { id: "users.created",         desc: "Se creó un colaborador." },
    { id: "users.updated",         desc: "Se editaron datos de un colaborador." },
    { id: "users.deleted",         desc: "Se archivó un colaborador." },
    { id: "onboard.created",       desc: "Ticket de alta abierto." },
    { id: "onboard.firstlogin",    desc: "Primer inicio de sesión por SSO." },
    { id: "offboard.created",      desc: "Ticket de baja abierto." },
    { id: "offboard.approved",     desc: "Todas las aprobaciones obtenidas." },
    { id: "offboard.completed",    desc: "Tareas automáticas terminaron." },
    { id: "offboard.failed",       desc: "Una tarea automática falló." },
    { id: "access.granted",        desc: "Acceso concedido a una app." },
    { id: "access.revoked",        desc: "Acceso revocado." },
    { id: "device.assigned",       desc: "Tablet o laptop asignada." },
    { id: "sync.completed",        desc: "Sincronización con una integración terminó." },
  ];
  return (
    <React.Fragment>
      <div className="settings-section">
        <div className="head">
          <h3>Catálogo de eventos</h3>
          <div className="sub">Todos los eventos que Aviva HR puede emitir hacia webhooks o consultar vía API.</div>
        </div>
        <div className="body" style={{ padding: 0 }}>
          <table className="users" style={{ width: "100%" }}>
            <thead>
              <tr>
                <th style={{ width: 260 }}>Evento</th>
                <th>Descripción</th>
                <th style={{ width: 140, textAlign: "right" }}></th>
              </tr>
            </thead>
            <tbody>
              {evts.map(e => (
                <tr key={e.id}>
                  <td><code style={{ fontFamily: "var(--mono)", fontSize: 12, color: "var(--green-700)", fontWeight: 600 }}>{e.id}</code></td>
                  <td style={{ color: "var(--ink-2)", fontSize: 13 }}>{e.desc}</td>
                  <td style={{ textAlign: "right" }}>
                    <button className="btn sm" onClick={() => setSchemaFor(e.id)}>Ver schema</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {schemaFor && <EventSchemaModal eventId={schemaFor} onClose={() => setSchemaFor(null)}/>}
    </React.Fragment>
  );
}

function EventSchemaModal({ eventId, onClose }) {
  const [copied, setCopied] = useNS(false);
  const schema = EVENT_SCHEMAS[eventId];
  const json = JSON.stringify(schema, null, 2);
  function copy() {
    navigator.clipboard?.writeText(json);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }
  return (
    <React.Fragment>
      <div className="scrim" onClick={onClose}/>
      <div className="modal">
        <div className="panel" style={{ width: "min(620px, 96vw)" }}>
          <div className="row" style={{ padding: "14px 20px", borderBottom: "1px solid var(--line)" }}>
            <div className="col">
              <div style={{ fontWeight: 600, fontSize: 15 }}>Schema del evento</div>
              <code style={{ fontSize: 12, color: "var(--green-700)", fontFamily: "var(--mono)", fontWeight: 600 }}>{eventId}</code>
            </div>
            <span style={{ flex: 1 }}/>
            <button className="btn sm" style={{ marginRight: 8 }} onClick={copy}>
              {copied ? <>{Ic.check} Copiado</> : <>{Ic.link} Copiar</>}
            </button>
            <button className="iconbtn" onClick={onClose}>{Ic.close}</button>
          </div>
          <div style={{ padding: 20 }}>
            <pre style={{
              background: "var(--ink)", color: "#cfeede",
              padding: 16, borderRadius: 10,
              fontFamily: "var(--mono)", fontSize: 12.5, lineHeight: 1.6,
              overflow: "auto", margin: 0, maxHeight: "60vh",
            }}>{json}</pre>
          </div>
        </div>
      </div>
    </React.Fragment>
  );
}

function SettingsAPIDocs() {
  return (
    <div className="settings-section">
      <div className="head" style={{ display: "flex", justifyContent: "space-between" }}>
        <div>
          <h3>Documentación de la API REST</h3>
          <div className="sub">Base URL: <code style={{ fontFamily: "var(--mono)", fontSize: 12 }}>https://api.avivacredito.com/hr/v1</code></div>
        </div>
        <button className="btn">{Ic.link} Abrir docs completas</button>
      </div>
      <div className="body">
        <div className="endpoint-list">
          <Endpoint method="GET"    path="/users"                   desc="Lista de colaboradores con paginación y filtros (hub, estado, status)."/>
          <Endpoint method="GET"    path="/users/:id"               desc="Detalle completo de un colaborador (incluye accesos y equipos)."/>
          <Endpoint method="POST"   path="/users"                   desc="Crear colaborador. Envía email/whatsapp de invitación si emit_invite=true."/>
          <Endpoint method="PATCH"  path="/users/:id"               desc="Editar campos parciales. Se registra en auditoría."/>
          <Endpoint method="POST"   path="/users/:id/offboard"      desc="Iniciar ticket de baja. Body: {reason, last_day, transfer_to}."/>
          <Endpoint method="POST"   path="/users/import"            desc="Carga masiva — multipart con CSV o XLSX. Devuelve dry_run o execute."/>
          <Endpoint method="GET"    path="/tickets"                 desc="Lista de tickets activos y su progreso."/>
          <Endpoint method="POST"   path="/tickets/:id/approve"     desc="Aprobar una etapa. Body: {stage, approver_id}."/>
          <Endpoint method="GET"    path="/audit"                   desc="Log inmutable de eventos. Filtros por fecha y actor."/>
          <Endpoint method="GET"    path="/integrations"            desc="Estado de las apps conectadas y última sincronización."/>
          <Endpoint method="POST"   path="/integrations/:id/sync"   desc="Forzar sincronización ahora."/>
        </div>

        <div style={{ marginTop: 18 }}>
          <div style={{ fontWeight: 600, marginBottom: 8 }}>Ejemplo · crear un colaborador</div>
          <pre style={{
            background: "var(--ink)", color: "#cfeede",
            padding: 14, borderRadius: 10,
            fontFamily: "var(--mono)", fontSize: 12, lineHeight: 1.6,
            overflow: "auto", margin: 0
          }}>{`POST /hr/v1/users
Authorization: Bearer ak_live_•••
Content-Type: application/json

{
  "num_colaborador": "385_02",
  "nombre": "Adrián Contreras Zapata",
  "email": "adrian.contreras@avivacredito.com",
  "puesto": "Kiosk Manager",
  "hub": "hub1-region_hidalgo",
  "quiosco": "Tulancingo",
  "estado": "Hidalgo",
  "jefe": "u-020_02",
  "talla": "L",
  "fecha_ingreso": "2026-06-01",
  "provision": ["google", "slack", "okta", "hubspot", "avivaflat"],
  "emit_invite": true
}`}</pre>
        </div>
      </div>
    </div>
  );
}

function Endpoint({ method, path, desc }) {
  const colors = {
    GET:    { bg: "var(--mint-50)", fg: "var(--green-700)" },
    POST:   { bg: "var(--info-bg)", fg: "var(--info-fg)" },
    PATCH:  { bg: "#fff3d6",        fg: "#8a5a00" },
    DELETE: { bg: "var(--danger-bg)", fg: "var(--danger-fg)" },
  };
  const c = colors[method] || colors.GET;
  return (
    <div className="row" style={{ padding: "10px 0", borderBottom: "1px dashed var(--line)", gap: 12 }}>
      <span style={{
        fontFamily: "var(--mono)", fontSize: 11, fontWeight: 700,
        padding: "2px 8px", borderRadius: 4,
        background: c.bg, color: c.fg, minWidth: 56, textAlign: "center"
      }}>{method}</span>
      <code style={{ fontFamily: "var(--mono)", fontSize: 13, color: "var(--ink)", minWidth: 240 }}>{path}</code>
      <span style={{ fontSize: 12.5, color: "var(--ink-3)", flex: 1 }}>{desc}</span>
    </div>
  );
}

function SettingsBranding() {
  return (
    <div className="settings-section">
      <div className="head"><h3>Marca</h3><div className="sub">Logo y colores de los emails y la app.</div></div>
      <div className="body">
        <div className="row" style={{ gap: 16 }}>
          <div className="av lg" style={{ background: "var(--mint-100)", color: "var(--green-700)", fontFamily: "var(--serif)", borderRadius: 12 }}>a</div>
          <div className="col">
            <div style={{ fontWeight: 600 }}>Aviva Crédito</div>
            <div className="muted" style={{ fontSize: 12 }}>Logo cuadrado · 256×256 px</div>
            <div className="row" style={{ gap: 6, marginTop: 6 }}>
              <button className="btn sm">Cambiar</button>
              <button className="btn sm ghost">Eliminar</button>
            </div>
          </div>
        </div>
        <div className="divider-h"/>
        <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 10 }}>Paleta de marca</div>
        <div className="row" style={{ gap: 10 }}>
          {[["#b0f5cd","Mint"],["#16b877","Verde"],["#026149","Verde profundo"],["#FFFFFF","Blanco"]].map(([c, l]) => (
            <div key={c} className="col" style={{ alignItems: "center" }}>
              <div style={{ width: 56, height: 56, borderRadius: 12, background: c, border: "1px solid var(--line)" }}/>
              <div style={{ fontSize: 12, marginTop: 6, fontWeight: 600 }}>{l}</div>
              <code style={{ fontSize: 11, color: "var(--ink-3)" }}>{c}</code>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { NotifProvider, useNotif, NotifBell, SettingsView });
