// Aviva HR — Locaciones (kioscos) view + detail
const { useState: useStateL, useMemo: useMemoL, useEffect: useEffectL } = React;

// =========================================================================
// Helpers
// =========================================================================
function antiguedadFromDate(iso) {
  if (!iso) return "—";
  const d = new Date(iso);
  const now = new Date(2026, 4, 19);
  const months = Math.max(0, Math.floor((now - d) / (1000 * 60 * 60 * 24 * 30.44)));
  if (months < 12) return months + " m";
  const y = Math.floor(months / 12);
  const m = months % 12;
  return y + " a " + (m ? m + " m" : "");
}

function locationFullName(l) {
  return l.ubicacion || (l.catLabel + " " + l.ciudad);
}

// Match users → location by quiósco name (fuzzy: ignore "BA" suffix, accents, case)
function norm(s) {
  return (s||"").toString().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s+ba$/, "").replace(/\s+atn$/, "").replace(/\s+cm$/, "").trim();
}
function usersAtLocation(location, allUsers) {
  const key = norm(location.ciudad);
  return allUsers.filter(u => norm(u.quiosco) === key || norm(u.quiosco) === norm(location.ciudad + " BA") || norm(u.quiosco) === norm(location.ciudad + " ATN"));
}

// Kit progress: percent of "ok" items
function kitProgress(kit) {
  const entries = Object.entries(kit);
  const total = entries.filter(([k,v]) => v !== "n/a").length;
  const ok = entries.filter(([k,v]) => v === "ok").length;
  return total ? ok / total : 1;
}

// =========================================================================
// Tiny category badge with brand glyph
// =========================================================================
function CategoryBadge({ location, size }) {
  const s = size || 28;
  return (
    <div title={location.catLabel} style={{
      width: s, height: s, borderRadius: 7, flexShrink: 0,
      background: location.catBg, color: location.catColor,
      display: "grid", placeItems: "center",
      fontSize: s > 36 ? 13 : 10.5, fontWeight: 700, letterSpacing: 0.02,
      border: "1px solid " + location.catColor + "22",
      fontFamily: "var(--mono)"
    }}>{location.catShort}</div>
  );
}

function LocationStatusBadge({ status }) {
  const map = {
    open:   { c: "active",     l: "Abierto" },
    vacant: { c: "suspended",  l: "Sin cobertura" },
    closed: { c: "archived",   l: "Cerrado" },
  };
  const m = map[status] || map.open;
  return <span className={"badge " + m.c}><span className="dot"/>{m.l}</span>;
}

function KitDots({ kit }) {
  const labels = {
    sim: "SIM", lanyard: "Lanyard", nametag: "Nametag", pin: "Pin Aviva",
    audifonos: "Audífonos", tablet: "Tablet", uniforme: "Uniforme",
  };
  return (
    <div className="kit-dots">
      {Object.entries(kit).map(([k, v]) => (
        <span key={k} className={"kit-dot kit-" + v} title={labels[k] + ": " + v}>
          <span className="d"/>
          <span className="lbl">{labels[k] || k}</span>
        </span>
      ))}
    </div>
  );
}

// =========================================================================
// LOCATIONS VIEW
// =========================================================================
function LocationsView({ users, onOpenLocation, onNewLocation, layout, density }) {
  const all = window.AvivaData.locations;
  const cats = window.AvivaData.locationCategories;

  const [tab, setTab] = useStateL("all");
  const [q, setQ] = useStateL("");
  const [estadoF, setEstadoF] = useStateL("all");
  const [hubF, setHubF] = useStateL("all");
  const [statusF, setStatusF] = useStateL("all");
  const [sortBy, setSortBy] = useStateL("apertura");

  const filtered = useMemoL(() => {
    let arr = all.filter(l => {
      if (tab !== "all" && l.categoria !== tab) return false;
      if (estadoF !== "all" && l.estado !== estadoF) return false;
      if (hubF !== "all" && l.hub !== hubF) return false;
      if (statusF !== "all" && l.status !== statusF) return false;
      if (q) {
        const t = norm(q);
        if (!norm(locationFullName(l)).includes(t) &&
            !norm(l.ciudad).includes(t) &&
            !norm(l.direccion).includes(t) &&
            !norm(l.gerente).includes(t) &&
            !norm(l.code).includes(t) &&
            !norm(l.determinante || "").includes(t)) return false;
      }
      return true;
    });
    if (sortBy === "name")     arr.sort((a,b) => locationFullName(a).localeCompare(locationFullName(b)));
    if (sortBy === "ciudad")   arr.sort((a,b) => a.ciudad.localeCompare(b.ciudad));
    if (sortBy === "estado")   arr.sort((a,b) => a.estado.localeCompare(b.estado));
    if (sortBy === "apertura") arr.sort((a,b) => (b.fechaApertura || "").localeCompare(a.fechaApertura || ""));
    if (sortBy === "antiguo")  arr.sort((a,b) => (a.fechaApertura || "z").localeCompare(b.fechaApertura || "z"));
    return arr;
  }, [all, tab, q, estadoF, hubF, statusF, sortBy]);

  const counts = useMemoL(() => {
    const c = { all: all.length };
    Object.keys(cats).forEach(k => c[k] = all.filter(l => l.categoria === k).length);
    return c;
  }, [all]);

  const stats = window.AvivaData.locationStats;

  return (
    <div className="view-pad">
      <div className="view-head">
        <div>
          <h1>Locaciones</h1>
          <div className="sub">{all.length} kioscos y puntos de venta · {Object.keys(stats.byEstado).length} estados · {Object.keys(stats.byCategoria).length} categorías comerciales.</div>
        </div>
        <div className="actions">
          <button className="btn">{Ic.download} Exportar CSV</button>
          <button className="btn">{Ic.upload} Importar</button>
          <button className="btn accent" onClick={onNewLocation}>{Ic.plus} Nueva locación</button>
        </div>
      </div>

      {/* KPI row — locations specific */}
      <div className="stat-row">
        <div className="stat">
          <span className="accent-strip"/>
          <div className="label">Total locaciones</div>
          <div className="value">{stats.total}</div>
          <div className="foot">
            <span className="delta up">▲ 14 este trimestre</span>
            <span style={{ fontSize: 11, color: "var(--ink-3)" }}>{Object.keys(stats.byEstado).length} estados</span>
          </div>
        </div>
        <div className="stat">
          <span className="accent-strip"/>
          <div className="label">Abiertos · operando</div>
          <div className="value">{stats.open}</div>
          <div className="foot">
            <span style={{ fontSize: 12, color: "var(--green-600)", fontWeight: 600 }}>
              <span className="live-dot"/> {Math.round(stats.open/stats.total*100)}% cobertura
            </span>
          </div>
        </div>
        <div className="stat">
          <span className="accent-strip"/>
          <div className="label">Sin cobertura</div>
          <div className="value">{stats.vacant}</div>
          <div className="foot">
            <span className="delta down">▲ requiere asignar promotor</span>
          </div>
        </div>
        <div className="stat">
          <span className="accent-strip"/>
          <div className="label">Cerrados / archivados</div>
          <div className="value">{stats.closed}</div>
          <div className="foot">
            <span style={{ fontSize: 12, color: "var(--ink-3)" }}>Histórico inmutable</span>
          </div>
        </div>
      </div>

      {/* Category tabs */}
      <div className="toolbar">
        <div className="toolbar-row" style={{ flexWrap: "wrap" }}>
          <div className="tab-row" style={{ flexWrap: "wrap" }}>
            <button className={"tab " + (tab === "all" ? "active" : "")} onClick={() => setTab("all")}>
              Todas <span className="pill">{counts.all}</span>
            </button>
            {Object.entries(cats).map(([k, info]) => (
              <button key={k} className={"tab " + (tab === k ? "active" : "")} onClick={() => setTab(k)}>
                <span className="cat-chip" style={{ background: info.bg, color: info.color, border: "1px solid " + info.color + "33" }}>{info.short}</span>
                {info.label} <span className="pill">{counts[k] || 0}</span>
              </button>
            ))}
          </div>
          <div className="right" style={{ marginLeft: "auto" }}>
            <span style={{ fontSize: 12, color: "var(--ink-3)" }}>{filtered.length} resultados</span>
            <div className="layout-toggle">
              <button className={layout === "table" ? "active" : ""} onClick={() => window.__setLocLayout?.("table")} title="Tabla">{Ic.table}</button>
              <button className={layout === "grid" ? "active" : ""} onClick={() => window.__setLocLayout?.("grid")} title="Tarjetas">{Ic.grid}</button>
              <button className={layout === "map" ? "active" : ""} onClick={() => window.__setLocLayout?.("map")} title="Mapa">{Ic.map}</button>
            </div>
          </div>
        </div>
        <div className="toolbar-row" style={{ borderTop: "1px dashed var(--line)", paddingTop: 10 }}>
          <div className="search" style={{ flex: 1, minWidth: 220, maxWidth: 380 }}>
            {Ic.search}
            <input placeholder="Buscar locación, ciudad, dirección, gerente, código…" value={q} onChange={e => setQ(e.target.value)}/>
          </div>
          <select className="btn sm" value={estadoF} onChange={e => setEstadoF(e.target.value)}>
            <option value="all">Todos los estados</option>
            {Object.keys(stats.byEstado).filter(s => s).sort().map(e => <option key={e} value={e}>{e} ({stats.byEstado[e]})</option>)}
          </select>
          <select className="btn sm" value={hubF} onChange={e => setHubF(e.target.value)}>
            <option value="all">Todos los hubs</option>
            {window.AvivaData.hubs.map(h => <option key={h.id} value={h.id}>{h.label}</option>)}
          </select>
          <select className="btn sm" value={statusF} onChange={e => setStatusF(e.target.value)}>
            <option value="all">Todos los estatus</option>
            <option value="open">Abiertos</option>
            <option value="vacant">Sin cobertura</option>
            <option value="closed">Cerrados</option>
          </select>
          <select className="btn sm" value={sortBy} onChange={e => setSortBy(e.target.value)}>
            <option value="apertura">Apertura ↓</option>
            <option value="antiguo">Más antiguos</option>
            <option value="name">Nombre A–Z</option>
            <option value="ciudad">Ciudad A–Z</option>
            <option value="estado">Estado A–Z</option>
          </select>
        </div>
      </div>

      {layout === "table" && (
        <LocationsTable rows={filtered} users={users} density={density} onOpen={onOpenLocation}/>
      )}
      {layout === "grid" && (
        <LocationsGrid rows={filtered} users={users} onOpen={onOpenLocation}/>
      )}
      {layout === "map" && (
        <LocationsMap rows={filtered} all={all} users={users} onOpen={onOpenLocation}/>
      )}
    </div>
  );
}

// =========================================================================
// TABLE LAYOUT
// =========================================================================
function LocationsTable({ rows, users, density, onOpen }) {
  return (
    <div className={"table-card " + (density === "compact" ? "density-compact" : "")}>
      <div style={{ overflowX: "auto" }}>
        <table className="users locations">
          <thead>
            <tr>
              <th>Locación</th>
              <th>Categoría</th>
              <th>Estado</th>
              <th>Gerente</th>
              <th>Personas</th>
              <th>Apertura</th>
              <th>Antigüedad</th>
              <th>Kit / Equipo</th>
              <th>Estatus</th>
              <th style={{ width: 36 }}></th>
            </tr>
          </thead>
          <tbody>
            {rows.map(l => {
              const team = usersAtLocation(l, users);
              return (
                <tr key={l.id} onClick={() => onOpen(l)}>
                  <td>
                    <div className="user-cell">
                      <CategoryBadge location={l} size={32}/>
                      <div>
                        <div className="name">{locationFullName(l)}</div>
                        <div className="email">
                          <span style={{ fontFamily: "var(--mono)", color: "var(--ink-4)" }}>{l.code}</span>
                          {l.determinante && <> · det. {l.determinante}</>}
                          {" · "}{l.ciudad}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td><span className="badge neutral" style={{ fontSize: 11 }}>{l.catLabel}</span></td>
                  <td className="muted" style={{ fontSize: 12 }}>{l.estado}</td>
                  <td>
                    {l.gerente ? (
                      <span className="row" style={{ gap: 6 }}>
                        <div className="av" style={{ width: 22, height: 22, fontSize: 9 }}>{(l.gerente.split(" ")[0]?.[0] || "?") + (l.gerente.split(" ").slice(-1)[0]?.[0] || "")}</div>
                        <span style={{ fontSize: 12 }}>{l.gerente.split(" ").slice(0,2).join(" ")}</span>
                      </span>
                    ) : <span className="muted" style={{ fontSize: 12 }}>—</span>}
                  </td>
                  <td>
                    {team.length === 0 ? (
                      <span className="muted" style={{ fontSize: 12 }}>—</span>
                    ) : (
                      <div className="avstack">
                        {team.slice(0, 3).map(u => <Avatar key={u.id} user={u}/>)}
                        {team.length > 3 && <span className="more">+{team.length - 3}</span>}
                      </div>
                    )}
                  </td>
                  <td className="muted" style={{ fontSize: 12 }}>{l.fechaApertura || "—"}</td>
                  <td className="muted" style={{ fontSize: 12 }}>{antiguedadFromDate(l.fechaApertura)}</td>
                  <td>
                    <div className="row" style={{ gap: 6 }}>
                      <div className="pbar" style={{ width: 56, height: 4 }}>
                        <div className="fill" style={{
                          width: (kitProgress(l.kit) * 100) + "%",
                          background: kitProgress(l.kit) > 0.8 ? "var(--green-500)" : kitProgress(l.kit) > 0.5 ? "#f0a800" : "var(--danger-fg)"
                        }}/>
                      </div>
                      <span style={{ fontSize: 11, color: "var(--ink-3)", fontFamily: "var(--mono)" }}>{Math.round(kitProgress(l.kit)*100)}%</span>
                    </div>
                  </td>
                  <td><LocationStatusBadge status={l.status}/></td>
                  <td onClick={e => e.stopPropagation()}>
                    <button className="iconbtn" title="Más">{Ic.more}</button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// =========================================================================
// GRID LAYOUT
// =========================================================================
function LocationsGrid({ rows, users, onOpen }) {
  return (
    <div style={{ background: "var(--surface)", border: "1px solid var(--line)", borderRadius: "0 0 14px 14px", padding: 16 }}>
      <div className="loc-grid">
        {rows.map(l => {
          const team = usersAtLocation(l, users);
          return (
            <div key={l.id} className="loc-card" onClick={() => onOpen(l)}>
              <div className="loc-card-top" style={{ background: l.catBg }}>
                <div className="row" style={{ justifyContent: "space-between", alignItems: "flex-start" }}>
                  <CategoryBadge location={l} size={36}/>
                  <LocationStatusBadge status={l.status}/>
                </div>
                <div className="loc-card-title">{locationFullName(l)}</div>
                <div className="loc-card-meta">
                  <span style={{ fontFamily: "var(--mono)", color: "var(--ink-3)" }}>{l.code}</span>
                  <span>· {l.ciudad}, {l.estado}</span>
                </div>
              </div>
              <div className="loc-card-body">
                <div className="loc-card-row">
                  <span className="k">Gerente</span>
                  <span className="v">{l.gerente || <span className="muted">— por asignar</span>}</span>
                </div>
                <div className="loc-card-row">
                  <span className="k">Apertura</span>
                  <span className="v">{l.fechaApertura || "—"} <span className="muted" style={{ fontSize: 11 }}>({antiguedadFromDate(l.fechaApertura)})</span></span>
                </div>
                <div className="loc-card-row">
                  <span className="k">Personas</span>
                  <span className="v">
                    {team.length === 0 ? <span className="muted">—</span> :
                      <div className="avstack">
                        {team.slice(0,4).map(u => <Avatar key={u.id} user={u}/>)}
                        {team.length > 4 && <span className="more">+{team.length - 4}</span>}
                      </div>
                    }
                  </span>
                </div>
                <KitDots kit={l.kit}/>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// =========================================================================
// MAP LAYOUT — grouped by state, stylized cards
// =========================================================================
function LocationsMap({ rows, all, users, onOpen }) {
  // Group filtered rows by estado
  const byEstado = useMemoL(() => {
    const g = {};
    rows.forEach(l => { (g[l.estado] = g[l.estado] || []).push(l); });
    return g;
  }, [rows]);

  const estados = Object.keys(byEstado).sort((a,b) => byEstado[b].length - byEstado[a].length);

  return (
    <div style={{ background: "var(--surface)", border: "1px solid var(--line)", borderRadius: "0 0 14px 14px", padding: 16 }}>
      <div className="row" style={{ gap: 10, padding: "0 4px 14px", color: "var(--ink-3)", fontSize: 12 }}>
        <span>📍 Vista geográfica · {rows.length} locaciones en {estados.length} estados</span>
        <span style={{ marginLeft: "auto" }}>Haz clic en una locación para abrirla</span>
      </div>
      <div className="map-grid">
        {estados.map(estado => {
          const locs = byEstado[estado];
          const open = locs.filter(l => l.status === "open").length;
          const vacant = locs.filter(l => l.status === "vacant").length;
          return (
            <div key={estado} className="map-state">
              <div className="map-state-head">
                <div>
                  <div className="state-name">{estado || "Sin estado"}</div>
                  <div className="state-sub">{locs.length} {locs.length === 1 ? "locación" : "locaciones"} · {open} abiertas{vacant ? " · " + vacant + " vacantes" : ""}</div>
                </div>
                <div className="state-shape" aria-hidden>
                  {locs.slice(0, Math.min(locs.length, 24)).map((l, i) => (
                    <span key={i} className="state-dot" style={{
                      background: l.status === "open" ? "var(--green-500)" : l.status === "vacant" ? "#f0a800" : "var(--ink-4)",
                      transform: `translate(${(i*37)%80}px, ${(i*23)%48}px)`
                    }}/>
                  ))}
                </div>
              </div>
              <div className="map-state-body">
                {locs.slice(0, 8).map(l => {
                  const team = usersAtLocation(l, users);
                  return (
                    <div key={l.id} className="map-loc-row" onClick={() => onOpen(l)}>
                      <CategoryBadge location={l} size={26}/>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div className="name">{locationFullName(l)}</div>
                        <div className="sub">{l.ciudad} · {l.catLabel}</div>
                      </div>
                      {team.length > 0 && (
                        <div className="avstack">
                          {team.slice(0,2).map(u => <Avatar key={u.id} user={u}/>)}
                          {team.length > 2 && <span className="more">+{team.length - 2}</span>}
                        </div>
                      )}
                      <LocationStatusBadge status={l.status}/>
                    </div>
                  );
                })}
                {locs.length > 8 && (
                  <button className="map-show-more" onClick={() => window.__filterEstado?.(estado)}>
                    Ver las {locs.length - 8} restantes en {estado} {Ic.chevR}
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// =========================================================================
// LOCATION DETAIL (drawer body)
// =========================================================================
function LocationDetail({ location, users, onClose, onOpenUser }) {
  const [tab, setTab] = useStateL("info");
  const [editing, setEditing] = useStateL(false);
  const [showFullHistory, setShowFullHistory] = useStateL(false);
  if (!location) return null;
  const l = location;
  const hub = window.AvivaData.hubs.find(h => h.id === l.hub);
  const team = usersAtLocation(l, users);
  const isBA = ["BA","MBA","SBA"].includes(l.categoria);

  // Expose for parent (drawer-head button)
  useEffectL(() => {
    window.__openFullHistory = () => setShowFullHistory(true);
    return () => { window.__openFullHistory = null; };
  }, [location?.id]);

  // Full history takeover view
  if (showFullHistory) {
    return <LocationFullHistory location={l} hub={hub} onBack={() => setShowFullHistory(false)}/>;
  }

  return (
    <div className="drawer-body">
      <div className="loc-hero" style={{ background: "linear-gradient(180deg, " + l.catBg + "55, var(--surface) 70%)" }}>
        <div className="loc-hero-row">
          <div className="loc-hero-brand" style={{ background: l.catColor + "15", color: l.catColor, borderColor: l.catColor + "33" }}>
            <span className="short">{l.catShort}</span>
          </div>
          <div className="loc-hero-main">
            <div className="loc-hero-tags">
              <span className="loc-tag mono">#{l.code}</span>
              {l.determinante && <span className="loc-tag mono">det. {l.determinante}</span>}
              <span className="loc-tag">{l.brand}</span>
              <span className="loc-tag dot-sep">{hub?.label || l.hub}</span>
            </div>
            <h2 className="loc-hero-title">{locationFullName(l)}</h2>
            <div className="loc-hero-meta">
              <span className="loc-meta-item">
                <span className="loc-meta-ic">{Ic.map}</span>
                <b>{l.ciudad}</b>, {l.estado}
              </span>
              {l.direccion && (
                <span className="loc-meta-item loc-meta-addr" title={l.direccion}>
                  {l.direccion}
                </span>
              )}
            </div>
          </div>
          <div className="loc-hero-actions">
            <LocationStatusBadge status={l.status}/>
            <div className="row" style={{ gap: 6 }}>
              <button className="btn sm" onClick={() => window.open("https://www.google.com/maps/search/" + encodeURIComponent(l.direccion || (l.ciudad + ", " + l.estado)), "_blank")}>{Ic.link} Maps</button>
              <button className="btn sm primary" onClick={() => setEditing(true)}>{Ic.edit} Editar</button>
            </div>
          </div>
        </div>
      </div>

      <window.Modal open={editing} onClose={() => setEditing(false)}>
        <window.EditLocationModal location={l} onClose={() => setEditing(false)}/>
      </window.Modal>

      <div className="profile-tabs">
        {[
          ["info","Información"],
          ["personas","Personas (" + team.length + ")"],
          isBA && ["equipo","Equipamiento"],
          ["kit","Kit y uniforme"],
          ["history","Historial"],
        ].filter(Boolean).map(([k, lbl]) => (
          <button key={k} className={"profile-tab " + (tab === k ? "active" : "")} onClick={() => setTab(k)}>{lbl}</button>
        ))}
      </div>

      {tab === "info" && <LocationInfo l={l} hub={hub}/>}
      {tab === "personas" && <LocationPersonas l={l} team={team} onOpenUser={onOpenUser}/>}
      {tab === "equipo" && <LocationEquipo l={l}/>}
      {tab === "kit" && <LocationKit l={l}/>}
      {tab === "history" && <LocationHistory l={l} onOpenFull={() => setShowFullHistory(true)}/>}
    </div>
  );
}

function LocationInfo({ l, hub }) {
  return (
    <div>
      <div className="section">
        <div className="section-head"><h3>Datos generales</h3><span className="muted" style={{ fontSize: 12 }}>Última actualización: hace 1 d</span></div>
        <div className="section-body">
          <div className="kv">
            <div className="k">Nombre comercial</div><div className="v">{l.ubicacion || "—"}</div>
            <div className="k">Código interno</div><div className="v" style={{ fontFamily: "var(--mono)" }}>{l.code}</div>
            {l.determinante && <><div className="k">Determinante</div><div className="v" style={{ fontFamily: "var(--mono)" }}>{l.determinante}</div></>}
            <div className="k">Categoría</div><div className="v"><span className="badge neutral">{l.catLabel}</span> <span className="muted" style={{ marginLeft: 8 }}>marca {l.brand}</span></div>
            <div className="k">Estatus</div><div className="v"><LocationStatusBadge status={l.status}/></div>
          </div>
        </div>
      </div>
      <div className="section">
        <div className="section-head"><h3>Ubicación</h3></div>
        <div className="section-body">
          <div className="kv">
            <div className="k">Ciudad</div><div className="v">{l.ciudad}</div>
            <div className="k">Estado</div><div className="v">{l.estado}</div>
            <div className="k">Dirección</div><div className="v">{l.direccion || <span className="muted">— sin dirección registrada</span>}</div>
            <div className="k">Mapa</div><div className="v"><a href="#" onClick={e => e.preventDefault()} style={{ color: "var(--green-700)", textDecoration: "none", fontWeight: 600 }}>{Ic.link} Abrir en Google Maps</a></div>
          </div>
        </div>
      </div>
      <div className="section">
        <div className="section-head"><h3>Operación</h3></div>
        <div className="section-body">
          <div className="kv">
            <div className="k">Hub responsable</div><div className="v">{hub?.label || l.hub}{hub && <span className="muted" style={{ marginLeft: 8 }}>· líder {hub.leader}</span>}</div>
            <div className="k">Gerente del kiosco</div>
            <div className="v"><window.PersonChip person={l.gerente}/></div>
            {l.promotorAtn && <>
              <div className="k">Promotor Aviva tu Negocio</div>
              <div className="v"><window.PersonChip person={l.promotorAtn}/></div>
            </>}
            <div className="k">Fecha de apertura</div><div className="v">{l.fechaApertura || "—"} <span className="muted" style={{ marginLeft: 8 }}>· {antiguedadFromDate(l.fechaApertura)} en operación</span></div>
            {l.fechaCierre && <><div className="k">Fecha de cierre</div><div className="v" style={{ color: "var(--danger-fg)", fontWeight: 600 }}>{l.fechaCierre}</div></>}
          </div>
        </div>
      </div>
    </div>
  );
}

function LocationPersonas({ l, team, onOpenUser }) {
  return (
    <div className="section">
      <div className="section-head">
        <h3>Personas asignadas ({team.length})</h3>
        <button className="btn sm">{Ic.plus} Asignar persona</button>
      </div>
      <div className="section-body" style={{ padding: 0 }}>
        {team.length === 0 ? (
          <div className="empty" style={{ padding: 24 }}>
            <div style={{ fontSize: 13.5, color: "var(--ink-3)", textAlign: "center" }}>
              No hay personas asignadas a esta locación.
              <div style={{ marginTop: 10 }}>
                <button className="btn sm accent">{Ic.plus} Crear alta para esta locación</button>
              </div>
            </div>
          </div>
        ) : team.map((u, i) => {
          const mgr = window.AvivaData.users.find(x => x.id === u.manager);
          return (
            <div key={u.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "14px 16px", borderBottom: i < team.length - 1 ? "1px solid var(--line)" : 0, cursor: "pointer" }} onClick={() => onOpenUser(u)}>
              <Avatar user={u} size="lg"/>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, fontSize: 14 }}>{u.fullName}</div>
                <div style={{ fontSize: 12.5, color: "var(--ink-3)" }}>{u.role} · <span style={{ fontFamily: "var(--mono)" }}>{u.numColaborador}</span></div>
                {mgr && <div style={{ fontSize: 11.5, color: "var(--ink-4)", marginTop: 2 }}>Reporta a {mgr.fullName}</div>}
              </div>
              <StatusBadge status={u.status}/>
              <button className="iconbtn">{Ic.chevR}</button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function LocationEquipo({ l }) {
  const items = [
    { k: "Módulo / cabina",     v: l.modulo || "Cabina móvil", state: l.modulo ? "ok" : "missing" },
    { k: "Tablet móvil",        v: l.tabletMobil === "NO TIENE" ? "Sin tablet" : (l.tabletMobil || "Tablet Samsung A8"), state: l.tabletMobil === "NO TIENE" ? "missing" : "ok" },
    { k: "SIM",                 v: l.sim === "SIN SIM" ? "Sin SIM" : (l.sim || "SIM TELCEL"), state: l.sim === "SIN SIM" ? "missing" : "ok" },
    { k: "Configuración tablet",v: l.configTablet === "Sí" ? "Configurada" : "Pendiente", state: l.configTablet === "Sí" ? "ok" : "partial" },
    { k: "Modem dedicado",      v: l.modem === "Sí" ? "Instalado" : "No instalado", state: l.modem === "Sí" ? "ok" : "n/a" },
    { k: "Conectividad",        v: l.conectividad || "Por validar", state: l.conectividad ? "ok" : "partial" },
  ];
  return (
    <div className="section">
      <div className="section-head">
        <h3>Equipamiento del kiosco</h3>
        <button className="btn sm">{Ic.refresh} Sincronizar inventario</button>
      </div>
      <div className="section-body" style={{ padding: 0 }}>
        {items.map((it, i) => (
          <div key={i} className="row" style={{ padding: "12px 16px", borderBottom: i < items.length - 1 ? "1px dashed var(--line)" : 0 }}>
            <div className={"equip-icon equip-" + it.state}>{it.state === "ok" ? Ic.check : it.state === "missing" ? Ic.warn : "·"}</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 600, fontSize: 13.5 }}>{it.k}</div>
              <div style={{ fontSize: 12, color: "var(--ink-3)" }}>{it.v}</div>
            </div>
            <span className={"badge " + (it.state === "ok" ? "active" : it.state === "missing" ? "offboarding" : it.state === "partial" ? "suspended" : "archived")}>
              <span className="dot"/>
              {it.state === "ok" ? "OK" : it.state === "missing" ? "Falta" : it.state === "partial" ? "Pendiente" : "N/A"}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function LocationKit({ l }) {
  const labels = {
    sim: { l: "SIM TELCEL", d: "Línea de datos para la tablet" },
    lanyard: { l: "Lanyard Aviva", d: "Cordón identificativo verde" },
    nametag: { l: "Nametag con imán", d: "Identificación con foto y rol" },
    pin: { l: "Pin Avi", d: "Pin metálico del logo Aviva" },
    audifonos: { l: "Audífonos", d: "Audífonos in-ear con micrófono" },
    tablet: { l: "Tablet Samsung A8", d: "Tablet para HubSpot y Aviva Flat" },
    uniforme: { l: "Uniforme completo", d: "Playera, sudadera y mochila" },
  };
  const items = Object.entries(l.kit).map(([k, v]) => ({ k, v, ...labels[k] }));
  const okCount = items.filter(x => x.v === "ok").length;
  return (
    <div>
      <div className="section">
        <div className="section-head">
          <h3>Kit de la locación</h3>
          <span className="badge neutral">{okCount}/{items.length} entregados</span>
        </div>
        <div className="section-body" style={{ paddingBottom: 0 }}>
          <div className="pbar" style={{ height: 8, marginBottom: 14 }}>
            <div className="fill" style={{ width: (okCount/items.length*100) + "%", background: okCount === items.length ? "var(--green-500)" : "#f0a800" }}/>
          </div>
        </div>
        <div className="section-body" style={{ padding: 0 }}>
          {items.map((it, i) => (
            <div key={it.k} className="row" style={{ padding: "12px 16px", borderBottom: i < items.length - 1 ? "1px dashed var(--line)" : 0 }}>
              <div className={"equip-icon equip-" + (it.v === "ok" ? "ok" : it.v === "n/a" ? "na" : "missing")}>
                {it.v === "ok" ? Ic.check : it.v === "n/a" ? "·" : Ic.warn}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, fontSize: 13.5 }}>{it.l || it.k}</div>
                <div style={{ fontSize: 12, color: "var(--ink-3)" }}>{it.d}</div>
              </div>
              {it.v === "missing" && <button className="btn sm">Solicitar envío</button>}
              {it.v === "ok" && <span className="muted" style={{ fontSize: 11 }}>Recibido</span>}
              {it.v === "n/a" && <span className="muted" style={{ fontSize: 11 }}>No aplica</span>}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function buildHistory(l) {
  return [
    { what: "Locación creada en Aviva HR", when: l.fechaApertura, who: "People Operations", kind: "create" },
    { what: "Asignada al hub " + (window.AvivaData.hubs.find(h => h.id === l.hub)?.label || l.hub), when: l.fechaApertura, who: "Andrés Rizo", kind: "hub" },
    l.gerente && { what: "Gerente asignado: " + l.gerente, when: l.fechaApertura, who: "People Operations", kind: "person" },
    l.modulo && { what: "Cabina " + l.modulo + " instalada", when: l.fechaApertura, who: "Operaciones BA", kind: "equip" },
    l.tabletMobil === "NO TIENE" && { what: "Solicitud de tablet pendiente con MDM", when: "hace 14 d", who: "Sistema", kind: "alert" },
    l.sim === "SIN SIM" && { what: "Solicitud de SIM Telcel enviada", when: "hace 9 d", who: "Sistema", kind: "alert" },
    { what: "Sincronización automática con HubSpot", when: "hace 2 d", who: "Sistema", kind: "sync" },
    { what: "Inventario de uniformes verificado", when: "hace 6 d", who: "Operaciones", kind: "equip" },
    l.fechaCierre && { what: "Locación cerrada", when: l.fechaCierre, who: "Dirección Comercial", kind: "close" },
  ].filter(Boolean);
}

function LocationHistory({ l, onOpenFull }) {
  const items = buildHistory(l).slice(0, 5);
  return (
    <div className="section">
      <div className="section-head">
        <h3>Historial reciente</h3>
        <button className="btn sm" onClick={onOpenFull}>Ver historial completo {Ic.chevR}</button>
      </div>
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
// FULL HISTORY (takes over drawer)
// =========================================================================
function LocationFullHistory({ location, hub, onBack }) {
  const l = location;
  const [filter, setFilter] = useStateL("all");
  const base = buildHistory(l);
  // Pad with more synthetic events for richness
  const extra = [
    { what: "Visita de Growth Hub Manager", when: "hace 21 d", who: hub?.leader || "Andrés Rizo", kind: "visit" },
    { what: "Reporte semanal de actividad", when: "hace 28 d", who: "Sistema", kind: "sync" },
    { what: "Refrendo del contrato con la plaza", when: "hace 1 mes", who: "Legal", kind: "doc" },
    { what: "Reasignación de territorio", when: "hace 2 meses", who: "Andrés Rízo", kind: "hub" },
    { what: "Check-in 30 días · promotor anterior", when: "hace 3 meses", who: "Paula Acevedo", kind: "person" },
  ];
  const all = [...base, ...extra];
  const filtered = filter === "all" ? all : all.filter(x => x.kind === filter);

  const kindMeta = {
    create: { l: "Creación",      c: "#2b6a2b", bg: "#e2efe2", ic: Ic.plus },
    hub:    { l: "Asignación",    c: "#1f4e85", bg: "#e5edf7", ic: Ic.arrowR },
    person: { l: "Personas",      c: "#5c2e8e", bg: "#ece2f5", ic: Ic.user },
    equip:  { l: "Equipamiento",  c: "#b15a0c", bg: "#fbece0", ic: Ic.laptop },
    alert:  { l: "Alertas",       c: "#a8200d", bg: "#ffe2dc", ic: Ic.warn },
    sync:   { l: "Sincronización", c: "#026149", bg: "#f1fdf6", ic: Ic.refresh },
    visit:  { l: "Visitas",       c: "#8a4a00", bg: "#ffe2c7", ic: Ic.map },
    doc:    { l: "Documentos",    c: "#353a36", bg: "#f1f1ee", ic: Ic.shield },
    close:  { l: "Cierre",        c: "#a8200d", bg: "#ffe2dc", ic: Ic.close },
  };

  const kindsPresent = [...new Set(all.map(x => x.kind))];

  return (
    <div className="drawer-body">
      <div className="history-head">
        <button className="btn sm ghost" onClick={onBack}>← Volver al detalle</button>
        <div className="col" style={{ flex: 1, marginLeft: 14 }}>
          <div style={{ fontSize: 11.5, color: "var(--ink-3)", textTransform: "uppercase", letterSpacing: 0.06, fontWeight: 600 }}>Historial completo</div>
          <h2 className="loc-hero-title" style={{ fontSize: 22, margin: "2px 0 0" }}>{locationFullName(l)}</h2>
          <div style={{ fontSize: 12, color: "var(--ink-3)" }}>{all.length} eventos registrados · desde {l.fechaApertura}</div>
        </div>
        <button className="btn sm">{Ic.download} Exportar</button>
      </div>

      <div className="history-filter-row">
        <button className={"history-pill " + (filter === "all" ? "active" : "")} onClick={() => setFilter("all")}>
          Todo <span className="count">{all.length}</span>
        </button>
        {kindsPresent.map(k => {
          const m = kindMeta[k];
          if (!m) return null;
          const cnt = all.filter(x => x.kind === k).length;
          return (
            <button key={k}
              className={"history-pill " + (filter === k ? "active" : "")}
              onClick={() => setFilter(k)}
              style={filter === k ? { background: m.bg, color: m.c, borderColor: m.c + "55" } : null}>
              <span className="ic" style={{ background: m.bg, color: m.c }}>{m.ic}</span>
              {m.l} <span className="count">{cnt}</span>
            </button>
          );
        })}
      </div>

      <div className="history-list">
        {filtered.length === 0 && <div className="empty" style={{ padding: 40, textAlign: "center", color: "var(--ink-3)" }}>Sin eventos en esta categoría.</div>}
        {filtered.map((it, i) => {
          const m = kindMeta[it.kind] || kindMeta.sync;
          return (
            <div key={i} className="history-event">
              <div className="history-event-rail">
                <div className="history-event-dot" style={{ background: m.bg, color: m.c, border: "1px solid " + m.c + "44" }}>
                  {m.ic}
                </div>
                {i < filtered.length - 1 && <div className="history-event-line"/>}
              </div>
              <div className="history-event-body">
                <div className="row" style={{ gap: 8, alignItems: "center", marginBottom: 2 }}>
                  <span className="history-event-kind" style={{ background: m.bg, color: m.c, borderColor: m.c + "33" }}>{m.l}</span>
                  <span className="history-event-when">{it.when}</span>
                </div>
                <div className="history-event-title">{it.what}</div>
                <div className="history-event-who">por <b>{it.who}</b></div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// =========================================================================
// EDIT LOCATION MODAL
// =========================================================================
function EditLocationModal({ location, onClose }) {
  const l = location;
  const cats = Object.entries(window.AvivaData.locationCategories);
  const estados = Object.keys(window.AvivaData.locationStats.byEstado).filter(Boolean).sort();
  const hubs = window.AvivaData.hubs;
  const [form, setForm] = useStateL({
    ubicacion: l.ubicacion,
    categoria: l.categoria,
    ciudad: l.ciudad,
    estado: l.estado,
    determinante: l.determinante || "",
    direccion: l.direccion,
    fechaApertura: l.fechaApertura,
    fechaCierre: l.fechaCierre || "",
    gerente: l.gerente,
    hub: l.hub,
    promotorAtn: l.promotorAtn || "",
    status: l.status,
    modulo: l.modulo || "",
    sim: l.sim || "",
    tabletMobil: l.tabletMobil || "",
  });
  function f(k, v) { setForm(p => ({ ...p, [k]: v })); }

  function save() {
    // Apply edits to the location in-place
    Object.assign(l, form);
    // Recompute status if gerente changed
    if (form.fechaCierre) l.status = "closed";
    else if (!form.gerente || form.gerente.toLowerCase().includes("sin gerente")) l.status = "vacant";
    else l.status = "open";
    onClose();
    // Force a re-render of drawer (toy mechanism)
    window.dispatchEvent(new Event("resize"));
  }

  const isBA = ["BA","MBA","SBA"].includes(form.categoria);
  const catInfo = window.AvivaData.locationCategories[form.categoria] || {};

  return (
    <div className="panel" style={{ width: "min(760px, 96vw)" }}>
      <div className="row" style={{ padding: "14px 20px", borderBottom: "1px solid var(--line)" }}>
        <div style={{ display: "grid", placeItems: "center", width: 36, height: 36, borderRadius: 8, background: catInfo.bg || "#eee", color: catInfo.color || "#888", fontFamily: "var(--mono)", fontWeight: 700, fontSize: 12, border: "1px solid " + (catInfo.color || "#888") + "33" }}>
          {catInfo.short || "?"}
        </div>
        <div className="col">
          <div style={{ fontWeight: 600, fontSize: 15 }}>Editar locación</div>
          <div style={{ fontSize: 12, color: "var(--ink-3)" }}>{locationFullName(l)} · <span style={{ fontFamily: "var(--mono)" }}>#{l.code}</span></div>
        </div>
        <span style={{ flex: 1 }}/>
        <button className="iconbtn" onClick={onClose}>{Ic.close}</button>
      </div>

      <div style={{ padding: 20, overflow: "auto", maxHeight: "70vh" }}>
        <div className="edit-section">
          <div className="edit-section-head">Identificación</div>
          <div className="field-row">
            <div className="field" style={{ flex: 2 }}>
              <label>Nombre comercial</label>
              <input type="text" value={form.ubicacion} onChange={e => f("ubicacion", e.target.value)}/>
            </div>
            <div className="field">
              <label>Categoría</label>
              <select value={form.categoria} onChange={e => f("categoria", e.target.value)}>
                {cats.map(([k, info]) => <option key={k} value={k}>{info.label}</option>)}
              </select>
            </div>
          </div>
          {isBA && (
            <div className="field">
              <label>Determinante Walmart</label>
              <input type="text" value={form.determinante} onChange={e => f("determinante", e.target.value)} placeholder="Ej. 4763"/>
            </div>
          )}
        </div>

        <div className="edit-section">
          <div className="edit-section-head">Ubicación</div>
          <div className="field-row">
            <div className="field"><label>Ciudad</label><input type="text" value={form.ciudad} onChange={e => f("ciudad", e.target.value)}/></div>
            <div className="field"><label>Estado</label>
              <select value={form.estado} onChange={e => f("estado", e.target.value)}>
                {estados.map(s => <option key={s}>{s}</option>)}
              </select>
            </div>
          </div>
          <div className="field"><label>Dirección completa</label>
            <textarea value={form.direccion} onChange={e => f("direccion", e.target.value)} rows={2}/>
          </div>
        </div>

        <div className="edit-section">
          <div className="edit-section-head">Operación</div>
          <div className="field-row">
            <div className="field"><label>Hub regional</label>
              <select value={form.hub} onChange={e => f("hub", e.target.value)}>
                {hubs.map(h => <option key={h.id} value={h.id}>{h.label}</option>)}
              </select>
            </div>
            <div className="field">
              <window.PersonPicker label="Gerente" value={form.gerente} onChange={v => f("gerente", v)}
                roleFilter="manager" allowEmpty allowSynthetic
                placeholder="Asignar Kiosk Manager…"
                hint="Si no encuentras a la persona puedes registrar el nombre."/>
            </div>
          </div>
          {!isBA && (
            <div className="field">
              <window.PersonPicker label="Promotor Aviva tu Negocio" value={form.promotorAtn} onChange={v => f("promotorAtn", v)}
                allowEmpty allowSynthetic
                placeholder="Asignar promotor…"/>
            </div>
          )}
          <div className="field-row">
            <div className="field"><label>Fecha de apertura</label><input type="text" value={form.fechaApertura} onChange={e => f("fechaApertura", e.target.value)}/></div>
            <div className="field"><label>Fecha de cierre</label>
              <input type="text" value={form.fechaCierre} onChange={e => f("fechaCierre", e.target.value)} placeholder="— dejar vacío si está abierta"/>
            </div>
          </div>
        </div>

        {isBA && (
          <div className="edit-section">
            <div className="edit-section-head">Equipamiento</div>
            <div className="field-row">
              <div className="field"><label>Módulo</label>
                <select value={form.modulo} onChange={e => f("modulo", e.target.value)}>
                  <option value="">—</option>
                  <option>Cabina móvil</option>
                  <option>Cabina fija</option>
                  <option>Mostrador</option>
                </select>
              </div>
              <div className="field"><label>Tablet</label>
                <select value={form.tabletMobil} onChange={e => f("tabletMobil", e.target.value)}>
                  <option value="">—</option>
                  <option>TABLET</option>
                  <option>IPAD</option>
                  <option>NO TIENE</option>
                </select>
              </div>
              <div className="field"><label>SIM</label>
                <select value={form.sim} onChange={e => f("sim", e.target.value)}>
                  <option value="">—</option>
                  <option>SIM TELCEL</option>
                  <option>SIM BAIT</option>
                  <option>SIN SIM</option>
                </select>
              </div>
            </div>
          </div>
        )}

        <div className="row" style={{ padding: 12, background: "var(--warn-bg)", borderRadius: 10, fontSize: 12.5, color: "var(--warn-fg)", marginTop: 4 }}>
          {Ic.warn} <span>Los cambios quedarán registrados en el historial. Si modificas el gerente, se enviará notificación al hub responsable.</span>
        </div>
      </div>

      <div style={{ padding: 14, borderTop: "1px solid var(--line)", display: "flex", gap: 8, alignItems: "center", background: "var(--surface)" }}>
        <button className="btn danger sm">Cerrar locación</button>
        <span style={{ flex: 1 }}/>
        <button className="btn" onClick={onClose}>Cancelar</button>
        <button className="btn accent" onClick={save}>{Ic.check} Guardar cambios</button>
      </div>
    </div>
  );
}

// =========================================================================
// NEW LOCATION WIZARD
// =========================================================================
function NewLocationWizard({ onClose, onCreated }) {
  const [step, setStep] = useStateL(0);
  const cats = Object.entries(window.AvivaData.locationCategories);
  const estados = Object.keys(window.AvivaData.locationStats.byEstado).filter(Boolean).sort();
  const [form, setForm] = useStateL({
    categoria: "MBA",
    ciudad: "",
    estado: "México",
    determinante: "",
    ubicacion: "",
    direccion: "",
    fechaApertura: "2026-06-01",
    gerente: "",
    promotorAtn: "",
    modulo: "Cabina móvil",
    sim: "SIM TELCEL",
    tabletMobil: "TABLET",
  });
  function f(k, v) { setForm(p => ({ ...p, [k]: v })); }
  const steps = ["Tipo y ubicación", "Operación", "Equipamiento", "Revisión"];

  function submit() {
    onCreated({ ...form });
  }

  const catInfo = window.AvivaData.locationCategories[form.categoria] || {};
  const isBA = ["BA","MBA","SBA"].includes(form.categoria);

  return (
    <div className="panel">
      <div className="row" style={{ padding: "14px 20px", borderBottom: "1px solid var(--line)" }}>
        <div className="col">
          <div style={{ fontWeight: 600, fontSize: 15 }}>Nueva locación</div>
          <div style={{ fontSize: 12, color: "var(--ink-3)" }}>Agrega un kiosco o punto de venta al catálogo de Aviva.</div>
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
            <div className="field">
              <label>Categoría de locación</label>
              <div className="row" style={{ gap: 8, flexWrap: "wrap" }}>
                {cats.map(([k, info]) => (
                  <button key={k} type="button"
                    onClick={() => f("categoria", k)}
                    className={"cat-pick " + (form.categoria === k ? "active" : "")}
                    style={{ borderColor: form.categoria === k ? info.color : "var(--line)" }}>
                    <span className="cat-chip" style={{ background: info.bg, color: info.color, border: "1px solid " + info.color + "33" }}>{info.short}</span>
                    <div>
                      <div className="lbl">{info.label}</div>
                      <div className="sub">{info.brand}</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
            <div className="field-row">
              <div className="field"><label>Ciudad</label><input type="text" value={form.ciudad} onChange={e => f("ciudad", e.target.value)} placeholder="Tecamachalco"/></div>
              <div className="field"><label>Estado</label>
                <select value={form.estado} onChange={e => f("estado", e.target.value)}>
                  {estados.map(s => <option key={s}>{s}</option>)}
                </select>
              </div>
            </div>
            {isBA && (
              <div className="field"><label>Determinante (Walmart/BA)</label>
                <input type="text" value={form.determinante} onChange={e => f("determinante", e.target.value)} placeholder="Ej. 4763"/>
                <span className="hint">Número de tienda según Walmart México.</span>
              </div>
            )}
            <div className="field"><label>Nombre comercial / ubicación</label>
              <input type="text" value={form.ubicacion} onChange={e => f("ubicacion", e.target.value)} placeholder={"Ej. " + (catInfo.brand || "") + " " + (form.ciudad || "—")}/>
            </div>
            <div className="field"><label>Dirección completa</label>
              <textarea value={form.direccion} onChange={e => f("direccion", e.target.value)} rows={2} placeholder="Calle, número, colonia, CP, municipio, estado"/>
            </div>
          </div>
        )}
        {step === 1 && (
          <div>
            <div className="field"><label>Fecha de apertura</label>
              <input type="text" value={form.fechaApertura} onChange={e => f("fechaApertura", e.target.value)} placeholder="2026-06-01"/>
            </div>
            <div className="field">
              <window.PersonPicker label="Gerente / Kiosk Manager" value={form.gerente} onChange={v => f("gerente", v)}
                roleFilter="manager" allowEmpty allowSynthetic
                placeholder="Asignar Kiosk Manager…"
                hint="Si no hay gerente asignado todavía, la locación se marcará como Sin cobertura."/>
            </div>
            {!isBA && (
              <div className="field">
                <window.PersonPicker label="Promotor Aviva tu Negocio" value={form.promotorAtn} onChange={v => f("promotorAtn", v)}
                  allowEmpty allowSynthetic
                  placeholder="Asignar promotor (opcional)…"/>
              </div>
            )}
            <div className="row" style={{ marginTop: 14, padding: 12, background: "var(--mint-50)", borderRadius: 10, fontSize: 12.5, color: "var(--green-700)" }}>
              {Ic.shield} <span>Aviva HR asignará automáticamente esta locación al hub regional según el estado: <b>{(window.AvivaData.hubs.find(h => h.id === (function(c,e){if(c==="Casa Marchand")return"casa_marchand_ventas";if(e==="Hidalgo")return"hub1-region_hidalgo";if(e==="México"||e==="CDMX")return"hub2-region_edomex";if(e==="Puebla"||e==="Morelos"||e==="Tlaxcala")return"hub3_region-pue-mor-tlax";return"equipo_ventas_aviva"})(form.categoria, form.estado))?.label) || "Equipo Aviva"}</b></span>
            </div>
          </div>
        )}
        {step === 2 && (
          <div>
            {isBA ? (
              <>
                <div className="field"><label>Módulo / cabina</label>
                  <select value={form.modulo} onChange={e => f("modulo", e.target.value)}>
                    <option>Cabina móvil</option>
                    <option>Cabina fija</option>
                    <option>Mostrador</option>
                  </select>
                </div>
                <div className="field-row">
                  <div className="field"><label>Tablet móvil</label>
                    <select value={form.tabletMobil} onChange={e => f("tabletMobil", e.target.value)}>
                      <option>TABLET</option>
                      <option>IPAD</option>
                      <option>NO TIENE</option>
                    </select>
                  </div>
                  <div className="field"><label>SIM</label>
                    <select value={form.sim} onChange={e => f("sim", e.target.value)}>
                      <option>SIM TELCEL</option>
                      <option>SIM BAIT</option>
                      <option>SIN SIM</option>
                    </select>
                  </div>
                </div>
              </>
            ) : (
              <div style={{ padding: 16, background: "var(--surface-2)", borderRadius: 10, fontSize: 13.5, color: "var(--ink-3)" }}>
                {Ic.help} Para locaciones tipo <b>{catInfo.label}</b> el equipamiento se gestiona desde el inventario de la sede principal. Puedes saltar este paso.
              </div>
            )}
            <div style={{ marginTop: 16 }}>
              <div className="muted" style={{ fontSize: 12, marginBottom: 6 }}>Kit estándar al abrir</div>
              <div className="row" style={{ gap: 6, flexWrap: "wrap" }}>
                {["Lanyard","Nametag","Pin Avi","Audífonos","Playera M corta","Mochila"].map(k => (
                  <span key={k} className="badge neutral">{Ic.check} {k}</span>
                ))}
              </div>
            </div>
          </div>
        )}
        {step === 3 && (
          <div>
            <div style={{ fontSize: 13, color: "var(--ink-3)", marginBottom: 14 }}>Revisa los datos antes de crear la locación.</div>
            <div className="section" style={{ margin: 0 }}>
              <div className="section-body">
                <div className="kv">
                  <div className="k">Categoría</div><div className="v"><span className="badge neutral">{catInfo.label}</span></div>
                  <div className="k">Ubicación</div><div className="v">{form.ubicacion || ((catInfo.brand) + " " + form.ciudad)}</div>
                  <div className="k">Ciudad / estado</div><div className="v">{form.ciudad}, {form.estado}</div>
                  {form.determinante && <><div className="k">Determinante</div><div className="v" style={{ fontFamily: "var(--mono)" }}>{form.determinante}</div></>}
                  <div className="k">Dirección</div><div className="v">{form.direccion || <span className="muted">—</span>}</div>
                  <div className="k">Apertura</div><div className="v">{form.fechaApertura}</div>
                  <div className="k">Gerente</div><div className="v">{form.gerente || <span className="muted">— por asignar</span>}</div>
                  {isBA && <>
                    <div className="k">Módulo</div><div className="v">{form.modulo}</div>
                    <div className="k">Tablet / SIM</div><div className="v">{form.tabletMobil} · {form.sim}</div>
                  </>}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
      <div style={{ padding: 14, borderTop: "1px solid var(--line)", display: "flex", gap: 8, alignItems: "center", background: "var(--surface)" }}>
        <button className="btn ghost" onClick={onClose}>Cancelar</button>
        <span style={{ flex: 1 }}/>
        {step > 0 && <button className="btn" onClick={() => setStep(step - 1)}>← Anterior</button>}
        {step < 3 && <button className="btn primary" onClick={() => setStep(step + 1)}>Siguiente →</button>}
        {step === 3 && <button className="btn accent" onClick={submit}>{Ic.check} Crear locación</button>}
      </div>
    </div>
  );
}

// Expose
Object.assign(window, { LocationsView, LocationDetail, NewLocationWizard, EditLocationModal, LocationFullHistory });
