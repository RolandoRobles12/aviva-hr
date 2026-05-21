// Aviva HR — Catálogo: Productos + Puestos
// Loaded after data.jsx; exposes window.CatalogData (initial) and window.CatalogView.

(function () {
  // ──────────────────────────────────────────────────────────────────
  // Seed data
  // ──────────────────────────────────────────────────────────────────
  const products = [
    {
      id: "p-aviva-tu-compra",
      name: "Aviva tu Compra",
      tagline: "Crédito al consumo dentro de tiendas",
      color: "#16b877", bg: "#e7f8ef",
      categorias: [
        { id: "c-kiosco-aviva", name: "Kiosco Aviva",          brand: "Aviva Financiera",  short: "AV", color: "#026149" },
        { id: "c-ba",           name: "Bodega Aurrera",        brand: "Bodega Aurrera",    short: "BA", color: "#9b1c2b" },
        { id: "c-mba",          name: "Mi Bodega Aurrera",     brand: "Bodega Aurrera",    short: "MBA", color: "#9b1c2b" },
        { id: "c-sba",          name: "Super Bodega Aurrera",  brand: "Bodega Aurrera",    short: "SBA", color: "#9b1c2b" },
        { id: "c-walmart",      name: "Walmart",               brand: "Walmart",            short: "WM", color: "#0071ce" },
      ],
    },
    {
      id: "p-aviva-tu-casa",
      name: "Aviva tu Casa",
      tagline: "Crédito para materiales de construcción",
      color: "#1f4e85", bg: "#e5edf7",
      categorias: [
        { id: "c-construrama", name: "Construrama", brand: "Aviva tu Casa", short: "CR", color: "#1f4e85" },
        { id: "c-disensa",     name: "Disensa",     brand: "Aviva tu Casa", short: "DS", color: "#2b6a2b" },
      ],
    },
    {
      id: "p-aviva-tu-negocio",
      name: "Aviva tu Negocio",
      tagline: "Crédito de capital de trabajo para PyMEs",
      color: "#026149", bg: "#e2efe2",
      categorias: [
        { id: "c-atn-kiosco", name: "Kiosco ATN", brand: "Aviva tu Negocio", short: "ATN", color: "#026149" },
        { id: "c-atn-campo",  name: "Campo / Visita", brand: "Aviva tu Negocio", short: "CMP", color: "#026149" },
      ],
    },
    {
      id: "p-casa-marchand",
      name: "Casa Marchand",
      tagline: "Mayoreo de papelería con financiamiento",
      color: "#b15a0c", bg: "#fbece0",
      categorias: [
        { id: "c-marchand", name: "Casa Marchand", brand: "Casa Marchand", short: "CM", color: "#b15a0c" },
      ],
    },
    {
      id: "p-aviva-salud",
      name: "Aviva Salud",
      tagline: "Cirugías y servicios médicos a meses",
      color: "#5c2e8e", bg: "#ece2f5",
      categorias: [
        { id: "c-sala-uno", name: "Sala Uno", brand: "Sala Uno", short: "S1", color: "#5c2e8e" },
      ],
    },
  ];

  // ──────────────────────────────────────────────────────────────────
  // Puestos / Posiciones
  // ──────────────────────────────────────────────────────────────────
  const positions = [
    // Corporativo
    { id: "pos-ceo",          name: "CEO",                              level: "Direction",  productId: null,                  area: "Corporativo" },
    { id: "pos-people-lead",  name: "People Operations Lead",          level: "Lead",       productId: null,                  area: "Corporativo" },
    { id: "pos-bi",           name: "BI",                              level: "IC",         productId: null,                  area: "Growth" },
    { id: "pos-graduate",     name: "Graduate Program Associate",      level: "IC",         productId: null,                  area: "Growth" },
    { id: "pos-jr-product",   name: "Jr Product Associate",            level: "IC",         productId: null,                  area: "Growth" },
    { id: "pos-product-des",  name: "Product Designer",                level: "IC",         productId: null,                  area: "Growth" },
    { id: "pos-esp-expan",    name: "Especialista de Expansión",       level: "IC",         productId: "p-aviva-tu-compra",   area: "Growth" },
    { id: "pos-phygital",     name: "Phygital Expansion Manager",      level: "Manager",    productId: "p-aviva-tu-compra",   area: "Growth" },
    { id: "pos-sales-ops",    name: "Sales Operations Manager",        level: "Manager",    productId: "p-aviva-tu-compra",   area: "Kiosk Acquisitions" },
    { id: "pos-growth-hub",   name: "Growth Hub Manager",              level: "Manager",    productId: "p-aviva-tu-compra",   area: "Kiosk Acquisitions" },
    { id: "pos-retencion",    name: "Retención",                       level: "IC",         productId: null,                  area: "Growth" },
    // Operativos por producto
    { id: "pos-kiosk-mgr",    name: "Kiosk Manager",                   level: "Manager",    productId: "p-aviva-tu-compra",   area: "Kiosk Acquisitions" },
    { id: "pos-prom-atc",     name: "Promotor/a Aviva tu Compra",      level: "Promotor",   productId: "p-aviva-tu-compra",   area: "Kiosk Acquisitions" },
    { id: "pos-prom-ba",      name: "Promotor/a Aviva tu Compra · BA", level: "Promotor",   productId: "p-aviva-tu-compra",   area: "Kiosk Acquisitions", categoriaId: "c-ba" },
    { id: "pos-prom-walmart", name: "Promotor/a Aviva tu Compra · Walmart", level: "Promotor", productId: "p-aviva-tu-compra", area: "Kiosk Acquisitions", categoriaId: "c-walmart" },
    { id: "pos-prom-ext",     name: "Promotor BA Externo",             level: "Promotor",   productId: "p-aviva-tu-compra",   area: "Agencia", externo: true },
    { id: "pos-prom-atn",     name: "Promotor Aviva tu Negocio",       level: "Promotor",   productId: "p-aviva-tu-negocio",  area: "Kiosk Acquisitions" },
    { id: "pos-prom-atu-casa",name: "Promotor Aviva tu Casa",          level: "Promotor",   productId: "p-aviva-tu-casa",     area: "Kiosk Acquisitions" },
    { id: "pos-prom-cm",      name: "Promotor Casa Marchand",          level: "Promotor",   productId: "p-casa-marchand",     area: "Kiosk Acquisitions" },
  ];

  // ──────────────────────────────────────────────────────────────────
  // Roles & Permisos — matriz FUSIONADA (HR + Recruiting)
  // Dinámicos: edita roles y los cambios viajan a toda la app.
  // ──────────────────────────────────────────────────────────────────
  // Permission scopes:
  //   "all" | "team" | "own" | "request" | "none" |
  //   "manager" | "hr" | "it" | "partial"  (custom)
  const PERMISSIONS = [
    // ── Candidatos (Recruiting) ─────────────────────────────────────
    { id: "candidates.view",       group: "Candidatos",       label: "Ver candidatos",                 desc: "Acceder al pipeline de reclutamiento.",                          scopes: ["all", "own", "none"] },
    { id: "candidates.create",     group: "Candidatos",       label: "Crear candidato",                desc: "Agregar nuevos candidatos al sistema.",                          scopes: ["all", "none"] },
    { id: "candidates.disqualify", group: "Candidatos",       label: "Descalificar candidato",         desc: "Marcar como descartado en cualquier etapa.",                     scopes: ["all", "own", "none"] },

    // ── Proceso (Recruiting) ────────────────────────────────────────
    { id: "process.send_offer",        group: "Proceso",      label: "Enviar carta oferta",            desc: "Reenviar el correo de oferta al candidato.",                     scopes: ["all", "none"] },
    { id: "process.review_docs",       group: "Proceso",      label: "Revisar documentos",             desc: "Aprobar o rechazar documentos OCR.",                             scopes: ["all", "none"] },
    { id: "process.send_contract",     group: "Proceso",      label: "Enviar contrato",                desc: "Generar y enviar contrato para firma.",                          scopes: ["all", "none"] },
    { id: "process.view_contracts",    group: "Proceso",      label: "Ver contratos firmados",         desc: "Acceder a contratos y evidencias de firma.",                     scopes: ["all", "none"] },
    { id: "process.provision_accounts",group: "Proceso",      label: "Provisionar cuentas corporativas",desc: "Crear correo @avivacredito.com, Slack y HubSpot.",              scopes: ["all", "none"] },
    { id: "process.force_handoff",     group: "Proceso",      label: "Forzar handoff a HR",            desc: "Activar manualmente el alta en Directorio (override IT/Admin).", scopes: ["all", "none"] },

    // ── Directorio y perfiles (HR) ──────────────────────────────────
    { id: "directory.view",        group: "Directorio",       label: "Ver directorio",                 desc: "Lista de colaboradores activos en Aviva.",                       scopes: ["all", "team", "own", "none"] },
    { id: "profile.view",          group: "Directorio",       label: "Ver perfil detallado",           desc: "Datos sensibles, salario, contratos.",                           scopes: ["all", "team", "own", "none"] },

    // ── Bajas (HR) ──────────────────────────────────────────────────
    { id: "user.offboard",         group: "Bajas",            label: "Iniciar baja",                   desc: "Crear ticket de baja.",                                          scopes: ["all", "request", "none"] },
    { id: "user.approve",          group: "Bajas",            label: "Aprobar baja",                   desc: "Etapa Manager / HR / IT.",                                       scopes: ["all", "manager", "hr", "it", "none"] },

    // ── Locaciones ──────────────────────────────────────────────────
    { id: "locations.manage",      group: "Locaciones",       label: "Gestionar locaciones",           desc: "Crear, editar y cerrar kioscos.",                                scopes: ["all", "team", "none"] },

    // ── Catálogo ────────────────────────────────────────────────────
    { id: "catalog.manage",        group: "Catálogo",         label: "Gestionar catálogo",             desc: "Productos, categorías y puestos.",                               scopes: ["all", "none"] },

    // ── Plantillas y formulario (Recruiting) ────────────────────────
    { id: "templates.manage",      group: "Plantillas",       label: "Editar plantillas",              desc: "Cartas oferta, contratos y correos.",                            scopes: ["all", "none"] },
    { id: "form.manage",           group: "Plantillas",       label: "Configurar formulario",          desc: "Preguntas y documentos del expediente.",                         scopes: ["all", "none"] },

    // ── Configuración e integraciones ───────────────────────────────
    { id: "settings.manage",       group: "Configuración",    label: "Ajustes generales",              desc: "Gmail, recordatorios, duración de enlaces, marca.",              scopes: ["all", "none"] },
    { id: "integrations.manage",   group: "Configuración",    label: "Gestionar integraciones",        desc: "Conectar apps externas (Slack, HubSpot, Okta, etc.).",           scopes: ["all", "none"] },
    { id: "slack.config",          group: "Configuración",    label: "Configurar alertas Slack",       desc: "Reglas de notificación.",                                        scopes: ["all", "none"] },
    { id: "export",                group: "Configuración",    label: "Exportar datos / CSV",           desc: "Descargar directorio, eventos o reportes.",                      scopes: ["all", "none"] },
    { id: "audit.view",            group: "Configuración",    label: "Auditoría",                      desc: "Ver el log inmutable de cambios.",                               scopes: ["all", "partial", "none"] },
    { id: "workspace.config",      group: "Configuración",    label: "Configurar workspace",           desc: "Retención de datos, cadenas de aprobación.",                     scopes: ["all", "none"] },

    // ── Administración ──────────────────────────────────────────────
    { id: "admin.manage_users",    group: "Administración",   label: "Gestionar usuarios",             desc: "Asignar roles a personas.",                                      scopes: ["all", "none"] },
    { id: "admin.manage_roles",    group: "Administración",   label: "Gestionar roles y permisos",     desc: "Editar la matriz dinámica.",                                     scopes: ["all", "none"] },
  ];

  const SCOPE_LABEL = {
    all:      "Total",
    team:     "Solo equipo",
    own:      "Solo propio",
    request:  "Solicitar",
    manager:  "Mgr",
    hr:       "HR",
    it:       "IT",
    partial:  "Parcial",
    none:     "—",
  };

  const SCOPE_COLOR = {
    all:     { fg: "#026149", bg: "#e7f8ef" },
    team:    { fg: "#8a5a00", bg: "#fff5d6" },
    own:     { fg: "#8a5a00", bg: "#fff5d6" },
    request: { fg: "#1b3f8a", bg: "#e3eeff" },
    manager: { fg: "#1b3f8a", bg: "#e3eeff" },
    hr:      { fg: "#1b3f8a", bg: "#e3eeff" },
    it:      { fg: "#1b3f8a", bg: "#e3eeff" },
    partial: { fg: "#8a5a00", bg: "#fff5d6" },
    none:    { fg: "#9aa099", bg: "#fbfbf8" },
  };

  // Build helper to make role objects compact
  function role(id, name, icon, color, desc, members, set) {
    const perms = {};
    PERMISSIONS.forEach(p => perms[p.id] = set[p.id] || "none");
    return { id, name, icon, color, desc, members, perms };
  }

  const roles = [
    role("r-admin", "Admin", "shield", "#a8200d",
      "Acceso total al workspace. Configura todo.", 3,
      Object.fromEntries(PERMISSIONS.map(p => [p.id, "all"]))),

    role("r-reclutador", "Reclutador", "users", "#1b3f8a",
      "Crea y mueve candidatos por el pipeline.", 5,
      {
        "candidates.view": "own", "candidates.create": "all", "candidates.disqualify": "own",
        "process.send_offer": "all", "process.review_docs": "all", "process.send_contract": "all",
        "directory.view": "all", "profile.view": "team",
      }),

    role("r-lider", "Líder de Reclutamiento", "shield", "#5c2e8e",
      "Supervisa al equipo. Cubre todo el pipeline.", 2,
      {
        "candidates.view": "all", "candidates.create": "all", "candidates.disqualify": "all",
        "process.send_offer": "all", "process.review_docs": "all", "process.send_contract": "all",
        "process.view_contracts": "all", "process.provision_accounts": "all",
        "directory.view": "all", "profile.view": "all",
        "settings.manage": "all", "form.manage": "all", "templates.manage": "all",
        "audit.view": "partial", "export": "all",
      }),

    role("r-nomina", "Nómina", "user", "#026149",
      "Procesa contratos firmados y provisiona cuentas.", 3,
      {
        "candidates.view": "all", "process.view_contracts": "all", "process.provision_accounts": "all",
        "directory.view": "all", "profile.view": "team", "export": "all",
      }),

    role("r-legal", "Legal", "shield", "#b15a0c",
      "Revisa documentos y contratos.", 2,
      {
        "candidates.view": "all", "process.review_docs": "all", "process.view_contracts": "all",
        "directory.view": "all", "profile.view": "team",
      }),

    role("r-hr", "HR Business Partner", "users", "#026149",
      "Operación completa de gente. Crea altas y bajas.", 5,
      {
        "candidates.view": "all", "candidates.create": "all",
        "process.send_offer": "all", "process.review_docs": "all", "process.send_contract": "all",
        "process.view_contracts": "all",
        "directory.view": "all", "profile.view": "all",
        "user.offboard": "all", "user.approve": "hr",
        "locations.manage": "all", "catalog.manage": "all",
        "templates.manage": "all", "form.manage": "all",
        "settings.manage": "all", "slack.config": "all", "export": "all", "audit.view": "partial",
      }),

    role("r-it", "IT / Sistemas", "plug", "#1b3f8a",
      "Provisiona cuentas, aprueba bajas, gestiona integraciones.", 4,
      {
        "candidates.view": "all",
        "process.provision_accounts": "all", "process.force_handoff": "all",
        "user.approve": "it",
        "directory.view": "all", "profile.view": "team",
        "integrations.manage": "all", "slack.config": "all",
        "audit.view": "partial",
      }),

    role("r-manager", "Manager de campo", "user", "#b15a0c",
      "Aprueba bajas de su equipo. Lee perfiles del equipo.", 22,
      {
        "directory.view": "all", "profile.view": "team",
        "user.offboard": "request", "user.approve": "manager",
        "locations.manage": "team",
      }),

    role("r-employee", "Empleado", "user", "#6b716b",
      "Ve su propio perfil y los datos públicos del directorio.", 110,
      {
        "directory.view": "team", "profile.view": "own",
      }),
  ];

  window.CatalogData = {
    products,
    positions,
    roles,
    permissions: PERMISSIONS,
    scopeLabel: SCOPE_LABEL,
    scopeColor: SCOPE_COLOR,
  };
})();
