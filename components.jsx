// Aviva HR — shared atoms & icons
const { useState, useMemo, useEffect, useRef } = React;

// ----- Icon set (minimal stroke icons) -----
const Ic = {
  search:    <svg className="ic" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="7" cy="7" r="4.5"/><path d="m13 13-2.5-2.5" strokeLinecap="round"/></svg>,
  plus:      <svg className="ic" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"><path d="M8 3v10M3 8h10"/></svg>,
  filter:    <svg className="ic" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M2 3h12l-4.5 6V14L7 12.5V9L2 3Z" strokeLinejoin="round"/></svg>,
  download:  <svg className="ic" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="M8 2v8m0 0 3-3M8 10 5 7M2 13h12"/></svg>,
  upload:    <svg className="ic" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="M8 13V5m0 0L5 8m3-3 3 3M2 14h12"/></svg>,
  more:      <svg className="ic" viewBox="0 0 16 16" fill="currentColor"><circle cx="3.5" cy="8" r="1.2"/><circle cx="8" cy="8" r="1.2"/><circle cx="12.5" cy="8" r="1.2"/></svg>,
  close:     <svg className="ic" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"><path d="m4 4 8 8M12 4l-8 8"/></svg>,
  chevR:     <svg className="ic" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="m6 4 4 4-4 4"/></svg>,
  chevD:     <svg className="ic" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="m4 6 4 4 4-4"/></svg>,
  check:     <svg className="ic" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m3 8 3.5 3.5L13 5"/></svg>,
  arrowR:    <svg className="ic" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="M3 8h10m0 0-3-3m3 3-3 3"/></svg>,
  bell:      <svg className="ic" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M4 7a4 4 0 0 1 8 0v3l1 2H3l1-2V7Z" strokeLinejoin="round"/><path d="M6.5 13a1.5 1.5 0 0 0 3 0" strokeLinecap="round"/></svg>,
  help:      <svg className="ic" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="8" cy="8" r="6"/><path d="M6.5 6.5c0-1 .7-1.7 1.5-1.7s1.5.5 1.5 1.3c0 1.3-1.5 1.3-1.5 2.5M8 11.2v.1" strokeLinecap="round"/></svg>,
  users:     <svg className="ic" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="6" cy="6" r="2.5"/><path d="M2 14c.5-2 2-3 4-3s3.5 1 4 3"/><circle cx="11" cy="5" r="1.8"/><path d="M11 8.5c1.5 0 3 .8 3.5 2.5" strokeLinecap="round"/></svg>,
  ticket:    <svg className="ic" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"><path d="M2 5a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v1.2a1.2 1.2 0 0 0 0 2.4V10a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V8.6a1.2 1.2 0 0 0 0-2.4V5Z"/><path d="M10 5v6" strokeDasharray="1 1.5"/></svg>,
  plug:      <svg className="ic" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="M6 2v3M10 2v3M4 5h8v2a4 4 0 0 1-4 4 4 4 0 0 1-4-4V5Z" strokeLinejoin="round"/><path d="M8 11v3"/></svg>,
  history:   <svg className="ic" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="M3 8a5 5 0 1 1 1.6 3.6"/><path d="M3 4v3h3"/><path d="M8 5v3l2 1.5"/></svg>,
  cog:       <svg className="ic" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="8" cy="8" r="2"/><path d="M8 1.5v1.7M8 12.8v1.7M14.5 8h-1.7M3.2 8H1.5M12.6 3.4l-1.2 1.2M4.6 11.4l-1.2 1.2M12.6 12.6l-1.2-1.2M4.6 4.6 3.4 3.4" strokeLinecap="round"/></svg>,
  map:       <svg className="ic" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"><path d="M2 4l4-2 4 2 4-2v10l-4 2-4-2-4 2V4Z"/><path d="M6 2v10M10 4v10"/></svg>,
  home:      <svg className="ic" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"><path d="m2 8 6-5 6 5v6H10v-4H6v4H2V8Z"/></svg>,
  table:     <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4"><rect x="2" y="3" width="12" height="10" rx="1.5"/><path d="M2 7h12M6 7v6"/></svg>,
  grid:      <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4"><rect x="2" y="2" width="5" height="5" rx="1"/><rect x="9" y="2" width="5" height="5" rx="1"/><rect x="2" y="9" width="5" height="5" rx="1"/><rect x="9" y="9" width="5" height="5" rx="1"/></svg>,
  shield:    <svg className="ic" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"><path d="M8 2 3 4v4c0 3 2.2 5.4 5 6 2.8-.6 5-3 5-6V4L8 2Z"/></svg>,
  user:      <svg className="ic" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="8" cy="6" r="2.5"/><path d="M3 14c.5-2.5 2.5-4 5-4s4.5 1.5 5 4"/></svg>,
  laptop:    <svg className="ic" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4"><rect x="2.5" y="3.5" width="11" height="7" rx="1"/><path d="M1.5 12.5h13"/></svg>,
  phoneIc:   <svg className="ic" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4"><rect x="5" y="2" width="6" height="12" rx="1.2"/><path d="M7.5 12.5h1"/></svg>,
  warn:      <svg className="ic" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round"><path d="M8 2.5 14 13H2L8 2.5Z"/><path d="M8 6.5v3M8 11.5v.1" strokeLinecap="round"/></svg>,
  link:      <svg className="ic" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="M7 9.5 6 10.5a2.2 2.2 0 0 1-3-3l2-2a2.2 2.2 0 0 1 3 0"/><path d="m9 6.5 1-1a2.2 2.2 0 0 1 3 3l-2 2a2.2 2.2 0 0 1-3 0"/></svg>,
  refresh:   <svg className="ic" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M13 4v3h-3"/><path d="M3 12v-3h3"/><path d="M13 7A5 5 0 0 0 4 6"/><path d="M3 9a5 5 0 0 0 9 1"/></svg>,
  edit:      <svg className="ic" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"><path d="m2 14 1-3 7.5-7.5 2 2L5 13l-3 1Z"/><path d="m9 4 2 2"/></svg>,
  shoppingBag: <svg className="ic" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"><path d="M3 5h10l-1 9H4L3 5Z"/><path d="M5.5 5V4a2.5 2.5 0 0 1 5 0v1" strokeLinecap="round"/></svg>,
  userPlus:  <svg className="ic" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="6" cy="6" r="2.5"/><path d="M2 14c.5-2.5 2.5-4 4-4M11 5v6M8 8h6" strokeLinecap="round"/></svg>,
  folder:    <svg className="ic" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"><path d="M2 5a1 1 0 0 1 1-1h3l1.5 1.5H13a1 1 0 0 1 1 1V12a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V5Z"/></svg>,
  fileSign:  <svg className="ic" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"><path d="M9 2H4a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1V6L9 2Z"/><path d="M9 2v4h4M5 11l2-2 1.5 1.5" strokeLinecap="round"/></svg>,
  file:      <svg className="ic" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"><path d="M9 2H4a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1V6L9 2Z"/><path d="M9 2v4h4M5 9h6M5 11.5h4" strokeLinecap="round"/></svg>,
  mail:      <svg className="ic" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="2" y="3.5" width="12" height="9" rx="1"/><path d="m2.5 4.5 5.5 4 5.5-4" strokeLinejoin="round"/></svg>,
  clipboard: <svg className="ic" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"><rect x="3" y="3" width="10" height="11" rx="1"/><rect x="5.5" y="2" width="5" height="2.5" rx="0.5"/><path d="M6 8h4M6 10.5h4" strokeLinecap="round"/></svg>,
};

// ----- Avatar -----
function Avatar({ user, size }) {
  const cls = "av " + (size || "") + " " + (user.avatar?.color || "c1");
  return <div className={cls}>{user.avatar?.initials || (user.first?.[0] || "?") + (user.last?.[0] || "")}</div>;
}

// ----- Badge / status -----
const STATUS_LABEL = {
  active: "Activo",
  invited: "Invitado",
  suspended: "Suspendido",
  offboarding: "En baja",
  archived: "Archivado",
};
function StatusBadge({ status }) {
  return <span className={`badge ${status}`}><span className="dot"/>{STATUS_LABEL[status]}</span>;
}

// ----- Sparkline -----
function Sparkline({ data, color }) {
  const w = 80, h = 28, pad = 2;
  const min = Math.min(...data), max = Math.max(...data);
  const range = max - min || 1;
  const pts = data.map((v, i) => {
    const x = pad + (i / (data.length - 1)) * (w - pad * 2);
    const y = h - pad - ((v - min) / range) * (h - pad * 2);
    return [x, y];
  });
  const line = pts.map((p, i) => (i === 0 ? "M" : "L") + p[0].toFixed(1) + "," + p[1].toFixed(1)).join(" ");
  const area = line + ` L${w-pad},${h-pad} L${pad},${h-pad} Z`;
  return (
    <svg className="spark" viewBox={`0 0 ${w} ${h}`}>
      <path className="area" d={area} style={{ fill: color || "var(--mint-100)" }}/>
      <path className="line" d={line} style={{ stroke: color || "var(--green-500)" }}/>
    </svg>
  );
}

// ----- App chip (small icon for an integration) -----
function AppChip({ id, size }) {
  const data = window.AvivaData.integrationsAll.find(x => x.id === id);
  if (!data) return null;
  const s = size || 22;
  return (
    <div
      className="app-chip"
      title={data.name}
      style={{
        width: s, height: s,
        background: data.color + "18",
        borderColor: data.color + "33",
        color: data.color,
      }}
    >{data.short}</div>
  );
}

// ----- Searchable dropdown trigger (purely visual) -----
function Pill({ children, onClick, active }) {
  return (
    <button className="btn sm ghost" onClick={onClick} style={{ color: active ? "var(--green-700)" : undefined }}>
      {children}
    </button>
  );
}

// ----- Scrim + drawer wrapper -----
function Drawer({ open, onClose, children }) {
  useEffect(() => {
    function k(e) { if (e.key === "Escape") onClose(); }
    if (open) window.addEventListener("keydown", k);
    return () => window.removeEventListener("keydown", k);
  }, [open, onClose]);
  if (!open) return null;
  return (
    <React.Fragment>
      <div className="scrim" onClick={onClose}/>
      <aside className="drawer" role="dialog" aria-modal="true">{children}</aside>
    </React.Fragment>
  );
}

function Modal({ open, onClose, children }) {
  useEffect(() => {
    function k(e) { if (e.key === "Escape") onClose(); }
    if (open) window.addEventListener("keydown", k);
    return () => window.removeEventListener("keydown", k);
  }, [open, onClose]);
  if (!open) return null;
  return (
    <React.Fragment>
      <div className="scrim" onClick={onClose}/>
      <div className="modal">{children}</div>
    </React.Fragment>
  );
}

// Make available globally
Object.assign(window, { Ic, Avatar, StatusBadge, Sparkline, AppChip, Pill, Drawer, Modal });
