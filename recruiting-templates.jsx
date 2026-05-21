// Aviva HR — Recruiting: Expedientes + Plantillas + Form Config
const { useState: useStateRT, useMemo: useMemoRT } = React;

// =========================================================================
// EXPEDIENTES VIEW
// =========================================================================
function ExpedientesView({ onOpenCandidate }) {
  const candidates = window.RecruitingData.candidates;
  const DOC_TYPES = window.RecruitingData.DOC_TYPES;
  const [filter, setFilter] = useStateRT("all");
  const [docF, setDocF] = useStateRT("all");

  // Only show candidates in document collection stages
  const inDocs = candidates.filter(c => ["invited","in_progress","under_review","approved","rejected"].includes(c.status));

  const filtered = inDocs.filter(c => {
    if (filter === "needs_review") {
      return Object.values(c.docs || {}).some(s => s === "review" || s === "invalid");
    }
    if (filter === "complete") return c.completion >= 100;
    if (filter === "incomplete") return c.completion < 100;
    if (docF !== "all") {
      return c.docs?.[docF] && c.docs[docF] !== "valid";
    }
    return true;
  });

  const stats = {
    total: inDocs.length,
    needsReview: inDocs.filter(c => Object.values(c.docs || {}).some(s => s === "review" || s === "invalid")).length,
    complete: inDocs.filter(c => c.completion >= 100).length,
    pendingDocs: inDocs.reduce((sum, c) => sum + (DOC_TYPES.filter(d => d.required).length - Object.values(c.docs || {}).filter(s => s === "valid").length), 0),
  };

  return (
    <div className="view-pad">
      <div className="view-head">
        <div>
          <h1>Expedientes</h1>
          <div className="sub">Revisión de documentos con OCR. Aprueba, rechaza o pide volver a subir.</div>
        </div>
        <div className="actions">
          <button className="btn">{Ic.download} Exportar a Drive</button>
          <button className="btn">{Ic.upload} Sync a Sheets</button>
        </div>
      </div>

      <div className="stat-row">
        <div className="stat">
          <span className="accent-strip"/>
          <div className="label">Expedientes activos</div>
          <div className="value">{stats.total}</div>
          <div className="foot"><span style={{ fontSize: 12, color: "var(--ink-3)" }}>En etapas de documentos</span></div>
        </div>
        <div className="stat">
          <span className="accent-strip" style={{ background: "var(--danger-fg)" }}/>
          <div className="label">Requieren revisión</div>
          <div className="value">{stats.needsReview}</div>
          <div className="foot"><span style={{ fontSize: 12, color: "var(--danger-fg)", fontWeight: 600 }}>Atención manual</span></div>
        </div>
        <div className="stat">
          <span className="accent-strip"/>
          <div className="label">Completos al 100%</div>
          <div className="value">{stats.complete}</div>
          <div className="foot"><span style={{ fontSize: 12, color: "var(--green-600)", fontWeight: 600 }}>Listos para aprobar</span></div>
        </div>
        <div className="stat">
          <span className="accent-strip"/>
          <div className="label">Documentos pendientes</div>
          <div className="value">{stats.pendingDocs}</div>
          <div className="foot"><span style={{ fontSize: 12, color: "var(--ink-3)" }}>Suma total</span></div>
        </div>
      </div>

      <div className="toolbar">
        <div className="toolbar-row">
          <div className="tab-row">
            <button className={"tab " + (filter === "all" ? "active" : "")} onClick={() => setFilter("all")}>Todos <span className="pill">{inDocs.length}</span></button>
            <button className={"tab " + (filter === "needs_review" ? "active" : "")} onClick={() => setFilter("needs_review")}>Requieren revisión <span className="pill">{stats.needsReview}</span></button>
            <button className={"tab " + (filter === "complete" ? "active" : "")} onClick={() => setFilter("complete")}>Completos <span className="pill">{stats.complete}</span></button>
            <button className={"tab " + (filter === "incomplete" ? "active" : "")} onClick={() => setFilter("incomplete")}>Incompletos <span className="pill">{inDocs.length - stats.complete}</span></button>
          </div>
          <div className="right" style={{ marginLeft: "auto" }}>
            <select className="btn sm" value={docF} onChange={e => setDocF(e.target.value)}>
              <option value="all">Filtrar por documento</option>
              {DOC_TYPES.map(d => <option key={d.id} value={d.id}>{d.label}</option>)}
            </select>
          </div>
        </div>
      </div>

      <div className="table-card">
        <table className="users">
          <thead>
            <tr>
              <th>Candidato</th>
              <th>Etapa</th>
              <th style={{ width: 280 }}>Documentos (OCR)</th>
              <th>Avance</th>
              <th>Recordatorios</th>
              <th style={{ width: 100 }}></th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(c => (
              <tr key={c.id} onClick={() => onOpenCandidate(c)}>
                <td>
                  <div className="user-cell">
                    <div className={"av " + (c.avatar?.color || "c1")}>{c.avatar?.initials}</div>
                    <div>
                      <div className="name">{c.firstName + " " + c.lastName}</div>
                      <div className="email">{c.position}</div>
                    </div>
                  </div>
                </td>
                <td><window.StageBadge status={c.status}/></td>
                <td>
                  <div className="exp-doc-pills">
                    {DOC_TYPES.filter(d => d.required).map(d => {
                      const state = c.docs?.[d.id] || "pending";
                      const cls = "exp-doc exp-doc-" + state;
                      return <span key={d.id} className={cls} title={d.label + " · " + state}>{d.label[0]}</span>;
                    })}
                  </div>
                </td>
                <td>
                  <div className="row" style={{ gap: 6 }}>
                    <div className="pbar" style={{ width: 60, height: 4 }}>
                      <div className="fill" style={{ width: c.completion + "%", background: c.completion >= 90 ? "var(--green-500)" : "#f0a800" }}/>
                    </div>
                    <span style={{ fontSize: 11, fontFamily: "var(--mono)", color: "var(--ink-3)" }}>{c.completion}%</span>
                  </div>
                </td>
                <td className="muted" style={{ fontSize: 12 }}>{c.reminderCount || 0}</td>
                <td onClick={e => e.stopPropagation()}>
                  <button className="btn sm">Revisar</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// =========================================================================
// OFFER TEMPLATES VIEW
// =========================================================================
function OfferTemplatesView() {
  const [templates, setTemplates] = useStateRT(window.RecruitingData.OFFER_TEMPLATES);
  const [editing, setEditing] = useStateRT(null);

  function save(t) {
    setTemplates(prev => {
      if (!t.id) return [...prev, { ...t, id: "ot-" + Date.now() }];
      return prev.map(x => x.id === t.id ? t : x);
    });
    setEditing(null);
  }

  return (
    <div className="view-pad">
      <div className="view-head">
        <div>
          <h1>Cartas oferta</h1>
          <div className="sub">Plantillas que se generan automáticamente al crear un candidato.</div>
        </div>
        <div className="actions">
          <button className="btn accent" onClick={() => setEditing({ name: "", positionKeywords: [], salary: "", benefits: "", startDate: "", profileNames: [] })}>{Ic.plus} Nueva plantilla</button>
        </div>
      </div>

      <div className="tpl-grid">
        {templates.map(t => (
          <div key={t.id} className="tpl-card" onClick={() => setEditing(t)}>
            <div className="tpl-card-head">
              <div className="tpl-card-glyph" style={{ background: "var(--mint-50)", color: "var(--green-700)" }}>
                {Ic.shield}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div className="tpl-card-name">{t.name}</div>
                <div className="tpl-card-sub">
                  {t.profileNames && t.profileNames.length > 0
                    ? <>Perfil Viterbit: <b>{t.profileNames.join(", ")}</b></>
                    : <>Keywords: {t.positionKeywords.join(", ")}</>
                  }
                </div>
              </div>
              <button className="btn sm">{Ic.edit}</button>
            </div>
            <div className="tpl-card-body">
              <div className="tpl-card-row"><span className="k">Salario</span><span className="v">{t.salary || "—"}</span></div>
              <div className="tpl-card-row"><span className="k">Beneficios</span><span className="v">{t.benefits || "—"}</span></div>
              <div className="tpl-card-row"><span className="k">Inicio</span><span className="v">{t.startDate || "—"}</span></div>
              <div className="tpl-card-row"><span className="k">Actualizada</span><span className="v muted">{t.updatedAt}</span></div>
            </div>
          </div>
        ))}
      </div>

      <Modal open={!!editing} onClose={() => setEditing(null)}>
        {editing && <EditOfferTemplateModal tpl={editing} onClose={() => setEditing(null)} onSave={save}/>}
      </Modal>
    </div>
  );
}

function EditOfferTemplateModal({ tpl, onClose, onSave }) {
  const [form, setForm] = useStateRT({ ...tpl });
  function f(k, v) { setForm(p => ({ ...p, [k]: v })); }
  return (
    <div className="panel" style={{ width: "min(640px, 96vw)" }}>
      <div className="row" style={{ padding: "14px 20px", borderBottom: "1px solid var(--line)" }}>
        <div className="col">
          <div style={{ fontWeight: 600, fontSize: 15 }}>{tpl.id ? "Editar carta oferta" : "Nueva carta oferta"}</div>
          <div style={{ fontSize: 12, color: "var(--ink-3)" }}>Esta plantilla se asigna automáticamente según el puesto.</div>
        </div>
        <span style={{ flex: 1 }}/>
        <button className="iconbtn" onClick={onClose}>{Ic.close}</button>
      </div>
      <div style={{ padding: 20, overflow: "auto", maxHeight: "70vh" }}>
        <div className="field"><label>Nombre de la plantilla</label>
          <input type="text" value={form.name} onChange={e => f("name", e.target.value)} placeholder="Ej. Promotor/a Aviva tu Compra"/>
        </div>
        <div className="field">
          <label>Perfiles Viterbit (uno por línea)</label>
          <textarea value={(form.profileNames || []).join("\n")} onChange={e => f("profileNames", e.target.value.split("\n").filter(Boolean))} rows={3} placeholder="Promotor/a Aviva tu Compra\nPromotor/a Aviva tu Compra (Comodín)"/>
        </div>
        <div className="field"><label>Palabras clave de fallback (separadas por coma)</label>
          <input type="text" value={(form.positionKeywords || []).join(", ")} onChange={e => f("positionKeywords", e.target.value.split(",").map(s => s.trim()).filter(Boolean))} placeholder="promotor, aviva tu compra"/>
        </div>
        <div className="field-row">
          <div className="field"><label>Salario</label><input type="text" value={form.salary} onChange={e => f("salary", e.target.value)} placeholder="$8,500 brutos"/></div>
          <div className="field"><label>Fecha de inicio</label><input type="text" value={form.startDate} onChange={e => f("startDate", e.target.value)} placeholder="primer lunes del mes"/></div>
        </div>
        <div className="field"><label>Beneficios</label>
          <textarea value={form.benefits} onChange={e => f("benefits", e.target.value)} rows={2} placeholder="Vales, SGMM, aguinaldo, vacaciones…"/>
        </div>
        <div className="row" style={{ padding: 12, background: "var(--mint-50)", borderRadius: 8, fontSize: 12.5, color: "var(--green-700)" }}>
          {Ic.shield} Esta plantilla se renderiza desde el cuerpo HTML en producción. Aquí solo gestionas los datos de cabecera.
        </div>
      </div>
      <div style={{ padding: 14, borderTop: "1px solid var(--line)", display: "flex", gap: 8, alignItems: "center", background: "var(--surface)" }}>
        <span style={{ flex: 1 }}/>
        <button className="btn" onClick={onClose}>Cancelar</button>
        <button className="btn accent" onClick={() => onSave(form)}>{Ic.check} Guardar</button>
      </div>
    </div>
  );
}

// =========================================================================
// CONTRACT TEMPLATES VIEW
// =========================================================================
function ContractTemplatesView() {
  const [templates] = useStateRT(window.RecruitingData.CONTRACT_TEMPLATES);
  return (
    <div className="view-pad">
      <div className="view-head">
        <div>
          <h1>Contratos</h1>
          <div className="sub">Plantillas de contrato de trabajo. Soporta HTML editable y PDFs con campos de firma posicionados.</div>
        </div>
        <div className="actions">
          <button className="btn">{Ic.upload} Subir PDF</button>
          <button className="btn accent">{Ic.plus} Nueva plantilla HTML</button>
        </div>
      </div>

      <div className="tpl-grid">
        {templates.map(t => (
          <div key={t.id} className="tpl-card">
            <div className="tpl-card-head">
              <div className="tpl-card-glyph" style={{ background: t.type === "pdf" ? "#fbece0" : "#e5edf7", color: t.type === "pdf" ? "#b15a0c" : "#1b3f8a" }}>
                {Ic.shield}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div className="tpl-card-name">{t.name}</div>
                <div className="tpl-card-sub">Keywords: {t.positionKeywords.join(", ")}</div>
              </div>
              <span className="badge neutral" style={{ fontSize: 10 }}>{t.type === "pdf" ? "PDF" : "HTML"}</span>
              <button className="btn sm">{Ic.edit}</button>
            </div>
            <div className="tpl-card-body">
              <div className="tpl-card-row"><span className="k">Páginas</span><span className="v">{t.pageCount}</span></div>
              <div className="tpl-card-row"><span className="k">Firma en cada página</span><span className="v">{t.hasInitials ? "Sí — iniciales por página" : "Solo última página"}</span></div>
              <div className="tpl-card-row"><span className="k">Campos posicionados</span><span className="v">{t.hasSignatureFields ? "Sí" : "Por configurar"}</span></div>
              <div className="tpl-card-row"><span className="k">Actualizada</span><span className="v muted">{t.updatedAt}</span></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// =========================================================================
// EMAIL TEMPLATES VIEW
// =========================================================================
function EmailTemplatesView() {
  const [templates, setTemplates] = useStateRT(window.RecruitingData.EMAIL_TEMPLATES);
  const [editing, setEditing] = useStateRT(null);

  function save(t) {
    setTemplates(prev => prev.map(x => x.id === t.id ? t : x));
    setEditing(null);
  }

  const TYPE_META = {
    invitation: { l: "Invitación",        c: "#026149", bg: "#e7f8ef" },
    reminder:   { l: "Recordatorio",      c: "#8a5a00", bg: "#fff5d6" },
    approved:   { l: "Aprobado",          c: "#026149", bg: "#e7f8ef" },
    rejected:   { l: "Rechazado",         c: "#a8200d", bg: "#ffe2dc" },
    ocr_error:  { l: "Error OCR",         c: "#a8200d", bg: "#ffe2dc" },
    contract:   { l: "Contrato",          c: "#5c2e8e", bg: "#ece2f5" },
    induction:  { l: "Inducción",         c: "#1b3f8a", bg: "#e3eeff" },
    offer:      { l: "Carta oferta",      c: "#5c2e8e", bg: "#ece2f5" },
    onboarding: { l: "Onboarding",        c: "#026149", bg: "#e7f8ef" },
  };

  return (
    <div className="view-pad">
      <div className="view-head">
        <div>
          <h1>Plantillas de correo</h1>
          <div className="sub">Mensajes automáticos enviados con Gmail API a candidatos. Variables: <code style={{ fontFamily: "var(--mono)", fontSize: 11 }}>{`{{firstName}}`}</code>, <code style={{ fontFamily: "var(--mono)", fontSize: 11 }}>{`{{formUrl}}`}</code>, etc.</div>
        </div>
      </div>

      <div className="email-tpl-grid">
        {templates.map(t => {
          const meta = TYPE_META[t.type] || { l: t.type, c: "#888", bg: "#eee" };
          return (
            <div key={t.id} className="email-tpl-card" onClick={() => setEditing(t)}>
              <div className="email-tpl-head">
                <span className="badge" style={{ background: meta.bg, color: meta.c, borderColor: meta.c + "33" }}><span className="dot"/>{meta.l}</span>
                <span className="muted" style={{ fontSize: 11 }}>{t.updatedAt}</span>
              </div>
              <div className="email-tpl-name">{t.name}</div>
              <div className="email-tpl-subject">{t.subject}</div>
              <div className="email-tpl-preview">{t.body.split("\n")[0]}</div>
              <div className="email-tpl-foot">
                <button className="btn sm">{Ic.edit} Editar</button>
                <button className="btn sm ghost">{Ic.link} Vista previa</button>
              </div>
            </div>
          );
        })}
      </div>

      <Modal open={!!editing} onClose={() => setEditing(null)}>
        {editing && <EditEmailTemplateModal tpl={editing} onClose={() => setEditing(null)} onSave={save}/>}
      </Modal>
    </div>
  );
}

function EditEmailTemplateModal({ tpl, onClose, onSave }) {
  const [form, setForm] = useStateRT({ ...tpl });
  function f(k, v) { setForm(p => ({ ...p, [k]: v })); }
  return (
    <div className="panel" style={{ width: "min(700px, 96vw)" }}>
      <div className="row" style={{ padding: "14px 20px", borderBottom: "1px solid var(--line)" }}>
        <div className="col">
          <div style={{ fontWeight: 600, fontSize: 15 }}>Editar plantilla · {tpl.name}</div>
          <div style={{ fontSize: 12, color: "var(--ink-3)" }}>Las variables {`{{...}}`} se reemplazan en producción.</div>
        </div>
        <span style={{ flex: 1 }}/>
        <button className="iconbtn" onClick={onClose}>{Ic.close}</button>
      </div>
      <div style={{ padding: 20, overflow: "auto", maxHeight: "70vh" }}>
        <div className="field"><label>Asunto</label>
          <input type="text" value={form.subject} onChange={e => f("subject", e.target.value)}/>
        </div>
        <div className="field"><label>Cuerpo</label>
          <textarea value={form.body} onChange={e => f("body", e.target.value)} rows={10} style={{ fontFamily: "var(--mono)", fontSize: 12.5 }}/>
        </div>
        <div className="row" style={{ padding: 12, background: "var(--surface-2)", borderRadius: 8, fontSize: 12, color: "var(--ink-3)", flexWrap: "wrap", gap: 6 }}>
          <span>Variables disponibles:</span>
          {["{{firstName}}","{{lastName}}","{{email}}","{{position}}","{{formUrl}}","{{offerUrl}}","{{contractUrl}}","{{linkDays}}","{{daysLeft}}","{{corporateEmail}}","{{startDate}}","{{location}}","{{manager}}"].map(v => (
            <code key={v} style={{ fontFamily: "var(--mono)", fontSize: 11, background: "var(--surface)", padding: "1px 6px", borderRadius: 4, border: "1px solid var(--line)" }}>{v}</code>
          ))}
        </div>
      </div>
      <div style={{ padding: 14, borderTop: "1px solid var(--line)", display: "flex", gap: 8, alignItems: "center", background: "var(--surface)" }}>
        <button className="btn sm">{Ic.link} Enviar correo de prueba</button>
        <span style={{ flex: 1 }}/>
        <button className="btn" onClick={onClose}>Cancelar</button>
        <button className="btn accent" onClick={() => onSave(form)}>{Ic.check} Guardar</button>
      </div>
    </div>
  );
}

// =========================================================================
// FORM CONFIG VIEW (Preguntas y documentos)
// =========================================================================
function FormConfigView() {
  const [tab, setTab] = useStateRT("questions");
  const [questions, setQuestions] = useStateRT(window.RecruitingData.FORM_QUESTIONS);
  const [docs, setDocs] = useStateRT(window.RecruitingData.DOC_TYPES);

  function toggleQ(id, k) {
    setQuestions(prev => prev.map(q => q.id === id ? { ...q, [k]: !q[k] } : q));
  }
  function toggleDoc(id, k) {
    setDocs(prev => prev.map(d => d.id === id ? { ...d, [k]: !d[k] } : d));
  }

  return (
    <div className="view-pad">
      <div className="view-head">
        <div>
          <h1>Preguntas y documentos</h1>
          <div className="sub">Configura el cuestionario que llenan los candidatos y la lista de documentos requeridos del expediente.</div>
        </div>
      </div>

      <div className="toolbar">
        <div className="toolbar-row">
          <div className="tab-row">
            <button className={"tab " + (tab === "questions" ? "active" : "")} onClick={() => setTab("questions")}>
              Preguntas <span className="pill">{questions.length}</span>
            </button>
            <button className={"tab " + (tab === "docs" ? "active" : "")} onClick={() => setTab("docs")}>
              Documentos <span className="pill">{docs.length}</span>
            </button>
          </div>
        </div>
      </div>

      {tab === "questions" && (
        <div className="table-card">
          <table className="users">
            <thead>
              <tr>
                <th style={{ width: 40 }}>#</th>
                <th>Pregunta</th>
                <th>Tipo</th>
                <th>Opciones</th>
                <th style={{ width: 100 }}>Requerida</th>
                <th style={{ width: 100 }}>Activa</th>
                <th style={{ width: 60 }}></th>
              </tr>
            </thead>
            <tbody>
              {questions.sort((a,b) => a.order - b.order).map(q => (
                <tr key={q.id}>
                  <td className="muted" style={{ fontFamily: "var(--mono)", fontSize: 12 }}>{q.order}</td>
                  <td>
                    <div style={{ fontWeight: 600, fontSize: 13 }}>{q.label}</div>
                    {q.builtinKey && <div style={{ fontSize: 11, color: "var(--ink-4)", fontFamily: "var(--mono)" }}>{q.builtinKey}</div>}
                  </td>
                  <td><span className="badge neutral">{q.type}</span></td>
                  <td className="muted" style={{ fontSize: 12 }}>{q.options ? q.options.join(", ") : "—"}</td>
                  <td>
                    <label className="cb-cell"><input type="checkbox" className="cb" checked={q.required} onChange={() => toggleQ(q.id, "required")}/></label>
                  </td>
                  <td>
                    <label className="cb-cell"><input type="checkbox" className="cb" checked={q.enabled} onChange={() => toggleQ(q.id, "enabled")}/></label>
                  </td>
                  <td><button className="btn sm">{Ic.edit}</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {tab === "docs" && (
        <div className="table-card">
          <table className="users">
            <thead>
              <tr>
                <th>Documento</th>
                <th>ID</th>
                <th>Condición</th>
                <th style={{ width: 100 }}>Requerido</th>
                <th style={{ width: 60 }}></th>
              </tr>
            </thead>
            <tbody>
              {docs.map(d => (
                <tr key={d.id}>
                  <td>
                    <div style={{ fontWeight: 600, fontSize: 13 }}>{d.label}</div>
                  </td>
                  <td className="muted" style={{ fontFamily: "var(--mono)", fontSize: 12 }}>{d.id}</td>
                  <td className="muted" style={{ fontSize: 12 }}>{d.condition ? "Si responde " + d.condition + " = sí" : "Siempre"}</td>
                  <td>
                    <label className="cb-cell"><input type="checkbox" className="cb" checked={d.required} onChange={() => toggleDoc(d.id, "required")}/></label>
                  </td>
                  <td><button className="btn sm">{Ic.edit}</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

Object.assign(window, { ExpedientesView, OfferTemplatesView, ContractTemplatesView, EmailTemplatesView, FormConfigView });
