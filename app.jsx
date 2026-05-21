// Aviva HR — App shell
const { useState: useS, useMemo: useM, useEffect: useE } = React;

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "theme": "light",
  "density": "comfortable",
  "directoryLayout": "table",
  "locationsLayout": "table",
  "ticketState": "default",
  "language": "es",
  "accent": "verde"
}/*EDITMODE-END*/;

const NAV = [
  { id: "home",        label: "Resumen",         icon: "home" },
  { id: "candidates",  label: "Candidatos",      icon: "userPlus" },
  { id: "expedientes", label: "Expedientes",     icon: "folder" },
  { id: "directory",   label: "Directorio",      icon: "users" },
  { id: "locations",   label: "Locaciones",      icon: "map" },
  { id: "catalog",     label: "Catálogo",        icon: "shoppingBag" },
  { id: "tickets",     label: "Bajas",           icon: "ticket" },
  { id: "integrations",label: "Integraciones",   icon: "plug" },
  { id: "audit",       label: "Auditoría",       icon: "history" },
];
const NAV_TEMPLATES = [
  { id: "offer-templates",    label: "Cartas oferta",  icon: "fileSign" },
  { id: "contract-templates", label: "Contratos",      icon: "file" },
  { id: "email-templates",    label: "Correos",        icon: "mail" },
  { id: "form-config",        label: "Preguntas y docs", icon: "clipboard" },
];
const NAV_BOTTOM = [
  { id: "settings",    label: "Configuración",    icon: "cog" },
];

function App() {
  const [t, setTweak] = window.useTweaks(TWEAK_DEFAULTS);
  const notif = window.useNotif();
  const [view, setView] = useS("candidates");
  const [users, setUsers] = useS(window.AvivaData.users);
  const [tickets, setTickets] = useS(window.AvivaData.tickets.filter(t => t.kind === "offboarding"));
  const [candidates, setCandidates] = useS(window.RecruitingData.candidates);
  const [selectedUser, setSelectedUser] = useS(null);
  const [selectedTicket, setSelectedTicket] = useS(null);
  const [selectedLocation, setSelectedLocation] = useS(null);
  const [selectedCandidate, setSelectedCandidate] = useS(null);
  const [showNewLocation, setShowNewLocation] = useS(false);
  const [showNewCandidate, setShowNewCandidate] = useS(false);
  const [locationsLayout, setLocationsLayout] = useS(t.locationsLayout || "table");
  const [showNewUser, setShowNewUser] = useS(false);
  const [showOffboard, setShowOffboard] = useS(false);
  const [offboardCandidate, setOffboardCandidate] = useS(null);
  const [showImport, setShowImport] = useS(false);
  const [showTicketChooser, setShowTicketChooser] = useS(false);
  const [selected, setSelected] = useS(new Set());
  const [directoryLayout, setDirectoryLayout] = useS(t.directoryLayout || "table");

  // Sync directory layout from tweak
  useE(() => { setDirectoryLayout(t.directoryLayout || "table"); }, [t.directoryLayout]);
  useE(() => { window.__setLayout = (l) => { setDirectoryLayout(l); setTweak("directoryLayout", l); }; }, [setTweak]);
  useE(() => { setLocationsLayout(t.locationsLayout || "table"); }, [t.locationsLayout]);
  useE(() => {
    window.__setLocLayout = (l) => { setLocationsLayout(l); setTweak("locationsLayout", l); };
    window.__filterEstado = (estado) => { setView("locations"); /* future: pass through */ };
  }, [setTweak]);

  // Apply theme to <html>
  useE(() => {
    document.documentElement.setAttribute("data-theme", t.theme || "light");
  }, [t.theme]);

  // Open a specific ticket from the user profile
  function openOffboardFor(u) {
    setOffboardCandidate(u.id);
    setShowOffboard(true);
    setSelectedUser(null);
  }

  function handleTicketChoice(kind) {
    setShowTicketChooser(false);
    if (kind === "offboard") setTimeout(() => setShowOffboard(true), 60);
    if (kind === "import")   setTimeout(() => setShowImport(true), 60);
    if (kind === "suspend" || kind === "transfer" || kind === "access") {
      notif.notify({ kind: "info", title: "Flujo en construcción", body: "Pronto podrás gestionar este tipo de ticket desde aquí." });
    }
  }

  function handleImported(summary) {
    notif.notify({
      kind: "onboard",
      title: `Import: ${summary.ok} altas · ${summary.warn} actualizados`,
      body: "Provisionamiento iniciado. Revisa el log de auditoría para ver detalles."
    });
  }

  function handleCreateUser(form) {
    const i = users.length;
    const nombre = (form.nombre || "Nuevo") + " " + (form.apellidos || "Usuario");
    const emailGen = (form.nombre || "nuevo").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").split(" ")[0] + "." + (form.apellidos || "user").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").split(" ")[0] + "@avivacredito.com";
    const hub = window.AvivaData.hubs.find(h => h.id === form.hub);
    const newU = {
      id: "u-" + (form.numColaborador || ("NEW_" + (1000 + i))),
      numColaborador: form.numColaborador || ("385_" + String(i).padStart(2, "0")),
      first: form.nombre || "Nuevo",
      last: form.apellidos || "Usuario",
      fullName: nombre,
      email: form.email || emailGen,
      role: form.puesto || "—",
      hub: form.hub,
      quiosco: form.quiosco,
      estado: form.estado,
      empresa: form.empresa,
      genero: form.genero,
      talla: form.talla,
      manager: form.manager || null,
      managerName: users.find(u => u.id === form.manager)?.fullName || (hub ? hub.leader : null),
      avatar: { initials: ((form.nombre || "N")[0] + (form.apellidos || "U")[0]).toUpperCase(), color: "c" + ((i % 8) + 1) },
      hiredAt: form.startDate,
      hireMonths: 0,
      status: "invited",
      laptop: null,
      tablets: [],
      access: form.accesses,
      phone: "—",
      hubspot: null,
    };
    setUsers([newU, ...users]);
    notif.notify({
      kind: "onboard",
      title: "Nueva alta · " + nombre,
      body: "Provisionado en " + form.accesses.length + " apps. Invitación enviada a " + (form.email || emailGen) + "."
    });
    setShowNewUser(false);
  }

  function handleCreateOffboard({ userId, reason, lastDay }) {
    const id = "TKT-" + (2050 + tickets.length);
    const u = users.find(x => x.id === userId);
    const newT = {
      id, kind: "offboarding", userId, reason, lastDay,
      createdAt: "ahora", createdBy: "Tú",
      status: "in_progress",
      progress: 0.08,
      approvals: [
        { role: "Manager directo", who: "Pendiente", state: "pending" },
        { role: "HR Business Partner", who: "Paula Acevedo", state: "pending" },
        { role: "IT / Sistemas", who: "Mateo García", state: "pending" },
      ],
      timeline: [
        { state: "done",    title: "Ticket creado",  who: "Tú", when: "ahora" },
        { state: "current", title: "Esperando aprobaciones", when: "—" },
        { state: "pending", title: "Ejecución programada",   when: lastDay },
      ],
      tasks: [
        { app: "google", label: "Suspender Google Workspace", state: "pending", when: "programado " + lastDay },
        { app: "slack",  label: "Desactivar Slack", state: "pending", when: "programado " + lastDay },
        { app: "okta",   label: "Revocar SSO y MFA", state: "pending", when: "programado " + lastDay },
      ],
    };
    setUsers(users.map(u => u.id === userId ? { ...u, status: "offboarding", offboardingTicket: id } : u));
    setTickets([newT, ...tickets]);
    notif.notify({
      kind: "offboard",
      title: "Nueva baja · " + (u?.fullName || "persona"),
      body: "Ticket " + id + " creado. Notificado en Slack #people-avisos."
    });
    setShowOffboard(false);
    setOffboardCandidate(null);
    setView("tickets");
    setTimeout(() => setSelectedTicket(newT), 80);
  }

  const NavBtn = ({ item }) => (
    <button className={"nav-item " + (view === item.id ? "active" : "")} onClick={() => setView(item.id)}>
      {Ic[item.icon]}
      <span>{item.label}</span>
      {item.count != null && <span className="count">{item.count}</span>}
    </button>
  );

  const counts = useM(() => ({
    directory: users.length,
    tickets: tickets.filter(x => x.status !== "completed").length,
    integrations: 12,
  }), [users, tickets]);
  // suppress unused linter
  void counts;

  return (
    <div className={"app " + (t.density === "compact" ? "density-compact" : "")}>
      <aside className="sidebar">
        <div className="sidebar-brand">
          <div className="logo">a</div>
          <div>
            <div className="name">Aviva</div>
            <div className="subname">People · HR</div>
          </div>
        </div>
        <div className="sidebar-section">Workspace</div>
        <div className="nav">
          {NAV.map(item => <NavBtn key={item.id} item={item}/>)}
        </div>
        <div className="sidebar-section" style={{ marginTop: 14 }}>Plantillas</div>
        <div className="nav">
          {NAV_TEMPLATES.map(item => <NavBtn key={item.id} item={item}/>)}
        </div>
        <div className="sidebar-section" style={{ marginTop: 14 }}>Sistema</div>
        <div className="nav">
          {NAV_BOTTOM.map(item => <NavBtn key={item.id} item={item}/>)}
        </div>

        <div className="sidebar-foot">
          <div className="workspace-card">
            <div className="av c1" style={{ background: "var(--mint-100)", color: "var(--green-700)" }}>AC</div>
            <div className="col">
              <div className="ws-name">Aviva Crédito</div>
              <div className="ws-meta">{users.length} colaboradores · México</div>
            </div>
          </div>
        </div>
      </aside>

      <main className="main">
        <header className="topbar">
          <div className="crumbs">
            <b>{NAV.find(n => n.id === view)?.label || "Panel"}</b>
            {view === "directory" && <><span className="sep">/</span><span>Todas las personas</span></>}
            {view === "tickets" && <><span className="sep">/</span><span>Activos</span></>}
          </div>
          <span className="spacer"/>
          <div className="search">
            {Ic.search}
            <input placeholder="Buscar persona, ticket o app…"/>
          </div>
          <window.NotifBell/>
          <button className="iconbtn" title="Ayuda">{Ic.help}</button>
          <div className="me">
            <div className="av c8">PA</div>
            <div className="col">
              <span className="name">Paula Acevedo</span>
              <span className="role">People Ops · Admin</span>
            </div>
          </div>
        </header>

        <section className="view">
          {view === "home" && <HomeView users={users} tickets={tickets} onOpenTicket={setSelectedTicket} onNewUser={() => setShowNewCandidate(true)}/>}
          {view === "candidates" && (
            <window.CandidatosView
              onOpenCandidate={setSelectedCandidate}
              onNewCandidate={() => setShowNewCandidate(true)}
            />
          )}
          {view === "expedientes" && (
            <window.ExpedientesView onOpenCandidate={setSelectedCandidate}/>
          )}
          {view === "directory" && (
            <DirectoryView
              users={users}
              layout={directoryLayout}
              density={t.density}
              selected={selected}
              setSelected={setSelected}
              onOpenUser={setSelectedUser}
              onNewUser={() => setShowNewCandidate(true)}
              onImport={() => setShowImport(true)}
              onNewOffboard={() => { setOffboardCandidate(Array.from(selected)[0]); setShowOffboard(true); }}
            />
          )}
          {view === "tickets" && (
            <TicketsView
              tickets={tickets} users={users}
              ticketState={t.ticketState}
              onOpenTicket={setSelectedTicket}
              onNewTicket={() => setShowTicketChooser(true)}
            />
          )}
          {view === "locations" && (
            <window.LocationsView
              users={users}
              layout={locationsLayout}
              density={t.density}
              onOpenLocation={setSelectedLocation}
              onNewLocation={() => setShowNewLocation(true)}
            />
          )}
          {view === "catalog" && <window.CatalogView/>}
          {view === "offer-templates"    && <window.OfferTemplatesView/>}
          {view === "contract-templates" && <window.ContractTemplatesView/>}
          {view === "email-templates"    && <window.EmailTemplatesView/>}
          {view === "form-config"        && <window.FormConfigView/>}
          {view === "integrations" && <IntegrationsView/>}
          {view === "audit" && <AuditView/>}
          {view === "settings" && <window.SettingsView/>}
        </section>
      </main>

      {/* User drawer */}
      <Drawer open={!!selectedUser} onClose={() => setSelectedUser(null)}>
        {selectedUser && (
          <React.Fragment>
            <div className="drawer-head">
              <div className="col" style={{ flex: 1 }}>
                <div className="crumbs">Directorio / {selectedUser.team}</div>
                <div className="title">{selectedUser.fullName}</div>
              </div>
              <button className="btn sm">Ver perfil completo</button>
              <button className="iconbtn" onClick={() => setSelectedUser(null)}>{Ic.close}</button>
            </div>
            <UserProfile user={selectedUser} users={users} onClose={() => setSelectedUser(null)} onOffboard={openOffboardFor} onOpenLocation={(loc) => { setSelectedUser(null); setTimeout(() => setSelectedLocation(loc), 100); }}/>
          </React.Fragment>
        )}
      </Drawer>

      {/* Ticket drawer */}
      <Drawer open={!!selectedTicket} onClose={() => setSelectedTicket(null)}>
        {selectedTicket && (
          <React.Fragment>
            <div className="drawer-head">
              <div className="col" style={{ flex: 1 }}>
                <div className="crumbs">Tickets / {selectedTicket.kind === "offboarding" ? "Bajas" : "Altas"}</div>
                <div className="title">{selectedTicket.id}</div>
              </div>
              <button className="iconbtn" onClick={() => setSelectedTicket(null)}>{Ic.close}</button>
            </div>
            <TicketDetail ticket={selectedTicket} users={users}
              ticketState={t.ticketState}
              onClose={() => setSelectedTicket(null)}/>
          </React.Fragment>
        )}
      </Drawer>

      {/* Legacy: New user modal — ya no se usa, la alta viaja por Reclutamiento */}
      <Modal open={showNewUser} onClose={() => setShowNewUser(false)}>
        <div className="panel" style={{ width: "min(500px, 96vw)", padding: 24 }}>
          <div style={{ display: "flex", gap: 12, alignItems: "center", marginBottom: 12 }}>
            <div style={{ width: 40, height: 40, borderRadius: 10, background: "var(--mint-50)", color: "var(--green-700)", display: "grid", placeItems: "center" }}>{Ic.shield}</div>
            <div className="col">
              <div style={{ fontWeight: 600, fontSize: 15 }}>Las altas viajan por Reclutamiento</div>
              <div style={{ fontSize: 12.5, color: "var(--ink-3)" }}>Crea un candidato y el handoff a HR será automático al provisionar correo.</div>
            </div>
          </div>
          <div className="row" style={{ gap: 8, marginTop: 14 }}>
            <button className="btn" onClick={() => setShowNewUser(false)}>Cancelar</button>
            <span style={{ flex: 1 }}/>
            <button className="btn accent" onClick={() => { setShowNewUser(false); setTimeout(() => setShowNewCandidate(true), 60); }}>{Ic.plus} Crear candidato</button>
          </div>
        </div>
      </Modal>

      {/* Offboard modal */}
      <Modal open={showOffboard} onClose={() => { setShowOffboard(false); setOffboardCandidate(null); }}>
        <OffboardWizard
          users={users}
          defaultUserId={offboardCandidate}
          onClose={() => { setShowOffboard(false); setOffboardCandidate(null); }}
          onCreated={handleCreateOffboard}
        />
      </Modal>

      {/* Candidate drawer */}
      <Drawer open={!!selectedCandidate} onClose={() => setSelectedCandidate(null)}>
        {selectedCandidate && (
          <React.Fragment>
            <div className="drawer-head">
              <div className="col" style={{ flex: 1 }}>
                <div className="crumbs">Candidatos / {window.stageMeta(selectedCandidate.status).label}</div>
                <div className="title">{selectedCandidate.firstName} {selectedCandidate.lastName}</div>
              </div>
              <button className="iconbtn" onClick={() => setSelectedCandidate(null)}>{Ic.close}</button>
            </div>
            <window.CandidateDetail
              candidate={selectedCandidate}
              onClose={() => setSelectedCandidate(null)}
              onOpenLocation={(loc) => { setSelectedCandidate(null); setTimeout(() => setSelectedLocation(loc), 100); }}
              onForceHandoff={(c) => {
                // Manual override — solo IT / Admin
                if (!confirm("¿Forzar handoff a HR para " + c.firstName + " " + c.lastName + "?\n\nEsto creará al colaborador en Directorio antes de que IT confirme el correo. Acción para IT / Admin solamente.")) return;
                c.status = "email_ready";
                c.corporateEmail = (c.firstName + "." + c.lastName.split(" ")[0]).toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"") + "@avivacredito.com";
                notif.notify({ kind: "onboard", title: "Handoff forzado · " + c.firstName + " " + c.lastName, body: "Acción IT/Admin. Provisión automática saltada." });
                setSelectedCandidate({ ...c });
              }}
            />
          </React.Fragment>
        )}
      </Drawer>

      {/* New candidate modal */}
      <Modal open={showNewCandidate} onClose={() => setShowNewCandidate(false)}>
        <window.NewCandidateModal
          onClose={() => setShowNewCandidate(false)}
          onCreated={(form) => {
            const newC = {
              id: "cand-NEW" + Date.now(),
              ...form,
              status: "offer_held",
              createdBy: form.recruiter,
              createdAt: "hoy 16:00",
              docs: {}, completion: 0, reminderCount: 0,
              avatar: { initials: ((form.firstName[0]||"?") + (form.lastName[0]||"")).toUpperCase(), color: "c" + ((Date.now() % 8) + 1) },
            };
            window.RecruitingData.candidates.unshift(newC);
            setCandidates([...window.RecruitingData.candidates]);
            notif.notify({
              kind: "onboard",
              title: "Nuevo candidato · " + form.firstName + " " + form.lastName,
              body: "Creado en Viterbit. Carta oferta generándose automáticamente."
            });
            setShowNewCandidate(false);
            setView("candidates");
          }}
        />
      </Modal>

      {/* Import modal */}
      <Modal open={showImport} onClose={() => setShowImport(false)}>
        <window.ImportWizard onClose={() => setShowImport(false)} onImported={handleImported}/>
      </Modal>

      {/* Location drawer */}
      <Drawer open={!!selectedLocation} onClose={() => setSelectedLocation(null)}>
        {selectedLocation && (
          <React.Fragment>
            <div className="drawer-head">
              <div className="col" style={{ flex: 1 }}>
                <div className="crumbs">Locaciones / {selectedLocation.catLabel}</div>
                <div className="title">{selectedLocation.ubicacion || (selectedLocation.catLabel + " " + selectedLocation.ciudad)}</div>
              </div>
              <button className="btn sm" onClick={() => window.__openFullHistory?.()}>Ver historial completo</button>
              <button className="iconbtn" onClick={() => setSelectedLocation(null)}>{Ic.close}</button>
            </div>
            <window.LocationDetail
              location={selectedLocation}
              users={users}
              onClose={() => setSelectedLocation(null)}
              onOpenUser={(u) => { setSelectedLocation(null); setTimeout(() => setSelectedUser(u), 100); }}
            />
          </React.Fragment>
        )}
      </Drawer>

      {/* New location modal */}
      <Modal open={showNewLocation} onClose={() => setShowNewLocation(false)}>
        <window.NewLocationWizard
          onClose={() => setShowNewLocation(false)}
          onCreated={(form) => {
            const newLoc = {
              ...form,
              id: "loc-NEW" + Date.now(),
              code: "NEW_" + (window.AvivaData.locations.length + 1),
              hub: form.categoria === "Casa Marchand" ? "casa_marchand_ventas" : "equipo_ventas_aviva",
              brand: window.AvivaData.locationCategories[form.categoria]?.brand || form.categoria,
              catLabel: window.AvivaData.locationCategories[form.categoria]?.label || form.categoria,
              catShort: window.AvivaData.locationCategories[form.categoria]?.short || "?",
              catColor: window.AvivaData.locationCategories[form.categoria]?.color || "#888",
              catBg: window.AvivaData.locationCategories[form.categoria]?.bg || "#eee",
              status: form.gerente ? "open" : "vacant",
              kit: { sim: "ok", lanyard: "missing", nametag: "missing", pin: "missing", audifonos: "missing", tablet: form.tabletMobil === "NO TIENE" ? "missing" : "ok" },
              antiguedad: "0 m",
            };
            window.AvivaData.locations.unshift(newLoc);
            notif.notify({
              kind: "onboard",
              title: "Nueva locación · " + (newLoc.ubicacion || (newLoc.catLabel + " " + newLoc.ciudad)),
              body: "Locación creada en " + newLoc.estado + ". Pendiente: asignar promotor y enviar kit."
            });
            setShowNewLocation(false);
          }}
        />
      </Modal>

      {/* Ticket type chooser */}
      <Modal open={showTicketChooser} onClose={() => setShowTicketChooser(false)}>
        <window.NewTicketChooser onClose={() => setShowTicketChooser(false)} onChoose={handleTicketChoice}/>
      </Modal>

      {/* Tweaks */}
      <window.TweaksPanel title="Tweaks">
        <window.TweakSection label="Apariencia">
          <window.TweakRadio label="Tema" value={t.theme} onChange={v => setTweak("theme", v)} options={[
            { value: "light", label: "Claro" },
            { value: "dark", label: "Oscuro" },
          ]}/>
          <window.TweakRadio label="Densidad" value={t.density} onChange={v => setTweak("density", v)} options={[
            { value: "comfortable", label: "Cómoda" },
            { value: "compact", label: "Compacta" },
          ]}/>
        </window.TweakSection>
        <window.TweakSection label="Directorio">
          <window.TweakRadio label="Vista" value={t.directoryLayout} onChange={v => setTweak("directoryLayout", v)} options={[
            { value: "table", label: "Tabla" },
            { value: "grid", label: "Tarjetas" },
          ]}/>
        </window.TweakSection>
        <window.TweakSection label="Locaciones">
          <window.TweakSelect label="Vista por defecto" value={t.locationsLayout} onChange={v => setTweak("locationsLayout", v)} options={[
            { value: "table", label: "Tabla detallada" },
            { value: "grid",  label: "Tarjetas" },
            { value: "map",   label: "Mapa por estado" },
          ]}/>
        </window.TweakSection>
        <window.TweakSection label="Ticket de baja">
          <window.TweakSelect label="Estado del ticket" value={t.ticketState} onChange={v => setTweak("ticketState", v)} options={[
            { value: "default",   label: "Por defecto (en curso)" },
            { value: "scheduled", label: "Programado · esperando" },
            { value: "completed", label: "Completado" },
            { value: "blocked",   label: "Bloqueado con error" },
          ]}/>
        </window.TweakSection>
      </window.TweaksPanel>
    </div>
  );
}

// ----- Resumen (home) -----
function HomeView({ users, tickets, onOpenTicket, onNewUser }) {
  const recent = tickets.slice(0, 3);
  const activos = users.filter(u => u.status === "active").length;
  return (
    <div className="view-pad">
      <div className="view-head">
        <div>
          <h1>Hola, Paula 👋</h1>
          <div className="sub">Lo que ocurre hoy en Aviva Crédito. {users.length} colaboradores en {window.AvivaData.estados.length} estados · {tickets.filter(t => t.status !== "completed").length} tickets activos · 12 apps sincronizadas.</div>
        </div>
        <div className="actions">
          <button className="btn accent" onClick={onNewUser}>{Ic.plus} Nueva alta</button>
        </div>
      </div>
      <KPIs users={users}/>

      <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: 16, marginTop: 8 }}>
        <div className="section" style={{ margin: 0 }}>
          <div className="section-head">
            <h3>Tickets activos</h3>
            <button className="btn sm ghost">Ver todos {Ic.chevR}</button>
          </div>
          <div className="section-body">
            {recent.map(t => {
              const u = users.find(x => x.id === t.userId);
              return (
                <div key={t.id} className="ticket-card" style={{ marginBottom: 8 }} onClick={() => onOpenTicket(t)}>
                  <div className="ic" style={{
                    background: t.kind === "offboarding" ? "var(--danger-bg)" : "var(--mint-50)",
                    color: t.kind === "offboarding" ? "var(--danger-fg)" : "var(--green-700)"
                  }}>{t.kind === "offboarding" ? Ic.arrowR : Ic.plus}</div>
                  <div>
                    <div className="row">
                      <span className="title">{t.id} · {u?.fullName || "—"}</span>
                      <TicketStatusBadge status={t.status}/>
                    </div>
                    <div className="meta">{t.reason}{u && <> · {u.quiosco}, {u.estado}</>}</div>
                  </div>
                  <div className="progress">
                    <div className="col" style={{ alignItems: "flex-end" }}>
                      <span style={{ fontSize: 11, color: "var(--ink-3)" }}>{Math.round(t.progress * 100)}%</span>
                      <div className="pbar"><div className="fill" style={{ width: (t.progress * 100) + "%" }}/></div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="section" style={{ margin: 0 }}>
          <div className="section-head"><h3>Próximas fechas</h3></div>
          <div className="section-body">
            {[
              { dot: "var(--green-500)",  date: "20 may", title: "Onboarding · Alberto Fuentes", sub: "Llega como Promotor a Apaxco BA." },
              { dot: "var(--danger-fg)", date: "30 may", title: "Última jornada · José A. Flores", sub: "Ticket TKT-2041 · 9 tareas programadas en Tecamachalco BA." },
              { dot: "#f4c25e",          date: "5 jun",  title: "Aniversarios del mes · 4 colaboradores", sub: "Recordatorio automático en #people-aniversarios." },
              { dot: "var(--danger-fg)", date: "15 jun", title: "Última jornada · Servando Ramírez", sub: "Ticket TKT-2042 programado." },
            ].map((x, i) => (
              <div key={i} className="row" style={{ padding: "10px 0", borderBottom: i < 3 ? "1px dashed var(--line)" : 0, alignItems: "flex-start", gap: 12 }}>
                <div className="col" style={{ alignItems: "center", minWidth: 44 }}>
                  <span style={{ width: 8, height: 8, borderRadius: 999, background: x.dot, marginTop: 6 }}/>
                  <span style={{ fontSize: 11, color: "var(--ink-3)", marginTop: 2 }}>{x.date}</span>
                </div>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 13.5 }}>{x.title}</div>
                  <div style={{ fontSize: 12, color: "var(--ink-3)" }}>{x.sub}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ----- Settings view is provided by notifications.jsx as window.SettingsView -----

ReactDOM.createRoot(document.getElementById("root")).render(
  <window.NotifProvider>
    <App/>
  </window.NotifProvider>
);
