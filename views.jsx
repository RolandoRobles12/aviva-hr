// Aviva HR — main views
const { useState: useStateV, useMemo: useMemoV, useEffect: useEffectV } = React;

// =========================================================================
// DIRECTORY
// =========================================================================
function DirectoryView({ users, layout, onOpenUser, onNewUser, onImport, onNewOffboard, selected, setSelected, density }) {
  const [tab, setTab] = useStateV("all");
  const [q, setQ] = useStateV("");
  const [hubF, setHubF] = useStateV("all");
  const [estadoF, setEstadoF] = useStateV("all");
  const [empresaF, setEmpresaF] = useStateV("all");
  const [sortBy, setSortBy] = useStateV("name");

  const filtered = useMemoV(() => {
    const norm = s => (s || "").toString().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    let arr = users.filter(u => {
      if (tab === "active" && u.status !== "active") return false;
      if (tab === "invited" && u.status !== "invited") return false;
      if (tab === "offboarding" && u.status !== "offboarding") return false;
      if (tab === "suspended" && u.status !== "suspended") return false;
      if (tab === "externos" && u.empresa === "Aviva Financial") return false;
      if (hubF !== "all" && u.hub !== hubF) return false;
      if (estadoF !== "all" && u.estado !== estadoF) return false;
      if (empresaF !== "all" && u.empresa !== empresaF) return false;
      if (q) {
        const t = norm(q);
        if (!norm(u.fullName).includes(t) && !norm(u.email).includes(t) && !norm(u.role).includes(t) && !norm(u.quiosco).includes(t) && !norm(u.numColaborador).includes(t)) return false;
      }
      return true;
    });
    if (sortBy === "name") arr.sort((a,b) => a.fullName.localeCompare(b.fullName));
    if (sortBy === "hub") arr.sort((a,b) => (a.hub || "").localeCompare(b.hub || ""));
    if (sortBy === "quiosco") arr.sort((a,b) => (a.quiosco || "").localeCompare(b.quiosco || ""));
    if (sortBy === "recent") arr.sort((a,b) => a.hireMonths - b.hireMonths);
    return arr;
  }, [users, tab, q, hubF, estadoF, empresaF, sortBy]);

  const counts = useMemoV(() => ({
    all: users.length,
    active: users.filter(u => u.status === "active").length,
    invited: users.filter(u => u.status === "invited").length,
    offboarding: users.filter(u => u.status === "offboarding").length,
    suspended: users.filter(u => u.status === "suspended").length,
    externos: users.filter(u => u.empresa !== "Aviva Financial").length,
  }), [users]);

  function toggleRow(id, e) {
    if (e) e.stopPropagation();
    setSelected(prev => {
      const n = new Set(prev);
      if (n.has(id)) n.delete(id); else n.add(id);
      return n;
    });
  }
  function toggleAll() {
    if (selected.size === filtered.length) setSelected(new Set());
    else setSelected(new Set(filtered.map(u => u.id)));
  }

  return (
    <div className="view-pad">
      <div className="view-head">
        <div>
          <h1>Directorio de personas</h1>
          <div className="sub">Fuente única de verdad — {users.length} cuentas activas y archivadas en Aviva.</div>
        </div>
        <div className="actions">
          <button className="btn">{Ic.download} Exportar CSV</button>
          <button className="btn" onClick={onImport}>{Ic.upload} Importar</button>
          <button className="btn accent" onClick={onNewUser}>{Ic.plus} Nueva alta</button>
        </div>
      </div>

      <KPIs users={users}/>

      <div className="toolbar">
        <div className="toolbar-row">
          <div className="tab-row">
            <button className={"tab " + (tab === "all" ? "active" : "")} onClick={() => setTab("all")}>Todos <span className="pill">{counts.all}</span></button>
            <button className={"tab " + (tab === "active" ? "active" : "")} onClick={() => setTab("active")}>Activos <span className="pill">{counts.active}</span></button>
            <button className={"tab " + (tab === "invited" ? "active" : "")} onClick={() => setTab("invited")}>Invitados <span className="pill">{counts.invited}</span></button>
            <button className={"tab " + (tab === "offboarding" ? "active" : "")} onClick={() => setTab("offboarding")}>En baja <span className="pill">{counts.offboarding}</span></button>
            <button className={"tab " + (tab === "suspended" ? "active" : "")} onClick={() => setTab("suspended")}>Suspendidos <span className="pill">{counts.suspended}</span></button>
            <button className={"tab " + (tab === "externos" ? "active" : "")} onClick={() => setTab("externos")}>Externos <span className="pill">{counts.externos}</span></button>
          </div>
          <div className="right" style={{ marginLeft: "auto" }}>
            <span style={{ fontSize: 12, color: "var(--ink-3)" }}>{filtered.length} resultados</span>
            <div className="layout-toggle">
              <button className={layout === "table" ? "active" : ""} onClick={() => window.__setLayout?.("table")} title="Vista tabla">{Ic.table}</button>
              <button className={layout === "grid" ? "active" : ""} onClick={() => window.__setLayout?.("grid")} title="Vista tarjetas">{Ic.grid}</button>
            </div>
          </div>
        </div>
        <div className="toolbar-row" style={{ borderTop: "1px dashed var(--line)", paddingTop: 10 }}>
          <div className="search" style={{ flex: 1, minWidth: 220, maxWidth: 380 }}>
            {Ic.search}
            <input placeholder="Buscar nombre, correo, quiósco, número…" value={q} onChange={e => setQ(e.target.value)}/>
          </div>
          <select className="btn sm" value={hubF} onChange={e => setHubF(e.target.value)}>
            <option value="all">Todos los hubs</option>
            {window.AvivaData.hubs.map(h => <option key={h.id} value={h.id}>{h.label}</option>)}
          </select>
          <select className="btn sm" value={estadoF} onChange={e => setEstadoF(e.target.value)}>
            <option value="all">Todos los estados</option>
            {window.AvivaData.estados.map(e => <option key={e} value={e}>{e}</option>)}
          </select>
          <select className="btn sm" value={empresaF} onChange={e => setEmpresaF(e.target.value)}>
            <option value="all">Internos + externos</option>
            <option value="Aviva Financial">Solo internos</option>
            <option value="Ejecutando Ideas">Solo externos</option>
          </select>
          <select className="btn sm" value={sortBy} onChange={e => setSortBy(e.target.value)}>
            <option value="name">Nombre A–Z</option>
            <option value="hub">Hub</option>
            <option value="quiosco">Quiósco</option>
            <option value="recent">Más recientes</option>
          </select>
        </div>
      </div>

      {layout === "table" ? (
        <div className={"table-card " + (density === "compact" ? "density-compact" : "")}>
          <div style={{ overflowX: "auto" }}>
            <table className="users">
              <thead>
                <tr>
                  <th style={{ width: 36 }}>
                    <input type="checkbox" className="cb"
                      checked={selected.size > 0 && selected.size === filtered.length}
                      onChange={toggleAll}/>
                  </th>
                  <th>Persona</th>
                  <th>Puesto</th>
                  <th>Hub</th>
                  <th>Quiósco</th>
                  <th>Estado</th>
                  <th>Jefe inmediato</th>
                  <th>Estatus</th>
                  <th>Antig.</th>
                  <th style={{ width: 36 }}></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(u => {
                  const mgr = users.find(x => x.id === u.manager);
                  const hubLabel = window.AvivaData.hubs.find(h => h.id === u.hub)?.label || u.hub;
                  const isExt = u.empresa !== "Aviva Financial";
                  return (
                  <tr key={u.id} className={selected.has(u.id) ? "selected" : ""} onClick={() => onOpenUser(u)}>
                    <td onClick={e => e.stopPropagation()}>
                      <input type="checkbox" className="cb" checked={selected.has(u.id)} onChange={e => toggleRow(u.id, e)}/>
                    </td>
                    <td>
                      <div className="user-cell">
                        <Avatar user={u}/>
                        <div>
                          <div className="name">{u.fullName} {isExt && <span className="badge neutral" style={{ marginLeft: 6, fontSize: 10 }}>EXT</span>}</div>
                          <div className="email"><span style={{ fontFamily: "var(--mono)", color: "var(--ink-4)" }}>{u.numColaborador}</span> · {u.email}</div>
                        </div>
                      </div>
                    </td>
                    <td style={{ fontSize: 12.5 }}>{u.role}</td>
                    <td><span className="badge neutral" style={{ fontSize: 11 }}>{hubLabel}</span></td>
                    <td style={{ fontSize: 12.5 }}>{u.quiosco}</td>
                    <td className="muted" style={{ fontSize: 12 }}>{u.estado}</td>
                    <td className="muted">{mgr ? (
                      <span className="row" style={{ gap: 6 }}>
                        <Avatar user={mgr}/>
                        <span style={{ color: "var(--ink-2)", fontSize: 12 }}>{mgr.first} {mgr.last.split(" ")[0]?.[0]}.</span>
                      </span>
                    ) : <span>—</span>}</td>
                    <td><StatusBadge status={u.status}/></td>
                    <td className="muted" style={{ fontSize: 12 }}>{formatTenure(u.hireMonths)}</td>
                    <td onClick={e => e.stopPropagation()}>
                      <button className="iconbtn" title="Más">{Ic.more}</button>
                    </td>
                  </tr>
                );})}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div style={{ background: "var(--surface)", border: "1px solid var(--line)", borderRadius: "0 0 14px 14px", padding: 16 }}>
          <div className="card-grid">
            {filtered.map(u => {
              const hubLabel = window.AvivaData.hubs.find(h => h.id === u.hub)?.label || u.hub;
              return (
              <div key={u.id} className="user-card" onClick={() => onOpenUser(u)}>
                <div className="top">
                  <Avatar user={u} size="lg"/>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div className="name">{u.fullName}</div>
                    <div className="role">{u.role}</div>
                  </div>
                  <StatusBadge status={u.status}/>
                </div>
                <div className="meta">
                  <span className="badge neutral">{hubLabel}</span>
                  <span className="badge neutral">{u.quiosco}</span>
                  <span className="badge neutral">{u.estado}</span>
                </div>
                <div className="accesses">
                  <span className="lbl">Núm.</span>
                  <code style={{ fontFamily: "var(--mono)", fontSize: 11, color: "var(--ink-3)" }}>{u.numColaborador}</code>
                  <span style={{ flex: 1 }}/>
                  {u.access.slice(0, 5).map(a => <AppChip key={a} id={a}/>)}
                  {u.access.length > 5 && <span style={{ marginLeft: 6, fontSize: 11, color: "var(--ink-3)" }}>+{u.access.length - 5}</span>}
                </div>
              </div>
            );})}
          </div>
        </div>
      )}

      {selected.size > 0 && (
        <div className="bulkbar">
          <span className="count">{selected.size}</span>
          <span>seleccionado{selected.size > 1 ? "s" : ""}</span>
          <button>Asignar equipo</button>
          <button>Sincronizar</button>
          <button className="danger" onClick={onNewOffboard}>Iniciar baja</button>
          <button onClick={() => setSelected(new Set())}>Cancelar</button>
        </div>
      )}
    </div>
  );
}

function KPIs({ users }) {
  const active = users.filter(u => u.status === "active").length;
  const invited = users.filter(u => u.status === "invited").length;
  const offboarding = users.filter(u => u.status === "offboarding").length;
  return (
    <div className="stat-row">
      <div className="stat">
        <span className="accent-strip"/>
        <div className="label">Activos</div>
        <div className="value">{active}</div>
        <div className="foot">
          <span className="delta up">▲ 3,2% mes</span>
          <Sparkline data={window.AvivaData.sparkActive} color="var(--green-500)"/>
        </div>
      </div>
      <div className="stat">
        <span className="accent-strip"/>
        <div className="label">Altas en curso</div>
        <div className="value">{invited + 4}</div>
        <div className="foot">
          <span className="delta up">▲ 2 esta semana</span>
          <Sparkline data={window.AvivaData.sparkAlta} color="var(--green-700)"/>
        </div>
      </div>
      <div className="stat">
        <span className="accent-strip"/>
        <div className="label">Bajas en proceso</div>
        <div className="value">{offboarding}</div>
        <div className="foot">
          <span className="delta down">▼ 1 vs mes pasado</span>
          <Sparkline data={window.AvivaData.sparkBaja} color="var(--green-700)"/>
        </div>
      </div>
      <div className="stat">
        <span className="accent-strip"/>
        <div className="label">Apps sincronizadas</div>
        <div className="value">12<span style={{ fontSize: 14, color: "var(--ink-3)" }}>/12</span></div>
        <div className="foot">
          <span style={{ fontSize: 12, color: "var(--green-600)", fontWeight: 600 }}>
            <span className="live-dot"/> sincronización viva
          </span>
        </div>
      </div>
    </div>
  );
}

function formatTenure(months) {
  if (months < 12) return months + " m";
  const y = Math.floor(months / 12);
  const m = months % 12;
  return y + "a " + (m ? m + "m" : "");
}

// =========================================================================
// USER PROFILE (drawer)
// =========================================================================
function UserProfile({ user, users, onClose, onOffboard, onOpenLocation }) {
  const [tab, setTab] = useStateV("info");
  const [editing, setEditing] = useStateV(false);
  const manager = users.find(u => u.id === user.manager);
  const reports = users.filter(u => u.manager === user.id);
  const hubLabel = window.AvivaData.hubs.find(h => h.id === user.hub)?.label || user.hub;
  const isExt = user.empresa !== "Aviva Financial";
  // Find the user's quiosco as a location
  const quioscoLoc = window.AvivaData.locations.find(l => {
    const norm = s => (s||"").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s+ba$| atn$| cm$/i, "").trim();
    return norm(l.ciudad) === norm(user.quiosco);
  });

  return (
    <div className="drawer-body">
      <div className="loc-hero" style={{ background: "linear-gradient(180deg, var(--mint-50) 0%, var(--surface) 70%)" }}>
        <div className="loc-hero-row">
          <Avatar user={user} size="xl"/>
          <div className="loc-hero-main">
            <div className="loc-hero-tags">
              <span className="loc-tag mono">{user.numColaborador}</span>
              {isExt && <span className="loc-tag" style={{ color: "#8a4a00" }}>Externo · {user.empresa}</span>}
              <span className="loc-tag">{hubLabel}</span>
            </div>
            <h2 className="loc-hero-title">{user.fullName}</h2>
            <div className="loc-hero-meta">
              <span className="loc-meta-item"><span className="loc-meta-ic">{Ic.user}</span><b>{user.role}</b></span>
              {quioscoLoc ? (
                <span className="loc-meta-item">
                  <window.LocationChip location={quioscoLoc} compact onClick={() => onOpenLocation?.(quioscoLoc)}/>
                </span>
              ) : (
                <span className="loc-meta-item"><span className="loc-meta-ic">{Ic.map}</span><b>{user.quiosco}</b>, {user.estado}</span>
              )}
              <span className="loc-meta-item"><span className="loc-meta-ic">{Ic.link}</span>{user.email}</span>
              <span className="loc-meta-item">Ingreso <b>{user.hiredAt}</b> ({formatTenure(user.hireMonths)})</span>
            </div>
          </div>
          <div className="loc-hero-actions">
            <StatusBadge status={user.status}/>
            <div className="row" style={{ gap: 6 }}>
              <button className="btn sm primary" onClick={() => setEditing(true)}>{Ic.edit} Editar</button>
              <button className="btn sm danger" onClick={() => onOffboard(user)}>Iniciar baja</button>
            </div>
          </div>
        </div>
      </div>

      <Modal open={editing} onClose={() => setEditing(false)}>
        <window.EditUserModal user={user} onClose={() => setEditing(false)}/>
      </Modal>

      <div className="profile-tabs">
        {[["info","Información"],["access","Accesos & apps"],["devices","Equipamiento"],["docs","Documentos"],["history","Historial"]].map(([k, l]) => (
          <button key={k} className={"profile-tab " + (tab === k ? "active" : "")} onClick={() => setTab(k)}>{l}</button>
        ))}
      </div>

      {tab === "info" && <ProfileInfo user={user} manager={manager} reports={reports} hubLabel={hubLabel}/>}
      {tab === "access" && <ProfileAccess user={user}/>}
      {tab === "devices" && <ProfileDevices user={user}/>}
      {tab === "docs" && <ProfileDocs user={user}/>}
      {tab === "history" && <ProfileHistory user={user}/>}
    </div>
  );
}

function ProfileInfo({ user, manager, reports, hubLabel }) {
  // Find the user's quiosco as a location
  const quioscoLoc = window.AvivaData.locations.find(l => {
    const norm = s => (s||"").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s+ba$| atn$| cm$/i, "").trim();
    return norm(l.ciudad) === norm(user.quiosco);
  });
  return (
    <div>
      <div className="section">
        <div className="section-head"><h3>Datos personales</h3><span className="muted" style={{ fontSize: 12 }}>Última actualización: hace 2 h</span></div>
        <div className="section-body">
          <div className="kv">
            <div className="k">Nombre completo</div><div className="v">{user.fullName}</div>
            <div className="k">Número de colaborador</div><div className="v" style={{ fontFamily: "var(--mono)" }}>{user.numColaborador}</div>
            <div className="k">Correo corporativo</div><div className="v">{user.email}</div>
            <div className="k">Teléfono / WhatsApp</div><div className="v">{user.phone}</div>
            <div className="k">Talla de uniforme</div><div className="v">{user.talla}</div>
            <div className="k">Género (uniforme)</div><div className="v">{user.genero === "M" ? "Mujer" : "Hombre"}</div>
            {user.hubspot && <><div className="k">HubSpot ID</div><div className="v" style={{ fontFamily: "var(--mono)", fontSize: 12 }}>{user.hubspot}</div></>}
          </div>
        </div>
      </div>
      <div className="section">
        <div className="section-head"><h3>Empleo</h3></div>
        <div className="section-body">
          <div className="kv">
            <div className="k">Puesto</div><div className="v">{user.role}</div>
            <div className="k">Empresa</div><div className="v">{user.empresa}{user.empresa !== "Aviva Financial" && <span className="badge neutral" style={{ marginLeft: 8 }}>Externo</span>}</div>
            <div className="k">Hub / equipo</div><div className="v">{hubLabel}</div>
            <div className="k">Locación</div>
            <div className="v">
              {quioscoLoc ? (
                <window.LocationChip location={quioscoLoc}/>
              ) : (
                <span className="muted">{user.quiosco}, {user.estado} (sin ficha de locación)</span>
              )}
            </div>
            <div className="k">Jefe inmediato</div>
            <div className="v">
              <window.PersonChip person={manager || user.managerName}/>
            </div>
            <div className="k">Reportes directos</div>
            <div className="v">
              {reports.length === 0 ? <span className="muted">Sin reportes</span> :
                <div className="row" style={{ gap: 6, flexWrap: "wrap" }}>
                  {reports.map(r => <window.PersonChip key={r.id} person={r} compact/>)}
                </div>}
            </div>
            <div className="k">Fecha de ingreso</div><div className="v">{user.hiredAt} · {formatTenure(user.hireMonths)}</div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ProfileAccess({ user }) {
  return (
    <div className="section">
      <div className="section-head"><h3>Apps conectadas ({user.access.length})</h3>
        <button className="btn sm">{Ic.plus} Conectar app</button>
      </div>
      <div className="section-body" style={{ padding: 0 }}>
        {window.AvivaData.integrationsAll.map(it => {
          const has = user.access.includes(it.id);
          return (
            <div key={it.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 16px", borderBottom: "1px solid var(--line)" }}>
              <AppChip id={it.id} size={28}/>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, fontSize: 13 }}>{it.name}</div>
                <div style={{ fontSize: 12, color: "var(--ink-3)" }}>{it.desc}</div>
              </div>
              {has ? <span className="badge active"><span className="dot"/>Conectado</span>
                   : <span className="badge archived">Sin acceso</span>}
              <button className="btn sm">{has ? "Gestionar" : "Otorgar"}</button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function ProfileDevices({ user }) {
  const items = [
    ...(user.laptop ? [user.laptop] : []),
    ...(user.tablets || []),
  ];
  return (
    <div className="section">
      <div className="section-head"><h3>Equipamiento entregado</h3><button className="btn sm">{Ic.plus} Asignar equipo</button></div>
      <div className="section-body">
        {items.length === 0 && <div className="empty">Sin equipos asignados.</div>}
        {items.map((d, i) => (
          <div key={i} className="row" style={{ gap: 12, padding: "12px 0", borderBottom: i < items.length - 1 ? "1px dashed var(--line)" : 0 }}>
            <div className="iconbtn" style={{ border: "1px solid var(--line)", width: 38, height: 38, borderRadius: 8 }}>
              {d.kind.includes("Tablet") ? Ic.phoneIc : Ic.laptop}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 600, fontSize: 13.5 }}>{d.kind}</div>
              <div style={{ fontSize: 12, color: "var(--ink-3)" }}>S/N {d.serial} · Inventario {d.asset}</div>
            </div>
            <span className="badge active"><span className="dot"/>Activo</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function ProfileDocs({ user }) {
  const docs = [
    { name: "Contrato firmado.pdf", size: "412 KB", when: user.hiredAt },
    { name: "DNI / Identificación.pdf", size: "180 KB", when: user.hiredAt },
    { name: "Acuerdo de confidencialidad.pdf", size: "94 KB", when: user.hiredAt },
    { name: "Última nómina · abril.pdf", size: "76 KB", when: "2026-04-30" },
  ];
  return (
    <div className="section">
      <div className="section-head"><h3>Documentos</h3><button className="btn sm">{Ic.upload} Subir</button></div>
      <div className="section-body">
        {docs.map((d, i) => (
          <div key={i} className="row" style={{ padding: "10px 0", borderBottom: i < docs.length - 1 ? "1px dashed var(--line)" : 0 }}>
            <div style={{ width: 28, height: 28, background: "var(--surface-2)", borderRadius: 6, display: "grid", placeItems: "center", fontSize: 11, fontWeight: 700, color: "var(--ink-3)" }}>PDF</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 600, fontSize: 13 }}>{d.name}</div>
              <div style={{ fontSize: 11.5, color: "var(--ink-3)" }}>{d.size} · subido el {d.when}</div>
            </div>
            <button className="btn sm">Ver</button>
          </div>
        ))}
      </div>
    </div>
  );
}

function ProfileHistory({ user }) {
  const items = [
    { what: "Cuenta creada e invitación enviada", when: user.hiredAt, who: "Paula Acevedo · People" },
    { what: "Provisionado en Google Workspace, Slack, Okta, Humand", when: user.hiredAt, who: "Sistema" },
    ...(user.hubspot ? [{ what: "Creado en HubSpot con ID " + user.hubspot.slice(0,8), when: user.hiredAt, who: "Sistema" }] : []),
    ...((user.tablets || []).length ? [{ what: "Tablet " + user.tablets[0].asset + " asignada al quiósco " + user.quiosco, when: user.hiredAt, who: "Operaciones" }] : []),
    { what: "Asignado al hub " + (window.AvivaData.hubs.find(h => h.id === user.hub)?.label || user.hub), when: user.hiredAt, who: user.managerName || "—" },
  ];
  return (
    <div className="section">
      <div className="section-head"><h3>Historial</h3></div>
      <div className="section-body">
        <div className="timeline">
          {items.map((it, i) => (
            <div key={i} className="step done">
              <div className="title">{it.what}</div>
              <div className="meta">{it.when} · {it.who}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// =========================================================================
// TICKETS LIST + DETAIL
// =========================================================================
function TicketsView({ tickets, users, ticketState, onOpenTicket, onNewTicket }) {
  return (
    <div className="view-pad">
      <div className="view-head">
        <div>
          <h1>Bajas</h1>
          <div className="sub">Tickets de baja, suspensión y transferencia. Las altas se gestionan desde Reclutamiento.</div>
        </div>
        <div className="actions">
          <button className="btn">{Ic.filter} Filtros</button>
          <button className="btn accent" onClick={onNewTicket}>{Ic.plus} Nuevo ticket</button>
        </div>
      </div>

      <div className="row" style={{ gap: 6, marginBottom: 14 }}>
        <button className="btn sm" style={{ background: "var(--green-700)", color: "#fff", borderColor: "var(--green-700)" }}>Todos · {tickets.length}</button>
        <button className="btn sm">En curso · {tickets.filter(t => t.status === "in_progress").length}</button>
        <button className="btn sm">Programados · {tickets.filter(t => t.status === "scheduled").length}</button>
        <button className="btn sm">Completados · {tickets.filter(t => t.status === "completed").length}</button>
      </div>

      <div>
        {tickets.map(t => {
          const u = users.find(x => x.id === t.userId);
          return (
            <div key={t.id} className="ticket-card" onClick={() => onOpenTicket(t)}>
              <div className="ic" style={{
                background: t.kind === "offboarding" ? "var(--danger-bg)" : "var(--mint-50)",
                color: t.kind === "offboarding" ? "var(--danger-fg)" : "var(--green-700)"
              }}>
                {t.kind === "offboarding" ? Ic.arrowR : Ic.plus}
              </div>
              <div>
                <div className="row">
                  <span className="title">{t.id} · {t.kind === "offboarding" ? "Baja" : "Alta"} de {u?.fullName || "Nueva persona"}</span>
                  <TicketStatusBadge status={t.status}/>
                </div>
                <div className="meta">
                  {t.reason} · Última jornada {t.lastDay || "—"} · creado por {t.createdBy} · {t.createdAt}
                </div>
              </div>
              <div className="progress">
                <div className="col" style={{ alignItems: "flex-end" }}>
                  <span style={{ fontSize: 11, color: "var(--ink-3)" }}>{Math.round(t.progress * 100)}% completado</span>
                  <div className="pbar"><div className="fill" style={{ width: (t.progress * 100) + "%" }}/></div>
                </div>
                <button className="btn sm">Abrir {Ic.chevR}</button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function TicketStatusBadge({ status }) {
  const map = {
    in_progress: { c: "invited", l: "En curso" },
    scheduled:   { c: "neutral", l: "Programado" },
    completed:   { c: "active", l: "Completado" },
    blocked:     { c: "suspended", l: "Bloqueado" },
  };
  const m = map[status] || map.in_progress;
  return <span className={"badge " + m.c}><span className="dot"/>{m.l}</span>;
}

function TicketDetail({ ticket, users, onClose, ticketState, setTicketState }) {
  const user = users.find(u => u.id === ticket.userId);

  // Compute effective ticket based on tweak ticket state override
  const effective = useMemoV(() => {
    if (!ticket) return null;
    if (ticketState === "default") return ticket;
    const t = JSON.parse(JSON.stringify(ticket));
    if (ticketState === "scheduled") {
      t.status = "scheduled";
      t.progress = 0.05;
      t.approvals.forEach(a => a.state = "pending");
      t.tasks.forEach(x => x.state = "pending");
      t.timeline = [
        { state: "done",    title: "Ticket creado", who: t.createdBy, when: t.createdAt },
        { state: "current", title: "Esperando aprobaciones", when: "ahora" },
        { state: "pending", title: "Ejecución programada", when: t.lastDay },
      ];
    } else if (ticketState === "completed") {
      t.status = "completed";
      t.progress = 1;
      t.approvals.forEach(a => a.state = "approved");
      t.tasks.forEach(x => x.state = "done");
      t.timeline = (t.timeline || []).map(s => ({ ...s, state: "done" }));
      t.timeline.push({ state: "done", title: "Ticket cerrado", when: t.lastDay, body: "Todas las tareas completadas." });
    } else if (ticketState === "blocked") {
      t.status = "blocked";
      t.progress = 0.4;
      t.tasks = t.tasks.map((x, i) => ({ ...x, state: i < 2 ? "done" : (i === 2 ? "failed" : "blocked") }));
      t.timeline = [
        { state: "done", title: "Ticket creado", when: t.createdAt },
        { state: "failed", title: "Tarea falló en AWS IAM", when: "hace 1 h", body: "Error: claves rotadas requieren MFA." },
      ];
    }
    return t;
  }, [ticket, ticketState]);

  if (!effective || !user) return null;

  return (
    <div className="drawer-body">
      <div className="profile-hero" style={{ paddingBottom: 16 }}>
        <div className="ic" style={{
          width: 56, height: 56, borderRadius: 12,
          background: effective.kind === "offboarding" ? "var(--danger-bg)" : "var(--mint-100)",
          color: effective.kind === "offboarding" ? "var(--danger-fg)" : "var(--green-700)",
          display: "grid", placeItems: "center"
        }}>
          {effective.kind === "offboarding" ? Ic.arrowR : Ic.plus}
        </div>
        <div className="info">
          <div className="row" style={{ gap: 8 }}>
            <span style={{ fontFamily: "var(--mono)", color: "var(--ink-3)", fontSize: 12 }}>{effective.id}</span>
            <TicketStatusBadge status={effective.status}/>
          </div>
          <h2 style={{ marginTop: 4 }}>{effective.kind === "offboarding" ? "Baja" : "Alta"} de {user.fullName}</h2>
          <div className="meta">
            <span>Motivo: <b>{effective.reason}</b></span>
            <span>· Última jornada: <b>{effective.lastDay || "—"}</b></span>
            <span>· Creado por <b>{effective.createdBy}</b> el {effective.createdAt}</span>
          </div>
        </div>
        <div className="col" style={{ gap: 8, alignItems: "flex-end" }}>
          <div style={{ fontSize: 11, color: "var(--ink-3)" }}>{Math.round(effective.progress * 100)}% completado</div>
          <div className="pbar" style={{ width: 140, height: 6, background: "var(--line)", borderRadius: 999 }}>
            <div className="fill" style={{ width: (effective.progress * 100) + "%", height: "100%", background: "var(--green-500)", borderRadius: 999 }}/>
          </div>
        </div>
      </div>

      <div style={{ padding: "0 20px", marginTop: 16 }}>
        <div className="section" style={{ margin: 0 }}>
          <div className="section-head"><h3>Aprobaciones</h3></div>
          <div className="section-body">
            <div className="row" style={{ gap: 10, alignItems: "stretch" }}>
              {effective.approvals.map((a, i) => (
                <div key={i} style={{ flex: 1, padding: 12, border: "1px solid var(--line)", borderRadius: 10, background: a.state === "approved" ? "var(--mint-50)" : "var(--surface-2)" }}>
                  <div style={{ fontSize: 11.5, color: "var(--ink-3)", textTransform: "uppercase", letterSpacing: 0.06 }}>{a.role}</div>
                  <div style={{ fontWeight: 600, marginTop: 2 }}>{a.who}</div>
                  <div className="row" style={{ marginTop: 8, gap: 6 }}>
                    {a.state === "approved" ? <span className="badge active"><span className="dot"/>Aprobado</span>
                      : a.state === "pending" ? <span className="badge suspended"><span className="dot"/>Pendiente</span>
                      : <span className="badge offboarding"><span className="dot"/>Rechazado</span>}
                    {a.at && <span className="muted" style={{ fontSize: 11 }}>{a.at}</span>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="ticket-detail">
        <div className="section" style={{ margin: 0 }}>
          <div className="section-head"><h3>Línea de tiempo</h3></div>
          <div className="section-body">
            <div className="timeline">
              {(effective.timeline || []).map((s, i) => (
                <div key={i} className={"step " + s.state}>
                  <div className="title">{s.title}</div>
                  <div className="meta">{[s.who, s.when].filter(Boolean).join(" · ")}</div>
                  {s.body && <div className="body">{s.body}</div>}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="section" style={{ margin: 0 }}>
          <div className="section-head">
            <h3>Tareas automáticas ({effective.tasks.filter(t => t.state === "done").length}/{effective.tasks.length})</h3>
            <button className="btn sm">{Ic.refresh} Re-ejecutar</button>
          </div>
          <div className="section-body">
            {effective.tasks.length === 0 && <div className="empty">No hay tareas automáticas para este ticket.</div>}
            {effective.tasks.map((t, i) => (
              <div key={i} className={"task-row " + t.state}>
                <AppChip id={t.app}/>
                <div className="ic">
                  {t.state === "done" ? Ic.check : t.state === "failed" ? "!" : t.state === "blocked" ? "·" : "→"}
                </div>
                <div className="label">{t.label}</div>
                <div className="meta">{t.when}</div>
                {t.state === "failed" && <button className="btn sm danger">Reintentar</button>}
                {t.state === "blocked" && <button className="btn sm">Desbloquear</button>}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="drawer-foot" style={{ position: "sticky", bottom: 0 }}>
        <button className="btn ghost" onClick={onClose}>Cerrar</button>
        <span className="spacer" style={{ flex: 1 }}/>
        <button className="btn">Agregar comentario</button>
        <button className="btn">Posponer</button>
        <button className="btn primary">{Ic.check} Marcar como completado</button>
      </div>
    </div>
  );
}

// =========================================================================
// INTEGRATIONS VIEW
// =========================================================================
function IntegrationsView() {
  const items = window.AvivaData.integrationsAll;
  return (
    <div className="view-pad">
      <div className="view-head">
        <div>
          <h1>Integraciones</h1>
          <div className="sub">12 apps conectadas. Aviva HR sincroniza altas, bajas y cambios en tiempo real.</div>
        </div>
        <div className="actions">
          <button className="btn">{Ic.plug} Catálogo completo</button>
          <button className="btn accent">{Ic.plus} Conectar app</button>
        </div>
      </div>

      <div className="row" style={{ gap: 14, padding: 14, background: "var(--surface)", border: "1px solid var(--line)", borderRadius: 14, marginBottom: 16 }}>
        <div className="col">
          <div style={{ fontSize: 12, color: "var(--ink-3)", textTransform: "uppercase", letterSpacing: 0.06 }}>Salud de sincronización</div>
          <div className="row" style={{ marginTop: 4, gap: 8 }}>
            <span style={{ fontFamily: "var(--serif)", fontSize: 28 }}>10/12</span>
            <span className="badge active"><span className="live-dot"/>En vivo</span>
          </div>
        </div>
        <div className="col" style={{ flex: 1 }}>
          <div style={{ fontSize: 12, color: "var(--ink-3)" }}>Últimos 30 minutos</div>
          <div className="row" style={{ gap: 4, marginTop: 6 }}>
            {Array.from({ length: 30 }).map((_, i) => {
              const v = [4,6,5,7,3,2,8,9,5,4,6,7,9,11,8,6,4,3,5,8,9,7,6,5,4,8,10,7,5,6][i];
              const bad = i === 7 || i === 22;
              return <div key={i} style={{
                width: 6, height: v * 2 + 4,
                background: bad ? "var(--danger-fg)" : "var(--green-500)",
                borderRadius: 2, opacity: 0.85
              }}/>;
            })}
          </div>
        </div>
        <div className="col" style={{ alignItems: "flex-end" }}>
          <div style={{ fontSize: 12, color: "var(--ink-3)" }}>Eventos hoy</div>
          <div style={{ fontFamily: "var(--serif)", fontSize: 28 }}>1.247</div>
        </div>
      </div>

      <div className="integration-grid">
        {items.map(it => (
          <div key={it.id} className="integration">
            <div className="top">
              <div className="ic" style={{ background: it.color + "16", borderColor: it.color + "33", color: it.color }}>{it.short}</div>
              <div>
                <div className="name">{it.name}</div>
                <div className="desc">{it.desc}</div>
              </div>
              {it.status === "ok" ? <span className="badge active"><span className="dot"/>Activa</span>
                                  : <span className="badge suspended"><span className="dot"/>Atención</span>}
            </div>
            <div className="stats">
              <div><span className="k">Cuentas </span><span className="v">{it.accounts}</span></div>
              <div><span className="k">Última sync </span><span className="v">{it.lastSync}</span></div>
            </div>
            <div className="foot">
              <button className="btn sm">Configurar</button>
              <button className="btn sm ghost">{Ic.refresh} Sync</button>
              <span className="last-sync">{it.status === "warn" ? "1 advertencia" : "OK"}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// =========================================================================
// AUDIT VIEW
// =========================================================================
function AuditView() {
  const audit = window.AvivaData.audit;
  return (
    <div className="view-pad">
      <div className="view-head">
        <div>
          <h1>Auditoría</h1>
          <div className="sub">Registro inmutable de cambios en personas, accesos y configuraciones.</div>
        </div>
        <div className="actions">
          <button className="btn">{Ic.download} Exportar log</button>
        </div>
      </div>

      <div className="row" style={{ gap: 8, marginBottom: 14 }}>
        <div className="search" style={{ width: 280 }}>{Ic.search}<input placeholder="Buscar evento…"/></div>
        <select className="btn sm"><option>Todas las fuentes</option><option>Manual</option><option>Automático</option></select>
        <select className="btn sm"><option>Últimos 7 días</option><option>Últimos 30 días</option><option>Este año</option></select>
        <div style={{ marginLeft: "auto", fontSize: 12, color: "var(--ink-3)" }}>{audit.length} eventos</div>
      </div>

      <div style={{ background: "var(--surface)", border: "1px solid var(--line)", borderRadius: 14 }}>
        {audit.map(e => (
          <div key={e.id} className="audit-row">
            <div className="ic">{e.actorAvatar}</div>
            <div>
              <div><b className="actor">{e.actor}</b> <span className="desc">{e.action} <b>{e.target}</b></span></div>
            </div>
            <div className="source">{e.source === "manual" ? "✋ Manual" : e.source === "auto" ? "⚙ Automático" : <span><code>{e.source}</code></span>}</div>
            <div className="when">{e.when}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// =========================================================================
// WIZARDS
// =========================================================================
function NewUserWizard({ onClose, onCreated }) {
  const [step, setStep] = useStateV(0);
  const hubs = window.AvivaData.hubs;
  const quioscos = window.AvivaData.quioscos;
  const [form, setForm] = useStateV({
    nombre: "", apellidos: "",
    email: "",
    numColaborador: "",
    empresa: "Aviva Financial",
    puesto: "Promotor/a Aviva tu Compra",
    hub: "hub3_region-pue-mor-tlax",
    quiosco: "Tlaxcala",
    estado: "Tlaxcala",
    manager: "",
    genero: "M",
    talla: "M",
    startDate: "2026-06-01",
    accesses: ["google", "slack", "okta", "humand", "pld", "factorial", "hubspot", "avivaflat", "tablets"]
  });
  function f(k, v) { setForm(p => ({ ...p, [k]: v })); }

  function next() { if (step < 3) setStep(step + 1); else onCreated(form); }

  const steps = ["Persona", "Empleo", "Accesos", "Revisión"];

  return (
    <div className="panel">
      <div className="row" style={{ padding: "14px 20px", borderBottom: "1px solid var(--line)" }}>
        <div className="col">
          <div style={{ fontWeight: 600, fontSize: 15 }}>Alta de persona</div>
          <div style={{ fontSize: 12, color: "var(--ink-3)" }}>Aviva HR creará la cuenta y la provisionará en las apps seleccionadas.</div>
        </div>
        <span style={{ flex: 1 }}/>
        <button className="iconbtn" onClick={onClose}>{Ic.close}</button>
      </div>
      <div className="wizard-stepper">
        {steps.map((s, i) => (
          <React.Fragment key={s}>
            <div className={"wizard-step " + (i === step ? "active" : i < step ? "done" : "")}>
              <span className="num">{i < step ? Ic.check : (i + 1)}</span>
              <span>{s}</span>
            </div>
            {i < steps.length - 1 && <span className="sep"/>}
          </React.Fragment>
        ))}
      </div>

      <div style={{ padding: 20, overflow: "auto" }}>
        {step === 0 && (
          <div>
            <div className="field-row">
              <div className="field"><label>Nombre(s)</label><input type="text" value={form.nombre} onChange={e => f("nombre", e.target.value)} placeholder="Adrián"/></div>
              <div className="field"><label>Apellidos</label><input type="text" value={form.apellidos} onChange={e => f("apellidos", e.target.value)} placeholder="Contreras Zapata"/></div>
            </div>
            <div className="field-row">
              <div className="field">
                <label>Número de colaborador</label>
                <input type="text" value={form.numColaborador} onChange={e => f("numColaborador", e.target.value)} placeholder="385_02"/>
                <span className="hint">Si lo dejas vacío se genera automáticamente.</span>
              </div>
              <div className="field">
                <label>Empresa</label>
                <select value={form.empresa} onChange={e => f("empresa", e.target.value)}>
                  <option>Aviva Financial</option>
                  <option>Ejecutando Ideas</option>
                </select>
                <span className="hint">Internos vs. externos (agencia).</span>
              </div>
            </div>
            <div className="field">
              <label>Correo corporativo</label>
              <input type="email" value={form.email} onChange={e => f("email", e.target.value)} placeholder="adrian.contreras@avivacredito.com"/>
              <span className="hint">Se genera automáticamente si lo dejas vacío.</span>
            </div>
            <div className="field-row">
              <div className="field">
                <label>Género (uniforme)</label>
                <select value={form.genero} onChange={e => f("genero", e.target.value)}>
                  <option value="M">Mujer</option>
                  <option value="H">Hombre</option>
                </select>
              </div>
              <div className="field">
                <label>Talla</label>
                <select value={form.talla} onChange={e => f("talla", e.target.value)}>
                  <option>CH</option><option>M</option><option>L</option><option>XL</option><option>XXL</option><option>G</option>
                </select>
              </div>
            </div>
            <div className="field"><label>Fecha de ingreso</label><input type="text" value={form.startDate} onChange={e => f("startDate", e.target.value)}/></div>
          </div>
        )}
        {step === 1 && (
          <div>
            <div className="field"><label>Puesto</label>
              <select value={form.puesto} onChange={e => f("puesto", e.target.value)}>
                {window.AvivaData.puestos.map(p => <option key={p}>{p}</option>)}
              </select>
            </div>
            <div className="field"><label>Hub / equipo</label>
              <select value={form.hub} onChange={e => f("hub", e.target.value)}>
                {hubs.map(h => <option key={h.id} value={h.id}>{h.label}</option>)}
              </select>
            </div>
            <div className="field-row">
              <div className="field">
                <window.LocationPicker label="Locación / Quiósco" value={form._locationId} onChange={v => {
                  const loc = window.AvivaData.locations.find(x => x.id === v);
                  f("_locationId", v);
                  if (loc) {
                    f("quiosco", loc.ubicacion || loc.ciudad);
                    f("estado", loc.estado);
                  }
                }} placeholder="Buscar locación…"/>
              </div>
            </div>
            <div className="field">
              <window.PersonPicker label="Jefe inmediato" value={form.manager} onChange={v => f("manager", v)}
                roleFilter="manager" allowEmpty
                placeholder="Buscar manager…"/>
            </div>
          </div>
        )}
        {step === 2 && (
          <div>
            <div style={{ fontSize: 13, color: "var(--ink-3)", marginBottom: 10 }}>Aviva provisionará a la persona en estas apps al confirmar:</div>
            <div className="integration-grid" style={{ gridTemplateColumns: "repeat(2, 1fr)" }}>
              {window.AvivaData.integrationsAll.map(it => {
                const checked = form.accesses.includes(it.id);
                return (
                  <label key={it.id} className="row" style={{
                    padding: "10px 12px", border: "1px solid var(--line)", borderRadius: 10,
                    background: checked ? "var(--mint-50)" : "var(--surface)", cursor: "pointer"
                  }}>
                    <input type="checkbox" className="cb" checked={checked} onChange={e => {
                      f("accesses", checked ? form.accesses.filter(x => x !== it.id) : [...form.accesses, it.id]);
                    }}/>
                    <AppChip id={it.id}/>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 600, fontSize: 13 }}>{it.name}</div>
                      <div style={{ fontSize: 11.5, color: "var(--ink-3)" }}>{it.desc}</div>
                    </div>
                  </label>
                );
              })}
            </div>
          </div>
        )}
        {step === 3 && (
          <div>
            <div style={{ fontSize: 13, color: "var(--ink-3)", marginBottom: 14 }}>Revisa los datos antes de crear la cuenta.</div>
            <div className="section" style={{ margin: 0 }}>
              <div className="section-body">
                <div className="kv">
                  <div className="k">Nombre</div><div className="v">{form.nombre} {form.apellidos}</div>
                  <div className="k">Número de colaborador</div><div className="v" style={{ fontFamily: "var(--mono)" }}>{form.numColaborador || "— (autogenerar)"}</div>
                  <div className="k">Email</div><div className="v">{form.email || ((form.nombre || "nombre").toLowerCase().split(" ")[0] + "." + (form.apellidos || "apellido").toLowerCase().split(" ")[0] + "@avivacredito.com")}</div>
                  <div className="k">Empresa</div><div className="v">{form.empresa}</div>
                  <div className="k">Puesto</div><div className="v">{form.puesto}</div>
                  <div className="k">Hub</div><div className="v">{hubs.find(h => h.id === form.hub)?.label}</div>
                  <div className="k">Quiósco</div><div className="v">{form.quiosco}, {form.estado}</div>
                  <div className="k">Talla / Género</div><div className="v">{form.talla} · {form.genero === "M" ? "Mujer" : "Hombre"}</div>
                  <div className="k">Fecha ingreso</div><div className="v">{form.startDate}</div>
                  <div className="k">Apps a provisionar</div>
                  <div className="v">
                    <div className="row" style={{ gap: 4, flexWrap: "wrap" }}>
                      {form.accesses.map(a => <AppChip key={a} id={a}/>)}
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="row" style={{ marginTop: 14, padding: 12, background: "var(--mint-50)", borderRadius: 10, fontSize: 12.5, color: "var(--green-700)" }}>
              {Ic.shield} <span>Se enviará invitación por email + WhatsApp. Aparecerá como <b>Invitado</b> hasta su primer acceso. Tablet y uniforme se solicitan automáticamente a Operaciones.</span>
            </div>
          </div>
        )}
      </div>

      <div style={{ padding: 14, borderTop: "1px solid var(--line)", display: "flex", gap: 8, alignItems: "center" }}>
        {step > 0 && <button className="btn" onClick={() => setStep(step - 1)}>Atrás</button>}
        <span style={{ flex: 1, fontSize: 12, color: "var(--ink-3)" }}>Paso {step + 1} de {steps.length}</span>
        <button className="btn ghost" onClick={onClose}>Cancelar</button>
        <button className="btn primary" onClick={next}>
          {step === 3 ? <>{Ic.check} Crear y enviar invitación</> : <>Continuar {Ic.chevR}</>}
        </button>
      </div>
    </div>
  );
}

function OffboardWizard({ users, defaultUserId, onClose, onCreated }) {
  const [userId, setUserId] = useStateV(defaultUserId || users[0]?.id);
  const u = users.find(x => x.id === userId);
  const [reason, setReason] = useStateV("Cambio voluntario de empresa");
  const [lastDay, setLastDay] = useStateV("2026-06-15");
  const [transferTo, setTransferTo] = useStateV(users[1]?.id || "");
  const [revoke, setRevoke] = useStateV(true);
  const [generateFiniquito, setGenerateFiniquito] = useStateV(true);
  const [archive, setArchive] = useStateV(true);

  return (
    <div className="panel">
      <div className="row" style={{ padding: "14px 20px", borderBottom: "1px solid var(--line)" }}>
        <div className="col">
          <div style={{ fontWeight: 600, fontSize: 15, color: "var(--danger-fg)" }}>Iniciar baja de persona</div>
          <div style={{ fontSize: 12, color: "var(--ink-3)" }}>Se creará un ticket con aprobaciones encadenadas y tareas automáticas.</div>
        </div>
        <span style={{ flex: 1 }}/>
        <button className="iconbtn" onClick={onClose}>{Ic.close}</button>
      </div>

      <div style={{ padding: 20, overflow: "auto" }}>
        <div className="field">
          <label>Persona</label>
          <select value={userId} onChange={e => setUserId(e.target.value)}>
            {users.filter(x => x.status !== "archived").map(x => <option key={x.id} value={x.id}>{x.fullName} · {x.role} · {x.team}</option>)}
          </select>
        </div>
        {u && (
          <div className="row" style={{ gap: 10, padding: 12, background: "var(--mint-50)", borderRadius: 10, marginBottom: 16 }}>
            <Avatar user={u} size="lg"/>
            <div className="col" style={{ flex: 1 }}>
              <div style={{ fontWeight: 600 }}>{u.fullName} <span style={{ fontFamily: "var(--mono)", color: "var(--ink-3)", fontSize: 11, marginLeft: 6 }}>{u.numColaborador}</span></div>
              <div className="muted" style={{ fontSize: 12 }}>{u.role} · {u.quiosco}, {u.estado}</div>
              <div className="muted" style={{ fontSize: 12 }}>Antigüedad: {formatTenure(u.hireMonths)} · {u.access.length} apps con acceso · {(u.laptop ? 1 : 0) + (u.tablets || []).length} equipos asignados</div>
            </div>
          </div>
        )}

        <div className="field-row">
          <div className="field">
            <label>Motivo</label>
            <select value={reason} onChange={e => setReason(e.target.value)}>
              <option>Cambio voluntario de empresa</option>
              <option>Fin de contrato</option>
              <option>Despido</option>
              <option>Suspensión por investigación interna</option>
              <option>Jubilación</option>
              <option>Otro</option>
            </select>
          </div>
          <div className="field"><label>Última jornada</label><input type="text" value={lastDay} onChange={e => setLastDay(e.target.value)}/></div>
        </div>

        <div className="field">
          <label>Traspasar deals de HubSpot, Drive y notas a…</label>
          <select value={transferTo} onChange={e => setTransferTo(e.target.value)}>
            <option value="">No transferir</option>
            {users.filter(x => x.id !== userId).map(x => <option key={x.id} value={x.id}>{x.fullName} · {x.quiosco}</option>)}
          </select>
          <span className="hint">Los deals abiertos y documentos compartidos se reasignan automáticamente.</span>
        </div>

        <div className="field"><label>Tareas automáticas</label>
          <div className="col" style={{ gap: 6 }}>
            <label className="row"><input type="checkbox" className="cb" checked={revoke} onChange={e => setRevoke(e.target.checked)}/> Revocar acceso en todas las apps conectadas el día de baja</label>
            <label className="row"><input type="checkbox" className="cb" checked={generateFiniquito} onChange={e => setGenerateFiniquito(e.target.checked)}/> Generar finiquito y carta de cese en Factorial</label>
            <label className="row"><input type="checkbox" className="cb" checked={archive} onChange={e => setArchive(e.target.checked)}/> Archivar expediente y programar borrado a los 90 días</label>
          </div>
        </div>

        <div className="row" style={{ gap: 8, padding: 12, background: "var(--warn-bg)", color: "var(--warn-fg)", borderRadius: 10, fontSize: 13 }}>
          {Ic.warn} <span>Este ticket requiere aprobación de <b>Manager</b>, <b>HR Business Partner</b> e <b>IT</b> antes de ejecutar tareas irreversibles.</span>
        </div>
      </div>

      <div style={{ padding: 14, borderTop: "1px solid var(--line)", display: "flex", gap: 8 }}>
        <button className="btn ghost" onClick={onClose}>Cancelar</button>
        <span style={{ flex: 1 }}/>
        <button className="btn">Guardar borrador</button>
        <button className="btn primary" onClick={() => onCreated({ userId, reason, lastDay, transferTo })}>
          Crear ticket {Ic.arrowR}
        </button>
      </div>
    </div>
  );
}

Object.assign(window, {
  DirectoryView, UserProfile, TicketsView, TicketDetail, IntegrationsView, AuditView,
  NewUserWizard, OffboardWizard, KPIs, formatTenure
});


// =========================================================================
// EDIT USER MODAL
// =========================================================================
function EditUserModal({ user, onClose }) {
  const u = user;
  const [form, setForm] = useStateV({
    role: u.role,
    hub: u.hub,
    manager: u.manager,
    _locationId: window.AvivaData.locations.find(l => {
      const norm = s => (s||"").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s+ba$| atn$| cm$/i, "").trim();
      return norm(l.ciudad) === norm(u.quiosco);
    })?.id || null,
    quiosco: u.quiosco,
    estado: u.estado,
    email: u.email,
    phone: u.phone,
    talla: u.talla,
    genero: u.genero,
    status: u.status,
  });
  function f(k, v) { setForm(p => ({ ...p, [k]: v })); }
  function save() {
    Object.assign(u, form);
    onClose();
    window.dispatchEvent(new Event("resize"));
  }
  const hubs = window.AvivaData.hubs;

  return (
    <div className="panel" style={{ width: "min(720px, 96vw)" }}>
      <div className="row" style={{ padding: "14px 20px", borderBottom: "1px solid var(--line)" }}>
        <Avatar user={u}/>
        <div className="col">
          <div style={{ fontWeight: 600, fontSize: 15 }}>Editar persona</div>
          <div style={{ fontSize: 12, color: "var(--ink-3)" }}>{u.fullName} · <span style={{ fontFamily: "var(--mono)" }}>{u.numColaborador}</span></div>
        </div>
        <span style={{ flex: 1 }}/>
        <button className="iconbtn" onClick={onClose}>{Ic.close}</button>
      </div>
      <div style={{ padding: 20, overflow: "auto", maxHeight: "70vh" }}>
        <div className="edit-section">
          <div className="edit-section-head">Contacto</div>
          <div className="field-row">
            <div className="field"><label>Correo corporativo</label><input type="email" value={form.email} onChange={e => f("email", e.target.value)}/></div>
            <div className="field"><label>Teléfono / WhatsApp</label><input type="text" value={form.phone} onChange={e => f("phone", e.target.value)}/></div>
          </div>
          <div className="field-row">
            <div className="field"><label>Género (uniforme)</label>
              <select value={form.genero} onChange={e => f("genero", e.target.value)}>
                <option value="M">Mujer</option>
                <option value="H">Hombre</option>
              </select>
            </div>
            <div className="field"><label>Talla</label>
              <select value={form.talla} onChange={e => f("talla", e.target.value)}>
                <option>CH</option><option>M</option><option>L</option><option>XL</option><option>XXL</option><option>G</option>
              </select>
            </div>
          </div>
        </div>

        <div className="edit-section">
          <div className="edit-section-head">Empleo</div>
          <div className="field"><label>Puesto</label>
            <select value={form.role} onChange={e => f("role", e.target.value)}>
              {window.AvivaData.puestos.map(p => <option key={p}>{p}</option>)}
            </select>
          </div>
          <div className="field"><label>Hub regional</label>
            <select value={form.hub} onChange={e => f("hub", e.target.value)}>
              {hubs.map(h => <option key={h.id} value={h.id}>{h.label}</option>)}
            </select>
          </div>
          <div className="field">
            <window.PersonPicker label="Jefe inmediato" value={form.manager} onChange={v => f("manager", v)}
              roleFilter="manager" allowEmpty
              placeholder="Buscar manager…"/>
          </div>
          <div className="field">
            <window.LocationPicker label="Locación / Quiósco" value={form._locationId} onChange={v => {
              const loc = window.AvivaData.locations.find(x => x.id === v);
              f("_locationId", v);
              if (loc) { f("quiosco", loc.ubicacion || loc.ciudad); f("estado", loc.estado); }
            }} placeholder="Buscar locación…"/>
          </div>
        </div>

        <div className="edit-section">
          <div className="edit-section-head">Estatus en Aviva</div>
          <div className="field"><label>Estado</label>
            <select value={form.status} onChange={e => f("status", e.target.value)}>
              <option value="active">Activo</option>
              <option value="invited">Invitado</option>
              <option value="suspended">Suspendido</option>
              <option value="offboarding">En baja</option>
            </select>
          </div>
        </div>
      </div>
      <div style={{ padding: 14, borderTop: "1px solid var(--line)", display: "flex", gap: 8, alignItems: "center", background: "var(--surface)" }}>
        <button className="btn danger sm">Iniciar baja</button>
        <span style={{ flex: 1 }}/>
        <button className="btn" onClick={onClose}>Cancelar</button>
        <button className="btn accent" onClick={save}>{Ic.check} Guardar cambios</button>
      </div>
    </div>
  );
}

window.EditUserModal = EditUserModal;
