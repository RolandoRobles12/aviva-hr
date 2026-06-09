import { useState, useMemo, useRef } from "react";
import { Check, Close, Download, Upload, Warn } from "@/components/icons";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/cn";
import { createDoc, updateDocById, useCollection } from "@/hooks/useFirestore";
import { useUsers } from "@/hooks/useUsers";
import { useLocations } from "@/hooks/useLocations";
import { writeAuditEntry } from "@/services/audit";
import { writeBatch, collection, doc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";

const BATCH_SIZE = 250;

const MESES: Record<string, string> = {
  enero:"01", febrero:"02", marzo:"03", abril:"04", mayo:"05", junio:"06",
  julio:"07", agosto:"08", septiembre:"09", octubre:"10", noviembre:"11", diciembre:"12",
};

function parseDate(raw: string): string {
  // Already YYYY-MM-DD
  if (/^\d{4}-\d{2}-\d{2}$/.test(raw.trim())) return raw.trim();
  // "4 de octubre de 2022" / "4 octubre 2022"
  const m = raw.trim().toLowerCase().match(/(\d{1,2})\s+(?:de\s+)?([a-záéíóúü]+)\s+(?:de\s+)?(\d{4})/);
  if (m) {
    const mes = MESES[m[2]];
    if (mes) return `${m[3]}-${mes}-${m[1].padStart(2, "0")}`;
  }
  // DD/MM/YYYY or MM/DD/YYYY — try DD/MM/YYYY
  const slash = raw.trim().match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (slash) return `${slash[3]}-${slash[2].padStart(2,"0")}-${slash[1].padStart(2,"0")}`;
  return raw.trim();
}

// Columns match the exact headers used in the Aviva Sheets directory export.
// "Antigüedad" and "Descripción" are intentionally omitted — calculated/unused.
const TARGETS = [
  { id: "empresa",        label: "Empresa",              required: true,  hints: ["Empresa"] },
  { id: "region",         label: "Región",               required: false, hints: ["Región", "Region", "Hub o equipo", "Hub equipo", "Equipo"] },
  { id: "quiosco",        label: "Quiósco",              required: false, hints: ["Quiosco", "Quiósco", "Kiosco"] },
  { id: "estado",         label: "Estado",               required: false, hints: ["Estado"] },
  { id: "fullName",       label: "Nombre completo",      required: true,  hints: ["Nombre completo", "Nombre y apellidos"] },
  { id: "numColaborador", label: "No de colaborador",    required: true,  hints: ["No de colaborador", "Número colaborador", "Num colaborador"] },
  { id: "role",           label: "Puesto",               required: true,  hints: ["Puesto", "Cargo"] },
  { id: "hiredAt",        label: "Fecha de ingreso",     required: false, hints: ["Fecha de Ingreso", "Fecha ingreso"] },
  { id: "genero",         label: "Hombre/Mujer",         required: false, hints: ["Hombre/Mujer", "Género", "Genero"] },
  { id: "talla",          label: "Tallas",               required: false, hints: ["Tallas", "Talla"] },
  { id: "email",          label: "Correo",               required: true,  hints: ["Correo", "Email", "E-mail"] },
  { id: "area",           label: "Área",                 required: false, hints: ["Área", "Area"] },
  { id: "managerName",    label: "Jefe Inmediato",       required: false, hints: ["Jefe Inmediato", "Jefe inmediato", "Supervisor"] },
  { id: "hubspot",        label: "HubSpot ID",           required: false, hints: ["HubSpot ID", "Hubspot ID"] },
  { id: "slackOpsId",    label: "Slack Ops ID",         required: false, hints: ["Slack ID", "Slack Ops ID", "SlackOpsId"] },
  { id: "phone",          label: "Teléfono",             required: false, hints: ["Teléfono", "WhatsApp", "Celular"] },
] as const;

type TargetId = (typeof TARGETS)[number]["id"];

function parseCSV(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
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
      } else cur += c;
    }
  }
  if (cur || row.length) { row.push(cur); rows.push(row); }
  return rows;
}

function downloadTemplate() {
  // Headers match the Aviva directory Google Sheets export column order exactly.
  const csv = "Empresa,Hub o equipo,Quiosco,Estado,Nombre completo,No de colaborador,Puesto,Fecha de Ingreso,Antigüedad,Hombre/Mujer,Tallas,Correo,Descripción,Área,Jefe Inmediato,HubSpot ID";
  const a = document.createElement("a");
  a.href = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
  a.download = "plantilla-colaboradores-aviva.csv";
  a.click();
}

const STEPS = ["Cargar archivo", "Mapear columnas", "Revisar", "Importado"];

interface Props {
  onClose: () => void;
  onImported?: (result: { ok: number; warn: number; err: number; total: number }) => void;
}

export function ImportWizard({ onClose, onImported }: Props) {
  const { data: existingUsers } = useUsers();
  const { data: locations } = useLocations();
  const { data: positions } = useCollection<{ name: string }>("catalog/positions/items");

  function resolveQuiosco(raw: string): string {
    if (!raw) return "";
    const n = (s: string) => s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").trim();

    function editDist(a: string, b: string): number {
      const m = a.length, blen = b.length;
      const dp = Array.from({ length: m + 1 }, (_, i) =>
        Array.from({ length: blen + 1 }, (_, j) => (i === 0 ? j : j === 0 ? i : 0))
      );
      for (let i = 1; i <= m; i++)
        for (let j = 1; j <= blen; j++)
          dp[i][j] = a[i - 1] === b[j - 1] ? dp[i - 1][j - 1] : 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
      return dp[m][blen];
    }

    // Map suffix → keywords that should appear in the location's producto/catLabel
    const SUFFIX_MAP: { sfx: string; keywords: string[] }[] = [
      { sfx: " mba",  keywords: ["compra", "aurrera", "bodega"] },
      { sfx: " ba",   keywords: ["compra", "aurrera", "bodega"] },
      { sfx: " sba",  keywords: ["compra", "aurrera", "bodega"] },
      { sfx: " wm",   keywords: ["walmart"] },
      { sfx: " cm",   keywords: ["marchand", "casa marchand"] },
      { sfx: " cr",   keywords: ["casa", "construrama"] },
      { sfx: " atn",  keywords: ["negocio"] },
      { sfx: " atc",  keywords: ["contigo"] },
    ];

    const nraw = n(raw);
    let base = nraw;
    let productKeywords: string[] = [];

    for (const { sfx, keywords } of SUFFIX_MAP) {
      if (nraw.endsWith(sfx)) {
        base = nraw.slice(0, -sfx.length).trim();
        productKeywords = keywords;
        break;
      }
    }

    // Also handle prefix format: "CM Plaza Civac" instead of "Plaza Civac CM"
    if (!productKeywords.length) {
      const PREFIX_MAP: { pfx: string; keywords: string[] }[] = [
        { pfx: "mba ", keywords: ["compra", "aurrera", "bodega"] },
        { pfx: "ba ",  keywords: ["compra", "aurrera", "bodega"] },
        { pfx: "sba ", keywords: ["compra", "aurrera", "bodega"] },
        { pfx: "wm ",  keywords: ["walmart"] },
        { pfx: "cm ",  keywords: ["marchand", "casa marchand"] },
        { pfx: "cr ",  keywords: ["casa", "construrama"] },
        { pfx: "atn ", keywords: ["negocio"] },
        { pfx: "atc ", keywords: ["contigo"] },
      ];
      for (const { pfx, keywords } of PREFIX_MAP) {
        if (nraw.startsWith(pfx)) {
          base = nraw.slice(pfx.length).trim();
          productKeywords = keywords;
          break;
        }
      }
    }

    // Exact match (full raw string against ubicacion/ciudad/code)
    const exactMatch = locations.find((l) => {
      const display = l.ubicacion ?? l.ciudad;
      return n(display) === nraw || n(l.ciudad) === nraw || n(l.code) === nraw;
    });
    if (exactMatch) return exactMatch.id!;

    // Exact city match with suffix disambiguation
    const candidates = locations.filter((l) => n(l.ciudad) === base);
    if (candidates.length === 1) return candidates[0].id!;
    if (candidates.length > 1 && productKeywords.length > 0) {
      const refined = candidates.find((l) => {
        const prod = n(l.producto ?? l.catLabel ?? "");
        return productKeywords.some((kw) => prod.includes(kw));
      });
      if (refined) return refined.id!;
    }
    if (candidates[0]) return candidates[0].id!;

    // Fuzzy city match (edit distance ≤ 2) for typos in CSV
    const fuzzy = locations
      .map((l) => ({ l, d: editDist(n(l.ciudad), base) }))
      .filter(({ d }) => d <= 2)
      .sort((a, b) => a.d - b.d);
    if (fuzzy.length === 1) return fuzzy[0].l.id!;
    if (fuzzy.length > 1 && productKeywords.length > 0) {
      const refined = fuzzy.find(({ l }) => {
        const prod = n(l.producto ?? l.catLabel ?? "");
        return productKeywords.some((kw) => prod.includes(kw));
      });
      if (refined) return refined.l.id!;
    }
    if (fuzzy[0]) return fuzzy[0].l.id!;

    return raw;
  }

  function resolveRole(raw: string): string {
    if (!raw) return raw;
    const n = (s: string) =>
      s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/\/a\b/g, "").trim();
    const nraw = n(raw);
    // Exact normalized match
    const exact = positions.find((p) => n(p.name) === nraw);
    if (exact) return exact.name;
    // Partial match: catalog name starts with or contains the CSV value
    const partial = positions.find((p) => n(p.name).includes(nraw) || nraw.includes(n(p.name)));
    return partial ? partial.name : raw;
  }

  const [step, setStep]               = useState(0);
  const [file, setFile]               = useState<File | null>(null);
  const [parsedRows, setParsedRows]   = useState<string[][]>([]);
  const [headers, setHeaders]         = useState<string[]>([]);
  const [mapping, setMapping]         = useState<Partial<Record<TargetId, number>>>({});
  const [dragOver, setDragOver]       = useState(false);
  const [importing, setImporting]     = useState(false);
  const fileInputRef                  = useRef<HTMLInputElement>(null);

  function handleFile(f: File) {
    setFile(f);
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      const rows = parseCSV(text);
      if (rows.length < 2) return;
      const hdrs = rows[0];
      const data = rows.slice(1).filter((r) => r.some((c) => c && c.trim()));
      setHeaders(hdrs);
      setParsedRows(data);
      const norm = (s: string) => s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
      const autoMap: Partial<Record<TargetId, number>> = {};
      TARGETS.forEach((t) => {
        const idx = hdrs.findIndex((h) =>
          t.hints.some((hint) => norm(h || "").includes(norm(hint)))
        );
        if (idx >= 0) autoMap[t.id] = idx;
      });
      setMapping(autoMap);
      setStep(1);
    };
    reader.readAsText(f);
  }

  function processRow(r: string[], idx: number) {
    const mapped: Partial<Record<TargetId, string>> = {};
    TARGETS.forEach((t) => {
      const colIdx = mapping[t.id];
      if (colIdx == null) return;
      mapped[t.id] = (r[colIdx] || "").trim();
    });
    const existing = existingUsers.find((u) =>
      (mapped.email         && u.email          === mapped.email) ||
      (mapped.numColaborador && u.numColaborador === mapped.numColaborador)
    );
    return { idx, mapped, existingId: existing?.id ?? null };
  }

  const validation = useMemo(() => {
    if (!parsedRows.length) return { ok: 0, warn: 0, err: 0, rows: [], total: 0 };
    const requiredIds = TARGETS.filter((t) => t.required).map((t) => t.id);
    let ok = 0, warn = 0, err = 0;
    const rows = parsedRows.slice(0, 50).map((r, idx) => {
      const { mapped, existingId } = processRow(r, idx);
      const issues: { kind: "ok" | "warn" | "err"; msg: string }[] = [];
      requiredIds.forEach((rid) => {
        if (!mapped[rid as TargetId]) issues.push({ kind: "err", msg: `Falta ${rid}` });
      });
      const sev = issues.some((i) => i.kind === "err") ? "err" : issues.some((i) => i.kind === "warn") ? "warn" : "ok";
      if (sev === "err") err++; else if (sev === "warn") warn++; else ok++;
      return { idx, mapped, issues, sev, existingId };
    });
    return { ok, warn, err, rows, total: parsedRows.length };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [parsedRows, mapping, existingUsers]);

  async function doImport() {
    setImporting(true);
    let totalWritten = 0;
    try {
      const toImport = parsedRows.map((r, idx) => processRow(r, idx));

      for (let i = 0; i < toImport.length; i += BATCH_SIZE) {
        const chunk = toImport.slice(i, i + BATCH_SIZE);
        const batch = writeBatch(db);
        const now   = serverTimestamp();

        for (const row of chunk) {
          const name  = (row.mapped.fullName ?? "").trim();
          const parts = name.split(" ");
          const payload = {
            numColaborador: row.mapped.numColaborador ?? "",
            fullName:       name,
            first:          parts[0] ?? "",
            last:           parts.slice(1).join(" "),
            email:          row.mapped.email        ?? "",
            role:           resolveRole(row.mapped.role ?? ""),
            empresa:        row.mapped.empresa      ?? "",
            quiosco:        resolveQuiosco(row.mapped.quiosco ?? ""),
            estado:         row.mapped.estado       ?? "",
            area:           row.mapped.area         ?? "",
            managerName:    row.mapped.managerName  ?? null,
            manager:        null,
            hiredAt:        parseDate(row.mapped.hiredAt ?? "") || new Date().toISOString().slice(0, 10),
            genero:         (row.mapped.genero ?? "") as "H" | "M",
            talla:          row.mapped.talla        ?? "",
            phone:          row.mapped.phone        ?? "",
            hubspot:        row.mapped.hubspot      || null,
            slackOpsId:     row.mapped.slackOpsId   || null,
            region:         (row.mapped.region ?? "").toLowerCase().replace(/\s+/g, "_"),
            status:         "active",
            access:         [],
            tablets:        [],
            laptop:         null,
            hireMonths:     0,
            avatar:         {
              initials: ((parts[0]?.[0] ?? "?") + (parts[parts.length > 1 ? parts.length - 1 : 0]?.[0] ?? "")).toUpperCase(),
              color: "c1",
            },
            createdAt:  now,
            updatedAt:  now,
          };

          // set+merge works for both new and existing documents
          const ref = row.existingId
            ? doc(db, "users", row.existingId)
            : doc(collection(db, "users"));
          batch.set(ref, payload, { merge: true });
        }

        await batch.commit();
        totalWritten += chunk.length;
      }

      await writeAuditEntry({
        action: "importó colaboradores",
        target: `${totalWritten} colaboradores escritos (${validation.ok} OK · ${validation.warn} avisos · ${validation.err} incompletos)`,
        source: "manual",
      });
      onImported?.({ ok: validation.ok, warn: validation.warn, err: validation.err, total: totalWritten });
      setStep(3);
    } catch (err) {
      console.error("Error en import:", err);
      alert(`Error al importar: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setImporting(false);
    }
  }

  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/30 backdrop-blur-[2px]" onClick={onClose} />
      <div className="fixed inset-x-4 top-1/2 z-50 -translate-y-1/2 mx-auto w-full max-w-[960px] rounded-[var(--radius-lg)] bg-[var(--color-surface)] shadow-[var(--shadow-lg)] overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="flex items-start justify-between px-6 py-4 border-b border-[var(--color-line)] shrink-0">
          <div>
            <div className="font-semibold text-[15px] text-[var(--color-ink)]">Importar colaboradores</div>
            <div className="text-[12px] text-[var(--color-ink-3)] mt-0.5">
              Sube un CSV y Aviva HR creará o actualizará las cuentas automáticamente.
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-md text-[var(--color-ink-3)] hover:bg-[var(--color-surface-2)] transition-colors">
            <Close size={16} />
          </button>
        </div>

        {/* Stepper */}
        <div className="flex items-center gap-0 px-6 py-3 border-b border-[var(--color-line)] shrink-0">
          {STEPS.map((s, i) => (
            <div key={s} className="flex items-center gap-0">
              <div className={cn("flex items-center gap-2 text-[12.5px] font-medium",
                i === step ? "text-[var(--color-ink)]" : i < step ? "text-green-600" : "text-[var(--color-ink-4)]"
              )}>
                <span className={cn("size-6 rounded-full grid place-items-center text-[11px] font-bold",
                  i === step ? "bg-green-500 text-white"
                  : i < step ? "bg-green-100 text-green-700"
                  : "bg-[var(--color-line)] text-[var(--color-ink-3)]"
                )}>
                  {i < step ? <Check size={12} /> : i + 1}
                </span>
                {s}
              </div>
              {i < STEPS.length - 1 && <div className="w-12 h-px bg-[var(--color-line)] mx-3" />}
            </div>
          ))}
        </div>

        {/* Body */}
        <div className="flex-1 overflow-auto p-6">
          {/* Step 0: Upload */}
          {step === 0 && (
            <div className="space-y-5">
              <div
                className={cn(
                  "border-2 border-dashed rounded-[var(--radius)] p-12 text-center cursor-pointer transition-colors",
                  dragOver ? "border-green-500 bg-[var(--color-mint-50)]" : "border-[var(--color-line)] hover:border-green-400 hover:bg-[var(--color-surface-2)]"
                )}
                onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={(e) => { e.preventDefault(); setDragOver(false); const f = e.dataTransfer.files?.[0]; if (f) handleFile(f); }}
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload size={28} className="mx-auto mb-3 text-[var(--color-ink-3)]" />
                <div className="font-semibold text-[15px] text-[var(--color-ink)]">Arrastra tu archivo aquí</div>
                <div className="text-[13px] text-[var(--color-ink-3)] mt-1">o haz clic para seleccionar · CSV hasta 5 MB</div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv,.xlsx,.xls"
                  className="hidden"
                  onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex gap-3 p-4 rounded-[var(--radius-sm)] border border-[var(--color-line)] bg-[var(--color-surface-2)]">
                  <div className="size-9 rounded-lg bg-[var(--color-mint-50)] text-green-700 grid place-items-center shrink-0">
                    <Download size={16} />
                  </div>
                  <div>
                    <div className="font-semibold text-[13px] text-[var(--color-ink)]">¿Primera vez?</div>
                    <div className="text-[12px] text-[var(--color-ink-3)] mt-0.5">Descarga la plantilla con todas las columnas que esperamos.</div>
                    <Button size="sm" variant="secondary" className="mt-2" onClick={(e) => { e.stopPropagation(); downloadTemplate(); }}>
                      Descargar plantilla
                    </Button>
                  </div>
                </div>
                <div className="flex gap-3 p-4 rounded-[var(--radius-sm)] border border-[var(--color-line)] bg-[var(--color-surface-2)]">
                  <div className="size-9 rounded-lg bg-[#fff3d6] text-[#8a5a00] grid place-items-center shrink-0">
                    <Warn size={16} />
                  </div>
                  <div>
                    <div className="font-semibold text-[13px] text-[var(--color-ink)]">¿Vienes de Humand o un Excel viejo?</div>
                    <div className="text-[12px] text-[var(--color-ink-3)] mt-0.5">No te preocupes por el nombre de las columnas. Te ayudamos a mapearlas.</div>
                  </div>
                </div>
              </div>

              <div>
                <div className="font-semibold text-[13px] text-[var(--color-ink)] mb-2">Lo que haremos al importar:</div>
                <ul className="space-y-1.5 text-[13px] text-[var(--color-ink-2)] list-disc list-inside">
                  <li>Crear las cuentas nuevas como <b>Invitadas</b>, listas para SSO.</li>
                  <li>Si un email ya existe, <b>actualizar</b> los datos (sin duplicar).</li>
                  <li>Provisionar Google Workspace, Slack, Okta, HubSpot y Aviva Flat según el puesto.</li>
                  <li>Registrar cada cambio en el log de auditoría.</li>
                </ul>
              </div>
            </div>
          )}

          {/* Step 1: Map columns */}
          {step === 1 && (
            <div>
              <p className="text-[13px] text-[var(--color-ink-3)] mb-4">
                Archivo: <b className="text-[var(--color-ink)]">{file?.name}</b> · {parsedRows.length} filas detectadas. Mapea cada campo al encabezado del CSV.
              </p>
              <div className="grid grid-cols-2 gap-3">
                {TARGETS.map((t) => (
                  <div key={t.id} className="flex items-center gap-3">
                    <div className="w-[180px] shrink-0">
                      <div className="text-[12.5px] font-medium text-[var(--color-ink-2)]">{t.label}</div>
                      {t.required && <div className="text-[11px] text-[var(--color-danger-fg)]">Requerido</div>}
                    </div>
                    <select
                      value={mapping[t.id] ?? ""}
                      onChange={(e) => setMapping((m) => ({ ...m, [t.id]: e.target.value !== "" ? Number(e.target.value) : undefined }))}
                      className="flex-1 h-8 px-2 text-[12.5px] rounded-[var(--radius-sm)] border border-[var(--color-line)] bg-[var(--color-surface)] text-[var(--color-ink-2)] outline-none"
                    >
                      <option value="">— Sin mapear —</option>
                      {headers.map((h, i) => (
                        <option key={i} value={i}>{h}</option>
                      ))}
                    </select>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Step 2: Validation */}
          {step === 2 && (
            <div>
              <div className="grid grid-cols-3 gap-3 mb-5">
                {[
                  { label: "Sin errores", value: validation.ok,   color: "var(--color-green-700)", bg: "var(--color-mint-50)" },
                  { label: "Advertencias", value: validation.warn, color: "#8a5a00",                bg: "#fff3d6" },
                  { label: "Errores",      value: validation.err,  color: "var(--color-danger-fg)", bg: "var(--color-danger-bg)" },
                ].map((s) => (
                  <div key={s.label} className="rounded-[var(--radius-sm)] border border-[var(--color-line)] px-4 py-3">
                    <div className="text-[11px] text-[var(--color-ink-4)] mb-1">{s.label}</div>
                    <div className="text-2xl font-bold font-mono" style={{ color: s.color }}>{s.value}</div>
                  </div>
                ))}
              </div>
              {validation.err > 0 && (
                <div className="flex items-center gap-2 px-4 py-3 rounded-[var(--radius-sm)] bg-[#fff3d6] text-[#8a5a00] text-[13px] mb-4">
                  <Warn size={14} />
                  <span>Hay {validation.err} fila{validation.err > 1 ? "s" : ""} con datos incompletos — se importarán con los campos disponibles.</span>
                </div>
              )}
              <div className="overflow-auto rounded-[var(--radius-sm)] border border-[var(--color-line)]">
                <table className="w-full text-[12.5px] border-collapse">
                  <thead className="sticky top-0 bg-[var(--color-surface-2)]">
                    <tr>
                      <th className="px-3 py-2 text-left text-[11px] font-semibold uppercase tracking-wide text-[var(--color-ink-4)] w-8">#</th>
                      <th className="px-3 py-2 text-left text-[11px] font-semibold uppercase tracking-wide text-[var(--color-ink-4)]">Acción</th>
                      <th className="px-3 py-2 text-left text-[11px] font-semibold uppercase tracking-wide text-[var(--color-ink-4)]">Estado</th>
                      {TARGETS.filter((t) => mapping[t.id] != null).map((t) => (
                        <th key={t.id} className="px-3 py-2 text-left text-[11px] font-semibold uppercase tracking-wide text-[var(--color-ink-4)] whitespace-nowrap">{t.label}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {validation.rows.map((row) => (
                      <tr key={row.idx} className={cn("border-t border-[var(--color-line)]",
                        row.sev === "err" ? "bg-[var(--color-danger-bg)]/30"
                        : row.sev === "warn" ? "bg-[#fff3d6]/50"
                        : ""
                      )}>
                        <td className="px-3 py-2 font-mono text-[var(--color-ink-4)]">{row.idx + 1}</td>
                        <td className="px-3 py-2 whitespace-nowrap">
                          {row.existingId
                            ? <span className="text-[11px] font-medium px-1.5 py-0.5 rounded-full bg-[#e3eeff] text-[#1b3f8a]">Actualizar</span>
                            : <span className="text-[11px] font-medium px-1.5 py-0.5 rounded-full bg-[var(--color-mint-50)] text-green-700">Nuevo</span>
                          }
                        </td>
                        <td className="px-3 py-2">
                          {row.sev === "ok" && <span className="text-green-600 text-[11px] font-medium">OK</span>}
                          {row.sev === "warn" && <span className="text-[#8a5a00] text-[11px] font-medium">Aviso</span>}
                          {row.sev === "err" && <span className="text-[var(--color-danger-fg)] text-[11px] font-medium">{row.issues[0]?.msg}</span>}
                        </td>
                        {TARGETS.filter((t) => mapping[t.id] != null).map((t) => (
                          <td key={t.id} className="px-3 py-2 text-[var(--color-ink-2)] max-w-[140px]">
                            <span className="truncate block">{row.mapped[t.id] || "—"}</span>
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {validation.total > 50 && (
                <p className="text-[12px] text-[var(--color-ink-4)] mt-2">Mostrando las primeras 50 de {validation.total} filas.</p>
              )}
            </div>
          )}

          {/* Step 3: Success */}
          {step === 3 && (
            <div className="py-8 text-center space-y-4">
              <div className="size-16 rounded-full bg-[var(--color-mint-50)] grid place-items-center mx-auto">
                <Check size={28} className="text-green-600" />
              </div>
              <div className="font-semibold text-[18px] text-[var(--color-ink)]">¡Importación en proceso!</div>
              <div className="text-[13px] text-[var(--color-ink-3)] max-w-sm mx-auto">
                Se procesarán {validation.total} colaboradores. Las cuentas nuevas recibirán un correo de invitación. Puedes seguir el avance en el log de auditoría.
              </div>
              <div className="flex justify-center gap-3 pt-2">
                <div className="text-center">
                  <div className="text-2xl font-bold font-mono text-green-600">{validation.ok}</div>
                  <div className="text-[12px] text-[var(--color-ink-3)]">A importar</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold font-mono text-[#8a5a00]">{validation.warn}</div>
                  <div className="text-[12px] text-[var(--color-ink-3)]">Con avisos</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold font-mono text-[var(--color-danger-fg)]">{validation.err}</div>
                  <div className="text-[12px] text-[var(--color-ink-3)]">Omitidos</div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center gap-2 px-6 py-4 border-t border-[var(--color-line)] shrink-0">
          {step > 0 && step < 3 && (
            <Button variant="secondary" onClick={() => setStep((s) => s - 1)}>Atrás</Button>
          )}
          <span className="flex-1 text-[12px] text-[var(--color-ink-4)]">
            {step < 3 ? `Paso ${step + 1} de ${STEPS.length}` : ""}
          </span>
          <Button variant="ghost" onClick={onClose}>
            {step === 3 ? "Cerrar" : "Cancelar"}
          </Button>
          {step === 1 && (
            <Button variant="primary" onClick={() => setStep(2)}>
              Continuar →
            </Button>
          )}
          {step === 2 && (
            <Button variant="primary" onClick={doImport} disabled={importing || validation.total === 0}>
              {importing ? "Importando…" : `Importar ${validation.total} colaboradores`}
            </Button>
          )}
        </div>
      </div>
    </>
  );
}
