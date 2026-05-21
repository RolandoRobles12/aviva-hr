// Aviva HR — reusable people & location pickers/chips
// Loaded after components.jsx and data.jsx; expose to window.

const { useState: useSP, useMemo: useMP, useRef: useRP, useEffect: useEP } = React;

// =========================================================================
// Helpers
// =========================================================================
function _norm(s) {
  return (s||"").toString().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();
}
function _initials(name) {
  const parts = (name||"").trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return "?";
  return ((parts[0][0] || "") + (parts.length > 1 ? parts[parts.length-1][0] : "")).toUpperCase();
}
function _userByName(name) {
  if (!name) return null;
  const t = _norm(name);
  return window.AvivaData.users.find(u => _norm(u.fullName) === t)
      || window.AvivaData.users.find(u => _norm(u.fullName).startsWith(t.split(" ")[0]) && _norm(u.fullName).includes(_norm(name.split(" ").slice(-1)[0])));
}
function _resolvePerson(input) {
  if (!input) return null;
  if (typeof input === "object") return input;
  // input is an id or a name
  const byId = window.AvivaData.users.find(u => u.id === input);
  if (byId) return byId;
  const byName = _userByName(input);
  if (byName) return byName;
  // Synthetic non-user person (kiosk manager not in users dataset)
  return {
    _synthetic: true,
    id: "_syn-" + _norm(input),
    fullName: input,
    role: null,
    avatar: { initials: _initials(input), color: "c" + ((_norm(input).charCodeAt(0) % 8) + 1) },
  };
}

// =========================================================================
// PersonChip — avatar + name (+ optional role) — clickable
// =========================================================================
function PersonChip({ person, name, id, role, size, onClick, compact, muted }) {
  const p = _resolvePerson(person || id || name);
  if (!p) {
    return <span className="muted" style={{ fontSize: 12.5 }}>— por asignar</span>;
  }
  const subline = role || p.role || (p._synthetic ? "Kiosk Manager" : null);
  return (
    <button type="button"
      className={"person-chip " + (compact ? "compact " : "") + (muted ? "muted " : "")}
      onClick={onClick}
      title={p.fullName + (subline ? " · " + subline : "")}>
      <div className={"av " + (size === "lg" ? "" : "") + " " + (p.avatar?.color || "c1")} style={{ width: compact ? 20 : 24, height: compact ? 20 : 24, fontSize: compact ? 9 : 10 }}>
        {p.avatar?.initials || _initials(p.fullName)}
      </div>
      <span className="person-chip-text">
        <span className="person-chip-name">{p.fullName}</span>
        {!compact && subline && <span className="person-chip-role">{subline}</span>}
      </span>
      {p._synthetic && !compact && <span className="person-chip-flag" title="Persona registrada pero sin perfil de Aviva HR">!</span>}
    </button>
  );
}

// =========================================================================
// PersonPicker — searchable popover dropdown
// =========================================================================
function PersonPicker({ value, onChange, placeholder, roleFilter, allowEmpty, label, hint, allowSynthetic }) {
  const [open, setOpen] = useSP(false);
  const [q, setQ] = useSP("");
  const ref = useRP(null);
  const inputRef = useRP(null);

  useEP(() => {
    function click(e) { if (ref.current && !ref.current.contains(e.target)) setOpen(false); }
    function key(e) { if (e.key === "Escape") setOpen(false); }
    if (open) {
      document.addEventListener("mousedown", click);
      document.addEventListener("keydown", key);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
    return () => {
      document.removeEventListener("mousedown", click);
      document.removeEventListener("keydown", key);
    };
  }, [open]);

  const selected = useMP(() => _resolvePerson(value), [value]);

  const options = useMP(() => {
    let users = window.AvivaData.users;
    if (roleFilter === "manager") {
      users = users.filter(u => /Manager|CEO|Lead|Especialista/i.test(u.role));
    }
    if (q) {
      const t = _norm(q);
      users = users.filter(u => _norm(u.fullName).includes(t) || _norm(u.email).includes(t) || _norm(u.role).includes(t));
    }
    return users.slice(0, 30);
  }, [q, roleFilter]);

  return (
    <div className="picker" ref={ref}>
      {label && <label className="picker-label">{label}</label>}
      <button type="button" className="picker-trigger" onClick={() => setOpen(o => !o)}>
        {selected ? (
          <span className="row" style={{ gap: 8, alignItems: "center" }}>
            <div className={"av " + (selected.avatar?.color || "c1")} style={{ width: 22, height: 22, fontSize: 9 }}>
              {selected.avatar?.initials || _initials(selected.fullName)}
            </div>
            <span className="col" style={{ alignItems: "flex-start", lineHeight: 1.2 }}>
              <span style={{ fontWeight: 600, fontSize: 13 }}>{selected.fullName}</span>
              {selected.role && <span style={{ fontSize: 11, color: "var(--ink-3)" }}>{selected.role}</span>}
            </span>
          </span>
        ) : (
          <span style={{ color: "var(--ink-4)", fontSize: 13 }}>{placeholder || "Buscar persona…"}</span>
        )}
        <span className="picker-chev">{Ic.chevD}</span>
      </button>
      {hint && <span className="hint">{hint}</span>}
      {open && (
        <div className="picker-pop">
          <div className="picker-search">
            {Ic.search}
            <input ref={inputRef} value={q} onChange={e => setQ(e.target.value)} placeholder="Buscar por nombre, correo o rol…"/>
          </div>
          <div className="picker-list">
            {allowEmpty && (
              <button type="button" className="picker-option empty" onClick={() => { onChange(null); setOpen(false); }}>
                <div className="av" style={{ width: 22, height: 22, background: "var(--surface-2)", color: "var(--ink-3)", fontSize: 11 }}>—</div>
                <span style={{ fontSize: 12.5, color: "var(--ink-3)" }}>Sin asignar</span>
              </button>
            )}
            {options.map(u => {
              const sel = selected && selected.id === u.id;
              return (
                <button type="button" key={u.id}
                  className={"picker-option " + (sel ? "selected" : "")}
                  onClick={() => { onChange(u.id); setOpen(false); }}>
                  <Avatar user={u}/>
                  <span style={{ flex: 1, minWidth: 0 }}>
                    <span className="picker-opt-name">{u.fullName}</span>
                    <span className="picker-opt-sub">{u.role}{u.quiosco ? " · " + u.quiosco : ""}</span>
                  </span>
                  {sel && <span style={{ color: "var(--green-700)" }}>{Ic.check}</span>}
                </button>
              );
            })}
            {options.length === 0 && (
              <div className="picker-empty">Sin coincidencias para "{q}"</div>
            )}
            {allowSynthetic && q && options.length === 0 && (
              <button type="button" className="picker-option synthetic" onClick={() => { onChange(q); setOpen(false); }}>
                <div className="av c7" style={{ width: 22, height: 22, fontSize: 9 }}>+</div>
                <span style={{ fontSize: 12.5 }}>Usar "<b>{q}</b>" como persona externa</span>
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// =========================================================================
// LocationChip — category badge + name + ciudad
// =========================================================================
function LocationChip({ location, locationId, name, onClick, compact }) {
  let l = location;
  if (!l && locationId) {
    l = window.AvivaData.locations.find(x => x.id === locationId);
  }
  if (!l && name) {
    const t = _norm(name);
    l = window.AvivaData.locations.find(x => _norm(x.ubicacion) === t || _norm(x.ciudad) === t);
    if (!l) {
      return <span className="location-chip synthetic" title={name}>
        <span className="cat-chip" style={{ background: "var(--surface-2)", color: "var(--ink-3)" }}>?</span>
        <span className="location-chip-text">
          <span className="location-chip-name">{name}</span>
        </span>
      </span>;
    }
  }
  if (!l) return <span className="muted" style={{ fontSize: 12.5 }}>— sin locación</span>;

  return (
    <button type="button"
      className={"location-chip " + (compact ? "compact" : "")}
      onClick={onClick}
      title={(l.ubicacion || l.ciudad) + " · " + l.ciudad + ", " + l.estado}>
      <span className="cat-chip" style={{ background: l.catBg, color: l.catColor, border: "1px solid " + l.catColor + "33", width: compact ? 20 : 22, height: compact ? 20 : 22, fontSize: compact ? 9 : 10 }}>
        {l.catShort}
      </span>
      <span className="location-chip-text">
        <span className="location-chip-name">{l.ubicacion || (l.catLabel + " " + l.ciudad)}</span>
        {!compact && <span className="location-chip-sub">{l.ciudad}, {l.estado}</span>}
      </span>
    </button>
  );
}

// =========================================================================
// LocationPicker — searchable popover dropdown
// =========================================================================
function LocationPicker({ value, onChange, placeholder, categoryFilter, allowEmpty, label, hint }) {
  const [open, setOpen] = useSP(false);
  const [q, setQ] = useSP("");
  const [catTab, setCatTab] = useSP("all");
  const ref = useRP(null);
  const inputRef = useRP(null);

  useEP(() => {
    function click(e) { if (ref.current && !ref.current.contains(e.target)) setOpen(false); }
    function key(e) { if (e.key === "Escape") setOpen(false); }
    if (open) {
      document.addEventListener("mousedown", click);
      document.addEventListener("keydown", key);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
    return () => {
      document.removeEventListener("mousedown", click);
      document.removeEventListener("keydown", key);
    };
  }, [open]);

  const selected = useMP(() => {
    if (!value) return null;
    return window.AvivaData.locations.find(x => x.id === value || x.code === value);
  }, [value]);

  const cats = Object.entries(window.AvivaData.locationCategories);
  const options = useMP(() => {
    let locs = window.AvivaData.locations;
    if (catTab !== "all") locs = locs.filter(l => l.categoria === catTab);
    else if (categoryFilter) locs = locs.filter(l => l.categoria === categoryFilter);
    if (q) {
      const t = _norm(q);
      locs = locs.filter(l => _norm(l.ubicacion).includes(t) || _norm(l.ciudad).includes(t) || _norm(l.code).includes(t) || _norm(l.direccion || "").includes(t));
    }
    return locs.slice(0, 40);
  }, [q, catTab, categoryFilter]);

  return (
    <div className="picker" ref={ref}>
      {label && <label className="picker-label">{label}</label>}
      <button type="button" className="picker-trigger" onClick={() => setOpen(o => !o)}>
        {selected ? (
          <span className="row" style={{ gap: 8, alignItems: "center", minWidth: 0 }}>
            <span className="cat-chip" style={{ background: selected.catBg, color: selected.catColor, border: "1px solid " + selected.catColor + "33", flexShrink: 0 }}>
              {selected.catShort}
            </span>
            <span className="col" style={{ alignItems: "flex-start", lineHeight: 1.2, minWidth: 0 }}>
              <span style={{ fontWeight: 600, fontSize: 13, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {selected.ubicacion || (selected.catLabel + " " + selected.ciudad)}
              </span>
              <span style={{ fontSize: 11, color: "var(--ink-3)" }}>{selected.ciudad}, {selected.estado}</span>
            </span>
          </span>
        ) : (
          <span style={{ color: "var(--ink-4)", fontSize: 13 }}>{placeholder || "Buscar locación…"}</span>
        )}
        <span className="picker-chev">{Ic.chevD}</span>
      </button>
      {hint && <span className="hint">{hint}</span>}
      {open && (
        <div className="picker-pop wide">
          <div className="picker-search">
            {Ic.search}
            <input ref={inputRef} value={q} onChange={e => setQ(e.target.value)} placeholder="Buscar por nombre, ciudad o código…"/>
          </div>
          <div className="picker-cats">
            <button type="button" className={"picker-cat " + (catTab === "all" ? "active" : "")} onClick={() => setCatTab("all")}>Todas</button>
            {cats.map(([k, info]) => (
              <button type="button" key={k} className={"picker-cat " + (catTab === k ? "active" : "")} onClick={() => setCatTab(k)} title={info.label}>
                <span className="cat-chip" style={{ background: info.bg, color: info.color, border: "1px solid " + info.color + "33" }}>{info.short}</span>
              </button>
            ))}
          </div>
          <div className="picker-list">
            {allowEmpty && (
              <button type="button" className="picker-option empty" onClick={() => { onChange(null); setOpen(false); }}>
                <div className="cat-chip" style={{ background: "var(--surface-2)", color: "var(--ink-3)" }}>—</div>
                <span style={{ fontSize: 12.5, color: "var(--ink-3)" }}>Sin asignar</span>
              </button>
            )}
            {options.map(l => {
              const sel = selected && selected.id === l.id;
              return (
                <button type="button" key={l.id}
                  className={"picker-option " + (sel ? "selected" : "")}
                  onClick={() => { onChange(l.id); setOpen(false); }}>
                  <span className="cat-chip" style={{ background: l.catBg, color: l.catColor, border: "1px solid " + l.catColor + "33", flexShrink: 0 }}>{l.catShort}</span>
                  <span style={{ flex: 1, minWidth: 0 }}>
                    <span className="picker-opt-name">{l.ubicacion || (l.catLabel + " " + l.ciudad)}</span>
                    <span className="picker-opt-sub"><span style={{ fontFamily: "var(--mono)" }}>#{l.code}</span> · {l.ciudad}, {l.estado}</span>
                  </span>
                  {sel && <span style={{ color: "var(--green-700)" }}>{Ic.check}</span>}
                </button>
              );
            })}
            {options.length === 0 && (
              <div className="picker-empty">Sin locaciones para "{q}"</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

Object.assign(window, { PersonChip, PersonPicker, LocationChip, LocationPicker, _resolvePerson });
