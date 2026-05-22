/**
 * Seed script — populates Firestore from mock data.
 * Run with: npx ts-node --esm scripts/seed.ts
 * Requires GOOGLE_APPLICATION_CREDENTIALS or Firebase emulator running.
 *
 * For emulator: FIRESTORE_EMULATOR_HOST=localhost:8080 npx ts-node scripts/seed.ts
 */

import { initializeApp, cert, getApps } from "firebase-admin/app";
import { getFirestore, Timestamp } from "firebase-admin/firestore";

// ── inline seed data (mirrors src/data/mock.ts without React imports) ──────

const hubs = [
  { id: "corporativo",              label: "Corporativo",                        area: "Growth",             leader: "Andrés Rizo" },
  { id: "equipo_ventas_aviva",      label: "Equipo de ventas Aviva",             area: "Kiosk Acquisitions", leader: "Andrés Arías" },
  { id: "hub1-region_hidalgo",      label: "Hub 1 · Hidalgo",                   area: "Kiosk Acquisitions", leader: "Lyz Nuñez" },
  { id: "hub2-region_edomex",       label: "Hub 2 · EdoMex",                    area: "Kiosk Acquisitions", leader: "Alonso Vargas" },
  { id: "hub3_region-pue-mor-tlax", label: "Hub 3 · Puebla · Morelos · Tlax",   area: "Kiosk Acquisitions", leader: "Fernanda Romero" },
  { id: "hub4-region_ver_oax",      label: "Hub 4 · Veracruz · Oaxaca",         area: "Kiosk Acquisitions", leader: "Noel Hernández" },
  { id: "hub5-region_yuc_roo",      label: "Hub 5 · Yucatán · Q.Roo",          area: "Kiosk Acquisitions", leader: "Yahir Ortega" },
  { id: "hub6-region-chiapas",      label: "Hub 6 · Chiapas",                   area: "Kiosk Acquisitions", leader: "Orlando Vela" },
  { id: "hub7-region-nl_slp_zac",   label: "Hub 7 · NL · SLP · Zacatecas",     area: "Kiosk Acquisitions", leader: "Daniel Soto" },
  { id: "hub8-region-ags_jal_mich", label: "Hub 8 · Ags · Jal · Mich",         area: "Kiosk Acquisitions", leader: "Abraham Castro" },
  { id: "aviva_tu_casa_ventas",     label: "Aviva tu Casa · Ventas",            area: "Kiosk Acquisitions", leader: "Andrés Rizo" },
  { id: "casa_marchand_ventas",     label: "Casa Marchand · Ventas",            area: "Kiosk Acquisitions", leader: "Alonso Vargas" },
  { id: "bodega-aurrera-piloto",    label: "Bodega Aurrera · Piloto",           area: "Kiosk Acquisitions", leader: "Andrés Rizo" },
  { id: "walmart-piloto",           label: "Walmart · Piloto",                  area: "Kiosk Acquisitions", leader: "Andrés Rizo" },
  { id: "ejecutando-ideas",         label: "Ejecutando Ideas",                  area: "Agencia",            leader: "Alonso Vargas" },
];

const puestos = [
  "Promotor/a Aviva tu Compra", "Promotor Aviva tu Compra", "Promotor Aviva tu Casa",
  "Promotor Aviva tu Negocio", "Promotor Casa Marchand",
  "Promotor Aviva tu Compra - Walmart", "Externos - Aviva tu Compra",
  "Kiosk Manager", "Growth Hub Manager", "Phygital Expansion Manager",
  "Sales Operations Manager", "Head of Sales", "Sales VP", "Chief of Growth",
  "Especialista de Expansión", "Retención",
  "Graduate Program Associate", "Jr Product Associate", "Product Designer", "BI",
];

const quioscos = [
  { name: "Aviva House",       estado: "CDMX",           producto: "Corporativo" },
  { name: "Chalco",            estado: "México",          producto: "Aviva tu Compra" },
  { name: "Ixtapaluca",        estado: "México",          producto: "Aviva tu Compra" },
  { name: "Texcoco",           estado: "México",          producto: "Aviva tu Compra" },
  { name: "Tulancingo",        estado: "Hidalgo",         producto: "Aviva tu Compra" },
  { name: "Actopan",           estado: "Hidalgo",         producto: "Aviva tu Compra" },
  { name: "Pachuca",           estado: "Hidalgo",         producto: "Aviva tu Compra" },
  { name: "Texmelucan",        estado: "Puebla",          producto: "Aviva tu Compra" },
  { name: "Tehuacán",          estado: "Puebla",          producto: "Aviva tu Compra" },
  { name: "Tlaxcala",          estado: "Tlaxcala",        producto: "Aviva tu Compra" },
  { name: "Huamantla",         estado: "Tlaxcala",        producto: "Aviva tu Compra" },
  { name: "Xochitepec",        estado: "Morelos",         producto: "Aviva tu Compra" },
  { name: "Cuautla",           estado: "Morelos",         producto: "Aviva tu Compra" },
  { name: "Querétaro Centro",  estado: "Querétaro",       producto: "Aviva tu Compra" },
  { name: "Perote BA",         estado: "Veracruz",        producto: "Aviva tu Compra · BA" },
  { name: "Huatusco BA",       estado: "Veracruz",        producto: "Aviva tu Compra · BA" },
  { name: "Fortín BA",         estado: "Veracruz",        producto: "Aviva tu Compra · BA" },
  { name: "Ixtapaluca ATN",    estado: "México",          producto: "Aviva tu Negocio" },
  { name: "Mérida ATN",        estado: "Yucatán",         producto: "Aviva tu Negocio" },
  { name: "Monterrey CM",      estado: "Nuevo León",      producto: "Casa Marchand" },
  { name: "Aguascalientes CM", estado: "Aguascalientes",  producto: "Casa Marchand" },
  { name: "Guadalajara CM",    estado: "Jalisco",         producto: "Casa Marchand" },
];

const integrations = [
  { id: "google",    name: "Google Workspace",     short: "G",  desc: "Correo @avivacredito.com",          accounts: 332, lastSync: "hace 8 min",  status: "ok",   color: "#ea4335" },
  { id: "slack",     name: "Slack",                short: "#",  desc: "Mensajería interna",                accounts: 318, lastSync: "hace 4 min",  status: "ok",   color: "#611f69" },
  { id: "hubspot",   name: "HubSpot",              short: "H",  desc: "CRM comercial · deals",             accounts: 312, lastSync: "hace 2 min",  status: "ok",   color: "#ff7a59" },
  { id: "factorial", name: "Factorial",            short: "F",  desc: "Nómina y contratos",                accounts: 308, lastSync: "hace 1 h",    status: "ok",   color: "#0066ff" },
  { id: "okta",      name: "Okta SSO",             short: "O",  desc: "Identidad · MFA",                   accounts: 332, lastSync: "hace 1 min",  status: "ok",   color: "#007dc1" },
  { id: "avivaflat", name: "Aviva Flat",           short: "AF", desc: "Plataforma interna de ventas",      accounts: 280, lastSync: "hace 14 min", status: "ok",   color: "#16b877" },
  { id: "atn-app",   name: "App Aviva tu Negocio", short: "AN", desc: "App móvil para promotores",         accounts: 192, lastSync: "hace 22 min", status: "warn", color: "#026149" },
  { id: "tablets",   name: "MDM Tablets",          short: "TB", desc: "Gestión de tablets en campo",       accounts: 245, lastSync: "hace 30 min", status: "ok",   color: "#1b3f8a" },
  { id: "pld",       name: "PLD · Compliance",     short: "PL", desc: "Prevención de lavado de dinero",    accounts: 332, lastSync: "hace 6 min",  status: "ok",   color: "#8a1b1b" },
  { id: "humand",    name: "Humand",               short: "Hu", desc: "Comunicación interna · onboarding", accounts: 332, lastSync: "hace 18 min", status: "warn", color: "#6b1b8a" },
  { id: "onepass",   name: "1Password",            short: "1P", desc: "Vault de contraseñas",              accounts: 56,  lastSync: "hace 6 min",  status: "ok",   color: "#0572ec" },
  { id: "notion",    name: "Notion",               short: "N",  desc: "Documentación corporativa",         accounts: 48,  lastSync: "hace 1 h",    status: "ok",   color: "#191919" },
];

const DOC_TYPES = [
  { id: "acta_nacimiento",       label: "Acta de Nacimiento",             required: true },
  { id: "curp",                  label: "CURP",                           required: true },
  { id: "nss",                   label: "Número de Seguridad Social",     required: true },
  { id: "caratula_bancaria",     label: "Carátula Bancaria",              required: true },
  { id: "certificado_estudios",  label: "Certificado de Estudios",        required: true },
  { id: "constancia_fiscal",     label: "Constancia de Situación Fiscal", required: true },
  { id: "carta_recomendacion",   label: "Carta de Recomendación",         required: true },
  { id: "ine",                   label: "INE",                            required: true },
  { id: "comprobante_domicilio", label: "Comprobante de Domicilio",       required: true },
  { id: "foto_profesional",      label: "Fotografía",                     required: true },
  { id: "aviso_retencion",       label: "Aviso de Retención INFONAVIT",   required: false, condition: "tieneInfonavit" },
  { id: "estado_cuenta_fonacot", label: "Estado de cuenta FONACOT",       required: false, condition: "tieneFonacot" },
];

const candidates = [
  {
    id: "cand-001", first: "Valentina", last: "Cruz Morales", fullName: "Valentina Cruz Morales",
    position: "Promotor/a Aviva tu Compra", hub: "hub1-region_hidalgo", quiosco: "Tulancingo", estado: "Hidalgo",
    stage: "in_progress", recruiter: "Paula Acevedo", createdAt: "2026-05-10",
    avatar: { initials: "VC", color: "c2" },
    docs: [
      { id: "acta_nacimiento", status: "ok" }, { id: "curp", status: "ok" },
      { id: "nss", status: "pending" }, { id: "caratula_bancaria", status: "pending" },
      { id: "certificado_estudios", status: "ok" }, { id: "constancia_fiscal", status: "review" },
      { id: "carta_recomendacion", status: "pending" }, { id: "ine", status: "ok" },
      { id: "comprobante_domicilio", status: "pending" }, { id: "foto_profesional", status: "ok" },
    ],
    answers: [
      { questionId: "estado_civil", value: "Soltera" }, { questionId: "tiene_hijos", value: false },
      { questionId: "tiene_infonavit", value: false }, { questionId: "tiene_fonacot", value: false },
      { questionId: "talla_playera", value: "S" },
    ],
    timeline: [
      { state: "done",    title: "Candidata recibida de Viterbit", who: "Sistema",         when: "10 may 2026" },
      { state: "done",    title: "Carta oferta enviada",           who: "Paula Acevedo",   when: "11 may 2026" },
      { state: "done",    title: "Oferta firmada",                 who: "Valentina Cruz",  when: "12 may 2026" },
      { state: "done",    title: "Invitación a subir documentos",  who: "Paula Acevedo",   when: "12 may 2026" },
      { state: "current", title: "Subiendo documentos",            when: "—" },
      { state: "pending", title: "Revisión de expediente",         when: "—" },
      { state: "pending", title: "Firma de contrato",              when: "—" },
      { state: "pending", title: "Inducción",                      when: "—" },
    ],
    salary: "$8,500 brutos", startDate: "2026-06-02",
    phone: "+52 771 123 4567", email: "valentina.cruz@gmail.com", viterbitId: "VIT-20450",
  },
  {
    id: "cand-002", first: "Diego", last: "Ramírez Fuentes", fullName: "Diego Ramírez Fuentes",
    position: "Kiosk Manager", hub: "hub3_region-pue-mor-tlax", quiosco: "Texmelucan", estado: "Puebla",
    stage: "contract_sent", recruiter: "Lyz Nuñez", createdAt: "2026-05-05",
    avatar: { initials: "DR", color: "c4" },
    docs: DOC_TYPES.map((d) => ({ id: d.id, status: "ok" })),
    answers: [
      { questionId: "estado_civil", value: "Casado" }, { questionId: "tiene_hijos", value: true },
      { questionId: "talla_playera", value: "L" },
    ],
    timeline: [
      { state: "done",    title: "Candidato recibido de Viterbit", when: "5 may 2026" },
      { state: "done",    title: "Carta oferta enviada",           when: "6 may 2026" },
      { state: "done",    title: "Oferta firmada",                 when: "7 may 2026" },
      { state: "done",    title: "Invitación enviada",             when: "7 may 2026" },
      { state: "done",    title: "Documentos aprobados",           when: "14 may 2026" },
      { state: "current", title: "Contrato enviado para firma",    when: "15 may 2026" },
      { state: "pending", title: "Correo corporativo",             when: "—" },
      { state: "pending", title: "Inducción",                      when: "—" },
    ],
    salary: "$16,000 brutos", startDate: "2026-06-02", email: "diego.ramirez@gmail.com",
  },
  {
    id: "cand-003", first: "Sofía", last: "Jiménez López", fullName: "Sofía Jiménez López",
    position: "Promotor/a Aviva tu Compra", hub: "hub2-region_edomex", quiosco: "Chalco", estado: "México",
    stage: "offer_sent", recruiter: "Paula Acevedo", createdAt: "2026-05-16",
    avatar: { initials: "SJ", color: "c6" }, docs: [], answers: [],
    timeline: [
      { state: "done",    title: "Candidata recibida de Viterbit", when: "16 may 2026" },
      { state: "current", title: "Carta oferta enviada",           when: "17 may 2026" },
      { state: "pending", title: "Expediente",                     when: "—" },
      { state: "pending", title: "Contrato",                       when: "—" },
    ],
    salary: "$8,500 brutos", email: "sofia.jimenez@gmail.com",
  },
  {
    id: "cand-004", first: "Miguel", last: "Hernández Torres", fullName: "Miguel Hernández Torres",
    position: "Promotor Aviva tu Negocio", hub: "hub5-region_yuc_roo", quiosco: "Mérida ATN", estado: "Yucatán",
    stage: "email_ready", recruiter: "Yahir Ortega", createdAt: "2026-04-28",
    avatar: { initials: "MH", color: "c1" },
    docs: DOC_TYPES.map((d) => ({ id: d.id, status: "ok" })),
    answers: [{ questionId: "estado_civil", value: "Soltero" }, { questionId: "talla_playera", value: "M" }],
    timeline: [
      { state: "done",    title: "Candidato recibido",         when: "28 abr 2026" },
      { state: "done",    title: "Oferta enviada y firmada",   when: "30 abr 2026" },
      { state: "done",    title: "Documentos aprobados",       when: "8 may 2026" },
      { state: "done",    title: "Contrato firmado",           when: "12 may 2026" },
      { state: "done",    title: "Correo corporativo listo",   when: "15 may 2026" },
      { state: "current", title: "Listo para handoff a HR",    when: "hoy" },
    ],
    email: "miguel.hernandez@avivacredito.com", startDate: "2026-06-02",
  },
  {
    id: "cand-005", first: "Karla", last: "Vega Sandoval", fullName: "Karla Vega Sandoval",
    position: "Promotor/a Aviva tu Compra · BA", hub: "hub4-region_ver_oax", quiosco: "Fortín BA", estado: "Veracruz",
    stage: "under_review", recruiter: "Noel Hernández", createdAt: "2026-05-12",
    avatar: { initials: "KV", color: "c3" },
    docs: [
      { id: "acta_nacimiento", status: "ok" }, { id: "curp", status: "ok" }, { id: "nss", status: "ok" },
      { id: "caratula_bancaria", status: "ok" }, { id: "certificado_estudios", status: "ok" },
      { id: "constancia_fiscal", status: "ok" }, { id: "carta_recomendacion", status: "ok" },
      { id: "ine", status: "review" }, { id: "comprobante_domicilio", status: "ok" }, { id: "foto_profesional", status: "ok" },
    ],
    answers: [{ questionId: "talla_playera", value: "XS" }],
    timeline: [
      { state: "done",    title: "Candidata recibida", when: "12 may 2026" },
      { state: "done",    title: "Oferta firmada",     when: "13 may 2026" },
      { state: "done",    title: "Documentos subidos", when: "19 may 2026" },
      { state: "current", title: "Revisión INE",       when: "hoy" },
    ],
    email: "karla.vega@gmail.com",
  },
  {
    id: "cand-006", first: "Rodrigo", last: "Salinas Peña", fullName: "Rodrigo Salinas Peña",
    position: "Promotor Casa Marchand", hub: "hub7-region-nl_slp_zac", quiosco: "Monterrey CM", estado: "Nuevo León",
    stage: "induction", recruiter: "Daniel Soto", createdAt: "2026-04-20",
    avatar: { initials: "RS", color: "c5" },
    docs: DOC_TYPES.map((d) => ({ id: d.id, status: "ok" })),
    answers: [{ questionId: "talla_playera", value: "XL" }],
    timeline: [
      { state: "done",    title: "Candidato recibido",   when: "20 abr 2026" },
      { state: "done",    title: "Oferta firmada",       when: "22 abr 2026" },
      { state: "done",    title: "Documentos aprobados", when: "30 abr 2026" },
      { state: "done",    title: "Contrato firmado",     when: "5 may 2026" },
      { state: "done",    title: "Correo corporativo",   when: "8 may 2026" },
      { state: "current", title: "Inducción en curso",   when: "desde 12 may 2026" },
    ],
    email: "rodrigo.salinas@avivacredito.com", startDate: "2026-05-12",
  },
];

const users = [
  {
    id: "u-001_02", numColaborador: "001_02",
    first: "Andrés", last: "Rizo Mendoza", fullName: "Andrés Rizo Mendoza",
    email: "andres.rizo@avivacredito.com", role: "CEO",
    area: "Growth", hub: "corporativo", quiosco: "Aviva House", estado: "CDMX", empresa: "Aviva Financial",
    genero: "H", talla: "G", manager: null, managerName: null, dealOwner: true,
    avatar: { initials: "AR", color: "c1" }, hiredAt: "2022-01-10", hireMonths: 52, status: "active",
    laptop: "MBP-001", tablets: [], access: ["google","slack","hubspot","okta","avivaflat","notion","onepass"],
    phone: "+52 55 1234 0001", hubspot: "110000001",
  },
  {
    id: "u-002_03", numColaborador: "002_03",
    first: "Paula", last: "Acevedo García", fullName: "Paula Acevedo García",
    email: "paula.acevedo@avivacredito.com", role: "People Ops Manager",
    area: "People & Culture", hub: "corporativo", quiosco: "Aviva House", estado: "CDMX", empresa: "Aviva Financial",
    genero: "M", talla: "CH", manager: "u-001_02", managerName: "Andrés Rizo Mendoza", dealOwner: false,
    avatar: { initials: "PA", color: "c2" }, hiredAt: "2022-06-01", hireMonths: 47, status: "active",
    laptop: "MBP-002", tablets: [], access: ["google","slack","okta","notion","factorial"],
    phone: "+52 55 1234 0002", hubspot: null,
  },
  {
    id: "u-003_04", numColaborador: "003_04",
    first: "Lyz", last: "Nuñez Reyes", fullName: "Lyz Nuñez Reyes",
    email: "lyz.nunez@avivacredito.com", role: "Growth Hub Manager",
    area: "Kiosk Acquisitions", hub: "hub1-region_hidalgo", quiosco: "Tulancingo", estado: "Hidalgo", empresa: "Aviva Crédito",
    genero: "M", talla: "CH", manager: "u-001_02", managerName: "Andrés Rizo Mendoza", dealOwner: true,
    avatar: { initials: "LN", color: "c3" }, hiredAt: "2023-02-01", hireMonths: 39, status: "active",
    laptop: "MBP-003", tablets: ["TAB-101"], access: ["google","slack","hubspot","okta","avivaflat"],
    phone: "+52 771 234 5678", hubspot: "120000001",
  },
  {
    id: "u-004_05", numColaborador: "004_05",
    first: "Alonso", last: "Vargas Castillo", fullName: "Alonso Vargas Castillo",
    email: "alonso.vargas@avivacredito.com", role: "Growth Hub Manager",
    area: "Kiosk Acquisitions", hub: "hub2-region_edomex", quiosco: "Ixtapaluca", estado: "México", empresa: "Aviva Crédito",
    genero: "H", talla: "G", manager: "u-001_02", managerName: "Andrés Rizo Mendoza", dealOwner: true,
    avatar: { initials: "AV", color: "c4" }, hiredAt: "2023-01-15", hireMonths: 40, status: "active",
    laptop: "MBP-004", tablets: ["TAB-102"], access: ["google","slack","hubspot","okta","avivaflat"],
    phone: "+52 55 9876 1234", hubspot: "130000001",
  },
  {
    id: "u-005_06", numColaborador: "005_06",
    first: "Mateo", last: "García Herrera", fullName: "Mateo García Herrera",
    email: "mateo.garcia@avivacredito.com", role: "IT / Sistemas",
    area: "Tecnología", hub: "corporativo", quiosco: "Aviva House", estado: "CDMX", empresa: "Aviva Financial",
    genero: "H", talla: "M", manager: "u-001_02", managerName: "Andrés Rizo Mendoza", dealOwner: false,
    avatar: { initials: "MG", color: "c5" }, hiredAt: "2022-09-01", hireMonths: 44, status: "active",
    laptop: "MBP-005", tablets: [], access: ["google","slack","okta","notion","onepass","tablets"],
    phone: "+52 55 1234 0005", hubspot: null,
  },
  {
    id: "u-006_07", numColaborador: "006_07",
    first: "Fernanda", last: "Romero Vidal", fullName: "Fernanda Romero Vidal",
    email: "fernanda.romero@avivacredito.com", role: "Growth Hub Manager",
    area: "Kiosk Acquisitions", hub: "hub3_region-pue-mor-tlax", quiosco: "Texmelucan", estado: "Puebla", empresa: "Aviva Crédito",
    genero: "M", talla: "CH", manager: "u-001_02", managerName: "Andrés Rizo Mendoza", dealOwner: true,
    avatar: { initials: "FR", color: "c6" }, hiredAt: "2023-03-01", hireMonths: 38, status: "active",
    laptop: "MBP-006", tablets: ["TAB-103"], access: ["google","slack","hubspot","okta","avivaflat"],
    phone: "+52 222 456 7890", hubspot: "140000001",
  },
  {
    id: "u-007_08", numColaborador: "007_08",
    first: "Ximena", last: "Torres Blanco", fullName: "Ximena Torres Blanco",
    email: "ximena.torres@avivacredito.com", role: "Product Designer",
    area: "Growth", hub: "corporativo", quiosco: "Aviva House", estado: "CDMX", empresa: "Aviva Financial",
    genero: "M", talla: "CH", manager: "u-001_02", managerName: "Andrés Rizo Mendoza", dealOwner: false,
    avatar: { initials: "XT", color: "c7" }, hiredAt: "2023-07-01", hireMonths: 34, status: "active",
    laptop: "MBP-007", tablets: [], access: ["google","slack","notion","okta"],
    phone: "+52 55 1234 0007", hubspot: null,
  },
  {
    id: "u-008_09", numColaborador: "008_09",
    first: "Carlos", last: "Mendoza Ríos", fullName: "Carlos Mendoza Ríos",
    email: "carlos.mendoza@avivacredito.com", role: "Promotor/a Aviva tu Compra",
    area: "Kiosk Acquisitions", hub: "hub1-region_hidalgo", quiosco: "Actopan", estado: "Hidalgo", empresa: "Aviva Crédito",
    genero: "H", talla: "M", manager: "u-003_04", managerName: "Lyz Nuñez Reyes", dealOwner: true,
    avatar: { initials: "CM", color: "c8" }, hiredAt: "2024-01-08", hireMonths: 16, status: "active",
    laptop: null, tablets: ["TAB-201"], access: ["google","slack","avivaflat"],
    phone: "+52 771 345 6789", hubspot: null,
  },
];

const tickets = [
  {
    id: "TKT-2041",
    kind: "offboarding",
    userId: "u-008_09",
    employeeName: "Carlos Mendoza Ríos",
    reason: "Renuncia voluntaria",
    lastDay: "2026-05-31",
    createdAt: "2026-05-15",
    createdBy: "Paula Acevedo",
    status: "in_progress",
    progress: 0.35,
    approvals: [
      { role: "Manager directo",     who: "Lyz Nuñez",     approverId: "u-003_04", state: "approved" },
      { role: "HR Business Partner", who: "Paula Acevedo", approverId: "u-002_03", state: "approved" },
      { role: "IT / Sistemas",       who: "Mateo García",  approverId: "u-005_06", state: "pending" },
    ],
    timeline: [
      { state: "done",    title: "Ticket creado",    who: "Paula Acevedo", when: "15 may 2026" },
      { state: "done",    title: "Manager aprobó",   who: "Lyz Nuñez",     when: "15 may 2026" },
      { state: "done",    title: "HRBP aprobó",      who: "Paula Acevedo", when: "16 may 2026" },
      { state: "current", title: "Esperando IT",     when: "—" },
      { state: "pending", title: "Revocar accesos",  when: "—" },
      { state: "pending", title: "Recuperar equipo", when: "—" },
      { state: "pending", title: "Baja completada",  when: "—" },
    ],
  },
];

const locations = [
  {
    id: "loc-001", name: "Aviva House", estado: "CDMX", tipo: "corporativo",
    status: "active", fechaApertura: "2022-01-10",
    kit: [
      { item: "Laptop", qty: 8, ok: true },
      { item: "Monitor", qty: 8, ok: true },
      { item: "Tablet", qty: 0, ok: true },
      { item: "Impresora", qty: 1, ok: true },
    ],
  },
  {
    id: "loc-002", name: "Tulancingo", estado: "Hidalgo", tipo: "quiosco",
    status: "active", fechaApertura: "2023-03-15",
    kit: [
      { item: "Tablet", qty: 3, ok: true },
      { item: "Display", qty: 1, ok: true },
      { item: "Router", qty: 1, ok: false },
    ],
  },
  {
    id: "loc-003", name: "Monterrey CM", estado: "Nuevo León", tipo: "quiosco",
    status: "active", fechaApertura: "2024-06-01",
    kit: [
      { item: "Tablet", qty: 2, ok: true },
      { item: "Display", qty: 1, ok: true },
    ],
  },
];

const emailTemplates = [
  {
    id: "tpl-email-001",
    name: "Carta oferta",
    type: "offer",
    subject: "Tu carta oferta de Aviva Crédito · {{position}}",
    body: `Hola {{firstName}},\n\nNos da mucho gusto informarte que has sido seleccionado/a para unirte al equipo de Aviva Crédito en el puesto de {{position}}.\n\nAdjunto encontrarás tu carta oferta con las condiciones de tu incorporación. Por favor revísala y fírmala a la brevedad.\n\nSi tienes dudas, responde a este correo.\n\nBienvenido/a al equipo,\nPeople Ops · Aviva Crédito`,
    updatedAt: "2026-05-01",
  },
  {
    id: "tpl-email-002",
    name: "Invitación documentos",
    type: "documents",
    subject: "Completa tu expediente · Aviva Crédito",
    body: `Hola {{firstName}},\n\nPara continuar con tu proceso de incorporación necesitamos que subas tus documentos.\n\nAccede aquí: {{formUrl}}\n\nTienes 5 días hábiles para completarlos. Si tienes dudas, escríbenos.\n\nÉxito,\nPeople Ops · Aviva Crédito`,
    updatedAt: "2026-05-01",
  },
  {
    id: "tpl-email-003",
    name: "Bienvenida",
    type: "welcome",
    subject: "¡Bienvenido/a a Aviva Crédito, {{firstName}}!",
    body: `Hola {{firstName}},\n\nEstamos emocionados de tenerte en el equipo. Tu primer día es el próximo lunes.\n\nTu correo corporativo ya está listo: {{email}}\nContraseña temporal: aviva2026 (cámbiala al entrar)\n\nNos vemos pronto,\nPeople Ops · Aviva Crédito`,
    updatedAt: "2026-04-15",
  },
];

const formQuestions = [
  { id: "q-001", order: 1, label: "Estado civil",          type: "radio",  options: ["Soltero/a","Casado/a","Unión libre","Divorciado/a"], required: true,  enabled: true },
  { id: "q-002", order: 2, label: "¿Tienes hijos?",        type: "yes_no", required: true,  enabled: true },
  { id: "q-003", order: 3, label: "Talla de playera",       type: "radio",  options: ["XS","S","M","L","XL","XXL"], required: true,  enabled: true },
  { id: "q-004", order: 4, label: "¿Tienes crédito INFONAVIT activo?", type: "yes_no", required: true,  enabled: true },
  { id: "q-005", order: 5, label: "¿Tienes crédito FONACOT activo?",   type: "yes_no", required: true,  enabled: true },
  { id: "q-006", order: 6, label: "Número de cuenta bancaria (CLABE)", type: "text",   required: true,  enabled: true },
  { id: "q-007", order: 7, label: "Nombre del banco",      type: "text",   required: true,  enabled: true },
  { id: "q-008", order: 8, label: "Contacto de emergencia (nombre y teléfono)", type: "text", required: false, enabled: true },
];

const offerTemplates = [
  {
    id: "tpl-offer-001",
    name: "Carta oferta Promotor",
    salary: "$8,500 brutos",
    startDate: "variable",
    benefits: "Seguro IMSS · Vacaciones por ley · Fondo de ahorro",
    profileNames: ["Promotor/a Aviva tu Compra", "Promotor Aviva tu Compra · BA", "Promotor Aviva tu Compra · Walmart", "Promotor BA Externo"],
    updatedAt: "2026-03-01",
  },
  {
    id: "tpl-offer-002",
    name: "Carta oferta Kiosk Manager",
    salary: "$16,000 brutos",
    startDate: "variable",
    benefits: "Seguro IMSS · Vacaciones por ley · Fondo de ahorro · Bono por desempeño",
    profileNames: ["Kiosk Manager"],
    updatedAt: "2026-03-01",
  },
  {
    id: "tpl-offer-003",
    name: "Carta oferta Corporativo",
    salary: "Variable según puesto",
    startDate: "variable",
    benefits: "Seguro de gastos médicos mayores · Vacaciones 15 días · Fondo de ahorro · Home office híbrido",
    profileNames: ["Product Designer", "BI", "Jr Product Associate", "Graduate Program Associate"],
    updatedAt: "2026-04-10",
  },
];

const contractTemplates = [
  {
    id: "tpl-contract-001",
    name: "Contrato Promotor Campo",
    type: "indefinido",
    pageCount: 8,
    hasSignatureFields: true,
    updatedAt: "2026-01-15",
  },
  {
    id: "tpl-contract-002",
    name: "Contrato Manager",
    type: "indefinido",
    pageCount: 10,
    hasSignatureFields: true,
    updatedAt: "2026-01-15",
  },
  {
    id: "tpl-contract-003",
    name: "Contrato Corporativo",
    type: "indefinido",
    pageCount: 12,
    hasSignatureFields: true,
    updatedAt: "2026-03-20",
  },
];

const catalogProducts = [
  { id: "prod-001", name: "Tablet Samsung A8",   sku: "TAB-SA8",   category: "hardware", stock: 45, assignedTo: 32, updatedAt: "2026-05-01" },
  { id: "prod-002", name: "Laptop MacBook Pro",   sku: "LPT-MBP14", category: "hardware", stock: 12, assignedTo: 11, updatedAt: "2026-04-15" },
  { id: "prod-003", name: "Display 27\" LG",      sku: "DSP-LG27",  category: "hardware", stock: 8,  assignedTo: 8,  updatedAt: "2026-03-10" },
  { id: "prod-004", name: "Router 4G Huawei",     sku: "RTR-HW4G",  category: "hardware", stock: 22, assignedTo: 15, updatedAt: "2026-05-10" },
  { id: "prod-005", name: "Playera Promotor",     sku: "UNI-PLAY",  category: "uniforme", stock: 120, assignedTo: 80, updatedAt: "2026-02-01" },
];

const catalogPositions = [
  { id: "pos-001", name: "Promotor/a Aviva tu Compra",         level: "operativo", department: "Kiosk Acquisitions", headcount: 180, updatedAt: "2026-05-01" },
  { id: "pos-002", name: "Promotor Aviva tu Compra",           level: "operativo", department: "Kiosk Acquisitions", headcount: 60,  updatedAt: "2026-05-01" },
  { id: "pos-003", name: "Promotor Aviva tu Casa",             level: "operativo", department: "Kiosk Acquisitions", headcount: 20,  updatedAt: "2026-05-01" },
  { id: "pos-004", name: "Promotor Aviva tu Negocio",          level: "operativo", department: "Kiosk Acquisitions", headcount: 15,  updatedAt: "2026-05-01" },
  { id: "pos-005", name: "Promotor Casa Marchand",             level: "operativo", department: "Kiosk Acquisitions", headcount: 18,  updatedAt: "2026-05-01" },
  { id: "pos-006", name: "Promotor Aviva tu Compra - Walmart", level: "operativo", department: "Kiosk Acquisitions", headcount: 8,   updatedAt: "2026-05-01" },
  { id: "pos-007", name: "Externos - Aviva tu Compra",         level: "operativo", department: "Kiosk Acquisitions", headcount: 6,   updatedAt: "2026-05-01" },
  { id: "pos-008", name: "Kiosk Manager",                      level: "manager",   department: "Kiosk Acquisitions", headcount: 22,  updatedAt: "2026-04-01" },
  { id: "pos-009", name: "Growth Hub Manager",                 level: "senior",    department: "Kiosk Acquisitions", headcount: 8,   updatedAt: "2026-04-01" },
  { id: "pos-010", name: "Phygital Expansion Manager",         level: "senior",    department: "Growth",             headcount: 3,   updatedAt: "2026-04-01" },
  { id: "pos-011", name: "Sales Operations Manager",           level: "manager",   department: "Sales",              headcount: 2,   updatedAt: "2026-04-01" },
  { id: "pos-012", name: "Head of Sales",                      level: "director",  department: "Sales",              headcount: 1,   updatedAt: "2026-05-01" },
  { id: "pos-013", name: "Sales VP",                           level: "vp",        department: "Sales",              headcount: 1,   updatedAt: "2026-05-01" },
  { id: "pos-014", name: "Chief of Growth",                    level: "clevel",    department: "Growth",             headcount: 1,   updatedAt: "2026-05-01" },
  { id: "pos-015", name: "Especialista de Expansión",          level: "senior",    department: "Growth",             headcount: 4,   updatedAt: "2026-04-01" },
  { id: "pos-016", name: "Retención",                          level: "operativo", department: "Kiosk Acquisitions", headcount: 5,   updatedAt: "2026-04-01" },
  { id: "pos-017", name: "Graduate Program Associate",         level: "junior",    department: "Growth",             headcount: 4,   updatedAt: "2026-03-01" },
  { id: "pos-018", name: "Jr Product Associate",               level: "junior",    department: "Growth",             headcount: 3,   updatedAt: "2026-03-01" },
  { id: "pos-019", name: "Product Designer",                   level: "senior",    department: "Growth",             headcount: 2,   updatedAt: "2026-03-01" },
  { id: "pos-020", name: "BI",                                 level: "senior",    department: "Growth",             headcount: 2,   updatedAt: "2026-03-01" },
];

const appSettings = {
  theme: "light",
  density: "comfortable",
  language: "es",
  defaultRecruiter: "u-002_03",
};

// ── Catalog: stages ───────────────────────────────────────────────────────

const stages = [
  { id: "offer_held",      label: "Oferta retenida",  group: "offer",     color: "#8a5a00", bg: "#fff5d6", desc: "Pendiente: salario o fecha en Viterbit.",       order: 0 },
  { id: "offer_sent",      label: "Carta enviada",    group: "offer",     color: "#5c2e8e", bg: "#ece2f5", desc: "Esperando firma del candidato.",                 order: 1 },
  { id: "offer_signed",    label: "Oferta firmada",   group: "offer",     color: "#026149", bg: "#e7f8ef", desc: "Firma recibida. Activando expediente.",          order: 2 },
  { id: "invited",         label: "Invitado",         group: "documents", color: "#1b3f8a", bg: "#e3eeff", desc: "Enlace de documentos enviado.",                  order: 3 },
  { id: "in_progress",     label: "En proceso",       group: "documents", color: "#b15a0c", bg: "#fbece0", desc: "Subiendo documentos.",                          order: 4 },
  { id: "under_review",    label: "Revisión",         group: "documents", color: "#b15a0c", bg: "#fbece0", desc: "Documentos completos, revisando.",              order: 5 },
  { id: "approved",        label: "Aprobado",         group: "documents", color: "#026149", bg: "#e7f8ef", desc: "Expediente aprobado.",                          order: 6 },
  { id: "rejected",        label: "Rechazado",        group: "documents", color: "#a8200d", bg: "#ffe2dc", desc: "Expediente rechazado.",                         order: 7 },
  { id: "contract_sent",   label: "Contrato enviado", group: "contract",  color: "#5c2e8e", bg: "#ece2f5", desc: "Pendiente de firma.",                           order: 8 },
  { id: "contract_signed", label: "Contrato firmado", group: "contract",  color: "#026149", bg: "#e7f8ef", desc: "Listo para provisionar correos.",              order: 9 },
  { id: "email_pending",   label: "Correo pendiente", group: "accounts",  color: "#b15a0c", bg: "#fbece0", desc: "Ticket IT abierto en Jira.",                   order: 10 },
  { id: "email_ready",     label: "Correo listo",     group: "accounts",  color: "#026149", bg: "#e7f8ef", desc: "Provisionado. Listo para handoff a HR.",       order: 11 },
  { id: "induction",       label: "Inducción",        group: "induction", color: "#1b3f8a", bg: "#e3eeff", desc: "En curso · ya es colaborador en HR.",          order: 12 },
  { id: "disqualified",    label: "Descalificado",    group: "rejected",  color: "#6b716b", bg: "#f1f1ee", desc: "Descartado manualmente.",                       order: 13 },
];

const groupMeta = [
  { id: "offer",     label: "Carta oferta", color: "#5c2e8e", bg: "#ece2f5" },
  { id: "documents", label: "Documentos",   color: "#b15a0c", bg: "#fbece0" },
  { id: "contract",  label: "Contrato",     color: "#5c2e8e", bg: "#ece2f5" },
  { id: "accounts",  label: "Correos",      color: "#026149", bg: "#e7f8ef" },
  { id: "induction", label: "Inducción",    color: "#1b3f8a", bg: "#e3eeff" },
  { id: "rejected",  label: "Rechazados",   color: "#6b716b", bg: "#f1f1ee" },
];

const docTypes = [
  { id: "acta_nacimiento",       label: "Acta de Nacimiento",             required: true,  order: 0 },
  { id: "curp",                  label: "CURP",                           required: true,  order: 1 },
  { id: "nss",                   label: "Número de Seguridad Social",     required: true,  order: 2 },
  { id: "caratula_bancaria",     label: "Carátula Bancaria",              required: true,  order: 3 },
  { id: "certificado_estudios",  label: "Certificado de Estudios",        required: true,  order: 4 },
  { id: "constancia_fiscal",     label: "Constancia de Situación Fiscal", required: true,  order: 5 },
  { id: "carta_recomendacion",   label: "Carta de Recomendación",         required: true,  order: 6 },
  { id: "ine",                   label: "INE",                            required: true,  order: 7 },
  { id: "comprobante_domicilio", label: "Comprobante de Domicilio",       required: true,  order: 8 },
  { id: "foto_profesional",      label: "Fotografía",                     required: true,  order: 9 },
  { id: "aviso_retencion",       label: "Aviso de Retención INFONAVIT",   required: false, condition: "tieneInfonavit", order: 10 },
  { id: "estado_cuenta_fonacot", label: "Estado de cuenta FONACOT",       required: false, condition: "tieneFonacot",   order: 11 },
];

const estadosList = [
  "México", "Hidalgo", "Veracruz", "Puebla", "Chiapas", "CDMX", "Tlaxcala",
  "Morelos", "Querétaro", "Oaxaca", "Yucatán", "Aguascalientes", "Nuevo León",
  "Jalisco", "San Luis Potosí", "Campeche", "Michoacán", "Guanajuato",
  "Quintana Roo", "Tabasco", "Coahuila", "Guerrero",
].map((name, order) => ({ id: name.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/\s+/g, "_"), name, order }));

// ── Seed runner ────────────────────────────────────────────────────────────

async function seed() {
  if (!getApps().length) {
    initializeApp();
  }
  const db = getFirestore();

  const batch = (items: { id: string; [k: string]: unknown }[], collectionPath: string) =>
    Promise.all(items.map(({ id, ...data }) => db.collection(collectionPath).doc(id).set(data)));

  console.log("Seeding Firestore...");

  // ── Additional settings data ──────────────────────────────────────────────
  const workspaceData    = { name: "Aviva Crédito", domain: "@avivacredito.com", timezone: "America/Mexico_City (GMT−6)" };
  const gmailData        = { connected: true, email: "people@avivacredito.com", sentCount: 312, deliveryRate: 98.7, bounces: 4 };
  const remindersData    = { enabled: true, intervalHours: 48, maxReminders: 3 };
  const linkDurationData = { formDays: 7, offerDays: 5, contractDays: 3 };
  const brandingData     = { palette: [
    { color: "#b0f5cd", label: "Mint" },
    { color: "#16b877", label: "Verde" },
    { color: "#026149", label: "Verde profundo" },
    { color: "#FFFFFF",  label: "Blanco" },
  ]};
  const approvalsData = { chains: [
    { evt: "Alta de persona",       chain: ["HR Business Partner"] },
    { evt: "Baja por renuncia",     chain: ["Manager directo", "HR Business Partner", "IT / Sistemas"] },
    { evt: "Baja por despido",      chain: ["HR Business Partner", "Legal", "IT / Sistemas"] },
    { evt: "Suspensión inmediata",  chain: ["HR Business Partner", "Legal"] },
    { evt: "Acceso a app sensible", chain: ["Manager directo", "IT / Sistemas"] },
  ]};
  const notifRulesData = {
    slackEnabled: true, emailEnabled: true,
    slackWorkspace: "aviva-credito.slack.com",
    slackMeta: "4 canales · 8 eventos suscritos · webhook OK",
    emailAddress: "people@avivacredito.com",
    emailMeta: "HR Business Partners + Managers",
    rules: [
      { id: "offboard.created",   label: "Baja iniciada",             channel: "#people-avisos", slack: true,  email: true  },
      { id: "offboard.approved",  label: "Baja aprobada",             channel: "#people-avisos", slack: true,  email: false },
      { id: "offboard.completed", label: "Baja ejecutada",            channel: "#people-bajas",  slack: true,  email: true  },
      { id: "offboard.failed",    label: "Tarea de baja fallida",     channel: "#it-alertas",    slack: true,  email: true  },
      { id: "onboard.created",    label: "Alta creada",               channel: "#people-altas",  slack: true,  email: false },
      { id: "access.granted",     label: "Acceso fuera de plantilla", channel: "#it-alertas",    slack: true,  email: true  },
    ],
  };
  const retentionData = { policies: [
    { key: "Perfil archivado",                        value: "90 días tras la última jornada" },
    { key: "Documentos legales (contrato, finiquito)", value: "10 años (obligación legal)" },
    { key: "Log de auditoría",                         value: "5 años" },
    { key: "Backups cifrados",                         value: "30 días" },
    { key: "Cuenta SSO / email",                       value: "Desactivada el día de baja · borrada a los 30 días" },
  ]};

  const rolesData = [
    { id: "r-admin",   name: "Administrador",          desc: "Acceso total a la plataforma. Configura integraciones, roles y ajustes.",      level: "Acceso completo",  color: "#026149", members: 1 },
    { id: "r-people",  name: "People Ops Manager",     desc: "Crea y gestiona el ciclo completo: altas, bajas, candidatos y documentos.",    level: "Acceso completo",  color: "#16b877", members: 2 },
    { id: "r-hr",      name: "HR Business Partner",    desc: "Aprueba tickets, revisa expedientes y gestiona el equipo asignado.",           level: "Gestión",          color: "#1b8a5a", members: 4 },
    { id: "r-legal",   name: "Legal",                  desc: "Acceso a contratos, finiquitos y log de auditoría. Solo lectura en directorio.", level: "Lectura + Legal", color: "#5c2e8e", members: 2 },
    { id: "r-nomina",  name: "Nómina",                 desc: "Acceso a datos bancarios, tallas y documentos de nómina. Sin acceso a tickets.", level: "Lectura",        color: "#8a5a00", members: 2 },
    { id: "r-mgr",     name: "Manager",                desc: "Ve su equipo directo, inicia tickets de baja y aprueba accesos.",               level: "Aprobaciones",    color: "#1b3f8a", members: 12 },
    { id: "r-head",    name: "Head of Area",           desc: "Vista de toda su área. Puede ver reportes y aprobar tickets de nivel gerencia.", level: "Reportes",       color: "#a8200d", members: 5 },
    { id: "r-clevel",  name: "C-Level",                desc: "Vista ejecutiva de headcount, bajas y KPIs. Sin acceso a datos sensibles.",     level: "Solo lectura",    color: "#3a3a3a", members: 3 },
    { id: "r-it",      name: "IT / Sistemas",          desc: "Gestiona accesos, revoca credenciales y ejecuta tareas de offboarding técnico.", level: "Acceso técnico", color: "#0066cc", members: 2 },
    { id: "r-recruiter", name: "Reclutador",           desc: "Crea y gestiona candidatos. Sin acceso al directorio de colaboradores activos.", level: "Candidatos",     color: "#611f69", members: 4 },
  ];

  const apiKeysData = [
    { id: "k1", name: "Producción · Backend",  prefix: "ak_live_w7F2", scopes: ["users:read","users:write","tickets:read"], lastUsed: "hace 4 min", status: "ok",    author: "Amran Frey"   },
    { id: "k2", name: "Staging · Backend",     prefix: "ak_test_2qD9", scopes: ["users:read","users:write"],                lastUsed: "hace 1 h",   status: "ok",    author: "Amran Frey"   },
    { id: "k3", name: "BI · Lectura",          prefix: "ak_live_bM4r", scopes: ["users:read","audit:read"],                 lastUsed: "hace 2 d",   status: "ok",    author: "Sofía Ramírez" },
    { id: "k4", name: "HubSpot Sync",          prefix: "ak_live_h0p1", scopes: ["users:read","users:write","events:write"],  lastUsed: "hace 1 min", status: "ok",    author: "Andrés Arías"  },
    { id: "k5", name: "Webhooks Slack viejo",  prefix: "ak_live_old3", scopes: ["events:write"],                             lastUsed: "hace 47 d",  status: "stale", author: "Paula Acevedo" },
  ];

  const webhooksData = [
    { id: "wh1", url: "https://api.aviva.com/hr/people-events",  events: ["onboard.*","offboard.*"],                status: "ok",   last: "hace 2 min · 200" },
    { id: "wh2", url: "https://hooks.hubspot.com/aviva-people",  events: ["users.created","users.updated"],         status: "ok",   last: "hace 8 min · 200" },
    { id: "wh3", url: "https://internal.aviva.com/audit-stream", events: ["*"],                                     status: "warn", last: "hace 14 min · 503" },
  ];

  await Promise.all([
    batch(stages,      "catalog/stages/items"),
    batch(groupMeta,   "catalog/groupMeta/items"),
    batch(docTypes,    "catalog/docTypes/items"),
    batch(estadosList, "catalog/estados/items"),
    batch(hubs,        "catalog/hubs/items"),
    batch(quioscos.map((q, i) => ({ id: `quiosco-${String(i).padStart(3, "0")}`, ...q })), "catalog/quioscos/items"),
    Promise.all(puestos.map((p, i) => db.collection("catalog/positions/items").doc(`pos-${String(i).padStart(3, "0")}`).set({ name: p, order: i }))),
    batch(integrations,      "integrations"),
    batch(candidates,        "candidates"),
    batch(users,             "users"),
    batch(tickets,           "tickets"),
    batch(locations,         "locations"),
    batch(emailTemplates,    "templates/emails/items"),
    batch(formQuestions,     "templates/formConfig/questions"),
    batch(offerTemplates,    "templates/offers/items"),
    batch(contractTemplates, "templates/contracts/items"),
    batch(catalogProducts,   "catalog/products/items"),
    batch(catalogPositions,  "catalog/positions/items"),
    db.collection("settings").doc("app").set(appSettings),
    db.collection("settings").doc("workspace").set(workspaceData),
    db.collection("settings").doc("gmail").set(gmailData),
    db.collection("settings").doc("reminders").set(remindersData),
    db.collection("settings").doc("linkDuration").set(linkDurationData),
    db.collection("settings").doc("branding").set(brandingData),
    db.collection("settings").doc("approvals").set(approvalsData),
    db.collection("settings").doc("notifRules").set(notifRulesData),
    db.collection("settings").doc("retention").set(retentionData),
    batch(rolesData,    "roles"),
    batch(apiKeysData,  "apiKeys"),
    batch(webhooksData, "webhooks"),
  ]);

  console.log("Done. All collections seeded.");
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
