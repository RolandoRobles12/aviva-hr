// Aviva HR — Importador de usuarios + selector de ticket
const { useState: useIS, useMemo: useIM, useRef: useIR } = React;

// =========================================================================
// IMPORT WIZARD
// =========================================================================
function ImportWizard({ onClose, onImported }) {
  const [step, setStep] = useIS(0);
  const [file, setFile] = useIS(null);
  const [parsedRows, setParsedRows] = useIS([]);
  const [parsedHeaders, setParsedHeaders] = useIS([]);
  const [mapping, setMapping] = useIS({});
  const [dragOver, setDragOver] = useIS(false);
  const fileInputRef = useIR(null);

  // Target Aviva fields
  const TARGETS = [
    { id: "numColaborador", label: "Número de colaborador", required: true,  hints: ["No de colaborador", "Número", "ID", "Numero colaborador"] },
    { id: "fullName",       label: "Nombre completo",       required: true,  hints: ["Nombre completo", "Nombre", "Colaborador"] },
    { id: "email",          label: "Correo corporativo",    required: true,  hints: ["Correo", "Email", "E-mail"] },
    { id: "role",           label: "Puesto",                 required: true,  hints: ["Puesto", "Cargo", "Rol"] },
    { id: "hub",            label: "Hub / equipo",           required: false, hints: ["Hub", "Equipo"] },
    { id: "quiosco",        label: "Quiósco",                required: true,  hints: ["Quiosco", "Quiósco", "Kiosco"] },
    { id: "estado",         label: "Estado",                 required: true,  hints: ["Estado"] },
    { id: "managerName",    label: "Jefe inmediato",         required: false, hints: ["Jefe inmediato", "Jefe", "Manager", "Supervisor"] },
    { id: "empresa",        label: "Empresa",                required: false, hints: ["Empresa", "Razón social"] },
    { id: "talla",          label: "Talla de uniforme",      required: false, hints: ["Talla", "Tallas"] },
    { id: "genero",         label: "Género",                 required: false, hints: ["Hombre/Mujer", "Género", "Genero", "Sexo"] },
    { id: "hiredAt",        label: "Fecha de ingreso",       required: false, hints: ["Fecha de Ingreso", "Fecha ingreso", "Alta"] },
    { id: "hubspot",        label: "HubSpot ID",             required: false, hints: ["HubSpot", "HubSpot ID"] },
    { id: "phone",          label: "Teléfono / WhatsApp",    required: false, hints: ["Teléfono", "WhatsApp", "Celular", "Tel"] },
  ];

  function handleFile(f) {
    setFile(f);
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target.result;
      const rows = parseCSV(text);
      if (rows.length < 2) { setParsedRows([]); setParsedHeaders([]); return; }
      const headers = rows[0];
      const data = rows.slice(1).filter(r => r.some(c => c && c.trim()));
      setParsedHeaders(headers);
      setParsedRows(data);

      // Auto-map by hints
      const autoMap = {};
      TARGETS.forEach(t => {
        const found = headers.findIndex(h => t.hints.some(hint => (h || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").includes(hint.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, ""))));
        if (found >= 0) autoMap[t.id] = found;
      });
      setMapping(autoMap);
      setStep(1);
    };
    reader.readAsText(f);
  }

  function parseCSV(text) {
    // Simple CSV parser (handles quotes)
    const rows = [];
    let row = [];
    let cur = "";
    let inQ = false;
    for (let i = 0; i < text.length; i++) {
      const c = text[i];
      if (inQ) {
        if (c === '"' && text[i + 1] === '"') { cur += '"'; i++; }
        else if (c === '"') inQ = false;
        else cur += c;
      } else {
        if (c === '"') inQ = true;
        else if (c === ',') { row.push(cur); cur = ""; }
        else if (c === '\n' || c === '\r') {
          if (cur || row.length) { row.push(cur); rows.push(row); row = []; cur = ""; }
          if (c === '\r' && text[i + 1] === '\n') i++;
        }
        else cur += c;
      }
    }
    if (cur || row.length) { row.push(cur); rows.push(row); }
    return rows;
  }

  function onDrop(e) {
    e.preventDefault();
    setDragOver(false);
    const f = e.dataTransfer.files?.[0];
    if (f) handleFile(f);
  }

  // Validation: compute issues per row
  const validation = useIM(() => {
    if (!parsedRows.length) return { ok: 0, warn: 0, err: 0, rows: [] };
    const requiredIds = TARGETS.filter(t => t.required).map(t => t.id);
    const knownEmails = new Set(window.AvivaData.users.map(u => u.email));
    const knownNums = new Set(window.AvivaData.users.map(u => u.numColaborador));
    let ok = 0, warn = 0, err = 0;
    const rows = parsedRows.slice(0, 50).map((r, idx) => {
      const issues = [];
      const mapped = {};
      TARGETS.forEach(t => {
        const colIdx = mapping[t.id];
        if (colIdx == null) return;
        mapped[t.id] = (r[colIdx] || "").trim();
      });
      requiredIds.forEach(rid => {
        if (!mapped[rid]) issues.push({ kind: "err", msg: `Falta ${rid}` });
      });
      if (mapped.email && knownEmails.has(mapped.email)) issues.push({ kind: "warn", msg: "Email ya existe — se actualizará" });
      if (mapped.numColaborador && knownNums.has(mapped.numColaborador)) issues.push({ kind: "warn", msg: "Núm. ya existe" });
      const sev = issues.some(i => i.kind === "err") ? "err" : issues.some(i => i.kind === "warn") ? "warn" : "ok";
      if (sev === "err") err++; else if (sev === "warn") warn++; else ok++;
      return { idx, mapped, issues, sev };
    });
    return { ok, warn, err, rows, total: parsedRows.length };
  }, [parsedRows, mapping]);

  const stepsLabels = ["Cargar archivo", "Mapear columnas", "Revisar", "Importado"];

  function downloadTemplate() {
    const csv = "No de colaborador,Nombre completo,Correo,Puesto,Hub o equipo,Quiosco,Estado,Jefe inmediato,Empresa,Talla,Hombre/Mujer,Fecha de Ingreso,HubSpot ID,WhatsApp\n" +
                "385_02,Ejemplo Pérez García,ejemplo.perez@avivacredito.com,Promotor/a Aviva tu Compra,hub3_region-pue-mor-tlax,Texmelucan,Puebla,Fernanda Romero Torres,Aviva Financial,M,M,2026-06-01,,+52 55 1234 5678\n";
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "plantilla-colaboradores-aviva.csv";
    a.click(); URL.revokeObjectURL(url);
  }

  function doImport() {
    onImported({ ok: validation.ok, warn: validation.warn, err: validation.err, total: validation.total });
    setStep(3);
  }

  return (
    <div className="panel" style={{ width: "min(960px, 96vw)", maxHeight: "92vh" }}>
      <div className="row" style={{ padding: "14px 20px", borderBottom: "1px solid var(--line)" }}>
        <div className="col">
          <div style={{ fontWeight: 600, fontSize: 15 }}>Importar colaboradores</div>
          <div style={{ fontSize: 12, color: "var(--ink-3)" }}>Sube un CSV o XLSX y Aviva HR creará o actualizará las cuentas y provisionará las apps automáticamente.</div>
        </div>
        <span style={{ flex: 1 }}/>
        <button className="iconbtn" onClick={onClose}>{Ic.close}</button>
      </div>

      <div className="wizard-stepper">
        {stepsLabels.map((s, i) => (
          <React.Fragment key={s}>
            <div className={"wizard-step " + (i === step ? "active" : i < step ? "done" : "")}>
              <span className="num">{i < step ? Ic.check : (i + 1)}</span>
              <span>{s}</span>
            </div>
            {i < stepsLabels.length - 1 && <span className="sep"/>}
          </React.Fragment>
        ))}
      </div>

      <div style={{ flex: 1, overflow: "auto", padding: 20 }}>
        {step === 0 && (
          <React.Fragment>
            <div
              className={"dropzone " + (dragOver ? "over" : "")}
              onDragOver={e => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={onDrop}
              onClick={() => fileInputRef.current?.click()}
            >
              <div className="dropzone-ic">{Ic.upload}</div>
              <div style={{ fontWeight: 600, fontSize: 15 }}>Arrastra tu archivo aquí</div>
              <div style={{ fontSize: 13, color: "var(--ink-3)", marginTop: 4 }}>o haz clic para seleccionar · CSV, XLSX hasta 5 MB</div>
              <input ref={fileInputRef} type="file" accept=".csv,.xlsx,.xls" style={{ display: "none" }} onChange={e => e.target.files?.[0] && handleFile(e.target.files[0])}/>
            </div>

            <div style={{ marginTop: 20, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <div className="hint-card">
                <div className="hint-card-ic" style={{ background: "var(--mint-50)", color: "var(--green-700)" }}>{Ic.download}</div>
                <div>
                  <div style={{ fontWeight: 600 }}>¿Primera vez?</div>
                  <div style={{ fontSize: 12.5, color: "var(--ink-3)", marginTop: 2 }}>Descarga la plantilla CSV con todas las columnas que esperamos.</div>
                  <button className="btn sm" style={{ marginTop: 8 }} onClick={downloadTemplate}>Descargar plantilla</button>
                </div>
              </div>
              <div className="hint-card">
                <div className="hint-card-ic" style={{ background: "#fff3d6", color: "#8a5a00" }}>{Ic.warn}</div>
                <div>
                  <div style={{ fontWeight: 600 }}>¿Vienes desde Humand o un Excel viejo?</div>
                  <div style={{ fontSize: 12.5, color: "var(--ink-3)", marginTop: 2 }}>No te preocupes por el nombre de las columnas. Te ayudamos a mapearlas en el paso 2.</div>
                </div>
              </div>
            </div>

            <div style={{ marginTop: 20 }}>
              <div style={{ fontWeight: 600, marginBottom: 8 }}>Lo que haremos al importar:</div>
              <ul style={{ margin: 0, paddingLeft: 18, color: "var(--ink-2)", fontSize: 13.5, lineHeight: 1.8 }}>
                <li>Crear las cuentas nuevas como <b>Invitadas</b>, listas para SSO.</li>
                <li>Si un email ya existe, <b>actualizar</b> los datos (no se duplica).</li>
                <li>Provisionar Google Workspace, Slack, Okta, HubSpot y Aviva Flat según el puesto.</li>
                <li>Registrar cada cambio en el log de auditoría.</li>
              </ul>
            </div>
          </React.Fragment>
        )}

        {step === 1 && (
          <React.Fragment>
            <div className="row" style={{ marginBottom: 12, gap: 8 }}>
              <div className="badge active" style={{ padding: "4px 10px" }}>
                {Ic.check} {file?.name} · {parsedRows.length} filas detectadas
              </div>
              <button className="btn sm ghost" onClick={() => { setFile(null); setParsedRows([]); setStep(0); }}>Cambiar archivo</button>
              <span style={{ flex: 1 }}/>
              <div style={{ fontSize: 12, color: "var(--ink-3)" }}>
                {Object.keys(mapping).length} de {TARGETS.length} columnas mapeadas
              </div>
            </div>
            <div style={{ background: "var(--mint-50)", padding: 10, borderRadius: 8, fontSize: 12.5, color: "var(--green-700)", marginBottom: 14 }}>
              {Ic.check} Detectamos automáticamente algunas columnas. Revisa y ajusta los mapeos antes de continuar.
            </div>

            <div className="map-table">
              <div className="map-header">
                <div>Campo en Aviva HR</div>
                <div></div>
                <div>Columna en tu archivo</div>
                <div>Muestra</div>
              </div>
              {TARGETS.map(t => {
                const sel = mapping[t.id];
                const sample = sel != null ? (parsedRows[0]?.[sel] || parsedRows[1]?.[sel] || "—") : "—";
                return (
                  <div key={t.id} className="map-row">
                    <div>
                      <div style={{ fontWeight: 600 }}>{t.label}</div>
                      {t.required && <div style={{ fontSize: 11, color: "var(--danger-fg)", fontWeight: 600 }}>obligatorio</div>}
                    </div>
                    <div style={{ color: "var(--ink-4)" }}>{Ic.arrowR}</div>
                    <div>
                      <select className="map-select" value={sel ?? ""} onChange={e => setMapping({ ...mapping, [t.id]: e.target.value === "" ? undefined : parseInt(e.target.value) })}>
                        <option value="">— Ignorar —</option>
                        {parsedHeaders.map((h, i) => <option key={i} value={i}>{h || "Columna " + (i + 1)}</option>)}
                      </select>
                    </div>
                    <div style={{ fontSize: 12, color: "var(--ink-3)", fontStyle: sel == null ? "italic" : "normal", maxWidth: 180, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{sample}</div>
                  </div>
                );
              })}
            </div>
          </React.Fragment>
        )}

        {step === 2 && (
          <React.Fragment>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12, marginBottom: 14 }}>
              <SummaryStat label="Nuevos" value={validation.ok} color="var(--green-500)" desc="se crearán como invitados"/>
              <SummaryStat label="A actualizar" value={validation.warn} color="#b67e00" desc="ya existen, se mergean"/>
              <SummaryStat label="Con errores" value={validation.err} color="var(--danger-fg)" desc="no se importarán"/>
            </div>

            <div style={{ fontWeight: 600, marginBottom: 6 }}>Vista previa (primeras 50 filas)</div>
            <div style={{ background: "var(--surface)", border: "1px solid var(--line)", borderRadius: 10, overflow: "auto", maxHeight: 380 }}>
              <table className="users preview">
                <thead>
                  <tr>
                    <th style={{ width: 30 }}></th>
                    <th>Núm.</th>
                    <th>Nombre</th>
                    <th>Correo</th>
                    <th>Puesto</th>
                    <th>Quiósco</th>
                    <th>Estado</th>
                    <th>Observaciones</th>
                  </tr>
                </thead>
                <tbody>
                  {validation.rows.map((r, i) => (
                    <tr key={i} style={{ background: r.sev === "err" ? "rgba(168, 32, 13, 0.06)" : r.sev === "warn" ? "rgba(245, 226, 181, 0.18)" : undefined }}>
                      <td>
                        {r.sev === "ok" && <span style={{ color: "var(--green-500)" }}>●</span>}
                        {r.sev === "warn" && <span style={{ color: "#b67e00" }}>●</span>}
                        {r.sev === "err" && <span style={{ color: "var(--danger-fg)" }}>●</span>}
                      </td>
                      <td style={{ fontFamily: "var(--mono)", fontSize: 11 }}>{r.mapped.numColaborador || "—"}</td>
                      <td style={{ fontWeight: 600 }}>{r.mapped.fullName || "—"}</td>
                      <td className="muted" style={{ fontSize: 12 }}>{r.mapped.email || "—"}</td>
                      <td style={{ fontSize: 12 }}>{r.mapped.role || "—"}</td>
                      <td style={{ fontSize: 12 }}>{r.mapped.quiosco || "—"}</td>
                      <td style={{ fontSize: 12 }}>{r.mapped.estado || "—"}</td>
                      <td>
                        {r.issues.length === 0 ? <span style={{ color: "var(--green-600)", fontSize: 11 }}>OK</span>
                          : r.issues.map((iss, j) => (
                            <div key={j} style={{ fontSize: 11, color: iss.kind === "err" ? "var(--danger-fg)" : "#b67e00" }}>{iss.msg}</div>
                          ))}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {validation.total > 50 && (
              <div style={{ fontSize: 12, color: "var(--ink-3)", marginTop: 8, textAlign: "center" }}>
                + {validation.total - 50} filas más se procesarán al confirmar
              </div>
            )}
          </React.Fragment>
        )}

        {step === 3 && (
          <div style={{ textAlign: "center", padding: "40px 20px" }}>
            <div style={{
              width: 64, height: 64, borderRadius: 999,
              background: "var(--mint-100)", color: "var(--green-700)",
              display: "grid", placeItems: "center", margin: "0 auto 16px"
            }}>
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m5 12 5 5L20 7"/></svg>
            </div>
            <h2 style={{ fontFamily: "var(--serif)", fontWeight: 500, fontSize: 26, margin: "0 0 6px" }}>Importación completada</h2>
            <div style={{ color: "var(--ink-3)", marginBottom: 20 }}>
              {validation.ok} colaboradores nuevos creados · {validation.warn} actualizados · {validation.err} con errores
            </div>
            <div className="row" style={{ justifyContent: "center", gap: 8 }}>
              <button className="btn" onClick={onClose}>Cerrar</button>
              <button className="btn primary" onClick={onClose}>Ver directorio</button>
            </div>
          </div>
        )}
      </div>

      {step < 3 && (
        <div style={{ padding: 14, borderTop: "1px solid var(--line)", display: "flex", gap: 8, alignItems: "center" }}>
          {step > 0 && <button className="btn" onClick={() => setStep(step - 1)}>Atrás</button>}
          <span style={{ flex: 1, fontSize: 12, color: "var(--ink-3)" }}>
            {step === 0 && "Sube un archivo para continuar"}
            {step === 1 && `${Object.keys(mapping).filter(k => mapping[k] != null).length} columnas mapeadas`}
            {step === 2 && `${validation.ok + validation.warn} de ${validation.total} filas se importarán`}
          </span>
          <button className="btn ghost" onClick={onClose}>Cancelar</button>
          {step === 0 && file && <button className="btn primary" onClick={() => setStep(1)}>Continuar {Ic.chevR}</button>}
          {step === 1 && (
            <button className="btn primary" disabled={!TARGETS.filter(t => t.required).every(t => mapping[t.id] != null)} onClick={() => setStep(2)}>
              Revisar {Ic.chevR}
            </button>
          )}
          {step === 2 && <button className="btn accent" onClick={doImport}>{Ic.check} Confirmar e importar</button>}
        </div>
      )}
    </div>
  );
}

function SummaryStat({ label, value, color, desc }) {
  return (
    <div style={{ background: "var(--surface)", border: "1px solid var(--line)", borderRadius: 10, padding: 14 }}>
      <div style={{ fontSize: 11.5, color: "var(--ink-3)", textTransform: "uppercase", letterSpacing: 0.05, fontWeight: 600 }}>{label}</div>
      <div style={{ fontFamily: "var(--serif)", fontSize: 30, color, fontVariantNumeric: "tabular-nums" }}>{value}</div>
      <div style={{ fontSize: 11.5, color: "var(--ink-3)" }}>{desc}</div>
    </div>
  );
}

// =========================================================================
// TICKET TYPE CHOOSER
// =========================================================================
function NewTicketChooser({ onClose, onChoose }) {
  const options = [
    { id: "offboard", title: "Baja de persona", desc: "Iniciar offboarding con aprobaciones encadenadas y tareas automáticas.", icon: Ic.arrowR, color: "var(--danger-fg)", bg: "var(--danger-bg)" },
    { id: "suspend",  title: "Suspensión",      desc: "Bloquear acceso temporal (vacaciones largas, investigación).", icon: Ic.warn, color: "#8a5a00", bg: "#fff3d6" },
    { id: "transfer", title: "Cambio de hub o quiósco", desc: "Reubicar a un colaborador y reasignar accesos.", icon: Ic.refresh, color: "#1b3f8a", bg: "var(--info-bg)" },
    { id: "access",   title: "Solicitud de acceso",     desc: "Pedir acceso a una app o repositorio fuera de plantilla.", icon: Ic.shield, color: "var(--green-700)", bg: "var(--mint-100)" },
    { id: "import",   title: "Importar en lote",         desc: "Subir un CSV para crear varios colaboradores a la vez.", icon: Ic.upload, color: "#6b1b8a", bg: "#f5d6ff" },
  ];

  return (
    <div className="panel" style={{ width: "min(720px, 96vw)" }}>
      <div className="row" style={{ padding: "14px 20px", borderBottom: "1px solid var(--line)" }}>
        <div className="col">
          <div style={{ fontWeight: 600, fontSize: 15 }}>Nuevo ticket</div>
          <div style={{ fontSize: 12, color: "var(--ink-3)" }}>Elige el tipo de gestión que quieres iniciar.</div>
        </div>
        <span style={{ flex: 1 }}/>
        <button className="iconbtn" onClick={onClose}>{Ic.close}</button>
      </div>
      <div style={{ padding: 20, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        {options.map(o => (
          <button key={o.id} className="ticket-option" onClick={() => onChoose(o.id)}>
            <div className="ic" style={{ background: o.bg, color: o.color }}>{o.icon}</div>
            <div className="col" style={{ alignItems: "flex-start", flex: 1, textAlign: "left" }}>
              <div style={{ fontWeight: 600, fontSize: 13.5 }}>{o.title}</div>
              <div style={{ fontSize: 12, color: "var(--ink-3)", marginTop: 2 }}>{o.desc}</div>
            </div>
            <div style={{ color: "var(--ink-4)" }}>{Ic.chevR}</div>
          </button>
        ))}
      </div>
    </div>
  );
}

Object.assign(window, { ImportWizard, NewTicketChooser });
