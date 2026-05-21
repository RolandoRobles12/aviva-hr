// Aviva HR — datos basados en la estructura real de Aviva Crédito
(function () {
  // ──────────────────────────────────────────────────────────────────────────
  // Catálogos reales
  // ──────────────────────────────────────────────────────────────────────────

  const estados = [
    "México", "Hidalgo", "Veracruz", "Puebla", "Chiapas", "CDMX", "Tlaxcala",
    "Morelos", "Querétaro", "Oaxaca", "Yucatán", "Aguascalientes", "Nuevo León",
    "Jalisco", "San Luis Potosí", "Campeche", "Michoacán", "Guanajuato",
    "Quintana Roo", "Tabasco", "Coahuila", "Guerrero",
  ];

  // Hubs / equipos como aparecen en la base
  const hubs = [
    { id: "corporativo",           label: "Corporativo",                area: "Growth",             leader: "Andrés Rizo" },
    { id: "equipo_ventas_aviva",   label: "Equipo de ventas Aviva",     area: "Kiosk Acquisitions", leader: "Andrés Arías" },
    { id: "hub1-region_hidalgo",   label: "Hub 1 · Hidalgo",            area: "Kiosk Acquisitions", leader: "Lyz Nuñez" },
    { id: "hub2-region_edomex",    label: "Hub 2 · EdoMex",             area: "Kiosk Acquisitions", leader: "Alonso Vargas" },
    { id: "hub3_region-pue-mor-tlax", label: "Hub 3 · Puebla · Morelos · Tlax", area: "Kiosk Acquisitions", leader: "Fernanda Romero" },
    { id: "hub4-region_ver_oax",   label: "Hub 4 · Veracruz · Oaxaca",  area: "Kiosk Acquisitions", leader: "Noel Hernández" },
    { id: "hub5-region_yuc_roo",   label: "Hub 5 · Yucatán · Q.Roo",    area: "Kiosk Acquisitions", leader: "Yahir Ortega" },
    { id: "hub6-region-chiapas",   label: "Hub 6 · Chiapas",            area: "Kiosk Acquisitions", leader: "Orlando Vela" },
    { id: "hub7-region-nl_slp_zac", label: "Hub 7 · NL · SLP · Zacatecas", area: "Kiosk Acquisitions", leader: "Daniel Soto" },
    { id: "hub8-region-ags_jal_mich", label: "Hub 8 · Ags · Jal · Mich", area: "Kiosk Acquisitions", leader: "Abraham Castro" },
    { id: "aviva_tu_casa_ventas",  label: "Aviva tu Casa · Ventas",     area: "Kiosk Acquisitions", leader: "Andrés Rizo" },
    { id: "casa_marchand_ventas",  label: "Casa Marchand · Ventas",     area: "Kiosk Acquisitions", leader: "Alonso Vargas" },
    { id: "bodega-aurrera-piloto", label: "Bodega Aurrera · Piloto",    area: "Kiosk Acquisitions", leader: "Andrés Rizo" },
    { id: "walmart-piloto",        label: "Walmart · Piloto",           area: "Kiosk Acquisitions", leader: "Andrés Rizo" },
    { id: "ejecutando-ideas",      label: "Ejecutando Ideas",           area: "Agencia",            leader: "Alonso Vargas" },
  ];

  // Puestos reales
  const puestos = [
    "Promotor/a Aviva tu Compra",
    "Promotor Aviva tu Casa",
    "Promotor Aviva tu Negocio",
    "Promotor Casa Marchand",
    "Promotor Aviva tu Compra · BA",        // Bodega Aurrera
    "Promotor Aviva tu Compra · Walmart",
    "Promotor BA Externo",                  // contratistas
    "Kiosk Manager",
    "Growth Hub Manager",
    "Phygital Expansion Manager",
    "Sales Operations Manager",
    "Especialista de Expansión",
    "Retención",
    "Graduate Program Associate",
    "Jr Product Associate",
    "Product Designer",
    "BI",
  ];

  // Quioscos reales (con productos)
  const quioscos = [
    // Aviva tu Compra (financiera tradicional)
    { name: "Aviva House",       estado: "CDMX",       producto: "Corporativo" },
    { name: "Chalco",            estado: "México",     producto: "Aviva tu Compra" },
    { name: "Ixtapaluca",        estado: "México",     producto: "Aviva tu Compra" },
    { name: "Texcoco",           estado: "México",     producto: "Aviva tu Compra" },
    { name: "Tulancingo",        estado: "Hidalgo",    producto: "Aviva tu Compra" },
    { name: "Actopan",           estado: "Hidalgo",    producto: "Aviva tu Compra" },
    { name: "Pachuca",           estado: "Hidalgo",    producto: "Aviva tu Compra" },
    { name: "Texmelucan",        estado: "Puebla",     producto: "Aviva tu Compra" },
    { name: "Tehuacán",          estado: "Puebla",     producto: "Aviva tu Compra" },
    { name: "Tlaxcala",          estado: "Tlaxcala",   producto: "Aviva tu Compra" },
    { name: "Huamantla",         estado: "Tlaxcala",   producto: "Aviva tu Compra" },
    { name: "Chiautempan",       estado: "Tlaxcala",   producto: "Aviva tu Compra" },
    { name: "Calpulalpan",       estado: "Tlaxcala",   producto: "Aviva tu Compra" },
    { name: "Xochitepec",        estado: "Morelos",    producto: "Aviva tu Compra" },
    { name: "Cuautla",           estado: "Morelos",    producto: "Aviva tu Compra" },
    { name: "Querétaro Centro",  estado: "Querétaro",  producto: "Aviva tu Compra" },
    // Bodega Aurrera (BA)
    { name: "Perote BA",         estado: "Veracruz",   producto: "Aviva tu Compra · BA" },
    { name: "Huatusco BA",       estado: "Veracruz",   producto: "Aviva tu Compra · BA" },
    { name: "Fortín BA",         estado: "Veracruz",   producto: "Aviva tu Compra · BA" },
    { name: "Coscomatepec BA",   estado: "Veracruz",   producto: "Aviva tu Compra · BA" },
    { name: "Tres Valles BA",    estado: "Veracruz",   producto: "Aviva tu Compra · BA" },
    { name: "Tlachichuca BA",    estado: "Puebla",     producto: "Aviva tu Compra · BA" },
    { name: "Cuacnopalan BA",    estado: "Puebla",     producto: "Aviva tu Compra · BA" },
    { name: "Tecamachalco BA",   estado: "Puebla",     producto: "Aviva tu Compra · BA" },
    { name: "Apaxco BA",         estado: "México",     producto: "Aviva tu Compra · BA" },
    { name: "Amecameca BA",      estado: "México",     producto: "Aviva tu Compra · BA" },
    { name: "Putla BA",          estado: "Oaxaca",     producto: "Aviva tu Compra · BA" },
    { name: "Tuxtla BA",         estado: "Chiapas",    producto: "Aviva tu Compra · BA" },
    { name: "San Cristóbal BA",  estado: "Chiapas",    producto: "Aviva tu Compra · BA" },
    // Aviva tu Negocio
    { name: "Ixtapaluca ATN",    estado: "México",     producto: "Aviva tu Negocio" },
    { name: "Zempoala ATN",      estado: "Hidalgo",    producto: "Aviva tu Negocio" },
    { name: "Mérida ATN",        estado: "Yucatán",    producto: "Aviva tu Negocio" },
    // Casa Marchand
    { name: "Monterrey CM",      estado: "Nuevo León", producto: "Casa Marchand" },
    { name: "Aguascalientes CM", estado: "Aguascalientes", producto: "Casa Marchand" },
    { name: "Guadalajara CM",    estado: "Jalisco",    producto: "Casa Marchand" },
  ];

  // ──────────────────────────────────────────────────────────────────────────
  // Integraciones (stack real Aviva)
  // ──────────────────────────────────────────────────────────────────────────
  const integrationsAll = [
    { id: "google",     name: "Google Workspace", short: "G",  desc: "Correo @avivacredito.com",      accounts: 332, lastSync: "hace 8 min",  status: "ok",   color: "#ea4335" },
    { id: "slack",      name: "Slack",            short: "#",  desc: "Mensajería interna",            accounts: 318, lastSync: "hace 4 min",  status: "ok",   color: "#611f69" },
    { id: "hubspot",    name: "HubSpot",          short: "H",  desc: "CRM comercial · deals",         accounts: 312, lastSync: "hace 2 min",  status: "ok",   color: "#ff7a59" },
    { id: "factorial",  name: "Factorial",        short: "F",  desc: "Nómina y contratos",            accounts: 308, lastSync: "hace 1 h",    status: "ok",   color: "#0066ff" },
    { id: "okta",       name: "Okta SSO",         short: "O",  desc: "Identidad · MFA",               accounts: 332, lastSync: "hace 1 min",  status: "ok",   color: "#007dc1" },
    { id: "avivaflat",  name: "Aviva Flat",       short: "AF", desc: "Plataforma interna de ventas",  accounts: 280, lastSync: "hace 14 min", status: "ok",   color: "#16b877" },
    { id: "atn-app",    name: "App Aviva tu Negocio", short: "AN", desc: "App móvil para promotores", accounts: 192, lastSync: "hace 22 min", status: "warn", color: "#026149" },
    { id: "tablets",    name: "MDM Tablets",      short: "TB", desc: "Gestión de tablets en campo",   accounts: 245, lastSync: "hace 30 min", status: "ok",   color: "#1b3f8a" },
    { id: "pld",        name: "PLD · Compliance", short: "PL", desc: "Prevención de lavado de dinero", accounts: 332, lastSync: "hace 6 min", status: "ok",   color: "#8a1b1b" },
    { id: "humand",     name: "Humand",           short: "Hu", desc: "Comunicación interna · onboarding", accounts: 332, lastSync: "hace 18 min", status: "warn", color: "#6b1b8a" },
    { id: "onepass",    name: "1Password",        short: "1P", desc: "Vault de contraseñas",          accounts: 56,  lastSync: "hace 6 min",  status: "ok",   color: "#0572ec" },
    { id: "notion",     name: "Notion",           short: "N",  desc: "Documentación corporativa",     accounts: 48,  lastSync: "hace 1 h",    status: "ok",   color: "#191919" },
  ];

  // ──────────────────────────────────────────────────────────────────────────
  // Personas — basadas en nombres reales del archivo
  // ──────────────────────────────────────────────────────────────────────────
  const PEOPLE = [
    // Corporativo
    { num: "001_02", nombre: "Andrés Rizo Mendoza",          puesto: "CEO",                              hub: "corporativo", quiosco: "Aviva House", estado: "CDMX",     jefe: null,             genero: "H", talla: "M",  empresa: "Aviva Financial", hubspot: "1.10000001E8", fechaIngreso: "2022-01-10", status: "active" },
    { num: "008_02", nombre: "Maria Renee León Castro",      puesto: "Jr Product Associate",            hub: "corporativo", quiosco: "Aviva House", estado: "CDMX",     jefe: "Amran Frey",      genero: "M", talla: "CH", empresa: "Aviva Financial", hubspot: "2.39992681E8", fechaIngreso: "2022-10-15", status: "active" },
    { num: "048_02", nombre: "Noel Oswaldo Hernández Méndez",puesto: "Growth Hub Manager",              hub: "hub4-region_ver_oax", quiosco: "Aviva House", estado: "CDMX", jefe: "Andrés Rizo Mendoza", genero: "H", talla: "M", empresa: "Aviva Financial", hubspot: "5.51548705E8", fechaIngreso: "2023-09-08", status: "active" },
    { num: "012_02", nombre: "Amran Frey Sánchez",           puesto: "Phygital Expansion Manager",       hub: "corporativo", quiosco: "Aviva House", estado: "CDMX",     jefe: "Andrés Rizo Mendoza", genero: "H", talla: "M", empresa: "Aviva Financial", hubspot: "1.85772910E8", fechaIngreso: "2022-04-22", status: "active" },
    { num: "015_02", nombre: "Andrés Arías Domínguez",       puesto: "Sales Operations Manager",         hub: "equipo_ventas_aviva", quiosco: "Aviva House", estado: "CDMX", jefe: "Andrés Rizo Mendoza", genero: "H", talla: "L", empresa: "Aviva Financial", hubspot: "1.96123404E8", fechaIngreso: "2022-06-13", status: "active" },
    { num: "020_02", nombre: "Lyz Nuñez García",             puesto: "Growth Hub Manager",              hub: "hub1-region_hidalgo", quiosco: "Aviva House", estado: "CDMX", jefe: "Andrés Rizo Mendoza", genero: "M", talla: "CH", empresa: "Aviva Financial", hubspot: "2.10994411E8", fechaIngreso: "2022-08-01", status: "active" },
    { num: "025_02", nombre: "Alonso Vargas Pineda",         puesto: "Growth Hub Manager",              hub: "hub2-region_edomex", quiosco: "Aviva House", estado: "CDMX", jefe: "Andrés Rizo Mendoza", genero: "H", talla: "L", empresa: "Aviva Financial", hubspot: "2.23440971E8", fechaIngreso: "2022-09-19", status: "active" },
    { num: "030_02", nombre: "Abraham Castro Méndez",        puesto: "Growth Hub Manager",              hub: "hub8-region-ags_jal_mich", quiosco: "Aviva House", estado: "CDMX", jefe: "Andrés Rizo Mendoza", genero: "H", talla: "M", empresa: "Aviva Financial", hubspot: "2.41100087E8", fechaIngreso: "2022-11-04", status: "active" },
    { num: "087_02", nombre: "Paula Acevedo Reyes",          puesto: "People Operations Lead",          hub: "corporativo", quiosco: "Aviva House", estado: "CDMX",     jefe: "Andrés Rizo Mendoza", genero: "M", talla: "CH", empresa: "Aviva Financial", hubspot: "6.71219034E8", fechaIngreso: "2024-02-15", status: "active" },
    { num: "044_02", nombre: "Mariana Salinas Cruz",         puesto: "Graduate Program Associate",      hub: "corporativo", quiosco: "Aviva House", estado: "CDMX",     jefe: "Amran Frey Sánchez", genero: "M", talla: "CH", empresa: "Aviva Financial", hubspot: "5.20019843E8", fechaIngreso: "2023-08-21", status: "active" },
    { num: "066_02", nombre: "Diego Tovar Calderón",         puesto: "Product Designer",                 hub: "corporativo", quiosco: "Aviva House", estado: "CDMX",     jefe: "Amran Frey Sánchez", genero: "H", talla: "M",  empresa: "Aviva Financial", hubspot: "6.04023188E8", fechaIngreso: "2024-01-08", status: "active" },
    { num: "058_02", nombre: "Sofía Ramírez Ortiz",          puesto: "BI",                              hub: "corporativo", quiosco: "Aviva House", estado: "CDMX",     jefe: "Andrés Arías Domínguez", genero: "M", talla: "CH", empresa: "Aviva Financial", hubspot: "5.83014522E8", fechaIngreso: "2023-12-12", status: "active" },

    // Hidalgo
    { num: "178_02", nombre: "Adrián Contreras Zapata",      puesto: "Kiosk Manager",                   hub: "hub1-region_hidalgo", quiosco: "Tulancingo", estado: "Hidalgo", jefe: "Lyz Nuñez García", genero: "H", talla: "L", empresa: "Aviva Financial", hubspot: "7.7056066E7", fechaIngreso: "2025-02-24", status: "active" },
    { num: "182_02", nombre: "Nancy Vargas Hernández",       puesto: "Kiosk Manager",                   hub: "hub1-region_hidalgo", quiosco: "Actopan", estado: "Hidalgo", jefe: "Lyz Nuñez García", genero: "M", talla: "CH", empresa: "Aviva Financial", hubspot: "8.0421555E7", fechaIngreso: "2025-03-03", status: "active" },
    { num: "201_02", nombre: "Karina Espinoza Romero",       puesto: "Promotor/a Aviva tu Compra",      hub: "hub1-region_hidalgo", quiosco: "Pachuca", estado: "Hidalgo", jefe: "Adrián Contreras Zapata", genero: "M", talla: "M", empresa: "Aviva Financial", hubspot: "9.1230091E7", fechaIngreso: "2025-04-14", status: "active" },

    // EdoMex
    { num: "019_02", nombre: "Alejandro Martínez Córdova",   puesto: "Kiosk Manager",                   hub: "hub2-region_edomex", quiosco: "Ixtapaluca", estado: "México", jefe: "Alonso Vargas Pineda", genero: "H", talla: "XL", empresa: "Aviva Financial", hubspot: "3.3190235E8", fechaIngreso: "2023-02-12", status: "active" },
    { num: "024_02", nombre: "María Luisa Hernández García", puesto: "Kiosk Manager",                   hub: "hub2-region_edomex", quiosco: "Chalco", estado: "México", jefe: "Alonso Vargas Pineda", genero: "M", talla: "M", empresa: "Aviva Financial", hubspot: "3.50122701E8", fechaIngreso: "2022-09-20", status: "active" },
    { num: "045_02", nombre: "Lluvia Valeria Ostao Montoya", puesto: "Kiosk Manager",                   hub: "hub2-region_edomex", quiosco: "Texcoco", estado: "México", jefe: "Alonso Vargas Pineda", genero: "M", talla: "CH", empresa: "Aviva Financial", hubspot: "5.30441189E8", fechaIngreso: "2023-05-10", status: "active" },
    { num: "378_02", nombre: "Alberto Yafte Fuentes Vargas", puesto: "Promotor/a Aviva tu Compra",      hub: "hub2-region_edomex", quiosco: "Apaxco BA", estado: "México", jefe: "Andrés Rizo Mendoza", genero: "H", talla: "L", empresa: "Aviva Financial", hubspot: null, fechaIngreso: "2025-09-22", status: "invited" },

    // Puebla / Morelos / Tlax
    { num: "032_02", nombre: "Víctor Manuel Peña Mendoza",   puesto: "Kiosk Manager",                   hub: "hub3_region-pue-mor-tlax", quiosco: "Tlaxcala", estado: "Tlaxcala", jefe: "Fernanda Romero Torres", genero: "H", talla: "M", empresa: "Aviva Financial", hubspot: "4.17749291E8", fechaIngreso: "2023-05-29", status: "active" },
    { num: "038_02", nombre: "Arturo Quiroz Pérez",          puesto: "Kiosk Manager",                   hub: "hub3_region-pue-mor-tlax", quiosco: "Huamantla", estado: "Tlaxcala", jefe: "Fernanda Romero Torres", genero: "H", talla: "XL", empresa: "Aviva Financial", hubspot: "4.66330391E8", fechaIngreso: "2023-07-18", status: "active" },
    { num: "041_02", nombre: "Héctor Romano Arrellano",      puesto: "Kiosk Manager",                   hub: "hub3_region-pue-mor-tlax", quiosco: "Texmelucan", estado: "Puebla", jefe: "Fernanda Romero Torres", genero: "H", talla: "L", empresa: "Aviva Financial", hubspot: "4.82441299E8", fechaIngreso: "2023-04-21", status: "active" },
    { num: "068_02", nombre: "Blanca Liliana Perez Solis",   puesto: "Promotor/a Aviva tu Compra",      hub: "hub3_region-pue-mor-tlax", quiosco: "Xochitepec", estado: "Morelos", jefe: "Fernanda Romero Torres", genero: "M", talla: "M", empresa: "Aviva Financial", hubspot: "6.20119001E8", fechaIngreso: "2023-11-12", status: "active" },
    { num: "141_02", nombre: "Mayo Gonzalez Cruz",           puesto: "Promotor/a Aviva tu Compra",      hub: "hub3_region-pue-mor-tlax", quiosco: "Huamantla", estado: "Tlaxcala", jefe: "Arturo Quiroz Pérez", genero: "H", talla: "L", empresa: "Aviva Financial", hubspot: "7.10211990E8", fechaIngreso: "2024-10-16", status: "active" },
    { num: "186_02", nombre: "José Alberto Flores Martínez", puesto: "Promotor/a Aviva tu Compra",      hub: "hub3_region-pue-mor-tlax", quiosco: "Tecamachalco BA", estado: "Puebla", jefe: "Andrés Rizo Mendoza", genero: "H", talla: "M", empresa: "Aviva Financial", hubspot: "7.20119445E8", fechaIngreso: "2025-03-29", status: "offboarding", offboardingTicket: "TKT-2041" },
    { num: "179_02", nombre: "Judith Natalia Aguilar Díaz",  puesto: "Promotor/a Aviva tu Compra",      hub: "hub3_region-pue-mor-tlax", quiosco: "Calpulalpan", estado: "Tlaxcala", jefe: "Fernanda Romero Torres", genero: "M", talla: "CH", empresa: "Aviva Financial", hubspot: "7.41200332E8", fechaIngreso: "2025-02-15", status: "active" },

    // Veracruz / Oaxaca
    { num: "281_02", nombre: "Alejandro González Figueroa",  puesto: "Promotor/a Aviva tu Compra",      hub: "hub4-region_ver_oax", quiosco: "Perote BA", estado: "Veracruz", jefe: "Noel Hernández Méndez", genero: "H", talla: "M", empresa: "Aviva Financial", hubspot: "8.10221501E8", fechaIngreso: "2025-07-22", status: "active" },
    { num: "290_02", nombre: "Lisania Cruz Sánchez",         puesto: "Promotor/a Aviva tu Compra",      hub: "hub4-region_ver_oax", quiosco: "Fortín BA", estado: "Veracruz", jefe: "Noel Hernández Méndez", genero: "M", talla: "CH", empresa: "Aviva Financial", hubspot: "8.21010044E8", fechaIngreso: "2025-07-28", status: "active" },
    { num: "291_02", nombre: "Daniela Castro De La Rosa",    puesto: "Promotor/a Aviva tu Compra",      hub: "hub4-region_ver_oax", quiosco: "Coscomatepec BA", estado: "Veracruz", jefe: "Noel Hernández Méndez", genero: "M", talla: "M", empresa: "Aviva Financial", hubspot: "8.30440098E8", fechaIngreso: "2025-07-28", status: "active" },
    { num: "292_02", nombre: "Israel Vázquez Ramírez",       puesto: "Promotor/a Aviva tu Compra",      hub: "hub4-region_ver_oax", quiosco: "Huatusco BA", estado: "Veracruz", jefe: "Noel Hernández Méndez", genero: "H", talla: "L", empresa: "Aviva Financial", hubspot: "8.39102441E8", fechaIngreso: "2025-07-28", status: "active" },
    { num: "307_02", nombre: "Adulfa Muñoz Díaz",            puesto: "Promotor/a Aviva tu Compra",      hub: "hub4-region_ver_oax", quiosco: "Tres Valles BA", estado: "Veracruz", jefe: "Andrés Rizo Mendoza", genero: "M", talla: "M", empresa: "Aviva Financial", hubspot: "8.2441404E7", fechaIngreso: "2025-08-18", status: "active" },

    // Chiapas
    { num: "212_02", nombre: "Pablo Hernández Domínguez",    puesto: "Promotor/a Aviva tu Compra",      hub: "hub6-region-chiapas", quiosco: "Tuxtla BA", estado: "Chiapas", jefe: "Orlando Vela Núñez", genero: "H", talla: "M", empresa: "Aviva Financial", hubspot: "7.51200887E8", fechaIngreso: "2025-05-04", status: "active" },
    { num: "215_02", nombre: "Sara Pérez González",          puesto: "Promotor/a Aviva tu Compra",      hub: "hub6-region-chiapas", quiosco: "San Cristóbal BA", estado: "Chiapas", jefe: "Orlando Vela Núñez", genero: "M", talla: "CH", empresa: "Aviva Financial", hubspot: "7.55001242E8", fechaIngreso: "2025-05-09", status: "active" },
    { num: "221_02", nombre: "Manuel Sánchez Cruz",          puesto: "Promotor/a Aviva tu Compra",      hub: "hub6-region-chiapas", quiosco: "Tuxtla BA", estado: "Chiapas", jefe: "Orlando Vela Núñez", genero: "H", talla: "L", empresa: "Aviva Financial", hubspot: "7.59112889E8", fechaIngreso: "2025-05-22", status: "suspended" },

    // Yucatán
    { num: "240_02", nombre: "Rocío Méndez Cab",             puesto: "Promotor Aviva tu Negocio",       hub: "hub5-region_yuc_roo", quiosco: "Mérida ATN", estado: "Yucatán", jefe: "Yahir Ortega Ruiz", genero: "M", talla: "M", empresa: "Aviva Financial", hubspot: "7.71022004E8", fechaIngreso: "2025-06-02", status: "active" },

    // Casa Marchand · NL · Jal · Ags
    { num: "256_02", nombre: "Joel García Treviño",          puesto: "Promotor Casa Marchand",          hub: "casa_marchand_ventas", quiosco: "Monterrey CM", estado: "Nuevo León", jefe: "Alonso Vargas Pineda", genero: "H", talla: "L", empresa: "Aviva Financial", hubspot: "7.81022991E8", fechaIngreso: "2025-06-18", status: "active" },
    { num: "262_02", nombre: "Itzel Rodríguez Castañeda",    puesto: "Promotor Casa Marchand",          hub: "casa_marchand_ventas", quiosco: "Aguascalientes CM", estado: "Aguascalientes", jefe: "Alonso Vargas Pineda", genero: "M", talla: "CH", empresa: "Aviva Financial", hubspot: "7.88012005E8", fechaIngreso: "2025-06-25", status: "active" },
    { num: "271_02", nombre: "Iván Martínez Padilla",        puesto: "Promotor Casa Marchand",          hub: "casa_marchand_ventas", quiosco: "Guadalajara CM", estado: "Jalisco", jefe: "Alonso Vargas Pineda", genero: "H", talla: "M", empresa: "Aviva Financial", hubspot: "7.95004511E8", fechaIngreso: "2025-07-01", status: "active" },

    // Aviva tu Negocio
    { num: "162_02", nombre: "Servando Ramírez Alarcón",     puesto: "Promotor Aviva tu Negocio",       hub: "aviva_tu_casa_ventas", quiosco: "Zempoala ATN", estado: "Hidalgo", jefe: "Andrés Rizo Mendoza", genero: "H", talla: "M", empresa: "Aviva Financial", hubspot: "7.01231004E8", fechaIngreso: "2024-12-14", status: "offboarding", offboardingTicket: "TKT-2042" },
    { num: "169_02", nombre: "Juan Luis Pérez Pérez",        puesto: "Promotor Aviva tu Negocio",       hub: "aviva_tu_casa_ventas", quiosco: "Ixtapaluca ATN", estado: "México", jefe: "Andrés Rizo Mendoza", genero: "H", talla: "L", empresa: "Aviva Financial", hubspot: "7.08221904E8", fechaIngreso: "2025-01-09", status: "active" },

    // Externos (Ejecutando Ideas)
    { num: "EI-001", nombre: "Yurtizy Carbajas Maganda",     puesto: "Promotor BA Externo",             hub: "ejecutando-ideas", quiosco: "Cuacnopalan BA", estado: "Puebla", jefe: "Alonso Vargas Pineda", genero: "M", talla: "G", empresa: "Ejecutando Ideas", hubspot: null, fechaIngreso: "2026-04-28", status: "active" },
    { num: "EI-002", nombre: "Brandon Brayan Guerra López",  puesto: "Promotor BA Externo",             hub: "ejecutando-ideas", quiosco: "Tlachichuca BA", estado: "Puebla", jefe: "Alonso Vargas Pineda", genero: "H", talla: "G", empresa: "Ejecutando Ideas", hubspot: null, fechaIngreso: "2026-04-28", status: "active" },
    { num: "EI-003", nombre: "Marcos Garrido Simón",         puesto: "Promotor BA Externo",             hub: "ejecutando-ideas", quiosco: "Cuacnopalan BA", estado: "Puebla", jefe: "Alonso Vargas Pineda", genero: "H", talla: "G", empresa: "Ejecutando Ideas", hubspot: null, fechaIngreso: "2026-05-06", status: "active" },
    { num: "EI-004", nombre: "Isabel Hernández Campos",      puesto: "Promotor BA Externo",             hub: "ejecutando-ideas", quiosco: "Putla BA", estado: "Oaxaca", jefe: "Alonso Vargas Pineda", genero: "M", talla: "G", empresa: "Ejecutando Ideas", hubspot: null, fechaIngreso: "2026-05-10", status: "active" },
    { num: "EI-005", nombre: "Beatriz Victoria Marín Santiago", puesto: "Promotor BA Externo",         hub: "ejecutando-ideas", quiosco: "Putla BA", estado: "Oaxaca", jefe: "Alonso Vargas Pineda", genero: "M", talla: "G", empresa: "Ejecutando Ideas", hubspot: null, fechaIngreso: "2026-05-10", status: "invited" },

    // Más promotores
    { num: "298_02", nombre: "Karla Jiménez Soto",           puesto: "Promotor Aviva tu Casa",          hub: "aviva_tu_casa_ventas", quiosco: "Cuautla", estado: "Morelos", jefe: "Andrés Rizo Mendoza", genero: "M", talla: "M", empresa: "Aviva Financial", hubspot: "8.40221334E8", fechaIngreso: "2025-08-04", status: "active" },
    { num: "302_02", nombre: "Fernando Aguilar Reyes",       puesto: "Promotor Aviva tu Casa",          hub: "aviva_tu_casa_ventas", quiosco: "Querétaro Centro", estado: "Querétaro", jefe: "Andrés Rizo Mendoza", genero: "H", talla: "L", empresa: "Aviva Financial", hubspot: "8.45019883E8", fechaIngreso: "2025-08-11", status: "active" },
    { num: "318_02", nombre: "Cristina Domínguez Pacheco",   puesto: "Promotor/a Aviva tu Compra",      hub: "hub3_region-pue-mor-tlax", quiosco: "Tehuacán", estado: "Puebla", jefe: "Fernanda Romero Torres", genero: "M", talla: "CH", empresa: "Aviva Financial", hubspot: "8.59023912E8", fechaIngreso: "2025-09-01", status: "active" },
    { num: "325_02", nombre: "Roberto Aguirre Salinas",      puesto: "Especialista de Expansión",        hub: "corporativo", quiosco: "Aviva House", estado: "CDMX", jefe: "Amran Frey Sánchez", genero: "H", talla: "M", empresa: "Aviva Financial", hubspot: "8.62012004E8", fechaIngreso: "2025-09-15", status: "active" },
    { num: "331_02", nombre: "Mario Quintero Vega",          puesto: "Retención",                       hub: "corporativo", quiosco: "Aviva House", estado: "CDMX", jefe: "Paula Acevedo Reyes", genero: "H", talla: "L", empresa: "Aviva Financial", hubspot: "8.71092034E8", fechaIngreso: "2025-10-01", status: "active" },
    { num: "342_02", nombre: "Tania Estrada Bermúdez",       puesto: "Retención",                       hub: "corporativo", quiosco: "Aviva House", estado: "CDMX", jefe: "Paula Acevedo Reyes", genero: "M", talla: "M", empresa: "Aviva Financial", hubspot: "8.81002104E8", fechaIngreso: "2025-10-08", status: "active" },
  ];

  // ──────────────────────────────────────────────────────────────────────────
  // Build user objects with derived fields
  // ──────────────────────────────────────────────────────────────────────────
  function makeEmail(nombre) {
    const parts = nombre.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").split(/\s+/);
    return parts[0] + "." + parts[parts.length - 1] + "@avivacredito.com";
  }
  function getInitials(nombre) {
    const parts = nombre.split(" ").filter(Boolean);
    return ((parts[0]?.[0] || "?") + (parts[parts.length - 1]?.[0] || "")).toUpperCase();
  }
  function monthsBetween(d1, d2 = new Date(2026, 4, 19)) {
    const a = new Date(d1);
    return Math.max(0, Math.floor((d2 - a) / (1000 * 60 * 60 * 24 * 30.44)));
  }

  const users = PEOPLE.map((p, i) => {
    const hireMonths = monthsBetween(p.fechaIngreso);
    return {
      id: "u-" + p.num,
      numColaborador: p.num,
      fullName: p.nombre,
      first: p.nombre.split(" ")[0],
      last: p.nombre.split(" ").slice(1).join(" "),
      email: makeEmail(p.nombre),
      role: p.puesto,
      hub: p.hub,
      quiosco: p.quiosco,
      estado: p.estado,
      managerName: p.jefe,
      manager: null, // resolved below
      empresa: p.empresa,
      genero: p.genero,
      talla: p.talla,
      hubspot: p.hubspot,
      hiredAt: p.fechaIngreso,
      hireMonths,
      status: p.status,
      offboardingTicket: p.offboardingTicket,
      avatar: { initials: getInitials(p.nombre), color: "c" + ((i % 8) + 1) },
      tablets: p.puesto.includes("Promotor") ? [{ kind: "Tablet Samsung A8", serial: "SAM" + (1000 + i) + "AV", asset: "AV-TB-" + (200 + i) }] : [],
      laptop: p.hub === "corporativo" || p.puesto.includes("Manager") ? { kind: "MacBook Air 13\"", serial: "MAC" + (2000 + i) + "AV", asset: "AV-MB-" + (100 + i) } : null,
      access: (() => {
        const base = ["google", "slack", "okta", "humand", "pld"];
        if (p.empresa === "Aviva Financial") base.push("factorial");
        if (p.puesto.includes("Promotor") || p.puesto.includes("Manager") || p.hub === "corporativo") base.push("hubspot");
        if (p.puesto.includes("Promotor")) base.push("avivaflat", "tablets");
        if (p.puesto.includes("Aviva tu Negocio")) base.push("atn-app");
        if (p.hub === "corporativo") base.push("notion", "onepass");
        return base;
      })(),
      phone: "+52 " + (Math.floor(Math.random() * 90) + 10) + " " + (1000 + i * 7).toString().slice(-4) + " " + (2000 + i * 13).toString().slice(-4),
    };
  });

  // Resolve manager ids
  const byName = {};
  users.forEach(u => byName[u.fullName] = u.id);
  users.forEach(u => { u.manager = u.managerName ? byName[u.managerName] || null : null; });

  // ──────────────────────────────────────────────────────────────────────────
  // Tickets — basados en bajas reales del archivo
  // ──────────────────────────────────────────────────────────────────────────
  const tickets = [
    {
      id: "TKT-2041",
      kind: "offboarding",
      userId: "u-186_02",
      reason: "Cambio voluntario · oportunidad laboral",
      lastDay: "2026-05-30",
      createdAt: "2026-05-12 09:14",
      createdBy: "Paula Acevedo Reyes",
      status: "in_progress",
      progress: 0.62,
      approvals: [
        { role: "Manager directo", who: "Andrés Rizo Mendoza", state: "approved", at: "2026-05-12 11:02" },
        { role: "People Operations", who: "Paula Acevedo Reyes", state: "approved", at: "2026-05-12 14:48" },
        { role: "IT / Sistemas", who: "Amran Frey Sánchez", state: "pending", at: null },
      ],
      timeline: [
        { state: "done", title: "Ticket creado", who: "Paula Acevedo · People", when: "12 may · 09:14", body: "Motivo: oportunidad laboral. Última jornada: 30 may." },
        { state: "done", title: "Aprobación de Manager", who: "Andrés Rizo Mendoza", when: "12 may · 11:02", body: "Confirmada la fecha. Solicito traspasar deals abiertos a Cristina Domínguez." },
        { state: "done", title: "Aprobación de People", who: "Paula Acevedo Reyes", when: "12 may · 14:48", body: "Documentación firmada. Activado el plan de salida." },
        { state: "current", title: "Esperando IT", who: "Amran Frey Sánchez", when: "16 may · 08:30", body: "Revisión de tareas automáticas. 5 de 9 completadas." },
        { state: "pending", title: "Entrega de tablet y uniforme", who: "Operaciones Tecamachalco", when: "30 may", body: "Recogida en el quiosco Tecamachalco BA." },
        { state: "pending", title: "Cierre y archivo", who: "Sistema", when: "31 may", body: "Archivado del expediente y borrado a los 90 días." },
      ],
      tasks: [
        { app: "google",    label: "Suspender cuenta @avivacredito.com y poner auto-respondedor",       state: "done",    when: "12 may 15:01" },
        { app: "slack",     label: "Desactivar usuario y archivar DMs",                                  state: "done",    when: "12 may 15:06" },
        { app: "okta",      label: "Revocar sesión SSO y MFA",                                           state: "done",    when: "12 may 15:08" },
        { app: "hubspot",   label: "Reasignar 23 deals abiertos a Cristina Domínguez",                  state: "done",    when: "12 may 15:12" },
        { app: "avivaflat", label: "Desactivar acceso a Aviva Flat · quiosco Tecamachalco BA",          state: "done",    when: "12 may 15:14" },
        { app: "factorial", label: "Generar finiquito y carta de cese",                                 state: "pending", when: "programado 30 may" },
        { app: "tablets",   label: "Iniciar wipe remoto de tablet AV-TB-217 y bloquear MDM",            state: "pending", when: "programado 30 may" },
        { app: "humand",    label: "Cerrar canal de inducción y dar de baja en directorio",             state: "pending", when: "programado 30 may" },
        { app: "pld",       label: "Revocar acceso al sistema PLD y archivar expediente",               state: "blocked", when: "necesita aprobación IT", err: "Aprobación requerida" },
      ],
    },
    {
      id: "TKT-2042",
      kind: "offboarding",
      userId: "u-162_02",
      reason: "Fin de contrato eventual",
      lastDay: "2026-06-15",
      createdAt: "2026-05-15 16:40",
      createdBy: "Paula Acevedo Reyes",
      status: "scheduled",
      progress: 0.10,
      approvals: [
        { role: "Manager directo", who: "Andrés Rizo Mendoza", state: "approved", at: "2026-05-15 17:10" },
        { role: "People Operations", who: "Paula Acevedo Reyes", state: "approved", at: "2026-05-15 17:30" },
        { role: "IT / Sistemas", who: "Amran Frey Sánchez", state: "pending", at: null },
      ],
      timeline: [
        { state: "done", title: "Ticket creado", who: "Paula Acevedo · People", when: "15 may · 16:40" },
        { state: "done", title: "Aprobado por Manager y People", who: "—", when: "15 may · 17:30" },
        { state: "pending", title: "Ejecución automática", who: "Sistema", when: "programado 15 jun" },
      ],
      tasks: [
        { app: "google",    label: "Suspender Google Workspace",            state: "pending", when: "programado 15 jun" },
        { app: "slack",     label: "Desactivar Slack",                       state: "pending", when: "programado 15 jun" },
        { app: "okta",      label: "Revocar SSO y MFA",                      state: "pending", when: "programado 15 jun" },
        { app: "avivaflat", label: "Desactivar Aviva Flat",                  state: "pending", when: "programado 15 jun" },
        { app: "factorial", label: "Generar finiquito",                      state: "pending", when: "programado 15 jun" },
        { app: "tablets",   label: "Wipe y recogida de tablet en Zempoala",  state: "pending", when: "programado 15 jun" },
      ],
    },
    {
      id: "TKT-2039",
      kind: "offboarding",
      userId: "u-221_02",
      reason: "Suspensión por investigación interna",
      lastDay: "2026-05-09",
      createdAt: "2026-05-08 18:22",
      createdBy: "Paula Acevedo Reyes",
      status: "completed",
      progress: 1,
      approvals: [
        { role: "Manager directo", who: "Orlando Vela Núñez", state: "approved", at: "2026-05-08 18:30" },
        { role: "People Operations", who: "Paula Acevedo Reyes", state: "approved", at: "2026-05-08 18:35" },
        { role: "IT / Sistemas", who: "Amran Frey Sánchez", state: "approved", at: "2026-05-08 18:40" },
      ],
      timeline: [
        { state: "done", title: "Ticket creado urgente", who: "Paula Acevedo · People", when: "8 may · 18:22" },
        { state: "done", title: "Todas las aprobaciones obtenidas", when: "8 may · 18:40" },
        { state: "done", title: "Ejecución completa", when: "8 may · 19:02", body: "9 de 9 tareas completadas en 22 min." },
      ],
      tasks: [],
    },
    {
      id: "TKT-2043",
      kind: "onboarding",
      userId: "u-378_02",
      reason: "Alta · Promotor/a Aviva tu Compra · Apaxco BA",
      lastDay: null,
      createdAt: "2026-05-16 10:00",
      createdBy: "Paula Acevedo Reyes",
      status: "in_progress",
      progress: 0.55,
      approvals: [],
      timeline: [],
      tasks: [],
    },
  ];

  // ──────────────────────────────────────────────────────────────────────────
  // Auditoría
  // ──────────────────────────────────────────────────────────────────────────
  const audit = [
    { id: "a1", actor: "Paula Acevedo",       actorAvatar: "PA", action: "creó ticket",   target: "TKT-2041 — baja de José Alberto Flores", when: "hace 4 h",  source: "manual" },
    { id: "a2", actor: "Sistema",             actorAvatar: "·",  action: "sincronizó",     target: "332 cuentas con HubSpot · 0 inconsistencias", when: "hace 2 min", source: "auto" },
    { id: "a3", actor: "Amran Frey",          actorAvatar: "AF", action: "actualizó",     target: "jefe inmediato de Mariana Salinas", when: "hace 1 d", source: "manual" },
    { id: "a4", actor: "Sistema",             actorAvatar: "·",  action: "ejecutó tarea", target: "Suspender Google Workspace de José Alberto Flores", when: "hace 4 h", source: "ticket TKT-2041" },
    { id: "a5", actor: "Paula Acevedo",       actorAvatar: "PA", action: "invitó",        target: "alberto.fuentes@avivacredito.com · Apaxco BA", when: "hace 2 d", source: "manual" },
    { id: "a6", actor: "Sistema",             actorAvatar: "·",  action: "detectó",       target: "cuenta huérfana en HubSpot: ex-promotor BA-Putla-42", when: "hace 3 d", source: "auto" },
    { id: "a7", actor: "Andrés Rizo",         actorAvatar: "AR", action: "promovió",      target: "Adrián Contreras a Kiosk Manager", when: "hace 5 d", source: "manual" },
    { id: "a8", actor: "Sistema",             actorAvatar: "·",  action: "completó",      target: "9 tareas del ticket TKT-2039", when: "hace 11 d", source: "auto" },
    { id: "a9", actor: "Amran Frey",          actorAvatar: "AF", action: "asignó",        target: "tablet AV-TB-256 a Joel García (Monterrey CM)", when: "hace 12 d", source: "manual" },
    { id: "a10", actor: "Sistema",            actorAvatar: "·",  action: "envió",         target: "alerta a #people-avisos: baja de José Alberto Flores", when: "hace 4 h", source: "ticket TKT-2041" },
  ];

  // KPIs sparkline (últimas semanas)
  const sparkActive  = [298, 302, 310, 315, 320, 322, 325, 328, 330, 332];
  const sparkAlta    = [4, 6, 3, 5, 7, 4, 6, 8, 5, 7];
  const sparkBaja    = [2, 1, 3, 2, 1, 4, 2, 3, 1, 2];

  // ──────────────────────────────────────────────────────────────────────────
  // Expose
  // ──────────────────────────────────────────────────────────────────────────
  window.AvivaData = {
    users, tickets, integrationsAll, audit,
    estados, hubs, puestos, quioscos,
    sparkActive, sparkAlta, sparkBaja,
    // legacy aliases used in older code
    teams: hubs.map(h => h.label),
    locations: estados,
    roles: { default: puestos },
  };
})();
