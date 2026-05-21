// Aviva HR — Catálogo view: Productos + Puestos
const { useState: useStateC, useMemo: useMemoC, useEffect: useEffectC } = React;

// =========================================================================
// CATALOG VIEW
// =========================================================================
function CatalogView() {
  const [tab, setTab] = useStateC("products");
  const [products, setProducts] = useStateC(window.CatalogData.products);
  const [positions, setPositions] = useStateC(window.CatalogData.positions);
  const [editingProduct, setEditingProduct] = useStateC(null);
  const [editingPosition, setEditingPosition] = useStateC(null);
  const [editingCategoria, setEditingCategoria] = useStateC(null); // {product, cat?}

  // Sync back to global so other views see changes
  useEffectC(() => { window.CatalogData.products = products; }, [products]);
  useEffectC(() => { window.CatalogData.positions = positions; }, [positions]);

  function saveProduct(p) {
    setProducts(prev => {
      const exists = prev.find(x => x.id === p.id);
      if (exists) return prev.map(x => x.id === p.id ? p : x);
      return [...prev, { ...p, id: "p-" + Date.now(), categorias: p.categorias || [] }];
    });
    setEditingProduct(null);
  }
  function deleteProduct(id) {
    if (!confirm("¿Eliminar este producto y sus categorías?")) return;
    setProducts(prev => prev.filter(x => x.id !== id));
  }
  function saveCategoria(productId, cat) {
    setProducts(prev => prev.map(p => {
      if (p.id !== productId) return p;
      const exists = p.categorias.find(c => c.id === cat.id);
      const cats = exists ? p.categorias.map(c => c.id === cat.id ? cat : c) : [...p.categorias, { ...cat, id: cat.id || "c-" + Date.now() }];
      return { ...p, categorias: cats };
    }));
    setEditingCategoria(null);
  }
  function deleteCategoria(productId, catId) {
    if (!confirm("¿Eliminar esta categoría?")) return;
    setProducts(prev => prev.map(p => p.id === productId ? { ...p, categorias: p.categorias.filter(c => c.id !== catId) } : p));
  }
  function savePosition(pos) {
    setPositions(prev => {
      const exists = prev.find(x => x.id === pos.id);
      if (exists) return prev.map(x => x.id === pos.id ? pos : x);
      return [...prev, { ...pos, id: "pos-" + Date.now() }];
    });
    setEditingPosition(null);
  }
  function deletePosition(id) {
    if (!confirm("¿Eliminar este puesto?")) return;
    setPositions(prev => prev.filter(x => x.id !== id));
  }

  // Stats
  const totalCats = products.reduce((sum, p) => sum + p.categorias.length, 0);

  return (
    <div className="view-pad">
      <div className="view-head">
        <div>
          <h1>Catálogo</h1>
          <div className="sub">Productos, categorías y puestos que se usan en perfiles, directorio y locaciones.</div>
        </div>
        <div className="actions">
          {tab === "products" && <button className="btn accent" onClick={() => setEditingProduct({ name: "", tagline: "", color: "#16b877", bg: "#e7f8ef", categorias: [] })}>{Ic.plus} Nuevo producto</button>}
          {tab === "positions" && <button className="btn accent" onClick={() => setEditingPosition({ name: "", level: "Promotor", productId: null, area: "Kiosk Acquisitions" })}>{Ic.plus} Nuevo puesto</button>}
        </div>
      </div>

      <div className="stat-row">
        <div className="stat">
          <span className="accent-strip"/>
          <div className="label">Productos</div>
          <div className="value">{products.length}</div>
          <div className="foot"><span style={{ fontSize: 12, color: "var(--ink-3)" }}>Líneas comerciales activas</span></div>
        </div>
        <div className="stat">
          <span className="accent-strip"/>
          <div className="label">Categorías</div>
          <div className="value">{totalCats}</div>
          <div className="foot"><span style={{ fontSize: 12, color: "var(--ink-3)" }}>Canales dentro de productos</span></div>
        </div>
        <div className="stat">
          <span className="accent-strip"/>
          <div className="label">Puestos</div>
          <div className="value">{positions.length}</div>
          <div className="foot"><span style={{ fontSize: 12, color: "var(--ink-3)" }}>Aparecen en perfiles y directorio</span></div>
        </div>
        <div className="stat">
          <span className="accent-strip"/>
          <div className="label">Personas en operación</div>
          <div className="value">{window.AvivaData.users.filter(u => u.role.includes("Promotor") || u.role.includes("Kiosk Manager")).length}</div>
          <div className="foot"><span style={{ fontSize: 12, color: "var(--ink-3)" }}>En campo o quiosco</span></div>
        </div>
      </div>

      <div className="toolbar">
        <div className="toolbar-row">
          <div className="tab-row">
            <button className={"tab " + (tab === "products" ? "active" : "")} onClick={() => setTab("products")}>
              Productos <span className="pill">{products.length}</span>
            </button>
            <button className={"tab " + (tab === "positions" ? "active" : "")} onClick={() => setTab("positions")}>
              Puestos <span className="pill">{positions.length}</span>
            </button>
          </div>
        </div>
      </div>

      {tab === "products" && (
        <CatalogProducts
          products={products}
          onEditProduct={setEditingProduct}
          onDeleteProduct={deleteProduct}
          onEditCategoria={(p, c) => setEditingCategoria({ product: p, cat: c })}
          onDeleteCategoria={deleteCategoria}
          onAddCategoria={(p) => setEditingCategoria({ product: p, cat: null })}
        />
      )}
      {tab === "positions" && (
        <CatalogPositions
          products={products}
          positions={positions}
          onEdit={setEditingPosition}
          onDelete={deletePosition}
        />
      )}

      <Modal open={!!editingProduct} onClose={() => setEditingProduct(null)}>
        {editingProduct && <EditProductModal product={editingProduct} onClose={() => setEditingProduct(null)} onSave={saveProduct}/>}
      </Modal>

      <Modal open={!!editingCategoria} onClose={() => setEditingCategoria(null)}>
        {editingCategoria && <EditCategoriaModal product={editingCategoria.product} cat={editingCategoria.cat}
          onClose={() => setEditingCategoria(null)}
          onSave={(c) => saveCategoria(editingCategoria.product.id, c)}/>}
      </Modal>

      <Modal open={!!editingPosition} onClose={() => setEditingPosition(null)}>
        {editingPosition && <EditPositionModal position={editingPosition} products={products}
          onClose={() => setEditingPosition(null)} onSave={savePosition}/>}
      </Modal>
    </div>
  );
}

// =========================================================================
// PRODUCTS TAB
// =========================================================================
function CatalogProducts({ products, onEditProduct, onDeleteProduct, onEditCategoria, onDeleteCategoria, onAddCategoria }) {
  return (
    <div className="catalog-products">
      {products.map(p => {
        const usersIn = window.AvivaData.users.filter(u =>
          window.CatalogData.positions.some(pos => pos.productId === p.id && pos.name === u.role)
        ).length;
        return (
          <div key={p.id} className="product-card">
            <div className="product-head" style={{ background: p.bg, borderColor: p.color + "33" }}>
              <div className="product-brand" style={{ background: p.color, color: "#fff" }}>
                <span style={{ fontFamily: "var(--serif)", fontSize: 22, fontWeight: 500 }}>{p.name.split(" ").map(w => w[0]).slice(0,2).join("")}</span>
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div className="product-name">{p.name}</div>
                <div className="product-tagline">{p.tagline}</div>
                <div className="product-stats">
                  <span><b>{p.categorias.length}</b> categorías</span>
                  <span>·</span>
                  <span><b>{usersIn}</b> personas asignadas</span>
                </div>
              </div>
              <div className="row" style={{ gap: 6 }}>
                <button className="btn sm" onClick={() => onEditProduct(p)}>{Ic.edit} Editar</button>
                <button className="iconbtn" onClick={() => onDeleteProduct(p.id)} title="Eliminar">{Ic.close}</button>
              </div>
            </div>
            <div className="product-cats">
              <div className="product-cats-head">
                <span>Categorías</span>
                <button className="btn sm ghost" onClick={() => onAddCategoria(p)}>{Ic.plus} Agregar</button>
              </div>
              <div className="cat-pill-row">
                {p.categorias.length === 0 && <span className="empty" style={{ fontSize: 12.5, color: "var(--ink-3)" }}>Sin categorías. Agrega la primera para empezar.</span>}
                {p.categorias.map(c => (
                  <div key={c.id} className="cat-pill-card" onClick={() => onEditCategoria(p, c)}>
                    <span className="cat-chip" style={{ background: c.color + "20", color: c.color, border: "1px solid " + c.color + "44", width: 28, height: 28, fontSize: 10.5 }}>{c.short}</span>
                    <div className="col" style={{ flex: 1, minWidth: 0 }}>
                      <span className="cat-pill-name">{c.name}</span>
                      <span className="cat-pill-brand">{c.brand}</span>
                    </div>
                    <button className="iconbtn cat-pill-x" onClick={(e) => { e.stopPropagation(); onDeleteCategoria(p.id, c.id); }} title="Quitar">{Ic.close}</button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// =========================================================================
// POSITIONS TAB
// =========================================================================
function CatalogPositions({ products, positions, onEdit, onDelete }) {
  const [q, setQ] = useStateC("");
  const [productF, setProductF] = useStateC("all");
  const [levelF, setLevelF] = useStateC("all");

  const filtered = useMemoC(() => {
    return positions.filter(p => {
      if (q && !p.name.toLowerCase().includes(q.toLowerCase())) return false;
      if (productF !== "all" && p.productId !== productF) return false;
      if (levelF !== "all" && p.level !== levelF) return false;
      return true;
    });
  }, [positions, q, productF, levelF]);

  const levels = ["Direction","Lead","Manager","IC","Promotor"];

  return (
    <div>
      <div className="toolbar" style={{ marginTop: 0 }}>
        <div className="toolbar-row" style={{ borderTop: 0, paddingTop: 0 }}>
          <div className="search" style={{ flex: 1, minWidth: 220, maxWidth: 380 }}>
            {Ic.search}
            <input placeholder="Buscar puesto…" value={q} onChange={e => setQ(e.target.value)}/>
          </div>
          <select className="btn sm" value={productF} onChange={e => setProductF(e.target.value)}>
            <option value="all">Todos los productos</option>
            <option value="">Sin producto (corporativo)</option>
            {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
          <select className="btn sm" value={levelF} onChange={e => setLevelF(e.target.value)}>
            <option value="all">Todos los niveles</option>
            {levels.map(l => <option key={l} value={l}>{l}</option>)}
          </select>
        </div>
      </div>

      <div className="table-card">
        <table className="users">
          <thead>
            <tr>
              <th>Puesto</th>
              <th>Producto</th>
              <th>Área</th>
              <th>Nivel</th>
              <th>Personas</th>
              <th style={{ width: 100 }}></th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(p => {
              const prod = products.find(x => x.id === p.productId);
              const usersIn = window.AvivaData.users.filter(u => u.role === p.name).length;
              return (
                <tr key={p.id}>
                  <td>
                    <div className="user-cell">
                      <div className="position-glyph" style={{ background: prod ? prod.bg : "var(--surface-2)", color: prod ? prod.color : "var(--ink-3)" }}>
                        {p.level === "Promotor" ? Ic.user : p.level === "Manager" || p.level === "Lead" ? Ic.users : Ic.shield}
                      </div>
                      <div>
                        <div className="name">{p.name}</div>
                        <div className="email">{p.externo ? "Externo (Ejecutando Ideas)" : "Aviva Financial"}</div>
                      </div>
                    </div>
                  </td>
                  <td>{prod ? <span className="badge neutral" style={{ background: prod.bg, color: prod.color, borderColor: prod.color + "33" }}>{prod.name}</span> : <span className="muted" style={{ fontSize: 12 }}>—</span>}</td>
                  <td className="muted" style={{ fontSize: 12 }}>{p.area || "—"}</td>
                  <td><span className="badge neutral" style={{ fontSize: 11 }}>{p.level}</span></td>
                  <td><b>{usersIn}</b> <span className="muted" style={{ fontSize: 12 }}>{usersIn === 1 ? "persona" : "personas"}</span></td>
                  <td>
                    <div className="row" style={{ gap: 4 }}>
                      <button className="btn sm" onClick={() => onEdit(p)}>{Ic.edit}</button>
                      <button className="iconbtn" onClick={() => onDelete(p.id)} title="Eliminar">{Ic.close}</button>
                    </div>
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
// EDIT MODALS
// =========================================================================
function EditProductModal({ product, onClose, onSave }) {
  const [form, setForm] = useStateC({ ...product });
  function f(k, v) { setForm(p => ({ ...p, [k]: v })); }

  const palette = [
    { color: "#16b877", bg: "#e7f8ef", label: "Verde Aviva" },
    { color: "#1f4e85", bg: "#e5edf7", label: "Azul" },
    { color: "#026149", bg: "#e2efe2", label: "Verde oscuro" },
    { color: "#b15a0c", bg: "#fbece0", label: "Naranja" },
    { color: "#5c2e8e", bg: "#ece2f5", label: "Morado" },
    { color: "#9b1c2b", bg: "#fbeaec", label: "Rojo" },
    { color: "#0071ce", bg: "#e1eef9", label: "Azul Walmart" },
  ];

  return (
    <div className="panel" style={{ width: "min(560px, 96vw)" }}>
      <div className="row" style={{ padding: "14px 20px", borderBottom: "1px solid var(--line)" }}>
        <div className="product-brand" style={{ background: form.color, color: "#fff", width: 36, height: 36, fontSize: 13 }}>
          {(form.name || "?").split(" ").map(w => w[0]).slice(0,2).join("")}
        </div>
        <div className="col">
          <div style={{ fontWeight: 600, fontSize: 15 }}>{product.id ? "Editar producto" : "Nuevo producto"}</div>
          <div style={{ fontSize: 12, color: "var(--ink-3)" }}>Cambios visibles en perfiles, directorio y locaciones.</div>
        </div>
        <span style={{ flex: 1 }}/>
        <button className="iconbtn" onClick={onClose}>{Ic.close}</button>
      </div>
      <div style={{ padding: 20 }}>
        <div className="field"><label>Nombre del producto</label>
          <input type="text" value={form.name} onChange={e => f("name", e.target.value)} placeholder="Ej. Aviva tu Compra"/>
        </div>
        <div className="field"><label>Descripción breve</label>
          <input type="text" value={form.tagline} onChange={e => f("tagline", e.target.value)} placeholder="Una línea descriptiva"/>
        </div>
        <div className="field">
          <label>Color del producto</label>
          <div className="row" style={{ gap: 6, flexWrap: "wrap" }}>
            {palette.map(p => (
              <button key={p.color} type="button"
                className={"swatch-btn " + (form.color === p.color ? "active" : "")}
                onClick={() => { f("color", p.color); f("bg", p.bg); }}
                style={{ background: p.bg, border: "2px solid " + (form.color === p.color ? p.color : "transparent") }}>
                <span style={{ background: p.color }}/>
              </button>
            ))}
          </div>
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

function EditCategoriaModal({ product, cat, onClose, onSave }) {
  const [form, setForm] = useStateC(cat || { name: "", brand: "", short: "", color: product.color });
  function f(k, v) { setForm(p => ({ ...p, [k]: v })); }
  return (
    <div className="panel" style={{ width: "min(520px, 96vw)" }}>
      <div className="row" style={{ padding: "14px 20px", borderBottom: "1px solid var(--line)" }}>
        <span className="cat-chip" style={{ background: form.color + "20", color: form.color, border: "1px solid " + form.color + "44", width: 32, height: 32, fontSize: 11 }}>{form.short || "?"}</span>
        <div className="col">
          <div style={{ fontWeight: 600, fontSize: 15 }}>{cat ? "Editar categoría" : "Nueva categoría"}</div>
          <div style={{ fontSize: 12, color: "var(--ink-3)" }}>Dentro de <b>{product.name}</b></div>
        </div>
        <span style={{ flex: 1 }}/>
        <button className="iconbtn" onClick={onClose}>{Ic.close}</button>
      </div>
      <div style={{ padding: 20 }}>
        <div className="field"><label>Nombre</label>
          <input type="text" value={form.name} onChange={e => f("name", e.target.value)} placeholder="Ej. Mi Bodega Aurrera"/>
        </div>
        <div className="field-row">
          <div className="field"><label>Marca / canal</label>
            <input type="text" value={form.brand} onChange={e => f("brand", e.target.value)} placeholder="Ej. Bodega Aurrera"/>
          </div>
          <div className="field" style={{ maxWidth: 120 }}><label>Etiqueta corta</label>
            <input type="text" value={form.short} onChange={e => f("short", e.target.value.toUpperCase().slice(0,4))} placeholder="MBA"/>
          </div>
        </div>
        <div className="field"><label>Color</label>
          <input type="color" value={form.color} onChange={e => f("color", e.target.value)} style={{ width: 60, height: 36, padding: 2, border: "1px solid var(--line-strong)", borderRadius: 6 }}/>
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

function EditPositionModal({ position, products, onClose, onSave }) {
  const [form, setForm] = useStateC({ ...position });
  function f(k, v) { setForm(p => ({ ...p, [k]: v })); }
  const prod = products.find(p => p.id === form.productId);
  return (
    <div className="panel" style={{ width: "min(560px, 96vw)" }}>
      <div className="row" style={{ padding: "14px 20px", borderBottom: "1px solid var(--line)" }}>
        <div className="position-glyph" style={{ background: prod ? prod.bg : "var(--surface-2)", color: prod ? prod.color : "var(--ink-3)", width: 36, height: 36 }}>
          {form.level === "Promotor" ? Ic.user : Ic.shield}
        </div>
        <div className="col">
          <div style={{ fontWeight: 600, fontSize: 15 }}>{position.id ? "Editar puesto" : "Nuevo puesto"}</div>
          <div style={{ fontSize: 12, color: "var(--ink-3)" }}>Aparece en el campo "Puesto" de los perfiles.</div>
        </div>
        <span style={{ flex: 1 }}/>
        <button className="iconbtn" onClick={onClose}>{Ic.close}</button>
      </div>
      <div style={{ padding: 20 }}>
        <div className="field"><label>Nombre del puesto</label>
          <input type="text" value={form.name} onChange={e => f("name", e.target.value)} placeholder="Ej. Kiosk Manager"/>
        </div>
        <div className="field-row">
          <div className="field"><label>Nivel</label>
            <select value={form.level} onChange={e => f("level", e.target.value)}>
              <option>Direction</option><option>Lead</option><option>Manager</option><option>IC</option><option>Promotor</option>
            </select>
          </div>
          <div className="field"><label>Área</label>
            <select value={form.area} onChange={e => f("area", e.target.value)}>
              <option>Corporativo</option><option>Growth</option><option>Kiosk Acquisitions</option><option>Agencia</option><option>Legal</option><option>Finanzas</option>
            </select>
          </div>
        </div>
        <div className="field"><label>Producto al que pertenece</label>
          <select value={form.productId || ""} onChange={e => f("productId", e.target.value || null)}>
            <option value="">— Sin producto (corporativo / staff)</option>
            {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
        </div>
        {prod && (
          <div className="field"><label>Categoría específica (opcional)</label>
            <select value={form.categoriaId || ""} onChange={e => f("categoriaId", e.target.value || null)}>
              <option value="">— Cualquier categoría del producto</option>
              {prod.categorias.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
        )}
        <div className="row" style={{ marginTop: 6 }}>
          <label className="row" style={{ gap: 8, cursor: "pointer" }}>
            <input type="checkbox" className="cb" checked={!!form.externo} onChange={e => f("externo", e.target.checked)}/>
            <span style={{ fontSize: 13 }}>Puesto para colaboradores <b>externos</b> (agencia)</span>
          </label>
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

Object.assign(window, { CatalogView, EditProductModal, EditCategoriaModal, EditPositionModal });
