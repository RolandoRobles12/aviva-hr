// Aviva HR — Recruiting: Candidatos view + Drawer detalle
// Loaded after recruiting-data.jsx + pickers.jsx.

const { useState: useStateR, useMemo: useMemoR, useEffect: useEffectR } = React;

// =========================================================================
// HELPERS
// =========================================================================
function stageMeta(id) { return window.RecruitingData.STAGES.find(s => s.id === id) || window.RecruitingData.STAGES[0]; }
function groupMeta(g)  { return window.RecruitingData.GROUP_META[g] || { label: g, color: "#888", bg: "#eee" }; }
function fullName(c)   { return c.firstName + " " + c.lastName; }

function StageBadge({ status }) {
  const s = stageMeta(status);
  return (
    <span className="stage-badge" style={{ background: s.bg, color: s.color, borderColor: s.color + "33" }}>
      <span className="dot" style={{ background: s.color }}/>
      {s.label}
    </span>
  );
}

function DocStatusDot({ state, title }) {
  const map = {
    valid:    { c: "var(--green-500)",  l: "Válido" },
    invalid:  { c: "var(--danger-fg)",  l: "Inválido" },
    review:   { c: "#f0a800",           l: "Revisión" },
    uploaded: { c: "#1b3f8a",           l: "Subido" },
    pending:  { c: "var(--ink-4)",      l: "Pendiente" },
  };
  const m = map[state] || map.pending;
  return <span className="doc-dot" title={(title || "") + " · " + m.l} style={{ background: m.c }}/>;
}

function CompletionBar({ value }) {
  return (
    <div className="row" style={{ gap: 6 }}>
      <div className="pbar" style={{ width: 56, height: 4 }}>
        <div className="fill" style={{
          width: value + "%",
          background: value >= 90 ? "var(--green-500)" : value >= 50 ? "#f0a800" : value > 0 ? "var(--danger-fg)" : "var(--ink-4)"
        }}/>
      </div>
      <span style={{ fontSize: 11, color: "var(--ink-3)", fontFamily: "var(--mono)", minWidth: 26 }}>{value}%</span>
    </div>
  );
}

// =========================================================================
// CANDIDATOS VIEW
// =========================================================================
function CandidatosView({ onOpenCandidate, onNewCandidate }) {
  const candidates = window.RecruitingData.candidates;
  const STAGES = window.RecruitingData.STAGES;
  const [tab, setTab] = useStateR("all");
  const [q, setQ] = useStateR("");
  const [recruiterF, setRecruiterF] = useStateR("all");

  const stats = useMemoR(() => {
    const counts = { all: candidates.length };
    Object.keys(window.RecruitingData.GROUP_META).forEach(g => {
      counts[g] = candidates.filter(c => stageMeta(c.status).group === g).length;
    });
    return counts;
  }, [candidates]);

  const filtered = useMemoR(() => {
    return candidates.filter(c => {
      if (tab !== "all" && stageMeta(c.status).group !== tab) return false;
      if (recruiterF !== "all" && c.recruiter !== recruiterF) return false;
      if (q) {
        const t = q.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"");
        const norm = s => (s||"").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"");
        if (!norm(fullName(c)).includes(t) && !norm(c.email).includes(t) && !norm(c.position).includes(t)) return false;
      }
      return true;
    });
  }, [candidates, tab, q, recruiterF]);

  const recruiters = [...new Set(candidates.map(c => c.recruiter).filter(Boolean))];

  return (
    <div className="view-pad">
      <div className="view-head">
        <div>
          <h1>Candidatos</h1>
          <div className="sub">Pipeline de reclutamiento. {candidates.length} candidatos en proceso · {stats.induction} llegando al handoff a HR.</div>
        </div>
        <div className="actions">
          <button className="btn">{Ic.upload} Sync Viterbit</button>
          <button className="btn accent" onClick={onNewCandidate}>{Ic.plus} Nuevo candidato</button>
        </div>
      </div>

      {/* Pipeline stats — visual */}
      <div className="pipeline-row">
        {["offer","documents","contract","accounts","induction"].map((g, i, arr) => {
          const m = groupMeta(g);
          return (
            <React.Fragment key={g}>
              <button className={"pipe-step " + (tab === g ? "active" : "")} onClick={() => setTab(g)} style={tab === g ? { background: m.bg, borderColor: m.color + "55", color: m.color } : null}>
                <div className="pipe-step-label">{m.label}</div>
                <div className="pipe-step-value">{stats[g] || 0}</div>
              </button>
              {i < arr.length - 1 && <div className="pipe-arrow">→</div>}
            </React.Fragment>
          );
        })}
      </div>

      <div className="toolbar">
        <div className="toolbar-row">
          <div className="tab-row" style={{ flexWrap: "wrap" }}>
            <button className={"tab " + (tab === "all" ? "active" : "")} onClick={() => setTab("all")}>
              Todos <span className="pill">{stats.all}</span>
            </button>
            {Object.entries(window.RecruitingData.GROUP_META).map(([g, m]) => (
              <button key={g} className={"tab " + (tab === g ? "active" : "")} onClick={() => setTab(g)}>
                <span className="cat-chip" style={{ background: m.bg, color: m.color, border: "1px solid " + m.color + "33" }}>{m.label[0]}</span>
                {m.label} <span className="pill">{stats[g] || 0}</span>
              </button>
            ))}
          </div>
          <div className="right" style={{ marginLeft: "auto" }}>
            <span style={{ fontSize: 12, color: "var(--ink-3)" }}>{filtered.length} resultados</span>
          </div>
        </div>
        <div className="toolbar-row" style={{ borderTop: "1px dashed var(--line)", paddingTop: 10 }}>
          <div className="search" style={{ flex: 1, minWidth: 220, maxWidth: 380 }}>
            {Ic.search}
            <input placeholder="Buscar nombre, correo, puesto…" value={q} onChange={e => setQ(e.target.value)}/>
          </div>
          <select className="btn sm" value={recruiterF} onChange={e => setRecruiterF(e.target.value)}>
            <option value="all">Todos los reclutadores</option>
            {recruiters.map(r => <option key={r} value={r}>{r}</option>)}
          </select>
        </div>
      </div>

      <div className="table-card">
        <table className="users">
          <thead>
            <tr>
              <th>Candidato</th>
              <th>Puesto</th>
              <th>Locación destino</th>
              <th>Etapa</th>
              <th>Documentos</th>
              <th>Avance</th>
              <th>Reclutador</th>
              <th>Creado</th>
              <th style={{ width: 36 }}></th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(c => {
              const loc = window.AvivaData.locations.find(l => l.id === c.locationId);
              const docCount = Object.keys(c.docs || {}).length;
              const totalDocs = window.RecruitingData.DOC_TYPES.filter(d => d.required).length;
              return (
                <tr key={c.id} onClick={() => onOpenCandidate(c)}>
                  <td>
                    <div className="user-cell">
                      <div className={"av " + (c.avatar?.color || "c1")}>{c.avatar?.initials}</div>
                      <div>
                        <div className="name">{fullName(c)}</div>
                        <div className="email">{c.email}</div>
                      </div>
                    </div>
                  </td>
                  <td style={{ fontSize: 12.5 }}>{c.position}</td>
                  <td>
                    {loc ? <window.LocationChip location={loc} compact/> : <span className="muted" style={{ fontSize: 12 }}>—</span>}
                  </td>
                  <td><StageBadge status={c.status}/></td>
                  <td>
                    <div className="doc-dots">
                      {window.RecruitingData.DOC_TYPES.filter(d => d.required).slice(0, 10).map(d => (
                        <DocStatusDot key={d.id} state={c.docs?.[d.id] || "pending"} title={d.label}/>
                      ))}
                    </div>
                    <div style={{ fontSize: 10.5, color: "var(--ink-4)", marginTop: 2, fontFamily: "var(--mono)" }}>
                      {docCount}/{totalDocs}
                    </div>
                  </td>
                  <td><CompletionBar value={c.completion}/></td>
                  <td><window.PersonChip name={c.recruiter} compact/></td>
                  <td className="muted" style={{ fontSize: 12 }}>{c.createdAt}</td>
                  <td onClick={e => e.stopPropagation()}>
                    <button className="iconbtn" title="Más">{Ic.more}</button>
                  </td>
                </tr>
              );
            })}
            {filtered.length === 0 && (
              <tr><td colSpan="9"><div className="empty" style={{ padding: 40, textAlign: "center" }}>Sin candidatos en esta etapa.</div></td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// =========================================================================
// CANDIDATE DETAIL — Drawer
// =========================================================================
function CandidateDetail({ candidate, onClose, onOpenLocation, onForceHandoff }) {
  const [tab, setTab] = useStateR("overview");
  if (!candidate) return null;
  const c = candidate;
  const loc = window.AvivaData.locations.find(l => l.id === c.locationId);
  const offerTpl = window.RecruitingData.OFFER_TEMPLATES.find(t => t.id === c.offerTemplateId);
  const contractTpl = window.RecruitingData.CONTRACT_TEMPLATES.find(t => t.id === c.contractTemplateId);

  return (
    <div className="drawer-body">
      <div className="loc-hero" style={{ background: "linear-gradient(180deg, " + stageMeta(c.status).bg + "55, var(--surface) 70%)" }}>
        <div className="loc-hero-row">
          <div className={"av lg " + (c.avatar?.color || "c1")} style={{ width: 64, height: 64, fontSize: 22 }}>{c.avatar?.initials}</div>
          <div className="loc-hero-main">
            <div className="loc-hero-tags">
              <span className="loc-tag mono">{c.id}</span>
              <span className="loc-tag">{c.recruiter}</span>
              {c.viterbitCandidatureId && <span className="loc-tag">Viterbit {c.viterbitCandidatureId}</span>}
            </div>
            <h2 className="loc-hero-title">{fullName(c)}</h2>
            <div className="loc-hero-meta">
              <span className="loc-meta-item"><span className="loc-meta-ic">{Ic.user}</span><b>{c.position}</b></span>
              {loc && <span className="loc-meta-item"><window.LocationChip location={loc} compact onClick={() => onOpenLocation?.(loc)}/></span>}
              <span className="loc-meta-item"><span className="loc-meta-ic">{Ic.link}</span>{c.email}</span>
              {c.phone && <span className="loc-meta-item">{c.phone}</span>}
            </div>
          </div>
          <div className="loc-hero-actions">
            <StageBadge status={c.status}/>
            <div className="row" style={{ gap: 6 }}>
              {c.status === "email_pending" && (
                <button className="btn sm" style={{ background: "var(--warn-bg)", color: "var(--warn-fg)", borderColor: "#f5e2b5" }} onClick={() => onForceHandoff?.(c)}>
                  {Ic.warn} Forzar handoff
                </button>
              )}
              <button className="btn sm primary">{Ic.edit} Editar</button>
            </div>
          </div>
        </div>
        <CandidateProgressTrack status={c.status}/>
      </div>

      <div className="profile-tabs">
        {[
          ["overview","Resumen"],
          ["docs","Expediente"],
          ["offer","Carta oferta"],
          ["contract","Contrato"],
          ["form","Cuestionario"],
          ["activity","Actividad"],
        ].map(([k, l]) => (
          <button key={k} className={"profile-tab " + (tab === k ? "active" : "")} onClick={() => setTab(k)}>{l}</button>
        ))}
      </div>

      {tab === "overview" && <CandidateOverview c={c} loc={loc} offerTpl={offerTpl} contractTpl={contractTpl}/>}
      {tab === "docs" && <CandidateDocs c={c}/>}
      {tab === "offer" && <CandidateOffer c={c} offerTpl={offerTpl}/>}
      {tab === "contract" && <CandidateContract c={c} contractTpl={contractTpl}/>}
      {tab === "form" && <CandidateForm c={c}/>}
      {tab === "activity" && <CandidateActivity c={c}/>}
    </div>
  );
}

// ─── Progress track (under hero) ──────────────────────────────────────────
function CandidateProgressTrack({ status }) {
  const STAGES = window.RecruitingData.STAGES;
  const main = STAGES.filter(s => !["rejected","disqualified"].includes(s.id));
  const currentIdx = main.findIndex(s => s.id === status);
  const isDead = ["rejected","disqualified"].includes(status);
  if (isDead) {
    const s = stageMeta(status);
    return (
      <div className="cand-track dead" style={{ background: s.bg, color: s.color, border: "1px solid " + s.color + "33" }}>
        {Ic.warn} <span style={{ fontWeight: 600 }}>{s.label}</span> · {s.desc}
      </div>
    );
  }
  return (
    <div className="cand-track">
      {main.map((s, i) => {
        const state = i < currentIdx ? "done" : i === currentIdx ? "current" : "pending";
        return (
          <div key={s.id} className={"cand-track-step " + state} title={s.label}>
            <div className="cand-track-dot">{state === "done" ? Ic.check : i + 1}</div>
            <div className="cand-track-label">{s.label}</div>
          </div>
        );
      })}
    </div>
  );
}

// ─── Overview ─────────────────────────────────────────────────────────────
function CandidateOverview({ c, loc, offerTpl, contractTpl }) {
  const meta = stageMeta(c.status);
  const recruiterRec = window.RecruitingData.recruiters.find(r => r.name === c.recruiter);

  // Next action based on stage
  const nextAction = {
    offer_held:     { l: "Subir oferta a Viterbit",         btn: "Marcar como enviada" },
    offer_sent:     { l: "Esperando firma del candidato",    btn: "Reenviar oferta" },
    offer_signed:   { l: "Enviar enlace de documentos",      btn: "Enviar enlace" },
    invited:        { l: "Candidato debe subir documentos",  btn: "Reenviar recordatorio" },
    in_progress:    { l: "Documentos en revisión OCR",       btn: "Ver documentos" },
    under_review:   { l: "Pendiente de aprobación manual",   btn: "Aprobar expediente" },
    approved:       { l: "Listo para enviar contrato",       btn: "Generar contrato" },
    rejected:       { l: "Expediente rechazado",             btn: null },
    contract_sent:  { l: "Esperando firma del contrato",     btn: "Reenviar contrato" },
    contract_signed:{ l: "Listo para abrir ticket IT",       btn: "Abrir ticket Jira" },
    email_pending:  { l: "IT provisionando correo",          btn: "Ver ticket IT-" },
    email_ready:    { l: "✓ Handoff a HR automático en curso", btn: "Ver perfil en HR" },
    induction:      { l: "Inducción en proceso",             btn: "Ver perfil en HR" },
    disqualified:   { l: "Descalificado",                    btn: null },
  }[c.status];

  return (
    <div>
      <div className="section">
        <div className="section-head"><h3>Estado del proceso</h3></div>
        <div className="section-body">
          <div className="next-action" style={{ background: meta.bg, borderColor: meta.color + "33" }}>
            <div className="ic" style={{ background: meta.color + "20", color: meta.color }}>{Ic.arrowR}</div>
            <div style={{ flex: 1 }}>
              <div className="lbl">SIGUIENTE PASO</div>
              <div className="title">{nextAction.l}</div>
              <div className="desc">{meta.desc}</div>
            </div>
            {nextAction.btn && <button className="btn primary">{nextAction.btn}</button>}
          </div>
        </div>
      </div>

      {/* Auto-handoff banner */}
      {c.status === "email_ready" && (
        <div className="handoff-banner">
          <div className="ic">{Ic.check}</div>
          <div style={{ flex: 1 }}>
            <div className="title">Handoff a HR en curso · automático</div>
            <div className="desc">
              {fullName(c)} será creado(a) como colaborador en el Directorio. Se asignará a la locación <b>{loc?.ubicacion || loc?.ciudad || "—"}</b>, con puesto <b>{c.position}</b>. Slack y HubSpot ya están provisionados.
            </div>
          </div>
          <button className="btn sm">Ver en HR</button>
        </div>
      )}
      {(c.status === "induction" && c.hrUserId) && (
        <div className="handoff-banner success">
          <div className="ic">{Ic.check}</div>
          <div style={{ flex: 1 }}>
            <div className="title">Colaborador activo en HR</div>
            <div className="desc">Inducción inicia el <b>{c.startDate}</b>. Ya tiene perfil completo en el Directorio.</div>
          </div>
          <button className="btn sm">Abrir perfil HR</button>
        </div>
      )}
      {c.status === "email_pending" && (
        <div className="handoff-banner pending">
          <div className="ic">{Ic.warn}</div>
          <div style={{ flex: 1 }}>
            <div className="title">Esperando provisión de correo · {c.jiraTicketKey}</div>
            <div className="desc">El handoff a HR ocurre automáticamente cuando IT marque el correo como listo. Si urge, IT o Admin pueden <b>Forzar handoff</b>.</div>
          </div>
        </div>
      )}

      <div className="section">
        <div className="section-head"><h3>Datos</h3></div>
        <div className="section-body">
          <div className="kv">
            <div className="k">Nombre</div><div className="v">{fullName(c)}</div>
            <div className="k">Correo personal</div><div className="v">{c.email}</div>
            <div className="k">Teléfono</div><div className="v">{c.phone || <span className="muted">—</span>}</div>
            <div className="k">Puesto</div><div className="v">{c.position}</div>
            <div className="k">Perfil Viterbit</div><div className="v">{c.profile || <span className="muted">—</span>}</div>
            <div className="k">Locación destino</div><div className="v">{loc ? <window.LocationChip location={loc}/> : <span className="muted">Por asignar</span>}</div>
            <div className="k">Reclutador</div><div className="v"><window.PersonChip name={c.recruiter}/></div>
            <div className="k">Creado</div><div className="v">{c.createdAt}</div>
            {c.corporateEmail && <><div className="k">Correo corporativo</div><div className="v" style={{ fontFamily: "var(--mono)", color: "var(--green-700)" }}>{c.corporateEmail}</div></>}
            {c.startDate && <><div className="k">Fecha de inicio</div><div className="v">{c.startDate}</div></>}
          </div>
        </div>
      </div>

      {c.notes && (
        <div className="section">
          <div className="section-head"><h3>Notas internas</h3></div>
          <div className="section-body">
            <div style={{ padding: 12, background: "var(--warn-bg)", borderRadius: 8, fontSize: 13, color: "var(--warn-fg)" }}>{c.notes}</div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Expediente / docs ────────────────────────────────────────────────────
function CandidateDocs({ c }) {
  const DOC_TYPES = window.RecruitingData.DOC_TYPES;
  return (
    <div className="section">
      <div className="section-head">
        <h3>Expediente · {c.completion}% completado</h3>
        <button className="btn sm">{Ic.upload} Subir documento</button>
      </div>
      <div className="section-body" style={{ paddingTop: 0 }}>
        <div className="pbar" style={{ height: 6, marginBottom: 14 }}>
          <div className="fill" style={{ width: c.completion + "%", background: c.completion >= 90 ? "var(--green-500)" : "#f0a800" }}/>
        </div>
      </div>
      <div className="section-body" style={{ padding: 0 }}>
        {DOC_TYPES.map((d, i) => {
          const state = c.docs?.[d.id] || "pending";
          const stateMeta = {
            valid:    { l: "Validado", c: "var(--green-700)", bg: "var(--mint-50)",  border: "var(--mint-100)" },
            invalid:  { l: "Inválido", c: "var(--danger-fg)", bg: "var(--danger-bg)", border: "#f5c8c0" },
            review:   { l: "En revisión", c: "var(--warn-fg)", bg: "var(--warn-bg)", border: "#f5e2b5" },
            uploaded: { l: "Subido", c: "var(--info-fg)", bg: "var(--info-bg)", border: "#c8d8f5" },
            pending:  { l: "Pendiente", c: "var(--ink-3)", bg: "var(--surface-2)", border: "var(--line)" },
          }[state];
          return (
            <div key={d.id} className="doc-card" style={{ borderColor: stateMeta.border }}>
              <div className="doc-card-ic" style={{ background: stateMeta.bg, color: stateMeta.c }}>
                {Ic.shield}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, fontSize: 13.5 }}>
                  {d.label}
                  {!d.required && <span className="badge neutral" style={{ marginLeft: 6, fontSize: 10 }}>Opcional</span>}
                </div>
                <div style={{ fontSize: 12, color: "var(--ink-3)" }}>
                  {state === "valid" && "OCR aprobado · datos extraídos automáticamente"}
                  {state === "invalid" && "OCR rechazado · pedir nueva foto"}
                  {state === "review" && "OCR ambiguo · requiere revisión manual"}
                  {state === "uploaded" && "Subido · esperando OCR"}
                  {state === "pending" && "Pendiente de subir"}
                </div>
              </div>
              <span className="badge" style={{ background: stateMeta.bg, color: stateMeta.c, borderColor: stateMeta.border }}>
                <span className="dot"/>{stateMeta.l}
              </span>
              {state !== "pending" && state !== "valid" && <button className="btn sm">Re-procesar</button>}
              {state === "invalid" && <button className="btn sm danger">Pedir nuevo</button>}
              {state === "valid" && <button className="btn sm ghost">Ver</button>}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Offer (read-only — NO se toca la carta oferta) ───────────────────────
function CandidateOffer({ c, offerTpl }) {
  const hasOffer = ["offer_sent","offer_signed","invited","in_progress","under_review","approved","contract_sent","contract_signed","email_pending","email_ready","induction"].includes(c.status);
  return (
    <div>
      {!hasOffer && (
        <div className="section"><div className="section-body">
          <div className="empty" style={{ padding: 20 }}>Aún no se ha enviado carta oferta para este candidato.</div>
        </div></div>
      )}
      {hasOffer && (
        <div className="section">
          <div className="section-head">
            <h3>Carta oferta</h3>
            <span className="muted" style={{ fontSize: 12 }}>Generada con plantilla "{offerTpl?.name || "—"}"</span>
          </div>
          <div className="section-body">
            <div className="kv">
              <div className="k">Plantilla</div><div className="v">{offerTpl?.name || "—"}</div>
              <div className="k">Salario propuesto</div><div className="v">{offerTpl?.salary || "—"}</div>
              <div className="k">Beneficios</div><div className="v">{offerTpl?.benefits || "—"}</div>
              <div className="k">Fecha de inicio</div><div className="v">{offerTpl?.startDate || "—"}</div>
              <div className="k">Enviada</div><div className="v">{c.createdAt}</div>
              {c.offerSignedAt && <><div className="k">Firmada</div><div className="v" style={{ color: "var(--green-700)", fontWeight: 600 }}>{c.offerSignedAt}</div></>}
              {c.offerExpiresAt && !c.offerSignedAt && <><div className="k">Expira</div><div className="v">{c.offerExpiresAt}</div></>}
            </div>
            <div className="row" style={{ gap: 8, marginTop: 14 }}>
              <button className="btn sm">{Ic.link} Ver PDF</button>
              {!c.offerSignedAt && <button className="btn sm">Reenviar oferta</button>}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Contract ─────────────────────────────────────────────────────────────
function CandidateContract({ c, contractTpl }) {
  const hasContract = ["contract_sent","contract_signed","email_pending","email_ready","induction"].includes(c.status);
  return (
    <div>
      {!hasContract && (
        <div className="section"><div className="section-body">
          <div className="empty" style={{ padding: 20 }}>El contrato se genera una vez aprobado el expediente.</div>
        </div></div>
      )}
      {hasContract && (
        <div className="section">
          <div className="section-head">
            <h3>Contrato</h3>
            <span className="muted" style={{ fontSize: 12 }}>{contractTpl?.name || "Plantilla por asignar"}</span>
          </div>
          <div className="section-body">
            <div className="kv">
              <div className="k">Plantilla</div><div className="v">{contractTpl?.name || "—"}</div>
              <div className="k">Tipo</div><div className="v">{contractTpl?.type?.toUpperCase() || "—"}</div>
              <div className="k">Páginas</div><div className="v">{contractTpl?.pageCount || "—"}</div>
              <div className="k">Iniciales por página</div><div className="v">{contractTpl?.hasInitials ? "Sí" : "No"}</div>
              {c.contractSignedAt
                ? <><div className="k">Firmado</div><div className="v" style={{ color: "var(--green-700)", fontWeight: 600 }}>{c.contractSignedAt}</div></>
                : <><div className="k">Expira</div><div className="v">{c.contractExpiresAt || "—"}</div></>
              }
            </div>
            <div className="row" style={{ gap: 8, marginTop: 14 }}>
              <button className="btn sm">{Ic.link} Ver contrato</button>
              {c.contractSignedAt && <button className="btn sm">{Ic.download} Evidencia de firma</button>}
              {!c.contractSignedAt && <button className="btn sm">Reenviar</button>}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Form / Cuestionario ──────────────────────────────────────────────────
function CandidateForm({ c }) {
  return (
    <div className="section">
      <div className="section-head"><h3>Cuestionario del candidato</h3></div>
      <div className="section-body">
        {!c.formAnswers && <div className="empty" style={{ padding: 16 }}>Aún no contesta el cuestionario.</div>}
        {c.formAnswers && (
          <div className="kv">
            {window.RecruitingData.FORM_QUESTIONS.filter(q => q.enabled).map(q => (
              <React.Fragment key={q.id}>
                <div className="k">{q.label}</div>
                <div className="v">{(c.formAnswers[q.builtinKey] ?? <span className="muted">—</span>) + ""}</div>
              </React.Fragment>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Activity / timeline ──────────────────────────────────────────────────
function CandidateActivity({ c }) {
  const status = c.status;
  // Build a fake history from the candidate's progression
  const STAGES = window.RecruitingData.STAGES.filter(s => !["rejected","disqualified"].includes(s.id));
  const currentIdx = STAGES.findIndex(s => s.id === status);
  const items = [];
  items.push({ kind: "create", title: "Candidato creado", when: c.createdAt, who: c.recruiter });
  STAGES.forEach((s, i) => {
    if (i <= currentIdx) {
      items.push({
        kind: s.group,
        title: s.label,
        when: i === currentIdx ? "actualmente" : "hace " + (currentIdx - i + 1) + "d",
        who: i <= 3 ? c.recruiter : "Sistema",
      });
    }
  });
  if (status === "rejected" || status === "disqualified") {
    items.push({ kind: "alert", title: "Marcado como " + stageMeta(status).label, when: "hace 1 d", who: c.recruiter, body: c.disqualificationReason });
  }
  if (c.reminderCount) items.push({ kind: "email", title: c.reminderCount + " recordatorio(s) enviados", when: "—", who: "Sistema" });

  return (
    <div className="section">
      <div className="section-head"><h3>Actividad</h3></div>
      <div className="section-body">
        <div className="timeline">
          {items.map((it, i) => (
            <div key={i} className="step done">
              <div className="title">{it.title}</div>
              <div className="meta">{it.when} · {it.who}</div>
              {it.body && <div className="body">{it.body}</div>}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// =========================================================================
// New Candidate Modal
// =========================================================================
function NewCandidateModal({ onClose, onCreated }) {
  const positions = window.CatalogData.positions.filter(p => /Promotor|Trainee|Kiosk Manager/i.test(p.name));
  const [form, setForm] = useStateR({
    firstName: "", lastName: "", email: "", phone: "",
    position: "Promotor/a Aviva tu Compra", locationId: null,
    recruiter: "Paula Acevedo",
  });
  function f(k, v) { setForm(p => ({ ...p, [k]: v })); }
  function submit() {
    onCreated({ ...form });
  }
  return (
    <div className="panel" style={{ width: "min(620px, 96vw)" }}>
      <div className="row" style={{ padding: "14px 20px", borderBottom: "1px solid var(--line)" }}>
        <div className="col">
          <div style={{ fontWeight: 600, fontSize: 15 }}>Nuevo candidato</div>
          <div style={{ fontSize: 12, color: "var(--ink-3)" }}>Se enviará automáticamente la carta oferta del puesto seleccionado.</div>
        </div>
        <span style={{ flex: 1 }}/>
        <button className="iconbtn" onClick={onClose}>{Ic.close}</button>
      </div>
      <div style={{ padding: 20 }}>
        <div className="field-row">
          <div className="field"><label>Nombre(s)</label><input type="text" value={form.firstName} onChange={e => f("firstName", e.target.value)} placeholder="Mariana"/></div>
          <div className="field"><label>Apellidos</label><input type="text" value={form.lastName} onChange={e => f("lastName", e.target.value)} placeholder="Gómez Lara"/></div>
        </div>
        <div className="field-row">
          <div className="field"><label>Correo personal</label><input type="email" value={form.email} onChange={e => f("email", e.target.value)} placeholder="mariana@gmail.com"/></div>
          <div className="field"><label>Teléfono</label><input type="text" value={form.phone} onChange={e => f("phone", e.target.value)} placeholder="+52 55 ..."/></div>
        </div>
        <div className="field"><label>Puesto</label>
          <select value={form.position} onChange={e => f("position", e.target.value)}>
            {positions.map(p => <option key={p.id}>{p.name}</option>)}
          </select>
          <span className="hint">Tomado del catálogo dinámico de puestos.</span>
        </div>
        <div className="field">
          <window.LocationPicker label="Locación destino" value={form.locationId} onChange={v => f("locationId", v)}
            placeholder="Asignar kiosco destino…"
            hint="Define a qué kiosco se asigna al candidato (no se incluye en la carta oferta)."/>
        </div>
        <div className="row" style={{ marginTop: 14, padding: 12, background: "var(--mint-50)", borderRadius: 10, fontSize: 12.5, color: "var(--green-700)" }}>
          {Ic.shield} <span>Al crear: <b>1)</b> Viterbit recibe al candidato · <b>2)</b> Se genera carta oferta · <b>3)</b> Email automático con enlace de firma.</span>
        </div>
      </div>
      <div style={{ padding: 14, borderTop: "1px solid var(--line)", display: "flex", gap: 8, alignItems: "center", background: "var(--surface)" }}>
        <span style={{ flex: 1 }}/>
        <button className="btn" onClick={onClose}>Cancelar</button>
        <button className="btn accent" onClick={submit}>{Ic.plus} Crear candidato</button>
      </div>
    </div>
  );
}

Object.assign(window, { CandidatosView, CandidateDetail, NewCandidateModal, StageBadge, stageMeta, groupMeta });
