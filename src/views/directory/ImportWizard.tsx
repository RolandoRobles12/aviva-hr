import { useState, useMemo, useRef } from "react";
import { Check, Close, Download, Upload, Warn } from "@/components/icons";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/cn";

const TARGETS = [
  { id: "numColaborador", label: "Número de colaborador", required: true,  hints: ["No de colaborador", "Número", "ID", "Numero colaborador"] },
  { id: "fullName",       label: "Nombre completo",       required: true,  hints: ["Nombre completo", "Nombre", "Colaborador"] },
  { id: "email",          label: "Correo corporativo",    required: true,  hints: ["Correo", "Email", "E-mail"] },
  { id: "role",           label: "Puesto",                required: true,  hints: ["Puesto", "Cargo", "Rol"] },
  { id: "hub",            label: "Hub / equipo",          required: false, hints: ["Hub", "Equipo"] },
  { id: "quiosco",        label: "Quiósco",               required: true,  hints: ["Quiosco", "Quiósco", "Kiosco"] },
  { id: "estado",         label: "Estado",                required: true,  hints: ["Estado"] },
  { id: "managerName",    label: "Jefe inmediato",        required: false, hints: ["Jefe inmediato", "Jefe", "Manager", "Supervisor"] },
  { id: "empresa",        label: "Empresa",               required: false, hints: ["Empresa", "Razón social"] },
  { id: "talla",          label: "Talla de uniforme",     required: false, hints: ["Talla", "Tallas"] },
  { id: "genero",         label: "Género",                required: false, hints: ["Hombre/Mujer", "Género", "Genero", "Sexo"] },
  { id: "hiredAt",        label: "Fecha de ingreso",      required: false, hints: ["Fecha de Ingreso", "Fecha ingreso", "Alta"] },
  { id: "hubspot",        label: "HubSpot ID",            required: false, hints: ["HubSpot", "HubSpot ID"] },
  { id: "phone",          label: "Teléfono / WhatsApp",   required: false, hints: ["Teléfono", "WhatsApp", "Celular", "Tel"] },
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
  const csv = [
    "No de colaborador,Nombre completo,Correo,Puesto,Hub o equipo,Quiosco,Estado,Jefe inmediato,Empresa,Talla,Hombre/Mujer,Fecha de Ingreso,HubSpot ID,WhatsApp",
    "385_02,Ejemplo Pérez García,ejemplo.perez@avivacredito.com,Promotor/a Aviva tu Compra,hub3,Texmelucan,Puebla,Fernanda Romero,Aviva Financial,M,M,2026-06-01,,+52 55 1234 5678",
  ].join("\n");
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
  const [step, setStep]               = useState(0);
  const [file, setFile]               = useState<File | null>(null);
  const [parsedRows, setParsedRows]   = useState<string[][]>([]);
  const [headers, setHeaders]         = useState<string[]>([]);
  const [mapping, setMapping]         = useState<Partial<Record<TargetId, number>>>({});
  const [dragOver, setDragOver]       = useState(false);
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

  const validation = useMemo(() => {
    if (!parsedRows.length) return { ok: 0, warn: 0, err: 0, rows: [], total: 0 };
    const requiredIds = TARGETS.filter((t) => t.required).map((t) => t.id);
    let ok = 0, warn = 0, err = 0;
    const rows = parsedRows.slice(0, 50).map((r, idx) => {
      const issues: { kind: "ok" | "warn" | "err"; msg: string }[] = [];
      const mapped: Partial<Record<TargetId, string>> = {};
      TARGETS.forEach((t) => {
        const colIdx = mapping[t.id];
        if (colIdx == null) return;
        mapped[t.id] = (r[colIdx] || "").trim();
      });
      requiredIds.forEach((rid) => {
        if (!mapped[rid as TargetId]) issues.push({ kind: "err", msg: `Falta ${rid}` });
      });
      const sev = issues.some((i) => i.kind === "err") ? "err" : issues.some((i) => i.kind === "warn") ? "warn" : "ok";
      if (sev === "err") err++; else if (sev === "warn") warn++; else ok++;
      return { idx, mapped, issues, sev };
    });
    return { ok, warn, err, rows, total: parsedRows.length };
  }, [parsedRows, mapping]);

  function doImport() {
    const result = { ok: validation.ok, warn: validation.warn, err: validation.err, total: validation.total };
    onImported?.(result);
    setStep(3);
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
                <div className="flex items-center gap-2 px-4 py-3 rounded-[var(--radius-sm)] bg-[var(--color-danger-bg)] text-[var(--color-danger-fg)] text-[13px] mb-4">
                  <Warn size={14} />
                  <span>Hay {validation.err} fila{validation.err > 1 ? "s" : ""} con errores que no se importarán.</span>
                </div>
              )}
              <div className="overflow-auto rounded-[var(--radius-sm)] border border-[var(--color-line)]">
                <table className="w-full text-[12.5px] border-collapse">
                  <thead className="sticky top-0 bg-[var(--color-surface-2)]">
                    <tr>
                      <th className="px-3 py-2 text-left text-[11px] font-semibold uppercase tracking-wide text-[var(--color-ink-4)] w-8">#</th>
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
            <Button variant="primary" onClick={doImport} disabled={validation.err === validation.total && validation.total > 0}>
              Importar {validation.ok + validation.warn} colaboradores
            </Button>
          )}
        </div>
      </div>
    </>
  );
}
