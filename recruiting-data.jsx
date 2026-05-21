// Aviva HR — Recruiting data layer (seed)
// Loaded after data.jsx, catalog-data.jsx. Exposes window.RecruitingData.
(function () {
  // ─── Stages of the recruiting pipeline (canonical order) ──────────────────
  // Same shape as the real codebase (Recruiting/src/types/index.ts CandidateStatus).
  const STAGES = [
    { id: "offer_held",      label: "Oferta retenida",  group: "offer",     color: "#8a5a00", bg: "#fff5d6", desc: "Pendiente: salario o fecha en Viterbit." },
    { id: "offer_sent",      label: "Carta enviada",    group: "offer",     color: "#5c2e8e", bg: "#ece2f5", desc: "Esperando firma del candidato." },
    { id: "offer_signed",    label: "Oferta firmada",   group: "offer",     color: "#026149", bg: "#e7f8ef", desc: "Firma recibida. Activando expediente." },
    { id: "invited",         label: "Invitado",         group: "documents", color: "#1b3f8a", bg: "#e3eeff", desc: "Enlace de documentos enviado." },
    { id: "in_progress",     label: "En proceso",       group: "documents", color: "#b15a0c", bg: "#fbece0", desc: "Subiendo documentos." },
    { id: "under_review",    label: "Revisión",         group: "documents", color: "#b15a0c", bg: "#fbece0", desc: "Documentos completos, revisando." },
    { id: "approved",        label: "Aprobado",         group: "documents", color: "#026149", bg: "#e7f8ef", desc: "Expediente aprobado." },
    { id: "rejected",        label: "Rechazado",        group: "documents", color: "#a8200d", bg: "#ffe2dc", desc: "Expediente rechazado." },
    { id: "contract_sent",   label: "Contrato enviado", group: "contract",  color: "#5c2e8e", bg: "#ece2f5", desc: "Pendiente de firma." },
    { id: "contract_signed", label: "Contrato firmado", group: "contract",  color: "#026149", bg: "#e7f8ef", desc: "Listo para provisionar correos." },
    { id: "email_pending",   label: "Correo pendiente", group: "accounts",  color: "#b15a0c", bg: "#fbece0", desc: "Ticket IT abierto en Jira." },
    { id: "email_ready",     label: "Correo listo",     group: "accounts",  color: "#026149", bg: "#e7f8ef", desc: "Provisionado. Listo para handoff a HR." },
    { id: "induction",       label: "Inducción",        group: "induction", color: "#1b3f8a", bg: "#e3eeff", desc: "En curso · ya es colaborador en HR." },
    { id: "disqualified",    label: "Descalificado",    group: "rejected",  color: "#6b716b", bg: "#f1f1ee", desc: "Descartado manualmente." },
  ];

  const GROUP_META = {
    offer:     { label: "Carta oferta",  color: "#5c2e8e", bg: "#ece2f5" },
    documents: { label: "Documentos",    color: "#b15a0c", bg: "#fbece0" },
    contract:  { label: "Contrato",      color: "#5c2e8e", bg: "#ece2f5" },
    accounts:  { label: "Correos",       color: "#026149", bg: "#e7f8ef" },
    induction: { label: "Inducción",     color: "#1b3f8a", bg: "#e3eeff" },
    rejected:  { label: "Rechazados",    color: "#6b716b", bg: "#f1f1ee" },
  };

  // ─── Document types collected during recruiting ──────────────────────────
  const DOC_TYPES = [
    { id: "acta_nacimiento",       label: "Acta de Nacimiento",            required: true },
    { id: "curp",                  label: "CURP",                          required: true },
    { id: "nss",                   label: "Número de Seguridad Social",    required: true },
    { id: "caratula_bancaria",     label: "Carátula Bancaria",             required: true },
    { id: "certificado_estudios",  label: "Certificado de Estudios",       required: true },
    { id: "constancia_fiscal",     label: "Constancia de Situación Fiscal",required: true },
    { id: "carta_recomendacion",   label: "Carta de Recomendación",        required: true },
    { id: "ine",                   label: "INE",                           required: true },
    { id: "comprobante_domicilio", label: "Comprobante de Domicilio",      required: true },
    { id: "foto_profesional",      label: "Fotografía",                    required: true },
    { id: "aviso_retencion",       label: "Aviso de Retención INFONAVIT",  required: false, condition: "tieneInfonavit" },
    { id: "estado_cuenta_fonacot", label: "Estado de cuenta FONACOT",      required: false, condition: "tieneFonacot" },
  ];

  // ─── Form questions (configurable) ───────────────────────────────────────
  const FORM_QUESTIONS = [
    { id: "estado_civil",  label: "Estado civil",             type: "radio",   options: ["Soltero","Casado","Unión libre"], required: true,  enabled: true, order: 1, builtinKey: "estadoCivil" },
    { id: "tiene_hijos",   label: "¿Tienes hijos?",           type: "yes_no",  required: true,  enabled: true, order: 2, builtinKey: "tieneHijos" },
    { id: "tiene_infonavit",label:"¿Tienes crédito INFONAVIT?",type: "yes_no", required: true,  enabled: true, order: 3, builtinKey: "tieneInfonavit" },
    { id: "tiene_fonacot", label: "¿Tienes crédito FONACOT?",  type: "yes_no",  required: true,  enabled: true, order: 4, builtinKey: "tieneFonacot" },
    { id: "talla_playera", label: "Talla de uniforme",        type: "select",  options: ["XS","S","M","L","XL","XXL"], required: true, enabled: true, order: 5, builtinKey: "tallaPlayera" },
    { id: "sobre_ti",      label: "Cuéntanos sobre ti",       type: "textarea", required: false, enabled: true, order: 6, builtinKey: "sobreTi" },
    { id: "trabajo_finan", label: "¿Has trabajado en banca o fintech?", type: "yes_no", required: true, enabled: true, order: 7, builtinKey: "trabajoEntidadFinanciera" },
    { id: "ben_nombre",    label: "Nombre del beneficiario",  type: "text",    required: true, enabled: true, order: 8, builtinKey: "beneficiarioNombre" },
    { id: "ben_parent",    label: "Parentesco del beneficiario", type: "select", options: ["Padre/Madre","Hermano(a)","Esposo(a)","Hijo(a)"], required: true, enabled: true, order: 9, builtinKey: "beneficiarioParentesco" },
    { id: "contacto1_nom", label: "Contacto de emergencia 1 · nombre", type: "text", required: true, enabled: true, order: 10, builtinKey: "contacto1Nombre" },
    { id: "contacto1_tel", label: "Contacto de emergencia 1 · teléfono", type: "text", required: true, enabled: true, order: 11, builtinKey: "contacto1Telefono" },
    { id: "contacto2_nom", label: "Contacto de emergencia 2 · nombre", type: "text", required: false, enabled: true, order: 12, builtinKey: "contacto2Nombre" },
  ];

  // ─── Email templates ─────────────────────────────────────────────────────
  const EMAIL_TEMPLATES = [
    { id: "invitation", type: "invitation", name: "Invitación a subir documentos", subject: "{{firstName}}, bienvenido(a) a Aviva · sube tus documentos",
      body: "Hola {{firstName}},\n\n¡Bienvenido(a) al equipo de Aviva Crédito! Antes de tu primer día necesitamos que subas algunos documentos.\n\nEnlace personal (válido {{linkDays}} días):\n{{formUrl}}\n\nSi tienes dudas, responde a este correo.\n\nEquipo de People · Aviva", updatedAt: "2026-04-22" },
    { id: "reminder", type: "reminder", name: "Recordatorio de documentos", subject: "Recordatorio · {{firstName}}, faltan documentos para tu alta",
      body: "Hola {{firstName}},\n\nTe recordamos que tu expediente sigue pendiente. Ya subiste {{completed}}/{{total}} documentos.\n\nReanuda aquí:\n{{formUrl}}\n\nQuedan {{daysLeft}} días antes de que tu enlace expire.\n\nPaula · People Ops", updatedAt: "2026-05-02" },
    { id: "approved", type: "approved", name: "Expediente aprobado", subject: "{{firstName}}, tu expediente está aprobado",
      body: "Hola {{firstName}},\n\nTu expediente está aprobado. En las próximas 24h recibirás tu contrato para firma digital.\n\nNos vemos pronto,\nAviva Crédito", updatedAt: "2026-04-30" },
    { id: "rejected", type: "rejected", name: "Expediente rechazado", subject: "Sobre tu expediente en Aviva",
      body: "Hola {{firstName}},\n\nTras revisar tu expediente no podemos continuar con la contratación. {{reason}}\n\nGracias por tu tiempo.\nPeople Operations · Aviva", updatedAt: "2026-03-14" },
    { id: "ocr_error", type: "ocr_error", name: "Documento ilegible", subject: "{{firstName}}, vuelve a subir tu {{docLabel}}",
      body: "Hola {{firstName}},\n\nEl documento {{docLabel}} no pasó la validación automática. Por favor sube una imagen más clara o un PDF legible.\n\nEnlace:\n{{formUrl}}\n\nPaula · People Ops", updatedAt: "2026-05-10" },
    { id: "contract", type: "contract", name: "Firma de contrato", subject: "{{firstName}}, firma tu contrato de Aviva",
      body: "Hola {{firstName}},\n\nTu contrato ya está listo. Fírmalo digitalmente aquí (válido {{linkDays}} días):\n{{contractUrl}}\n\nUna vez firmado, te enviaremos tus accesos corporativos.\n\nLegal · Aviva Crédito", updatedAt: "2026-04-18" },
    { id: "induction", type: "induction", name: "Bienvenida e inducción", subject: "¡{{firstName}}, bienvenido(a) oficialmente a Aviva!",
      body: "Hola {{firstName}},\n\nTu correo corporativo {{corporateEmail}} ya está activo. Slack y HubSpot también.\n\nLa inducción inicia el {{startDate}} en {{location}}. Tu Kiosk Manager será {{manager}}.\n\n¡Nos vemos!\nPeople Ops · Aviva", updatedAt: "2026-05-15" },
    { id: "offer", type: "offer", name: "Envío de carta oferta", subject: "Tu carta oferta de Aviva, {{firstName}}",
      body: "Hola {{firstName}},\n\nAdjuntamos tu carta oferta para el puesto de {{position}}. Fírmala digitalmente aquí (válida {{linkDays}} días):\n{{offerUrl}}\n\nSi tienes preguntas, responde a este correo.\n\nReclutamiento · Aviva", updatedAt: "2026-05-08" },
  ];

  // ─── Offer letter templates ──────────────────────────────────────────────
  const OFFER_TEMPLATES = [
    { id: "ot-1", name: "Promotor/a Aviva tu Compra", profileNames: ["Promotor/a Aviva tu Compra","Promotor/a Aviva tu Compra (Comodín)"],
      positionKeywords: ["promotor","aviva tu compra"], salary: "$8,500 brutos", benefits: "Vales de despensa $1,500 · SGMM · 15 días aguinaldo · 6 días vacaciones", startDate: "primer lunes del mes siguiente",
      updatedAt: "2026-05-12" },
    { id: "ot-2", name: "Promotor/a Casa Marchand", profileNames: ["Promotor/a Aviva tu Compra CM"], positionKeywords: ["casa marchand"], salary: "$9,200 brutos",
      benefits: "Vales · SGMM · 15 días aguinaldo · 6 días vacaciones", startDate: "primer lunes del mes siguiente", updatedAt: "2026-04-30" },
    { id: "ot-3", name: "Promotor/a Aviva tu Negocio", profileNames: ["Promotor/a Aviva tu Negocio"], positionKeywords: ["aviva tu negocio","atn"], salary: "$10,500 brutos",
      benefits: "Vales · SGMM · 15 días · 6 días · Bono trimestral", startDate: "negociable", updatedAt: "2026-05-04" },
    { id: "ot-4", name: "Kiosk Manager / Trainee", profileNames: ["Trainee Sucursal (Kiosk Trainee)","Gerente de Sucursal (Kiosk Manager)"],
      positionKeywords: ["kiosk manager","trainee"], salary: "$14,500 - $18,000", benefits: "SGMM · vales · auto utilitario · bono trimestral", startDate: "negociable", updatedAt: "2026-05-18" },
  ];

  const CONTRACT_TEMPLATES = [
    { id: "ct-1", name: "Contrato individual de trabajo · indeterminado", positionKeywords: ["promotor"], type: "html", pageCount: 4, hasSignatureFields: true, hasInitials: true, updatedAt: "2026-04-22" },
    { id: "ct-2", name: "Contrato individual de trabajo · eventual", positionKeywords: ["temporal","piloto"], type: "html", pageCount: 4, hasSignatureFields: true, hasInitials: true, updatedAt: "2026-03-30" },
    { id: "ct-3", name: "Contrato Kiosk Manager", positionKeywords: ["manager"], type: "pdf", pageCount: 6, hasSignatureFields: true, hasInitials: true, updatedAt: "2026-05-06" },
  ];

  // ─── Sample candidates spanning the entire pipeline ──────────────────────
  function tplExp(daysFromNow) {
    const d = new Date(2026, 4, 19);
    d.setDate(d.getDate() + daysFromNow);
    return d.toISOString().slice(0, 10);
  }
  function avatar(name, color) {
    const parts = name.split(" ").filter(Boolean);
    const ini = ((parts[0]?.[0] || "?") + (parts[parts.length-1]?.[0] || "")).toUpperCase();
    return { initials: ini, color: color || "c" + ((name.charCodeAt(0) % 8) + 1) };
  }

  const CANDIDATES = [
    // Etapa: Oferta
    { id: "cand-001", firstName: "Mariana", lastName: "Gómez Lara", email: "mariana.gomez@gmail.com", phone: "+52 55 1234 5678",
      position: "Promotor/a Aviva tu Compra", profile: "Promotor/a Aviva tu Compra", status: "offer_held", createdBy: "Paula Acevedo",
      createdAt: "2026-05-17 10:00", recruiter: "Paula Acevedo", locationId: "loc-0025", reminderCount: 0,
      offerTemplateId: "ot-1", offerExpiresAt: tplExp(7), notes: "Falta confirmar salario con Viterbit.",
      docs: {}, completion: 0, avatar: avatar("Mariana Gómez") },

    { id: "cand-002", firstName: "Roberto", lastName: "Cervantes Páez", email: "roberto.cervantes@outlook.com", phone: "+52 55 2233 4455",
      position: "Promotor/a Aviva tu Negocio", profile: "Promotor/a Aviva tu Negocio", status: "offer_sent", createdBy: "Diego Tovar",
      createdAt: "2026-05-15 14:30", recruiter: "Diego Tovar", locationId: "loc-0029", reminderCount: 1,
      offerTemplateId: "ot-3", offerExpiresAt: tplExp(5),
      docs: {}, completion: 0, avatar: avatar("Roberto Cervantes") },

    { id: "cand-003", firstName: "Esmeralda", lastName: "Quiroz Bautista", email: "esmeralda.quiroz@yahoo.com", phone: "+52 56 7788 9911",
      position: "Promotor/a Aviva tu Compra CM", profile: "Promotor/a Aviva tu Compra CM", status: "offer_signed", createdBy: "Diego Tovar",
      createdAt: "2026-05-14 09:10", recruiter: "Diego Tovar", locationId: "loc-0226",
      offerTemplateId: "ot-2", offerSignedAt: "2026-05-15 16:42",
      docs: {}, completion: 0, avatar: avatar("Esmeralda Quiroz") },

    // Etapa: Documentos
    { id: "cand-004", firstName: "Alberto Yafte", lastName: "Fuentes Vargas", email: "alberto.fuentes@avivacredito.com", phone: "+52 55 3322 1100",
      position: "Promotor/a Aviva tu Compra", profile: "Promotor/a Aviva tu Compra", status: "invited", createdBy: "Paula Acevedo",
      createdAt: "2026-05-16 11:00", recruiter: "Paula Acevedo", locationId: "loc-0022",
      formExpiresAt: tplExp(12),
      docs: { foto_profesional: "uploaded" }, completion: 8, avatar: avatar("Alberto Fuentes") },

    { id: "cand-005", firstName: "Lorena", lastName: "Sánchez Rojas", email: "lorena.sanchez01@gmail.com", phone: "+52 22 1100 9988",
      position: "Promotor/a Aviva tu Compra", profile: "Promotor/a Aviva tu Compra", status: "in_progress", createdBy: "Paula Acevedo",
      createdAt: "2026-05-10 09:15", recruiter: "Paula Acevedo", locationId: "loc-0026",
      docs: { ine: "valid", curp: "valid", nss: "valid", caratula_bancaria: "uploaded", certificado_estudios: "review", constancia_fiscal: "invalid",
              foto_profesional: "valid", comprobante_domicilio: "valid" },
      completion: 50, reminderCount: 2,
      avatar: avatar("Lorena Sánchez") },

    { id: "cand-006", firstName: "Jonathan", lastName: "Reyes Morales", email: "jonathan.reyes@hotmail.com", phone: "+52 56 5544 3322",
      position: "Promotor/a Aviva tu Compra", profile: "Promotor/a Aviva tu Compra", status: "under_review", createdBy: "Diego Tovar",
      createdAt: "2026-05-04 18:20", recruiter: "Diego Tovar", locationId: "loc-0035",
      docs: { ine: "valid", curp: "valid", nss: "valid", caratula_bancaria: "valid", certificado_estudios: "valid", constancia_fiscal: "valid",
              foto_profesional: "valid", comprobante_domicilio: "valid", acta_nacimiento: "valid", carta_recomendacion: "review" },
      completion: 92, avatar: avatar("Jonathan Reyes") },

    { id: "cand-007", firstName: "Karla Daniela", lastName: "Estrada Vega", email: "karla.estrada@gmail.com", phone: "+52 55 4422 1166",
      position: "Trainee Sucursal (Kiosk Trainee)", profile: "Trainee Sucursal (Kiosk Trainee)", status: "approved", createdBy: "Paula Acevedo",
      createdAt: "2026-04-29 11:00", recruiter: "Paula Acevedo", locationId: "loc-0014",
      docs: Object.fromEntries(["ine","curp","nss","caratula_bancaria","certificado_estudios","constancia_fiscal","foto_profesional","comprobante_domicilio","acta_nacimiento","carta_recomendacion"].map(k => [k, "valid"])),
      completion: 100, avatar: avatar("Karla Estrada") },

    { id: "cand-008", firstName: "Pedro", lastName: "Hernández Cortés", email: "pedro.hcortes@gmail.com", phone: "+52 55 1122 3344",
      position: "Promotor/a Aviva tu Compra", profile: "Promotor/a Aviva tu Compra", status: "rejected", createdBy: "Paula Acevedo",
      createdAt: "2026-04-20 10:00", recruiter: "Paula Acevedo", locationId: "loc-0033",
      docs: { ine: "invalid", curp: "valid", certificado_estudios: "invalid", foto_profesional: "valid" }, completion: 25,
      disqualificationReason: "INE vencida, no respondió a 3 recordatorios.",
      avatar: avatar("Pedro Hernández") },

    // Etapa: Contrato
    { id: "cand-009", firstName: "Daniela", lastName: "Castro De La Rosa", email: "daniela.castro@avivacredito.com", phone: "+52 27 1010 2020",
      position: "Promotor/a Aviva tu Compra", profile: "Promotor/a Aviva tu Compra", status: "contract_sent", createdBy: "Diego Tovar",
      createdAt: "2026-04-15 09:00", recruiter: "Diego Tovar", locationId: "loc-0029",
      contractTemplateId: "ct-1", contractExpiresAt: tplExp(4),
      docs: Object.fromEntries(DOC_TYPES.slice(0,10).map(d => [d.id, "valid"])),
      completion: 100, avatar: avatar("Daniela Castro") },

    { id: "cand-010", firstName: "Israel", lastName: "Vázquez Ramírez", email: "israel.vazquez@avivacredito.com", phone: "+52 27 2020 3030",
      position: "Promotor/a Aviva tu Compra", profile: "Promotor/a Aviva tu Compra", status: "contract_signed", createdBy: "Diego Tovar",
      createdAt: "2026-04-08 14:00", recruiter: "Diego Tovar", locationId: "loc-0030",
      contractTemplateId: "ct-1", contractSignedAt: "2026-05-17 18:22",
      docs: Object.fromEntries(DOC_TYPES.slice(0,10).map(d => [d.id, "valid"])),
      completion: 100, avatar: avatar("Israel Vázquez") },

    // Etapa: Correos (handoff)
    { id: "cand-011", firstName: "Sara", lastName: "Pérez González", email: "sara.perez@avivacredito.com", phone: "+52 96 7766 5544",
      position: "Promotor/a Aviva tu Compra", profile: "Promotor/a Aviva tu Compra", status: "email_pending", createdBy: "Paula Acevedo",
      createdAt: "2026-04-05 10:00", recruiter: "Paula Acevedo", locationId: "loc-0049",
      jiraTicketKey: "IT-1029",
      docs: Object.fromEntries(DOC_TYPES.slice(0,10).map(d => [d.id, "valid"])),
      completion: 100, avatar: avatar("Sara Pérez") },

    { id: "cand-012", firstName: "Adrián Andrés", lastName: "López López", email: "adrian.lopez@avivacredito.com", phone: "+52 99 8877 6655",
      position: "Promotor/a Aviva tu Compra", profile: "Promotor/a Aviva tu Compra", status: "email_ready", createdBy: "Diego Tovar",
      createdAt: "2026-03-30 09:00", recruiter: "Diego Tovar", locationId: "loc-0145",
      corporateEmail: "adrian.lopez@avivacredito.com",
      jiraTicketKey: "IT-1018",
      docs: Object.fromEntries(DOC_TYPES.slice(0,10).map(d => [d.id, "valid"])),
      completion: 100, avatar: avatar("Adrián López") },

    // Etapa: Inducción (handoff completo)
    { id: "cand-013", firstName: "Otelina Isabel", lastName: "Santiago Robles", email: "otelina.santiago@avivacredito.com", phone: "+52 96 5544 3322",
      position: "Promotor/a Aviva tu Compra", profile: "Promotor/a Aviva tu Compra", status: "induction", createdBy: "Paula Acevedo",
      createdAt: "2026-03-15 09:00", recruiter: "Paula Acevedo", locationId: "loc-0194",
      corporateEmail: "otelina.santiago@avivacredito.com",
      startDate: "2026-05-25",
      docs: Object.fromEntries(DOC_TYPES.slice(0,10).map(d => [d.id, "valid"])),
      completion: 100, avatar: avatar("Otelina Santiago"), hrUserId: "u-OTEL_01" },

    { id: "cand-014", firstName: "Gilberto", lastName: "Torres Laines", email: "gilberto.torres@avivacredito.com", phone: "+52 98 1122 3344",
      position: "Promotor/a Aviva tu Compra", profile: "Promotor/a Aviva tu Compra", status: "induction", createdBy: "Diego Tovar",
      createdAt: "2026-03-12 09:00", recruiter: "Diego Tovar", locationId: "loc-0156",
      corporateEmail: "gilberto.torres@avivacredito.com",
      startDate: "2026-05-22",
      docs: Object.fromEntries(DOC_TYPES.slice(0,10).map(d => [d.id, "valid"])),
      completion: 100, avatar: avatar("Gilberto Torres"), hrUserId: "u-GILB_01" },

    // Descalificado
    { id: "cand-015", firstName: "Luis Ángel", lastName: "Méndez Tovar", email: "luismendez@gmail.com", phone: "+52 55 9988 7766",
      position: "Promotor/a Aviva tu Compra", profile: "Promotor/a Aviva tu Compra", status: "disqualified", createdBy: "Paula Acevedo",
      createdAt: "2026-04-12 10:00", recruiter: "Paula Acevedo", locationId: null,
      disqualificationReason: "Aceptó otra oferta laboral.",
      docs: {}, completion: 0, avatar: avatar("Luis Méndez") },
  ];

  // ─── Recruiters (the users who manage candidates) ───────────────────────
  const RECRUITERS = [
    { id: "rec-paula", name: "Paula Acevedo Reyes", email: "paula.acevedo@avivacredito.com", role: "lider",     avatar: avatar("Paula Acevedo","c8"), gmailConnected: true },
    { id: "rec-diego", name: "Diego Tovar Calderón", email: "diego.tovar@avivacredito.com",   role: "reclutador", avatar: avatar("Diego Tovar","c3"),    gmailConnected: true },
    { id: "rec-maria", name: "María Renee León",     email: "maria.renee@avivacredito.com",   role: "reclutador", avatar: avatar("Maria Renee","c4"),     gmailConnected: false },
    { id: "rec-mario", name: "Mario Quintero Vega",  email: "mario.quintero@avivacredito.com", role: "nomina",   avatar: avatar("Mario Quintero","c5"),  gmailConnected: true },
  ];

  // ─── Settings (Gmail / reminders / link duration / branding) ────────────
  const RECRUITING_SETTINGS = {
    gmail: { connected: true, email: "reclutamiento@avivacredito.com", scopes: ["gmail.send","gmail.compose"], connectedAt: "2026-02-12" },
    reminders: { enabled: true, intervalHours: 48, maxReminders: 3 },
    linkDuration: { formDays: 15, offerDays: 7, contractDays: 7 },
    branding: { logoUrl: null, signatureUrl: null, legalRepInitialsUrl: null },
    google: { drive: { connected: true, parentFolderId: "1A2…XyZ" }, sheets: { connected: true, spreadsheetName: "Candidatos 2026" } },
    jira: { connected: true, project: "IT", board: "Onboarding" },
  };

  window.RecruitingData = {
    STAGES, GROUP_META, DOC_TYPES, FORM_QUESTIONS, EMAIL_TEMPLATES, OFFER_TEMPLATES, CONTRACT_TEMPLATES,
    candidates: CANDIDATES,
    recruiters: RECRUITERS,
    settings: RECRUITING_SETTINGS,
  };
})();
