# Handoff: Aviva HR — Plataforma de Gestión de Personas

## Resumen

Aviva HR es una plataforma interna de RH para Aviva Crédito que cubre el ciclo completo del colaborador: **reclutamiento → expediente → directorio → bajas**, con soporte para locaciones (kioscos), catálogo de equipo, plantillas de cartas oferta / contratos / correos, integraciones y auditoría.

El sistema está pensado para que People Ops (perfil tipo Paula Acevedo) administre el flujo end-to-end: desde que un reclutador captura un candidato en Viterbit hasta que IT provisiona accesos, RH firma documentación y, eventualmente, gestiona la baja.

## Sobre los archivos de este bundle

Los archivos HTML/JSX/CSS incluidos son **referencias de diseño** — prototipos en HTML+React (vía Babel standalone) que muestran la apariencia visual y el comportamiento previsto. **No son código de producción para copiarse directamente.**

La tarea consiste en **reimplementar estos diseños en el entorno del codebase objetivo** (React/Next.js, Vue, etc.) usando los patrones, librerías y componentes ya establecidos en ese codebase. Si no existe codebase aún, se recomienda **React + Vite** (o Next.js si se necesita SSR) ya que los prototipos ya están escritos en JSX y trasladar el estado/markup es relativamente directo.

## Fidelidad

**Alta fidelidad (hi-fi).** Mockups pixel-perfect con:
- Colores finales (paleta verde menta + warm neutrals)
- Tipografías finales (Inter Tight + Fraunces + JetBrains Mono)
- Espaciados, radios y sombras definitivos
- Interacciones reales (drawers, modales, wizards, toasts, tweaks panel, tema claro/oscuro)
- Datos mock representativos del dominio (reclutadores, kioscos, candidatos en distintas etapas)

El desarrollador debe recrear la UI con fidelidad pixel-perfect usando las librerías existentes del codebase para componentes equivalentes (modales, drawers, tablas, formularios, toasts).

---

## Vistas / Pantallas

### 1. Resumen (`home`)
- **Propósito:** Vista de bienvenida con KPIs operativos y próximos eventos.
- **Layout:** `view-head` con saludo (h1 serif) + sub. KPIs en grid 4 columnas. Debajo, grid 1.4fr / 1fr con "Tickets activos" (izq) y "Próximas fechas" (der).
- **Componentes clave:** `KPIs`, tarjetas de ticket con `progress` bar, lista de próximas fechas con bullet de color por tipo.

### 2. Candidatos (`candidates`) — vista principal
- **Propósito:** Pipeline de reclutamiento con todos los candidatos en proceso.
- **Layout:**
  - `view-head`: H1 "Candidatos" + sub con métricas + botones "Sync Viterbit" / "Nuevo candidato" (accent verde).
  - **Pipeline visual** (`pipe-steps`): pasos del flujo con flechas, click para filtrar por etapa.
  - **Toolbar** con tabs por grupo + buscador + filtro por reclutador.
  - **Tabla** (`table.users`) con 9 columnas: **Candidato · Puesto · Locación destino · Etapa · Documentos · Avance · Reclutador · Creado · ⋯**
- **⚠ Nota importante (fix reciente):** la tabla se desbordaba horizontalmente porque las columnas "Reclutador" y "Creado" sobrepasaban el contenedor. Solución aplicada en `styles.css`:
  ```css
  .table-card { overflow-x: auto; overflow-y: visible; max-width: 100%; }
  table.users { min-width: 1080px; }
  table.users td, table.users th { white-space: nowrap; }
  table.users td .name, table.users td .email { white-space: normal; }
  ```
  Al reimplementar la tabla en producción, **asegúrate de mantener el patrón de scroll horizontal o usar columnas responsivas** (ocultar Reclutador/Creado en breakpoints menores, o usar tabla virtualizada como TanStack Table).
- **Click en fila** → abre `Drawer` con `CandidateDetail` (perfil completo del candidato).

### 3. Expedientes (`expedientes`)
- **Propósito:** Vista paralela a Candidatos enfocada en el estado de documentos del expediente digital.
- Comparte estructura con Candidatos pero con énfasis en la columna de docs (10 dots de estado por tipo: INE, CURP, RFC, comprobante domicilio, etc.).

### 4. Directorio (`directory`)
- **Propósito:** Listado de colaboradores activos.
- **Layout dual:** tabla o tarjetas (toggle en toolbar, persiste en Tweaks).
- Columnas tabla: Persona · Puesto · Hub · Quiosco · Manager · Antigüedad · Estado · ⋯.
- Click en fila → drawer `UserProfile`.

### 5. Locaciones (`locations`)
- **Propósito:** Administrar kioscos físicos (Casa Marchand, BA, etc.).
- **3 layouts:** tabla, tarjetas, **mapa por estado** (México con conteo por entidad).
- Cada locación tiene chip de categoría con color, estado (open/vacant), kit (SIM, lanyard, nametag, etc.).

### 6. Catálogo (`catalog`)
- Catálogo de equipo asignable (laptops, tablets, kits de bienvenida).

### 7. Bajas (`tickets`)
- **Propósito:** Tickets de offboarding con estados (in_progress, scheduled, completed, blocked).
- Cada ticket tiene: aprobaciones (Manager, HRBP, IT), timeline, tasks por app (Google, Slack, Okta, etc.), progress bar.

### 8. Integraciones (`integrations`)
- Listado de 12 apps sincronizadas (Google Workspace, Slack, Okta, Viterbit, etc.).

### 9. Auditoría (`audit`)
- Log de eventos del sistema (provisiones, revocaciones, edits, etc.).

### 10. Plantillas
- **Cartas oferta** (`offer-templates`)
- **Contratos** (`contract-templates`)
- **Correos** (`email-templates`)
- **Preguntas y docs** (`form-config`)

### 11. Configuración (`settings`)
- Tema, densidad, notificaciones, idioma.

---

## Drawers y Modales

- **Drawer** lateral derecho (~620px) con `drawer-head` (crumbs + título + acciones) y contenido scrolleable.
- **Modal** centrado, fondo opaco, ESC cierra.
- **Wizards** multi-paso para: nuevo candidato, nueva locación, import masivo, offboarding, chooser de tipo de ticket.

---

## Interacciones y comportamiento

- **Navegación:** sidebar fija a la izquierda (verde oscuro `--green-700`), main con topbar fija arriba + view scrolleable.
- **Sidebar:** 3 secciones (Workspace, Plantillas, Sistema) con `nav-item` (icono + label + count opcional).
- **Topbar:** crumbs + búsqueda global + bell de notificaciones + ayuda + chip del usuario.
- **Notificaciones:** toast/dropdown vía `NotifProvider` (ver `notifications.jsx`), tipos: `onboard`, `offboard`, `info`.
- **Tweaks panel:** flotante abajo-derecha, controles para tema/densidad/layouts/estados de ticket. Persiste vía `__edit_mode_set_keys` (en producción, mapear a preferencias del usuario en backend).
- **Transitions:** `transition: background 0.1s` en rows hover, `0.12s` en botones.
- **Tema claro/oscuro:** atributo `data-theme="dark"` en `<html>` swap completo de tokens.

---

## State Management

El prototipo usa `useState` local en `App`. Para producción:

- **Server state:** TanStack Query / SWR para `users`, `candidates`, `tickets`, `locations`.
- **UI state:** Zustand o Context para tweaks (tema, densidad, layouts), drawer/modal abierto, selección múltiple.
- **Form state:** React Hook Form + Zod para wizards (NewCandidate, NewLocation, Offboard, Import).

Variables clave en `App`:
- `view`: pantalla activa (string id de NAV).
- `selectedUser` / `selectedCandidate` / `selectedTicket` / `selectedLocation`: entidad abierta en drawer.
- `showNewCandidate` / `showNewLocation` / `showOffboard` / `showImport` / `showTicketChooser`: visibilidad de modales.
- `selected`: `Set<string>` con ids seleccionados en directorio para acciones masivas.

---

## Design Tokens

Todos los tokens están en `styles.css` (`:root` para light, `[data-theme="dark"]` para dark).

### Colores — Brand (verde menta)
```
--mint-50:   #f1fdf6   (backgrounds suaves)
--mint-100:  #b0f5cd   (chips activos, accent strips)
--mint-200:  #8aeab9
--green-500: #16b877   (accent / botones primarios alegres)
--green-600: #119a64   (hover de accent)
--green-700: #026149   (sidebar, primary, links activos)
--green-900: #022e22   (hover de primary)
```

### Colores — Neutrals (paper feel)
```
--bg:           #f7f7f4
--surface:      #ffffff
--surface-2:    #fbfbf8
--line:         #e7e7e1
--line-strong:  #d4d4cc
--ink:          #131613   (texto principal)
--ink-2:        #353a36   (texto secundario)
--ink-3:        #6b716b   (meta, labels)
--ink-4:        #9aa099   (placeholder, dividers)
```

### Status
```
--danger-bg / --danger-fg   (rojo para bajas, errores)
--warn-bg / --warn-fg       (ámbar para alertas)
amarillo aniversarios:      #f4c25e
```

### Spacing & radii
```
--radius:     10px
--radius-sm:  6px
--radius-lg:  14px
--row-h:      48px (comfortable) / 36px (compact)
```

### Sombras
```
--shadow-sm: 0 1px 0 rgba(2, 46, 34, 0.04), 0 1px 2px rgba(2, 46, 34, 0.06)
--shadow-md: 0 4px 14px -8px rgba(2, 46, 34, 0.18), 0 2px 4px rgba(2, 46, 34, 0.06)
```

### Tipografía
- **Sans (UI):** `Inter Tight` (400, 500, 600, 700) — todo el texto de interfaz.
- **Serif (display):** `Fraunces` (400, 500, 600, optical sizing 9..144) — H1 de view-head, valores de KPIs, logo.
- **Mono:** `JetBrains Mono` (400, 500) — IDs, counts numéricos, kbd.

Escala:
- H1 view-head: 30px Fraunces 500, letter-spacing -0.02em.
- Body: 14px Inter Tight.
- Table cells: 13px.
- Meta / labels: 12.5px color `--ink-3`.
- Uppercase labels: 11.5px, letter-spacing 0.04em–0.08em.

---

## Componentes reutilizables

Listado de los componentes propios definidos en los archivos JSX. Reimplementar con equivalentes del codebase o crear desde cero respetando la API:

- `Drawer` — panel lateral derecho.
- `Modal` — overlay centrado.
- `Ic.*` — librería de íconos SVG inline (close, plus, search, chevR, more, shield, etc.).
- `StageBadge` / `stageMeta` — badge de etapa del candidato.
- `DocStatusDot` — dot 8×8 verde/amarillo/rojo/gris por estado de documento.
- `CompletionBar` — barra de progreso con porcentaje.
- `PersonChip` — chip de persona (avatar + nombre).
- `LocationChip` — chip de locación (cat-chip + nombre).
- `LocationPicker` — combobox con lista de kioscos.
- `KPIs` — grid 4 columnas con accent strip lateral.
- `TicketStatusBadge` — badge de estado de ticket.
- `NotifBell` / `NotifProvider` / `useNotif` — sistema de notificaciones.
- `TweaksPanel` + `TweakRadio` / `TweakSelect` / `TweakSection` — solo para prototipo, no reimplementar en producción.

---

## Archivos en el bundle

```
Aviva HR.html              ← entry point, monta React
styles.css                 ← todos los tokens y estilos (~2300 líneas)
app.jsx                    ← App shell, NAV, routing, drawers, modales
components.jsx             ← Ic, Drawer, Modal, StageBadge, chips, KPIs…
data.jsx                   ← mocks de users, hubs, estados, locationCategories
locations-data.jsx         ← mocks de locaciones (kioscos)
catalog-data.jsx           ← mocks de catálogo de equipo
recruiting-data.jsx        ← mocks de candidatos, STAGES, GROUP_META, DOC_TYPES
notifications.jsx          ← NotifProvider, NotifBell, SettingsView
pickers.jsx                ← LocationPicker, PersonChip, LocationChip
views.jsx                  ← HomeView (KPIs), DirectoryView, TicketsView, etc.
locations.jsx              ← LocationsView (tabla/grid/mapa) + LocationDetail
catalog.jsx                ← CatalogView
recruiting.jsx             ← CandidatosView, CandidateDetail, NewCandidateModal ⭐
recruiting-templates.jsx   ← OfferTemplates, ContractTemplates, EmailTemplates, FormConfig
recruiting-settings.jsx    ← (settings de reclutamiento)
wizards.jsx                ← OffboardWizard, ImportWizard, NewLocationWizard, NewTicketChooser, ExpedientesView
tweaks-panel.jsx           ← (solo prototipo) panel flotante de tweaks
```

---

## Notas para el implementador

1. **Empezar por la tabla de Candidatos** — es la vista más rica y la que justificó este handoff. Mira `recruiting.jsx` líneas 50-200.
2. **Tabla responsiva:** no copies el patrón `min-width: 1080px + overflow-x`. En producción usa una solución más robusta (column visibility, virtualización con TanStack Table, o redesign para colapsar columnas en mobile).
3. **Mocks → API:** todos los archivos `*-data.jsx` deben mapearse a endpoints reales. Estructura sugerida:
   - `GET /candidates?stage=X&recruiter=Y`
   - `GET /candidates/:id` (incluye docs, timeline, formAnswers)
   - `POST /candidates` (NewCandidateModal)
   - `PATCH /candidates/:id/handoff` (force-handoff IT/Admin)
   - `GET /users`, `POST /users` (alta), `POST /tickets/offboarding`
4. **Iconos:** usar Lucide o Heroicons en lugar de los SVG inline de `Ic`. Mapeo directo por nombre.
5. **Sin emojis decorativos** — el "👋" en el saludo del Home es la única excepción.
6. **Idioma:** todo en español MX. Conservar términos: "Locación" (no "Ubicación"), "Quiosco" (no "Kiosco" salvo el copy ya escrito), "Carta oferta", "Expediente", "Handoff".
7. **Accent verde brillante (`--green-500`)** es para CTAs primarios; verde oscuro (`--green-700`) es para chrome (sidebar, links). No mezclar.
