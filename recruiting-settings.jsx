// Aviva HR — Recruiting settings: Gmail, Reminders, Link Duration
const { useState: useSetR } = React;

function SettingsGmail() {
  const [s, setS] = useSetR(window.RecruitingData.settings.gmail);
  return (
    <div className="settings-section">
      <div className="head" style={{ display: "flex", justifyContent: "space-between" }}>
        <div>
          <h3>Conexión Gmail</h3>
          <div className="sub">Aviva HR usa Gmail API para enviar invitaciones, recordatorios y ofertas a los candidatos.</div>
        </div>
        <span className={"badge " + (s.connected ? "active" : "archived")}>
          <span className="dot"/>{s.connected ? "Conectada" : "Sin conectar"}
        </span>
      </div>
      <div className="body">
        {s.connected ? (
          <div>
            <div className="conn-card">
              <div className="conn-card-ic" style={{ background: "#ea433520", color: "#ea4335" }}>{Ic.mail}</div>
              <div style={{ flex: 1 }}>
                <div className="conn-card-name">{s.email}</div>
                <div className="conn-card-sub">Conectado desde {s.connectedAt} · scopes: {s.scopes.join(", ")}</div>
              </div>
              <button className="btn sm">Re-autorizar</button>
              <button className="btn sm danger" onClick={() => setS({ ...s, connected: false })}>Desconectar</button>
            </div>
            <div className="row" style={{ marginTop: 14, padding: 12, background: "var(--mint-50)", borderRadius: 8, fontSize: 12.5, color: "var(--green-700)" }}>
              {Ic.shield} Todos los correos se envían en nombre de <b>{s.email}</b>. Pruébalo enviando un correo de prueba desde la pestaña de plantillas.
            </div>
            <div className="conn-stats">
              <div><span className="k">Correos enviados (mes)</span><b>1,287</b></div>
              <div><span className="k">Tasa de entrega</span><b style={{ color: "var(--green-700)" }}>99.4%</b></div>
              <div><span className="k">Bounces</span><b>8</b></div>
            </div>
          </div>
        ) : (
          <div className="empty" style={{ padding: 30, textAlign: "center" }}>
            <div style={{ fontSize: 13.5, color: "var(--ink-3)", marginBottom: 14 }}>Conecta una cuenta de Google Workspace para enviar correos automáticos.</div>
            <button className="btn accent" onClick={() => setS({ ...s, connected: true, email: "reclutamiento@avivacredito.com", connectedAt: "hoy" })}>{Ic.link} Conectar con Google</button>
          </div>
        )}
      </div>
    </div>
  );
}

function SettingsReminders() {
  const [s, setS] = useSetR(window.RecruitingData.settings.reminders);
  return (
    <div className="settings-section">
      <div className="head">
        <h3>Recordatorios automáticos</h3>
        <div className="sub">Aviva enviará recordatorios al candidato hasta que complete sus documentos o se alcance el máximo.</div>
      </div>
      <div className="body">
        <div className="setting-row">
          <div>
            <div className="setting-name">Habilitados</div>
            <div className="setting-desc">Si está desactivado, no se envían correos automáticos a candidatos.</div>
          </div>
          <label className="switch">
            <input type="checkbox" checked={s.enabled} onChange={() => setS({ ...s, enabled: !s.enabled })}/>
            <span className="track"/><span className="thumb"/>
          </label>
        </div>
        <div className="setting-row">
          <div>
            <div className="setting-name">Intervalo entre recordatorios</div>
            <div className="setting-desc">Tiempo mínimo entre envíos automáticos a un candidato.</div>
          </div>
          <div className="row" style={{ gap: 6 }}>
            <input type="number" value={s.intervalHours} onChange={e => setS({ ...s, intervalHours: +e.target.value })} style={{ width: 70 }}/>
            <span style={{ fontSize: 13, color: "var(--ink-3)" }}>horas</span>
          </div>
        </div>
        <div className="setting-row">
          <div>
            <div className="setting-name">Máximo de recordatorios</div>
            <div className="setting-desc">Tras llegar al máximo, el candidato pasará a revisión manual.</div>
          </div>
          <input type="number" value={s.maxReminders} onChange={e => setS({ ...s, maxReminders: +e.target.value })} style={{ width: 70 }}/>
        </div>
      </div>
    </div>
  );
}

function SettingsLinkDuration() {
  const [s, setS] = useSetR(window.RecruitingData.settings.linkDuration);
  return (
    <div className="settings-section">
      <div className="head">
        <h3>Duración de enlaces personales</h3>
        <div className="sub">Tiempo de validez de los enlaces de formulario, carta oferta y contrato. Tras vencer, requieren regenerarse.</div>
      </div>
      <div className="body">
        <div className="setting-row">
          <div>
            <div className="setting-name">Formulario de documentos</div>
            <div className="setting-desc">Enlace para subir el expediente.</div>
          </div>
          <div className="row" style={{ gap: 6 }}>
            <input type="number" value={s.formDays} onChange={e => setS({ ...s, formDays: +e.target.value })} style={{ width: 70 }}/>
            <span style={{ fontSize: 13, color: "var(--ink-3)" }}>días</span>
          </div>
        </div>
        <div className="setting-row">
          <div>
            <div className="setting-name">Carta oferta</div>
            <div className="setting-desc">Enlace para firmar la oferta laboral.</div>
          </div>
          <div className="row" style={{ gap: 6 }}>
            <input type="number" value={s.offerDays} onChange={e => setS({ ...s, offerDays: +e.target.value })} style={{ width: 70 }}/>
            <span style={{ fontSize: 13, color: "var(--ink-3)" }}>días</span>
          </div>
        </div>
        <div className="setting-row">
          <div>
            <div className="setting-name">Contrato</div>
            <div className="setting-desc">Enlace para firmar el contrato individual de trabajo.</div>
          </div>
          <div className="row" style={{ gap: 6 }}>
            <input type="number" value={s.contractDays} onChange={e => setS({ ...s, contractDays: +e.target.value })} style={{ width: 70 }}/>
            <span style={{ fontSize: 13, color: "var(--ink-3)" }}>días</span>
          </div>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { SettingsGmail, SettingsReminders, SettingsLinkDuration });
