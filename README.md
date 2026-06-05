# Aviva HR — Plataforma de Gestión de Personas

Plataforma interna de RH para Aviva Crédito que cubre el ciclo completo del colaborador: **reclutamiento → expediente → directorio → bajas**, con gestión de locaciones (kioscos), catálogo de equipo, plantillas de documentos, integraciones y auditoría.

---

## Stack tecnológico

| Capa | Tecnología |
|------|-----------|
| Frontend | React 18 + TypeScript + Vite |
| Estilos | Tailwind CSS 4 |
| Iconos | Lucide React |
| Routing | React Router DOM 7 |
| Backend | Firebase (Firestore, Auth, Cloud Functions, Hosting) |
| API REST | Express 4 (`aviva-api`) |
| Cloud Functions | Firebase Functions v2 (Node 20) |
| Emuladores | Firebase Emulator Suite |

---

## Requisitos previos

- Node.js 20+
- Firebase CLI (`npm i -g firebase-tools`)
- Proyecto Firebase con Firestore, Authentication (Google) y Cloud Functions habilitados

---

## Configuración local

### 1. Instalar dependencias

```bash
npm install
cd functions && npm install && cd ..
cd aviva-api && npm install && cd ..
```

### 2. Variables de entorno

```bash
cp .env.example .env.local
```

Edita `.env.local` con las credenciales de tu proyecto Firebase:

```bash
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
VITE_FIREBASE_REGION=us-central1
VITE_USE_EMULATOR=true   # activa los emuladores locales
```

### 3. Iniciar emuladores + servidor de desarrollo

```bash
# Terminal 1 — emuladores de Firebase
firebase emulators:start

# Terminal 2 — frontend (Vite)
npm run dev

# (Opcional) Poblar la base de datos local con datos de prueba
npm run seed
```

### 4. API REST independiente (opcional)

```bash
cd aviva-api && npm run dev
```

La API queda disponible en `http://localhost:3000/hr/v1`.

---

## Scripts disponibles

### Raíz del proyecto

| Script | Descripción |
|--------|-------------|
| `npm run dev` | Servidor de desarrollo con HMR |
| `npm run build` | Type-check + build de producción |
| `npm run preview` | Vista previa del build |
| `npm run seed` | Pobla Firestore emulado con datos de prueba |
| `npm run seed:prod` | Pobla Firestore de producción |

### `functions/`

| Script | Descripción |
|--------|-------------|
| `npm run build` | Compila TypeScript |
| `npm run deploy` | Despliega Cloud Functions |
| `npm run serve` | Build + emulador de functions |
| `npm run logs` | Tail de logs en producción |

### `aviva-api/`

| Script | Descripción |
|--------|-------------|
| `npm run dev` | API en modo watch con tsx |
| `npm run build` | Compila TypeScript |
| `npm start` | Inicia la API compilada |

---

## Estructura del proyecto

```
aviva-hr/
├── src/                        # Frontend React
│   ├── App.tsx                 # Componente raíz + providers
│   ├── router/                 # Rutas (React Router)
│   ├── views/                  # 14 vistas / páginas
│   ├── components/
│   │   ├── ui/                 # Button, Badge, Avatar, Drawer, Modal, Spinner
│   │   └── layout/             # AppShell, Sidebar, TopBar
│   ├── hooks/                  # useFirestore, useCandidates, useUsers, useTickets…
│   ├── context/                # AuthContext, CatalogContext, NotifContext
│   ├── services/               # Capa de acceso a datos (users, candidates, tickets, audit)
│   ├── data/
│   │   └── types.ts            # Tipos TypeScript del dominio
│   └── lib/
│       ├── firebase.ts         # Config + setup de emuladores
│       └── cn.ts               # Utilidad classname
├── functions/                  # Firebase Cloud Functions
│   └── src/
│       ├── index.ts            # Exporta todas las functions
│       ├── users.ts            # Lógica de provisioning
│       ├── candidates.ts       # Triggers de candidatos
│       └── tickets.ts          # Lógica de offboarding
├── aviva-api/                  # API REST con Express
│   └── src/
│       ├── index.ts            # App Express + rutas
│       ├── middleware/         # Auth (Firebase token) + rate limiting
│       └── routes/             # users, tickets, audit, integrations, locations
├── scripts/
│   └── seed.ts                 # Script de seed para Firestore
├── firebase.json               # Config de emuladores y hosting
├── firestore.rules             # Reglas de seguridad de Firestore
└── firestore.indexes.json      # Índices compuestos de Firestore
```

---

## Vistas principales

| Ruta | Vista | Descripción |
|------|-------|-------------|
| `/` | Home | Dashboard con KPIs operativos |
| `/candidates` | Candidatos | Pipeline de reclutamiento con tabla filtrable |
| `/expedientes` | Expedientes | Seguimiento de documentos del expediente digital |
| `/directory` | Directorio | Colaboradores activos (tabla o tarjetas) |
| `/locations` | Locaciones | Kioscos físicos (tabla / tarjetas / mapa por estado) |
| `/catalog` | Catálogo | Equipo asignable (laptops, tablets, kits) |
| `/tickets` | Bajas | Tickets de offboarding con flujo de aprobación |
| `/integrations` | Integraciones | 12 apps sincronizadas (Google, Slack, Okta, Viterbit…) |
| `/audit` | Auditoría | Log de eventos del sistema |
| `/offer-templates` | Plantillas oferta | Cartas oferta |
| `/contract-templates` | Plantillas contrato | Contratos |
| `/email-templates` | Plantillas correo | Correos automatizados |
| `/form-config` | Config formularios | Preguntas y documentos requeridos |
| `/settings` | Configuración | Tema, densidad, notificaciones |

---

## Cloud Functions

| Función | Tipo | Descripción |
|---------|------|-------------|
| `sendCandidateInvitation` | Trigger | Se dispara al mover candidato a etapa de invitación |
| `approveExpediente` | Callable | Aprueba el conjunto de documentos |
| `rejectExpediente` | Callable | Rechaza documentos |
| `provisionUser` | Callable | Provisiona accesos (Google, Slack, Okta) |
| `deprovisionUser` | Callable | Revoca accesos |
| `onCandidateStageChange` | Trigger | Lógica al cambiar etapa del candidato |
| `submitOffboardingApproval` | Callable | Aprobación de Manager / HRBP |
| `executeOffboarding` | Callable | Ejecuta las tareas de baja |
| `onOffboardingTicketCreated` | Trigger | Inicializa el ticket de baja |

---

## API REST (`aviva-api`)

Base URL: `/hr/v1` — todos los endpoints requieren token de Firebase Auth.

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/health` | Health check (público) |
| GET/POST | `/users` | Listar / crear colaboradores |
| PATCH | `/users/:id` | Actualizar colaborador |
| POST | `/users/:id/offboard` | Iniciar proceso de baja |
| GET | `/tickets` | Listar tickets de offboarding |
| POST | `/tickets/:id/approve` | Aprobar ticket |
| GET | `/audit` | Consultar log de auditoría |
| GET/POST | `/integrations` | Ver / actualizar integraciones |
| POST | `/integrations/:id/sync` | Forzar sincronización |
| GET | `/locations` | Listar kioscos |

---

## Colecciones Firestore

| Colección | Contenido |
|-----------|-----------|
| `users` | Colaboradores activos |
| `candidates` | Pipeline de reclutamiento |
| `tickets` | Tickets de offboarding |
| `locations` | Kioscos / locaciones |
| `integrations` | Estado de apps sincronizadas |
| `audit` | Log de eventos |
| `templates` | Plantillas de correo, contrato y carta oferta |
| `formConfig` | Campos configurables de formularios |

---

## Autenticación

- **Firebase Auth** con Google OAuth 2.0.
- El frontend redirige a `/login` si el usuario no está autenticado.
- La API verifica el ID token de Firebase en cada request protegido.

---

## Despliegue

```bash
# Frontend → Firebase Hosting
npm run build
firebase deploy --only hosting

# Cloud Functions
cd functions && npm run deploy

# API REST → Cloud Run u otro host Node.js
cd aviva-api && npm run build && npm start
```

---

## Design tokens

La paleta de colores, tipografía y espaciados están definidos como CSS variables en `src/index.css`.

- **Brand:** verde menta (`--green-500: #16b877`, `--green-700: #026149`)
- **Neutrals:** tonos cálidos (`--bg: #f7f7f4`, `--ink: #131613`)
- **Tipografía:** Inter Tight (UI) · Fraunces (display/H1) · JetBrains Mono (contadores/IDs)
- **Radios:** 6 px (sm) · 10 px (base) · 14 px (lg)
